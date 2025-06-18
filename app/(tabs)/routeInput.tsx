import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RouteInputScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);

  useEffect(() => {
    // Update startPoint or endPoint based on navigation parameters
    console.log("RouteInputScreen params:", params);
    if (params?.startPoint) {
      setStartPoint((prev) => prev || JSON.parse(params?.startPoint));
    }
    if (params?.endPoint) {
      setEndPoint((prev) => prev || JSON.parse(params?.endPoint));
    }
  }, [params]);

  const handleSearch = (type) => {
    router.push({
      pathname: "/locationSearch",
      params: {
        type,
        startPoint: JSON.stringify(startPoint),
        endPoint: JSON.stringify(endPoint),
      },
    });
  };

  const handleConfirm = () => {
    if (startPoint && endPoint) {
      router.push({
        pathname: "/routeMap",
        params: {
          startPoint: JSON.stringify(startPoint),
          endPoint: JSON.stringify(endPoint),
        },
      });
    } else {
      alert("Please fill both Start and End points.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Find Route</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => handleSearch("start")}>
          <TextInput
            style={styles.input}
            placeholder="Start Point"
            value={startPoint?.address || ""}
            editable={false}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSearch("end")}>
          <TextInput
            style={styles.input}
            placeholder="End Point"
            value={endPoint?.address || ""}
            editable={false}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>
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
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  confirmButton: {
    backgroundColor: "#00796b",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
