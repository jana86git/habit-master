import { useHome } from "@/app/home";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { Button, DeviceEventEmitter, Dimensions, View } from "react-native";
import { BottomSheet } from "../bottom_sheet/BottomSheet";
import RadioButton from "../radio_button/RadioButton";
const eventEmitter = DeviceEventEmitter;
export default function CreateOptionPopup() {

   const { state, dispatch } = useHome();
   const { openCreateOption, createOptions, selectedCreateOption } = state;
   const { height } = Dimensions.get("window");

   const handleNext = useCallback(() => {
      if (selectedCreateOption === "1") {
         router.push("/CreateHabit");
      } else {
         router.push("/CreateTask")
      }
      dispatch({ type: "SHOW_CREATE_OPTION", payload: false })
   }, [selectedCreateOption])

   useEffect(() => {
      const footerIconClickEvent = eventEmitter.addListener('footer-icon-click', (event: any) => {
        
         if (event?.title === "Add") {
            dispatch({ type: "SHOW_CREATE_OPTION", payload: true })
         }
      });

      return () => {
         footerIconClickEvent.remove();
      };
   }, []);


   return (
      <BottomSheet onClose={() => { dispatch({ type: "SHOW_CREATE_OPTION", payload: false }) }} visible={openCreateOption} heading="What Do You Want To Create?" >
         <View style={{ height: height * 0.3 }}>
            <View style={{ gap: 16, marginTop: 20 }}>
               {createOptions.map((option) => (
                  <RadioButton
                     key={option.id}
                     label={option.label}
                     selected={selectedCreateOption === option.id}
                     onPress={() => { dispatch({ type: "SET_SELECTED_CREATE_OPTION", payload: option.id }) }}
                     disabled={option.disable}
                  />
               ))}

               <Button title="Next" onPress={handleNext} />
            </View>
         </View>
      </BottomSheet>
   )
}