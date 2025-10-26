## TravelPilot: A LLM-Based Agent for customized Travlling  

### Requirements

1. **API Keys** (Both Required):
    - **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
    - **Google Maps API Key**: Get your API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

2. **Python 3.8+**: Ensure you have Python 3.8 or higher installed.

3. **MCP Servers**: The app automatically connects to:
    - **Airbnb MCP Server**: Provides real Airbnb listings and pricing data
    - **Custom Google Maps MCP**: Enables precise distance calculations and location services

### Installation

1. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

### Running the App

1. Start the Streamlit app:
   ```bash
   streamlit run app.py
   ```

2. In the app interface:
   - Enter your **OpenAI API key** in the sidebar
   - Enter your **Google Maps API key** in the sidebar
   - Specify your destination, trip duration, budget, and preferences
   - Click "🎯 Generate Itinerary" to create your detailed travel plan

3. **Optional**: Download your itinerary as a calendar file (.ics) for import into Google Calendar, Apple Calendar, or Outlook

