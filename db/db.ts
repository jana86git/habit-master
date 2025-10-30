import * as DocumentPicker from 'expo-document-picker';

import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import { SQLiteDatabase } from 'expo-sqlite';
import { Alert } from 'react-native';
export let db: SQLiteDatabase = SQLite.openDatabaseSync('users.db');

export async function initiateDB() {
    try {
        if (!db) return;
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
            start_date TEXT NOT NULL,
            end_date TEXT,
            task_point INTEGER DEFAULT 0,
            negative_task_point INTEGER DEFAULT 0,
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
            FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
            FOREIGN KEY (subtask_id) REFERENCES subtasks (id) ON DELETE CASCADE
        );
        `)

        console.log("Database created successfully.");
    } catch (error) {
        console.error("Error creating database:", error);
    }
}

export async function closeDatabase() {
    if (db) {
        try {
            await db.closeAsync();
            // db = null
            console.log('✅ Database connection closed');
        } catch (error) {
            console.error('❌ Failed to close database:', error);
        }
    }
}

export function openDatabase() {
    if (!db) {
        try {
            db = SQLite.openDatabaseSync('users.db');
        } catch (error) {
            console.error(error);
        }

    }
    return db;
}
export async function exportDatabase() {
    try {




        const dbURI = Paths.document.uri + "/SQLite/users.db";

        //check if the file exist or not
        const file = new File(dbURI);
        if (!file.exists) {
            alert("File not found");
            return
        }


        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) {
            alert('Sharing is not available on this device');
            return;
        }
        await closeDatabase();
        await Sharing.shareAsync(dbURI, {
            mimeType: 'application/x-sqlite3',
            dialogTitle: 'Export users.db',
            UTI: 'public.database',
        });
         openDatabase();

    } catch (error) {
        console.error('Error exporting DB:', error);
        await closeDatabase();
        openDatabase();
    }
}

export async function importDatabase() {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        const pickedAsset = result.assets[0];
        const pickedUri = pickedAsset.uri;
        const pickedName = pickedAsset.name || pickedUri.split('/').pop();

        // ✅ Ensure the filename is exactly "users.db"
        if (pickedName !== 'users.db') {
            Alert.alert(
                'Invalid File',
                'Please select a file named "users.db".',
            );
            return;
        }

        const pickedFile = new File(result.assets[0].uri);

        // before creating the directory i want to add a check if it is exist or not
        const sqliteDir = new Directory(Paths.document, 'SQLite');
        if (!sqliteDir.exists) {
            await sqliteDir.create();
        }


        const destinationFile = new File(`${sqliteDir.uri}/users.db`);

        // Check if file exists
        const exists = destinationFile.exists;

        if (exists) {
            const confirm = await new Promise((resolve) => {
                Alert.alert(
                    'Overwrite Database?',
                    'A database file already exists. Importing will overwrite the current file. Continue?',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                        { text: 'Overwrite', style: 'destructive', onPress: () => resolve(true) },
                    ],
                    { cancelable: true }
                );
            });

            if (!confirm) return;
            await destinationFile.delete(); // remove old file
        }
        await closeDatabase();
        await pickedFile.copy(destinationFile);
        openDatabase();
        alert('Database imported successfully!');
    } catch (error) {
        await closeDatabase();
        openDatabase();
        console.error('Error importing DB:', error);
        alert(`Failed to import database. See console for details.`);
    }
}