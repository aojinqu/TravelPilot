import React from 'react';
import { useTravel } from '../context/TravelContext';

// 这是一个内部辅助组件，用于避免重复代码
const CounterRow = ({ title, description, count, onDecrement, onIncrement }) => {
    return (
        <div className="flex justify-between items-center p-2">
            <div>
                <div className="text-white font-medium">{title}</div>
                <div className="text-sm text-gray-400">{description}</div>
            </div>
            <div className="flex items-center space-x-3">
                <button
                    onClick={onDecrement}
                    disabled={count <= 0}
                    className="w-7 h-7 rounded-full bg-gray-700 text-white text-lg flex items-center justify-center leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    -
                </button>
                <span className="text-white w-4 text-center">{count}</span>
                <button
                    onClick={onIncrement}
                    className="w-7 h-7 rounded-full bg-gray-700 text-white text-lg flex items-center justify-center leading-none"
                >
                    +
                </button>
            </div>
        </div>
    );
};

const PassengerSelector = () => {
    const { updateTravelInfo, travelInfo } = useTravel();

    // 直接从全局状态获取乘客信息，避免本地状态重置
    const passengerDetails = travelInfo.passengerDetails || {
        adults: 0,
        children: 0,
        infants: 0,
        total: 0
    };

    const { adults = 0, children = 0, infants = 0, total = 0 } = passengerDetails;

    // 更新全局状态的方法
    const updatePassengerCount = (newAdults, newChildren, newInfants) => {
        const newTotal = newAdults + newChildren + newInfants;

        updateTravelInfo({
            numPeople: newTotal,
            passengerDetails: {
                adults: newAdults,
                children: newChildren,
                infants: newInfants,
                total: newTotal
            }
        });
    };

    const handleAdultsChange = (newCount) => {
        updatePassengerCount(newCount, children, infants);
    };

    const handleChildrenChange = (newCount) => {
        updatePassengerCount(adults, newCount, infants);
    };

    const handleInfantsChange = (newCount) => {
        updatePassengerCount(adults, children, newCount);
    };

    return (
        <div className="p-4 space-y-4">
            {/* 显示当前全局状态 */}
            <div className="text-sm text-gray-400">
                当前设置: {total} 人
            </div>

            {/* 乘客选择器 */}
            <div className="space-y-2">
                <CounterRow
                    title="Adults"
                    description="Ages 13 or above"
                    count={adults}
                    onDecrement={() => handleAdultsChange(Math.max(0, adults - 1))}
                    onIncrement={() => handleAdultsChange(adults + 1)}
                />
                <CounterRow
                    title="Children"
                    description="Ages 2-12"
                    count={children}
                    onDecrement={() => handleChildrenChange(Math.max(0, children - 1))}
                    onIncrement={() => handleChildrenChange(children + 1)}
                />
                <CounterRow
                    title="Infants"
                    description="Under 2"
                    count={infants}
                    onDecrement={() => handleInfantsChange(Math.max(0, infants - 1))}
                    onIncrement={() => handleInfantsChange(infants + 1)}
                />
            </div>

            {/* 总计 */}
            <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-white font-medium">总计</span>
                    <span className="text-white font-bold">{total} 人</span>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                    乘客数量已自动保存
                </p>
            </div>
        </div>
    );
};

export default PassengerSelector;