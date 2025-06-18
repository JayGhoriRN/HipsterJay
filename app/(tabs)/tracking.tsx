import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const BACKGROUND_TASK_NAME = "background-location-task";
const STORAGE_KEY = "tracked_route";

TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background location task error:", error);
    return;
  }

  if (data) {
    const { locations } = data;
    const savedRoute =
      JSON.parse(await AsyncStorage.getItem(STORAGE_KEY)) || [];
    const updatedRoute = [
      ...savedRoute,
      ...locations.map((loc) => ({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      })),
    ];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoute));
  }
});

export default function TrackingScreen() {
  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState([]);

  useEffect(() => {
    const initializeTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const bgStatus = await Location.requestBackgroundPermissionsAsync();

      if (status !== "granted" || bgStatus.status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      const savedRoute = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedRoute) {
        setRoute(JSON.parse(savedRoute));
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setLocation({ latitude, longitude });
          setRoute((prevRoute) => {
            const updatedRoute = [...prevRoute, { latitude, longitude }];
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoute));
            return updatedRoute;
          });
        }
      );

      await Location.startLocationUpdatesAsync(BACKGROUND_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 5,
        foregroundService: {
          notificationTitle: "Location Tracking",
          notificationBody: "Your route is being tracked in the background",
        },
      });
    };

    initializeTracking();

    return () => {
      Location.stopLocationUpdatesAsync(BACKGROUND_TASK_NAME);
    };
  }, []);

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker coordinate={location} />
      <Polyline coordinates={route} strokeWidth={5} strokeColor="blue" />
    </MapView>
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
  },
});
