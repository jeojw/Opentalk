import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios'

const LoginComponent = (props) => {
    
    const [memberId, setMemberId] = useState("");
    const [memberPw, setMemberPw] = useState("");
    const navigate = useNavigate();
    
    const CheckLogin = (e) => {
        fetch('/api/opentalk/member/login', {
            method: "POST",
            body: JSON.stringify({
                memberId: memberId,
                memberPassword: memberPw,
            }),
        })
        .then((response) => console.log(response.json()))
        .catch(error => {
            console.error("Error", error);
        })

        if (memberId == ""){
            alert("아이디를 입력해주세요.")
        }
        else if (memberPw == ""){
            alert("비밀번호를 입력해주세요.")
        }
        else{
            navigate("/opentalk/main")
        }
        
    }

    const CheckId = (e) => {
        setMemberId(e.nativeEvent.data);
    }

    const CheckPw = (e) => {
        setMemberPw(e.nativeEvent.data);
    }

   return (
    <div>
        <h2>로그인</h2>
        <div>
            <label for="memberId">아이디:</label>
            <input type='text' name='memberId' className="memberId" onChange={CheckId}></input>
            <br></br>
            <label for="memberPassword">비밀번호:</label>
            <input type="password" name="memberPassword" className='memberPassword' onChange={CheckPw}></input>
            <br></br>
            <label>
                <input type='submit' value="로그인" onClick={CheckLogin}></input>
            </label>
            <br></br>
            <button onClick={()=>navigate("opentalk/front")}>이전 페이지로</button>
        </div>
    </div>

    );
}

export default LoginComponent;