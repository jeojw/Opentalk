import React, {useRef, useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import * as StompJs from "@stomp/stompjs";

const RoomComponent = ({target}) => {
    const [manager, setManager] = useState('');
    const [password, setPassword] = useState('');
    const [roomName, setRoomName] = useState('');
    const [participates, setParticipates] = useState(0);

    const [chatList, setChetList] = useState([]);
    const [chat, setChat] = useState("");
    
    const {apply_id} = useParams();
    const client = useRef({});

    const connect = () => {
        client.current = new StompJs.Client({
            brokerURL: "ws://localhost:8000/stomp/chat",
            onConnect: () => {
                console.log('success');
                subscribe();
            },
            }
        );
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
                applyId: apply_id,
                chat: chat,
            }),
        });

        setChat("");
    }

    const subscribe = () => {
        client.current.subscribe('/sub/chat' + apply_id, (body) => {
            const json_body = JSON.parse(body.body);
            setChetList((_chat_list) => [
                ..._chat_list, json_body
            ]);
        });
    };

    const handleChange = (event) => {
        setChat(event.target.value);
    }

    const handleSubmit = (event, chat) => {
        event.preventDefault();

        publish(chat);
    }

    useEffect(() =>{
        connect();

        return () => disconnect();
    }, []);


    const GetInfo = () => {
        setRoomName(target.name);
        setParticipates(target.count);
        setManager(target.manager);
        setPassword(target.password);
    };
    
    return(
        <div>
            {GetInfo}
            <div>
                <h1>{roomName}</h1>
                <h2>참여자 수: {participates}</h2>
            </div>
            <div className='chat-list'>{chatList}</div>
            <form onSubmit={(event)=>handleSubmit(event, chat)}>
                <div>
                    <input type="text" name="chatInput" onChange={handleChange} value={chat}></input>
                </div>
                <input type="submit" value="전송"></input>
            </form>

        </div>
    );
}

export default RoomComponent;