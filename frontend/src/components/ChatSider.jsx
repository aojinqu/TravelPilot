import React, { useState } from 'react';

// 假设你有一个真实的全局状态管理
// 这里先用模拟函数，你需要替换成你的实际状态管理
const useGlobalStore = () => {
    // 这些应该是从你的状态管理库（Zustand、Redux、Context）中获取的
    return {
        setItinerary: (data) => {
            console.log("行程已更新:", data);
            // 这里应该是实际的 setItinerary 实现
        },
        addChatMessage: (message) => {
            console.log("聊天记录已添加:", message);
            // 这里应该是实际的 addChatMessage 实现
        }
    };
};

const ChatSider = () => {
    const [inputMessage, setInputMessage] = useState('');
    const { setItinerary, addChatMessage } = useGlobalStore();

    const handleChatSubmit = async () => {
        if (!inputMessage.trim()) return;

        const messageToSend = inputMessage.trim();
        setInputMessage(''); // 立即清空输入框

        // 添加用户消息到聊天历史
        addChatMessage({ type: 'user', content: messageToSend });

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageToSend,
                    vibe: ["Universal Studios Japan", "Foodie"],
                    chat_history: []
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const itineraryData = await response.json();
            console.log(itineraryData);
            // 添加 AI 回复和更新行程数据
            addChatMessage({ type: 'ai', content: itineraryData.ai_response });
            setItinerary(itineraryData);

        } catch (error) {
            console.error("Failed to fetch itinerary:", error);
            addChatMessage({
                type: 'system',
                content: `抱歉，请求失败: ${error.message}`
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleChatSubmit();
        }
    };

    return (
        <div className="w-96 min-w-[384px] bg-gradient-to-b from-[#2A1643] to-[#3A1E5C] flex flex-col border-r border-gray-700 relative">
            {/* ... 其他部分保持不变 ... */}

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
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                    />
                    <button className="ml-2 text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a3 3 0 00-4.242-4.242L9.66 9.66"></path></svg>
                    </button>
                    <button
                        onClick={handleChatSubmit}
                        className="ml-2 text-gray-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
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