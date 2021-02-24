/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import styles from '../static/stylesheets/styles.js';
import ThemeContext from '../themes/ThemeContext.js';

export default class StartScreen extends React.Component {
    static contextType = ThemeContext

    render () { 
        return (
            <View style={this.context.theme.container}>
                <Image 
                    source={require("../static/images/chathappy.png")} 
                    style={{width: 300, height: 300, marginTop: 32}} />
                <Text 
                    style={{
                        fontSize: 48, 
                        textTransform: "uppercase",
                        marginTop: 32,
                        ...this.context.theme.textColorQuinary
                    }}>
                        CHATHAPPY
                </Text>
                <TouchableOpacity 
                    style={{
                        backgroundColor: "#0077ff", 
                        padding: 8, 
                        paddingHorizontal: 16, 
                        borderRadius: 10, 
                        marginTop: 96
                    }}
                    onPress={() => this.props.navigation.navigate("Login")}
                >
                    <Text 
                        style={{
                            fontSize: 28, 
                            textTransform: 'uppercase', 
                            fontWeight: "bold",
                            ...this.context.theme.textColorSecondary
                        }}
                    >
                        Begin
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
}
