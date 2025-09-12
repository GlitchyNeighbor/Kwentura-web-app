const admin = require("firebase-admin");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const pdfParser = require("pdf-parse");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {
  onDocumentWritten,
  onDocumentDeleted,
} = require("firebase-functions/v2/firestore");
const {getFirestore} = require("firebase-admin/firestore");
const {getAuth} = require("firebase-admin/auth");
const {onSchedule} = require("firebase-functions/v2/scheduler");

admin.initializeApp();
const db = getFirestore();

exports.updateAdminPassword = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated",
        "You must be authenticated to update a password.");
  }

  // Security Enhancement: Verify the caller is an admin or superAdmin
  const adminUid = request.auth.uid;
  try {
    const adminDoc = await db.collection("admins").doc(adminUid).get();
    if (!adminDoc.exists) {
      throw new HttpsError("permission-denied", "Caller is not an admin.");
    }
    const adminData = adminDoc.data();
    if (adminData.role !== "admin" && adminData.role !== "superAdmin") {
      throw new HttpsError(
          "permission-denied",
          "You do not have permission to update passwords.",
      );
    }
  } catch (error) {
    console.error("Admin role check failed:", error);
    throw new HttpsError("internal", "Could not verify admin permissions.");
  }

  const {uid, newPassword} = request.data;
  if (!uid || !newPassword) {
    throw new HttpsError("invalid-argument", "Missing UID or new password.");
  }
  try {
    await getAuth().updateUser(uid, {password: newPassword});
    return {success: true};
  } catch (error) {
    console.error(`Failed to update password for UID: ${uid}`, error);
    throw new HttpsError("internal", error.message);
  }
});

const synthesizeSpeechGoogle = onCall({timeoutSeconds: 3600},
    async (request) => {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "Authentication required.");
      }
      const textToSynthesize = request.data.text;
      if (!textToSynthesize || typeof textToSynthesize!== "string" ||
      textToSynthesize.trim() === "") {
        throw new HttpsError("invalid-argument",
            "Missing or invalid 'text' parameter.");
      }

      const ttsRequest = {
        input: {text: textToSynthesize},
        voice: {
          languageCode: request.data.languageCode || "en-US",
          name: request.data.languageCode === "fil-PH" ?
      "fil-PH-Standard-A" : "en-US-Chirp-HD-F",
        },
        audioConfig: {audioEncoding: "MP3"},
        // Add timepoints to get word timings.
        enableTimepointing: ["SSML_MARK"],
      };

      try {
        const textToSpeech = require("@google-cloud/text-to-speech");
        const ttsClient = new textToSpeech.TextToSpeechClient();
        const [response] = await ttsClient.synthesizeSpeech(ttsRequest);
        return {
          audioData: Buffer.from(response.audioContent).toString("base64"),
          timepoints: response.timepoints,
          encoding: "mp3",
        };
      } catch (error) {
        console.error("Google Cloud TTS API Error:", error);
        throw new HttpsError("internal",
            "Failed to synthesize speech with Google Cloud TTS.",
            error.message);
      }
    });

exports.synthesizeSpeechGoogle = synthesizeSpeechGoogle;

