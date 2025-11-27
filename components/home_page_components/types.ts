export type Action =
    | { type: "SHOW_CREATE_OPTION", payload: boolean }
    | { type: "SHOW_ANY", payload: string }
    | { type: "SET_SELECTED_CREATE_OPTION", payload: string }
    | { type: "SET_SELECTED_DATE", payload: Date }
    | { type: "SET_HABIT_COMPLETION_DETAILS", payload: HabitRecord | null }
    | { type: "SET_HABIT_COMPLETION_MAP", payload: Map<string, CompletionStatus> }
    | { type: "SET_ACTIVE_TAB", payload: "tasks" | "habits" }
    | { type: "SET_TASK_COUNT", payload: number }
    | { type: "SET_HABIT_COUNT", payload: number }

export type HabitRecord = {
    id: string;
    habit_name: string;
    category: string | null;
    start_date: string;
    end_date: string | null;
    task_point: number;
    negative_task_point: number;
    frequency: string; // Daily, Weekly, Monthly, Repeat_Every_N_Days
    n_days_frequency_rate?: number;
    evaluation_type: string;
    target_condition: string;
    target_value: number;
    target_unit: string | null;
};

export type CompletionStatus = {
    completed: boolean;
    point: number;
    log_date: Date;

};