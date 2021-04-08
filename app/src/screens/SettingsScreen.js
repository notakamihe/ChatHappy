import React, { useContext, useEffect, useState } from 'react';
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToggleSwitch from "toggle-switch-react-native";
import { Button } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import { normalize } from '../../utils.js';
import { useTheme } from '@react-navigation/native';
import { UserContext } from '../context/UserContext.js';

const SettingsScreen = (props) => {
    const {theUser, setTheUser} = useContext(UserContext)
    const {colors} = useTheme()

    if (!theUser) {
        props.navigation.navigate("Login")
    }

    const logOut = async () => {
        await AsyncStorage.removeItem("token")
        props.navigation.dangerouslyGetParent().dangerouslyGetParent().navigate("Login")
        setTheUser(undefined)
    }

    const toEditProfile = () => {
        props.navigation.dangerouslyGetParent().navigate("EditProfile")
    }
    
    const toggleIsDarkModeOn = (isOn) => {
        axios.put(axios.defaults.baseURL + `users/${theUser._id}`, {
            username: theUser.username,
            email: theUser.email,
            dob: theUser.dob,
            friends: theUser.friends.map(f => f._id),
            isDarkModeOn: isOn
        }).then(res => {
            setTheUser(res.data)
        }).catch(err => console.log(err + "hi"))
    }

    return (
        <SafeAreaView>
            <ScrollView style={{width: "100%"}}>
                <View 
                    style={{
                        flexDirection: "row", 
                        justifyContent: "space-between", 
                        width: "100%", 
                        padding: normalize(20),
                        alignItems: 'center',
                        marginBottom: normalize(32)
                    }}
                >
                    <Text style={{fontSize: normalize(32), fontWeight: 'bold', color: "#07f"}}>Preferences & Help</Text>
                </View>
                <View style={{alignItems: 'center', marginVertical: 16}}>
                    <Text 
                        style={{
                            fontSize: normalize(28), 
                            color: colors.primaryTextColor,
                            fontFamily: "Poppins-Bold"
                        }}
                    >
                        UI
                    </Text>
                    <View>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 8}}>
                            <Text 
                                style={{
                                    fontSize: normalize(16), 
                                    marginRight: normalize(16), 
                                    color: colors.primaryTextColor,
                                    fontFamily: "Poppins-Medium"
                                }}
                            >
                                Dark mode
                            </Text>
                            <ToggleSwitch 
                                isOn={theUser.isDarkModeOn}
                                onToggle={toggleIsDarkModeOn}
                                size="large"
                                offColor="#0001"
                                onColor="#07f"
                                thumbOffStyle={{
                                    backgroundColor: "black",
                                    width: normalize(20),
                                    height: normalize(20)
                                }}
                            />
                        </View>
                    </View>
                </View>
                <View style={{alignItems: 'center', marginVertical: normalize(16)}}>
                    <Text 
                        style={{ 
                            fontSize: normalize(28), 
                            marginBottom: normalize(16),
                            color: colors.primaryTextColor,
                            fontFamily: "Poppins-Bold"
                        }}
                    >
                        Account
                    </Text>
                    <View>
                        <View style={{alignItems: 'center', marginVertical: 8}}>
                            <Button 
                                title="Edit profile" 
                                type="outline"
                                buttonStyle={{
                                    borderWidth: 2.5,
                                    borderRadius: 30,
                                    paddingHorizontal: normalize(16),
                                    marginVertical: normalize(6)
                                }}
                                titleStyle={{
                                    fontSize: normalize(20),
                                    fontFamily: "Poppins-Medium"
                                }}
                                onPress={() => toEditProfile()}
                            />
                            <Button 
                                title="Log out" 
                                buttonStyle={{
                                    borderRadius: 30,
                                    paddingHorizontal: normalize(16),
                                    marginVertical: normalize(6)
                                }}
                                titleStyle={{
                                    fontSize: normalize(20),
                                    color: colors.bgColor,
                                    fontFamily: "Poppins-Medium"
                                }}
                                onPress={() => logOut()}
                            />
                        </View>
                    </View>
                </View>
                <View style={{alignItems: 'center', marginVertical: normalize(16)}}>
                    <Text 
                        style={{
                            fontSize: normalize(28), 
                            marginBottom: normalize(16),
                            color: colors.primaryTextColor,
                            fontFamily: "Poppins-Bold"
                        }}
                    >
                        Contact
                    </Text>
                    <View>
                        <View style={{alignItems: 'center', marginVertical: 8}}>
                            <Button 
                                title="Email" 
                                buttonStyle={{
                                    borderRadius: 30,
                                    paddingHorizontal: normalize(16),
                                    marginVertical: normalize(6)
                                }}
                                titleStyle={{
                                    fontSize: normalize(20),
                                    color: colors.bgColor,
                                    fontFamily: "Poppins-Medium"
                                }}
                                onPress={() => Linking.openURL('mailto:notakamihe@gmail.com') }
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SettingsScreen
