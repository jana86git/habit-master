import { db } from "@/db/db";
import uuid from "react-native-uuid";

// ===========================================
// TYPES
// ===========================================

export interface Habit {
    id: string;
    habit_name: string;
    start_date: string;
    end_date: string | null;
    frequency: "Daily" | "Weekly" | "Monthly" | "Repeat_Every_N_Days";
    n_days_frequency_rate: number | null;
    [key: string]: any; // for any additional fields
}

export interface CompletionRow {
    log_date: string;
}

// ===========================================
// MAIN FUNCTION — CALL THIS
// ===========================================
export async function autoMarkAbsentCompletions(): Promise<void> {
    if (!db) return;

    await ensureAbsentColumn();

    // ✅ Fetch all habits with typing
    const habits: Habit[] = await db.getAllAsync(`SELECT * FROM habits`);

    if (!habits?.length) {
        console.log("⚠️ No habits found.");
        return;
    }

    console.log(`Processing ${habits.length} habits...\n`);

    for (const habit of habits) {
        await processHabitAbsent(habit);
    }

    console.log("✅ Finished marking absent entries.");
}

// ===========================================
// STEP 1 — Add "absent" column if missing
// ===========================================
async function ensureAbsentColumn(): Promise<void> {
    if(!db) return;
    const cols: { name: string }[] = await db.getAllAsync("PRAGMA table_info(completions)");

    const hasAbsent = cols.some((c) => c.name === "absent");

    if (!hasAbsent) {
        console.log("Adding 'absent' column...");
        await db.execAsync(`
            ALTER TABLE completions
            ADD COLUMN absent INTEGER CHECK (absent IN (0,1)) DEFAULT 0;
        `);
        console.log("✅ 'absent' column added.\n");
    }
}

// ===========================================
// STEP 2 — Process each habit
// ===========================================
async function processHabitAbsent(habit: Habit): Promise<void> {
    if(!db) return;
    // ✅ Fetch completed dates
    const rows: CompletionRow[] = await db.getAllAsync(`
        SELECT log_date FROM completions
        WHERE habit_id = '${habit.id}'
    `);

    const completed = new Set(rows.map(r => r.log_date));

    // ✅ Generate all expected dates
    const expectedDates = generateHabitDates(habit);

    // ✅ Find skipped dates
    const skippedDates = expectedDates.filter((d) => !completed.has(d));

    if (skippedDates.length === 0) {
        console.log(`✅ No missed days for ${habit.habit_name}`);
        return;
    }

    // ✅ Insert all skipped dates in ONE batch
    await bulkInsertAbsent(habit, skippedDates);

    console.log(`✅ Inserted ${skippedDates.length} absent days for ${habit.habit_name}`);
}

// ===========================================
// STEP 3 — BATCH INSERT (ULTRA FAST)
// ===========================================
async function bulkInsertAbsent(habit: Habit, skippedDates: string[]): Promise<void> {
    if(!db) return;
    if (skippedDates.length === 0) return;

    await db.execAsync("BEGIN TRANSACTION");

    try {
        const placeholders = skippedDates
            .map(() => "(?, ?, ?, ?, ?)")
            .join(",");

        const sql = `
            INSERT INTO completions (id, habit_id, log_date, point, absent)
            VALUES ${placeholders}
        `;

        // ✅ FIXED TYPE
        const params: (string | number | null)[] = [];

        for (const date of skippedDates) {
            params.push(
                uuid.v4().toString(),                  // id (string)
                habit.id,                      // habit_id (string)
                date,                          // log_date (string)
                -habit.negative_task_point,    // point (number)
                1                              // absent (number)
            );
        }

        await db.runAsync(sql, params);

        await db.execAsync("COMMIT");

    } catch (err) {
        console.error("❌ Batch insert failed:", err);
        await db.execAsync("ROLLBACK");
    }
}


// ===========================================
// STEP 4 — Generate habit dates based on frequency
// ===========================================
function generateHabitDates(habit: Habit): string[] {
    const dates: string[] = [];

    const start = new Date(habit.start_date);
    const todayMinus1 = new Date();
    todayMinus1.setDate(todayMinus1.getDate() - 1);

    const end = habit.end_date ? new Date(habit.end_date) : todayMinus1;
    const finalEnd = end > todayMinus1 ? todayMinus1 : end;

    let current = new Date(start);

    while (current <= finalEnd) {
        dates.push(current.toISOString().split("T")[0]);

        switch (habit.frequency) {
            case "Daily":
                current.setDate(current.getDate() + 1);
                break;

            case "Weekly":
                current.setDate(current.getDate() + 7);
                break;

            case "Monthly": {
                const day = start.getDate();
                current.setMonth(current.getMonth() + 1);
                current.setDate(day);
                break;
            }

            case "Repeat_Every_N_Days":
                if (habit.n_days_frequency_rate)
                    current.setDate(current.getDate() + habit.n_days_frequency_rate);
                break;

            default:
                return dates;
        }
    }

    return dates;
}
