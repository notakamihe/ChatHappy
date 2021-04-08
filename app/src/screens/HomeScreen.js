import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios'
import { Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Avatar } from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome5'
import { SafeAreaView } from 'react-native-safe-area-context';
import {normalize} from '../../utils.js'
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { UserContext } from '../context/UserContext.js';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const HomeScreen = (props) => {
    const [conversations, setConversations] = useState([])
    const [friendsOfFriends, setFriendsOfFriends] = useState([])
    const [image, setImage] = useState(null)

    const {theUser, setTheUser} = useContext(UserContext)
    const {colors} = useTheme()

    if (!theUser) {
        props.navigation.navigate("Login")
    }

    useEffect(() => {
        const unsubscribe = props.navigation.addListener("focus", () => {
            getUser()
        });
        return unsubscribe;
    }, [props.navigation]);

    const getUser = async () => {
        axios.get(axios.defaults.baseURL + "conversations").then(res => {
            setConversations(res.data.filter(c => c.users.map(u => u._id).includes(theUser._id)))
        }).catch(error => {
            console.log(error);
        })

        setFriendsOfFriends([])

        theUser.friends.forEach(f => {
            f.friends.forEach(ff => {
                axios.get(axios.defaults.baseURL + `users/${ff}`).then(res => {
                    if (res.data._id == theUser._id)
                        return 

                    if (friendsOfFriends.map(x => x._id).includes(res.data._id))
                        return

                    if (theUser.friends.map(x => x._id).includes(res.data._id))
                        return

                    setFriendsOfFriends(prev => [...prev, res.data])
                }).catch(err => console.log(err))
            })
        });
    }

    const openImages = async () => {
        console.log("Opening images");

        const options = {
            maxWidth: 256,
            maxHeight: 256
        }

        launchImageLibrary(options, response => {
            if (!response.cancelled && response.uri) {
                setImage({ localUri: response.uri });
    
                var formData = new FormData()
    
                formData.append('image', {
                    uri: response.uri,
                    name: response.uri,
                    type: `image/${response.uri.substring(response.uri.lastIndexOf(".") + 1)}`,
                })
    
                axios({
                    method: "put",
                    url: axios.defaults.baseURL + `users/${theUser._id}/image`,
                    data: formData,
                    headers: { "Content-Type": "multipart/form-data" }
                }).then(res => {
                    setTheUser(res.data)
                }).catch(err => console.log(err));
            }
        })
    }

    return (
        <SafeAreaView>
            <ScrollView style={{width: "100%"}}>
                <View style={{width: "100%", alignItems: 'flex-start', padding: 16}}>
                    <View style={{alignSelf: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={() => openImages()}>
                            <Avatar 
                                rounded 
                                source={theUser.imageUrl ? 
                                    { uri: axios.defaults.baseURL + theUser.imageUrl} :
                                    require("./../../assets/images/defaultavatar.png")
                                } 
                                size={normalize(100)} 
                                containerStyle={{
                                    borderWidth: 2,
                                    borderColor: "#07f",
                                    padding: 8,
                                    marginTop: normalize(32)
                                }}
                            />
                        </TouchableOpacity>
                        <View style={{alignItems: 'center', marginBottom: 32}}>
                            <Text 
                                style={{
                                    fontSize: normalize(32), 
                                    color: colors.primaryTextColor,
                                    fontWeight: "bold"
                                }}
                            >
                                {theUser.username}
                            </Text>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Icon 
                                    solid 
                                    name="birthday-cake" 
                                    size={normalize(24)} 
                                    style={{marginRight: normalize(16)}}
                                    color={colors.mutedTextColor}
                                />
                                <Text 
                                    style={{
                                        fontSize: normalize(24),
                                        color: colors.mutedTextColor,
                                        fontFamily: "Poppins-Regular"
                                    }}
                                >
                                    {moment(theUser.dob).format("MMMM D")}
                                </Text>
                            </View>
                            <Text style={{color: "#07f", fontSize: normalize(20), fontFamily: "Poppins-Regular"}}>
                                {theUser.friends ? theUser.friends.length : null} friends
                            </Text>
                        </View>
                    </View>

                    <Text 
                        style={{
                            fontSize: normalize(22), 
                            marginBottom: normalize(16),
                            color: colors.primaryTextColor,
                            fontFamily: "Poppins-Bold"
                        }}
                    >
                        Recent conversations
                    </Text>

                    <View style={{width: "100%", marginLeft: normalize(16), marginBottom: normalize(28)}}>
                        {
                            conversations.map((item, index) => {
                                if (index <= 2 && item.messages.length) {
                                    return (
                                        <TouchableOpacity 
                                            key={index}
                                            style={{
                                                flexDirection: 'row', 
                                                width: "95%", 
                                                borderRadius: 5, 
                                                alignItems: 'center', 
                                                marginVertical: normalize(6),
                                                backgroundColor: colors.primaryBgColor
                                            }}
                                            onPress={() => props.navigation.dangerouslyGetParent().navigate("Conversation", {
                                                conversation: item
                                            })}
                                        >
                                            <Avatar 
                                                size={normalize(50)} 
                                                source={item.messages[item.messages.length - 1].sentby.imageUrl ? 
                                                    { uri: axios.defaults.baseURL + item.messages[item.messages.length - 1].sentby.imageUrl} :
                                                    require("./../../assets/images/defaultavatar.png")
                                                }
                                                
                                            />
                                            <Text 
                                                style={{
                                                    marginLeft: normalize(16), 
                                                    width:"70%", 
                                                    fontSize: normalize(15),
                                                    color: colors.bgColor,
                                                    fontFamily: "Poppins-Medium"
                                                }} 
                                                numberOfLines={2}
                                            >
                                                {item.messages[item.messages.length - 1].content}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                } else 
                                    return null
                            })
                        }
                    </View>

                    <Text 
                        style={{
                            fontSize: normalize(22), 
                            marginBottom: normalize(16),
                            color: colors.primaryTextColor,
                            fontFamily: "Poppins-Bold"
                        }}
                    >
                        Chatters to befriend
                    </Text>

                    <ScrollView 
                        showsHorizontalScrollIndicator={false} 
                        horizontal 
                        style={{width: "100%", marginBottom: normalize(28), paddingBottom: normalize(16)}}
                    >
                        {
                            friendsOfFriends.map((item, index) => (
                                <TouchableOpacity 
                                    key={index}
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
                                        size={normalize(60)} 
                                        containerStyle={{
                                            borderWidth: 1,
                                            padding: normalize(8),
                                            marginRight: normalize(8),
                                            borderColor: "#07f"
                                        }}
                                    />
                                </TouchableOpacity>
                            ))
                        }
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default HomeScreen