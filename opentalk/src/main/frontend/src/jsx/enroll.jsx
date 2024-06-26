import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Form, FormControl, InputGroup,} from 'react-bootstrap';
import { themeContext } from './themeContext';

const EnrollComponent = () =>{
    const { theme } = useContext(themeContext);

    const [memberId, setMemberId] = useState('');
    const [memberPw, setMemberPw] = useState('');
    const [memberName, setMemberName] = useState('');
    const [memberNickName, setMemberNickName] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [authNum, setAuthNum] = useState();
    const [inputNum, setInputNum] = useState();

    const [checkPw, setCheckPw] = useState(false);
    const [checkName, setCheckName] = useState(false);
    const [checkId, setCheckId] = useState(false);
    const [checkNickName, setCheckNickName] = useState(false);
    const [checkEmail, setCheckEmail] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const GetInputId = (event) =>{
        setMemberId(event.target.value);
    }

    const GetInputPw = (event) =>{
        if (event.target.length <= 0){
            setCheckPw(false);
        }
        else{
            setMemberPw(event.target.value);
            setCheckPw(true);
        }   
    }

    const GetInputName = (event) =>{
        if (event.target.length <= 0){
            setCheckName(false);
        }
        else{
            setCheckName(true);
            setMemberName(event.target.value);
        }
    }

    const GetInputNickName = (event) =>{
        setMemberNickName(event.target.value);
    }

    const GetInputEmail = (event) =>{
        setMemberEmail(event.target.value);
    }

    const GetInputNum = (event) => {
        setInputNum(event.target.value);
    }

    const CheckIdDuplicate = () => {
        if (memberId.length <= 0){
            window.alert("한 글자 이상의 아이디를 입력해 주십시오.");
        }
        else{
            const data = new FormData();
            data.append("memberId", memberId);
            const checkUrl = `/api/opentalk/auth/signup/checkId`;
            axios.post(checkUrl, data).then((res)=>{
                if (res.data === true){
                    window.alert("중복된 아이디입니다.");
                    setCheckId(false);
                }
                else{
                    window.alert("사용 가능한 아이디입니다.");
                    setCheckId(true);
                }
            }).catch((error)=>console.log(error))
        }
    }

    const CheckNickNameDuplicate = () =>{
        if (memberNickName <= 0){
            window.alert("한 글자 이상의 닉네임을 입력해 주십시오.");
        }
        else{
            const data = new FormData();
            data.append("memberNickName", memberNickName);
            const checkUrl = `/api/opentalk/auth/signup/checkNickName`;
            axios.post(checkUrl, data).then((res)=>{
                if (res.data === true){
                    window.alert("중복된 닉네임입니다.");
                    setCheckNickName(false);
                }
                else{
                    window.alert("사용 가능한 닉네임입니다.");
                    setCheckNickName(true);
                }
            }).catch((error)=>console.log(error))
        }
        
    }

    const CheckMail = () =>{
        const duplicateUrl = '/api/opentalk/auth/signup/checkEmail'
        const data = new FormData();
        data.append("memberEmail", memberEmail);
        axios.post(duplicateUrl, data)
        .then((res)=>{
            if (res.data === true){
                window.alert("이미 사용중인 이메일입니다.");
            }
            else{
                const checkUrl = `/api/opentalk/enroll/mailSend`
                axios.post(checkUrl, {
                    email: memberEmail,
                    sendType: "enroll"
                }).then((res)=>{
                    setAuthNum(res.data);
                })
            }
        })
        .catch((error) => console.log(error));
    }

    const CheckAuth = () =>{
        if (inputNum.toString() !== authNum.toString()){
            window.alert("인증에 실패하였습니다. 다시 시도해주십시오.");
            setCheckEmail(false);
        }
        else{
            const checkUrl = `/api/opentalk/enroll/mailauthCheck`
            axios.post(checkUrl, {
                email: memberEmail,
                authNum: String(authNum)
            }).then((res)=>{
                if (res.data === "ok"){
                    window.alert("인증되었습니다.");
                    setCheckEmail(true);
                }
                else{
                    if (checkEmail){
                        window.alert("이미 인증되었습니다.");
                    }
                    else{
                        window.alert("인증이 실패하였습니다. 다시 시도해주십시오.");
                        setCheckEmail(false);
                    }
                }
            })
        }
    }

    const CheckAll = () =>{
        if (!checkId){
            window.alert("아이디 중복 체크를 진행해 주십시오.");
        }
        else if (!checkPw){
            window.alert("한 글자 이상의 비밀번호를 입력해 주십시오.");
        }
        else if (!checkName){
            window.alert("한 글자 이상의 이름을 입력해 주십시오.");
        }
        else if (!checkNickName){
            window.alert("닉네임 중복 체크를 진행해 주십시오.");
        }
        else if (!checkEmail){
            window.alert("이메일 인증을 진행해 주십시오.");
        }
        else{
            const url = `/api/opentalk/auth/signup`;
            axios.post(url,{
                memberId: memberId,
                memberPassword: memberPw,
                memberName: memberName,
                memberNickName: memberNickName,
                memberEmail: memberEmail,
                imgUrl: "https://storage.googleapis.com/opentalk-bucket/profile_prototype"
            }).then((res)=>{
    
            }).catch((error)=> {
                if (error.response){
                    setErrorMessage(error.response.data);
                } else{
                    setErrorMessage("");
                    console.log(error);
                }
            });
            window.alert("회원가입이 완료되었습니다.")
            navigate("/opentalk/login");
        }
        
    }

    return(
        <Container style={{ minHeight: '100vh'}}>
            <Row style={{position:"relative", bottom:"-5px"}}>
                <Col md={{ span: 6, offset: 3 }} className="border-3 rounded-4 p-5" style={{backgroundColor:theme === 'light' ? "#7B7B7B" : "#595959"}}>
                    <h2 style={{color:"white"}}>회원가입</h2>
                    <Form.Label style={{color:"white"}}>아이디</Form.Label>
                    <InputGroup>
                        <FormControl
                            className='custom-ui'
                            type="text"
                            value={memberId}
                            onChange={GetInputId}
                        ></FormControl>
                        <Button
                            className='custom-button'
                            variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                            style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                     color:theme === 'light' ? "#000000" : "#FFFFFF"}} 
                            onClick={CheckIdDuplicate}>중복 확인</Button>
                    </InputGroup>
                    <Form.Label style={{color:"white"}}>비밀번호</Form.Label>
                    <InputGroup>
                        <FormControl
                            className='custom-ui'
                            type="password"
                            value={memberPw}
                            onChange={GetInputPw}
                        ></FormControl>
                    </InputGroup>
                    <Form.Label style={{color:"white"}}>이름</Form.Label>
                    <InputGroup>
                        <FormControl
                            className='custom-ui'
                            type="text"
                            value={memberName}
                            onChange={GetInputName}
                        ></FormControl>
                    </InputGroup>
                    <Form.Label style={{color:"white"}}>닉네임</Form.Label>
                    <InputGroup>
                        <FormControl
                            className='custom-ui'
                            type="text"
                            value={memberNickName}
                            onChange={GetInputNickName}
                        ></FormControl>
                        <Button 
                            className='custom-button'
                            variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                            style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                     color:theme === 'light' ? "#000000" : "#FFFFFF"}} 
                            onClick={CheckNickNameDuplicate}>중복 확인</Button>
                    </InputGroup>
                    <Form.Label style={{color:"white"}}>이메일</Form.Label>
                    <InputGroup>
                        <FormControl
                            className='custom-ui'
                            type="email"
                            value={memberEmail}
                            onChange={GetInputEmail}
                        ></FormControl>
                        <Button
                            className='custom-button'
                            variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                            style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                     color:theme === 'light' ? "#000000" : "#FFFFFF"}} 
                            onClick={CheckMail}>인증번호 받기</Button>
                    </InputGroup>
                    <Form.Label style={{color:"white"}}>인증번호</Form.Label>
                    <InputGroup>
                        <FormControl
                            className='custom-ui'
                            type="text"
                            value={inputNum}
                            onChange={GetInputNum}
                        ></FormControl>
                        <Button
                            className='custom-button' 
                            variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                            style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                     color:theme === 'light' ? "#000000" : "#FFFFFF"}} 
                            onClick={CheckAuth}>인증하기</Button>
                    </InputGroup>
                    <br></br>
                    <Button
                        className='custom-button' 
                        variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                        style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                 color:theme === 'light' ? "#000000" : "#FFFFFF"}} 
                        onClick={CheckAll}><strong>회원가입</strong></Button>
                </Col>
            </Row>
        </Container>
    );
}
export default EnrollComponent;