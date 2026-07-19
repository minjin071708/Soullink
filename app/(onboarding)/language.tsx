import i18n from "@/i18n";
import {
  useAppStore,
  type Language,
} from "@/store/use-language-store";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const APPLE_INK = "#1d1d1f";
const TIP_COLOR = "#6E6E73";
const SCREEN_GRADIENT = ["#f3edff","#fff6f5"] as const;


type LanguageItem = {
  code: Language;
  title: string;
  flag: string;
  continueLabel: string;
};

const LANGUAGES: LanguageItem[] = [
  {
    code: "en",
    title: "English",
    flag: "🇺🇸",
    continueLabel: "Continue",
  },
  {
    code: "mn",
    title: "Монгол",
    flag: "🇲🇳",
    continueLabel: "Үргэлжлүүлэх",
  },
  {
    code: "ko",
    title: "한국어",
    flag: "🇰🇷",
    continueLabel: "계속하기",
  },
];

const TIP_BY_LANGUAGE: Record<Language, string> = {
  en: "You can change this later in Settings",
  mn: "Үүнийг дараа Settings-ээс өөрчилж болно",
  ko: "나중에 설정에서 변경할 수 있습니다",
};

export default function LanguageScreen() {
  const savedLanguage = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    savedLanguage ?? "mn"
  );

  const selectedItem = LANGUAGES.find(
    (language) => language.code === selectedLanguage
  );

  const handleContinue = async () => {
    await i18n.changeLanguage(selectedLanguage);
    setLanguage(selectedLanguage);
    router.replace("/(onboarding)/introduction");
  };

  return (
    <LinearGradient
      colors={[...SCREEN_GRADIENT]}
      locations={[0, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose your language</Text>
            <Text style={styles.tip}>
              {TIP_BY_LANGUAGE[selectedLanguage]}
            </Text>
          </View>

          {/* <Image
            source={require("@/assets/images/mascot_language.png")}
            style={styles.image}
            contentFit="contain"
          /> */}
   

          <View style={styles.list}>
            {LANGUAGES.map((language) => {
              const selected = selectedLanguage === language.code;

              return (
                <Pressable
                  key={language.code}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={language.title}
                  onPress={() => setSelectedLanguage(language.code)}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <View style={styles.flagCircle}>
                    <Text style={styles.flag}>{language.flag}</Text>
                  </View>

                  <Text style={styles.optionTitle}>{language.title}</Text>

                  <View style={styles.optionTrailing}>
                  <MaterialIcons name="navigate-next" size={24} color={APPLE_INK} />
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.spacer} />
     

          <Pressable
            accessibilityRole="button"
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continuePressed,
            ]}
          >
            <Text style={styles.continueLabel}>
              {selectedItem?.continueLabel ?? "Continue"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 12,
    
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: APPLE_INK,
  },
  tip: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    color: TIP_COLOR,
  },
  image: {
    width: "100%",
    height: 250,
    marginBottom: 28,
    alignSelf: "center",
  },
  list: {
    gap: 16,
    marginTop: 40,
  },
  option: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 4px 20px rgba(139, 139, 139, 0.15)",

  },
  optionSelected: {
    borderWidth: 1,
    borderColor: "rgb(59, 59, 59)",
  },
  optionPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  flagCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F7",
    overflow: "hidden",
  },
  flag: {
    fontSize: 24,
  },
  optionTitle: {
    flex: 1,
    marginHorizontal: 14,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: APPLE_INK,
    textAlign: "center",
  },
  optionTrailing: {
    width: 40,
    alignItems: "flex-end",
  },
  selectedDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 6,
    borderColor: APPLE_INK,
    backgroundColor: "#FFFFFF",
  },
  unselectedDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#D2D2D7",
    backgroundColor: "#FFFFFF",
  },
  spacer: {
    flex: 1,
  },
  continueButton: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: APPLE_INK,
  },
  continuePressed: {
    opacity: 0.85,
  },
  continueLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
