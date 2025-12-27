import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

interface FullScreenLoaderProps {
    show: boolean;
    loop?: boolean;
    progress?: number;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
    show,
    loop = true,
    progress = 0
}) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const pulseAnim = useState(new Animated.Value(1))[0];

    useEffect(() => {
        if (show && loop) {
            // Animate progress bar in loop mode
            const interval = setInterval(() => {
                setAnimatedProgress((prev) => {
                    if (prev >= 100) return 0;
                    return prev + 2;
                });
            }, 50);

            return () => clearInterval(interval);
        } else if (show && !loop) {
            // Use provided progress value
            setAnimatedProgress(progress);
        }
    }, [show, loop, progress]);

    useEffect(() => {
        if (show) {
            // Pulse animation for the dots
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [show]);

    if (!show) return null;

    const displayProgress = loop ? animatedProgress : progress;
    const isComplete = !loop && displayProgress >= 100;
    const labelText = isComplete ? 'complete!' : 'loading..';

    return (
        <View style={styles.container}>
            <View style={styles.centerWrapper}>
                <View style={styles.loaderContainer}>
                    <Text style={styles.loadingText}>{labelText}</Text>

                    <View style={styles.progressBarContainer}>
                        {/* Outer border - white/light */}
                        <View style={styles.progressBarOuter}>
                            {/* Inner black background */}
                            <View style={styles.progressBarInner}>
                                {/* Blue progress fill */}
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${displayProgress}%` }
                                    ]}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Progress percentage */}
                    {!loop && (
                        <Text style={styles.percentageText}>
                            {Math.round(displayProgress)}%
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
    },
    centerWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    loaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontFamily: fonts.bold,
        fontSize: 18,
        color: colors.text,
        marginBottom: 20,
        letterSpacing: 2,
        textTransform: 'lowercase',
    },
    progressBarContainer: {
        width: SCREEN_WIDTH * 0.7,
        maxWidth: 500,
    },
    progressBarOuter: {
        backgroundColor: colors.subtle,
        borderRadius: 8,
        padding: 4,
        shadowColor: colors.subtle,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    progressBarInner: {
        backgroundColor: colors.background,
        borderRadius: 4,
        height: 24,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.info,
        borderRadius: 2,
    },
    percentageText: {
        fontFamily: fonts.regular,
        fontSize: 18,
        color: colors.text,
        marginTop: 15,
        letterSpacing: 1,
    },
});

export default FullScreenLoader;
