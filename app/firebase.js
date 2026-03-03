import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4zeJs-lGa9ZKEBeaFfBSoVFXwQLm36os",
  authDomain: "ceg-feedback-loop-7b36d.firebaseapp.com",
  projectId: "ceg-feedback-loop-7b36d",
  storageBucket: "ceg-feedback-loop-7b36d.firebasestorage.app",
  messagingSenderId: "749801914467",
  appId: "1:749801914467:web:fcc36305482b44a9fdb856"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
