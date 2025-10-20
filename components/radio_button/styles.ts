import { colors } from "@/constants/colors";
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.subtle,
        marginBottom: 24,
    },
    optionsContainer: {
        gap: 16,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.secondary,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioOuterSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.success,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    radioLabel: {
        fontSize: 16,
        color: colors.subtle,
    },
    radioDisabled: {
        opacity: 0.5,
    },
    radioLabelDisabled: {
        opacity: 0.5,
    },
    resultContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    resultText: {
        fontSize: 14,
        color: colors.subtle,
    },
    resultValue: {
        fontWeight: '600',
        color: colors.primary,
    },
});