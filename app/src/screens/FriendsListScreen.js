import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Avatar } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { normalize } from '../../utils.js';
import { useTheme } from '@react-navigation/native';
import { UserContext } from '../context/UserContext.js';

const FriendsListScreen = (props) => {
    const {theUser, setTheUser} = useContext(UserContext)
    const {colors} = useTheme()

    if (!theUser) {
        props.navigation.navigate("Login")
    }

    return (
        <SafeAreaView>
            <ScrollView style={{width: "100%"}}>
                <View style={{alignItems: 'center'}}>
                    <View 
                        style={{
                            flexDirection: "row", 
                            justifyContent: "space-between", 
                            width: "100%", 
                            padding: normalize(20),
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{fontSize: normalize(32), fontWeight: 'bold', color: "#07f"}}>Friends</Text>
                        <Text style={{fontSize: normalize(20), color: colors.primaryTextColor, fontFamily: "Poppins-Regular"}}>
                            {theUser.friends ? theUser.friends.length : 0}
                        </Text>
                    </View>
                    <View
                        style={{
                            width: "80%"
                        }}
                    />
                </View>
                <View style={{marginTop: normalize(32), alignItems: 'center'}}>
                    {
                        theUser.friends ?

                        theUser.friends.map((item, index) => (
                            <TouchableOpacity 
                                key={index}
                                style={{
                                    flexDirection: 'row',
                                    width: "90%", 
                                    padding: normalize(5),
                                    borderRadius: 5,
                                    borderTopLeftRadius: 50,
                                    borderBottomLeftRadius: 50,
                                    alignItems: 'center',
                                    marginVertical: normalize(8),
                                    backgroundColor: colors.primaryBgColor
                                }}
                                onPress={() => props.navigation.dangerouslyGetParent().navigate("User", {
                                    user: item
                                })}
                            >
                                <Avatar 
                                    size={normalize(70)} 
                                    rounded 
                                    source={item.imageUrl ? 
                                        { uri: axios.defaults.baseURL + item.imageUrl} :
                                        require("./../../assets/images/defaultavatar.png")
                                    } 
                                    containerStyle={{
                                        marginRight: normalize(16)
                                    }}
                                />
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text 
                                        style={{
                                            color: "white", 
                                            fontSize: normalize(18), 
                                            marginRight: normalize(8),
                                            color: colors.bgColor,
                                            flex: 0.82,
                                            fontFamily: "Poppins-SemiBold"
                                        }}
                                    >
                                        {item.username}
                                    </Text>
                                    <View style={{alignItems: 'center'}}>
                                        <Icon solid name="users" size={normalize(20)} color="#7af"/>
                                        <Text 
                                            style={{
                                                fontSize: normalize(18), 
                                                color: "#7af",
                                                fontFamily: "Poppins-Bold"
                                            }}
                                        >
                                            {item.friends.length}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )) : null
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    )   
}

export default FriendsListScreen
