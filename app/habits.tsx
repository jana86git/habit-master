import { styles } from "@/components/habbits/styles";
import WindowPanel, { ActionIcon } from "@/components/window_panel/WindowPanel";
import { colors } from "@/constants/colors";
import { eventEmitter } from "@/constants/eventEmitter";
import { db } from "@/db/db";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";

// Habit type
interface Habit {
  id: string;
  habit_name: string;
  start_date: string;
  end_date: string | null;
  frequency: string;
  hourly_frequency_rate: number;
  n_days_frequency_rate: number;
  task_point: number;
  negative_task_point: number;
  evaluation_type: string;
  target_condition: string;
  target_value: number;
  target_unit: string | null;
  reminder: string | null;
  category: string | null;
  created_at: string;
}

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);

  // Fetch habits
  async function fetchHabits(page = 1, limit = 10): Promise<void> {
    if (!db) return;
    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM habits
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const params = [limit, offset];

    try {
      const result: Habit[] = await db.getAllAsync(query, params);
      setHabits(result);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    }
  }

  // Delete habit
  async function deleteHabit(id: string): Promise<void> {

    try {
      if (!db) return;
      await db.runAsync(`DELETE FROM habits WHERE id = ?`, [id]);
      fetchHabits();
    } catch (error) {
      console.error("Failed to delete habit:", error);
      Alert.alert("Error", "Failed to delete habit");
    }
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  useEffect(() => {
    // subscribe to the habit refetch

    async function handleRefetch() {
      await fetchHabits();
    }

    eventEmitter.on('habit-refetch', handleRefetch);

    return () => {
      eventEmitter.off('habit-refetch', handleRefetch);
    };
  }, []);

  const renderItem = ({ item }: { item: Habit }) => {
    const actionIcons: ActionIcon[] = [
      {
        name: 'create-outline',
        onPress: () => router.push({
          pathname: '/EditHabit',
          params: { id: item.id }
        }),
        size: 20,
      },
      {
        name: 'trash-outline',
        onPress: () => deleteHabit(item.id),
        size: 20,
      },
    ];

    return (
      <WindowPanel
        title={item.habit_name}
        actionIcons={actionIcons}
        onPress={() => Alert.alert(item.habit_name)}
      >
        {/* Full Habit Name */}
        <Text style={styles.habitName}>{item.habit_name}</Text>

        <View style={styles.row}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.info}
            style={styles.icon}
          />
          <Text style={styles.habitDetails}>
            Start: {new Date(item.start_date).toLocaleDateString()}
          </Text>
        </View>

        {item?.end_date && (
          <View style={styles.row}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.info}
              style={styles.icon}
            />
            <Text style={styles.habitDetails}>
              End: {new Date(item.end_date).toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={styles.row}>
          <MaterialIcons
            name="update"
            size={16}
            color={colors.info}
            style={styles.icon}
          />
          <Text style={styles.habitDetails}>
            Frequency: {item.frequency === "Repeat_Every_N_Days"
              ? `Repeat Every ${item.n_days_frequency_rate} Days`
              : item.frequency}
          </Text>
        </View>

        <View style={styles.row}>
          <FontAwesome5
            name="bullseye"
            size={16}
            color={colors.info}
            style={styles.icon}
          />
          <Text style={styles.habitDetails}>
            Target: {item.target_value} {item.target_unit || ""}
          </Text>
        </View>

        <View style={styles.row}>
          <FontAwesome5
            name="bullseye"
            size={16}
            color={colors.info}
            style={styles.icon}
          />
          <Text style={styles.habitDetails}>
            Habit Points: {item.task_point} | Negative Points: {item.negative_task_point}
          </Text>
        </View>
      </WindowPanel>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ padding: 2 }}
      />
    </View>
  );
}

