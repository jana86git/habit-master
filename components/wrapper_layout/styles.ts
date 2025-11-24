import { colors } from "@/constants/colors"; // adjust path accordingly
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        backgroundColor: colors.background,

        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 28,
        color: colors.background, // Using background for contrast
        fontWeight: 'bold',
    },
    hamburger: {
        width: 36,
        height: 36,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    hamburgerLine: {
        width: '100%',
        height: 3,
        backgroundColor: colors.background, // contrast
        borderRadius: 2,
    },
    pageTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    appName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        alignSelf: "center",
        marginLeft: 10

    },
    content: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 16,
    },
    footer: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: colors.background,

        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    footerItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: 50,
        height: 45

    },
    footerIcon: {
        fontSize: 24,
        marginBottom: 4,
        color: colors.primary,
    },
    footerTitle: {
        fontSize: 11,
        color: colors.subtle,
        fontWeight: '500',
    },
    sideBarWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: colors.background,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 99999,
        paddingTop: 30,
    },
    sideBarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle,
    },
    sidebarHeaderText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },

    menuTextsWrapper: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.subtle,
    },
    menuText: {
        fontSize: 16,
        color: colors.text
    },
    toastContainer: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: 8,
        gap: 8, // Space between toasts
        height: "auto",

    },
});
