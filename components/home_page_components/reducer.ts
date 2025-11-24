import { Action, CompletionStatus, HabitRecord } from "./types";
export const initialState = {
    openCreateOption: false,
    createOptions: [
        { id: "1", label: "Habit/Periodic Task", disable: false },
        { id: "2", label: "Task", disable: false }
    ],
    selectedCreateOption: "1",
    selectedDate: new Date(),
    habitCompletionDetails: null as HabitRecord | null,
    completionMap: new Map() as Map<string, CompletionStatus>,
    activeTab: "habits" as "tasks" | "habits",
}

export type InitialState = typeof initialState

export function reducer(state: InitialState, action: Action): InitialState {
    switch (action.type) {
        case "SHOW_CREATE_OPTION":
            return { ...state, openCreateOption: action.payload };
        case "SET_SELECTED_CREATE_OPTION":
            return { ...state, selectedCreateOption: action.payload };
        case "SET_SELECTED_DATE":
            return { ...state, selectedDate: action.payload };
        case "SET_HABIT_COMPLETION_DETAILS":
            return { ...state, habitCompletionDetails: action.payload };
        case "SET_HABIT_COMPLETION_MAP":
            return { ...state, completionMap: action.payload };
        case "SET_ACTIVE_TAB":
            return { ...state, activeTab: action.payload };
        default:
            return state;
    }
}