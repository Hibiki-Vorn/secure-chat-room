'use client';

import { useState, useRef, useEffect, use } from "react";

export default function Room({ params }) {
    const { room } = use(params);

    const [messages, setMessages] = useState([
        { id: 1, sender: "System", text: `Welcome to room ${room}` },
    ]);

    const [input, setInput] = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        const username =
            window.sessionStorage.getItem("nickname") || "Anonymous";

        const es = new EventSource(
            `/api/serverActions?room-name=${room}&username=${username}`
        );

        es.onmessage = (event) => {
            console.log("Received SSE message:", event.data);
            let data;
            try {
                data = JSON.parse(event.data);
            } catch (e) {
                console.error("Error parsing SSE data:", e);
                return;
            }
            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    sender: data.sender || "Unknown",
                    text: data.text || "",
                },
            ]);

            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        };

        es.onerror = () => {
            console.log("SSE disconnected");
            es.close();
        };

        return () => es.close(); // ⭐一定要关闭
    }, [room]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const username =
            window.sessionStorage.getItem("nickname") || "Anonymous";

        await fetch("/api/serverActions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                roomName: room,
                username,
                message: input,
            }),
        });

        setInput("");
    };

    return (
        <div className="w-[100dvw] h-[100dvh] bg-gray-950 text-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl h-full max-h-[700px] bg-gray-900 rounded-2xl shadow-xl flex flex-col">
                <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Secure Chat</h1>
                    <span className="text-xs text-gray-400">Room</span>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((m) => (
                        <div key={m.id}>
                            <span className="text-indigo-400 font-semibold mr-2">
                                {m.sender}:
                            </span>
                            <span className="text-gray-200">{m.text}</span>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                <div className="p-4 border-t border-gray-800 flex gap-2 overflow-auto">
                    <input
                        className="flex-1 bg-gray-800 rounded-xl px-3 py-2 outline-none"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />

                    <button
                        onClick={sendMessage}
                        className="bg-indigo-500 hover:bg-indigo-600 transition rounded-xl px-5"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}