import { colors } from "@/constants/colors";
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: colors.card,
    borderColor: colors.secondary,
    borderWidth:1,
    padding: 8,
    borderRadius: 8,
    // shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    // shadowOffset: { width: 0, height: 2 },
    // elevation: 3,
  },
  habitName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  habitDetails: {
    fontSize: 14,
    color: colors.info,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  deleteButton: {
    marginLeft: 12,
  },
  separator: {
    height: 12,
  },
});