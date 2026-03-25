import React, { useState,useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, 
  KeyboardAvoidingView, Platform, 
  ScrollView} from "react-native";  
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext.js";
import {firestore,USERS,doc,getDoc,} from "../firebase/config.js";
import styles from "../styles/EditProfile.js";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


export default function EditProfileScreen() {

        const insets = useSafeAreaInsets();

        const [userInfo, setUserInfo] = useState({
            firstName: "",
            lastName: "",
            nickName: "",
            city: "",
            profile_text: "",
            intrests: "",
            });;
        const user = useUser();

        useEffect(() => {
            const fetchUserData = async () => {
            if (!user) return;

            const ref = doc(firestore, USERS, user.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setUserInfo({
                nickName: snap.data().nickName || "",
                city: snap.data().city || "",
                profile_text: snap.data().profile_text || "",
                intrests: snap.data().intrests || "",
                });
            }
            };

            fetchUserData();
        }, [user]);
    
        return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top","bottom"]}>
        <KeyboardAwareScrollView
        style={{ flex: 1}}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 40 }}
        enableOnAndroid={true}
        extraScrollHeight={190}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        >

        <View style={styles.container}>
        <Text style={styles.title}>Edit Profile Screen</Text>

        <View style={{ marginTop: 40, alignSelf: "left", paddingHorizontal: 20  }}>
            <Text style={{ fontSize: 18, color: "#555", marginBottom: 10 }}>Tähän tulee profiilikuva</Text>
        </View>

        <View style={styles.inputContainer}>
            <Text style={styles.label}>Uusi käyttäjätunnus</Text>
            <TextInput 
            style={styles.input} 
            value={userInfo.nickName}
            onChangeText={(text) => setUserInfo({...userInfo, nickName: text})}
            placeholder="Uusi käyttäjätunnus"
            />
            
            {/*Sähköpostin muuttaminen vaatii muutoksia Firebasen autentikointiin, joten jätetään tämä vielä pois */}
            <Text style={styles.label}>Uusi sähköpostiosoite</Text>  
            <TextInput 
            style={styles.input} 
            placeholder="Uusi sähköposti"
            />

            <Text style={styles.label}>Uusi kuvaus</Text>
            <TextInput 
            style={styles.input} 
            value={userInfo.profile_text}
            onChangeText={(text) => setUserInfo({...userInfo, profile_text: text})}
            placeholder="Uusi kuvaus"
            />
       
            <Text style={styles.label}>Uusi paikkakunta</Text>
            <TextInput 
            style={styles.input} 
            value={userInfo.city}
            onChange={(text) => setUserInfo((prev) => ({...prev, city: text}))}
            placeholder="Uusi paikkakunta"
            />

            <Text style={styles.label}>Harrastuksesi</Text>
            <TextInput 
            style={styles.input} 
            value={userInfo.intrests}
            onChangeText={(text) => setUserInfo({...userInfo, intrests: text})}
            placeholder="Harrastuksesi"
            />
        </View>
        <View style={{ 
            width: "100%", 
            alignItems: "center",
            paddingBottom: insets.bottom + 20,}}>
            <TouchableOpacity style={{ backgroundColor: "#F99D11", padding: 15, borderRadius: 30, marginTop: 20, width: "60%", alignItems: "center" }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Hyväksy muutokset</Text>
            </TouchableOpacity>
            </View>
    </View>
    
   </KeyboardAwareScrollView>
    </SafeAreaView>
);
}

