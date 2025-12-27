# Task Filtering Implementation

## Overview
I've successfully implemented task filtering based on the completions table in your `app/tasks.tsx` file. The filter allows you to view:
- **All tasks** (default)
- **Completed tasks** (tasks with at least one completion record)
- **Incompleted tasks** (tasks with no completion records)

## Database Structure Analysis

Based on the `db/db.ts` schema, the **completions** table has the following structure:
```sql
CREATE TABLE IF NOT EXISTS completions (
    id TEXT PRIMARY KEY,
    habit_id TEXT,
    task_id TEXT,
    subtask_id TEXT,
    log_date TEXT NOT NULL,
    point INTEGER NOT NULL,
    absent INTEGER CHECK (absent IN (0,1)) DEFAULT 0,
    FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    FOREIGN KEY (subtask_id) REFERENCES subtasks (id) ON DELETE CASCADE
);
```

## Implementation Details

### 1. Filter State
```tsx
const [filter, setFilter] = useState<Filter>("all");
```
The filter uses the `Filter` type from `@/components/task_form/types.ts`:
```tsx
export type Filter = "all" | "completed" | "incompleted";
```

### 2. Updated fetchTasks Function
The `fetchTasks` function now accepts a `filterType` parameter and builds different SQL queries based on the filter:

#### **"all"** - Shows all tasks
```sql
SELECT 
    id, task_name, category, start_date, end_date, task_point, negative_task_point
FROM tasks
ORDER BY created_at DESC
LIMIT ? OFFSET ?;
```

#### **"completed"** - Shows only tasks with completions
```sql
SELECT DISTINCT
    t.id, t.task_name, t.category, t.start_date, t.end_date, t.task_point, t.negative_task_point
FROM tasks t
INNER JOIN completions c ON t.id = c.task_id
ORDER BY t.created_at DESC
LIMIT ? OFFSET ?;
```

#### **"incompleted"** - Shows only tasks without completions
```sql
SELECT 
    t.id, t.task_name, t.category, t.start_date, t.end_date, t.task_point, t.negative_task_point
FROM tasks t
LEFT JOIN completions c ON t.id = c.task_id
WHERE c.id IS NULL
ORDER BY t.created_at DESC
LIMIT ? OFFSET ?;
```

### 3. Automatic Refetching
The implementation includes automatic refetching when:
- The filter changes (via `useEffect` watching the `filter` state)
- A task is deleted
- A subtask is deleted
- The 'task-refetch' event is emitted

## How to Use the Filter

To change the filter, simply call `setFilter()` with one of the three values:

```tsx
// Show all tasks
setFilter("all");

// Show only completed tasks
setFilter("completed");

// Show only incompleted tasks
setFilter("incompleted");
```

## Example: Adding Filter Buttons to the UI

You can add filter buttons to your tasks screen like this:

```tsx
import Button3D from "@/components/button_3d/Button3D";

// In your return statement, before the FlatList:
<View style={{ flexDirection: 'row', gap: 8, padding: 12 }}>
    <Button3D onPress={() => setFilter("all")}>
        <Text style={{ color: filter === "all" ? colors.primary : colors.text }}>
            All
        </Text>
    </Button3D>
    <Button3D onPress={() => setFilter("completed")}>
        <Text style={{ color: filter === "completed" ? colors.primary : colors.text }}>
            Completed
        </Text>
    </Button3D>
    <Button3D onPress={() => setFilter("incompleted")}>
        <Text style={{ color: filter === "incompleted" ? colors.primary : colors.text }}>
            Incompleted
        </Text>
    </Button3D>
</View>
```

## Key Changes Made

1. ✅ Added `Filter` import from types
2. ✅ Added `filter` state variable
3. ✅ Updated `fetchTasks` to accept `filterType` parameter
4. ✅ Implemented conditional SQL queries based on filter type
5. ✅ Updated all `fetchTasks()` calls to pass the current filter
6. ✅ Added `useEffect` to refetch when filter changes
7. ✅ Updated event listener to use current filter

## Notes

- The filter state is already declared and ready to use
- You just need to add UI controls (buttons, dropdown, etc.) to call `setFilter()`
- The filtering happens at the database level using SQL JOINs for optimal performance
- The `DISTINCT` keyword in the "completed" query ensures tasks aren't duplicated if they have multiple completion records
