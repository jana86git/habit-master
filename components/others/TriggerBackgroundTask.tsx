import * as BackgroundTask from 'expo-background-task';
import { Button } from 'react-native';

export default function TriggerBackgroundTask() {
  const triggerTask = async () => {
    await BackgroundTask.triggerTaskWorkerForTestingAsync();
  };

  return <Button title="Trigger Background Task" onPress={triggerTask} />;
}