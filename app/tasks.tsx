import { colors } from "@/constants/colors";
import { emitError } from "@/constants/emitError";
import { db } from "@/db/db";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Define your Task type
import { Subtask, TaskWithSubtask } from "@/components/task_form/types";





export default function Tasks() {

    const [tasks, setTasks] = useState<TaskWithSubtask[]>([]);


    async function fetchTasks(page = 1, limit = 10): Promise<void> {
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
ORDER BY t.created_at DESC;

`;
        const params = [limit, offset];

        try {
            const tasksRaw = await db.getAllAsync(query, params);
            // ✅ Explicitly assert that each row is an object before spreading
            const results: TaskWithSubtask[] = (tasksRaw || []).map((t: any) => ({
                id: t.id,
                task_name: t.task_name,
                category: t.category,
                start_date: t.start_date,
                end_date: t.end_date,
                task_point: t.task_point,
                negative_task_point: t.negative_task_point,
                subtasks: t.subtasks ? JSON.parse(t.subtasks) : []
            }));

            setTasks(results);
          
        } catch (error) {
            console.error("Failed to fetch habits:", error);
        }
    }

    async function handleDeleteTask(id: string) {
        try {
            await db.runAsync(`DELETE FROM tasks WHERE id = ?`, [id]);
            fetchTasks();
        } catch (error) {
            console.error("Failed to delete task:", error);
            Alert.alert("Error", "Failed to delete task");
        }
    }

    async function handleDeleteSubtask(id: string | null) {
        try {
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
                        <Ionicons name="calendar-outline" size={16} color={colors.info} style={styles.icon} />
                        <Text style={styles.taskDetails}>
                            Start: {new Date(item.start_date).toLocaleDateString()}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <FontAwesome5 name="bullseye" size={16} color={colors.info} style={styles.icon} />
                        <Text style={styles.taskDetails}>
                            Task Points: {item.task_point} | Negative Points: {item.negative_task_point}
                        </Text>
                    </View>

                    {subtasks.length > 0 && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Subtasks:</Text>
                            {subtasks.map((subtask, index) => (
                                subtask.name && (
                                    <View key={subtask.id} style={{ flexDirection: "row" }}>
                                        <View key={index} style={styles.subtaskRow}>
                                            <Text style={styles.subtaskName}>• {subtask.name}</Text>
                                            <Text style={styles.subtaskPoint}>{subtask.point} pts</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteSubtask(subtask.id)}
                                            style={styles.deleteButton}
                                        >
                                            <Ionicons name="trash-outline" size={18} color={colors.danger} />
                                        </TouchableOpacity>
                                    </View>
                                )
                            ))}
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    onPress={() => handleDeleteTask(item.id)}
                    style={styles.deleteButton}
                >
                    <Ionicons name="trash-outline" size={24} color={colors.danger} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    useEffect(() => {
        fetchTasks();
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
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    itemContainer: { flexDirection: "row", padding: 12, backgroundColor: colors.background, borderRadius: 8 },
    taskName: { fontSize: 16, fontWeight: "bold", marginBottom: 4, color: colors.text },
    taskDetails: { fontSize: 14, color: colors.info },
    row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    icon: { marginRight: 6 },
    subtaskRow: { flexDirection: "row", justifyContent: "space-between", paddingLeft: 12 },
    subtaskName: { fontSize: 14, color: colors.text },
    subtaskPoint: { fontSize: 14, color: colors.info },
    deleteButton: { justifyContent: "center", paddingLeft: 12 },
    separator: { height: 12 },
});