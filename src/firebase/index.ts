// Import the functions you need from the SDKs you need
import * as Firestore from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { IProject } from "../classes/Project";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdcNTwSVuKwhyOQ4FgfmnZcN2kKJcXYlw",
  authDomain: "bim-dev-master-5fa8d.firebaseapp.com",
  projectId: "bim-dev-master-5fa8d",
  storageBucket: "bim-dev-master-5fa8d.firebasestorage.app",
  messagingSenderId: "304325603456",
  appId: "1:304325603456:web:b2a890d1ba2b91f433f665"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestoreDB = Firestore.getFirestore();// Export the Firestore database instance

export function getCollection<T>(path: string) {
  return Firestore.collection(firestoreDB, path) as Firestore.CollectionReference<T>;//'T' is a generic type parameter, allowing the function to be used with any data type
}

// Function to delete a document from Firestore
export async function deleteDocument(path: string, id: string){
  const doc = Firestore.doc(firestoreDB, `${path}/${id}`);//Get a reference to the document by its path and ID so need to have parameter 'path' and 'id' for deleteDocument function
  await Firestore.deleteDoc(doc);
}

// Function to edit a document from Firestore
export async function updateDocument<T extends Record<string, any>>(path: string, id: string, data: T){
  const doc = Firestore.doc(firestoreDB, `${path}/${id}`);//Get a reference to the document by its path and ID so need to have parameter 'path' and 'id' for deleteDocument function
  await Firestore.updateDoc(doc, data);//the second parameter is required to be and object and the type T extends Record<string, any> ensures that data is an object with string keys (1st para of Record?) and any type of values (2nd para of Record?)
}

//updateDocument<Partial<IProject>>("/projects", "some-project-id", { name: "Updated Project Name" });//Example usage of updateDocument function with Partial<IProject> type to update only the name field of the project