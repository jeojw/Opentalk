import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, 
    FormControl, InputGroup, ListGroup, ListGroupItem } from 'react-bootstrap';
import { TokenContext } from './TokenContext';

const ProfileComponent = ({memberId, setIsUpdateData}) => {
    const [member, setMember] = useState('');

    const [pwPopupOpen, setPwPopupOpen] = useState(false);
    const [nickPopupOpen, setNickPopupOpen] = useState(false);
    const [imgPopupOpen, setImgPopupOpen] = useState(false);

    const [newNickName, setNewNickName] = useState("");
    const [exPassword, setExPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [checkPassword, setCheckPassword] = useState("");
    const [uploadPreview, setUploadPreview] = useState();
    const [uploadImgUrl, setUploadImgUrl] = useState(null);
    const [curImgUrl, setCurImgUrl] = useState(null);

    const [isChangeData, setIsChangeData] = useState(false);

    const { loginToken } = useContext(TokenContext);

    let imgRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMemberStatus = async () => {
            try {
                const response = await axios.get('/api/opentalk/member/me', {
                    headers: {
                        authorization: loginToken,
                    }
                });
                setMember(response.data);
                setCurImgUrl(response.data.imgUrl);
            } catch (error) {
                console.error(error);
            }
        };

        fetchMemberStatus();
    }, [isChangeData]);

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
        setUploadPreview("");
        setImgPopupOpen(false);
    }

    const resizeFile = (file) =>
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 200;
                    canvas.height = 200;
                    ctx.drawImage(img, 0, 0, 200, 200);
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', 0.8);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
    });

    const onChangeImageUpload = async (event) => {
        if (!event.target.files || event.target.files.length === 0){
            window.alert("이미지를 선택해 주세요.");
            return;
        }
        const file = event.target.files[0];
        try {
            const compressedFile = await resizeFile(file);
            const blobUrl = URL.createObjectURL(compressedFile);
            setUploadPreview(blobUrl);
            setUploadImgUrl(compressedFile);
        } catch (error) {
            console.log(error);
        }
    }

    const ChangeImg = async () => {
        if (window.confirm("변경하시겠습니까?")){
            if (!uploadImgUrl){
                window.alert("이미지를 선택해 주세요.");
                return;
            }

            const changeData = new FormData();
            changeData.append("memberId", member.memberId);
            changeData.append("newImg", uploadImgUrl);
            const changUrl = "/api/opentalk/member/changeImg";
            axios.post(changUrl, changeData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
              })
            .then((res) => {
                if(res.data === true){
                    window.alert("변경되었습니다!")
                    setImgPopupOpen(false);
                    setIsChangeData(prevState => !prevState);
                    setUploadPreview("");
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
        <Container>
            <Row style={{ textAlign: 'center' }}>
                <Col md={{ span: 3, offset: 4}} className="border border-#7B7B7B border-3 rounded-1 p-5" style={{backgroundColor:"#7B7B7B"}}>
                    <img 
                        alt="프로필 이미지" 
                        src={curImgUrl}
                        style={{width:'80%',
                                backgroundPosition:"center",
                                borderRadius: "50%"}}    
                    ></img>
                    <br></br>
                    <br></br>
                    <ListGroup>
                        <ListGroupItem style={{
                                border:'#CDCDCD', 
                                backgroundColor:"#CDCDCD",  
                                marginBottom: '5px',
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"
                            }}>이름 <hr/><strong>{member.memberName}</strong></ListGroupItem>
                        <ListGroupItem style={{
                                border:'#CDCDCD', 
                                backgroundColor:"#CDCDCD",  
                                marginBottom: '5px',
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"
                            }}>닉네임 <hr/><strong>{member.memberNickName}</strong></ListGroupItem>
                        <ListGroupItem style={{
                                border:'#CDCDCD', 
                                backgroundColor:"#CDCDCD",
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"
                            }}>이메일 <hr/><strong>{member.memberEmail}</strong></ListGroupItem>
                    </ListGroup>
                    <hr/>
                    <Modal isOpen={imgPopupOpen} onRequestClose={ChangeImgCancle}
                    style={{
                        content: {
                            width: '800px', // 원하는 너비로 설정
                            height: '400px', // 원하는 높이로 설정
                        }
                    }}>
                        <img src={uploadPreview} />
                        <hr/>
                        <FormControl type='file' accept='image/*' onChange={onChangeImageUpload} 
                                                style={{borderTopLeftRadius: "50px",
                                                        borderBottomLeftRadius: "50px",
                                                        borderTopRightRadius: "50px",
                                                        borderBottomRightRadius: "50px"}}></FormControl>
                        <br/>
                        <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD", 
                                                        borderTopLeftRadius: "50px",
                                                        borderBottomLeftRadius: "50px",
                                                        borderTopRightRadius: "50px",
                                                        borderBottomRightRadius: "50px"}} onClick={ChangeImg}>변경하기</Button>
                        <div style={{width:"4px", display:"inline-block"}}/>
                        <Button variant='dark' style={{borderTopLeftRadius: "50px",
                                                        borderBottomLeftRadius: "50px",
                                                        borderTopRightRadius: "50px",
                                                        borderBottomRightRadius: "50px"}}  onClick={ChangeImgCancle}>변경취소</Button>
                    </Modal>
                    <Modal isOpen={nickPopupOpen} onRequestClose={ChangeNickNameCancle}
                    style={{
                        content: {
                            width: '800px', // 원하는 너비로 설정
                            height: '400px', // 원하는 높이로 설정
                        }
                    }}>
                        <InputGroup>
                            <InputGroup.Text style={{backgroundColor:"#CDCDCD",
                                                    borderTopLeftRadius: "50px",
                                                    borderBottomLeftRadius: "50px",
                                                    }}><strong>새 닉네임</strong></InputGroup.Text>
                            <Form.Control 
                                type="text" 
                                value={newNickName} 
                                onChange={GetInputNewNickName}
                                style={{borderTopRightRadius: "50px",
                                        borderBottomRightRadius: "50px",}}></Form.Control>
                        </InputGroup>
                        <br></br>
                        <Button variant='#CDCDCD' style={{backgroundColor:"#CDCDCD", 
                                                        borderTopLeftRadius: "50px",
                                                        borderBottomLeftRadius: "50px",
                                                        borderTopRightRadius: "50px",
                                                        borderBottomRightRadius: "50px"}} onClick={ChangeNickName}><strong>변경하기</strong></Button>
                        <div style={{width:"4px", display:"inline-block"}}/>
                        <Button variant='dark' style={{borderTopLeftRadius: "50px",
                                                        borderBottomLeftRadius: "50px",
                                                        borderTopRightRadius: "50px",
                                                        borderBottomRightRadius: "50px"}}onClick={ChangeNickNameCancle}>변경 취소</Button>
                    </Modal>
                    <Modal isOpen={pwPopupOpen} onRequestClose={ChangePasswordCancle}
                    style={{
                        content: {
                            width: '800px', // 원하는 너비로 설정
                            height: '400px', // 원하는 높이로 설정
                        }
                    }}>
                        <InputGroup>
                            <InputGroup.Text style={{
                                    backgroundColor:"#CDCDCD", 
                                    borderTopLeftRadius: "50px",
                                    borderBottomLeftRadius: "50px",
                                }}>현재 비밀번호</InputGroup.Text>
                            <Form.Control 
                                type="password"
                                value={exPassword}
                                onChange={GetExPassword}
                                style={{ 
                                    borderTopRightRadius: "50px",
                                    borderBottomRightRadius: "50px",
                                }}></Form.Control>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                            <InputGroup.Text style={{
                                    backgroundColor:"#CDCDCD", 
                                    borderTopLeftRadius: "50px",
                                    borderBottomLeftRadius: "50px",
                                }}><strong>새 비밀번호</strong></InputGroup.Text>
                            <Form.Control type="password" 
                                value={newPassword} 
                                onChange={GetInputNewPassword}
                                style={{ 
                                    borderTopRightRadius: "50px",
                                    borderBottomRightRadius: "50px",
                                }}></Form.Control>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                        <InputGroup.Text style={{
                                    backgroundColor:"#CDCDCD", 
                                    borderTopLeftRadius: "50px",
                                    borderBottomLeftRadius: "50px",
                                }}><strong>비밀번호 확인</strong></InputGroup.Text>
                            <Form.Control type="password" 
                                value={checkPassword} 
                                onChange={GetInputCheckPassword}
                                style={{ 
                                    borderTopRightRadius: "50px",
                                    borderBottomRightRadius: "50px",
                                }}></Form.Control>
                        </InputGroup>
                        <br></br>
                        <Button variant='#CDCDCD' style={{
                                    backgroundColor:"#CDCDCD", 
                                    borderTopLeftRadius: "50px",
                                    borderBottomLeftRadius: "50px",
                                    borderTopRightRadius: "50px",
                                    borderBottomRightRadius: "50px"
                                }} onClick={ChangePassword}><strong>변경하기</strong></Button>
                        <div style={{width:"4px", display:"inline-block"}}/>
                        <Button variant='dark' style={{
                                    borderTopLeftRadius: "50px",
                                    borderBottomLeftRadius: "50px",
                                    borderTopRightRadius: "50px",
                                    borderBottomRightRadius: "50px"
                                }} onClick={ChangePasswordCancle}>변경 취소</Button>
                    </Modal>
                    <div className="d-grid gap-2">
                        <Button variant='#CDCDCD' style={{
                                    backgroundColor:"#CDCDCD", 
                                    borderTopLeftRadius: "50px",
                                    borderBottomLeftRadius: "50px",
                                    borderTopRightRadius: "50px",
                                    borderBottomRightRadius: "50px"
                                }} onClick={ChangeImgPopup}>사진 변경</Button>
                        <Button variant='#CDCDCD' style={{
                                    backgroundColor:"#CDCDCD", 
                                    borderTopLeftRadius: "50px",
                                    borderBottomLeftRadius: "50px",
                                    borderTopRightRadius: "50px",
                                    borderBottomRightRadius: "50px"
                                }} onClick={ChangeNickNamePopup}>닉네임 변경</Button>
                        <Button variant='#CDCDCD' style={{
                                    backgroundColor:"#CDCDCD", 
                                    borderTopLeftRadius: "50px",
                                    borderBottomLeftRadius: "50px",
                                    borderTopRightRadius: "50px",
                                    borderBottomRightRadius: "50px"
                                }} onClick={ChangePasswordPopup}>비밀번호 변경</Button>
                        <Button variant='#CDCDCD' style={{
                                    backgroundColor:"#CDCDCD", 
                                    borderTopLeftRadius: "50px",
                                    borderBottomLeftRadius: "50px",
                                    borderTopRightRadius: "50px",
                                    borderBottomRightRadius: "50px"
                                }} onClick={() => {
                            navigate("/opentalk/main")
                            window.URL.revokeObjectURL(curImgUrl);
                        }}>이전 페이지</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );

}

export default ProfileComponent