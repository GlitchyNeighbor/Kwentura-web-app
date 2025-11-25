
import { model } from "../config/FirebaseConfig.js";

export async function generateContent(promptText) {
  try {
    const result = await model.generateContent(promptText);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

