import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios'
import { Form, Button, Container, Row, Col, FormGroup } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

const LoginComponent = () => {
    const [memberId, setMemberId] = useState("");
    const [memberPw, setMemberPw] = useState("");
    const [isForget, setIsForget] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        if (localStorage.getItem("token")){
            navigate("/opentalk/main");
        }
    },[])

    const isDesktopOrLaptop = useMediaQuery({
        query: '(min-device-width: 1224px)'
    });

    const isMobile = useMediaQuery({
        query: '(min-device-width: 768px)'
    });

    
    const CheckLogin = (e) => {
        const checkloginUrl = '/api/opentalk/auth/login'

        if (memberId === ""){
            window.alert("아이디를 입력해주세요.");
        }
        else if (memberPw === ""){
            window.alert("비밀번호를 입력해주세요.");
        }
        else{
            axios.post(checkloginUrl, {
                memberId: memberId,
                memberPassword: memberPw,
            })
            .then((res) => {
                if (res.status === 200){
                    localStorage.setItem("token", res.headers['authorization']);
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

   return (
        <Container style={{ minHeight: '100vh'}}>
            <Row>
                <Col md={{ span: 3, offset: 4 }} className="border border-#7B7B7B border-3 rounded-1 p-5" style={{backgroundColor:"#7B7B7B"}}>
                    <h2 style={{color:"white"}}>
                        <strong>로그인</strong>
                    </h2>
                    <hr/>
                    <Form onSubmit={CheckLogin}>
                        <FormGroup>
                            <Form.Label style={{color:"white"}}><strong>아이디</strong></Form.Label>
                            <Form.Control
                                className='custom-ui'
                                type="text" 
                                placeholder="아이디를 입력하세요" 
                                value={memberId} onChange={(e) => setMemberId(e.target.value)} />
                        </FormGroup>
                        <FormGroup>
                            <Form.Label style={{color:"white"}}><strong>비밀번호</strong></Form.Label>
                            <Form.Control 
                                className='custom-ui' 
                                type="password" 
                                placeholder="비밀번호를 입력하세요" 
                                value={memberPw} 
                                onChange={(e) => setMemberPw(e.target.value)} />
                        </FormGroup>
                        <hr/>
                        <div className="d-grid gap-2">
                            <Button
                                className='custom-button' 
                                variant='#CDCDCD' 
                                style={{ backgroundColor:"#CDCDCD" }} 
                                onClick={CheckLogin} size='4'>로그인</Button>
                            <Button
                                className='custom-button' 
                                variant='#E0E0E0' 
                                style={{ backgroundColor:"#E0E0E0" }} 
                                onClick={() => navigate("/opentalk/enroll")}>회원가입</Button>
                            <Button
                                className='custom-button' 
                                variant='warning' 
                                onClick={() => setIsForget(prevState => !prevState)}>계정을 잊어버리셨나요?</Button>
                            {isForget && (
                            <div className="d-grid gap-2">
                                <Button
                                    className='custom-button' 
                                    variant='warning' 
                                    onClick={() => navigate("/opentalk/findId")}>아이디 찾기</Button>
                                <Button
                                    className='custom-button'  
                                    variant='warning' 
                                    onClick={() => navigate("/opentalk/authId")}>비밀번호 찾기</Button>
                            </div>
                            )}
                            <Button variant='dark' 
                                className='custom-button'
                                onClick={() => navigate("/opentalk")}>시작화면으로</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginComponent;