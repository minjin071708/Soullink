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
        name !== "expo-apple-authentication"
      );
    }),
    "@react-native-google-signin/google-signin",
    "expo-apple-authentication",
  ],
};

module.exports = { expo };
