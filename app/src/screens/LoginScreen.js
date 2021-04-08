import AsyncStorage from "@react-native-community/async-storage";
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import { normalize } from '../../utils.js';
import { UserContext } from '../context/UserContext.js';

const LoginScreen = (props) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] =  useState('')
    const [user, setUser] = useState({})
    const [errors, setErrors] = useState([])

    const {theUser, setTheUser} = useContext(UserContext)

    useEffect(() => {
        if (theUser) {
            props.navigation.navigate("User")
        }
    }, [theUser])

    const logIn = () => {
        setErrors([])

        console.log(axios.defaults.baseURL);

        axios.get(axios.defaults.baseURL + "conversations").then(res => {
            console.log(res.data);
        }).catch(err => {
            console.log(err);
        })

        axios.post(axios.defaults.baseURL + "login", {
            username: username,
            password: password,
        }).then(res => {
            AsyncStorage.setItem("token", res.data.token)
            
            axios.get(axios.defaults.baseURL + "user", {
                headers: {
                    'x-access-token': res.data.token
                }
            }).then(r => {
                setTheUser(r.data)
            }).catch(err => {
                setTheUser(null)
            })
        }).catch(err => {
            console.log(err);

            if (err.response.status === 400 || err.response.status === 401) {
                setErrors(prev => [...prev, err.response.data])
            } else if (err.response.status === 500) {
                setErrors(prev => [...prev, "Server-side error"])
            }
        })
    }

    return (
        <View style={{flex: 1, alignItems: "center"}}>
            <Image 
                source={require("./../../assets/images/chathappywhite.png")}
                style={{width: 150, height: 150}} 
            />
            <View style={{width: "85%", flex: 2, justifyContent: 'center'}}>
                {
                    errors.map((item, index) => (
                        <Text 
                            key={index}
                            style={{
                                backgroundColor: "#f0d3", 
                                textTransform: "uppercase", 
                                width: "100%",
                                color: "#f0d",
                                padding: normalize(12),
                                fontSize: normalize(18),
                                textAlign: 'center',
                                borderRadius: 50,
                                marginVertical: normalize(8)
                            }}>
                                {item}
                        </Text>
                    ))
                }    
                <TextInput 
                    placeholder="Username" 
                    placeholderTextColor="#fff3"
                    style={{
                        fontSize: normalize(18),
                        borderRadius: 10,
                        paddingLeft: 16,
                        marginVertical: normalize(16),
                        fontFamily: "Poppins-Medium",
                        paddingVertical: 8,
                        color: "#07f",
                        letterSpacing: 2
                    }} 
                    onChangeText={setUsername}
                    value={username}
                />
                <TextInput 
                    placeholder="Password" 
                    placeholderTextColor="#fff3"
                    style={{
                        fontSize: normalize(18),
                        borderRadius: 10,
                        paddingLeft: 16,
                        marginVertical: normalize(16),
                        fontFamily: "Poppins-Medium",
                        paddingVertical: 8,
                        color: "#07f",
                        letterSpacing: 2
                    }} 
                    secureTextEntry
                    onChangeText={setPassword}
                    value={password}
                />
            </View>
            <View style={{flexGrow: 1}}>
                <TouchableOpacity 
                    style={{
                        backgroundColor: "#0077ff", 
                        padding: normalize(8), 
                        paddingHorizontal: normalize(16), 
                        borderRadius: 10, 
                        marginTop: normalize(32)
                    }}
                    onPress={() => logIn()}
                >
                    <Text 
                        style={{
                            fontSize: normalize(28), 
                            textTransform: 'uppercase', 
                            fontFamily: "Poppins-Bold"
                        }}
                    >
                        Log in
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{
                        paddingHorizontal: normalize(16), 
                        marginTop: normalize(16),
                        alignItems: 'center',
                    }}
                    onPress={() => props.navigation.navigate("Register")}
                >
                    <Text 
                        style={{fontSize: normalize(22), textAlign: 'center', color: "#07f", fontFamily: "Poppins-Medium",}}
                    >
                        Register
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default LoginScreen
