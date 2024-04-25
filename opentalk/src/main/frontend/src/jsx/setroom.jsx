import React, {useState, useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import axios from'axios';
import { Form, Button, Container, Row, Col, InputGroup, 
    InputGroupText, FormControl, FormGroup, FormLabel,
    ListGroup,
    ListGroupItem, } from 'react-bootstrap';
import { TokenContext } from './TokenContext';

export const SetRoomComponent = ({onDataUpdate, updateFunction}) =>{
    const [isOpen, setIsOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [roomId, setRoomId] = useState("");
    const [participants, setParticipants] = useState(3);
    const [existLock, setExistLock] = useState(false);
    const [password, setPassword] = useState("");
    const [manager, setManger] = useState();
    const [info, setInfo] = useState("");
    const [tag, setTag] = useState("");
    const [tags, setTags] = useState([]);
    
    const {loginToken} = useContext(TokenContext);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchManager = async () =>{
            try{
                const response = await axios.get("/api/opentalk/member/me", {
                    headers: {Authorization: loginToken}
                })
                setManger(response.data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchManager();
        console.log(manager);
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


    const MakeRoom = () => {
        const makeUrl = `/api/opentalk/makeRoom`
        console.log(manager);
        axios.post(makeUrl, {
            "roomName": roomName,
            "roomPassword": password,
            "roomManager": manager.memberNickName,
            "limitParticipates": participants,
            "introduction": info,
            "existLock": existLock,
            "members": [],
            "roomTags": tags
        })
        .then((res)=>{
            if (res.status === 200){
                alert("방이 생성되었습니다.");
                updateFunction();
                setRoomId(res.data);
                closeModal();
                onDataUpdate(prevState => !prevState);
            }
        })
        .catch((error) => console.log(error));
        
    };

    return (
        <div>
            <div className="d-grid gap-2 btn-lg">
                <Button 
                className='btn-lg'
                variant="#8F8F8F" 
                style={{
                        backgroundColor:'#8F8F8F', 
                        borderTopLeftRadius: "25px",
                        borderBottomLeftRadius: "25px",
                        borderTopRightRadius: "25px",
                        borderBottomRightRadius: "25px"
                }} 
                onClick={openModal}>
                    <strong>방 생성하기</strong>
                </Button>
            </div>
            <Modal
                isOpen={isOpen} 
                onRequestClose={closeModal}
                style={{
                    content: {
                        width: '800px', // 원하는 너비로 설정
                        height: '400px', // 원하는 높이로 설정
                    }
                }}>
                <Row>
                    <Col>
                        <InputGroup>
                            <InputGroup.Text style={{backgroundColor:'#8F8F8F',
                                                    borderTopLeftRadius: "25px",
                                                    borderBottomLeftRadius: "25px",
                                                    }}><strong>방 이름</strong></InputGroup.Text>
                            <FormControl 
                                type='text' 
                                value={roomName} 
                                onChange={GetInputName}
                                placeholder='한 글자 이상의 방 이름을 입력해 주세요.'
                                style={{borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}
                            ></FormControl>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                            <InputGroup.Text style={{backgroundColor:'#8F8F8F',
                                                    borderTopLeftRadius: "25px",
                                                    borderBottomLeftRadius: "25px",
                                                    }}><strong>인원수</strong></InputGroup.Text>
                            <FormControl 
                                type="number"
                                min={3} 
                                max={20} 
                                value={participants} 
                                onChange={GetInputParticipates}
                                style={{borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}
                            ></FormControl>
                        </InputGroup>
                        <br></br>
                        <InputGroup className='d-flex flex-row gap-1'>
                            <InputGroup.Text style={{backgroundColor:'#8F8F8F',
                                                    borderTopLeftRadius: "25px",
                                                    borderBottomLeftRadius: "25px",
                                                    }}><strong>비밀번호</strong></InputGroup.Text>
                            <Form.Check 
                                type='checkbox' 
                                checked={existLock} 
                                onChange={GetCheckExistPw}
                                style={{zoom:1.6}}
                            />
                            <FormControl 
                                type='password' 
                                value={password} 
                                onChange={GetInputPassword} 
                                disabled={!existLock}
                                placeholder='비밀번호를 입력해주세요.'
                                style={{borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}
                            ></FormControl>
                        </InputGroup>
                        <br></br>
                        <InputGroup>
                            <FormControl 
                                type="text"
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
                                        borderBottomLeftRadius: "25px",}}
                            ></FormControl>
                            <Button variant="#8F8F8F" style={{backgroundColor:'#8F8F8F', 
                                                            borderTopRightRadius: "25px",
                                                            borderBottomRightRadius: "25px"
                                                            }} onClick={()=>AppendTag(tag)}><strong>태그 추가</strong></Button>
                        </InputGroup>

                        <ListGroup className="list-group list-group-horizontal">
                            {tags.map((t)=> (
                                <ListGroupItem 
                                style={{borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"
                                        }}>#{t.tagName} 
                                        <Button 
                                            className='btn-sm'
                                            variant='dark' 
                                            onClick={()=>tagDelete(t)} 
                                            style={{borderTopLeftRadius: "25px",
                                                borderBottomLeftRadius: "25px",
                                                borderTopRightRadius: "25px",
                                                borderBottomRightRadius: "25px"
                                            }}
                                        >삭제</Button></ListGroupItem>
                            ))}
                        </ListGroup>
                        <br></br>
                        <div className='d-flex flex-row gap-2'>
                            <Button variant="#8F8F8F" style={{backgroundColor:'#8F8F8F', 
                                                        borderTopLeftRadius: "25px",
                                                        borderBottomLeftRadius: "25px",
                                                        borderTopRightRadius: "25px",
                                                        borderBottomRightRadius: "25px"}} onClick={MakeRoom}><strong>방 생성하기</strong></Button>
                            <Button variant="dark" style={{color:'#FFFFFF', 
                                                        borderTopLeftRadius: "25px",
                                                        borderBottomLeftRadius: "25px",
                                                        borderTopRightRadius: "25px",
                                                        borderBottomRightRadius: "25px"}} onClick={closeModal}>생성 취소</Button>
                        </div>
                    </Col>
                </Row>
            </Modal>
        </div>
    );
}; 

export default SetRoomComponent;