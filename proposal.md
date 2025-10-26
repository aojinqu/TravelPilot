## TravelPilot: A LLM-Based Agent for customized Travlling  

## 1 Introduction

Traditional travel planning requires users to manually search for accommodations, transportation, and activities from different websites, which is time-consuming and lacks personalization. With the rapid development of LLM-based agents and multi-source data access frameworks, AI agent can dynamically plan optimized itineraries that incorporate real-world constraints such as travel time, pricing, and opening hours.

This project aims to design a fully travel agent system that generates highly actionable itineraries tailored to user preferences, leveraging real-time accommodation and location services.

## 2 Background and Motivation
Most existing travel planning tools only provide generic and standardized travel routes that are designed for mass tourism. They fail to reflect individual travel styles and personal needs such as:
- local gourmet experience

- natural scenery exploration

- urban sightseeing

- shopping-focused routes
- ...

To address this gap, we leverage Xiaohongshu (小红书) to extract real, user-generated travel demands and preferences from posts. We will apply sentiment analysis to identify authenticity and adjust recommendation weights accordingly—ensuring personalized, trustable travel guidance.


    User ↔ Chat Frontend ↔ LLM Planner 
    ↘ Preference Memory ↙     ↘ Google Maps/Xie Cheng
        ↘ Xiaohongshu   ↙
                Route Feasibility Engine
                        ↓
                Visual Itinerary Output
### 将会实现的功能
#### 1. LLM Agent System

We support multiple foundation models (GPT / Qwen / Gemini) with a flexible adapter design:

- Tool-Augmented Reasoning for route validation and pricing

- Self-Consistency for improving itinerary reliability

- Prompt-Oriented Task Decomposition: preference extraction → routing → refinement

Enables both generative and constraint-aware planning.

#### 2.Memory Augmentation Module

We provide persistent travel preference modeling:
| Function             | Implementation                                |
| -------------------- | --------------------------------------------- |
| Short-term memory    | Stored in Redis during session                |
| Long-term preference | Structured trip constraints stored in DB      |
| Auto-application     | Memory → constraints → itinerary regeneration |

#### 3.Social Content Integration (Xiaohongshu MCP)

- Scrape relevant UGC posts based on user travel requirements

- Perform sentiment analysis to filter non-authentic content

- Assign confidence weighting before feeding into itinerary planning

Align itinerary with actual travel recommendations from local users.

#### 4. Frontend Intelligent Chatbot UI

- Real-time message rendering

- Trip update notifications and inline editing

- Interactive map display + cost breakdown charts

- Exportable (.ics calendar, PDF report)

### Technical Summary
#### System Architecture Overview
We adopt a front-end & back-end decoupled architecture to ensure flexibility and modularity.
| Layer                  | Technology                       | Purpose                                                            |
| ---------------------- | -------------------------------- | ------------------------------------------------------------------ |
| Frontend Web UI        | Vue.js / React.js                | Conversational travel planning interface + itinerary visualization |
| Backend Service        | FastAPI (Python)                 | Agent logic layer, tool orchestration, session storage             |
| LLM Provider           | GPT / Qwen / Gemini              | Natural language understanding, itinerary generation               |
| External Service Tools | Xiaohongshu MCP, Google Maps MCP, Xiecheng MCP | Social content ingestion + geospatial validation                   |
| Data Storage           | PostgreSQL / Redis / JSON cache  | Memory, preference persistence, caching external data              |

#### Optional
1. workflow
We may also use LangGraph / AgentFlow (optional),the workflow orchestration for multi-step LLM execution.

2.  Geospatial Verification 
(Google Maps MCP)
- Distance calculation
- Real-time route planning
- Opening hours verification

### 分工
