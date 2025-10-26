import { AntDesign, Ionicons } from '@expo/vector-icons';
import { PageConfig } from "./types";

import { Entypo } from '@expo/vector-icons';



export const pageConfigs: PageConfig[] = [
    {
        page:"/home",
        pageTitle: "HabitMaster",
        headerType: "default",
        footerShown: true
    },
    {
        page:"/CreateHabit",
        pageTitle: "Create Habit",
        headerType: "back-button",
        footerShown: false
    },
    {
        page:"/CreateTask",
        pageTitle: "Create Task",
        headerType: "back-button",
        footerShown: false
    },
    {
        page:"/habits",
        pageTitle: "Your Habits",
        headerType: "default",
        footerShown: true
    },
     {
        page:"/tasks",
        pageTitle: "Your Tasks",
        headerType: "default",
        footerShown: true
    }
]





export const footerItems = [
        { icon: Ionicons, iconName:"today-outline", title: 'Today', value:"/home", type:"redirect" },
        { icon: Ionicons,iconName:"stats-chart-outline", title: 'Search', value:"/search",type:"redirect" },
        { icon: AntDesign ,iconName:"plus", title: 'Add', value: "/add",type:"event" },
        { icon: Entypo,iconName:"line-graph", title: 'Habits',value: "/habits",type:"redirect"  },
        { icon: Entypo,iconName:"notification", title: 'Tasks',value: "/tasks",type:"redirect"  }
];

