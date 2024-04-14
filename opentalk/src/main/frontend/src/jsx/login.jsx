import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios'
import { useCookies } from 'react-cookie';
import { Form, Button, Container, Row, Col, InputGroup, FormGroup } from 'react-bootstrap';

const LoginComponent = (props) => {
    
    const [cookies, setCookie] = useCookies([]);
    const [memberId, setMemberId] = useState("");
    const [memberPw, setMemberPw] = useState("");
    const navigate = useNavigate();
    
    const CheckLogin = (e) => {
        const checkloginUrl = '/api/opentalk/member/login'

        if (memberId === ""){
            alert("아이디를 입력해주세요.")
        }
        else if (memberPw === ""){
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
                if (res.status === 200){
                    setCookie("accessToken", res.data.accessToken);
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
                <Col xs lg="3" md={{ span: 3, offset: 4 }} className="border border-warning border-3 rounded-3 p-5">
                    <h2>로그인</h2>
                    <Form onSubmit={CheckLogin}>
                        <FormGroup>
                            <Form.Label>아이디</Form.Label>
                            <Form.Control type="text" placeholder="아이디를 입력하세요" value={memberId} onChange={(e) => setMemberId(e.target.value)} />
                        </FormGroup>
                        <FormGroup>
                            <Form.Label>비밀번호</Form.Label>
                            <Form.Control type="password" placeholder="비밀번호를 입력하세요" value={memberPw} onChange={(e) => setMemberPw(e.target.value)} />
                        </FormGroup>
                        <div className="d-grid gap-2">
                            <Button variant="primary" onClick={CheckLogin} size='4'>로그인</Button>
                            <Button variant="dark" onClick={() => navigate("/opentalk/member/enroll")}>회원가입</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col md={{ span: 3, offset: 3 }}>
                    <Button variant="primary" onClick={() => navigate("/opentalk/member/findId")}>아이디 찾기</Button>
                    <Button variant="primary" onClick={() => navigate("/opentalk/member/authId")}>비밀번호 찾기</Button>
                </Col>
            </Row>
            <Row>
                <Col md={{ span: 3, offset: 3 }}>
                    <Button variant="primary" onClick={() => navigate("/opentalk/front")}>시작화면으로</Button>
                </Col>
            </Row>
        </Container>

    );
}

export default LoginComponent;