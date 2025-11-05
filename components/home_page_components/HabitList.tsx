import { useHome } from "@/app/home";
import { colors } from "@/constants/colors";
import { eventEmitter } from '@/constants/eventEmitter';
import { db } from "@/db/db";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import uuid from "react-native-uuid";
import { ModalView } from "../modal/Modal";
import TextInputComponent from "../text_input/TextInput";
import { HabitRecord } from "./types";


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

  

    if (!habits.length) return <View><Text>No habits found</Text></View>;



    return (
        <View style={styles.habit_container}>

            {habits.map(habit => (
                <TouchableOpacity
                    key={habit.id}
                    style={styles.checkboxRow}
                    disabled={!canCompleteHabit(habit)}
                    onPress={() => takeCompletionInput(habit)}
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
                    <Text style={{ color: colors.text, marginLeft: 10 }}>{habitPoints(habit.id)}</Text>
                </TouchableOpacity>
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



