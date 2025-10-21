import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBySBosjKeJ4l-iQ5Ll1OOo40RaPCeBlwo",
  authDomain: "kwentura-39597.firebaseapp.com",
  projectId: "kwentura-39597",
  storageBucket: "kwentura-39597.firebasestorage.app",
  messagingSenderId: "516248841412",
  appId: "1:516248841412:web:b72100855b78de0e27ed91",
  measurementId: "G-SNX7VNLBD5",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
// Create region-specific functions clients
const functionsAsia = getFunctions(app, "asia-southeast1");
const functionsUs = getFunctions(app, "us-central1");

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.0-flash" });

export { app, analytics, ai, model, db, auth, storage, functionsAsia, functionsUs, firebaseConfig };
