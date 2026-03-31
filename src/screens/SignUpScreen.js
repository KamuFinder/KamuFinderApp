import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert,
  Image,TouchableWithoutFeedback,Keyboard
 } from "react-native";

import { CommonActions, useNavigation } from '@react-navigation/native';
import { auth, createUserWithEmailAndPassword, firestore, USERS, setDoc, doc, where, query, collection} from '../firebase/config.js'
import isEmail from 'validator/lib/isEmail';
import isEmpty from 'validator/lib/isEmpty';
import isStrongPassword from 'validator/lib/isStrongPassword';
import { getDocs } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView,useSafeAreaInsets } from "react-native-safe-area-context";


import styles from "../styles/SignIn_And_Up.js";


export default function SignUpScreen() {

    const insets = useSafeAreaInsets();

    const navigation = useNavigation()
    const [userInfo, setUserInfo] = useState({
      firstName: '',
      lastName: '',
      email: '',
      nickName: '',
      password: '',
      confirmedPassword: ''
    })

    const generateAvatarSeed = () => {
      return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    }

    const validateInputs = () => {

      if (isEmpty(userInfo.email.trim())){
        Alert.alert("Virhe", "Sähköposti on pakollinen")
        return false
      }

      else if (!isEmail(userInfo.email)){
        Alert.alert("Virhe", "Sähköposti on virheellinen")
        return false
      }

      //First or last name can not be " " or empty
      else if (isEmpty(userInfo.firstName.trim())){
        Alert.alert("Virhe", "Etunimi on pakollinen")
        return false
      }

      else if (isEmpty(userInfo.lastName.trim()) ){
        Alert.alert("Virhe", "Sukunimi on pakollinen")
        return false
      }

      else if (userInfo.nickName.length > 15) {
        Alert.alert("Virhe", "Nimimerkin maksimipituus on 15 merkkiä")
        return false
      }

      //Password must contain at least 8 characters, at least 1 upper and 1 lower case letter, min 1 number and be max 20 long

      else if (!userInfo.password || !isStrongPassword(userInfo.password, {minLength: 8, minLowercase:1 , minUppercase: 1, minNumbers: 1, minSymbols: 0}) || userInfo.password.length > 20) {
        Alert.alert('Virhe', 'Salasanan täytyy sisältää vähintään 8-20 merkkiä, yksi iso- ja pienikirjain ja yksi numero')
        return false
      }

      else if (!userInfo.confirmedPassword || userInfo.confirmedPassword !== userInfo.password) {
        Alert.alert('Virhe', 'Salasanat eivät täsmää')
        return false
      }
      else {
        return true
      }

    }

    const handleSignUp = async () => {
      if(!validateInputs()){
        return
      }
      
      try {
        const nickQuery = query(
          collection(firestore, USERS),
          where('nickName', '==', userInfo.nickName)
        );

        const nickSnapshot = await getDocs(nickQuery);

        if (!nickSnapshot.empty) {
          Alert.alert("Virhe", "Nimimerkki on jo käytössä");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, userInfo.email, userInfo.password)
        
        const avatarSeed = generateAvatarSeed();
        const avatarStyle = "fun-emoji"
        
        await setDoc(doc(firestore, USERS, userCredential.user.uid), {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          nickName: userInfo.nickName,
          email: userInfo.email,
          avatarSeed: avatarSeed,
          avatarStyle: avatarStyle,
        })
        setUserInfo({
          firstName: '',
          lastName: '',
          email: '',
          nickName: '',
          password: '',
          confirmedPassword: ''
        })
        
        
      } catch(error) {
            if (error.code === 'auth/email-already-in-use') {
              Alert.alert("Virhe", "Sähköposti on jo käytössä")
            }
            else {
              console.log(error)
              Alert.alert("Virhe", error.message)
            }
    }
  }

  return (
    <SafeAreaView style={{flex:1}} edges={['top', 'bottom']}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={180}
        extraHeight={180}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow:1, alignItems:'center',padding:10, paddingBottom: insets.bottom + 20}}
        keyboardShouldPersistTaps="handled"
      >
      
      
        <View style={{ width: "100%", alignItems: "center"}}>
        <View style={{justifyContent: "flex-start", alignItems: "center"}}>
                <Image source={require("../../assets/Logo.png")} style={{ width: 120, height: 120, }} />
              </View>

         <Text style={{fontWeight: "700", fontFamily:'Roboto',color: '#FB7318',textAlign:'center', fontSize: 48}}>
                KamuFinder
              </Text>

      <Text style={{fontFamily:'monospace', marginBottom:16,marginTop:16}}>Tämä on Rekisteröitymissivu</Text>

      <View style={{width:"80%", marginBottom:8}}>

        <Text style={{alignSelf: 'flex-start',fontSize: 16,fontWeight:'400', marginBottom:8}}>Sähköposti:</Text>
      
        <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#b1b1b1",
                paddingHorizontal: 10,
                borderRadius: 10,
              }}>

             <Ionicons name="mail-outline" size={20} color="gray" 
              style={{ marginRight: 10 }} />

      <TextInput
        style={{flex:1, paddingVertical:10}}
        placeholder='Syötä sähköposti'
        value={userInfo.email}
        onChangeText={text => setUserInfo({...userInfo, email: text})}
        keyboardType='email-address'
        numberOfLines={1}
        autoCapitalize='none'
        autoCorrect={false}
      />
      </View>
        </View>

      <View style={{width:"80%", marginBottom:8}}>

      <Text style={{alignSelf: 'flex-start',fontSize: 16,fontWeight:'400', marginBottom:8}}>Etunimi:</Text>
      
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#b1b1b1",
        paddingHorizontal: 10,
        borderRadius: 10,
      }}>

      <Ionicons name="person-outline" size={20} color="gray" 
        style={{ marginRight: 10 }} />

      <TextInput
        style={{flex:1, paddingVertical:10}}
        placeholder='Anna etunimi'
        value={userInfo.firstName}
        onChangeText={text => setUserInfo({...userInfo, firstName: text})}
        numberOfLines={1}
        autoCorrect={false}
      />
      </View>
      </View>

      <View style={{width:"80%", marginBottom:8}}>

        <Text style={{alignSelf: 'flex-start',fontSize: 16,fontWeight:'400', marginBottom:8}}>Sukunimi:</Text>

        <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#b1b1b1",
        paddingHorizontal: 10,
        borderRadius: 10,
      }}>

        <Ionicons name="person-outline" size={20} color="gray"
          style={{ marginRight: 10 }} />


      
      <TextInput
        style={{flex:1, paddingVertical:10}}
        placeholder='Anna sukunimi'
        value={userInfo.lastName}
        onChangeText={text => setUserInfo({...userInfo, lastName: text})}
        numberOfLines={1}
        autoCorrect={false}
      />
      </View>
      </View>

      <View style={{width:"80%", marginBottom:8}}>

        <Text style={{alignSelf: 'flex-start',fontSize: 16,fontWeight:'400', marginBottom:8}}>Nimimerkki:</Text>

        <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#b1b1b1",
        paddingHorizontal: 10,
        borderRadius: 10,
      }}>

     

        <Ionicons name="person-circle-outline" size={20} color="gray"
          style={{ marginRight: 10 }} />

      <TextInput
        style={{flex:1, paddingVertical:10}}
        placeholder="Syötä nimimerkki:"
        value={userInfo.nickName}
        onChangeText={text => setUserInfo({...userInfo, nickName: text})}
        numberOfLines={1}
        autoCapitalize='none'
        autoCorrect={false}
      />
      </View>
      </View>

      <View style={{width:"80%", marginBottom:8}}>

        <Text style={{alignSelf: 'flex-start',fontSize: 16,fontWeight:'400', marginBottom:8}}>Salasana:</Text>

        <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#b1b1b1",
        paddingHorizontal: 10,
        borderRadius: 10,
      }}>

      <Ionicons name="lock-closed-outline" size={20} color="gray"
        style={{ marginRight: 10 }} />
      
      <TextInput
        style={{flex:1, paddingVertical:10}}
        placeholder='Kirjoita salasana'
        value={userInfo.password}
        onChangeText={text => setUserInfo({...userInfo, password: text})}
        secureTextEntry={true}
        numberOfLines={1}
        autoCapitalize='none'
        autoCorrect={false}
      />

      </View>
      </View>

      <View style={{width:"80%", marginBottom:8}}>

      <Text style={{alignSelf: 'flex-start',fontSize: 16,fontWeight:'400', marginBottom:8}}>Kirjoita salasana uudelleen:</Text>
      
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#b1b1b1",
        paddingHorizontal: 10,
        borderRadius: 10,
      }}>
      <Ionicons name="lock-closed-outline" size={20} color="gray"
        style={{ marginRight: 10 }} />
      
      <TextInput
        style={{flex:1, paddingVertical:10}}
        placeholder='Anna salasana uudelleen'
        value={userInfo.confirmedPassword}
        onChangeText={text => setUserInfo({...userInfo, confirmedPassword: text})}
        secureTextEntry={true}
        numberOfLines={1}
        autoCapitalize='none'
        autoCorrect={false}
        
      />

      </View>
      </View>

      <View style={{width:"80%", paddingBottom:20, marginTop:30, alignItems:'center'}}>
      <TouchableOpacity style={{width:"100%", backgroundColor: "#F99D11", 
        paddingVertical: 15, borderRadius: 20, alignItems:'center'}} onPress={handleSignUp}>
        <Text style={{color:'white',textAlign:'center', fontSize: 16, fontWeight: 'bold'}}>Rekisteröidy</Text>
      </TouchableOpacity>
        </View>
        
    </View>
   
    </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}


