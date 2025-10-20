import { createContext, Dispatch, ReactNode, useContext, useMemo, useReducer } from "react";
import { initialState, reducer } from "./reducer";
import { Action, InitialState } from "./types";

/**
 * 
 * 
 */
interface HABIT_FORM_CONTEXT_TYPE {
    state: InitialState,
    dispatch: Dispatch<Action>;
}

const HABIT_FORM_CONTEXT = createContext<HABIT_FORM_CONTEXT_TYPE | undefined>(undefined)

export function useHabitForm() {
    const context = useContext(HABIT_FORM_CONTEXT);
    if (!context) {
        throw new Error('useAppWrapper must be used within AppWrapper');
    }
    return context;
}

/**
 * 
 * @param param0 
 * 
 * @returns 
 */
export default function HabitFormProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

    return (
        <HABIT_FORM_CONTEXT.Provider value={value}>
          {children}
        </HABIT_FORM_CONTEXT.Provider>
    )

}