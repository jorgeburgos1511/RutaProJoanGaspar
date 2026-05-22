import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyB7CSRQklwbrBEyS6Uwgiz6d5QC85gqLT0",
  authDomain: "materiales-joan-gaspar.firebaseapp.com",
  projectId: "materiales-joan-gaspar",
  storageBucket: "materiales-joan-gaspar.appspot.com"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
