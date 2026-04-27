import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants'


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
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
    console.log("Device:", Device.isDevice);

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
    console.log("NO PROJECT ID FOUND");
    return;
    }

    console.log("PROJECT ID:", projectId);

    console.log("CALLING getExpoPushTokenAsync NOW");
    try {
        token = await Notifications.getExpoPushTokenAsync({ projectId });
        console.log("TOKEN RESULT:", token);
        } catch (e) {
        console.log("TOKEN ERROR:", e);
        }

    return token?.data;
}   