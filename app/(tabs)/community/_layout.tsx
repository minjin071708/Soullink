import { Stack } from "expo-router";

export default function CommunityLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add-post" />
      <Stack.Screen name="post/[postId]" />
      <Stack.Screen name="edit-post" />
    </Stack>
  );
}
