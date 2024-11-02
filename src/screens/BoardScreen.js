import React, { useEffect, useState } from "react";
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
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import styles from "../styles/globalStyle";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "react-native-vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  FadeInUp,
} from "react-native-reanimated";
import BouncyButton from "../components/atoms/BouncyButton";

export default function BoardScreen({ route, navigation }) {
  const { projectId } = route.params;
  const [columns, setColumns] = useState([]);
  const [newColumnName, setNewColumnName] = useState("");
  const [editingColumn, setEditingColumn] = useState(null);

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

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erreur", "Utilisateur non authentifié");
      return;
    }

    const userColumnsQuery = query(
      collection(firestore, `projects/${projectId}/columns`),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(userColumnsQuery, (snapshot) => {
      setColumns(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [projectId]);

  const handleColumnAction = async () => {
    if (newColumnName.trim() === "") {
      Alert.alert("Erreur", "Le nom de la colonne ne peut pas être vide.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erreur", "Utilisateur non authentifié");
        return;
      }

      if (editingColumn) {
        const columnRef = doc(
          firestore,
          `projects/${projectId}/columns`,
          editingColumn
        );
        await updateDoc(columnRef, { name: newColumnName });
        setEditingColumn(null);
        Alert.alert("Succès", "Colonne modifiée avec succès !");
      } else {
        await addDoc(collection(firestore, `projects/${projectId}/columns`), {
          name: newColumnName,
          userId: user.uid,
        });
        Alert.alert("Succès", "Colonne ajoutée avec succès !");
      }

      setNewColumnName("");
    } catch (error) {
      console.error("Erreur lors de l'action sur la colonne :", error);
      Alert.alert("Erreur", "Impossible de compléter l'action sur la colonne.");
    }
  };

  const deleteColumn = async (columnId) => {
    try {
      await deleteDoc(
        doc(firestore, `projects/${projectId}/columns`, columnId)
      );
      Alert.alert("Succès", "Colonne supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de la colonne :", error);
      Alert.alert("Erreur", "Impossible de supprimer la colonne.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.View style={[styles.container, animatedGradientStyle]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Text style={styles.title}>Colonnes du projet</Text>

          {/* ScrollView horizontal pour les colonnes */}
          <ScrollView
            horizontal
            contentContainerStyle={styles.columnsContainer}
          >
            {columns.map((item, index) => (
              <Animated.View
                key={item.id}
                style={styles.columnCardWrapper}
                entering={FadeInUp.delay(index * 100)} // effet d'apparition
              >
                <View style={styles.columnCard}>
                  <Text style={styles.columnTitle}>{item.name}</Text>
                  <BouncyButton
                    onPress={() =>
                      navigation.navigate("TaskScreen", {
                        projectId: projectId,
                        columnId: item.id,
                      })
                    }
                    style={styles.viewButtonColumn}
                  >
                    <Text style={styles.buttonText}>Voir les tâches</Text>
                  </BouncyButton>
                  <BouncyButton
                    onPress={() => {
                      setEditingColumn(item.id);
                      setNewColumnName(item.name);
                    }}
                    style={styles.editButtonColumn}
                  >
                    <FontAwesome name="edit" size={20} color="#3B3030" />
                    <Text style={styles.buttonText}>Modifier</Text>
                  </BouncyButton>
                  <BouncyButton
                    onPress={() => deleteColumn(item.id)}
                    style={styles.deleteButton}
                  >
                    <FontAwesome name="trash" size={20} color="#3B3030" />
                    <Text style={styles.buttonText}>Supprimer</Text>
                  </BouncyButton>
                </View>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Ajouter un champ d'ajout de colonne en bas de l'écran */}
          <View style={{ padding: 20 }}>
            <TextInput
              placeholder="Nom de la nouvelle colonne"
              value={newColumnName}
              onChangeText={setNewColumnName}
              style={styles.input}
            />
            <BouncyButton
              onPress={handleColumnAction}
              style={styles.fullButton}
            >
              <LinearGradient
                colors={["#85FFBD", "#FFFB7D"]}
                start={[0, 1]}
                end={[0, 0]}
                style={styles.gradientButton}
              >
                <View style={styles.buttonContent}>
                  <FontAwesome
                    name="plus"
                    size={20}
                    color="#3B3030"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.buttonText}>
                    {editingColumn ? "Modifier" : "Ajouter"}
                  </Text>
                </View>
              </LinearGradient>
            </BouncyButton>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
