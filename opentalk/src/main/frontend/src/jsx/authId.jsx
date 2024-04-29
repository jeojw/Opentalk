import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Row, Col, FormControl } from 'react-bootstrap';

const AuthIdComponent = () =>{
    const [memberId, setMemberId] = useState("");
    const navigate = useNavigate();

    const GetInputId = (e) => {
        const memberId = e.target.value;
        setMemberId(memberId);
    }

    const AuthId = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("memberId", memberId);
        const checkUrl = `/api/opentalk/auth/checkId`
        axios.post(checkUrl, data)
        .then((res) => {
            if (res.data){
                navigate("/opentalk/findPw")
            }
            else{
                window.alert("존재하지 않는 아이디입니다.")
            }
        })
        .catch((error) => console.log(error));
    }

    return (
        <Container style={{ minHeight: '100vh'}}>
            <Row>
                <Col xs lg="3" md={{ span: 3, offset: 4 }} className="border border-#7B7B7B border-3 rounded-1 p-5" style={{backgroundColor:"#7B7B7B"}}>
                <h3 style={{color:"white"}}>아이디 확인하기</h3>
                <Form>
                    <Form.Label style={{color:"white"}}>아이디</Form.Label>
                    <FormControl type='text' value={memberId} onChange={GetInputId}
                    style={{borderTopLeftRadius: "25px",
                            borderBottomLeftRadius: "25px",
                            borderTopRightRadius: "25px",
                            borderBottomRightRadius: "25px"}}></FormControl>
                    <br></br>
                    <div className="d-grid gap-2">
                        <Button variant='#CDCDCD' 
                        style={{backgroundColor:"#CDCDCD", 
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"}} onClick={AuthId}>확인하기</Button>
                    </div>
                </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default AuthIdComponent;