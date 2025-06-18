import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const BACKGROUND_TASK = "background-location-task";
const STORAGE_KEY = "tracked_route";

TaskManager.defineTask(BACKGROUND_TASK, async ({ data, error }) => {
  if (error) {
    console.error(error);
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

export async function startBackgroundLocation() {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status === "granted") {
    await Location.startLocationUpdatesAsync(BACKGROUND_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 5,
    });
  }
}

export async function stopBackgroundLocation() {
  await Location.stopLocationUpdatesAsync(BACKGROUND_TASK);
}
