import { Action, PageConfig } from "./types";

export const initialState = {
    sidebarVisibility: false,
    refreshing: false,
    activePage: "",
    currentPageConfig: null as PageConfig | null,
    errors:[] as string[],
    successes:[] as string[],
};

export type StateType = typeof initialState;

export function reducer(state: StateType, action: Action): StateType {
    switch (action.type) {
        case "SHOW_SIDEBAR":
            return { ...state, sidebarVisibility: action.payload };
        case "SET_ACTIVE_PAGE":
            return { ...state, activePage: action.payload }
        case "SET_PAGE_CONFIG":
            return {...state, currentPageConfig: action.payload}
        case "SET_ERRORS":
            return {...state, errors: action.payload}
        case "SET_SUCCESSES":
            return {...state, successes: action.payload}
        default:
            return state;
    }
}