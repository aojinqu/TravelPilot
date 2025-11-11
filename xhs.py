from fastapi import HTTPException
from agno.agent import Agent
from agno.tools.mcp import MultiMCPTools
from agno.models.openai import OpenAIChat
import os
import logging



# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_mcp_xiaohongshu(openai_key: str, google_maps_key: str) -> str:
    """Run the MCP-based travel planner agent with real-time data access."""
    logger.info("Starting MCP Xiaohongshu Agent...")
    
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
        # Connect to Airbnb MCP server
        await mcp_tools.connect()

        # Initialize Travel Planner Agent
        travel_planner = Agent(
            name="Travel Planner",
            model=OpenAIChat(
                id="openai/gpt-4o", 
                api_key=openai_key,
                base_url="https://openrouter.ai/api/v1"
            ),
            tools=[mcp_tools],
            markdown=True
        )
        logger.info("Successfully created Travel Planner Agent")

        # Define prompt for Xiaohongshu search
        destination = "Hong Kong"
        preference="restaurants"
        keyword = destination+' '+preference
        prompt = f"""
        You are a Xiaohongshu Search Agent only returns text results,no introductions. Your role is to help users search, analyze, and summarize content using Xiaohongshu mcp.

        **CORE WORKFLOW:**
        1. When user provides a {keyword}, first translate it to Chinese
        2. Search ONLY once for top 5 relevant feeds on Xiaohongshu using the Chinese keyword
        3. Extract detailed content from each of the 5 posts
        4. Analyze and summarize the key information in English, focusing on the following:
            - Place names (e.g. tourist spots)
            - Restaurant names
            - Activity names (e.g., hiking, sightseeing)
            - Relevant travel destinations

        OUTPUT FORMAT:
        **Search Keyword:** {keyword}
        **Top 5 Posts Analyzed:**
        1. [Post Title 1] -  Extracted place names, restaurant names, activities, and other relevant travel details...
            [Link]
        ...

        **Detailed Summary (English):**
        - Popular opinions and sentiments about {keyword}.
        - Key takeaways about {preference} from the posts: What places, restaurants, activities, or travel tips are most recommended?
        - Notable patterns across posts (e.g., frequently mentioned spots, common experiences).

        **TOOLS USAGE STRATEGY:**
        - First use `search_notes_by_keyword` with Chinese keyword to search for posts, only return text and do not use pictures.
        - Process all 5 posts texts before generating final summary

        Use Xiaohongshu MCP for real data.
        """

        # Get response from travel planner agent
        response = await travel_planner.arun(prompt)
        logger.info(f"Received response: {response.content}")

        return response.content

    except Exception as e:
        logger.error(f"Error during MCP Xiaohongshu processing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred while processing Xiaohongshu: {str(e)}")
    
    finally:
        await mcp_tools.close()
        logger.info("MCP tools connection closed.")

async def generate_xhs() -> dict:
    """Generate travel itinerary based on Xiaohongshu posts."""
    openai_key = os.getenv("OPENROUTER_API_KEY")
    google_map_key = os.getenv("GOOGLE_MAP_KEY")
    
    if not openai_key or not google_map_key:
        raise HTTPException(status_code=500, detail="API keys are missing from environment variables.")

    try:
        # Generate itinerary by calling run_mcp_xiaohongshu
        itinerary = await run_mcp_xiaohongshu(openai_key=openai_key, google_maps_key=google_map_key)
        
        return {
            "success": True,
            "itinerary": itinerary,
            "message": "Xiaohongshu posts generated successfully"
        }
    
    except HTTPException as e:
        logger.error(f"HTTP exception: {e.detail}")
        raise e
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred while generating itinerary: {str(e)}")

def main():
    """Main function to run the generate_xhs task."""
    import asyncio
    asyncio.run(generate_xhs())

if __name__ == "__main__":
    main()
