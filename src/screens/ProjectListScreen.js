import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { firestore, auth } from "../utils/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "react-native-vector-icons";
import BouncyButton from "../components/atoms/BouncyButton";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  FadeInUp,
} from "react-native-reanimated";
import styles from "../styles/globalStyle";

export default function ProjectListScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState("");
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Animation de transition de couleurs pour l'arrière-plan
  const colorTransition = useSharedValue(0);
  useEffect(() => {
    const interval = setInterval(() => {
      colorTransition.value = withTiming(colorTransition.value === 0 ? 1 : 0, {
        duration: 6000,
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const animatedGradientStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorTransition.value,
      [0, 1],
      ["#FBAB7E", "#F7CE68"]
    );
    return { backgroundColor };
  });

  // Charger les projets pour l'utilisateur authentifié
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erreur", "Utilisateur non authentifié");
      return;
    }

    const userProjectsQuery = query(
      collection(firestore, "projects"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(userProjectsQuery, (snapshot) => {
      setProjects(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, []);

  const addProject = async () => {
    if (newProject.trim() === "") {
      Alert.alert("Erreur", "Le nom du projet ne peut pas être vide.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erreur", "Utilisateur non authentifié");
        return;
      }

      await addDoc(collection(firestore, "projects"), {
        name: newProject,
        userId: user.uid,
      });

      setNewProject("");
      Alert.alert("Succès", "Projet ajouté avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet :", error);
      Alert.alert("Erreur", "Impossible d'ajouter le projet.");
    }
  };

  const editProject = async () => {
    if (newProject.trim() === "") {
      Alert.alert("Erreur", "Le nom du projet ne peut pas être vide.");
      return;
    }

    if (editingProjectId) {
      try {
        await updateDoc(doc(firestore, "projects", editingProjectId), {
          name: newProject,
        });
        setNewProject("");
        setEditingProjectId(null);
        Alert.alert("Succès", "Projet modifié avec succès !");
      } catch (error) {
        console.error("Erreur lors de la modification du projet :", error);
        Alert.alert("Erreur", "Impossible de modifier le projet.");
      }
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await deleteDoc(doc(firestore, "projects", projectId));
      Alert.alert("Succès", "Projet supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression du projet :", error);
      Alert.alert("Erreur", "Impossible de supprimer le projet.");
    }
  };

  const handleEditProject = (project) => {
    setNewProject(project.name);
    setEditingProjectId(project.id);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.View style={[styles.projectsContainer, animatedGradientStyle]}>
        <ScrollView>
          <Text style={styles.title}>Vos tableaux</Text>

          {projects.map((item, index) => (
            <Animated.View
              key={item.id}
              style={{ overflow: "hidden" }} // Conteneur extérieur pour l'animation
              entering={FadeInUp.delay(index * 100)} // effet d'apparition
            >
              <View style={styles.projectCard}>
                <Text style={styles.projectTitle}>{item.name}</Text>
                <View style={styles.buttonsContainer}>
                  <BouncyButton
                    onPress={() =>
                      navigation.navigate("Tableau", { projectId: item.id })
                    }
                    style={styles.viewButton}
                  >
                    <FontAwesome name="eye" size={20} color="#3B3030" />
                    <Text style={styles.buttonText}>Voir les colonnes</Text>
                  </BouncyButton>
                  <BouncyButton
                    onPress={() => handleEditProject(item)}
                    style={styles.editButton}
                  >
                    <FontAwesome name="edit" size={20} color="#3B3030" />
                  </BouncyButton>
                  <BouncyButton
                    onPress={() => deleteProject(item.id)}
                    style={styles.deleteButton}
                  >
                    <FontAwesome name="trash" size={20} color="#3B3030" />
                  </BouncyButton>
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
        <View style={{ padding: 20 }}>
          <TextInput
            style={styles.input}
            placeholder="Nom du projet"
            value={newProject}
            onChangeText={setNewProject}
          />
          <LinearGradient
            colors={["#85FFBD", "#FFFB7D"]}
            start={[0, 1]}
            end={[0, 0]}
            style={styles.gradientButton}
          >
            <BouncyButton
              onPress={editingProjectId ? editProject : addProject}
              style={styles.buttonContent}
            >
              <FontAwesome name="plus" size={20} color="#3B3030" />
              <Text style={styles.buttonText}>
                {editingProjectId ? "Modifier le projet" : "Ajouter un projet"}
              </Text>
            </BouncyButton>
          </LinearGradient>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
