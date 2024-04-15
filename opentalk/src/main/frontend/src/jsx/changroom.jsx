import React, {useState, useEffect} from 'react';
import {useCookies} from 'react-cookie';
import Modal from 'react-modal';
import axios from'axios';
import { Form, Button, Container, Row, Col, InputGroup, 
    InputGroupText, FormControl, FormGroup, FormLabel,
    ListGroup,
    ListGroupItem, } from 'react-bootstrap';

const ChangRoomComponent = ({room_Id, role, setIsChangeRoom}) => {
    const [roomInfo, setRoomInfo] = useState();

    const [isOpen, setIsOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [preRoomName, setPreRoomName] = useState("");

    const [info, setInfo] = useState("");
    const [preInfo, setPreInfo] = useState("");

    const [existLock, setExistLock] = useState(false);
    const [preExistLock, setPreExistLock] = useState(false);

    const [password, setPassword] = useState("");
    const [prePassword, setPrePassword] = useState("");

    const [tag, setTag] = useState("");
    const [tags, setTags] = useState([]);
    const [preTags, setPreTags] = useState([]);

    const [participants, setParticipants] = useState(0);
    const [preParticipates, setPreParticipants] = useState(0);

    useEffect(() =>{
        const fetchCurRoomInfo = async () => {
            try{
                const response = await axios.get(`/api/opentalk/getRoom/${room_Id}`);
                setRoomInfo(response.data);
                setPreRoomName(response.data.roomName);
                setPreExistLock(response.data.existLock);
                setPreInfo(response.data.introduction);
                setPrePassword(response.data.roomPassword);
                setPreParticipants(response.data.limitParticipates);
                setPreTags(response.data.roomTags);
            } catch (error) {
                console.log(error);
            }
        }
        fetchCurRoomInfo();
    }, [room_Id]);

    useEffect(() => {
        setRoomName(preRoomName);
        setExistLock(preExistLock);
        setInfo(preInfo);
        setPassword(prePassword);
        setParticipants(preParticipates);
        setTags(preTags);
    }, []);

    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
    }

    const cancleSetModal = () => {
        setIsOpen(false);
        setRoomName(preRoomName);
        setExistLock(preExistLock);
        setInfo(preInfo);
        setPassword(prePassword);
        setParticipants(preParticipates);
        setTags(preTags);
    }

    const changeRoomModal = () => {
        axios.post("/api/opentalk/changeRoom", {
            roomId: room_Id,
            roomName: roomName,
            roomPassword: password,
            limitParticipates: participants,
            introduction: info,
            existLock: existLock,
            roomTags: tags            
        })
        .then((res) => {
            if (res.data === true){
                window.alert("방 설정이 변경되었습니다.");
                setIsChangeRoom(prevState => !prevState);
                setIsOpen(false);
            }
        })
        .catch((error) => console.log(error));
        
    }

    const GetInputName = (event) => {
        setRoomName(event.target.value);
    }
    const GetInputParticipates = (event) => {
        if (event.target.value >= preParticipates){
            if (event.target.value > 20){
                window.alert("방의 인원수는 최대 20명까지 가능합니다.");
            }
            else{
                setParticipants(event.target.value);
            }
        }
        else if (event.target.value >= 3 && event.targat.value < preParticipates){
            window.alert("현재 인원의 수보다 적게 설정이 불가능합니다.");
        }
        else {
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
        <Container>
            <div className='d-grid gap-2'>
                {role === "MANAGER" && (
                <Button onClick={openModal}>설정 변경</Button>
                )} 
            </div>
            <Modal isOpen={isOpen} onRequestClose ={cancleSetModal}
            style={{
                content: {
                    width: '800px', // 원하는 너비로 설정
                    height: '400px', // 원하는 높이로 설정
                }
            }}>
                <Row>
                    <Col>
                    <InputGroup>
                        <InputGroup.Text>방 이름</InputGroup.Text>
                        <FormControl 
                            type='text' 
                            value={roomName} 
                            onChange={GetInputName}></FormControl>
                    </InputGroup>
                    <br></br>
                    <InputGroup>
                        <InputGroup.Text>인원수</InputGroup.Text>
                        <FormControl 
                            type='number'
                            min={3}
                            max={20}
                            value={participants} 
                            onChange={GetInputParticipates}></FormControl>
                    </InputGroup>
                    <br></br>
                    <InputGroup>
                        <InputGroup.Text>비밀번호</InputGroup.Text>
                        <Form.Check 
                            size={20}
                            type='checkbox' 
                            checked={existLock} 
                            onChange={GetCheckExistPw}/>
                        <FormControl 
                            type='password' 
                            value={password} 
                            onChange={GetInputPassword} 
                            disabled={!existLock}></FormControl>
                    </InputGroup>
                    <br></br>
                    <InputGroup>
                        <FormControl
                            type='text'
                            value={info}
                            placeholder='방 소개문'
                            onChange={GetInputInfo}
                        ></FormControl>
                    </InputGroup>
                    <br></br>
                    <InputGroup>
                        <FormControl
                            type='text'
                            value={tag}
                            onChange={GetInputTag}
                        ></FormControl>
                        <Button
                            onClick={()=>AppendTag(tag)}
                        >태그 추가</Button>
                    </InputGroup>
                    <br></br>
                    <ListGroup className="list-group list-group-horizontal">
                        {tags?.map((t)=> (
                            <ListGroupItem>#{t.tagName}<Button onClick={()=>tagDelete(t)}>삭제</Button></ListGroupItem>
                        )
                        )}
                    </ListGroup>
                    
                    <br></br>
                <Button onClick={changeRoomModal}>변경하기</Button>
                <Button onClick={cancleSetModal}>변경 취소</Button>
                </Col>
            </Row>
            </Modal>
        </Container>
    );
}

export default ChangRoomComponent;