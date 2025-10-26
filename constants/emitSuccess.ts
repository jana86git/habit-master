import { eventEmitter } from "./eventEmitter";

 export const emitSuccess = (successMessage: String) => {
        eventEmitter.emit("successEvent", { success: successMessage,time: new Date().toISOString() });
    }