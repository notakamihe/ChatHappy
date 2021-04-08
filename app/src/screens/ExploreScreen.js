import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Avatar, SearchBar } from 'react-native-elements';
import { normalize } from "../../utils";
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';

const ExploreScreen = (props) => {
    const [users, setUsers] = useState([])
    const [searchText, setSearchText] = useState("")

    const {theUser, setTheUser} = useContext(UserContext)
    const {colors} = useTheme()

    if (!theUser) {
        props.navigation.navigate("Login")
    }

    useEffect(() => {
        axios.get(axios.defaults.baseURL + `users`).then(res => {
            setUsers(res.data.filter(u => u._id != theUser._id))
        })
    }, [])

    return (
        <SafeAreaView>
            <ScrollView style={{width: "100%"}}>
                <View style={{alignItems: 'center'}}>
                    <View 
                        style={{
                            width: "90%",
                            padding: normalize(20),
                            alignItems: "flex-start",
                            marginBottom: normalize(8)
                        }}
                    >
                        <Text style={{fontSize: normalize(32), fontWeight: 'bold', color: "#07f"}}>Explore</Text>
                        <Text 
                            style={{
                                fontSize: normalize(20),
                                fontStyle: "italic",
                                color: colors.primaryTextColor
                            }}
                        >
                            Find friends
                        </Text>
                    </View>
                    <SearchBar 
                        placeholder="Search"
                        containerStyle={{
                            width: "90%", 
                            padding: 0,
                            backgroundColor: "transparent",
                            border: "none",
                            outline: "none",
                            borderWidth: 0,
                        }}
                        inputStyle={{color: colors.primaryTextColor, fontSize: normalize(20)}}
                        inputContainerStyle={{ borderRadius: 20, backgroundColor: colors.bgColor2 }}
                        onChangeText={setSearchText}
                        value={searchText}
                        round
                        placeholderTextColor={colors.mutedTextColor}
                    />
                </View>
                <View 
                    style={{
                        paddingHorizontal: normalize(24), 
                        width: "100%", 
                        marginVertical: normalize(64), 
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap'
                    }}
                >
                    {
                        users.filter(u => u.username.toLowerCase().includes(searchText.toLowerCase())).map((item, index) => (
                            <TouchableOpacity 
                                key={index}
                                style={{
                                    padding: normalize(16), 
                                    width: "48%",
                                    borderRadius: 15,
                                    alignItems: 'center',
                                    marginVertical: normalize(8),
                                    backgroundColor: colors.bgColor2
                                }}
                                onPress={() => props.navigation.dangerouslyGetParent().navigate("User", {
                                    user: item
                                })}
                            >
                                <Avatar 
                                    rounded 
                                    source={item.imageUrl ? 
                                        { uri: axios.defaults.baseURL + item.imageUrl} :
                                        require("./../../assets/images/defaultavatar.png")
                                    } 
                                    size={normalize(70)}
                                />
                                <Text 
                                    style={{color: colors.primaryTextColor, fontSize: normalize(20), marginTop: 8}}
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
                                        <Icon 
                                            name="birthday-cake" 
                                            solid 
                                            size={normalize(16)}
                                            style={{marginRight: 8}} 
                                            color="#07f"
                                        />
                                        <Text 
                                            style={{
                                                fontSize: normalize(18), color: "#07f", fontFamily: "Poppins-SemiBold"
                                            }}
                                        >
                                            {moment(item.dob).format("M[.]D")}
                                        </Text>
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Icon 
                                            name="users" 
                                            solid 
                                            size={normalize(16)}  
                                            style={{marginRight: 8}} 
                                            color="#07f"
                                        />
                                        <Text 
                                            style={{
                                                fontSize: normalize(18), 
                                                color: "#07f",
                                                fontFamily: "Poppins-SemiBold"
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

export default ExploreScreen