import React from "react";
import { View, Text } from "react-native";
import { auth } from "../utils/firebase";
import styles from "../styles/globalStyle";
import { FontAwesome } from "@expo/vector-icons";
import BouncyButton from "../components/atoms/BouncyButton";

export default function AccountScreen({ navigation }) {
  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        // Rediriger vers l'écran de connexion
        navigation.replace("LoginScreen");
      })
      .catch((error) => {
        console.error("Erreur de déconnexion :", error);
      });
  };

  return (
    <View style={styles.userContainer}>
      {/* Icône de profil */}
      <View style={styles.profileIconContainer}>
        <FontAwesome name="user-circle" size={100} color="#9599E2" />
      </View>

      <Text style={styles.userTitle}>Mon Compte</Text>

      <View style={styles.userInfo}>
        <Text style={styles.userInfoText}>
          Nom d'utilisateur : {auth.currentUser?.email || "Utilisateur"}
        </Text>
      </View>

      <BouncyButton style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.userButtonText}>Se déconnecter</Text>
      </BouncyButton>
    </View>
  );
}
