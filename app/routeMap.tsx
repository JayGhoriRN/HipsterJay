import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import MapView, { Polyline } from "react-native-maps";

export default function RouteMapScreen() {
  const { startPoint, endPoint } = useLocalSearchParams();
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!startPoint || !endPoint) {
      setError("Start and End points are required.");
      return;
    }

    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `http://router.project-osrm.org/route/v1/driving/${
            JSON.parse(startPoint).longitude
          },${JSON.parse(startPoint).latitude};${
            JSON.parse(endPoint).longitude
          },${JSON.parse(endPoint).latitude}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => ({
              latitude: lat,
              longitude: lng,
            })
          );
          setRouteCoordinates(coordinates);

          // Calculate the bounding box for the route
          const latitudes = coordinates.map((coord) => coord.latitude);
          const longitudes = coordinates.map((coord) => coord.longitude);
          const minLatitude = Math.min(...latitudes);
          const maxLatitude = Math.max(...latitudes);
          const minLongitude = Math.min(...longitudes);
          const maxLongitude = Math.max(...longitudes);

          // Set the map region to fit the route
          setMapRegion({
            latitude: (minLatitude + maxLatitude) / 2,
            longitude: (minLongitude + maxLongitude) / 2,
            latitudeDelta: maxLatitude - minLatitude + 0.05,
            longitudeDelta: maxLongitude - minLongitude + 0.05,
          });
        } else {
          setError("No route found.");
        }
      } catch (err) {
        setError("Failed to fetch route. Please try again.");
      }
    };

    fetchRoute();
  }, [startPoint, endPoint]);

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <MapView style={styles.map} region={mapRegion}>
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={5}
            strokeColor="blue"
          />
        </MapView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
