import { Appearance } from "react-native";
 const theme = Appearance.getColorScheme();
// Dark theme
 const dark = {
  primary: "#a3d712ff",    // Dark Blue
  secondary: "#b1ceaeff",  // Blue Grey
  danger: "#b41d66ff",     // Dark Red
  success: "#18d2dcff",    // Dark Green
  info: "#efcdb1ff",       // Deep Sky Blue
  alert: "#F57F17",      // Dark Amber
  subtle: "#dee1e2ff",     // Light Grey
  background: "#232322ff",
  background2: "#35352eff",
  text:"#fdf7efff",
  textOnPrimary: "#222020ff",
  textOnSuccess: "#222020ff",
};

// Light theme (opposite colors)
 const light = {
 primary: "#a3d712ff",    // Dark Blue
  secondary: "#b1ceaeff",  // Blue Grey
  danger: "#b41d66ff",     // Dark Red
  success: "#18d2dcff",    // Dark Green
  info: "#efcdb1ff",       // Deep Sky Blue
  alert: "#F57F17",      // Dark Amber
  subtle: "#dee1e2ff",     // Light Grey
  background: "#f5f5edff",
  background2: "#cfcfb8ff",
  text:"#fdf7efff",
  textOnPrimary: "#222020ff",
  textOnSuccess: "#222020ff",
};

export const colors =( theme === "dark")?dark:light
