import React, {useState} from 'react';
import Modal from 'react-modal';
import axios from'axios';

export const SetRoomComponent = ({target}) =>{
    const [isOpen, setIsOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [participants, setParticipants] = useState(0);
    const [existLock, setExistLock] = useState(false);
    const [password, setPassword] = useState("");
    const [manager, setManger] = useState("");

    useState(() => {
        setManger(target);
    }, [target]);
    

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setManger('');
        setRoomName('');
        setExistLock(false);
        setPassword('');
        setParticipants(0);
        setIsOpen(false);
    }
    
    const GetInputName = (event) => setRoomName(event.target.value);
    const GetInputCounts = (event) => setParticipants(event.target.value);
    const GetInputPassword = (event) => setPassword(event.target.value);
    const GetCheckExistPw = (event) => setExistLock(event.target.value);

    const SetOption = () => {
        return (
            <div>
                방 이름: <input type="text" value={roomName} onChange={GetInputName}></input>
                <br></br>
                인원수: <input type="number" value={participants} onChange={GetInputCounts}></input>
                <br></br>
                비밀번호: <input 
                    type="checkbox" 
                    checked={existLock}
                    onChange={GetCheckExistPw}></input>
                <input 
                    type="password" 
                    value={password} 
                    onChange={GetInputPassword}
                    disabled={!existLock}></input>
                <br></br>
                <input type="submit" value="방 생성하기" onClick={MakeRoom}></input>
            </div>
        );
    };

    const MakeRoom = () => {
        const params = new FormData();
        params.append("name", roomName)
        params.append("password", password)
        params.append("manager", manager)
        params.append("count", participants)
        const makeUrl = "/api/opentalk/room"
        axios.post(makeUrl, params)
        .then((res)=>{
            if (res.status == 200){
                alert("방이 생성되었습니다.");
                closeModal();
            }
        })
        .catch((error) => console.log(error));
    };

    return (
        <div>
            <button onClick={openModal}>방 생성하기</button>
            <Modal isOpen={isOpen} onRequestClose={closeModal}>
            <SetOption/>
            <button onClick={closeModal}>생성 취소</button>
            </Modal>
        </div>
    );
}; 

export default SetRoomComponent;