
export interface PageConfig {
    headerType: 'back-button' | 'default' | 'none';
    footerShown: boolean;
    pageTitle: string;
    page: string;
}

export type Action =
    | { type: "SHOW_SIDEBAR", payload: boolean }
    | { type: "SET_ACTIVE_PAGE", payload: string }
    | { type: "SET_PAGE_CONFIG", payload: PageConfig }
    | { type: "SET_ERRORS", payload: string[] }
| { type: "SET_SUCCESSES", payload: string[]};

export interface IconItem { icon: any, iconName: string, title: string, value: string, type: "redirect"|"event" }