import React, { Component } from 'react'
import axios from 'axios'
import { Text, TextInput, View, TouchableOpacity } from 'react-native'
import { Button } from "react-native-elements";
import styles from '../static/stylesheets/styles'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ThemeContext from '../themes/ThemeContext';
import AsyncStorage from '@react-native-community/async-storage';

export default class EditProfileScreen extends Component {
    static contextType = ThemeContext

    constructor (props) {
        super(props)

        this.state = {
            user: {},
            date: new Date(2000, 11, 31),
            email: 'johndoe@example.com',
            showDatePicker: false,
            errors: []
        }

        AsyncStorage.getItem("user").then(item => {
            if (item == null) {
                this.props.navigation.navigate("Login")
            }
        })
    }

    setDate (e) {
        this.setState({date: new Date(e)})
        this.setState({showDatePicker: false})
    }

    formatDate (d) {
        if (!d)
            return "Birthdate"

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
    }

    updateProfile () {
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
        
        const dateMonthPadded = (this.state.date.getMonth() + 1).toString().padStart(2, "0")
        const datePadded = this.state.date.getDate().toString().padStart(2, "0")

        axios.put(axios.defaults.baseURL + `users/${this.state.user._id}`, {
            username: this.state.user.username,
            email: this.state.email,
            dob: `${this.state.date.getFullYear()}-${dateMonthPadded}-${datePadded}`,
            friends: this.state.user.friends
        }).then(res => {
            const newUser = this.state.user

            newUser.email = this.state.email
            newUser.dob = `${this.state.date.getFullYear()}-${dateMonthPadded}-${datePadded}`

            AsyncStorage.setItem("user", JSON.stringify(newUser))
            this.props.navigation.navigate("Tabs")
        }).catch(err => {
            if (err.response.status === 400) {
                this.setState({errors: [...this.state.errors, err.response.data]})
            } else if (err.response.status === 500) {
                this.setState({errors: [...this.state.errors, "Server-side error"]})
            }
        })
    }

    componentDidMount () {
        this.updateProfile = this.updateProfile.bind(this)

        AsyncStorage.getItem("user").then(item => {
            this.setState({user: JSON.parse(item)})
        }).then(() => {
            this.setState({email: this.state.user.email})

            var year = parseInt(this.state.user.dob.substring(0, 4))
            var month = parseInt(this.state.user.dob.substring(5, 7))
            var date = parseInt(this.state.user.dob.substring(8, 10));
            
            var dob = new Date(year, month - 1, date)
            dob.setFullYear(dob.getFullYear())
            
            this.setState({date: dob})
        })
    }

    render() {
        return (
            <View style={{...this.context.theme.container}}>
                <View style={{justifyContent: 'center', width: "100%", paddingHorizontal: 32}}>
                    <View style={{alignItems: 'center'}}>
                        <View style={{alignItems: "center", width: "100%", padding: 20}} >
                            <Text style={{fontSize: 32, fontWeight: 'bold', color: "#07f"}}>Edit Profile</Text>
                        </View>
                        <View
                            style={{
                                width: "80%",
                                ...this.context.theme.outlineTertiary,
                                borderBottomWidth: 1,
                                marginBottom: 64
                            }}
                        />
                    </View>
                    <View style={{marginVertical: 16}}>
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
                        <Text 
                            style={{
                                ...this.context.theme.textColorPrimary,
                                fontWeight: 'bold', 
                                fontSize: 24,
                                marginBottom: 16
                            }}
                        >
                            Email
                        </Text>
                        <TextInput 
                            style={{
                                ...this.context.theme.bg3,
                                borderRadius: 10,
                                fontSize: 24,
                                ...this.context.theme.textColorQuaternary,
                                fontWeight: "bold",
                                paddingLeft: 16
                            }}
                            onChangeText={text => this.setState({email: text})}
                            value={this.state.email}
                        />
                    </View>
                    <View style={{marginVertical: 16}}>
                        <Text 
                            style={{
                                ...this.context.theme.textColorPrimary,
                                fontWeight: 'bold', 
                                fontSize: 24,
                                marginBottom: 16
                            }}
                        >
                            Birthdate
                        </Text>
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
                    </View>
                </View>
                <View style={{justifyContent: 'center', marginTop: 64, flexDirection: 'row'}}>
                    <TouchableOpacity 
                        style={{
                            backgroundColor: "#0077ff", 
                            padding: 8, 
                            paddingHorizontal: 16, 
                            borderRadius: 10,
                            marginHorizontal: 16
                        }}
                        onPress={() => this.updateProfile()}
                    >
                        <Text 
                            style={{
                                fontSize: 28, 
                                textTransform: 'uppercase', 
                                fontWeight: "bold",
                                ...this.context.theme.textColorSecondary
                            }}>
                                Edit
                            </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{
                            backgroundColor: "#fff3", 
                            padding: 8, 
                            paddingHorizontal: 16, 
                            borderRadius: 10,
                            marginHorizontal: 16
                        }}
                        onPress={() => this.props.navigation.goBack()}
                    >
                        <Text 
                            style={{
                                fontSize: 28, 
                                textTransform: 'uppercase', 
                                fontWeight: "bold",
                                ...this.context.theme.textColorQuinary
                            }}
                        >
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}
