import React, { createContext, useContext, useState } from 'react';

// 创建 Context
const TravelContext = createContext();

// 初始状态
const initialState = {
    itinerary: null,
    tripOverview: null,
    flights: [],
    hotels: [],
    priceSummary: null,
    chatMessages: [],
    isLoading: false,
    daily_itinerary: [],
    firstCompleteFlag: 0, // 标志位：0-未完成首次完整输入，1-已完成
    // 旅行信息
    travelInfo: {
        departure: null,      // 出发地点
        destination: null,    // 目的地
        numDays: null,        // 旅游天数
        dateRange: null,      // 开始-结束日期
        startDate: null,      // 开始日期
        endDate: null,        // 结束日期
        numPeople: null,      // 旅游人数
        budget: null,         // 总预算
        vibes: [],            // 旅行偏好
        media_contents: [],    // 发现内容
    },
};

// Provider 组件
export const TravelProvider = ({ children }) => {
    const [state, setState] = useState(initialState);

    // 更新行程数据
    const setItinerary = (data) => {
        setState(prevState => ({
            ...prevState,
            itinerary: data.itinerary || data.ai_response || prevState.itinerary,
            tripOverview: data.trip_overview || prevState.tripOverview,
            flights: data.flights || prevState.flights,
            hotels: data.hotels || prevState.hotels,
            priceSummary: data.price_summary || prevState.priceSummary,
            daily_itinerary: data.daily_itinerary || prevState.daily_itinerary,
        }));
    };

    // 添加聊天消息
    const addChatMessage = (message) => {
        setState(prevState => ({
            ...prevState,
            chatMessages: [...prevState.chatMessages, message],
        }));
    };

    // 设置加载状态
    const setLoading = (isLoading) => {
        setState(prevState => ({
            ...prevState,
            isLoading,
        }));
    };

    // 更新旅行信息
    const updateTravelInfo = (info) => {
        setState(prevState => ({
            ...prevState,
            travelInfo: {
                ...prevState.travelInfo,
                ...info,
            },
        }));
    };

    // 更新标志位的方法
    const setFirstCompleteFlag = (value) => {
        setState(prevState => ({
            ...prevState,
            firstCompleteFlag: value
        }));
    };

    // 清除所有数据（重置时标志位也恢复为0）
    const clearData = () => {
        setState(initialState);
    };

    const value = {
        ...state,
        setItinerary,
        addChatMessage,
        setLoading,
        updateTravelInfo,
        setFirstCompleteFlag, 
        clearData,
    };

    return (
        <TravelContext.Provider value={value}>
            {children}
        </TravelContext.Provider>
    );
};

export const useTravel = () => {
    const context = useContext(TravelContext);
    if (!context) {
        throw new Error('useTravel must be used within a TravelProvider');
    }
    return context;
};