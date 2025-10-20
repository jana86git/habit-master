import { DeviceEventEmitter } from 'react-native';
const eventEmitter = DeviceEventEmitter; 

 export const emitError = (errorMessage: String) => {
     console.log("Emitting error: ", errorMessage);
        eventEmitter.emit("errorEvent", { error: errorMessage,time: new Date().toISOString() });
    }