import { Subtask, TaskWithSubtask } from "@/components/task_form/types";
import { colors } from "@/constants/colors";
import { emitError } from "@/constants/emitError";
import { eventEmitter } from "@/constants/eventEmitter";
import { db } from "@/db/db";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";


export default function Tasks() {
    const [tasks, setTasks] = useState<TaskWithSubtask[]>([]);

    // ✅ Fetch tasks + subtasks separately and group using a Map
    async function fetchTasks(page = 1, limit = 10): Promise<void> {
        if (!db) return;
        const offset = (page - 1) * limit;

        try {
            // 1️⃣ Fetch tasks
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
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?;
      `;
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
        }
    }

    // ✅ Delete a task and refresh
    async function handleDeleteTask(id: string) {
        try {
            if (!db) return;
            await db.runAsync(`DELETE FROM tasks WHERE id = ?`, [id]);
            fetchTasks();
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
            fetchTasks();
        } catch (error) {
            console.error("Failed to delete subtask:", error);
            Alert.alert("Error", "Failed to delete subtask");
        }
    }

    // ✅ Render a single task
    const renderItem = ({ item }: { item: TaskWithSubtask }) => {
        const subtasks: Subtask[] = item.subtasks || [];

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => Alert.alert(item.task_name)}
            >
                <View style={{ flex: 1 }}>
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
                            Task Points: {item.task_point} | Negative Points:{" "}
                            {item.negative_task_point}
                        </Text>
                    </View>

                    {subtasks.length > 0 && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                                Subtasks:
                            </Text>
                            {subtasks.map(
                                (subtask) =>
                                    subtask.name && (
                                        <View
                                            key={subtask.id}
                                            style={{ flexDirection: "row", alignItems: "center" }}
                                        >
                                            <View style={styles.subtaskRow}>
                                                <Text style={styles.subtaskName}>
                                                    • {subtask.name}
                                                </Text>
                                                <Text style={styles.subtaskPoint}>
                                                    {subtask.point} pts
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleDeleteSubtask(subtask.id)}
                                                style={styles.deleteButton}
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={18}
                                                    color={colors.danger}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )
                            )}
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    onPress={() => handleDeleteTask(item.id)}
                    style={styles.deleteButton}
                >
                    <Ionicons name="trash-outline" size={24} color={colors.danger} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/EditTask',
                        params: { id: item.id }
                    })}

                    style={styles.deleteButton}
                >
                    <FontAwesome6 name="edit" size={24} color={colors.primary} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    useEffect(() => {
        fetchTasks();
    }, []);

     useEffect(() => {
            // subscribe to the habit refetch

            async function handleTaskRefetch() {
                await fetchTasks();
            }
    
    
    
            eventEmitter.on('task-refetch', handleTaskRefetch);
    
    
            return () => {
                eventEmitter.off('task-refetch', handleTaskRefetch);
    
            };
        }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={{ padding: 16 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    itemContainer: {
        flexDirection: "row",
        padding: 12,
        backgroundColor: colors.background,
        borderRadius: 8,
    },
    taskName: { fontSize: 16, fontWeight: "bold", marginBottom: 4, color: colors.text },
    taskDetails: { fontSize: 14, color: colors.info },
    row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    icon: { marginRight: 6 },
    subtaskRow: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 12,
    },
    subtaskName: { fontSize: 14, color: colors.text },
    subtaskPoint: { fontSize: 14, color: colors.info },
    deleteButton: { justifyContent: "center", paddingLeft: 12 },
    separator: { height: 12 },
});
