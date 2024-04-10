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
        const fetchData = async () => {
            try{
                const myselfResponse = await axios.get(`/api/opentalk/member/me`, {
                    headers: {Authorization: 'Bearer ' + cookies.accessToken}
                });
                setMyInfo(myselfResponse.data);
                
                const roomResponse = await axios.get(`/api/opentalk/getRoom/${room_Id}/${myselfResponse.data.memberId}`);
                setRoomInformation(roomResponse.data.chatroom);
                setMemberList(roomResponse.data.member);
                setRole(roomResponse.data.role);
            } catch (error){
                console.log(error);
            }
        }

        fetchData();
    }, [room_Id]);

    useEffect(() =>{
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

        const subscribe = async () => {
            try{
                const chatLogData = new FormData();
                chatLogData.append("roomId", room_Id);
                const chatLogResponse = await axios.post("/api/opentalk/chatLog", chatLogData);
                setPreChatList(chatLogResponse.data);
                console.log(preChatList);
    
                client.current.subscribe(`/sub/chat/${room_Id}`, ({body}) => {
                    setChatList((_chatList)=>[..._chatList , JSON.parse(body)])
                });
                chatList.push(...preChatList);
            } catch (error) {
                console.error(error);
            }
        };
        
        connect();
        return () => disconnect();
    }, [room_Id, roomInfo]);

    // useEffect(() => {
    //     setRoomName(props.roomInfo.name);
    //     setParticipates(props.roomInfo.participates);
    // }, [props]);

    
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