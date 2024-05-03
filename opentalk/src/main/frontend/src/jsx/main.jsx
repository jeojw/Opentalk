import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SetRoomComponent from './setroom';
import ProfileComponent from './profile';
import { Container, Row, Col, Button, Form, FormControl, InputGroup, ListGroup, ListGroupItem, FormGroup, Offcanvas, OffcanvasBody } from 'react-bootstrap';
import Modal from 'react-modal';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Pagination from "react-bootstrap/Pagination";
import * as StompJs from "@stomp/stompjs";
import SockJs from "sockjs-client"
import { format } from 'date-fns'
import { useMediaQuery } from 'react-responsive';
import { themeContext } from './themeContext';
import '../css/CustomPagination.css'
import PersonalMessageComponent from './personalMessage';

const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 768 })
    return isDesktop ? children : null
}
const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })
    return isMobile ? children : null
}

const MainComponent = () => {
    const {theme} = useContext(themeContext);
    const client = useRef({});

    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

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
                        client.current.subscribe(`/sub/chat/deleteRoom`, ({body}) => {
                            if (JSON.parse(body).nickName === "system"){
                                queryClient.invalidateQueries("allChatRooms");
                            }
                        });
                        client.current.subscribe(`/sub/chat/createRoom`, ({body}) => {
                            if (JSON.parse(body).nickName === "system"){
                                queryClient.invalidateQueries("allChatRooms");
                            }
                        });
                        client.current.subscribe(`/sub/chat/changeNickName`, ({body}) => {
                            if (JSON.parse(body).nickName === "system"){
                                queryClient.invalidateQueries("allChatRooms");
                            }
                        });
                        client.current.subscribe(`/sub/chat/authMandateResponse`, ({body}) => {
                            if (JSON.parse(body).nickName === "system"){
                                queryClient.invalidateQueries("allChatRooms");
                            }
                        });
                        client.current.subscribe(`/sub/chat/personalMessage`, ({body}) => {
                            if (JSON.parse(body).nickName === "system"){
                                queryClient.invalidateQueries("allPersonalMessages");
                            }
                        });
                    },
                    onStompError: (frame) => {
                        console.error(frame);
                    }
                });
                await client.current.activate();
            } catch (error) {
                console.error("Error connecting to WebSocket:", error);
            }
        };
        const disconnect = () => {
            client.current.deactivate();
        };
        connect();
        return ()=>disconnect();
    }, []);

    const ChatRoomRole = {
        PARTICIPATE: 'ROLE_PARTICIPATE',
        MANAGER: 'ROLE_MANAGER'
    };

    const menuList = [
        {value: "title", name: "제목"},
        {value: "manager", name: "방장"},
        {value: "tags", name: "태그"},
    ];

    const [allChatRoomList, setAllChatRoomList] = useState([]);

    const [chatRoomList, setChatRoomList] = useState([]);
    const [page, setPage] = useState(1);
    const [isSearch, setIsSearch] = useState(false);

    const postPerPage = 3;
    const indexOfLastPost = page * postPerPage;
    const indexOfFirstPost= indexOfLastPost - postPerPage;

    const [pageLength , setPageLength] = useState(0);

    const [isInviteMessageBoxOpen, setIsInviteMessageBoxOpen] = useState(false);
    const [isPersonalMessageBoxOpen, setIsPersonalMessageBoxOpen] = useState(false);
    const [searchMemberModalOpen, setSearchMemberModalOpen] = useState(false);
    const [showPersonalMessageForm, setShowPersonalMessageForm] = useState(false);

    const [inviteMessageList, setInviteMessageList] = useState([]);
    const [personalMessageList, setPersonalMessageList] = useState([]);

    const [show, setShow] = useState(false);

    const handleShow = (e) => {
        setShow(true);
    }

    const handleClose = (e) => {
        setShow(false);
    }

    const handlePageChange = (page)=>{
        if (page >= 1 && page <= Math.ceil(pageLength / 3))
            setPage(page);
    }

    const [member, setMember] = useState();
    const [role, setRole] = useState();
    
    const [selectManu, setSelectManu] = useState("default");
    const [searchKeyword, setSearchKeyword] = useState("");
    const navigate = useNavigate();

    const [curImgUrl, setCurImgUrl] = useState(null);

    const [isReissue, setIsReissue] = useState(false);

    const queryClient = useQueryClient();

    const { data: allChatRooms, isLoading: roomIsLoading, isError: roomIsError, isFetching: roomIsFetching, isFetched: roomIsFetched } = useQuery({
        queryKey:['allChatRooms'],
        queryFn: async () => {
            try{
                const roomResponse = await axios.get("/api/opentalk/rooms");
                return roomResponse.data;
            } catch(error){
                console.log(error);
            }
        },
        cacheTime: 30000,
        staleTime: 5000,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    })

    useEffect(() => {
        if (allChatRooms && !roomIsLoading && !roomIsError && !roomIsFetching && roomIsFetched) {
            setAllChatRoomList(allChatRooms);
            setPageLength(allChatRooms.length);
        }
    }, [allChatRooms, roomIsLoading, roomIsError, roomIsFetching, roomIsFetched]);

    const { data: allPersonalMessages, isLoading: PMIsLoading, isError: PMIsError, isFetching: PMIsFetching, isFetched: PMIsFetched } = useQuery({
        queryKey:['allPersonalMessages'],
        queryFn: async () =>{
            try{
                const messageResponse = await axios.get(`/api/opentalk/member/allPersonalMessages/${member?.memberNickName}`);
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
    }, [member?.memberNickName])

    useEffect(() =>{
        if (allPersonalMessages && !PMIsLoading && !PMIsError && !PMIsFetching && PMIsFetched){
            setPersonalMessageList(allPersonalMessages);
        }
    }, [allPersonalMessages, PMIsLoading, PMIsError, PMIsFetching, PMIsFetched])

    const { data: allInvitelMessages, isLoading: IMIsLoading, isError: IMIsError, isFetching: IMIsFetching, isFetched: IMIsFetched } = useQuery({
        queryKey:['allInviteMessages'],
        queryFn: async () =>{
            try{
                const messageResponse = await axios.get(`/api/opentalk/member/allInviteMessages/${member?.memberNickName}`);
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
    }, [member?.memberNickName])

    useEffect(() => {
        if (allInvitelMessages && !IMIsLoading && !IMIsError && !IMIsFetching && IMIsFetched){
            setInviteMessageList(allInvitelMessages);
        }
    }, [allInvitelMessages, IMIsLoading, IMIsError, IMIsFetching, IMIsFetched])

    const { mutate: mutateDeleteRoom } = useMutation(async ({roomInfo}) => {
        if (window.confirm("방을 삭제하시겠습니까?")){
            const deleteUrl = "/api/opentalk/deleteRoom";
            const data = new FormData();
            data.append("room_id", roomInfo.roomId);

            try {
                const res = await axios.post(deleteUrl, data);
                if (res.data === "Success") {
                    window.alert("방이 삭제되었습니다.");
                    
                    client.current.publish({destination: "/pub/chat/deleteRoom", body: JSON.stringify({
                        nickName: "system",
                        message: `방이 삭제되었습니다.`,
                    })});
                } else {
                    window.alert("아직 방에 인원이 남아있습니다.");
                }
            } catch (error) {
                console.log(error);
            }
        }
    }, {
        onSuccess: () =>{
            queryClient.invalidateQueries("allChatRooms");
        }
    });

    const {mutate: mutateChangRoom} = useMutation(async ({roomInfo}) =>{
        client.current.subscribe(`/sub/chat/${roomInfo.roomId}`, ({body}) => {
            if (JSON.parse(body).member.memberNickName === "system"){
                queryClient.invalidateQueries("allChatRooms");
            }
        });
    })

    const { mutate: mutateEnterRoom } = useMutation(async ({roomInfo}) => {
        if (!localStorage.getItem("token")){
            window.alert("이미 로그아웃 되었습니다.");
            navigate("/opentalk/login");
        }
        else{
            const enterUrl = '/api/opentalk/enterRoom';
            let currentRole;
            if (roomInfo.manager === member.memberNickName){
                currentRole = ChatRoomRole.MANAGER;
            }
            else{
                currentRole = ChatRoomRole.PARTICIPATE;
            }
            setRole(currentRole);
            if (!roomInfo.existLock){
                try{
                    const res = await axios.post(enterUrl, {
                        chatroom: roomInfo, 
                        member: member,
                        role:role
                    });
                    if (res.data === "Success"){
                        client.current.subscribe(`/sub/chat/${roomInfo.roomId}`, ({body}) => {
                            if (JSON.parse(body).member.memberNickName === "system"){
                                queryClient.invalidateQueries("allChatRooms");
                            }
                        });
                        const curTime = new Date();
                        const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60 * 1000);
                        const kr_Time = new Date(utc + (KR_TIME_DIFF));

                        client.current.publish({destination: "/pub/chat/enter", body: JSON.stringify({
                            chatRoom: roomInfo,
                            member: {
                                memberId:"system",
                                memberNickName:"system"
                            },
                            message: `${member?.memberNickName}님이 채팅방에 입장했습니다.`,
                            timeStamp: format(kr_Time, "yyyy-MM-dd-HH:mm")
                        })});

                        client.current.publish({destination: "/pub/chat/enterRoomResponse", body: JSON.stringify({
                            nickName: "system",
                            message: ""
                        })});

                        navigate(`/opentalk/room/${roomInfo.roomId}`);
                    }
                    else{
                        window.alert("인원수가 가득 차 방에 입장할 수 없습니다!");
                        
                    }
                } catch(error){
                    console.log(error);
                }
            }
            else{
                const inputPassword = window.prompt("비밀번호를 입력해주세요.");
                
                if (inputPassword === ""){
                    window.alert("비밀번호를 입력해주세요.")
                }else{
                    try{
                        const res = await axios.post(enterUrl + `/${inputPassword}`, {
                            chatroom: roomInfo, 
                            member: member,
                            role:role
                        });
                        if (res.data === "Success"){
                            client.current.subscribe(`/sub/chat/${roomInfo.roomId}`, ({body}) => {
                                if (JSON.parse(body).member.memberNickName === "system"){
                                    queryClient.invalidateQueries("allChatRooms");
                                }
                            });

                            const curTime = new Date();
                            const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60 * 1000);
                            const kr_Time = new Date(utc + (KR_TIME_DIFF));

                            client.current.publish({destination: "/pub/chat/enter", body: JSON.stringify({
                                chatRoom: roomInfo,
                                member: {
                                    memberId:"system",
                                    memberNickName:"system"
                                },
                                message: `${member?.memberNickName}님이 채팅방에 입장했습니다.`,
                                timeStamp: format(kr_Time, "yyyy-MM-dd-HH:mm")
                            })});
                            client.current.publish({destination: "/pub/chat/enterRoomResponse", body: JSON.stringify({
                                nickName: "system",
                                message: ""
                            })});
    
                            navigate(`/opentalk/room/${roomInfo.roomId}`);
                        }
                        else if (res.data ==="Incorrect"){
                            window.alert("비밀번호가 잘못되었습니다.")
                        }
                        else{
                            window.alert("인원수가 가득 차 방에 입장할 수 없습니다!");
                        } 
                    } catch(error){
                        console.log(error);
                    }
                }
            }
        }
        
    }, {
        onSuccess:() => {
            queryClient.invalidateQueries("allChatRooms");
        }
    });

    const { mutate: mutateEnterInviteRoom } = useMutation(async ({message}) => {
        if (window.confirm("입장하시겠습니까?")){
            if (!localStorage.getItem("token")){
                window.alert("이미 로그아웃 되었습니다.");
                navigate("/opentalk/login");
            }
            else{
                try{
                    const findRoom = '/api/opentalk/oneRoom';
                    const data = new FormData();
                    data.append("roomId", message.roomId);
                    const roomRes = await axios.post(findRoom, data);
                    if (roomRes.status === 200){
                        try{
                            let currentRole;
                            const enterUrl = '/api/opentalk/enterInvitedRoom';
                            currentRole = ChatRoomRole.PARTICIPATE;
                            setRole(currentRole);
                            
                            const res = await axios.post(enterUrl, message);
                            
                            if (res.data === "Success"){
                                client.current.subscribe(`/sub/chat/${message.roomId}`, ({body}) => {
                                    if (JSON.parse(body).member.memberNickName === "system"){
                                        queryClient.invalidateQueries("allChatRooms");
                                    }
                                });
                                const curTime = new Date();
                                const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60 * 1000);
                                const kr_Time = new Date(utc + (KR_TIME_DIFF));
        
                                client.current.publish({destination: "/pub/chat/enter", body: JSON.stringify({
                                    chatRoom: roomRes.data,
                                    member: {
                                        memberId:"system",
                                        memberNickName:"system"
                                    },
                                    message: `${member?.memberNickName}님이 채팅방에 입장했습니다.`,
                                    timeStamp: format(kr_Time, "yyyy-MM-dd-HH:mm")
                                })});
        
                                client.current.publish({destination: "/pub/chat/enterRoomResponse", body: JSON.stringify({
                                    nickName: "system",
                                    message: ""
                                })})
        
                                navigate(`/opentalk/room/${message.roomId}`);
                            }
                            else{
                                window.alert("인원수가 가득 차 방에 입장할 수 없습니다!");
                            }
                        } catch(error){
                            console.log(error);
                        }
                    }
                } catch(error){
                    console.log(error);
                }
                
            }
        }
    }, {
        onSuccess:() => {
            queryClient.invalidateQueries("allChatRooms");
        }
    });

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
                    window.alert("다시 로그인하여 주십시오.")
                    localStorage.removeItem('token');
                    navigate("/opentalk/login");
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

    useEffect(() => {
        const fetchMyInfo = async () => {
            if (localStorage.getItem("token")){
                await axios.get('/api/opentalk/member/me', {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                    }
                }).then((res) => {
                    if (res.status === 200){
                        setCurImgUrl(res.data.imgUrl);
                        setMember(res.data);
                    }
                }).catch((error) => console.log(error));
            }
            else{
                navigate("/");
            }
        }    
        fetchMyInfo();
    }, []);


    useEffect(() => {
        setChatRoomList(allChatRoomList.slice(indexOfFirstPost, indexOfLastPost))
    }, [allChatRoomList, page, indexOfFirstPost, indexOfLastPost]);

    const GetInputSearchKeyword = (event) => {
        setSearchKeyword(event.target.value);
    }

    const selectMenuHandle = (event) => {
        setSelectManu(event.target.value);
    }
    const search = () => {
        if (searchKeyword.length <= 0){
            window.alert("한글자 이상의 검색어를 입력해주세요.")
        }
        else{
            setIsSearch(true);
            axios.post("/api/opentalk/searchRooms", {
                type:selectManu,
                keyword:searchKeyword
            })
            .then((res) => {
                setChatRoomList(res.data.slice(indexOfFirstPost, indexOfLastPost));
                setPageLength(res.data.length);
            })
            .catch((error) => console.log(error));
        }
    }

    const initSearch = () => {
        setChatRoomList(allChatRoomList.slice(indexOfFirstPost, indexOfLastPost));
        setPageLength(allChatRoomList.length);
        setIsSearch(false);
    }

    const deleteRoom = ({roomInfo}) => {
        mutateDeleteRoom({roomInfo});
    }

    const EnterRoom = ({roomInfo}) => {
        mutateEnterRoom({roomInfo});
    }

    const EnterInvitedRoom = ({message}) => {
        mutateEnterInviteRoom({message:message});
    }

    const ChangRoom = ({roomInfo}) => {
        mutateChangRoom({roomInfo});
    }

    const DeleteInviteMessage = ({inviteId}) => {
        const deleteUrl = '/api/opentalk/member/deleteMessage';
        const data = new FormData();
        data.append("inviteId", inviteId);
        console.log(inviteId);
        axios.post(deleteUrl, data)
        .then((res) =>{
            if (res.status === 200){
                queryClient.invalidateQueries("allInviteMessages")
            }
            
        })
        .catch((error) => console.log(error));
    }

    const GoProfile = () => {
        if (localStorage.getItem("token")){
            navigate("/opentalk/profile");
        }
        else{
            window.alert("이미 로그아웃 되었습니다.");
            navigate("/opentalk/login");
        }
        return (
            <ProfileComponent />
        );
    }

    const LogOut = () => {
        if (localStorage.getItem("token")){
            axios.post("/api/opentalk/auth/logout", {}, {
                headers: { 
                    Authorization: localStorage.getItem("token"),
                }
            })
            .then((res) => {
                if (res.status === 200){
                    localStorage.removeItem("token");
                    navigate("/opentalk");
                }
            })
            .catch((error) => console.log(error));
        }
        else{
            alert("이미 로그아웃되었습니다.");
            navigate("/opentalk");
        }
        
    };

    const openInviteMessageBox = () => {
        setShow(false);
        setIsInviteMessageBoxOpen(true);
    }

    const openPersonalMessageBox = () => {
        setShow(false);
        setIsPersonalMessageBoxOpen(true);
    }

    const renderPaginationItems = () => {
        const paginationItems = [];
    
        for (let i = 1; i <= Math.ceil(pageLength / 3); i++) {
          paginationItems.push(
            <Pagination.Item key={i} active={i === page} onClick={() => handlePageChange(i)}>
              {i}
            </Pagination.Item>
          );
        }
    
        return paginationItems;
    };

    const deletePersonalMessage = async ({message_id, caller, receiver, message}) =>{
        const deleteUrl = '/api/opentalk/room/deletePersonalMessage';
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

   return (
    <div>
        <Desktop>
            <Container style={{minHeight:"100vh"}}>
                <Modal isOpen={isInviteMessageBoxOpen} onRequestClose={() => setIsInviteMessageBoxOpen(false)} style={{
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
                    {inviteMessageList.map((_message) => (
                        <ListGroupItem
                            style={{backgroundColor:theme === 'light' ? '#8F8F8F' : '#6D6D6D',
                                    color:theme === 'light' ? '#000000' : '#FFFFFF'}}><strong>{_message.roomName}</strong>
                        <hr/><img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img> <strong>{_message.inviter}</strong>
                        <hr/>{_message.message}
                        <hr/>
                        <Button
                            className='custom-button'
                            variant="#8F8F8F" 
                            style={{ backgroundColor:theme === 'light' ? '#B6B6B6' : '#8D8D8D', 
                                     color:theme === 'light' ? '#000000' : '#FFFFFF'}} 
                                onClick={()=> EnterInvitedRoom({message:_message})}><strong>입장하기</strong></Button>
                        <div style={{width:"4px", display:"inline-block"}}/>
                        <Button className='custom-button' variant='dark' 
                                onClick={()=> DeleteInviteMessage({inviteId:_message.inviteId})}>메세지 지우기</Button>
                        
                        
                        </ListGroupItem>
                    ))}
                    </ListGroup> 
                    <hr/>
                    <Button 
                        className='custom-button'
                        variant='dark' 
                        onClick={()=>setIsInviteMessageBoxOpen(false)} 
                        >닫기</Button>
                </Modal>
                <Modal isOpen={isPersonalMessageBoxOpen} onRequestClose={() => setIsPersonalMessageBoxOpen(false)} style={{
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
                        <Button
                            className='custom-button'
                            variant="#8F8F8F" 
                            style={{ backgroundColor:theme === 'light' ? '#B6B6B6' : '#8D8D8D', 
                                    color:theme === 'light' ? '#000000' : '#FFFFFF'}} 
                            onClick={()=>{
                                setShowPersonalMessageForm(true);
                                client.current.publish({
                                    destination: '/pub/chat/personalMessage',
                                    body: JSON.stringify({
                                        nickName: "system",
                                        message: ``,
                                    })
                                });
                            }}
                                ><strong>답장하기</strong></Button>
                        <div style={{width:"4px", display:"inline-block"}}/>
                        <Button className='custom-button' variant='dark' 
                                onClick={()=> deletePersonalMessage({message_id: _message.messageId, 
                                                                    caller: _message.caller,
                                                                    receiver: _message.receiver,
                                                                    message: _message.message})}>확인</Button>
                        
                        
                        </ListGroupItem>
                    ))}
                    </ListGroup> 
                    <hr/>
                    <div className='d-flex flex-row gap-2'>
                        <Button 
                            className='custom-button'
                            variant={theme === 'light' ? '#CDCDCD' : '#A0A0A0'}
                            style={{backgroundColor: theme === 'light' ? '#CDCDCD' : '#A0A0A0'}} 
                            onClick={()=>{
                                setIsPersonalMessageBoxOpen(false)
                                setSearchMemberModalOpen(true);
                            }} 
                        >쪽지 보내기</Button>
                        <Button 
                            className='custom-button'
                            variant='dark' 
                            onClick={()=>setIsPersonalMessageBoxOpen(false)} 
                        >닫기</Button>
                    </div>
                </Modal>
                <Row className="justify-content-end">
                    <Col xs={3} md={9} span={12} offset={12} lg="5" className="border-3 rounded-4 p-5"
                    style={{
                        backgroundColor: theme === 'light' ? "#7B7B7B" : "#595959",
                        width:"30%", height: "975px"
                        }}>
                        <aside>
                            <div style={{ textAlign: 'center' }}>
                                <img alt="프로필 이미지" 
                                    src={curImgUrl} 
                                    style={{width:'70%', 
                                    height:'70%',
                                    backgroundPosition:"center",
                                    borderRadius: "50%"}}></img>
                                <p style={{color:"white"}}>환영합니다</p>
                                <h4 style={{color:"white"}}>
                                    <strong>    
                                        {member?.memberNickName}님
                                    </strong>
                                </h4>
                                <hr/>
                            </div>
                            <div className="d-grid gap-4">
                                <Button 
                                    className="btn-lg custom-button" 
                                    variant={theme === 'light' ? '#CDCDCD' : '#A0A0A0'}
                                    onClick={GoProfile}
                                    style={{ backgroundColor:theme === 'light' ? '#CDCDCD' : '#A0A0A0',
                                             color:theme === 'light' ? '#000000' : '#FFFFFF'}}
                                >프로필 설정</Button>
                                <Button 
                                    className="btn-lg custom-button" 
                                    variant={theme === 'light' ? '#CDCDCD' : '#A0A0A0'}
                                    onClick={openInviteMessageBox}
                                    style={{ backgroundColor:theme === 'light' ? '#CDCDCD' : '#A0A0A0',
                                             color:theme === 'light' ? '#000000' : '#FFFFFF'}}
                                >초대함</Button>
                                <Button 
                                    className="btn-lg custom-button" 
                                    variant={theme === 'light' ? '#CDCDCD' : '#A0A0A0'}
                                    onClick={openPersonalMessageBox}
                                    style={{ backgroundColor:theme === 'light' ? '#CDCDCD' : '#A0A0A0',
                                             color:theme === 'light' ? '#000000' : '#FFFFFF'}}
                                >쪽지함</Button>
                                <Button 
                                    className="btn-lg custom-button" 
                                    variant="dark" 
                                    onClick={LogOut}
                                >로그아웃</Button>
                            </div>
                        </aside>
                    </Col>
                    <Col className="border-3 rounded-4 p-5" style={{backgroundColor:theme === 'light' ? "#C3C3C3" : '#999999', height: "975px"}}>
                        <SetRoomComponent
                            stompClient={client.current}
                        />
                        <br></br>
                        <ListGroup className='custom-ui'>
                            {chatRoomList.map(room=>(
                                <ListGroupItem 
                                    className='custom-ui'
                                    style={{border:theme === 'light' ? '#8F8F8F' : '#6D6D6D', 
                                        backgroundColor: theme === 'light' ? '#8F8F8F' : '#6D6D6D', 
                                        color: theme === 'light' ? '#000000' : '#FFFFFF',
                                        marginBottom: '5px' }}>
                                    <strong>
                                        {room.roomName} | {room.curParticipates} / {room.limitParticipates}
                                    </strong>
                                    &nbsp;{room.existLock && (theme === 'light' ? <img alt="잠금 이미지" src={`${process.env.PUBLIC_URL}/lock_symbol.png`} width={20} style={{filter: '#8F8F8F(100%)'}}></img>
                                : <img alt="잠금 이미지" src={`${process.env.PUBLIC_URL}/lock_symbol_white.png`} width={20} style={{filter: '#8F8F8F(100%)'}}></img>)}
                                <hr/>
                                <img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img> 
                                <strong>{room.roomManager}</strong>
                                <hr/>
                                {room.introduction}
                                {room.roomTags.length > 0 && (
                                    <div>
                                        <ListGroup className="list-group-horizontal list-group-flush gap-2">        
                                        {room.roomTags.map(tag=>(
                                            <ListGroupItem style={{border:theme === 'light' ? '#8F8F8F' : '#6D6D6D', 
                                            backgroundColor:theme === 'light' ? '#8F8F8F' : '#6D6D6D', 
                                            color:theme === 'light' ? "#4B4B4B" : "#2D2D2D"}}># {tag.tagName}</ListGroupItem>
                                        ))}
                                        </ListGroup>
                                    </div>
                                )}
                                <div className="d-flex flex-row gap-2">
                                    <Button className='custom-button'
                                    variant="#CDCDCD" 
                                    style={{ backgroundColor:theme === 'light' ? '#CDCDCD' : '#A0A0A0',
                                             color: theme === 'light' ? '#000000' : '#FFFFFF'}} onClick={() => EnterRoom({roomInfo: room})}><strong>입장하기</strong></Button>
                                    {room.roomManager === member?.memberNickName && (
                                    <Button className='custom-button' 
                                    variant="dark" 
                                    onClick={() => deleteRoom({roomInfo: room})}>삭제하기</Button>
                                    )}
                                </div>
                                {() => ChangRoom(room)}
                            </ListGroupItem>
                            ))}
                        </ListGroup>
                        <br></br>
                        <FormGroup className="d-flex align-items-center justify-content-center">
                            <InputGroup style={{width:"70%"}}>
                                <Form.Select
                                    className='custom-ui'
                                    onChange={selectMenuHandle} 
                                    value={selectManu}
                                    style={{flex: '1', 
                                            backgroundColor:theme === 'light' ? '#FFFFFF' : "#121212",
                                            color: theme === 'light' ? '#000000' : "#FFFFFF"
                                        }}
                                >
                                    {menuList.map((item) => {
                                        return <option value={item.value} key={item.value}>
                                            {item.name}
                                        </option>;
                                    })}
                                </Form.Select>
                                <FormControl
                                    className='custom-ui'
                                    type='text' 
                                    value={searchKeyword} 
                                    onChange={GetInputSearchKeyword}
                                    style={{flex: '5',
                                    backgroundColor:theme === 'light' ? '#FFFFFF' : "#121212",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF"}}></FormControl>
                                
                            </InputGroup>
                            <Button className='custom-button' variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                                style={{ backgroundColor:theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                         color: theme === 'light' ? "#000000" : "#FFFFFF"}} onClick={search}>
                                <strong>
                                    검색
                                </strong>
                            </Button>
                                {isSearch && (
                                <Button className='custom-button'
                                    variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                                    style={{ backgroundColor:theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                    color: theme === 'light' ? "#000000" : "#FFFFFF"}} onClick={initSearch}>초기화</Button>
                            )}
                        </FormGroup>
                        <br></br>
                        <Pagination className="justify-content-center custom-pagination gap-2">
                            <Pagination.First onClick={()=>handlePageChange(1)} />
                            <Pagination.Prev onClick={()=>handlePageChange(page - 1)} />
                            {renderPaginationItems()}
                            <Pagination.Next onClick={() => handlePageChange(page + 1)} />
                            <Pagination.Last onClick={() => handlePageChange(Math.ceil(pageLength / 3))} />
                        </Pagination>
                    </Col>
                </Row>
            </Container>
            <PersonalMessageComponent showModal={searchMemberModalOpen} 
            setShowModal={setSearchMemberModalOpen}
            showPMModal={showPersonalMessageForm}
            setShowPMModal={setShowPersonalMessageForm}
            stompClient={client.current}
            myInfo={member}/>
        </Desktop>
        <Mobile>
            <Container style={{minHeight:"100vh"}}>
            <Modal isOpen={isInviteMessageBoxOpen} onRequestClose={()=>setIsInviteMessageBoxOpen(false)} style={{
                            content: {
                                backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                                width: '300px', // 원하는 너비로 설정
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
                    {inviteMessageList.map((_message) => (
                        <ListGroupItem
                            style={{backgroundColor:theme === 'light' ? '#8F8F8F' : '#6D6D6D',
                                    color:theme === 'light' ? '#000000' : '#FFFFFF'}}><strong>{_message.roomName}</strong>
                        <hr/><img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img> <strong>{_message.inviter}</strong>
                        <hr/>{_message.message}
                        <hr/>
                        <Button
                            className='custom-button'
                            variant="#8F8F8F" 
                            style={{ backgroundColor:theme === 'light' ? '#B6B6B6' : '#8D8D8D', 
                                     color:theme === 'light' ? '#000000' : '#FFFFFF'}} 
                                onClick={()=> EnterInvitedRoom({roomId:_message.roomId, Inviter: _message.inviter})}><strong>입장하기</strong></Button>
                        <div style={{width:"4px", display:"inline-block"}}/>
                        <Button className='custom-button' variant='dark' 
                                onClick={()=> DeleteInviteMessage({Inviter: _message.inviter, Invited_member:_message.invitedMember})}>메세지 지우기</Button>
                        
                        
                        </ListGroupItem>
                    ))}
                    </ListGroup> 
                    <hr/>       
                    <Button 
                        className='custom-button'
                        variant='dark' 
                        onClick={()=>setIsInviteMessageBoxOpen(false)} 
                    >닫기</Button>
                </Modal>
                <Modal isOpen={isPersonalMessageBoxOpen} onRequestClose={() => setIsPersonalMessageBoxOpen(false)} style={{
                            content: {
                                backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                                width: '300px', // 원하는 너비로 설정
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
                        <Button
                            className='custom-button'
                            variant="#8F8F8F" 
                            style={{ backgroundColor:theme === 'light' ? '#B6B6B6' : '#8D8D8D', 
                                    color:theme === 'light' ? '#000000' : '#FFFFFF'}}
                                onClick={()=>{
                                    setShowPersonalMessageForm(true);
                                    client.current.publish({
                                        destination: '/pub/chat/personalMessage',
                                        body: JSON.stringify({
                                            nickName: "system",
                                            message: ``,
                                        })
                                    });
                                }}
                                ><strong>답장하기</strong></Button>
                        <div style={{width:"4px", display:"inline-block"}}/>
                        <Button className='custom-button' variant='dark' 
                                onClick={()=> deletePersonalMessage({message_id: _message.messageId, 
                                                                    caller: _message.caller,
                                                                    receiver: _message.receiver,
                                                                    message: _message.message})}>확인</Button>
                        
                        
                        </ListGroupItem>
                    ))}
                    </ListGroup> 
                    <hr/>
                    <div className='d-flex flex-row gap-2'>
                        <Button 
                            className='custom-button'
                            variant={theme === 'light' ? '#CDCDCD' : '#A0A0A0'}
                            style={{backgroundColor: theme === 'light' ? '#CDCDCD' : '#A0A0A0'}} 
                            onClick={()=>{
                                setIsPersonalMessageBoxOpen(false)
                                setSearchMemberModalOpen(true);
                            }} 
                        >쪽지 보내기</Button>
                        <Button 
                            className='custom-button'
                            variant='dark' 
                            onClick={()=>setIsPersonalMessageBoxOpen(false)} 
                            >닫기</Button>
                    </div>
                </Modal>
                <Row className="justify-content-end">
                    <Button
                    className='custom-button'
                    variant={theme === 'light' ? '#8F8F8F' : '#6D6D6D'}
                    style={{ backgroundColor:theme === 'light' ? '#8F8F8F' : '#6D6D6D', 
                    color:theme === 'light' ? '#000000' : '#FFFFFF'}}
                    onClick={handleShow}>
                        <strong>
                            프로필 보기
                        </strong>
                    </Button>
                    <Offcanvas show={show} onHide={handleClose}>
                        <OffcanvasBody>
                            <Col xs={3} md={9} span={12} offset={12} lg="5" className="border-3 rounded-4 p-5"
                            style={{
                                backgroundColor: theme === 'light' ? "#7B7B7B" : "#595959",
                                width:"100%", height: "700px"
                                }}>
                                <div style={{ textAlign: 'center' }}>
                                    <img alt="프로필 이미지" 
                                        src={curImgUrl} 
                                        style={{width:'70%', 
                                        height:'70%',
                                        backgroundPosition:"center",
                                        borderRadius: "50%"}}></img>
                                    <p style={{color:"white"}}>환영합니다</p>
                                    <h4 style={{color:"white"}}>
                                        <strong>    
                                            {member?.memberNickName}님
                                        </strong>
                                    </h4>
                                    <hr/>
                                </div>
                                <div className="d-grid gap-4">
                                    <Button 
                                        className='custom-button'
                                        variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"}
                                        onClick={GoProfile}
                                        style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                                 color:theme === 'light' ? "#000000" : "#FFFFFF"}}
                                    >프로필 설정</Button>
                                    <Button 
                                        className='custom-button'
                                        variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"}
                                        onClick={openInviteMessageBox}
                                        style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                                 color:theme === 'light' ? "#000000" : "#FFFFFF"}}
                                    >초대함</Button>
                                    <Button 
                                        className='custom-button'
                                        variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"}
                                        onClick={openPersonalMessageBox}
                                        style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                                 color:theme === 'light' ? "#000000" : "#FFFFFF"}}
                                    >쪽지함</Button>
                                    <Button
                                        className='custom-button'
                                        variant="dark" 
                                        onClick={LogOut}
                                    >로그아웃</Button>
                                    <Button 
                                        className='custom-button'
                                        variant="dark" 
                                        onClick={handleClose}
                                    >닫기</Button>
                                </div>
                            </Col>
                        </OffcanvasBody>
                    </Offcanvas>
                    <Col className="border-3 rounded-4 p-5" style={{backgroundColor:theme === 'light' ? "#C3C3C3" : "#999999", height: "975px"}}>
                        <SetRoomComponent
                            stompClient={client.current}
                        />
                        <br></br>
                        <ListGroup className='custom-ui'>
                            {chatRoomList.map(room=>(
                                <ListGroupItem
                                    className='custom-ui'
                                    style={{ border:theme === 'light' ? '#8F8F8F' : '#6D6D6D', 
                                        backgroundColor:theme === 'light' ? '#8F8F8F' : '#6D6D6D',  
                                        color:theme === 'light' ? "#000000" : "#FFFFFF",
                                        marginBottom: '5px' }}>
                                    <strong>
                                        {room.roomName} | {room.curParticipates} / {room.limitParticipates}
                                    </strong>
                                {room.existLock && <img alt="잠금 이미지" src={`${process.env.PUBLIC_URL}/lock_symbol.png`} width={20} style={{filter: '#8F8F8F(100%)'}}></img>}
                                <hr/>
                                <img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img> 
                                <strong>{room.roomManager}</strong>
                                <hr/>
                                {room.introduction}
                                {room.roomTags.length > 0 && (
                                    <div>
                                        <ListGroup className="list-group-horizontal list-group-flush gap-2">        
                                        {room.roomTags.map(tag=>(
                                            <ListGroupItem 
                                            style={{border:theme === 'light' ? '#8F8F8F' : '#6D6D6D', 
                                                    backgroundColor:theme === 'light' ? '#8F8F8F' : '#6D6D6D', 
                                                    color:theme === 'light' ? "#4B4B4B" : "#2D2D2D",
                                                    fontSize:"12px"}}># {tag.tagName}</ListGroupItem>
                                        ))}
                                        </ListGroup>
                                    </div>
                                )}
                                <div className="d-flex flex-row gap-2">
                                    <Button
                                    className='btn-sm custom-button' 
                                    variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                                    style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                             color:theme === 'light' ? '#000000' : "#FFFFFF"
                                            }} onClick={() => EnterRoom({roomInfo: room})}><strong>입장하기</strong></Button>
                                    {room.roomManager === member?.memberNickName && (
                                    <Button
                                    className='btn-sm custom-button'  
                                    variant="dark" 
                                    onClick={() => deleteRoom({roomInfo: room})}>삭제하기</Button>
                                    )}
                                </div>
                                {() => ChangRoom(room)}
                            </ListGroupItem>
                            ))}
                        </ListGroup>
                        <br></br>
                        <FormGroup className="d-flex align-items-center justify-content-center">
                            <InputGroup style={{width:"70%"}}>
                                <Form.Select
                                    className='custom-ui'
                                    onChange={selectMenuHandle} 
                                    value={selectManu}
                                    style={{flex: '1', 
                                            backgroundColor:theme === 'light' ? '#FFFFFF' : "#121212",
                                            color: theme === 'light' ? '#000000' : "#FFFFFF"
                                    }}
                                >
                                    {menuList.map((item) => {
                                        return <option value={item.value} key={item.value}>
                                            {item.name}
                                        </option>;
                                    })}
                                </Form.Select>
                                <FormControl
                                    className='custom-ui'
                                    type='text' 
                                    value={searchKeyword} 
                                    onChange={GetInputSearchKeyword}
                                    style={{flex: '5',
                                    backgroundColor:theme === 'light' ? '#FFFFFF' : "#121212",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF"}}></FormControl>
                                
                            </InputGroup>
                            {!isSearch && (
                                <Button className='custom-button' variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                                style={{ backgroundColor:theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                         color: theme === 'light' ? "#000000" : "#FFFFFF"}} onClick={search}>
                                <strong>
                                    검색
                                </strong>
                                </Button>
                            )}
                            {isSearch && (
                            <Button className='custom-button'
                                variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                                style={{ backgroundColor:theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                color: theme === 'light' ? "#000000" : "#FFFFFF"}} onClick={initSearch}>초기화</Button>
                            )}
                        </FormGroup>
                        <br></br>
                        <Pagination className={`justify-content-center ${theme === 'light' ? 'custom-pagination' : 'custom-pagination-dark'} gap-2`}>
                            <Pagination.First onClick={()=>handlePageChange(1)} />
                            <Pagination.Prev onClick={()=>handlePageChange(page - 1)} />
                            {renderPaginationItems()}
                            <Pagination.Next onClick={() => handlePageChange(page + 1)} />
                            <Pagination.Last onClick={() => handlePageChange(Math.ceil(pageLength / 3))} />
                        </Pagination>
                    </Col>
                </Row>
            </Container>
            <PersonalMessageComponent 
            showModal={searchMemberModalOpen} 
            setShowModal={setSearchMemberModalOpen}
            showPMModal={showPersonalMessageForm} 
            setShowPMModal={setShowPersonalMessageForm}
            stompClient={client.current}
            myInfo={member}/>
        </Mobile>
    </div>

    );

    
}

export default MainComponent;