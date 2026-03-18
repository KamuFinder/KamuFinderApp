import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from '../firebase/config.js';
import styles from "../styles/SignIn_And_Up.js";

export default function SignInScreen({ setLogged }) {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        // Halutessasi voit päivittää login staten
        // setLogged(true);
      })
      .catch((error) => {
        Alert.alert("Virhe", "Sähköposti tai salasana on väärin");
        console.log(error);
      });
  };

  return (
    <View style={styles.container}>
      
      {/* 🔹 Welcome-osa */}
      <Text style={styles.title}>Tervetuloa 😊</Text>

      <Text style={styles.subtitle}>
        Kirjaudu sisään tai luo uusi käyttäjä
      </Text>

      {/* 🔹 Sign in form */}
      <Text style={styles.label}>Sähköposti:</Text>
      <TextInput
        style={styles.input}
        placeholder="Syötä sähköposti"
        value={email}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Salasana:</Text>
      <TextInput
        style={styles.input}
        placeholder="Syötä salasana"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Kirjaudu sisään</Text>
      </TouchableOpacity>

      {/* 🔹 Sign up nappi */}
      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.buttonText}>Luo käyttäjä</Text>
      </TouchableOpacity>

    </View>
  );
}