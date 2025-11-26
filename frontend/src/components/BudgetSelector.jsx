// src/components/BudgetSelector.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTravel } from '../context/TravelContext';

const CURRENCIES = ['CNY', 'HKD', 'JPY', 'USD', 'SGD'];

// 自定义上拉选择组件
const CurrencySelect = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 px-2 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm flex items-center justify-between"
            >
                <span>{value}</span>
                <svg
                    className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {isOpen && (
                <div className="absolute bottom-full mb-1 w-full bg-gray-700 rounded-md shadow-lg z-20 border border-gray-600 max-h-32 overflow-y-auto">
                    {options.map(option => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                            className={`w-full px-2 py-2 text-center text-sm text-white hover:bg-gray-600 first:rounded-t-md last:rounded-b-md ${
                                value === option ? 'bg-purple-600' : ''
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const BudgetSelector = () => {
    const { travelInfo, updateTravelInfo } = useTravel();

    // 内部状态，用于处理输入
    const [amount, setAmount] = useState(travelInfo.budget || '');
    const [currency, setCurrency] = useState(travelInfo.currency || 'CNY');

    const handleAmountChange = (e) => {
        const value = e.target.value;
        setAmount(value);
        // 实时更新全局状态
        updateTravelInfo({ budget: value, currency: currency });
    };

    const handleCurrencyChange = (newCurrency) => {
        setCurrency(newCurrency);
        // 实时更新全局状态
        updateTravelInfo({ budget: amount, currency: newCurrency });
    };

    return (
        <div className="p-3 w-70">
            <h4 className="text-sm font-medium text-gray-300 mb-2">set budget</h4>
            <div className="grid grid-cols-[1fr,auto] gap-2">
                {/* 金额输入 */}
                <input
                    type="number"
                    placeholder="eg. 5000"
                    value={amount}
                    onChange={handleAmountChange}
                    className="px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {/* 自定义货币选择 - 上拉 */}
                <CurrencySelect
                    value={currency}
                    onChange={handleCurrencyChange}
                    options={CURRENCIES}
                />
            </div>
            <p className="mt-2 text-xs text-gray-400">
                current: {travelInfo.budget ? `${travelInfo.currency} ${travelInfo.budget}` : 'not set'}
            </p>
        </div>
    );
};

export default BudgetSelector;