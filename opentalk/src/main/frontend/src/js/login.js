import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios'

const LoginComponent = (props) => {
    
    const [memberId, setMemberId] = useState("");
    const [memberPw, setMemberPw] = useState("");
    const [loginCheck, setloginCheck] = useState(false);
    const navigate = useNavigate();
    
    const CheckLogin = (e) => {
        const checkloginUrl = `/api/opentalk/member/checkLogin/${memberId}/${memberPw}`

        if (memberId == ""){
            alert("아이디를 입력해주세요.")
        }
        else if (memberPw == ""){
            alert("비밀번호를 입력해주세요.")
        }
        else{
            const assessToken = ""
            axios.get(checkloginUrl)
            .then((res) => {
                    if (!res.data){
                        alert("아이디 혹은 비밀번호가 잘못되었습니다.")
                        setloginCheck(false);
                    }
                    else{
                        setloginCheck(true);
                        assessToken = res.data.token;
                    }
                })
            .catch((error)=>console.log(error));
        }
        if (loginCheck) {
            navigate("/opentalk/main")
        }
        
    }

    const SearchMember = (e) =>{

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