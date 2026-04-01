import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  where,
  increment,
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, initializeAuth, signOut, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
export const API_BASE_URL = "https://kamufinder-backend.onrender.com";


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
const USERS = 'user'
const FRIENDS = 'friends'
const USERSPRIVATECHATS = 'usersPrivateChats'
const PRIVATECHATS = 'privateChats'
const MESSAGES = 'messages'
const FRIENDREQUESTS = 'friendRequests'
const PUBLIC_GROUPS = "public-Groups";
const SUB_GROUPS = "sub_groups";

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
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  where,
  serverTimestamp,
  increment,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  USERS,
  auth,
  signOut,
  FRIENDS,
  USERSPRIVATECHATS,
  PRIVATECHATS,
  MESSAGES,
  FRIENDREQUESTS,
  PUBLIC_GROUPS,
  SUB_GROUPS,
};