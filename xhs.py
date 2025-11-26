from fastapi import HTTPException
from agno.agent import Agent
from agno.tools.mcp import MultiMCPTools
from agno.models.openai import OpenAIChat
import os
import logging
import json
from typing import List, Optional
from models import generate_mock_xhs_data



# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_mcp_xiaohongshu(
    openai_key: str, 
    google_maps_key: str,
    destination: str,
    preferences: Optional[List[str]] = None
) -> dict:
    """Run the MCP-based travel planner agent with real-time data access."""
    logger.info(f"Starting MCP Xiaohongshu Agent for {destination} with preferences: {preferences}")
    
    try:
        # Validate environment variables
        if not openai_key or not google_maps_key:
            raise ValueError("API keys are missing")
    
        # Initialize MCPTools with xiaohongshu MCP
        mcp_tools = MultiMCPTools(
            [
                "cmd /c npx -y rednote-mind-mcp"
            ],
            timeout_seconds=5000,
        )
        # Connect to Xiaohongshu MCP server
        await mcp_tools.connect()

        # Initialize Travel Planner Agent
        travel_planner = Agent(
            name="Xiaohongshu Search Agent",
            model=OpenAIChat(
                id="openai/gpt-4o", 
                api_key=openai_key,
                base_url="https://openrouter.ai/api/v1"
            ),
            tools=[mcp_tools],
            markdown=True
        )
        logger.info("Successfully created Xiaohongshu Search Agent")

        # Build keyword from destination and preferences
        if preferences and len(preferences) > 0:
            preference_str = " ".join(preferences)
            keyword = f"{destination} {preference_str}"
        else:
            preference_str = destination
            keyword = destination

        # Define prompt for Xiaohongshu search with JSON output
        prompt = f"""
        You are a Xiaohongshu Search Agent. Your role is to help users search, analyze, and summarize content using Xiaohongshu MCP.

        **CORE WORKFLOW:**
        1. When user provides keyword "{keyword}", first translate it to Chinese
        2. Search ONLY once for top 5 relevant feeds on Xiaohongshu using the Chinese keyword
        3. Extract detailed content from each of the 5 posts
        4. Analyze and summarize the key information in English, focusing on the following:
            - Place names (e.g. tourist spots)
            - Restaurant names
            - Activity names (e.g., hiking, sightseeing)
            - Relevant travel destinations
            - User reviews and recommendations

        **CRITICAL REQUIREMENT: You MUST output ONLY valid JSON format, do not include any additional text, explanations, or markdown (no ```json ```).**

        **JSON OUTPUT STRUCTURE:**
        {{
            "search_keyword": "{keyword}",
            "destination": "{destination}",
            "preferences": {json.dumps(preferences) if preferences else "[]"},
            "posts": [
                {{
                    "title": "Post title in English",
                    "author": "Author name",
                    "link": "Post URL",
                    "summary": "Brief summary of the post content",
                    "places_mentioned": ["Place 1", "Place 2"],
                    "restaurants_mentioned": ["Restaurant 1", "Restaurant 2"],
                    "activities_mentioned": ["Activity 1", "Activity 2"],
                    "key_tips": ["Tip 1", "Tip 2"]
                }}
            ],
            "summary": {{
                "popular_opinions": "Summary of popular opinions and sentiments",
                "key_recommendations": "Key takeaways about {preference_str if preferences else destination} from the posts",
                "notable_patterns": "Notable patterns across posts (e.g., frequently mentioned spots, common experiences)",
                "top_places": ["Most mentioned place 1", "Most mentioned place 2"],
                "top_restaurants": ["Most mentioned restaurant 1", "Most mentioned restaurant 2"],
                "top_activities": ["Most mentioned activity 1", "Most mentioned activity 2"]
            }}
        }}

        **TOOLS USAGE STRATEGY:**
        - First use `search_notes_by_keyword` with Chinese keyword to search for posts, only return text and do not use pictures.
        - Process all 5 posts texts before generating final JSON summary
        - Extract at least 3-5 posts with detailed information

        Use Xiaohongshu MCP for real data.
        """

        # Get response from travel planner agent
        response = await travel_planner.arun(prompt)
        logger.info(f"Received response: {response.content[:200]}...")

        # Try to parse JSON from response
        content = response.content.strip()
        
        # Remove markdown code blocks if present
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        try:
            result = json.loads(content)
            logger.info("Successfully parsed JSON response")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
            logger.error(f"Response content: {content[:500]}")
            # Return a structured error response
            return {
                "search_keyword": keyword,
                "destination": destination,
                "preferences": preferences or [],
                "posts": [],
                "summary": {
                    "popular_opinions": "Failed to parse response",
                    "key_recommendations": content[:500],
                    "notable_patterns": "",
                    "top_places": [],
                    "top_restaurants": [],
                    "top_activities": []
                },
                "error": "Failed to parse JSON response",
                "raw_response": content[:1000]
            }

    except Exception as e:
        logger.error(f"Error during MCP Xiaohongshu processing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred while processing Xiaohongshu: {str(e)}")
    
    finally:
        await mcp_tools.close()
        logger.info("MCP tools connection closed.")

async def generate_xhs(
    destination: str,
    preferences: Optional[List[str]] = None
) -> dict:
    """Generate travel recommendations based on Xiaohongshu posts."""
    # 暂时使用模拟数据，取消注释下面的代码来使用真实的 API
    # openai_key = os.getenv("OPENROUTER_API_KEY")
    # google_map_key = os.getenv("GOOGLE_MAP_KEY")
    # 
    # if not openai_key or not google_map_key:
    #     raise HTTPException(status_code=500, detail="API keys are missing from environment variables.")

    try:
        # Generate recommendations by calling run_mcp_xiaohongshu
        # 取消注释下面的代码来使用真实的 API 调用
        # result = await run_mcp_xiaohongshu(
        #     openai_key=openai_key, 
        #     google_maps_key=google_map_key,
        #     destination=destination,
        #     preferences=preferences
        # )
        
        # 使用模拟测试数据
        result = generate_mock_xhs_data(destination, preferences)
        logger.info(f"Generated mock data for {destination} with preferences: {preferences}")
        
        return {
            "success": True,
            "data": result,
            "message": "Xiaohongshu posts generated successfully"
        }
    
    except HTTPException as e:
        logger.error(f"HTTP exception: {e.detail}")
        raise e
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred while generating recommendations: {str(e)}")

def main():
    """Main function to run the generate_xhs task."""
    import asyncio
    asyncio.run(generate_xhs("Hong Kong", ["Food", "Culture"]))