exports.generateAndStoreTts = onCall(async (request) => {
  const {text, fileName} = request.data;

  if (!request.auth) {
    throw new HttpsError("unauthenticated",
        "The function must be called while authenticated.");
  }

  if (!text || !fileName) {
    throw new HttpsError("invalid-argument", "Missing text or fileName.");
  }

  const ttsRequest = {
    input: {text: text},
    voice: {
      languageCode: "en-US",
      name: "en-US-Chirp-HD-F",
    },
    audioConfig: {audioEncoding: "MP3"},
  };

  let response;
  try {
    const textToSpeech = require("@google-cloud/text-to-speech");
    const ttsClient = new textToSpeech.TextToSpeechClient();
    [response] = await ttsClient.synthesizeSpeech(ttsRequest);
  } catch (error) {
    console.error("Google Cloud TTS API Error:", error);
    throw new HttpsError("internal",
        "Failed to synthesize speech with Google Cloud TTS.", error.message);
  }

  try {
    const bucket = admin.storage().bucket();
    const filePath = `tts/${fileName}.mp3`;
    const file = bucket.file(filePath);

    await file.save(response.audioContent);
    console.log(`TTS audio saved to ${filePath}`);

    // Make the file public
    await file.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Save the URL to Firestore
    await db.collection("tts_config").doc(fileName).set({
      url: publicUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {success: true, url: publicUrl};
  } catch (error) {
    console.error("Error saving TTS to Firebase Storage or Firestore:", error);
    throw new HttpsError("internal", "Failed to save TTS audio.");
  }
});

exports.translatePageTexts = onCall(async (request) => {
  const {texts, targetLanguage} = request.data;

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  if (!texts || !Array.isArray(texts) || !targetLanguage) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with" +
          " 'texts'(an array) and 'targetLanguage'.",
    );
  }

  try {
    if (!genAI || !model) {
      throw new HttpsError(
          "failed-precondition",
          "The Gemini API Key is not configured for the function.",
      );
    }

    const languageMap = {
      "en": "English",
      "tl": "Tagalog",
    };
    const targetLanguageName = languageMap[targetLanguage];

    const translationPromises = texts.map(async (text) => {
      if (!text.trim()) return "";
      const prompt = `Translate the following text to ${targetLanguageName}. ` +
          `Do not add any explanation. Just provide the translated text.
            Text to translate: "${text}"`;
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    });

    const translatedTexts = await Promise.all(translationPromises);
    return {translatedTexts};
  } catch (error) {
    console.error("Translation API error:", error);
    throw new HttpsError("internal", "Failed to translate text.", error);
  }
});

const API_KEY = process.env.GEMINI_API_KEY;

let genAI;
let model;

if (API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({model: "gemini-1.5-flash-latest"});
    console.log("GoogleGenerativeAI initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenerativeAI.", error);
  }
} else {
  console.error(
      "Ensure GEMINI_API_KEY environment variable is set or " +
      "directly in the Google Cloud console for deployed functions).");
}

