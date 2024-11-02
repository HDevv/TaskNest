import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDXCdLXOg-fuw0DBrZ0C6f9sO3CWKDJDg4",
  authDomain: "tasknest-1aa0c.firebaseapp.com",
  projectId: "tasknest-1aa0c",
  storageBucket: "tasknest-1aa0c.appspot.com",
  messagingSenderId: "423101928722",
  appId: "1:423101928722:web:c50981c0bae663ee094fcb",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// si non initialisé
let auth;
if (getApps().length > 0) {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    auth = getAuth(app); // si Auth déjà initialisé
  }
}

export { auth };
export const firestore = getFirestore(app);
export const storage = getStorage(app);
