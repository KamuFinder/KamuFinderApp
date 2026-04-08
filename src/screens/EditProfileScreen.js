import React, { useState,useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, 
  ScrollView} from "react-native";  
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext.js";
import {firestore,USERS,doc,getDoc,updateDoc} from "../firebase/config.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import styles from "../styles/EditProfile.js";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CityAutocomplete from "../components/CityAutocomplete.js";
import AvatarPicker from "../components/AvatarPicker.js";
import ChangeEmail from "../components/ChangeEmail.js";
import ChangePassword from "../components/ChangePassword.js";
import Divider from "../components/Divider.js";
import { Options } from "../components/Options.js";

export default function EditProfileScreen() {

        const insets = useSafeAreaInsets();
        const user = useUser();
        const [hobbyModalVisible, setHobbyModalVisible] = useState(false);
        const [studyModalVisible, setStudyModalVisible] = useState(false);
        const [loading, setLoading] = useState(false);
        const [originalNickName, setOriginalNickName] = useState("");
        

        const [userInfo, setUserInfo] = useState({
            firstName: "",
            lastName: "",
            nickName: "",
            city: "",
            profile_text: "",
            hobby_interests: [],
            study_interests: [],
            avatarSeed: "",
            avatarStyle: "fun-emoji",
            });;
        

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
                hobby_interests: snap.data().hobby_interests || [],
                study_interests: snap.data().study_interests || [],
                avatarSeed: snap.data().avatarSeed || generateAvatarSeed(),
                avatarStyle: snap.data().avatarStyle === "fun emoji"
                    ? "fun-emoji"
                    : (snap.data().avatarStyle || "fun-emoji"),
                });
                 setOriginalNickName(snap.data().nickName || ""); // Tallennetaan alkuperäinen käyttäjätunnus vertailua varten
            }
            };

            fetchUserData();
        }, [user]);

        const handleSaveChanges = async () => {
            try {
                if (!user) return;

                setLoading(true);

                const trimmedNickName = userInfo.nickName.trim();

                    if (!trimmedNickName) {
                        alert("Käyttäjänimi ei voi olla tyhjä");
                        return;
                    }

                    // Tarkistetaan uniikkius vain jos nickname on muuttunut
                    if (trimmedNickName !== originalNickName.trim()) {
                        const usersRef = collection(firestore, USERS);
                        const q = query(usersRef, where("nickName", "==", trimmedNickName));
                        const querySnapshot = await getDocs(q);

                        const nicknameTaken = querySnapshot.docs.some(
                            (docSnap) => docSnap.id !== user.uid
                        );

                        if (nicknameTaken) {
                            alert("Tämä käyttäjänimi on jo käytössä");
                            return;
                        }
                    }

                const userRef = doc(firestore, USERS, user.uid);

                await updateDoc(userRef, {
                nickName: trimmedNickName,
                city: userInfo.city,
                profile_text: userInfo.profile_text,
                hobby_interests: userInfo.hobby_interests,
                study_interests: userInfo.study_interests,
                avatarSeed: userInfo.avatarSeed,
                avatarStyle: userInfo.avatarStyle,
                });

                setOriginalNickName(trimmedNickName); // Päivitetään alkuperäinen nickname tallennuksen jälkeen vertailua varten  
                alert("Muutokset tallennettu");
            } catch (error) {
                console.log("Virhe profiilin päivittämisessä:", error.message);
                alert("Muutosten tallennus epäonnistui");
            }
            finally {
                setLoading(false);
            }
        };

            const toggleHobby = (hobby) => {
                setUserInfo((prev) => {
                    const alreadySelected = prev.hobby_interests.includes(hobby);

                    return {
                    ...prev,
                    hobby_interests: alreadySelected
                        ? prev.hobby_interests.filter((item) => item !== hobby)
                        : [...prev.hobby_interests, hobby],
                    };
                });
                };

            const toggleStudy = (study) => {
                setUserInfo((prev) => {
                    const alreadySelected = prev.study_interests.includes(study);

                    return {
                    ...prev,
                    study_interests: alreadySelected
                        ? prev.study_interests.filter((item) => item !== study)
                        : [...prev.study_interests, study],
                    };
                });
                };
    
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
            <AvatarPicker
              avatarStyle={userInfo.avatarStyle}
              avatarSeed={userInfo.avatarSeed}
              setAvatarStyle={(style) =>
                setUserInfo((prev) => ({ ...prev, avatarStyle: style }))
              }
              setAvatarSeed={(seed) =>
                setUserInfo((prev) => ({ ...prev, avatarSeed: seed }))
              }
            />
        </View>

        <View style={styles.inputContainer}>
            <Text style={styles.label}>Uusi käyttäjätunnus</Text>
            <TextInput 
            style={styles.input} 
            value={userInfo.nickName}
            onChangeText={(text) => setUserInfo({...userInfo, nickName: text})}
            placeholder="Uusi käyttäjätunnus"
            />
            

            <Text style={styles.label}>Uusi kuvaus</Text>
            <TextInput 
            style={styles.input} 
            value={userInfo.profile_text}
            onChangeText={(text) => setUserInfo({...userInfo, profile_text: text})}
            placeholder="Uusi kuvaus"
            />
       
            <Text style={styles.label}>Uusi paikkakunta</Text>
            <CityAutocomplete 
            style={styles.input} 
            value={userInfo.city}
            onChange={(text) => setUserInfo((prev) => ({...prev, city: text}))}
            placeholder="Uusi paikkakunta"
            />

            <Text style={styles.label}>Harrastukset</Text>
            <View style={styles.input} >
                <Text>
                    {userInfo.hobby_interests.length > 0
                    ? userInfo.hobby_interests.join(", ")
                    : "Ei asetettu"}
                </Text>
            </View>

            <TouchableOpacity onPress={() => setHobbyModalVisible(true)}>
                <Text style={{ color: "#007BFF", marginTop: 10 }}>+ Lisää harrastuksia</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Opiskelu</Text>
            <View style={styles.input} >
                <Text>
                    {userInfo.study_interests.length > 0
                    ? userInfo.study_interests.join(", ")
                    : "Ei asetettu"}
                </Text>
            </View>

            <TouchableOpacity onPress={() => setStudyModalVisible(true)}>
                <Text style={{ color: "#007BFF", marginTop: 10 }}>+ Lisää koulutus</Text>
            </TouchableOpacity>
        </View>

        

        <TouchableOpacity 
        style={{ 
            backgroundColor: "#F99D11", 
            opacity: loading ? 0.7 : 1,
            padding: 15, 
            borderRadius: 30, 
            marginTop: 20, 
            width: "60%", 
            alignItems: "center",
            
        }}
            onPress={handleSaveChanges}
            disabled={loading}
        >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  {loading ? "Tallennetaan..." : "Hyväksy muutokset"}
                </Text>
            </TouchableOpacity>
    </View>

    

    <View style={{ marginTop: 40, alignSelf: "left", paddingHorizontal: 20  }}>
        <Divider style={{ }} />
        <ChangeEmail />
        <Divider style={{ }} />
        <ChangePassword />
    </View>
    
   </KeyboardAwareScrollView>

   <Modal visible={hobbyModalVisible}
        transparent={true}
        animationType="slide"
        >
        <View style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
        }}>

            <View style={{
                width: "80%",
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 20,
            }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>Valitse harrastukset</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
              {Options.hobbyOptions.map((hobby) => {
                const selected = userInfo.hobby_interests.includes(hobby);

                return (
                  <TouchableOpacity
                    key={hobby}
                    onPress={() => toggleHobby(hobby)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 15,
                      borderRadius: 12,
                      marginBottom: 10,
                      backgroundColor: selected ? "#F99D11" : "#f1f1f1",
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? "#fff" : "#333",
                        fontSize: 16,
                        fontWeight: "500",
                      }}
                    >
                      {selected ? "✓ " : ""}{hobby}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setHobbyModalVisible(false)}
              style={{
                marginTop: 15,
                backgroundColor: "#333",
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Valmis
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </Modal>

        <Modal visible={studyModalVisible}
        transparent={true}
        animationType="slide"
        >
        <View style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
        }}>

            <View style={{
                width: "80%",
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 20,
            }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>Valitse koulutus</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
              {Options.studyOptions.map((study) => {
                const selected = userInfo.study_interests.includes(study);

                return (
                  <TouchableOpacity
                    key={study}
                    onPress={() => toggleStudy(study)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 15,
                      borderRadius: 12,
                      marginBottom: 10,
                      backgroundColor: selected ? "#F99D11" : "#f1f1f1",
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? "#fff" : "#333",
                        fontSize: 16,
                        fontWeight: "500",
                      }}
                    >
                      {selected ? "✓ " : ""}{study}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setStudyModalVisible(false)}
              style={{
                marginTop: 15,
                backgroundColor: "#333",
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Valmis
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </Modal>
    </SafeAreaView>
);
}

