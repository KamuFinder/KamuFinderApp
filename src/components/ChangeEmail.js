import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
} from "firebase/auth";

export default function ChangeEmail() {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Käyttäjää ei löytynyt.");
      return;
    }

    if (!user.email) {
      alert("Nykyistä sähköpostia ei löytynyt.");
      return;
    }

    if (!newEmail || !currentPassword) {
      alert("Täytä uusi sähköposti ja nykyinen salasana.");
      return;
    }

    try {
      setLoading(true);

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail);

      setNewEmail("");
      setCurrentPassword("");

      alert("Vahvistusviesti lähetetty uuteen sähköpostiin.");
    } catch (error) {
      console.log("Virhe sähköpostin vaihdossa:", error.code, error.message);

      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        alert("Nykyinen salasana on väärä.");
      } else if (error.code === "auth/invalid-email") {
        alert("Sähköpostiosoite ei ole kelvollinen.");
      } else if (error.code === "auth/email-already-in-use") {
        alert("Sähköpostiosoite on jo käytössä.");
      } else if (error.code === "auth/requires-recent-login") {
        alert("Kirjaudu uudelleen ennen sähköpostin vaihtoa.");
      } else {
        alert("Sähköpostin vaihto epäonnistui.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        width: "100%",
        marginTop: 20,
        marginBottom: 30,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 20,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 15 }}>
        Vaihda sähköposti
      </Text>

      <Text style={{ marginBottom: 6 }}>Uusi sähköpostiosoite</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
        value={newEmail}
        onChangeText={setNewEmail}
        placeholder="Uusi sähköposti"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={{ marginBottom: 6 }}>Nykyinen salasana</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
        }}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Nykyinen salasana"
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleChangeEmail}
        disabled={loading}
        style={{
            width: "75%",
            alignSelf: "center",
            backgroundColor: "#F99D11",
            padding: 15,
            borderRadius: 30,
            alignItems: "center",
            marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {loading ? "Lähetetään..." : "Vaihda sähköposti"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}