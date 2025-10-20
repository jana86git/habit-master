import { Action } from "./types";
export const initialState = {
    openCreateOption: false,
    createOptions: [
        {id:"1", label:"Habit/Periodic Task", disable: false},
        {id:"2", label:"Task", disable: false}
    ],
    selectedCreateOption:"1"
}

export type InitialState = typeof initialState

export function reducer(state: InitialState, action: Action): InitialState {
    switch (action.type) {
        case "SHOW_CREATE_OPTION":
            return { ...state, openCreateOption: action.payload };
        case "SET_SELECTED_CREATE_OPTION":
            return { ...state, selectedCreateOption: action.payload };
        default:
            return state;
    }
}