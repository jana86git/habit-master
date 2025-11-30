import { useHome } from "@/app/home";
import { colors } from "@/constants/colors";
import { eventEmitter } from '@/constants/eventEmitter';
import { getFontFamily } from "@/constants/fonts";
import { db } from "@/db/db";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import uuid from "react-native-uuid";
import { ModalView } from "../modal/Modal";
import TextInputComponent from "../text_input/TextInput";
import { HabitRecord } from "./types";

/** 📅 Convert ISO date string to human-readable format */
const formatHumanDate = (dateStr: string | null): string => {
    if (!dateStr) return "No end date";

    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
    if (date.getTime() === yesterday.getTime()) return "Yesterday";

    // Format as "Jan 15, 2025"
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/** 🎨 Get category icon based on category name */
const getCategoryIcon = (category: string | null): keyof typeof Ionicons.glyphMap => {
    if (!category) return "pricetag-outline";

    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("work")) return "briefcase-outline";
    if (categoryLower.includes("personal")) return "person-outline";
    if (categoryLower.includes("health")) return "fitness-outline";
    if (categoryLower.includes("study") || categoryLower.includes("learn")) return "book-outline";
    if (categoryLower.includes("home")) return "home-outline";
    if (categoryLower.includes("shopping")) return "cart-outline";
    if (categoryLower.includes("finance")) return "cash-outline";

    return "pricetag-outline";
};


