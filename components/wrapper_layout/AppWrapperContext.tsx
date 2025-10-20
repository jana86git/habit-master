import { createContext, Dispatch, ReactNode, useContext, useMemo, useReducer } from "react";
import { AppWrapperComponent } from "./AppWrapper";
import { initialState, reducer, StateType } from "./reducer";
import { Action } from "./types";

/**
 * 
 * 
 */
interface APP_WRAPPER_CONTEXT_TYPE {
    state: StateType,
    dispatch: Dispatch<Action>;
}

const APP_WRAPPER_CONTEXT = createContext<APP_WRAPPER_CONTEXT_TYPE | undefined>(undefined)

export function useAppWrapper() {
    const context = useContext(APP_WRAPPER_CONTEXT);
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
export default function AppWrapperProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

    return (
        <APP_WRAPPER_CONTEXT.Provider value={value}>
            <AppWrapperComponent>{children}</AppWrapperComponent>
        </APP_WRAPPER_CONTEXT.Provider>)

}