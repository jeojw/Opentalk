import React, {useState, useEffect} from 'react';
import axios from 'axios';

const MainComponent = (props) => {

    const [memberNickName, setMemberNickName] = useState("");

    const MakeRoom = () => {
        window()
    };

    const LogOut = () => {
        if (window.confirm("로그아웃 하시겠습니까?")){
            window.alert("로그아웃 되었습니다.")
        }
    };

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

export default MainComponent;