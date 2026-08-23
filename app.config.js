const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
const expo = {
  ...appJson.expo,
  scheme: "soulcity",
  ios: {
    ...appJson.expo.ios,
    bundleIdentifier: "com.soulcity.app",
    usesAppleSignIn: true,
  },
  android: {
    ...appJson.expo.android,
    package: "com.soulcity.app",
  },
  plugins: [
    ...(appJson.expo.plugins ?? []).filter((plugin) => {
      const name = Array.isArray(plugin) ? plugin[0] : plugin;
      return (
        name !== "@react-native-google-signin/google-signin" &&
        name !== "expo-apple-authentication" &&
        name !== "expo-audio" &&
        name !== "expo-build-properties"
      );
    }),
    "@react-native-google-signin/google-signin",
    "expo-apple-authentication",
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: true,
        },
      },
    ],
    [
      "expo-audio",
      {
        microphonePermission:
          "Allow SoulCity to record voice journals for transcription.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow SoulCity to access your photos for community posts.",
        cameraPermission: false,
        microphonePermission: false,
      },
    ],
  ],
};

module.exports = { expo };
