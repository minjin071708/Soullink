const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
const expo = {
  ...appJson.expo,

  scheme: "soulcity",
  name: "SoulCity",
  slug: "SoulCity",
  owner: "minji0717",

  extra: {
    ...(appJson.expo.extra ?? {}),

    eas: {
      ...(appJson.expo.extra?.eas ?? {}),
      projectId: "9c5e4806-cd91-4003-bf2b-dd51f68c2401",
    },
  },

  ios: {
    ...appJson.expo.ios,
    bundleIdentifier: "com.soulcity.app",
    usesAppleSignIn: true,
  },

  android: {
    ...appJson.expo.android,
    package: "com.soulcity.app",
    googleServicesFile: "./google-services.json",
  },

  plugins: [
    ...(appJson.expo.plugins ?? []).filter((plugin) => {
      const name = Array.isArray(plugin)
        ? plugin[0]
        : plugin;

      return (
        name !== "@react-native-google-signin/google-signin" &&
        name !== "expo-apple-authentication" &&
        name !== "expo-audio" &&
        name !== "expo-build-properties" &&
        name !== "expo-image-picker"
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
        recordAudioAndroid: true,
      },
    ],

    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow SoulCity to access your photos for community posts.",
        cameraPermission: false,
      },
    ],
  ],
};

module.exports = { expo };