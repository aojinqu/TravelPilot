/**
 * Parse travel information from user input (English)
 * @param {string} text - User input text
 * @param {object} existingInfo - Existing travel information
 * @returns {object} Parsed travel information
 */
export const parseTravelInfo = (text, existingInfo = {}) => {
    const info = { ...existingInfo };
    const lowerText = text.toLowerCase();

    // Parse departure location
    if (!info.departure) {
        const departurePatterns = [
            /from\s+([a-zA-Z\s]{2,30}?)(?:\s|,|\.|$)/i,
            /departure[:\s]+([a-zA-Z\s]{2,30}?)(?:\s|,|\.|$)/i,
            /departing\s+from\s+([a-zA-Z\s]{2,30}?)(?:\s|,|\.|$)/i,
            /leaving\s+from\s+([a-zA-Z\s]{2,30}?)(?:\s|,|\.|$)/i,
            /origin[:\s]+([a-zA-Z\s]{2,30}?)(?:\s|,|\.|$)/i,
        ];
        
        for (const pattern of departurePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let departure = match[1].trim();
                // Remove trailing punctuation
                departure = departure.replace(/[,.\s]+$/, '');
                if (departure.length > 0 && departure.length < 30) {
                    info.departure = departure;
                    break;
                }
            }
        }
    }

    // Parse destination
    if (!info.destination) {
        const destinationPatterns = [
            /to\s+([a-zA-Z\s]{2,30}?)(?:\s|,|\.|$)/i,
            /destination[:\s]+([a-zA-Z\s]{2,30}?)(?:\s|,|\.|$)/i,
            /going\s+to\s+([a-zA-Z\s]{2,30}?)(?:\s|,|\.|$)/i,
            /traveling\s+to\s+([a-zA-Z\s]{2,30}?)(?:\s|,|\.|$)/i,
            /visiting\s+([a-zA-Z\s]{2,30}?)(?:\s|,|\.|$)/i,
            /trip\s+to\s+([a-zA-Z\s]{2,30}?)(?:\s|,|\.|$)/i,
        ];
        
        for (const pattern of destinationPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let destination = match[1].trim();
                // Remove trailing punctuation
                destination = destination.replace(/[,.\s]+$/, '');
                if (destination.length > 0 && destination.length < 30) {
                    info.destination = destination;
                    break;
                }
            }
        }
    }

    // Parse number of days
    if (!info.numDays) {
        const daysPatterns = [
            /(\d+)\s*days?/i,
            /(\d+)\s*day\s*trip/i,
            /(\d+)\-day\s*trip/i,
            /for\s+(\d+)\s*days?/i,
            /duration[:\s]+(\d+)/i,
            /trip\s+of\s+(\d+)\s*days?/i,
            /(\d+)\s*days?\s*long/i,
        ];
        
        for (const pattern of daysPatterns) {
            const match = text.match(pattern);
            if (match) {
                const days = parseInt(match[1]);
                if (days > 0 && days <= 30) {
                    info.numDays = days;
                    break;
                }
            }
        }
    }

    // Parse number of people
    if (!info.numPeople) {
        const peoplePatterns = [
            /(\d+)\s*people/i,
            /(\d+)\s*persons?/i,
            /(\d+)\s*travelers?/i,
            /(\d+)\s*guests?/i,
            /for\s+(\d+)\s*(?:people|persons?|travelers?|guests?)/i,
            /group\s+of\s+(\d+)/i,
            /(\d+)\s*adults?/i,
        ];
        
        for (const pattern of peoplePatterns) {
            const match = text.match(pattern);
            if (match) {
                const people = parseInt(match[1]);
                if (people > 0 && people <= 20) {
                    info.numPeople = people;
                    break;
                }
            }
        }
    }

    // Parse total budget
    if (!info.budget) {
        const budgetPatterns = [
            /\$\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
            /(\d+(?:,\d{3})*(?:\.\d+)?)\s*USD/i,
            /(\d+(?:,\d{3})*(?:\.\d+)?)\s*CNY/i,
            /(\d+(?:,\d{3})*(?:\.\d+)?)\s*RMB/i,
            /(\d+(?:,\d{3})*(?:\.\d+)?)\s*HKD/i,
            /(\d+(?:,\d{3})*(?:\.\d+)?)\s*JPY/i,
            /(\d+(?:,\d{3})*(?:\.\d+)?)\s*SGD/i,
            /budget[:\s]+(\d+(?:,\d{3})*(?:\.\d+)?)/i,
            /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:thousand|k)\s*(?:USD|CNY|RMB|HKD|JPY|SGD)?/i,
        ];
        
        for (const pattern of budgetPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                // Remove commas and parse number
                let amountStr = match[1].replace(/,/g, '');
                let amount = parseFloat(amountStr);
                
                // Handle "thousand" or "k" unit
                if (text.match(/\d+(?:,\d{3})*(?:\.\d+)?\s*(?:thousand|k)/i)) {
                    amount = amount * 1000;
                }
                
                // Detect currency type
                let currency = 'CNY'; // Default currency
                if (match[0].match(/USD/i)) currency = 'USD';
                else if (match[0].match(/HKD/i)) currency = 'HKD';
                else if (match[0].match(/JPY/i)) currency = 'JPY';
                else if (match[0].match(/SGD/i)) currency = 'SGD';
                else if (match[0].match(/\$/)) currency = 'USD';
                else if (match[0].match(/CNY|RMB/i)) currency = 'CNY';
                
                if (amount > 0 && amount < 10000000) { // Limit maximum budget
                    info.budget = Math.floor(amount);
                    info.currency = currency;
                    break;
                }
            }
        }
    }

    return info;
};

/**
 * Validate if travel information is complete
 * @param {object} travelInfo - Travel information object
 * @returns {object} { isValid: boolean, missingFields: string[] }
 */
export const validateTravelInfo = (travelInfo) => {
    const missingFields = [];
    
    if (!travelInfo.departure) {
        missingFields.push('Departure location');
    }
    if (!travelInfo.destination) {
        missingFields.push('Destination');
    }
    if (!travelInfo.numDays) {
        missingFields.push('Number of days');
    }
    if (!travelInfo.numPeople) {
        missingFields.push('Number of people');
    }
    if (!travelInfo.budget) {
        missingFields.push('Total budget');
    }
    
    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
};

/**
 * Generate a message telling the user what information is missing
 * @param {string[]} missingFields - List of missing fields
 * @returns {string} Tip message
 */
export const generateMissingInfoMessage = (missingFields) => {
    if (missingFields.length === 0) {
        return '';
    }
    
    const fieldExamples = {
        'Departure location': 'e.g., from Hong Kong, from Beijing',
        'Destination': 'e.g., to Osaka, to Tokyo, destination: Seoul',
        'Number of days': 'e.g., 7 days, 5-day trip, 3 days',
        'Number of people': 'e.g., 2 people, 3 people, 4 people',
        'Total budget': 'e.g., 5000 CNY, 10000 CNY, budget 8000',
    };
    
    let message = '📋 To generate your detailed travel itinerary, please provide the following information:\n\n';
    missingFields.forEach((field, index) => {
        message += `${index + 1}. ${field} ${fieldExamples[field] || ''}\n`;
    });
    message += '\n💡 Tip: You can provide all information at once or in multiple messages.';
    
    return message;
};

