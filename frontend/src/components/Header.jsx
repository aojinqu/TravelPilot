// components/Header.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useTravel } from '../context/TravelContext';

// 导入我们刚创建的三个新组件
import DateRangePicker from './DateRangePicker';
import PassengerSelector from './PassengerSelector';
import LocationSearch from './LocationSearch';

// ... DropdownButton 辅助组件的代码 ...
// (保持你之前的 DropdownButton 辅助组件代码不变)
const DropdownButton = ({ triggerContent, triggerIcon, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200"
            >
                {triggerIcon}
                {triggerContent}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-auto bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-700">
                    {children}
                </div>
            )}
        </div>
    );
};


const Header = () => {
    const { tripOverview, priceSummary, travelInfo} = useTravel();

    // ... 你的默认值和数据提取逻辑 (保持不变) ...
    const title = tripOverview?.title || "Winter Feasts in Osaka's Food Paradise";
    const location = travelInfo?.destination || "Osaka";
    const dateRange = travelInfo?.dateRange || "Feb 6 - Feb 12";
    const totalPrice = priceSummary
        ? `${priceSummary.currency} ${priceSummary.grand_total}`
        : "HKD 404";
    const numPeople = travelInfo?.numPeople || "1";

    // ... 你的图标变量 (保持不变) ...
    const dateIcon = <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
    const peopleIcon = <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
    const locationIcon = (
        <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
            ></path>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
        </svg>
    );


    return (
        <header className="flex items-center justify-between px-6 py-3 bg-gray-900 shadow-md z-10">
            {/* ... 左侧标题和分享 (保持不变) ... */}
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-200">{title}</h1>
            </div>

            {/*/!* 中间筛选：已更新 *!/*/}
            {/*<div className="flex items-center space-x-3 text-gray-300">*/}
            {/*    /!* 日期选择 *!/*/}
            {/*    <DropdownButton triggerContent={dateRange} triggerIcon={dateIcon}>*/}
            {/*        /!* 使用新组件! *!/*/}
            {/*        <DateRangePicker />*/}
            {/*    </DropdownButton>*/}

            {/*    /!* 人数选择 *!/*/}
            {/*    <DropdownButton triggerContent={numPeople} triggerIcon={peopleIcon}>*/}
            {/*        /!* 使用新组件! *!/*/}
            {/*        <PassengerSelector />*/}
            {/*    </DropdownButton>*/}

            {/*    /!* 地点选择 *!/*/}
            {/*    <DropdownButton triggerContent={location} triggerIcon={locationIcon}>*/}
            {/*        <LocationSearch />*/}
            {/*    </DropdownButton>*/}
            {/*</div>*/}

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