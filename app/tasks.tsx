import Button3D from "@/components/button_3d/Button3D";
import FullScreenLoader from "@/components/fullscreen_loader/FullScreenLoader";
import { Filter, Subtask, TaskWithSubtask } from "@/components/task_form/types";
import WindowPanel, { ActionIcon } from "@/components/window_panel/WindowPanel";
import { colors } from "@/constants/colors";
import { emitError } from "@/constants/emitError";
import { eventEmitter } from "@/constants/eventEmitter";
import { fonts } from "@/constants/fonts";
import { db } from "@/db/db";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";


export default function Tasks() {
    const [tasks, setTasks] = useState<TaskWithSubtask[]>([]);
    const [filter, setFilter] = useState<Filter>("all");
    const [loading, setLoading] = useState<boolean>(false);

    // ✅ Fetch tasks + subtasks separately and group using a Map
    async function fetchTasks(filterType: Filter = "all", page = 1, limit = 10): Promise<void> {
        if (!db) return;
        setLoading(true);
        const offset = (page - 1) * limit;

        try {
            // 1️⃣ Fetch tasks with filter based on completions table
            let tasksQuery = "";

            if (filterType === "completed") {
                // Show only tasks that have at least one completion record
                tasksQuery = `
                    SELECT DISTINCT
                        t.id,
                        t.task_name,
                        t.category,
                        t.start_date,
                        t.end_date,
                        t.task_point,
                        t.negative_task_point
                    FROM tasks t
                    INNER JOIN completions c ON t.id = c.task_id
                    ORDER BY t.created_at DESC
                    LIMIT ? OFFSET ?;
                `;
            } else if (filterType === "incompleted") {
                // Show only tasks that have NO completion records
                tasksQuery = `
                    SELECT 
                        t.id,
                        t.task_name,
                        t.category,
                        t.start_date,
                        t.end_date,
                        t.task_point,
                        t.negative_task_point
                    FROM tasks t
                    LEFT JOIN completions c ON t.id = c.task_id
                    WHERE c.id IS NULL
                    ORDER BY t.created_at DESC
                    LIMIT ? OFFSET ?;
                `;
            } else {
                // Show all tasks
                tasksQuery = `
                    SELECT 
                        id,
                        task_name,
                        category,
                        start_date,
                        end_date,
                        task_point,
                        negative_task_point
                    FROM tasks
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?;
                `;
            }

            const tasksRaw = await db.getAllAsync(tasksQuery, [limit, offset]);
            if (!tasksRaw || tasksRaw.length === 0) {
                setTasks([]);
                return;
            }

            // 2️⃣ Collect task IDs
            const taskIds = tasksRaw.map((t: any) => t.id);

            // 3️⃣ Fetch subtasks for those IDs
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

            // 4️⃣ Group subtasks by task_id
            const subtaskMap = new Map<string, Subtask[]>();
            for (const s of subtasksRaw) {
                if (!subtaskMap.has(s.task_id)) {
                    subtaskMap.set(s.task_id, []);
                }
                subtaskMap.get(s.task_id)!.push(s);
            }

            // 5️⃣ Merge tasks with their subtasks
            const results: TaskWithSubtask[] = tasksRaw.map((t: any) => ({
                ...t,
                subtasks: subtaskMap.get(t.id) || [],
            }));

            setTasks(results);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            Alert.alert("Error", "Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    }

    // ✅ Delete a task and refresh
    async function handleDeleteTask(id: string) {
        try {
            if (!db) return;
            await db.runAsync(`DELETE FROM tasks WHERE id = ?`, [id]);
            fetchTasks(filter);
        } catch (error) {
            console.error("Failed to delete task:", error);
            Alert.alert("Error", "Failed to delete task");
        }
    }

    // ✅ Delete a subtask and refresh
    async function handleDeleteSubtask(id: string | null) {
        try {
            if (!db) return;
            if (id === null) {
                emitError("Subtask not found");
                return;
            }
            await db.runAsync(`DELETE FROM subtasks WHERE id = ?`, [id]);
            fetchTasks(filter);
        } catch (error) {
            console.error("Failed to delete subtask:", error);
            Alert.alert("Error", "Failed to delete subtask");
        }
    }

    // ✅ Render a single task
    const renderItem = ({ item }: { item: TaskWithSubtask }) => {
        const subtasks: Subtask[] = item.subtasks || [];

        const actionIcons: ActionIcon[] = [
            {
                name: 'create-outline',
                onPress: () => router.push({
                    pathname: '/EditTask',
                    params: { id: item.id }
                }),
                size: 20,
            },
            {
                name: 'trash-outline',
                onPress: () => handleDeleteTask(item.id),
                size: 20,
            },
        ];

        return (
            <WindowPanel
                title={item.task_name}
                actionIcons={actionIcons}
                onPress={() => Alert.alert(item.task_name)}
            >
                {/* Full Task Name */}
                <Text style={styles.taskName}>{item.task_name}</Text>

                <View style={styles.row}>
                    <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={colors.info}
                        style={styles.icon}
                    />
                    <Text style={styles.taskDetails}>
                        Start: {new Date(item.start_date).toLocaleDateString()}
                    </Text>
                </View>
                {item?.end_date && <View style={styles.row}>
                    <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={colors.info}
                        style={styles.icon}
                    />
                    <Text style={styles.taskDetails}>
                        End: {new Date(item.end_date).toLocaleDateString()}
                    </Text>
                </View>}

                <View style={styles.row}>
                    <FontAwesome5
                        name="bullseye"
                        size={16}
                        color={colors.info}
                        style={styles.icon}
                    />
                    <Text style={styles.taskDetails}>
                        P: {item.task_point} | NP:{" "}
                        {item.negative_task_point}
                    </Text>
                </View>

                {subtasks.length > 0 && (
                    <View style={styles.subtasksContainer}>
                        <WindowPanel title="Subtasks">
                            {subtasks.map(
                                (subtask) =>
                                    subtask.name && (
                                        <View
                                            key={subtask.id}
                                            style={styles.subtaskItemContainer}
                                        >
                                            {/* Subtask Title */}
                                            <Text style={styles.subtaskName}>
                                                {subtask.name}
                                            </Text>

                                            {/* Points Badge and Delete Button Row */}
                                            <View style={styles.subtaskActionsRow}>
                                                <View style={styles.subtaskPointsBadge}>
                                                    <Ionicons name="star" size={12} color={colors.buttonOrange} />
                                                    <Text style={styles.subtaskPointsText}>
                                                        {subtask.point}
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => handleDeleteSubtask(subtask.id)}
                                                    style={styles.subtaskDeleteButton}
                                                >
                                                    <Ionicons
                                                        name="trash-outline"
                                                        size={18}
                                                        color={colors.danger}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )
                            )}
                        </WindowPanel>
                    </View>
                )}
            </WindowPanel>
        );
    };

    useEffect(() => {
        fetchTasks(filter);
    }, [filter]);

    useEffect(() => {
        // subscribe to the task refetch

        async function handleTaskRefetch() {
            await fetchTasks(filter);
        }

        eventEmitter.on('task-refetch', handleTaskRefetch);

        return () => {
            eventEmitter.off('task-refetch', handleTaskRefetch);
        };
    }, [filter]);

    return (
        <View style={styles.container}>
            <FullScreenLoader show={loading} />
            {/* Filter Button Group */}
            <View style={styles.filterButtonGroup}>
                <Button3D
                    onClick={() => setFilter("all")}
                    active={filter === "all"}
                >
                    <View style={{ padding: 4 }}>
                        <Text style={{ color: colors.textOnPrimary, fontFamily: fonts.bold }}>
                            All
                        </Text>
                    </View>

                </Button3D>
                <Button3D
                    onClick={() => setFilter("completed")}
                    active={filter === "completed"}
                >
                    <View style={{ padding: 4 }}>
                        <Text style={{ color: colors.textOnPrimary, fontFamily: fonts.bold }}>
                            Completed
                        </Text>
                    </View>
                </Button3D>
                <Button3D
                    onClick={() => setFilter("incompleted")}
                    active={filter === "incompleted"}
                >
                    <View style={{ padding: 4 }}>
                        <Text style={{ color: colors.textOnPrimary, fontFamily: fonts.bold }}>
                            Incompleted
                        </Text>
                    </View>
                </Button3D>
            </View>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={{ padding: 2 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    filterButtonGroup: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    taskName: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: 8,
    },
    taskDetails: { fontSize: 14, color: colors.info, fontFamily: fonts.regular },
    row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    icon: { marginRight: 6 },
    subtasksContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.secondary + '40',
    },
    subtasksTitle: {
        fontFamily: fonts.bold,
        fontSize: 14,
        color: colors.text,
        marginBottom: 8,
    },
    subtaskItemContainer: {
        marginBottom: 8,
    },
    subtaskName: {
        fontSize: 14,
        color: colors.text,
        fontFamily: fonts.regular,
        paddingLeft: 12,
        marginBottom: 6,
    },
    subtaskActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 12,
        gap: 8,
    },
    subtaskPointsBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
        borderWidth: 1,
        borderColor: colors.buttonOrange,
    },
    subtaskPointsText: {
        fontFamily: fonts.bold,
        fontSize: 12,
        color: colors.text,
    },
    subtaskDeleteButton: {
        padding: 4,
    },
    separator: { height: 12 },
});
