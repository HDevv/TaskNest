import React from "react";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import ProjectListScreen from "../screens/ProjectListScreen";
import BoardScreen from "../screens/BoardScreen";
import TaskScreen from "../screens/TaskScreen";

const Stack = createStackNavigator();

export default function ProjectStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // Glissement horizontal
      }}
    >
      <Stack.Screen
        name="ProjectList"
        component={ProjectListScreen}
        options={{ title: "TASKNEST" }}
      />
      <Stack.Screen
        name="Board"
        component={BoardScreen}
        options={{ title: "Détails du Tableau" }}
      />
      <Stack.Screen
        name="TaskScreen"
        component={TaskScreen}
        options={{ title: "Tâches de la colonne" }}
      />
    </Stack.Navigator>
  );
}
