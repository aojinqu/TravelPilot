// src/components/AddInspiration.jsx
import React, {useState, useEffect} from 'react';
import {useTravel} from '../context/TravelContext';

// 视频预览模态框组件
const VideoPreviewModal = ({post, onClose, onAddToTrip}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [tiktokError, setTiktokError] = useState(false);

    const handleAddToTrip = () => {
        onAddToTrip(post.id);
        onClose();
    };

    // 检查是否为 TikTok 视频
    const isTikTokVideo = post.platform === 'tiktok';

    // 检查是否为 YouTube 视频
    const isYouTubeVideo = post.platform === 'youtube' && post.video_url.includes('youtube.com');

    // TikTok 嵌入加载失败时的处理
    const handleTikTokError = () => {
        setTiktokError(true);
    };

    const renderVideoPlayer = () => {
        if (isYouTubeVideo) {
            return isPlaying ? (
                <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(post.video_url)}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            ) : (
                <div className="relative w-full h-full">
                    <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={() => setIsPlaying(true)}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-30 transition-all"
                    >
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"></path>
                            </svg>
                        </div>
                    </button>
                </div>
            );
        } else if (isTikTokVideo) {
            // TikTok 视频处理
            if (tiktokError) {
                // 如果嵌入失败，显示缩略图和直接链接
                return (
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                        <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-4/5 object-cover"
                        />
                        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 p-4 rounded-lg">
                            <p className="text-white text-sm mb-2">无法嵌入 TikTok 视频</p>
                            <button
                                onClick={() => window.open(post.video_url, '_blank')}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
                            >
                                在 TikTok 上观看
                            </button>
                        </div>
                    </div>
                );
            }

            // 尝试使用 TikTok 嵌入
            const tiktokEmbedUrl = getTikTokEmbedUrl(post.video_url);
            if (tiktokEmbedUrl) {
                return (
                    <div className="w-full flex items-center justify-center bg-black h-full">
                        <div className="w-full max-w-[325px] h-full">
                            <iframe
                                src={tiktokEmbedUrl}
                                className="w-full h-full"
                                style={{
                                    border: 'none',
                                    borderRadius: '8px'
                                }}
                                onError={handleTikTokError}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                );
            } else {
                // 如果无法生成嵌入URL，显示错误
                return (
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                        <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-4/5 object-cover"
                        />
                        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 p-4 rounded-lg">
                            <p className="text-white text-sm mb-2">不支持的 TikTok 链接格式</p>
                            <button
                                onClick={() => window.open(post.video_url, '_blank')}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
                            >
                                在 TikTok 上观看
                            </button>
                        </div>
                    </div>
                );
            }
        } else {
            // 其他平台显示图片，不显示时长
            return (
                <div className="bg-gray-700 rounded-lg overflow-hidden h-full flex items-center justify-center">
                    <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full max-h-96 object-cover"
                    />
                </div>
            );
        }
    };

    const showDuration = isYouTubeVideo || isTikTokVideo;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className={`bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
                isTikTokVideo ? 'max-w-md' : ''
            }`}>
                {/* 头部 */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold">{post.title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* 内容区域 */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {/* 视频/图片预览 */}
                    <div className="mb-6">
                        <div className={`relative ${
                            isTikTokVideo
                                ? 'h-[600px] flex items-center justify-center'
                                : 'aspect-video bg-black rounded-lg overflow-hidden'
                        }`}>
                            {renderVideoPlayer()}
                        </div>
                    </div>

                    {/* 帖子信息 */}
                    <div className={`space-y-4 ${isTikTokVideo ? 'px-2' : ''}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                                <p className="text-gray-300">{post.description}</p>
                            </div>
                            <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm capitalize ml-4 flex-shrink-0">
                                {post.platform}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                    </svg>
                                    {post.creator}
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                                    </svg>
                                    {post.likes}
                                </span>
                                {/* 只在 YouTube 和 TikTok 显示时长 */}
                                {showDuration && post.duration && (
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        {post.duration}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 bg-purple-900 text-purple-200 rounded-full text-sm">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex space-x-3 pt-4 border-t border-gray-700">
                            <button
                                onClick={handleAddToTrip}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add to My Trip
                            </button>
                            <button
                                onClick={() => window.open(post.video_url, '_blank')}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                                View Original
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 辅助函数：从 YouTube URL 提取视频 ID
const getYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
};

// 辅助函数：生成 TikTok 嵌入 URL
const getTikTokEmbedUrl = (url) => {
    try {
        // 现在后端返回的 TikTok 链接已经是标准格式
        const videoMatch = url.match(/tiktok\.com\/@([^/]+)\/video\/(\d+)/);
        if (videoMatch) {
            const videoId = videoMatch[2];
            return `https://www.tiktok.com/embed/v2/${videoId}`;
        }
        return null;
    } catch (error) {
        console.error('生成 TikTok 嵌入URL时出错:', error);
        return null;
    }
};

