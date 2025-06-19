import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  ScrollView,
  TouchableWithoutFeedback,
  PanResponder,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.8;
const DEFAULT_SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

const BottomSheetDemo = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [contentHeight, setContentHeight] = useState(DEFAULT_SHEET_HEIGHT);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const isScrolling = useRef(false);
  const scrollViewRef = useRef(null);
  const panEnabled = useRef(true);

  // Sample data
  const verticalData = Array.from({ length: 9 }, (_, i) => ({
    id: `${i + 1}`,
    title: `Card ${i + 1}`,
    description: Array.from(
      { length: 3 },
      (_, j) =>
        `This is detailed description paragraph ${j + 1} for Card ${i + 1}. ` +
        `It contains more information about this particular item that will be displayed in the BottomSheet.`
    ).join("\n\n"),
    trendingItems: Array.from({ length: 2 }, (_, j) => ({
      id: `${i + 1}-${j + 1}`,
      title: `Related Item ${j + 1}`,
    })),
  }));

  const horizontalData = Array.from({ length: 8 }, (_, i) => ({
    id: `h-${i + 1}`,
    title: `Trending ${i + 1}`,
  }));

  // Pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => panEnabled.current,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (isScrolling.current) return false;
        const isHorizontal =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        return !isHorizontal;
      },
      onPanResponderGrant: () => {
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        if (!panEnabled.current || isScrolling.current) return;
        const newY = Math.max(0, translateY._value + gestureState.dy);
        translateY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!panEnabled.current || isScrolling.current) return;

        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeSheet();
        } else if (gestureState.dy < -100 || gestureState.vy < -0.5) {
          expandSheet();
        } else {
          snapToPosition();
        }
      },
    })
  ).current;

  // Open the sheet with animation
  const openSheet = (height = DEFAULT_SHEET_HEIGHT) => {
    const targetY = SCREEN_HEIGHT - Math.min(height, MAX_SHEET_HEIGHT);

    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
      stiffness: 300,
      damping: 30,
    }).start();
  };

  // Close the sheet
  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSelectedCard(null));
  };

  // Expand to full height
  const expandSheet = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  // Snap to appropriate position based on content height
  const snapToPosition = () => {
    const currentPosition = SCREEN_HEIGHT - translateY._value;
    const targetHeight = Math.min(contentHeight, MAX_SHEET_HEIGHT);
    const targetY = SCREEN_HEIGHT - targetHeight;

    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
    }).start();
  };

  // Handle card press
  const handleCardPress = (item) => {
    setSelectedCard(item);
    setTimeout(() => openSheet(), 10);
  };

  // Handle content size changes
  const handleContentSizeChange = (_, height) => {
    const newHeight = Math.min(height + 150, MAX_SHEET_HEIGHT);
    setContentHeight(newHeight);
    snapToPosition();
  };

  // Handle scroll events
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Disable pan responder when scrolling up from top
    panEnabled.current = offsetY <= 0;
  };

  // Render methods
  const renderVerticalItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>Tap for details</Text>
    </TouchableOpacity>
  );

  const renderHorizontalItem = ({ item }) => (
    <View style={styles.horizontalCard}>
      <Text style={styles.horizontalCardTitle}>{item.title}</Text>
    </View>
  );

  const renderTrendingItem = ({ item }) => (
    <View style={styles.trendingCard}>
      <Text style={styles.trendingCardTitle}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Main Content  Vertical Cards */}
      <FlatList
        data={verticalData}
        renderItem={renderVerticalItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.verticalList}
      />

      {/* Horizontal Trending List */}
      <FlatList
        data={horizontalData}
        renderItem={renderHorizontalItem}
        keyExtractor={(item) => item.id}
        horizontal
        contentContainerStyle={styles.horizontalList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Bottom Sheet */}
      {selectedCard && (
        <>
          <TouchableWithoutFeedback onPress={closeSheet}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{ translateY }],
                maxHeight: MAX_SHEET_HEIGHT,
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.header}>
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
              onScrollBeginDrag={() => {
                isScrolling.current = true;
              }}
              onScrollEndDrag={() => {
                isScrolling.current = false;
              }}
              onMomentumScrollBegin={() => {
                isScrolling.current = true;
              }}
              onMomentumScrollEnd={() => {
                isScrolling.current = false;
              }}
            >
              <Text style={styles.sheetTitle}>{selectedCard.title}</Text>
              <Text style={styles.sheetDescription}>
                {selectedCard.description}
              </Text>

              <Text style={styles.sectionTitle}>Related Items</Text>
              <FlatList
                data={selectedCard.trendingItems}
                renderItem={renderTrendingItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingList}
                nestedScrollEnabled={true}
              />
            </ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  verticalList: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  horizontalList: {
    padding: 16,
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
  },
  horizontalCard: {
    backgroundColor: "#00796b",
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    width: 120,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  horizontalCardTitle: {
    color: "#fff",
    fontWeight: "500",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    color: "#666",
  },
  activeNav: {
    color: "#00796b",
    fontWeight: "bold",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: MAX_SHEET_HEIGHT,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingBottom: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
  },
  sheetContent: {
    flex: 1,
  },
  sheetContentContainer: {
    paddingBottom: 60,
    paddingTop: 10,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sheetDescription: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  trendingList: {
    paddingBottom: 30,
  },
  trendingCard: {
    backgroundColor: "#e0f2f1",
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    width: 165,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  trendingCardTitle: {
    color: "#00796b",
    fontWeight: "500",
    textAlign: "center",
  },
});

export default BottomSheetDemo;
