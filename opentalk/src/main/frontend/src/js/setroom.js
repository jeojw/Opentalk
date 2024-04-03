import React, {useState, useEffect} from 'react';
import Modal from 'react-modal';
import axios from'axios';

export const SetRoomComponent = ({getManager}) =>{
    const [isOpen, setIsOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [roomId, setRoomId] = useState("");
    const [members, setMembers] = useState();
    const [participants, setParticipants] = useState(0);
    const [existLock, setExistLock] = useState(false);
    const [password, setPassword] = useState("");
    const [manager, setManger] = useState("");
    const [info, setInfo] = useState("");
    const [tag, setTag] = useState("");
    const [tags, setTags] = useState([]);

    useEffect(() => {
        setManger(getManager);
    }, [getManager]);
    
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
        tags.push(getTag);
        setTag("");
    }


    const MakeRoom = () => {
        const makeUrl = `/api/opentalk/makeRoom`
        axios.post(makeUrl, {
            "roomName": roomName,
            "roomPassword": password,
            "manager": manager.memberId,
            "participates": 0,
            "limitParticipates": participants,
            "introduction": info,
            "existLock": existLock,
            "members": [],
            "roomTags": tags
        })
        .then((res)=>{
            if (res.status === 200){
                alert("방이 생성되었습니다.");
                setRoomId(res.data);
                closeModal();
            }
        })
        .catch((error) => console.log(error));
    };

    return (
        <div>
            <button onClick={openModal}>방 생성하기</button>
            <Modal isOpen={isOpen} onRequestClose={closeModal}>
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
                    {tags.map((t)=> (
                        <li>#{t}</li>
                    )
                    )}
                    <br></br>
                    <input type="submit" value="방 생성하기" onClick={MakeRoom}></input>
                    <button onClick={closeModal}>생성 취소</button>
                </div>
                
            </Modal>
        </div>
    );
}; 

export default SetRoomComponent;