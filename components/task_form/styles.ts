import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background
    },
    title: {
        fontFamily: fonts.bold,
        fontSize: 22,
        marginBottom: 15,
        color: colors.text
    },
    subTitle: {
        fontFamily: fonts.bold,
        marginTop: 15,
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
        justifyContent: "space-between"
    },
    date_cell: {
        width: "45%"
    },

    subtask_card: {
        borderColor: colors.secondary,
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "space-between"
    },

    subtask_name: {
        fontFamily: fonts.bold,
        fontSize: 16,
        color: colors.text
    }
})