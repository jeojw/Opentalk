import React, {useRef, useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import * as StompJs from "@stomp/stompjs";

const RoomComponent = ({target}) => {

    const [manager, setManager] = useState('');
    const [password, setPassword] = useState('');
    const [roomName, setRoomName] = useState('');
    const [participates, setParticipates] = useState(0);
    const [roomId, setRoomId] = useState('');

    const [chatList, setChetList] = useState([]);
    const [chat, setChat] = useState("");

    let {room_Id} = useParams();
    
    const client = useRef({});
    const socket = useRef<WebSocket>({});

    useEffect(() =>{
        connect();
        GetInfo();

        return () => disconnect();
    }, []);


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
        if (!client.current.connected) return;
        client.current.publish({
            destination: '/pub/chat',
            body: JSON.stringify({
                applyId: room_Id,
                chat: chat,
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

    const handleSubmit = (event, chat) => {
        event.preventDefault();

        publish(chat);
    }

    

    const GetInfo = () => {
        console.log(target);
        // setRoomName(target.name);
        // setParticipates(target.count);
        // setManager(target.manager);
        // setPassword(target.password);
        // setRoomId(target.roomId);
    };
    
    return(
        <div>
            <div>
                <h1>RoomID: {room_Id}</h1>
                <h1>{roomName}</h1>
                <h2>참여자 수: {participates}</h2>
            </div>
            <div>
                {chatList && chatList.length > 0 && (
                    <ul>
                        {chatList.map((_chatMessage, index) => (
                            <li key={index}>{_chatMessage.message}</li>
                        ))}
                    </ul>
                )}
            </div>
            <div className='chat-list'>{chatList}</div>
            <form onSubmit={(event)=>handleSubmit(event, chat)}>
                <div>
                    입력하기: <input type="text" name="chatInput" onChange={handleChange} value={chat}></input>
                </div>
                <input type="submit" value="전송" onClick={() => publish(chat)}></input>
            </form>

        </div>
    );
}

export default RoomComponent;