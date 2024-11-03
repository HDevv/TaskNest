import React, { useState } from "react";
import styles from "../styles/globalStyle";
import { View, TextInput, Text } from "react-native";
import { auth } from "../utils/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import BouncyButton from "../components/atoms/BouncyButton";

// messages d'erreur (tests)
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "L'adresse e-mail n'est pas valide.";
    case "auth/user-disabled":
      return "Ce compte utilisateur est désactivé.";
    case "auth/user-not-found":
      return "Aucun compte trouvé avec cet e-mail.";
    case "auth/wrong-password":
      return "Mot de passe incorrect.";
    case "auth/email-already-in-use":
      return "Cette adresse e-mail est déjà utilisée.";
    case "auth/weak-password":
      return "Le mot de passe est trop faible. Il doit comporter au moins 6 caractères.";
    default:
      return "Une erreur s'est produite. Veuillez réessayer.";
  }
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user.emailVerified) {
          setMessage("Connexion réussie !");
        } else {
          setError("Veuillez vérifier votre e-mail avant de vous connecter.");
        }
      })
      .catch((err) => {
        setError(getErrorMessage(err.code));
      });
  };

  const handleSignup = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        sendEmailVerification(user)
          .then(() => {
            setMessage(
              "Un e-mail de vérification a été envoyé. Veuillez vérifier votre boîte de réception."
            );
          })
          .catch((error) => {
            setError("Erreur lors de l'envoi de l'e-mail de vérification.");
          });
      })
      .catch((err) => {
        setError(getErrorMessage(err.code));
      });
  };

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.loginTitle}>Bienvenue sur TaskNest</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#999"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <BouncyButton onPress={handleLogin}>
        <LinearGradient
          colors={["#8BC6EC", "#9599E2"]}
          start={[0, 1]}
          end={[0, 0]}
          style={styles.gradientButtonLogin}
        >
          <Text style={styles.buttonText}>SE CONNECTER</Text>
        </LinearGradient>
      </BouncyButton>
      <BouncyButton onPress={handleSignup}>
        <LinearGradient
          colors={["#85FFBD", "#FFFB7D"]}
          start={[0, 1]}
          end={[0, 0]}
          style={styles.gradientButtonLogin}
        >
          <Text style={styles.buttonText}>S'INSCRIRE</Text>
        </LinearGradient>
      </BouncyButton>
    </View>
  );
}
