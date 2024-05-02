import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, FormControl, InputGroup, ListGroup, ListGroupItem } from 'react-bootstrap';
import * as StompJs from "@stomp/stompjs";
import SockJs from "sockjs-client"
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { useMediaQuery } from 'react-responsive';
import { themeContext } from './themeContext';

const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 768 })
    return isDesktop ? children : null
}
const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })
    return isMobile ? children : null
}

const ProfileComponent = () => {
    const { theme } = useContext(themeContext);
    const client = useRef({});
    useEffect(() =>{ 
        const connect = async () => {
            try{
                    client.current = new StompJs.Client({
                        webSocketFactory: () => new SockJs('/ws'),
                        connectHeaders: {
                            "auth-token": "spring-chat-auth-token",
                        },
                        debug: function (str) {
                            console.log(str);
                        },
                        reconnectDelay: 5000,
                        heartbeatIncoming: 4000,
                        heartbeatOutgoing: 4000,
                        onConnect: () => {
                            client.current.subscribe(`/sub/chat/changeNickName`, ({body}) => {
                                if (JSON.parse(body).nickName === "system"){
                                    queryClient.invalidateQueries("allChatRooms");
                                }
                            });
                        },
                        onStompError: (frame) => {
                            console.error(frame);
                        }
                    });
                    await client.current.activate(); 
            } catch (error){
                    console.log(error);
            }
        }
            
        const disconnect = () => {
            client.current.deactivate();
        };
        connect();
        return () => disconnect();
    }, []);

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

    const [isReissue, setIsReissue] = useState(false);

    useEffect(() => {
        if (isReissue){
            const reissueToken = async () =>{
                const reissueUrl = "/api/opentalk/auth/reissue";
                try{
                    const reissueRes = await axios.post(reissueUrl, null, {
                        headers:{
                            'Authorization': localStorage.getItem("token"),
                        },
                    })
                    if (reissueRes.status === 200){
                        localStorage.setItem("token", reissueRes.headers['authorization']);
                    }
                } catch(error) {
                    console.log(error);
                    setIsReissue(false); 
                }
            }
            reissueToken();
        }
    }, [isReissue])

    useEffect(() => {
        const validateToken = async () =>{
            try{
                const url = "/api/opentalk/auth/validate";
                const response = await axios.post(url, null, {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                });
                if (response.data === true){
                    setIsReissue(true);
                }
                else{
                    setIsReissue(false);
                }
            } catch(error){
                setIsReissue(true);
            }
        }
        validateToken();
    }, []);

    const navigate = useNavigate();
    
    const queryClient = useQueryClient();

    const { data: myInfo, isLoading, isError, isFetching, isFetched} = useQuery({
        queryKey:['myInfo'], 
        queryFn: async () => {
            if (localStorage.getItem("token")){
                try {
                    const response = await axios.get('/api/opentalk/member/me', {
                        headers: {
                            authorization: localStorage.getItem("token"),
                        }
                    });
                    return response.data;
                } catch (error) {
                    console.error(error);
                } 
            }
            else{
                navigate("/opentalk");
            }
        },  
        cacheTime: 30000,
        staleTime: 5000,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    }, []);

    useEffect(() => {
        if (myInfo && !isLoading && !isError && !isFetching && isFetched){
            setMember(myInfo);
            setCurImgUrl(myInfo.imgUrl);
        }
        
    }, [myInfo, isLoading, isError, isFetching, isFetched]);

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

    const { mutate: mutateChangeImg } = useMutation(async() => {
        if (window.confirm("변경하시겠습니까?")){
            if (!uploadImgUrl){
                window.alert("이미지를 선택해 주세요.");
                return;
            }

            const changeData = new FormData();
            changeData.append("memberId", member.memberId);
            changeData.append("newImg", uploadImgUrl);
            const changUrl = "/api/opentalk/member/changeImg";
            try{
                const res = await axios.post(changUrl, changeData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                if (res.data === true){
                    window.alert("변경되었습니다!")
                    setImgPopupOpen(false);
                    setUploadPreview("");
                }
            } catch (error){
                console.log(error);
            }
        }
    }, {
        onSuccess:() =>{
            queryClient.invalidateQueries("myInfo");
        }
    })

    const ChangeImg = () => {
        mutateChangeImg();
    }

    const ChangePassword = () =>{
        if (newPassword.length <= 0){
            window.alert("한 글자 이상의 비밀번호를 입력해 주십시오.");
        }
        else if (newPassword !== checkPassword){
            window.alert("비밀번호가 일치하지 않습니다.");
        }
        else{
            const checkUrl = `/api/opentalk/member/changePassword`
            const PwData = new FormData();
            PwData.append("memberEmail", member.memberEmail);
            PwData.append("exPassword", exPassword);
            PwData.append("newPassword", newPassword);
            axios.post(checkUrl, PwData,{
                headers: {Authorization: localStorage.getItem("token")}
            })
            .then((res)=>{
                if (res.data === true){
                    window.alert("비밀번호가 변경되었습니다.");
                    ChangePasswordCancle();
                }
                else{
                    window.alert("현재 비밀번호가 맞지 않습니다.")
                }
            })
            .catch((error)=>console.log(error));
        }
    }

    const { mutate :mutateChangeNickName } = useMutation(async () =>{
        if (newNickName.length <= 0){
            window.alert("한 글자 이상의 닉네임을 입력해 주십시오.");
        }
        else{
            const data = new FormData();
            data.append("memberNickName", newNickName);
            const duplicateUrl = "/api/opentalk/member/checkNickName";
            try{
                const res = await axios.post(duplicateUrl, data);
                if (!res.data){
                    try{
                        const checkUrl = "/api/opentalk/member/changeNickname";
                        const res2 = await axios.post(checkUrl, {
                        memberId: member.memberId,
                        memberNickName: newNickName
                        })
                        if (res2.status === 200){
                            window.alert("닉네임이 변경되었습니다.")
                            ChangeNickNameCancle();

                            client.current.publish({destination: "/pub/chat/changeNickName", body: JSON.stringify({
                                nickName: "system",
                                message: `닉네임이 변경되었습니다.`,
                            })});
                        } else{
                            alert("이미 존재하는 닉네임입니다.")
                        }
                    } catch(error){
                        console.log(error);
                    }
                } 
            } catch(error){
                console.log(error);
            }
        }
        }, {
            onSuccess:() =>{
                queryClient.invalidateQueries("myInfo");
        }});

    const ChangeNickName = () =>{
        mutateChangeNickName();
    }
    
    return(
        <div>
            <Desktop>
                <Container style={{minHeight:"100vh"}}>
                    <Row style={{ textAlign: 'center' }}>
                        <Col md={{ span: 3, offset: 4}} className={`border-${theme === 'light' ? "#7B7B7B" : "#595959"} border-3 rounded-5 p-5`} 
                                style={{backgroundColor: theme === 'light' ? "#7B7B7B" : "#595959"}}>
                            <img 
                                alt="프로필 이미지" 
                                src={curImgUrl}
                                style={{width:'80%',
                                        backgroundPosition:"center",
                                        borderRadius: "50%"}}    
                            ></img>
                            <br></br>
                            <br></br>
                            <ListGroup className='custom-ui'>
                                <ListGroupItem 
                                    className='custom-ui' 
                                    style={{
                                        border: theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                        backgroundColor: theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                        color:theme === 'light' ? '#000000' : '#FFFFFF',
                                        marginBottom: '5px',
                                }}>이름 <hr/><strong>{member.memberName}</strong></ListGroupItem>
                                <ListGroupItem
                                    className='custom-ui' 
                                    style={{
                                        border: theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                        backgroundColor: theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                        color:theme === 'light' ? '#000000' : '#FFFFFF',
                                        marginBottom: '5px',
                                }}>닉네임 <hr/><strong>{member.memberNickName}</strong></ListGroupItem>
                                <ListGroupItem 
                                    className='custom-ui' 
                                    style={{ border: theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                        backgroundColor: theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                        color:theme === 'light' ? '#000000' : '#FFFFFF', 
                                    }}>이메일 <hr/><strong>{member.memberEmail}</strong></ListGroupItem>
                            </ListGroup>
                            <hr/>
                            <Modal isOpen={imgPopupOpen} onRequestClose={ChangeImgCancle}
                            style={{
                                content: {
                                    backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                                    width: '800px', // 원하는 너비로 설정
                                    height: '400px', // 원하는 높이로 설정
                                    borderTopLeftRadius: '25px',
                                    borderBottomLeftRadius: '25px',
                                    borderTopRightRadius: '25px',
                                    borderBottomRightRadius: '25px',
                                }
                            }}>
                                <img src={uploadPreview} />
                                <hr/>
                                <FormControl className='custom-ui' type='file' accept='image/*' onChange={onChangeImageUpload}></FormControl>
                                <br/>
                                <Button className='custom-button' 
                                        variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                                        style={{ backgroundColor: theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                        color: theme === 'light' ? '#000000' : '#FFFFFF'}} 
                                        onClick={ChangeImg}><strong>변경하기</strong></Button>
                                <div style={{width:"4px", display:"inline-block"}}/>
                                <Button className='custom-button' variant='dark' onClick={ChangeImgCancle}>변경취소</Button>
                            </Modal>
                            <Modal isOpen={nickPopupOpen} onRequestClose={ChangeNickNameCancle}
                            style={{
                                content: {
                                    backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                                    width: '800px', // 원하는 너비로 설정
                                    height: '400px', // 원하는 높이로 설정
                                    borderTopLeftRadius: '25px',
                                    borderBottomLeftRadius: '25px',
                                    borderTopRightRadius: '25px',
                                    borderBottomRightRadius: '25px',
                                }
                            }}>
                                <InputGroup>
                                    <InputGroup.Text style={{backgroundColor: theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                                            color:theme === 'light' ? '#000000' : '#FFFFFF',
                                                            borderTopLeftRadius: "50px",
                                                            borderBottomLeftRadius: "50px",
                                                            }}><strong>새 닉네임</strong></InputGroup.Text>
                                    <Form.Control 
                                        type="text" 
                                        value={newNickName} 
                                        onChange={GetInputNewNickName}
                                        style={{borderTopRightRadius: "50px",
                                                borderBottomRightRadius: "50px",
                                                }}></Form.Control>
                                </InputGroup>
                                <br></br>
                                <Button 
                                    className='custom-button'
                                    variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"}
                                    style={{backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                    color:theme === 'light' ? '#000000' : '#FFFFFF',}} 
                                    onClick={ChangeNickName}><strong>변경하기</strong></Button>
                                <div style={{width:"4px", display:"inline-block"}}/>
                                <Button className='custom-button' variant='dark' onClick={ChangeNickNameCancle}>변경 취소</Button>
                            </Modal>
                            <Modal isOpen={pwPopupOpen} onRequestClose={ChangePasswordCancle}
                            style={{
                                content: {
                                    backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                                    width: '800px', // 원하는 너비로 설정
                                    height: '400px', // 원하는 높이로 설정
                                    borderTopLeftRadius: '25px',
                                    borderBottomLeftRadius: '25px',
                                    borderTopRightRadius: '25px',
                                    borderBottomRightRadius: '25px',
                                }
                            }}>
                                <InputGroup>
                                    <InputGroup.Text style={{
                                            backgroundColor: theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                            color: theme === 'light' ? '#000000' : '#FFFFFF',
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
                                            backgroundColor: theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                            color: theme === 'light' ? '#000000' : '#FFFFFF',
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
                                            backgroundColor: theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                            color: theme === 'light' ? '#000000' : '#FFFFFF',
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
                                <Button 
                                    className='custom-button' 
                                    variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                                    style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                    color: theme === 'light' ? '#000000' : '#FFFFFF' }} 
                                    onClick={ChangePassword}><strong>변경하기</strong></Button>
                                <div style={{width:"4px", display:"inline-block"}}/>
                                <Button className='custom-button' variant='dark'onClick={ChangePasswordCancle}>변경 취소</Button>
                            </Modal>
                            <div className="d-grid gap-2">
                                <Button 
                                    className='custom-button' 
                                    variant={theme === 'light' ? '#CDCDCD' : '#A0A0A0'}
                                    style={{ backgroundColor:theme === 'light' ? '#CDCDCD' : '#A0A0A0',
                                    color:theme === 'light' ? '#000000' : '#FFFFFF' }} 
                                    onClick={ChangeImgPopup}>프로필 이미지 변경</Button>
                                <Button className='custom-button' 
                                        variant={theme === 'light' ? '#CDCDCD' : '#A0A0A0'}
                                        style={{ backgroundColor:theme === 'light' ? '#CDCDCD' : '#A0A0A0',
                                        color:theme === 'light' ? '#000000' : '#FFFFFF'}}  
                                        onClick={ChangeNickNamePopup}>닉네임 변경</Button>
                                <Button className='custom-button' 
                                        variant={theme === 'light' ? '#CDCDCD' : '#A0A0A0'}
                                        style={{ backgroundColor:theme === 'light' ? '#CDCDCD' : '#A0A0A0',
                                                color:theme === 'light' ? '#000000' : '#FFFFFF'}}  
                                        onClick={ChangePasswordPopup}>비밀번호 변경</Button>
                                <Button
                                    className='custom-button' 
                                    variant='dark' 
                                    onClick={() => {
                                    navigate("/opentalk/main")
                                    window.URL.revokeObjectURL(curImgUrl);
                                }}>이전 페이지</Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Desktop>
            <Mobile>
                <Container style={{minHeight:"100vh"}}>
                    <Row style={{ textAlign: 'center' }}>
                        <Col md={{ span: 3, offset: 4}} className="border-3 rounded-5 p-5" style={{backgroundColor: theme === 'light' ? "#7B7B7B" : "#595959"}}>
                            <img 
                                alt="프로필 이미지" 
                                src={curImgUrl}
                                style={{width:'80%',
                                        backgroundPosition:"center",
                                        borderRadius: "50%"}}    
                            ></img>
                            <br></br>
                            <br></br>
                            <ListGroup className='custom-ui'>
                                <ListGroupItem 
                                    className='custom-ui' style={{
                                    border:theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                    backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                    color: theme === 'light' ? '#000000' : '#FFFFFF', 
                                    marginBottom: '5px',
                                }}>이름 <hr/><strong>{member.memberName}</strong></ListGroupItem>
                                <ListGroupItem
                                    className='custom-ui' 
                                    style={{
                                    border:theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                    backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                    color: theme === 'light' ? '#000000' : '#FFFFFF',
                                    marginBottom: '5px',
                                }}>닉네임 <hr/><strong>{member.memberNickName}</strong></ListGroupItem>
                                <ListGroupItem 
                                    className='custom-ui' 
                                    style={{ border:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                    color: theme === 'light' ? '#000000' : '#FFFFFF',
                                            backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",}}>이메일 <hr/><strong>{member.memberEmail}</strong></ListGroupItem>
                            </ListGroup>
                            <hr/>
                            <Modal isOpen={imgPopupOpen} onRequestClose={ChangeImgCancle}
                            style={{
                                content: {
                                    backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                                    width: '350px', // 원하는 너비로 설정
                                    height: '400px', // 원하는 높이로 설정
                                    borderTopLeftRadius: '25px',
                                    borderBottomLeftRadius: '25px',
                                    borderTopRightRadius: '25px',
                                    borderBottomRightRadius: '25px',
                                }
                            }}>
                                <img src={uploadPreview} />
                                <hr/>
                                <FormControl className='custom-ui' type='file' accept='image/*' onChange={onChangeImageUpload}></FormControl>
                                <br/>
                                <Button className='custom-button' 
                                        variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                                        style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                        color: theme === 'light' ? '#000000' : '#FFFFFF'}} onClick={ChangeImg}><strong>변경하기</strong></Button>
                                <div style={{width:"4px", display:"inline-block"}}/>
                                <Button className='custom-button' variant='dark' onClick={ChangeImgCancle}>변경취소</Button>
                            </Modal>
                            <Modal isOpen={nickPopupOpen} onRequestClose={ChangeNickNameCancle}
                            style={{
                                content: {
                                    backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                                    width: '350px', // 원하는 너비로 설정
                                    height: '400px', // 원하는 높이로 설정
                                    borderTopLeftRadius: '25px',
                                    borderBottomLeftRadius: '25px',
                                    borderTopRightRadius: '25px',
                                    borderBottomRightRadius: '25px',
                                }
                            }}>
                                <InputGroup>
                                    <InputGroup.Text style={{backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                                            color: theme === 'light' ? '#000000' : '#FFFFFF',
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
                                <Button 
                                    className='custom-button'
                                    variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"}
                                    style={{backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                    color: theme === 'light' ? '#000000' : '#FFFFFF'}} 
                                    onClick={ChangeNickName}><strong>변경하기</strong></Button>
                                <div style={{width:"4px", display:"inline-block"}}/>
                                <Button className='custom-button' variant='dark' onClick={ChangeNickNameCancle}>변경 취소</Button>
                            </Modal>
                            <Modal isOpen={pwPopupOpen} onRequestClose={ChangePasswordCancle}
                            style={{
                                content: {
                                    backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                                    width: '350px', // 원하는 너비로 설정
                                    height: '400px', // 원하는 높이로 설정
                                    borderTopLeftRadius: '25px',
                                    borderBottomLeftRadius: '25px',
                                    borderTopRightRadius: '25px',
                                    borderBottomRightRadius: '25px',
                                }
                            }}>
                                <InputGroup>
                                    <InputGroup.Text style={{
                                            backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                            color: theme === 'light' ? '#000000' : '#FFFFFF',
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
                                            backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                            color: theme === 'light' ? '#000000' : '#FFFFFF',
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
                                            backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0", 
                                            color: theme === 'light' ? '#000000' : '#FFFFFF',
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
                                <Button 
                                    className='custom-button' 
                                    variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                                    style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                    color: theme === 'light' ? '#000000' : '#FFFFFF'}} 
                                    onClick={ChangePassword}><strong>변경하기</strong></Button>
                                <div style={{width:"4px", display:"inline-block"}}/>
                                <Button className='custom-button' variant='dark'onClick={ChangePasswordCancle}>변경 취소</Button>
                            </Modal>
                            <div className="d-grid gap-2">
                                <Button 
                                    className = 'custom-button' 
                                    variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"}
                                    style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                    color: theme === 'light' ? '#000000' : '#FFFFFF' }} 
                                    onClick={ChangeImgPopup}>프로필 이미지 변경</Button>
                                <Button className = 'custom-button' 
                                    variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"}
                                    style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                    color: theme === 'light' ? '#000000' : '#FFFFFF' }} 
                                    onClick={ChangeNickNamePopup}>닉네임 변경</Button>
                                <Button 
                                    className = 'custom-button' 
                                    variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"}
                                    style={{ backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                    color: theme === 'light' ? '#000000' : '#FFFFFF' }} 
                                    onClick={ChangePasswordPopup}>비밀번호 변경</Button>
                                <Button
                                    className = 'custom-button' 
                                    variant='dark' 
                                    onClick={() => {
                                    navigate("/opentalk/main")
                                    window.URL.revokeObjectURL(curImgUrl);
                                }}>이전 페이지</Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Mobile>
        </div>
        
    );

}

export default ProfileComponent