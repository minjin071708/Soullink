import { Redirect } from "expo-router";

/** Deep link `/calendar` → tab so bottom navigation stays visible. */
export default function CalendarRoute() {
  return <Redirect href="/calendar-tab" />;
}
