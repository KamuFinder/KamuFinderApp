import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AvatarPicker({
  avatarStyle,
  avatarSeed,
  setAvatarStyle,
  setAvatarSeed,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempStyle, setTempStyle] = useState(avatarStyle || "fun-emoji");
  const [tempSeed, setTempSeed] = useState(avatarSeed || "");

  const avatarStyles = [
    "fun-emoji",
    "adventurer",
    "adventurer-neutral",
    "avataaars",
    "avataaars-neutral",
    "lorelei",
    "lorelei-neutral",
    "personas",
  ];

  const generateSeed = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  };

  const openModal = () => {
    setTempStyle(avatarStyle || "fun-emoji");
    setTempSeed(avatarSeed || generateSeed());
    setModalVisible(true);
  };

  const handleSelectStyle = (style) => {
    setTempStyle(style);
    setTempSeed(generateSeed());
  };

  const handleRandomize = () => {
    setTempSeed(generateSeed());
  };

  const handleConfirm = () => {
    setAvatarStyle(tempStyle);
    setAvatarSeed(tempSeed);
    setModalVisible(false);
  };

  const currentAvatarUrl = avatarSeed
    ? `https://api.dicebear.com/9.x/${avatarStyle}/png?seed=${encodeURIComponent(avatarSeed)}`
    : null;

  const previewAvatarUrl = tempSeed
    ? `https://api.dicebear.com/9.x/${tempStyle}/png?seed=${encodeURIComponent(tempSeed)}`
    : null;

  return (
    <View style={{ width: "100%", alignItems: "center", marginBottom: 20 }}>
      <View style={{ position: "relative" }}>
        {currentAvatarUrl && (
          <Image
            source={{ uri: currentAvatarUrl }}
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />
        )}

        <TouchableOpacity
          onPress={openModal}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            backgroundColor: "#F99D11",
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "#fff",
          }}
        >
          <Ionicons name="pencil" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "85%",
              maxHeight: "80%",
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
              Valitse profiilikuva
            </Text>

            <View style={{ alignItems: "center", marginBottom: 20 }}>
              {previewAvatarUrl && (
                <Image
                  source={{ uri: previewAvatarUrl }}
                  style={{ width: 120, height: 120, borderRadius: 60 }}
                />
              )}

               
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ marginTop: 24, color: "#555", textAlign: "center" }}>
              Valitse hahmon tyyli ja paina "Valitse hahmo" -nappia, niin saat joka kerta uuden satunnaisen hahmon! Hyväksy valinta painamalla "Valmis" -nappia.
            </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {avatarStyles.map((style) => {
                  const previewUrl = `https://api.dicebear.com/9.x/${style}/png?seed=${style}`;
                  const selected = tempStyle === style;

                  return (
                    <TouchableOpacity
                      key={style}
                      onPress={() => handleSelectStyle(style)}
                      style={{
                        margin: 6,
                        padding: 6,
                        borderRadius: 14,
                        borderWidth: selected ? 2 : 0,
                        borderColor: "#F99D11",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <Image
                        source={{ uri: previewUrl }}
                        style={{ width: 60, height: 60, borderRadius: 30 }}
                      />
                    </TouchableOpacity>
                    
                  );
                })}
              </View>
            </ScrollView>


            <TouchableOpacity
              onPress={handleRandomize}
              style={{
                backgroundColor: "#333",
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Valitse hahmo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                backgroundColor: "#F99D11",
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Valmis
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}