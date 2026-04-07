import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidPassword = (password) => {
  // vähintään 8 merkkiä, iso kirjain, pieni kirjain ja numero
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

  const handleChangePassword = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Käyttäjää ei löytynyt.");
      return;
    }

    if (!user.email) {
      alert("Käyttäjän sähköpostia ei löytynyt.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Täytä kaikki salasanakentät.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Uudet salasanat eivät täsmää.");
      return;
    }

    if (!isValidPassword(newPassword)) {
      alert("Salasanan pitää olla vähintään 8 merkkiä pitkä ja sisältää iso kirjain, pieni kirjain ja numero.");
      return;
    }

    try {
      setLoading(true);

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      alert("Salasana vaihdettu onnistuneesti.");
    } catch (error) {
      console.log("Virhe salasanan vaihdossa:", error.code, error.message);

      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        alert("Nykyinen salasana on väärä.");
      } else if (error.code === "auth/weak-password") {
        alert("Uusi salasana on liian heikko.");
      } else if (error.code === "auth/requires-recent-login") {
        alert("Kirjaudu uudelleen ennen salasanan vaihtoa.");
      } else {
        alert("Salasanan vaihto epäonnistui.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        width: "100%",
        marginTop: 30,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 20,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 15 }}>
        Vaihda salasana
      </Text>

      <Text style={{ marginBottom: 6 }}>Nykyinen salasana</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Nykyinen salasana"
        secureTextEntry
      />

      <Text style={{ marginBottom: 6 }}>Uusi salasana</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Uusi salasana"
        secureTextEntry
      />

      <Text style={{ marginBottom: 6 }}>Vahvista uusi salasana</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
        }}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Vahvista uusi salasana"
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleChangePassword}
        disabled={loading}
        style={{
            width:"75%",
            alignSelf: "center",
          backgroundColor: "#F99D11",
          padding: 15,
          borderRadius: 30,
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {loading ? "Vaihdetaan..." : "Vaihda salasana"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}