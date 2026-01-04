'use client';

import { useState } from "react";
export default function Enter() {
    const [nicknameInput, setNicknameInput] = useState("");
    const [roomNameInput, setRoomNameInput] = useState("");
    return (
        <div className="w-[100dvw] h-[100dvh] bg-gray-950 text-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl p-6">
                <h1 className="text-2xl font-bold mb-4">Welcome to Secure Chat</h1>
                <p className="text-gray-400 mb-6">
                    Please enter your nickname and the room name to join the chat room.
                </p>
                <input
                    className="w-full bg-gray-800 rounded-xl px-3 py-2 mb-4 outline-none"
                    placeholder="Enter your nickname"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                />
                <input
                    className="w-full bg-gray-800 rounded-xl px-3 py-2 mb-4 outline-none"
                    placeholder="Enter the room name"
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                />
                <p className="text-gray-400 mb-6">
                    Please make sure to remember your nickname for this session.
                </p>
                <button
                    onClick={() => {
                        window.sessionStorage.setItem("nickname", nicknameInput);
                        window.location.href = `/room/${roomNameInput}`;
                    }}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 transition rounded-xl py-2"
                >
                    Join Chat
                </button>
            </div>
        </div>
    );
}