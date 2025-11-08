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
    // 旅行信息
    travelInfo: {
        departure: null,      // 出发地点
        destination: null,    // 目的地
        numDays: null,        // 旅游天数
        numPeople: null,      // 旅游人数
        budget: null,         // 总预算
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

    // 清除所有数据
    const clearData = () => {
        setState(initialState);
    };

    const value = {
        ...state,
        setItinerary,
        addChatMessage,
        setLoading,
        updateTravelInfo,
        clearData,
    };

    return (
        <TravelContext.Provider value={value}>
            {children}
        </TravelContext.Provider>
    );
};

// 自定义 Hook
export const useTravel = () => {
    const context = useContext(TravelContext);
    if (!context) {
        throw new Error('useTravel must be used within a TravelProvider');
    }
    return context;
};

