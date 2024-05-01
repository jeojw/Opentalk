import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { themeContext } from './themeContext';

const ChangePasswordComponent = () =>{
    const { theme } = useContext(themeContext);
    const [memberEmail, setMemberEmail] = useState("");
    const [newPassword, setNewPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() =>{
        if (location.state && location.state.memberEmail){
            setMemberEmail(location.state.memberEmail);
        }
        else{
            navigate("/opentalk")
        }
    }, []);

    const GetInputPassword = (e) => {
        if (e.target.length <= 0){
            window.alert("한 글자 이상의 비밀번호를 입력해 주십시오.");
        }
        else{
            setNewPassword(e.target.value);
        }
    }

    const GetInputCheckPassword = (e) => {
        setCheckPassword(e.target.value);
    }

    const ChangePassword = (e) => {
        if (newPassword !== checkPassword){
            alert("비밀번호가 일치하지 않습니다.")
        }
        else{
            const PasswordData = new FormData();
            PasswordData.append("memberEmail", memberEmail);
            PasswordData.append("newPassword", newPassword);
            axios.post(`/api/opentalk/auth/changePassword`, PasswordData)
            .then((res)=>{
                if (res.status === 200){
                    window.alert("비밀번호가 변경되었습니다.")
                    navigate("/opentalk/login");
                }
            })
            .catch((error)=>console.log(error));
        }
    }

    return(
        <Container style={{ minHeight: '100vh'}}>
            <Row style={{position:"relative", bottom:"-5px"}}>
                <Col xs lg="4" md={{ span: 3, offset: 4 }} className="border-3 rounded-4 p-5" style={{backgroundColor:theme === 'light' ? "#7B7B7B" : "#595959"}}>
                    <h3 style={{color:"white"}}>비밀번호 변경하기</h3>
                    <Form>
                        <Form.Label style={{color:"white"}}>새 비밀번호</Form.Label>
                        <Form.Control
                            className='custom-ui' 
                            type='password' 
                            value={newPassword} 
                            onChange={GetInputPassword}
                        ></Form.Control>
                        <Form.Label style={{color:"white"}}>비밀번호 확인</Form.Label>
                        <Form.Control
                            className='custom-ui'  
                            type='password' 
                            value={checkPassword} 
                            onChange={GetInputCheckPassword}
                        ></Form.Control>
                    </Form>
                    <br></br>
                    <div className="d-grid gap-2">
                        <Button 
                            className='custom-button'
                            variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                            style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                     color:theme === 'light' ? "#000000" : "#FFFFFF"}} 
                            onClick={ChangePassword}>변경하기</Button>
                    </div>
                </Col>
            </Row>
            
        </Container>
    );
}

export default ChangePasswordComponent;