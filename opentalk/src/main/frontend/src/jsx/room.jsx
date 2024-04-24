import React, { useRef, useState, useEffect, useContext } from 'react';
import axios from "axios";
import { useParams, useNavigate} from 'react-router-dom';
import * as StompJs from "@stomp/stompjs";
import SockJs from "sockjs-client"
import ChangRoomComponent from './changroom';
import InviteMemberComponent from './inviteMember';
import { Container, Row, Col, Button, Form, FormGroup, InputGroup, ListGroup, ListGroupItem } from 'react-bootstrap';
import { format } from 'date-fns'
import { TokenContext } from './TokenContext';

const RoomComponent = ({isChangeData, setIsChangeData}) => {

    const [roomInformation, setRoomInformation] = useState();
    const [myInfo, setMyInfo] = useState();
    const [chatList, setChatList] = useState([]);
    const [preChatList, setPreChatList] = useState([]);
    const [chat, setChat] = useState("");
    const [role, setRole] = useState();

    const [isForcedExist, setIsForcedExist] = useState(false);
    const [isChangeRoom, setIsChangeRoom] = useState(false);
    const [otherMember, setOtherMember] = useState([]);

    const { loginToken } = useContext(TokenContext);

    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

    let {room_Id} = useParams();  
    const client = useRef({});
    const navigate = useNavigate();

    const preventGoBack = () => {
        window.history.pushState(null, "", window.location.href);
        ExitRoom();
    };

    const exitWindow = (event) => {
        event.preventDefault();
        ExitRoom_Unload();
    };

    useEffect(() => {
        (async () => {
            window.history.pushState(null, "", window.location.href);
            window.addEventListener("popstate", preventGoBack);
        })();
        return () => {
            window.removeEventListener("popstate", preventGoBack);
        };
    },[roomInformation, myInfo, role]);

    useEffect(() => {
        window.addEventListener("beforeunload", exitWindow);
        return () => {
            window.removeEventListener("beforeunload", exitWindow);
        };
    },[roomInformation, myInfo, role, loginToken]);

    useEffect(() => {
        const fetchInfo = async () => {
            try{
                const myselfResponse = await axios.get(`/api/opentalk/member/me`, {
                    headers: {authorization: loginToken}
                });
                setMyInfo(myselfResponse.data);
            } catch (error){
                console.log(error);
            }
        }
        fetchInfo();
    }, [loginToken]);


    useEffect(() => {
        const fetchRoom = async () => {
            try{
                const response = await axios.get(`/api/opentalk/getRoom/${room_Id}/${myInfo.memberId}`);
                setRoomInformation(response.data.chatroom);
                setOtherMember(response.data.chatroom.members);
                setRole(response.data.role);
            } catch (error){
                console.log(error);
            }
        }

        fetchRoom();
    }, [isChangeData, isChangeRoom, room_Id, myInfo]);

    //강퇴, 입장, 방장 위임 등 발생시 작동하는 훅
    useEffect(() =>{
        setIsChangeRoom(prevState => !prevState);
    }, [otherMember])

    useEffect(() => {
        const isExistInRoom = async () => {
            try{
                const response = await axios.get(`/api/opentalk/isExistInRoom/${room_Id}/${myInfo.memberNickName}`);
                if (response.data !== true){
                    navigate("/opentalk/main");
                }
            } catch (error){
                console.log(error);
            }
        }

        isExistInRoom();
    }, [isChangeRoom, isForcedExist, myInfo, room_Id]);

    useEffect(() => {
        const fetchChatLog = async () => {
            try {
                const data = new FormData();
                data.append("roomId", room_Id);
                const response = await axios.post("/api/opentalk/chatLog", data);
                setPreChatList(response.data);
            } catch (error){
                console.log(error);
            }
        }

        fetchChatLog();
    }, [])

    useEffect(() =>{ 
        connect();
        return () => disconnect();
    }, []);

    const enterRoom = () => {
        if (!client.current.connected) return;

        const curTime = new Date();
        const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60 * 1000);
        const kr_Time = new Date(utc + (KR_TIME_DIFF));

        client.current.publish({
            destination: '/pub/chat/enter',
            body: JSON.stringify({
                chatRoom: roomInformation,
                member: {
                    memberId:"system",
                    memberNickName:"system"
                },
                message: `${myInfo.memberNickName}님이 채팅방에 참여했습니다.`,
                timeStamp: format(kr_Time, "yyyy-MM-dd-hh-mm")
            })
        });
        setIsChangeRoom(prevState => !prevState);
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

        if (chat === ""){
            window.alert("채팅 내용을 입력해주세요.")
        }
        else{
            const curTime = new Date();
            const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60 * 1000);
            const kr_Time = new Date(utc + (KR_TIME_DIFF));
            console.log(format(kr_Time, "yyyy-MM-dd-HH:mm"));
            axios.post('/api/opentalk/saveChat', {
                chatRoom: roomInformation,
                member: myInfo,
                message: chat,
                timeStamp: format(kr_Time, "yyyy-MM-dd-HH:mm")
            })
            .then()
            .catch((error) => console.log(error));

            client.current.publish({
                destination: '/pub/chat',
                body: JSON.stringify({
                chatRoom: roomInformation,
                member: myInfo,
                message: chat,
                timeStamp: format(kr_Time, "yyyy-MM-dd-HH:mm")
            }),
        });
        setChat("");
        }
        
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
                role: "ROLE_PARTICIPATE"
            })
            .then((res) => {
                if (res.data === true){
                    window.alert("강제퇴장 되었습니다.");
                    setIsChangeRoom(prevState => !prevState);
                    setIsForcedExist(prevState => !prevState);
                }
            })
            .catch((error) => console.log(error));
            if (!client.current.connected) return;

            const curTime = new Date();
            const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60 * 1000);
            const kr_Time = new Date(utc + (KR_TIME_DIFF));

            client.current.publish({
                destination: '/pub/chat/forcedExit',
                body: JSON.stringify({
                    chatRoom: roomInformation,
                    member: {
                        memberId:"system",
                        memberNickName:"system"
                    },
                    message: `${roomMember.memberNickName}님이 강퇴되었습니다.`,
                    timeStamp: format(kr_Time, "yyyy-MM-dd-HH:mm")
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
                    setIsChangeRoom(prevState => !prevState);
                }
            })
            .catch((error) => console.log(error));
            const curTime = new Date();
            const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60 * 1000);
            const kr_Time = new Date(utc + (KR_TIME_DIFF));
            
            client.current.publish({
                destination: '/pub/chat/exit',
                body: JSON.stringify({
                    chatRoom: roomInformation,
                    member: {
                        memberId:"system",
                        memberNickName:"system"
                    },
                    message: `${roomMember.memberNickName}님이 방장이 되었습니다.`,
                    timeStamp: format(kr_Time, "yyyy-MM-dd-HH:mm")
                })
            });
        }
    }

    const ExitRoom_Unload = () => {
        const exitUrl = '/api/opentalk/exitRoom';
        axios.post(exitUrl, {
            chatroom: roomInformation,
            member: myInfo,
            role: role
        })
        .then((res) => {
            if (res.status === 200){
                setIsChangeRoom(prevState => !prevState);
            }
        })
        .catch((error) => console.log(error));
        
        const curTime = new Date();
        const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60 * 1000);
        const kr_Time = new Date(utc + (KR_TIME_DIFF));

        client.current.publish({
            destination: '/pub/chat/exit',
            body: JSON.stringify({
                chatRoom: roomInformation,
                member: {
                    memberId:"system",
                    memberNickName:"system"
                },
                message: `${myInfo?.memberNickName}님이 채팅방을 나갔습니다.`,
                timeStamp: format(kr_Time, "yyyy-MM-dd-HH:mm")
            })
        });

        if (loginToken !== ""){
            axios.post("/api/opentalk/auth/logout", {}, {
                headers: { 
                    Authorization: loginToken,
                }
            })
            .then((res) => {
                if (res.status === 200){
                    navigate("/opentalk/member/login");
                }
            })
            .catch((error) => console.log(error));
        }
        else{
            alert("이미 로그아웃되었습니다.");
            navigate("/opentalk/member/login");
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
                    setIsChangeRoom(prevState => !prevState);
                    console.log(isChangeRoom);
                }
            })
            .catch((error) => console.log(error));
            
            const curTime = new Date();
            const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60 * 1000);
            const kr_Time = new Date(utc + (KR_TIME_DIFF));

            client.current.publish({
                destination: '/pub/chat/exit',
                body: JSON.stringify({
                    chatRoom: roomInformation,
                    member: {
                        memberId:"system",
                        memberNickName:"system"
                    },
                    message: `${myInfo?.memberNickName}님이 채팅방을 나갔습니다.`,
                    timeStamp: format(kr_Time, "yyyy-MM-dd-HH:mm")
                })
            });
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter'){
            publishChat(chat);
        }
    }

    return(
        <Container className="border border-#B6B6B6 border-3 rounded-1 p-5">
            <Container>
                <Row>
                    <Col className="border border-#C3C3C3 border-3 rounded-1 p-5 d-flex justify-content-left align-items-center"
                    style={{backgroundColor:"#C3C3C3", height:"110px"}}>
                        {/* Option Chaining!!! */}
                        <h2>{roomInformation?.roomName}</h2> 
                    </Col>
                </Row>
            </Container>
            <Container className="border border-#898989 border-3 rounded-1 p-5"
            style={{backgroundColor:"#898989"}}>
                <Row>
                    <Col 
                        className="border-#898989 border-1 rounded-1 p-4"  
                        sm={3}
                        md={3}
                        xl={3}
                        lg={3} 
                        style={{ width:'70%', height:'400px', overflowY: 'auto', maxHeight: '400px'
                                        ,display: "flex", flexDirection: "column-reverse" }}>
                        {chatList && chatList.length > 0 && (
                        <ListGroup style={{marginBottom: '10px'}}>
                            {chatList.map((_chatMessage) => {
                                let fontcolor = "#000000";
                                let color;
                                let textAlign = "left";
                                if (_chatMessage.member.memberNickName === myInfo?.memberNickName) {
                                    color  = "#C3C3C3";
                                } else if (_chatMessage.member.memberNickName === 'system') {
                                    color  = '#000000';
                                    fontcolor = "#FFFFFF"
                                } else{
                                    color = '#FFFFFF';
                                    textAlign = "right"
                                }
                                const style = {
                                    border: color,
                                    color: fontcolor,
                                    backgroundColor: color,
                                    marginBottom: '6px',
                                    textAlign: textAlign,
                                    borderTopLeftRadius: "15px",
                                    borderBottomLeftRadius: "15px",
                                    borderTopRightRadius: "15px",
                                    borderBottomRightRadius: "15px"
                                };
                                return (
                                    <ListGroupItem style={style}>
                                        <strong>{_chatMessage.member.memberNickName}</strong>
                                        <br></br>
                                        <hr/>
                                        {_chatMessage.message}
                                    </ListGroupItem>
                                );
                            })}
                        </ListGroup>
                        )}
                        <br></br>
                        {preChatList && preChatList.length > 0 && (
                        <ListGroup>
                            {preChatList.map((_chatMessage) => {
                                let fontcolor = "#000000";
                                let color;
                                let textAlign = "left";
                                if (_chatMessage.member.memberNickName === myInfo?.memberNickName) {
                                    color  = "#C3C3C3";
                                } else if (_chatMessage.member.memberNickName === 'system') {
                                    color  = '#000000';
                                    fontcolor = "#FFFFFF"

                                } else{
                                    color = '#FFFFFF';
                                    textAlign = "right"
                                }
                                const style = {
                                    border: color,
                                    color: fontcolor,
                                    backgroundColor: color,
                                    marginBottom: '6px',
                                    textAlign: textAlign,
                                    borderTopLeftRadius: "15px",
                                    borderBottomLeftRadius: "15px",
                                    borderTopRightRadius: "15px",
                                    borderBottomRightRadius: "15px"
                                };
                                return (
                                    <ListGroupItem style={style}>
                                        <strong>{_chatMessage.member.memberNickName}</strong>
                                        <br></br>
                                        <hr/>
                                        {_chatMessage.message}
                                    </ListGroupItem>
                                );
                            })}
                        </ListGroup>
                        )}
                    </Col>
                    <Col 
                        className="border-#9D9D9D border-1 rounded-1 p-4" 
                        sm={1}
                        md={1}
                        xl={1}
                        lg={1} 
                        style={{ width:'30%', height:'400px', overflowY: 'auto', maxHeight: '400px', backgroundColor:"#C3C3C3" }}>
                        <h5>참여명단</h5>
                        {roomInformation?.members.map((_member, index) => (
                            <ListGroup style={{marginBottom: '6px', 
                                            borderTopLeftRadius: "25px",
                                            borderBottomLeftRadius: "25px",
                                            borderTopRightRadius: "25px",
                                            borderBottomRightRadius: "25px"}}>
                                <ListGroupItem>{roomInformation.roomManager ===_member.memberNickName && <img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img>}
                                {_member?.memberNickName}
                                <div style={{width:"4px", display:"inline-block"}}/>
                                {role === "ROLE_MANAGER" && roomInformation.roomManager !==_member.memberNickName && (
                                <Button className="btn-sm"variant='dark' onClick={() => ForcedExit(_member)} style={{
                                                                                                    borderTopLeftRadius: "25px",
                                                                                                    borderBottomLeftRadius: "25px",
                                                                                                    borderTopRightRadius: "25px",
                                                                                                    borderBottomRightRadius: "25px"
                                                                                                }}>강퇴하기</Button>
                                )}
                                <div style={{width:"4px", display:"inline-block"}}/>
                                {role === "ROLE_MANAGER" &&roomInformation.manager !==_member.memberNickName  && _member.memberNickName !== myInfo.memberNickName && (
                                <Button className="btn-sm" variant="#C3C3C3" onClick={() => AuthMandate(_member)} style={{
                                    backgroundColor: "#C3C3C3",
                                    borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px",
                                    borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"
                                }}>방장위임</Button>
                                )}
                                </ListGroupItem>
                            </ListGroup>
                        ))}
                    </Col>
                </Row>
                <br></br>
                <Row>
                    <Col>
                        <FormGroup 
                            className="d-flex align-items-center justify-content-center"
                            onSubmit={(event)=>handleSubmit(event)}>
                            <InputGroup style={{width:"800px", height:"45px"}}>
                                <Form.Control type="text" 
                                    value={chat} 
                                    placeholder='채팅 내용을 입력해 주세요.' 
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                     style={{borderTopLeftRadius: "25px",
                                            borderBottomLeftRadius: "25px",
                                            borderTopRightRadius: "25px",
                                            borderBottomRightRadius: "25px"}} />            
                            </InputGroup>
                            <div style={{width:"7px", display:"inline-block"}}/>
                            <Button className='btn-lg' 
                            variant='#C3C3C3' 
                            style={{  backgroundColor:"#C3C3C3", 
                                    borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px",
                                    borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"
                                }} 
                            onClick={() => publishChat(chat)}><strong>전송</strong></Button>          
                        </FormGroup>
                    </Col>
                </Row>
            </Container>
            <br></br>
            <FormGroup className="d-flex align-items-center justify-content-center gap-3">
                <Button className='btn-lg' variant="dark" style={{ borderTopLeftRadius: "25px",
                                                borderBottomLeftRadius: "25px",
                                                borderTopRightRadius: "25px",
                                                borderBottomRightRadius: "25px"}} onClick={ExitRoom}>나가기</Button>
                <ChangRoomComponent room_Id={room_Id} role={role} isChangRoom={isChangeRoom} setIsChangeRoom={setIsChangeRoom}>
                    {() => setIsChangeData(isChangeRoom)}
                </ChangRoomComponent>
                <InviteMemberComponent roomInfo = {roomInformation} role={role}/>
            </FormGroup>
        </Container>
    );
}

export default RoomComponent;