import { useHome } from "@/app/home";
import { colors } from "@/constants/colors";
import { eventEmitter } from "@/constants/eventEmitter";
import { db } from "@/db/db";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import uuid from "react-native-uuid";
import { Subtask, TaskWithSubtask } from "../task_form/types";

type CompletionStatus = {
    completed: boolean;
    point: number;
};

export default function TaskList() {
    const { state } = useHome();
    const { selectedDate } = state;

    const [tasks, setTasks] = useState<TaskWithSubtask[]>([]);
    const [completionMap, setCompletionMap] = useState<
        Map<string, CompletionStatus>
    >(new Map());

    /** ✅ Fetch tasks + subtasks separately (optimized) */
    async function fetchTasks(date: Date) {
        try {
            if (!db) return;

            const dateStr = date.toISOString().split("T")[0];

            // 1️⃣ Fetch all tasks for the selected date
            const tasksQuery = `
     SELECT 
  id,
  task_name,
  category,
  start_date,
  end_date,
  task_point,
  negative_task_point
FROM tasks
WHERE 
  (
    -- Tasks that started on or before today and have no end date
    (substr(start_date, 1, 10) <= ? AND end_date IS NULL)
    
    OR
    
    -- Tasks that have both start and end dates and are active today
    (substr(start_date, 1, 10) <= ? AND substr(end_date, 1, 10) >= ?)
  )
ORDER BY datetime(created_at) DESC;

      `;

            const tasksRaw = await db.getAllAsync(tasksQuery, [dateStr, dateStr, dateStr]);
            if (!tasksRaw || tasksRaw.length === 0) {
                setTasks([]);
                return;
            }

            // 2️⃣ Collect all task IDs
            const taskIds = tasksRaw.map((t: any) => t.id);

            // 3️⃣ Fetch subtasks for those tasks (if any)
            let subtasksRaw: Subtask[] = [];
            if (taskIds.length > 0) {
                const placeholders = taskIds.map(() => "?").join(", ");
                const subtasksQuery = `
          SELECT id, task_id, name, point
          FROM subtasks
          WHERE task_id IN (${placeholders});
        `;
                subtasksRaw = await db.getAllAsync(subtasksQuery, taskIds);
            }

            // 4️⃣ Group subtasks by task_id using a Map
            const subtaskMap = new Map<string, Subtask[]>();
            for (const s of subtasksRaw) {
                if (!subtaskMap.has(s.task_id)) {
                    subtaskMap.set(s.task_id, []);
                }
                subtaskMap.get(s.task_id)!.push(s);
            }

            // 5️⃣ Merge tasks + subtasks efficiently
            const results: TaskWithSubtask[] = tasksRaw.map((t: any) => ({
                ...t,
                subtasks: subtaskMap.get(t.id) || [],
            }));

            setTasks(results);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }

    /** ✅ Fetch completion records into a Map */
    async function fetchCompletionMap() {
        try {
            if (!db) return;

            const query = `
        SELECT task_id AS id, point
        FROM completions
        WHERE task_id IS NOT NULL
        UNION ALL
        SELECT subtask_id AS id, point
        FROM completions
        WHERE subtask_id IS NOT NULL;
      `;

            const rows = await db.getAllAsync<any>(query);

            const map = new Map(
                rows.map((r) => [
                    r.id,
                    { completed: true, point: r.point },
                ])
            );

            setCompletionMap(map);
        } catch (error) {
            console.error("Error fetching completions:", error);
        }
    }

    /** ✅ Toggle task completion (main task only) */
    const toggleTaskCompletion = async (task: TaskWithSubtask) => {
        if (!db || !task) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(task.start_date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = task.end_date ? new Date(task.end_date) : null;
        if (endDate) endDate.setHours(0, 0, 0, 0);

        let points = 0;
        if (endDate && endDate < today) {
            points -= task.negative_task_point;
        } else {
            points += task.task_point;
        }



        const current = completionMap.get(task.id);
        const newStatus = !current?.completed;



        try {
            if (newStatus) {
                // Update local state immediately
                setCompletionMap(
                    (prev) => new Map(prev).set(task.id, { completed: newStatus, point: points })
                );
                await db.runAsync(
                    `INSERT INTO completions (id, task_id, log_date, point)
           VALUES (?, ?, ?, ?);`,
                    [uuid.v4().toString(), task.id, new Date().toISOString(), points]
                );
            } else {
                // Update local state immediately
                setCompletionMap(
                    (prev) => new Map(prev).set(task.id, { completed: newStatus, point: 0 })
                )
                await db.runAsync(`DELETE FROM completions WHERE task_id = ?;`, [task.id]);
            }
        } catch (error) {
            console.error("Error updating task completion:", error);
        }
    };

    /** ✅ Toggle subtask completion */
    const toggleSubtaskCompletion = async (subtaskId: string, point: number) => {
        const current = completionMap.get(subtaskId);
        const newStatus = !current?.completed;

        setCompletionMap(
            (prev) => new Map(prev).set(subtaskId, { completed: newStatus, point })
        );

        try {
            if (!db) return;

            if (newStatus) {
                await db.runAsync(
                    `INSERT INTO completions (id, subtask_id, log_date, point)
           VALUES (?, ?, ?, ?);`,
                    [uuid.v4().toString(), subtaskId, new Date().toISOString(), point]
                );
            } else {
                await db.runAsync(`DELETE FROM completions WHERE subtask_id = ?;`, [subtaskId]);
            }
        } catch (error) {
            console.error("Error updating subtask completion:", error);
        }
    };

    /** ✅ Helper functions */
    const isCompleted = (id: string) => completionMap.get(id)?.completed ?? false;
    const point = (id: string) => completionMap.get(id)?.point ?? 0;

    useEffect(() => {
        if (selectedDate) {
            (async () => {
                await fetchTasks(selectedDate);
                await fetchCompletionMap();
            })();
        }
    }, [selectedDate]);

    useEffect(() => {
        // subscribe to the habit refetch

        async function handleTaskRefetch() {
            if (selectedDate) {
                (async () => {
                    await fetchTasks(selectedDate);
                    await fetchCompletionMap();
                })();
            }
        }


        eventEmitter.on('task-refetch', handleTaskRefetch);


        return () => {
            eventEmitter.off('task-refetch', handleTaskRefetch);

        };
    }, [selectedDate]);

    if (tasks.length === 0)
        return (
            <View>
                <Text>No tasks found</Text>
            </View>
        );

    return (
        <View style={styles.task_container}>
            {tasks.map((task) => (
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
                        <Text style={{ color: colors.text }}>Points: {point(task.id)}</Text>
                    </TouchableOpacity>

                    <Text style={{ color: colors.text }}>
                        {task.start_date} -- {task.end_date}
                    </Text>

                    {/* Subtasks */}
                    {task.subtasks?.length > 0 && (
                        <View style={styles.subtaskContainer}>
                            {task.subtasks.map((subtask) => (
                                <TouchableOpacity
                                    key={subtask.id}
                                    style={styles.checkboxRow}
                                    onPress={() =>
                                        toggleSubtaskCompletion(subtask.id, subtask.point)
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
                                    <Text style={{ color: colors.text }}>
                                        Points: {point(subtask.id)}
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
        flex: 1
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
