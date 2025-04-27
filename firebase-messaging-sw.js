importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBGAXFpKqqToJ6QFGodhzlQKt1WneQN19s",
    authDomain: "nub-live.firebaseapp.com",
    projectId: "nub-live",
    storageBucket: "nub-live.firebasestorage.app",
    messagingSenderId: "800603073230",
    appId: "1:800603073230:web:9971104fe7992012b5fe9f",
    measurementId: "G-VV61301VDD"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// onbackgroundmessage
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);
});
