import React, { useState } from 'react';
import axios from 'axios'
import Modal from 'react-modal';
import { Row, Col, Button, FormControl, ListGroup, ListGroupItem, InputGroup} from 'react-bootstrap'
import { useMediaQuery } from 'react-responsive';

const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 768 })
    return isDesktop ? children : null
}
const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })
    return isMobile ? children : null
}

const InviteMemberComponent = ({roomInfo, showModal, setShowModal}) => {
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
        const searchUrl = "/api/opentalk/member/searchNickName"
        const data = new FormData();
        data.append("roomId", roomInfo.roomId);
        data.append("nickName", keyword);
        axios.post(searchUrl, data)
        .then((res) => {
            setSearchList(res.data);
        })
        .catch((error) => console.log(error));
    }

    const InviteMember = (member) => {
        if (window.confirm("초대하시겠습니까?")){
            let message = prompt("초대 메세지를 입력해 주십시오.");
            const inviteUrl = "/api/opentalk/invite"
            if (message === ""){
                message = "우리 같이 이야기해 보아요."
            }
            axios.post(inviteUrl, {
                roomId: roomInfo.roomId,
                roomName: roomInfo.roomName,
                inviter: roomInfo.roomManager,
                message: message,
                invitedMember: member
            })
            .then((res)=>{
                if (res.data !== "Success"){
                    window.alert("이미 초대한 유저입니다.");
                }
            }).catch((error) => console.log(error));
        }
    }

    return (
        <div>
            <Desktop>
                <Modal isOpen={showModal} onRequestClose={CloseInviteModal}
                style={{
                    content: {
                        width: '450px', // 원하는 너비로 설정
                        height: '600px', // 원하는 높이로 설정
                    }
                }}>
                    <Row>
                        <Col>
                            <InputGroup>
                                <FormControl 
                                type="text" 
                                value={nickName} 
                                onChange={GetInputNickName}
                                placeholder='검색할 닉네임을 입력하세요.'
                                style={{borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}></FormControl>
                                <Button
                                variant='#8F8F8F' 
                                style={{  backgroundColor:'#8F8F8F',
                                        borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"
                                        }} 
                                onClick={() => SearchByNickName(nickName)}><strong>검색</strong></Button>
                            </InputGroup>
                            <hr/>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{ overflowY: 'auto', maxHeight: '400px'}}>
                            {searchList && searchList.length > 0 && (
                                <ListGroup>
                                    {searchList.map((_member, index) => (
                                        <ListGroupItem 
                                        style={{ backgroundColor:"#CDCDCD", marginBottom: '7px',
                                                borderTopLeftRadius: "25px",
                                                borderBottomLeftRadius: "25px",
                                                borderTopRightRadius: "25px",
                                                borderBottomRightRadius: "25px"}}><strong>{_member.memberNickName}</strong>
                                        <hr style={{border: "1px solid #808080"}}/>
                                        <Button
                                        className='btn-sm' 
                                        variant='#8F8F8F' 
                                        style={{backgroundColor:'#8F8F8F',
                                                borderTopLeftRadius: "25px",
                                                borderBottomLeftRadius: "25px",
                                                borderTopRightRadius: "25px",
                                                borderBottomRightRadius: "25px"}}
                                        onClick={() => InviteMember(_member.memberNickName)}>
                                        <strong>초대</strong></Button></ListGroupItem>
                                    ))}
                                    <hr/>
                                </ListGroup>
                            )}
                            <Button
                            className='btn-sm'
                            variant='dark' 
                            style={{ borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px",
                                    borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"
                                    }} 
                            onClick={CloseInviteModal}>취소</Button>
                        </Col>
                    </Row>
                        
                </Modal>
            </Desktop>
                <Mobile>
                <Modal isOpen={showModal} onRequestClose={CloseInviteModal}
                style={{
                    content: {
                        width: '340px', // 원하는 너비로 설정
                        height: '400px', // 원하는 높이로 설정
                    }
                }}>
                    <Row>
                        <Col>
                            <InputGroup>
                                <FormControl 
                                type="text" 
                                value={nickName} 
                                onChange={GetInputNickName}
                                placeholder='검색할 닉네임을 입력하세요.'
                                style={{borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"}}></FormControl>
                                <Button
                                variant='#8F8F8F' 
                                style={{  backgroundColor:'#8F8F8F',
                                        borderTopLeftRadius: "25px",
                                        borderBottomLeftRadius: "25px",
                                        borderTopRightRadius: "25px",
                                        borderBottomRightRadius: "25px"
                                        }} 
                                onClick={() => SearchByNickName(nickName)}><strong>검색</strong></Button>
                            </InputGroup>
                            <hr/>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{ overflowY: 'auto', maxHeight: '400px'}}>
                            {searchList && searchList.length > 0 && (
                                <ListGroup>
                                    {searchList.map((_member, index) => (
                                        <ListGroupItem 
                                        style={{ backgroundColor:"#CDCDCD", marginBottom: '7px',
                                                borderTopLeftRadius: "25px",
                                                borderBottomLeftRadius: "25px",
                                                borderTopRightRadius: "25px",
                                                borderBottomRightRadius: "25px"}}><strong>{_member.memberNickName}</strong>
                                        <hr style={{border: "1px solid #808080"}}/>
                                        <Button
                                        className='btn-sm' 
                                        variant='#8F8F8F' 
                                        style={{backgroundColor:'#8F8F8F',
                                                borderTopLeftRadius: "25px",
                                                borderBottomLeftRadius: "25px",
                                                borderTopRightRadius: "25px",
                                                borderBottomRightRadius: "25px"}}
                                        onClick={() => InviteMember(_member.memberNickName)}>
                                        <strong>초대</strong></Button></ListGroupItem>
                                    ))}
                                    <hr/>
                                </ListGroup>
                            )}
                            <Button
                            className='btn-sm'
                            variant='dark' 
                            style={{ borderTopLeftRadius: "25px",
                                    borderBottomLeftRadius: "25px",
                                    borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"
                                    }} 
                            onClick={CloseInviteModal}>취소</Button>
                        </Col>
                    </Row>
                        
                </Modal>
            </Mobile>
        </div>
    )
}

export default InviteMemberComponent;
