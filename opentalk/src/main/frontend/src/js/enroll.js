import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const EnrollComponent = (props) =>{
    const [memberId, setMemberId] = useState('');
    const [memberPw, setMemberPw] = useState('');
    const [memberName, setMemberName] = useState('');
    const [memberNickName, setMemberNickName] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [authNum, setAuthNum] = useState('');

    const [checkId, setCheckId] = useState(false);
    const [checkNickName, setCheckNickName] = useState(false);
    const [checkEmail, setCheckEmail] = useState(false);
    const navigate = useNavigate();

    const GetInputId = (event) =>{
        setMemberId(event.target.value);
    }

    const GetInputPw = (event) =>{
        setMemberPw(event.target.value);
    }

    const GetInputName = (event) =>{
        setMemberName(event.target.value);
    }

    const GetInputNickName = (event) =>{
        setMemberNickName(event.target.value);
    }

    const GetInputEmail = (event) =>{
        setMemberEmail(event.target.value);
    }

    const CheckIdDuplicate = () => {
        const checkUrl = `/api/opentalk/member/id/${memberId}`
        axios.get(checkUrl).then((res)=>{
            if (res.data === true){
                alert("중복된 아이디입니다.");
                setCheckId(false);
            }
            else{
                alert("사용 가능한 아이디입니다.");
                setCheckId(true);
            }
        }).catch((error)=>console.log(error))
    }

    const CheckNickNameDuplicate = () =>{
        const checkUrl = `/api/opentalk/member/nickname/${memberNickName}`
        axios.get(checkUrl).then((res)=>{
            if (res.data === true){
                alert("중복된 닉네임입니다.");
                setCheckNickName(false);
            }
            else{
                alert("사용 가능한 닉네임입니다.");
                setCheckNickName(true);
            }
        }).catch((error)=>console.log(error))
    }

    const CheckMail = () =>{
        const checkUrl = `/api/opentalk/enroll/mailSend`
        axios.post(checkUrl, {
            email: memberEmail,
            sendType: "enroll"
        }).then((res)=>{
            setAuthNum(res.data);
        })
    }

    const CheckAuth = () =>{
        const checkUrl = `/api/opentalk/enroll/mailauthCheck`
        axios.post(checkUrl, {
            email: memberEmail,
            authNum: String(authNum)
        }).then((res)=>{
            if (res.data === "ok"){
                alert("인증되었습니다.");
                setCheckEmail(true);
            }
            else{
                if (checkEmail){
                    alert("이미 인증되었습니다.");
                }
                else{
                    alert("인증이 실패하였습니다. 다시 시도해주십시오.");
                    setCheckEmail(false);
                }
            }
        })
    }

    const CheckAll = () =>{
        if (!checkId){
            alert("아이디 중복 체크를 진행해 주십시오.");
        }
        else if (!checkNickName){
            alert("닉네임 중복 체크를 진행해 주십시오.");
        }
        else if (!checkEmail){
            alert("이메일 인증을 진행해 주십시오.");
        }
        else{
            const url = `/api/opentalk/member/enroll`;
            axios.post(url,{
                memberId: memberId,
                memberPassword: memberPw,
                memberName: memberName,
                memberNickName: memberNickName,
                memberEmail: memberEmail
            }).then((res)=>{
    
            }).catch((error)=>console.log(error));
            alert("회원가입이 완료되었습니다.")
            navigate("/opentalk/member/login");
        }
        
    }

    return(
        <div>
            <h2>회원가입</h2>
            아이디: <label>
            <input
                type="text"
                value={memberId}
                onChange={GetInputId}></input>
            <input type="button" value="아이디 중복 확인" onClick={CheckIdDuplicate}></input>
            </label>
            <br></br>
            비밀번호: <label>
                <input
                type="password"
                value={memberPw}
                onChange={GetInputPw}></input>
            </label>
            <br></br>
            이름: <label>
                <input
                type="text"
                value={memberName}
                onChange={GetInputName}></input>
            </label>
            <br></br>
            닉네임: <input
            type="text"
            value={memberNickName}
            onChange={GetInputNickName}></input>
            <input type="button" value="닉네임 중복 확인" onClick={CheckNickNameDuplicate}></input>
            <br></br>
            이메일: <input
            type="email"
            value={memberEmail}
            onChange={GetInputEmail}></input>
            <input type="button" value="이메일 인증번호 받기" onClick={CheckMail}></input>
            <br></br>
            인증번호: <input type="text"></input><input type="button" value="인증하기" onClick={CheckAuth}></input>
            <br></br>
            <input type="button" value="회원가입" onClick={CheckAll}></input>
        </div>
    );
}
export default EnrollComponent;