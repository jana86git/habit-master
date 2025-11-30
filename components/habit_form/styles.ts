import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
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
        color: colors.text,
        marginVertical: 5,
    },
    selectedDate: {
        fontSize: 14,
        color: colors.text,
        marginVertical: 5,
        textAlign: 'center',
        fontFamily: fonts.regular
    },
    input: {
        borderWidth: 1,
        borderColor: colors.subtle,
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
        width: "48%"
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    }
})