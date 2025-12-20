import WindowModal from "@/components/window_modal/WindowModal";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { db } from "@/db/db";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DayData {
    date: string;
    completionPercentage: number;
    totalCompleted: number;
    totalTasks: number;
}

interface MonthData {
    monthName: string;
    year: number;
    weeks: (DayData | null)[][];
}

export default function GrowthConsistancyGrid() {
    const [monthsData, setMonthsData] = useState<MonthData[]>([]);
    const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = previous month, etc.
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

    // Calculate cell width as 3.3% of device width
    const screenWidth = Dimensions.get("window").width;
    const cellWidth = screenWidth * 0.04;

    /**
     * Get the start and end dates for 3 consecutive months based on offset
     */
    const getDateRange = (offset: number) => {
        const today = new Date();

        // Calculate the start of the first month to display
        const firstMonthStart = new Date(today.getFullYear(), today.getMonth() + offset, 1);

        // Calculate the end of the third month
        const thirdMonthEnd = new Date(today.getFullYear(), today.getMonth() + offset + 3, 0);

        return {
            startDate: firstMonthStart.toISOString().split('T')[0],
            endDate: thirdMonthEnd.toISOString().split('T')[0],
            firstMonthStart,
        };
    };

    /**
     * Function to get the number of completed tasks and completed habits which are not absent
     * for 3 months, grouped by day
     */
    const getCompletedTasksAndHabits = async (offset: number) => {
        try {
            if (!db) return;

            const { startDate, endDate } = getDateRange(offset);

            // Query to get daily completion counts
            const query = `
                WITH RECURSIVE dates(date) AS(
    SELECT date('${startDate}')
                    UNION ALL
                    SELECT date(date, '+1 day')
                    FROM dates
                    WHERE date < '${endDate}'
),
    daily_counts AS(
        SELECT 
                        d.date,
        COUNT(DISTINCT CASE 
                            WHEN c.task_id IS NOT NULL THEN c.id 
                        END) as completed_tasks,
        COUNT(DISTINCT CASE 
                            WHEN c.subtask_id IS NOT NULL THEN c.id 
                        END) as completed_subtasks,
        COUNT(DISTINCT CASE 
                            WHEN c.habit_id IS NOT NULL AND(c.absent IS NULL OR c.absent = 0) THEN c.id 
                        END) as completed_habits
                    FROM dates d
                    LEFT JOIN completions c ON date(c.log_date) = d.date
                    GROUP BY d.date
    ),
        daily_totals AS(
            SELECT 
                        d.date,
            COUNT(DISTINCT t.id) as total_tasks,
            COUNT(DISTINCT s.id) as total_subtasks,
            COUNT(DISTINCT CASE 
                            WHEN h.id IS NOT NULL 
                            AND date(d.date) BETWEEN date(h.start_date) AND COALESCE(date(h.end_date), '9999-12-31')
                            THEN h.id 
                        END) as total_habits
                    FROM dates d
                    LEFT JOIN tasks t ON date(d.date) BETWEEN date(t.start_date) AND date(t.end_date)
                    LEFT JOIN subtasks s ON s.task_id = t.id
                    LEFT JOIN habits h ON date(d.date) BETWEEN date(h.start_date) AND COALESCE(date(h.end_date), '9999-12-31')
                    GROUP BY d.date
        )
SELECT
dc.date,
    (dc.completed_tasks + dc.completed_subtasks + dc.completed_habits) as total_completed,
    (dt.total_tasks + dt.total_subtasks + dt.total_habits) as total_items
                FROM daily_counts dc
                JOIN daily_totals dt ON dc.date = dt.date
                ORDER BY dc.date ASC
            `;

            const results = await db.getAllAsync<{
                date: string;
                total_completed: number;
                total_items: number;
            }>(query);

            // Calculate completion percentage for each day
            const processedData: DayData[] = results.map(row => {
                const percentage = row.total_items > 0
                    ? Math.round((row.total_completed / row.total_items) * 100)
                    : 0;

                return {
                    date: row.date,
                    completionPercentage: percentage,
                    totalCompleted: row.total_completed,
                    totalTasks: row.total_items,
                };
            });

            // Organize data by months
            const monthsMap = new Map<string, DayData[]>();
            processedData.forEach(day => {
                const date = new Date(day.date);
                const monthKey = `${date.getFullYear()} -${date.getMonth()} `;

                if (!monthsMap.has(monthKey)) {
                    monthsMap.set(monthKey, []);
                }
                monthsMap.get(monthKey)!.push(day);
            });

            // Create month data structures
            const months: MonthData[] = [];
            const today = new Date();

            for (let i = 0; i < 3; i++) {
                const monthDate = new Date(today.getFullYear(), today.getMonth() + offset + i, 1);
                const monthKey = `${monthDate.getFullYear()} -${monthDate.getMonth()} `;
                const monthDays = monthsMap.get(monthKey) || [];

                const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
                const year = monthDate.getFullYear();

                months.push({
                    monthName,
                    year,
                    weeks: organizeIntoWeeks(monthDays, monthDate),
                });
            }

            setMonthsData(months);
        } catch (error) {
            console.log("Error fetching completion data:", error);
        }
    };

    useEffect(() => {
        getCompletedTasksAndHabits(monthOffset);
    }, [monthOffset]);

    /**
     * Get the opacity based on completion percentage
     */
    const getOpacity = (percentage: number): number => {
        if (percentage === 0) return 0.1;
        if (percentage <= 25) return 0.3;
        if (percentage <= 50) return 0.5;
        if (percentage <= 75) return 0.7;
        return 1.0;
    };

    /**
     * Organize data into weeks for grid display for a specific month
     */
    const organizeIntoWeeks = (monthDays: DayData[], monthDate: Date): (DayData | null)[][] => {
        const weeks: (DayData | null)[][] = [];
        let currentWeek: (DayData | null)[] = [];

        // Get the first day of the month
        const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

        // Fill initial empty days
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null);
        }

        // Get the last day of the month
        const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        const totalDays = lastDayOfMonth.getDate();

        // Create a map for quick lookup
        const daysMap = new Map<string, DayData>();
        monthDays.forEach(day => {
            daysMap.set(day.date, day);
        });

        // Add all days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
                .toISOString().split('T')[0];

            const dayData = daysMap.get(dateStr) || {
                date: dateStr,
                completionPercentage: 0,
                totalCompleted: 0,
                totalTasks: 0,
            };

            currentWeek.push(dayData);

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Fill remaining empty days
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        return weeks;
    };

    const handlePrevious = () => {
        setMonthOffset(monthOffset - 3);
    };

    const handleNext = () => {
        setMonthOffset(monthOffset + 3);
    };

    return (
        <View style={styles.container}>
            {/* Navigation */}
            <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={handlePrevious} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>

                <Text style={styles.title}>Activity Grid</Text>

                <TouchableOpacity onPress={handleNext} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Months Grid */}
            <View style={styles.monthsContainer}>
                {monthsData.map((month, monthIndex) => (
                    <View key={monthIndex} style={styles.monthContainer}>
                        {/* Grid for this month */}
                        <View style={styles.grid}>
                            {month.weeks.map((week, weekIndex) => (
                                <View key={weekIndex} style={styles.week}>
                                    {week.map((day, dayIndex) => {
                                        if (!day) {
                                            return <View key={dayIndex} style={[styles.emptyCell, { width: cellWidth, height: cellWidth }]} />;
                                        }

                                        const opacity = getOpacity(day.completionPercentage);

                                        return (
                                            <TouchableOpacity
                                                key={dayIndex}
                                                onPress={() => setSelectedDay(day)}
                                                style={[
                                                    styles.cell,
                                                    {
                                                        width: cellWidth,
                                                        height: cellWidth,
                                                        backgroundColor: colors.success,
                                                        opacity: opacity,
                                                    },
                                                ]}
                                            />
                                        );
                                    })}
                                </View>
                            ))}
                        </View>

                        {/* Month label below the grid */}
                        <Text style={styles.monthLabel}>{month.monthName}</Text>
                    </View>
                ))}
            </View>

            {/* Footer with Year and Legend */}
            <View style={styles.footerContainer}>
                <Text style={styles.yearText}>
                    {new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1).getFullYear()}
                </Text>

                <View style={styles.legendContainer}>
                    <Text style={styles.legendText}>Less</Text>
                    <View style={[styles.legendCell, { backgroundColor: colors.success, opacity: 0.1 }]} />
                    <View style={[styles.legendCell, { backgroundColor: colors.success, opacity: 0.3 }]} />
                    <View style={[styles.legendCell, { backgroundColor: colors.success, opacity: 0.5 }]} />
                    <View style={[styles.legendCell, { backgroundColor: colors.success, opacity: 0.7 }]} />
                    <View style={[styles.legendCell, { backgroundColor: colors.success, opacity: 1.0 }]} />
                    <Text style={styles.legendText}>More</Text>
                </View>
            </View>

            {/* Day Details Modal */}
            <WindowModal
                visible={selectedDay !== null}
                onClose={() => setSelectedDay(null)}
                label={selectedDay ? new Date(selectedDay.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : 'Day Details'}
            >
                <View style={styles.modalBody}>
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Date:</Text>
                        <Text style={styles.modalValue}>
                            {selectedDay && new Date(selectedDay.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </Text>
                    </View>
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Completed:</Text>
                        <Text style={styles.modalValue}>{selectedDay?.totalCompleted || 0}</Text>
                    </View>
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Total Tasks/Habits:</Text>
                        <Text style={styles.modalValue}>{selectedDay?.totalTasks || 0}</Text>
                    </View>
                    <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Completion Rate:</Text>
                        <Text style={[styles.modalValue, styles.percentageText]}>
                            {selectedDay?.completionPercentage || 0}%
                        </Text>
                    </View>
                </View>
            </WindowModal>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {

    },
    navigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    navButton: {
        padding: 8,
        minWidth: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: colors.text,
    },
    monthsContainer: {
        flexDirection: 'row',
        gap: 0,
        flex: 1,
    },
    monthContainer: {
        flex: 1,
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'row',
        gap: 3,
    },
    week: {
        gap: 3,
        // backgroundColor: "green"
    },
    cell: {
        borderRadius: 2,
    },
    emptyCell: {
        // Width and height are set dynamically based on screen size
    },
    monthLabel: {
        fontSize: 11,
        fontFamily: fonts.bold,
        color: colors.text,
        marginTop: 8,
        textAlign: 'center',
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    yearText: {
        fontSize: 14,
        fontFamily: fonts.bold,
        color: colors.text,
    },
    legendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendText: {
        fontSize: 10,
        fontFamily: fonts.regular,
        color: colors.subtle,
        marginHorizontal: 4,
    },
    legendCell: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    modalBody: {
        gap: 12,
        padding: 8
    },
    modalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalLabel: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.subtle,
    },
    modalValue: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: colors.text,
    },
    percentageText: {
        color: colors.success,
    },
});