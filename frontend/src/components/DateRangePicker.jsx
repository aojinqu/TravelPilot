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
    const [errorMessage, setErrorMessage] = useState('');

    // 状态：管理当前显示的月份
    const [currentDate, setCurrentDate] = useState(() => {
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
            console.log(`Date range updated: ${startDate.toDateString()} - ${endDate.toDateString()} (${numDays} days)`);
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

    // 4. 【日期点击】处理 - 添加3天限制
    const handleDayClick = (day) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setErrorMessage(''); // 清空错误信息

        if (!startDate || (startDate && endDate)) {
            // 开始新的选择 (或重置)
            setStartDate(clickedDate);
            setEndDate(null);
        } else if (!endDate) {
            // 检查是否超过3天限制
            const daysDifference = getDaysDifference(startDate, clickedDate);
            if (daysDifference > 3) {
                setErrorMessage('Trip duration cannot exceed 3 days');
                return;
            }
            if (clickedDate >= startDate) {
                // 设置结束日期
                setEndDate(clickedDate);
            } else {
                // 如果选择的日期早于开始日期，则重置
                setStartDate(clickedDate);
                setEndDate(null);
            }
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

    // 6. 【UI ClassName 函数】- 添加禁用状态
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
        let classes = "w-9 h-9 flex items-center justify-center rounded-full";

        // 检查日期是否可选（不超过3天限制）
        const isSelectable = () => {
            if (!startDate || endDate) return true;
            const daysDifference = getDaysDifference(startDate, date);
            return daysDifference <= 3;
        };

        const selectable = isSelectable();

        if (!selectable) {
            classes += " text-gray-500 cursor-not-allowed opacity-50";
        } else if (isSameDay(date, startDate) || isSameDay(date, endDate)) {
            classes += " bg-purple-600 text-white cursor-pointer";
        } else if (isBetween(date, startDate, endDate)) {
            classes += " text-white cursor-pointer";
        } else {
            classes += " text-gray-200 hover:bg-gray-700 cursor-pointer";
        }
        return classes;
    };

    // 检查日期是否可点击
    const isDayClickable = (day) => {
        const date = new Date(year, month, day);
        if (!startDate || endDate) return true;
        const daysDifference = getDaysDifference(startDate, date);
        return daysDifference <= 3;
    };

    return (
        <div className="p-4 w-72">
            {/* 显示当前全局状态和错误信息 */}
            <div className="mb-3 space-y-1">
                {travelInfo.numDays ? (
                    <div className="text-xs text-gray-400">
                        itinerary: {travelInfo.numDays} days
                    </div>
                ) : (
                    <div className="text-xs text-gray-400">Please select a date range</div>
                )}
                {errorMessage && (
                    <div className="text-xs text-red-400 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                        {errorMessage}
                    </div>
                )}
                <div className="text-xs text-gray-500">
                    You can choose a trip of up to 3 days.
                </div>
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
                {dayCells.map(day => {
                    const clickable = isDayClickable(day);
                    return (
                        <div key={day} className={getCellClassName(day)}>
                            <div
                                onClick={clickable ? () => handleDayClick(day) : undefined}
                                className={getDayClassName(day)}
                            >
                                {day}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DateRangePicker;