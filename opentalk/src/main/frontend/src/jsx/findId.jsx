import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Form, FormControl, InputGroup} from 'react-bootstrap';
import { themeContext } from './themeContext';

const FindMemberComponent = () => {
    const { theme } = useContext(themeContext);
    const [memberEmail, setMemberEmail] = useState('');
    const [authNum, setAuthNum] = useState('');
    const [inputNum, setInputNum] = useState('');
    const navigate = useNavigate();

    const GetInputEmail = (event) =>{
        setMemberEmail(event.target.value);
    }

    const GetInputNum = (event) => {
        setInputNum(event.target.value);
    }

    const CheckMail = () =>{
        const checkUrl = `/api/opentalk/findId/mailSend`
        axios.post(checkUrl, {
            email: memberEmail,
            sendType: "findId"
        })
        .then((res)=>{
            setAuthNum(res.data);
        })
        .catch((error) => console.log(error));
    }

    const CheckAuth = () =>{
        const checkUrl = `/api/opentalk/findId/mailauthCheck`
        if (String(authNum) !== String(inputNum)){
            window.alert("인증이 실패하였습니다. 다시 시도해주십시오.")
        }
        else{
            axios.post(checkUrl, {
                email: memberEmail,
                authNum: String(authNum)
            }).then((res)=>{
                const emailData = new FormData();
                emailData.append("memberEmail", memberEmail)
                if (res.data === "ok"){
                    axios.post(`/api/opentalk/findId`, emailData)
                    .then((res) => {
                        if (res.data !== "fail"){
                            window.alert(`회원님의 아이디는 ${res.data} 입니다.`)
                            navigate("/opentalk/login")
                        }
                        else{
                            window.alert(`존재하지 않는 회원입니다.`)
                            navigate("/opentalk/login")
                        }
                    })
                    .catch((error)=>console.log(error))
                    
                }
                else{
                    window.alert("인증이 실패하였습니다. 다시 시도해주십시오.")
                }
            }).catch((error) => console.log(error))
        }

    }
    return(
        <Container style={{ minHeight: '100vh'}}>
            <Row>
                <Col xs lg="5" md={{ span: 3, offset: 3 }} className="border-3 rounded-4 p-5" style={{backgroundColor: theme === 'light' ? "#7B7B7B" : "#595959"}}>
                <h3 style={{color:"white"}}>아이디 찾기</h3>
                <Form>
                    <Form.Label style={{color:"white"}}>이메일</Form.Label>
                    <InputGroup>
                        <FormControl
                            className='custom-ui'
                            type='email' 
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
                </Form>
                <Form>
                    <Form.Label style={{color:"white"}}>인증번호</Form.Label>
                    <InputGroup>
                        <FormControl
                            className='custom-ui' 
                            type='text' value={inputNum} onChange={GetInputNum}
                        ></FormControl>
                        <Button
                            className='custom-button'
                            variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                            style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                     color:theme === 'light' ? "#000000" : "#FFFFFF"}} 
                            onClick={CheckAuth}>인증하기</Button>
                    </InputGroup>
                </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default FindMemberComponent;