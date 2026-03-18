import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { CommonActions, useNavigation } from '@react-navigation/native';
import { auth, createUserWithEmailAndPassword, firestore, USERS, setDoc, doc, where, query, collection} from '../firebase/config.js'
import isEmail from 'validator/lib/isEmail';
import isEmpty from 'validator/lib/isEmpty';
import isStrongPassword from 'validator/lib/isStrongPassword';
import { getDocs } from "firebase/firestore";


import styles from "../styles/SignIn_And_Up.js";


export default function SignUpScreen() {
    const navigation = useNavigation()
    const [userInfo, setUserInfo] = useState({
      firstName: '',
      lastName: '',
      email: '',
      nickName: '',
      password: '',
      confirmedPassword: ''
    })

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
        await setDoc(doc(firestore, USERS, userCredential.user.uid), {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          nickName: userInfo.nickName,
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
    <View style={styles.container}>
      <Text style={styles.title}>Tämä on Rekisteröitymissivu</Text>

      <Text style={styles.label}>Sähköposti:</Text>
      <TextInput
        style={styles.input}
        placeholder='Syötä sähköposti'
        value={userInfo.email}
        onChangeText={text => setUserInfo({...userInfo, email: text})}
        keyboardType='email-address'
        numberOfLines={1}
        autoCapitalize='none'
        autoCorrect={false}
      />

      <Text style={styles.label}>Etunimi:</Text>
      <TextInput
        style={styles.input}
        placeholder='Anna etunimi'
        value={userInfo.firstName}
        onChangeText={text => setUserInfo({...userInfo, firstName: text})}
        numberOfLines={1}
        autoCorrect={false}
      />

      <Text style={styles.label}>Sukunimi:</Text>
      <TextInput
        style={styles.input}
        placeholder='Anna sukunimi'
        value={userInfo.lastName}
        onChangeText={text => setUserInfo({...userInfo, lastName: text})}
        numberOfLines={1}
        autoCorrect={false}
      />

      <Text style={styles.label}>Nimimerkki:</Text>
      <TextInput
        style={styles.input}
        placeholder="Syötä nimimerkki:"
        value={userInfo.nickName}
        onChangeText={text => setUserInfo({...userInfo, nickName: text})}
        numberOfLines={1}
        autoCapitalize='none'
        autoCorrect={false}
      />

      <Text style={styles.label}>Salasana:</Text>
      <TextInput
        style={styles.input}
        placeholder='Kirjoita salasana'
        value={userInfo.password}
        onChangeText={text => setUserInfo({...userInfo, password: text})}
        secureTextEntry={true}
        numberOfLines={1}
        autoCapitalize='none'
        autoCorrect={false}
      />
      <Text style={styles.label}>Kirjoita salasana uudelleen:</Text>
      <TextInput
        style={styles.input}
        placeholder='Anna salasana uudelleen'
        value={userInfo.confirmedPassword}
        onChangeText={text => setUserInfo({...userInfo, confirmedPassword: text})}
        secureTextEntry={true}
        numberOfLines={1}
        autoCapitalize='none'
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Rekisteröidy</Text>
      </TouchableOpacity>

      

      <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
        <Text style={styles.link}>Takaisin etusivulle</Text>
      </TouchableOpacity>
    </View>
  );
}


