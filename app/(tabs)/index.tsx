import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const tasks = [
  {
    id: "1",
    title: "React Native Task 1",
    description: "Offline Location Tracking & Route Drawing",
    details:
      "Continuously tracks the user's movement, draws the traveled path on a map in real time, and saves this route locally to persist across sessions—even without internet connectivity.",
    tab: "tracking",
  },
  {
    id: "2",
    title: "React Native Task 2",
    description: "Place Finder & Route Drawer",
    details:
      "To build a React Native application that allows users to search for a start and end location, fetch the driving route using the routing API, display route options, and visualize the selected route on a map with a clearly drawn path.",
    tab: "routeInput",
  },
  {
    id: "3",
    title: "React Native Task 3",
    description: "BottomSheet with Dynamic Height Based on Content",
    details:
      "Build a reusable BottomSheet component in React Native that dynamically adjusts its height based on the content it renders.",
    tab: "bottomSheetDemo",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleCardPress = (tab) => {
    router.push(`/${tab}`);
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCardPress(item.tab)}
    >
      <Text style={styles.cardTitle1}>**{item.tab}**</Text>
      <Text style={styles.cardTitle}>#{item.title}</Text>
      <Text style={styles.cardDescription}>-{item.description}</Text>
      <Text style={styles.cardDescription1}>-{item.details}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>Welcome to Hipster!</Text>
          <Text style={styles.subtitle}>Completed Tasks</Text>
        </View>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row", // Align logo and text horizontally
    alignItems: "center",
    padding: 20,
    backgroundColor: "#00796b",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  logo: {
    width: 80, // Adjusted size for better alignment
    height: 80,
    marginRight: 15, // Added spacing between logo and text
    resizeMode: "contain",
  },
  headerText: {
    flex: 1, // Ensures text takes up remaining space
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginTop: 5,
  },
  list: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardTitle1: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: "#555",
  },
});
