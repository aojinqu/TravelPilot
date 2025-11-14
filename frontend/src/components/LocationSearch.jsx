// src/components/LocationSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTravel } from '../context/TravelContext';

const LocationSearch = ({ locationType = "destination" }) => {
    const { updateTravelInfo, travelInfo } = useTravel();
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const debounceRef = useRef(null);

    const currentLocation = travelInfo[locationType];

    // 防抖搜索
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            await searchLocations(query);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const searchLocations = async (searchQuery) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=8&accept-language=en`
            );

            if (!response.ok) {
                throw new Error('搜索失败');
            }

            const data = await response.json();

            const formattedSuggestions = data.map(item => ({
                name: item.display_name,
                lat: item.lat,
                lon: item.lon,
                type: item.type,
                importance: item.importance
            }));

            setSuggestions(formattedSuggestions);
        } catch (err) {
            setError('搜索失败，请稍后重试');
            console.error('Location search error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (location) => {
        // 提取城市名（简化处理）
        const cityName = extractCityName(location.name);
        updateTravelInfo({
            [locationType]: cityName,
            [`${locationType}Coords`]: {
                lat: location.lat,
                lon: location.lon
            }
        });
        setQuery("");
        setSuggestions([]);
        console.log(`${locationType} 已更新: ${cityName}`);
    };

    // 从完整地址中提取城市名
    const extractCityName = (displayName) => {
        // 简单的城市名提取逻辑，可以根据需要调整
        const parts = displayName.split(',');
        if (parts.length > 1) {
            return parts[0].trim(); // 通常第一个部分是城市/地点名
        }
        return displayName;
    };

    // 格式化显示名称（缩短过长的地址）
    const formatDisplayName = (name) => {
        const maxLength = 40;
        if (name.length > maxLength) {
            return name.substring(0, maxLength) + '...';
        }
        return name;
    };

    return (
        <div className="p-3 w-64">
            <div className="relative">
                <input
                    type="text"
                    placeholder={`搜索${locationType === 'departure' ? '出发地' : '目的地'}...`}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                    </div>
                )}
            </div>

            {/* 搜索结果 */}
            {(suggestions.length > 0 || error) && (
                <ul className="mt-2 max-h-60 overflow-y-auto bg-gray-800 rounded-md border border-gray-700">
                    {error && (
                        <li className="p-2 text-red-400 text-sm">
                            ⚠️ {error}
                        </li>
                    )}
                    {suggestions.map((location, index) => (
                        <li
                            onClick={() => handleSelect(location)}
                            className="p-2 cursor-pointer text-gray-200 hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                        >
                            <div className="font-medium text-sm">
                                {formatDisplayName(location.name)}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* 搜索提示 */}
            {query.length > 0 && query.length < 2 && (
                <div className="mt-2 text-xs text-gray-500">
                    Please enter at least 2 characters to search.
                </div>
            )}

            <div className="mt-2 text-xs text-gray-400">
                Current{locationType === 'departure' ? 'departure' : 'destination'}: {currentLocation || 'not select'}
            </div>
        </div>
    );
};

export default LocationSearch;