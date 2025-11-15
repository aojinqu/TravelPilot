/**
 * 从用户输入中解析旅行信息
 * @param {string} text - 用户输入文本
 * @param {object} existingInfo - 已存在的旅行信息
 * @returns {object} 解析出的旅行信息
 */
export const parseTravelInfo = (text, existingInfo = {}) => {
    const info = { ...existingInfo };
    const lowerText = text.toLowerCase();

    // 解析出发地点 (从/从...出发/起点)
    if (!info.departure) {
        const departurePatterns = [
            /从\s*([^，,。.出发\s]{1,20}?)\s*出发/,
            /起点[：:]\s*([^，,。.\s]+)/,
            /出发地[：:]\s*([^，,。.\s]+)/,
            /departure[：:]\s*([^，,。.\s]+)/i,
            /from\s+([^，,。.\s]+)/i,
            /出发[：:]\s*([^，,。.\s]+)/,
        ];
        
        for (const pattern of departurePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let departure = match[1].trim();
                // 移除可能的标点符号
                departure = departure.replace(/[，,。.！!？?]$/, '');
                if (departure.length > 0 && departure.length < 30) {
                    info.departure = departure;
                    break;
                }
            }
        }
    }

    // 解析目的地 (去/到/目的地)
    if (!info.destination) {
        const destinationPatterns = [
            /去\s*([^，,。.旅游玩\s]{1,20}?)(?:\s|，|,|。|旅游|玩|$)/,
            /到\s*([^，,。.\s]{1,20}?)(?:\s|，|,|。|$)/,
            /目的地[：:]\s*([^，,。.\s]+)/,
            /destination[：:]\s*([^，,。.\s]+)/i,
            /to\s+([^，,。.\s]+)/i,
            /在\s*([^，,。.旅游\s]{1,20}?)\s*旅游/,
            /去\s*([^，,。.玩\s]{1,20}?)\s*玩/,
            /旅游[：:]\s*([^，,。.\s]+)/,
        ];
        
        for (const pattern of destinationPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let destination = match[1].trim();
                // 移除可能的标点符号
                destination = destination.replace(/[，,。.！!？?]$/, '');
                if (destination.length > 0 && destination.length < 30) {
                    info.destination = destination;
                    break;
                }
            }
        }
    }

    // 解析旅游天数 (X天/X日游/玩X天)
    if (!info.numDays) {
        const daysPatterns = [
            /(\d+)\s*天/,
            /(\d+)\s*日/,
            /玩\s*(\d+)\s*天/,
            /(\d+)\s*days?/i,
            /duration[：:]\s*(\d+)/i,
            /天数[：:]\s*(\d+)/,
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

    // 解析旅游人数 (X人/X个/X位)
    if (!info.numPeople) {
        const peoplePatterns = [
            /(\d+)\s*人/,
            /(\d+)\s*个/,
            /(\d+)\s*位/,
            /(\d+)\s*people/i,
            /(\d+)\s*persons?/i,
            /人数[：:]\s*(\d+)/,
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

    // 解析总预算 (X元/X块/X美元/X港币/X HKD/X USD/X RMB/预算X)
    if (!info.budget) {
        const budgetPatterns = [
            /(\d+(?:\.\d+)?)\s*万\s*(?:元|块|美元|港币|HKD|USD|RMB|CNY)?/,
            /预算[：:]\s*(\d+(?:\.\d+)?)\s*(?:万)?\s*(?:元|块|美元|港币|HKD|USD|RMB|CNY)?/,
            /(\d+(?:\.\d+)?)\s*元/,
            /(\d+(?:\.\d+)?)\s*块/,
            /(\d+(?:\.\d+)?)\s*美元/,
            /(\d+(?:\.\d+)?)\s*港币/,
            /(\d+(?:\.\d+)?)\s*HKD/i,
            /(\d+(?:\.\d+)?)\s*USD/i,
            /(\d+(?:\.\d+)?)\s*RMB/i,
            /(\d+(?:\.\d+)?)\s*CNY/i,
            /budget[：:]\s*(\d+(?:\.\d+)?)/i,
        ];
        
        for (const pattern of budgetPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                let amount = parseFloat(match[1]);
                
                // 处理"万"单位
                if (text.match(/\d+(?:\.\d+)?\s*万/) && match[0].includes('万')) {
                    amount = amount * 10000;
                }
                
                if (amount > 0 && amount < 10000000) { // 限制最大预算
                    info.budget = Math.floor(amount);
                    break;
                }
            }
        }
    }

    return info;
};

/**
 * 验证旅行信息是否完整
 * @param {object} travelInfo - 旅行信息对象
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
 * 生成提示消息，告诉用户缺少哪些信息
 * @param {string[]} missingFields - 缺少的字段列表
 * @returns {string} 提示消息
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

