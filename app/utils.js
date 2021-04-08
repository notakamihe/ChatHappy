import moment from "moment"
import { Platform, PixelRatio, Dimensions } from "react-native";

export function normalize (size) {
    const newSize = size * (Math.min(Dimensions.get("window").width / 350, 2)) 

    if (Platform.OS === "ios") {
        return Math.round(PixelRatio.roundToNearestPixel(newSize))
    } else {
         return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
    }
}

export function formatDate (date) {
    if (new Date().getFullYear() - new Date().getFullYear() >= 1) {
        return moment(date).format("M/D/YY [at] h:mm")
    } else if (Math.abs(new Date() - new Date(date)) / (24 * 60 * 60 * 1000) >= 7) {
        return moment(date).format("MMM D [at] h:mm")
    }

    moment.updateLocale("en", {
        relativeTime: {
            future: '%s',
            past: '%s',
            s: '%ds',
            ss: '%ds',
            m: '%dm',
            mm: '%dm',
            h: '%dh',
            hh: '%dh',
            d: '%dd',
            dd: '%dd',
        }
    })
    
    return moment(date).fromNow()
}
