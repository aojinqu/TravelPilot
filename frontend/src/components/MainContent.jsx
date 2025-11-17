// components/MainContent.jsx
import React, { useState } from 'react';
import { useTravel } from '../context/TravelContext';
import AddInspiration from './AddInspiration';

const MainContent = () => {
    const { tripOverview, daily_itinerary, flights, hotels, priceSummary, itinerary } = useTravel();
    const [showFullItinerary, setShowFullItinerary] = useState(false);
    const [showInspiration, setShowInspiration] = useState(false);

    const handleDownloadCalendar = async () => {
        if (!itinerary) return;

        try {
            const response = await fetch('http://localhost:8000/api/download-calendar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itinerary: itinerary,
                    start_date: tripOverview?.date_range?.split(' - ')[0] || new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to download calendar');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'travel_itinerary.ics';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to download calendar:', error);
            alert('下载日历失败，请稍后重试');
        }
    };

    // 切换显示完整行程
    const handleViewFullPlan = () => {
        setShowFullItinerary(true);
        setShowInspiration(false);
    };

    // 返回主内容
    const handleBackToMain = () => {
        setShowFullItinerary(false);
        setShowInspiration(false);
    };

    // 查看灵感页面
    const handleViewInspiration = () => {
        setShowInspiration(true);
        setShowFullItinerary(false);
    };

    // 关闭灵感页面
    const handleCloseInspiration = () => {
        setShowInspiration(false);
    };

    // 如果显示完整行程页面（全屏）
    if (showFullItinerary) {
        return (
            <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
                {/* 顶部返回按钮 */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={handleBackToMain}
                        className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back to Overview
                    </button>
                    <button
                        onClick={handleDownloadCalendar}
                        disabled={!itinerary}
                        className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101m-4.242 0a2 2 0 010 2.828l.707.707"></path>
                        </svg>
                        Download Calendar
                    </button>
                </div>

                {/* 完整行程内容 */}
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h1 className="text-2xl font-bold mb-6 text-white">{tripOverview?.title || "Travel Itinerary"}</h1>

                    {/* 使用后端数据渲染每日行程 */}
                    <div className="space-y-8">
                        {daily_itinerary && daily_itinerary.length > 0 ? (
                            daily_itinerary.map((dayItem, index) => {
                                const { day, itinerary } = dayItem;
                                return (
                                    <div key={index} className="border-l-2 border-purple-500 pl-6 relative">
                                        {/* 日期标题 */}
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-white">
                                                Day {day}
                                            </h3>
                                        </div>

                                        {/* 活动卡片 */}
                                        <div className="relative">
                                            {/* 时间线圆点 */}
                                            <div className="absolute -left-9 top-2 w-4 h-4 rounded-full bg-purple-500 border-4 border-gray-800"></div>

                                            <div className="bg-gray-700 rounded-lg p-4 w-[90%] mx-auto">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-white font-semibold text-base">
                                                        {itinerary.activity}
                                                    </h4>
                                                    <div className="flex items-center text-gray-400 text-sm bg-gray-600 px-2 py-1 rounded w-fit ml-2">
                                                        <span>🕒</span>
                                                        <span className="ml-1">
                                                            {itinerary.start_time} - {itinerary.end_time}
                                                        </span>
                                                    </div>
                                                </div>

                                                {itinerary.image_url && (
                                                    <img
                                                        src={itinerary.image_url}
                                                        alt={itinerary.activity}
                                                        className="rounded-lg mt-3 w-[80%] mx-0 object-cover max-h-56"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* 分隔线 */}
                                        {index < daily_itinerary.length - 1 && (
                                            <div className="my-8 border-t border-gray-600"></div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-400 italic">No itinerary data available.</p>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    // 主内容页面
    return (
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900 relative">
            {/* 遮罩层 - 只在显示灵感页面时出现 */}
            {showInspiration && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                    onClick={handleCloseInspiration}
                />
            )}

            {/* 灵感页面侧边弹窗 */}
            {showInspiration && (
                <div className="fixed right-0 top-0 h-full w-1/2 max-w-2xl z-50 transform transition-transform duration-300 ease-in-out">
                    <AddInspiration onBack={handleCloseInspiration} />
                </div>
            )}

            {/* 主内容区域 - 根据是否显示灵感页面调整透明度 */}
            <div className={`transition-all duration-300 ${showInspiration ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                {/* 顶部按钮 */}
                <div className="flex justify-end space-x-3 mb-6">
                    <button
                        onClick={handleViewInspiration}
                        className="flex items-center px-4 py-2 bg-gray-800 text-purple-400 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-6.857 2.286L12 21l-2.286-6.857L3 12l6.857-2.286L12 3z"></path>
                        </svg>
                        Travel Inspired!
                    </button>
                    <button
                        onClick={handleDownloadCalendar}
                        disabled={!itinerary}
                        className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101m-4.242 0a2 2 0 010 2.828l.707.707"></path></svg>
                        Download Calendar
                    </button>
                    <button
                        onClick={handleViewFullPlan}
                        className="flex items-center px-4 py-2 bg-[#8965F2] text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    >
                        Full Itinerary
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </button>
                </div>

                {/* 行程总览卡片 */}
                {tripOverview && (
                    <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Trip Overview</h2>
                        <div className="relative w-full h-72 rounded-lg overflow-hidden mb-4 bg-gray-700">
                            {tripOverview.image_url ? (
                                <img
                                    src={tripOverview.image_url}
                                    alt={tripOverview.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ display: tripOverview.image_url ? 'none' : 'flex' }}>
                                <span>{tripOverview.location || 'No Image'}</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-200 mb-1">
                            {tripOverview.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">{tripOverview.date_range}</p>
                        <p className="text-gray-300 mb-4">
                            {tripOverview.description}
                        </p>

                        {/* View Full Plan 按钮 */}
                        <button
                            onClick={handleViewFullPlan}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                        >
                            View Full Plan
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                            </svg>
                        </button>
                    </div>
                )}

                {/* 如果没有数据，显示提示 */}
                {!tripOverview && !flights.length && !hotels.length && (
                    <div className="bg-gray-800 rounded-xl p-12 shadow-lg text-center">
                        <p className="text-gray-400 text-lg mb-4">暂无行程数据</p>
                        <p className="text-gray-500 text-sm">请在左侧输入框中输入您的旅行需求，开始规划您的行程</p>
                    </div>
                )}

                {/* 航班卡片 */}
                {flights.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">
                                Flights <span className="text-sm text-gray-400">
                                    {priceSummary?.currency} {priceSummary?.flights_total} <span className="mx-1">/</span> {flights.length} {flights.length === 1 ? 'flight' : 'flights'}
                                </span>
                            </h2>
                            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                                Modify <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {flights.map((flight, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-lg font-semibold">{flight.origin}</span>
                                        {flight.nonstop && <span className="text-xs text-gray-400">Nonstop</span>}
                                        <div className="flex items-center text-gray-300 text-sm">
                                            <span>{flight.duration}</span>
                                            <svg className="w-5 h-5 mx-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-lg font-semibold">{flight.destination}</span>
                                        <div className="text-right">
                                            <span className="block text-lg font-semibold">{flight.departure_time}</span>
                                            <span className="block text-xs text-gray-400">{flight.departure_date}</span>
                                        </div>
                                        <span className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                            {flight.airline?.substring(0, 2).toUpperCase() || 'FL'}
                                        </span>
                                        <div className="text-right">
                                            <span className="block text-lg font-semibold">{flight.arrival_time}</span>
                                            <span className="block text-xs text-gray-400">{flight.arrival_date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 酒店卡片 */}
                {hotels.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">
                                Hotels <span className="text-sm text-gray-400">
                                    {priceSummary?.currency} {priceSummary?.hotels_total} <span className="mx-1">/</span> {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'}
                                </span>
                            </h2>
                            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                                Modify <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {hotels.map((hotel, index) => {
                                const stars = '★'.repeat(Math.floor(hotel.rating));
                                return (
                                    <div key={index} className="flex items-center bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                                         onClick={() => window.open(hotel.link, '_blank', 'noopener,noreferrer')}>
                                        <div className="w-20 h-20 bg-gray-600 rounded-lg mr-4 flex items-center justify-center overflow-hidden">
                                            {hotel.image_url ? (
                                                <img
                                                    src={hotel.image_url}
                                                    alt={hotel.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-xs">No Image</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-200">{hotel.name}</h3>
                                            <p className="text-sm text-gray-400">{tripOverview?.location || 'Location'}</p>
                                            <div className="flex items-center mt-1">
                                                <span className="text-yellow-400">{stars}</span>
                                                <span className="text-xs text-gray-400 ml-2">
                                                    {hotel.rating} ({hotel.review_count.toLocaleString()} reviews)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xl font-bold">
                                                {hotel.currency} {hotel.price_per_night}
                                            </span>
                                            <span className="block text-xs text-gray-400">/ night</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default MainContent;