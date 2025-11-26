        Previous output: 
        ${temp_output}

        You have access to:
        - 🏨 Airbnb listings with real availability and current pricing
        - 🗺️ Google Maps for location services, directions, and distance calculations  
        - 🔍 Web search for current information

        **TASK:** Revise the travel itinerary using the existing JSON structure and incorporate:
        - New requirements: {user_new_requirements}
        - Updated travel parameters:
          - Destination: {destination}
          - Duration: {num_days} days  
          - People: {num_people}
          - Total Budget: ${budget} HKD

        **CRITICAL INSTRUCTIONS:**
        1. Generate COMPLETE {num_days}-day itinerary from morning to evening
        2. Use Google Maps for ALL distance calculations and travel times between locations
        3. Include specific addresses for every location, restaurant, and attraction
        4. Calculate precise transportation costs between each activity
        5. Verify opening hours, ticket prices, and best visiting times for all attractions
        6. Accommodation budget must not exceed 30% of total budget

        **DAILY ITINERARY REQUIREMENTS:**
        - Each day must have sequential time slots (start_time/end_time)
        - Include realistic travel times between all locations
        - All activities must have verified addresses and cost estimates
        - Ensure time slots are logical and feasible

        **STRICT OUTPUT REQUIREMENT - MUST FOLLOW:**
        **YOUR OUTPUT MUST BE PURE JSON ONLY - ABSOLUTELY NO OTHER TEXT IS ACCEPTABLE**

        **REQUIRED OUTPUT FORMAT:**
        - ✅ Pure JSON object only,, not include any additional text, explanations, or markdown(no ```json  ```)
        - ✅ Valid JSON syntax
        - ✅ Follows exact structure: trip_overview, accommodation, daily_itinerary, budget_breakdown

        **JSON OUTPUT STRUCTURE:**
            The output must be a JSON object with the following structure:
    
            - "trip_overview": an object containing:
              - "destination": string
              - "duration_days": number
              - "title": string (a creative five to ten words English name for this trip, e.g., "Tokyo: 3-Day Urban Adventure ","Winter Feasts in Osaka's Food Paradise")
              - "people": number f
              - "total_budget_hkd": number
              - "summary": string
              - "main_attractions": array of strings
    
            - "accommodation": an array of objects, each containing:
              - "name": string
              - "address": string
              - "price_per_night_hkd": number
              - "amenities": array of strings
              - "link": string
              - "rating": number
    
            - "daily_itinerary": an array of objects, each representing a FULL day itinerary, containing:
              - "day": number (starting from Day 1 until Day {num_days})
              - "date": string (optional, in YYYY-MM-DD format if available)
              - "day_summary": string (brief overview of the day's theme)
              - "activities": array of activity objects, each containing:
                - "start_time": string (format: "HH:MM", e.g., "09:00")
                - "end_time": string (format: "HH:MM", e.g., "12:30")
                - "activity_name": string
                - "description": string (detailed description of the activity)
                - "address": string (specific physical address)
                - "cost_hkd": number
                - "travel_info": object with:
                  - "from_previous_duration_minutes": number
                  - "from_previous_distance_km": number
                  - "transportation_mode": string (e.g., "walking", "taxi", "subway", "bus")
                - "attraction_info": object with:
                  - "opening_hours": string
                  - "ticket_price_hkd": number
                  - "best_visit_time": string
    
            - "budget_breakdown": an object containing:
              - "accommodation_total_hkd": number
              - "activities_total_hkd": number
              - "transportation_total_hkd": number
              - "food_total_hkd": number
              - "remaining_budget_hkd": number

        **OUTPUT VALIDATION:**
        - Output MUST be pure JSON only (no additional text, explanations, or markdown)
        - JSON structure must match: trip_overview, accommodation, daily_itinerary, budget_breakdown
        - daily_itinerary must contain exactly {num_days} objects (day 1 to {num_days})
        - All content in English
        - Budget breakdown must be included and accurate
        - All addresses must be real and specific
        - All costs must be accurately calculated

        **VERIFICATION CHECKLIST:**
        ✓ Pure JSON output only - NO OTHER TEXT
        ✓ {num_days} days in daily_itinerary  
        ✓ Sequential and realistic time slots
        ✓ Real addresses for all locations
        ✓ Accurate cost calculations
        ✓ Accommodation ≤ 30% of total budget
        ✓ English content throughout

        **TOOL USAGE MANDATE:**
        - Use Google Maps for ALL location services, distance calculations, and travel time estimates
        - Use Airbnb for real accommodation data with current pricing
        - Use web search for verifying current information
        - Validate all information as current and accurate

        **BUDGET GUIDELINE:** Do not exceed 50% of total budget for daily expenses and accommodation combined.

        **FINAL WARNING:** If your response contains ANY text outside the JSON object, it will be rejected. Output JSON and nothing else.