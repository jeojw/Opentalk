import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const MainComponent = (props) => {
    const [cookies, setCookie, removeCookie] = useCookies(['member']);
    const [member, setMember] = useState("");
    const naviagte = useNavigate();

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

    const MakeRoom = () => {
        window()
    };

   return (
    <div>
        <table>
            <tbody>
                <p>환영합니다, {member.memberNickName}</p>
            </tbody>
        </table>
        <button onClick={MakeRoom}>방 생성하기</button>
        <button onClick={LogOut}>로그아웃</button>
    </div>

    );
}

export default MainComponent;