import React from 'react';
import axios from 'axios'
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import styles from '../static/stylesheets/styles.js';
import { Avatar } from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome5'
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemeContext from '../themes/ThemeContext.js';
import AsyncStorage from '@react-native-community/async-storage';
import {formatDateString} from '../../utils.js'
import { withNavigation } from "react-navigation";

class HomeScreen extends React.Component {
    static contextType = ThemeContext

    constructor (props) {
        super(props)

        this.state = {
            user: {},
            friends: [],
            conversations: [],
            convosWOIds: [],
            friendsOfFriends: []
        }

        AsyncStorage.getItem("user").then(item => {
            if (item == null) {
                this.props.navigation.navigate("Login")
            }
        })
    }

    getOIdData = async (list, route) => {
        return Promise.all(list.map(async item => {
            const msg = await (await axios.get(axios.defaults.baseURL + `${route}/${item}`)).data
            return Promise.resolve(msg)
        }))
    }

    async getUser () {
        AsyncStorage.getItem("user").then(item => {
            this.setState({user: JSON.parse(item)})

            this.setState({friends: []})
            this.setState({friendsOfFriends: []})
             
            this.state.user.friends.forEach(friend => {
                axios.get(axios.defaults.baseURL + `users/${friend}`).then(res => {
                    this.setState({friends: [...this.state.friends, res.data]})

                    res.data.friends.forEach(frnd=> {
                        axios.get(axios.defaults.baseURL + `users/${frnd}`).then(r => {
                            
                            const friendsOfFriendsIds = this.state.friendsOfFriends.map(item => item._id)

                            if (r.data._id != this.state.user._id && !friendsOfFriendsIds.includes(this.state.user._id)) {
                                this.setState({friendsOfFriends: [...this.state.friendsOfFriends, r.data]})
                            }
                        })
                    })
                })
            })

            axios.get(axios.defaults.baseURL + "conversations").then(res => {
                this.setState({convosWOIds: res.data})
            })

            axios.get(axios.defaults.baseURL + "conversations").then(res => {
                if (res.data) {
                    this.setState({
                        conversations: res.data.filter(conversation => conversation.users.includes(this.state.user._id))
                    })
                } else
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

    async setMessagesAndUsers (list) {
        await this.getOIdData(list.messages, "messages").then(data => {
            list.messages = data
        })

        await this.getOIdData(list.users, "users").then(data => {
            list.users = data
        })
        
        return list
    }

    componentDidMount () {
        this.getOIdData = this.getOIdData.bind(this)
        this.setMessagesAndUsers = this.setMessagesAndUsers.bind(this)
        this.getUser = this.getUser.bind(this)

        this.getUser()

        const { navigation } = this.props;

        this.focusListener = navigation.addListener("focus", () => {
            this.getUser()
        });
    }

    componentWillUnmount () {
        this.focusListener()
    }


    render () {
        return (
            <SafeAreaView style={{...this.context.theme.container}}>
                <ScrollView  style={{width: "100%"}}>
                    <View style={{width: "100%", alignItems: 'flex-start', padding: 16}}>
                        <View style={{alignSelf: 'center', alignItems: 'center'}}>
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
                                    {this.state.user.username}
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
                                        {formatDateString(this.state.user.dob)}
                                    </Text>
                                </View>
                                <Text style={{color: "#07f", fontSize: 20}}>
                                    {this.state.user.friends ? this.state.user.friends.length : null} friends
                                </Text>
                            </View>
                        </View>

                        <Text 
                            style={{
                                ...this.context.theme.textColorPrimary, 
                                fontSize: 24, 
                                fontWeight: "bold", 
                                marginBottom: 16
                            }}
                        >
                            Recent conversations
                        </Text>

                        <View style={{width: "100%", marginLeft: 32, marginBottom: 28}}>
                            {
                                this.state.conversations.map((item, index) => {
                                    if (index <= 2) {
                                        return (
                                            <TouchableOpacity 
                                                key={index}
                                                style={{
                                                    ...this.context.theme.mutedBg1,
                                                    flexDirection: 'row', 
                                                    width: "90%", 
                                                    borderRadius: 5, 
                                                    alignItems: 'center', 
                                                    marginVertical: 4
                                                }}
                                                onPress={() => this.props.navigation.dangerouslyGetParent().navigate("Conversation", {
                                                    conversation: item,
                                                    convosWOIds: this.state.convosWOIds.find(c => c._id == item._id)
                                                })}
                                            >
                                                <Avatar size={60} source={require('../static/images/defaultavatar.png')}/>
                                                <Text 
                                                    style={{
                                                        ...this.context.theme.textColorSecondary,
                                                        marginLeft: 16, 
                                                        width:"70%", 
                                                        fontSize: 20, 
                                                        fontWeight: 'bold'
                                                    }} 
                                                    numberOfLines={2}
                                                >
                                                    {item.messages.length ? item.messages[item.messages.length - 1].content : null}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    } else 
                                        return null
                                })
                            }
                        </View>

                        <Text 
                            style={{
                                ...this.context.theme.textColorPrimary, 
                                fontSize: 24, 
                                fontWeight: "bold", 
                                marginBottom: 16
                            }}
                        >
                            Chatters to befriend
                        </Text>

                        <ScrollView 
                            showsHorizontalScrollIndicator={false} 
                            horizontal 
                            style={{width: "100%", marginBottom: 28, paddingBottom: 16}}
                        >
                            {
                                this.state.friendsOfFriends.map((item, index) => (
                                    <TouchableOpacity 
                                        key={index}
                                        onPress={() => this.props.navigation.dangerouslyGetParent().navigate("User", {
                                            user: item
                                        })}
                                    >
                                        <Avatar 
                                            rounded 
                                            source={require('../static/images/defaultavatar.png')} 
                                            size={80} 
                                            containerStyle={{
                                                borderWidth: 1,
                                                ...this.context.theme.outlineSecondary,
                                                padding: 8,
                                                marginRight: 6
                                            }}
                                        />
                                    </TouchableOpacity>
                                ))
                            }
                        </ScrollView>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

export default withNavigation(HomeScreen)