exports.generateStorySynopsisFromPdf = onCall(
    {timeoutSeconds: 600}, async (request) => {
      if (!genAI || !model) {
        throw new HttpsError(
            "failed-precondition",
            "The Gemini API Key is not configured for the function.",
        );
      }
      if (!request.auth) {
        throw new HttpsError("unauthenticated",
            "You must be authenticated to generate a story synopsis.",
        );
      }
      const storyId = request.data.storyId;
      if (!storyId) {
        throw new HttpsError(
            "invalid-argument",
            "The function must be called with a \"storyId\" argument.",
        );
      }

      try {
        const storyRef = db.collection("stories").doc(storyId);
        const storyDoc = await storyRef.get();

        if (!storyDoc.exists) {
          throw new HttpsError("not-found", "Story not found.");
        }

        const storyData = storyDoc.data();
        const pdfUrl = storyData.pdfUrl;

        if (!pdfUrl) {
          throw new HttpsError(
              "failed-precondition",
              "Story does not have a PDF URL.",
          );
        }

        let filePath;
        const bucket = admin.storage().bucket();
        try {
          const url = new URL(pdfUrl);
          const pathName = url.pathname;
          const oMarker = "/o/";
          const oIndex = pathName.indexOf(oMarker);

          if (oIndex === -1) {
            console.error("PDF URL path does not contain"+
            "`'/o/' marker:", pathName, "Full URL:", pdfUrl);
            throw new Error("Invalid PDF URL format: missing '/o/' marker.");
          }
          const encodedFilePath = pathName.substring(oIndex +
          oMarker.length);
          filePath = decodeURIComponent(encodedFilePath);
        } catch (e) {
          console.error(
              "Error parsing PDF URL to determine file path:",
              pdfUrl, e.message,
          );
          throw new HttpsError(
              "internal",
              `Could not parse PDF URL: ${e.message}`,
          );
        }
        if (!filePath) {
          console.error("File path could not be determined from PDF URL:",
              pdfUrl);
          throw new HttpsError(
              "internal",
              "File path could not be determined from PDF URL.",
          );
        }
        const file = bucket.file(filePath);

        const [exists] = await file.exists();
        if (!exists) {
          const errorMsg =
            `File does not exist in bucket '${bucket.name}' ` +
            `at path '${filePath}'. PDF URL: ${pdfUrl}`;
          console.error(errorMsg);
          throw new HttpsError("not-found",
              `The PDF file was not found. Path: ${filePath}`);
        }

        const [pdfBuffer] = await file.download();
        const pdfData = await pdfParser(pdfBuffer);
        const extractedText = pdfData.text;

        if (!extractedText || extractedText.trim().length === 0) {
          await storyRef.update({
            generatedSynopsis: "Could not extract text from PDF.",
          });
          return {synopsis: "Could not extract text from PDF."};
        }
        const maxTextLength = 15000;
        const truncatedText = extractedText.substring(0, maxTextLength);

        const prompt = `Create a short, engaging synopsis (around 100-150 ` +
          `words) for a children's story. The story is titled ` +
          `"${storyData.title}" and its category is "${storyData.category}". ` +
          `Base the synopsis on the following extracted text from the story: ` +
          `\n\n"${truncatedText}"\n\nSynopsis:`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const synopsis = response.text() || "Synopsis could not be generated.";
        await storyRef.update({
          generatedSynopsis: synopsis,
          synopsisGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {synopsis: synopsis};
      } catch (error) {
        console.error("Error generating synopsis:", error);
        let errorMessage = "Internal error generating synopsis.";
        if (error.message.includes("Billing account not configured")) {
          errorMessage =
            "The project is not configured for external network requests. " +
            "Please enable billing.";
        } else if (error.message.includes("API key not valid")) {
          errorMessage =
          "The Gemini API key is invalid or missing permissions.";
        }
        try {
          const storyRef = db.collection("stories").doc(storyId);
          await storyRef.update({
            generatedSynopsis: `Failed to generate: ${error.message.substring(
                0,
                100,
            )}`,
          });
        } catch (dbError) {
          console.error("Error updating story with failure message:", dbError);
        }
        throw new HttpsError(
            "internal",
            errorMessage,
            error.message,
        );
      }
    },
);

exports.generateMoralLessonFromText = onCall(
    async (request) => {
      if (!genAI || !model) {
        throw new HttpsError(
            "failed-precondition",
            "The Gemini API Key is not configured for the function.",
        );
      }
      if (!request.auth) {
        throw new HttpsError("unauthenticated",
            "You must be authenticated to generate a moral lesson.",
        );
      }
      const {text} = request.data;
      if (!text || typeof text !== "string" || text.trim() === "") {
        throw new HttpsError(
            "invalid-argument",
            "The function must be called with a non-empty \"text\" argument.",
        );
      }

      try {
        const maxTextLength = 15000;
        const truncatedText = text.substring(0, maxTextLength);

        const exampleJson = {
          question: "What is the moral of the story?",
          options: ["Option A", "Option B", "Option C"],
          correctOptionIndex: 1,
        };

        const prompt = `Based on the following children's story text:
"${truncatedText}"

Please provide the following in a valid JSON format only,
with no other text before or after the JSON block:
1. A question about the main moral or lesson of the story
(e.g., "What did the little bird learn in the end?").
2. An array of three distinct multiple-choice string options for this question.
3. The 0-indexed integer of the correct option from the options array.

Example JSON format:
${JSON.stringify(exampleJson, null, 2)}
`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let responseText = response.text();

        if (!responseText) {
          throw new HttpsError("internal",
              "AI did not return a response.");
        }

        if (responseText.startsWith("```json")) {
          responseText = responseText.substring(7);
        } else if (responseText.startsWith("```")) {
          responseText = responseText.substring(3);
        }

        responseText = responseText.trim();

        if (responseText.endsWith("```")) {
          responseText = responseText.substring(0, responseText.length - 3);
        }

        try {
          const parsedMoral = JSON.parse(responseText);
          if (
            parsedMoral.question &&
              Array.isArray(parsedMoral.options) &&
              parsedMoral.options.length === 3 &&
              typeof parsedMoral.correctOptionIndex === "number"
          ) {
            return parsedMoral;
          } else {
            throw new Error(
                "Generated moral lesson JSON is not in the expected format.");
          }
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError,
              "Raw response:", responseText);
          const errorMsg = "Failed to parse AI response. Raw: " +
              responseText.substring(0, 150) + "...";
          throw new HttpsError("internal", errorMsg);
        }
      } catch (error) {
        console.error("Error generating moral lesson:", error);
        const message = error.message ||
            "Internal error generating moral lesson.";
        throw new HttpsError("internal", message);
      }
    },
);

exports.deleteUserAccount = onCall(async (request) => {
  const {auth} = request;
  if (!auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  try {
    const adminDoc = await getFirestore().
        collection("admins")
        .doc(auth.uid)
        .get();

    const userRole = adminDoc.exists ? adminDoc.data().role : null;
    if (!userRole ||
        (userRole !== "admin" && userRole !== "superAdmin")) {
      throw new HttpsError(
          "permission-denied",
          "Only admins can delete accounts",
      );
    }

    const {uid, collectionName, documentId} = request.data;

    if (!uid || !collectionName || !documentId) {
      throw new HttpsError("invalid-argument", "Missing required parameters");
    }
    await getFirestore().collection(collectionName).doc(documentId).delete();
    await getAuth().deleteUser(uid);

    return {
      success: true,
      message:
        "Account deleted successfully from both Firestore and Authentication",
    };
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw new HttpsError(
        "internal",
        `Failed to delete account: ${error.message}`,
    );
  }
});

exports.logAdminAction = onDocumentWritten(
    {document: "{collectionName}/{documentId}", region: "us-central1"},
    async (event) => {
      const {change, params, auth: eventAuthContext} = event;
      const collectionName = params.collectionName;
      const documentId = params.documentId;
      const eventType = change.before.exists ?
            (change.after.exists ? "update" : "delete") :
            "create";

      let affectedUserFullName = null;
      const userCollections = ["admins", "teachers", "students"];

      if (userCollections.includes(collectionName)) {
        const dataBefore = change.before.exists ? change.before.data() : null;
        const dataAfter = change.after.exists ? change.after.data() : null;
        const relevantData = eventType === "delete" ? dataBefore : dataAfter;

        if (relevantData) {
          if (collectionName === "students") {
            affectedUserFullName = `${relevantData.studentFirstName || ""}
            ${relevantData.studentLastName || ""}`.trim();
          } else {
            affectedUserFullName = `${relevantData.firstName || ""}
            ${relevantData.lastName || ""}`.trim();
          }
        }
      }


      let performedBy = "system";
      if (eventAuthContext && eventAuthContext.uid) {
        performedBy = eventAuthContext.uid;
      } else {
        console.warn(
            `No authenticated user found for this write to ` +
            `${collectionName}/${documentId}. Action logged as 'system'.`);
      }

      const logEntry = {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        collectionName: collectionName,
        documentId: documentId,
        eventType: eventType,
        adminId: performedBy,
        affectedUserFullName: affectedUserFullName || null,
      };

      try {
        await getFirestore().collection("admin_logs").add(logEntry);
        console.log("Admin action logged successfully.");
      } catch (error) {
        console.error("Error logging admin action:", error);
      }
    });

/**
 * Logs a specific admin action initiated from the UI.
 * @param {object} data
 * @param {string} data.actionType
 * @param {string} data.collectionName
 * @param {string} data.documentId
 * @param {string} [data.targetUserId]
 * @param {object} context
 * @return {Promise<{success: boolean}>}
 */
exports.logAdminUiAction = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated",
        "Authentication required to log admin actions.");
  }
  const {actionType, collectionName, documentId, targetUserId,
    targetUserFullName: clientProvidedFullName} = request.data;

  if (!actionType || !collectionName || !documentId) {
    throw new HttpsError("invalid-argument",
        "Missing required logging parameters.");
  }

  let finalTargetUserFullName = clientProvidedFullName || null;
  if (!finalTargetUserFullName) {
    const userCollections = ["admins", "teachers", "students"];
    if (userCollections.includes(collectionName) && documentId) {
      try {
        const userDocRef =
        getFirestore().collection(collectionName).doc(documentId);
        const userDocSnap = await userDocRef.get();
        if (userDocSnap.exists) {
          const userData = userDocSnap.data();
          if (collectionName === "students") {
            finalTargetUserFullName = `${userData.studentFirstName || ""}
            ${userData.studentLastName || ""}`.trim();
          } else {
            finalTargetUserFullName = `${userData.firstName || ""}
            ${userData.lastName || ""}`.trim();
          }
        }
      } catch (fetchError) {
        console.error(`Error fetching user details for log: 
        ${fetchError.message}`);
      }
    }
  }
  const logEntry = {
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    adminId: request.auth.uid,
    actionType: actionType,
    collectionName: collectionName,
    documentId: documentId,
    targetUserId: targetUserId || null,
    targetUserFullName: finalTargetUserFullName || null,
  };

  await getFirestore().collection("admin_logs").add(logEntry);
  console.log(`Admin UI action logged: ${actionType} by ${request.auth.uid}`);
  return {success: true};
});
/**
 * Calculates the number of unique active users within a given date range.
 * Assumes user documents have a 'lastLogin' timestamp field.
 * @param {Date} startDate The start of the date range (inclusive).
 * @param {Date} endDate The end of the date range (exclusive).
 * @return {Promise<number>} The count of unique active users.
 */
