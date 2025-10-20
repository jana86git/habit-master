export type Action =
    | { type: "SHOW_CREATE_OPTION", payload: boolean }
    | { type: "SHOW_ANY", payload: string }
    | {type:"SET_SELECTED_CREATE_OPTION", payload: string}
    
    