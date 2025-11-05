import React, { useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [openaiKey, setOpenaiKey] = useState('')
  const [googleMapsKey, setGoogleMapsKey] = useState('')
  const [destination, setDestination] = useState('')
  const [numDays, setNumDays] = useState(7)
  const [budget, setBudget] = useState(2000)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [preferences, setPreferences] = useState('')
  const [quickPrefs, setQuickPrefs] = useState([])
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const quickPrefOptions = [
    "Adventure", "Relaxation", "Sightseeing", "Cultural Experiences",
    "Beach", "Mountain", "Luxury", "Budget-Friendly", "Food & Dining",
    "Shopping", "Nightlife", "Family-Friendly"
  ]

  const handleGenerate = async () => {
    if (!destination) {
      setError('请输入目的地')
      return
    }

    if (!openaiKey || !googleMapsKey) {
      setError('请输入所有必需的 API 密钥')
      return
    }

    const allPreferences = []
    if (preferences) allPreferences.push(preferences)
    if (quickPrefs.length > 0) allPreferences.push(...quickPrefs)
    const finalPreferences = allPreferences.join(', ') || 'General sightseeing'

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-itinerary`, {
        destination,
        num_days: numDays,
        preferences: finalPreferences,
        budget,
        openai_key: openaiKey,
        google_maps_key: googleMapsKey,
        start_date: startDate
      })

      if (response.data.success) {
        setItinerary(response.data.itinerary)
      } else {
        setError('生成行程失败')
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || '生成行程时出错')
    } finally {
      setLoading(false)
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
      <div className="container">
        <header className="header">
          <h1>✈️ MCP AI Travel Planner</h1>
          <p className="subtitle">使用 MCP 服务器进行实时数据访问的 AI 旅行规划器</p>
        </header>

        <div className="layout">
          <aside className="sidebar">
            <h2>🔑 API 密钥配置</h2>
            <div className="warning-box">
              <strong>⚠️ 这些服务需要 API 密钥：</strong>
            </div>

            <div className="input-group">
              <label htmlFor="openai-key">OpenAI API Key</label>
              <input
                id="openai-key"
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="Required for AI planning"
              />
            </div>

            <div className="input-group">
              <label htmlFor="google-maps-key">Google Maps API Key</label>
              <input
                id="google-maps-key"
                type="password"
                value={googleMapsKey}
                onChange={(e) => setGoogleMapsKey(e.target.value)}
                placeholder="Required for location services"
              />
            </div>

            {(openaiKey && googleMapsKey) ? (
              <div className="success-message">✅ 所有 API 密钥已配置！</div>
            ) : (
              <div className="info-box">
                <strong>必需的 API 密钥：</strong>
                <ul>
                  <li><strong>OpenAI API Key</strong>: https://platform.openai.com/api-keys</li>
                  <li><strong>Google Maps API Key</strong>: https://console.cloud.google.com/apis/credentials</li>
                </ul>
              </div>
            )}
          </aside>

          <main className="main-content">
            {(openaiKey && googleMapsKey) ? (
              <>
                <section className="trip-details">
                  <h2>🌍 旅行详情</h2>
                  <div className="form-grid">
                    <div className="input-group">
                      <label htmlFor="destination">目的地</label>
                      <input
                        id="destination"
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="例如：巴黎、东京、纽约"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="num-days">天数</label>
                      <input
                        id="num-days"
                        type="number"
                        value={numDays}
                        onChange={(e) => setNumDays(parseInt(e.target.value))}
                        min="1"
                        max="30"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="budget">预算 (USD)</label>
                      <input
                        id="budget"
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(parseInt(e.target.value))}
                        min="100"
                        max="10000"
                        step="100"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="start-date">开始日期</label>
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </section>

                <section className="preferences">
                  <h3>🎯 旅行偏好</h3>
                  <div className="input-group">
                    <label htmlFor="preferences">描述您的旅行偏好</label>
                    <textarea
                      id="preferences"
                      value={preferences}
                      onChange={(e) => setPreferences(e.target.value)}
                      placeholder="例如：冒险活动、文化景点、美食、放松、夜生活..."
                      rows="4"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="quick-prefs">快速偏好（可选）</label>
                    <div className="checkbox-group">
                      {quickPrefOptions.map((option) => (
                        <label key={option} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={quickPrefs.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setQuickPrefs([...quickPrefs, option])
                              } else {
                                setQuickPrefs(quickPrefs.filter(p => p !== option))
                              }
                            }}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                <div className="button-group">
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={loading || !destination}
                  >
                    {loading ? '🔄 生成中...' : '🎯 生成行程'}
                  </button>

                  {itinerary && (
                    <button
                      className="btn btn-secondary"
                      onClick={handleDownloadCalendar}
                    >
                      📅 下载为日历
                    </button>
                  )}
                </div>

                {error && (
                  <div className="error-message">
                    ❌ {error}
                  </div>
                )}

                {itinerary && (
                  <section className="itinerary">
                    <h2>📋 您的旅行行程</h2>
                    <div className="itinerary-content">
                      <ReactMarkdown>{itinerary}</ReactMarkdown>
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="warning-message">
                ⚠️ 请先输入所有 API 密钥以使用旅行规划器。
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App


