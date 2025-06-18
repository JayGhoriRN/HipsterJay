import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { createContext, useContext, useState } from "react";
import { createNewRoute, saveLocation } from "../utils/database";

const LOCATION_TASK_NAME = "background-location-task";

type LocationContextType = {
  isTracking: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  currentLocation: { latitude: number; longitude: number } | null;
  pathCoordinates: { latitude: number; longitude: number }[];
  currentRouteId: string | null;
};

const LocationContext = createContext<LocationContextType>({
  isTracking: false,
  startTracking: async () => {},
  stopTracking: async () => {},
  currentLocation: null,
  pathCoordinates: [],
  currentRouteId: null,
});

export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [pathCoordinates, setPathCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [currentRouteId, setCurrentRouteId] = useState<string | null>(null);

  // Define the background task
  TaskManager.defineTask(
    LOCATION_TASK_NAME,
    async ({ data: { locations }, error }) => {
      if (error) {
        console.error("Background location task error:", error);
        return;
      }

      const [location] = locations;
      const { latitude, longitude } = location.coords;

      const routeId = await AsyncStorage.getItem("currentRouteId");

      if (routeId) {
        saveLocation(latitude, longitude, routeId);
        setCurrentLocation({ latitude, longitude });
        setPathCoordinates((prev) => [...prev, { latitude, longitude }]);
      }
    }
  );

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const bgStatus = await Location.requestBackgroundPermissionsAsync();

    if (status !== "granted" || bgStatus.status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    const routeId = Date.now().toString();
    setCurrentRouteId(routeId);
    await AsyncStorage.setItem("currentRouteId", routeId);
    createNewRoute(routeId, `Route ${new Date().toLocaleString()}`);
    setIsTracking(true);

    // Start foreground tracking
    const location = await Location.getCurrentPositionAsync({});
    setCurrentLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setPathCoordinates([
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    ]);

    // Start background tracking
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Location Tracking",
        notificationBody: "Your route is being tracked in the background",
        notificationColor: "#0000ff",
      },
    });
  };

  const stopTracking = async () => {
    setIsTracking(false);
    setCurrentRouteId(null);
    await AsyncStorage.removeItem("currentRouteId");
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  };

  return (
    <LocationContext.Provider
      value={{
        isTracking,
        startTracking,
        stopTracking,
        currentLocation,
        pathCoordinates,
        currentRouteId,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
