import { colors } from "@/constants/colors";
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        color: colors.text
    },
    subTitle: {
        marginTop: 15,
        fontWeight: "600",
        fontSize: 16,
        color: colors.text,
        marginBottom: 8
    },
    label: {
        fontSize: 16,
        color: "#444",
        marginVertical: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    radioGroup: {
        marginTop: 10,
        marginBottom: 10,
    },
    dateWrapper: {
        flexDirection: "row",
        justifyContent:"space-between"
    },
    date_cell:{
        width:"45%"
    }
})