import React, {useState, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ChangePasswordComponent = () =>{
    const [memberEmail, setMemberEmail] = useState("");
    const [newPassword, setNewPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const location = useLocation();
    const naviagte = useNavigate();

    useEffect(() =>{
        if (location.state && location.state.memberEmail){
            setMemberEmail(location.state.memberEmail);
        }
    }, []);

    useEffect(()=> {
        
    }, []);

    const GetInputPassword = (e) => {
        setNewPassword(e.target.value);
    }

    const GetInputCheckPassword = (e) => {
        setCheckPassword(e.target.value);
    }

    const ChangePassword = (e) => {
        if (newPassword != checkPassword){
            alert("비밀번호가 일치하지 않습니다.")
        }
        else{
            const data = new FormData();
            data.append("memberEmail", memberEmail);
            axios.post("/api/opentalk/auth/exPassword", data)
            .then((res)=>{
                axios.post(`/api/opentalk/auth/changePassword`, {
                    exPassword: res.data,
                    newPassword: newPassword
                })
                .then((res)=>{
                    alert("비밀번호가 변경되었습니다.");
                    naviagte("/opentalk/member/login");
                })
                .catch((error) => console.log(error));
            })
            .catch((error)=>console.log(error));
        }
    }

    return(
        <div>
            <h2>비밀번호 변경하기</h2>
            <label>
                새로운 비밀번호: <input type="password" value={newPassword} onChange = {GetInputPassword}></input>
                <br></br>
                비밀번호 확인: <input type="password" value={checkPassword} onChange = {GetInputCheckPassword}></input>
                <br></br>
                <input type="button" value="변경하기" onClick={ChangePassword}></input>
            </label>
        </div>  
    );
}

export default ChangePasswordComponent;