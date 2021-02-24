export function formatDateString (s) {
    const d = new Date(s)

    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ]

    return `${monthNames[d.getUTCMonth()]} ${d.getUTCDate()}`
}

export function formatDateStringMMDD (s) {
    const d = new Date(s)
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
}

export function formatDateDateAtTime (dt) {
    const dateTime = new Date(dt)
    const minutesPadded = dateTime.getMinutes().toString().padStart(2, "0")

    return `${dateTime.getMonth() + 1}/${dateTime.getDate()} at ${dateTime.getHours()}:${minutesPadded}`
}