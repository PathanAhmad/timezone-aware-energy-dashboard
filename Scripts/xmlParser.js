import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

// Here, I parse energy data from XML files in the MyEnergyData format
// I handle the XML namespace properly to extract consumption data

class EnergyDataParser {
    constructor() {
        // I set up the XML namespace that MyEnergyData format uses
        this.namespaceURI = 'urn:iec62325.351:tc57wg16:451-10:myenergydatamessage:1:0';
    }

    // Here, I take XML text and extract energy consumption data from it
    parseXMLData(xmlText, countryCodeHint = null) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        // I check if the XML parsing worked properly
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            return { points: [], originalTZ: 'Unknown', originalTZOffset: 0, shortOriginalTZ: 'GMT' };
        }
        // I look for the TimeSeries element using different methods in case namespace is missing
        let timeSeries = xmlDoc.getElementsByTagNameNS(this.namespaceURI, 'TimeSeries')[0];
        if (!timeSeries) { timeSeries = xmlDoc.querySelector('TimeSeries'); }
        if (!timeSeries) { timeSeries = xmlDoc.getElementsByTagName('TimeSeries')[0]; }
        if (!timeSeries) {
            return { points: [], originalTZ: 'Unknown', originalTZOffset: 0, shortOriginalTZ: 'GMT' };
        }
        // I extract the market evaluation point and mRID to figure out the timezone
        let marketEvalPoint = timeSeries.getElementsByTagNameNS(this.namespaceURI, 'MarketEvaluationPoint')[0];
        if (!marketEvalPoint) { marketEvalPoint = timeSeries.querySelector('MarketEvaluationPoint'); }
        let mRID = null;
        if (marketEvalPoint) {
            let mRIDElement = marketEvalPoint.getElementsByTagNameNS(this.namespaceURI, 'mRID')[0];
            if (!mRIDElement) { mRIDElement = marketEvalPoint.querySelector('mRID'); }
            if (mRIDElement) { mRID = mRIDElement.textContent; }
        }
        const tzInfo = this.getOriginalTimezoneInfo(mRID, countryCodeHint);
        // I find all the Period elements that contain the actual data
        let periods = timeSeries.getElementsByTagNameNS(this.namespaceURI, 'Period');
        if (periods.length === 0) { periods = timeSeries.querySelectorAll('Period'); }
        if (periods.length === 0) { periods = timeSeries.getElementsByTagName('Period'); }
        if (periods.length === 0) {
            return { points: [], originalTZ: tzInfo.name, originalTZOffset: tzInfo.offset, shortOriginalTZ: tzInfo.short };
        }
        const data = [];
        // I process each period to extract the data points
        for (let i = 0; i < periods.length; i++) {
            const period = periods[i];
            // I find the timeInterval to get the start time
            let timeInterval = period.getElementsByTagNameNS(this.namespaceURI, 'timeInterval')[0];
            if (!timeInterval) { timeInterval = period.querySelector('timeInterval'); }
            if (!timeInterval) { continue; }
            // I extract the start time from the interval
            let startElement = timeInterval.getElementsByTagNameNS(this.namespaceURI, 'start')[0];
            if (!startElement) { startElement = timeInterval.querySelector('start'); }
            if (!startElement) { continue; }
            // I parse the date using the native Date constructor for robustness
            let periodStartTimeUTC = new Date(startElement.textContent);
            if (isNaN(periodStartTimeUTC.getTime())) { continue; }
            // I find all Point elements in this period
            let points = period.getElementsByTagNameNS(this.namespaceURI, 'Point');
            if (points.length === 0) { points = period.querySelectorAll('Point'); }
            if (points.length === 0) { points = period.getElementsByTagName('Point'); }
            // I process each data point to extract energy values
            for (let j = 0; j < points.length; j++) {
                const point = points[j];
                // I find the position element to know the time offset
                let positionElement = point.getElementsByTagNameNS(this.namespaceURI, 'position')[0];
                if (!positionElement) { positionElement = point.querySelector('position'); }
                // I find the quantity element to get the energy value
                let quantityElement = point.getElementsByTagNameNS(this.namespaceURI, 'quantity')[0];
                if (!quantityElement) { quantityElement = point.querySelector('quantity'); }
                if (!positionElement || !quantityElement) { continue; }
                const position = parseInt(positionElement.textContent);
                const quantity = parseFloat(quantityElement.textContent);
                if (isNaN(position) || isNaN(quantity)) { continue; }
                // I calculate the timestamp in UTC using 15-minute intervals
                const timestampUTC = new Date(periodStartTimeUTC.getTime() + (position - 1) * 15 * 60 * 1000);
                data.push({
                    timestamp_utc: timestampUTC, // I store the timestamp in UTC
                    energy: quantity, // I store the energy in kWh
                    power: quantity * 4, // I convert to kW for 15 min interval
                    position: position,
                });
            }
        }
        if (data.length === 0) {
            return { points: [], originalTZ: tzInfo.name, originalTZOffset: tzInfo.offset, shortOriginalTZ: tzInfo.short };
        }
        // I sort the data by timestamp to ensure chronological order
        data.sort((a,b) => a.timestamp_utc - b.timestamp_utc);
        return { 
            points: data, 
            originalTZ: tzInfo.name, 
            originalTZOffset: tzInfo.offset, 
            shortOriginalTZ: tzInfo.short 
        };
    }

    // I determine the timezone based on the mRID or country code hint
    getOriginalTimezoneInfo(mRID, countryCodeHint = null) {
        let code = '';
        if (mRID) code = mRID.substring(0, 2).toUpperCase();
        else if (countryCodeHint) code = countryCodeHint.toUpperCase();
        switch (code) {
            case 'PT': return { name: 'Western European Time (GMT)', offset: 0, short: 'GMT' };
            case 'GB': return { name: 'Western European Time (GMT)', offset: 0, short: 'GMT' };
            case 'IE': return { name: 'Western European Time (GMT)', offset: 0, short: 'GMT' };
            case 'IS': return { name: 'Western European Time (GMT)', offset: 0, short: 'GMT' };
            case 'DE': return { name: 'Central European Time (GMT+1)', offset: 1, short: 'GMT+1' };
            case 'AT': return { name: 'Central European Time (GMT+1)', offset: 1, short: 'GMT+1' };
            case 'FR': return { name: 'Central European Time (GMT+1)', offset: 1, short: 'GMT+1' };
            case 'EE': return { name: 'Eastern European Time (GMT+2)', offset: 2, short: 'GMT+2' };
            case 'FI': return { name: 'Eastern European Time (GMT+2)', offset: 2, short: 'GMT+2' };
            default: return { name: 'Unknown (assuming GMT)', offset: 0, short: 'GMT' };
        }
    }

    // I validate the XML structure to make sure it has the right format
    validateXMLStructure(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            return { valid: false, error: 'XML parsing failed: ' + parseError.textContent };
        }

        const timeSeries = xmlDoc.getElementsByTagNameNS(this.namespaceURI, 'TimeSeries')[0] || 
                          xmlDoc.querySelector('TimeSeries');
        
        if (!timeSeries) {
            return { valid: false, error: 'No TimeSeries element found' };
        }

        const periods = timeSeries.getElementsByTagNameNS(this.namespaceURI, 'Period') || 
                       timeSeries.querySelectorAll('Period');
        
        if (periods.length === 0) {
            return { valid: false, error: 'No Period elements found' };
        }

        return { valid: true, periods: periods.length };
    }
}

// I export this class so other modules can use it
export { EnergyDataParser }; 