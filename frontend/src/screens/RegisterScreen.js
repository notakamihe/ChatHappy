/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import axios from 'axios'
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import styles from '../static/stylesheets/styles.js';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ThemeContext from '../themes/ThemeContext.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-community/async-storage';

export default class RegisterScreen extends React.Component {
    static contextType = ThemeContext

    constructor (props) {
        super(props)

        this.state = {
            date: null,
            username: '',
            email: '',
            password: '',
            passwordConfirm: '',
            showDatePicker: false,
            errors: []
        }

        AsyncStorage.getItem("user").then(item => {
            if (item != null) {
                this.props.navigation.navigate("User")
            }
        })
    }

    componentDidMount () {
        this.signUp = this.signUp.bind(this)
        this.setDate = this.setDate.bind(this)
        this.formatDate = this.formatDate.bind(this)
    }

    formatDate (d) {
        if (!d)
            return "Birthdate"

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
    }

    signUp () {
        const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/

        this.state.errors = []

        if (!this.state.email.match(regex)) {
            this.setState({errors: [...this.state.errors, "Email is not valid"]})
            return
        }

        if (this.state.date == null) {
            this.setState({errors: [...this.state.errors, "No birthdate chosen"]})
            return
        }

        if (new Date().getFullYear() - this.state.date.getFullYear() < 13) {
            this.setState({errors: [...this.state.errors, "Too young. Must be at least 13"]})
            return
        }

        if (this.state.password != this.state.passwordConfirm) {
            this.setState({errors: [...this.state.errors, "Passwords don't match"]})
            return
        }
        
        const dateMonthPadded = (this.state.date.getMonth() + 1).toString().padStart(2, "0")
        const datePadded = this.state.date.getDate().toString().padStart(2, "0")

        axios.post(axios.defaults.baseURL + "signup", {
            username: this.state.username,
            email: this.state.email,
            dob: `${this.state.date.getFullYear()}-${dateMonthPadded}-${datePadded}`,
            password: this.state.password,
            friends: []
        }).then(res => {
            AsyncStorage.setItem("user", JSON.stringify(res.data))
            this.props.navigation.navigate("User")
        }).catch(err => {
            if (err.response.status === 400) {
                this.setState({errors: [...this.state.errors, err.response.data]})
            } else if (err.response.status === 500) {
                this.setState({errors: [...this.state.errors, "Server-side error"]})
            }
        })
    }

    setDate (e) {
        this.setState({date: new Date(e)})
        this.setState({showDatePicker: false})
    }

    render () {
        return (
            <SafeAreaView style={{...this.context.theme.container, width: "100%"}}>
                <ScrollView style={{width: "100%", padding: 0}}>
                    <View style={{alignItems: 'center', marginBottom: 32}}>
                        <View style={{width: "85%", justifyContent: 'center', marginTop: 32}}>
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
                                onChangeText={text => this.setState({username: text.toLowerCase()})}
                                value={this.state.username}
                            />
                            <TextInput 
                                placeholder="Email" 
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
                                onChangeText={text => this.setState({email: text.toLowerCase()})}
                                value={this.state.email}
                            />
                            <TouchableOpacity onPress={() => this.setState({showDatePicker: true})}>
                                <Text 
                                    style={{
                                        fontSize: 28, 
                                        fontWeight: "bold",
                                        ...this.context.theme.bg3,
                                        borderRadius: 10,
                                        padding: 16,
                                        ...this.context.theme.textColorQuaternary,
                                        marginVertical: 16,
                                        fontWeight: 'bold',
                                        textAlign: 'center'
                                    }}
                                >
                                    {this.formatDate(this.state.date)}
                                </Text>
                            </TouchableOpacity>
                            <DateTimePickerModal
                                isVisible={this.state.showDatePicker}
                                mode="date"
                                onConfirm={(e) => this.setDate(e)}
                                onCancel={() => this.setState({showDatePicker: false})}
                                date={this.state.date || new Date(2000, 1, 1)}
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
                            <TextInput 
                                placeholder="Confirm password" 
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
                                onChangeText={text => this.setState({passwordConfirm: text})}
                                value={this.state.passwordConfirm}
                            />
                        </View>
                        <View>
                            <TouchableOpacity 
                                style={{
                                    ...this.context.theme.bg6, 
                                    padding: 8, 
                                    paddingHorizontal: 16, 
                                    borderRadius: 10, 
                                    marginTop: 32
                                }}
                                onPress={() => this.signUp()}
                            >
                                <Text 
                                    style={{
                                        fontSize: 28, 
                                        textTransform: 'uppercase', 
                                        fontWeight: "bold",
                                        ...this.context.theme.textColorQuinary
                                    }}
                                >
                                    Sign up
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{
                                    paddingHorizontal: 16, 
                                    marginTop: 16,
                                    alignItems: 'center'
                                }}
                                onPress={() => this.props.navigation.navigate("Login")}
                            >
                                <Text style={{fontSize: 22, fontWeight: "bold", ...this.context.theme.textColorQuaternary, textAlign: 'center'}}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}
