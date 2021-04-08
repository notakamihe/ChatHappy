import React, { useState, useEffect } from "react";
import axios from "axios"
import AsyncStorage from "@react-native-community/async-storage";

export const UserContext = React.createContext()

export const UserProvider = ({ children }) => {
    const [theUser, setTheUser] = useState(undefined)

    useEffect(() =>  {
        getUserByToken()
    }, [])

    const getUserByToken = async () => {
        const token = await AsyncStorage.getItem("token")

        axios.get(axios.defaults.baseURL + "user", {
            headers: {
                'x-access-token': token
            }
        }).then(res => {
            setTheUser(res.data)
        }).catch(err => {
            setTheUser(null)
        })
    }

    return (
        <UserContext.Provider value={{ theUser, setTheUser }}>
            {children}
        </UserContext.Provider>
    );
};