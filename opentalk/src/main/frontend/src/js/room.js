import React, {useRef, useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import * as StompJs from "@stomp/stompjs";

const RoomComponent = (props) => {

    const [manager, setManager] = useState('');
    const [password, setPassword] = useState('');
    const [roomName, setRoomName] = useState('');
    const [participates, setParticipates] = useState(0);

    const [chatList, setChetList] = useState([]);
    const [chat, setChat] = useState("");

    let {room_Id} = useParams();

    
    const client = useRef({});

    useEffect(() =>{
        connect();
        return () => disconnect();
    }, []);

    // useEffect(() => {
    //     setRoomName(props.roomInfo.name);
    //     setParticipates(props.roomInfo.participates);
    // }, [props]);


    const connect = () => {
        client.current = new StompJs.Client({
            brokerURL: "ws://localhost:8000/stomp-ws",
            connectHeaders: {
                "auth-token": "spring-chat-auth-token",
            },
            debug: function (str) {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('success');
                subscribe();
            },
            onStompError: (frame) => {
                console.error(frame);
            }
        });
        client.current.activate();  
    };

    const disconnect = () => {
        client.current.deactivate();
    };

    const publish = (chat) => {
        console.log("전송!");
        if (!client.current.connected) return;

        client.current.publish({
            destination: '/pub/chat',
            body: JSON.stringify({
                roomId: room_Id,
                writer: "null",
                message: chat
            }),
        });

        setChat("");
    }

    const subscribe = () => {
        client.current.subscribe(`/sub/chat/${room_Id}`, ({body}) => {
            setChetList((_chatList)=>[..._chatList , JSON.parse(body)])
        });
    };

    const handleChange = (event) => {
        setChat(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
    }
    return(
        <div>
            <div>
                <h1>{roomName}</h1>
                <h2>참여자 수: {participates}</h2>
            </div>
            <div>
                {chatList && chatList.length > 0 && (
                    <ul>
                        {chatList.map((_chatMessage, index) => (
                            <li key={index}>{_chatMessage.writer}&nbsp;: {_chatMessage.message}</li>
                        ))}
                    </ul>
                )}
            </div>
            <form onSubmit={(event)=>handleSubmit(event)}>
                <div>
                    입력하기: <input type="text" name="chatInput" onChange={handleChange} value={chat}></input>
                </div>
                <input type="submit" value="전송" onClick={() => publish(chat)}></input>
            </form>

        </div>
    );
}

export default RoomComponent;