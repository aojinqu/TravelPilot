        Previous output:
        ${temp_output}
        
        You have access to:
        🏨 Airbnb listings with real availability and current pricing
        🗺️ Google Maps MCP for location services, directions, distance calculations, and local navigation
        🔍 Web search capabilities for current information.

        Use the existing JSON structure to revise the travel itinerary. Incorporate these new requirements: {user_new_requirements}. 
        Also, check and apply these basic travel parameters (update itinerary if they differ from original):
        **Destination:** {destination}
        **Duration:** {num_days} days
        **People:** {num_people} 
        **Total Budget:** ${budget} HKD

        DO NOT ask any questions. Generate a complete, highly detailed itinerary now using all available tools.
    
            **CRITICAL REQUIREMENTS:**
            - Use Google Maps MCP to calculate distances and travel times between ALL locations
            - Include specific addresses for every location, restaurant, and attraction
            - Calculate precise costs for transportation between each location
            - Include opening hours, ticket prices, and best visiting times for all attractions
    
        **IMPORTANT DAILY ITINERARY REQUIREMENTS:**
        1. You MUST generate a COMPLETE day-by-day itinerary for ALL {num_days} days
        2. Each day must include a FULL schedule from morning to evening
        3. Every activity must have specific time slots (start_time and end_time)
        4. Include realistic travel times between locations using transportation data
        5. All activities must have specific addresses and cost estimates

        **VERIFICATION CHECKLIST (Check before outputting):**
        ✓ Output is ONLY valid JSON format, not include any additional text, explanations, or markdown(no ```json  ```)
        ✓ The JSON format must strictly comply with the requirements in the JSON OUTPUT STRUCTURE.
        ✓ daily_itinerary array contains exactly {num_days} objects
        ✓ Each object has "day" field (from 1 to {num_days})
        ✓ All content in the JSON shall be presented in English.
        ✓ All time slots are sequential and realistic
        ✓ All addresses are real and specific
        ✓ All costs are accurately calculated
        ✓ There is a budget_breakdown
        ✓ The hotel budget must not exceed 30% of the total

        Ensure:
        1. Output is ONLY valid JSON (no extra text/markdown)
        2. Follows the original "trip_overview", "accommodation", "daily_itinerary", "budget_breakdown" structure
        3. All verification checklist rules (days count, time sequence, real addresses, cost accuracy, 50% max for accommodation budget, English content) are strictly followed
        4. If the user's new requirements are unrelated to travel planning, do not consider this parameter
        5. If the basic parameters (destination/days/people/budget) have changed, fully adjust the itinerary to match the new parameters
        6. MANDATORY: Use Google Maps API for ALL location services, including distance calculations, travel time estimates between activities, and validation of real addresses
        7. All information (opening hours, addresses, transportation options) must be verified as current and accurate using Google Maps or web search

        Use Airbnb MCP for real accommodation data, Google Maps MCP for ALL distance calculations and location services, and web search for current information.To better plan for air tickets, it is advisable not to exceed 50% of the total budget when planning the daily and accommodation budgets.