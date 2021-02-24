import React, {Component} from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import { UserBottomTabNavigation, ConversationScreen, EditProfileScreen, UserScreen } from '.'

const Stack = createStackNavigator()

export default class UserNavigation extends React.Component {
    render () {
        return (
            <Stack.Navigator initialRouteName="Tabs">
                <Stack.Screen 
                    name="Tabs" 
                    component={UserBottomTabNavigation}
                    options={{
                        headerShown: false
                    }}    
                ></Stack.Screen>
                <Stack.Screen 
                    name="Conversation" 
                    component={ConversationScreen}
                    options={{
                        title: "Conversation w/ ",
                        headerStyle: {
                            backgroundColor: '#07f',
                        },
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    }}
                ></Stack.Screen>
                <Stack.Screen 
                    name="EditProfile" 
                    component={EditProfileScreen}
                    options={{headerShown: false}}
                ></Stack.Screen>
                <Stack.Screen 
                    name="User" 
                    component={UserScreen}
                    options={{
                        title: "Profile of ",
                        headerStyle: {
                            backgroundColor: '#07f',
                        },
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    }}
                ></Stack.Screen>
            </Stack.Navigator>
        )
    }
}
