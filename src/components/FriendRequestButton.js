import React, { useState, useEffect} from "react";
import { TouchableOpacity, Text, View, Alert } from "react-native";
import { firestore, USERS, FRIENDREQUESTS, doc, collection, onSnapshot, addDoc, serverTimestamp, setDoc} from "../firebase/config";
import { Ionicons } from "@expo/vector-icons";


export default function FriendRequestButton({ user, targetUserId, friendsList =[], allFriendRequests = []}) {
    if (!user || !targetUserId) return null;

    const isFriend = friendsList.some(friend => friend.id === targetUserId); 
    
    const request = allFriendRequests.find(req =>
        (req.fromUserId === user.uid && req.toUserId === targetUserId) ||
        (req.fromUserId === targetUserId && req.toUserId === user.uid)
    );

    // fuction to handle friend requests 
    const handleFriendRequest = async () => {

    try {
        const currentUserRequestsRef = collection(firestore, USERS, user.uid, FRIENDREQUESTS)
        const targetUserRequestsRef = collection(firestore, USERS, targetUserId, FRIENDREQUESTS)
        
        const requestData = {
            fromUserId: user.uid,
            toUserId: targetUserId,
            status: "pending",
            timestamp: serverTimestamp(),
        }
        const requestDocRef = doc(currentUserRequestsRef)
        await setDoc(requestDocRef, requestData)
        await setDoc(doc(targetUserRequestsRef, requestDocRef.id), requestData)

        Alert.alert("Pyyntö lähetetty", `Kaveripyyntö lähetetty käyttäjälle ${targetUserId}`)
    } catch (error) {
        console.error("Error sending friend request:", error)
        Alert.alert("Virhe", "Kaveripyynnön lähetys epäonnistui.")
    }

      }

    if (isFriend) {
    return <Text>Kavereita</Text>;
  }
    if (request?.status === "pending") {
    return <Text style={{ color: "#999", fontSize: 12 }}>Odottavissa</Text>
  }
    if (request?.status === "declined") {
    return <Text style={{ color: "#aaa", fontSize: 12 }}>Hylätty</Text>
    }

    return (
        <TouchableOpacity
            onPress={handleFriendRequest}   
            style={{
                backgroundColor: "#e7e7e7",
                paddingHorizontal: 10,
                paddingVertical: 4,     
                borderRadius: 6,
            }}
        >
           <Ionicons name="person-add-outline" size={20} color="#000000" style={{ marginRight: 8 }} />
        </TouchableOpacity>
     );

}