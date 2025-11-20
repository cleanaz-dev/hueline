import React, { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, MoreVertical } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
}

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey! How are you?", sent: false, time: "10:30 AM" },
    {
      id: 2,
      text: "I'm doing great! Thanks for asking 😊",
      sent: true,
      time: "10:31 AM",
    },
    { id: 3, text: "What are you up to today?", sent: false, time: "10:31 AM" },
    {
      id: 4,
      text: "Just working on some coding projects. Building a chat UI actually!",
      sent: true,
      time: "10:32 AM",
    },
    {
      id: 5,
      text: "That sounds interesting! How's it going?",
      sent: false,
      time: "10:33 AM",
    },
    {
      id: 6,
      text: "Pretty well! Getting the animations to feel smooth",
      sent: true,
      time: "10:34 AM",
    },
  ]);

  const [inputText, setInputText] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputText,
        sent: true,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setInputText("");

      // Simulate response
      setTimeout(() => {
        const response = {
          id: messages.length + 2,
          text: "That's awesome! 👍",
          sent: false,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, response]);
      }, 1500);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4">
      {/* iPhone Frame */}
      <div className="relative w-full max-w-sm">
        {/* iPhone notch and frame */}
        <div className="absolute inset-0 bg-black rounded-[3rem] shadow-2xl p-3">
          {/* Screen */}
          <div className="relative w-full h-[600px] bg-white rounded-[2.5rem] overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50"></div>

            {/* Chat UI */}
            <div className="w-full h-full flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 pt-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="hover:bg-white/20 rounded-full p-1 transition">
                    <ArrowLeft size={24} />
                  </button>
                  <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center font-bold">
                    JD
                  </div>
                  <div>
                    <h2 className="font-semibold">John Doe</h2>
                    <p className="text-xs text-white/80">Online</p>
                  </div>
                </div>
                <button className="hover:bg-white/20 rounded-full p-2 transition">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sent ? "justify-end" : "justify-start"
                    } animate-[slideIn_0.3s_ease-out]`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`max-w-[75%] ${
                        message.sent ? "order-2" : "order-1"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          message.sent
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm"
                            : "bg-white text-gray-800 rounded-bl-sm shadow"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <p
                        className={`text-xs text-gray-500 mt-1 ${
                          message.sent ? "text-right" : "text-left"
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 pb-6 bg-white border-t border-gray-200">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                  <button
                    onClick={handleSend}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-2 hover:scale-110 transition-transform"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}
