import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios'
import { useCookies } from 'react-cookie';

const LoginComponent = (props) => {
    
    const [cookies, setCookie] = useCookies([]);
    const [memberId, setMemberId] = useState("");
    const [memberPw, setMemberPw] = useState("");
    const navigate = useNavigate();
    
    const CheckLogin = (e) => {
        const checkloginUrl = '/api/opentalk/member/login'

        if (memberId == ""){
            alert("아이디를 입력해주세요.")
        }
        else if (memberPw == ""){
            alert("비밀번호를 입력해주세요.")
        }
        else{
            axios.post(checkloginUrl, {
                "id":"null",
                "memberId": memberId,
                "memberPassword": memberPw,
                "memberName": "null",
                "memberNickName": "null",
                "memberEmail": "null",
                "joinDate": "null"
            })
            .then((res) => {
                if (res.status == 200){
                    setCookie('member', `${memberId}`);
                    navigate("/opentalk/main");
                }
            })
            .catch((error)=>{
                if (error.response && error.response.status === 401) {
                    alert("아이디 혹은 비밀번호가 잘못되었습니다.");
                } else {
                    console.error('Error:', error);
                }
            });
        }
        
    }

    const InputId = (e) => {
        setMemberId(e.target.value);
    }

    const InputPw = (e) => {
        setMemberPw(e.target.value);
    }

   return (
    <div>
        <h2>로그인</h2>
        <div>
            <label for="memberId">아이디:</label>
            <input type='text' name='memberId' className="memberId" onChange={InputId}></input>
            <br></br>
            <label for="memberPassword">비밀번호:</label>
            <input type="password" name="memberPassword" className='memberPassword' onChange={InputPw}></input>
            <br></br>
            <label>
                <input type='submit' value="로그인" onClick={CheckLogin}></input>
            </label>
            <label>
                <input type='submit' value="아이디 찾기" onClick={()=>navigate("/opentalk/member/findId")}></input>
            </label>
            <label>
                <input type='submit' value="비밀번호 찾기" onClick={()=>navigate("/opentalk/member/authId")}></input>
            </label>
            <label>
                <input type='submit' value="회원가입" onClick={()=>navigate("/opentalk/member/enroll")}></input>
            </label>
            <br></br>
            <button onClick={()=>navigate("/opentalk/front")}>시작화면으로</button>
        </div>
    </div>

    );
}

export default LoginComponent;