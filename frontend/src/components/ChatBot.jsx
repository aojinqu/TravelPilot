import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import './ChatBot.css'

const ChatBot = forwardRef(({ onSendMessage, loading, tripTitle }, ref) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '我是TravelPilot！只需描述您的旅行，我将为您创建一个完全个性化的梦想假期，您的假期就在几秒钟之遥——请告诉我您想去的地点、时间和预算？越详细越好📤'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addAssistantMessage = (content) => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: content
    }])
  }

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    addMessage: addAssistantMessage
  }))

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return

    const userMessage = {
      role: 'user',
      content: inputValue.trim()
    }

    const messageText = inputValue.trim()
    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // 调用父组件的处理函数
    if (onSendMessage) {
      await onSendMessage(messageText)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-header-left">
          <span className="briefcase-icon">💼</span>
        </div>
        <div className="chatbot-header-center">
          <h3>{tripTitle || '新旅行计划'}</h3>
        </div>
        <div className="chatbot-header-right">
          <button className="icon-button">📤</button>
          <button className="icon-button">−</button>
        </div>
      </div>

      <div className="chatbot-messages" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-role">
              {message.role === 'assistant' ? 'TravelPilot' : '你'}
            </div>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-role">TravelPilot</div>
            <div className="message-content loading">
              TravlePilot正在为您规划✈️...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-container">
        <div className="chatbot-input-wrapper">
          <input
            type="text"
            className="chatbot-input"
            placeholder="输入消息..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <div className="chatbot-input-actions">
            <button className="input-icon-button">🔗</button>
            <button 
              className="input-icon-button send-button"
              onClick={handleSend}
              disabled={loading || !inputValue.trim()}
            >
              ✈️
            </button>
          </div>
        </div>
        <div className="chatbot-footer">
          TravelPilot处于测试阶段，可能会犯错误。请检查重要信息。
        </div>
      </div>
    </div>
  )
})

ChatBot.displayName = 'ChatBot'

export default ChatBot

