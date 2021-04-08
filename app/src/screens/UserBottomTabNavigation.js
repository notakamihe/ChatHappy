import React, { Component, useContext } from 'react'
import { BottomTabBar, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from '.';
import ConversationsListScreen from './ConversationsListScreen';
import FriendsListScreen from './FriendsListScreen';
import ExploreScreen from './ExploreScreen';
import SettingsScreen from './SettingsScreen';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'
import { UserContext } from '../context/UserContext';
import LoginScreen from './LoginScreen';

const Tab = createBottomTabNavigator()

const CustomTabBar = (props) => {
    return (
        <View>
            <BottomTabBar {...props.props} />
        </View>
    )
}

const UserBottomTabNavigation = () => {
    const {theUser, setTheUser} = useContext(UserContext)

    return (
        <Tab.Navigator
            tabBarOptions={{
                showLabel: false,
                style: {
                    backgroundColor: "#07f",
                    height: 40
                }
            }}
            tabBar={props => (
                <CustomTabBar props={props} />
            )}
        >
            <Tab.Screen 
                name="Home" 
                component={theUser ? HomeScreen : LoginScreen} 
                options={{
                    tabBarIcon: ({focused}) => (
                        <View
                            style={{
                                width: 50,
                                height: 50,
                                backgroundColor: focused ? "white" : "#fff4",
                                borderRadius: 25,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: focused ? 16 : -15
                            }}
                        >
                            <Icon name="user" solid size={30} />
                        </View>
                    )
                }}
            />
            <Tab.Screen 
                name="Conversations" 
                component={theUser ? ConversationsListScreen : LoginScreen} 
                options={{
                    tabBarIcon: ({focused}) => (
                        <View
                            style={{
                                width: 50,
                                height: 50,
                                backgroundColor: focused ? "white" : "#fff4",
                                borderRadius: 25,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: focused ? 16 : -15
                            }}
                        >
                            <Icon name="comments" solid size={30} />
                        </View>
                    )
                }}
            />
            <Tab.Screen 
                name="Friends" 
                component={theUser ? FriendsListScreen : LoginScreen} 
                options={{
                    tabBarIcon: ({focused}) => (
                        <View
                            style={{
                                width: 50,
                                height: 50,
                                backgroundColor: focused ? "white" : "#fff4",
                                borderRadius: 25,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: focused ? 16 : -15
                            }}
                        >
                            <Icon name="users" solid size={30} />
                        </View>
                    )
                }}
            />
            <Tab.Screen 
                name="Explore" 
                component={theUser ? ExploreScreen : LoginScreen} 
                options={{
                    tabBarIcon: ({focused}) => (
                        <View
                            style={{
                                width: 50,
                                height: 50,
                                backgroundColor: focused ? "white" : "#fff4",
                                borderRadius: 25,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: focused ? 16 : -15
                            }}
                        >
                            <Icon name="compass" solid size={30} />
                        </View>
                    )
                }}
            />
            <Tab.Screen 
                name="Settings" 
                component={theUser ? SettingsScreen : LoginScreen} 
                options={{
                    tabBarIcon: ({focused}) => (
                        <View
                            style={{
                                width: 50,
                                height: 50,
                                backgroundColor: focused ? "white" : "#fff4",
                                borderRadius: 25,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: focused ? 16 : -15
                            }}
                        >
                            <Icon name="cog" solid size={30} />
                        </View>
                    )
                }}
            />
        </Tab.Navigator>
    )
}

export default UserBottomTabNavigation