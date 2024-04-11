import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import SetRoomComponent from './setroom';
import RoomComponent from './room';
import {createBrowserHistory} from "history";

const MainComponent = () => {
    const ChatRoomRole = {
        PARTICIPATE: 'PARTICIPATE',
        MANAGER: 'MANAGER'
    };

    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);
    const [member, setMember] = useState("");
    const [chatList, setChatList] = useState([]);
    const [role, setRole] = useState();
    const [selectManu, setSelectManu] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [refresh, setRefresh] = useState(1);
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
        const fetchMainData = async () => {
            try{
                const meResponse = await axios.get('/api/opentalk/member/me', {
                    headers: {Authorization: 'Bearer ' + cookies.accessToken}
                });
                setMember(meResponse.data);
                const roomResponse = await axios.get('/api/opentalk/rooms');
                setChatList(roomResponse.data);
            } catch (error){
                console.error(error);
            }
        };

        fetchMainData();
    }, []);

    const GetInputSearchKeyword = (event) => {
        setSearchKeyword(event.target.value);
    }

    const selectMenuHandle = (event) => {
        setSelectManu(event.target.value);
    }

    const search = () => {

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
                if (res.status === 200){
                    naviagte(`/opentalk/room/${roomInfo.roomId}`);
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
                    if (res.data === true){
                        naviagte(`/opentalk/room/${roomInfo.roomId}`);
                    }
                    else{
                        window.alert("비밀번호가 잘못되었습니다.")
                    }
                })
                .catch((error) => console.log(error));
            }
           
        }
        return (
            <div>
                <RoomComponent roomInfo={roomInfo} talker={talker}/>
            </div>
        );
    }

    const GoProfile = () => {
        if (cookies.accessToken){
            naviagte("/opentalk/profile");
        }
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
    <div>
        <img alt="프로필 이미지" src={`${process.env.PUBLIC_URL}/profile_prototype.jpg`}></img>
        <p>환영합니다, {member.memberNickName}님</p>
        <ul>
            {chatList.map(room=>(
                <li key={room.roomId}>{room.roomName} | 인원수: {room.participates} / {room.limitParticipates}
                {room.existLock && <img alt="잠금 이미지" src={`${process.env.PUBLIC_URL}/lock.jpg`} width={20}></img>}
                <br></br>{room.introduction}
                <br></br>방장: {room.roomManager}
                <ul>
                    {room.roomTags.map(tag=>(
                        <li>#{tag.tagName}</li>
                    ))}
                </ul>
                <button onClick={() => EnterRoom({roomInfo: room, talker: member})}>입장하기</button>
                {room.roomManager === member.memberNickName && (
                <button onClick={() => deleteRoom({roomInfo: room})}>삭제하기</button>
            )}</li>
            ))}
        </ul>
        <SetRoomComponent />
        <button onClick={GoProfile}>프로필 설정</button>
        <button onClick={LogOut}>로그아웃</button>
        <br></br>
        <select value={selectManu} onChange={selectMenuHandle}>
            <option value="title">제목</option>
            <option value="tag">태그</option>
            <option value="manager">방장</option>
        </select>
        <input 
            type="text"
            value={searchKeyword}
            onChange={GetInputSearchKeyword}
        ></input>
        <button onClick={search}>검색</button>
    </div>

    );
}

export default MainComponent;