const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp({
  credential: applicationDefault(),
});

const auth = getAuth();
const db = getFirestore();

async function createSuperAdmin() {
  const email = "superadmin@gmail.com";
  const password = "123456";
  const userRecord = await auth.createUser({
    email,
    password,
    displayName: "Super Admin",
  });

  await db.collection("admins").doc(userRecord.uid).set({
    firstName: "Emmanuel",
    lastName: "Pelingon",
    email,
    role: "superAdmin",
    schoolId: "12341234",
    contactNumber: "09774886839",
    accountType: "superAdmin",
    createdAt: FieldValue.serverTimestamp(),
    uid: userRecord.uid,
  });

}

createSuperAdmin().catch(console.error);