async function countActiveUsersInRange(startDate, endDate) {
  const firestore = getFirestore();
  const collectionsToQuery = ["admins", "teachers", "students"];
  const activeUserIds = new Set();

  for (const collectionName of collectionsToQuery) {
    try {
      const q = firestore.collection(collectionName)
          .where("lastLogin", ">=", startDate)
          .where("lastLogin", "<", endDate);

      const snapshot = await q.get();
      snapshot.forEach((doc) => {
        activeUserIds.add(doc.id);
      });
    } catch (error) {
      console.error(`Error querying ${collectionName} 
      for active users:`, error);
    }
  }
  return activeUserIds.size;
}

/**
 * Calculates daily active users for a specific target date.
 * @param {Date} targetDate The date for which to count active users.
 * @return {Promise<number>} The count of daily active users.
 */
async function getDailyActiveUsers(targetDate) {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const nextDayStart = new Date(startOfDay);
  nextDayStart.setDate(startOfDay.getDate() + 1);

  console.log(`Calculating daily active users for: ` +
    `${startOfDay.toISOString()} to ` +
    `${nextDayStart.toISOString()}`);
  return countActiveUsersInRange(startOfDay, nextDayStart);
}

/**
 * Calculates weekly active users ending on a specific date.
 * @param {Date} weekEndDate The end date of the week.
 * @return {Promise<number>} The count of weekly active users.
 */
