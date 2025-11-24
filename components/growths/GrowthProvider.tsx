import { createContext, Dispatch, ReactNode, useContext, useMemo, useReducer } from "react";
import { initialState, reducer } from "./reducer";
import { Action, InitialState } from "./types";

/**
 * 
 * 
 */
interface GROWTH_CONTEXT_TYPE {
    state: InitialState,
    dispatch: Dispatch<Action>;
}

const GROWTH_CONTEXT = createContext<GROWTH_CONTEXT_TYPE | undefined>(undefined)

export function useGrowth() {
    const context = useContext(GROWTH_CONTEXT);
    if (!context) {
        throw new Error('growth must be used within growth provider');
    }
    return context;
}

/**
 * 
 * @param param0 
 * 
 * @returns 
 */
export default function GrowthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

    return (
        <GROWTH_CONTEXT.Provider value={value}>
          {children}
        </GROWTH_CONTEXT.Provider>
    )

}