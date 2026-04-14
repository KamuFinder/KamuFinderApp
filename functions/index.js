import * as functions from "firebase-functions";
import admin from "firebase-admin";

import { onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "europe-west1" });

admin.initializeApp()

const db = admin.firestore()

export const loginUser = onCall(async (request) => {
    const email = request.data.email?.trim().toLowerCase();
    
    if(!email) {
        throw new functions.https.HttpsError("invalid-argument", "Email required")

    }

    const userSnap = await db.collection("user").where("email", "==", email).get()

    if(userSnap.empty){
        throw new functions.https.HttpsError("not-found", "User not found")
    }
    
    const user = userSnap.docs[0].data()
    const now = Date.now()

    if(user.lockUntil && user.lockUntil > now) {
        throw new functions.https.HttpsError("permission-denied", "Already locked")
    }

    return { success: true}

})

export const incrementFailedLogin = onCall(async (request) => {
    const email = request.data.email?.trim().toLowerCase();

    if(!email) {
        throw new functions.https.HttpsError("invalid-argument", "Email required")
    }

    const userSnap = await db.collection("user").where("email", "==", email).get()

    if(userSnap.empty){
        throw new functions.https.HttpsError("not-found", "User not found")
    }

    const doc = userSnap.docs[0]
    const user = doc.data()

    const attempts = (user.failedLoginAttempts || 0) + 1
    const now = Date.now()

    if(attempts >= 5) {
        await doc.ref.update({
            failedLoginAttempts: attempts,
            lockUntil: now + 15 * 60 * 1000 // Lock for 15 minutes
        })
        throw new functions.https.HttpsError("permission-denied", "Account locked due to too many failed login attempts. Try again later.")
    }

    await doc.ref.update({
        failedLoginAttempts: attempts,
    })

    return { success: true, attempts}


})

export const resetFailedLogin = onCall(async (request) => {
  const email = request.data.email?.trim().toLowerCase();

  const userSnap = await db.collection("user").where("email", "==", email).get()

  if (userSnap.empty) {
    throw new functions.https.HttpsError("not-found", "User not found")
  }

  const doc = userSnap.docs[0]

  await doc.ref.update({
    failedLoginAttempts: 0,
    lockUntil: null,
  });

  return { success: true }
});