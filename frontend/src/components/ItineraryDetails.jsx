import React from 'react'
import ReactMarkdown from 'react-markdown'
import './ItineraryDetails.css'

const ItineraryDetails = ({ 
  itinerary, 
  startDate, 
  numDays, 
  budget, 
  destination,
  onDownloadCalendar 
}) => {
  if (!itinerary) {
    return (
      <div className="itinerary-details-empty">
        <div className="empty-state">
          <h2>等待生成行程...</h2>
          <p>在左侧聊天中描述您的旅行计划，TravelPilot 将为您创建详细的行程安排。</p>
        </div>
      </div>
    )
  }

  // 计算结束日期
  const calculateEndDate = () => {
    if (!startDate) return ''
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + (numDays || 0))
    const month = end.getMonth() + 1
    const day = end.getDate()
    return `${month}月${day}日`
  }

  const formatDateRange = () => {
    if (!startDate) return ''
    const start = new Date(startDate)
    const month = start.getMonth() + 1
    const day = start.getDate()
    const startFormatted = `${month}月${day}日`
    const endFormatted = calculateEndDate()
    return `${startFormatted} - ${endFormatted}`
  }

  return (
    <div className="itinerary-details">
      {/* 顶部栏 */}
      <div className="itinerary-top-bar">
        <div className="top-bar-left">
          <div className="date-range">{formatDateRange()}</div>
          <div className="travelers-count">
            <span>👤</span>
            <span>1</span>
          </div>
        </div>
        <div className="top-bar-right">
          <div className="total-cost">
            <span>总计(每位成人)</span>
            <span className="cost-amount">¥ {budget || 0}</span>
          </div>
          <button className="book-now-button" onClick={onDownloadCalendar}>
            导出到日历 →
          </button>
        </div>
      </div>

      {/* 行程内容 */}
      <div className="itinerary-content">
        {/* 行程概览 */}
        <section className="itinerary-overview">
          <div className="overview-image">
            <div className="placeholder-image">
              <span>📍 {destination}</span>
            </div>
          </div>
          <div className="overview-info">
            <h2>{destination} </h2>
            <p className="overview-dates">{formatDateRange()}</p>
            <p className="overview-description">
              体验精彩的旅行，探索当地文化，品尝美食，享受难忘的假期时光。
            </p>
            <div className="overview-actions">
              <button className="action-link">查看完整计划 →</button>
              <button className="action-link">+ 旅行灵感!</button>
              <button className="action-link">完整行程 →</button>
            </div>
          </div>
        </section>

        {/* 航班信息 */}
        <section className="itinerary-section">
          <div className="section-header">
            <div className="section-title-group">
              <h3>航班</h3>
              <span className="section-cost">¥ {(budget * 0.6 || 0).toFixed(0)}/成人</span>
              <span className="section-count">2航班</span>
            </div>
            <button className="modify-link">修改 →</button>
          </div>
          <div className="flight-details">
            <div className="flight-item">
              <div className="flight-info">
                <div className="flight-route">
                  <span className="flight-origin">出发地</span>
                  <span className="flight-type">直达的</span>
                  <span className="flight-destination">{destination}</span>
                </div>
                <div className="flight-time">
                  <span>出发: {startDate ? new Date(startDate).toLocaleDateString('zh-CN') : '待定'}</span>
                  <span>飞行时间: 约todo小时</span>
                  <span>到达: {calculateEndDate()}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 酒店信息 */}
        <section className="itinerary-section">
          <div className="section-header">
            <div className="section-title-group">
              <h3>酒店</h3>
              <span className="section-cost">¥ {(budget * 0.3 || 0).toFixed(0)}/成人</span>
              <span className="section-count">{numDays || 0}晚</span>
            </div>
            <button className="modify-link">修改 →</button>
          </div>
          <div className="hotel-placeholder">
            <p>酒店信息将在行程生成后显示</p>
          </div>
        </section>

        {/* 详细行程内容 */}
        <section className="itinerary-full-content">
          <h3>详细行程</h3>
          <div className="markdown-content">
            <ReactMarkdown>{itinerary}</ReactMarkdown>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ItineraryDetails

