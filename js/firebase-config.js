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

let auth = null;
let db = null;

try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth ? firebase.auth() : null;
  db = firebase.firestore();
  db.settings({ experimentalAutoDetectLongPolling: true });
} catch (e) {
  console.warn("Firebase no se pudo inicializar, la tienda sigue funcionando sin la nube.", e);
}
