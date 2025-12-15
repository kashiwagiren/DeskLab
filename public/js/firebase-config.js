// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiTPS3i7r3M-s9z6GKz3t1wXcSfY5boqk",
  authDomain: "desklab-b8631.firebaseapp.com",
  projectId: "desklab-b8631",
  storageBucket: "desklab-b8631.firebasestorage.app",
  messagingSenderId: "932297576440",
  appId: "1:932297576440:web:48f9b18346f5c7ed5bd00d",
  measurementId: "G-M87VNXVKBZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Collections
const studentsCollection = db.collection('students');
const classesCollection = db.collection('classes');
const enrollmentsCollection = db.collection('enrollments');
const loginsCollection = db.collection('logins');
const pendingRequestsCollection = db.collection('pending_requests');

console.log('✅ Firebase initialized successfully');
