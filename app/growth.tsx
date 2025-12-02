import Button3D from "@/components/button_3d/Button3D";
import { GrowthChart } from "@/components/growths/GrowthChart";
import GrowthProvider, { useGrowth } from "@/components/growths/GrowthProvider";
import WindowPanel from "@/components/window_panel/WindowPanel";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

function GrowthContent() {
    const { state, dispatch } = useGrowth();
    const filter = state.filter;

    const filterOptions = [
        { key: "today", label: "1D" },
        { key: "last_7_days", label: "7D" },
        { key: "last_month", label: "1M" },
        { key: "last_365_days", label: "1Y" },
        { key: "all", label: "All" }
    ];

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.container}>
                <WindowPanel title="Growth Map" style={styles.panel}>
                    <GrowthChart />
                </WindowPanel>

                {/* Filter Buttons Row */}
                <View style={styles.filterRow}>
                    {filterOptions.map((option) => (
                        <Button3D
                            key={option.key}
                            onClick={() => dispatch({ type: "SET_FILTER", payload: option.key })}
                            active={filter === option.key}
                            style={styles.filterButton}
                            textStyle={styles.filterButtonText}
                        >
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", height: 40 }}>
                                <Text style={styles.filterButtonText}>
                                    {option.label}
                                </Text>
                            </View>
                        </Button3D>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

export default function Growth() {
    return (
        <GrowthProvider>
            <GrowthContent />
        </GrowthProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

        gap: 16,
    },
    panel: {
        marginBottom: 8,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        paddingHorizontal: 4,
    },
    filterButton: {
        flex: 1,
    },
    filterButtonText: {
        fontSize: 14,
        fontFamily: fonts.bold,
    },
});

interface CompletionGroup {
    value: number;
    label: string;
    dataPointText: string;
}

interface DBRow {
    group_id: number;
    totalValue: number;
    startLabel: string;
    endLabel: string;
}
