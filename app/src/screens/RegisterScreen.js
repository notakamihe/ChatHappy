import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios'
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-community/async-storage";
import { normalize } from '../../utils.js';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { UserContext } from '../context/UserContext.js';

const RegisterScreen = (props) => {
    const [date, setDate] = useState(new Date(2000, 1, 1))
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [errors, setErrors] = useState([])        

    const {theUser, setTheUser} = useContext(UserContext)
    const {colors} = useTheme()

    useEffect(() => {
        if (theUser) {
            props.navigation.navigate("User")
        }
    }, [theUser])

    const signUp = () => {
        const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/

        setErrors([])

        if (!email.match(regex)) {
            setErrors(prev => [...prev, "Email is not valid"])
            return
        }

        if (date == null) {
            setErrors(prev => [...prev, "No birthdate chosen"])
            return
        }

        if (new Date().getFullYear() - date.getFullYear() < 13) {
            setErrors(prev => [...prev, "Too young. Must be at least 13"])
            return
        }

        if (password != passwordConfirm) {
            setErrors(prev => [...prev, "Passwords don't match"])
            return
        }
        
        axios.post(axios.defaults.baseURL + "signup", {
            username: username,
            email: email,
            dob: moment(date).format("YYYY-MM-DD"),
            password: password,
            friends: []
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
            if (err.response.status === 400 || err.response.status === 401) {
                setErrors(prev => [...prev, err.response.data])
            } else if (err.response.status === 500) {
                setErrors(prev => [...prev, "Server-side error"])
            }
        })
    }

    const setDateAndClose = (e) => {
        setShowDatePicker(false)
        setDate(new Date(e))
    }

    return (
        <SafeAreaView style={{ flex: 1, width: "100%"}}>
            <ScrollView style={{width: "100%", padding: 0}}>
                <View style={{alignItems: 'center', marginBottom: normalize(32)}}>
                    <View style={{width: "85%", justifyContent: 'center', marginTop: normalize(32)}}>
                        {
                            errors.map((item, index) => (
                                <Text 
                                    key={index}
                                    style={{
                                        backgroundColor: "#f0d3", 
                                        textTransform: "uppercase", 
                                        width: "100%",
                                        color: "#f0d",
                                        padding: 12,
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
                                backgroundColor: colors.bgColor2,
                                color: "#07f",
                                letterSpacing: 2
                            }}
                            onChangeText={setUsername}
                            value={username}
                        />
                        <TextInput 
                            placeholder="Email" 
                            placeholderTextColor="#fff3"
                            style={{
                                fontSize: normalize(18),
                                borderRadius: 10,
                                paddingLeft: 16,
                                marginVertical: normalize(16),
                                fontFamily: "Poppins-Medium",
                                paddingVertical: 8,
                                backgroundColor: colors.bgColor2,
                                color: "#07f",
                                letterSpacing: 2
                            }}
                            onChangeText={setEmail}
                            value={email}
                        />
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text 
                                style={{
                                    fontSize: normalize(18), 
                                    borderRadius: 10,
                                    padding: 16,
                                    marginVertical: normalize(16),
                                    fontFamily: "Poppins-Medium",
                                    textAlign: 'center',
                                    paddingVertical: 8,
                                    backgroundColor: colors.bgColor2,
                                    color: "#07f"
                                }}
                            >
                                {moment(date).format("DD MMM YYYY")}
                            </Text>
                        </TouchableOpacity>
                        <DateTimePickerModal
                            isVisible={showDatePicker}
                            mode="date"
                            onConfirm={setDateAndClose}
                            onCancel={() => setShowDatePicker(false)}
                            date={date || new Date(2000, 1, 1)}
                        />
                        <TextInput 
                            placeholder="Password" 
                            placeholderTextColor="#fff3"
                            style={{
                                fontSize: normalize(18),
                                borderRadius: 10,
                                paddingLeft: 16,
                                marginVertical: 16,
                                fontFamily: "Poppins-Medium",
                                paddingVertical: 8,
                                backgroundColor: colors.bgColor2,
                                color: "#07f",
                                letterSpacing: 2
                            }} 
                            secureTextEntry
                            onChangeText={setPassword}
                            value={password}
                        />
                        <TextInput 
                            placeholder="Confirm password" 
                            placeholderTextColor="#fff3"
                            style={{
                                fontSize: normalize(18),
                                borderRadius: 10,
                                paddingLeft: 16,
                                marginVertical: normalize(16),
                                fontFamily: "Poppins-Medium",
                                paddingVertical: 8,
                                backgroundColor: colors.bgColor2,
                                color: "#07f",
                                letterSpacing: 2
                            }} 
                            secureTextEntry
                            onChangeText={setPasswordConfirm}
                            value={passwordConfirm}
                        />
                    </View>
                    <View>
                        <TouchableOpacity 
                            style={{
                                padding: normalize(8), 
                                paddingHorizontal: 16, 
                                borderRadius: 10, 
                                marginTop: normalize(32),
                                backgroundColor: "#07f"
                            }}
                            onPress={() => signUp()}
                        >
                            <Text 
                                style={{
                                    fontSize: normalize(28), 
                                    textTransform: 'uppercase', 
                                    fontFamily: "Poppins-Bold",
                                }}
                            >
                                Sign up
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={{
                                paddingHorizontal: normalize(16), 
                                marginTop: normalize(16),
                                alignItems: 'center'
                            }}
                            onPress={() => props.navigation.navigate("Login")}
                        >
                            <Text 
                                style={{fontSize: normalize(22), fontFamily: "Poppins-Medium", textAlign: 'center', color: "#07f"}}
                            >
                                Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default RegisterScreen