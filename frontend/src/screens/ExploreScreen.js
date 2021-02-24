import React from 'react';
import axios from 'axios';
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import styles from '../static/stylesheets/styles.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Avatar, SearchBar } from 'react-native-elements';
import ThemeContext from '../themes/ThemeContext.js';
import AsyncStorage from '@react-native-community/async-storage';
import { formatDateStringMMDD } from "../../utils";

export default class ExploreScreen extends React.Component {
    static contextType = ThemeContext

    constructor (props) {
        super(props)

        this.state = {
            user: {},
            users: [],
            searchText: ''
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

            axios.get(axios.defaults.baseURL + `users`).then(res => {
                this.setState({users: res.data.filter(u => u._id != this.state.user._id)})
            })
        })
    }

    render () {
        return (
            <SafeAreaView style={this.context.theme.container}>
                <ScrollView style={{width: "100%"}}>
                    <View style={{alignItems: 'center'}}>
                        <View 
                            style={{
                                width: "90%",
                                padding: 20,
                                alignItems: "flex-start",
                                marginBottom: 8
                            }}
                        >
                            <Text style={{fontSize: 32, fontWeight: 'bold', color: "#07f"}}>Explore</Text>
                            <Text 
                                style={{
                                    fontSize: 20, 
                                    ...this.context.theme.textColorPrimary, 
                                    fontWeight: 'bold'
                                }}
                            >
                                Find friends
                            </Text>
                        </View>
                        <SearchBar 
                            placeholder="Search" 
                            containerStyle={{width: "90%", padding: 4, borderRadius: 20, backgroundColor: "#07f"}}
                            inputStyle={{color: "#07f", fontSize: 20}}
                            inputContainerStyle={{ ...this.context.theme.bg1 }}
                            onChangeText={text => this.setState({searchText: text})}
                            value={this.state.searchText}
                            round
                        />
                    </View>
                    <View 
                        style={{
                            paddingHorizontal: 24, 
                            width: "100%", 
                            marginTop: 64, 
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap'
                        }}
                    >
                        {
                            this.state.users.filter(u => u.username.toLowerCase().includes(this.state.searchText.toLowerCase())).map((item, index) => (
                                <TouchableOpacity 
                                    key={index}
                                    style={{
                                        ...this.context.theme.mutedBg2, 
                                        padding: 16, 
                                        width: "48%",
                                        borderRadius: 15,
                                        alignItems: 'center',
                                        marginVertical: 8
                                    }}
                                    onPress={() => this.props.navigation.dangerouslyGetParent().navigate("User", {
                                        user: item
                                    })}
                                >
                                    <Avatar 
                                        rounded 
                                        source={require('../static/images/defaultavatar.png')} 
                                        size={70}
                                    />
                                    <Text 
                                        style={{color: "white", fontSize: 20, marginTop: 8}}
                                        numberOfLines={1}
                                    >
                                        {item.username}
                                    </Text>
                                    <View 
                                        style={{
                                            flexDirection: 'row', 
                                            justifyContent: 'space-between', 
                                            width: "100%",
                                            marginTop: 16
                                        }}
                                    >
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Icon name="birthday-cake" solid size={16} color={this.context.theme.textColorTertiary.color} style={{marginRight: 8}} />
                                            <Text style={{...this.context.theme.textColorTertiary, fontSize: 18, fontWeight: 'bold'}}>{formatDateStringMMDD(item.dob)}</Text>
                                        </View>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Icon name="users" solid size={16} color={this.context.theme.textColorTertiary.color} style={{marginRight: 8}} />
                                            <Text style={{...this.context.theme.textColorTertiary, fontSize: 18, fontWeight: 'bold'}}>{item.friends.length}</Text>
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
