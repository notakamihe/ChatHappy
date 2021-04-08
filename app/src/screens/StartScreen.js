import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { normalize } from '../../utils.js';

const StartScreen = (props) => {
    return (
        <View style={{backgroundColor: "#666", flex: 1, alignItems: "center"}}> 
            <Image 
                source={require("./../../assets/images/chathappy.png")} 
                style={{width: normalize(300), height: normalize(300), marginTop: 32}} />
            <Text 
                style={{
                    fontSize: normalize(40), 
                    textTransform: "uppercase",
                    marginTop: normalize(32),
                    fontFamily: "Poppins-Black"
                }}>
                    CHATHAPPY
            </Text>
            <View style={{flexGrow: 1, justifyContent: "flex-end", marginBottom: normalize(32)}}>
                <TouchableOpacity 
                    style={{
                        backgroundColor: "#0077ff", 
                        padding: normalize(8), 
                        paddingHorizontal: normalize(16), 
                        borderRadius: 10,
                    }}
                    onPress={() => props.navigation.navigate("Login")}
                >
                    <Text 
                        style={{
                            fontSize: normalize(28), 
                            textTransform: 'uppercase', 
                            fontFamily: "Poppins-Bold",
                        }}
                    >
                        Begin
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default StartScreen
