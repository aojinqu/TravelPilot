import React, { useState, useEffect, useRef } from 'react';
import { useTravel } from '../context/TravelContext';
import { parseTravelInfo, validateTravelInfo, generateMissingInfoMessage } from '../utils/parseTravelInfo';
import LocationSearch from "./LocationSearch";
import PassengerSelector from "./PassengerSelector";
import DateRangePicker from "./DateRangePicker";

// DropdownButton 组件 (更新后的代码)

const DropdownButton = ({ triggerContent, triggerIcon, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200"
            >
                {triggerIcon}
                {triggerContent}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div
                    // 🚀 关键修复：从 top-full mt-2 改为 bottom-full mb-2
                    className="absolute bottom-full mb-2 w-auto bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-700"
                >
                    {children}
                </div>
            )}
        </div>
    );
};

const ChatSider = () => {
    const [inputMessage, setInputMessage] = useState('');
    const {
        setItinerary,
        addChatMessage,
        setLoading,
        isLoading,
        chatMessages,
        travelInfo,
        updateTravelInfo
    } = useTravel();
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

        // 添加用户消息到聊天历史
        const userMessage = {
            type: 'user',
            content: messageToSend,
            timestamp: new Date().toISOString()
        };
        addChatMessage(userMessage);

        // 解析用户输入中的旅行信息
        const parsedInfo = parseTravelInfo(messageToSend, travelInfo);

        // 更新旅行信息（合并新旧信息）
        if (Object.keys(parsedInfo).some(key => parsedInfo[key] !== travelInfo[key])) {
            updateTravelInfo(parsedInfo);
        }

        // 合并后的完整旅行信息
        const updatedTravelInfo = { ...travelInfo, ...parsedInfo };

        // 验证旅行信息是否完整
        const validation = validateTravelInfo(updatedTravelInfo);

        if (!validation.isValid) {
            // 信息不完整，提示用户补充
            const missingMessage = generateMissingInfoMessage(validation.missingFields);
            addChatMessage({
                type: 'system',
                content: missingMessage,
                timestamp: new Date().toISOString()
            });
            return; // 不调用 API，等待用户补充信息
        }

        // 信息完整，通知用户并调用 API 生成行程
        addChatMessage({
            type: 'system',
            content: '✅ 旅行信息已收集完整！正在为您生成详细的旅行行程，请稍候...',
            timestamp: new Date().toISOString()
        });

        setLoading(true);

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
            // 构建发送给后端的消息，包含所有旅行信息
            const enrichedMessage = `目的地：${updatedTravelInfo.destination}，出发地：${updatedTravelInfo.departure}，${updatedTravelInfo.numDays}天，${updatedTravelInfo.numPeople}人，预算${updatedTravelInfo.budget}元。${messageToSend}`;

            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: enrichedMessage,
                    vibe: ["Universal Studios Japan", "Foodie"],
                    chat_history: updatedChatHistory,
                    travel_info: {
                        destination: updatedTravelInfo.destination,
                        departure: updatedTravelInfo.departure,
                        num_days: updatedTravelInfo.numDays,
                        num_people: updatedTravelInfo.numPeople,
                        budget: updatedTravelInfo.budget,
                    }
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
    // ... 你的默认值和数据提取逻辑 (保持不变) ...
    const location = travelInfo?.destination || "Osaka";
    const dateRange = travelInfo?.dateRange || "Feb 6 - Feb 12";
    const numPeople = travelInfo?.numPeople || "1";
    const dateIcon = <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
    const peopleIcon = <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
    const locationIcon = (
        <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
            ></path>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
        </svg>
    );
    return (
        <div className="w-96 min-w-[384px] bg-gradient-to-b from-[#2A1643] to-[#3A1E5C] flex flex-col border-r border-gray-700 relative">
            {/* 聊天消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8 px-4">
                        <p className="text-sm font-semibold mb-4">开始您的旅行规划</p>
                        <div className="text-xs text-gray-500 space-y-2 text-left bg-gray-800/50 rounded-lg p-4">
                            <p className="font-semibold text-gray-400 mb-2">请告诉我以下信息：</p>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>出发地点（例如：从香港出发）</li>
                                <li>目的地（例如：去大阪）</li>
                                <li>旅游天数（例如：7天）</li>
                                <li>旅游人数（例如：2人）</li>
                                <li>总预算（例如：5000元）</li>
                            </ul>
                            <p className="mt-3 text-gray-400 italic">您可以一次性提供所有信息，也可以分多次提供。</p>
                        </div>
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
                                        ? 'bg-yellow-900/50 border border-yellow-700 text-yellow-100'
                                        : 'bg-gray-700 text-gray-200'
                                }`}
                            >
                                {msg.type === 'system' && (
                                    <div className="flex items-center mb-2">
                                        <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <span className="text-xs font-semibold text-yellow-300">提示</span>
                                    </div>
                                )}
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

            {/* 旅行信息显示区域 */}
            {(travelInfo.departure || travelInfo.destination || travelInfo.numDays || travelInfo.numPeople || travelInfo.budget) && (
                <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/50">
                    <div className="text-xs text-gray-400 mb-2">已收集的信息：</div>
                    <div className="flex flex-wrap gap-2">
                        {travelInfo.departure && (
                            <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">
                                出发：{travelInfo.departure}
                            </span>
                        )}
                        {travelInfo.destination && (
                            <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">
                                目的地：{travelInfo.destination}
                            </span>
                        )}
                        {travelInfo.numDays && (
                            <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">
                                {travelInfo.numDays}天
                            </span>
                        )}
                        {travelInfo.numPeople && (
                            <span className="px-2 py-1 bg-orange-900/50 text-orange-300 rounded text-xs">
                                {travelInfo.numPeople}人
                            </span>
                        )}
                        {travelInfo.budget && (
                            <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-xs">
                                预算：{travelInfo.budget}元
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* 底部输入区 */}
            <div className="p-4 border-t border-gray-700">

                {/* 1️⃣ 顶部标题 */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-300 tracking-wide">
                        Configure Your Trip
                    </h3>
                    <button className="flex items-center text-gray-400 hover:text-purple-400 text-xs transition-colors">
                        Expand
                        <svg
                            className="w-3.5 h-3.5 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                </div>

                {/* 2️⃣ Vibe 标签 */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {["Food", "Adventure"].map((vibe) => (
                        <button
                            key={vibe}
                            className="px-3 py-1.5 bg-gray-700/70 text-xs text-gray-200 rounded-full border border-gray-600 hover:border-purple-500 hover:text-white hover:bg-gray-700 transition-all"
                        >
                            {vibe}
                        </button>
                    ))}
                </div>

                {/* 3️⃣ 三个配置按钮区块 */}
                <div className="flex flex-nowrap items-center gap-3 mb-3">
                    {/* 日期选择器 - 固定宽度 */}
                    <div className="flex-shrink-0">
                        <DropdownButton
                            triggerContent={<span className="text-xs text-gray-200 whitespace-nowrap">{dateRange}</span>}
                            triggerIcon={dateIcon}
                            dropdownClassName="absolute bottom-full mb-2 left-0 z-20"
                        >
                            <DateRangePicker />
                        </DropdownButton>
                    </div>

                    {/* 人数选择器 - 固定宽度 */}
                    <div className="flex-shrink-0">
                        <DropdownButton
                            triggerContent={<span className="text-xs text-gray-200 whitespace-nowrap">{numPeople}</span>}
                            triggerIcon={peopleIcon}
                            dropdownClassName="absolute bottom-full mb-2 right-0 z-20"
                        >
                            <PassengerSelector />
                        </DropdownButton>
                    </div>

                    {/* 地点选择器 - 弹性宽度 */}
                    <div className="flex-1 min-w-0">
                        <DropdownButton
                            triggerContent={
                                <span className="text-xs text-gray-200 whitespace-nowrap truncate block w-full">
                    {location}
                </span>
                            }
                            triggerIcon={locationIcon}
                            dropdownClassName="absolute bottom-full mb-2 left-0 z-20"
                        >
                            <LocationSearch />
                        </DropdownButton>
                    </div>
                </div>
                {/* 聊天输入框 - 修复部分 */}
                <div className="flex items-center bg-gray-700 rounded-lg p-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2">A</span>
                    <input
                        type="text"
                        placeholder="Ask TravelPilot..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />

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
                    TravelPilot is in beta and can make mistakes. Please check important info.
                </p>
            </div>

        </div>
    );
};

export default ChatSider;


