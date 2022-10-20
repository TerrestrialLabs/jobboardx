import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBi1dsEowII-tJGQPRYUoW2RMvpYR9t-QI",
    authDomain: "react-jobs-3ff2d.firebaseapp.com",
    projectId: "react-jobs-3ff2d",
    storageBucket: "react-jobs-3ff2d.appspot.com",
    messagingSenderId: "385834209021",
    appId: "1:385834209021:web:de10c98c5bb72942e23894",
    measurementId: "G-KTCHZHJ2J5"
  };
  
  // Initialize Firebase
  export const firebase = initializeApp(firebaseConfig)
  export const database = getFirestore(firebase)
  // export const analytics = getAnalytics(firebase)