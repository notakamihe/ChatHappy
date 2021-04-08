import { useTheme } from '@react-navigation/native';
import axios from 'axios';
import React, { Component, useContext, useEffect, useRef, useState } from 'react'
import { Text, TextInput, View, TouchableOpacity, ScrollView, Keyboard, Modal } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { formatDate, normalize } from '../../utils';
import io from "socket.io-client"
import { UserContext } from '../context/UserContext';
import { Avatar } from 'react-native-elements';

const socket = io.connect(axios.defaults.baseURL, {
    transports: ['websocket'],
    reconnectionAttempts: 15
})

const ConversationScreen = (props) => {
    const [conversation, setConversation] = useState({})
    const [text, setText] = useState("")
    const [error, setError] = useState("")
    const [showModal, setShowModal] = useState(false)

    const bottomRef = useRef()

    const {theUser, setTheUser} = useContext(UserContext)
    const {colors} = useTheme()

    if (!theUser) {
        props.navigation.navigate("Login")
    }

    useEffect(() => {
        const unsubscribe = props.navigation.addListener("blur", () => {
            socket.emit("leaveRoom", props.route.params.conversation._id, theUser)
            socket.off("messageSent");
        });
    
        return unsubscribe;
    }, [props.navigation && theUser]);

    useEffect(() => {
        setConversation(props.route.params.conversation)
        props.navigation.setOptions({
            title: "Conversation w/ " + renderUsernames(props.route.params.conversation.users),
        })

        socket.emit("joinRoom", props.route.params.conversation._id, theUser)
    }, [])

    useEffect(() => {
        socket.on("messageSent", async (theConversation, user) => {
            console.log(theConversation, user);

            if (theConversation != props.route.params.conversation._id)
                return

            axios.get(axios.defaults.baseURL + `conversations/${props.route.params.conversation._id}`).then(res => {
                setConversation(res.data);
            }).catch(err => console.log(err))
        })
    }, [])

    useEffect(() => bottomRef.current.scrollToEnd({animated: true}))

    const ConversationUsersList = () => (
        showModal ?

        <ScrollView 
            style={{
                position: "absolute", 
                top: "10%", 
                right: "10%", 
                left: "10%", 
                bottom: "10%", 
                backgroundColor: "#07f",
                borderColor: "black",
                borderWidth: 1,
                borderRadius: 10,
                elevation: 89,
                padding: normalize(16),
                paddingBottom: normalize(32)
            }}
        >
            {
                conversation.users.map((item, idx) => (
                    <TouchableOpacity 
                        style={{ 
                            flexDirection: "row", 
                            backgroundColor: "#fff3", 
                            padding: normalize(4), 
                            borderRadius: normalize(10),
                            alignItems: "center",
                            marginVertical: 4,
                        }}
                        key={idx}
                        disabled={item._id == theUser._id}
                        onPress={() => props.navigation.navigate("User", { user: item })}
                    >
                        <Avatar 
                            source={item.imageUrl ? 
                                { uri: axios.defaults.baseURL + item.imageUrl} :
                                require("./../../assets/images/defaultavatar.png")
                            }
                            size={40}
                            avatarStyle={{borderRadius: normalize(10)}}
                        />
                        <Text 
                            style={{marginLeft: 8, color: colors.bgColor, flex: 0.95, fontFamily: "Poppins-Medium"}}
                            numberOfLines={2}
                        >
                            {item.username}
                        </Text>
                        <View style={{alignItems: 'center', marginLeft: 4}}>
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
                    </TouchableOpacity>
                ))
            }
        </ScrollView> : null
    )

    const Message = (props) => {
        return (
            <View style={{marginVertical: normalize(8), 
            alignSelf: props.item.sentby._id != theUser._id ? 'flex-start' : "flex-end"}}>
                <View 
                    style={{
                        backgroundColor: props.item.sentby._id != theUser._id ? colors.muted2 : "#07f",
                        padding: normalize(16), 
                        paddingTop: normalize(8), 
                        borderRadius: 10,
                        maxWidth: "75%",
                        borderBottomLeftRadius: props.item.sentby._id != theUser._id ? 0 : 10,
                        borderBottomRightRadius: props.item.sentby._id != theUser._id ? 10 : 0
                    }}
                >
                    <Text 
                        style={{
                            fontSize: normalize(18), 
                            fontWeight: "bold",
                            color: colors.bgColor
                        }}
                    >
                        {formatDate(props.item.createdat)}
                    </Text>
                    <Text
                        style={{
                            fontSize: normalize(19), 
                            color: "#fffb",
                            fontFamily: "Poppins-Regular"
                        }}
                    >
                        {props.item.content}
                    </Text>
                </View>
                <Text 
                    style={{
                        fontSize: normalize(18), 
                         marginTop: normalize(8),
                        textAlign: props.item.sentby._id != theUser._id ? "left" : "right",
                        color: colors.primaryTextColor
                    }}
                >
                    {props.item.sentby._id != theUser._id ? props.item.sentby.username : "You"}
                </Text>
            </View>
        )
    }

    const renderUsernames = (list) => {
        const usernames = list.filter(u => u._id !== theUser._id).map(item => item.username)
        return usernames.join(", ")
    }

    const sendMessage = () => { 
        setError("")

        if (!text) {
            setError("Content cannot be blank")
            return
        }

        socket.emit("message", conversation._id, {
            content: text,
            sentby: theUser._id
        })

        Keyboard.dismiss()
        setText("")
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView 
                style={{width: "100%", marginBottom: normalize(64), marginTop: normalize(0)}}
                ref={bottomRef}
            >
                <View style={{padding: normalize(16)}}>

                    {
                        conversation.messages ?

                        conversation.messages.map((item, index) => <Message item={item} key={index} />) : null
                    }
                </View>
            </ScrollView>
            <TouchableOpacity 
                style={{
                    backgroundColor: showModal ? colors.primaryTextColor : colors.muted3, 
                    alignSelf: "flex-start",
                    padding: normalize(4),
                    paddingHorizontal: normalize(8),
                    borderRadius: 5,
                    position: "absolute",
                    top: normalize(8),
                    left: normalize(8)
                }}
                onPress={() => setShowModal(prev => !prev)}
            >
                {
                    conversation.users ?
                    
                    showModal ?
                    
                    <Icon name="times" color={colors.bgColor} size={20} /> :
                    <Text style={{fontWeight: "bold", color: colors.bgColor}}>
                        {conversation.users.length}
                    </Text>

                    : null
                }
            </TouchableOpacity>
            <ConversationUsersList />
            <View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    maxHeight: normalize(100),
                    margin: normalize(6),
                }}
            >   
                <View style={{flexDirection: "row", width: "100%", paddingHorizontal: 4}}>
                    <TextInput 
                        placeholder={error || "Send a message"}
                        multiline
                        style={{
                            flex: 0.85,
                            borderRadius: 5,
                            color: colors.primaryTextColor,
                            fontSize: normalize(20),
                            paddingLeft: 0,
                            fontFamily: "Poppins-Medium"
                        }}
                        onChangeText={setText}
                        value={text}
                        placeholderTextColor={colors.mutedTextColor}
                        numberOfLines={2}
                    />
                    <TouchableOpacity 
                        style={{
                            flex: 0.15,
                            marginLeft: normalize(6),
                            borderRadius: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: normalize(50),
                            alignSelf: 'flex-end',
                            backgroundColor: "#07f"
                        }}
                        onPress={() => sendMessage()}
                    >
                        <Icon solid name="paper-plane" size={normalize(30)} color={colors.bgColor} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default ConversationScreen