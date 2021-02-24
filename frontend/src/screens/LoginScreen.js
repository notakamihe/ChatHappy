/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import React from 'react';
import { Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import styles from '../static/stylesheets/styles.js';
import ThemeContext from '../themes/ThemeContext.js';
import { dark, light } from '../themes/Themes.js';

export default class LoginScreen extends React.Component {
    static contextType = ThemeContext

    constructor (props) {
        super(props)

        this.state = {
            username: '',
            password: '',
            user: {},
            errors: []
        }

        AsyncStorage.getItem("user").then(item => {
            if (item != null) {
                this.props.navigation.navigate("User")
            }
        })
    }

    componentDidMount () {
        this.logIn = this.logIn.bind(this)
    }

    logIn () {
        this.setState({errors: []})

        axios.post(axios.defaults.baseURL + "login", {
            username: this.state.username,
            password: this.state.password,
        }).then(res => {
            AsyncStorage.setItem("user", JSON.stringify(res.data))
            this.props.navigation.navigate("User")
        }).catch(err => {
            if (err.response.status === 400 || err.response.status === 401) {
                this.setState({errors: [...this.state.errors, err.response.data]})
            } else if (err.response.status === 500) {
                this.setState({errors: [...this.state.errors, "Server-side error"]})
            }
        })
    }

    render () {
        return (
            <View style={this.context.theme.container}>
                <Image 
                    source={
                        this.context.theme == light ? 
                        require("../static/images/chathappyblack.png") :
                        require("../static/images/chathappywhite.png")
                    }
                    style={{width: 150, height: 150}} />
                <View style={{width: "85%", flex: 2, justifyContent: 'center'}}>
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
                    <TextInput 
                        placeholder="Username" 
                        placeholderTextColor="#fff3"
                        style={{
                            fontSize: 28,
                            ...this.context.theme.bg3,
                            borderRadius: 10,
                            paddingLeft: 16,
                            ...this.context.theme.textColorTertiary,
                            marginVertical: 16,
                            fontWeight: 'bold'
                        }} 
                        onChangeText={text => this.setState({username: text})}
                        value={this.state.username}
                    />
                    <TextInput 
                        placeholder="Password" 
                        placeholderTextColor="#fff3"
                        style={{
                            fontSize: 28,
                            ...this.context.theme.bg3,
                            borderRadius: 10,
                            paddingLeft: 16,
                            ...this.context.theme.textColorTertiary,
                            marginVertical: 16,
                            fontWeight: 'bold'
                        }} 
                        secureTextEntry
                        onChangeText={text => this.setState({password: text})}
                        value={this.state.password}
                    />
                </View>
                <View style={{flex: 1}}>
                    <TouchableOpacity 
                        style={{
                            backgroundColor: "#0077ff", 
                            padding: 8, 
                            paddingHorizontal: 16, 
                            borderRadius: 10, 
                            marginTop: 32,
                            ...this.context.theme.bg6
                        }}
                        onPress={() => this.logIn()}
                    >
                        <Text 
                            style={{
                                fontSize: 28, 
                                textTransform: 'uppercase', 
                                fontWeight: "bold",
                                ...this.context.theme.textColorQuinary
                            }}
                        >
                            Log in
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{
                            paddingHorizontal: 16, 
                            marginTop: 16,
                            alignItems: 'center',
                        }}
                        onPress={() => this.props.navigation.navigate("Register")}
                    >
                        <Text style={{fontSize: 22, fontWeight: "bold", ...this.context.theme.textColorQuaternary, textAlign: 'center'}}>Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}
