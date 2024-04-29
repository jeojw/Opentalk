import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap';

const FindMemberPassword = () =>{
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
            window.alert("인증이 실패하였습니다. 다시 시도해주십시오.")
        }
        else{
            axios.post(checkUrl, {
                email: memberEmail,
                authNum: String(authNum)
            }).then((res)=>{
                if (res.data === "ok"){
                    navigate("/opentalk/changePw", {state: {memberEmail: memberEmail}});
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
                <Col xs lg="5" md={{ span: 3, offset: 3 }} className="border border-#7B7B7B border-3 rounded-1 p-5" style={{backgroundColor:"#7B7B7B"}}>
                <h3 style={{color:"white"}}>비밀번호 찾기</h3>
                <Form>
                    <Form.Label style={{color:"white"}}>이메일</Form.Label>
                    <InputGroup>
                        <FormControl type='email' value={memberEmail} onChange={GetInputEmail}
                        style={{borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px"
                                }}></FormControl>
                        <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD", 
                                                        borderTopRightRadius: "25px",
                                                        borderBottomRightRadius: "25px"}} onClick={CheckMail}>인증번호 받기</Button>
                    </InputGroup>
                    <Form.Label style={{color:"white"}}>인증번호</Form.Label>
                    <InputGroup>
                        <FormControl type='text' value={inputNum} onChange={GetInputNum}
                        style={{borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px"
                                }}></FormControl>
                        <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD", 
                                                        borderTopRightRadius: "25px",
                                                        borderBottomRightRadius: "25px"}} onClick={CheckAuth}>인증하기</Button>
                    </InputGroup>
                </Form>
                </Col>
            </Row>
            
        </Container>
    );
}

export default FindMemberPassword;