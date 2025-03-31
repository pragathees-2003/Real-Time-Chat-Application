// Filename - Chat/Chat.js

import { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import "./Chat.css";
import { useLocation } from 'react-router-dom';
const ENDPOINT = "http://localhost:5000";
let socket;

const Chat = () => {
    const location = useLocation();
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const { name, room } = queryString.parse(location.search);
        setName(name);
        setRoom(room);

        socket = io(ENDPOINT, {
            transports: ["websocket"],
            reconnectionAttempts: "Infinity",
            timeout: 10000,
        });

        socket.emit("join", { name, room }, (error) => {
            if (error) {
                alert(error);
            }
        });

        return () => {
            socket.disconnect();
            socket.off();
        };
    }, [location.search]);

    useEffect(() => {
        socket.on("message", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on("roomData", ({ users }) => {
            setUsers(users);
        });

        return () => {
            socket.off("message");
            socket.off("roomData");
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message) {
            socket.emit("sendMessage", message, () => setMessage(""));
        }
    };

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
            <TextContainer users={users} />
        </div>
    );
};

export default Chat;