const AddInspiration = ({onBack}) => {
    const {travelInfo,updateTravelInfo} = useTravel();
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [activeTab, setActiveTab] = useState('discover');
    const [socialMediaPosts, setSocialMediaPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [previewPost, setPreviewPost] = useState(null);

    // 分类选项
    const categories = [
        'All Categories',
        'Food & Dining',
        'Attractions',
        'Accommodation',
        'Transportation',
        'Local Experiences',
        'Nightlife',
        'Shopping'
    ];

    useEffect(() => {
        fetchSocialMediaContent();
    }, [travelInfo.destination]);

    const fetchSocialMediaContent = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:8000/api/social-media-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    destination: travelInfo.destination || 'Osaka',
                    limit: 12,
                    tags: getCategoryTags(selectedCategory)
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch social media content');
            }

            const data = await response.json();
            setSocialMediaPosts(data.posts || []);
        } catch (err) {
            console.error('Error fetching social media content:', err);
            setError('Failed to load travel inspiration. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryTags = (category) => {
        const tagMap = {
            'All Categories': [],
            'Food & Dining': ['food', 'restaurant', 'streetfood'],
            'Attractions': ['attraction', 'landmark', 'sightseeing'],
            'Accommodation': ['hotel', 'hostel', 'airbnb'],
            'Transportation': ['transport', 'train', 'bus'],
            'Local Experiences': ['local', 'culture', 'experience'],
            'Nightlife': ['nightlife', 'bar', 'club'],
            'Shopping': ['shopping', 'market', 'mall']
        };
        return tagMap[category] || [];
    };

    const handleCategoryChange = async (category) => {
        setSelectedCategory(category);
        setLoading(true); // 添加加载状态
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/social-media-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    destination: travelInfo.destination || 'Osaka',
                    limit: 12,
                    tags: getCategoryTags(category)
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setSocialMediaPosts(data.posts || []);
            } else {
                throw new Error('Failed to fetch category content');
            }
        } catch (err) {
            console.error('Error fetching category content:', err);
            setError('Failed to load category content. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchSocialMediaContent();
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/api/social-media-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    destination: searchQuery,
                    limit: 12,
                    tags: [searchQuery.toLowerCase()]
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setSocialMediaPosts(data.posts || []);
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleVideoSelection = (videoId, event) => {
        // 阻止事件冒泡，确保不会触发卡片点击
        event.stopPropagation();
        setSelectedVideos(prev =>
            prev.includes(videoId)
                ? prev.filter(id => id !== videoId)
                : [...prev, videoId]
        );
    };

    const handlePostClick = (post) => {
        setPreviewPost(post);
    };

    const handleAddToTripFromPreview = (postId) => {
        setSelectedVideos(prev =>
            prev.includes(postId) ? prev : [...prev, postId]
        );
    };

    const addToItinerary = () => {
        const selectedPosts = socialMediaPosts.filter(post =>
            selectedVideos.includes(post.id)
        );
        updateTravelInfo({media_contents: selectedPosts});
        console.log('Adding to itinerary:', selectedPosts, travelInfo.media_contents);
        alert(`Added ${selectedPosts.length} inspirations to your trip!`);
        setSelectedVideos([]);
    };

    const filteredPosts = socialMediaPosts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="h-full bg-gray-800 shadow-xl flex flex-col">
            {/* 视频预览模态框 */}
            {previewPost && (
                <VideoPreviewModal
                    post={previewPost}
                    onClose={() => setPreviewPost(null)}
                    onAddToTrip={handleAddToTripFromPreview}
                />
            )}

            {/* 顶部标题和关闭按钮 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                    <h2 className="text-xl font-bold text-white">Travel Inspiration</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Discover social media content for {travelInfo.destination || 'your destination'}
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            {/* 标签页 */}
            <div className="flex border-b border-gray-700">
                <button
                    className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                        activeTab === 'discover'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('discover')}
                >
                    Discover
                </button>
                <button
                    className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                        activeTab === 'selected'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('selected')}
                >
                    Selected ({selectedVideos.length})
                </button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'discover' ? (
                    <>
                        {/* 搜索和筛选 */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder={`Search content for ${travelInfo.destination || 'your destination'}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </button>
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                disabled={loading} // 在加载时禁用选择器
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        {/* 加载状态 */}
                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                            </div>
                        )}

                        {/* 错误状态 */}
                        {error && !loading && (
                            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
                                <p className="text-red-200">{error}</p>
                                <button
                                    onClick={fetchSocialMediaContent}
                                    className="mt-2 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* 内容网格 */}
                        {!loading && !error && (
                            <>
                                {filteredPosts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredPosts.map(post => (
                                            <div
                                                key={post.id}
                                                className={`bg-gray-700 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                                                    selectedVideos.includes(post.id) ? 'ring-2 ring-purple-500' : ''
                                                }`}
                                                onClick={() => handlePostClick(post)}
                                            >
                                                {/* 视频缩略图 */}
                                                <div className="relative">
                                                    <img
                                                        src={post.thumbnail}
                                                        alt={post.title}
                                                        className="w-full h-48 object-cover"
                                                        onError={(e) => {
                                                            e.target.src = `https://via.placeholder.com/200x350/6A5ACD/FFFFFF?text=${travelInfo.destination}`;
                                                        }}
                                                    />

                                                    {/* 选择指示器 - 统一在左上角 */}
                                                    <div
                                                        className="absolute top-2 left-2 bg-purple-500 text-white p-1 rounded-full cursor-pointer hover:bg-purple-600 transition-colors z-10"
                                                        onClick={(e) => toggleVideoSelection(post.id, e)}
                                                    >
                                                        {selectedVideos.includes(post.id) ? (
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                                            </svg>
                                                        )}
                                                    </div>

                                                    {/* 平台标签 - 移到右上角 */}
                                                    <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs capitalize">
                                                        {post.platform}
                                                    </div>

                                                    {/* 时长显示 - 只在 YouTube 和 TikTok 显示，移到右下角 */}
                                                    {(post.platform === 'youtube' || post.platform === 'tiktok') && post.duration && (
                                                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                                                            {post.duration}
                                                        </div>
                                                    )}

                                                    {/* 播放按钮（视频平台） */}
                                                    {(post.platform === 'youtube' || post.platform === 'tiktok') && (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                                                            <div className="bg-black bg-opacity-50 rounded-full p-3">
                                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M8 5v14l11-7z"></path>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 视频信息 */}
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{post.title}</h3>
                                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.description}</p>

                                                    <div className="flex justify-between items-center">
                                                        <span className="text-purple-400 text-sm">{post.creator}</span>
                                                        <div className="flex items-center text-gray-400 text-sm">
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor"
                                                                 viewBox="0 0 20 20">
                                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                                                <path fillRule="evenodd"
                                                                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                                      clipRule="evenodd"></path>
                                                            </svg>
                                                            {post.likes}
                                                        </div>
                                                    </div>

                                                    {/* 标签 */}
                                                    <div className="flex flex-wrap gap-1 mt-3">
                                                        {post.tags.slice(0, 3).map((tag, index) => (
                                                            <span key={index}
                                                                  className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                                #{tag}
                              </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                                                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2">No Content Found</h3>
                                        <p className="text-gray-400">
                                            Try changing your search terms or category filters.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    /* 已选视频页面 */
                    <div className="text-center py-12">
                        {selectedVideos.length > 0 ? (
                            <>
                                <h3 className="text-xl font-semibold text-white mb-4">
                                    {selectedVideos.length} Videos Selected
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    Ready to add these inspirations to your trip?
                                </p>
                                <button
                                    onClick={addToItinerary}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                                >
                                    Add to My Trip
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No Videos Selected</h3>
                                <p className="text-gray-400">
                                    Go to the Discover tab and select some inspiring videos!
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* 底部操作栏 */}
            {activeTab === 'discover' && selectedVideos.length > 0 && (
                <div className="border-t border-gray-700 p-4 bg-gray-750">
                    <div className="flex justify-between items-center">
            <span className="text-white">
              {selectedVideos.length} video{selectedVideos.length > 1 ? 's' : ''} selected
            </span>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedVideos([])}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200"
                            >
                                Clear
                            </button>
                            <button
                                onClick={addToItinerary}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                            >
                                Add to Trip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddInspiration;