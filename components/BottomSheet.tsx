import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function BottomSheet({ children, onClose }) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [contentHeight, setContentHeight] = useState(SCREEN_HEIGHT * 0.5);
  const dragOffsetY = useRef(0);
  const startPosition = useRef(0);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
    onPanResponderGrant: () => {
      dragOffsetY.current = 0;
    },
    onPanResponderMove: (_, gestureState) => {
      dragOffsetY.current = gestureState.dy;
      // Keep the sheet from sliding above its starting position
      translateY.setValue(
        Math.max(0, startPosition.current + gestureState.dy)
      );
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        closeSheet();
      } else {
        openSheet();
      }
    },
  });

  const openSheet = () => {
    // Slide the sheet up into view by resetting the translation
    startPosition.current = 0;
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose?.());
  };

  useEffect(() => {
    openSheet();
  }, [contentHeight]);

  return (
    <View style={styles.overlay}>
      {/* Backdrop tap to close */}
      <TouchableWithoutFeedback onPress={closeSheet}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      {/* BottomSheet */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.sheet, { transform: [{ translateY }] }]}
      >
        <ScrollView
          onContentSizeChange={(w, h) => setContentHeight(h + 40)}
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    overflow: "hidden",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
