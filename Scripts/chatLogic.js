class EnergyDataChat {
    constructor ( ) {
        this.apiKey = null;
        this.conversationHistory = [ ];
        this.maxHistoryLength = 10;
        this.loadApiKey ( );
    }

    async loadApiKey ( ) {
        try {
            const response = await fetch ( '/.env' );
            if ( !response.ok ) {
                console.warn ( 'Could not load .env file. Chat functionality will be disabled.' );
                return { success: false, error: 'ENV_FILE_NOT_FOUND' };
            }
            
            const envContent = await response.text ( );
            const apiKeyMatch = envContent.match ( /OPENAI_API_KEY=([^\n]+)/ );
            
            if ( apiKeyMatch && apiKeyMatch[1].trim ( ) ) {
                this.apiKey = apiKeyMatch[1].trim ( );
                return { success: true };
            } else {
                console.warn ( 'OPENAI_API_KEY not found in .env file. Chat functionality will be disabled.' );
                return { success: false, error: 'API_KEY_NOT_FOUND' };
            }
        } catch ( error ) {
            console.error ( 'Failed to load API key:', error );
            return { success: false, error: 'LOAD_ERROR' };
        }
    }

    isApiKeyAvailable ( ) {
        return this.apiKey !== null && this.apiKey.trim ( ) !== '';
    }

    async sendMessage ( message, energyData ) {
        if ( !this.apiKey ) {
            return { error: getTranslation('API key not configured. Please check your .env file.') };
        }

        // I use the stored energy data if no parameter is provided
        const dataToUse = energyData || this.currentEnergyData;

        const systemPrompt = 
`You are a helpful energy data analyst. Keep responses short and conversational.`;

        // I build the messages array for the API call
        let messages = [
            { role: 'system', content: systemPrompt }
        ];

        // I add the conversation history first as the primary context
        messages.push ( ...this.conversationHistory.slice ( -this.maxHistoryLength ) );

        // I add energy data summary if we have data to provide context
        if ( dataToUse && dataToUse.length > 0 ) {
            const dataSummary = this.createDataSummary ( dataToUse );
            messages.push ( { role: 'system', content: `You also have access to this energy data: ${dataSummary}` } );
        }

        // I add the current user message to the conversation
        messages.push ( { role: 'user', content: message } );

        // I log what I'm sending to the API for debugging
        console.log ( '=== DEBUG: Messages being sent to API ===' );
        console.log ( 'Conversation history length:', this.conversationHistory.length );
        console.log ( 'Messages array:', JSON.stringify ( messages, null, 2 ) );
        console.log ( '=== END DEBUG ===' );

        try {
            const response = await fetch ( 'https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify ( {
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    max_tokens: 150,
                    temperature: 0.7
                } )
            } );

            const data = await response.json ( );

            if ( data.error ) {
                return { error: `${getTranslation('API Error:')} ${data.error.message}` };
            }

            const assistantMessage = data.choices[0].message.content;

            // I store only the actual user question and assistant answer
            this.conversationHistory.push ( 
                { role: 'user', content: message },
                { role: 'assistant', content: assistantMessage }
            );

            // I log the conversation history after storing for debugging
            console.log ( '=== DEBUG: Conversation History After Update ===' );
            console.log ( 'History length:', this.conversationHistory.length );
            console.log ( 'History content:', JSON.stringify ( this.conversationHistory, null, 2 ) );
            console.log ( '=== END DEBUG ===' );

            return { response: assistantMessage };

        } catch ( error ) {
            console.error ( 'Chat API error:', error );
            return { error: getTranslation('Failed to connect to the chat service. Please try again.') };
        }
    }

    createConcisePrompt ( message, energyData ) {
        return message;
    }

    createDataSummary ( energyData ) {
        if ( !energyData || !energyData.length ) return 'No data available';

        // I calculate basic statistics from the energy data
        const totalEnergy = energyData.reduce ( ( sum, point ) => sum + ( point.energy || 0 ), 0 );
        const maxPower = Math.max ( ...energyData.map ( point => point.power || 0 ) );
        const minPower = Math.min ( ...energyData.map ( point => point.power || 0 ) );
        const avgPower = energyData.reduce ( ( sum, point ) => sum + ( point.power || 0 ), 0 ) / energyData.length;
        const dataPoints = energyData.length;

        // I analyze the data by time periods
        const timeRange = this.getTimeRange ( energyData );
        const hourlyStats = this.getHourlyStatistics ( energyData );
        const dailyStats = this.getDailyStatistics ( energyData );
        const peakHours = this.getPeakHours ( energyData );
        const lowUsageHours = this.getLowUsageHours ( energyData );

        // I analyze the energy distribution patterns
        const energyDistribution = this.getEnergyDistribution ( energyData );
        const loadFactor = ( avgPower / maxPower ) * 100;
        const variability = this.getVariabilityMetrics ( energyData );

        // I identify outliers in the data
        const outliers = this.getOutlierAnalysis ( energyData );

        return `Energy Data Summary:
- Data points: ${dataPoints}, Period: ${timeRange}
- Total energy: ${totalEnergy.toFixed ( 2 )} kWh
- Power range: ${minPower.toFixed ( 2 )} kW to ${maxPower.toFixed ( 2 )} kW (avg: ${avgPower.toFixed ( 2 )} kW)
- Load factor: ${loadFactor.toFixed ( 1 )}%
- Peak hours: ${peakHours.join ( ', ' )}
- Low usage hours: ${lowUsageHours.join ( ', ' )}
- Energy distribution: ${energyDistribution}
- Variability: ${variability}
- Outliers: ${outliers}
- Hourly patterns: ${hourlyStats}
- Daily patterns: ${dailyStats}`;
    }

    getHourlyStatistics ( energyData ) {
        const hourlyGroups = {};
        energyData.forEach ( point => {
            try {
                const timestamp = new Date ( point.timestamp );
                if ( isNaN ( timestamp.getTime ( ) ) ) return; // I skip invalid dates
                const hour = timestamp.getHours ( );
                if ( !hourlyGroups[hour] ) hourlyGroups[hour] = [];
                hourlyGroups[hour].push ( point );
            } catch ( error ) {
                console.warn ( 'Invalid timestamp in data point:', point );
            }
        } );

        if ( Object.keys ( hourlyGroups ).length === 0 ) {
            return 'No valid hourly data available';
        }

        const hourlyAverages = Object.keys ( hourlyGroups ).map ( hour => {
            const avgEnergy = hourlyGroups[hour].reduce ( ( sum, p ) => sum + ( p.energy || 0 ), 0 ) / hourlyGroups[hour].length;
            return `${hour}:00 (${avgEnergy.toFixed ( 3 )} kWh)`;
        } );

        const topHours = hourlyAverages
            .sort ( ( a, b ) => parseFloat ( b.match ( /\(([\d.]+)/ )[1] ) - parseFloat ( a.match ( /\(([\d.]+)/ )[1] ) )
            .slice ( 0, 3 );

        return `Peak hours: ${topHours.join ( ', ' )}`;
    }

    getDailyStatistics ( energyData ) {
        const dailyGroups = {};
        energyData.forEach ( point => {
            try {
                const timestamp = new Date ( point.timestamp );
                if ( isNaN ( timestamp.getTime ( ) ) ) return; // I skip invalid dates
                const date = timestamp.toDateString ( );
                if ( !dailyGroups[date] ) dailyGroups[date] = [];
                dailyGroups[date].push ( point );
            } catch ( error ) {
                console.warn ( 'Invalid timestamp in data point:', point );
            }
        } );

        if ( Object.keys ( dailyGroups ).length === 0 ) {
            return 'No valid daily data available';
        }

        const dailyTotals = Object.keys ( dailyGroups ).map ( date => {
            const totalEnergy = dailyGroups[date].reduce ( ( sum, p ) => sum + ( p.energy || 0 ), 0 );
            return `${date} (${totalEnergy.toFixed ( 2 )} kWh)`;
        } );

        const sortedDays = dailyTotals.sort ( ( a, b ) => 
            parseFloat ( b.match ( /\(([\d.]+)/ )[1] ) - parseFloat ( a.match ( /\(([\d.]+)/ )[1] ) 
        );

        return `Highest day: ${sortedDays[0]}, Lowest: ${sortedDays[sortedDays.length - 1]}`;
    }

    getPeakHours ( energyData ) {
        const hourlyGroups = {};
        energyData.forEach ( point => {
            try {
                const timestamp = new Date ( point.timestamp );
                if ( isNaN ( timestamp.getTime ( ) ) ) return; // I skip invalid dates
                const hour = timestamp.getHours ( );
                if ( !hourlyGroups[hour] ) hourlyGroups[hour] = [];
                hourlyGroups[hour].push ( point );
            } catch ( error ) {
                console.warn ( 'Invalid timestamp in data point:', point );
            }
        } );

        if ( Object.keys ( hourlyGroups ).length === 0 ) {
            return [ 'No data' ];
        }

        const hourlyAverages = Object.keys ( hourlyGroups ).map ( hour => ({
            hour: parseInt ( hour ),
            avgEnergy: hourlyGroups[hour].reduce ( ( sum, p ) => sum + ( p.energy || 0 ), 0 ) / hourlyGroups[hour].length
        } ) );

        const topHours = hourlyAverages
            .sort ( ( a, b ) => b.avgEnergy - a.avgEnergy )
            .slice ( 0, 3 )
            .map ( h => `${h.hour}:00` );

        return topHours;
    }

    getLowUsageHours ( energyData ) {
        const hourlyGroups = {};
        energyData.forEach ( point => {
            try {
                const timestamp = new Date ( point.timestamp );
                if ( isNaN ( timestamp.getTime ( ) ) ) return; // I skip invalid dates
                const hour = timestamp.getHours ( );
                if ( !hourlyGroups[hour] ) hourlyGroups[hour] = [];
                hourlyGroups[hour].push ( point );
            } catch ( error ) {
                console.warn ( 'Invalid timestamp in data point:', point );
            }
        } );

        if ( Object.keys ( hourlyGroups ).length === 0 ) {
            return [ 'No data' ];
        }

        const hourlyAverages = Object.keys ( hourlyGroups ).map ( hour => ({
            hour: parseInt ( hour ),
            avgEnergy: hourlyGroups[hour].reduce ( ( sum, p ) => sum + ( p.energy || 0 ), 0 ) / hourlyGroups[hour].length
        } ) );

        const lowHours = hourlyAverages
            .sort ( ( a, b ) => a.avgEnergy - b.avgEnergy )
            .slice ( 0, 3 )
            .map ( h => `${h.hour}:00` );

        return lowHours;
    }

    getEnergyDistribution ( energyData ) {
        const energies = energyData.map ( p => p.energy ).sort ( ( a, b ) => a - b );
        const q1 = energies[Math.floor ( energies.length * 0.25 )];
        const q2 = energies[Math.floor ( energies.length * 0.5 )];
        const q3 = energies[Math.floor ( energies.length * 0.75 )];

        return `Q1: ${q1.toFixed ( 3 )} kWh, Median: ${q2.toFixed ( 3 )} kWh, Q3: ${q3.toFixed ( 3 )} kWh`;
    }

    getVariabilityMetrics ( energyData ) {
        const energies = energyData.map ( p => p.energy );
        const mean = energies.reduce ( ( sum, e ) => sum + e, 0 ) / energies.length;
        const variance = energies.reduce ( ( sum, e ) => sum + Math.pow ( e - mean, 2 ), 0 ) / energies.length;
        const stdDev = Math.sqrt ( variance );
        const coefficientOfVariation = ( stdDev / mean ) * 100;

        return `Std dev: ${stdDev.toFixed ( 3 )} kWh, CV: ${coefficientOfVariation.toFixed ( 1 )}%`;
    }

    getOutlierAnalysis ( energyData ) {
        const energies = energyData.map ( p => p.energy ).sort ( ( a, b ) => a - b );
        const q1 = energies[Math.floor ( energies.length * 0.25 )];
        const q3 = energies[Math.floor ( energies.length * 0.75 )];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const outliers = energies.filter ( e => e < lowerBound || e > upperBound );
        const outlierPercentage = ( outliers.length / energies.length ) * 100;

        return `${outliers.length} outliers (${outlierPercentage.toFixed ( 1 )}% of data)`;
    }

    getTimeRange ( energyData ) {
        if ( !energyData || !energyData.length ) return 'N/A';

        const firstPoint = energyData[0];
        const lastPoint = energyData[energyData.length - 1];

        if ( firstPoint.timestamp && lastPoint.timestamp ) {
            const start = new Date ( firstPoint.timestamp ).toLocaleDateString ( );
            const end = new Date ( lastPoint.timestamp ).toLocaleDateString ( );
            return `${start} to ${end}`;
        }

        return `${energyData.length} data points`;
    }

    clearHistory ( ) {
        this.conversationHistory = [ ];
    }

    updateEnergyData ( energyData ) {
        // I update the energy data reference for future queries
        this.currentEnergyData = energyData;
    }
}

export { EnergyDataChat }; 