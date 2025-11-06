// App.js
import React from 'react';
import ChatSider from './components/ChatSider';
import MainContent from './components/MainContent';
import Header from './components/Header'; // 顶部的导航栏

function App() {
    return (
        <div className="flex h-screen bg-[#2A1643] text-white font-sans">
            {/* 左侧侧边栏 */}
            <ChatSider />

            {/* 右侧主内容区 */}
            <div className="flex-1 flex flex-col">
                <Header /> {/* 顶部导航栏 */}
                <MainContent />
            </div>
        </div>
    );
}

export default App;