import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

export default function RewardChart() {
    // � Example input data
    const rawData = [
        { day_1: -1 },
        { day_1: 22 },
        { day_2: -2 },
        { day_2: 4 },
        { day_2: 12 },
        { day_2: -9 },
        { day_3: 5 },
        { day_3: -3 },
        { day_3: 7 },
        { day_4: 8 },
        { day_4: 10 },
        { day_4: -5 },
        { day_4: 25 },
        { day_5: 12 },
        { day_5: -7 },
        { day_5: 15 },
        { day_5: 20 },
        { day_6: 9 },
        { day_6: -8 },
        { day_6: 14 },
        { day_6: 11 },
        { day_7: -2 },
        { day_7: 16 },
        { day_7: 5 },
        { day_8: -3 },
        { day_8: 19 },
        { day_8: 6 },
        { day_8: 17 },
        { day_9: 2 },
        { day_9: 28 },
        { day_9: -6 },
        { day_9: 9 },
        { day_10: -4 },
        { day_10: 18 },
        { day_10: 3 },
        { day_11: 10 },
        { day_11: -9 },
        { day_11: 26 },
        { day_11: 7 },
        { day_12: 15 },
        { day_12: -8 },
        { day_12: 30 },
        { day_12: 12 },
        { day_13: -1 },
        { day_13: 20 },
        { day_13: 5 },
        { day_13: 14 },
        { day_14: 2 },
        { day_14: -5 },
        { day_14: 17 },
        { day_14: 22 },
        { day_15: 4 },
        { day_15: -3 },
        { day_15: 18 },
        { day_15: 7 },
        { day_16: -10 },
        { day_16: 13 },
        { day_16: 9 },
        { day_16: 25 },
        { day_17: -7 },
        { day_17: 16 },
        { day_17: 8 },
        { day_17: 12 },
        { day_18: 6 },
        { day_18: -4 },
        { day_18: 24 },
        { day_18: 10 },
        { day_19: -2 },
        { day_19: 15 },
        { day_19: 5 },
        { day_19: 21 },
        { day_20: -3 },
        { day_20: 8 },
        { day_20: 19 },
        { day_20: 7 },
        { day_21: 2 },
        { day_21: -6 },
        { day_21: 20 },
        { day_21: 13 },
        { day_22: -5 },
        { day_22: 11 },
        { day_22: 17 },
        { day_22: 9 },
        { day_23: 4 },
        { day_23: -8 },
        { day_23: 23 },
        { day_23: 6 },
        { day_24: -9 },
        { day_24: 10 },
        { day_24: 18 },
        { day_24: 7 },
        { day_25: -4 },
        { day_25: 16 },
        { day_25: 12 },
        { day_25: 8 },
        { day_25: 21 },
    ];

    // ⚙️ Step 1: Aggregate daily totals (O(n))
    const acc = Object.create(null);
    for (let i = 0; i < rawData.length; i++) {
        const item = rawData[i];
        for (const key in item) {
            acc[key] = (acc[key] || 0) + item[key];
        }
    }

    // ⚙️ Step 2: Convert to chart-friendly format
    const transformedData = Object.entries(acc)
        .map(([key, value]) => {
            const dayNum = parseInt(key.split("_")[1]);
            return {
                value,
                label: `D${dayNum}`,
                dataPointText: value.toString(),
            };
        })
        .sort((a, b) => parseInt(a.label.slice(1)) - parseInt(b.label.slice(1)));

    // ⚙️ Step 3: Group into up to 5 total points (adaptive, safe)
    const totalGroups = 5;
    let groupedData = [];

    if (transformedData.length <= totalGroups) {
        // If less data, use as-is (no grouping)
        groupedData = transformedData;
    } else {
        const groupSize = Math.ceil(transformedData.length / totalGroups);
        for (let i = 0; i < transformedData.length; i += groupSize) {
            const chunk = transformedData.slice(i, i + groupSize);
            const totalValue = chunk.reduce((sum, d) => sum + d.value, 0);
            const startLabel = chunk[0].label;
            const endLabel = chunk[chunk.length - 1].label;

            groupedData.push({
                value: totalValue,
                label: `${startLabel}-${endLabel}`,
                dataPointText: totalValue.toString(),
            });
        }
    }

    // ⚙️ Step 4: Render chart
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reward Points Summary (5-Point View)</Text>
            <LineChart
                data={groupedData}
                width={320}
                height={250}
                spacing={60}
                color="#FF3B30"
                thickness={3}
                startFillColor="rgba(255, 59, 48, 0.3)"
                endFillColor="rgba(255, 59, 48, 0.01)"
                startOpacity={0.9}
                endOpacity={0.2}
                initialSpacing={20}
                noOfSections={5}
                yAxisColor="black"
                yAxisThickness={1}
                rulesType="solid"
                rulesColor="gray"
                yAxisTextStyle={{ color: "black" }}
                xAxisColor="black"
                xAxisThickness={1}
                xAxisLabelTextStyle={{ color: "black", fontSize: 10 }}
                dataPointsColor="#FF3B30"
                dataPointsRadius={5}
                textColor="black"
                textFontSize={10}
                textShiftY={-8}
                textShiftX={-5}
                areaChart
                curved
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        color: "black",
    },
});
