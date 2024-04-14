import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios'
import { useCookies } from 'react-cookie';
import Modal from 'react-modal';
import {Button} from 'react-bootstrap'

const InviteMemberComponent = ({role}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [nickName, setNickName] = useState("");
    const [searchList, setSearchList] = useState([]);

    const OpenInviteModal = () => {
        setIsOpen(true);
    }

    const CloseInviteModal = () => {
        setIsOpen(false);
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
        <div>
            {role === "MANAGER" && (
                <Button onClick={OpenInviteModal}>초대하기</Button>
            )}
            <Modal isOpen={isOpen} onRequestClose={CloseInviteModal}>
                <div>
                    <input
                        type = "text"
                        value = {nickName}
                        onChange = {GetInputNickName}
                    ></input>
                    <Button onClick={() => SearchByNickName(nickName)}>검색</Button>
                    <Button onClick={CloseInviteModal}>취소</Button>
                    {searchList && searchList.length > 0 && (
                        <ul>
                            {searchList.map((_member, index) => (
                                <li key={index}>{_member.memberNickName}<Button onClick={InviteMember}>초대</Button></li>
                            ))}
                        </ul>
                    )}
                </div>
            </Modal>
        </div>
    )
}

export default InviteMemberComponent;
