import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios'
import { useCookies } from 'react-cookie';
import Modal from 'react-modal';
import {Row, Col, Button, Form, FormGroup, FormControl, ListGroup, ListGroupItem, InputGroup, Container} from 'react-bootstrap'

const InviteMemberComponent = ({role}) => {
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

    const InviteMember = () => {
        if (window.confirm("초대하시겠습니까?")){

        }
    }

    return (
        <Container>
            <div className='d-grid gap-2'>
                {role === "MANAGER" && (
                    <Button onClick={OpenInviteModal}>초대하기</Button>
                )}
            </div>
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
                            <InputGroup.Text>닉네임</InputGroup.Text>
                            <FormControl type="text" value={nickName} onChange={GetInputNickName}></FormControl>
                            <Button onClick={() => SearchByNickName(nickName)}>검색</Button>
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col style={{ overflowY: 'auto', maxHeight: '400px' }}>
                        {searchList && searchList.length > 0 && (
                            <ListGroup>
                                {searchList.map((_member, index) => (
                                    <ListGroupItem>{_member.memberNickName}<Button onClick={InviteMember}>초대</Button></ListGroupItem>
                                ))}
                            </ListGroup>
                        )}
                        <Button variant='dark' onClick={CloseInviteModal}>취소</Button>
                    </Col>
                </Row>
                    
            </Modal>
        </Container>
    )
}

export default InviteMemberComponent;
