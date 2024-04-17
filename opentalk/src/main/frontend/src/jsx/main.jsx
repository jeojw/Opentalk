import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import SetRoomComponent from './setroom';
import RoomComponent from './room';
import {createBrowserHistory} from "history";
import ProfileComponent from './profile';
import { Container, Row, Col, Button, Form, 
    FormControl, InputGroup, ListGroup, ListGroupItem, 
    FormGroup} from 'react-bootstrap';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import Modal from 'react-modal';

const MainComponent = () => {
    const ChatRoomRole = {
        PARTICIPATE: 'PARTICIPATE',
        MANAGER: 'MANAGER'
    };

    const menuList = [
        {value: "title", name: "제목"},
        {value: "manager", name: "방장"},
        {value: "tags", name: "태그"},
    ];

    const [isUpdateTrigger, setIsUpdateTrigger] = useState(false);

    const [chatRoomList, setChatRoomList] = useState([]);
    const [allChatRoomList, setAllChatRoomList] = useState([]);
    const [page, setPage] = useState(1);
    const [isSearch, setIsSearch] = useState(false);

    const [userStatus, setUserStatus] = useState(true);

    const postPerPage = 3;
    const indexOfLastPost = page * postPerPage;
    const indexOfFirstPost= indexOfLastPost - postPerPage;

    const [pageLength , setPageLength] = useState(0);

    const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
    const [messageList, setMessageList] = useState([]);

    const chatRoomLength = allChatRoomList.length;
    const handlePageChange = (page)=>{
        setPage(page);
    }

    const [cookies, setCookie, removeCookie] = useCookies(['refresh-token']);
    const [member, setMember] = useState();
    const [role, setRole] = useState();
    
    const [selectManu, setSelectManu] = useState("default");
    const [searchKeyword, setSearchKeyword] = useState("");
    const naviagte = useNavigate();

    const history = createBrowserHistory();

    // useEffect(() => {
    //     let unlisten = history.listen((location) => {
    //         if (history.action === "POP")
    //     })

    //     return () => {
    //         unlisten();
    //     };
    // }, [history])

    useEffect(() => {
        const fetchMyInfo = async () => {
            await axios.get('/api/opentalk/member/me', {
                headers: {authorization: 'Bearer ' + cookies['refresh-token']}
            }).then((res) => {
                if (res.status === 200){
                    setMember(res.data);
                }
            }).catch((error) => {
                if (error === 500){
                    setUserStatus(false);
                    console.log(userStatus)
                }
            });
        };
        console.log(member);
        fetchMyInfo();
    }, []);

    useEffect(() => {
        const fetchAllRooms = async () => {
            try{
                const roomResponse = await axios.get("/api/opentalk/rooms");
                setAllChatRoomList(roomResponse.data);
                console.log(allChatRoomList);
                setPageLength(roomResponse.data.length);
            } catch (error){
                console.error(error);
            }
        };

        fetchAllRooms();
    }, [isUpdateTrigger]);

    useEffect(() => {
        setChatRoomList(allChatRoomList.slice(indexOfFirstPost, indexOfLastPost))
        console.log(chatRoomList);
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
            console.log(selectManu);
            axios.post("/api/opentalk/searchRooms", {
                type:selectManu,
                keyword:searchKeyword
            })
            .then((res) => {
                console.log(res.data);
                setChatRoomList(res.data);
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
            if (!roomInfo.existLock){
                axios.post(deleteUrl, data)
                .then((res) => {
                    if (res.status === 200){
                        window.alert("방이 삭제되었습니다.");
                        setIsUpdateTrigger(prevState => !prevState);
                    }
                })
                .catch((error) => console.log(error));
            }   
            else{
                const inputPassword = window.prompt("비밀번호를 입력해주세요.");
                if (inputPassword === ""){
                    window.alert("비밀번호를 입력해주세요.")
                }
                else{
                    axios.post(deleteUrl + `/${inputPassword}`, data)
                    .then((res)=> {
                        if (res.data === true){
                            window.alert("방이 삭제되었습니다.");
                            setIsUpdateTrigger(prevState => !prevState);
                        }
                        else{
                            window.alert("비밀번호가 잘못되었습니다.");
                        }
                    })
                    .catch((error) => console.log(error));
                }
            }
        }
    }

    const EnterRoom = ({roomInfo}) => {
        if (member === undefined){
            window.alert("이미 로그아웃 되었습니다.");
            naviagte("/opentalk/member/login");
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
                        naviagte(`/opentalk/room/${roomInfo.roomId}`);
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
                            naviagte(`/opentalk/room/${roomInfo.roomId}`);
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
                <RoomComponent roomInfo={roomInfo} talker={member} setIsChangeData={setIsUpdateTrigger}/>
            </div>
        );
    }

    const GoProfile = () => {
        if (userStatus){
            naviagte("/opentalk/profile");
        }
        else{
            window.alert("이미 로그아웃 되었습니다.")
            naviagte("/opentalk/member/login");
        }
        return (
            <ProfileComponent setIsUpdateData={setIsUpdateTrigger}/>
        )
    }

    const LogOut = () => {
        if (cookies['refresh-token'] !== ""){
            if (window.confirm("로그아웃 하시겠습니까?")){
                axios.post("/api/opentalk/auth/logout", {
                    headers: {'Authorization': 'Bearer ' + cookies['refresh-token']}
                }, {})
                .then((res) => {
                    if (res.status === 200){
                        window.alert("로그아웃 되었습니다.");
                        naviagte("/opentalk/member/login");
                    }
                })
                .catch((error) => console.log(error));
            }
        }
        else{
            alert("이미 로그아웃되었습니다.");
            naviagte("/opentalk/member/login");
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

        fetchAllMessages();
    },[isMessageBoxOpen])

   return (
    <Container>
        <Modal isOpen={isMessageBoxOpen} onRequestClose={closeModal}>
            <ListGroup>
            {messageList.map((_message) => (
                <ListGroupItem>방 이름: {_message.roomName}
                <br></br>방장: {_message.inviter}
                <br></br>메세지: {_message.message}
                <br></br>
                <Button>입장하기</Button>
                <Button variant='dark'>메세지 지우기</Button>
                </ListGroupItem>
            ))}
            </ListGroup> 
            <Button onClick={closeModal}>닫기</Button>
        </Modal>
        <Row className="justify-content-end">
            <Col xs={3} md={9} span={12} offset={12} lg="5" className="border border-warning border-3 rounded-3 p-5"
            style={{width:"300px", height: "500px"}}>
                <aside>
                    <div style={{ textAlign: 'center' }}>
                        <img alt="프로필 이미지" src={`${process.env.PUBLIC_URL}/profile_prototype.jpg`} ></img>
                        <p>환영합니다, {member?.memberNickName}님</p>
                    </div>
                    <div className="d-grid gap-2">
                        <Button variant="primary" onClick={GoProfile}>프로필 설정</Button>
                        <Button onClick={openMessageBox}>메세지함</Button>
                        <Button variant="dark" onClick={LogOut}>로그아웃</Button>
                    </div>
                </aside>
            </Col>
            <Col className="border border-warning border-3 rounded-3 p-5" style={{height: "850px"}}>
                <ListGroup>
                    {Array.isArray(chatRoomList) && chatRoomList.map(room=>(
                        <ListGroupItem>방 이름: {room.roomName} | 인원수: {room.curParticipates} / {room.limitParticipates}
                        {room.existLock && <img alt="잠금 이미지" src={`${process.env.PUBLIC_URL}/lock.jpg`} width={20}></img>}
                        <br></br>소개문: {room.introduction}
                        <br></br>방장: {room.roomManager}
                        <p>태그목록</p>
                        <ListGroup className="list-group list-group-horizontal">        
                        {room.roomTags.map(tag=>(
                            <ListGroupItem># {tag.tagName}</ListGroupItem>
                        ))}
                        </ListGroup>
                        <br></br>
                        <div className="d-grid gap-2">
                            <Button onClick={() => EnterRoom({roomInfo: room})}>입장하기</Button>
                            {room.roomManager === member.memberNickName && (
                            <Button variant="dark" onClick={() => deleteRoom({roomInfo: room})}>삭제하기</Button>
                            )}
                        </div>
                        
                    </ListGroupItem>
                    ))}
                </ListGroup>
            </Col>
        </Row>
        <Row className="justify-content-end">
            <Col>
                <br></br>
                <SetRoomComponent
                    onDataUpdate={setIsUpdateTrigger}
                />
                <br></br>
                <FormGroup>
                    <InputGroup>
                        <Form.Select 
                            onChange={selectMenuHandle} 
                            value={selectManu}
                            style={{flex: '1'}}
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
                            style={{flex: '5'}}></FormControl>
                        <Button onClick={search}>검색</Button>
                        {isSearch && (
                        <Button onClick={initSearch}>초기화</Button>
                    )}
                    </InputGroup>
                    
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