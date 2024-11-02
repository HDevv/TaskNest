import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProjectStackNavigator from "./StackNavigator"; // Stack Navigator pour les projets
import AccountScreen from "../screens/AccountScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#1A1A1A", // Couleur de fond de la barre de navigation
          borderTopColor: "#333333", // Couleur de la bordure du haut
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#FBAB7E", // icônes et texte actifs
        tabBarInactiveTintColor: "#F7CE68", // icônes et texte inactifs
      }}
    >
      <Tab.Screen
        name="TaskNest"
        component={ProjectStackNavigator} // Remplacement par le Stack Navigator
        options={{ headerShown: false }} // Masquer l'en-tête du Stack Navigator dans l'onglet
      />
      <Tab.Screen name="Compte" component={AccountScreen} />
    </Tab.Navigator>
  );
}
