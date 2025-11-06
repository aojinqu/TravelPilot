// components/MainContent.jsx
import React from 'react';

const MainContent = () => {
    return (
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
            {/* 顶部按钮 */}
            <div className="flex justify-end space-x-3 mb-6">
                <button className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101m-4.242 0a2 2 0 010 2.828l.707.707"></path></svg>
                    Travel Inspired!
                </button>
                <button className="flex items-center px-4 py-2 bg-[#8965F2] text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                    Full Itinerary
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>

            {/* 行程总览卡片 */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Trip Overview</h2>
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                    <img
                        src="https://via.placeholder.com/600x300/8965F2/FFFFFF?text=Osaka+Castle+Cherry+Blossoms" // 占位图
                        alt="Osaka Castle and Cherry Blossoms"
                        className="w-full h-full object-cover"
                    />
                    {/* Progress dots (如果需要) */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        <span className="w-2 h-2 bg-white rounded-full opacity-75"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></span>
                    </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-200 mb-1">Osaka <span className="text-sm text-gray-400">Japan</span></h3>
                <p className="text-sm text-gray-400 mb-3">Feb 6 - 12</p>
                <p className="text-gray-300 mb-4">
                    Dive into thrills at Universal Studios Japan, silver street food and noon at Dotonbori, and most sacred door at Na...
                </p>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                    View Full Plan
                    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>

            {/* 航班卡片 */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Flights <span className="text-sm text-gray-400">SGD 332 <span className="mx-1">/</span> 2 flights</span></h2>
                    <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">Modify <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg></button>
                </div>
                <div className="space-y-4">
                    {/* 示例航班条目 1 */}
                    <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold">Hong Kong</span>
                            <span className="text-xs text-gray-400">Nonstop</span>
                            <div className="flex items-center text-gray-300 text-sm">
                                <span>3h25m</span>
                                <svg className="w-5 h-5 mx-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold">Osaka</span>
                            <div className="text-right">
                                <span className="block text-lg font-semibold">19:20</span>
                                <span className="block text-xs text-gray-400">Feb 6</span>
                            </div>
                            <span className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">CX</span> {/* 航空公司图标占位 */}
                            <div className="text-right">
                                <span className="block text-lg font-semibold">14:55</span>
                                <span className="block text-xs text-gray-400">Feb 6</span>
                            </div>
                        </div>
                    </div>
                    {/* 示例航班条目 2 */}
                    <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold">Osaka</span>
                            <span className="text-xs text-gray-400">Nonstop</span>
                            <div className="flex items-center text-gray-300 text-sm">
                                <span>4h25m</span>
                                <svg className="w-5 h-5 mx-2 text-purple-400 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold">Hong Kong</span>
                            <div className="text-right">
                                <span className="block text-lg font-semibold">13:20</span>
                                <span className="block text-xs text-gray-400">Feb 12</span>
                            </div>
                            <span className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">HK</span> {/* 航空公司图标占位 */}
                            <div className="text-right">
                                <span className="block text-lg font-semibold">09:55</span>
                                <span className="block text-xs text-gray-400">Feb 12</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 酒店卡片 */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Hotels <span className="text-sm text-gray-400">SGD 221 <span className="mx-1">/</span> 6 nights</span></h2>
                    <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">Modify <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg></button>
                </div>
                <div className="space-y-4">
                    {/* 示例酒店条目 */}
                    <div className="flex items-center bg-gray-700 p-4 rounded-lg">
                        <img
                            src="https://via.placeholder.com/80x80/6A5ACD/FFFFFF?text=Hotel" // 占位图
                            alt="Hotel room"
                            className="w-20 h-20 object-cover rounded-lg mr-4"
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-200">The Royal Park Hotel Iconic Osaka Midosuji</h3>
                            <p className="text-sm text-gray-400">Osaka, Japan</p>
                            <div className="flex items-center mt-1">
                                <span className="text-yellow-400">★★★★★</span> {/* 星级评分 */}
                                <span className="text-xs text-gray-400 ml-2">4.7 (1,234 reviews)</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-xl font-bold">SGD 221</span>
                            <span className="block text-xs text-gray-400">/ night</span>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
};

export default MainContent;