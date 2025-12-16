
import StockChart from "@/components/custom_chart/CustomChart";
import { useGrowth } from "@/components/growths/GrowthProvider";
import { db } from "@/db/db";
import React, { useEffect } from "react";
import { View } from "react-native";

export function GrowthChart() {
    const { state, dispatch } = useGrowth();
    const groupedData = state.groupedData;
    const roundedMax = state.roundedMax;
    const roundedMin = state.roundedMin;
    const filter = state.filter;


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
            params: [start.split("T")[0]],
        };
    };

    async function fetchCompletions() {
        try {
            if (!db) return;

            // ✅ BUILD FILTER SQL
            const { where, params } = getFilterSQL();

            // ✅ First, get the total count to determine if we need sampling
            const countResult = await db.getFirstAsync<{ total: number }>(
                `SELECT COUNT(*) as total FROM completions ${where}`,
                params
            );

            const totalRows = countResult?.total ?? 0;

            if (totalRows === 0) {
                dispatch({ type: "SET_GROUPED_DATA", payload: [] });
                return;
            }

            const targetPoints = 15;
            let rows: Array<{
                log_date: string;
                running_total: number;
            }>;

            if (totalRows <= targetPoints) {
                // If we have 20 or fewer rows, fetch all with running totals
                rows = await db.getAllAsync<{
                    log_date: string;
                    running_total: number;
                }>(
                    `
                    SELECT 
                        log_date,
                        SUM(point) OVER (
                            ORDER BY log_date
                            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                        ) AS running_total
                    FROM completions
                    ${where}
                    ORDER BY log_date;
                    `,
                    params
                );
            } else {
                // Use SQL to sample data into exactly 20 groups and pick the last row from each group
                // UNION with the first and last rows to ensure they're always included
                rows = await db.getAllAsync<{
                    log_date: string;
                    running_total: number;
                }>(
                    `
                    WITH all_data AS (
                        SELECT 
                            log_date,
                            SUM(point) OVER (
                                ORDER BY log_date
                                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                            ) AS running_total
                        FROM completions
                        ${where}
                    ),
                    bucketed_data AS (
                        SELECT 
                            log_date,
                            running_total,
                            NTILE(${targetPoints}) OVER (ORDER BY log_date) AS bucket
                        FROM all_data
                    ),
                    ranked_data AS (
                        SELECT 
                            log_date,
                            running_total,
                            bucket,
                            ROW_NUMBER() OVER (
                                PARTITION BY bucket
                                ORDER BY log_date DESC
                            ) AS rn
                        FROM bucketed_data
                    ),
                    sampled AS (
                        SELECT log_date, running_total
                        FROM ranked_data
                        WHERE rn = 1
                    ),
                    first_row AS (
                        SELECT log_date, running_total
                        FROM all_data
                        ORDER BY log_date ASC
                        LIMIT 1
                    ),
                    last_row AS (
                        SELECT log_date, running_total
                        FROM all_data
                        ORDER BY log_date DESC
                        LIMIT 1
                    )
                    SELECT DISTINCT log_date, running_total
                    FROM (
                        SELECT * FROM first_row
                        UNION
                        SELECT * FROM sampled
                        UNION
                        SELECT * FROM last_row
                    )
                    ORDER BY log_date;
                    `,
                    params
                );
            }

            console.log("Rows fetched: ", rows);

            // ✅ Create chart points directly from the SQL results
            const sampledData = rows.map((r) => ({
                value: Math.ceil(r.running_total),
                label: r.log_date.split("T")[0],
                dataPointText: Math.ceil(r.running_total).toString(),
            }));

            // ✅ PADDING LOGIC - add one point for "today" if there's a gap
            const lastDate = new Date(rows[rows.length - 1].log_date);
            const today = new Date();
            const diffDays = Math.max(
                0,
                Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
            );

            const lastValue = sampledData[sampledData.length - 1].value;
            if (diffDays > 0) {
                // Only add one point for "today" if there's a gap
                const d = new Date(today);
                sampledData.push({
                    value: lastValue,
                    label: d.toISOString().split("T")[0],
                    dataPointText: String(lastValue),
                });
            }

            console.log("Sampled data points: ", sampledData.length, sampledData);

            dispatch({ type: "SET_GROUPED_DATA", payload: sampledData });

            const values = sampledData.map((d) => Math.round(d.value));
            const maxVal = Math.max(...values);
            const minVal = Math.min(...values);

            console.log("Max/Min values:", maxVal, minVal);

            if (minVal < 0) {
                const maxAbsolute = Math.max(Math.abs(maxVal), Math.abs(minVal));
                dispatch({ type: "SET_ROUNDED_MAX", payload: maxAbsolute });
                dispatch({ type: "SET_ROUNDED_MIN", payload: -maxAbsolute });
            } else {
                dispatch({ type: "SET_ROUNDED_MAX", payload: Math.ceil(maxVal) });
                dispatch({ type: "SET_ROUNDED_MIN", payload: 0 });
            }
        } catch (error) {
            console.error("Error fetching grouped completions:", error);
        }
    }

    async function fetchDebuggingCompletions() {
        try {
            if (!db) {
                console.error("Database not initialized");
                return;
            }
            const query = `SELECT * FROM completions`;
            const rows = await db.getAllAsync(query);
            console.log("Debugging completions: ", rows);
        } catch (error) {
            console.error(error);
        }
    }

    // ✅ REFRESH ON FILTER CHANGE
    useEffect(() => {
        fetchCompletions();
        fetchDebuggingCompletions();
    }, [filter]);

    return (
        <View>
            <StockChart data={groupedData} />
        </View>
    );
}