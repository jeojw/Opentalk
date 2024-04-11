import React, { useRef, useState, useEffect } from 'react';
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import * as StompJs from "@stomp/stompjs";
import SockJs from "sockjs-client"
import { useCookies } from "react-cookie";
import ChangRoomComponent from './changroom';

const RoomComponent = ({roomInfo, talker}) => {

    const [roomInformation, setRoomInformation] = useState();
    const [myInfo, setMyInfo] = useState();
    const [memberList, setMemberList] = useState([]);
    const [chatList, setChatList] = useState([]);
    const [preChatList, setPreChatList] = useState([]);
    const [chat, setChat] = useState("");
    const [cookies] = useCookies(['accessToken']);
    const [role, setRole] = useState();

    let {room_Id} = useParams();
    
    const client = useRef({});

    const navigate = useNavigate();

    useEffect(() => {
        const fetchInfo = async () => {
            try{
                const myselfResponse = await axios.get(`/api/opentalk/member/me`, {
                    headers: {Authorization: 'Bearer ' + cookies.accessToken}
                });
                setMyInfo(myselfResponse.data);
            } catch (error){
                console.log(error);
            }
        }

        fetchInfo();
    }, []);

    useEffect(() => {
        const fetchChatLog = async () => {
            let response;
            try {
                const data = new FormData();
                data.append("roomId", room_Id);
                response = await axios.post("/api/opentalk/chatLog", data);
            } catch (error){
                console.log(error);
            }
            setPreChatList(response.data);
        }

        fetchChatLog();
    }, [room_Id])


    useEffect(() => {
        const fetchRoom = async () => {
            try{
                const response = await axios.get(`/api/opentalk/getRoom/${room_Id}/${myInfo.memberId}`);
                setRoomInformation(response.data.chatroom);
                setMemberList(response.data.member);
                setRole(response.data.role);
            } catch (error){
                console.log(error);
            }
        }

        fetchRoom();
    }, [room_Id, myInfo]);

    useEffect(() =>{ 
        connect();
        return () => disconnect();
    }, []);

    const connect = () => {
        client.current = new StompJs.Client({
            webSocketFactory: () => new SockJs('/ws'),
            connectHeaders: {
                "auth-token": "spring-chat-auth-token",
            },
            debug: function (str) {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                subscribe();
            },
            onStompError: (frame) => {
                console.error(frame);
            }
        });
        client.current.activate();  
    };

    const disconnect = () => {
        client.current.deactivate();
    };

    
    const publish = (chat) => {
        if (!client.current.connected) return;

        const curTime = new Date();
        const isoDateTime = curTime.toISOString();
        axios.post('/api/opentalk/saveChat', {
            chatRoom: roomInformation,
            member: myInfo,
            message: chat,
            timeStamp: isoDateTime
        })
        .then()
        .catch((error) => console.log(error));

        client.current.publish({
            destination: '/pub/chat',
            body: JSON.stringify({
                chatRoom: roomInformation,
                member: myInfo,
                message: chat,
                timeStamp: isoDateTime
            }),
        });
        setChat("");
    }

    const subscribe = () => {
        client.current.subscribe(`/sub/chat/${room_Id}`, ({body}) => {
            setChatList((prevChatList)=>[... prevChatList , JSON.parse(body)])
        });
    };

    const handleChange = (event) => {
        setChat(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    const ForcedExit = (roomMember) => {
        if (window.confirm(`정말 ${roomMember.memberNickName}님을 강제퇴장 시키겠습니까?`)){
            const checkUrl = "/api/opentalk/forcedExit";
            axios.post(checkUrl, roomMember)
            .then((res) => {
                if (res.data === true){
                    window.alert("강제퇴장 되었습니다.");
                }
            })
            .catch((error) => console.log(error));
        }
    }

    const ExitRoom = () => {
        if (window.confirm("방을 나가시겠습니까?")){
            const exitUrl = '/api/opentalk/exitRoom';
            console.log(roomInformation);
            axios.post(exitUrl, {
                chatroom: roomInformation,
                member: myInfo,
                role: role
            })
            .then((res) => {
                if (res.status === 200){
                    navigate("/opentalk/main");
                }
            })
            .catch((error) => console.log(error));       
        }
    }

    return(
        <div>
            <div>
                {/* Option Chaining!!! */}
                <h1>{roomInformation?.roomName}</h1> 
                <h2>참여자 수: {roomInformation?.participates}</h2>
            </div>
            <div>
                {preChatList && preChatList.length > 0 && (
                    <ul>
                        {preChatList.map((_chatMessage, index) => (
                            <li key={index}>{_chatMessage.member.memberNickName}&nbsp;: {_chatMessage.message}&nbsp;{_chatMessage.timeStamp}</li>
                        ))}
                    </ul>
                )}
                {chatList && chatList.length > 0 && (
                    <ul>
                        {chatList.map((_chatMessage, index) => (
                            <li key={index}>{_chatMessage.member.memberNickName}&nbsp;: {_chatMessage.message}&nbsp;{_chatMessage.timeStamp}</li>
                        ))}
                    </ul>
                )}
            </div>
            <form onSubmit={(event)=>handleSubmit(event)}>
                <div>
                    입력하기: <input type="text" name="chatInput" onChange={handleChange} value={chat}></input>
                </div>
                <input type="submit" value="전송" onClick={() => publish(chat)}></input>
            </form>
            <button onClick={ExitRoom}>나가기</button>
            <ChangRoomComponent room_Id={room_Id}/>
            <div>
            <h2>참여명단</h2>
                {roomInformation?.members.map((_member, index) => (
                    <li key={index}>{_member.memberNickName}
                    {role === "MANAGER" && _member === myInfo && (
                        <button onClick={() => ForcedExit(_member)}>강퇴하기</button>
                    )}
                    </li>
                ))}
            </div>

        </div>
    );
}

export default RoomComponent;