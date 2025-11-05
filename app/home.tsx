
import HabitList, { HabitCompletionModal } from "@/components/home_page_components/HabitList";
import { initialState, InitialState, reducer } from "@/components/home_page_components/reducer";
import TaskList from "@/components/home_page_components/TaskList";
import { Action } from "@/components/home_page_components/types";
import { colors } from "@/constants/colors";
import { eventEmitter } from "@/constants/eventEmitter";
import { exportDatabase, importDatabase } from "@/db/db";
import { createContext, Dispatch, useContext, useEffect, useMemo, useReducer } from "react";
import { Button, ScrollView, View } from "react-native";
interface HOME_PAGE_CONTEXT_TYPE {
    state: InitialState,
    dispatch: Dispatch<Action>;
}



const HOME_PAGE_CONTEXT = createContext<HOME_PAGE_CONTEXT_TYPE | undefined>(undefined)

export function useHome() {
    const context = useContext(HOME_PAGE_CONTEXT);
    if (!context) {
        throw new Error('useHome must be used within HomeProvider');
    }
    return context;
}


export function HomeProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const value = useMemo(() => { return { state, dispatch } }, [state, dispatch])
    return (
        <HOME_PAGE_CONTEXT.Provider value={value}>
            {children}
        </HOME_PAGE_CONTEXT.Provider>
    )
}




export default function Home() {

    const { state, dispatch } = useHome();
    const { openCreateOption } = state







    useEffect(() => {
        const handleFooterClick = (event: any) => {
            if (event?.title === "Add") {
                dispatch({ type: "SHOW_CREATE_OPTION", payload: true });
            }
        };

        // Subscribe
        eventEmitter.on('footer-icon-click', handleFooterClick);

        // Cleanup
        return () => {
            eventEmitter.off('footer-icon-click', handleFooterClick);
        };
    }, []);




    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>

                <TaskList />
                <HabitList />

                <Button title="Export DB" onPress={exportDatabase} />
                <Button title="Import DB" onPress={importDatabase} />

            </ScrollView>
            <HabitCompletionModal />
        </View>
    )
}





