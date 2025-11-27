import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";

export const styles = {
    task_container: {
        flex: 1,
        backgroundColor: colors.background,
        borderColor: colors.secondary,
        borderWidth: 1,
        borderRadius: 8
    },
    task_heading: {
        fontFamily: fonts.bold,
        fontSize: 18,
        color: colors.text
    },
    tabContainer: {
        flexDirection: 'row' as const,
        backgroundColor: colors.background,
        paddingTop: 8,
        paddingBottom: 8,
        gap: 8
    },
    tabButton: {
        flex: 1,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center' as const,
        fontFamily: fonts.bold,
    },
    tabButtonActive: {
        backgroundColor: colors.primary,
    },
    tabButtonInactive: {
        backgroundColor: colors.background2,
    },
    tabText: {
        fontFamily: fonts.regular,
        fontSize: 16,
    },
    tabTextActive: {
        color: colors.background,
    },
    tabTextInactive: {
        color: colors.text,
    },
    scrollView: {
        flex: 1,
        backgroundColor: colors.background
    },
    totalInfo: {
        fontFamily: fonts.regular,
        color: colors.text,
        padding: 8
    }
}