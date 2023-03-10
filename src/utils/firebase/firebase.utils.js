// It is good practice to place code that interacts with API's inside their own folder/file structure. This way
// we can deal with the nuances of this API in a "contained" way.

/*
Firestore data model
- Document: represents the smallest unit, defines the data types the document has.
- Collection: 1 or more Documents.

Firestore important notes
- In order to use we must create a DB
- In the admin console, there is a "rules" page that must be configured
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
  ...

*/



// InitializeApp is mandatory to leverage firebase features
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithRedirect,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  writeBatch,
  query,
  getDocs
} from 'firebase/firestore';

// Your web app's Firebase configuration - copies over from the firebase/app remember we also must activate Google auth
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzt1S1MbJZcx7ulIADE7pRuiW61Yt-K68",
  authDomain: "comet-wares.firebaseapp.com",
  projectId: "comet-wares",
  storageBucket: "comet-wares.appspot.com",
  messagingSenderId: "102982826754",
  appId: "1:102982826754:web:71fb93fa14261d75bae01b",
  measurementId: "G-JWBBF7QM00"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);


// There is a particula
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Generally you have a single authenticator for an application
export const auth = getAuth();

// but can have many providers, here we only create a single one with google, yahoo, email etc;
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);

// db is a singletone instance
export const db = getFirestore();

export const addCollectionAndDocuments = async (collectionKey, objectsToAdd) => {
  const collectionRef = collection(db, collectionKey);
  const batch = writeBatch(db);

  objectsToAdd.forEach((object) => {
    const docRef = doc(collectionRef, object.title.toLowerCase());
    batch.set(docRef, object);
  })

  await batch.commit();
  console.log('done')
}

export const getCategoriesAndDocuments = async () => {
  const collectionRef = collection(db, 'categories');
  const q = query(collectionRef);

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnapshot => docSnapshot.data());
}

export const createUserDocumentFromAuth = async (
  userAuth,
  additionalInformation = {}
  ) => {
  if(!userAuth) return;

  const userDocRef = doc(db, 'users', userAuth.uid);

  const userSnapshot = await getDoc(userDocRef);

  console.log(additionalInformation);

  if(!userSnapshot.exists()) {
    const { displayName, email } = userAuth;
    const createdAt = new Date();

    try{
      await setDoc(userDocRef, {
        displayName,
        email,
        createdAt,
        ...additionalInformation
      });
    } catch ( error) {
      console.log('error creating the user', error.message);
    }
  }
  return userDocRef;
}

export const createAuthUserWithEmailAndPassword = async( email, password) => {
  if(!email || !password) return;
  return createUserWithEmailAndPassword(auth, email, password)
}

export const signInAuthUserWithEmailAndPassword = async( email, password) => {
  if(!email || !password) return;
  return signInWithEmailAndPassword(auth, email, password)
}

export const signOutUser = async () => await signOut(auth);

export const onAuthStateChangedListener = (callback) => onAuthStateChanged(auth, callback);
