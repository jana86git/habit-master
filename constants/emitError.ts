import { eventEmitter } from './eventEmitter';

export const emitError = (errorMessage: String) => {
    
    eventEmitter.emit("errorEvent", { error: errorMessage, time: new Date().toISOString() });

}