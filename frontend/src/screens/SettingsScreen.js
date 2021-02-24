import React from 'react';
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView, Alert, Linking } from 'react-native';
import styles from '../static/stylesheets/styles.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Switch } from 'react-native-gesture-handler';
import ToggleSwitch from "toggle-switch-react-native";
import { Button } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import ThemeContext from '../themes/ThemeContext.js';
import { dark, light } from '../themes/Themes.js';
import axios from 'axios';

export default class SettingsScreen extends React.Component {
    static contextType = ThemeContext

    constructor (props) {
        super(props)

        this.state = {
            user: {},
            isDarkModeOn: false
        }

        AsyncStorage.getItem("user").then(item => {
            if (item == null) {
                this.props.navigation.navigate("Login")
            }
        })
    }

    logOut () {
        AsyncStorage.removeItem("user").then(item => {
            this.props.navigation.dangerouslyGetParent().dangerouslyGetParent().navigate("Login")
        })
    }

    toEditProfile (props) {
        props.navigation.dangerouslyGetParent().navigate("EditProfile")
    }

    componentDidMount () {
        this.toEditProfile = this.toEditProfile.bind(this)
        this.logOut = this.logOut.bind(this)

        AsyncStorage.getItem("user").then(item => {
            this.setState({user: JSON.parse(item)})
        })
    }

    render () {
        const {theme, setTheme} = this.context

        return (
            <SafeAreaView style={this.context.theme.container}>
                <ScrollView style={{width: "100%"}}>
                    <View 
                        style={{
                            flexDirection: "row", 
                            justifyContent: "space-between", 
                            width: "100%", 
                            padding: 20,
                            alignItems: 'center',
                            marginBottom: 32
                        }}
                    >
                        <Icon solid size={32} color="#07f" name='cog' />
                        <Text style={{fontSize: 32, fontWeight: 'bold', color: "#07f"}}>Preferences & Help</Text>
                    </View>
                    <View style={{alignItems: 'center', marginVertical: 16}}>
                        <Text 
                            style={{
                                ...this.context.theme.textColorPrimary, 
                                fontSize: 28, 
                                fontWeight: 'bold'
                            }}
                        >
                            UI
                        </Text>
                        <View>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 8}}>
                                <Text 
                                    style={{
                                        ...this.context.theme.textMuted1,
                                        fontSize: 20, 
                                        marginRight: 16, 
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Dark mode
                                </Text>
                                <ToggleSwitch 
                                    isOn={this.context.theme == dark}
                                    onToggle={isOn => setTheme(this.context.theme == light ? dark : light)}
                                    size="large"
                                    offColor="#0001"
                                    onColor="#07f"
                                    thumbOffStyle={{
                                        backgroundColor: "black",
                                        width: 20,
                                        height: 20
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{alignItems: 'center', marginVertical: 16}}>
                        <Text 
                            style={{
                                ...this.context.theme.textColorPrimary, 
                                fontSize: 28, 
                                fontWeight: 'bold',
                                marginBottom: 16
                            }}
                        >
                            Account
                        </Text>
                        <View>
                            <View style={{alignItems: 'center', marginVertical: 8}}>
                                <Button 
                                    title="Edit profile" 
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
                                    onPress={() => this.toEditProfile(this.props)}
                                />
                                <Button 
                                    title="Log out" 
                                    buttonStyle={{
                                        borderRadius: 30,
                                        paddingHorizontal: 16,
                                        marginVertical: 6,
                                        ...this.context.theme.bg2
                                    }}
                                    titleStyle={{
                                        fontSize: 20,
                                        ...this.context.theme.textColorSecondary
                                    }}
                                    onPress={() => this.logOut()}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{alignItems: 'center', marginVertical: 16}}>
                        <Text 
                            style={{
                                ...this.context.theme.textColorPrimary, 
                                fontSize: 28, 
                                fontWeight: 'bold',
                                marginBottom: 16
                            }}
                        >
                            Contact
                        </Text>
                        <View>
                            <View style={{alignItems: 'center', marginVertical: 8}}>
                                <Button 
                                    title="Email" 
                                    buttonStyle={{
                                        borderRadius: 30,
                                        paddingHorizontal: 16,
                                        marginVertical: 6
                                    }}
                                    titleStyle={{
                                        fontSize: 20,
                                        ...this.context.theme.textColorSecondary
                                    }}
                                    onPress={() => Linking.openURL('mailto:notakamihe@gmail.com') }
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}
