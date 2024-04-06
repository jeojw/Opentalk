import React, { useRef, useState, useEffect } from 'react';
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import * as StompJs from "@stomp/stompjs";
import SockJs from "sockjs-client"
import { Cookies } from "react-cookie";

const RoomComponent = ({roomInfo, talker}) => {

    const [roomInfomation, setRoomInfomation] = useState();
    const [myInfo, setMyInfo] = useState();
    const [memberList, setMemberList] = useState([]);
    const [chatList, setChetList] = useState([]);
    const [chat, setChat] = useState("");
    const cookie = new Cookies();

    let {room_Id} = useParams();
    
    const client = useRef({});

    const navigate = useNavigate();


    useEffect(() => {
        const fetchRoomStatus = async () => {
            try{
                const response = await axios.get(`/api/opentalk/getRoom/${room_Id}`);
                setRoomInfomation(response.data);
            } catch (error) {
                console.error(error);
            }
            
        };
        fetchRoomStatus();
    }, []);

    useEffect(()=>{
        const fetchMembersStatus = async () => {
            try{
                const response = await axios.get(`api/opentalk/allMembers/${room_Id}`);
                setMemberList(response.data);
                console.log(response.data);
            } catch(error){
                console.error(error);
            }
            console.log(memberList);
        }
        fetchMembersStatus();
    }, []);

    useEffect(()=> {
        const fetchMyself = async () => {
            try{
                const response = await axios.get(`/api/opentalk/member/me`, {
                    headers: {Authorization: 'Bearer ' + cookie.get("accessToken")}
                });
                setMyInfo(response.data);
                
            } catch (error){
                console.error(error);
            }
        }
        fetchMyself();
    }, []);

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

        const subscribe = () => {
            client.current.subscribe(`/sub/chat/${room_Id}`, ({body}) => {
                setChetList((_chatList)=>[..._chatList , JSON.parse(body)])
            });
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

        client.current.publish({
            destination: '/pub/chat',
            body: JSON.stringify({
                roomId: room_Id,
                writer: myInfo.memberNickName,
                message: chat
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

    const ExitRoom = () => {
        if (window.confirm("방을 나가시겠습니까?")){
            const exitUrl = '/api/opentalk/exitRoom';
            axios.post(exitUrl, {
                chatroom: roomInfomation,
                member: myInfo
            })
            .then((res) => {
                if (res.status == 200){
                    navigate("/opentalk/main");
                }
            })
            .catch((error) => console.log(error));            
        }
    }
    return(
        <div>
            <div>
                {/* <h1>{roomInfomation.roomName}</h1>
                <h2>참여자 수: {roomInfomation.participates}</h2> */}
            </div>
            <div>
                {chatList && chatList.length > 0 && (
                    <ul>
                        {chatList.map((_chatMessage, index) => (
                            <li key={index}>{_chatMessage.writer}&nbsp;: {_chatMessage.message}</li>
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
            <div>
                {memberList && memberList.length > 0 && (
                    <ul>
                        {chatList.map((_member, index) => (
                            <li key={index}>{_member.memberNickName}</li>
                        ))}
                    </ul>
                )}
            </div>

        </div>
    );
}

export default RoomComponent;