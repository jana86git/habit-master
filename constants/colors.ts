import { Appearance } from "react-native";
 const theme = Appearance.getColorScheme();
 console.log("THE SYSTEM THEME IS :: ", theme);
// Dark theme
 const dark = {
  primary: "#0D47A1",    // Dark Blue
  secondary: "#37474F",  // Blue Grey
  danger: "#B71C1C",     // Dark Red
  success: "#1B5E20",    // Dark Green
  info: "#01579B",       // Deep Sky Blue
  alert: "#F57F17",      // Dark Amber
  subtle: "#B0BEC5",     // Light Grey
  background: "#121212",
  text:"#fff"  // Almost Black
};

// Light theme (opposite colors)
 const light = {
  primary: "#F2B33F",    // Light Gold (opposite of Dark Blue)
  secondary: "#C8B8B0",  // Light Beige (opposite of Blue Grey)
  danger: "#4E63E3",     // Soft Blue (opposite of Dark Red)
  success: "#E4A57F",    // Light Orange (opposite of Dark Green)
  info: "#FEA806",       // Warm Yellow (opposite of Deep Sky Blue)
  alert: "#08A8E8",      // Sky Blue (opposite of Dark Amber)
  subtle: "#4F4340",     // Darker Grey (opposite of Light Grey)
  background: "#FFFFFF",
  text:"#000"  // White
};

export const colors =( theme === "dark")?dark:light
