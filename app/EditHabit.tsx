import HabitForm from "@/components/habit_form/HabitForm";
import HabitFormProvider, { useHabitForm } from "@/components/habit_form/HabitFormContext";
import { HabitResponse } from "@/components/habit_form/types";
import { colors } from "@/constants/colors";
import { emitError } from "@/constants/emitError";
import { emitHabitRefetch } from "@/constants/emitRefetch";
import { emitSuccess } from "@/constants/emitSuccess";
import { db } from "@/db/db";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    emitError("Invalid Habit ID");
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HabitFormProvider>
        <HabitLoader habitId={id} />
      </HabitFormProvider>
    </View>
  );
}

function HabitLoader({ habitId }: { habitId: string }) {
  const { dispatch } = useHabitForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHabit() {
      try {
        if (!db) return;
        const result: HabitResponse[] = await db.getAllAsync(`SELECT * FROM habits WHERE id = ?`, [habitId]);
       

        if (result.length === 0) {
          emitError("Habit not found");
          return;
        }

        const habit: HabitResponse = result[0];

        // Prepare normalized payload for the context
        const normalized = {
          habitName: habit.habit_name,
          startDate: habit.start_date ? new Date(habit.start_date) : new Date(),
          endDate: habit.end_date ? new Date(habit.end_date) : null,
          reminderTime: habit.reminder ? new Date(habit.reminder) : null,
          frequency: habit.frequency,
          hourlyFrequncyRate: habit.hourly_frequency_rate ?? null,
          nDaysFrequencyRate: habit.n_days_frequency_rate ?? null,
          taskPoint: habit.task_point ?? 0,
          negativeTaskPoint: habit.negative_task_point ?? 0,
          evaluationType: habit.evaluation_type,
          targetCondition: habit.target_condition ?? "At_Least",
          targetValue: habit.target_value ?? null,
          targetUnit: habit.target_unit ?? null,
          category: habit.category ?? null,
        };

        // Single dispatch �
        dispatch({ type: "INITIATE_EDIT_HABIT", payload: normalized });
      } catch (error) {
        console.error("Error loading habit:", error);
        emitError("Failed to load habit details");
      } finally {
        setLoading(false);
      }
    }

    fetchHabit();
  }, [habitId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <KeyboardAwareScrollView
        extraScrollHeight={20}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <HabitForm />
      </KeyboardAwareScrollView>
      <UpdateButton habitId={habitId} />
    </>
  );
}

function UpdateButton({ habitId }: { habitId: string }) {
  const { state } = useHabitForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function updateHabit() {
    if (!db) return;

    const {
      habitName,
      startDate,
      endDate,
      frequency,
      hourlyFrequncyRate,
      nDaysFrequencyRate,
      taskPoint,
      negativeTaskPoint,
      evaluationType,
      targetCondition,
      targetValue,
      targetUnit,
      category,
      reminderTime,
    } = state;

    if (!habitName?.trim()) {
      emitError("Please enter a habit name");
      return;
    }

    if (!startDate) {
      emitError("Please select a start date");
      return;
    }

    if (new Date(startDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      emitError("Start date cannot be in the past");
      return;
    }

    const sql = `
      UPDATE habits SET
        habit_name = ?,
        start_date = ?,
        end_date = ?,
        category = ?,
        reminder = ?,
        frequency = ?,
        hourly_frequency_rate = ?,
        n_days_frequency_rate = ?,
        task_point = ?,
        negative_task_point = ?,
        evaluation_type = ?,
        target_condition = ?,
        target_value = ?,
        target_unit = ?
      WHERE id = ?;
    `;

    try {
      setLoading(true);
      await db.runAsync(sql, [
        habitName,
        startDate.toISOString(),
        endDate ? endDate.toISOString() : null,
        category,
        reminderTime ? reminderTime.toISOString() : null,
        frequency,
        hourlyFrequncyRate ?? null,
        nDaysFrequencyRate ?? null,
        taskPoint ?? 0,
        negativeTaskPoint ?? 0,
        evaluationType,
        targetCondition ?? null,
        targetValue ?? null,
        targetUnit ?? null,
        habitId,
      ]);

      emitSuccess("Habit updated successfully");
      emitHabitRefetch();
      router.back(); // optional navigation
    } catch (error) {
      console.error("Update failed:", error);
      emitError("Failed to update habit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button disabled={loading} title={loading ? "Updating..." : "Update"} onPress={updateHabit} />
  );
}
