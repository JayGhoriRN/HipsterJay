import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function LocationSearchScreen() {
  const router = useRouter();
  const {
    type,
    startPoint: prevStart,
    endPoint: prevEnd,
  } = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      fetchLocations();
    } else {
      setResults([]);
      setError(null);
    }
  }, [searchQuery]);

  const fetchLocations = async () => {
    try {
      const response = await fetch(
        `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${searchQuery}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
      );
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
      } else {
        setResults([]);
        setError("No results found.");
      }
    } catch (err) {
      setError("Failed to fetch locations. Please try again.");
    }
  };

  const handleSelect = (location) => {
    const { LATITUDE, LONGITUDE, ADDRESS } = location;
    const selectedPoint = JSON.stringify({
      latitude: LATITUDE,
      longitude: LONGITUDE,
      address: ADDRESS,
    });

    // Construct new params with preserved values
    const updatedParams = {
      startPoint: type === "start" ? selectedPoint : prevStart || "",
      endPoint: type === "end" ? selectedPoint : prevEnd || "",
    };
    console.log(
      "starttpoin",
      type === "start" ? selectedPoint : prevStart || ""
    );
    console.log("endpointss", type === "end" ? selectedPoint : prevEnd || "");

    router.replace({
      pathname: "/routeInput",
      params: updatedParams,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Search Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Type a location..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={results}
        keyExtractor={(item) => item.ADDRESS}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.resultText}>{item.ADDRESS}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  resultText: {
    fontSize: 16,
  },
});
