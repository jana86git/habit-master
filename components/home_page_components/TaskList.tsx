import { useHome } from "@/app/home";
import { colors } from "@/constants/colors";
import { eventEmitter } from "@/constants/eventEmitter";
import { getFontFamily } from "@/constants/fonts";
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

export default function TaskList() {
    const { state, dispatch } = useHome();
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
            dispatch({ type: "SET_TASK_COUNT", payload: results.length });
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
            <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={colors.subtle} />
                <Text style={styles.emptyText}>No tasks found</Text>
            </View>
        );

    return (
        <View style={styles.task_container}>
            {tasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                    {/* Task Header */}
                    <TouchableOpacity
                        style={styles.taskHeader}
                        onPress={() => toggleTaskCompletion(task)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.taskMainRow}>
                            <Ionicons
                                name={isCompleted(task.id) ? "checkbox" : "square-outline"}
                                size={24}
                                color={isCompleted(task.id) ? colors.success : colors.primary}
                            />
                            <View style={styles.taskContent}>
                                <Text
                                    style={[
                                        styles.task_heading,
                                        isCompleted(task.id) && styles.strikeText,
                                    ]}
                                    numberOfLines={2}
                                >
                                    {task.task_name}
                                </Text>

                                {/* Category Badge */}
                                <View style={styles.categoryBadge}>
                                    <Ionicons
                                        name={getCategoryIcon(task.category)}
                                        size={10}
                                        color={colors.textOnPrimary}
                                        style={styles.categoryIcon}
                                    />
                                    <Text style={styles.categoryText}>
                                        {task.category || "Uncategorized"}
                                    </Text>
                                </View>
                            </View>

                            {/* Points Badge */}
                            <View style={styles.pointsBadge}>
                                <Ionicons name="star" size={14} color={colors.buttonOrange} />
                                <Text style={styles.pointsText}>{point(task.id)}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Date Range */}
                    <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={14} color={colors.info} />
                        <Text style={styles.dateText}>
                            {formatHumanDate(task.start_date)}
                        </Text>
                        <Ionicons name="arrow-forward" size={12} color={colors.subtle} style={styles.dateArrow} />
                        <Text style={styles.dateText}>
                            {formatHumanDate(task.end_date)}
                        </Text>
                    </View>

                    {/* Subtasks - Old Book Style */}
                    {task.subtasks?.length > 0 && (
                        <View style={styles.subtaskBookContainer}>
                            <View style={styles.subtaskList}>
                                {task.subtasks.map((subtask, index) => (
                                    <TouchableOpacity
                                        key={subtask.id}
                                        style={styles.subtaskRow}
                                        onPress={() =>
                                            toggleSubtaskCompletion(subtask.id, subtask.point)
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.subtaskBullet}>
                                            <Text style={styles.subtaskNumber}>{index + 1}</Text>
                                        </View>
                                        <Ionicons
                                            name={isCompleted(subtask.id) ? "checkmark-circle" : "ellipse-outline"}
                                            size={18}
                                            color={isCompleted(subtask.id) ? colors.success : colors.secondary}
                                        />
                                        <Text
                                            style={[
                                                styles.subtaskText,
                                                isCompleted(subtask.id) && styles.strikeText,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {subtask.name}
                                        </Text>
                                        <View style={styles.subtaskPoints}>
                                            <Text style={styles.subtaskPointsText}>+{subtask.point}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
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
    taskCard: {
        backgroundColor: colors.background2,
        borderRadius: 4,
        padding: 4,
        marginBottom: 8,
    },
    taskHeader: {
        marginBottom: 12,
    },
    taskMainRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    taskContent: {
        flex: 1,
        gap: 6,
    },
    task_heading: {
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
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 4,
        backgroundColor: colors.background,
        borderRadius: 4,
        marginBottom: 8,
    },
    dateText: {
        fontFamily: getFontFamily('regular'),
        fontSize: 13,
        color: colors.info,
    },
    dateArrow: {
        marginHorizontal: 4,
    },
    subtaskBookContainer: {
        marginTop: 4,

        position: "relative",
        overflow: "hidden",
    },
    bookSpine: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 6,
        backgroundColor: colors.info,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    subtaskList: {
        paddingLeft: 16,
        paddingRight: 12,
        paddingVertical: 8,
    },
    subtaskRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        gap: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: `${colors.subtle}20`,
    },
    subtaskBullet: {
        width: 20,
        height: 20,
        borderRadius: 4,
        backgroundColor: colors.info,
        justifyContent: "center",
        alignItems: "center",
    },
    subtaskNumber: {
        fontFamily: getFontFamily('bold'),
        fontSize: 11,
        color: colors.textOnPrimary,
    },
    subtaskText: {
        flex: 1,
        fontFamily: getFontFamily('regular'),
        fontSize: 14,
        color: colors.text,
        fontStyle: "italic",
    },
    subtaskPoints: {
        backgroundColor: colors.success,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    subtaskPointsText: {
        fontFamily: getFontFamily('bold'),
        fontSize: 11,
        color: colors.textOnSuccess,
    },
    strikeText: {
        textDecorationLine: "line-through",
        opacity: 0.5,
    },
});
