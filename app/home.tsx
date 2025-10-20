
import { initialState, InitialState, reducer } from "@/components/home_page_components/reducer";
import { Action } from "@/components/home_page_components/types";
import { colors } from "@/constants/colors";
import { createContext, Dispatch, useContext, useEffect, useMemo, useReducer } from "react";
import { DeviceEventEmitter, Text, View } from "react-native";
const eventEmitter = DeviceEventEmitter;

interface HOME_PAGE_CONTEXT_TYPE {
    state: InitialState,
    dispatch: Dispatch<Action>;
}

const HOME_PAGE_CONTEXT = createContext<HOME_PAGE_CONTEXT_TYPE|undefined>(undefined)

export function useHome() {
    const context = useContext(HOME_PAGE_CONTEXT);
    if (!context) {
        throw new Error('useAppWrapper must be used within AppWrapper');
    }
    return context;
}


export  function HomeProvider({children}: {children: React.ReactNode}){
    const [state,dispatch] = useReducer(reducer, initialState)
    const value = useMemo(()=>{return {state,dispatch}},[state,dispatch])
    return(
        <HOME_PAGE_CONTEXT.Provider value={value}>
          {children}
        </HOME_PAGE_CONTEXT.Provider>
    )
}




export default function Home() {

   const {state,dispatch} = useHome();
   const {openCreateOption} = state
    useEffect(() => {
        const footerIconClickEvent = eventEmitter.addListener('footer-icon-click', (event: any) => {

            if(event?.title === "Add"){
                dispatch({type:"SHOW_CREATE_OPTION", payload: true})
            }
        });

        return () => {
            footerIconClickEvent.remove();
        };
    }, []);

    return (

        <View style={{ flex: 1, backgroundColor: colors.background}}>
            <Text>Get Started</Text>
         
        </View>
    )
}





