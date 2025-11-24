import { GrowthChart } from "@/components/growths/GrowthChart";
import GrowthProvider from "@/components/growths/GrowthProvider";
import { colors } from "@/constants/colors";
import React from "react";
import { ScrollView } from "react-native";


export default function Growth() {
    return (
        <GrowthProvider>
            <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
                <GrowthChart />
            </ScrollView>
        </GrowthProvider>
    )
}

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
