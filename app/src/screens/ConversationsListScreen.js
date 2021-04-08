import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Avatar } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { normalize } from '../../utils.js';
import { useTheme } from '@react-navigation/native';
import { UserContext } from '../context/UserContext.js';

const ConversationsListScreen = (props) => {
    const [conversations, setConversations] = useState([])

    const {theUser, setTheUser} = useContext(UserContext)
    const {colors} = useTheme()

    if (!theUser) {
        props.navigation.navigate("Login")
    }

    useEffect(() => {
        const unsubscribe = props.navigation.addListener("focus", () => {
            getData()
        });
    
        return unsubscribe;
    }, [props.navigation]);

    const getData = () => {
        axios.get(axios.defaults.baseURL + "conversations").then(res => {
            setConversations(res.data.filter(c => c.users.map(u => u._id).includes(theUser._id)))  
        }).catch(error => {
            console.log(error);
        })
    }

    const renderUsernames = (list) => {
        const usernames = list.filter(u => u._id != theUser._id).map(item => item.username)
        return usernames.join(", ")
    }

    return (
        <SafeAreaView>
            <ScrollView style={{width: "100%"}} >
                <View style={{alignItems: "center"}} >
                    <View 
                        style={{
                            flexDirection: "row", 
                            justifyContent: "space-between", 
                            width: "100%", 
                            padding: normalize(20),
                            alignItems: 'center'
                        }}
                    >
                        <Text 
                            style={{fontSize: normalize(32), fontWeight: 'bold', color: "#07f"}}
                        >
                            Conversations
                        </Text>
                        <Text style={{fontSize: normalize(20), color: colors.primaryTextColor, fontFamily: "Poppins-Regular"}}>
                            {conversations.length}
                        </Text>
                    </View>
                    <View
                        style={{
                            width: "80%"
                        }}
                    />
                    <View style={{marginTop: normalize(32), width: "100%"}}>
                        {
                            conversations.map((item, index) => (
                                <TouchableOpacity 
                                    key={index}
                                    style={{marginBottom: normalize(32)}} 
                                    onPress={() => props.navigation.dangerouslyGetParent().navigate("Conversation", {
                                        conversation: item
                                    })}
                                >
                                    <View 
                                        style={{
                                            flexDirection: 'row', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            width: "80%",
                                            alignSelf: 'center'
                                        }}>
                                        <Text 
                                            style={{
                                                fontSize: normalize(20),
                                                flex: 0.85,
                                                color: colors.primaryTextColor,
                                                fontFamily: "Poppins-Medium"
                                            }}
                                            numberOfLines={2}
                                        >
                                            {renderUsernames(item.users)}
                                        </Text>
                                        <View style={{flexDirection: 'row', flex: 0.15}}>
                                            {
                                                item.users.map((i, idx) => (
                                                    i._id != theUser._id && idx <= 3  ?
                                                    <Avatar 
                                                        key={idx}
                                                        size={normalize(30)} 
                                                        rounded 
                                                        source={i.imageUrl ? 
                                                            { uri: axios.defaults.baseURL + i.imageUrl} :
                                                            require("./../../assets/images/defaultavatar.png")
                                                        }
                                                        containerStyle={{
                                                            marginRight: normalize(-16)
                                                        }}
                                                    /> : null
                                                ))
                                            }
                                        </View>
                                    </View>
                                    {
                                        item.messages.length ?

                                        <Text 
                                            style={{
                                                marginTop: normalize(16), 
                                                fontSize: normalize(16),  
                                                backgroundColor: "#07f",
                                                padding: normalize(8),
                                                width: "90%",
                                                alignSelf: 'center',
                                                color: colors.bgColor,
                                                fontFamily: "Poppins-Medium"
                                            }} 
                                            numberOfLines={3}
                                        >
                                            {item.messages[item.messages.length - 1].content}
                                        </Text> : null
                                    }
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ConversationsListScreen
