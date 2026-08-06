const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
const expo = {
  ...appJson.expo,
  scheme: "soullink",
  ios: {
    ...appJson.expo.ios,
    bundleIdentifier: "com.soullink.app",
    usesAppleSignIn: true,
  },
  android: {
    ...appJson.expo.android,
    package: "com.soullink.app",
  },
  plugins: [
    ...(appJson.expo.plugins ?? []).filter((plugin) => {
      const name = Array.isArray(plugin) ? plugin[0] : plugin;
      return (
        name !== "@react-native-google-signin/google-signin" &&
        name !== "expo-apple-authentication" &&
        name !== "expo-av"
      );
    }),
    "@react-native-google-signin/google-signin",
    "expo-apple-authentication",
    [
      "expo-av",
      {
        microphonePermission:
          "Allow SoulLink to record voice journals for transcription.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow SoulLink to access your photos for community posts.",
        cameraPermission: false,
        microphonePermission: false,
      },
    ],
  ],
};

module.exports = { expo };
