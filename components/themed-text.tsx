import { Text, type TextProps } from 'react-native';


export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  className = "",
  type = 'default',
  ...rest
}: ThemedTextProps) {

  const typeStyles = {
    default: "text-base leading-6",
    defaultSemiBold: "text-base font-semibold leading-6",
    title: "text-3xl font-bold leading-9",
    subtitle: "text-xl font-bold leading-7",
    link: "text-base leading-7 text-primary",
  };

  return (
    <Text
    className={`text-foreground ${typeStyles[type]} ${className}`}
    {...rest}
  />
  );
}

