import { useHome } from "@/app/home";
import { colors } from "@/constants/colors";
import { db } from "@/db/db";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import uuid from "react-native-uuid";

export type HabitRecord = {
    id: string;
    habit_name: string;
    category: string | null;
    start_date: string;
    end_date: string | null;
    task_point: number;
    negative_task_point: number;
    frequency: string; // Daily, Weekly, Monthly, Repeat_Every_N_Days
    n_days_frequency_rate?: number;
};

type CompletionStatus = {
    completed: boolean;
    point: number;
    negative_point: number;
};

export default function HabitList() {
    const { state } = useHome();
    const { selectedDate } = state;

    const [habits, setHabits] = useState<HabitRecord[]>([]);
    const [completionMap, setCompletionMap] = useState<Map<string, CompletionStatus>>(new Map());

    /** Fetch habits and completions */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const dateISO = selectedDate.toISOString();

                // Fetch habits for the selected date
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
                            AND ((julianday(?) - julianday(start_date)) % COALESCE(n_days_frequency_rate,1) = 0)
                        )
                      )
                    ORDER BY created_at DESC;`,
                    [dateISO, dateISO, dateISO, dateISO, dateISO]
                );
                setHabits(habitsRaw);

                // Fetch completions
                const rows = await db.getAllAsync<any>(
                    `SELECT habit_id AS id, point, negative_point FROM completions WHERE habit_id IS NOT NULL`
                );
                const map = new Map(
                    rows.map(r => [
                        r.id,
                        { completed: true, point: r.point, negative_point: r.negative_point },
                    ])
                );
                setCompletionMap(map);

            } catch (error) {
                console.error("Error fetching habits or completions:", error);
            }
        };

        fetchData();
    }, [selectedDate]);

    /** Toggle habit completion */
    const toggleCompletion = async (habit: HabitRecord) => {
        const current = completionMap.get(habit.id);
        const newStatus = !current?.completed;

        setCompletionMap(prev => new Map(prev).set(habit.id, {
            completed: newStatus,
            point: habit.task_point,
            negative_point: habit.negative_task_point
        }));

        try {
            if (newStatus) {
                await db.runAsync(
                    `INSERT INTO completions (id, habit_id, log_date, point, negative_point) VALUES (?, ?, ?, ?, ?)`,
                    [uuid.v4().toString(), habit.id, new Date().toISOString(), habit.task_point, habit.negative_task_point]
                );
            } else {
                await db.runAsync(`DELETE FROM completions WHERE habit_id = ?`, [habit.id]);
            }
        } catch (error) {
            console.error("Error updating habit completion:", error);
        }
    };

    const isCompleted = (habitId: string) => completionMap.get(habitId)?.completed ?? false;

    const canCompleteHabit = (habit: HabitRecord) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sel = new Date(selectedDate);
        sel.setHours(0, 0, 0, 0);

        return sel.getTime() === today.getTime();
    };

    if (!habits.length) return <View><Text>No habits found</Text></View>;

    return (
        <View style={styles.habit_container}>
            {habits.map(habit => (
                <TouchableOpacity
                    key={habit.id}
                    style={styles.checkboxRow}
                    disabled={!canCompleteHabit(habit)}
                    onPress={() => toggleCompletion(habit)}
                >
                    <Ionicons
                        name={isCompleted(habit.id) ? "checkbox" : "square-outline"}
                        size={22}
                        color={colors.primary}
                    />
                    <Text
                        style={[
                            styles.habitText,
                            isCompleted(habit.id) && styles.strikeText,
                            !canCompleteHabit(habit) && { opacity: 0.5 }
                        ]}
                    >
                        {habit.habit_name} ({habit.frequency})
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    habit_container: {
        flex: 1,
        backgroundColor: colors.background,
        borderColor: colors.secondary,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 6,
    },
    habitText: {
        fontSize: 16,
        color: colors.text,
        marginLeft: 8,
    },
    strikeText: {
        textDecorationLine: "line-through",
        color: colors.text || "#888",
    },
});