async function getWeeklyActiveUsers(weekEndDate) {
  const weekStartDate = new Date(weekEndDate);
  weekStartDate.setDate(weekEndDate.getDate() - 6);
  weekStartDate.setHours(0, 0, 0, 0);

  const dayAfterWeekEnd = new Date(weekEndDate);
  dayAfterWeekEnd.setDate(weekEndDate.getDate() + 1);
  dayAfterWeekEnd.setHours(0, 0, 0, 0);

  console.log(`Calculating weekly active users from: ` +
    `${weekStartDate.toISOString()} to ` +
    `${dayAfterWeekEnd.toISOString()}`);
  return countActiveUsersInRange(weekStartDate, dayAfterWeekEnd);
}

async function getMonthlyActiveUsers(monthEndDate) {
  const monthStartDate = new Date(monthEndDate);
  monthStartDate.setDate(monthEndDate.getDate() - 29);
  monthStartDate.setHours(0, 0, 0, 0);

  const dayAfterMonthEnd = new Date(monthEndDate);
  dayAfterMonthEnd.setDate(monthEndDate.getDate() + 1);
  dayAfterMonthEnd.setHours(0, 0, 0, 0);

  console.log(`Calculating monthly active users from: ` +
    `${monthStartDate.toISOString()} to ` +
    `${dayAfterMonthEnd.toISOString()}`);
  return countActiveUsersInRange(monthStartDate, dayAfterMonthEnd);
}

exports.calculateRetentionRate = onSchedule("0 0 * * *", async (event) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dailyActiveUsers = await getDailyActiveUsers(today);
  const weeklyActiveUsers = await getWeeklyActiveUsers(today);
  const monthlyActiveUsers = await getMonthlyActiveUsers(
      today,
  );

  try {
    await getFirestore().collection("retention_rates").add({
      date: today,
      dailyActiveUsers: dailyActiveUsers,
      weeklyActiveUsers: weeklyActiveUsers,
      monthlyActiveUsers: monthlyActiveUsers,
    });
    console.log(
        "Retention rates calculated and stored " +
        "successfully.");
  } catch (error) {
    console.error(
        "Error calculating and storing retention rates:",
        error);
  }

  return null;
});

