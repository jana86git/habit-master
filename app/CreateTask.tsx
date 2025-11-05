
import TaskForm from "@/components/task_form/TaskForm"
import TaskFormProvider, { useTaskForm } from "@/components/task_form/TaskFormContext"
import { colors } from "@/constants/colors"
import { emitError } from "@/constants/emitError"
import { emitTasksRefetch } from "@/constants/emitRefetch"
import { emitSuccess } from "@/constants/emitSuccess"
import { db } from "@/db/db"
import { useState } from "react"
import { Button, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import uuid from 'react-native-uuid'



export default function CreateTask() {
    return (<View style={{ flex: 1, backgroundColor: colors.background }}>
        <TaskFormProvider>
            <KeyboardAwareScrollView

                extraScrollHeight={20}       // � adds some padding when keyboard opens
                enableOnAndroid={true}       // � works well on Android too
                keyboardShouldPersistTaps="handled"  // � allows tapping other inputs without dismissing keyboard
            >
                <TaskForm />
            </KeyboardAwareScrollView>
            <SubmitButton />

        </TaskFormProvider>
    </View>)
}


function SubmitButton() {

    const { state, dispatch } = useTaskForm();
    const [loading, setLoading] = useState(false);

    async function createTask() {
        if(!db) return;
        const {
            taskName,
            startDate,
            endDate,
            reminderTime,
            taskPoint,
            negativeTaskPoint,
            category,
            subtasks,
        } = state;

        // 🧩 Basic Validations
        if (!taskName?.trim()) {
            emitError("Please enter a task name");
            return;
        }

        if (!startDate) {
            emitError("Please select a start date");
            return;
        }

        const today = new Date();
        const start = new Date(startDate);

        if (start.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
            emitError("Start date cannot be in the past");
            return;
        }

        if (endDate) {
            const end = new Date(endDate);
            if (end < start) {
                emitError("End date cannot be before start date");
                return;
            }
        }

        if (isNaN(taskPoint) || taskPoint < 0) {
            emitError("Task points must be 0 or greater");
            return;
        }

        if (isNaN(negativeTaskPoint) || negativeTaskPoint < 0) {
            emitError("Negative task points must be 0 or greater");
            return;
        }

        // ✅ Subtasks validation
        for (const [index, subtask] of subtasks.entries()) {
            if (!subtask.name.trim()) {
               emitError( `Subtask #${index + 1} is missing a name`);
                return;
            }
            if (isNaN(subtask.point) || subtask.point < 0) {
                emitError(`Subtask "${subtask.name}" must have valid non-negative points`);
                return;
            }
        }

        // ✅ (Optional) Prevent duplicate subtasks
        const subtaskNames = subtasks.map(s => s.name.trim().toLowerCase());
        const duplicates = subtaskNames.filter((n, i) => subtaskNames.indexOf(n) !== i);
        if (duplicates.length > 0) {
            emitError(`Duplicate subtask names found: ${duplicates.join(", ")}`);
            return;
        }

        try {
            const taskId = uuid.v4().toString();

            // 🧠 Insert main task
            const insertTaskSQL = `
      INSERT INTO tasks (
        id, task_name, start_date, end_date, reminder,
        task_point, negative_task_point, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

            await db.runAsync(insertTaskSQL, [
                taskId,
                taskName.trim(),
                startDate.toISOString(),
                endDate ? endDate.toISOString() : null,
                reminderTime ? reminderTime.toISOString() : null,
                taskPoint,
                negativeTaskPoint,
                category,
            ]);

            // 🧠 Insert subtasks (if any)
            if (subtasks.length > 0) {
           
                const insertSubtaskSQL = `
        INSERT INTO subtasks (id, task_id, name, point)
        VALUES (?, ?, ?, ?);
      `;

                await Promise.all(
                    subtasks.map(sub =>
                        db?.runAsync(insertSubtaskSQL, [uuid.v4().toString(), taskId, sub.name.trim(), sub.point])
                    )
                );
            }

            emitSuccess("Task created successfully!");
            emitTasksRefetch();
        } catch (error) {
            console.error("❌ Error inserting task:", error);
            emitError("Failed to create task. Please try again.");
        }
    }

    return (
        <View style={{ padding: 16 }}>
            <Button disabled={loading} title="Submit" onPress={createTask} />
        </View>
    );
}