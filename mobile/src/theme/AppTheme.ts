import { MD3LightTheme as DefaultTheme, MD3Theme } from "react-native-paper";
import { MD3Colors } from "react-native-paper/lib/typescript/types";
import { WompiColors } from "./WompiColors";

export type TAppTheme = MD3Theme & {
  colors: MD3Colors & { overlay: string; success: string; warning: string };
  sizes: {
    base: number;
    radius: number;
    small: number;
    medium: number;
    large: number;
  };
};

export const AppTheme: TAppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Wompi Verde Menta como primary
    primary: WompiColors.mint.primary,
    onPrimary: WompiColors.text.inverse,
    primaryContainer: WompiColors.mint.light,
    onPrimaryContainer: WompiColors.gray[800],

    // Colores secundarios complementarios
    secondary: WompiColors.gray[600],
    onSecondary: WompiColors.text.inverse,
    secondaryContainer: WompiColors.gray[200],
    onSecondaryContainer: WompiColors.gray[800],

    // Terciario en tonos cálidos
    tertiary: WompiColors.accent.orange,
    onTertiary: WompiColors.text.inverse,
    tertiaryContainer: WompiColors.accent.orange + "20", // Con transparencia
    onTertiaryContainer: WompiColors.gray[800],

    // Fondos suaves
    background: WompiColors.background.primary,
    onBackground: WompiColors.text.primary,

    // Superficies
    surface: WompiColors.background.surface,
    onSurface: WompiColors.text.primary,
    surfaceVariant: WompiColors.gray[200],
    onSurfaceVariant: WompiColors.text.secondary,

    // Estados
    error: WompiColors.status.error,
    onError: WompiColors.text.inverse,
    errorContainer: WompiColors.status.error + "20",
    onErrorContainer: WompiColors.gray[800],

    success: WompiColors.status.success,
    warning: WompiColors.status.warning,
    overlay: WompiColors.background.overlay,
    shadow: WompiColors.shadow.medium,
  },
  sizes: { base: 16, radius: 12, small: 8, medium: 16, large: 24 },
};
