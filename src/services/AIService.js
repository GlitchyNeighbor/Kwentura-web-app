
import { model } from "../config/FirebaseConfig.js";

export async function generateContent(promptText) {
  try {
    const result = await model.generateContent(promptText);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating content:", error);
    // Depending on your error handling strategy, you might want to:
    // - return a specific error message
    // - return null or undefined
    // - re-throw the error (as it is now) for the caller to handle
    throw error;
  }
}

