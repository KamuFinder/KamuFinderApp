import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
    /*
    if (Device.isDevice) {
        alert("Käytä oikeaa laitetta");
        return;
    }*/

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

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#38d8957c',
        });
    }
    return token;
}   