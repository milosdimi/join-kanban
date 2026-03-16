/**
 * Firebase Configuration and Initialization
 */
const firebaseConfig = {
  apiKey: "AIzaSyBXUnkYTap7SpAhGmzuZjvDDwvxjBoRLuM",
  authDomain: "join-c7e60.firebaseapp.com",
  projectId: "join-c7e60",
  storageBucket: "join-c7e60.firebasestorage.app",
  messagingSenderId: "637291526891",
  appId: "1:637291526891:web:fbe4203889d58e3bb91cae"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();