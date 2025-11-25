import React, {useState, useEffect, useRef} from 'react';
import {useTravel} from '../context/TravelContext';
import { v4 as uuidv4 } from 'uuid';
import {parseTravelInfo, validateTravelInfo, generateMissingInfoMessage} from '../utils/parseTravelInfo';
import LocationSearch from "./LocationSearch";
import PassengerSelector from "./PassengerSelector";
import DateRangePicker from "./DateRangePicker";
import BudgetSelector from "./BudgetSelector";
import VibeSelector from "./VibeSelector";

// DropdownButton 组件 (更新后的代码)

const DropdownButton = ({triggerContent, triggerIcon, children}) => {
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
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isOpen && (
                <div className="absolute bottom-full mb-2 w-auto bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-700">
                    {children}
                </div>
            )}
        </div>
    );
};

const ChatSider = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [isConfigExpanded, setIsConfigExpanded] = useState(true); // 新增：控制配置区域展开状态
    const [progressMessages, setProgressMessages] = useState([]);
    const [currentRequestId, setCurrentRequestId] = useState(null);
    const {
        setItinerary,
        addChatMessage,
        setLoading,
        isLoading,
        chatMessages,
        travelInfo,
        updateTravelInfo,
        firstCompleteFlag, 
        setFirstCompleteFlag
    } = useTravel();
    
    const messagesEndRef = useRef(null);

    // 自动滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, isLoading, progressMessages]);

    // 监听进度消息
    useEffect(() => {
        if (!currentRequestId) {
            console.log("❌ 没有当前请求ID，不启动进度监听");
            return;
        }

        console.log(`🎯 开始监听进度流: http://localhost:8000/api/progress/${currentRequestId}`);
        const eventSource = new EventSource(`http://localhost:8000/api/progress/${currentRequestId}`);

        eventSource.onmessage = (event) => {
            console.log("📨 收到进度消息:", event.data);
            const progressData = JSON.parse(event.data);

            setProgressMessages(prev => [...prev, {
                type: 'progress',
                content: progressData.message,
                progressType: progressData.type,
                timestamp: progressData.timestamp
            }]);
            // 如果是完成消息，稍后关闭连接
            if (progressData.type === 'success') {
                setTimeout(() => {
                    eventSource.close();
                    setCurrentRequestId(null);
                }, 3000);
            }
            // 如果是错误消息，立即关闭连接
            if (progressData.type === 'error') {
                eventSource.close();
                setCurrentRequestId(null);
            }
        };
        eventSource.onerror = (error) => {
            console.error('Progress stream error:', error);
            eventSource.close();
            setCurrentRequestId(null);
        };
        return () => {
            eventSource.close();
        };
    }, [currentRequestId]);

    // 格式化消息内容
    const formatMessageContent = (content) => {
        if (!content) return content;

        // 处理加粗文本 **text**
        let formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-yellow-300">$1</strong>');

        // 处理下拉箭头 ▼
        formattedContent = formattedContent.replace(/▼/g, '<span class="text-blue-400">▼</span>');

        return formattedContent;
    };
    const toggleConfigExpanded = () => {
        setIsConfigExpanded(!isConfigExpanded);
    };

    const handleChatSubmit = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const messageToSend = inputMessage.trim();
        setInputMessage(''); // 立即清空输入框
        // 生成请求ID
        const requestId = uuidv4();
        setCurrentRequestId(requestId);
        setProgressMessages([]);
        // 添加用户消息到聊天历史
        const userMessage = {
            type: 'user',
            content: messageToSend,
            timestamp: new Date().toISOString()
        };
        addChatMessage(userMessage);
        // 添加分隔线
        addChatMessage({
            type: 'system',
            content: '---',
            timestamp: new Date().toISOString()
        });
        // 解析用户输入中的旅行信息
        const parsedInfo = parseTravelInfo(messageToSend, travelInfo);

        // 更新旅行信息（合并新旧信息）
        if (Object.keys(parsedInfo).some(key => parsedInfo[key] !== travelInfo[key])) {
            updateTravelInfo(parsedInfo);
        }

        // 合并后的完整旅行信息
        const updatedTravelInfo = {...travelInfo, ...parsedInfo};

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
            content: '✅ Travel information is complete! Generating your detailed travel itinerary, please wait...',
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
        // 生成唯一 request_id

        try {
            // 构建发送给后端的消息，包含所有旅行信息
            const enrichedMessage = `Destination: ${updatedTravelInfo.destination}, Departure: ${updatedTravelInfo.departure}, ${updatedTravelInfo.numDays} days, ${updatedTravelInfo.numPeople} people, budget ${updatedTravelInfo.budget} ${updatedTravelInfo.currency || 'CNY'}. ${messageToSend}`;

            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: enrichedMessage,
                    vibe: updatedTravelInfo.vibes,
                    chat_history: updatedChatHistory,
                    travel_info: {
                        destination: updatedTravelInfo.destination,
                        departure: updatedTravelInfo.departure,
                        num_days: updatedTravelInfo.numDays,
                        num_people: updatedTravelInfo.numPeople,
                        budget: updatedTravelInfo.budget,
                        start_date: updatedTravelInfo.startDate,
                        end_date: updatedTravelInfo.endDate
                    },
                    request_id: requestId,
                    first_complete_flag: firstCompleteFlag
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const itineraryData = await response.json();
            console.log("收到后端数据:", itineraryData);

            if (firstCompleteFlag === 0) {
                setFirstCompleteFlag(1);
            }

            // 使用后端返回的 request_id 开始监听进度
            if (itineraryData.request_id) {
                console.log("🎯 开始监听进度流:", itineraryData.request_id);
                setCurrentRequestId(itineraryData.request_id);
            }

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
                content: `Sorry, request failed: ${error.message}`,
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

    const destination = travelInfo?.destination || "Destination";
    const departure = travelInfo.departure || "departure";
    const dateRange = travelInfo?.dateRange || "Feb 6 - Feb 12";
    const numPeople = travelInfo?.numPeople || "0";
    const budgetDisplay = travelInfo.budget ? `${travelInfo.currency || 'CNY'} ${travelInfo.budget}` : "CNY 0";
    const dateIcon = <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>;
    const peopleIcon = <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>;
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
    const budgetIcon = <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2zm0-4v2m0 12v2m0-16c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z"></path>
    </svg>;
    const departureIcon = <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                               xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
    </svg>;
    return (
        <div
            className="w-96 min-w-[384px] bg-gradient-to-b from-[#2A1643] to-[#3A1E5C] flex flex-col border-r border-gray-700 relative">
            {/* 聊天消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && progressMessages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8 px-4">
                        <p className="text-sm font-semibold mb-4">Start your travel plan</p>
                        <div className="text-xs text-gray-500 space-y-2 text-left bg-gray-800/50 rounded-lg p-4">
                            <p className="font-semibold text-gray-400 mb-2">Please tell me：</p>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>Departure location (e.g., from Hong Kong)</li>
                                <li>Destination (e.g., to Osaka)</li>
                                <li>Number of days (e.g., 7 days)</li>
                                <li>Number of people (e.g., 2 people)</li>
                                <li>Total budget (e.g., 5000 CNY)</li>
                            </ul>
                            <p className="mt-3 text-gray-400 italic">You can provide all information at once or in multiple messages.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 渲染聊天消息 */}
                        {chatMessages.map((msg, index) => (
                            <div
                                key={`chat-${msg.timestamp}-${index}-${msg.type}`}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                        msg.type === 'user'
                                            ? 'bg-purple-600 text-white'
                                            : msg.type === 'system' && msg.content !== '---'
                                                ? 'bg-yellow-900/50 border border-yellow-700 text-yellow-100'
                                                : msg.type === 'system' && msg.content === '---'
                                                    ? 'bg-transparent border-none'
                                                    : 'bg-gray-700 text-gray-200'
                                    }`}
                                >
                                    {msg.type === 'system' && msg.content !== '---' && (
                                        <div className="flex items-center mb-2">
                                            <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none"
                                                 stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <span className="text-xs font-semibold text-yellow-300">Tip</span>
                                        </div>
                                    )}

                                    {msg.content === '---' ? (
                                        <div className="h-px bg-gray-600 w-full"></div>
                                    ) : (
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    )}

                                    {msg.timestamp && msg.content !== '---' && (
                                        <p className="text-xs mt-1 opacity-70">
                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* 渲染进度消息 */}
                        {progressMessages.map((msg, index) => {
                            const isLast = index === progressMessages.length - 1;
                            const isInfo = msg.progressType === "info";
                            const isDetail = msg.progressType === "detail";
                            const isSuccess = msg.progressType === "success";

                            return (
                                <div key={`progress-${msg.timestamp}-${index}`} className="relative pl-8 pb-4">

                                    {!isLast && (isInfo || isSuccess) && (
                                        <div className="absolute left-[12px] top-5 w-[2px] h-full bg-white/20"></div>
                                    )}

                                    {(isInfo || isSuccess) && (
                                        <div
                                            className={`absolute left-0 top-1 w-5 h-5 flex items-center justify-center rounded-full border-2 ${
                                                isSuccess
                                                    ? 'border-green-400 bg-green-500/20'
                                                    : 'border-white/60 bg-transparent'
                                            }`}
                                        >
                                            {isSuccess ? (
                                                <svg
                                                    className="w-3.5 h-3.5 text-green-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="3"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            ) : (
                                                <div className="w-2.5 h-2.5 bg-white rounded-full opacity-80"/>
                                            )}
                                        </div>
                                    )}

                                    <div className="ml-3">
                                        {isInfo && (
                                            <p className="font-semibold text-white text-[15px] leading-snug">
                                                {msg.content}
                                            </p>
                                        )}

                                        {isDetail && (
                                            <p className="text-gray-300 text-[14px] leading-snug pl-4 mt-0.5">
                                                {msg.content}
                                            </p>
                                        )}

                                        {isSuccess && (
                                            <p className="font-semibold text-green-400 text-[15px] leading-snug">
                                                {msg.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    </>
                )}

                {/* 加载指示器 */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-700 rounded-lg p-3">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                     style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                     style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef}/>
            </div>

            {/* 旅行信息显示区域 */}
            {(travelInfo.departure || travelInfo.destination || travelInfo.numDays || travelInfo.numPeople || travelInfo.budget || (travelInfo.vibes && travelInfo.vibes.length > 0)) && (
                <div className="px-4 py-2 bg-gray-800/50 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-2">Collected Information:</div>
                    <div className="flex flex-wrap gap-2">
                        {travelInfo.departure && (
                            <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">
                            Departure: {travelInfo.departure}
                        </span>
                        )}
                        {travelInfo.destination && (
                            <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">
                            Destination: {travelInfo.destination}
                        </span>
                        )}
                        {travelInfo.numDays && (
                            <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">
                            {travelInfo.numDays} days
                        </span>
                        )}
                        {travelInfo.numPeople !== 0 && travelInfo.numPeople !== null && (
                            <span className="px-2 py-1 bg-orange-900/50 text-orange-300 rounded text-xs">
                            {travelInfo.numPeople} people
                        </span>
                        )}
                        {travelInfo.budget && (
                            <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-xs">
                            Budget: {travelInfo.budget} {travelInfo.currency || 'CNY'}
                        </span>
                        )}
                        {/* Vibe 标签 */}
                        {travelInfo.vibes && travelInfo.vibes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {travelInfo.vibes.map(vibe => (
                                    <span
                                        key={vibe}
                                        className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs"
                                    >
                            {vibe}
                        </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 配置区域 */}
            <div className="border-t border-gray-700">
                <div className="p-4 space-y-4">
                    {/* 顶部标题 */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-300 tracking-wide">
                            Configure Your Trip
                        </h3>
                        <button
                            onClick={toggleConfigExpanded}
                            className="flex items-center text-gray-400 hover:text-purple-400 text-xs transition-colors"
                        >
                            {isConfigExpanded ? 'Collapse' : 'Expand'}
                            <svg
                                className={`w-3.5 h-3.5 ml-1 transition-transform ${isConfigExpanded ? '' : 'rotate-180'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                    </div>
                    {/* 展开的内容 */}
                    {isConfigExpanded && (
                        <>
                            {/* Vibe 选择器 */}
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <VibeSelector/>
                                </div>
                            </div>

                            {/* 第一行：日期、人数、预算 */}
                            <div className="flex gap-3">
                                {/* 日期 */}
                                <DropdownButton
                                    className="flex-1 min-w-0"
                                    triggerContent={<span className="text-xs text-gray-200 truncate">{dateRange}</span>}
                                    triggerIcon={dateIcon}
                                    dropdownClassName="absolute bottom-full mb-2 left-0 z-20"
                                >
                                    <DateRangePicker/>
                                </DropdownButton>

                                {/* 人数 */}
                                <DropdownButton
                                    className="flex-shrink-0"
                                    triggerContent={<span className="text-xs text-gray-200">{numPeople}</span>}
                                    triggerIcon={peopleIcon}
                                    dropdownClassName="absolute bottom-full mb-2 right-0 z-20"
                                >
                                    <PassengerSelector/>
                                </DropdownButton>

                                {/* 预算 */}
                                <DropdownButton
                                    className="flex-1 min-w-0"
                                    triggerContent={<span
                                        className="text-xs text-gray-200 truncate">{budgetDisplay}</span>}
                                    triggerIcon={budgetIcon}
                                    dropdownClassName="absolute bottom-full mb-2 right-0 z-20"
                                >
                                    <BudgetSelector/>
                                </DropdownButton>
                            </div>

                            {/* 第二行：出发地、目的地 */}
                            <div className="flex gap-3">
                                {/* 出发地 */}
                                <DropdownButton
                                    className="flex-1 min-w-0"
                                    triggerContent={<span className="text-xs text-gray-200 truncate">{departure}</span>}
                                    triggerIcon={departureIcon}
                                    dropdownClassName="absolute bottom-full mb-2 left-0 z-20"
                                >
                                    <LocationSearch locationType="departure"/>
                                </DropdownButton>

                                {/* 目的地 */}
                                <DropdownButton
                                    className="flex-1 min-w-0"
                                    triggerContent={<span
                                        className="text-xs text-gray-200 truncate">{destination}</span>}
                                    triggerIcon={locationIcon}
                                    dropdownClassName="absolute bottom-full mb-2 left-0 z-20"
                                >
                                    <LocationSearch locationType="destination"/>
                                </DropdownButton>
                            </div>
                        </>
                    )}

                    {/* 聊天输入框 - 始终显示 */}
                    <div className="flex items-center bg-gray-700 rounded-lg p-2">
                        <span
                            className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2">A</span>
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
                                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
                                     viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                </svg>
                            )}
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        TravelPilot is in beta and can make mistakes. Please check important info.
                    </p>
                </div>
            </div>
        </div>
    );
};


export default ChatSider;


