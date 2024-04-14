import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { Container, Row, Col, Button, Form, 
    FormControl, InputGroup, ListGroup, ListGroupItem } from 'react-bootstrap';

const ProfileComponent = ({setIsUpdateData}) => {
    const [member, setMember] = useState('');
    const [pwPopupOpen, setPwPopupOpen] = useState(false);
    const [nickPopupOpen, setNickPopupOpen] = useState(false);
    const [newNickName, setNewNickName] = useState("");
    const [exPassword, setExPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [checkPassword, setCheckPassword] = useState("");

    const [isChangeData, setIsChangeData] = useState(false);

    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchMemberStatus = async () => {
            try{
                const response = await axios.get('/api/opentalk/member/profile', {
                    headers: {Authorization: 'Bearer ' + cookies.accessToken}
                    });
                setMember(response.data);
                console.log(member);
            } catch (error) {
                console.error(error);
            }
        };

        fetchMemberStatus();
    }, [isChangeData]);

    const GetInputExPassword = (event) =>{
        setExPassword(event.target.value);
    }

    const GetInputNewPassword = (event) =>{
        setNewPassword(event.target.value);
    }

    const GetInputCheckPassword = (event) =>{
        setCheckPassword(event.target.value);
    }

    const GetInputNewNickName = (event) =>{
        setNewNickName(event.target.value);
    }

    const ChangeNickNamePopup = () => {
        setNickPopupOpen(true); 
    }  

    const ChangePasswordPopup = () => {
        setPwPopupOpen(true);
    }

    const ChangeNickNameCancle = () => {
        setNickPopupOpen(false);
        setNewNickName("");
    }

    const ChangePasswordCancle = () => {
        setPwPopupOpen(false);
        setExPassword("");
        setNewPassword("");
        setCheckPassword("");
    }

    const ChangePassword = () =>{
        if (newPassword !== checkPassword){
            alert("비밀번호가 일치하지 않습니다.");
        }
        else{
            const checkUrl = `/api/opentalk/member/changePassword`
            axios.post(checkUrl, {
                exPassword: exPassword,
                newPassword: newPassword
            },{
                headers: {Authorization: 'Bearer ' + cookies.accessToken}
            })
            .then((res)=>{
                if (res.status === 200){
                    alert("비밀번호가 변경되었습니다.");
                    ChangePasswordCancle();
                }
                else if (res.status === 500){
                    alert("현재 비밀번호가 맞지 않습니다.")
                }
            })
            .catch((error)=>console.log(error));
        }
    }
    const ChangeNickName = () =>{
        const data = new FormData();
        data.append("memberNickName", newNickName);
        const duplicateUrl = "/api/opentalk/member/checkNickName";
        axios.post(duplicateUrl, data)
        .then((res)=>{
            if (!res.data){
                const checkUrl = "/api/opentalk/member/changeNickname";
                axios.post(checkUrl, {
                memberId: member.memberId,
                memberNickName: newNickName
            })
            .then((res)=>{
                alert("닉네임이 변경되었습니다.")
                setIsChangeData(prevState => !prevState);
                setIsUpdateData(prevState => !prevState);
                ChangeNickNameCancle();
            })
            .catch((error) => console.log(error));
            }
            else{
                alert("이미 존재하는 닉네임입니다.")
            }
        })
        .catch((error)=>console.log(error));
        
    }
    
    return(
        <Container>
            <Row>
                <Col xs lg="3" md={{ span: 1, offset: 2}} className="border border-warning border-3 rounded-3 p-5">
                    <img 
                        alt="프로필 이미지" 
                        src={`${process.env.PUBLIC_URL}/profile_prototype.jpg`}
                        style={{width:200, 
                                height:200,
                                backgroundPosition:"center"}}    
                    ></img>
                    <br></br>
                    <ListGroup>
                        <ListGroupItem>이름: {member.memberName}</ListGroupItem>
                        <ListGroupItem>닉네임: {member.memberNickName}</ListGroupItem>
                        <ListGroupItem>이메일: {member.memberEmail}</ListGroupItem>
                    </ListGroup>
                    <br></br>
                    <Modal isOpen={nickPopupOpen} onRequestClose={ChangeNickNameCancle}>
                        <InputGroup>
                            <InputGroup.Text>새 닉네임</InputGroup.Text>
                            <Form.Control 
                                type="text" 
                                value={newNickName} 
                                onChange={GetInputNewNickName}></Form.Control>
                        </InputGroup>
                        <br></br>
                        <Button onClick={ChangeNickName}>변경하기</Button>
                        <Button variant='dark'onClick={ChangeNickNameCancle}>변경 취소</Button>
                    </Modal>
                    <Modal isOpen={pwPopupOpen} onRequestClose={ChangePasswordCancle}>
                        <InputGroup>
                            <InputGroup.Text>현재 비밀번호</InputGroup.Text>
                            <Form.Control 
                                type="password"
                                value={exPassword}
                                onChange={GetInputExPassword}></Form.Control>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                            <InputGroup.Text>새 비밀번호</InputGroup.Text>
                            <Form.Control type="password" 
                                value={newPassword} 
                                onChange={GetInputNewPassword}></Form.Control>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                            <InputGroup.Text>비밀번호 확인</InputGroup.Text>
                            <Form.Control type="password" 
                                value={checkPassword} 
                                onChange={GetInputCheckPassword}></Form.Control>
                        </InputGroup>
                        <br></br>
                        <br></br>
                        <Button onClick={ChangePassword}>변경하기</Button>
                        <Button variant='dark' onClick={ChangePasswordCancle}>변경 취소</Button>
                    </Modal>
                    <div className="d-grid gap-2">
                        <Button onClick={ChangeNickNamePopup}>닉네임 변경</Button>
                        <Button onClick={ChangePasswordPopup}>비밀번호 변경</Button>
                        <Button onClick={() => navigate("/opentalk/main")}>이전 페이지</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );

}

export default ProfileComponent