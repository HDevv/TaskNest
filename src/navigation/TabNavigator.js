import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProjectStackNavigator from "./StackNavigator";
import AccountScreen from "../screens/AccountScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#1A1A1A", // fond de la barre de navigation
          borderTopColor: "#333333", // bordure du haut
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#FBAB7E", // icônes et texte actifs
        tabBarInactiveTintColor: "#F7CE68", // icônes et texte inactifs
      }}
    >
      <Tab.Screen
        name="TaskNest"
        component={ProjectStackNavigator}
        options={{ headerShown: false }} // Masquer en-tête
      />
      <Tab.Screen name="Compte" component={AccountScreen} />
    </Tab.Navigator>
  );
}
