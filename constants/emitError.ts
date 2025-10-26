import { EventEmitter } from 'events';
import { eventEmitter } from './eventEmitter';

export const emitError = (errorMessage: String) => {
    console.log(EventEmitter)
    console.log("Emitting error: ", errorMessage);
    eventEmitter.emit("errorEvent", { error: errorMessage, time: new Date().toISOString() });

}