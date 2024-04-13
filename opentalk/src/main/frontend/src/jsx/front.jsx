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
        <h2>오픈톡방에 오신 것을 환영합니다!</h2>
        <Row>
            <Col>
                <Button variant='primary' type="button" onClick={LinkToLogin}>로그인</Button>
                <Button variant='primary' type="button" onClick={LinkToEnroll}>회원가입</Button>
            </Col>
        </Row>
    </Container>
    );
}

export default FrontComponent;