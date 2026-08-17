import { useAppStore } from "@/store/use-language-store";
import { getFontFamily, type FontWeight } from "@/utils/fonts";
import { useMemo, type ReactNode } from "react";
import {
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from "react-native";

export type AppTextProps = TextProps & {
  weight?: FontWeight;
  style?: StyleProp<TextStyle>;
  children?: ReactNode;
};

export function AppText({
  weight = "regular",
  style,
  children,
  ...rest
}: AppTextProps) {
  const language = useAppStore((state) => state.language);
  const fontFamily = useMemo(
    () => getFontFamily(language, weight),
    [language, weight]
  );

  return (
    <Text {...rest} style={[{ fontFamily }, style]}>
      {children}
    </Text>
  );
}
