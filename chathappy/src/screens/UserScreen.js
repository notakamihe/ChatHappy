import React from 'react';
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import styles from '../static/stylesheets/styles.js';
import { Avatar, Button } from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome5'
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemeContext, { ThemeProvider } from '../themes/ThemeContext.js';
import AsyncStorage from '@react-native-community/async-storage';
import { formatDateString, formatDateStringMMDD } from '../../utils.js';
import axios from 'axios';
import { FloatingAction } from "react-native-floating-action";

export default class UserScreen extends React.Component {
    static contextType = ThemeContext

    constructor (props) {
        super(props)

        this.state = {
            user: {},
            conversations: [],
            showModal: false,
            errors: []
        }

        AsyncStorage.getItem("user").then(item => {
            if (item == null) {
                this.props.navigation.navigate("Login")
            }
        })
    }

    addFriend () {
        var newUser = this.state.user

        newUser.friends.push(this.props.route.params.user._id)
        this.setState({user: newUser})
        
        axios.put(axios.defaults.baseURL + `users/${this.state.user._id}`, {
            username: this.state.user.username,
            email: this.state.user.email,
            dob: this.state.user.dob,
            friends: this.state.user.friends,
        }).then(res => {
            AsyncStorage.setItem("user", JSON.stringify(this.state.user))
        }).catch(err => {
            console.log(err.response.data);
        })
    }

    componentDidMount () {
        this.addFriend = this.addFriend.bind(this)
        this.removeFriend = this.removeFriend.bind(this)
        this.createConversation = this.createConversation.bind(this)
        this.getOIdData = this.getOIdData.bind(this)
        this.setMessagesAndUsers = this.setMessagesAndUsers.bind(this)
        this.renderUsernames = this.renderUsernames.bind(this)
        this.updateConversation = this.updateConversation.bind(this)
        this.getUserAndConvos = this.getUserAndConvos.bind(this)

        this.getUserAndConvos();
    }

    createConversation () {
        var convoAlreadyExists = false

        this.setState({errors: []})

        axios.get(axios.defaults.baseURL + "conversations").then(res => {
            res.data.forEach(convo => {
                const ids = [this.state.user._id, this.props.route.params.user._id].sort()

                if (JSON.stringify(convo.users.sort()) == JSON.stringify(ids)) {
                    convoAlreadyExists = true;
                }
            })
        }).catch(err => {
            console.log(err);
        }).then(() => {
            if (convoAlreadyExists) {
                this.setState({errors: [...this.state.errors, "Conversation already exists"]})
                return
            }

            axios.post(axios.defaults.baseURL + "conversations", {
                messages: [],
                users: [this.state.user._id, this.props.route.params.user._id]
            }).then(res => {
                this.props.navigation.navigate("Tabs")
            }).catch(err => {
                console.log(err)
            })
        })
    }

    getOIdData = async (list, route) => {
        return Promise.all(list.map(async item => {
            const msg = await (await axios.get(axios.defaults.baseURL + `${route}/${item}`)).data
            return Promise.resolve(msg)
        }))
    }

    getUserAndConvos () {
        AsyncStorage.getItem("user").then(item => {
            this.setState({user: JSON.parse(item)})  
        }).then(() => {
            this.props.navigation.setOptions({title: "Profile of " + this.props.route.params.user.username})

            axios.get(axios.defaults.baseURL + "conversations").then(res => {
                if (res.data)
                    this.setState({
                        conversations: res.data.filter(conversation => conversation.users.includes(this.state.user._id))
                    })
                else
                    return
                
            }).then(async () => {
                var conversations = await Promise.all(this.state.conversations.map(async conversation => {
                    return (this.setMessagesAndUsers(conversation))
                }))

                return await conversations
            }).then(c => {
                c.reverse()
                this.setState({conversations: c})
            })
        })
    }

    removeFriend () {
        var newUser = this.state.user

        newUser.friends = newUser.friends.filter(friend => friend != this.props.route.params.user._id)
        this.setState({user: newUser})
       
        axios.put(axios.defaults.baseURL + `users/${this.state.user._id}`, {
            username: this.state.user.username,
            email: this.state.user.email,
            dob: this.state.user.dob,
            friends: this.state.user.friends,
        }).then(res => {
            AsyncStorage.setItem("user", JSON.stringify(this.state.user))
        }).catch(err => {
            console.log(err.response.data);
        })
    }

    renderUsernames (list) {
        const usernames = list.filter(user => user._id != this.state.user._id).map(item => item.username)
        return usernames.join(", ")
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

    updateConversation (conversation) {
        const messagesIds = conversation.messages.map(msg => msg._id)
        const userIds = conversation.users.map(user => user._id)

        axios.put(axios.defaults.baseURL + `conversations/${conversation._id}`, {
            messages: messagesIds,
            users: [...userIds, this.props.route.params.user._id]
        }).then(res => {
            this.setState({showModal: false})
            this.getUserAndConvos()
        }).catch(err => console.log(err))
    }

    render () {
        
        const renderFriendButton = () => {
            if (this.state.user.friends && this.state.user.friends.includes(this.props.route.params.user._id)) {
                return (
                    <Button 
                        title="Unfriend" 
                        type="outline"
                        buttonStyle={{
                            borderColor: "red",
                            borderWidth: 2.5,
                            borderRadius: 30,
                            paddingHorizontal: 16,
                            marginVertical: 6
                        }}
                        titleStyle={{
                            fontSize: 20,
                            color: "red"
                        }}
                        icon={
                            <Icon name="minus" solid color="#f00" size={15} style={{marginRight: 16}}  />
                        }
                        onPress={() => this.removeFriend()}
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
                            paddingHorizontal: 16,
                            marginVertical: 6
                        }}
                        titleStyle={{
                            fontSize: 20
                        }}
                        icon={
                            <Icon name="plus" solid color="#07f" size={15} style={{marginRight: 16}}  />
                        }
                        onPress={() => this.addFriend()}
                    />
                )
            }
        }

