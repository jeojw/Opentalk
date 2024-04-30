import React, {useState, useEffect} from 'react';
import Modal from 'react-modal';
import axios from'axios';
import { Form, Button, Row, Col, InputGroup, FormControl,ListGroup,ListGroupItem, } from 'react-bootstrap';
import { useQueryClient } from 'react-query';
import { useMediaQuery } from 'react-responsive';

const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 768 })
    return isDesktop ? children : null
}
const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })
    return isMobile ? children : null
}

const ChangRoomComponent = ({room_Id, stompClient, curParticipates, showModal, setShowModal}) => {
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
        if (participants > curParticipates || participants > 3) {
            setParticipants(participants - 1);
        }
        else if (participants <= curParticipates){
            window.alert("현재 인원수보다 적게 인원을 설정할 수 없습니다.");
        }
        else if (participants < 3){
            window.alert("방의 인원수는 최소 3명부터 가능합니다.");
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
                        width: '800px', // 원하는 너비로 설정
                        height: '400px', // 원하는 높이로 설정
                    }
                }}>
                    <Row>
                        <Col>
                        <InputGroup>
                            <InputGroup.Text 
                            style={{backgroundColor: "#B9B9B9", 
                                    borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px"}}><strong>방 이름</strong></InputGroup.Text>
                            <FormControl 
                                type='text' 
                                value={roomName} 
                                onChange={GetInputName}
                                style={{borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}></FormControl>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                            <InputGroup.Text 
                            style={{backgroundColor: "#B9B9B9", 
                                    borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px"}}><strong>인원수</strong></InputGroup.Text>
                            <FormControl 
                                type='number'
                                min={3}
                                max={20}
                                value={participants} 
                                onChange={GetInputParticipates}
                                style={{borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}></FormControl>
                        </InputGroup>
                        <br></br>
                        <InputGroup className='d-flex flex-row gap-1'>
                            <InputGroup.Text 
                            style={{backgroundColor: "#B9B9B9", 
                                    borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px"}}><strong>비밀번호</strong></InputGroup.Text>
                            <Form.Check 
                                size={20}
                                type='checkbox' 
                                checked={existLock} 
                                onChange={GetCheckExistPw}
                                style={{zoom:1.6}}/>
                            <FormControl 
                                type='password' 
                                value={password} 
                                onChange={GetInputPassword} 
                                disabled={!existLock}
                                placeholder='비밀번호를 입력해주세요.'
                                style={{borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}></FormControl>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                            <FormControl
                                type='text'
                                value={info}
                                placeholder='방 소개문 입력'
                                onChange={GetInputInfo}
                                style={{borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}
                            ></FormControl>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                            <FormControl
                                type='text'
                                value={tag}
                                placeholder='태그 입력'
                                onChange={GetInputTag}
                                style={{borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px"}}
                            ></FormControl>
                            <Button
                                onClick={()=>AppendTag(tag)}
                                variant="#B9B9B9"
                                style={{ backgroundColor:"#B9B9B9",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}
                            ><strong>태그 추가</strong></Button>
                        </InputGroup>
                        <br></br>
                        <ListGroup className="list-group list-group-horizontal">
                            {tags?.map((t)=> (
                                <ListGroupItem style={{
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"
                            }}>#{t.tagName} <Button
                                className='btn-sm' 
                                variant='dark' 
                                onClick={()=>tagDelete(t)} 
                                style={{
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"}}>삭제</Button></ListGroupItem>
                            )
                            )}
                        </ListGroup>
                        <br></br>
                        <div className='d-flex flex-row gap-2'>
                            <Button variant='#B9B9B9' style={{
                                backgroundColor:"#B9B9B9",
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"
                            }} onClick={changeRoomModal}><strong>변경하기</strong></Button>
                            <Button variant='dark' style={{
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"
                            }} onClick={cancleSetModal}>변경 취소</Button>
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
                        width: '350px', // 원하는 너비로 설정
                        height: '400px', // 원하는 높이로 설정
                        zIndex: 1000
                    }
                }}>
                    <Row>
                        <Col>
                        <InputGroup>
                            <InputGroup.Text 
                            style={{backgroundColor: "#B9B9B9", 
                                    borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px"}}><strong>방 이름</strong></InputGroup.Text>
                            <FormControl 
                                type='text' 
                                value={roomName} 
                                onChange={GetInputName}
                                style={{borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}></FormControl>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                            <InputGroup.Text 
                            style={{backgroundColor: "#B9B9B9", 
                                    borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px"}}><strong>인원수</strong></InputGroup.Text>
                            <FormControl 
                                type='number'
                                min={3}
                                max={20}
                                value={participants}/>
                            <Button
                                variant='#B9B9B9' 
                                onClick={incrementParticipants} style={{
                                backgroundColor:"#B9B9B9"
                            }}>+</Button>
                            <Button
                                variant="dark" 
                                onClick={decrementParticipants} style={{
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px",
                                width:"40px"
                            }}>-</Button>

                        </InputGroup>
                        <br></br>
                        <InputGroup className='d-flex flex-row gap-1'>
                            <InputGroup.Text 
                            style={{backgroundColor: "#B9B9B9", 
                                    borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px"}}><strong>비밀번호</strong></InputGroup.Text>
                            <Form.Check 
                                size={20}
                                type='checkbox' 
                                checked={existLock} 
                                onChange={GetCheckExistPw}
                                style={{zoom:1.6}}/>
                            <FormControl 
                                type='password' 
                                value={password} 
                                onChange={GetInputPassword} 
                                disabled={!existLock}
                                placeholder='비밀번호를 입력해주세요.'
                                style={{borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}></FormControl>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                            <FormControl
                                type='text'
                                value={info}
                                placeholder='방 소개문 입력'
                                onChange={GetInputInfo}
                                style={{borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}
                            ></FormControl>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                            <FormControl
                                type='text'
                                value={tag}
                                placeholder='태그 입력'
                                onChange={GetInputTag}
                                style={{borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px"}}
                            ></FormControl>
                            <Button
                                onClick={()=>AppendTag(tag)}
                                variant="#B9B9B9"
                                style={{ backgroundColor:"#B9B9B9",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}
                            ><strong>태그 추가</strong></Button>
                        </InputGroup>
                        <br></br>
                        <ListGroup className="list-group list-group-horizontal">
                            {tags?.map((t)=> (
                                <ListGroupItem style={{
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"
                            }}>#{t.tagName} <Button
                                className='btn-sm' 
                                variant='dark' 
                                onClick={()=>tagDelete(t)} 
                                style={{
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"}}>삭제</Button></ListGroupItem>
                            )
                            )}
                        </ListGroup>
                        <br></br>
                        <div className='d-flex flex-row gap-2'>
                            <Button variant='#B9B9B9' style={{
                                backgroundColor:"#B9B9B9",
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"
                            }} onClick={changeRoomModal}><strong>변경하기</strong></Button>
                            <Button variant='dark' style={{
                                borderTopLeftRadius: "25px",
                                borderBottomLeftRadius: "25px",
                                borderTopRightRadius: "25px",
                                borderBottomRightRadius: "25px"
                            }} onClick={cancleSetModal}>변경 취소</Button>
                        </div>
                    </Col>
                </Row>
                </Modal>
            </Mobile>
        </div>
    );
}

export default ChangRoomComponent;