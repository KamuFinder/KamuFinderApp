import * as functions from "firebase-functions";
import admin from "firebase-admin";

import { onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import fetch from "node-fetch";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { onDocumentCreated } from "firebase-functions/v2/firestore";



setGlobalOptions({ region: "europe-west1" });

admin.initializeApp()

const db = admin.firestore()

export const loginUser = onCall(async (request) => {
    const email = request.data.email ?? null
    
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
    const email = request.data.email ?? null

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
  const email = request.data.email ?? null

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



export const createUserProfile = onCall(async (request) => {
  const data = request.data || {};
  const authContext = request.auth

  if (!authContext || !authContext.uid) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required");
  }

  const uid = authContext.uid;
  const { firstName, lastName, nickName, email, avatarSeed, avatarStyle } = data;

  if (!firstName || !lastName || !email) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
  }

  // Tarkista nick‑uniikkius
  if (nickName) {
    const snap = await db.collection('user').where('nickName', '==', nickName).get();
    if (!snap.empty) {
      const conflict = snap.docs.some(d => d.id !== uid);
      if (conflict) {
        throw new functions.https.HttpsError("already-exists", "NickName already in use");
      }
    }
  }

  const profile = {
    firstName,
    lastName,
    nickName: nickName || null,
    email: email.toLowerCase(),
    avatarSeed: avatarSeed || null,
    avatarStyle: avatarStyle || null,
    failedLoginAttempts: 0,
    lockUntil: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('user').doc(uid).set(profile, { merge: true });

  return { success: true };
});





export const validateSignUp = onCall(async (request) => {

  const {email, nickName } = request.data

  if(!email){
    throw new functions.https.HttpsError("invalid-argument", "Email required")
  }  
  const emailSnap = await db.collection("user").where("email", "==", email).get()
  if (!emailSnap.empty) {
    throw new functions.https.HttpsError("already-exists", "Email already in use")
  }

  if (nickName){
    const nickSnap = await db.collection("user").where("nickName", "==", nickName).get()
    if(!nickSnap.empty) {
      throw new functions.https.HttpsError("already-exists", "NickName already in use")
    }
  }
  return { success: true }

})


export const sendMessageNotification = onDocumentCreated("privateChats/{chatId}/messages/{messageId}",

  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const text = data.text;
    const senderId = data.userId;
    const chatId = event.params.chatId;
    const sederDoc = await db.collection("user").doc(senderId).get()
    const senderName = sederDoc.data()?.firstName || "Tuntematon käyttäjä"

    console.log("text:", text, "senderId:", senderId, "chatId:", chatId);

    if (!text || !chatId || !senderId) {
      console.log("Invalid message data") 
      return
    }

    try {
      const chatDoc = await db.collection("privateChats").doc(chatId).get();
      if (!chatDoc.exists) return;

      const chatData = chatDoc.data();
      const recipientId =
        senderId === chatData.user1 ? chatData.user2 : chatData.user1;

      const recipientDoc = await db.collection("user").doc(recipientId).get();
      if (!recipientDoc.exists) return;


      const recipientData = recipientDoc.data();

      console.log("Recipient activeChatId:", recipientData?.activeChatId, "Current chatId:", chatId);

      const isInSameChat = recipientData?.activeChatId === chatId;

      if (isInSameChat) {
        console.log("User is in same chat → skip push");
        return;
      }



      const token = recipientDoc.data().expoPushToken;
      if (!token) return;

      const notification = {
        to: token,
        title: `Uusi viesti: ${senderName}`,
        body: text || "Sait uuden viestin",
        sound: "default",
        data: { type: "chat", chatId }
      };

      const res = await fetch("https://api.expo.dev/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(notification)
      });

      const responseData  = await res.json();
      console.log("Expo Push API response:", responseData );

    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }
);

export const sendGeneralNotification = onDocumentCreated("user/{userId}/notifications/{notificationId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;  

    const userId = event.params.userId;

    try{
      const userDoc = await db.collection("user").doc(userId).get();
      if (!userDoc.exists) return;

      const token = userDoc.data().expoPushToken;
      if (!token) return;

      let title = "Uusi ilmoitus";

      if (data.type === "friend_accept") {
        title = "Kaveripyyntö hyväksytty";
      } else if (data.type === "group_add") {
        title = "Sinut lisättiin ryhmään";
      }

      const notification = {
        to: token,
        title: title,
        body: data.message || "Sait uuden ilmoituksen",
        sound: "default",
        data: { type: "notification", screen: "Notifications" }
      };


      const res = await fetch("https://api.expo.dev/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(notification)
      });

      const responseData  = await res.json();
      console.log("Expo Push API response:", responseData );

    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }
);


export const sendFriendRequestNotification = onDocumentCreated("user/{userId}/friendRequests/{requestId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const userId = event.params.userId;
    if (data.fromUserId === userId) return;

    try{

      const userDoc = await db.collection("user").doc(userId).get();
      if (!userDoc.exists) return;


      const token = userDoc.data()?.expoPushToken;
      if (!token) return;

      let body = "Sait uuden kaveripyynnön";

      if(data.fromUserId){
        const fromUserDoc = await db.collection("user").doc(data.fromUserId).get();
        if (fromUserDoc.exists) {
          const fromUser = fromUserDoc.data();
          const name = `${fromUser.firstName || ""} ${fromUser.lastName || ""}`.trim();
          if(name) {
            body = `Sait kaveripyynnön käyttäjältä ${name}`;
        }
      }
      }
      const notification = {
        to: token,
        title: "Uusi kaveripyyntö",
        body,
        sound: "default",
        data: { type: "friend_request", fromUserId: data.fromUserId }
      };

      await fetch("https://api.expo.dev/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      });

    }catch (error) {
        console.error("Error sending friend request notification:", error); 
    }

  }
);



export const sendGroupMessageNotification = onDocumentCreated("groups/{groupId}/messages/{messageId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const { text, senderId, senderName } = data;
    const groupId = event.params.groupId;

    if (!text || !senderId) return;

    try {
      const groupDoc = await db.collection("groups").doc(groupId).get();
      if (!groupDoc.exists) return;

      const groupData = groupDoc.data();
      const groupName = groupData.groupName || "Ryhmä";

      const membersSnap = await db.collection("groups").doc(groupId).collection("members").get();

      const notifications = [];

      for (const member of membersSnap.docs) {
        const userId = member.id;

        if (userId === senderId) continue;

        const userDoc = await db.collection("user").doc(userId).get();
        if (!userDoc.exists) continue;


        const userData = userDoc.data();

        if (userData?.activeChatId === groupId) {
          console.log(`User ${userId} is active in group chat → skip push`);
          continue;
        }

        const token = userDoc.data()?.expoPushToken;
        if (!token) continue;

        notifications.push({
          to: token,
          title: `Ryhmä: ${groupName}`,
          body: `${senderName || "Joku"}: ${text}`,
          sound: "default",
          data: {
            type: "group_chat",
            groupId,
          },
        });
      }

      await Promise.all(
        notifications.map((notif) =>
          fetch("https://api.expo.dev/v2/push/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(notif),
          })
        )
      );

      console.log("Group notifications sent:", notifications.length);
    } catch (error) {
      console.error("Error sending group notifications:", error);
    }
  }
);