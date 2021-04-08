import { DefaultTheme } from "@react-navigation/native"

const Light = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primaryTextColor: "#000",
        mutedTextColor: "#0004",
        primaryBgColor: "#07f",
        bgColor: "#fff",
        bgColor2: "#07f2",
        muted2: "#0004",
        muted3: "#0002"
    }
}

export default Light