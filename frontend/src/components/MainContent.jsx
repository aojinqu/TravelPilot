// components/MainContent.jsx
import React from 'react';
import { useTravel } from '../context/TravelContext';

const MainContent = () => {
    const { tripOverview, flights, hotels, priceSummary, itinerary } = useTravel();

    // 下载日历功能
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

    return (
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
            {/* 顶部按钮 */}
            <div className="flex justify-end space-x-3 mb-6">
                <button 
                    onClick={handleDownloadCalendar}
                    disabled={!itinerary}
                    className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101m-4.242 0a2 2 0 010 2.828l.707.707"></path></svg>
                    Download Canlendar
                </button>
                <button className="flex items-center px-4 py-2 bg-[#8965F2] text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                    Full Itinerary(Waiting for new page)
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>

            {/* 行程总览卡片 */}
            {tripOverview && (
                <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Trip Overview</h2>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-700">
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
                        {/* Progress dots */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            <span className="w-2 h-2 bg-white rounded-full opacity-75"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></span>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-1">
                        {tripOverview.location} <span className="text-sm text-gray-400">{tripOverview.country}</span>
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">{tripOverview.date_range}</p>
                    <p className="text-gray-300 mb-4">
                        {tripOverview.description}
                    </p>
                    <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                        View Full Plan
                        <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
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
                                <div key={index} className="flex items-center bg-gray-700 p-4 rounded-lg">
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

        </main>
    );
};

export default MainContent;



