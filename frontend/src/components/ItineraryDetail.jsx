// ItineraryDetail.jsx
import React from 'react';

const ItineraryDetail = ({ dailyItinerary, tripOverview, onBack }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* 返回按钮和标题 */}
            <div className="flex items-center mb-6">
                <button 
                    onClick={onBack}
                    className="flex items-center text-purple-400 hover:text-purple-300 mr-4"
                >
                    ← Back to Overview
                </button>
                <h1 className="text-2xl font-bold">Full Itinerary</h1>
            </div>

            {/* 显示每日行程详情 */}
            <div className="space-y-6">
                {dailyItinerary && dailyItinerary.map((item, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <span className="bg-purple-500 text-white px-2 py-1 rounded text-sm mr-2">
                                Day {item.day}
                            </span>
                            <span className="text-gray-400 text-sm">{item.day_summary}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">{item.itinerary.activity}</h3>
                                <p className="text-gray-400 text-sm">{item.itinerary.address}</p>
                            </div>
                            <span className="text-purple-400 text-sm">
                                {item.itinerary.start_time} - {item.itinerary.end_time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItineraryDetail;