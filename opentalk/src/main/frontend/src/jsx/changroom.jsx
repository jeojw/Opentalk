import React, {useState, useEffect, useContext} from 'react';
import Modal from 'react-modal';
import axios from'axios';
import { Form, Button, Row, Col, InputGroup, FormControl,ListGroup,ListGroupItem, } from 'react-bootstrap';
import { useQueryClient } from 'react-query';
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

const ChangRoomComponent = ({room_Id, stompClient, curParticipates, showModal, setShowModal}) => {
    const { theme } = useContext(themeContext);

    const queryClient = useQueryClient();

    const [roomData, setRoomData] = useState();
    const [roomName, setRoomName] = useState("");
    const [preRoomName, setPreRoomName] = useState("");

    const [info, setInfo] = useState("");
    const [preInfo, setPreInfo] = useState("");

    const [existLock, setExistLock] = useState(false);
    const [preExistLock, setPreExistLock] = useState(false);

    const [password, setPassword] = useState("");

    const [tag, setTag] = useState("");
    const [tags, setTags] = useState([]);
    const [preTags, setPreTags] = useState([]);

    const [participants, setParticipants] = useState(0);
    const [preParticipates, setPreParticipants] = useState(0);

    const incrementParticipants = () => {
        if (participants < 20) {
          setParticipants(participants + 1);
        }
        else{
            window.alert("방의 인원수는 최대 20명까지 가능합니다.");
        }
    };

    const decrementParticipants = () => {
        if (participants > curParticipates && participants > 3) {
            setParticipants(participants - 1);
        }
        else if (participants <= 3){
            window.alert("방의 인원수는 최소 3명부터 가능합니다.");
        }
        else if (participants <= curParticipates){
            window.alert("현재 인원수보다 적게 인원을 설정할 수 없습니다.");
        }
    };

    useEffect(() =>{
        const fetchCurRoomInfo = async () => {
            try{
                const response = await axios.get(`/api/opentalk/getRoom/${room_Id}`);
                setRoomData(response.data);
                setPreRoomName(response.data.roomName);
                setPreExistLock(response.data.existLock);
                setPreInfo(response.data.introduction);
                setPreParticipants(response.data.limitParticipates);
                setPreTags(response.data.roomTags);

                setRoomName(response.data.roomName);
                setExistLock(response.data.existLock);
                setInfo(response.data.introduction);
                setParticipants(response.data.limitParticipates);
                setTags(response.data.roomTags);
            } catch (error) {
                console.log(error);
            }
        }
        fetchCurRoomInfo();
    }, []);

    const cancleSetModal = () => {
        setShowModal(false);
        setRoomName(preRoomName);
        setExistLock(preExistLock);
        setInfo(preInfo);
        setPassword("");
        setParticipants(preParticipates);
        setTags(preTags);
    }

    const changeRoomModal = async () => {
        try{
            const res = await axios.post("/api/opentalk/changeRoom", {
                roomId: room_Id,
                roomName: roomName,
                roomPassword: password,
                limitParticipates: participants,
                introduction: info,
                existLock: existLock,
                roomTags: tags        
            })
            if (res.data === true){
                window.alert("방 설정이 변경되었습니다.");          
                stompClient.publish({
                    destination: '/pub/chat/changeRoom',
                    body: JSON.stringify({
                        nickName: "system",
                        message: "방 설정이 변경되었습니다."
                    })
                });
                queryClient.invalidateQueries("allChatRooms");
                setShowModal(false);
            }
        } catch(error){
            console.log(error);
        }
    }

    const GetInputName = (event) => {
        setRoomName(event.target.value);
    }
    const GetInputParticipates = (event) => {
        console.log(curParticipates);
        if (event.target.value >= curParticipates){
            if (event.target.value > 20){
                window.alert("방의 인원수는 최대 20명까지 가능합니다.");
            }
            else{
                setParticipants(event.target.value);
            }
        }
        else if (event.target.value < curParticipates){
            window.alert("현재 인원의 수보다 적게 설정이 불가능합니다.");
        }
    }
    const GetInputPassword = (event) => {
        if (existLock){
            setPassword(event.target.value);
        }
        else{
            setPassword('');
        }
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

    const tagDelete = (getTag) => {
        const newTags = tags.filter(tag => tag !== getTag);
        setTags(newTags);
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

    return(
        <div>
            <Desktop>
                <Modal isOpen={showModal} onRequestClose ={cancleSetModal}
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
                                    type='text'
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
                            <br></br>
                            <ListGroup className="list-group list-group-horizontal custom-ui">
                                {tags?.map((t)=> (
                                    <ListGroupItem 
                                        className='custom-ui'
                                        style={{backgroundColor:theme === 'light' ? '#000000' : "#B9B9B9"}}
                                    >#{t.tagName} 
                                    <Button
                                        className='btn-sm custom-button' 
                                        variant='dark' 
                                        onClick={()=>tagDelete(t)} 
                                    >삭제</Button></ListGroupItem>
                                )
                                )}
                            </ListGroup>
                            <br></br>
                            <div className='d-flex flex-row gap-2'>
                                <Button
                                    className='custom-button'
                                    variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                                    style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                                    onClick={changeRoomModal}><strong>변경하기</strong></Button>
                                <Button
                                    className='custom-button' 
                                    variant='dark' 
                                    onClick={cancleSetModal}>변경 취소</Button>
                            </div>
                    </Col>
                </Row>
                </Modal>
            </Desktop>
            <Mobile>
                <Modal isOpen={showModal} onRequestClose ={cancleSetModal}
                onHide
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
                                    type='text'
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
                            <br></br>
                            <ListGroup className="list-group list-group-horizontal custom-ui">
                                {tags?.map((t)=> (
                                    <ListGroupItem 
                                        className='custom-ui'
                                    >#{t.tagName} 
                                    <Button
                                        className='btn-sm custom-button' 
                                        variant='dark' 
                                        onClick={()=>tagDelete(t)} 
                                    >삭제</Button></ListGroupItem>
                                )
                                )}
                            </ListGroup>
                            <br></br>
                            <div className='d-flex flex-row gap-2'>
                                <Button
                                    className='custom-button'
                                    variant='#B9B9B9' 
                                    style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                                    color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                                    onClick={changeRoomModal}><strong>변경하기</strong></Button>
                                <Button
                                    className='custom-button' 
                                    variant='dark' 
                                    onClick={cancleSetModal}>변경 취소</Button>
                            </div>
                        </Col>
                    </Row>
                </Modal>
            </Mobile>
        </div>
    );
}

export default ChangRoomComponent;