exports.splitPdfToImages = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated",
        "Authentication required to split PDF.");
  }

  const {storyId, pdfStoragePath} = request.data;
  if (!storyId || !pdfStoragePath) {
    throw new HttpsError("invalid-argument",
        "Missing 'storyId' or 'pdfStoragePath'.");
  }
  await admin.firestore().collection("stories").doc(storyId)
      .update({pageImages: []});
  console.warn("PDF-to-image splitting is not supported in this environment.");
  return {success: false, message: "PDF-to-image splitting is" +
  "not supported in this environment."};
});

exports.approveTeacher = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "You must be authenticated to approve teachers.",
    );
  }

  const adminUid = request.auth.uid;
  const adminDoc = await getFirestore().collection("admins").
      doc(adminUid).get();

  if (!adminDoc.exists) {
    throw new HttpsError(
        "permission-denied",
        "Admin profile not found.",
    );
  }

  const adminData = adminDoc.data();
  if (!adminData || (adminData.role !== "admin" &&
    adminData.role !== "superAdmin")) {
    throw new HttpsError(
        "permission-denied",
        "Only authenticated admins can approve teachers.",
    );
  }

  const {teacherId, teacherUid} = request.data;

  if (!teacherUid || !teacherId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a teacherUid and teacherId.",
    );
  }

  try {
    const pendingTeacherRef = getFirestore().
        collection("pendingTeachers").doc(teacherId);
    const pendingTeacherDoc = await pendingTeacherRef.get();

    if (!pendingTeacherDoc.exists) {
      throw new HttpsError("not-found", "Pending teacher document not found.");
    }

    const teacherData = pendingTeacherDoc.data();

    // Set custom user claim for role
    await getAuth().setCustomUserClaims(teacherUid, {role: "teacher"});
    console.log(`Custom claim 'teacher' set for user ${teacherUid}`);

    // Move data from pendingTeachers to teachers collection
    await getFirestore().collection("teachers").
        doc(teacherUid).set(teacherData);
    console.log(`Teacher data moved to 'teachers'
        collection for user ${teacherUid}`);

    // Delete from pendingTeachers collection
    await pendingTeacherRef.delete();
    console.log(`Pending teacher document deleted for user ${teacherId}`);

    return {status: "success", message: "Teacher approved successfully"};
  } catch (error) {
    console.error("Error approving teacher:", error);
    throw new HttpsError("internal", "Unable to approve teacher.",
        error.message);
  }
});

/**
 * Cleans up associated data in Firestore and Storage when a story is deleted.
 */
exports.onStoryDelete =
onDocumentDeleted("stories/{storyId}", async (event) => {
  const storyId = event.params.storyId;
  const db = getFirestore();
  const bucket = admin.storage().bucket();

  console.log(`Starting cleanup for deleted story: ${storyId}`);

  // 1. Delete associated files in Cloud Storage
  const storagePrefixes = [
    `stories/${storyId}`,
    `story_pdfs/${storyId}`,
    `story_pages/${storyId}/`,
    `story_tts/${storyId}/`,
    `assessment_images/${storyId}/`,
    `assessment_audio/${storyId}/`,
  ];

  for (const prefix of storagePrefixes) {
    try {
      await bucket.deleteFiles({prefix: prefix});
      console.log(`Successfully deleted files with prefix: ${prefix}`);
    } catch (error) {
      if (error.code !== 404) {
        console.error(`Error deleting files with prefix ${prefix}:`, error);
      } else {
        console.log(`No files found with prefix ${prefix}, skipping.`);
      }
    }
  }

  // 2. Delete subcollections (e.g., 'readers')
  const subcollections = await db.collection("stories")
      .doc(storyId).listCollections();
  for (const subcollection of subcollections) {
    try {
      const snapshot = await subcollection.get();
      const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
      await Promise.all(deletePromises);
      console.log(`Successfully deleted subcollection: ${subcollection.id}`);
    } catch (error) {
      console.error(`Error deleting subcollection ${subcollection.id}:`, error);
    }
  }

  // 3. Delete associated quiz scores from all students
  try {
    console.log(`Searching for quiz scores related to story ${storyId}...`);
    const studentsSnapshot = await db.collection("students").get();
    const deletePromises = [];

    for (const studentDoc of studentsSnapshot.docs) {
      const quizScoresRef = db.collection("students")
          .doc(studentDoc.id).collection("quizScores");
      const scoresQuery = quizScoresRef.where("storyId", "==", storyId);
      const scoresSnapshot = await scoresQuery.get();

      if (!scoresSnapshot.empty) {
        console.log(`Found ${scoresSnapshot.size}
            score(s) for student ${studentDoc.id} to delete.`);
        scoresSnapshot.forEach((doc) => {
          deletePromises.push(doc.ref.delete());
        });
      }
    }
    await Promise.all(deletePromises);
    console.log(`Successfully deleted ${deletePromises.length}
        quiz score entries for story ${storyId}.`);
  } catch (error) {
    console.error(`Error deleting quiz scores for story ${storyId}:`, error);
  }

  console.log(`Cleanup finished for story: ${storyId}`);
  return null;
});

