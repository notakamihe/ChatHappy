import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import axios from 'axios';
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Avatar } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import styles from '../static/stylesheets/styles.js';
import ThemeContext from '../themes/ThemeContext.js';
import { withNavigation } from "react-navigation";

class FriendsListScreen extends React.Component {
    static contextType = ThemeContext

    constructor (props) {
        super(props)

        this.state = {
            user: {},
            friends: []
        }

        AsyncStorage.getItem("user").then(item => {
            if (item == null) {
                this.props.navigation.navigate("Login")
            }
        })
    }

    componentDidMount () {
        AsyncStorage.getItem("user").then(item => {
            this.setState({user: JSON.parse(item)})

            this.setState({friends: []})
             
            this.state.user.friends.forEach(friend => {
                axios.get(axios.defaults.baseURL + `users/${friend}`).then(res => {
                    this.setState({friends: [...this.state.friends, res.data]})
                })
            })
        })

        const { navigation } = this.props;

        this.focusListener = navigation.addListener("focus", () => {
            AsyncStorage.getItem("user").then(item => {
                if (JSON.stringify(this.state.user) != item) {
                    this.setState({user: JSON.parse(item)})
        
                    this.setState({friends: []})
                    
                    this.state.user.friends.forEach(friend => {
                        axios.get(axios.defaults.baseURL + `users/${friend}`).then(res => {
                            this.setState({friends: [...this.state.friends, res.data]})
                        })
                    })
                }
            })
        });
    }

    componentWillUnmount () {
        this.focusListener()
    }

    render () {
        return (
            <SafeAreaView style={this.context.theme.container}>
                <ScrollView style={{width: "100%"}}>
                    <View style={{alignItems: 'center'}}>
                        <View 
                            style={{
                                flexDirection: "row", 
                                justifyContent: "space-between", 
                                width: "100%", 
                                padding: 20,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{fontSize: 32, fontWeight: 'bold', color: "#07f"}}>Friends</Text>
                            <Text style={{fontSize: 20, ...this.context.theme.textColorPrimary}}>
                                {this.state.friends.length}
                            </Text>
                        </View>
                        <View
                            style={{
                                width: "80%",
                                ...this.context.theme.outlineTertiary,
                                borderBottomWidth: 1,
                            }}
                        />
                    </View>
                    <View style={{marginTop: 32, alignItems: 'center'}}>
                        {
                            this.state.friends.map((item, index) => (
                                <TouchableOpacity 
                                    key={index}
                                    style={{
                                        flexDirection: 'row', 
                                        ...this.context.theme.mutedBg1, 
                                        width: "80%", 
                                        padding: 5,
                                        borderRadius: 5,
                                        borderTopLeftRadius: 50,
                                        borderBottomLeftRadius: 50,
                                        alignItems: 'center',
                                        marginVertical: 8
                                    }}
                                    onPress={() => this.props.navigation.dangerouslyGetParent().navigate("User", {
                                        user: item
                                    })}
                                >
                                    <Avatar 
                                        size={70} 
                                        rounded 
                                        source={require("../static/images/defaultavatar.png")} 
                                        containerStyle={{
                                            marginRight: 16
                                        }}
                                    />
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text 
                                            style={{
                                                color: "white", 
                                                fontSize: 18, 
                                                fontWeight: 'bold',
                                                flex: 0.82,
                                                marginRight: 8
                                            }}
                                        >
                                            {item.username}
                                        </Text>
                                        <View style={{alignItems: 'center'}}>
                                            <Icon solid name="users" size={20} color={this.context.theme.textColorTertiary.color} />
                                            <Text 
                                                style={{
                                                    ...this.context.theme.textColorTertiary,
                                                    fontSize: 18, 
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {item.friends.length}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

export default withNavigation(FriendsListScreen)
