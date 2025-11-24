import { colors } from "@/constants/colors";
export const styles = {
    task_container: {
        flex: 1,
        backgroundColor: colors.background,
        borderColor: colors.secondary,
        borderWidth: 1,
        borderRadius: 8
    },
    task_heading: {
        // fontWeight: "900",
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center' as const,
    },
    tabButtonActive: {
        backgroundColor: colors.primary,
    },
    tabButtonInactive: {
        backgroundColor: colors.background2,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600' as const,
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
    }
}