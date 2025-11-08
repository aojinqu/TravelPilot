import React, { useState, useEffect, useRef } from 'react';
import { useTravel } from '../context/TravelContext';

const ChatSider = () => {
    const [inputMessage, setInputMessage] = useState('');
    const { setItinerary, addChatMessage, setLoading, isLoading, chatMessages } = useTravel();
    const messagesEndRef = useRef(null);

    // 自动滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, isLoading]);

    const handleChatSubmit = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const messageToSend = inputMessage.trim();
        setInputMessage(''); // 立即清空输入框
        setLoading(true);

        // 添加用户消息到聊天历史
        const userMessage = { 
            type: 'user', 
            content: messageToSend,
            timestamp: new Date().toISOString()
        };
        addChatMessage(userMessage);

        // 准备聊天历史（包括当前消息）
        const updatedChatHistory = [
            ...chatMessages.map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            {
                role: 'user',
                content: messageToSend
            }
        ];

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageToSend,
                    vibe: ["Universal Studios Japan", "Foodie"],
                    chat_history: updatedChatHistory
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const itineraryData = await response.json();
            console.log("收到后端数据:", itineraryData);
            
            // 更新行程数据
            setItinerary(itineraryData);
            
            // 添加 AI 回复到聊天历史
            if (itineraryData.ai_response) {
                addChatMessage({ 
                    type: 'ai', 
                    content: itineraryData.ai_response,
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error("Failed to fetch itinerary:", error);
            addChatMessage({
                type: 'system',
                content: `抱歉，请求失败: ${error.message}`,
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleChatSubmit();
        }
    };

    return (
        <div className="w-96 min-w-[384px] bg-gradient-to-b from-[#2A1643] to-[#3A1E5C] flex flex-col border-r border-gray-700 relative">
            {/* 聊天消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                        <p className="text-sm">开始您的旅行规划</p>
                        <p className="text-xs mt-2 text-gray-500">输入您的旅行需求，AI 将为您生成详细的行程</p>
                    </div>
                ) : (
                    chatMessages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                    msg.type === 'user'
                                        ? 'bg-purple-600 text-white'
                                        : msg.type === 'system'
                                        ? 'bg-red-900 text-red-200'
                                        : 'bg-gray-700 text-gray-200'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                {msg.timestamp && (
                                    <p className="text-xs mt-1 opacity-70">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-700 rounded-lg p-3">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 底部输入区 */}
            <div className="p-4 border-t border-gray-700">
                {/* Vibe Selector */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-gray-300 text-sm mb-2">
                        <span>Select your vibe</span>
                        <button className="flex items-center text-purple-400 hover:text-purple-300">
                            Expand
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300 hover:bg-gray-600 transition-colors duration-200 flex items-center">
                            Perfect choices! Univers
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <button className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300 hover:bg-gray-600 transition-colors duration-200 flex items-center">
                            Studios Japan,
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18-6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                {/* 聊天输入框 - 修复部分 */}
                <div className="flex items-center bg-gray-700 rounded-lg p-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2">A</span>
                    <input
                        type="text"
                        placeholder="Ask Airial..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button className="ml-2 text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a3 3 0 00-4.242-4.242L9.66 9.66"></path></svg>
                    </button>
                    <button
                        onClick={handleChatSubmit}
                        disabled={isLoading}
                        className={`ml-2 ${isLoading ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        )}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Airial is in beta and can make mistakes. Please check important info.
                </p>
            </div>

            {/* ... 其他部分保持不变 ... */}
        </div>
    );
};

export default ChatSider;


