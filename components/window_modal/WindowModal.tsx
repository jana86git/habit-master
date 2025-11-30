import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';

interface WindowModalProps {
    children: React.ReactNode;
    visible: boolean;
    onClose?: () => void;
    label?: string;
    style?: ViewStyle;
}

export default function WindowModal({
    children,
    visible,
    onClose,
    label = 'Modal',
    style,
}: WindowModalProps) {
    const [contentHeight, setContentHeight] = useState(1);
    const [containerHeight, setContainerHeight] = useState(1);

    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const scrollOffset = useRef(0);

    // Track scroll offset for PanResponder
    useEffect(() => {
        const listener = scrollY.addListener(({ value }) => {
            scrollOffset.current = value;
        });
        return () => scrollY.removeListener(listener);
    }, [scrollY]);

    const thumbHeight = 60; // Fixed thumb height
    const scrollableHeight = contentHeight - containerHeight;
    const trackScrollableHeight = containerHeight - thumbHeight;

    // Refs for dimensions
    const dimensions = useRef({ contentHeight: 1, containerHeight: 1, scrollableHeight: 1, trackScrollableHeight: 1 });

    useEffect(() => {
        dimensions.current = {
            contentHeight,
            containerHeight,
            scrollableHeight: contentHeight - containerHeight,
            trackScrollableHeight: containerHeight - thumbHeight
        };
    }, [contentHeight, containerHeight, thumbHeight]);

    const startOffset = useRef(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                startOffset.current = scrollOffset.current;
                scrollY.stopAnimation();
            },
            onPanResponderMove: (evt, gestureState) => {
                const { scrollableHeight, trackScrollableHeight } = dimensions.current;
                if (trackScrollableHeight <= 0 || scrollableHeight <= 0) return;

                const ratio = scrollableHeight / trackScrollableHeight;
                const newOffset = startOffset.current + gestureState.dy * ratio;
                const clampedOffset = Math.max(0, Math.min(newOffset, scrollableHeight));

                scrollViewRef.current?.scrollTo({ y: clampedOffset, animated: false });
            },
        })
    ).current;

    const scrollIndicatorPosition = scrollY.interpolate({
        inputRange: [0, Math.max(1, scrollableHeight)],
        outputRange: [0, Math.max(1, trackScrollableHeight)],
        extrapolate: 'clamp',
    });

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"

            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableWithoutFeedback>
                    <View style={[styles.windowContainer, style]}>
                        {/* Header Bar */}
                        <View style={styles.headerBar}>
                            <Text style={styles.headerLabel}>
                                {label.length > 16 ? `${label.substring(0, 16)}...` : label}
                            </Text>
                            <View style={styles.headerButtons}>
                                <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                                    <MaterialCommunityIcons name="close" size={24} color={colors.textOnPrimary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Content Area */}
                        <View style={[styles.container, { paddingRight: contentHeight > containerHeight ? 20 : 0 }]}>
                            <Animated.ScrollView
                                ref={scrollViewRef}
                                style={styles.scrollView}
                                contentContainerStyle={styles.contentContainer}
                                onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
                                onContentSizeChange={(w, h) => setContentHeight(h)}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                    { useNativeDriver: false }
                                )}
                                scrollEventThrottle={16}
                                showsVerticalScrollIndicator={false}
                            >
                                {children}
                            </Animated.ScrollView>

                            {contentHeight > containerHeight && (
                                <View style={styles.track}>
                                    <Animated.View
                                        {...panResponder.panHandlers}
                                        style={[
                                            styles.thumb,
                                            {
                                                height: thumbHeight,
                                                transform: [{ translateY: scrollIndicatorPosition }],
                                            },
                                        ]}
                                    >
                                        <MaterialCommunityIcons name="drag-vertical" size={16} color={colors.textOnPrimary} />
                                    </Animated.View>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    windowContainer: {
        width: '95%',
        minHeight: '40%',
        maxHeight: '70%',
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
    },
    headerButtons: {
        flexDirection: 'row',
    },
    headerButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.textOnPrimary,
    },
    container: {
        flexShrink: 1,
        position: 'relative',
        backgroundColor: colors.background,
        overflow: 'hidden',
    },
    scrollView: {
        flexGrow: 0,
        flexShrink: 1,
    },
    contentContainer: {
        padding: 4,
    },
    track: {
        position: 'absolute',
        right: 0,
        top: 4,
        bottom: 4,
        width: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
    },
    thumb: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: colors.primary,
        opacity: 0.9,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
});
