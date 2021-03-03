/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import axios from 'axios'
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import { HomeScreen, LoginScreen, RegisterScreen, StartScreen, UserNavigation } from './src/screens'
import AsyncStorage from '@react-native-community/async-storage'
import { ThemeProvider } from './src/themes/ThemeContext';
import { light } from './src/themes/Themes';

const Stack = createStackNavigator()

export default class App extends React.Component {
    theme = light;

    constructor (props) {
        super(props)
    }

    render () {
        axios.defaults.baseURL = "https://chathappybe.herokuapp.com/"

        return (
            <ThemeProvider value={this.theme}>
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Start">
                        <Stack.Screen name="Start" component={StartScreen}></Stack.Screen>
                        <Stack.Screen name="Register" component={RegisterScreen}></Stack.Screen>
                        <Stack.Screen name="Login" component={LoginScreen}></Stack.Screen>
                        <Stack.Screen name="User" component={UserNavigation}></Stack.Screen>
                    </Stack.Navigator>
                </NavigationContainer>
            </ThemeProvider>
        )
    }
}
