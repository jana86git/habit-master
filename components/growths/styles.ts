import { colors } from "@/constants/colors";
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background2,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        color: "black",
    },

    // ✅ FILTER GRID
    filterGrid: {
        width: "90%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    filterItem: {
        width: "48%",
        padding: 10,
        marginVertical: 5,
        backgroundColor: "#eee",
        borderRadius: 8,
        alignItems: "center",
    },
    filterItemActive: {
        backgroundColor: "#FF3B30",
    },
});
