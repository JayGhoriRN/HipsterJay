import BottomSheet from "@/components/BottomSheet";
import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const verticalData = [
  { id: "1", title: "Card 1", description: "Detailed description for Card 1" },
  { id: "2", title: "Card 2", description: "Detailed description for Card 2" },
  { id: "3", title: "Card 3", description: "Detailed description for Card 3" },
  { id: "4", title: "Card 4", description: "Detailed description for Card 4" },
  { id: "5", title: "Card 5", description: "Detailed description for Card 5" },
  { id: "6", title: "Card 6", description: "Detailed description for Card 6" },
  { id: "7", title: "Card 7", description: "Detailed description for Card 7" },
  { id: "8", title: "Card 8", description: "Detailed description for Card 8" },
];

const horizontalData = [
  { id: "1", title: "Trending 1" },
  { id: "2", title: "Trending 2" },
  { id: "3", title: "Trending 3" },
  { id: "4", title: "Trending 4" },
  { id: "5", title: "Trending 5" },
  { id: "6", title: "Trending 6" },
  { id: "7", title: "Trending 7" },
];

export default function BottomSheetDemo() {
  const [selectedCard, setSelectedCard] = useState(null);

  const renderVerticalItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedCard(item)}>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderHorizontalItem = ({ item }) => (
    <View style={styles.horizontalCard}>
      <Text style={styles.horizontalCardTitle}>{item.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Vertical List */}
      <FlatList
        data={verticalData}
        keyExtractor={(item) => item.id}
        renderItem={renderVerticalItem}
        contentContainerStyle={styles.verticalList}
      />

      {/* Horizontal List */}
      <FlatList
        data={horizontalData}
        keyExtractor={(item) => item.id}
        renderItem={renderHorizontalItem}
        horizontal
        contentContainerStyle={styles.horizontalList}
      />

      {/* BottomSheet */}
      {selectedCard && (
        <BottomSheet onClose={() => setSelectedCard(null)}>
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>{selectedCard.title}</Text>
            <Text style={styles.bottomSheetDescription}>
              {selectedCard.description}
            </Text>
            <FlatList
              data={horizontalData}
              keyExtractor={(item) => item.id}
              renderItem={renderHorizontalItem}
              horizontal
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        </BottomSheet>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  verticalList: {
    padding: 20,
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
  },
  horizontalList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  horizontalCard: {
    backgroundColor: "#00796b",
    marginRight: 10,
    padding: 15,
    width: 120,
    height: 50,
  },
  horizontalCardTitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bottomSheetDescription: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
});
