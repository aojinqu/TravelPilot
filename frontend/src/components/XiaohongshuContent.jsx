// src/components/XiaohongshuContent.jsx
import React, { useState, useEffect } from 'react';
import { useTravel } from '../context/TravelContext';

const XiaohongshuContent = ({ onBack }) => {
    const { travelInfo } = useTravel();
    const [xhsData, setXhsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchXiaohongshuContent();
    }, [travelInfo.destination, travelInfo.vibes]);

    const fetchXiaohongshuContent = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:8000/api/xiaohongshu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    destination: travelInfo.destination || 'Hong Kong',
                    preferences: travelInfo.vibes || []
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch Xiaohongshu content');
            }

            const result = await response.json();
            if (result.success && result.data) {
                setXhsData(result.data);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching Xiaohongshu content:', err);
            setError('Failed to load Xiaohongshu recommendations. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // 根据 preference 类型映射到对应的数据字段
    const getDataForPreference = (preference) => {
        const prefLower = preference.toLowerCase();
        
        // Food 相关的 preference 展示餐厅
        if (prefLower === 'food') {
            return {
                title: 'Restaurants',
                icon: '🍽️',
                items: xhsData?.summary?.top_restaurants || [],
                color: 'orange',
                emptyMessage: 'No restaurants found'
            };
        }
        
        // Adventure, Culture, Nature, History, Shopping, Nightlife 等展示景点
        if (['adventure', 'culture', 'nature', 'history', 'shopping', 'nightlife', 'beach', 'mountain', 'city'].includes(prefLower)) {
            return {
                title: 'Places',
                icon: '📍',
                items: xhsData?.summary?.top_places || [],
                color: 'purple',
                emptyMessage: 'No places found'
            };
        }
        
        // Relaxation, Family, Romance 等展示活动
        if (['relaxation', 'family', 'romance'].includes(prefLower)) {
            return {
                title: 'Activities',
                icon: '🎯',
                items: xhsData?.summary?.top_activities || [],
                color: 'blue',
                emptyMessage: 'No activities found'
            };
        }
        
        // Budget, Luxury 展示所有推荐
        if (['budget', 'luxury'].includes(prefLower)) {
            return {
                title: 'Recommendations',
                icon: '⭐',
                items: [
                    ...(xhsData?.summary?.top_places || []),
                    ...(xhsData?.summary?.top_restaurants || []),
                    ...(xhsData?.summary?.top_activities || [])
                ],
                color: 'yellow',
                emptyMessage: 'No recommendations found'
            };
        }
        
        // 默认展示所有
        return {
            title: 'Recommendations',
            icon: '⭐',
            items: [
                ...(xhsData?.summary?.top_places || []),
                ...(xhsData?.summary?.top_restaurants || []),
                ...(xhsData?.summary?.top_activities || [])
            ],
            color: 'purple',
            emptyMessage: 'No recommendations found'
        };
    };

    // 获取颜色类
    const getColorClasses = (color) => {
        const colorMap = {
            orange: {
                bg: 'bg-orange-600',
                hover: 'hover:bg-orange-700',
                text: 'text-orange-400',
                border: 'border-orange-500',
                badge: 'bg-orange-900/30 text-orange-300'
            },
            purple: {
                bg: 'bg-purple-600',
                hover: 'hover:bg-purple-700',
                text: 'text-purple-400',
                border: 'border-purple-500',
                badge: 'bg-purple-900/30 text-purple-300'
            },
            blue: {
                bg: 'bg-blue-600',
                hover: 'hover:bg-blue-700',
                text: 'text-blue-400',
                border: 'border-blue-500',
                badge: 'bg-blue-900/30 text-blue-300'
            },
            yellow: {
                bg: 'bg-yellow-600',
                hover: 'hover:bg-yellow-700',
                text: 'text-yellow-400',
                border: 'border-yellow-500',
                badge: 'bg-yellow-900/30 text-yellow-300'
            }
        };
        return colorMap[color] || colorMap.purple;
    };

    return (
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg mb-4">
            {/* 顶部标题 */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white">
                    Preference Recommendations
                    {travelInfo.vibes && travelInfo.vibes.length > 0 && (
                        <span className="text-sm text-gray-400 ml-2">
                            ({travelInfo.vibes.join(', ')})
                        </span>
                    )}
                </h2>
                <button
                    onClick={onBack}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            {/* 内容区域 */}
            <div>
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
                        <p className="text-red-200">{error}</p>
                        <button
                            onClick={fetchXiaohongshuContent}
                            className="mt-2 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && xhsData && (
                    <div className="space-y-4">
                        {/* 根据每个 preference 展示对应的内容 */}
                        {travelInfo.vibes && travelInfo.vibes.length > 0 ? (
                            travelInfo.vibes.map((preference, prefIndex) => {
                                const dataConfig = getDataForPreference(preference);
                                const colors = getColorClasses(dataConfig.color);
                                const items = dataConfig.items || [];

                                return (
                                    <div key={prefIndex} className="bg-gray-800 rounded-xl p-4 shadow-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-lg font-bold text-white flex items-center">
                                                <span className="mr-2 text-xl">{dataConfig.icon}</span>
                                                {dataConfig.title} 
                                                <span className="text-xs text-gray-400 ml-2">
                                                    ({items.length} {items.length === 1 ? 'item' : 'items'})
                                                </span>
                                            </h2>
                                            <span className={`px-2 py-0.5 ${colors.badge} rounded-full text-xs font-medium`}>
                                                {preference}
                                            </span>
                                        </div>

                                        {items.length > 0 ? (
                                            <div className="space-y-2">
                                                {items.map((item, index) => {
                                                    const itemName = typeof item === 'string' ? item : item.name;
                                                    const itemPercentage = typeof item === 'object' && item.percentage ? item.percentage : null;
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`flex items-center justify-between bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200 border-l-4 ${colors.border}`}
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="font-semibold text-base text-gray-200 truncate">
                                                                        {itemName}
                                                                    </h3>
                                                                    {itemPercentage !== null && (
                                                                        <span className={`px-2 py-0.5 ${colors.badge} rounded text-xs font-medium whitespace-nowrap`}>
                                                                            {itemPercentage.toFixed(1)}% mentioned
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-400 mt-0.5">
                                                                    Mentioned by users
                                                                </p>
                                                            </div>
                                                            <div className="ml-3 flex-shrink-0">
                                                                <span className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center text-white text-sm`}>
                                                                    {dataConfig.icon}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="text-gray-400 mb-2">
                                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                                                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                </div>
                                                <p className="text-gray-400">{dataConfig.emptyMessage}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            // 如果没有 preferences，展示所有推荐
                            <div className="space-y-4">
                                {/* 餐厅 */}
                                {xhsData.summary?.top_restaurants && xhsData.summary.top_restaurants.length > 0 && (
                                    <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-lg font-bold text-white flex items-center">
                                                <span className="mr-2 text-xl">🍽️</span>
                                                Restaurants
                                                <span className="text-xs text-gray-400 ml-2">
                                                    ({xhsData.summary.top_restaurants.length} {xhsData.summary.top_restaurants.length === 1 ? 'restaurant' : 'restaurants'})
                                                </span>
                                            </h2>
                                        </div>
                                        <div className="space-y-2">
                                            {xhsData.summary.top_restaurants.map((restaurant, index) => {
                                                const restaurantName = typeof restaurant === 'string' ? restaurant : restaurant.name;
                                                const restaurantPercentage = typeof restaurant === 'object' && restaurant.percentage ? restaurant.percentage : null;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200 border-l-4 border-orange-500"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-base text-gray-200 truncate">
                                                                    {restaurantName}
                                                                </h3>
                                                                {restaurantPercentage !== null && (
                                                                    <span className="px-2 py-0.5 bg-orange-900/30 text-orange-300 rounded text-xs font-medium whitespace-nowrap">
                                                                        {restaurantPercentage.toFixed(1)}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                Mentioned by users
                                                            </p>
                                                        </div>
                                                        <div className="ml-3 flex-shrink-0">
                                                            <span className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm">
                                                                🍽️
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* 景点 */}
                                {xhsData.summary?.top_places && xhsData.summary.top_places.length > 0 && (
                                    <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-lg font-bold text-white flex items-center">
                                                <span className="mr-2 text-xl">📍</span>
                                                Places
                                                <span className="text-xs text-gray-400 ml-2">
                                                    ({xhsData.summary.top_places.length} {xhsData.summary.top_places.length === 1 ? 'place' : 'places'})
                                                </span>
                                            </h2>
                                        </div>
                                        <div className="space-y-2">
                                            {xhsData.summary.top_places.map((place, index) => {
                                                const placeName = typeof place === 'string' ? place : place.name;
                                                const placePercentage = typeof place === 'object' && place.percentage ? place.percentage : null;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200 border-l-4 border-purple-500"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-base text-gray-200 truncate">
                                                                    {placeName}
                                                                </h3>
                                                                {placePercentage !== null && (
                                                                    <span className="px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded text-xs font-medium whitespace-nowrap">
                                                                        {placePercentage.toFixed(1)}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                Mentioned by users
                                                            </p>
                                                        </div>
                                                        <div className="ml-3 flex-shrink-0">
                                                            <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm">
                                                                📍
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* 活动 */}
                                {xhsData.summary?.top_activities && xhsData.summary.top_activities.length > 0 && (
                                    <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-lg font-bold text-white flex items-center">
                                                <span className="mr-2 text-xl">🎯</span>
                                                Activities
                                                <span className="text-xs text-gray-400 ml-2">
                                                    ({xhsData.summary.top_activities.length} {xhsData.summary.top_activities.length === 1 ? 'activity' : 'activities'})
                                                </span>
                                            </h2>
                                        </div>
                                        <div className="space-y-2">
                                            {xhsData.summary.top_activities.map((activity, index) => {
                                                const activityName = typeof activity === 'string' ? activity : activity.name;
                                                const activityPercentage = typeof activity === 'object' && activity.percentage ? activity.percentage : null;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200 border-l-4 border-blue-500"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-base text-gray-200 truncate">
                                                                    {activityName}
                                                                </h3>
                                                                {activityPercentage !== null && (
                                                                    <span className="px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded text-xs font-medium whitespace-nowrap">
                                                                        {activityPercentage.toFixed(1)}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                Mentioned by users
                                                            </p>
                                                        </div>
                                                        <div className="ml-3 flex-shrink-0">
                                                            <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                                                                🎯
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* 如果没有数据 */}
                                {(!xhsData.summary?.top_restaurants?.length && 
                                  !xhsData.summary?.top_places?.length && 
                                  !xhsData.summary?.top_activities?.length) && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                                                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Found</h3>
                                        <p className="text-gray-400">
                                            No Xiaohongshu recommendations were found for this destination.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default XiaohongshuContent;
