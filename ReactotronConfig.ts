import Reactotron from "reactotron-react-native";

if (__DEV__) {
  Reactotron.configure({
    name: "SoulLink",
  })
    .useReactNative({
      networking: {
        ignoreUrls: /symbolicate/,
      },
      asyncStorage: false,
      editor: false,
      overlay: false,
    })
    .connect();
}

export default Reactotron;