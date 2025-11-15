// src/components/VibeSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTravel } from '../context/TravelContext';

const VIBE_OPTIONS = [
    "Food", "Adventure", "Culture", "Shopping", "Relaxation",
    "Nature", "History", "Nightlife", "Family", "Romance",
    "Budget", "Luxury", "Beach", "Mountain", "City"
];

const VibeSelector = () => {
    const { travelInfo, updateTravelInfo } = useTravel();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const selectedVibes = travelInfo.vibes || [];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = VIBE_OPTIONS.filter(vibe =>
        vibe.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedVibes.includes(vibe)
    );

    const handleAddVibe = (vibe) => {
        if (selectedVibes.length >= 3) {
            return;
        }
        const newVibes = [...selectedVibes, vibe];
        updateTravelInfo({ vibes: newVibes });
        console.log(newVibes, travelInfo.vibes);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleRemoveVibe = (vibeToRemove) => {
        const newVibes = selectedVibes.filter(vibe => vibe !== vibeToRemove);
        updateTravelInfo({ vibes: newVibes });
    };

    // 简化的切换逻辑
    const toggleDropdown = () => {
        if (selectedVibes.length >= 3) return;
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchTerm('');
            // 微延迟确保状态更新后再聚焦
            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        }
    };

    // 只在输入框内点击时切换，避免与外部容器冲突
    const handleInputClick = (e) => {
        e.stopPropagation();
        if (selectedVibes.length >= 3) return;
        if (!isOpen) {
            setIsOpen(true);
            setSearchTerm('');
            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        }
    };

    // 输入框获得焦点时的处理
    const handleInputFocus = () => {
        if (selectedVibes.length >= 3) return;
        if (!isOpen) {
            setIsOpen(true);
        }
    };

    // 输入变化处理
    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        if (!isOpen && selectedVibes.length < 3) {
            setIsOpen(true);
        }
    };

    const canAddMore = selectedVibes.length < 3;

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="space-y-2">
                {/* 输入框 */}
                <div className="relative">
                    {/* 移除外部点击容器，直接在输入框上处理 */}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={canAddMore ? "Add travel preferences..." : "select up to 3 preferences."}
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onClick={handleInputClick}
                        disabled={!canAddMore}
                        className={`w-full px-3 py-1.5 bg-gray-700 text-white text-xs rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            !canAddMore ? 'opacity-50 cursor-not-allowed' : 'cursor-text'
                        }`}
                    />

                    {/* 右侧指示器 */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        {canAddMore ? (
                            <>
                                <span className="text-xs text-gray-400">
                                    {selectedVibes.length}/3
                                </span>
                                <button
                                    type="button"
                                    onClick={toggleDropdown}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg
                                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-xs text-gray-400 mr-1">
                                    {selectedVibes.length}/3
                                </span>
                                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                            </>
                        )}
                    </div>
                </div>

                {/* 上拉菜单 */}
                {isOpen && canAddMore && (
                    <div className="absolute bottom-full mb-1 w-full bg-gray-800 rounded-md shadow-lg z-20 border border-gray-600 max-h-32 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(vibe => (
                                <button
                                    key={vibe}
                                    onClick={() => handleAddVibe(vibe)}
                                    className="w-full px-3 py-2 text-left text-xs text-white hover:bg-gray-700 first:rounded-t-md last:rounded-b-md"
                                >
                                    {vibe}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-xs text-gray-400 text-center">
                                {searchTerm ? "No matching options found" : "No more options"}
                            </div>
                        )}
                    </div>
                )}

                {/* 已选择的 Vibe 标签 */}
                {selectedVibes.length > 0 && (
                    <div className="flex gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        {selectedVibes.map(vibe => (
                            <div
                                key={vibe}
                                className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs rounded-full whitespace-nowrap flex-shrink-0"
                            >
                                <span>{vibe}</span>
                                <button
                                    onClick={() => handleRemoveVibe(vibe)}
                                    className="w-3 h-3 rounded-full bg-white text-purple-600 flex items-center justify-center text-[10px] font-bold hover:bg-gray-200 transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* 数量限制提示 */}
                {!canAddMore && (
                    <p className="text-xs text-yellow-400 text-center">
                        Maximum number of selections reached (3)
                    </p>
                )}
            </div>
        </div>
    );
};

export default VibeSelector;