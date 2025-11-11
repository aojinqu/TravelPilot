// App.js
import React, { useState } from 'react';
import { TravelProvider } from './context/TravelContext';
import ChatSider from './components/ChatSider';
import MainContent from './components/MainContent';
import ItineraryDetail from './components/ItineraryDetail';
import Header from './components/Header';

function App() {
    const [currentView, setCurrentView] = useState('overview'); // 'overview' 或 'itinerary'
    const [tripData, setTripData] = useState(null);

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

    return (
        <TravelProvider>
            <div className="flex h-screen bg-[#2A1643] text-white font-sans">
                {/* 左侧侧边栏 */}
                <ChatSider onNewTripData={handleNewTripData} />

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
    );
}

export default App;