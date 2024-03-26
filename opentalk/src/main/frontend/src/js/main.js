import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import SetRoomComponent from './setroom';

const MainComponent = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['member']);
    const [member, setMember] = useState("");
    const [chatList, setChetList] = useState([]);
    const naviagte = useNavigate();

    useEffect(() => {
        const fetchMemberStatus = async () => {
            try{
                const response = await axios.get('/api/opentalk/member/status');
                setMember(response.data);
                console.log(member);
            } catch (error) {
                console.error(error);
            }
        };

        fetchMemberStatus();
    }, []);

    useEffect(() => {
        const Rooms = async () => {
            try{
                const response = await axios.post('/api/opentalk/rooms', {})
                setChetList(response.data);
            } catch(error){
                console.error(error);
            }
        };

        Rooms();
    }, []);


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
            <p>환영합니다, {member.memberNickName}님</p>
            <ul>
                {chatList.map(room=>(
                    <li key={room.id}>{room.name}</li>
                ))}
            </ul>
        </table>
        <SetRoomComponent target={member} />
        <button onClick={LogOut}>로그아웃</button>
    </div>

    );
}

export default MainComponent;