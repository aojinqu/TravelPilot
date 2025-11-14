import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTravel } from '../context/TravelContext';

const HistoryPanel = ({ onSelectPlan, onClose }) => {
    const { user, isAuthenticated } = useAuth();
    const { setItinerary, updateTravelInfo } = useTravel();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            loadPlans();
        }
    }, [isAuthenticated, user]);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/api/plans', {
                headers: {
                    'Authorization': `Bearer ${user.token || user.user_id}`
                }
            });

            if (!response.ok) {
                throw new Error('获取历史记录失败');
            }

            const result = await response.json();
            if (result.success) {
                setPlans(result.plans || []);
            }
        } catch (err) {
            console.error('加载历史记录失败:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (plan) => {
        try {
            // 加载完整的计划数据
            const response = await fetch(`http://localhost:8000/api/plans/${plan.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token || user.user_id}`
                }
            });

            if (!response.ok) {
                throw new Error('获取计划详情失败');
            }

            const result = await response.json();
            if (result.success && result.plan) {
                // 解析plan_data（可能是JSON字符串或对象）
                let planData = result.plan.plan_data;
                if (typeof planData === 'string') {
                    try {
                        planData = JSON.parse(planData);
                    } catch (e) {
                        console.error('解析plan_data失败:', e);
                        planData = result.plan;
                    }
                }
                
                // 如果没有plan_data，使用plan本身
                if (!planData || Object.keys(planData).length === 0) {
                    planData = result.plan;
                }
                
                // 确保数据格式正确，转换为setItinerary期望的格式
                const formattedData = {
                    trip_overview: planData.trip_overview || planData.tripOverview || null,
                    flights: planData.flights || [],
                    hotels: planData.hotels || [],
                    price_summary: planData.price_summary || planData.priceSummary || null,
                    daily_itinerary: planData.daily_itinerary || planData.dailyItinerary || []
                };
                
                console.log('加载的计划数据:', formattedData);
                console.log('原始planData:', planData);
                
                // 更新行程数据到TravelContext（这是关键，MainContent从这里读取数据）
                setItinerary(formattedData);
                
                // 同时更新travelInfo（如果plan中有这些信息）
                if (plan.destination || plan.departure || plan.num_days) {
                    updateTravelInfo({
                        destination: plan.destination || planData.destination,
                        departure: plan.departure || planData.departure,
                        numDays: plan.num_days || planData.num_days,
                        numPeople: plan.num_people || planData.num_people,
                        budget: plan.budget || planData.budget,
                        startDate: plan.start_date || planData.start_date,
                        endDate: plan.end_date || planData.end_date
                    });
                }
                
                // 调用回调函数，传递格式化后的数据（用于App.js中的tripData）
                if (onSelectPlan) {
                    onSelectPlan(formattedData);
                }
            }
        } catch (err) {
            console.error('加载计划详情失败:', err);
            alert('加载计划失败：' + err.message);
        }
    };

    const handleDeletePlan = async (planId, e) => {
        e.stopPropagation(); // 阻止触发选择事件
        
        if (!window.confirm('确定要删除这条旅游计划吗？')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/plans/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token || user.user_id}`
                }
            });

            if (!response.ok) {
                throw new Error('删除失败');
            }

            // 重新加载列表
            loadPlans();
        } catch (err) {
            console.error('删除计划失败:', err);
            alert('删除失败：' + err.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="w-96 min-w-[384px] bg-gradient-to-b from-[#2A1643] to-[#3A1E5C] flex flex-col border-r border-gray-700 p-4">
                <div className="text-center text-gray-400 mt-8">
                    <p className="text-sm mb-4">请先登录以查看历史记录</p>
                    <button
                        onClick={() => {
                            window.location.href = 'http://localhost:8000/api/auth/google';
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                        登录
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-96 min-w-[384px] bg-gradient-to-b from-[#2A1643] to-[#3A1E5C] flex flex-col border-r border-gray-700">
            {/* 标题栏 */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">历史记录</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="text-center text-gray-400 mt-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <p className="mt-2">加载中...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 mt-8">
                        <p>{error}</p>
                        <button
                            onClick={loadPlans}
                            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                        >
                            重试
                        </button>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                        <p className="text-sm">暂无历史记录</p>
                        <p className="text-xs mt-2 text-gray-500">生成计划后可以保存到历史记录</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => handleSelectPlan(plan)}
                                className="bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-800 transition-colors border border-gray-700"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-white font-semibold mb-1">
                                            {plan.title || plan.destination || '未命名计划'}
                                        </h3>
                                        <div className="text-sm text-gray-400 space-y-1">
                                            {plan.destination && (
                                                <p>目的地: {plan.destination}</p>
                                            )}
                                            {plan.departure && (
                                                <p>出发地: {plan.departure}</p>
                                            )}
                                            {plan.num_days && (
                                                <p>{plan.num_days} 天 · {plan.num_people || 1} 人</p>
                                            )}
                                            {plan.created_at && (
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(plan.created_at)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeletePlan(plan.id, e)}
                                        className="ml-2 text-red-400 hover:text-red-300 transition-colors p-1"
                                        title="删除"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPanel;

