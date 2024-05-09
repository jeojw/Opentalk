import React, { useRef, useState, useEffect, useContext } from 'react';
import axios from "axios";
import { useParams, useNavigate} from 'react-router-dom';
import * as StompJs from "@stomp/stompjs";
import SockJs from "sockjs-client"
import ChangRoomComponent from './changroom';
import InviteMemberComponent from './inviteMember';
import { Container, Row, Col, Button, Form, FormGroup, 
        InputGroup, ListGroup, ListGroupItem, Accordion, 
        Offcanvas, OffcanvasBody, Dropdown } from 'react-bootstrap';
import { format } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useMediaQuery } from 'react-responsive';
import { themeContext } from './themeContext';
import { soundContext } from './soundContext';
import Modal from 'react-modal';
import { Store } from 'react-notifications-component';

const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 768 })
    return isDesktop ? children : null
}
const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })
    return isMobile ? children : null
}
const RoomComponent = () => {
    const {theme} = useContext(themeContext);
    const {play} = useContext(soundContext);

    const [roomInformation, setRoomInformation] = useState();
    const [myInfo, setMyInfo] = useState();
    const [chatList, setChatList] = useState([]);
    const [preChatList, setPreChatList] = useState([]);
    const [chat, setChat] = useState("");
    const [role, setRole] = useState();
    const [curParticipates, setCurParticipates] = useState(0)
    const [otherMember, setOtherMember] = useState([]);

    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [personalMessageList, setPersonalMessageList] = useState([]);
    const [showPMModal, setShowPMModal] = useState(false);
    const [isOpenMessageForm, setIsOpenMessageForm] = useState(false);

    const [personalMessage, setPersonalMessage] = useState("");
    const [receiver, setReceiver] = useState("");

    const [isReissue, setIsReissue] = useState(false);

    useEffect(() => {
        if (isReissue){
            const reissueToken = async () =>{
                const reissueUrl = "/api/opentalk/auth/reissue";
                try{
                    const reissueRes = await axios.post(reissueUrl, null, {
                        headers:{
                            'Authorization': localStorage.getItem("token"),
                        },
                    })
                    if (reissueRes.status === 200){
                        localStorage.setItem("token", reissueRes.headers['authorization']);
                    }
                } catch(error) {
                    console.log(error);
                    setIsReissue(false); 
                }
            }
            reissueToken();
        }
    }, [isReissue])

    useEffect(() => {
        const validateToken = async () =>{
            try{
                const url = "/api/opentalk/auth/validate";
                const response = await axios.post(url, null, {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                });
                if (response.data === true){
                    setIsReissue(true);
                }
                else{
                    setIsReissue(false);
                }
            } catch(error){
                setIsReissue(true);
            }
        }
        validateToken();
    }, []);


    const handleShowOffcanvas = () => {
        setShowOffcanvas(true);
    };

    const handleCloseOffcanvas = () => {
        setShowOffcanvas(false);
    };

    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(30);

    const [prevScroll, setPrevScroll] = useState(0);

    const chatContainerRef = useRef(null);
    const chatContainerRefM = useRef(null);

    const scrollToIndex = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = prevScroll;
        }
    };

    useEffect(() => {
        scrollToIndex();
    }, [startIndex, prevScroll]);

    useEffect(() => {
        if (chatContainerRefM.current){
            const observer = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && preChatList.length > 0){
                    chatContainerRefM.current.scrollTop = prevScroll;
                    setStartIndex(prevStartIndex => prevStartIndex - 10);
                }
            }, {
                root:null,
                rootMargin: '0px',
                threshold: 1
            });
    
            if (chatContainerRefM.current){
                observer.observe(chatContainerRefM.current);
            }
    
            return () =>{
                if (chatContainerRefM.current){
                    observer.unobserve(chatContainerRefM.current);
                }
            }
        }
    }, [preChatList, prevScroll]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const threshold = (scrollHeight - clientHeight) * -1;
        
        if (scrollTop <= threshold) {
            if (startIndex >= 10)
                setStartIndex(prevStartIndex => prevStartIndex - 10);
            else
                setStartIndex(0);
            setPrevScroll(scrollTop);
        }
    };

    const handleScrollM = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const threshold = (scrollHeight - clientHeight) * -1;
        
        if (e.target === chatContainerRefM.current && scrollTop <= threshold) {
            if (startIndex >= 10)
                setStartIndex(prevStartIndex => prevStartIndex - 10);
            else
                setStartIndex(0);
            setPrevScroll(scrollTop);
        }
    };

    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

    let {room_Id} = useParams();  
    const client = useRef({});
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: allPersonalMessages, isLoading: PMIsLoading, isError: PMIsError, isFetching: PMIsFetching, isFetched: PMIsFetched } = useQuery({
        queryKey:['allPersonalMessages'],
        queryFn: async () =>{
            try{
                const messageResponse = await axios.get(`/api/opentalk/member/allPersonalMessages/${myInfo?.memberNickName}`);
                return messageResponse.data;
            } catch (error){
                console.log(error);
            }
        },
        cacheTime: 30000,
        staleTime: 5000,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    }, [myInfo?.memberNickName])

    useEffect(() =>{
        if (allPersonalMessages && !PMIsLoading && !PMIsError && !PMIsFetching && PMIsFetched){
            setPersonalMessageList(allPersonalMessages);
        }
    }, [allPersonalMessages, PMIsLoading, PMIsError, PMIsFetching, PMIsFetched])

    const { data: roomData, 
        isLoading: roomIsLoading, 
        isError: roomIsError, 
        isFetching: roomIsFetching, 
        isFetched: roomIsFetched} = useQuery({
        queryKey:['roomData'], 
        queryFn: async () => {
            try{
                const response = await axios.get(`/api/opentalk/getRoom/${room_Id}/${myInfo.memberId}`);
                return response.data;
            } catch(error){
                throw new Error('Failed to fetch room data');
            }
            
        },  
        enabled: !!room_Id && !!myInfo,
        cacheTime: 30000,
        staleTime: 5000,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    }, [room_Id, myInfo]);


    const { mutate: mutateAuthMandate } = useMutation(async (roomMember) => {
        const changeUrl = "/api/opentalk/authMandate";
        try{
            const res = await axios.post(changeUrl, {
                roomId:room_Id,
                manager:myInfo.memberNickName,
                newManager:roomMember.memberNickName
            });
            if (res.data === true){
                window.alert(`${roomMember.memberNickName}님이 방장이 되었습니다.`);
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

                client.current.publish({
                    destination: '/pub/chat/authMandateResponse',
                    body: JSON.stringify({
                        nickName: "system",
                        message: ``,
                    })
                });
            }
        } catch(error){
            console.log(error);
        }
        
    }, {
        onSuccess: () =>{
            queryClient.invalidateQueries('roomData');
        }
    });

    const { mutate: mutateForcedExit } = useMutation(async (roomMember) => {
        const checkUrl = "/api/opentalk/forcedExit";
        try{
            const res = await axios.post(checkUrl, {
                chatroom: roomInformation,
                member: roomMember,
                role: "ROLE_PARTICIPATE"
            });
            if (res.data === true){
                window.alert("강제퇴장 되었습니다.");
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
                client.current.publish({
                    destination: '/pub/chat/exitRoomResponse',
                    body: JSON.stringify({
                        nickName: "system",
                        message: ``,
                    })
                });
            }
        } catch(error){
            console.log(error);
        }
    }, {
        onSuccess: () =>{
            queryClient.invalidateQueries('roomData');
            queryClient.invalidateQueries('allChatRooms');
        }
    });

    const { mutate: mutateExitRoom_Unload } = useMutation(async () => {
        const exitUrl = '/api/opentalk/exitRoom';
        try{
            const res = await axios.post(exitUrl, {
                chatroom: roomInformation,
                member: myInfo,
                role: role
            });
            if (res.data === true){
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
                client.current.publish({
                    destination: '/pub/chat/exitRoomResponse',
                    body: JSON.stringify({
                        nickName: "system",
                        message: ``,
                    })
                });
            }
        } catch(error){
            console.log(error);
        }
    }, {
        onSuccess: () =>{
            queryClient.invalidateQueries('roomData');
            queryClient.invalidateQueries('allChatRooms');
        }
    });

    const { mutate: mutateExitRoom } = useMutation(async () => {
        const exitUrl = '/api/opentalk/exitRoom';
        try{
            const res = await axios.post(exitUrl, {
                chatroom: roomInformation,
                member: myInfo,
                role: role
            });
            if (res.data === true){
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

                client.current.publish({
                    destination: '/pub/chat/exitRoomResponse',
                    body: JSON.stringify({
                        nickName: "system",
                        message: ``,
                    })
                });

                navigate("/opentalk/main");
            }
        } catch(error){
            console.log(error);
        }
    }, {
        onSuccess: () =>{
            queryClient.invalidateQueries('roomData');
            queryClient.invalidateQueries('allChatRooms');
        }
    });

    useEffect(() => {
        if (roomData && !roomIsLoading && !roomIsError && !roomIsFetching && roomIsFetched) {
            setRoomInformation(roomData.chatroom);
            setOtherMember(roomData.chatroom.members);
            setRole(roomData.role);
            setCurParticipates(roomData.chatroom.curParticipates);
        }
    }, [roomData, roomIsLoading, roomIsError, roomIsFetching, roomIsFetched]);

    useEffect(() => {
        const fetchInfo = async () => {
            if (localStorage.getItem("token")){
                try{
                    const myselfResponse = await axios.get(`/api/opentalk/member/me`, {
                        headers: {authorization: localStorage.getItem("token")}
                    });
                    setMyInfo(myselfResponse.data);
                } catch (error){
                    console.log(error);
                }
            }
            else{
                navigate("/opentalk");
            }
        }
        fetchInfo();
    }, []);

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
    }, [roomData, myInfo, room_Id]);

    useEffect(() => {
        const fetchChatLog = async () => {
            try {
                const data = new FormData();
                data.append("roomId", room_Id);
                const response = await axios.post("/api/opentalk/chatLog", data);
                setPreChatList(response.data);
                setStartIndex(response.data.length - 10);
                setEndIndex(response.data.length);
            } catch (error){
                console.log(error);
            }
        }

        fetchChatLog();
    }, [])
    
    
  
    const publishChat = (chat) => {
        if (!client.current.connected) return;

        if (chat === ""){
            window.alert("채팅 내용을 입력해주세요.")
        }
        else{
            const curTime = new Date();
            const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60 * 1000);
            const kr_Time = new Date(utc + (KR_TIME_DIFF));
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
            if (JSON.parse(body).member.memberNickName === "system"){
                queryClient.invalidateQueries("roomData");
            }
            setChatList((prevChatList)=>[... prevChatList , JSON.parse(body)])
        });

        client.current.subscribe('/sub/chat/enterRoomResponse', ({body}) =>{
            if (JSON.parse(body).nickName === "system"){
                queryClient.invalidateQueries("allChatRooms");
            }
        })
        client.current.subscribe('/sub/chat/exitRoomResponse', ({body}) =>{
            if (JSON.parse(body).nickName === "system"){
                queryClient.invalidateQueries("allChatRooms");
            }
        })
        client.current.subscribe(`/sub/chat/changeRoom`, ({body}) => {
            if (JSON.parse(body).nickName === "system"){
                queryClient.invalidateQueries("allChatRooms");
            }
        });
        client.current.subscribe(`/sub/chat/authMandateResponse`, ({body}) => {
            if (JSON.parse(body).nickName === "system"){
                queryClient.invalidateQueries("allChatRooms");
            }
        });
        client.current.subscribe(`/sub/chat/inviteMessage`, ({body}) => {
            if (JSON.parse(body).nickName === myInfo.memberNickName){
                queryClient.invalidateQueries("allInviteMessages");
                Store.addNotification({
                    title: "새 초대 메세지",
                    message: "새 초대 메세지가 도착했습니다.",
                    type: "info",
                    insert: "top", 
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                })
            }
        });
        client.current.subscribe('/sub/chat/personalMessage', ({body}) => {
            if (JSON.parse(body).nickName === myInfo.memberNickName){
                queryClient.invalidateQueries("allPersonalMessages");
                Store.addNotification({
                    title: "새 쪽지",
                    message: "새 쪽지가 도착했습니다.",
                    type: "info",
                    insert: "top", 
                    container: "top-right",
                    animationIn: ["animate__animated", "animate__fadeIn"],
                    animationOut: ["animate__animated", "animate__fadeOut"],
                    dismiss: {
                        duration: 5000,
                        onScreen: true
                    }
                })
            }
        })
        client.current.subscribe(`/sub/chat/alarmMessage`, ({body}) => {
            if (JSON.parse(body).nickName === "system"){
                queryClient.invalidateQueries("allAlarmMessage");
                play();
            }
        });
    };
    useEffect(() =>{ 
        const connect = async () => {
            try{
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
                await client.current.activate(); 
            } catch(error){
                console.log(error);
            }
        };
    
        const disconnect = () => {
            client.current.deactivate();
        };
        connect();
        
        return () => disconnect();
    }, []);

    let isExiting = false;

    const preventGoBack = () => {
        if (!isExiting){
            window.history.pushState(null, "", window.location.href);
            ExitRoom();
            isExiting = true;
            setTimeout(() => {
                isExiting = false;
            }, 1000);
        }
    };

    const exitWindow = (event) => {
        window.history.pushState(null, "", window.location.href)
        ExitRoom_Unload();
        event.preventDefault();
    };

    useEffect(() => {
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", preventGoBack);

        return () => {
            window.removeEventListener("popstate", preventGoBack);
        };
    },[roomInformation, myInfo, role]);

    useEffect(() => {
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("beforeunload", exitWindow);

        return () => {
            window.removeEventListener("beforeunload", exitWindow);
        };
    },[roomInformation, myInfo, role]);

    const handleChange = (event) => {
        setChat(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    const AuthMandate = (roomMember) => {
        if (window.confirm(`${roomMember.memberNickName}님에게 방장을 넘기시겠습니까?`)){
            mutateAuthMandate(roomMember);
        }
    }

    const ForcedExit = (roomMember) => {
        if (window.confirm(`정말 ${roomMember.memberNickName}님을 강제퇴장 시키겠습니까?`)){
            mutateForcedExit(roomMember);
        }
    }

    const ExitRoom_Unload = () => {
        mutateExitRoom_Unload();
    }

    const ExitRoom = () => {
        if (window.confirm("방을 나가시겠습니까?")){
            mutateExitRoom();
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter'){
            publishChat(chat);
        }
    }

    const sendPersonalMessage = async ({caller, receiver, message}) =>{
        const sendUrl = '/api/opentalk/member/sendPersonalMessage';
        try{
            const res = await axios.post(sendUrl, {
                receiver: receiver,
                caller: caller,
                message: message
            })
            if (res.status === 200){
                window.alert("쪽지를 보냈습니다.");
                setIsOpenMessageForm(false);
                client.current.publish({
                    destination: '/pub/chat/personalMessage',
                    body: JSON.stringify({
                        nickName: receiver,
                        message: ``,
                    })
                });
                const sendAlarmUrl = "/api/opentalk/member/sendAlarmMessage"
                try {
                    const alarmResponse = await axios.post(sendAlarmUrl, {
                        memberNickName: receiver,
                        alarmType: "PERSONAL",
                        alarmMessage: "새로운 쪽지가 도착했습니다."
                    })
                    if (alarmResponse.status === 200){
                        client.current.publish({
                            destination: '/pub/chat/alarmMessage', 
                            body: JSON.stringify({
                                nickName: "system",
                                message: ``,
                            })
                        })
                    }
                    
                } catch (error){
                    console.log(error);
                }
            }
        } catch(error){
            console.log(error);
        }
    }

    const deletePersonalMessage = async ({message_id, caller, receiver, message}) =>{
        const deleteUrl = '/api/opentalk/member/deletePersonalMessage';
        try{
            console.log(personalMessageList);
            const res = await axios.post(deleteUrl, {
                messageId:message_id,
                receiver:receiver,
                caller:caller,
                message:message
            })
            if (res.status === 200){
                queryClient.invalidateQueries("allPersonalMessages");
            }
        } catch(error){
            console.log(error);
        }
    }

    return(
        <div>
            <Desktop>
                <Modal 
                    isOpen={showPMModal} 
                    onRequestClose={()=>setShowPMModal(false)}
                    style={{
                        content: {
                            backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                            width: '1000px', // 원하는 너비로 설정
                            height: '600px', // 원하는 높이로 설정
                            borderTopLeftRadius: '25px',
                            borderBottomLeftRadius: '25px',
                            borderTopRightRadius: '25px',
                            borderBottomRightRadius: '25px',
                            position:'relative',
                            top: "70px"
                        }
                    }}>
                    <ListGroup className = 'custom-ui'>
                    {personalMessageList.map((_message) => (
                        <ListGroupItem
                            style={{backgroundColor:theme === 'light' ? '#8F8F8F' : '#6D6D6D',
                                    color:theme === 'light' ? '#000000' : '#FFFFFF'}}><strong>{_message.caller}</strong>
                        <hr/>{_message.message}
                        <hr/>
                        <div className='d-flex flex-row gap-2'>
                            <Button
                                className='custom-button'
                                variant={theme === 'light' ? "#C3C3C3" : "#999999"}
                                style={{ backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999",
                                color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                                onClick={()=>{
                                    setIsOpenMessageForm(true);
                                    client.current.publish({
                                        destination: '/pub/chat/personalMessage',
                                        body: JSON.stringify({
                                            nickName: "system",
                                            message: ``,
                                        })
                                    });
                                }}><strong>답장하기</strong></Button>
                            <Button 
                                className='custom-button' 
                                variant='dark'
                                onClick={() => deletePersonalMessage({
                                    message_id: _message.messageId,
                                    caller: _message.caller,
                                    receiver: _message.receiver,
                                    message: _message.message
                                })}
                            >확인</Button>
                        </div>
                        
                        </ListGroupItem>
                    ))}
                    </ListGroup> 
                    <hr/>
                    <Button 
                        className='custom-button'
                        variant='dark' 
                        onClick={()=>setShowPMModal(false)} 
                        >닫기</Button>
                </Modal>
                <Container style={{minHeight:"100vh"}}>
                    <Container className={`border border-3 rounded-4 p-5`} style={{maxWidth:'850px'}}>
                        <Container style={{maxWidth:'750px'}}>
                            <Row>
                                <Col className={`border-3 rounded-4 p-5 d-flex justify-content-left align-items-center`}
                                style={{
                                    backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999", 
                                    height:"110px"}}>
                                    {/* Option Chaining!!! */}
                                    <h3 style={{color: theme === 'light' ? "#000000" : "#FFFFFF"}}>{roomInformation?.roomName}</h3> 
                                </Col>
                            </Row>
                        </Container>
                        <Container className={`border-3 rounded-4 p-5`}
                        style={{backgroundColor: theme === 'light' ? "#898989" : '#666666', maxWidth:'750px'}}>
                            <Row>
                                <Col 
                                    className={`border-${theme === 'light' ? '#898989' : '#666666'} border-1 rounded-1 p-4`}  
                                    sm={3}
                                    md={3}
                                    xl={3}
                                    lg={3} 
                                    ref={chatContainerRef}
                                    onScroll={handleScroll}
                                    style={{ 
                                        width:'60%', 
                                        height:'400px', 
                                        overflowY: 'scroll', 
                                        maxHeight: '400px',
                                        display: "flex",
                                        flexDirection: "column-reverse" }}>
                                    {chatList && chatList.length > 0 && (
                                    <ListGroup style={{marginBottom: '10px'}}>
                                        {chatList.map((_chatMessage) => {
                                            let fontcolor = "#000000";
                                            let color = "";
                                            let textAlign = "left";
                                            let itemClassName = "d-flex justify-content-start";
                                            if (_chatMessage.member.memberNickName === myInfo?.memberNickName) {
                                                color = theme === "light" ? "#C3C3C3" : "#999999";
                                                fontcolor = theme === "light" ? "#000000" : "#FFFFFF";
                                                itemClassName = "d-flex justify-content-start";
                                            } else if (_chatMessage.member.memberNickName === 'system') {
                                                color  = theme === 'light' ? '#000000' : "#333333";
                                                fontcolor = "#FFFFFF";
                                                itemClassName = "d-flex justify-content-center";

                                            } else{
                                                color = theme === 'light' ? '#FFFFFF' : '#121212';
                                                fontcolor = theme === 'light' ? "#000000" : "#FFFFFF";
                                                textAlign = "right";
                                                itemClassName = "d-flex justify-content-end";
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
                                                borderBottomRightRadius: "15px",
                                            };
                                            return (
                                                <Row>
                                                    <Col className={itemClassName}>
                                                        <ListGroupItem style={style}>
                                                            <strong>{_chatMessage.member.memberNickName}</strong>
                                                            <br></br>
                                                            <hr/>
                                                            {_chatMessage.message}
                                                        </ListGroupItem>
                                                    </Col>
                                                </Row>
                                            );
                                        })}
                                    </ListGroup>
                                    )}
                                    <br></br>
                                    {preChatList && preChatList.length > 0 && (
                                    <ListGroup style={{marginBottom: '10px' }}>
                                        {preChatList.slice(startIndex, endIndex).map((_chatMessage) => {
                                            let fontcolor = "#000000";
                                            let color = "";
                                            let textAlign = "left";
                                            let itemClassName = "d-flex justify-content-start";
                                            if (_chatMessage.member.memberNickName === myInfo?.memberNickName) {
                                                color = theme === "light" ? "#C3C3C3" : "#999999";
                                                fontcolor = theme === "light" ? "#000000" : "#FFFFFF";
                                                itemClassName = "d-flex justify-content-start";
                                            } else if (_chatMessage.member.memberNickName === 'system') {
                                                color  = theme === 'light' ? '#000000' : "#333333";
                                                fontcolor = "#FFFFFF";
                                                itemClassName = "d-flex justify-content-center";

                                            } else{
                                                color = theme === 'light' ? '#FFFFFF' : '#121212';
                                                fontcolor = theme === 'light' ? "#000000" : "#FFFFFF";
                                                textAlign = "right";
                                                itemClassName = "d-flex justify-content-end";
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
                                                borderBottomRightRadius: "15px",
                                            };
                                            return (
                                                <Row>
                                                    <Col className={itemClassName}>
                                                        <ListGroupItem style={style}>
                                                            <strong>{_chatMessage.member.memberNickName}</strong>
                                                            <br></br>
                                                            <hr/>
                                                            {_chatMessage.message}
                                                        </ListGroupItem>
                                                    </Col>
                                                </Row>
                                            );
                                        })}
                                    </ListGroup>
                                    )}
                                </Col>
                                <Col 
                                    className="border-1 rounded-4 p-4" 
                                    sm={1}
                                    md={1}
                                    xl={1}
                                    lg={1} 
                                    style={{ width:'40%', height:'400px', overflowY: 'auto', maxHeight: '400px', backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999" }}>
                                    <h5 style={{color: theme === 'light' ? '#000000' : '#FFFFFF'}}>참여명단</h5>
                                    <span 
                                        className='border rounded-pill d-flex align-items-center custom-ui' 
                                        style={{backgroundColor: theme === "light" ? "white": '#121212',
                                                color: theme === 'light' ? "#000000" : "#FFFFFF",
                                                marginBottom: '6px',
                                                display: 'inline-block',
                                                padding: '0.5rem 1rem'}}>
                                    {roomInformation?.roomManager === myInfo?.memberNickName && <img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img>}
                                    {myInfo?.memberNickName}</span>
                                    <hr/>
                                    {otherMember.map((_member) => (
                                        <ListGroup className='custom-ui' style={{ marginBottom: '6px'}}>
                                            {_member?.memberNickName !== myInfo?.memberNickName && (
                                                <ListGroupItem style={{ backgroundColor: theme === "light" ? '#FFFFFF' : '#121212',
                                                                        color: theme === "light" ? '#000000' : "#FFFFFF"}}>{_member?.memberNickName !== myInfo?.memberNickName && roomInformation.roomManager ===_member.memberNickName && 
                                                    <img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img>}
                                                    {_member?.memberNickName}
                                                    <div style={{width:"4px", display:"inline-block"}}/>
                                                    <Modal 
                                                        isOpen={isOpenMessageForm} 
                                                        onRequestClose={()=>setIsOpenMessageForm(false)}
                                                        style={{
                                                            content: {
                                                                backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                                                                width: '700px', // 원하는 너비로 설정
                                                                height: '300px', // 원하는 높이로 설정
                                                                borderTopLeftRadius: '25px',
                                                                borderBottomLeftRadius: '25px',
                                                                borderTopRightRadius: '25px',
                                                                borderBottomRightRadius: '25px',
                                                                position:'relative',
                                                                top: "70px"
                                                            }
                                                        }}>
                                                        <Form.Label style={{color: theme === 'light' ? "#000000" : "#FFFFFF"}}>
                                                            수신자: <strong>{_member?.memberNickName}</strong>
                                                        </Form.Label>
                                                        <hr/>
                                                        <Form.Control 
                                                            className='=custom-ui'
                                                            type="text" 
                                                            placeholder='메세지 내용을 입력하세요.'
                                                            value={personalMessage}
                                                            onChange={(e) => setPersonalMessage(e.target.value)}
                                                            style={{backgroundColor:theme === 'light' ? '#FFFFFF' : "#B9B9B9"}}>
                                                        </Form.Control>
                                                        <br></br>
                                                        <div className='d-flex flex-row gap-2'>
                                                            <Button 
                                                                className='custom-button'
                                                                variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                                                                style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                                                color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                                                                onClick={()=>{sendPersonalMessage({
                                                                    caller: myInfo?.memberNickName,
                                                                    receiver: _member?.memberNickName,
                                                                    message: personalMessage
                                                                });
                                                                setPersonalMessage("");}}
                                                                >보내기</Button>
                                                            <Button 
                                                                className='custom-button'
                                                                variant='dark' 
                                                                onClick={()=>setIsOpenMessageForm(false)} 
                                                                >닫기</Button>
                                                        </div>
                                                        
                                                    </Modal>
                                                    <Dropdown>
                                                        <Dropdown.Toggle
                                                        className='custom-button'
                                                        variant={theme === 'light' ? "#C3C3C3" : "#999999"}
                                                        style={{
                                                            backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999",
                                                            color: theme === 'light' ? "#000000" : "#FFFFFF"
                                                        }}
                                                        size="sm">
                                                            메뉴
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item>
                                                                <Button className="btn-sm custom-button"
                                                                    variant={theme === 'light' ? "#C3C3C3" : "#999999"} 
                                                                    onClick={()=>setIsOpenMessageForm(true)} style={{
                                                                        backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999",
                                                                        color: theme === 'light' ? "#000000" : "#FFFFFF"
                                                                    }}>쪽지 보내기</Button>
                                                            </Dropdown.Item>
                                                            <Dropdown.Item>
                                                                {role === "ROLE_MANAGER" && roomInformation.roomManager !==_member.memberNickName && (
                                                                <Button className="btn-sm custom-button"
                                                                    variant={theme === 'light' ? 'dark' : '#333333'} 
                                                                    onClick={() => ForcedExit(_member)} 
                                                                    style={{
                                                                        backgroundColor: theme === 'light' ? 'dark' : '#333333',
                                                                        color: '#FFFFFF',
                                                                    }}>강퇴하기</Button>
                                                                )}
                                                            </Dropdown.Item>
                                                            <Dropdown.Item>
                                                            {role === "ROLE_MANAGER" &&roomInformation.manager !==_member.memberNickName  && _member.memberNickName !== myInfo.memberNickName && (
                                                            <Button 
                                                                className="btn-sm custom-button" 
                                                                variant={theme === 'light' ? "#C3C3C3" : "#999999"} 
                                                                onClick={() => AuthMandate(_member)} style={{
                                                                    backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999",
                                                                    color: theme === 'light' ? "#000000" : "#FFFFFF"
                                                                }}>방장위임</Button>
                                                            )}
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </ListGroupItem>
                                            )}
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
                                        <InputGroup style={{width:"500px", height:"45px"}}>
                                            <Form.Control 
                                                className={`${theme === 'light' ? 'light-theme' : 'dark-theme'} custom-ui`}
                                                type="text" 
                                                value={chat} 
                                                placeholder='채팅 내용을 입력해 주세요.' 
                                                onChange={handleChange}
                                                onKeyDown={handleKeyDown}
                                                style={{backgroundColor: theme === 'light' ? "#FFFFFF" : '#121212',
                                                    color: theme === 'light' ? "#000000" : '#FFFFFF'}}/>            
                                        </InputGroup>
                                        <div style={{width:"7px", display:"inline-block"}}/>
                                        <Button className='btn-lg custom-button' 
                                        variant={theme === 'light' ? "#C3C3C3" : "#999999"}
                                        style={{  
                                            backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999",
                                            color: theme === 'light' ? '#000000' : '#FFFFFF'
                                        }} 
                                        onClick={() => publishChat(chat)}><strong>전송</strong></Button>          
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Container>
                        <br></br>
                        <FormGroup className="d-flex align-items-center justify-content-center gap-3">
                            <Button className='btn-lg custom-button' 
                                variant={theme === 'light' ? 'dark' : '#333333'}
                                style={{backgroundColor:theme === 'light' ? 'dark' : '#333333',
                                        color: "#FFFFFF"}}
                                onClick={ExitRoom}>나가기</Button>
                                <Button className='btn-lg custom-button'
                                    variant={theme === 'light' ? "#B9B9B9" : "#8C8C8C"}
                                    style={{  
                                        backgroundColor: theme === 'light' ? "#B9B9B9" : "#8C8C8C", 
                                        color: theme === 'light' ? '#000000' : '#FFFFFF'
                                    }} 
                                    onClick={()=>setShowPMModal(true)}>쪽지함</Button>
                                {role === "ROLE_MANAGER" && (
                                    <Button className='btn-lg custom-button'
                                    variant={theme === 'light' ? "#B9B9B9" : "#8C8C8C"}
                                    style={{  
                                        backgroundColor: theme === 'light' ? "#B9B9B9" : "#8C8C8C", 
                                        color: theme === 'light' ? '#000000' : '#FFFFFF'
                                    }} 
                                    onClick={()=>setShowChangeModal(true)}>설정 변경</Button>
                                )} 
                                {role === "ROLE_MANAGER" && (
                                    <Button className='btn-lg custom-button' 
                                    variant={theme === 'light' ? "#B9B9B9" : "#8C8C8C"}
                                    style={{  
                                        backgroundColor: theme === 'light' ? "#B9B9B9" : "#8C8C8C", 
                                        color: theme === 'light' ? '#000000' : '#FFFFFF'
                                    }} 
                                    onClick={()=>setShowInviteModal(true)}>초대하기</Button>
                                )}
                            <ChangRoomComponent room_Id={room_Id} stompClient={client.current} curParticipates={curParticipates}
                            showModal={showChangeModal} setShowModal={setShowChangeModal}/>
                            <InviteMemberComponent roomInfo = {roomInformation} showModal={showInviteModal} setShowModal={setShowInviteModal} myInfo={myInfo}
                            stompClient={client.current}/>
                        </FormGroup>
                    </Container>
                </Container>
            </Desktop>
            <Mobile>
                <Modal 
                    isOpen={showPMModal} 
                    onRequestClose={()=>setShowPMModal(false)}
                    style={{
                        content: {
                            backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                            width: '350px', // 원하는 너비로 설정
                            height: '600px', // 원하는 높이로 설정
                            borderTopLeftRadius: '25px',
                            borderBottomLeftRadius: '25px',
                            borderTopRightRadius: '25px',
                            borderBottomRightRadius: '25px',
                            position:'relative',
                            top: "70px"
                        }
                    }}>
                    <ListGroup className = 'custom-ui'>
                    {personalMessageList.map((_message) => (
                        <ListGroupItem
                            style={{backgroundColor:theme === 'light' ? '#8F8F8F' : '#6D6D6D',
                                    color:theme === 'light' ? '#000000' : '#FFFFFF'}}><strong>{_message.caller}</strong>
                        <hr/>{_message.message}
                        <hr/>
                        <div className='d-flex flex-row gap-2'>
                            <Button
                                className='custom-button'
                                variant={theme === 'light' ? "#C3C3C3" : "#999999"}
                                style={{ backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999",
                                color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                                onClick={()=>{
                                    setReceiver(_message.caller);
                                    setIsOpenMessageForm(true);
                                    client.current.publish({
                                        destination: '/pub/chat/personalMessage',
                                        body: JSON.stringify({
                                            nickName: "system",
                                            message: ``,
                                        })
                                    });
                                }}><strong>답장하기</strong></Button>
                            <Button 
                                className='custom-button' 
                                variant='dark'
                                onClick={() => deletePersonalMessage({
                                    message_id: _message.messageId,
                                    caller: _message.caller,
                                    receiver: _message.receiver,
                                    message: _message.message
                                })}
                            >확인</Button>
                        </div>
                        
                        </ListGroupItem>
                    ))}
                    </ListGroup> 
                    <hr/>
                    <Button 
                        className='custom-button'
                        variant='dark' 
                        onClick={()=>setShowPMModal(false)} 
                        >닫기</Button>
                </Modal>
            <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas}>
                <OffcanvasBody style={{backgroundColor: theme === 'light' ? "#FFFFFF" : "#121212"}}>
                    <Accordion defaultActiveKey="0">
                        <Accordion.Header>참여명단</Accordion.Header>
                            <Accordion.Body>
                                <Col 
                                    className="border-1 rounded-4 p-4" 
                                    sm={1}
                                    md={1}
                                    xl={1}
                                    lg={1} 
                                    style={{ width:'100%', 
                                            height:'400px',
                                            overflowY: 'auto', 
                                            maxHeight: '400px', 
                                            backgroundColor:theme === 'light' ? "#C3C3C3" : '#999999' }}>
                                    <span className='border rounded-pill d-flex align-items-center custom-ui' 
                                    style={{backgroundColor: theme === 'light' ? "white" : "black",
                                            color: theme === 'light' ? 'black' : 'white',
                                            marginBottom: '6px',
                                            display: 'inline-block',
                                            padding: '0.5rem 1rem'}}>
                                    {roomInformation?.roomManager === myInfo?.memberNickName && <img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img>}
                                    {myInfo?.memberNickName}</span>
                                    <hr/>
                                    {otherMember.map((_member) => (
                                        <ListGroup className='custom-ui' style={{ marginBottom: '6px' }}>
                                            {_member?.memberNickName !== myInfo?.memberNickName && (
                                                <ListGroupItem style={{ backgroundColor: theme === "light" ? '#FFFFFF' : '#121212',
                                                                         color: theme === "light" ? '#000000' : "#FFFFFF"}}>
                                                    {_member?.memberNickName !== myInfo?.memberNickName && roomInformation.roomManager ===_member.memberNickName && 
                                                    <img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img>}
                                                    {_member?.memberNickName}
                                                    <div style={{width:"4px", display:"inline-block"}}/>
                                                    <Dropdown>
                                                        <Dropdown.Toggle
                                                        className='custom-button'
                                                        variant={theme === 'light' ? "#C3C3C3" : "#999999"} 
                                                        style={{
                                                            backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999",
                                                            color: theme === 'light' ? "#000000" : "#FFFFFF"
                                                        }}
                                                        size="sm">
                                                            메뉴
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item style={{}}>
                                                                <Button className="btn-sm custom-button"
                                                                    variant={theme === 'light' ? "#C3C3C3" : "#999999"} 
                                                                    onClick={()=>{
                                                                        setReceiver(_member?.memberNickName);
                                                                        setShowOffcanvas(false);
                                                                        setIsOpenMessageForm(true)
                                                                    }} style={{
                                                                        backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999",
                                                                        color: theme === 'light' ? "#000000" : "#FFFFFF"
                                                                    }}>쪽지 보내기</Button>
                                                            </Dropdown.Item>
                                                            <Dropdown.Item>
                                                                {role === "ROLE_MANAGER" && roomInformation.roomManager !==_member.memberNickName && (
                                                                <Button className="btn-sm custom-button"
                                                                    variant={theme === 'light' ? 'dark' : '#333333'} 
                                                                    onClick={() => ForcedExit(_member)} 
                                                                    style={{
                                                                        backgroundColor: theme === 'light' ? 'dark' : '#333333',
                                                                        color: '#FFFFFF',
                                                                        width:"75px",
                                                                    }}>강퇴하기</Button>
                                                                )}
                                                            </Dropdown.Item>
                                                            <Dropdown.Item>
                                                            {role === "ROLE_MANAGER" &&roomInformation.manager !==_member.memberNickName  && _member.memberNickName !== myInfo.memberNickName && (
                                                            <Button 
                                                                className="btn-sm custom-button" 
                                                                variant={theme === 'light' ? "#C3C3C3" : "#999999"} 
                                                                onClick={() => AuthMandate(_member)} style={{
                                                                    backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999",
                                                                    color: theme === 'light' ? "#000000" : "#FFFFFF"
                                                                }}>방장위임</Button>
                                                            )}
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </ListGroupItem>
                                            )}
                                        </ListGroup>
                                    ))}
                                </Col>
                            </Accordion.Body>
                        </Accordion>
                        <hr/>
                        <FormGroup className="d-flex align-items-center justify-content-center gap-3">
                            <div className='d-grid gap-2'>
                                <Button
                                className='btn-sm custom-button'
                                variant={theme === 'light' ? 'dark' : '#333333'}
                                style={{ backgroundColor:theme === 'light' ? 'dark' : '#333333',
                                        color:"#FFFFFF",
                                        width:"300px" }} onClick={ExitRoom}>나가기</Button>
                                <Button className='btn-sm custom-button'
                                    variant={theme === 'light' ? "#B9B9B9" : "#8C8C8C"}
                                    style={{  
                                        backgroundColor: theme === 'light' ? "#B9B9B9" : "#8C8C8C", 
                                        color: theme === 'light' ? '#000000' : '#FFFFFF'
                                    }} 
                                    onClick={()=>{
                                        setShowOffcanvas(false);
                                        setShowPMModal(true)
                                    }}>쪽지함</Button>
                                <hr/>
                                {role === "ROLE_MANAGER" && (
                                    <div className="d-grid">
                                        <Button 
                                        className='btn-sm custom-button'
                                        variant={theme === 'light' ? "#B9B9B9" : "#8C8C8C"} 
                                        style={{backgroundColor: theme === 'light' ? "#B9B9B9" : "#8C8C8C",
                                                color: theme === 'light' ? "#000000" : "#FFFFFF",
                                                width: "100%"}} 
                                        onClick={()=>{
                                            setShowOffcanvas(false);
                                            setShowChangeModal(true);
                                        }}>설정 변경</Button>
                                    </div>
                                )} 
                                {role === "ROLE_MANAGER" && (
                                    <div className="d-grid">
                                        <Button className='btn-sm custom-button'
                                        variant={theme === 'light' ? "#B9B9B9" : "#8C8C8C"} 
                                        style={{backgroundColor: theme === 'light' ? "#B9B9B9" : "#8C8C8C",
                                                color: theme === 'light' ? "#000000" : "#FFFFFF",
                                                width: "100%"}} 
                                        onClick={()=>{
                                            setShowOffcanvas(false);
                                            setShowInviteModal(true);
                                        }}>초대하기</Button>
                                    </div>
                                )}
                                
                            </div>
                        </FormGroup>
                        <hr/>
                        <Button
                        className='btn-sm custom-button' 
                        variant={theme === 'light' ? "#C3C3C3" : "#999999"}
                        style={{ backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999",
                                 color: theme === 'light' ? "#000000" : '#FFFFFF'}}
                        onClick={handleCloseOffcanvas}>
                            닫기
                        </Button>
                    </OffcanvasBody>
                </Offcanvas>
                <Modal 
                    isOpen={isOpenMessageForm} 
                    onRequestClose={()=>setIsOpenMessageForm(false)}
                    style={{
                        content: {
                            backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                            width: '400px', // 원하는 너비로 설정
                            height: '300px', // 원하는 높이로 설정
                            borderTopLeftRadius: '25px',
                            borderBottomLeftRadius: '25px',
                            borderTopRightRadius: '25px',
                            borderBottomRightRadius: '25px',
                            position:'relative',
                            top: "70px"
                        }
                    }}>
                    <Form.Label style={{color: theme === 'light' ? "#000000" : "#FFFFFF"}}>
                        수신자: <strong>{receiver}</strong>
                    </Form.Label>
                    <hr/>
                    <Form.Control 
                        className='=custom-ui'
                        type="text" 
                        placeholder='메세지 내용을 입력하세요.'
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        style={{backgroundColor:theme === 'light' ? '#FFFFFF' : "#B9B9B9"}}>
                    </Form.Control>
                    <br></br>
                    <div className='d-flex flex-row gap-2'>
                        <Button 
                            className='custom-button'
                            variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                            style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                            color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                            onClick={()=>{sendPersonalMessage({
                                caller: myInfo?.memberNickName,
                                receiver: receiver,
                                message: personalMessage
                            })
                            setPersonalMessage("");}} 
                            >보내기</Button>
                        <Button 
                            className='custom-button'
                            variant='dark' 
                            onClick={()=>setIsOpenMessageForm(false)} 
                        >닫기</Button>
                    </div>
                </Modal>
                <InviteMemberComponent roomInfo = {roomInformation} showModal={showInviteModal} setShowModal={setShowInviteModal} myInfo={myInfo}
                stompClient={client.current}/>
                <ChangRoomComponent room_Id={room_Id} stompClient={client.current} curParticipates={curParticipates}
                                    showModal={showChangeModal} setShowModal={setShowChangeModal}/>
                <Container style={{maxWidth:'767px'}}>
                    <Row>
                        <Col 
                            className="d-flex justify-content-between align-items-center"
                            style={{backgroundColor: theme === 'light' ? "#C3C3C3" : "#999999", height:"60px"}}>
                            {/* Option Chaining!!! */}
                            <h3 style={{color: theme === 'light' ? "#000000" : "#FFFFFF"}}>{roomInformation?.roomName}</h3> 
                            <Button
                            className='custom-button'
                            variant={theme === 'light' ? "#898989" : "#666666"}
                            style={{ backgroundColor: theme === 'light' ? "#898989" : "#666666" }}
                            onClick={handleShowOffcanvas}>
                            설정
                            </Button>
                        </Col>
                    </Row>
                </Container>
                <Container
                style={{backgroundColor:theme === 'light' ? "#898989" : "#666666", maxWidth:'767px'}}>
                    <Row>
                        <Col 
                            className="border-#898989 border-1 rounded-1 p-4"  
                            sm={12}
                            md={6}
                            xl={6}
                            lg={6} 
                            ref={chatContainerRefM}
                            onScroll={handleScrollM}
                            style={{ 
                                width:'100%',
                                height: "calc(var(--vh, 1vh) * 65)",
                                overflowY: 'scroll', 
                                display: "flex",
                                flexDirection: "column-reverse" }}>
                            {chatList && chatList.length > 0 && (
                            <ListGroup style={{marginBottom: '10px'}}>
                                {chatList.map((_chatMessage) => {
                                    let fontcolor = "#000000";
                                    let color = "";
                                    let textAlign = "left";
                                    let itemClassName = "d-flex justify-content-start";
                                    if (_chatMessage.member.memberNickName === myInfo?.memberNickName) {
                                        color = theme === "light" ? "#C3C3C3" : "#999999";
                                        fontcolor = theme === "light" ? "#000000" : "#FFFFFF";
                                        itemClassName = "d-flex justify-content-start";
                                    } else if (_chatMessage.member.memberNickName === 'system') {
                                        color  = theme === 'light' ? '#000000' : "#333333";
                                        fontcolor = "#FFFFFF";
                                        itemClassName = "d-flex justify-content-center";

                                    } else{
                                        color = theme === 'light' ? '#FFFFFF' : '#121212';
                                        fontcolor = theme === 'light' ? "#000000" : "#FFFFFF";
                                        textAlign = "right";
                                        itemClassName = "d-flex justify-content-end";
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
                                        borderBottomRightRadius: "15px",
                                    };
                                    return (
                                        <Row>
                                            <Col className={itemClassName}>
                                                <ListGroupItem style={style}>
                                                    <strong>{_chatMessage.member.memberNickName}</strong>
                                                    <br></br>
                                                    <hr/>
                                                    {_chatMessage.message}
                                                </ListGroupItem>
                                            </Col>
                                        </Row>
                                    );
                                })}
                            </ListGroup>
                            )}
                            <br></br>
                            {preChatList && preChatList.length > 0 && (
                            <ListGroup style={{marginBottom: '10px' }}>
                                {preChatList.slice(startIndex, endIndex).map((_chatMessage) => {
                                    let fontcolor = "#000000";
                                    let color = "";
                                    let textAlign = "left";
                                    let itemClassName = "d-flex justify-content-start";
                                    if (_chatMessage.member.memberNickName === myInfo?.memberNickName) {
                                        color = theme === "light" ? "#C3C3C3" : "#999999";
                                        fontcolor = theme === "light" ? "#000000" : "#FFFFFF";
                                        itemClassName = "d-flex justify-content-start";
                                    } else if (_chatMessage.member.memberNickName === 'system') {
                                        color  = theme === 'light' ? '#000000' : "#333333";
                                        fontcolor = "#FFFFFF";
                                        itemClassName = "d-flex justify-content-center";

                                    } else{
                                        color = theme === 'light' ? '#FFFFFF' : '#121212';
                                        fontcolor = theme === 'light' ? "#000000" : "#FFFFFF";
                                        textAlign = "right";
                                        itemClassName = "d-flex justify-content-end";
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
                                        borderBottomRightRadius: "15px",
                                    };
                                    return (
                                        <Row>
                                            <Col className={itemClassName}>
                                                <ListGroupItem style={style}>
                                                    <strong>{_chatMessage.member.memberNickName}</strong>
                                                    <br></br>
                                                    <hr/>
                                                    {_chatMessage.message}
                                                </ListGroupItem>
                                            </Col>
                                        </Row>
                                    );
                                })}
                            </ListGroup>
                            )}
                        </Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col>
                            <FormGroup 
                                className="d-flex align-items-center justify-content-center"
                                onSubmit={(event)=>handleSubmit(event)}>
                                <InputGroup style={{width:"500px", height:"45px"}}>
                                    <Form.Control
                                        className={`${theme === 'light' ? 'light-theme' : 'dark-theme'} custom-ui`}
                                        type="text" 
                                        value={chat} 
                                        placeholder='채팅 내용을 입력해 주세요.' 
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        style={{backgroundColor: theme === 'light' ? "#FFFFFF" : '#121212',
                                                color: theme === 'light' ? "#000000" : '#FFFFFF'}} />      
                                    <Button 
                                        className='custom-button'
                                        variant={theme === 'light' ? "#C3C3C3" : '#999999'}
                                        style={{backgroundColor: theme === 'light' ? "#C3C3C3" : '#999999',
                                                color: theme === 'light' ? "#000000" : "#FFFFFF",
                                               }} 
                                    onClick={() => publishChat(chat)}><strong>전송</strong></Button>      
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    </Row>
                    <br></br>
                </Container>
                <br></br>
            </Mobile>
        </div>
    );
}

export default RoomComponent;