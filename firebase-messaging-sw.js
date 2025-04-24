importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCWzeya7dZmsE7XkQvOECKEXXarsMKgmH4",
    authDomain: "test-firebase-987-12.firebaseapp.com",
    projectId: "test-firebase-987-12",
    storageBucket: "test-firebase-987-12.firebasestorage.app",
    messagingSenderId: "103938328487",
    appId: "1:103938328487:web:4981246a266858253d1882",
    measurementId: "G-7DM0BMGDZD"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// onbackgroundmessage
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);
});
