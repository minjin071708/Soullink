

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const INSTALLATION_ID_STORAGE_KEY =
  "soulcity.installationId";

export async function getOrCreateInstallationId() {
  const savedInstallationId = await AsyncStorage.getItem(
    INSTALLATION_ID_STORAGE_KEY
  );

  if (savedInstallationId) {
    return savedInstallationId;
  }

  const installationId = Crypto.randomUUID();

  await AsyncStorage.setItem(
    INSTALLATION_ID_STORAGE_KEY,
    installationId
  );

  return installationId;
}