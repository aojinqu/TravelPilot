import React, { useState } from 'react';
import { useTravel } from '../context/TravelContext';

// 模拟的地点列表。在真实应用中，这可能来自API
const MOCK_LOCATIONS = [
    { name: "Osaka", country: "Japan" },
    { name: "Tokyo", country: "Japan" },
    { name: "Kyoto", country: "Japan" },
    { name: "Sapporo", country: "Japan" },
    { name: "Fukuoka", country: "Japan" },
    { name: "Seoul", country: "South Korea" },
    { name: "Taipei", country: "Taiwan" },
];

const LocationSearch = () => {
    // 使用 travel context
    const { updateTravelInfo, travelInfo } = useTravel();

    // 状态：用于管理搜索输入框的值
    const [query, setQuery] = useState("");

    // 状态：当前选择的位置（从全局状态初始化）
    const [selected, setSelected] = useState(travelInfo.destination || "Osaka");

    // 过滤逻辑：根据 query 过滤地点
    const filteredLocations = MOCK_LOCATIONS.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.country.toLowerCase().includes(query.toLowerCase())
    );

    // 更新全局目的地
    const handleSelect = (locationName) => {
        setSelected(locationName);
        // 更新全局状态
        updateTravelInfo({
            destination: locationName
        });
        console.log(`目的地已更新: ${locationName}`);
    };

    return (
        <div className="p-3">
            <input
                type="text"
                placeholder="Search destination..."
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <ul className="mt-2 max-h-60 overflow-y-auto">
                {filteredLocations.map((location) => (
                    <li
                        key={location.name}
                        onClick={() => handleSelect(location.name)}
                        className={`p-2 rounded-md cursor-pointer ${
                            selected === location.name
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-200 hover:bg-gray-700'
                        }`}
                    >
                        <span className="font-medium">{location.name}</span>
                        <span className="text-sm text-gray-400 ml-2">{location.country}</span>
                    </li>
                ))}
            </ul>

            {/* 显示当前全局状态 */}
            <div className="mt-2 text-xs text-gray-400">
                当前选择: {travelInfo.destination || '未选择'}
            </div>
        </div>
    );
};

export default LocationSearch;