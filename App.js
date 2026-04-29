import React, { useEffect } from "react";
import AppNavigator from "./src/navigation/Navigation.js";
import { AuthProvider } from "./src/context/UserContext.js";
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';


export default function App() {

  
  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received in foreground:", notification);
    });

    const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("User tapped notification:", response);
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);



  return (
    <AuthProvider>
      <AppNavigator />
      <Toast />
    </AuthProvider>
  );
}