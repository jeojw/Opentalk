import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios'
import { useCookies } from 'react-cookie';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

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
    <Container>
            <Row>
                <Col>
                    <h2>로그인</h2>
                    <Form>
                        <Form.Group controlId="formMemberId">
                            <Form.Label>아이디:</Form.Label>
                            <Form.Control type="text" placeholder="아이디를 입력하세요" value={memberId} onChange={(e) => setMemberId(e.target.value)} />
                        </Form.Group>

                        <Form.Group controlId="formMemberPassword">
                            <Form.Label>비밀번호:</Form.Label>
                            <Form.Control type="password" placeholder="비밀번호를 입력하세요" value={memberPw} onChange={(e) => setMemberPw(e.target.value)} />
                        </Form.Group>

                        <Button variant="primary" type="button" onClick={CheckLogin}>로그인</Button>
                        <Button variant="primary" type="button" onClick={() => navigate("/opentalk/member/enroll")}>회원가입</Button>
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="primary" type="button" onClick={() => navigate("/opentalk/member/findId")}>아이디 찾기</Button>
                    <Button variant="primary" type="button" onClick={() => navigate("/opentalk/member/authId")}>비밀번호 찾기</Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="primary" onClick={() => navigate("/opentalk/front")}>시작화면으로</Button>
                </Col>
            </Row>
        </Container>

    );
}

export default LoginComponent;