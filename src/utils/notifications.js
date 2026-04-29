import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants'
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {

    let token

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C'
            
        });
    }
    
    if (!Device.isDevice) {
        alert("Käytä oikeaa laitetta");
        return;
    }
   
    const { status: existingStatus } = await Notifications.getPermissionsAsync();


    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }   

    if (finalStatus !== 'granted') {
        alert('Ei lupaa push-ilmoituksille!');
        return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
    console.log("NO PROJECT ID FOUND");
    return;
    }

    try {
        token = await Notifications.getExpoPushTokenAsync({ projectId });
        } catch (e) {
        console.log("TOKEN ERROR:", e);
        }

    return token?.data;
}   


// In app notifications for new messages, etc.
useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
        const title = notification.request.content.title || "Uusi ilmoitus";
        const body = notification.request.content.body || "Sinulla on uusi ilmoitus.";

        Toast.show({
            type: 'info',
            text1: title,
            text2: body,    
            position: 'top',
            visibilityTime: 4000,
        });
    })
    return () => subscription.remove();
}, []); 