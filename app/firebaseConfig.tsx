import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase, ref,Database, get, set, push,onDisconnect ,remove,onValue,update } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqlrAGF6cj-OwRppL5UWvWrcWA0f66VA4",
  authDomain: "cannibalization-e72d5.firebaseapp.com",
  projectId: "cannibalization-e72d5",
  storageBucket: "cannibalization-e72d5.appspot.com",
  messagingSenderId: "1087202600496",
  appId: "1:1087202600496:web:8938bc074a37295591aff5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Realtime Database
// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const database = getDatabase(app);

export { auth, onAuthStateChanged,signInWithEmailAndPassword,onDisconnect,getDatabase,signOut, onValue ,createUserWithEmailAndPassword, database,get,remove, ref, update,set ,push };
