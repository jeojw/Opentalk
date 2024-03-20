import React, {useState} from 'react';

const LoginComponent = () => {

    const [memberId, setMemberId] = useState("");
    const [memberPw, setMemberPw] = useState("");

    const CheckNull = () =>{
        
    }

   return (
    <div>
        <table>
            <tbody>
                <tr>
                    <td>{memberNickName}</td>
                </tr>
            </tbody>
        </table>
        <button onClick={MakeRoom}>방 생성하기</button>
        <button onClick={LogOut}>로그아웃</button>
    </div>

    );
}

export default LoginComponent;