import React, {Component, useEffect} from 'react';
import { createStackNavigator } from '@react-navigation/stack'
import { UserBottomTabNavigation, ConversationScreen, EditProfileScreen, UserScreen } from '.'
import { normalize } from '../../utils';
import { useTheme } from '@react-navigation/native';

const Stack = createStackNavigator()

const UserNavigation = () => {
    const {colors} = useTheme()

    return (
        <Stack.Navigator initialRouteName="Tabs">
            <Stack.Screen 
                name="Tabs" 
                component={UserBottomTabNavigation}
                options={{
                    headerShown: false
                }}    
            />
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
                        fontSize: normalize(16),
                        color: colors.bgColor
                    },
                }}
            />
            <Stack.Screen 
                name="EditProfile" 
                component={EditProfileScreen}
                options={{headerShown: false}}
            />
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
                        color: colors.bgColor
                    },
                }}
            />
        </Stack.Navigator>
    )
}

export default UserNavigation