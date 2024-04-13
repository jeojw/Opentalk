import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { all } from 'axios';
import { useCookies } from 'react-cookie';
import SetRoomComponent from './setroom';
import RoomComponent from './room';
import {createBrowserHistory} from "history";
import Pagination from 'react-js-pagination';
import ProfileComponent from './profile';
import { Container, Row, Col, Button, Form, 
    FormControl, InputGroup, ListGroup, ListGroupItem, 
    FormGroup} from 'react-bootstrap';

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

    const postPerPage = 2;
    const indexOfLastPost = page * postPerPage;
    const indexOfFirstPost= indexOfLastPost - postPerPage;

    const [pageLength , setPageLength] = useState(0);

    const chatRoomLength = allChatRoomList.length;
    const handlePageChange = (page)=>{
        setPage(page);
    }

    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [member, setMember] = useState("");
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
            try{
                const meResponse = await axios.get('/api/opentalk/member/me', {
                    headers: {Authorization: 'Bearer ' + cookies.accessToken}
                });
                setMember(meResponse.data);
                console.log(meResponse.data);
            } catch (error){
                console.error(error);
            }
            console.log(member);
        };

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

    const EnterRoom = ({roomInfo, talker}) => {
        const enterUrl = '/api/opentalk/enterRoom';
        if (!roomInfo.existLock){
            let currentRole;
            console.log(roomInfo);
            if (roomInfo.manager === talker.memberNickName){
                currentRole = ChatRoomRole.MANAGER;
            }
            else{
                currentRole = ChatRoomRole.PARTICIPATE;
            }
            setRole(currentRole);
            axios.post(enterUrl, {
                chatroom: roomInfo, 
                member: talker,
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
                    member: talker,
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
        return (
            <div>
                <RoomComponent roomInfo={roomInfo} talker={talker} setIsChangeData={setIsUpdateTrigger}/>
            </div>
        );
    }

    const GoProfile = () => {
        if (cookies.accessToken){
            naviagte("/opentalk/profile");
        }
        return (
            <ProfileComponent setIsUpdateData={setIsUpdateTrigger}/>
        )
    }

    const LogOut = () => {
        if (cookies.accessToken){
            if (window.confirm("로그아웃 하시겠습니까?")){
                removeCookie('accessToken');
                window.alert("로그아웃 되었습니다.");
                naviagte("/opentalk/front");
            }
        }
        else{
            alert("이미 로그아웃되었습니다.");
            naviagte("/opentalk/front");
        }
        
    };

   return (
    <Container>
        <Row>
            <Col>
                <img alt="프로필 이미지" src={`${process.env.PUBLIC_URL}/profile_prototype.jpg`}></img>
                <p>환영합니다, {member.memberNickName}님</p>
                <Button onClick={GoProfile}>프로필 설정</Button>
                <Button onClick={LogOut}>로그아웃</Button>
                <ListGroup>
                    {Array.isArray(chatRoomList) && chatRoomList.map(room=>(

                        <ListGroupItem>{room.roomName} | 인원수: {room.curParticipates} / {room.limitParticipates}
                        {room.existLock && <img alt="잠금 이미지" src={`${process.env.PUBLIC_URL}/lock.jpg`} width={20}></img>}
                        <br></br>{room.introduction}
                        <br></br>방장: {room.roomManager}
                            <ListGroup>
                            {room.roomTags.map(tag=>(
                                <ListGroupItem>#{tag.tagName}</ListGroupItem>
                            ))}
                            </ListGroup>
                         <Button onClick={() => EnterRoom({roomInfo: room, talker: member})}>입장하기</Button>
                        {room.roomManager === member.memberNickName && (
                        <Button onClick={() => deleteRoom({roomInfo: room})}>삭제하기</Button>
                    )}
                    </ListGroupItem>
                    ))}
                </ListGroup>
                <SetRoomComponent
                    onDataUpdate={setIsUpdateTrigger}
                />
                <br></br>
                <FormGroup>
                    <Form.Select 
                        onChange={selectMenuHandle} 
                        value={selectManu}
                        size="sm"
                    >
                        {menuList.map((item) => {
                            return <option value={item.value} key={item.value}>
                                {item.name}
                            </option>;
                        })}
                    </Form.Select>
                    <InputGroup>
                        <FormControl type='text' value={searchKeyword} onChange={GetInputSearchKeyword}></FormControl>
                    </InputGroup>
                </FormGroup>
                
                <Button onClick={search}>검색</Button>
                {isSearch && (
                    <button onClick={initSearch}>초기화</button>
                )}
                <Pagination
                    activePage={page}
                    itemsCountPerPage={postPerPage}
                    totalItemsCount={pageLength}
                    pageRangeDisplayed={5}
                    prevPageText={"<"}
                    nextPageText={">"}
                 onChange={handlePageChange}
                />
            </Col>
        </Row>
        
    </Container>
    );
}

export default MainComponent;