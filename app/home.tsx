
import Button3D from "@/components/button_3d/Button3D";
import HabitList, { HabitCompletionModal } from "@/components/home_page_components/HabitList";
import { initialState, InitialState, reducer } from "@/components/home_page_components/reducer";
import { styles } from "@/components/home_page_components/styles";
import TaskList from "@/components/home_page_components/TaskList";
import { Action } from "@/components/home_page_components/types";
import WindowScrollview from "@/components/window_scrollview/WindowScrollview";
import { colors } from "@/constants/colors";
import { eventEmitter } from "@/constants/eventEmitter";
import { fonts } from "@/constants/fonts";
import { createContext, Dispatch, useContext, useEffect, useMemo, useReducer } from "react";
import { Text, View } from "react-native";
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
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <Button3D active={state.activeTab === 'tasks'} onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "tasks" })}>
                    <View style={{ padding: 4, width: 60, alignItems: "center" }}>
                        <Text style={{ color: colors.textOnPrimary, fontSize: 16, fontFamily: fonts.bold }}>Task</Text>
                    </View>
                </Button3D>
                <Button3D active={state.activeTab === 'habits'} onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "habits" })}>
                    <View style={{ padding: 4, width: 60, alignItems: "center" }}>
                        <Text style={{ color: colors.textOnPrimary, fontSize: 16, fontFamily: fonts.bold }}>Habit</Text>
                    </View>
                </Button3D>
                <View style={styles.totalInfo}>
                    <Text style={{ color: colors.text, fontFamily: fonts.regular }}>
                        {state.activeTab === 'tasks'
                            ? `Total Task: ${state.taskCount}`
                            : `Total Habit: ${state.habitCount}`}
                    </Text>
                </View>

            </View>
            <WindowScrollview>



                {/* Tab Content */}
                {state.activeTab === 'tasks' ? (
                    <TaskList />
                ) : (
                    <HabitList />
                )}




            </WindowScrollview>
            <HabitCompletionModal />
        </View>
    )
}





