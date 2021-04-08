import React, { Component, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { Text, TextInput, View, TouchableOpacity, SafeAreaView } from 'react-native'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { normalize } from '../../utils';
import { ScrollView } from 'react-native-gesture-handler';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';

const EditProfileScreen = (props) => {
    const [date, setDate] = useState(new Date(2000, 1, 1))
    const [email, setEmail] = useState('johndoe@example.com')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [errors, setErrors] = useState([])

    const {theUser, setTheUser} = useContext(UserContext)
    const {colors} = useTheme()

    if (!theUser) {
        props.navigation.navigate("Login")
    }

    useEffect(() => {
        setEmail(theUser.email)            
        setDate(moment(theUser.dob).toDate())
    }, [])

    const setDateAndClose = (e) => {
        setShowDatePicker(false)
        setDate(new Date(e))
    }

    const updateProfile = () => {
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

        axios.put(axios.defaults.baseURL + `users/${theUser._id}`, {
            username: theUser.username,
            email: email,
            dob: moment(date).format("YYYY-MM-DD"),
            friends: theUser.friends.map(f => f._id),
            isDarkModeOn: theUser.isDarkModeOn
        }).then(res => {
            const newUser = theUser

            newUser.email = email
            newUser.dob = moment(date).format("YYYY-MM-DD")

            setTheUser(newUser)
            props.navigation.navigate("Tabs")
        }).catch(err => {
            if (err.response.status === 400) {
                setErrors(prev => [...prev, err.response.data])
            } else if (err.response.status === 500) {
                setErrors(prev => [...prev, "Server-side error"])
            }
        })
    }

    return (
        <SafeAreaView>
            <ScrollView style={{width: "100%"}}>
                <View style={{justifyContent: 'center', width: "100%", padding: normalize(32)}}>
                    <View style={{alignItems: 'center'}}>
                        <View style={{alignItems: "center", width: "100%", padding: normalize(20)}} >
                            <Text style={{fontSize: normalize(32), fontWeight: 'bold', color: "#07f"}}>Edit Profile</Text>
                        </View>
                        <View
                            style={{
                                width: "80%",
                                borderBottomWidth: 1,
                                marginBottom: normalize(32)
                            }}
                        />
                    </View>
                    <View style={{marginVertical: normalize(16)}}>
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
                                            marginVertical: normalize(16)
                                        }}>
                                            {item}
                                    </Text>
                                ))
                            }
                        <Text 
                            style={{
                                fontSize: normalize(24),
                                marginBottom: normalize(16),
                                color: colors.primaryTextColor,
                                fontFamily: "Poppins-Bold"
                            }}
                        >
                            Email
                        </Text>
                        <TextInput 
                            style={{
                                borderRadius: 10,
                                fontSize: normalize(24),
                                fontFamily: "Poppins-Medium",
                                paddingLeft: normalize(16),
                                padding: 8,
                                backgroundColor: colors.bgColor2,
                                color: "#07f"
                            }}
                            onChangeText={setEmail}
                            value={email}
                        />
                    </View>
                    <View style={{marginVertical: normalize(16)}}>
                        <Text 
                            style={{
                                fontFamily: "Poppins-Bold",
                                fontSize: normalize(24),
                                marginBottom: normalize(16),
                                color: colors.primaryTextColor
                            }}
                        >
                            Birthdate
                        </Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text 
                                style={{
                                    fontSize: normalize(28), 
                                    fontFamily: "Poppins-Bold",
                                    borderRadius: 10,
                                    padding: normalize(16),
                                    marginVertical: normalize(16),
                                    textAlign: 'center',
                                    backgroundColor: colors.bgColor2,
                                    color: "#07f",
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
                    </View>
                </View>
                <View style={{justifyContent: 'center', flexDirection: 'row'}}>
                    <TouchableOpacity 
                        style={{
                            backgroundColor: "#0077ff", 
                            padding: 8, 
                            paddingHorizontal: normalize(16), 
                            borderRadius: 10,
                            marginHorizontal: normalize(16)
                        }}
                        onPress={() => updateProfile()}
                    >
                        <Text 
                            style={{
                                fontSize: normalize(28), 
                                textTransform: 'uppercase', 
                                fontFamily: "Poppins-Bold",
                            }}>
                                Edit
                            </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{
                            backgroundColor: colors.muted2, 
                            padding: normalize(8), 
                            paddingHorizontal: normalize(16), 
                            borderRadius: 10,
                            marginHorizontal: normalize(16)
                        }}
                        onPress={() => props.navigation.goBack()}
                    >
                        <Text 
                            style={{
                                fontSize: normalize(28), 
                                textTransform: 'uppercase', 
                                color: colors.bgColor,
                                fontFamily: "Poppins-Bold",
                            }}
                        >
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default EditProfileScreen