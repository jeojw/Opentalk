import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import SetRoomComponent from './setroom';
import RoomComponent from './room';

const MainComponent = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['member']);
    const [member, setMember] = useState("");
    const [chatList, setChatList] = useState([]);
    const naviagte = useNavigate();


    const EnterRoom = ({room}) => {
        return (
            <div>
                <RoomComponent roomInfo={room}/>
                {naviagte(`/opentalk/room/${room.roomId}`)}
            </div>
        );
    }


    useEffect(() => {
        const fetchMemberStatus = async () => {
            try{
                const response = await axios.get('/api/opentalk/member/status');
                setMember(response.data);
            } catch (error) {
                console.error(error);
            }
            console.log(member);
        };

        fetchMemberStatus();
    }, []);

    useEffect(() => {
        const fetchChatRooms = async () => {
            try{
                const response = await axios.get('/api/opentalk/rooms');
                console.log(response.data);
                setChatList(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchChatRooms();
    }, []);

    const GoProfile = () => {
        if (cookies.member){
            naviagte("/opentalk/profile");
        }
    }


    const LogOut = () => {
        if (cookies.member){
            if (window.confirm("로그아웃 하시겠습니까?")){
                axios.post("/api/opentalk/member/logout", {})
                .then((res)=>{
                    removeCookie('member');
                    window.alert("로그아웃 되었습니다.");
                    naviagte("/opentalk/front");
                })
                .catch((error)=>console.log(error));
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
                    <li key={room.roomId}>{room.roomName}&nbsp;<button onClick={() => EnterRoom({room})}>입장하기</button></li>
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