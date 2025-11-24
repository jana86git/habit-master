import { styles } from "./styles";

import { colors } from "@/constants/colors";
import { exportDatabase, importDatabase } from "@/db/db";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAppWrapper } from "./AppWrapperContext";

export default function Sidebar() {

    const { state, dispatch } = useAppWrapper();
    const { sidebarVisibility } = state
    const [overlayOpacity] = useState(new Animated.Value(0));

    const openSidebar = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    };

    const closeSidebar = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -SIDEBAR_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            dispatch({ type: "SHOW_SIDEBAR", payload: false })
        });
    };

    const handleExportDatabase = async () => {
        await exportDatabase();
    };

    const handleImportDatabase = async () => {
        await importDatabase();
    };

    useEffect(() => {
        if (sidebarVisibility) {
            openSidebar();
        }
    }, [sidebarVisibility])

    const { width } = Dimensions.get("window")
    const SIDEBAR_WIDTH = width * 0.75
    const [slideAnim] = useState(new Animated.Value(-SIDEBAR_WIDTH));
    return (
        <Animated.View
            style={[{

                width: SIDEBAR_WIDTH,

                transform: [{ translateX: slideAnim }],

            }, styles.sideBarWrapper]}
        >
            {/* Sidebar Header */}
            <View style={styles?.sideBarHeader}>
                <Text style={styles?.sidebarHeaderText}>Menu</Text>
                <TouchableOpacity onPress={closeSidebar}>
                    <AntDesign name="close" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Sidebar Content */}
            <View style={{ flex: 1, padding: 20 }}>
                <TouchableOpacity style={styles?.menuTextsWrapper}>
                    <Text style={styles?.menuText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles?.menuTextsWrapper}>
                    <Text style={styles?.menuText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles?.menuTextsWrapper}>
                    <Text style={styles?.menuText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles?.menuTextsWrapper}>
                    <Text style={styles?.menuText}>About</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles?.menuTextsWrapper} onPress={handleExportDatabase}>
                    <Text style={styles?.menuText}>Export Database</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles?.menuTextsWrapper} onPress={handleImportDatabase}>
                    <Text style={styles?.menuText}>Import Database</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}