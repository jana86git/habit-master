/**
 * 
 * 
 * 
 * 
 * 
 */
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { RelativePathString, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { ReactNode, useEffect } from 'react';
import {
    DeviceEventEmitter,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppWrapper } from './AppWrapperContext';
import { footerItems, pageConfigs } from './pageConfig';
import Sidebar from './SideBar';
import { styles } from './styles';
import { Toast } from './Toast';
import { IconItem } from './types';


const eventEmitter = DeviceEventEmitter;




export function AppWrapperComponent({ children }: { children: ReactNode }) {

    const { state, dispatch } = useAppWrapper();


    const onMenuPress = () => { dispatch({ type: "SHOW_SIDEBAR", payload: true }) }
    const appName = "HabitMaster"
    const pathName = usePathname();


    const { currentPageConfig, activePage, errors, successes } = state

    const handleBackPress = () => {
        router.back()
    }

    const handleIconClick = (item: IconItem) => {
        if (item.type === "event") {
            eventEmitter.emit("footer-icon-click", item);
        } else {
            router.push(item.value as RelativePathString)
        }

    }

    const handleCloseError = (index: number) => {

        const filteredErrors = state.errors.filter((_, i) => i !== index);
        dispatch({ type: "SET_ERRORS", payload: filteredErrors })
    };

    const handleCloseSuccess = (index: number) => {

        const filteredSuccesses = state.successes.filter((_, i) => i !== index);
        dispatch({ type: "SET_SUCCESSES", payload: filteredSuccesses })
    };

    useEffect(() => {
        if (pathName) {
            const pageConfig = pageConfigs?.find((config) => config.page === pathName)
            if (pageConfig) {
                dispatch({ type: "SET_PAGE_CONFIG", payload: pageConfig })
                dispatch({ type: "SET_ACTIVE_PAGE", payload: pageConfig?.page })
            }
        }
    }, [pathName])

    useEffect(() => {
        const subscriptionError = eventEmitter.addListener('errorEvent', (event: any) => {

            if (event?.error) {
                dispatch({ type: "SET_ERRORS", payload: [...state.errors, event?.error || ""] });
            }
        });
        const subscriptionSuccess = eventEmitter.addListener('successEvent', (event: any) => {

            if (event?.success) {
                dispatch({ type: "SET_SUCCESSES", payload: [...state.successes, event?.success || ""] });
            }
        });
        return () => {
            subscriptionError.remove();
            subscriptionSuccess.remove();
        };
    }, []);
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />
            <Sidebar />
            {
                currentPageConfig?.headerType === "default" ?
                    <View style={styles.header}>
                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
                                <View style={styles.hamburger}>
                                    <AntDesign name="menu" size={24} color={colors.text} />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.appName}>{appName}</Text>
                        </View>
                        <View style={styles.iconButton} />
                    </View> : null
            }

            {
                currentPageConfig?.headerType === "back-button" ?
                    <View style={styles.header}>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
                                <Ionicons name='chevron-back' size={30} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.pageTitle, { alignSelf: "center" }]}>{currentPageConfig?.pageTitle}</Text>
                            <View style={styles.iconButton} />
                        </View>
                    </View> : null
            }

            <View style={{ flex: 1, padding: 8 }}>
                {children}
            </View>
            {currentPageConfig?.footerShown ?
                <View style={styles.footer}>
                    {footerItems.map((item, index) => {
                        const IconCompnent = item.icon
                        return (
                            <TouchableOpacity onPress={() => { handleIconClick(item as IconItem) }} key={index} style={styles.footerItem}>
                                <IconCompnent name={item.iconName as any} size={24} color={colors.text} />
                                <Text style={styles.footerTitle}>{item.title}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View> : null

            }

            {/* Error Toasts */}
            <View style={styles.toastContainer}>
                {errors.map((error, index) => (
                    <Toast
                        key={`error-${index}`}
                        visible={true}
                        message={error}
                        type="error"
                        onClose={() => handleCloseError(index)}
                    />
                ))}
            </View>

            {/* Success Toasts */}
            <View style={styles.toastContainer}>
                {successes.map((success, index) => (
                    <Toast
                        key={`success-${index}`}
                        visible={true}
                        message={success}
                        type="success"
                        onClose={() => handleCloseSuccess(index)}
                    />
                ))}
            </View>

        </SafeAreaView>
    );
};





