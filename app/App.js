import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer, DarkTheme, DefaultTheme, useTheme } from '@react-navigation/native'

import { LoginScreen, RegisterScreen, StartScreen, UserNavigation } from './src/screens'
import Dark from './src/themes/Dark';
import Light from './src/themes/Light';
import { UserContext, UserProvider } from './src/context/UserContext';

const Stack = createStackNavigator()
 
const App = () => {
    axios.defaults.baseURL = "https://chathappybe.herokuapp.com/"

    return (
        <UserProvider>
            <UserContext.Consumer>
                {
                    ({theUser, setTheUser}) => (
                        <NavigationContainer 
                            theme={theUser && !theUser.isDarkModeOn ? Light : Dark} 
                        >
                            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Start">
                                <Stack.Screen name="Start" component={StartScreen} />
                                <Stack.Screen name="Register" component={RegisterScreen} />
                                <Stack.Screen name="Login" component={LoginScreen} />
                                <Stack.Screen name="User" component={UserNavigation} />
                            </Stack.Navigator>
                        </NavigationContainer>
                    )
                }
            </UserContext.Consumer>
        </UserProvider>
    )
 }
 
 export default App