import React, { useEffect } from "react";
import AppNavigator from "./src/navigation/Navigation.js";
import { AuthProvider } from "./src/context/UserContext.js";
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';
import { navigate } from "./src/navigation/navigationService";



export default function App() {

  useEffect(() => {
    const check = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();

      if (response) {
        handleNotification(response);
      }
    };

    check();
  }, []);


  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener(notification => {

      const title = notification.request.content.title || "Uusi ilmoitus";
      const body = notification.request.content.body || "Sinulla on uusi ilmoitus.";
      const data = notification.request.content.data;

      Toast.show({
          type: 'info',
          text1: title,
          text2: body,    
          position: 'top',
          visibilityTime: 4000,
          onPress: () => {
            handleNotificationData(data);
          },
          text1Style: {
            fontSize: 18,
            fontWeight: 'bold',
          },
          text2Style: {
            fontSize: 16,
          },
      })
      
    });

    const sub2 = Notifications.addNotificationResponseReceivedListener(handleNotification);


    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  function handleNotification(response) {
    const data = response?.notification?.request?.content?.data;
    handleNotificationData(data);
  }

  function handleNotificationData(data) {
  if (!data) return;

  if (data.type === "chat") {
    navigate("SpecificChat", { chatId: data.chatId });
  }

  else if (data.type === "group_chat") {
    navigate("SpecificGroupChat", { groupId: data.groupId });
  }

  else if (data.type === "friend_request") {
    navigate("Profile", { userId: data.fromUserId });
  }

  else {
    navigate("Notifications");
  }
}




  return (
    <AuthProvider>
      <AppNavigator />
      <Toast />
    </AuthProvider>
  );
}