// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBoN7-NIr8dcul14ynlaOd1eax5NKZSD4Q",
    authDomain: "musicpro-d3cac.firebaseapp.com",
    databaseURL: "https://musicpro-d3cac-default-rtdb.firebaseio.com",
    projectId: "musicpro-d3cac",
    storageBucket: "musicpro-d3cac.appspot.com",
    messagingSenderId: "586015387547",
    appId: "1:586015387547:web:846adf849b2e11c3d97b3e",
    measurementId: "G-08NKNB9FV5"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const storage = getStorage(app);
