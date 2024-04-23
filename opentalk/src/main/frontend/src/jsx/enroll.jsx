import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Form, 
    FormControl, InputGroup,
    FormGroup} from 'react-bootstrap';

const EnrollComponent = (props) =>{
    const [memberId, setMemberId] = useState('');
    const [memberPw, setMemberPw] = useState('');
    const [memberName, setMemberName] = useState('');
    const [memberNickName, setMemberNickName] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [authNum, setAuthNum] = useState();
    const [inputNum, setInputNum] = useState();

    const [checkId, setCheckId] = useState(false);
    const [checkNickName, setCheckNickName] = useState(false);
    const [checkEmail, setCheckEmail] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [selectedImage, setSelectedImage] = useState(null);

    const navigate = useNavigate();

    const GetInputId = (event) =>{
        setMemberId(event.target.value);
    }

    const GetInputPw = (event) =>{
        setMemberPw(event.target.value);
    }

    const GetInputName = (event) =>{
        setMemberName(event.target.value);
    }

    const GetInputNickName = (event) =>{
        setMemberNickName(event.target.value);
    }

    const GetInputEmail = (event) =>{
        setMemberEmail(event.target.value);
    }

    const GetInputNum = (event) => {
        setInputNum(event.target.value);
    }

    const CheckIdDuplicate = () => {
        const data = new FormData();
        data.append("memberId", memberId);
        const checkUrl = `/api/opentalk/auth/signup/checkId`;
        axios.post(checkUrl, data).then((res)=>{
            if (res.data === true){
                alert("중복된 아이디입니다.");
                setCheckId(false);
            }
            else{
                alert("사용 가능한 아이디입니다.");
                setCheckId(true);
            }
        }).catch((error)=>console.log(error))
    }

    const CheckNickNameDuplicate = () =>{
        const data = new FormData();
        data.append("memberNickName", memberNickName);
        const checkUrl = `/api/opentalk/auth/signup/checkNickName`;
        axios.post(checkUrl, data).then((res)=>{
            if (res.data === true){
                alert("중복된 닉네임입니다.");
                setCheckNickName(false);
            }
            else{
                alert("사용 가능한 닉네임입니다.");
                setCheckNickName(true);
            }
        }).catch((error)=>console.log(error))
    }

    const CheckMail = () =>{
        const duplicateUrl = '/api/opentalk/auth/signup/checkEmail'
        const data = new FormData();
        data.append("memberEmail", memberEmail);
        axios.post(duplicateUrl, data)
        .then((res)=>{
            if (res.data === true){
                alert("이미 사용중인 이메일입니다.");
            }
            else{
                const checkUrl = `/api/opentalk/enroll/mailSend`
                axios.post(checkUrl, {
                    email: memberEmail,
                    sendType: "enroll"
                }).then((res)=>{
                    setAuthNum(res.data);
                })
            }
        })
        .catch((error) => console.log(error));
    }

    const CheckAuth = () =>{
        if (inputNum.toString() !== authNum.toString()){
            window.alert("인증에 실패하였습니다. 다시 시도해주십시오.");
            setCheckEmail(false);
        }
        else{
            const checkUrl = `/api/opentalk/enroll/mailauthCheck`
            axios.post(checkUrl, {
                email: memberEmail,
                authNum: String(authNum)
            }).then((res)=>{
                if (res.data === "ok"){
                    alert("인증되었습니다.");
                    setCheckEmail(true);
                }
                else{
                    if (checkEmail){
                        alert("이미 인증되었습니다.");
                    }
                    else{
                        alert("인증이 실패하였습니다. 다시 시도해주십시오.");
                        setCheckEmail(false);
                    }
                }
            })
        }
    }

    const CheckAll = () =>{
        if (!checkId){
            alert("아이디 중복 체크를 진행해 주십시오.");
        }
        else if (!checkNickName){
            alert("닉네임 중복 체크를 진행해 주십시오.");
        }
        else if (!checkEmail){
            alert("이메일 인증을 진행해 주십시오.");
        }
        else{
            const url = `/api/opentalk/auth/signup`;
            axios.post(url,{
                memberId: memberId,
                memberPassword: memberPw,
                memberName: memberName,
                memberNickName: memberNickName,
                memberEmail: memberEmail,
                imgUrl: "null"
            }).then((res)=>{
    
            }).catch((error)=> {
                if (error.response){
                    setErrorMessage(error.response.data);
                } else{
                    setErrorMessage("");
                    console.log(error);
                }
            });
            alert("회원가입이 완료되었습니다.")
            navigate("/opentalk/member/login");
        }
        
    }

    return(
        <Container>
            <Row>
                <Col md={{ span: 6, offset: 3 }} className="border border-#7B7B7B border-3 rounded-1 p-5" style={{backgroundColor:"#7B7B7B"}}>
                    <h2 style={{color:"white"}}>회원가입</h2>
                    <Form.Label style={{color:"white"}}>아이디</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="text"
                            value={memberId}
                            onChange={GetInputId}
                            style={{borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px"}}
                        ></FormControl>
                        <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD",
                                                            borderTopRightRadius: "25px",
                                                            borderBottomRightRadius: "25px"}} onClick={CheckIdDuplicate}>아이디 중복 확인</Button>
                    </InputGroup>
                    <Form.Label style={{color:"white"}}>비밀번호</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="password"
                            value={memberPw}
                            onChange={GetInputPw}
                            style={{borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px",
                                    borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"}}
                        ></FormControl>
                    </InputGroup>
                    <Form.Label style={{color:"white"}}>이름</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="text"
                            value={memberName}
                            onChange={GetInputName}
                            style={{borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px",
                                    borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"}}
                        ></FormControl>
                    </InputGroup>
                    <Form.Label style={{color:"white"}}>닉네임</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="text"
                            value={memberNickName}
                            onChange={GetInputNickName}
                            style={{borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px"}} 
                        ></FormControl>
                        <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD",
                                                        borderTopRightRadius: "25px",
                                                        borderBottomRightRadius: "25px"}} onClick={CheckNickNameDuplicate}>닉네임 중복 확인</Button>
                    </InputGroup>
                    <Form.Label style={{color:"white"}}>이메일</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="email"
                            value={memberEmail}
                            onChange={GetInputEmail}
                            style={{borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px"}} 
                        ></FormControl>
                        <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD",
                                                        borderTopRightRadius: "25px",
                                                        borderBottomRightRadius: "25px"}} onClick={CheckMail}>인증번호 받기</Button>
                    </InputGroup>
                    <Form.Label style={{color:"white"}}>인증번호</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="text"
                            value={inputNum}
                            onChange={GetInputNum}
                            style={{borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px"}} 
                        ></FormControl>
                        <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD",
                                                        borderTopRightRadius: "25px",
                                                        borderBottomRightRadius: "25px"}} onClick={CheckAuth}>인증하기</Button>
                    </InputGroup>
                    <br></br>
                    <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD",
                                                        borderTopLeftRadius: "25px",
                                                        borderBottomLeftRadius: "25px",
                                                        borderTopRightRadius: "25px",
                                                        borderBottomRightRadius: "25px"}} onClick={CheckAll}>회원가입</Button>
                </Col>
            </Row>
        </Container>
    );
}
export default EnrollComponent;