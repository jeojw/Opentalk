import React, { useState } from 'react';
import axios from 'axios'
import Modal from 'react-modal';
import { Row, Col, Button, Form, FormGroup, FormControl, ListGroup, ListGroupItem, InputGroup, Container } from 'react-bootstrap'

const InviteMemberComponent = ({roomInfo, role}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [nickName, setNickName] = useState("");
    const [searchList, setSearchList] = useState([]);

    const OpenInviteModal = () => {
        setIsOpen(true);
    }

    const CloseInviteModal = () => {
        setIsOpen(false);
        setNickName("");
        setSearchList([]);
    }

    const GetInputNickName = (event) => {
        setNickName(event.target.value);
    }

    const SearchByNickName = (keyword) => {
        const searchUrl = "/api/opentalk/member/searchNickName"
        const data = new FormData();
        data.append("nickName", keyword);
        axios.post(searchUrl, data)
        .then((res) => {
            setSearchList(res.data);
        })
        .catch((error) => console.log(error));
    }

    const InviteMember = (member) => {
        if (window.confirm("초대하시겠습니까?")){
            const inviteUrl = "/api/opentalk/invite"
            axios.post(inviteUrl, {
                roomId: roomInfo.roomId,
                roomName: roomInfo.roomName,
                inviter: roomInfo.roomManager,
                message: "null",
                invitedMember: member
            })
            .then((res)=>{
                if (res.data === true){
                    setIsOpen(false);
                    setNickName("");
                    setSearchList([]);
                }
            }).catch((error) => console.log(error));
        }
    }

    return (
        <div>
            {role === "ROLE_MANAGER" && (
                <Button variant='#B9B9B9' style={{  backgroundColor:"#B9B9B9", 
                                                    borderTopLeftRadius: "25px",
                                                    borderBottomLeftRadius: "25px",
                                                    borderTopRightRadius: "25px",
                                                    borderBottomRightRadius: "25px"
                                                }} onClick={OpenInviteModal}>초대하기</Button>
            )}
            <Modal isOpen={isOpen} onRequestClose={CloseInviteModal}
            style={{
                content: {
                    width: '450px', // 원하는 너비로 설정
                    height: '600px', // 원하는 높이로 설정
                }
            }}>
                <Row>
                    <Col>
                        <InputGroup>
                            <InputGroup.Text style={{   backgroundColor:'#8F8F8F', 
                                                        borderTopLeftRadius: "25px",
                                                        borderBottomLeftRadius: "25px",
                                                    }}><strong>닉네임</strong></InputGroup.Text>
                            <FormControl type="text" value={nickName} onChange={GetInputNickName}
                            style={{borderTopRightRadius: "25px",
                                    borderBottomRightRadius: "25px"}}></FormControl>
                            <Button variant='#8F8F8F' style={{  backgroundColor:'#8F8F8F',
                                                                borderTopLeftRadius: "25px",
                                                                borderBottomLeftRadius: "25px",
                                                                borderTopRightRadius: "25px",
                                                                borderBottomRightRadius: "25px"
                                                            }} onClick={() => SearchByNickName(nickName)}><strong>검색</strong></Button>
                        </InputGroup>
                        <hr/>
                    </Col>
                </Row>
                <Row>
                    <Col style={{ overflowY: 'auto', maxHeight: '400px'}}>
                        {searchList && searchList.length > 0 && (
                            <ListGroup>
                                {searchList.map((_member, index) => (
                                    <ListGroupItem style={{ backgroundColor:"#CDCDCD", marginBottom: '7px',
                                                            borderTopLeftRadius: "25px",
                                                            borderBottomLeftRadius: "25px",
                                                            borderTopRightRadius: "25px",
                                                            borderBottomRightRadius: "25px"}}><strong>{_member.memberNickName}</strong>
                                    <hr style={{border: "1px solid #808080"}}/>
                                    <Button variant='#8F8F8F' 
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
                        <Button variant='dark' style={{ borderTopLeftRadius: "25px",
                                                        borderBottomLeftRadius: "25px",
                                                        borderTopRightRadius: "25px",
                                                        borderBottomRightRadius: "25px"
                                                    }} onClick={CloseInviteModal}>취소</Button>
                    </Col>
                </Row>
                    
            </Modal>
        </div>
    )
}

export default InviteMemberComponent;
