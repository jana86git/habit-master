import { useHome } from "@/app/home";
import { colors } from "@/constants/colors";
import { db } from "@/db/db";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import uuid from 'react-native-uuid';
import { TaskWithSubtask } from "../task_form/types";

type CompletionStatus = {
    completed: boolean;
    point: number;
};

export default function TaskList() {
    const { state } = useHome();
    const { selectedDate } = state;

    const [tasks, setTasks] = useState<TaskWithSubtask[]>([]);
    const [completionMap, setCompletionMap] = useState<Map<string, CompletionStatus>>(new Map());

    /** ✅ Fetch tasks */
    async function fetchTasks(date: Date, page = 1, limit = 10) {
        try {
            if (!db) return;
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const offset = (page - 1) * limit;

            const query = `
            SELECT 
                t.id,
                t.task_name,
                t.category,
                t.start_date,
                t.end_date,
                t.task_point,
                t.negative_task_point,
                COALESCE(
                    (
                        SELECT json_group_array(
                            json_object(
                                'id', s.id,
                                'name', s.name,
                                'point', s.point
                            )
                        )
                        FROM subtasks s
                        WHERE s.task_id = t.id
                    ),
                    '[]'
                ) AS subtasks
            FROM tasks t
            WHERE 
                (
                    (t.end_date IS NULL AND DATE(t.start_date) = DATE(?))
                    OR
                    (t.end_date IS NOT NULL AND t.end_date >= ? AND t.end_date <= ?)
                )
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?;
        `;

            const tasksRaw = await db.getAllAsync<any>(
                query,
                [
                    startOfDay.toISOString(), // for start_date exact match
                    startOfDay.toISOString(), // for range lower bound (end_date case)
                    endOfDay.toISOString(),   // for range upper bound (end_date case)
                    limit,
                    offset,
                ]
            );

            const results: TaskWithSubtask[] = (tasksRaw || []).map((t: any) => ({
                id: t.id,
                task_name: t.task_name,
                category: t.category,
                start_date: t.start_date,
                end_date: t.end_date,
                task_point: t.task_point,
                negative_task_point: t.negative_task_point,
                subtasks: t.subtasks ? JSON.parse(t.subtasks) : [],
            }));

            setTasks(results);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }



    /** ✅ Fetch completions into a Map */
    async function fetchCompletionMap() {
        try {
            const query = `
        SELECT task_id AS id, point
        FROM completions
        WHERE task_id IS NOT NULL
        UNION ALL
        SELECT subtask_id AS id, point
        FROM completions
        WHERE subtask_id IS NOT NULL
      `;

            if (!db) return;
            const rows = await db.getAllAsync<any>(query);

            const map = new Map(
                rows.map(r => [
                    r.id,
                    { completed: true, point: r.point },
                ])
            );
            setCompletionMap(map);
        } catch (error) {
            console.error("Error fetching completions:", error);
        }
    }

    /** Toggle task completion (ignores subtasks) */
    const toggleTaskCompletion = async (task: TaskWithSubtask) => {
        if (!db) return;
        if (!task) return;

        const today = new Date();
        const startDate = new Date(task.start_date);
        const endDate = task.end_date ? new Date(task.end_date) : null;

        if (startDate > today || (endDate && endDate < today)) return;
        let points = 0;
        if (endDate && endDate < today) {
            points -= task.negative_task_point;
        }else{
            points += task.task_point;
        } 

        const current = completionMap.get(task.id);
        const newStatus = !current?.completed;

        setCompletionMap(prev => new Map(prev).set(task.id, { completed: newStatus, point: task.task_point }));

        try {
            if (newStatus) {
                await db.runAsync(
                    `INSERT INTO completions (id, task_id, log_date, point)
                 VALUES (?, ?, ?, ?)`,
                    [uuid.v4().toString(), task.id, new Date().toISOString(), points]
                );
            } else {
                await db.runAsync(
                    `DELETE FROM completions
                 WHERE task_id = ?`,
                    [task.id]
                );
            }
        } catch (error) {
            console.error("Error updating task completion:", error);
        }
    };

    /** Toggle subtask completion (does NOT affect parent task) */
    /** Toggle subtask completion (no task_id required) */
    const toggleSubtaskCompletion = async (subtaskId: string, point: number) => {
        const current = completionMap.get(subtaskId);
        const newStatus = !current?.completed;

        // Update locally
        setCompletionMap(prev => new Map(prev).set(subtaskId, { completed: newStatus, point}));

        try {
            if (!db) return;
            if (newStatus) {
                await db.runAsync(
                    `INSERT INTO completions (id, subtask_id, log_date, point)
                 VALUES (?, ?, ?, ?)`,
                    [uuid.v4().toString(), subtaskId, new Date().toISOString(), point]
                );
            } else {
                await db.runAsync(
                    `DELETE FROM completions
                 WHERE subtask_id = ?`,
                    [subtaskId]
                );
            }
        } catch (error) {
            console.error("Error updating subtask completion:", error);
        }
    };



    /** ✅ Check completion status */
    const isCompleted = (id: string) => completionMap.get(id)?.completed ?? false;

    useEffect(() => {
        if (selectedDate) {
            (async () => {
                await fetchTasks(selectedDate);
                await fetchCompletionMap();
            })();
        }
    }, [selectedDate]);

    if (tasks.length === 0) return <View><Text>No tasks found</Text></View>;

    return (
        <View style={styles.task_container}>
            {tasks.map(task => (
                <View key={task.id} style={styles.taskBlock}>
                    {/* Task */}
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => toggleTaskCompletion(task)}
                    >
                        <Ionicons
                            name={isCompleted(task.id) ? "checkbox" : "square-outline"}
                            size={22}
                            color={colors.primary}
                        />
                        <Text
                            style={[
                                styles.task_heading,
                                isCompleted(task.id) && styles.strikeText,
                            ]}
                        >
                            {task.task_name}
                        </Text>
                    </TouchableOpacity>

                    {/* Subtasks */}
                    {task.subtasks?.length > 0 && (
                        <View style={styles.subtaskContainer}>
                            {task.subtasks.map(subtask => (
                                <TouchableOpacity
                                    key={subtask.id}
                                    style={styles.checkboxRow}
                                    onPress={() =>
                                        toggleSubtaskCompletion(


                                            subtask.id,
                                            subtask.point
                                        )
                                    }
                                >
                                    <Ionicons
                                        name={isCompleted(subtask.id) ? "checkbox" : "square-outline"}
                                        size={18}
                                        color={colors.secondary}
                                    />
                                    <Text
                                        style={[
                                            styles.subtaskText,
                                            isCompleted(subtask.id) && styles.strikeText,
                                        ]}
                                    >
                                        {subtask.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    task_container: {
        flex: 1,
        backgroundColor: colors.background,
        borderColor: colors.secondary,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
    },
    taskBlock: {
        marginBottom: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.secondary,
        paddingBottom: 8,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
    },
    task_heading: {
        fontSize: 18,
        color: colors.text,
        marginLeft: 8,
    },
    subtaskContainer: {
        marginLeft: 30,
        marginTop: 4,
    },
    subtaskText: {
        fontSize: 15,
        color: colors.text,
        marginLeft: 8,
    },
    strikeText: {
        textDecorationLine: "line-through",
        color: colors.text || "#888",
    },
});
