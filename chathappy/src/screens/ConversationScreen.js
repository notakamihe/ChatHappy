import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import React, { Component } from 'react'
import { Text, TextInput, View, TouchableOpacity, ScrollView, Keyboard } from "react-native";
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { formatDateDateAtTime } from '../../utils';
import styles from '../static/stylesheets/styles';
import ThemeContext from '../themes/ThemeContext';

export default class ConversationScreen extends Component {
    static contextType = ThemeContext

    constructor (props) {
        super(props)
        
        this.state = {
            user: {},
            conversation: {},
            convoWOId: {},
            text: "",
            error: "",
        }

        AsyncStorage.getItem("user").then(item => {
            if (item == null) {
                this.props.navigation.navigate("Login")
            }
        })
    }
    
    componentDidMount () {
        this.renderUsernames = this.renderUsernames.bind(this)
        this.renderMessage = this.renderMessage.bind(this)
        this.sendMessage = this.sendMessage.bind(this)

        AsyncStorage.getItem("user").then(item => {
            this.setState({user: JSON.parse(item)})
        })

        this.setState({conversation: this.props.route.params.conversation})
        this.setState({convoWOId: this.props.route.params.convosWOIds})
    }
    
    componentDidUpdate () {
        const usernames = this.renderUsernames(this.state.conversation.users)
        this.props.navigation.setOptions({title: "Conversation w/ " + usernames });
    }

    renderMessage (item, idx) {
        if (item.sentby != this.state.user._id) {
            return (
                <View style={{marginVertical: 8}} key={idx}>
                    <View 
                        style={{
                            ...this.context.theme.bg5, 
                            padding: 16, 
                            paddingTop: 8, 
                            borderRadius: 10,
                            maxWidth: "75%",
                            borderBottomLeftRadius: 0,
                            alignSelf: 'flex-start'
                        }}
                    >
                        <Text 
                            style={{
                                fontSize: 18, 
                                fontWeight: "bold",
                                ...this.context.theme.textColorSecondary
                            }}
                        >
                            {formatDateDateAtTime(item.createdat)}
                        </Text>
                        <Text style={{fontSize: 20, color: "#fff9"}}>
                            {item.content}
                        </Text>
                    </View>
                    <Text style={{fontSize: 18, ...this.context.theme.textColorPrimary, marginTop: 8}}>
                        {this.state.conversation.users.find(u => u._id == item.sentby).username}
                    </Text>
                </View>
            )
        } else {
            return (
                <View style={{marginVertical: 8}} key={idx}>
                    <View 
                        style={{
                            backgroundColor: "#07f", 
                            padding: 16, 
                            paddingTop: 8, 
                            borderRadius: 10,
                            maxWidth: "75%",
                            alignSelf: 'flex-end',
                            borderBottomRightRadius: 0
                        }}
                    >
                        <Text 
                            style={{
                                fontSize: 18, 
                                fontWeight: "bold",
                                ...this.context.theme.textColorSecondary
                            }}
                        >
                            {formatDateDateAtTime(item.createdat)}
                        </Text>
                        <Text style={{fontSize: 20, color: "#fff9"}}>
                            {item.content}
                        </Text>
                    </View>
                    <Text 
                        style={{
                            fontSize: 18, 
                            ...this.context.theme.textColorPrimary, 
                            marginTop: 8,
                            alignSelf: "flex-end"
                        }}
                    >
                        You
                    </Text>
                </View>
            )
        }
    }

    renderUsernames (list) {
        const usernames = list.filter(user => user._id != this.state.user._id).map(item => item.username)
        return usernames.join(", ")
    }

    sendMessage () {
        this.setState({error: ""})

        axios.post(axios.defaults.baseURL + "messages", {
            content: this.state.text,
            sentby: this.state.user._id
        }).then(res => {
            this.state.convoWOId.messages.push(res.data._id)

            axios.put(axios.defaults.baseURL + `conversations/${this.state.conversation._id}`, {
                messages: this.state.convoWOId.messages,
                users: this.state.convoWOId.users
            }).then(r => {
                var newConversation = this.state.conversation

                newConversation.messages.push(res.data)
                this.setState({conversation: newConversation})

                Keyboard.dismiss()
                this.setState({text: ""})
            }).catch(err => {
                console.log(err);
            })
        }).catch(err => {
            this.setState({error: this.state.error + err.response.data + " "})
        })
    }

    render() {
        return (
            <SafeAreaView style={{...this.context.theme.container}}>
                <ScrollView 
                    style={{width: "100%", marginBottom: 64}}
                    ref={ref => {this.scrollView = ref}}
                    onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}
                >
                    <View style={{padding: 16}}>
                        {
                            this.state.conversation.messages ?

                            this.state.conversation.messages.map((item, index) => 
                            this.renderMessage(item, index)) : null
                        }
                    </View>
                </ScrollView>
                <View
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        maxHeight: 100,
                        flexDirection: 'row',
                        margin: 6,
                    }}
                >
                    <TextInput 
                        placeholder={this.state.error || "Send a message"}
                        placeholderTextColor={this.context.theme.textMuted1.color}
                        multiline
                        style={{
                            ...this.context.theme.bg3,
                            flex: 0.85,
                            borderRadius: 5,
                            color: "white",
                            fontSize: 20,
                        }}
                        onChangeText={txt => this.setState({text: txt})}
                        value={this.state.text}
                     />
                     <TouchableOpacity 
                        style={{
                            ...this.context.theme.bg6, 
                            flex: 0.15,
                            marginLeft: 6,
                            borderRadius: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 50,
                            alignSelf: 'flex-end'
                        }}
                        onPress={() => this.sendMessage()}
                    >
                         <Icon solid name="paper-plane" size={30} color={this.context.theme.textColorQuinary.color} />
                     </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
}
