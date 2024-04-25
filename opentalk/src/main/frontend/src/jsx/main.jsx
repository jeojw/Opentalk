import React, {useState, useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SetRoomComponent from './setroom';
import RoomComponent from './room';
import ProfileComponent from './profile';
import { Container, Row, Col, Button, Form, 
    FormControl, InputGroup, ListGroup, ListGroupItem, 
    FormGroup} from 'react-bootstrap';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import Modal from 'react-modal';
import { TokenContext } from './TokenContext';
import { useQuery, useMutation } from 'react-query';

const MainComponent = () => {
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
        setPage(page);
    }

    const [member, setMember] = useState();
    const [role, setRole] = useState();
    
    const [selectManu, setSelectManu] = useState("default");
    const [searchKeyword, setSearchKeyword] = useState("");
    const navigate = useNavigate();


    const { loginToken, updateToken } = useContext(TokenContext);

    const [curImgUrl, setCurImgUrl] = useState(null);

    const [isReissue, setIsReissue] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    const { data: allChatRooms, isLoading, isError, refetch } = useQuery('allChatRooms', async () => {
        const roomResponse = await axios.get("/api/opentalk/rooms");
        return roomResponse.data;
    })

    useEffect(() => {
        if (!isLoading && !isError && allChatRooms) {
            setAllChatRoomList(allChatRooms);
            setPageLength(allChatRooms.length);
        }
    }, [allChatRooms, isLoading, isError]);

    const { mutate: updateRooms } = useMutation(async () => {
       await refetch();
    });

    useEffect(() => {
        const reissueToken = async () =>{
            if (isReissue){
                const reissueUrl = "/api/opentalk/auth/reissue";
                try{
                    const reissueRes = await axios.post(reissueUrl, {
                        headers:{
                            Authorization: loginToken,
                            Cookie: `refresh-token=${loginToken.split(" ")[1]}`
                        }
                    }, {})
                    if (reissueRes.status === 200){
                        updateToken(reissueRes.headers['authorization']);
                        setIsLogin(true);
                    }
                } catch(error) {
                    window.alert("로그아웃 상태입니다. 로그인하여 주십시오");
                    navigate('/opentalk/member/login');   
                    setIsReissue(false); 
                    setIsLogin(false);  
                }
            }
        }
        reissueToken();
    }, [isReissue, loginToken])

    useEffect(() => {
        const validateToken = async () =>{
            try{
                const url = "/api/opentalk/auth/validate";
                const response = await axios.post(url, {}, {
                    headers: {
                        Authorization: loginToken
                    }
                });
                if (response.status === 200){
                    setIsReissue(false);
                    setIsLogin(true);
                }
            } catch(error){
                setIsReissue(true);
                setIsLogin(false);
                console.log(error); 
            }
        }
        validateToken();
    }, [loginToken]);

    useEffect(() => {
        const fetchMyInfo = async () => {
            console.log(isLogin);
            if (isLogin){
                await axios.get('/api/opentalk/member/me', {
                    headers: {
                        Authorization: loginToken,
                    }
                }).then((res) => {
                    if (res.status === 200){
                        setCurImgUrl(res.data.imgUrl);
                        setMember(res.data);
                        console.log(res.data);
                    }
                }).catch((error) => console.log(error));
            }
        }    
        fetchMyInfo();
    }, [isLogin, loginToken]);


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
        if (window.confirm("방을 삭제하시겠습니까?")){
            const deleteUrl = "/api/opentalk/deleteRoom";
            const data = new FormData();
            data.append("room_id", roomInfo.roomId);
            axios.post(deleteUrl, data)
            .then((res) => {
                if (res.data === "Success"){
                    window.alert("방이 삭제되었습니다.");
                    setIsUpdateTrigger(prevState => !prevState);
                }
                else{
                    window.alert("아직 방에 인원이 남아있습니다.");
                }
            })
            .catch((error) => console.log(error));  
        }
    }

    const EnterRoom = ({roomInfo}) => {
        if (!isLogin){
            window.alert("이미 로그아웃 되었습니다.");
            navigate("/opentalk/member/login");
        }
        else{
            const enterUrl = '/api/opentalk/enterRoom';
            if (!roomInfo.existLock){
                let currentRole;
                console.log(roomInfo);
                if (roomInfo.manager === member.memberNickName){
                    currentRole = ChatRoomRole.MANAGER;
                }
                else{
                    currentRole = ChatRoomRole.PARTICIPATE;
                }
                setRole(currentRole);
                axios.post(enterUrl, {
                    chatroom: roomInfo, 
                    member: member,
                    role:role
                })
                .then((res) => {
                    if (res.data === "Success"){
                        updateRooms();
                        navigate(`/opentalk/room/${roomInfo.roomId}`);
                        setIsUpdateTrigger(prevState => !prevState);
                    }
                    else{
                        window.alert("인원수가 가득 차 방에 입장할 수 없습니다!");
                    }
                })
                .catch((error) => console.log(error));
            }
            else{
                const inputPassword = window.prompt("비밀번호를 입력해주세요.");
                console.log(inputPassword);
                if (inputPassword === ""){
                    window.alert("비밀번호를 입력해주세요.")
                }else{
                    axios.post(enterUrl + `/${inputPassword}`, {
                        chatroom: roomInfo, 
                        member: member,
                        role:role
                    })
                    .then((res) => {
                        if (res.data === "Success"){
                            updateRooms();
                            navigate(`/opentalk/room/${roomInfo.roomId}`);
                        }
                        else if (res.data ==="Incorrect"){
                            window.alert("비밀번호가 잘못되었습니다.")
                        }
                        else{
                            window.alert("인원수가 가득 차 방에 입장할 수 없습니다!");
                        }
                    })
                    .catch((error) => console.log(error));
                }
           
            }
        
        }
        return (
            <div>
                <RoomComponent isChangeData={isUpdateTrigger} setIsChangeData={setIsUpdateTrigger}/>
            </div>
        );
    }

    const EnterInvitedRoom = ({roomId, Inviter}) => {
        if (window.confirm("입장하시겠습니까?")){
            if (!isLogin){
                window.alert("이미 로그아웃 되었습니다.");
                navigate("/opentalk/member/login");
            }
            else{
                let currentRole;
                const enterUrl = '/api/opentalk/enterInvitedRoom';
                currentRole = ChatRoomRole.PARTICIPATE;
                setRole(currentRole);
                const data = new FormData();
                data.append("roomId", roomId);
                data.append("memberId", member.memberId);
                data.append("inviter", Inviter);
                console.log(Inviter);
                axios.post(enterUrl, data)
                .then((res) => {
                    if (res.data === "Success"){
                        navigate(`/opentalk/room/${roomId}`);
                    }
                    else{
                        window.alert("인원수가 가득 차 방에 입장할 수 없습니다!");
                    }
                })
                .catch((error) => console.log(error));      
            }
        }
        return (
            <div>
                <RoomComponent setIsChangeData={setIsUpdateTrigger}/>
            </div>
        );
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
        if (isLogin){
            navigate("/opentalk/profile");
        }
        else{
            window.alert("이미 로그아웃 되었습니다.");
            navigate("/opentalk/member/login");
        }
        return (
            <ProfileComponent setIsUpdateData={setIsUpdateTrigger}/>
        )
    }

    const LogOut = () => {
        if (loginToken !== ""){
            axios.post("/api/opentalk/auth/logout", {}, {
                headers: { 
                    Authorization: loginToken,
                }
            })
            .then((res) => {
                if (res.status === 200){
                    setIsLogin(false);
                    navigate("/opentalk/member/login");
                }
            })
            .catch((error) => console.log(error));
        }
        else{
            alert("이미 로그아웃되었습니다.");
            navigate("/opentalk/member/login");
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
            if (isLogin){
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
    },[isMessageBoxOpen, isLogin, isUpdateTrigger])

   return (
    <Container>
        <Modal isOpen={isMessageBoxOpen} onRequestClose={closeModal}>
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
                <Button variant="#8F8F8F" style={{
                                    backgroundColor:'#8F8F8F', 
                                    borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px",
                                    borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"
                                    }} onClick={()=> EnterInvitedRoom({roomId:_message.roomId, Inviter: _message.inviter})}><strong>입장하기</strong></Button>
                <div style={{width:"4px", display:"inline-block"}}/>
                <Button variant='dark' style={{borderTopLeftRadius: "25px",
                                                borderBottomLeftRadius: "25px",
                                                borderTopRightRadius: "25px",
                                                borderBottomRightRadius: "25px"}}
                                                onClick={()=> DeleteInviteMessage({Inviter: _message.inviter, Invited_member:_message.invitedMember})}>메세지 지우기</Button>
                
                
                </ListGroupItem>
            ))}
            </ListGroup> 
            <Button variant='dark' onClick={closeModal} style={{borderTopLeftRadius: "25px",
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
                            style={{width:'60%', 
                            height:'60%',
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
                    onDataUpdate={setIsUpdateTrigger}
                />
                <br></br>
                <ListGroup>
                    {chatRoomList.map(room=>(
                        <ListGroupItem style={{border:'#8F8F8F', backgroundColor:'#8F8F8F',  marginBottom: '5px', 
                                                borderTopLeftRadius: "25px",
                                                borderBottomLeftRadius: "25px",
                                                borderTopRightRadius: "25px",
                                                borderBottomRightRadius: "25px"}}>
                            <strong>
                                {room.roomName} | {room.curParticipates} / {room.limitParticipates}
                            </strong>
                        {room.existLock && <img alt="잠금 이미지" src={`${process.env.PUBLIC_URL}/lock.jpg`} width={20}></img>}
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
                            <Button variant="#CDCDCD" style={{  backgroundColor:'#CDCDCD', 
                                                                borderTopLeftRadius: "25px",
                                                                borderBottomLeftRadius: "25px",
                                                                borderTopRightRadius: "25px",
                                                                borderBottomRightRadius: "25px"
                                                            }} onClick={() => EnterRoom({roomInfo: room})}><strong>입장하기</strong></Button>
                            {room.roomManager === member?.memberNickName && (
                            <Button variant="dark" style={{ borderTopLeftRadius: "25px",
                                                            borderBottomLeftRadius: "25px",
                                                            borderTopRightRadius: "25px",
                                                            borderBottomRightRadius: "25px"
                        }} onClick={() => deleteRoom({roomInfo: room})}>삭제하기</Button>
                            )}
                        </div>
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
                <PaginationControl
                    page={page}
                    between={3}
                    total={pageLength}
                    limit={3}
                    changePage={(page) => {
                        handlePageChange(page)
                    }}
                />
            </Col>
        </Row>
    </Container>
    );
}

export default MainComponent;