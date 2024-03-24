import React, {useState, useEffect} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const FrontComponent = (props) => {
    const navigate = useNavigate();

    const LinkToLogin = () =>{
        navigate("/opentalk/member/login")
    }

    const LinkToEnroll = () => {
        navigate("/opentalk/member/enroll")
    }

   return (
    <div>
        <h2>오픈톡방에 오신 것을 환영합니다!</h2>
        <div>
            <label>
                <input type='button' value="로그인" onClick={LinkToLogin}></input>
                <input type='button' value="회원가입" onClick={LinkToEnroll}></input>
            </label>
        </div>
    </div>

    );
}

export default FrontComponent;