import React, {useState, useEffect} from 'react';

const ChatComponet = () => {
    const [message, setMessage] = useState([]);
    const [socket, setSocket] = uesState(null);

    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:8000/stomp/chat');
        newSocket.onopen = () =>{
            console.log("연결 성공");
        };
        newSocket.onmessage = (event) =>{
            const receivedMessage = JSON.parse(event.data);
            setMessage((prevMessage)=>[...prevMessage, receivedMessage]);
        };

        setSocket(newSocket);

        return () => {
            newSocket.close();
        }
    }, []);

    const sendMessage = (message) =>{
        if (socket && socket.readyState == WebSocket.OPEN){
            socket.send(JSON.stringify({type: 'chat', message}));
        }
    };

    return (
        <div>
            <h1>채팅방</h1>
            <div>
                {message.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <input
                type="text"
                placeholder='="Type a message...'
                onKeyDown={(e) => {
                    if (e.key == 'Enter'){
                        sendMessage(e.target.value);
                        e.target.value ="";
                    }
                }}
                ></input>
        </div>
    );
}

export default ChatComponet;