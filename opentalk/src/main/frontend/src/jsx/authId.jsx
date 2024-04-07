import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthIdComponent = () =>{
    const [memberId, setMemberId] = useState("");
    const navigate = useNavigate();

    const GetInputId = (e) => {
        const memberId = e.target.value;
        setMemberId(memberId);
    }

    const AuthId = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("memberId", memberId);
        const checkUrl = `/api/opentalk/auth/checkId`
        axios.post(checkUrl, data)
        .then((res) => {
            if (res.data){
                navigate("/opentalk/member/findPw")
            }
            else{
                alert("존재하지 않는 아이디입니다.")
            }
        })
        .catch((error) => console.log(error));
    }

    return (
        <div>
            <h2>아이디 확인하기</h2>
            <form onSubmit={AuthId}>
                <label>
                    아이디: <input type="text" value={memberId} onChange = {GetInputId}></input>
                    <br></br>
                    <input type="submit" value="확인하기" onClick={AuthId}></input>
                </label>
            </form>
        </div>
    );
}

export default AuthIdComponent;