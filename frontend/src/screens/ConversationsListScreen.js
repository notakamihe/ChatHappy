import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import React from 'react';
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Avatar } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../static/stylesheets/styles.js';
import ThemeContext from '../themes/ThemeContext.js';
import { withNavigation } from "react-navigation";

class ConversationsListScreen extends React.Component {
    static contextType = ThemeContext

    constructor (props) {
        super(props)

        this.state = {
            user: {},
            conversations: [],
            convosWOIds: []
        }

        AsyncStorage.getItem("user").then(item => {
            if (item == null) {
                this.props.navigation.navigate("Login")
            }
        })
    }

    getSetConversations () {
        AsyncStorage.getItem("user").then(item => {
            this.setState({user: JSON.parse(item)})

            axios.get(axios.defaults.baseURL + "conversations").then(res => {
                this.setState({convosWOIds: res.data})
            })

            axios.get(axios.defaults.baseURL + "conversations").then(res => {
                if (res.data)
                    this.setState({
                        conversations: res.data.filter(conversation => conversation.users.includes(this.state.user._id))
                    })
                else
                    return
                
            }).then(async () => {
                var conversations = await Promise.all(this.state.conversations.map(async conversation => {
                    return this.setMessagesAndUsers(conversation)
                }))

                return await conversations
            }).then(c => {
                c.reverse()
                this.setState({conversations: c})
            })
        })
    }
    
    getOIdData = async (list, route) => {
        return Promise.all(list.map(async item => {
            const msg = await (await axios.get(axios.defaults.baseURL + `${route}/${item}`)).data
            return Promise.resolve(msg)
        }))
    }

    async setMessagesAndUsers (list) {
        await this.getOIdData(list.messages, "messages").then(data => {
            list.messages = data
        })

        await this.getOIdData(list.users, "users").then(data => {
            list.users = data
        })
        
        return list
    }

    renderUsernames (list) {
        const usernames = list.filter(user => user._id != this.state.user._id).map(item => item.username)
        return usernames.join(", ")
    }

    componentDidMount () {
        this.getOIdData = this.getOIdData.bind(this)
        this.renderUsernames = this.renderUsernames.bind(this)
        this.setMessagesAndUsers = this.setMessagesAndUsers.bind(this)
        this.getSetConversations = this.getSetConversations.bind(this)

        this.getSetConversations()

        this.focusListener = this.props.navigation.addListener("focus", () => {
            this.getSetConversations()
        })
    }

    componentWillUnmount () {
        this.focusListener()
    }

    render () {
        return (
            <SafeAreaView style={this.context.theme.container}>
                <ScrollView style={{width: "100%"}} >
                    <View style={{alignItems: "center"}} >
                        <View 
                            style={{
                                flexDirection: "row", 
                                justifyContent: "space-between", 
                                width: "100%", 
                                padding: 20,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{fontSize: 32, fontWeight: 'bold', color: "#07f"}}>Conversations</Text>
                            <Text style={{fontSize: 20, ...this.context.theme.textColorPrimary}}>
                                {this.state.conversations.length}
                            </Text>
                        </View>
                        <View
                            style={{
                                width: "80%",
                                ...this.context.theme.outlineTertiary,
                                borderBottomWidth: 1,
                            }}
                        />
                        <View style={{marginTop: 32, width: "100%"}}>
                            {
                                this.state.conversations.map((item, index) => (
                                    <TouchableOpacity 
                                        key={index}
                                        style={{marginBottom: 16}} 
                                        onPress={() => this.props.navigation.dangerouslyGetParent().navigate("Conversation", {
                                            conversation: item,
                                            convosWOIds: this.state.convosWOIds.find(c => c._id == item._id)
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
                                                    ...this.context.theme.textColorPrimary,
                                                    fontWeight: 'bold', 
                                                    fontSize: 20,
                                                    flex: 0.85
                                                }}
                                                numberOfLines={2}
                                            >
                                                {this.renderUsernames(item.users)}
                                            </Text>
                                            <View style={{flexDirection: 'row', flex: 0.15}}>
                                                {
                                                    item.users.map((i, idx) => (
                                                        i._id != this.state.user._id && idx <= 3  ?

                                                        <Avatar 
                                                            key={idx}
                                                            size={30} 
                                                            rounded 
                                                            source={require('../static/images/defaultavatar.png')}
                                                            containerStyle={{
                                                                marginRight: -16
                                                            }}
                                                        /> : null
                                                    ))
                                                }
                                            </View>
                                        </View>

                                        <Text 
                                            style={{
                                                marginTop: 16, 
                                                fontSize: 20,  
                                                backgroundColor: "#07f",
                                                padding: 8,
                                                width: "90%",
                                                alignSelf: 'center',
                                                ...this.context.theme.textColorSecondary
                                            }} 
                                            numberOfLines={3}
                                        >
                                            {item.messages.length ? item.messages[item.messages.length - 1].content : null}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

export default withNavigation(ConversationsListScreen)
