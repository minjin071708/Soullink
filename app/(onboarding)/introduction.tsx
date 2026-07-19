import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppStore } from "@/store/use-language-store";

type Slide = {
  id: string;
  mood: "anxious" | "happy";
  image: ImageSourcePropType;
  titleKey: string;
  descriptionKey: string;
  bgColor: string;
};

const SLIDES: Slide[] = [
  {
    id: "understand",
    mood: "anxious",
    image: require("@/assets/images/onboardAnxiety.png"),
    titleKey: "onboarding.understand.title",
    descriptionKey: "onboarding.understand.description",
    bgColor: "#f3dff5",
  },
  {
    id: "balance",
    mood: "happy",
    image: require("@/assets/images/onboardHappy.png"),
    titleKey: "onboarding.balance.title",
    descriptionKey: "onboarding.balance.description",
    bgColor: "#F5ECFF",
  },
];

export default function IntroductionScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const completeOnboarding = useAppStore(
    (state) => state.completeOnboarding
  );

  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = width;
  const cardHeight = height;
  const isLastSlide = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (!isLastSlide) {
      listRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
      return;
    }

    completeOnboarding();
    router.replace("/(auth)/login");
  };

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Slide>[] }) => {
      const visibleIndex = viewableItems[0]?.index;

      if (visibleIndex !== null && visibleIndex !== undefined) {
        setActiveIndex(visibleIndex);
      }
    }
  ).current;

  return (
    <View style={styles.screen}>
      <FlatList
        ref={listRef}
        style={styles.list}
        data={SLIDES}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        decelerationRate="fast"
        snapToInterval={cardWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        getItemLayout={(_, index) => ({
          length: cardWidth,
          offset: cardWidth * index,
          index,
        })}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 60,
        }}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth, height: cardHeight, backgroundColor: item.bgColor }}>
            <Image
              source={item.image}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />

            <View
              style={[
                styles.overlay,
                {
                  paddingTop: insets.top + 24,
                  paddingBottom: Math.max(insets.bottom, 16) + 16,
                },
              ]}
            >
              <View style={styles.copyArea}>
                <Text style={styles.title}>{t(item.titleKey)}</Text>
                <Text style={styles.description}>
                  {t(item.descriptionKey)}
                </Text>
              </View>

              <View style={styles.footer}>
                <View style={styles.dots}>
                  {SLIDES.map((slide, index) => (
                    <View
                      key={slide.id}
                      style={[
                        styles.dot,
                        index === activeIndex
                          ? styles.dotActive
                          : styles.dotInactive,
                      ]}
                    />
                  ))}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isLastSlide
                      ? t("onboarding.start")
                      : t("onboarding.next")
                  }
                  onPress={handleNext}
                  style={({ pressed }) => [
                    styles.nextButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.nextLabel}>
                    {isLastSlide
                      ? t("onboarding.start")
                      : t("onboarding.next")}
                  </Text>

                  <View style={styles.nextRingOuter}>
                    <View style={styles.nextRingInner}>
                      <View style={styles.nextCircle}>
                        <Ionicons
                          name="arrow-up"
                          size={22}
                          color="#1d1d1f"
                          style={styles.nextArrow}
                        />
                      </View>
                    </View>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  list: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
  },
  copyArea: {
    paddingBottom: 28,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  title: {
    maxWidth: 320,
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  description: {
    maxWidth: 320,
    marginTop: 14,
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextLabel: {
    marginRight: 14,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  nextRingOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",

  },
  nextRingInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    
  },
  nextCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  nextArrow: {
    transform: [{ rotate: "45deg" }],
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
});