        return (
            <SafeAreaView  style={{...this.context.theme.container}}>
                <ScrollView style={{width: "100%"}}>
                    <View style={{width: "100%", alignItems: 'flex-start', padding: 16}}>
                        <View style={{alignSelf: 'center', alignItems: 'center', marginBottom: 64}}>
                            <Avatar 
                                rounded 
                                source={require('../static/images/defaultavatar.png')} 
                                size={100} 
                                containerStyle={{
                                    borderWidth: 2,
                                    borderColor: "#07f",
                                    padding: 8,
                                    marginTop: 32
                                }}
                                
                            />
                            <View style={{alignItems: 'center', marginBottom: 32}}>
                                <Text 
                                    style={{
                                        ...this.context.theme.textColorPrimary, 
                                        fontSize: 32, 
                                        fontWeight: "bold"
                                    }}
                                >
                                    {this.props.route.params.user.username}
                                </Text>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Icon 
                                        solid 
                                        name="birthday-cake" 
                                        color={this.context.theme.textMuted1.color}
                                        size={24} 
                                        style={{marginRight: 16}}
                                    />
                                    <Text 
                                        style={{
                                            fontSize: 24, 
                                            ...this.context.theme.textMuted1
                                        }}
                                    >
                                        {formatDateString(this.props.route.params.user.dob)}
                                    </Text>
                                </View>
                                <Text style={{color: "#07f", fontSize: 20}}>
                                    {this.props.route.params.user.friends.length} friends
                                </Text>
                            </View>

                            {renderFriendButton()}

                            <Button 
                                title="Add to conversation" 
                                type="solid"
                                buttonStyle={{
                                    borderRadius: 30,
                                    paddingHorizontal: 16,
                                    marginVertical: 6
                                }}
                                titleStyle={{
                                    fontSize: 20,
                                    ...this.context.theme.secondaryTextColor
                                }}
                                onPress={() => this.setState({showModal: true})}
                            />
                        </View>
                    </View>
                    <Modal visible={this.state.showModal} animationType="slide" style={{width: "100%"}}>
                        <View style={{ ...this.context.theme.container, flex: 1, width: "100%" }}>
                            <TouchableOpacity 
                                onPress={() => this.setState({showModal: false})}
                                style={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    zIndex: 1
                                }}
                            >
                                <Icon 
                                    name="times-circle" 
                                    solid 
                                    size={40}
                                    color={this.context.theme.textColor6.color}
                                    
                                />
                            </TouchableOpacity>
                            <View style={{width: "100%"}}>
                                <Text 
                                    style={{
                                        ...this.context.theme.textColorPrimary,
                                        fontWeight: 'bold',
                                        fontSize: 28,
                                        marginVertical: 32,
                                        marginLeft: 32
                                    }}
                                >
                                    Conversations
                                </Text>
                                {
                                    this.state.errors.map((item, index) => (
                                        <Text 
                                            key={index}
                                            style={{
                                                backgroundColor: "#f0d3", 
                                                textTransform: "uppercase", 
                                                width: "100%",
                                                color: "#f0d",
                                                padding: 12,
                                                fontSize: 18,
                                                textAlign: 'center',
                                                borderRadius: 50,
                                                marginVertical: 8
                                            }}>
                                                {item}
                                        </Text>
                                    ))
                                }
                                <ScrollView style={{padding: 16}}>
                                    <View>
                                        {
                                            this.state.conversations.filter(
                                                convo => !convo.users.map(u => u._id).includes(this.props.route.params.user._id)
                                            ).map((item, index) => (
                                                <View key={index} style={{width: "100%", alignItems: 'center'}}>
                                                    <TouchableOpacity 
                                                        style={{
                                                            width: "97%",
                                                            ...this.context.theme.mutedBg1,
                                                            borderRadius: 15,
                                                            flexDirection: 'row',
                                                            padding: 16,
                                                            alignItems: 'center',
                                                            marginVertical: 8
                                                        }}
                                                        onPress={() => this.updateConversation(item)}
                                                    >
                                                        <Text 
                                                            style={{
                                                                flex: 0.75,
                                                                ...this.context.theme.textMuted1,
                                                                fontSize: 20,
                                                                fontWeight: 'bold'
                                                            }}
                                                            numberOfLines={3}
                                                        >
                                                            {this.renderUsernames(item.users)}
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
                                                                        source={require("../static/images/defaultavatar.png")} 
                                                                        size={45}
                                                                        rounded
                                                                        containerStyle={{
                                                                            marginRight: -24
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
                                onPressMain={() => this.createConversation()} 
                                color="#07f"
                            />
                        </View>
                    </Modal>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

