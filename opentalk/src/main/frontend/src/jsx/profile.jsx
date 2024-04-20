import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, 
    FormControl, InputGroup, ListGroup, ListGroupItem } from 'react-bootstrap';
import { TokenContext } from './TokenContext';

const ProfileComponent = ({setIsUpdateData}) => {
    const [member, setMember] = useState('');

    const [pwPopupOpen, setPwPopupOpen] = useState(false);
    const [nickPopupOpen, setNickPopupOpen] = useState(false);
    const [imgPopupOpen, setImgPopupOpen] = useState(false);

    const [newNickName, setNewNickName] = useState("");
    const [exPassword, setExPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [checkPassword, setCheckPassword] = useState("");
    const [uploadImgUrl, setUploadImgUrl] = useState(null);
    const [curImgUrl, setCurImgUrl] = useState(null);

    const [isChangeData, setIsChangeData] = useState(false);

    const { loginToken } = useContext(TokenContext);

    let imgRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMemberStatus = async () => {
            try{
                const response = await axios.get('/api/opentalk/member/me', {
                    headers: {authorization: loginToken}
                    });
                setMember(response.data);
                setCurImgUrl(response.data.imgUrl);
                console.log(response.data);
                
            } catch (error) {
                console.error(error);
            }
        };

        fetchMemberStatus();
    }, [isChangeData]);

    useEffect(() => {
        if (curImgUrl){
            imgRef.current.setAttribute('src', curImgUrl);
        }
    }, [curImgUrl])

    const GetExPassword = (event) =>{
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

    const ChangeImgPopup = () => {
        setImgPopupOpen(true);
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

    const ChangeImgCancle = () => {
        setUploadImgUrl("");
        setImgPopupOpen(false);
    }

    const onChangeImageUpload = (event) => {
        if (!event.target.files[0]){
            window.alert("이미지를 선택해 주세요.");
            return;
        }
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = ()=> {
            setUploadImgUrl(reader.result);
        }
    }

    useEffect(() => {
        if (uploadImgUrl) {
            imgRef.current.setAttribute("src", uploadImgUrl);
        }
    }, [uploadImgUrl]);

    const ChangeImg = () => {
        if (window.confirm("변경하시겠습니까?")){
            localStorage.setItem('profile', JSON.stringify(uploadImgUrl));
            const profile = localStorage.getItem('profile');
            const isVaild = JSON.parse(profile);
            if (!isVaild){
                window.alert("이미지를 선택해 주세요.");
                return;
            }
            imgRef.current.setAttribute('src', isVaild);

            const changeData = new FormData();
            console.log(imgRef.current);
            changeData.append("memberId", member.memberId)
            changeData.append("newImg", isVaild)
            const changUrl = "/api/opentalk/member/changeImg";
            axios.post(changUrl, changeData)
            .then((res) => {
                if(res.data === true){
                    window.alert("변경되었습니다!")
                    setImgPopupOpen(false);
                    setIsChangeData(prevState => !prevState);
                }
            })
            .catch((error) => console.log(error));
        }
        
    }
    const ChangePassword = () =>{
        if (newPassword !== checkPassword){
            alert("비밀번호가 일치하지 않습니다.");
        }
        else{
            const checkUrl = `/api/opentalk/member/changePassword`
            const PwData = new FormData();
            PwData.append("memberEmail", member.memberEmail);
            PwData.append("exPassword", exPassword);
            PwData.append("newPassword", newPassword);
            axios.post(checkUrl, PwData,{
                headers: {Authorization: loginToken}
            })
            .then((res)=>{
                if (res.data === true){
                    alert("비밀번호가 변경되었습니다.");
                    ChangePasswordCancle();
                }
                else{
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
        <Container className="border border-warning border-3 rounded-3 p-5">
            <Row style={{ textAlign: 'center' }}>
                <Col md={{ span: 3, offset: 4}} className="border border-warning border-3 rounded-3 p-5">
                    <img 
                        alt="프로필 이미지" 
                        ref={imgRef}
                        style={{width:200, 
                                height:200,
                                backgroundPosition:"center"}}    
                    ></img>
                    <br></br>
                    <br></br>
                    <ListGroup>
                        <ListGroupItem>이름: {member.memberName}</ListGroupItem>
                        <ListGroupItem>닉네임: {member.memberNickName}</ListGroupItem>
                        <ListGroupItem>이메일: {member.memberEmail}</ListGroupItem>
                    </ListGroup>
                    <br></br>
                    <Modal isOpen={imgPopupOpen} onRequestClose={ChangeImgCancle}
                    style={{
                        content: {
                            width: '800px', // 원하는 너비로 설정
                            height: '400px', // 원하는 높이로 설정
                        }
                    }}>
                        <img ref={imgRef} img = "img"/>
                        <FormControl type='file' accept='image/*' onChange={onChangeImageUpload}></FormControl>
                        <Button onClick={ChangeImg}>변경하기</Button>
                        <Button variant='dark' onClick={ChangeImgCancle}>변경취소</Button>
                    </Modal>
                    <Modal isOpen={nickPopupOpen} onRequestClose={ChangeNickNameCancle}
                    style={{
                        content: {
                            width: '800px', // 원하는 너비로 설정
                            height: '400px', // 원하는 높이로 설정
                        }
                    }}>
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
                    <Modal isOpen={pwPopupOpen} onRequestClose={ChangePasswordCancle}
                    style={{
                        content: {
                            width: '800px', // 원하는 너비로 설정
                            height: '400px', // 원하는 높이로 설정
                        }
                    }}>
                        <InputGroup>
                            <InputGroup.Text>현재 비밀번호</InputGroup.Text>
                            <Form.Control 
                                type="password"
                                value={exPassword}
                                onChange={GetExPassword}></Form.Control>
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
                        <Button onClick={ChangeImgPopup}>사진 변경</Button>
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