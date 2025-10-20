import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('users.db');

export async function initiateDB() {
    try {
        await db.execAsync(`
        -- Enable foreign keys and recursive triggers (important for SQLite)
        PRAGMA foreign_keys = ON;
        PRAGMA recursive_triggers = ON;

        -- ========================
        -- CATEGORY TABLE
        -- ========================

        CREATE TABLE IF NOT EXISTS category (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            avatar TEXT
        );

        -- ========================
        -- HABITS TABLE
        -- ========================

        CREATE TABLE IF NOT EXISTS habits (
            id TEXT PRIMARY KEY,
            habit_name TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT,
            category TEXT,
            reminder TEXT,
            frequency TEXT NOT NULL,
            hourly_frequency_rate INTEGER,
            n_days_frequency_rate INTEGER,
            task_point INTEGER DEFAULT 0,
            negative_task_point INTEGER DEFAULT 0,
            evaluation_type TEXT NOT NULL,
            target_condition TEXT NOT NULL,
            target_value REAL,
            target_unit TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category) REFERENCES category (name)
        );

        -- ========================
        -- TASKS TABLE
        -- ========================

        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            task_name TEXT NOT NULL,
            category TEXT,
            reminder TEXT,
            date TEXT NOT NULL,
            end_date TEXT,
            task_point INTEGER DEFAULT 0,
            negative_task_point INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category) REFERENCES category (name)
        );
        -- ========================
        -- SUBTASKS TABLE
        -- ========================
        CREATE TABLE IF NOT EXISTS subtasks (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            task_id TEXT NOT NULL,
            point INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
        );
        -- ========================
        -- COMPLETIONS TABLE
        -- ========================
        CREATE TABLE IF NOT EXISTS completions (
            id TEXT PRIMARY KEY,
            habit_id TEXT,
            task_id TEXT,
            subtask_id TEXT,
            log_date TEXT NOT NULL,
            point INTEGER NOT NULL,
            negative_point INTEGER NOT NULL,
            FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
            FOREIGN KEY (subtask_id) REFERENCES subtasks (id) ON DELETE CASCADE
        );

        -- ========================
        -- TRIGGER: VALIDATE COMPLETION DATE
        -- ========================
        CREATE TRIGGER IF NOT EXISTS validate_completion_date
        BEFORE INSERT ON completions
        BEGIN
            -- Validate habit start date matches today (if habit_id is given)
            SELECT 
                CASE 
                    WHEN NEW.habit_id IS NOT NULL AND 
                        (SELECT date(start_date) FROM habits WHERE id = NEW.habit_id) != date('now')
                    THEN
                        RAISE(ABORT, 'Habit start_date must match today''s date')
                END;

            -- Validate task start date matches today (if task_id is given)
            SELECT 
                CASE 
                    WHEN NEW.task_id IS NOT NULL AND 
                        (SELECT date(start_date) FROM tasks WHERE id = NEW.task_id) != date('now')
                    THEN
                        RAISE(ABORT, 'Task start_date must match today''s date')
                END;
        END;
        `)

        console.log("Database created successfully.");
    } catch (error) {
        console.error("Error creating database:", error);
    }
}