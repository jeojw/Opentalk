import React, {useState, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';

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
            const PasswordData = new FormData();
            PasswordData.append("memberEmail", memberEmail);
            PasswordData.append("newPassword", newPassword);
            axios.post(`/api/opentalk/auth/changePassword`, PasswordData)
            .then((res)=>{
                if (res.status === 200){
                    window.alert("비밀번호가 변경되었습니다.")
                    naviagte("/opentalk/member/login");
                }
            })
            .catch((error)=>console.log(error));
        }
    }

    return(
        <Container style={{ minHeight: '100vh'}}>
            <Row>
                <Col xs lg="4" md={{ span: 3, offset: 4 }} className="border border-#7B7B7B border-3 rounded-1 p-5" style={{backgroundColor:"#7B7B7B"}}>
                    <h3 style={{color:"white"}}>비밀번호 변경하기</h3>
                    <Form>
                        <Form.Label style={{color:"white"}}>새 비밀번호</Form.Label>
                        <Form.Control type='password' value={newPassword} onChange={GetInputPassword}
                        style={{borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"}}></Form.Control>
                        <Form.Label style={{color:"white"}}>비밀번호 확인</Form.Label>
                        <Form.Control type='password' value={checkPassword} onChange={GetInputCheckPassword}
                        style={{borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"}}></Form.Control>
                    </Form>
                    <br></br>
                    <div className="d-grid gap-2">
                        <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD",
                                                        borderTopLeftRadius: "25px",
                                                        borderBottomLeftRadius: "25px",
                                                        borderTopRightRadius: "25px",
                                                        borderBottomRightRadius: "25px"}} 
                                                        onClick={ChangePassword}>변경하기</Button>
                    </div>
                </Col>
            </Row>
            
        </Container>
    );
}

export default ChangePasswordComponent;