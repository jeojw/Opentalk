import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FindMemberPassword = () =>{
    const [memberEmail, setMemberEmail] = useState('');
    const [authNum, setAuthNum] = useState('');
    const navigate = useNavigate();

    const GetInputEmail = (event) =>{
        setMemberEmail(event.target.value);
    }

    const CheckMail = () =>{
        const checkUrl = `/api/opentalk/findPw/mailSend`
        axios.post(checkUrl, {
            email: memberEmail,
            sendType: "findPw"
        }).then((res)=>{
            setAuthNum(res.data);
        })
    }

    const CheckAuth = () =>{
        const checkUrl = `/api/opentalk/findPw/mailauthCheck`
        axios.post(checkUrl, {
            email: memberEmail,
            authNum: String(authNum)
        }).then((res)=>{
            if (res.data == "ok"){
                navigate("/opentalk/member/changePw")
            }
            else{
                alert("인증이 실패하였습니다. 다시 시도해주십시오.")
            }
        }).catch((error) => console.log(error))
    }
    return(
        <div>
            <h2>회원정보 찾기</h2>
            <h3>비밀번호 찾기</h3>
            <label>
                이메일: <input type="email" value={memberEmail} onChange = {GetInputEmail}></input><input type="button" value="인증번호 받기" onClick={CheckMail}></input>
                <br></br>
                인증번호: <input type="text"></input><input type="button" value="인증하기" onClick={CheckAuth}></input>
            </label>
        </div>
    );
}

export default FindMemberPassword;