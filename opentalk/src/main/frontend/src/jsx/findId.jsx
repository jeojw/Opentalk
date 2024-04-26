import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Form, FormControl, InputGroup} from 'react-bootstrap';

const FindMemberComponent = () => {
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
            alert("인증이 실패하였습니다. 다시 시도해주십시오.")
        }
        else{
            axios.post(checkUrl, {
                email: memberEmail,
                authNum: String(authNum)
            }).then((res)=>{
                const emailData = new FormData();
                emailData.append("memberEmail", memberEmail)
                console.log(emailData);
                if (res.data === "ok"){
                    axios.post(`/api/opentalk/member/findId`, emailData)
                    .then((res) => {
                        if (res.data !== "fail"){
                            window.alert(`회원님의 아이디는 ${res.data} 입니다.`)
                            navigate("/opentalk/member/login")
                        }
                        else{
                            window.alert(`존재하지 않는 회원입니다.`)
                            navigate("/opentalk/member/login")
                        }
                    })
                    .catch((error)=>console.log(error))
                    
                }
                else{
                    alert("인증이 실패하였습니다. 다시 시도해주십시오.")
                }
            }).catch((error) => console.log(error))
        }

    }
    return(
        <Container style={{ minHeight: '100vh'}}>
            <Row>
                <Col xs lg="5" md={{ span: 3, offset: 3 }} className="border border-#7B7B7B border-3 rounded-1 p-5" style={{backgroundColor:"#7B7B7B"}}>
                <h3 style={{color:"white"}}>아이디 찾기</h3>
                <Form>
                    <Form.Label style={{color:"white"}}>이메일</Form.Label>
                    <InputGroup>
                        <FormControl type='email' value={memberEmail} onChange={GetInputEmail}
                        style={{borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                }}></FormControl>
                        <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD", 
                                                            borderTopRightRadius: "25px",
                                                            borderBottomRightRadius: "25px",
                                                        }} onClick={CheckMail}>인증번호 받기</Button>
                    </InputGroup>
                </Form>
                <Form>
                    <Form.Label style={{color:"white"}}>인증번호</Form.Label>
                    <InputGroup>
                        <FormControl type='text' value={inputNum} onChange={GetInputNum}
                        style={{borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                }}></FormControl>
                        <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD", 
                                                            borderTopRightRadius: "25px",
                                                            borderBottomRightRadius: "25px",
                                                        }} onClick={CheckAuth}>인증하기</Button>
                    </InputGroup>
                </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default FindMemberComponent;