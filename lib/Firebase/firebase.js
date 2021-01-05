const firebase = require("firebase/app");
require("firebase/firebase-auth");
require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyCefjMZQF6VNHUl3TaefjqStAOkt3wbK6k",
  authDomain: "i-mask-2021.firebaseapp.com",
  projectId: "i-mask-2021",
  storageBucket: "i-mask-2021.appspot.com",
  messagingSenderId: "499909474446",
  appId: "1:499909474446:web:da132b28ed6d1b4d14f1df",
  measurementId: "G-CPV1GZW5BB"
  };

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

const auth = firebase.auth();

module.exports = {firebase, storage, auth};