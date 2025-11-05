import { eventEmitter } from './eventEmitter';

export const emitTasksRefetch = () => {
   
    eventEmitter.emit("task-refetch", {  time: new Date().toISOString() });

}

export const emitHabitRefetch = () => {
   
    eventEmitter.emit("habit-refetch", {  time: new Date().toISOString() });

}