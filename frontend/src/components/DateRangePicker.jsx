import React, { useState, useEffect } from 'react';
import { useTravel } from '../context/TravelContext';

// --- 辅助函数 (Helpers) ---
/** 检查两个日期是否是同一天 (忽略时间) */
const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.toDateString() === d2.toDateString();
};

/** 检查 date 是否在 start 和 end 之间 (不包括 start/end) */
const isBetween = (date, start, end) => {
    if (!date || !start || !end) return false;
    const [early, late] = start < end ? [start, end] : [end, start];
    return date > early && date < late;
};

/** 计算两个日期之间的天数差 */
const getDaysDifference = (start, end) => {
    if (!start || !end) return 0;
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

// --- 主组件 ---
const DateRangePicker = () => {
    // 使用 travel context
    const { updateTravelInfo, travelInfo } = useTravel();

    // 从全局状态初始化日期，如果没有则使用默认值
    const getInitialStartDate = () => {
        if (travelInfo.startDate) return new Date(travelInfo.startDate);
        return new Date(2026, 1, 6); // 默认值
    };

    const getInitialEndDate = () => {
        if (travelInfo.endDate) return new Date(travelInfo.endDate);
        return new Date(2026, 1, 12); // 默认值
    };

    // 1. 【状态】使用完整的 Date 对象
    const [startDate, setStartDate] = useState(getInitialStartDate);
    const [endDate, setEndDate] = useState(getInitialEndDate);

    // 状态：管理当前显示的月份 - 修复这里！
    // 使用用户选择的日期或者默认日期，而不是硬编码的2026年2月1日
    const [currentDate, setCurrentDate] = useState(() => {
        // 优先使用用户选择的开始日期，否则使用默认的开始日期
        const userStartDate = getInitialStartDate();
        return new Date(userStartDate.getFullYear(), userStartDate.getMonth(), 1);
    });

    // 2. 更新全局日期信息
    const updateGlobalDateInfo = () => {
        if (startDate && endDate) {
            const numDays = getDaysDifference(startDate, endDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            const formatDate = (date) => {
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            };
            updateTravelInfo({
                startDate: startDate.toDateString(),
                endDate: endDate.toDateString(),
                dateRange: `${formatDate(start)} - ${formatDate(end)}`,
                numDays: numDays
            });
            console.log(`日期范围已更新: ${startDate.toDateString()} - ${endDate.toDateString()} (${numDays}天)`);
        }
    };

    // 实时同步到全局状态
    useEffect(() => {
        updateGlobalDateInfo();
    }, [startDate, endDate]);

    // 3. 【月份切换】处理函数
    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // 4. 【日期点击】处理
    const handleDayClick = (day) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

        if (!startDate || (startDate && endDate)) {
            // 开始新的选择 (或重置)
            setStartDate(clickedDate);
            setEndDate(null);
        } else if (!endDate && clickedDate >= startDate) {
            // 设置结束日期
            setEndDate(clickedDate);
        } else {
            // 如果选择的日期早于开始日期，则重置
            setStartDate(clickedDate);
            setEndDate(null);
        }
    };

    // 5. 【动态网格逻辑】
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const startingDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const emptyCells = Array.from({ length: startingDayOfWeek }, (_, i) => (
        <div key={`empty-${i}`} />
    ));

    const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // 6. 【UI ClassName 函数】
    const getCellClassName = (day) => {
        const date = new Date(year, month, day);
        let classes = "w-9 h-9 flex items-center justify-center relative";

        if (!startDate || !endDate) return classes;

        if (isSameDay(date, startDate) && startDate < endDate) {
            classes += " bg-purple-900 rounded-l-full";
        } else if (isSameDay(date, endDate) && startDate < endDate) {
            classes += " bg-purple-900 rounded-r-full";
        } else if (isBetween(date, startDate, endDate)) {
            classes += " bg-purple-900";
        }
        return classes;
    };

    const getDayClassName = (day) => {
        const date = new Date(year, month, day);
        let classes = "w-9 h-9 flex items-center justify-center rounded-full cursor-pointer";

        if (isSameDay(date, startDate) || isSameDay(date, endDate)) {
            classes += " bg-purple-600 text-white";
        } else if (isBetween(date, startDate, endDate)) {
            classes += " text-white";
        } else {
            classes += " text-gray-200 hover:bg-gray-700";
        }
        return classes;
    };

    return (
        <div className="p-4 w-72">
            {/* 显示当前全局状态 */}
            <div className="mb-3 text-xs text-gray-400">
                {travelInfo.numDays ? (
                    <span>行程: {travelInfo.numDays} 天</span>
                ) : (
                    <span>请选择日期范围</span>
                )}
            </div>

            <div className="flex justify-between items-center mb-3">
                <button
                    onClick={handlePrevMonth}
                    className="text-gray-400 hover:text-white p-1 rounded-full"
                >
                    &lt;
                </button>
                <div className="font-semibold text-white">{monthName}</div>
                <button
                    onClick={handleNextMonth}
                    className="text-gray-400 hover:text-white p-1 rounded-full"
                >
                    &gt;
                </button>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
                {daysOfWeek.map(day => <span key={day}>{day}</span>)}
            </div>

            {/* 日期格子 */}
            <div className="grid grid-cols-7 text-center text-sm">
                {emptyCells}
                {dayCells.map(day => (
                    <div key={day} className={getCellClassName(day)}>
                        <div
                            onClick={() => handleDayClick(day)}
                            className={getDayClassName(day)}
                        >
                            {day}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DateRangePicker;