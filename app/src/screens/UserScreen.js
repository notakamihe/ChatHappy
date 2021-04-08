import React, { useContext, useEffect, useState } from 'react';
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { Avatar, Button } from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome5'
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-community/async-storage';
import {  normalize } from '../../utils.js';
import axios from 'axios';
import { FloatingAction } from "react-native-floating-action";
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { UserContext } from '../context/UserContext.js';

const UserScreen = (props) => {
    const [conversations, setConversations] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [errors, setErrors] = useState([])

    const {theUser, setTheUser} = useContext(UserContext)
    const {colors} = useTheme()

    if (!theUser) {
        props.navigation.navigate("Login")
    }

    useEffect(() => {
        getData()
    }, [])

    const addFriend = () => {
        var newUser = {...theUser}
        newUser.friends.push(props.route.params.user)
        
        axios.put(axios.defaults.baseURL + `users/${theUser._id}`, {
            username: theUser.username,
            email: theUser.email,
            dob: theUser.dob,
            friends: newUser.friends.map(f => f._id),
            isDarkModeOn: theUser.isDarkModeOn
        }).then(res => {
            setTheUser(newUser)
        }).catch(err => {
            console.log(err.response.data);
        })
    }    

    const createConversation = () => {
        const newErrors = []
        setErrors(newErrors)

        for (const c of conversations) {
            if (c.users.length === 2 && c.users.map(u => u._id).includes(props.route.params.user._id)) {
                newErrors.push( "Conversation already exists.")
                setErrors(newErrors)
                return
            }
        }

        axios.post(axios.defaults.baseURL + "conversations", {
            messages: [],
            users: [theUser._id, props.route.params.user._id]
        }).then(res => {
            getData()
            setShowModal(false)
        }).catch(err => {
            console.log(err);
        })
    }

    const getData = () => {
        props.navigation.setOptions({title: "Profile of " + props.route.params.user.username})

        axios.get(axios.defaults.baseURL + "conversations").then(res => {
            setConversations(res.data.filter(c => c.users.map(u => u._id).includes(theUser._id)));
        }).catch(err => console.log(err))
    }

    const removeFriend = () => {
        var newUser = {...theUser}
        newUser.friends = newUser.friends.filter(friend => friend._id != props.route.params.user._id)
        
        axios.put(axios.defaults.baseURL + `users/${theUser._id}`, {
            username: theUser.username,
            email: theUser.email,
            dob: theUser.dob,
            friends: newUser.friends.map(f => f._id),
            isDarkModeOn: theUser.isDarkModeOn
        }).then(res => {
            setTheUser(newUser)
        }).catch(err => {
            console.log(err.response.data);
        })
    }

    const renderUsernames = (list) => {
        const usernames = list.filter(u => u._id != theUser._id).map(item => item.username)
        return usernames.join(", ")
    }

    const updateConversation = (conversation) => {
        const messagesIds = conversation.messages.map(msg => msg._id)
        const userIds = conversation.users.map(u => u._id)

        axios.put(axios.defaults.baseURL + `conversations/${conversation._id}`, {
            messages: messagesIds,
            users: [...userIds, props.route.params.user._id]
        }).then(res => {
            setShowModal(false)
            getData()
        }).catch(err => console.log(err))
    }
    
    const renderFriendButton = () => {
        if (theUser.friends && theUser.friends.map(f => f._id).includes(props.route.params.user._id)) {
            return (
                <Button 
                    title="Unfriend" 
                    type="outline"
                    buttonStyle={{
                        borderColor: "red",
                        borderWidth: 2.5,
                        borderRadius: 30,
                        paddingHorizontal: normalize(16),
                        marginVertical: normalize(6)
                    }}
                    titleStyle={{
                        fontSize: normalize(20),
                        color: "red",
                        fontFamily: "Poppins-Regular"
                    }}
                    icon={
                        <Icon name="minus" solid color="#f00" size={normalize(15)} style={{marginRight: normalize(16)}}  />
                    }
                    onPress={() => removeFriend()}
                />
            )
        } else {
            return (
                <Button 
                    title="Befriend" 
                    type="outline"
                    buttonStyle={{
                        borderWidth: 2.5,
                        borderRadius: 30,
                        paddingHorizontal: normalize(16),
                        marginVertical: normalize(6)
                    }}
                    titleStyle={{
                        fontSize: normalize(20),
                        fontFamily: "Poppins-Regular"
                    }}
                    icon={
                        <Icon name="plus" solid color="#07f" size={15} style={{marginRight: normalize(16)}}  />
                    }
                    onPress={() => addFriend()}
                />
            )
        }
    }

    return (
        <SafeAreaView>
            <ScrollView style={{width: "100%"}}>
                <View style={{width: "100%", alignItems: 'flex-start', padding: normalize(16)}}>
                    <View style={{alignSelf: 'center', alignItems: 'center', marginBottom: normalize(64)}}>
                        <Avatar 
                            rounded 
                            source={props.route.params.user.imageUrl ? 
                                { uri: axios.defaults.baseURL + props.route.params.user.imageUrl} :
                                require("./../../assets/images/defaultavatar.png")
                            } 
                            size={normalize(100)} 
                            containerStyle={{
                                borderWidth: 2,
                                borderColor: "#07f",
                                padding: normalize(8),
                                marginTop: normalize(32)
                            }}
                            
                        />
                        <View style={{alignItems: 'center', marginBottom: normalize(32)}}>
                            <Text 
                                style={{
                                    fontSize: normalize(32), 
                                    fontWeight: "bold",
                                    color: colors.primaryTextColor
                                }}
                            >
                                {props.route.params.user.username}
                            </Text>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Icon 
                                    solid 
                                    name="birthday-cake" 
                                    size={normalize(24)} 
                                    style={{marginRight: normalize(16)}}
                                    color={colors.mutedTextColor}
                                />
                                <Text 
                                    style={{
                                        fontSize: normalize(24),
                                        color: colors.mutedTextColor,
                                        fontFamily: "Poppins-Regular"
                                    }}
                                >
                                    {moment(props.route.params.user.dob).format("MMMM D")}
                                </Text>
                            </View>
                            <Text style={{color: "#07f", fontSize: normalize(20), fontFamily: "Poppins-Regular"}}>
                                {props.route.params.user.friends.length} friends
                            </Text>
                        </View>

                        {renderFriendButton()}

                        <Button 
                            title="Add to conversation" 
                            type="solid"
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
                            onPress={() => setShowModal(true)}
                        />
                    </View>
                </View>
                <Modal visible={showModal} animationType="slide" style={{width: "100%"}}>
                    <View style={{ flex: 1, width: "100%", backgroundColor: colors.bgColor }}>
                        <TouchableOpacity 
                            onPress={() => setShowModal(false)}
                            style={{
                                position: 'absolute',
                                top: normalize(16),
                                right: normalize(16),
                                zIndex: 1
                            }}
                        >
                            <Icon 
                                name="times-circle" 
                                solid 
                                size={normalize(40)}
                                color={colors.primaryTextColor}
                            />
                        </TouchableOpacity>
                        <View style={{width: "100%"}}>
                            <Text 
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: normalize(28),
                                    marginVertical: normalize(32),
                                    marginLeft: normalize(32),
                                    color: colors.primaryTextColor
                                }}
                            >
                                Conversations
                            </Text>
                            {
                                errors.map((item, index) => (
                                    <Text 
                                        key={index}
                                        style={{
                                            backgroundColor: "#f0d3", 
                                            textTransform: "uppercase", 
                                            width: "90%",
                                            color: "#f0d",
                                            padding: normalize(12),
                                            fontSize: normalize(18),
                                            textAlign: 'center',
                                            borderRadius: 50,
                                            marginVertical: normalize(8),
                                            alignSelf: "center"
                                        }}>
                                            {item}
                                    </Text>
                                ))
                            }
                            <ScrollView style={{padding: normalize(16)}}>
                                <View>
                                    {
                                        conversations.filter(c => !(c.users.map(u => u._id).includes(props.route.params.user._id))).map((item, index) => (
                                            <View key={index} style={{width: "100%", alignItems: 'center'}}>
                                                <TouchableOpacity 
                                                    style={{
                                                        width: "97%",
                                                        borderRadius: 5,
                                                        flexDirection: 'row',
                                                        padding: normalize(16),
                                                        alignItems: 'center',
                                                        marginVertical: normalize(8),
                                                        backgroundColor: colors.bgColor2
                                                    }}
                                                    onPress={() => updateConversation(item)}
                                                >
                                                    <Text 
                                                        style={{
                                                            flex: 0.75,
                                                            fontSize: normalize(18),
                                                            color: colors.primaryTextColor,
                                                            fontFamily: "Poppins-SemiBold"
                                                        }}
                                                        numberOfLines={3}
                                                    >
                                                        {renderUsernames(item.users)}
                                                    </Text>
                                                    <View 
                                                        style={{
                                                            flexDirection: 'row',
                                                            flex: 0.25
                                                        }}
                                                    >
                                                        {
                                                            item.users.map((itm, idx) => (
                                                                <Avatar 
                                                                    key={idx}
                                                                    source={require("./../../assets/images/defaultavatar.png")} 
                                                                    size={normalize(45)}
                                                                    rounded
                                                                    containerStyle={{
                                                                        marginRight: normalize(-24)
                                                                    }}
                                                                />
                                                            ))
                                                        }
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    }
                                </View>
                            </ScrollView>
                        </View>
                        <FloatingAction 
                            showBackground={false} 
                            onPressMain={() => createConversation()} 
                            color="#07f"
                        />
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    )
}

export default UserScreen