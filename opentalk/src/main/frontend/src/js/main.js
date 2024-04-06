import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [inputPw, setInputPw] = useState("");
    const [role, setRole] = useState();
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

    const EnterRoom = ({roomInfo, talker}) => {
        const enterUrl = '/api/opentalk/enterRoom';
        if (!roomInfo.existLock){
            let currentRole;
            if (roomInfo.manager === talker.memberId){
                currentRole = ChatRoomRole.MANAGER;
            }
            else{
                currentRole = ChatRoomRole.PARTICIPATE;
            }
            setRole(currentRole);
            console.log(talker.memberId);
            axios.post(enterUrl, {
                chatroom: roomInfo, 
                member: {
                    roomId: roomInfo.roomId,
                    memberId: talker.memberId,
                    memberNickName: talker.memberNickName,
                    role: role
                }
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
            setInputPw(inputPassword);
            if (inputPw === ""){
                window.alert("비밀번호를 입력해주세요.")
            }else{
                axios.post(enterUrl + `/${inputPw}`, {
                    chatroom: roomInfo, 
                    member: {
                        roomId: roomInfo.roomId,
                        memberId: talker.memberId,
                        memberNickName: talker.memberNickName,
                        role: role
                    }
                })
                .then((res) => {
                    if (res.status === 200){
                        naviagte(`/opentalk/room/${roomInfo.roomId}`);
                    }
                    else{
                        alert("비밀번호가 잘못되었습니다.")
                        setInputPw("");
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


    useEffect(() => {
        const fetchMemberStatus = async () => {
            try{
                const response = await axios.get('/api/opentalk/member/me', {
                    headers: {Authorization: 'Bearer ' + cookies.accessToken}
                });
                setMember(response.data);
                console.log(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchMemberStatus();
    }, []);

    useEffect(() => {
        const fetchChatRooms = async () => {
            try{
                const response = await axios.get('/api/opentalk/rooms');
                setChatList(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchChatRooms();
    }, []);

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
        }
        
    };

   return (
    <div>
        <table>
            <img alt="프로필 이미지" src={`${process.env.PUBLIC_URL}/profile_prototype.jpg`}></img>
            <p>환영합니다, {member.memberNickName}님</p>
            <ul>
                {chatList.map(room=>(
                    <li key={room.roomId}>{room.roomName}
                    {room.existLock && <img alt="잠금 이미지" src={`${process.env.PUBLIC_URL}/lock.jpg`} width={20}></img>}
                    <br></br>{room.introduction}
                    <br></br>{room.roomTags}
                    <button onClick={() => EnterRoom({roomInfo: room, talker: member})}>입장하기</button></li>
                ))}
            </ul>
        </table>
        <SetRoomComponent getManager={member} />
        <button onClick={GoProfile}>프로필 설정</button>
        <button onClick={LogOut}>로그아웃</button>
    </div>

    );
}

export default MainComponent;