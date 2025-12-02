import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

export interface ActionIcon {
    name: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
    size?: number;
}

interface WindowPanelProps {
    children: React.ReactNode;
    title: string;
    actionIcons?: ActionIcon[];
    style?: ViewStyle;
    onPress?: () => void;
    activeOpacity?: number;
}

export default function WindowPanel({
    children,
    title,
    actionIcons = [],
    style,
    onPress,
    activeOpacity = 0.7,
}: WindowPanelProps) {
    const ContentWrapper = onPress ? TouchableOpacity : View;
    const contentProps = onPress
        ? { onPress, activeOpacity, style: styles.contentArea }
        : { style: styles.contentArea };

    return (
        <View style={[styles.container, style]}>
            {/* Header Bar */}
            <View style={styles.headerBar}>
                <Text style={styles.headerLabel} numberOfLines={1}>
                    {title.length > 16 ? `${title.substring(0, 16)}...` : title}
                </Text>
                {actionIcons.length > 0 && (
                    <View style={styles.headerButtons}>
                        {actionIcons.map((icon, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.headerButton}
                                onPress={icon.onPress}
                            >
                                <Ionicons
                                    name={icon.name}
                                    size={icon.size || 20}
                                    color={icon.color || colors.textOnPrimary}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Content Area */}
            <ContentWrapper {...contentProps}>
                {children}
            </ContentWrapper>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 4,
        borderColor: colors.secondary,
        borderRadius: 0,
        backgroundColor: colors.background,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    headerBar: {
        height: 36,
        backgroundColor: colors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    headerLabel: {
        fontFamily: fonts.regular,
        color: colors.textOnPrimary,
        fontSize: 16,
        flex: 1,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentArea: {
        padding: 12,
        backgroundColor: colors.background,
    },
});
