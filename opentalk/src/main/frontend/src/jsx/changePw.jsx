import React, {useState, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Form, 
    FormControl, InputGroup, ListGroup, ListGroupItem, 
    FormGroup} from 'react-bootstrap';

const ChangePasswordComponent = () =>{
    const [memberEmail, setMemberEmail] = useState("");
    const [newPassword, setNewPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const location = useLocation();
    const naviagte = useNavigate();

    useEffect(() =>{
        if (location.state && location.state.memberEmail){
            setMemberEmail(location.state.memberEmail);
        }
    }, []);

    useEffect(()=> {
        
    }, []);

    const GetInputPassword = (e) => {
        setNewPassword(e.target.value);
    }

    const GetInputCheckPassword = (e) => {
        setCheckPassword(e.target.value);
    }

    const ChangePassword = (e) => {
        if (newPassword != checkPassword){
            alert("비밀번호가 일치하지 않습니다.")
        }
        else{
            const EmailData = new FormData();
            const PasswordData = new FormData();
            EmailData.append("memberEmail", memberEmail);
            axios.post("/api/opentalk/auth/exPassword", EmailData)
            .then((res)=>{
                PasswordData.append("memberEmail", memberEmail);
                PasswordData.append("exPassword", res.data);
                PasswordData.append("newPassword", newPassword);
                axios.post(`/api/opentalk/auth/changePassword`, PasswordData)
                .then((res)=>{
                    alert("비밀번호가 변경되었습니다.");
                    naviagte("/opentalk/member/login");
                })
                .catch((error) => console.log(error));
            })
            .catch((error)=>console.log(error));
        }
    }

    return(
        <Container style={{ minHeight: '100vh'}}>
            <Row>
                <Col xs lg="4" md={{ span: 3, offset: 4 }} className="border border-warning border-3 rounded-3 p-5">
                    <h3>비밀번호 변경하기</h3>
                    <Form>
                        <Form.Label>새 비밀번호</Form.Label>
                        <Form.Control type='password' value={newPassword} onChange={GetInputPassword}></Form.Control>
                        <Form.Label>비밀번호 확인</Form.Label>
                        <Form.Control type='password' value={checkPassword} onChange={GetInputCheckPassword}></Form.Control>
                    </Form>
                    <br></br>
                    <div className="d-grid gap-2">
                        <Button onClick={ChangePassword}>변경하기</Button>
                    </div>
                </Col>
            </Row>
            
        </Container>
    );
}

export default ChangePasswordComponent;