import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthIdComponent from "./authId"

const ChangePasswordComponent = () =>{
    const [showAuthIdComponent, setShowAuthIdComponent] = useState(false);
    const [memberId, setMemberId] = useState("");
    const [prePassword, setPrePassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const naviagte = useNavigate();

    const GetInputPassword = (e) => {
        setNewPassword(e.target.value);
    }

    const GetInputCheckPassword = (e) => {
        setCheckPassword(e.target.value);
    }

    const handleMemberIdChange = (memberId) => {
        setMemberId(memberId);
    }

    const ChangePassword = (e) => {
        if (newPassword != checkPassword){
            alert("비밀번호가 일치하지 않습니다.")
        }
        else{
            const checkUrl = `/api/opentalk/member/changePw/`
            handleMemberIdChange(memberId);
            console.log(memberId);
            axios.post(checkUrl + `${memberId}`, {})
            .then((res)=>{
                setPrePassword(res.data);
                axios.post(checkUrl + `${prePassword}/${newPassword}`, {})
                .then((res)=>{
                    if (res.data){
                        alert("비밀번호가 변경되었습니다.");
                        naviagte("/opentalk/member/login");
                    }
                })
                .catch((error) => console.log(error));
            })
            .catch((error)=>console.log(error));
        }
    }

    return(
        <div>
            <h2>비밀번호 변경하기</h2>
            {showAuthIdComponent && <AuthIdComponent onMemberIdChange={handleMemberIdChange} />}
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