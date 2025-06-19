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
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.8;
const MIN_SHEET_HEIGHT = 200;

export default function BottomSheet({ children, onClose }) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [contentHeight, setContentHeight] = useState(MIN_SHEET_HEIGHT);
  const isAnimating = useRef(false);
  const scrollViewRef = useRef(null);
  const isScrolling = useRef(false);
  const panEnabled = useRef(true);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => panEnabled.current,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isHorizontalGesture =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        return !isHorizontalGesture && !isScrolling.current;
      },
      onPanResponderGrant: () => {
        if (isScrolling.current) return;
        isAnimating.current = true;
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        if (isScrolling.current) return;
        const newY = Math.max(0, translateY._value + gestureState.dy);
        translateY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isScrolling.current) return;

        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeSheet();
        } else if (gestureState.dy < -100 || gestureState.vy < -0.5) {
          expandSheet();
        } else {
          resetSheetPosition();
        }
      },
    })
  ).current;

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    panEnabled.current = offsetY <= 0;
  };

  const calculateTargetPosition = () => {
    const targetHeight = Math.min(contentHeight + 100, MAX_SHEET_HEIGHT);
    return SCREEN_HEIGHT - targetHeight;
  };

  const openSheet = () => {
    isAnimating.current = true;
    const targetY = calculateTargetPosition();
    translateY.setValue(SCREEN_HEIGHT);

    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
      stiffness: 500,
      damping: 50,
    }).start(() => {
      isAnimating.current = false;
    });
  };

  const resetSheetPosition = () => {
    isAnimating.current = true;
    const targetY = calculateTargetPosition();

    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
  };

  const expandSheet = () => {
    isAnimating.current = true;
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
  };

  const closeSheet = () => {
    isAnimating.current = true;
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
      onClose?.();
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      openSheet();
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const handleContentSizeChange = (_, height) => {
    const newHeight = Math.min(
      Math.max(height, MIN_SHEET_HEIGHT),
      MAX_SHEET_HEIGHT
    );
    if (Math.abs(newHeight - contentHeight) > 10) {
      setContentHeight(height);
      resetSheetPosition();
    }
  };

  const handleScrollBegin = () => {
    isScrolling.current = true;
  };

  const handleScrollEnd = () => {
    isScrolling.current = false;
  };

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={closeSheet}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
            maxHeight: MAX_SHEET_HEIGHT,
          },
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.header}>
          <View style={styles.handle} />
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.sheetContent}
          contentContainerStyle={[
            styles.sheetContentContainer,
            { minHeight: contentHeight },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBegin}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollBegin={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd}
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
    zIndex: 1000,
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
  },
  content: {
    paddingHorizontal: 20,
  },
});