export default function HabitList() {
    const { state, dispatch } = useHome();

    const { selectedDate, completionMap } = state;

    const [habits, setHabits] = useState<HabitRecord[]>([]);

    const fetchData = async () => {
        try {
            if (!db) return;
            const dateISO = selectedDate.toISOString().split("T")[0]; // keep only YYYY-MM-DD

            // Fetch habits
            const habitsRaw = await db.getAllAsync<HabitRecord>(
                `SELECT * FROM habits
                WHERE date(start_date) <= date(?)
                  AND (end_date IS NULL OR date(end_date) >= date(?))
                  AND (
                    frequency = 'Daily'
                    OR (frequency = 'Weekly' AND strftime('%w', start_date) = strftime('%w', ?))
                    OR (frequency = 'Monthly' AND strftime('%d', start_date) = strftime('%d', ?))
                    OR (
                    frequency = 'Repeat_Every_N_Days'
                    AND ((julianday(DATE(?)) - julianday(DATE(start_date))) % COALESCE(n_days_frequency_rate,1) = 0)
                    )
                  )
                ORDER BY created_at DESC;`,
                [dateISO, dateISO, dateISO, dateISO, dateISO]
            );
            setHabits(habitsRaw);
            dispatch({ type: "SET_HABIT_COUNT", payload: habitsRaw.length });

            // Fetch completions only for the selected date
            const rows = await db.getAllAsync<any>(
                `SELECT habit_id AS id, point, log_date
                 FROM completions
                 WHERE date(log_date) = date(?)`,
                [dateISO]
            );

            const map = new Map(
                rows.map(r => [
                    r.id,
                    {
                        completed: true,
                        point: r.point,
                        log_date: r.log_date,
                    },
                ])
            );


            dispatch({ type: "SET_HABIT_COMPLETION_MAP", payload: map });
        } catch (error) {
            console.error("Error fetching habits or completions:", error);
        }
    };

    /** Fetch habits and completions */
    useEffect(() => {


        fetchData();
    }, [selectedDate]);

    const takeCompletionInput = async (habit: HabitRecord) => {
        const completed = completionMap.get(habit.id)?.completed;
        if (completed) {
            if (!db) return;
            await db.runAsync(`DELETE FROM completions WHERE habit_id = ?`, [habit.id]);
            const newMap = new Map(completionMap);
            newMap.delete(habit.id);
            dispatch({ type: "SET_HABIT_COMPLETION_MAP", payload: newMap });
        } else {

            dispatch({ type: "SET_HABIT_COMPLETION_DETAILS", payload: habit });
        }

    };

    useEffect(() => {
        // subscribe to the habit refetch


        eventEmitter.on('habit-refetch', fetchData);


        return () => {
            eventEmitter.off('habit-refetch', fetchData);

        };
    }, []);




    const isCompleted = (habitId: string) => completionMap.get(habitId)?.completed ?? false;

    const habitPoints = (habitId: string) => completionMap.get(habitId)?.point ?? 0;

    const canCompleteHabit = (habit: HabitRecord) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sel = new Date(selectedDate);
        sel.setHours(0, 0, 0, 0);

        return sel.getTime() === today.getTime();
    };



    if (!habits.length) return (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.subtle} />
            <Text style={styles.emptyText}>No habits found</Text>
        </View>
    );

    return (
        <View style={styles.listContainer}>
            {habits.map(habit => (
                <View key={habit.id} style={styles.card}>
                    <TouchableOpacity
                        style={styles.cardHeader}
                        disabled={!canCompleteHabit(habit)}
                        onPress={() => takeCompletionInput(habit)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.mainRow}>
                            <Ionicons
                                name={isCompleted(habit.id) ? "checkbox" : "square-outline"}
                                size={24}
                                color={isCompleted(habit.id) ? colors.success : colors.primary}
                            />
                            <View style={styles.content}>
                                <Text
                                    style={[
                                        styles.heading,
                                        isCompleted(habit.id) && styles.strikeText,
                                        !canCompleteHabit(habit) && { opacity: 0.5 }
                                    ]}
                                    numberOfLines={2}
                                >
                                    {habit.habit_name}
                                </Text>

                                <View style={styles.categoryBadge}>
                                    <Ionicons
                                        name={getCategoryIcon(habit.category)}
                                        size={10}
                                        color={colors.textOnPrimary}
                                        style={styles.categoryIcon}
                                    />
                                    <Text style={styles.categoryText}>
                                        {habit.category || "Uncategorized"}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.pointsBadge}>
                                <Ionicons name="star" size={14} color={colors.buttonOrange} />
                                <Text style={styles.pointsText}>{habitPoints(habit.id)}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.footerRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="repeat" size={14} color={colors.info} />
                            <Text style={styles.infoText}>{habit.frequency}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={14} color={colors.info} />
                            <Text style={styles.infoText}>
                                {formatHumanDate(habit.start_date)}
                            </Text>
                            <Ionicons name="arrow-forward" size={12} color={colors.subtle} />
                            <Text style={styles.infoText}>
                                {formatHumanDate(habit.end_date)}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}


function ModalContent({ habit, toggleCompletion }: { habit: HabitRecord, toggleCompletion: (habit: HabitRecord, value: string) => void }) {
    const [numericValue, setNumericValue] = useState("0");
    const [yesOrNoValue, setYesOrNoValue] = useState("Yes");
    // "At_Least" | "Less_Than" | "Exact" 
    if (habit?.evaluation_type === "Numeric" && habit.target_condition === "At_Least") {
        return (
            <View>
                <Text style={{ color: colors.text }}>{`${habit.habit_name} (${habit.target_value} ${habit.target_unit ? habit.target_unit : ""}) `}</Text>

                <TextInputComponent label="You have completed at least"
                    value={numericValue} onChangeText={(val) => { setNumericValue(val) }} keyboardType="numeric" />
                <Button title="Submit" onPress={() => { toggleCompletion(habit, numericValue) }} />
            </View>
        )
    }

    if (habit?.evaluation_type === "Numeric" && habit.target_condition === "Less_Than") {
        return (
            <View>
                <Text style={{ color: colors.text }}>{`${habit.habit_name} (${habit.target_value} ${habit.target_unit ? habit.target_unit : ""}) `}</Text>

                <TextInputComponent label="You did not cross the target"
                    value={numericValue} onChangeText={(val) => { setNumericValue(val) }} keyboardType="numeric" />
                <Button title="Submit" onPress={() => { toggleCompletion(habit, numericValue) }} />
            </View>
        )
    }

    if (habit?.evaluation_type === "Numeric" && habit.target_condition === "Exact") {
        return (
            <View>
                <Text style={{ color: colors.text }}>{`${habit.habit_name} (${habit.target_value} ${habit.target_unit ? habit.target_unit : ""}) `}</Text>

                <TextInputComponent label="You have exactly completed"
                    value={numericValue} onChangeText={(val) => { setNumericValue(val) }} keyboardType="numeric" />
                <Button title="Submit" onPress={() => { toggleCompletion(habit, numericValue) }} />
            </View>
        )
    }

    if (habit?.evaluation_type === "Yes_Or_No") {
        return (
            <View>
                <Text style={{ color: colors.text }}>Have you completed {habit.habit_name}?</Text>
                <Button title="Yes" onPress={() => { setYesOrNoValue("Yes") }} />
                <Button title="No" onPress={() => { setYesOrNoValue("No") }} />
                <Text style={{ color: colors.text }}>{yesOrNoValue}</Text>
                <Button title="Submit" onPress={() => { toggleCompletion(habit, yesOrNoValue) }} />
            </View>
        )
    }

    return null
}

export function HabitCompletionModal() {
    const { state, dispatch } = useHome();
    const { habitCompletionDetails, completionMap } = state;

    /** Toggle habit completion */
    const toggleCompletion = async (habit: HabitRecord, value: string) => {
        const current = completionMap.get(habit.id);
        const newStatus = !current?.completed;
        const numericVal = Number(value);

        let point = 0;

        if (habit.evaluation_type === "Numeric") {
            if (numericVal <= 0) {
                // No effort → negative points
                point = -Math.abs(habit.negative_task_point);
            } else {
                switch (habit.target_condition) {
                    case "At_Least": {
                        if (numericVal >= habit.target_value) {
                            point = habit.task_point;
                        } else {
                            const ratio = numericVal / habit.target_value;
                            point = habit.task_point * ratio;
                            if (point <= 0) point = -Math.abs(habit.negative_task_point);
                        }
                        break;
                    }

                    case "Less_Than": {
                        if (numericVal <= 0) {
                            // No valid input → penalty
                            point = -Math.abs(habit.negative_task_point);
                        } else if (numericVal > habit.target_value) {
                            // Exceeded target → penalty
                            point = -Math.abs(habit.negative_task_point);
                        } else {
                            // ✅ Lower value = higher reward
                            const ratio = numericVal / habit.target_value; // smaller means better
                            // Invert the ratio so smaller values give higher score
                            const invertedRatio = 1 - ratio;
                            // Scale to full task_point
                            point = habit.task_point * (1 + invertedRatio);
                            // That means:
                            // - if ratio = 1 (value = target) → point = task_point
                            // - if ratio = 0 (value = 0) → point = 2 * task_point (max reward)
                        }
                        break;
                    }



                    case "Exact": {
                        point =
                            numericVal === habit.target_value
                                ? habit.task_point
                                : -Math.abs(habit.negative_task_point);
                        break;
                    }

                    default:
                        point = -Math.abs(habit.negative_task_point);
                }
            }
        } else if (habit.evaluation_type === "Yes_Or_No") {
            point = value === "Yes" ? habit.task_point : -Math.abs(habit.negative_task_point);
        }


        const newMap = new Map(completionMap);
        newMap.set(habit.id, {
            completed: newStatus,
            point,
            log_date: new Date(),
        })
        dispatch({ type: "SET_HABIT_COMPLETION_MAP", payload: newMap });

        try {
            if (!db) return;
            if (newStatus) {

                await db.runAsync(
                    `INSERT INTO completions (id, habit_id, log_date, point)
                 VALUES (?, ?, ?, ?)`,
                    [uuid.v4().toString(), habit.id, new Date().toISOString(), point]
                );

                dispatch({ type: "SET_HABIT_COMPLETION_DETAILS", payload: null });
            } else {
                await db.runAsync(`DELETE FROM completions WHERE habit_id = ?`, [habit.id]);
            }
        } catch (error) {
            console.error("Error updating habit completion:", error);
        }
    };

    const sethabitCompletionDetails = (habit: HabitRecord | null) => { dispatch({ type: "SET_HABIT_COMPLETION_DETAILS", payload: habit }) };
    return (
        <ModalView
            visible={!!habitCompletionDetails}
            onClose={() => { sethabitCompletionDetails(null) }}
            heading="Habit Completion"
        >
            {habitCompletionDetails && <ModalContent habit={habitCompletionDetails} toggleCompletion={(habit: HabitRecord, value: string) => { toggleCompletion(habit, value); }} />}





        </ModalView>
    )
}

const styles = StyleSheet.create({
    listContainer: {
        flex: 1,
        gap: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontFamily: getFontFamily('regular'),
        fontSize: 16,
        color: colors.subtle,
        marginTop: 12,
    },
    card: {
        backgroundColor: colors.background2,
        borderRadius: 4,
        padding: 4,
        marginBottom: 8,
    },
    cardHeader: {
        marginBottom: 12,
    },
    mainRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    content: {
        flex: 1,
        gap: 6,
    },
    heading: {
        fontFamily: getFontFamily('bold'),
        fontSize: 18,
        color: colors.text,
        lineHeight: 24,
    },
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: "flex-start",
        gap: 4,
    },
    categoryIcon: {
        marginRight: 2,
    },
    categoryText: {
        fontFamily: getFontFamily('bold'),
        fontSize: 10,
        color: colors.textOnPrimary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    pointsBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
        gap: 4,
        borderWidth: 1,
        borderColor: colors.buttonOrange,
    },
    pointsText: {
        fontFamily: getFontFamily('bold'),
        fontSize: 14,
        color: colors.text,
    },
    footerRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 4,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: `${colors.subtle}20`,
        gap: 16,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    infoText: {
        fontFamily: getFontFamily('regular'),
        fontSize: 12,
        color: colors.info,
    },
    strikeText: {
        textDecorationLine: "line-through",
        opacity: 0.5,
    },
});



