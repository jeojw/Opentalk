import React, {useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SetRoomComponent from './setroom';
import ProfileComponent from './profile';
import { Container, Row, Col, Button, Form, FormControl, InputGroup, ListGroup, ListGroupItem, FormGroup,
     Offcanvas, OffcanvasBody } from 'react-bootstrap';
import Modal from 'react-modal';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Pagination from "react-bootstrap/Pagination";
import * as StompJs from "@stomp/stompjs";
import SockJs from "sockjs-client"
import { format } from 'date-fns'
import { useMediaQuery } from 'react-responsive';

const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 767, maxWidth:1920 })
    return isDesktop ? children : null
}
const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })
    return isMobile ? children : null
}

const MainComponent = () => {
    const client = useRef({});

    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

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

    const [isUpdateTrigger, setIsUpdateTrigger] = useState(false);
    const [allChatRoomList, setAllChatRoomList] = useState([]);

    const [chatRoomList, setChatRoomList] = useState([]);
    const [page, setPage] = useState(1);
    const [isSearch, setIsSearch] = useState(false);

    const postPerPage = 3;
    const indexOfLastPost = page * postPerPage;
    const indexOfFirstPost= indexOfLastPost - postPerPage;

    const [pageLength , setPageLength] = useState(0);

    const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
    const [messageList, setMessageList] = useState([]);


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

    const { data: allChatRooms, isLoading, isError, isFetching, isFetched } = useQuery({
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
        if (allChatRooms && !isLoading && !isError && !isFetching && isFetched) {
            setAllChatRoomList(allChatRooms);
            setPageLength(allChatRooms.length);
            console.log(allChatRooms);
        }
    }, [allChatRooms, isLoading, isError, isFetching, isFetched]);

    const { mutate: updateRooms } = useMutation(async () => {}, {
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:["allChatRooms"]});
        }
    });

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
                    queryClient.invalidateQueries("allChatRooms");
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
            navigate("/opentalk/member/login");
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

    const { mutate: mutateEnterInviteRoom } = useMutation(async ({roomId, Inviter}) => {
        if (window.confirm("입장하시겠습니까?")){
            if (!localStorage.getItem("token")){
                window.alert("이미 로그아웃 되었습니다.");
                navigate("/opentalk/member/login");
            }
            else{
                try{
                    let currentRole;
                    const enterUrl = '/api/opentalk/enterInvitedRoom';
                    currentRole = ChatRoomRole.PARTICIPATE;
                    setRole(currentRole);
                    const data = new FormData();
                    data.append("roomId", roomId);
                    data.append("memberId", member.memberId);
                    data.append("inviter", Inviter);
                    
                    const res = axios.post(enterUrl, data);
                    if (res.data === "Success"){
                        navigate(`/opentalk/room/${roomId}`);
                    }
                    else{
                        window.alert("인원수가 가득 차 방에 입장할 수 없습니다!");
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
        const reissueToken = async () =>{
            if (isReissue){
                const reissueUrl = "/api/opentalk/auth/reissue";
                try{
                    const reissueRes = await axios.post(reissueUrl, null, {
                        headers:{
                            Authorization: localStorage.getItem("token")
                        },
                        withCredentials: true
                    })
                    if (reissueRes.status === 200){
                        localStorage.setItem("token", reissueRes.headers['authorization']);
                    }
                } catch(error) {
                    console.log(error);
                    setIsReissue(false); 
                }
            }
        }
        reissueToken();
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

    const EnterInvitedRoom = ({roomId, Inviter}) => {
        mutateEnterInviteRoom({roomId, Inviter});
    }

    const ChangRoom = ({roomInfo}) => {
        mutateChangRoom({roomInfo});
    }

    const DeleteInviteMessage = ({Inviter, Invited_member}) => {
        const deleteUrl = '/api/opentalk/member/deleteMessage';
        const data = new FormData();
        data.append("inviter", Inviter);
        data.append("invitedMember", Invited_member);
        axios.post(deleteUrl, data)
        .then((res) =>{
            setIsUpdateTrigger(prevState => !prevState);
        })
        .catch((error) => console.log(error));
    }

    const GoProfile = () => {
        if (localStorage.getItem("token")){
            navigate("/opentalk/profile");
        }
        else{
            window.alert("이미 로그아웃 되었습니다.");
            navigate("/opentalk/member/login");
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
                    navigate("/");
                }
            })
            .catch((error) => console.log(error));
        }
        else{
            alert("이미 로그아웃되었습니다.");
            navigate("/");
        }
        
    };

    const openMessageBox = () => {
        setIsMessageBoxOpen(true);
    }

    const closeModal = () => {
        setIsMessageBoxOpen(false);
    }

    useEffect(() => {
        const fetchAllMessages = async () => {
            if (localStorage.getItem("token")){
                const url = "/api/opentalk/member/allInviteMessages"
                try{
                    const data = new FormData();
                    data.append("memberNickName", member.memberNickName);
                    const response = await axios.post(url, data);
                    setMessageList(response.data);
                } catch (error){
                    console.log(error);
                }
            }
        }

        fetchAllMessages();
    },[isMessageBoxOpen, isUpdateTrigger])

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

   return (
    <div>
        <Desktop>
            <Container>
                <Modal isOpen={isMessageBoxOpen} onRequestClose={closeModal} style={{
                            content: {
                                width: '1000px', // 원하는 너비로 설정
                                height: '600px', // 원하는 높이로 설정
                            }
                        }}>
                    <ListGroup>
                    {messageList.map((_message) => (
                        <ListGroupItem style={{ borderTopLeftRadius: "25px",
                                                borderBottomLeftRadius: "25px",
                                                borderTopRightRadius: "25px",
                                                borderBottomRightRadius: "25px"
                                                }}><strong>{_message.roomName}</strong>
                        <hr/><img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img> <strong>{_message.inviter}</strong>
                        <hr/>{_message.message}
                        <hr/>
                        <Button variant="#8F8F8F" 
                                style={{
                                        backgroundColor:'#8F8F8F', 
                                        borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"
                                        }} 
                                onClick={()=> EnterInvitedRoom({roomId:_message.roomId, Inviter: _message.inviter})}><strong>입장하기</strong></Button>
                        <div style={{width:"4px", display:"inline-block"}}/>
                        <Button variant='dark' 
                                style={{borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}
                                onClick={()=> DeleteInviteMessage({Inviter: _message.inviter, Invited_member:_message.invitedMember})}>메세지 지우기</Button>
                        
                        
                        </ListGroupItem>
                    ))}
                    </ListGroup> 
                    <Button variant='dark' 
                            onClick={closeModal} 
                            style={{borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px",
                                    borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"
                                    }}>닫기</Button>
                </Modal>
                <Row className="justify-content-end">
                    <Col xs={3} md={9} span={12} offset={12} lg="5" className="border border-#7B7B7B border-3 rounded-2 p-5"
                    style={{
                        backgroundColor: "#7B7B7B",
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
                                    className="btn-lg" 
                                    variant='#CDCDCD'
                                    onClick={GoProfile}
                                    style={{
                                        backgroundColor:"#CDCDCD",
                                        borderTopLeftRadius: "50px",
                                        borderBottomLeftRadius: "50px",
                                        borderTopRightRadius: "50px",
                                        borderBottomRightRadius: "50px"
                                    }}
                                >프로필 설정</Button>
                                <Button 
                                    className="btn-lg" 
                                    variant='#CDCDCD'
                                    onClick={openMessageBox}
                                    style={{
                                        backgroundColor:"#CDCDCD",
                                        borderTopLeftRadius: "50px",
                                        borderBottomLeftRadius: "50px",
                                        borderTopRightRadius: "50px",
                                        borderBottomRightRadius: "50px"
                                    }}
                                >메세지함</Button>
                                <Button 
                                    className="btn-lg" 
                                    variant="dark" 
                                    onClick={LogOut}
                                    style={{
                                        borderTopLeftRadius: "50px",
                                        borderBottomLeftRadius: "50px",
                                        borderTopRightRadius: "50px",
                                        borderBottomRightRadius: "50px"
                                    }}
                                >로그아웃</Button>
                            </div>
                        </aside>
                    </Col>
                    <Col className="border border-#C3C3C3 border-3 rounded-2 p-5" style={{backgroundColor:"#C3C3C3", height: "975px"}}>
                        <SetRoomComponent
                            stompClient={client.current}
                            onDataUpdate={setIsUpdateTrigger}
                            updateFunction={updateRooms}
                        />
                        <br></br>
                        <ListGroup>
                            {chatRoomList.map(room=>(
                                <ListGroupItem 
                                style={{border:'#8F8F8F', 
                                        backgroundColor:'#8F8F8F',  
                                        marginBottom: '5px', 
                                        borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}>
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
                                            <ListGroupItem style={{border:"#8F8F8F", backgroundColor:'#8F8F8F', color:"#4B4B4B"}}># {tag.tagName}</ListGroupItem>
                                        ))}
                                        </ListGroup>
                                    </div>
                                )}
                                <div className="d-flex flex-row gap-2">
                                    <Button variant="#CDCDCD" 
                                    style={{ backgroundColor:'#CDCDCD', 
                                            borderTopLeftRadius: "25px",
                                            borderBottomLeftRadius: "25px",
                                            borderTopRightRadius: "25px",
                                            borderBottomRightRadius: "25px"
                                            }} onClick={() => EnterRoom({roomInfo: room})}><strong>입장하기</strong></Button>
                                    {room.roomManager === member?.memberNickName && (
                                    <Button variant="dark" 
                                    style={{ borderTopLeftRadius: "25px",
                                            borderBottomLeftRadius: "25px",
                                            borderTopRightRadius: "25px",
                                            borderBottomRightRadius: "25px"
                                }} onClick={() => deleteRoom({roomInfo: room})}>삭제하기</Button>
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
                                    onChange={selectMenuHandle} 
                                    value={selectManu}
                                    style={{flex: '1', 
                                            borderTopLeftRadius: "25px",
                                            borderBottomLeftRadius: "25px",
                                        }}
                                >
                                    {menuList.map((item) => {
                                        return <option value={item.value} key={item.value}>
                                            {item.name}
                                        </option>;
                                    })}
                                </Form.Select>
                                <FormControl 
                                    type='text' 
                                    value={searchKeyword} 
                                    onChange={GetInputSearchKeyword}
                                    style={{flex: '5',
                                    borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"}}></FormControl>
                                
                            </InputGroup>
                            <Button variant="#8F8F8F" style={{
                                            backgroundColor:'#8F8F8F', 
                                            borderTopLeftRadius: "25px",
                                            borderBottomLeftRadius: "25px",
                                            borderTopRightRadius: "25px",
                                            borderBottomRightRadius: "25px"
                                        }} onClick={search}>
                                <strong>
                                    검색
                                </strong>
                            </Button>
                                {isSearch && (
                                <Button variant="#8F8F8F" style={{
                                        color:"white", 
                                        backgroundColor:'#8F8F8F', 
                                        borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}} onClick={initSearch}>초기화</Button>
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
        </Desktop>
        <Mobile>
            <Container>
                <Modal isOpen={isMessageBoxOpen} onRequestClose={closeModal} style={{
                            content: {
                                width: '300px', // 원하는 너비로 설정
                                height: '600px', // 원하는 높이로 설정
                            }
                        }}>
                    <ListGroup>
                    {messageList.map((_message) => (
                        <ListGroupItem 
                        style={{ borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"
                                }}><strong>{_message.roomName}</strong>
                        <hr/><img alt="매니저 이미지" src={`${process.env.PUBLIC_URL}/manager.png`} width={20}></img> <strong>{_message.inviter}</strong>
                        <hr/>{_message.message}
                        <hr/>
                        <Button variant="#8F8F8F" 
                                style={{
                                        backgroundColor:'#8F8F8F', 
                                        borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"
                                        }} 
                                onClick={()=> EnterInvitedRoom({roomId:_message.roomId, Inviter: _message.inviter})}><strong>입장하기</strong></Button>
                        <div style={{width:"4px", display:"inline-block"}}/>
                        <Button variant='dark' 
                                style={{borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}
                                onClick={()=> DeleteInviteMessage({Inviter: _message.inviter, Invited_member:_message.invitedMember})}>메세지 지우기</Button>
                        
                        
                        </ListGroupItem>
                    ))}
                    </ListGroup> 
                    <Button variant='dark' 
                            onClick={closeModal} 
                            style={{borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px",
                                    borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"
                                    }}>닫기</Button>
                </Modal>
                <Row className="justify-content-end">
                    <Button
                    variant="#8F8F8F"
                    style={{borderTopLeftRadius: "25px",
                            borderBottomLeftRadius: "25px",
                            borderTopRightRadius: "25px",
                            borderBottomRightRadius: "25px",
                            backgroundColor: "#8F8F8F"
                            }}
                    onClick={handleShow}>
                        프로필 보기
                    </Button>
                    <Offcanvas show={show} onHide={handleClose}>
                        <OffcanvasBody>
                            <Col xs={3} md={9} span={12} offset={12} lg="5" className="border border-#7B7B7B border-3 rounded-2 p-5"
                            style={{
                                backgroundColor: "#7B7B7B",
                                width:"100%", height: "600px"
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
                                        variant='#CDCDCD'
                                        onClick={GoProfile}
                                        style={{
                                            backgroundColor:"#CDCDCD",
                                            borderTopLeftRadius: "50px",
                                            borderBottomLeftRadius: "50px",
                                            borderTopRightRadius: "50px",
                                            borderBottomRightRadius: "50px"
                                        }}
                                    >프로필 설정</Button>
                                    <Button 
                                        variant='#CDCDCD'
                                        onClick={openMessageBox}
                                        style={{
                                            backgroundColor:"#CDCDCD",
                                            borderTopLeftRadius: "50px",
                                            borderBottomLeftRadius: "50px",
                                            borderTopRightRadius: "50px",
                                            borderBottomRightRadius: "50px"
                                        }}
                                    >메세지함</Button>
                                    <Button 
                                        variant="dark" 
                                        onClick={LogOut}
                                        style={{
                                            borderTopLeftRadius: "50px",
                                            borderBottomLeftRadius: "50px",
                                            borderTopRightRadius: "50px",
                                            borderBottomRightRadius: "50px"
                                        }}
                                    >로그아웃</Button>
                                    <Button 
                                        variant="dark" 
                                        onClick={handleClose}
                                        style={{
                                            borderTopLeftRadius: "50px",
                                            borderBottomLeftRadius: "50px",
                                            borderTopRightRadius: "50px",
                                            borderBottomRightRadius: "50px"
                                        }}
                                    >닫기</Button>
                                </div>
                            </Col>
                        </OffcanvasBody>
                    </Offcanvas>
                    <Col className="border border-#C3C3C3 border-3 rounded-2 p-5" style={{backgroundColor:"#C3C3C3", height: "975px"}}>
                        <SetRoomComponent
                            stompClient={client.current}
                            onDataUpdate={setIsUpdateTrigger}
                            updateFunction={updateRooms}
                        />
                        <br></br>
                        <ListGroup>
                            {chatRoomList.map(room=>(
                                <ListGroupItem 
                                style={{border:'#8F8F8F', 
                                        backgroundColor:'#8F8F8F',  
                                        marginBottom: '5px', 
                                        borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}>
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
                                            style={{border:"#8F8F8F", 
                                                    backgroundColor:'#8F8F8F', 
                                                    color:"#4B4B4B",
                                                    fontSize:"12px"}}># {tag.tagName}</ListGroupItem>
                                        ))}
                                        </ListGroup>
                                    </div>
                                )}
                                <div className="d-flex flex-row gap-2">
                                    <Button
                                    className='btn-sm' 
                                    variant="#CDCDCD" 
                                    style={{ backgroundColor:'#CDCDCD', 
                                            borderTopLeftRadius: "25px",
                                            borderBottomLeftRadius: "25px",
                                            borderTopRightRadius: "25px",
                                            borderBottomRightRadius: "25px"
                                            }} onClick={() => EnterRoom({roomInfo: room})}><strong>입장하기</strong></Button>
                                    {room.roomManager === member?.memberNickName && (
                                    <Button
                                    className='btn-sm'  
                                    variant="dark" 
                                    style={{ borderTopLeftRadius: "25px",
                                            borderBottomLeftRadius: "25px",
                                            borderTopRightRadius: "25px",
                                            borderBottomRightRadius: "25px"
                                }} onClick={() => deleteRoom({roomInfo: room})}>삭제하기</Button>
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
                                    onChange={selectMenuHandle} 
                                    value={selectManu}
                                    style={{flex: '1', 
                                            borderTopLeftRadius: "25px",
                                            borderBottomLeftRadius: "25px",
                                        }}
                                >
                                    {menuList.map((item) => {
                                        return <option value={item.value} key={item.value}>
                                            {item.name}
                                        </option>;
                                    })}
                                </Form.Select>
                                <FormControl 
                                    type='text' 
                                    value={searchKeyword} 
                                    onChange={GetInputSearchKeyword}
                                    style={{flex: '5',
                                    borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"}}></FormControl>
                                
                            </InputGroup>
                            <Button variant="#8F8F8F" style={{
                                            backgroundColor:'#8F8F8F', 
                                            borderTopLeftRadius: "25px",
                                            borderBottomLeftRadius: "25px",
                                            borderTopRightRadius: "25px",
                                            borderBottomRightRadius: "25px"
                                        }} onClick={search}>
                                <strong>
                                    검색
                                </strong>
                            </Button>
                                {isSearch && (
                                <Button variant="#8F8F8F" style={{
                                        color:"white", 
                                        backgroundColor:'#8F8F8F', 
                                        borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}} onClick={initSearch}>초기화</Button>
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
        </Mobile>
    </div>

    );

    
}

export default MainComponent;