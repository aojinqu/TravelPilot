/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // 确保这个路径和你的项目结构匹配
    ],
    theme: {
        extend: {
            colors: {
                // 这是我根据图片提取的主色调
                'brand': {
                    'purple': '#8965F2', // 亮紫色 (按钮, 高亮)
                    'dark': '#2A1643',   // 主背景 (深紫色)
                    'medium': '#3A1E5C', // 聊天侧边栏渐变色
                },
                // 自定义灰色调，用于卡片、背景和文字
                'custom-gray': {
                    '100': '#E5E7EB', // 浅色文字
                    '200': '#D1D5DB', // 浅色文字
                    '300': '#9CA3AF', // 次要文字
                    '400': '#6B7280', // 较暗的文字
                    '500': '#4B5563', // 边框
                    '600': '#374151', //
                    '700': '#2D3748', // 聊天输入框/卡片内层背景
                    '800': '#1F2937', // 卡片/头部背景
                    '900': '#111827', // 主内容区域背景
                }
            },
            fontFamily: {
                // 使用一个干净的无衬线字体作为默认
                sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
            },
        },
    },
    plugins: [],
}