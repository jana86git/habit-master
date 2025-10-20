import HabitForm from "@/components/habit_form/HabitForm";
import HabitFormProvider, { useHabitForm } from "@/components/habit_form/HabitFormContext";
import { colors } from "@/constants/colors";
import { emitError } from "@/constants/emitError";
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

        if (!habitName?.trim()) {
            emitError("Please enter a habit name");
            return;
        }

        if (!startDate) {
            emitError("Please select a start date");
            return;
        }

        if (new Date(startDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)) {
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

        const sql =`
        INSERT INTO habits (
            id, habit_name, start_date, end_date, category, reminder, 
            frequency, hourly_frequency_rate, n_days_frequency_rate, 
            task_point, negative_task_point, evaluation_type, target_condition, 
            target_value, target_unit
        ) VALUES (
            '${habitId}',
            '${habitName}',
            '${startDate}',
            ${endDate ? `'${endDate}'` : 'NULL'},
            ${category ? `'${category}'` : 'NULL'},
            ${reminderTime ? `'${reminderTime}'` : 'NULL'},
            '${frequency}',
            ${hourlyFrequncyRate ?? 'NULL'},
            ${nDaysFrequencyRate ?? 'NULL'},
            ${taskPoint ?? 0},
            ${negativeTaskPoint ?? 0},
            '${evaluationType}',
            ${targetCondition ? `'${targetCondition}'` : 'NULL'},
            ${targetValue ?? 'NULL'},
            ${targetUnit ? `'${targetUnit}'` : 'NULL'}
        );
        `;

        try {
            await db.execAsync(sql);
            console.log('Habit inserted successfully!');
            setLoading(false);
        } catch (error) {
            console.error('Transaction failed and rolled back:', error);
            setLoading(false);
        }
    }



    return (
        <Button disabled={loading} title="Submit" onPress={createHabit} />
    )
}
