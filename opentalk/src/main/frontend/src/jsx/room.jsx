import React, { useRef, useState, useEffect } from 'react';
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import * as StompJs from "@stomp/stompjs";
import SockJs from "sockjs-client"
import { useCookies } from "react-cookie";
import ChangRoomComponent from './changroom';
import InviteMemberComponent from './inviteMember';
import { Container, Row, Col, Button, Form, 
    FormControl, InputGroup, ListGroup, ListGroupItem } from 'react-bootstrap';

const RoomComponent = ({roomInfo, talker, setIsChangeData}) => {

    const [roomInformation, setRoomInformation] = useState();
    const [myInfo, setMyInfo] = useState();
    const [member, setMember] = useState([]);
    const [chatList, setChatList] = useState([]);
    const [preChatList, setPreChatList] = useState([]);
    const [chat, setChat] = useState("");
    const [cookies] = useCookies(['accessToken']);
    const [role, setRole] = useState();

    const [isForcedExist, setIsForcedExist] = useState(false);
    const [isChangeRoom, setIsChangeRoom] = useState(false);

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
                setMember(response.data.member);
                setRole(response.data.role);
            } catch (error){
                console.log(error);
            }
        }

        fetchRoom();
    }, [isChangeRoom]);

    useEffect(() => {
        const isExistInRoom = async () => {
            try{
                const response = await axios.get(`/api/opentalk/isExistInRoom/${room_Id}/${myInfo.memberNickName}`);
                if (response.data !== true){
                    navigate("/opentalk/main");
                    setIsForcedExist(false);
                }
            } catch (error){
                console.log(error);
            }
        }

        isExistInRoom();
    }, [isForcedExist]);

    useEffect(() =>{ 
        connect();
        return () => disconnect();
    }, []);

    const enterRoom = () => {
        if (!client.current.connected) return;

        const curTime = new Date();
        const isoDateTime = curTime.toISOString();

        client.current.publish({
            destination: '/pub/chat/enter',
            body: JSON.stringify({
                chatRoom: roomInformation,
                member: myInfo,
                message: `${myInfo.memberNickName}님이 채팅방에 참여했습니다.`,
                timeStamp: isoDateTime
            })
        });
    }

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
                enterRoom();
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
  
    const publishChat = (chat) => {
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
            axios.post(checkUrl, {
                chatroom: roomInformation,
                member: roomMember,
                role: "PARTICIPATES"
            })
            .then((res) => {
                if (res.data === true){
                    window.alert("강제퇴장 되었습니다.");
                    setIsForcedExist(true);
                    window.location.reload();
                }
            })
            .catch((error) => console.log(error));
            if (!client.current.connected) return;

            const curTime = new Date();
            const isoDateTime = curTime.toISOString();

            client.current.publish({
                destination: '/pub/chat/forcedExit',
                body: JSON.stringify({
                    chatRoom: roomInformation,
                    member: roomMember,
                    message: `${roomMember.memberNickName}님이 강퇴되었습니다.`,
                    timeStamp: isoDateTime
                })
            });
        }
    }

    const AuthMandate = (roomMember) => {
        if (window.confirm(`${roomMember.memberNickName}님에게 방장을 넘기시겠습니까?`)){
            const changeUrl = "/api/opentalk/authMandate";
            axios.post(changeUrl, {
                roomId:room_Id,
                manager:myInfo.memberNickName,
                newManager:roomMember.memberNickName
            })
            .then((res) => {
                if (res.data === true){
                    window.alert(`${roomMember.memberNickName}님이 방장이 되었습니다.`);
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
            const curTime = new Date();
            const isoDateTime = curTime.toISOString();

            client.current.publish({
                destination: '/pub/chat/exit',
                body: JSON.stringify({
                    chatRoom: roomInformation,
                    member: myInfo,
                    message: `${myInfo.memberNickName}님이 채팅방을 나갔습니다.`,
                    timeStamp: isoDateTime
                })
            });
        }
    }

    return(
        <Container>
            <Row>
                <Col>
                    {/* Option Chaining!!! */}
                    <h1>{roomInformation?.roomName}</h1> 
                    <h2>참여자 수: {roomInformation?.participates}</h2>
                </Col>
            </Row>
            <Row>
                <Col>
                {preChatList && preChatList.length > 0 && (
                    <ListGroup>
                        {preChatList.map((_chatMessage, index) => (
                            <ListGroupItem>{_chatMessage.member.memberNickName}&nbsp;: {_chatMessage.message}&nbsp;{_chatMessage.timeStamp}</ListGroupItem>
                        ))}
                    </ListGroup>
                )}
                {chatList && chatList.length > 0 && (
                    <ListGroup>
                        {chatList.map((_chatMessage, index) => (
                            <ListGroupItem>{_chatMessage.member.memberNickName}&nbsp;: {_chatMessage.message}&nbsp;{_chatMessage.timeStamp}</ListGroupItem>
                        ))}
                    </ListGroup>
                )}
                </Col>
            </Row>
            <Container>
                <Row>
                    <Col>
                        <Form onSubmit={(event)=>handleSubmit(event)}>
                        <Form.Control type="text"  value={chat} onChange={handleChange} />
                        <Button onChange={() => publishChat(chat)}>전송</Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
                
            <Button onClick={ExitRoom}>나가기</Button>
            <ChangRoomComponent room_Id={room_Id} role={role} setIsChangeRoom={setIsChangeRoom}>
                {() => setIsChangeData(isChangeRoom)}
            </ChangRoomComponent>
            <InviteMemberComponent role={role}/>
            <div>
            <h2>참여명단</h2>
                {roomInformation?.members.map((_member, index) => (
                    <ListGroup>
                        <ListGroupItem>{roomInformation.roomManager ===_member.memberNickName && <img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img>}
                        {_member?.memberNickName}
                        {role === "MANAGER" && roomInformation.roomManager !==_member.memberNickName && (
                        <Button onClick={() => ForcedExit(_member)}>강퇴하기</Button>
                        )}
                        {role === "MANAGER" &&roomInformation.manager !==_member.memberNickName  && _member.memberNickName !== myInfo.memberNickName && (
                        <Button onClick={() => AuthMandate(_member)}>방장위임</Button>
                        )}
                        </ListGroupItem>
                    </ListGroup>
                ))}
            </div>

        </Container>
    );
}

export default RoomComponent;