import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import ChatBot from './components/ChatBot'
import ItineraryDetails from './components/ItineraryDetails'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [destination, setDestination] = useState('')
  const [numDays, setNumDays] = useState(3)
  const [budget, setBudget] = useState(2000)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [preferences, setPreferences] = useState('')
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tripTitle, setTripTitle] = useState('新旅行计划')
  const chatBotRef = useRef(null)

  // 处理聊天消息发送
  const handleChatMessage = async (message) => {
    setLoading(true)
    setError(null)

    // 解析用户消息，提取旅行信息
    const lowerMessage = message.toLowerCase()
    
    // 尝试从消息中提取目的地
    const destinationMatch = message.match(/(?:去|想去|到)([\u4e00-\u9fa5]+|[\w\s]+)/)
    if (destinationMatch) {
      const extractedDest = destinationMatch[1].trim()
      if (extractedDest && extractedDest !== destination) {
        setDestination(extractedDest)
      }
    }

    // 尝试提取天数
    const daysMatch = message.match(/(\d+)\s*天/)
    if (daysMatch) {
      setNumDays(parseInt(daysMatch[1]))
    }

    // 尝试提取日期
    const dateMatch = message.match(/(\d{1,2})[.\/](\d{1,2})/)
    if (dateMatch) {
      const month = parseInt(dateMatch[1])
      const day = parseInt(dateMatch[2])
      const currentYear = new Date().getFullYear()
      const newDate = new Date(currentYear, month - 1, day)
      if (!isNaN(newDate.getTime())) {
        setStartDate(newDate.toISOString().split('T')[0])
      }
    }

    // 如果消息包含旅行相关信息，尝试生成行程
    const isTravelRelated = lowerMessage.includes('旅行') || 
                           lowerMessage.includes('去') || 
                           lowerMessage.includes('计划') || 
                           lowerMessage.includes('旅游') ||
                           destination
    
    if (isTravelRelated) {
      try {
        const finalPreferences = preferences || message
        
        const response = await axios.post(`${API_BASE_URL}/api/generate-itinerary`, {
          destination: destination,
          num_days: numDays,
          preferences: finalPreferences,
          budget,
          openai_key: '', // 从环境变量获取
          google_maps_key: '', // 从环境变量获取
          start_date: startDate
        })

        if (response.data.success) {
          setItinerary(response.data.itinerary)
          
          // 更新行程标题
          if (destination) {
            setTripTitle(`${destination} ${numDays}日游`)
          }

          // 添加AI回复到聊天
          setTimeout(() => {
            if (chatBotRef.current) {
              chatBotRef.current.addMessage(
                `好的！我已经为您创建了${destination || '目的地'}的${numDays}天旅行行程。详情请查看右侧的行程安排。`
              )
            }
          }, 100)
        } else {
          setError('生成行程失败')
          setTimeout(() => {
            if (chatBotRef.current) {
              chatBotRef.current.addMessage('抱歉，生成行程时遇到了问题。请稍后再试。')
            }
          }, 100)
        }
      } catch (err) {
        const errorMsg = err.response?.data?.detail || err.message || '生成行程时出错'
        setError(errorMsg)
        setTimeout(() => {
          if (chatBotRef.current) {
            chatBotRef.current.addMessage(`抱歉，出现了错误：${errorMsg}`)
          }
        }, 100)
      } finally {
        setLoading(false)
      }
    } else {
      // 普通对话，添加AI回复
      setTimeout(() => {
        if (chatBotRef.current) {
          chatBotRef.current.addMessage(
            '感谢您的消息！请告诉我您想去哪里旅行，我可以为您创建详细的行程计划。'
          )
        }
        setLoading(false)
      }, 800)
    }
  }

  const handleDownloadCalendar = async () => {
    if (!itinerary) return

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/download-calendar`,
        {
          itinerary,
          start_date: startDate
        },
        {
          responseType: 'blob'
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'travel_itinerary.ics')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError('下载日历时出错: ' + (err.message || '未知错误'))
    }
  }

  return (
    <div className="app">
      <div className="app-layout">
        {/* 左侧聊天界面 */}
        <div className="chat-panel">
          <ChatBot
            ref={chatBotRef}
            onSendMessage={handleChatMessage}
            loading={loading}
            tripTitle={tripTitle}
          />
        </div>

        {/* 右侧行程详情 */}
        <div className="itinerary-panel">
          <ItineraryDetails
            itinerary={itinerary}
            startDate={startDate}
            numDays={numDays}
            budget={budget}
            destination={destination}
            onDownloadCalendar={handleDownloadCalendar}
          />
        </div>
      </div>
    </div>
  )
}

export default App