exports.rejectTeacher = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "You must be authenticated to reject teachers.",
    );
  }

  const adminUid = request.auth.uid;
  const adminDoc = await getFirestore().collection("admins").
      doc(adminUid).get();

  if (!adminDoc.exists) {
    throw new HttpsError(
        "permission-denied",
        "Admin profile not found.",
    );
  }

  const adminData = adminDoc.data();
  if (!adminData || (adminData.role !== "admin" &&
    adminData.role !== "superAdmin")) {
    throw new HttpsError(
        "permission-denied",
        "Only authenticated admins can reject teachers.",
    );
  }

  const {teacherId, teacherUid} = request.data;

  if (!teacherUid || !teacherId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a teacherUid and teacherId.",
    );
  }

  try {
    // Delete Firebase Auth user
    await getAuth().deleteUser(teacherUid);
    console.log(`Firebase Auth user ${teacherUid} deleted.`);

    // Delete document from pendingTeachers collection
    await getFirestore().collection("pendingTeachers")
        .doc(teacherId).delete();
    console.log(`Pending teacher document ${teacherId} deleted.`);

    return {
      status: "success",
      message: "Teacher rejected and user deleted successfully.",
    };
  } catch (error) {
    console.error("Error rejecting teacher:", error);
    throw new HttpsError("internal", "Unable to reject teacher.",
        error.message);
  }
});

exports.generateComprehensionQuestionsFromText = onCall(
    async (request) => {
      if (!genAI || !model) {
        throw new HttpsError(
            "failed-precondition",
            "The Gemini API Key is not configured for the function.",
        );
      }
      if (!request.auth) {
        throw new HttpsError("unauthenticated",
            "You must be authenticated to generate questions.",
        );
      }
      const {text} = request.data;
      if (!text || typeof text !== "string" || text.trim() === "") {
        throw new HttpsError(
            "invalid-argument",
            "The function must be called with a non-empty \"text\" argument.",
        );
      }

      try {
        const maxTextLength = 15000;
        const truncatedText = text.substring(0, maxTextLength);

        const prompt = `Based on the following children's story text:
"${truncatedText}"

Generate 3 distinct comprehension questions about the story,
each with 3 multiple-choice options and the correct answer index. 
Return ONLY a valid JSON array of objects, each object containing:
- question: string
- options: array of 3 strings
- correctOptionIndex: integer (0-based)

Example:
[
  {
    "question": "What did the main character do first?",
    "options": ["Ate breakfast", "Went outside", "Read a book"],
    "correctOptionIndex": 1
  },
  ...
]
`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let responseText = response.text();

        // Remove markdown if present
        if (responseText.startsWith("```json")) {
          responseText = responseText.substring(7);
        } else if (responseText.startsWith("```")) {
          responseText = responseText.substring(3);
        }
        responseText = responseText.trim();
        if (responseText.endsWith("```")) {
          responseText = responseText.substring(0, responseText.length - 3);
        }

        try {
          const questions = JSON.parse(responseText);
          if (
            Array.isArray(questions) &&
            questions.length === 3 &&
            questions.every((q) =>
              q.question &&
              Array.isArray(q.options) &&
              q.options.length === 3 &&
              typeof q.correctOptionIndex === "number",
            )
          ) {
            return {questions};
          } else {
            throw new Error("Generated questions JSON is not"+
            "in the expected format.");
          }
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError,
              "Raw response:", responseText);
          throw new HttpsError("internal", "Failed to parse AI response. Raw: "+
          responseText.substring(0, 150) + "...");
        }
      } catch (error) {
        console.error("Error generating comprehension questions:", error);
        throw new HttpsError("internal", error.message ||
        "Internal error generating questions.");
      }
    },
);
