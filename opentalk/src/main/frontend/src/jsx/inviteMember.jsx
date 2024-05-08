import React, { useState, useContext } from 'react';
import axios from 'axios'
import Modal from 'react-modal';
import { Row, Col, Button, FormControl, ListGroup, ListGroupItem, InputGroup} from 'react-bootstrap'
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

const InviteMemberComponent = ({roomInfo, showModal, setShowModal, myInfo, stompClient}) => {
    const { theme } = useContext(themeContext);

    const [nickName, setNickName] = useState("");
    const [searchList, setSearchList] = useState([]);

    const CloseInviteModal = () => {
        setShowModal(false);
        setNickName("");
        setSearchList([]);
    }

    const GetInputNickName = (event) => {
        setNickName(event.target.value);
    }

    const SearchByNickName = (keyword) => {
        const searchUrl = "/api/opentalk/member/searchNickNameInRoom"
        const data = new FormData();
        data.append("roomId", roomInfo.roomId);
        data.append("nickName", keyword);
        axios.post(searchUrl, data)
        .then((res) => {
            setSearchList(res.data);
        })
        .catch((error) => console.log(error));
    }

    const InviteMember = async (member) => {
        if (window.confirm("초대하시겠습니까?")){
            let message = window.prompt("초대 메세지를 입력해 주십시오.");
            const inviteUrl = "/api/opentalk/invite"
            if (message === ""){
                message = "우리 같이 이야기해 보아요."
            }
            try {
                const res = await axios.post(inviteUrl, {
                    roomId: roomInfo.roomId,
                    roomName: roomInfo.roomName,
                    inviter: roomInfo.roomManager,
                    message: message,
                    invitedMember: member
                });
                if (res.data !== "Success"){
                    window.alert("이미 초대한 유저입니다.");
                }
                else{
                    window.alert("초대되었습니다.");
                    const sendAlarmUrl = "/api/opentalk/member/sendAlarmMessage"
                    try {
                        const alarmResponse = await axios.post(sendAlarmUrl, {
                            memberNickName: member,
                            alarmType: "INVITE",
                            alarmMessage: "새로운 초대 메세지가 도착했습니다."
                        })
                        if (alarmResponse.status === 200){
                            stompClient.publish({destination: '/pub/chat/alarmMessage', body: JSON.stringify({
                                nickName: "system",
                                message: ``,
                            })})
                        }
                        
                    } catch (error){
                        console.log(error);
                    }
                }
            } catch (error){
                console.log(error);
            }
        }
    }

    return (
        <div>
            <Desktop>
                <Modal isOpen={showModal} onRequestClose={CloseInviteModal}
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
                                            style={{ backgroundColor: theme == 'light' ? "#CDCDCD" : '#A0A0A0',
                                                     color: theme === 'light' ? '#000000' : '#FFFFFF',
                                                    marginBottom: '7px',
                                                    }}><strong>{_member.memberNickName}</strong>
                                            <hr style={{
                                                backgroundColor: theme == 'light' ? "#CDCDCD" : '#A0A0A0',
                                                border: `1px solid ${theme == 'light' ? "#808080" : '#666666'}`}}/>
                                            <Button
                                            className='btn-sm custom-button' 
                                            variant='#8F8F8F' 
                                            style={{ backgroundColor: theme === 'light' ? '#8F8F8F' : '#6D6D6D',
                                            color: theme === 'light' ? '#000000' : '#FFFFFF' }}
                                            onClick={() => InviteMember(_member.memberNickName)}>
                                            <strong>초대</strong></Button></ListGroupItem>
                                        )
                                    ))}
                                    <hr/>
                                </ListGroup>
                            )}
                            <Button
                                className='btn-sm custom-ui'
                                variant='dark' 
                                onClick={CloseInviteModal}>취소</Button>
                        </Col>
                    </Row>
                        
                </Modal>
            </Desktop>
                <Mobile>
                <Modal isOpen={showModal} onRequestClose={CloseInviteModal}
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
                                        style={{ backgroundColor: theme == 'light' ? "#CDCDCD" : '#A0A0A0',
                                                    color: theme === 'light' ? '#000000' : '#FFFFFF',
                                                marginBottom: '7px',
                                                }}><strong>{_member.memberNickName}</strong>
                                        <hr style={{
                                            backgroundColor: theme == 'light' ? "#CDCDCD" : '#A0A0A0',
                                            border: `1px solid ${theme == 'light' ? "#808080" : '#666666'}`}}/>
                                        <Button
                                        className='btn-sm custom-button' 
                                        variant='#8F8F8F' 
                                        style={{ backgroundColor: theme === 'light' ? '#8F8F8F' : '#6D6D6D',
                                        color: theme === 'light' ? '#000000' : '#FFFFFF' }}
                                        onClick={() => InviteMember(_member.memberNickName)}>
                                        <strong>초대</strong></Button></ListGroupItem>
                                    )
                                ))}
                                <hr/>
                            </ListGroup>
                            )}
                            <Button
                                className='btn-sm custom-ui'
                                variant='dark' 
                                onClick={CloseInviteModal}>취소</Button>
                        </Col>
                    </Row>
                        
                </Modal>
            </Mobile>
        </div>
    )
}

export default InviteMemberComponent;
