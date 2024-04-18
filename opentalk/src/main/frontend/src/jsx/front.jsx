import React, {useState, useEffect} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Form, Button, Container, Row, Col} from 'react-bootstrap';

const FrontComponent = (props) => {
    const navigate = useNavigate();

    const LinkToLogin = () =>{
        navigate("/opentalk/member/login")
    }

    const LinkToEnroll = () => {
        navigate("/opentalk/member/enroll")
    }

   return (
    <Container>
        <Row>
            <Col md={{ span: 10, offset: 1 }} className="border border-warning border-3 rounded-3 p-5">
                <div className='text-center'>
                    <h2>오픈톡방에 오신 것을 환영합니다!</h2>
                </div>
                <br></br>
                <div className="d-flex justify-content-between gap-1">
                    <Button variant='primary' type="button" onClick={LinkToLogin} style={{fontSize: '20px', padding: '10px 100px'}}>로그인</Button>
                    <Button variant='primary' type="button" onClick={LinkToEnroll} style={{fontSize: '20px', padding: '10px 100px'}}>회원가입</Button>
                </div> 
            </Col>
        </Row>
    </Container>
    );
}

export default FrontComponent;