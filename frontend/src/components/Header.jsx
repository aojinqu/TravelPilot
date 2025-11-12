// components/Header.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useTravel } from '../context/TravelContext';

const Header = () => {
    const { tripOverview, priceSummary, travelInfo} = useTravel();

    // ... 你的默认值和数据提取逻辑 (保持不变) ...
    const title = tripOverview?.title || "Winter Feasts in Osaka's Food Paradise";
    const totalPrice = priceSummary
        ? `${priceSummary.currency} ${priceSummary.grand_total}`
        : "HKD  0";


    return (
        <header className="flex items-center justify-between px-6 py-3 bg-gray-900 shadow-md z-10">
            {/* ... 左侧标题和分享 (保持不变) ... */}
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-200">{title}</h1>
            </div>
            {/* ... 右侧总价和预订按钮 (保持不变) ... */}
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