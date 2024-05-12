import { useState, useContext, useEffect } from 'react';
import axios from 'axios'
import Modal from 'react-modal';
import { Row, Col, Button, FormControl, ListGroup, ListGroupItem, InputGroup, Form} from 'react-bootstrap'
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

const PersonalMessageComponent = ({showModal, setShowModal, showPMModal, setShowPMModal, stompClient, myInfo, returnReceiver}) =>{
    useEffect(() =>{
        setReceiver(returnReceiver);
    }, [returnReceiver]);
    
    const { theme } = useContext(themeContext);
    
    const [receiver, setReceiver] = useState("");
    const [personalMessage, setPersonalMessage] = useState("");

    const [nickName, setNickName] = useState("");
    const [searchList, setSearchList] = useState([]);

    const ClosePMModal = () => {
        setShowModal(false);
        setNickName("");
        setSearchList([]);
    }

    const GetInputNickName = (event) => {
        setNickName(event.target.value);
    }

    const SearchByNickName = (keyword) => {
        const searchUrl = "/api/opentalk/member/searchNickNameInMain"
        const data = new FormData();
        data.append("nickName", keyword);
        axios.post(searchUrl, data)
        .then((res) => {
            setSearchList(res.data);
        })
        .catch((error) => console.log(error));
    }

    const sendPersonalMessage = async ({caller, receiver, message}) =>{
        const sendUrl = '/api/opentalk/member/sendPersonalMessage';
        try{
            const res = await axios.post(sendUrl, {
                receiver: receiver,
                caller: caller,
                message: message
            })
            if (res.status === 200){
                window.alert("쪽지를 보냈습니다.");
                setShowPMModal(false);
                stompClient.publish({
                    destination: '/pub/chat/personalMessage',
                    body: JSON.stringify({
                        nickName: receiver,
                        message: `새 쪽지가 도착했습니다.`,
                    })
                });
                const sendAlarmUrl = "/api/opentalk/member/sendAlarmMessage"
                try {
                    const alarmResponse = await axios.post(sendAlarmUrl, {
                        memberNickName: receiver,
                        alarmType: "PERSONAL",
                        alarmMessage: "새로운 쪽지가 도착했습니다."
                    })
                    if (alarmResponse.status === 200){
                        stompClient.publish({
                            destination: '/pub/chat/alarmMessage', 
                            body: JSON.stringify({
                                nickName: receiver,
                                message: `새 알람이 도착했습니다.`,
                            })
                        })
                    }
                    
                } catch (error){
                    console.log(error);
                }
            }
        } catch(error){
            console.log(error);
        }
    }

    return (
        <div>
            <Desktop>
                <Modal isOpen={showModal} onRequestClose={ClosePMModal}
                style={{
                    content: {
                        backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                        width: '450px', // 원하는 너비로 설정
                        height: '600px', // 원하는 높이로 설정
                        borderTopLeftRadius: '25px',
                        borderBottomLeftRadius: '25px',
                        borderTopRightRadius: '25px',
                        borderBottomRightRadius: '25px',
                        position:'relative',
                        top: "70px",
                        zIndex: 1
                    }
                }}>
                    <Row>
                        <Col>
                            <InputGroup>
                                <FormControl
                                    className='custom-ui'
                                    type="text" 
                                    value={nickName} 
                                    onChange={GetInputNickName}
                                    placeholder='검색할 닉네임을 입력하세요.'
                                    style={{backgroundColor:theme === 'light' ? '#FFFFFF' : "#B9B9B9"}}
                                    />
                                <Button
                                    className='custom-button'
                                    variant='#8F8F8F' 
                                    style={{ backgroundColor: theme === 'light' ? '#8F8F8F' : '#6D6D6D',
                                             color: theme === 'light' ? '#000000' : '#FFFFFF'}} 
                                    onClick={() => SearchByNickName(nickName)}><strong>검색</strong></Button>
                            </InputGroup>
                            <hr/>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{ overflowY: 'auto', maxHeight: '400px'}}>
                            {searchList && searchList.length > 0 && (
                                <ListGroup className='custom-ui'>
                                    {searchList.map((_member) => (
                                        _member.memberNickName !== myInfo.memberNickName && (
                                            <ListGroupItem 
                                            className='custom-ui'
                                            style={{ backgroundColor: theme === 'light' ? "#CDCDCD" : '#A0A0A0',
                                                     color: theme === 'light' ? '#000000' : '#FFFFFF',
                                                    marginBottom: '7px',
                                                    }}><strong>{_member.memberNickName}</strong>
                                            <hr style={{
                                                backgroundColor: theme === 'light' ? "#CDCDCD" : '#A0A0A0',
                                                border: `1px solid ${theme === 'light' ? "#808080" : '#666666'}`}}/>
                                            <Button
                                                className='btn-sm custom-button' 
                                                variant='#8F8F8F' 
                                                style={{ backgroundColor: theme === 'light' ? '#8F8F8F' : '#6D6D6D',
                                                color: theme === 'light' ? '#000000' : '#FFFFFF' }}
                                                onClick={() => {
                                                    setShowPMModal(true);
                                                    setReceiver(_member.memberNickName);
                                                }}>
                                            <strong>쪽지 보내기</strong></Button></ListGroupItem>
                                        )
                                    ))}
                                    <hr/>
                                </ListGroup>
                            )}
                            <Button
                                className='btn-sm custom-ui'
                                variant='dark' 
                                onClick={ClosePMModal}>취소</Button>
                        </Col>
                    </Row>
                </Modal>
                <Modal 
                    isOpen={showPMModal} 
                    onRequestClose={()=>setShowPMModal(false)}
                    style={{
                        content: {
                            backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                            width: '700px', // 원하는 너비로 설정
                            height: '300px', // 원하는 높이로 설정
                            borderTopLeftRadius: '25px',
                            borderBottomLeftRadius: '25px',
                            borderTopRightRadius: '25px',
                            borderBottomRightRadius: '25px',
                            position:'relative',
                            top: "70px",
                            zIndex: 2
                        }
                    }}>
                    <Form style={{color: theme === 'light' ? "#000000" : "#FFFFFF"}}>
                        수신자: <strong>{receiver}</strong>
                    </Form>
                    <hr/>
                    <Form.Control 
                        className='=custom-ui'
                        type="text" 
                        placeholder='메세지 내용을 입력하세요.'
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        style={{backgroundColor:theme === 'light' ? '#FFFFFF' : "#B9B9B9"}}>
                    </Form.Control>
                    <br></br>
                    <div className='d-flex flex-row gap-2'>
                        <Button 
                            className='custom-button'
                            variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                            style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                            color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                            onClick={()=>{sendPersonalMessage({
                                caller: myInfo?.memberNickName,
                                receiver: receiver,
                                message: personalMessage
                            })
                            setPersonalMessage("");}} 
                            >보내기</Button>
                        <Button 
                            className='custom-button'
                            variant='dark' 
                            onClick={()=>setShowPMModal(false)} 
                        >닫기</Button>
                    </div>
                </Modal>
            </Desktop>
            <Mobile>
                <Modal isOpen={showModal} onRequestClose={ClosePMModal}
                style={{
                    content: {
                        backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                        width: '340px', // 원하는 너비로 설정
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
                                <FormControl
                                    className='custom-ui'
                                    type="text" 
                                    value={nickName} 
                                    onChange={GetInputNickName}
                                    placeholder='검색할 닉네임을 입력하세요.'
                                    style={{backgroundColor:theme === 'light' ? '#FFFFFF' : "#B9B9B9"}}
                                    />
                                <Button
                                    className='custom-button'
                                    variant='#8F8F8F' 
                                    style={{ backgroundColor: theme === 'light' ? '#8F8F8F' : '#6D6D6D',
                                             color: theme === 'light' ? '#000000' : '#FFFFFF'}} 
                                    onClick={() => SearchByNickName(nickName)}><strong>검색</strong></Button>
                            </InputGroup>
                            <hr/>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{ overflowY: 'auto', maxHeight: '400px'}}>
                            {searchList && searchList.length > 0 && (
                                <ListGroup className='custom-ui'>
                                    {searchList.map((_member) => (
                                        _member.memberNickName !== myInfo.memberNickName && (
                                            <ListGroupItem 
                                            className='custom-ui'
                                            style={{ backgroundColor: theme === 'light' ? "#CDCDCD" : '#A0A0A0',
                                                     color: theme === 'light' ? '#000000' : '#FFFFFF',
                                                    marginBottom: '7px',
                                                    }}><strong>{_member.memberNickName}</strong>
                                            <hr style={{
                                                backgroundColor: theme === 'light' ? "#CDCDCD" : '#A0A0A0',
                                                border: `1px solid ${theme === 'light' ? "#808080" : '#666666'}`}}/>
                                            <Button
                                                className='btn-sm custom-button' 
                                                variant='#8F8F8F' 
                                                style={{ backgroundColor: theme === 'light' ? '#8F8F8F' : '#6D6D6D',
                                                color: theme === 'light' ? '#000000' : '#FFFFFF' }}
                                                onClick={() => {
                                                    setShowPMModal(true);
                                                    setReceiver(_member.memberNickName);
                                                }}>
                                            <strong>쪽지 보내기</strong></Button></ListGroupItem>
                                        )
                                    ))}
                                    <hr/>
                                </ListGroup>
                            )}
                            <Button
                                className='btn-sm custom-ui'
                                variant='dark' 
                                onClick={ClosePMModal}>취소</Button>
                        </Col>
                    </Row>
                        
                </Modal>
                <Modal 
                    isOpen={showPMModal} 
                    onRequestClose={()=>setShowPMModal(false)}
                    style={{
                        content: {
                            backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212',
                            width: '330px', // 원하는 너비로 설정
                            height: '300px', // 원하는 높이로 설정
                            borderTopLeftRadius: '25px',
                            borderBottomLeftRadius: '25px',
                            borderTopRightRadius: '25px',
                            borderBottomRightRadius: '25px',
                            position:'relative',
                            top: "70px"
                        }
                    }}>
                    <Form style={{color: theme === 'light' ? "#000000" : "#FFFFFF"}}>
                        수신자: <strong>{receiver}</strong>
                    </Form>
                    <hr/>
                    <Form.Control 
                        className='=custom-ui'
                        type="text" 
                        placeholder='메세지 내용을 입력하세요.'
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        style={{backgroundColor:theme === 'light' ? '#FFFFFF' : "#B9B9B9"}}>
                    </Form.Control>
                    <br></br>
                    <div className='d-flex flex-row gap-2'>
                        <Button 
                            className='custom-button'
                            variant={theme === 'light' ? "#8F8F8F" : "#6D6D6D"}
                            style={{ backgroundColor: theme === 'light' ? "#8F8F8F" : "#6D6D6D",
                            color: theme === 'light' ? '#000000' : "#FFFFFF" }}
                            onClick={()=>{sendPersonalMessage({
                                caller: myInfo?.memberNickName,
                                receiver: receiver,
                                message: personalMessage
                            })
                            setPersonalMessage("");}} 
                            >보내기</Button>
                        <Button 
                            className='custom-button'
                            variant='dark' 
                            onClick={()=>setShowPMModal(false)} 
                        >닫기</Button>
                    </div>
                </Modal>
            </Mobile>
        </div>
        
    )
}

export default PersonalMessageComponent;