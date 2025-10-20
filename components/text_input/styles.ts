import { colors } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: colors.info,
        fontWeight:"bold"
    },
    input: {
        paddingVertical: 8,
        fontSize: 16,
        color: colors.text,
        padding: 0,
        margin: 0,
    },
    borderBottom: {
        height: 2,
        backgroundColor: colors.info,
        marginTop: 4,
    },
})