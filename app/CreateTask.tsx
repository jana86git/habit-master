
import TaskForm from "@/components/task_form/TaskForm"
import TaskFormProvider from "@/components/task_form/TaskFormContext"
import { colors } from "@/constants/colors"
import { View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
export default function CreateTask() {
     return (<View style={{ flex: 1, backgroundColor: colors.background }}>
            <TaskFormProvider>
                <KeyboardAwareScrollView
    
                    extraScrollHeight={20}       // � adds some padding when keyboard opens
                    enableOnAndroid={true}       // � works well on Android too
                    keyboardShouldPersistTaps="handled"  // � allows tapping other inputs without dismissing keyboard
                >
                    <TaskForm />
                </KeyboardAwareScrollView>
                {/* <SubmitButton /> */}
    
            </TaskFormProvider>
        </View>)
}


