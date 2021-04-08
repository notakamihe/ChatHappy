import { DarkTheme } from "@react-navigation/native"

const Dark = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primaryTextColor: "#fff",
        mutedTextColor: "#fff4",
        primaryBgColor: "#fff4",
        bgColor: "#000",
        bgColor2: "#ffffff16",
        muted2: "#fff4",
        muted3: "#fff2"
    }
}

export default Dark