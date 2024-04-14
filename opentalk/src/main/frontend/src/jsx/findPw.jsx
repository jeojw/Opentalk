import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap';

const FindMemberPassword = (props) =>{
    const [memberEmail, setMemberEmail] = useState('');
    const [authNum, setAuthNum] = useState();
    const [inputNum, setInputNum] = useState();
    const navigate = useNavigate();

    const GetInputEmail = (event) =>{
        setMemberEmail(event.target.value);
    }

    const GetInputNum = (event) => {
        setInputNum(event.target.value);
    }

    const CheckMail = () =>{
        const checkUrl = `/api/opentalk/findPw/mailSend`
        axios.post(checkUrl, {
            email: memberEmail,
            sendType: "findPw"
        }).then((res)=>{
            setAuthNum(res.data);
        })
    }

    const CheckAuth = () =>{
        const checkUrl = `/api/opentalk/findPw/mailauthCheck`
        if (String(inputNum) !== String(authNum)){
            alert("인증이 실패하였습니다. 다시 시도해주십시오.")
        }
        else{
            axios.post(checkUrl, {
                email: memberEmail,
                authNum: String(authNum)
            }).then((res)=>{
                if (res.data === "ok"){
                    navigate("/opentalk/member/changePw", {state: {memberEmail: memberEmail}});
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
                <Col xs lg="5" md={{ span: 3, offset: 3 }} className="border border-warning border-3 rounded-3 p-5">
                <h3>비밀번호 찾기</h3>
                <Form>
                    <Form.Label>이메일</Form.Label>
                    <InputGroup>
                        <FormControl type='email' value={memberEmail} onChange={GetInputEmail}></FormControl>
                        <Button onClick={CheckMail}>인증번호 받기</Button>
                    </InputGroup>
                    <Form.Label>인증번호</Form.Label>
                    <InputGroup>
                        <FormControl type='text' value={inputNum} onChange={GetInputNum}></FormControl>
                        <Button onClick={CheckAuth}>인증하기</Button>
                    </InputGroup>
                </Form>
                </Col>
            </Row>
            
        </Container>
    );
}

export default FindMemberPassword;