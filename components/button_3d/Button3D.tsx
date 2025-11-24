import { colors } from '@/constants/colors';
import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface Button3DProps {
    children: React.ReactNode;
    onClick: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    active?: boolean;
    disabled?: boolean;
}

const Button3D: React.FC<Button3DProps> = ({
    children,
    onClick,
    style,
    textStyle,
    active = false,
    disabled = false
}) => {
    const [translateY] = useState(new Animated.Value(-4));

    const handlePressIn = () => {
        if (disabled) return;
        Animated.timing(translateY, {
            toValue: -2,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        if (disabled) return;
        Animated.timing(translateY, {
            toValue: -4,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        if (disabled) return;
        onClick();
    };

    // Determine colors based on state
    const getBackgroundColor = () => {
        if (disabled) return colors.buttonDisabled;
        if (active) return colors.buttonActive;
        return colors.buttonOrange;
    };

    const getShadowColor = () => {
        if (disabled) return colors.buttonDisabledShadow;
        if (active) return colors.buttonActiveShadow;
        return colors.buttonOrangeShadow;
    };

    return (
        <View style={[
            styles.outerContainer,
            {
                backgroundColor: getShadowColor(),
                borderColor: getShadowColor(),
            },
            style
        ]}>
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                activeOpacity={disabled ? 1 : 0.9}
                style={styles.touchable}
                disabled={disabled}
            >
                <Animated.View
                    style={[
                        styles.buttonInner,
                        {
                            backgroundColor: getBackgroundColor(),
                            borderColor: getShadowColor(),
                            transform: [{ translateY }],
                            opacity: disabled ? 0.6 : 1,
                        },
                    ]}
                >
                    <Text style={[styles.buttonText, textStyle]}>{children}</Text>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        alignSelf: 'center',
        borderRadius: 8,
        borderWidth: 1.5,
        padding: 0,
    },
    touchable: {
        borderRadius: 6,
    },
    buttonInner: {
        borderRadius: 6,
        borderWidth: 1.5,
        marginHorizontal: -1.5,
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
});

export default Button3D;