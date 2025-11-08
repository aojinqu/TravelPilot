// components/Header.jsx
import React from 'react';
import { useTravel } from '../context/TravelContext';

const Header = () => {
    const { tripOverview, priceSummary } = useTravel();

    // 默认值（当没有数据时显示）
    const title = tripOverview?.title || "Winter Feasts in Osaka's Food Paradise";
    const dateRange = tripOverview?.date_range || "Dec 6 - 12";
    const totalPrice = priceSummary 
        ? `${priceSummary.currency} ${priceSummary.grand_total}`
        : "HKD 404";

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-gray-900 shadow-md z-10">
            {/* 左侧标题和分享 */}
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-200">{title}</h1>
                <button className="flex items-center text-gray-400 hover:text-white transition-colors duration-200">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684z"></path>
                    </svg>
                    Share
                </button>
            </div>

            {/* 中间筛选 */}
            <div className="flex items-center space-x-3 text-gray-300">
                <div className="relative">
                    <button className="flex items-center px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        {dateRange}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>
                <div className="relative">
                    <button className="flex items-center px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        1
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>
                <div className="relative">
                    <button className="flex items-center px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {tripOverview?.location || "2"}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>
            </div>

            {/* 右侧总价和预订按钮 */}
            <div className="flex items-center space-x-4">
                <div>
                    <span className="block text-sm text-gray-400">Total (per adult)</span>
                    <span className="text-xl font-semibold text-gray-200">{totalPrice}</span>
                </div>
                <button className="flex items-center px-6 py-2 bg-[#8965F2] hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg transition-colors duration-200">
                    To Calendar
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>
        </header>
    );
};

export default Header;



