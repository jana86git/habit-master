import HabitForm from "@/components/habit_form/HabitForm";
import HabitFormProvider, { useHabitForm } from "@/components/habit_form/HabitFormContext";
import { colors } from "@/constants/colors";
import { emitError } from "@/constants/emitError";
import { emitHabitRefetch } from "@/constants/emitRefetch";
import { emitSuccess } from "@/constants/emitSuccess";
import { createRecurringEventAndroid } from "@/constants/notificationAndroid";
import { db } from "@/db/db";
import { useState } from "react";
import { Button, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import uuid from 'react-native-uuid';

export default function CreateHabit() {
    return (<View style={{ flex: 1, backgroundColor: colors.background }}>
        <HabitFormProvider>
            <KeyboardAwareScrollView

                extraScrollHeight={20}       // � adds some padding when keyboard opens
                enableOnAndroid={true}       // � works well on Android too
                keyboardShouldPersistTaps="handled"  // � allows tapping other inputs without dismissing keyboard
            >
                <HabitForm />
            </KeyboardAwareScrollView>
            <SubmitButton />

        </HabitFormProvider>
    </View>)
}

function SubmitButton() {
    const { state, dispatch } = useHabitForm();
    const [loading, setLoading] = useState(false);

    async function createHabit() {
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
            reminderTime
        } = state;
        let reminder_event_id = null;

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

        if (endDate && new Date(endDate) < new Date()) {
            emitError("End date cannot be in the past");
            return;
        }

        if (frequency === "Repeat_Every_N_Days" && !nDaysFrequencyRate) {
            emitError("Please enter the number of days to repeat the habit");
            return;
        }

        if (evaluationType === "Numeric" && targetValue == null) {
            emitError("Please enter a target value");
            return;
        }

        const habitId = uuid.v4().toString();



        if (reminderTime) {
            const hour = reminderTime.getHours();
            const minute = reminderTime.getMinutes();

            let event_data;

            // ✅ Daily Recurring Notification
            if (frequency === "Daily") {
                event_data = await createRecurringEventAndroid(
                    "Habit Reminder",
                    habitName,
                    hour,
                    minute,
                    { interval: "daily" },
                    endDate
                );
            }

            // ✅ Weekly Recurring Notification
            else if (frequency === "Weekly") {
                event_data = await createRecurringEventAndroid(
                    "Weekly Habit Reminder",
                    habitName,
                    hour,
                    minute,
                    { interval: "weekly" },
                    endDate
                );
            }

            // ✅ Repeat Every N Days
            else if (frequency === "Repeat_Every_N_Days") {
                if (nDaysFrequencyRate == null) return;

                event_data = await createRecurringEventAndroid(
                    "Habit Reminder",
                    habitName,
                    hour,
                    minute,
                    { interval: nDaysFrequencyRate },
                    endDate
                );
            }

            // ✅ validate success/failure
            if (!event_data?.success) {
                emitError(event_data?.message || "Failed to create reminder");
                dispatch({ type: "SET_REMINDER_TIME", payload: null });
            } else {
                reminder_event_id = event_data.eventId;
            }
        }

        const sql = `
        INSERT INTO habits (
            id, habit_name, start_date, end_date, category, reminder, 
            frequency, hourly_frequency_rate, n_days_frequency_rate, 
            task_point, negative_task_point, evaluation_type, target_condition, 
            target_value, target_unit, reminder_event_id_android
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const params = [
            habitId,
            habitName,
            startDate.toISOString(),
            endDate ? endDate.toISOString() : null,
            category || null,
            reminderTime?.toISOString() || null,
            frequency,
            hourlyFrequncyRate ?? null,
            nDaysFrequencyRate ?? null,
            taskPoint ?? 0,
            negativeTaskPoint ?? 0,
            evaluationType,
            targetCondition || null,
            targetValue ?? null,
            targetUnit || null,
            reminder_event_id ?? null,
        ];


        try {
            await db.runAsync(sql, params);
            emitSuccess("Habit created successfully");
            emitHabitRefetch();
            setLoading(false);
        } catch (error) {
            console.error('Transaction failed and rolled back:', error);
            emitError("Failed to create habit");
            setLoading(false);
        }
    }



    return (
        <Button disabled={loading} title="Submit" onPress={createHabit} />
    )
}
