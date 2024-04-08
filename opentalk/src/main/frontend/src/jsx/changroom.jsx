import React, {useState, useEffect} from 'react';
import {useCookies} from 'react-cookie';
import Modal from 'react-modal';
import axios from'axios';

const ChangRoomComponent = ({room_Id}) => {
    const [roomInfo, setRoomInfo] = useState();

    const [members, setMembers] = useState([]);
    const [preMembers, setPreMembers] = useState([]);

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
                setPreRoomName(roomInfo?.roomName);
                setPreExistLock(roomInfo?.existLock);
                setPreInfo(roomInfo?.introduction);
                setPrePassword(roomInfo?.roomPassword);
                setPreParticipants(roomInfo?.limitParticipates);
                setPreTags(roomInfo?.roomTags);
                setPreMembers(roomInfo?.members);

                setRoomName(preRoomName);
                setExistLock(preExistLock);
                setInfo(preInfo);
                setPassword(prePassword);
                setParticipants(preParticipates);
                setTags(preTags);
                setMembers(preMembers);

            } catch (error) {
                console.log(error);
            }
        }
        fetchCurRoomInfo();
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
        setMembers(preMembers);
    }

    const setModal = () => {
        setIsOpen(false);
    }

    const GetInputName = (event) => {
        setRoomName(event.target.value);
    }
    const GetInputCounts = (event) => {
        setParticipants(event.target.value);
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
        tags.push({
            tagName: getTag
        });
        setTag("");
    }

    return(
        <div>
            <button onClick={openModal}>설정 변경</button>
            <Modal isOpen={isOpen} onRequestClose ={closeModal}>
                <div>
                방 이름: <input 
                    type="text" 
                    value={roomName} 
                    onChange={GetInputName}></input>
                    <br></br>
                    인원수: <input 
                    type="number" 
                    value={participants} 
                    onChange={GetInputCounts}></input>
                    <br></br>
                    비밀번호: <input 
                        type="checkbox" 
                        checked={existLock}
                        onChange={GetCheckExistPw}></input>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={GetInputPassword}
                        disabled={!existLock}>   
                    </input>
                    <br></br>
                    <input 
                        type="text" 
                        value={info} 
                        placeholder={"방 소개문"}
                        size={100}
                        onChange={GetInputInfo}>
                    </input>
                    <br></br>
                    <input 
                        type="text" 
                        value={tag} 
                        onChange={GetInputTag}>    
                    </input>
                    <input
                        type="button"
                        value="태그 추가"
                        onClick={()=>AppendTag(tag)}>
                    </input>
                    {tags?.map((t)=> (
                        <li>#{t}</li>
                    )
                    )}
                    <br></br>
                    {members?.map((_member) => (
                        <li>{_member}</li>
                    )) }
                <button onClick={setModal}>변경하기</button>
                <button onClick={cancleSetModal}>변경 취소</button>
                </div>
            </Modal>
        </div>
    );
}

export default ChangRoomComponent;