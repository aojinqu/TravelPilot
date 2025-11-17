// App.js
import React, { useState } from 'react';
import { TravelProvider } from './context/TravelContext';
import { AuthProvider } from './context/AuthContext';
import ChatSider from './components/ChatSider';
import MainContent from './components/MainContent';
import ItineraryDetail from './components/ItineraryDetail';
import Header from './components/Header';
import HistoryPanel from './components/HistoryPanel';

function App() {
    const [currentView, setCurrentView] = useState('overview'); // 'overview' 或 'itinerary'
    const [tripData, setTripData] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    // 处理查看完整行程
    const handleViewFullPlan = (data) => {
        setTripData(data);
        setCurrentView('itinerary');
    };

    // 处理返回概览
    const handleBackToOverview = () => {
        setCurrentView('overview');
    };

    // 当从聊天接收到新数据时重置视图
    const handleNewTripData = () => {
        setCurrentView('overview');
    };

    // 处理选择历史计划
    const handleSelectHistoryPlan = (planData) => {
        console.log('选择历史计划，数据:', planData);
        // 设置tripData用于ItineraryDetail视图
        setTripData({
            daily_itinerary: planData.daily_itinerary || [],
            tripOverview: planData.trip_overview,
            flights: planData.flights || [],
            hotels: planData.hotels || [],
            priceSummary: planData.price_summary
        });
        // 确保显示overview视图
        setCurrentView('overview');
        // 保持历史面板打开，不关闭
        // setShowHistory(false); // 移除这行，保持历史面板显示
    };

    return (
        <AuthProvider>
            <TravelProvider>
                <div className="flex h-screen bg-[#2A1643] text-white font-sans">
                    {/* History按钮 */}
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="fixed top-4 left-4 z-50 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg transition-colors duration-200 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        History
                    </button>

                    {/* 左侧侧边栏 - 根据showHistory显示不同内容 */}
                    {showHistory ? (
                        <HistoryPanel
                            onSelectPlan={handleSelectHistoryPlan}
                            onClose={() => setShowHistory(false)}
                        />
                    ) : (
                        <ChatSider onNewTripData={handleNewTripData} />
                    )}

                {/* 右侧主内容区 */}
                <div className="flex-1 flex flex-col">
                    <Header />
                    
                    {/* 根据当前视图渲染不同内容 */}
                    {currentView === 'overview' && (
                        <MainContent 
                            onViewFullPlan={handleViewFullPlan}
                        />
                    )}
                    
                    {currentView === 'itinerary' && tripData && (
                        <ItineraryDetail 
                            dailyItinerary={tripData.daily_itinerary}
                            tripOverview={tripData.tripOverview}
                            flights={tripData.flights}
                            hotels={tripData.hotels}
                            priceSummary={tripData.priceSummary}
                            onBack={handleBackToOverview}
                        />
                    )}
                </div>
            </div>
        </TravelProvider>
        </AuthProvider>
    );
}

export default App;