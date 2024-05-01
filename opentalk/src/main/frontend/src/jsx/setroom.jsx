import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import axios from'axios';
import { Form, Button, Row, Col, InputGroup, FormControl, ListGroup, ListGroupItem, } from 'react-bootstrap';
import { useQueryClient, useMutation } from 'react-query';
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

export const SetRoomComponent = ({stompClient}) =>{
    const { theme } = useContext(themeContext);

    const [isOpen, setIsOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [participants, setParticipants] = useState(3);
    const [existLock, setExistLock] = useState(false);
    const [password, setPassword] = useState("");
    const [manager, setManger] = useState();
    const [info, setInfo] = useState("");
    const [tag, setTag] = useState("");
    const [tags, setTags] = useState([]);

    const queryClient = useQueryClient();

    const incrementParticipants = () => {
        if (participants < 20) {
          setParticipants(participants + 1);
        }
        else{
            window.alert("방의 인원수는 최대 20명까지 가능합니다.");
        }
    };

    const decrementParticipants = () => {
        if (participants > 3) {
            setParticipants(participants - 1);
        }
        else{
            window.alert("방의 인원수는 최소 3명부터 가능합니다.");
        }
    };

    useEffect(() => {
        const fetchManager = async () =>{
            if (localStorage.getItem("token")){
                try{
                    const response = await axios.get("/api/opentalk/member/me", {
                        headers: {Authorization: localStorage.getItem("token")}
                    })
                    setManger(response.data);
                } catch (error) {
                    console.log(error);
                }
            }
        }
        fetchManager();
    }, []);
    
    const openModal = () => {
        setIsOpen(true)
    };
    const closeModal = () => {
        setRoomName('');
        setExistLock(false);
        setPassword('');
        setParticipants(0);
        setIsOpen(false);
        setTags([]);
        setInfo('');
    }

    const GetInputName = (event) => {
        if (event.target.length <= 1){
            window.alert("한 글자 이상의 방 이름을 입력해 주세요.")
        }
        else{
            setRoomName(event.target.value);
        }
    }
    const GetInputParticipates = (event) => {
        if (event.target.value >= 3){
            if (event.target.value > 20){
                window.alert("방의 인원수는 최대 20명까지 가능합니다.");
            }
            else{
                setParticipants(event.target.value);
            }
        }
        else{
            window.alert("방의 인원수는 최소 3명부터 가능합니다.");
        }
    }
    const GetInputPassword = (event) => {
        setPassword(event.target.value);
    }
    const GetCheckExistPw = (event) => {
        setExistLock(event.target.checked);
        if (!event.target.checked){
            setPassword('');
        }
    }
    const GetInputInfo = (event) => {
        setInfo(event.target.value);
    }
    const GetInputTag = (event) => {
        setTag(event.target.value);
    }

    const AppendTag = (getTag) => {
        let isExist = false;
        for (let i = 0; i < tags.length; i++){
            if (tags[i].tagName === getTag){
                isExist = true;
            }
        }
        if (tags.length >= 5){
            window.alert("태그 수는 최대 5개까지 지정 가능합니다.");
        }
        else{
            if (getTag === ""){
                window.alert("태그를 입력해주세요.");
            }
            else if (isExist){
                window.alert("이미 추가한 태그입니다.");
            }
            else{
                const newTags = [...tags, {
                    tagName: getTag,
                    accumulate: 0
                }];
                setTags(newTags);
                setTag("");
            }
        }
    }

    const tagDelete = (getTag) => {
        const newTags = tags.filter(tag => tag !== getTag);
        setTags(newTags);
    }

    const {mutate: mutateMakeRoom} = useMutation(async() =>{
        const makeUrl = `/api/opentalk/makeRoom`
        try{
            const res = await axios.post(makeUrl, {
                "roomName": roomName,
                "roomPassword": password,
                "roomManager": manager.memberNickName,
                "limitParticipates": participants,
                "introduction": info,
                "existLock": existLock,
                "members": [],
                "roomTags": tags
            })
            if (res.status === 200){
                window.alert("방이 생성되었습니다.");
                closeModal();

                stompClient.publish({destination: "/pub/chat/createRoom", body: JSON.stringify({
                    nickName: "system",
                    message: `새로운 방을 생성했습니다.`,
                })});
                queryClient.invalidateQueries("allChatRooms");
            }
        } catch(error){
            console.log(error);
        }
    },{
        onSuccess:() => {
            queryClient.invalidateQueries("allChatRooms");
        }
    })

    const MakeRoom = async () => {
        mutateMakeRoom();
    };

    return (
        <div>
            <Desktop>
                <div className="d-grid gap-2 btn-lg">
                    <Button 
                        className='btn-lg custom-button'
                        variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                        style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                        color: theme === 'light' ? '#000000' : "#FFFFFF" }} 
                        onClick={openModal}>
                        <strong>방 생성하기</strong>
                    </Button>
                </div>
                <Modal
                    isOpen={isOpen} 
                    onRequestClose={closeModal}
                    style={{
                        content: {
                            backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                            width: '800px', // 원하는 너비로 설정
                            height: '400px', // 원하는 높이로 설정
                            borderTopLeftRadius: '25px',
                            borderBottomLeftRadius: '25px',
                            borderTopRightRadius: '25px',
                            borderBottomRightRadius: '25px',
                            position:'relative',
                            top: "70px"
                        }
                    }}>
                    <Row>
                        <Col>
                            <InputGroup>
                                <InputGroup.Text
                                    className='custom-ui'
                                style={{backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                        color: theme === 'light' ? '#000000' : "#FFFFFF"}}><strong>방 이름</strong></InputGroup.Text>
                                <FormControl
                                    className='custom-ui'
                                    type='text' 
                                    value={roomName}
                                    onChange={GetInputName}
                                    style={{backgroundColor:theme === 'light' ? '#000000' : "#B9B9B9"}}
                                ></FormControl>
                            </InputGroup>
                            <br></br>
                            <InputGroup>
                                <InputGroup.Text 
                                    className='custom-ui'
                                    style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF" }}><strong>인원수</strong></InputGroup.Text>
                                <FormControl
                                    className='custom-ui'
                                    type='number'
                                    min={3}
                                    max={20}
                                    value={participants} 
                                    onChange={GetInputParticipates}
                                    style={{backgroundColor:theme === 'light' ? '#000000' : "#B9B9B9"}}
                                ></FormControl>
                            </InputGroup>
                            <br></br>
                            <InputGroup className='d-flex flex-row gap-1'>
                                <InputGroup.Text
                                    className='custom-ui'
                                    style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF" }}><strong>비밀번호</strong></InputGroup.Text>
                                <Form.Check 
                                    className='custom-checkbox'
                                    size={20}
                                    type='checkbox' 
                                    checked={existLock} 
                                    onChange={GetCheckExistPw}
                                    style={{zoom:1.6}}/>
                                <FormControl
                                    className='custom-ui'
                                    type='password' 
                                    value={password} 
                                    onChange={GetInputPassword} 
                                    disabled={!existLock}
                                    placeholder='비밀번호를 입력해주세요.'
                                    style={{backgroundColor:theme === 'light' ? '#000000' : "#B9B9B9"}}
                                ></FormControl>
                            </InputGroup>
                            <br></br>
                            <InputGroup>
                                <FormControl
                                    className='custom-ui' 
                                    type="text"
                                    value={info} 
                                    placeholder='방 소개문 입력' 
                                    onChange={GetInputInfo}
                                    style={{backgroundColor:theme === 'light' ? '#000000' : "#B9B9B9"}}
                                ></FormControl>
                            </InputGroup>
                            <br></br>
                            <InputGroup>
                                <FormControl 
                                    className='custom-ui'
                                    type='text' 
                                    value={tag}
                                    placeholder='태그 입력' 
                                    onChange={GetInputTag}
                                    style={{backgroundColor:theme === 'light' ? '#000000' : "#B9B9B9"}}
                                ></FormControl>
                                <Button
                                    className='custom-button'
                                    onClick={()=>AppendTag(tag)}
                                    variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                                    style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                                ><strong>태그 추가</strong></Button>
                            </InputGroup>

                            <ListGroup className="custom-ui list-group list-group-horizontal">
                                {tags.map((t)=> (
                                    <ListGroupItem
                                        className='custom-ui'
                                        style={{backgroundColor:theme === 'light' ? '#000000' : "#B9B9B9"}}
                                    >#{t.tagName} 
                                    <Button 
                                        className='btn-sm custom-button'
                                        variant='dark' 
                                        onClick={()=>tagDelete(t)} 
                                    >삭제</Button></ListGroupItem>
                                ))}
                            </ListGroup>
                            <br></br>
                            <div className='d-flex flex-row gap-2'>
                                <Button
                                    className='custom-button'
                                    variant='#B9B9B9' 
                                    style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                                    onClick={MakeRoom}><strong>방 생성하기</strong></Button>
                                <Button
                                    className='custom-button' 
                                    variant="dark" 
                                    style={{color:'#FFFFFF' }} 
                                    onClick={closeModal}>생성 취소</Button>
                            </div>
                        </Col>
                    </Row>
                </Modal>
            </Desktop>
            <Mobile>
                <div className="d-grid gap-2 btn-lg">
                    <Button 
                        className='btn-lg custom-button'
                        variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                        style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                        color: theme === 'light' ? '#000000' : "#FFFFFF" }} 
                        onClick={openModal}>
                        <strong>방 생성하기</strong>
                    </Button>
                </div>
                <Modal
                    isOpen={isOpen} 
                    onRequestClose={closeModal}
                    style={{
                        content: {
                            backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                            width: '350px', // 원하는 너비로 설정
                            height: '400px', // 원하는 높이로 설정
                            borderTopLeftRadius: '25px',
                            borderBottomLeftRadius: '25px',
                            borderTopRightRadius: '25px',
                            borderBottomRightRadius: '25px',
                            position:'relative',
                            top: "70px"
                        }
                    }}>
                    <Row>
                        <Col>
                            <InputGroup>
                                <InputGroup.Text
                                    className='custom-ui'
                                style={{backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                        color: theme === 'light' ? '#000000' : "#FFFFFF"}}><strong>방 이름</strong></InputGroup.Text>
                                <FormControl
                                    className='custom-ui'
                                    type='text' 
                                    value={roomName} 
                                    onChange={GetInputName}
                                ></FormControl>
                            </InputGroup>
                            <br></br>
                            <InputGroup>
                                <InputGroup.Text 
                                    className='custom-ui'
                                    style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF" }}><strong>인원수</strong></InputGroup.Text>
                                <FormControl
                                    className='custom-ui'
                                    type='number'
                                    min={3}
                                    max={20}
                                    value={participants} 
                                    onChange={GetInputParticipates}
                                ></FormControl>
                            </InputGroup>
                            <br></br>
                            <InputGroup className='d-flex flex-row gap-1'>
                                <InputGroup.Text
                                    className='custom-ui'
                                    style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF" }}><strong>비밀번호</strong></InputGroup.Text>
                                <Form.Check 
                                    className='custom-checkbox'
                                    size={20}
                                    type='checkbox' 
                                    checked={existLock} 
                                    onChange={GetCheckExistPw}
                                    style={{zoom:1.6}}/>
                                <FormControl
                                    className='custom-ui'
                                    type='password' 
                                    value={password} 
                                    onChange={GetInputPassword} 
                                    disabled={!existLock}
                                    placeholder='비밀번호를 입력해주세요.'
                                ></FormControl>
                            </InputGroup>
                            <br></br>
                            <InputGroup>
                                <FormControl
                                    className='custom-ui' 
                                    type="text"
                                    value={info} 
                                    placeholder='방 소개문 입력' 
                                    onChange={GetInputInfo}
                                ></FormControl>
                            </InputGroup>
                            <br></br>
                            <InputGroup>
                                <FormControl 
                                    className='custom-ui'
                                    type='text' 
                                    value={tag}
                                    placeholder='태그 입력' 
                                    onChange={GetInputTag}
                                ></FormControl>
                                <Button
                                    className='custom-button'
                                    onClick={()=>AppendTag(tag)}
                                    variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                                    style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                                ><strong>태그 추가</strong></Button>
                            </InputGroup>

                            <ListGroup className="custom-ui list-group list-group-horizontal">
                                {tags.map((t)=> (
                                    <ListGroupItem
                                        className='custom-ui'
                                    >#{t.tagName} 
                                    <Button 
                                        className='btn-sm custom-button'
                                        variant='dark' 
                                        onClick={()=>tagDelete(t)} 
                                    >삭제</Button></ListGroupItem>
                                ))}
                            </ListGroup>
                            <br></br>
                            <div className='d-flex flex-row gap-2'>
                                <Button
                                    className='custom-button'
                                    variant='#B9B9B9' 
                                    style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                                    onClick={MakeRoom}><strong>방 생성하기</strong></Button>
                                <Button
                                    className='custom-button' 
                                    variant="dark" 
                                    style={{color:'#FFFFFF' }} 
                                    onClick={closeModal}>생성 취소</Button>
                            </div>
                        </Col>
                    </Row>
                </Modal>
            </Mobile>
        </div>
    );
}; 

export default SetRoomComponent;