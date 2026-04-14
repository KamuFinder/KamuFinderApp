import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc, collection, getDocs, query, where, writeBatch, limit } from "firebase/firestore";
import { firestore, USERS, USERSPRIVATECHATS, PRIVATECHATS, MESSAGES, FRIENDS, FRIENDREQUESTS } from "../firebase/config";



import styles from "../styles/Profile";
import { useUser } from "../context/UserContext";

export default function DeleteUser({ onStart, onEnd  }) {
  const [visible, setVisible] = useState(false)
  const user = useUser()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!user || isDeleting) return

    try {
        setIsDeleting(true)
        onStart?.()
        setVisible(false)
      
        await removeUserFromAllGroups(user.uid)
        await removeUserFromAllChats(user.uid)

        await removeAllFriends(user.uid)
        await removeAllFriendRequests(user.uid)
        await removeAllNotifications(user.uid)

        await deleteDoc(doc(firestore, USERS, user.uid))
        await deleteUser(user)


        

    } catch (error) {
      console.error(error)
      Alert.alert("Virhe", error.message)
    } finally {
        setIsDeleting(false)
        onEnd?.()
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Poista tili",
      "Oletko VARMA? Tätä ei voi perua.",
      [
        { text: "Peruuta", style: "cancel" },
        { text: "Poista", style: "destructive", onPress: handleDelete },
      ]
    );
  };

  //Removes user from groups or deletes the group
  const removeUserFromAllGroups = async (userId) => {
    try {
      const userGroupsRef = collection(firestore, USERS, userId, "user-groups")
      const snapshot = await getDocs(userGroupsRef)

      for (const groupDoc of snapshot.docs) {
        const groupId = groupDoc.id
        const groupData = groupDoc.data()

        const groupRef = doc(firestore, "groups", groupId)
        const memberRef = doc(firestore, "groups", groupId, "members", userId)

        if (groupData.role === "member") {
            await deleteDoc(memberRef)
            await deleteDoc(groupDoc.ref)
            continue;
        }

        if (groupData.role === "admin") {
            const membersRefs = collection(firestore, "groups", groupId, "members")
            const adminsQuery = query(membersRefs, where("role", "==", "admin"))
            const adminsSnapshot = await getDocs(adminsQuery)

            const otherAdmins = adminsSnapshot.docs.filter((docSnap) => docSnap.id !== userId)

            if (otherAdmins.length > 0) {
                await deleteDoc(memberRef)
                await deleteDoc(groupDoc.ref)
            }
            else {

                const allMembersSnapshot = await getDocs(membersRefs)

                for (const member of allMembersSnapshot.docs) {
                    const memberId = member.id

                    const userGroupRef = doc(firestore, USERS, memberId, "user-groups", groupId)
                    await deleteDoc(userGroupRef)

                }
                for (const member of allMembersSnapshot.docs){
                    await deleteDoc(member.ref)
                }

                const messagesRef = collection(firestore, "groups", groupId, "messages")
                await deleteCollectionInBatches(messagesRef)

                await deleteDoc(groupRef)
            }
        }
            
      }  } catch (error) {
      console.error("Group delete error:", error)
      throw error
    }
    };


    // Delete chats
    const removeUserFromAllChats = async (userId) => {
        try{
            const userChatsRef = collection(firestore, USERS, userId, USERSPRIVATECHATS)
            const snapshot = await getDocs(userChatsRef)

            for (const chatDoc of snapshot.docs) {
                const chatId = chatDoc.id
                const chatData = chatDoc.data()

                const otherUserId = chatData.otherUser

                const messagesRef = collection(firestore, PRIVATECHATS, chatId, MESSAGES )
                await deleteCollectionInBatches(messagesRef)

                await deleteDoc(chatDoc.ref)

                const otherUserChatRef = doc(firestore, USERS, otherUserId, USERSPRIVATECHATS, chatId)
                await deleteDoc(otherUserChatRef)

                const chatRef = doc(firestore, PRIVATECHATS, chatId)
                await deleteDoc(chatRef)

            }
        }
        catch (error){
            console.log("Chat delete error: ", error)
            throw error;
        }
    }

    //Deletes all friends
    const removeAllFriends = async (userId) => {
        try{
            const friendsRef = collection(firestore, USERS, userId, FRIENDS )
            const snapshot = await getDocs(friendsRef)
            
            for (const friendDoc of snapshot.docs){
                const friendId = friendDoc.id
                await deleteDoc(friendDoc.ref)

                const otherFriendRef = doc(firestore, USERS, friendId, FRIENDS, userId)
                await deleteDoc(otherFriendRef)
            }

        }catch(error){
            console.log("Friend delete error;", error)
            throw error
        }
    }


    //Deletes sent friendrequests
    const removeAllFriendRequests = async (userId) => {
        try {
            const requestsRef = collection(firestore, USERS, userId, FRIENDREQUESTS)
            const snapshot = await getDocs(requestsRef)

            for (const reqDoc of snapshot.docs) {
            const data = reqDoc.data()
            const otherUserId =
                data.fromUserId === userId ? data.toUserId : data.fromUserId
            if (!otherUserId) continue

            await deleteDoc(reqDoc.ref)

            const otherUserReqRef = doc(firestore, USERS, otherUserId, FRIENDREQUESTS, reqDoc.id)
            await deleteDoc(otherUserReqRef)
            }

        } catch (error) {
            console.error("Friend request delete error:", error)
            throw error
        }

    }

    //Deletes all notifications
    const removeAllNotifications = async (userId) => {
        try {
            const notifRef = collection(firestore, USERS, userId, "notifications")
            await deleteCollectionInBatches(notifRef)
        } catch (error) {
            console.error("Notification delete error:", error)
            throw error
        }
    }

    //Deletes things in batches (For messages)
    const deleteCollectionInBatches = async (collectionRef) => {
        const q = query(collectionRef, limit(500))
        const snapshot = await getDocs(q)

        if (snapshot.empty) return

        const batch = writeBatch(firestore)

        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref)
        })
        await batch.commit()

        const nextSnap = await getDocs(query(collectionRef, limit(1)))

        if(!nextSnap.empty) {
            await deleteCollectionInBatches(collectionRef)
        }
    }

 

  return (
    <>
      <TouchableOpacity
        style={{
          marginTop: 20,
          padding: 12,
          borderRadius: 20,
          backgroundColor: "red",
        }}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Poista tili
        </Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => !isDeleting && setVisible(false)}>
        <View style={styles.menuOverlay}>
          <View style={styles.dropdown}>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    Haluatko varmasti poistaa tilin?
                </Text>

                <TouchableOpacity
                    style={{ marginBottom: 10 }}
                    onPress={confirmDelete}
                    disabled={isDeleting}
                >
                    <Text style={{ color: "red" }}>Poista pysyvästi</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setVisible(false)}>
                    <Text>Peruuta</Text>
                </TouchableOpacity>
        
          </View>
        </View>
      </Modal>
    </>
  );
}