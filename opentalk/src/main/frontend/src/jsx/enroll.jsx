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
    const DEFAULT_PROFILE_IMAGE_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAMAAzAMBIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAwQFAQIG/8QAMxABAAIBAgMFBAoDAQAAAAAAAAECAwQRITFBBTJRYXESEyKBM0JSU2JykqHB0UORsRX/xAAYAQEBAQEBAAAAAAAAAAAAAAAAAgEDBP/EABsRAQEBAQEBAQEAAAAAAAAAAAABAhESMSFB/9oADAMBAAIRAxEAPwD64B73kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN/QAJAAAAAAAAAAAAAAAAAAAAeqUtktFKRvMg5EbzEV3mfCIXcHZ17bTmn2Y8I4yuaXTU08ct79bf0nc7tcyr00enr/jifzTuk9xi+7p/pII7VcV7aPT2+pEflVM/Z1q8cMzb8M82mNmrGWPn5iYmYmJjbnu42tXpaamu88LxHC38Me9LY7zW8bTHR1zrqLOPIDWAAAAAAAAAAAAAAHLj0avZmD2MUZrd+3L0ZmOk5MtKR1nZv7RHCOXRG7/ABWYAOSwAAABR7Twe3jjNHOvP0XnLRFqzWeUxs2XlLHz49ZKTS81tziXl3cgAAAAAAAAAAAAAFjQRvq6R0jeWz1Y2hnbVU8921Llv6vPxwBCgAAAACOY1i6+NtZk85if2QJ9bO+qyfm2/ZA7z440AaAAAAAAAAAAAAO0vNL1tHSd2/S0XpW0TvExu+f8PJf7O1EVj3N52r9WZRuKzWkHXaRyWADQAB5yX93jm89HqOPn5MztPU+3MYqWjaOc+KszqbVGZmZ35zMzuOy47OYAAAAAAAAAAAAAAADR0evjhjz/ACsv78uO+/VgcEmHUZcH0V9o8EXCppuf7GbTtO0fSY4mPwpP/Tx/d3/ZHmq6vG+08eDOv2n91j/VKrm1OXNwvbh4RwhszS6W9Zr9onHp/ndnA6ScRb0AawAAAAAAAAAAAAB2AcHYiZnaImZ6bLWLs/LfabzFI8+bLZGydVOuxz5Tu16aDBXb2om/rKeuLHXu0rHyTdxvlhRW08qTv6PXucv3V/0y3jZntvl8/Nbx3scx6w5wfQ+vH1l4vhxX72Os/I9s8sH5jWydn4bdyJpPTZTzaHLj5fHH4VTUrLOKoeO8bbCmAAAAAAAAAAAACfTaTLqLRPdx9bJNFpPffHkmYpHTxa0REREV4VjlEI1riplFhwY8MfBXj49UoOfVgAADAAAJ48wGodRpseePija32oZWo099PPx93paG25etb1mLxvE81Z1Ymx8+LOs0s6ed43nH0mOivPlydZeudnHAGgAAAAAAsaPTTqMvH6OvGZQREzO1ectvTYow4a0r4bzPmnV5G5iWIiKxERERHKAHF0AAAAAAAAAAAActWL1mtoiYnnuxdVgtp8s1nuz3Z8m2g1mGM2C0fWjjWVZvKyxihtMcx2cwAAAACeQLfZuOL6iLfVrH7tb/AKqdmU9nT+19qVtx1f10k/ABLQAAAAAAAAAAAA2/oAY/aGL3eptaO7f4lZqdqU3wxf7M8fRl/wA8XbN7HPX5QBTH/9k=';

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
            const imgUrl = DEFAULT_PROFILE_IMAGE_URL;
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
                <Col md={{ span: 6, offset: 3 }} className="border border-warning border-3 rounded-3 p-5">
                    <h2>회원가입</h2>
                    <Form.Label>아이디</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="text"
                            value={memberId}
                            onChange={GetInputId}
                        ></FormControl>
                        <Button onClick={CheckIdDuplicate}>아이디 중복 확인</Button>
                    </InputGroup>
                    <Form.Label>비밀번호</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="password"
                            value={memberPw}
                            onChange={GetInputPw}
                        ></FormControl>
                    </InputGroup>
                    <Form.Label>이름</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="text"
                            value={memberName}
                            onChange={GetInputName}
                        ></FormControl>
                    </InputGroup>
                    <Form.Label>닉네임</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="text"
                            value={memberNickName}
                            onChange={GetInputNickName}
                        ></FormControl>
                        <Button onClick={CheckNickNameDuplicate}>닉네임 중복 확인</Button>
                    </InputGroup>
                    <Form.Label>이메일</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="email"
                            value={memberEmail}
                            onChange={GetInputEmail}
                        ></FormControl>
                        <Button onClick={CheckMail}>인증번호 받기</Button>
                    </InputGroup>
                    <Form.Label>인증번호</Form.Label>
                    <InputGroup>
                        <FormControl
                            type="text"
                            value={inputNum}
                            onChange={GetInputNum}
                        ></FormControl>
                        <Button onClick={CheckAuth}>인증하기</Button>
                    </InputGroup>
                    <br></br>
                    <Button onClick={CheckAll}>회원가입</Button>
                </Col>
            </Row>
        </Container>
    );
}
export default EnrollComponent;