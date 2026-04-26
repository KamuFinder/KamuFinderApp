import React, { useState } from "react";
import { TouchableOpacity, Alert,} from "react-native";
import {firestore,USERS,doc, FRIENDS, USERSPRIVATECHATS, PRIVATECHATS} from "../firebase/config.js";
import { deleteDoc } from "firebase/firestore";
import { useUser } from "../context/UserContext.js";
import { Ionicons } from "@expo/vector-icons";


export default function DeleteFriend({friendId, onRemoved}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const user  = useUser();


    const getChatId = (uid1, uid2) => {
        return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
    }



    const handleDeleteFriend = () => {
        Alert.alert("Vahvista", "Haluatko varmasti poistaa ystävän?", [
            { text: "Peruuta", style: "cancel" },
            { text: "Kyllä", style: "destructive", onPress: confirmDeleteFriend },
        ]);
    }

    const confirmDeleteFriend = async () => {
        if (!user) {
            Alert.alert("Virhe", "Käyttäjä ei ole kirjautunut sisään.");
            return;
        }
        try {
            setIsDeleting(true);

            // Delete friend from current user's friend list
            const UsersRef = doc(firestore, USERS, user.uid, FRIENDS, friendId);
            await deleteDoc(UsersRef);

            // Delete current user from friend's friend list
            const friendsRef = doc(firestore, USERS, friendId, FRIENDS, user.uid);
            await deleteDoc(friendsRef);

            //Delete chat between users
            const chatId = getChatId(user.uid, friendId);

            const chatRef = doc(firestore, PRIVATECHATS, chatId);

            const currentUserChatRef = doc(firestore, USERS, user.uid, USERSPRIVATECHATS, chatId);
            const friendChatRef = doc(firestore, USERS, friendId, USERSPRIVATECHATS, chatId);
            console.log("Deleting chat with ID:", chatId);

            await deleteDoc(chatRef);
            await deleteDoc(currentUserChatRef);
            await deleteDoc(friendChatRef);


            setIsDeleting(false);
            Alert.alert("Ystävä poistettu", "Ystävä on onnistuneesti poistettu.", [{ text: "OK" , onPress: () => {if (onRemoved) onRemoved()}}], { cancelable: true });


        }catch (error) {
            console.error("Error deleting friend:", error);
            Alert.alert("Virhe", "Ystävän poisto epäonnistui.");
            setIsDeleting(false);
        }
    }
    return (
        <TouchableOpacity onPress={handleDeleteFriend} disabled={isDeleting} style={{ padding: 10, backgroundColor: "#ff4d4d", borderRadius: 12 }}>
            <Ionicons name="trash" size={20} color={isDeleting ? '#0b0a0a' : '#fff'} />
        </TouchableOpacity>
    )
}