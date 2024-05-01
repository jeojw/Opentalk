import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Row, Col, FormControl } from 'react-bootstrap';
import { themeContext } from './themeContext';

const AuthIdComponent = () =>{
    const { theme } = useContext(themeContext);
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
                navigate("/opentalk/findPw", {state: {memberId: memberId}})
            }
            else{
                window.alert("존재하지 않는 아이디입니다.")
            }
        })
        .catch((error) => console.log(error));
    }

    return (
        <Container style={{ minHeight: '100vh'}}>
            <Row style={{position:"relative", bottom:"-5px"}}>
                <Col xs lg="3" md={{ span: 3, offset: 4 }} className="border-3 rounded-4 p-5" style={{backgroundColor: theme === 'light' ? "#7B7B7B" : "#595959"}}>
                <h3 style={{color:"white"}}>아이디 확인하기</h3>
                <Form>
                    <Form.Label style={{color:"white"}}>아이디</Form.Label>
                    <FormControl
                        className='custom-ui' 
                        type='text' 
                        value={memberId} 
                        onChange={GetInputId}
                    ></FormControl>
                    <br></br>
                    <div className="d-grid gap-2">
                        <Button
                            className='custom-button'
                            variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                            style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                     color:theme === 'light' ? "#000000" : "#FFFFFF"}} 
                            onClick={AuthId}>확인하기</Button>
                    </div>
                </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default AuthIdComponent;