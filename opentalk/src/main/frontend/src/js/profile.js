import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const ProfileComponent = (props) => {
    const [member, setMember] = useState('');
    const [pwPopupOpen, setPwPopupOpen] = useState(false);
    const [nickPopupOpen, setNickPopupOpen] = useState(false);
    const [newNickName, setNewNickName] = useState("");
    const [exPassword, setExPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [checkPassword, setCheckPassword] = useState("");

    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies(['accessToken']);

    useEffect(() => {
        const fetchMemberStatus = async () => {
            try{
                const response = await axios.get('/api/opentalk/member/profile', {
                    headers: {Authorization: 'Bearer ' + cookies.accessToken}
                    });
                setMember(response.data);
                console.log(member);
            } catch (error) {
                console.error(error);
            }
        };

        fetchMemberStatus();
    }, []);

    const GetInputExPassword = (event) =>{
        setExPassword(event.target.value);
    }

    const GetInputNewPassword = (event) =>{
        setNewPassword(event.target.value);
    }

    const GetInputCheckPassword = (event) =>{
        setCheckPassword(event.target.value);
    }

    const GetInputNewNickName = (event) =>{
        setNewNickName(event.target.value);
    }

    const ChangeNickNamePopup = () => {
        setNickPopupOpen(true); 
    }  

    const ChangePasswordPopup = () => {
        setPwPopupOpen(true);
    }

    const ChangeNickNameCancle = () => {
        setNickPopupOpen(false);
        setNewNickName("");
    }

    const ChangePasswordCancle = () => {
        setPwPopupOpen(false);
        setExPassword("");
        setNewPassword("");
        setCheckPassword("");
    }

    const ChangePassword = () =>{
        if (newPassword !== checkPassword){
            alert("비밀번호가 일치하지 않습니다.");
        }
        else{
            const checkUrl = `/api/opentalk/member/changePassword`
            axios.post(checkUrl, {
                exPassword: exPassword,
                newPassword: newPassword
            },{
                headers: {Authorization: 'Bearer ' + cookies.accessToken}
            })
            .then((res)=>{
                if (res.status === 200){
                    alert("비밀번호가 변경되었습니다.");
                    ChangePasswordCancle();
                }
                else if (res.status === 500){
                    alert("현재 비밀번호가 맞지 않습니다.")
                }
            })
            .catch((error)=>console.log(error));
        }
    }
    const ChangeNickName = () =>{
        const data = new FormData();
        data.append("memberNickName", newNickName);
        const duplicateUrl = "/api/opentalk/member/checkNickName";
        axios.post(duplicateUrl, data)
        .then((res)=>{
            if (!res.data){
                const checkUrl = "/api/opentalk/member/changeNickname";
                axios.post(checkUrl, {
                memberId: member.memberId,
                memberNickName: newNickName
            })
            .then((res)=>{
                alert("닉네임이 변경되었습니다.")
                ChangeNickNameCancle();
            })
            .catch((error) => console.log(error));
            }
            else{
                alert("이미 존재하는 닉네임입니다.")
            }
        })
        .catch((error)=>console.log(error));
        
    }
    
    return(
        <div>
            <img alt="프로필 이미지" src={`${process.env.PUBLIC_URL}/profile_prototype.jpg`}></img>
            <ul>
                <li>이름: {member.memberName}</li>
                <li>닉네임: {member.memberNickName}</li>
                <li>이메일: {member.memberEmail}</li>
            </ul>
            <Modal isOpen={nickPopupOpen} onRequestClose={ChangeNickNameCancle}>
                새 닉네임: <input 
                    type="text" 
                    value={newNickName} 
                    onChange={GetInputNewNickName}>   
                </input>
                <br></br>
                <button onClick={ChangeNickName}>변경하기</button>
                <button onClick={ChangeNickNameCancle}>변경 취소</button>
            </Modal>
            <Modal isOpen={pwPopupOpen} onRequestClose={ChangePasswordCancle}>
                현재 비밀번호: <input
                    type="password"
                    value={exPassword}
                    onChange={GetInputExPassword}
                >
                </input>
                <br></br>
                새 비밀번호: <input 
                    type="password" 
                    value={newPassword} 
                    onChange={GetInputNewPassword}>   
                </input>
                <br></br>
                비밀번호 확인: <input 
                    type="password" 
                    value={checkPassword} 
                    onChange={GetInputCheckPassword}>   
                </input>
                <br></br>
                <button onClick={ChangePassword}>변경하기</button>
                <button onClick={ChangePasswordCancle}>변경 취소</button>
            </Modal>

            <button onClick={ChangeNickNamePopup}>닉네임 변경</button>
            <button onClick={ChangePasswordPopup}>비밀번호 변경</button>
            <br></br>
            <button onClick={() => navigate("/opentalk/main")}>이전 페이지</button>
        </div>
    );

}

export default ProfileComponent