import AsyncStorage from "@react-native-community/async-storage"
import { StyleSheet } from "react-native"

var isDarkModeOn;

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

(async () => {
    isDarkModeOn = await AsyncStorage.getItem("isDarkModeOn")
})()

console.log("Ho");


export default StyleSheet.create({
    container: {
        backgroundColor: "#111111",
        flex: 1,
        zIndex: -300,
        alignItems: "center"
    },
    textPrimary: {
        color: "white"
    }
})