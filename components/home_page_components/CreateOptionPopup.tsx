import { useHome } from "@/app/home";
import { colors } from "@/constants/colors";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { DeviceEventEmitter, Dimensions, Text, View } from "react-native";
import Button3D from "../button_3d/Button3D";
import RadioButton from "../radio_button/RadioButton";
import WindowModal from "../window_modal/WindowModal";

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
      <WindowModal onClose={() => { dispatch({ type: "SHOW_CREATE_OPTION", payload: false }) }} visible={openCreateOption} label="Create:" >
         <View style={{ height: height * 0.3, padding: 8 }}>
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

               <Button3D onClick={handleNext}>
                  <View style={{ width: "80%", alignItems: "center", paddingVertical: 8 }}>
                     <Text style={{ color: colors.textOnPrimary }}>Next</Text>
                  </View>
               </Button3D>
            </View>
         </View>
      </WindowModal>
   )
}