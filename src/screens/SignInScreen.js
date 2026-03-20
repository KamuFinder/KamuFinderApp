import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert,Image,
  Pressable,ScrollView, KeyboardAvoidingView,Platform,TouchableWithoutFeedback,Keyboard
 } from "react-native";
 import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from '../firebase/config.js';
import styles from "../styles/SignIn_And_Up.js";
import { Ionicons } from "@expo/vector-icons";


export default function SignInScreen({ setLogged }) {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
     
      })
      .catch((error) => {
        Alert.alert("Virhe", "Sähköposti tai salasana on väärin");
        console.log(error);
      });
  };

  return (
    //<SafeAreaView style={{flex:1,alignItems:'center',justifyContent:'flex-start', backgroundColor:'#fff', padding:10,}}>
      <KeyboardAvoidingView
      style={{flex:1}}
      behavior={Platform.OS === "ios" ? "padding" : 'height'}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <ScrollView contentContainerStyle={{
          flexGrow:1, alignItems:'center',padding:10}}
          keyboardShouldPersistTaps="handled"
          >
      <View style={{justifyContent: "flex-start", alignItems: "center"}}>
        <Image source={require("../../assets/Logo.png")} style={{ width: 120, height: 120, }} />
      </View>
     
      <Text style={{fontWeight: "700", fontFamily:'Roboto',color: '#FB7318',textAlign:'center', fontSize: 48}}>
        KamuFinder
      </Text>

      <Text style={{fontSize: 16, textAlign: "center", fontWeight:'500', color: "#555",
        marginBottom: 40, marginTop: 16, fontFamily:'monospace'}}>
        Kirjaudu sisään tai luo uusi käyttäjä
      </Text>

     <View style={{width:"80%", marginBottom:20}}>
      
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
        style={{ flex: 1, color: "black", paddingVertical: 15}}
        placeholder="Syötä sähköposti"
        value={email}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      </View>
        </View>

      <View style={{width:"80%", marginBottom:20}}>  

      <Text style={{alignSelf: 'flex-start', fontSize: 16, fontWeight: '400', marginBottom:8}}>Salasana:</Text>
      
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
        style={{flex: 1, color: "black", paddingVertical: 15}}
        placeholder="Syötä salasana"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
      />
      </View>
      </View>

      <View style={{alignItems:'center', marginBottom:20,flexDirection:'row'}}>

        <Text style={{color:'#000000',fontSize: 14, textAlign:'center',}}
        >
          Eikö sinulla ole vielä tiliä? Rekisteröidy</Text>
      <Pressable
              
              onPress={() => navigation.navigate("SignUp")}
              android_ripple={{color:'#FB731830'}}
              style={({pressed}) =>({
                opacity: pressed ? 0.5 : 1,

              })}
                
            >
              <Text style={{color:'#FB7318', fontWeight: 'bold', textDecorationLine: 'underline'  

              }}> täältä</Text>
            </Pressable>

      </View>
        
        <View style={{width:"80%", marginBottom:20, marginTop:10, alignItems:'center'}}>
      <TouchableOpacity style={{width:'80%',backgroundColor: '#F99D11', padding: 15, 
        borderRadius: 20, alignItems:'center'  }} onPress={handleSignIn}>
        <Text style={{color:'white',textAlign:'center', fontSize: 16, fontWeight: 'bold'}}>Kirjaudu sisään</Text>
      </TouchableOpacity>
      </View>
      </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    //</SafeAreaView>
    
  );
}