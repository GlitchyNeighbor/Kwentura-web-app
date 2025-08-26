import { useEffect } from 'react';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../config/FirebaseConfig';

const useSessionManager = (user) => {
  useEffect(() => {
    if (!user) return;

    const sessionId = sessionStorage.getItem('activeSessionId');
    if (!sessionId) return;

    const collections = ["admins", "teachers"];
    let unsubscribe = () => {};

    const setupListener = async () => {
      for (const collectionName of collections) {
        const userDocRef = doc(db, collectionName, user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          unsubscribe = onSnapshot(userDocRef, (doc) => {
            const userData = doc.data();
            console.log('Session listener triggered for user:', user.uid, 'in collection:', collectionName, 'with session ID:', sessionId);
            console.log('User data from snapshot:', userData);
            if (userData.activeSessionId && userData.activeSessionId !== sessionId) {
              const auth = getAuth();
              signOut(auth).then(() => {
                sessionStorage.removeItem('activeSessionId');
                alert("You have been logged out because you signed in on another device.");
              });
            }
          });
          break;
        }
      }
    };

    setupListener();

    return () => unsubscribe();
  }, [user]);
};

export default useSessionManager;