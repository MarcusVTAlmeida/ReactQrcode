// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";  // Importando o Storage

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANnWzrWF4HTNIw2-PyLx1LzhZglVDQbKo",
  authDomain: "qrcode-7bd9a.firebaseapp.com",
  projectId: "qrcode-7bd9a",
  storageBucket: "qrcode-7bd9a.firebasestorage.app",
  messagingSenderId: "617240442081",
  appId: "1:617240442081:web:80603925268030ef3833a0",
  measurementId: "G-TQ543GGTEE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);  // Inicializando o Storage

export { auth, firestore, storage };
