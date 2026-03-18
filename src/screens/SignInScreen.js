import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { CommonActions, useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword} from '../firebase/config.js'
import styles from "../styles/SignIn_And_Up.js";



export default function SignInScreen({setLogged}) {
  const navigation = useNavigation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = () => {
    const auth = getAuth()

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }]
        })
      )
      }).catch((error) => {
        Alert.alert("Virhe", "Sähköposti tai salasana on väärin");
        console.log(error)
      });
  };
  
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tämä on Kirjautumissivu</Text>

      <Text style={styles.label}>Sähköposti:</Text>
      <TextInput
        style={styles.input}
        placeholder="Syötä sähköposti"
        value={email}
        autoCapitalize='none'
        autoCorrect={false}
        numberOfLines={1}
        onChangeText={setEmail}
        keyboardType='email-address'

      />

      <Text style={styles.label}>Salasana:</Text>
      <TextInput
        style={styles.input}
        placeholder="Syötä salasana"
        secureTextEntry={true}
        value={password}
        numberOfLines={1}
        onChangeText={setPassword}
        autoCapitalize='none'
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Kirjaudu sisään</Text>
      </TouchableOpacity>


      <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
        <Text style={styles.link}>Takaisin etusivulle</Text>
      </TouchableOpacity>

    </View>
  );
}

