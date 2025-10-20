import { DeviceEventEmitter } from 'react-native';
const eventEmitter = DeviceEventEmitter; 

 export const emitSuccess = (successMessage: String) => {
        eventEmitter.emit("successEvent", { success: successMessage,time: new Date().toISOString() });
    }