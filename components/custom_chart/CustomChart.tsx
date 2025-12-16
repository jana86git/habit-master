import WindowPanel from '@/components/window_panel/WindowPanel';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import React, { useState } from 'react';
import {
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Svg, {
    Circle,
    Defs,
    Line,
    LinearGradient,
    Path,
    Rect,
    Stop,
} from 'react-native-svg';

type StockChartProps = {
    data: { value: number; label: string; dataPointText: string }[];
};

export const StockChart = ({ data }: StockChartProps) => {

    // Early return if no data
    if (!data || data.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No data available</Text>
                </View>
            </View>
        );
    }

    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [dimensions, setDimensions] = useState({
        width: Dimensions.get('window').width - 32,
        height: 300
    });

    const padding = 40;
    const chartWidth = dimensions.width - padding * 2;
    const chartHeight = dimensions.height - padding * 2;

    // Calculate bounds
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Map data to coordinates
    const points = data.map((d, i) => ({
        x: data.length === 1 ? padding + chartWidth / 2 : padding + (chartWidth / (data.length - 1)) * i,
        y: padding + chartHeight - ((d.value - minValue) / valueRange) * chartHeight,
        value: d.value,
        label: d.label,
        index: i
    }));

    // Create path for line chart
    const linePath = points.reduce((path, point, i) => {
        if (i === 0) {
            return `M ${point.x} ${point.y}`;
        }
        return `${path} L ${point.x} ${point.y}`;
    }, '');

    // Create path for area fill
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${dimensions.height - padding} L ${points[0].x} ${dimensions.height - padding} Z`;

    // Pan responder for touch handling
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => handleTouch(e.nativeEvent.locationX),
        onPanResponderMove: (e) => handleTouch(e.nativeEvent.locationX),
        onPanResponderRelease: () => setHoveredPoint(null),
    });

    const handleTouch = (touchX: number) => {
        let closest = null;
        let minDist = Infinity;

        points.forEach(p => {
            const dist = Math.abs(p.x - touchX);
            if (dist < minDist && dist < 30) {
                minDist = dist;
                closest = p.index;
            }
        });

        setHoveredPoint(closest);
    };

    const uniqueDates = [...new Set(data.map(d => d.label))];

    return (
        <View style={styles.container}>
            <View>


                <View
                    style={[styles.chartContainer, { height: dimensions.height }]}
                    onLayout={(e) => {
                        const { width } = e.nativeEvent.layout;
                        setDimensions({ width, height: 300 });
                    }}
                    {...panResponder.panHandlers}
                >
                    <Svg width={dimensions.width} height={dimensions.height}>
                        <Defs>
                            <LinearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={colors.background} stopOpacity="1" />
                                <Stop offset="1" stopColor={colors.background2} stopOpacity="1" />
                            </LinearGradient>
                            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={colors.primary} stopOpacity="0.3" />
                                <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                            </LinearGradient>
                        </Defs>

                        {/* Background */}
                        <Rect
                            x="0"
                            y="0"
                            width={dimensions.width}
                            height={dimensions.height}
                            fill="url(#bgGradient)"
                        />

                        {/* Grid - Horizontal lines */}
                        {[...Array(11)].map((_, i) => (
                            <Line
                                key={`h-${i}`}
                                x1="0"
                                y1={(dimensions.height / 10) * i}
                                x2={dimensions.width}
                                y2={(dimensions.height / 10) * i}
                                stroke={colors.subtle}
                                strokeWidth="1"
                                strokeOpacity="0.2"
                            />
                        ))}

                        {/* Grid - Vertical lines */}
                        {[...Array(11)].map((_, i) => (
                            <Line
                                key={`v-${i}`}
                                x1={(dimensions.width / 10) * i}
                                y1="0"
                                x2={(dimensions.width / 10) * i}
                                y2={dimensions.height}
                                stroke={colors.subtle}
                                strokeWidth="1"
                                strokeOpacity="0.2"
                            />
                        ))}

                        {/* Area fill */}
                        <Path d={areaPath} fill="url(#areaGradient)" />

                        {/* Line */}
                        <Path
                            d={linePath}
                            stroke={colors.primary}
                            strokeWidth="2"
                            fill="none"
                        />

                        {/* Data points */}
                        {points.map((p, i) => {
                            const isHovered = hoveredPoint === i;
                            return (
                                <Circle
                                    key={i}
                                    cx={p.x}
                                    cy={p.y}
                                    r={isHovered ? 6 : 4}
                                    fill={isHovered ? colors.text : colors.primary}
                                    stroke={isHovered ? colors.primary : 'none'}
                                    strokeWidth={isHovered ? 2 : 0}
                                />
                            );
                        })}
                    </Svg>

                    {/* Tooltip */}
                    {hoveredPoint !== null && points[hoveredPoint] && data[hoveredPoint] && (
                        <View
                            style={[
                                styles.tooltip,
                                {
                                    left: Math.max(10, Math.min(points[hoveredPoint].x - 60, dimensions.width - 130)),
                                    top: points[hoveredPoint].y > 100 ? points[hoveredPoint].y - 50 : points[hoveredPoint].y + 20,
                                }
                            ]}
                        >
                            <Text style={styles.tooltipText}>
                                {data[hoveredPoint].label}: {data[hoveredPoint].dataPointText}
                            </Text>
                        </View>
                    )}

                    {/* Y-axis labels */}
                    <View style={styles.yAxisLabels}>
                        {[...Array(6)].map((_, i) => {
                            const value = minValue + (valueRange / 5) * i;
                            const y = dimensions.height - padding - (chartHeight / 5) * i;
                            return (
                                <Text
                                    key={i}
                                    style={[styles.axisLabel, { top: y - 8 }]}
                                >
                                    {value.toFixed(0)}
                                </Text>
                            );
                        })}
                    </View>

                    {/* X-axis labels */}
                    <View style={styles.xAxisLabels}>
                        {uniqueDates.map((date, i) => {
                            const x = uniqueDates.length === 1 ? padding + chartWidth / 2 : padding + (chartWidth / (uniqueDates.length - 1)) * i;
                            return (
                                <Text
                                    key={i}
                                    style={[styles.axisLabel, { left: x - 30, width: 60, textAlign: 'center' }]}
                                >
                                    {date.slice(5)}
                                </Text>
                            );
                        })}
                    </View>
                </View>

                {/* Statistics Grid - 2x2 */}
                <View style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                        <WindowPanel title="Current" style={styles.statPanel}>
                            <Text style={styles.statValue}>{data[data.length - 1].value}</Text>
                        </WindowPanel>
                        <WindowPanel title="Average" style={styles.statPanel}>
                            <Text style={styles.statValue}>
                                {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}
                            </Text>
                        </WindowPanel>
                    </View>
                    <View style={styles.statsRow}>
                        <WindowPanel title="Min" style={styles.statPanel}>
                            <Text style={styles.statValue}>{Math.min(...values)}</Text>
                        </WindowPanel>
                        <WindowPanel title="Max" style={styles.statPanel}>
                            <Text style={styles.statValue}>{Math.max(...values)}</Text>
                        </WindowPanel>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.subtle,
    },
    chartContainer: {
        backgroundColor: colors.background,
        borderRadius: 8,
        position: 'relative',
        marginBottom: 20,
    },
    tooltip: {
        position: 'absolute',
        backgroundColor: colors.background + 'F2',
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        minWidth: 120,
    },
    tooltipText: {
        color: colors.text,
        fontSize: 13,
        textAlign: 'center',
    },
    yAxisLabels: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },
    xAxisLabels: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 10,
        flexDirection: 'row',
    },
    axisLabel: {
        color: colors.text,
        fontSize: 8,
        position: 'absolute',
        fontFamily: fonts.bold,
    },
    statsGrid: {
        gap: 12,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statPanel: {
        flex: 1,
    },
    statValue: {
        fontFamily: fonts.bold,
        color: colors.text,
        fontSize: 24,
        textAlign: 'left',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontFamily: fonts.regular,
        color: colors.subtle,
        fontSize: 16,
    },
});

export default StockChart;