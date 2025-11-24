import { Appearance } from "react-native";
const theme = Appearance.getColorScheme();
// Dark theme
const dark = {
  primary: "#a3d712ff",    // Lime green
  secondary: "#b1ceaeff",  // Blue Grey
  danger: "#b41d66ff",     // Dark Red
  success: "#18d2dcff",    // Dark Green
  info: "#efcdb1ff",       // Deep Sky Blue
  alert: "#F57F17",      // Dark Amber
  subtle: "#dee1e2ff",     // Light Grey
  background: "#232322ff",
  background2: "#35352eff",
  text: "#fdf7efff",
  textOnPrimary: "#222020ff",
  textOnSuccess: "#222020ff",
  buttonOrange: "#F9A03F",  // PostHog button orange
  buttonOrangeShadow: "#C65D21",  // PostHog button shadow
  buttonActive: "#a3d712ff",  // Active button color (lime green - same as primary)
  buttonActiveShadow: "#7FA30F",  // Active button shadow (darker lime green)
  buttonDisabled: "#CCCCCC",  // Disabled button color (gray)
  buttonDisabledShadow: "#999999",  // Disabled button shadow
};

// Light theme (opposite colors)
const light = {
  primary: "#a3d712ff",    // Lime green
  secondary: "#b1ceaeff",  // Blue Grey
  danger: "#b41d66ff",     // Dark Red
  success: "#18d2dcff",    // Dark Green
  info: "#efcdb1ff",       // Deep Sky Blue
  alert: "#F57F17",      // Dark Amber
  subtle: "#dee1e2ff",     // Light Grey
  background: "#f5f5edff",
  background2: "#cfcfb8ff",
  text: "#fdf7efff",
  textOnPrimary: "#222020ff",
  textOnSuccess: "#222020ff",
  buttonOrange: "#F9A03F",  // PostHog button orange
  buttonOrangeShadow: "#C65D21",  // PostHog button shadow
  buttonActive: "#a3d712ff",  // Active button color (lime green - same as primary)
  buttonActiveShadow: "#7FA30F",  // Active button shadow (darker lime green)
  buttonDisabled: "#CCCCCC",  // Disabled button color (gray)
  buttonDisabledShadow: "#999999",  // Disabled button shadow
};

export const colors = (theme === "dark") ? dark : light
