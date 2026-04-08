import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";

const avatarStyles = [
  { id: "1", label: "Geometric" },
  { id: "5", label: "Gradient Mesh" },
  { id: "8", label: "Abstract Blob" },
  { id: "9", label: "Watercolor" },
];

const generateSeed = () => {
  return `group-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

const getClassyProfileAvatarUrl = ({ seed, style, name = "Group", size = 120 }) => {
  if (!seed || !style) return null;

  const params = new URLSearchParams({
    email: seed,
    name,
    v: String(style),
    size: String(size),
  });

  return `https://classyprofile.com/api/avatar?${params.toString()}`;
};

export default function GroupAvatarPicker({
  avatarStyle,
  avatarSeed,
  setAvatarStyle,
  setAvatarSeed,
  groupName,
  size = 120,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempStyle, setTempStyle] = useState(avatarStyle || "1");
  const [tempSeed, setTempSeed] = useState(avatarSeed || "");

  const openModal = () => {
    setTempStyle(avatarStyle || "1");
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
    ? getClassyProfileAvatarUrl({
        seed: avatarSeed,
        style: avatarStyle || "1",
        name: groupName || "Group",
        size,
      })
    : null;

  const previewAvatarUrl = tempSeed
    ? getClassyProfileAvatarUrl({
        seed: tempSeed,
        style: tempStyle || "1",
        name: groupName || "Group",
        size: 120,
      })
    : null;

  return (
    <View style={{ width: "100%", alignItems: "center", marginBottom: 20 }}>
      <View style={{ position: "relative" }}>
        {currentAvatarUrl && (
            <View style={{ 
                width: size,
                height: size,
                borderRadius: 60,
                overflow: "hidden",
                marginBottom: 12,
             }}>

          <SvgUri uri={currentAvatarUrl} width={size} height={size} />
        </View>
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
              maxHeight: "85%",
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
              Valitse ryhmän kuva
            </Text>

            <View style={{ alignItems: "center", marginBottom: 20 }}>
              {previewAvatarUrl && (
                    <View style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        overflow: "hidden",
                    }}>
              
                <SvgUri uri={previewAvatarUrl} width={120} height={120} />
              </View>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ marginTop: 16, color: "#555", textAlign: "center" }}>
                Valitse tyyli ja paina "Valitse hahmo", niin saat uuden version.
                Hyväksy lopuksi painamalla "Valmis".
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: 16,
                }}
              >
                {avatarStyles.map((styleItem) => {
                  const previewAvatarUrl = getClassyProfileAvatarUrl({
                    seed: `style-preview-${styleItem.id}`,
                    style: styleItem.id,
                    name: styleItem.label,
                    size: 70,
                  });

                  const selected = tempStyle === styleItem.id;

                  return (
                    <TouchableOpacity
                      key={styleItem.id}
                      onPress={() => handleSelectStyle(styleItem.id)}
                      style={{
                        margin: 6,
                        padding: 6,
                        borderRadius: 14,
                        borderWidth: selected ? 2 : 0,
                        borderColor: "#F99D11",
                        backgroundColor: "#f5f5f5",
                        alignItems: "center",
                        width: 90,
                      }}
                    >
                        <View style={{
                            width: 70,
                            height: 70,
                            borderRadius: 35,
                            overflow: "hidden",
                        }}>

                      <SvgUri uri={previewAvatarUrl} width={70} height={70} />
                      </View>

                      <Text
                        style={{
                          fontSize: 11,
                          textAlign: "center",
                          marginTop: 6,
                        }}
                      >
                        {styleItem.label}
                      </Text>
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