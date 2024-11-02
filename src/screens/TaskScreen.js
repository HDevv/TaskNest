import React, { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { firestore, storage, auth } from "../utils/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import styles from "../styles/globalStyle";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  FadeInUp,
} from "react-native-reanimated";
import BouncyButton from "../components/atoms/BouncyButton";

export default function TaskScreen({ route }) {
  const { projectId, columnId } = route.params;
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const colorTransition = useSharedValue(0);

  // Animation de transition de couleurs
  useEffect(() => {
    const interval = setInterval(() => {
      colorTransition.value = withTiming(colorTransition.value === 0 ? 1 : 0, {
        duration: 6000,
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const animatedGradientStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorTransition.value,
      [0, 1],
      ["#FBAB7E", "#F7CE68"]
    ),
  }));

  useFocusEffect(
    useCallback(() => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erreur", "Utilisateur non authentifié");
        return;
      }

      const tasksCollectionRef = collection(
        firestore,
        `projects/${projectId}/columns/${columnId}/tasks`
      );
      const userTasksQuery = query(
        tasksCollectionRef,
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(userTasksQuery, (snapshot) => {
        setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      return () => unsubscribe();
    }, [columnId])
  );

  const pickImageForTask = async (taskId) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const imageUrl = await uploadImage(uri, taskId);

      if (imageUrl) {
        const taskRef = doc(
          firestore,
          `projects/${projectId}/columns/${columnId}/tasks`,
          taskId
        );
        await updateDoc(taskRef, { imageUrl });
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, imageUrl } : task
          )
        );
        Alert.alert("Succès", "Image ajoutée à la tâche avec succès.");
      }
    }
  };

  const uploadImage = async (uri, taskId) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const imageRef = ref(storage, `tasks/${taskId}/${Date.now()}.jpg`);
      await uploadBytes(imageRef, blob);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image :", error);
      return null;
    }
  };

  const deleteTaskImage = async (taskId, imageUrl) => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);

      const taskRef = doc(
        firestore,
        `projects/${projectId}/columns/${columnId}/tasks`,
        taskId
      );
      await updateDoc(taskRef, { imageUrl: null });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, imageUrl: null } : task
        )
      );

      Alert.alert("Succès", "Image supprimée de la tâche avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image :", error);
      Alert.alert("Erreur", "Impossible de supprimer l'image.");
    }
  };

  const handleTaskAction = async () => {
    if (newTaskName.trim() === "") {
      Alert.alert("Erreur", "Le nom de la tâche ne peut pas être vide.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erreur", "Utilisateur non authentifié");
        return;
      }

      const tasksCollectionRef = collection(
        firestore,
        `projects/${projectId}/columns/${columnId}/tasks`
      );

      const taskRef = editingTask
        ? doc(tasksCollectionRef, editingTask)
        : await addDoc(tasksCollectionRef, {
            name: newTaskName,
            userId: user.uid,
            imageUrl: null,
          });

      if (imageUri) {
        const imageUrl = await uploadImage(imageUri, taskRef.id);
        if (imageUrl) {
          await updateDoc(taskRef, { imageUrl });
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === taskRef.id ? { ...task, imageUrl } : task
            )
          );
        }
        setImageUri(null);
      }

      setNewTaskName("");
      setEditingTask(null);
      Alert.alert(
        "Succès",
        editingTask
          ? "Tâche modifiée avec succès !"
          : "Tâche ajoutée avec succès !"
      );
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout/la modification de la tâche :",
        error
      );
      Alert.alert("Erreur", "Impossible de compléter l'action sur la tâche.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Animated.View
          style={[styles.projectsContainer, animatedGradientStyle]}
        >
          <Text style={styles.title}>Vos tâches</Text>

          <View style={{ flex: 1 }}>
            {tasks.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(index * 1000)} // effet d'apparition
                style={styles.taskCard}
              >
                <Text style={styles.taskName}>{item.name}</Text>
                {item.imageUrl && (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.taskImage}
                  />
                )}
                <View style={styles.buttonsContainer}>
                  <BouncyButton
                    onPress={() => setEditingTask(item.id)}
                    style={styles.editButton}
                  >
                    <FontAwesome name="edit" size={20} color="#3B3030" />
                    <Text style={styles.buttonText}>Modifier</Text>
                  </BouncyButton>
                  <BouncyButton
                    onPress={() => deleteTask(item.id)}
                    style={styles.deleteButtonTasks}
                  >
                    <FontAwesome name="trash" size={20} color="#3B3030" />
                    <Text style={styles.buttonText}>Supprimer</Text>
                  </BouncyButton>
                  <BouncyButton
                    onPress={() => pickImageForTask(item.id)}
                    style={styles.imageButton}
                  >
                    <Text style={styles.buttonTextImg}>
                      <FontAwesome name="paperclip" size={20} color="#3B3030" />
                      Ajouter/modifier l'image
                    </Text>
                  </BouncyButton>
                  {item.imageUrl && (
                    <BouncyButton
                      onPress={() => deleteTaskImage(item.id, item.imageUrl)}
                      style={styles.imageButton}
                    >
                      <Text style={styles.buttonTextImg}>
                        <FontAwesome name="times" size={20} color="#3B3030" />
                        Supprimer l'image
                      </Text>
                    </BouncyButton>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>

          <TextInput
            placeholder="Nom de la nouvelle tâche"
            value={newTaskName}
            onChangeText={setNewTaskName}
            style={styles.input}
          />
          <BouncyButton onPress={handleTaskAction} style={styles.fullButton}>
            <LinearGradient
              colors={["#85FFBD", "#FFFB7D"]}
              start={[0, 1]}
              end={[0, 0]}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>
                {editingTask ? "Mettre à jour" : "Ajouter"}
              </Text>
            </LinearGradient>
          </BouncyButton>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
