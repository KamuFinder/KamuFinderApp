import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { firestore, USERS, onSnapshot, collection, FRIENDREQUESTS, USERSPRIVATECHATS} from "../firebase/config.js";



export default function useUnreadCounts() {
    const user = useUser();  
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [unReadFriendRequestsCount, setUnReadFriendRequestsCount] = useState(0);
    const [unreadChatsCount, setUnreadChatsCount] = useState(0);



    // Listen for changes in the user's notifications to update the unread count in real-time
    useEffect(() => {
    if (!user?.uid) return;
    const notificationsRef = collection(firestore, USERS, user.uid, "notifications")

    const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
        const unreadCount = snapshot.docs.filter(doc => !doc.data().read).length
        setUnreadNotificationsCount(unreadCount)
    });
    return () => unsubscribe()
    }, [user]);


    // Listen for changes in the user's friend requests to update the unread count in real-time
    useEffect(() => {
    if (!user?.uid) return;
    const friendRequestsRef = collection(firestore, USERS, user.uid, FRIENDREQUESTS)
    const unsubscribe = onSnapshot(friendRequestsRef, (snapshot) => {
        const unReadCount = snapshot.docs.filter(doc => doc.data().status === "pending" && !doc.data().read && doc.data().toUserId === user.uid).length
        setUnReadFriendRequestsCount(unReadCount)
    });
    return () => unsubscribe()
    }, [user]);
    
    
  //Checks unread chats
  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(firestore, USERS, user.uid, USERSPRIVATECHATS);
    const unsubscribe = onSnapshot(chatsRef, (snapshot) => {
      const chats = snapshot.docs.filter(doc => doc.data().unReadMessages).length;
      setUnreadChatsCount(chats);
    });

    return () => unsubscribe();
  }, [user]);

  return { unreadNotificationsCount, unReadFriendRequestsCount, unreadChatsCount, totalNotifications: unreadNotificationsCount + unReadFriendRequestsCount };
}