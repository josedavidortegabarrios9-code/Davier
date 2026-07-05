/* ================================================================
   DAVIER — js/firebase-config.js
   Configuración de conexión a Firebase (Auth + Firestore)
   ================================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyBCZsEsa7cs4lNw74mhmadH61tw5w0Omn4",
  authDomain: "davier-5c193.firebaseapp.com",
  projectId: "davier-5c193",
  storageBucket: "davier-5c193.firebasestorage.app",
  messagingSenderId: "1046012172203",
  appId: "1:1046012172203:web:30bca87e2412b00d7f64ee",
  measurementId: "G-J8HM5Z3LFF"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
