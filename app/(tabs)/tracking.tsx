import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const BACKGROUND_TASK_NAME = "background-location-task";
const STORAGE_KEY = "tracked_route";
const LOCATION_TRACKING_CONFIG = {
  accuracy: Location.Accuracy.High,
  timeInterval: 1000,
  distanceInterval: 5,
};

// Define background task
TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background location task error:", error);
    return;
  }

  if (data?.locations) {
    try {
      const savedRoute =
        JSON.parse(await AsyncStorage.getItem(STORAGE_KEY)) || [];
      const newLocations = data.locations.map((loc) => ({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        timestamp: loc.timestamp,
      }));

      const updatedRoute = [...savedRoute, ...newLocations];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoute));
    } catch (e) {
      console.error("Error saving background locations:", e);
    }
  }
});

const PermissionDeniedScreen = ({ onRequestAgain }) => (
  <View style={styles.container}>
    <Text style={styles.errorText}>
      Location permission is required for this feature.
    </Text>
    <Text style={styles.errorText}>
      Please enable it in your device settings.
    </Text>
    <TouchableOpacity style={styles.button} onPress={onRequestAgain}>
      <Text style={styles.buttonText}>Request Permissions Again</Text>
    </TouchableOpacity>
  </View>
);

const LoadingScreen = () => (
  <View style={styles.container}>
    <Text style={styles.loadingText}>Initializing location tracking...</Text>
  </View>
);

const RouteInfoModal = ({ visible, onClose, route }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Route Information</Text>
        <Text style={styles.modalText}>Total points: {route.length}</Text>
        {route.length > 0 && (
          <>
            <Text style={styles.modalText}>
              Start time: {new Date(route[0].timestamp).toLocaleString()}
            </Text>
            <Text style={styles.modalText}>
              Last update:{" "}
              {new Date(route[route.length - 1].timestamp).toLocaleString()}
            </Text>
          </>
        )}
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function TrackingScreen() {
  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [mapType, setMapType] = useState("standard");

  const loadSavedRoute = useCallback(async () => {
    try {
      const savedRoute = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedRoute) {
        setRoute(JSON.parse(savedRoute));
      }
    } catch (e) {
      console.error("Failed to load saved route:", e);
    }
  }, []);

  const clearRoute = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setRoute([]);
      Alert.alert("Success", "Route history has been cleared");
    } catch (e) {
      console.error("Failed to clear route:", e);
      Alert.alert("Error", "Failed to clear route history");
    }
  };

  const requestPermissions = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const bgStatus = await Location.requestBackgroundPermissionsAsync();
      setPermissionStatus(status);
      return { status, bgStatus };
    } catch (error) {
      console.error("Permission request error:", error);
      return { status: "denied", bgStatus: { status: "denied" } };
    }
  }, []);

  const startTracking = useCallback(async () => {
    try {
      const { status, bgStatus } = await requestPermissions();

      if (status !== "granted" || bgStatus.status !== "granted") {
        return false;
      }

      await loadSavedRoute();

      // Start foreground tracking
      const foregroundSubscriber = await Location.watchPositionAsync(
        LOCATION_TRACKING_CONFIG,
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setLocation({ latitude, longitude });
          setRoute((prevRoute) => {
            const updatedRoute = [
              ...prevRoute,
              { latitude, longitude, timestamp: Date.now() },
            ];
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoute));
            return updatedRoute;
          });
        }
      );

      // Start background tracking
      await Location.startLocationUpdatesAsync(BACKGROUND_TASK_NAME, {
        ...LOCATION_TRACKING_CONFIG,
        foregroundService: {
          notificationTitle: "Location Tracking",
          notificationBody: "Your route is being tracked in the background",
          notificationColor: "#0000ff",
        },
        showsBackgroundLocationIndicator: true,
        deferredUpdatesInterval: 5000,
        deferredUpdatesDistance: 10,
      });

      setIsTracking(true);
      return foregroundSubscriber;
    } catch (error) {
      console.error("Error starting tracking:", error);
      Alert.alert("Error", "Failed to start location tracking");
      return null;
    }
  }, [loadSavedRoute, requestPermissions]);

  useEffect(() => {
    let foregroundSubscriber = null;

    const initTracking = async () => {
      foregroundSubscriber = await startTracking();
    };

    initTracking();

    return () => {
      if (foregroundSubscriber?.remove) {
        foregroundSubscriber.remove();
      }
      Location.stopLocationUpdatesAsync(BACKGROUND_TASK_NAME);
    };
  }, [startTracking]);

  const toggleMapType = () => {
    setMapType((prev) => (prev === "standard" ? "satellite" : "standard"));
  };

  if (permissionStatus === "denied") {
    return <PermissionDeniedScreen onRequestAgain={requestPermissions} />;
  }

  if (!location) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        mapType={mapType}
      >
        <Polyline
          coordinates={route}
          strokeWidth={5}
          strokeColor="#1a73e8"
          strokeColors={["#1a73e8"]}
          lineDashPattern={[0]}
        />
        {route.length > 0 && (
          <>
            <Marker
              coordinate={route[0]}
              title="Start Point"
              pinColor="green"
            />
            <Marker
              coordinate={route[route.length - 1]}
              title="Current Position"
            />
          </>
        )}
      </MapView>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowRouteInfo(true)}
        >
          <Text style={styles.controlButtonText}>Route Info</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
          <Text style={styles.controlButtonText}>
            {mapType === "standard" ? "Satellite" : "Standard"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.clearButton]}
          onPress={clearRoute}
        >
          <Text style={styles.controlButtonText}>Clear Route</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {isTracking ? "🟢 Tracking active" : "🔴 Tracking paused"}
        </Text>
        <Text style={styles.statusText}>Points: {route.length}</Text>
      </View>

      <RouteInfoModal
        visible={showRouteInfo}
        onClose={() => setShowRouteInfo(false)}
        route={route}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  statusBar: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    padding: 10,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
  },
  button: {
    backgroundColor: "#1a73e8",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  controlsContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "column",
  },
  controlButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  clearButton: {
    backgroundColor: "rgba(255, 50, 50, 0.9)",
  },
  controlButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
});
