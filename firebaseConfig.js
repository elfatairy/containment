// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD0CQ0e4sM8ElzYBumMYeOCj7jj3BHuKtM",
    authDomain: "autisim-718d2.firebaseapp.com",
    databaseURL: "https://autisim-718d2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "autisim-718d2",
    storageBucket: "autisim-718d2.firebasestorage.app",
    messagingSenderId: "662191889292",
    appId: "1:662191889292:web:8beb2ad1f592d4616754a9",
    measurementId: "G-T8SP60TKVP"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);