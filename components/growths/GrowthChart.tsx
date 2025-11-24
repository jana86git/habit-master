
import { useGrowth } from "@/components/growths/GrowthProvider";
import { colors } from "@/constants/colors";
import { db } from "@/db/db";
import React, { useEffect } from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { styles } from "./styles";
import { DBRow } from "./types";
export function GrowthChart() {
    const {state,dispatch} = useGrowth();
    const groupedData = state.groupedData;
    const roundedMax = state.roundedMax;
    const roundedMin = state.roundedMin;
    const filter = state.filter;
  

    const width = Dimensions.get("window").width;
    const height = Dimensions.get("window").height;
    const totalGroups = 20;

    // ✅ FORMAT DATE (YYYY-MM-DD)
    const format = (d: Date) => d.toISOString().split("T")[0]; 

    // ✅ DETERMINE DATE RANGE BASED ON FILTER
    const getFilterSQL = () => {
        const today = new Date();
        let start: string | null = null;

        if (filter === "today") {
            start = format(today);
        } else if (filter === "last_7_days") {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            start = format(d);
        } else if (filter === "last_month") {
            const d = new Date();
            d.setMonth(d.getMonth() - 1);
            start = format(d);
        } else if (filter === "last_365_days") {
            const d = new Date();
            d.setDate(d.getDate() - 365);
            start = format(d);
        }

        // all → no WHERE clause
        if (!start) return { where: "", params: [] };

        return {
            where: "WHERE DATE(log_date) >= DATE(?)",
            params: [start],
        };
    };

    async function fetchCompletions() {
        try {
            if (!db) return;

            // ✅ BUILD FILTER SQL
            const { where, params } = getFilterSQL();

            // ✅ COUNT BASED ON FILTER
            const count = await db.getFirstAsync<{ total: number }>(
                `SELECT COUNT(*) as total FROM completions ${where}`,
                params
            );

            console.log("COUNT: ", count);
            if(!count) return;

            const totalRows = count.total ?? 0;
            if (totalRows === 0) {
                // setGroupedData([]);
                dispatch({type: "SET_GROUPED_DATA", payload: []});
                return;
            }

            const groupSize = Math.ceil(totalRows / totalGroups);

            // ✅ 2. Fetch grouped data (FILTER APPLIED)
            const rows = await db.getAllAsync<DBRow>(
                `
                SELECT 
                    group_id,
                    SUM(point) AS totalValue,
                    MIN(log_date) AS startLabel,
                    MAX(log_date) AS endLabel
                FROM (
                    SELECT 
                        *,
                        CAST((ROW_NUMBER() OVER (ORDER BY log_date) - 1) / ? AS INTEGER) AS group_id
                    FROM completions
                    ${where}
                )
                GROUP BY group_id
                ORDER BY group_id;
                `,
                [groupSize, ...params]
            );

            let value = 0;

            // ✅ Create chart points
            const formatted = rows.map((r) => {
                value += r.totalValue;

                return {
                    value: Math.ceil(value),
                    label: r.startLabel.split("T")[0],
                    dataPointText: Math.ceil(value).toString(),
                };
            });

            // ✅ PADDING LOGIC (unchanged)
            const lastDate = new Date(rows[rows.length - 1].endLabel);
            const today = new Date();
            const diffDays = Math.max(
                0,
                Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
            );

            for (let i = 1; i <= diffDays; i++) {
                const d = new Date(lastDate);
                d.setDate(lastDate.getDate() + i);

                formatted.push({
                    value,
                    label: d.toISOString().split("T")[0],
                    dataPointText: String(Math.ceil(value)),
                });
            }

            console.log("Formatted data: ", formatted)

           
            dispatch({type: "SET_GROUPED_DATA", payload: formatted});

            const values = formatted.map((d) => Math.round(d.value));
            const maxVal = Math.max(...values);
            const minVal = Math.min(...values);

            console.log(maxVal, minVal)

          

            if (minVal < 0) {
                const maxAbsolute = Math.max(Math.abs(maxVal), Math.abs(minVal));
               

               

            
                dispatch({type: "SET_ROUNDED_MAX", payload: maxAbsolute});
                dispatch({type: "SET_ROUNDED_MIN", payload: -maxAbsolute});
            } else {
             
                dispatch({type: "SET_ROUNDED_MAX", payload: Math.ceil(maxVal)});
                dispatch({type: "SET_ROUNDED_MIN", payload: 0});
            }
        } catch (error) {
            console.error("Error fetching grouped completions:", error);
        }
    }

    // ✅ REFRESH ON FILTER CHANGE
    useEffect(() => {
        fetchCompletions();
    }, [filter]);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.container}>
                <Text style={styles.title}>Growth Map</Text>

                {/* ✅ FILTER GRID */}
                <View style={styles.filterGrid}>
                    {["today", "last_7_days", "last_month", "last_365_days", "all"].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterItem,
                                filter === f && styles.filterItemActive
                            ]}
                            onPress={() => dispatch({ type: "SET_FILTER", payload: f })}
                        >
                            <Text
                                style={{
                                    color: filter === f ? "white" : "black",
                                    fontWeight: "600",
                                }}
                            >
                                {f.replace(/_/g, " ")}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {groupedData.length > 0 ? (
                    <LineChart
                        data={groupedData}
                        width={(width * 90) / 100}
                        height={roundedMin < 0 ? 100 : 300}
                        spacing={Math.round((width - 40) / totalGroups)}
                        color="#FF3B30"
                        hideYAxisText
                        thickness={3}
                        startFillColor="rgba(255, 59, 48, 0.3)"
                        endFillColor="rgba(255, 59, 48, 0.01)"
                        startOpacity={0.9}
                        endOpacity={0.2}
                        initialSpacing={0}
                        maxValue={roundedMax}
                        mostNegativeValue={roundedMin}
                        yAxisColor="#ccc"
                        yAxisThickness={1}
                        yAxisOffset={2}
                        hideRules
                        thickness1={1}
                        rulesType="dashed"
                        rulesColor="#ccc"
                        yAxisTextStyle={{ color: colors.text }}
                        xAxisColor="#ccc"
                        xAxisThickness={1}
                        xAxisLabelTextStyle={{ color: colors.text, fontSize: 14, display: "none" }}
                        dataPointsColor="#FF3B30"
                        xAxisTextNumberOfLines={3}
                        dataPointsRadius={1}
                        textColor={colors.text}
                        textFontSize={8}
                        areaChart
                        curved
                    />
                ) : (
                    <Text style={{ color: "gray", marginTop: 20 }}>
                        No completion data available.
                    </Text>
                )}

                <Text>
                    {groupedData[0]?.label} - {groupedData[groupedData.length - 1]?.label}
                </Text>
            </View>
        </ScrollView>
    );
}