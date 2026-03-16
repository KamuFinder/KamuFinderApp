import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, addDoc, setDoc, getDoc, getDocs, onSnapshot, orderBy, serverTimestamp, doc, where,  } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, initializeAuth, signOut, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID
};

const app = initializeApp(firebaseConfig)

const firestore = getFirestore(app);
const MESSAGES = 'message';
const USERS = 'user'

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})

export {
    firestore,
    collection,
    query,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    doc,
    onSnapshot,
    orderBy,
    where,
    serverTimestamp,
    MESSAGES,
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    USERS,
    auth,
    signOut,
};