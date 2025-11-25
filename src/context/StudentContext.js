import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, app } from '../config/FirebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../config/FirebaseConfig';

const StudentContext = createContext();
const functions = getFunctions(app);

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const logAdminUiActionCallable = httpsCallable(functions, "logAdminUiAction");

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const studentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsList);
    } catch (err) {
      console.error("Error fetching students in context: ", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudent = async (newStudentData, password) => {
    setLoading(true);
    setError(null);
    try {
      const createStudentAccountCallable = httpsCallable(functions, "createStudentAccount");
      const result = await createStudentAccountCallable({
        email: newStudentData.email,
        password: password,
        studentData: newStudentData,
      });

      const { uid: newStudentUid, email: newStudentEmail, ...restOfStudentData } = result.data;

      
      
      
      
      const createdStudent = {
        id: newStudentUid, 
        uid: newStudentUid,
        email: newStudentEmail,
        ...restOfStudentData, 
      };

      setStudents((prevStudents) => [...prevStudents, createdStudent]);

      
      const currentUser = auth.currentUser;
      const studentFullName = `${newStudentData.studentFirstName || ""} ${newStudentData.studentLastName || ""}`.trim();
      logAdminUiActionCallable({
        actionType: "student_account_created",
        adminId: currentUser?.uid,
        collectionName: "students",
        documentId: newStudentUid,
        targetUserId: newStudentUid,
        targetUserFullName: studentFullName,
      }).catch(console.error);

      return { success: true, student: createdStudent };
    } catch (err) {
      console.error("Error adding student in context: ", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (studentId, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const studentRef = doc(db, "students", studentId);
      await updateDoc(studentRef, { ...updatedData, updatedAt: serverTimestamp() });

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === studentId ? { ...student, ...updatedData } : student
        )
      );

      
      const currentUser = auth.currentUser;
      const studentFullName = `${updatedData.studentFirstName || ""} ${updatedData.studentLastName || ""}`.trim();
      logAdminUiActionCallable({
        actionType: "student_account_updated",
        adminId: currentUser?.uid,
        collectionName: "students",
        documentId: studentId,
        targetUserId: studentId, 
        targetUserFullName: studentFullName,
      }).catch(console.error);

      return { success: true };
    } catch (err) {
      console.error("Error updating student in context: ", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const archiveStudent = async (studentId, studentAuthUid, studentFullName) => {
    setLoading(true);
    setError(null);
    try {
      const studentRef = doc(db, "students", studentId);
      await updateDoc(studentRef, {
        isArchived: true,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setStudents((prevStudents) =>
        prevStudents.filter((student) => student.id !== studentId)
      );

      
      const currentUser = auth.currentUser;
      logAdminUiActionCallable({
        actionType: "student_account_archived",
        adminId: currentUser?.uid,
        collectionName: "students",
        documentId: studentId,
        targetUserId: studentAuthUid || studentId,
        targetUserFullName: studentFullName,
      }).catch(console.error);

      return { success: true };
    } catch (err) {
      console.error("Error archiving student in context: ", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        loading,
        error,
        fetchStudents, 
        addStudent,
        updateStudent,
        archiveStudent,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};