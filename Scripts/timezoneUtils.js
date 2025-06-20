class TimezoneUtils {
    constructor() {
        this.timezones = [
            { value: "UTC", label: "UTC (Coordinated Universal Time)", offset: 0 },
            { value: "GMT", label: "GMT (Greenwich Mean Time)", offset: 0 },
            { value: "EST", label: "EST (Eastern Standard Time)", offset: -5 },
            { value: "CST", label: "CST (Central Standard Time)", offset: -6 },
            { value: "MST", label: "MST (Mountain Standard Time)", offset: -7 },
            { value: "PST", label: "PST (Pacific Standard Time)", offset: -8 },
            { value: "CET", label: "CET (Central European Time)", offset: 1 },
            { value: "EET", label: "EET (Eastern European Time)", offset: 2 },
            { value: "WET", label: "WET (Western European Time)", offset: 0 },
            { value: "JST", label: "JST (Japan Standard Time)", offset: 9 },
            { value: "CST_CN", label: "CST (China Standard Time)", offset: 8 },
            { value: "IST", label: "IST (India Standard Time)", offset: 5.5 },
            { value: "AEST", label: "AEST (Australian Eastern Standard Time)", offset: 10 },
            { value: "ACST", label: "ACST (Australian Central Standard Time)", offset: 9.5 },
            { value: "AWST", label: "AWST (Australian Western Standard Time)", offset: 8 },
            { value: "BRT", label: "BRT (Brasília Time)", offset: -3 },
            { value: "ART", label: "ART (Argentina Time)", offset: -3 },
            { value: "CLT", label: "CLT (Chile Standard Time)", offset: -3 },
            { value: "PET", label: "PET (Peru Time)", offset: -5 },
            { value: "SAST", label: "SAST (South Africa Standard Time)", offset: 2 },
            { value: "EAT", label: "EAT (East Africa Time)", offset: 3 },
            { value: "WAT", label: "WAT (West Africa Time)", offset: 1 },
            { value: "MSK", label: "MSK (Moscow Standard Time)", offset: 3 },
            { value: "GST", label: "GST (Gulf Standard Time)", offset: 4 },
            { value: "PKT", label: "PKT (Pakistan Standard Time)", offset: 5 },
            { value: "BST", label: "BST (Bangladesh Standard Time)", offset: 6 },
            { value: "ICT", label: "ICT (Indochina Time)", offset: 7 },
            { value: "KST", label: "KST (Korea Standard Time)", offset: 9 },
            { value: "NZST", label: "NZST (New Zealand Standard Time)", offset: 12 },
            { value: "FJT", label: "FJT (Fiji Time)", offset: 12 },
            { value: "HST", label: "HST (Hawaii Standard Time)", offset: -10 },
            { value: "AKST", label: "AKST (Alaska Standard Time)", offset: -9 },
            { value: "AST", label: "AST (Atlantic Standard Time)", offset: -4 },
            { value: "NST", label: "NST (Newfoundland Standard Time)", offset: -3.5 },
            { value: "CHST", label: "CHST (Chamorro Standard Time)", offset: 10 },
            { value: "SST", label: "SST (Samoa Standard Time)", offset: -11 },
            { value: "CHUT", label: "CHUT (Chuuk Time)", offset: 10 },
            { value: "PONT", label: "PONT (Pohnpei Standard Time)", offset: 11 },
            { value: "KOST", label: "KOST (Kosrae Time)", offset: 11 },
            { value: "MHT", label: "MHT (Marshall Islands Time)", offset: 12 },
            { value: "WAKT", label: "WAKT (Wake Island Time)", offset: 12 },
            { value: "CHADT", label: "CHADT (Chatham Daylight Time)", offset: 13.75 },
            { value: "NZDT", label: "NZDT (New Zealand Daylight Time)", offset: 13 },
            { value: "AEDT", label: "AEDT (Australian Eastern Daylight Time)", offset: 11 },
            { value: "ACDT", label: "ACDT (Australian Central Daylight Time)", offset: 10.5 },
            { value: "AWDT", label: "AWDT (Australian Western Daylight Time)", offset: 9 },
            { value: "EDT", label: "EDT (Eastern Daylight Time)", offset: -4 },
            { value: "CDT", label: "CDT (Central Daylight Time)", offset: -5 },
            { value: "MDT", label: "MDT (Mountain Daylight Time)", offset: -6 },
            { value: "PDT", label: "PDT (Pacific Daylight Time)", offset: -7 },
            { value: "ADT", label: "ADT (Atlantic Daylight Time)", offset: -3 },
            { value: "NDT", label: "NDT (Newfoundland Daylight Time)", offset: -2.5 },
            { value: "AKDT", label: "AKDT (Alaska Daylight Time)", offset: -8 },
            { value: "HADT", label: "HADT (Hawaii-Aleutian Daylight Time)", offset: -9 },
            { value: "BST_UK", label: "BST (British Summer Time)", offset: 1 },
            { value: "CEST", label: "CEST (Central European Summer Time)", offset: 2 },
            { value: "EEST", label: "EEST (Eastern European Summer Time)", offset: 3 },
            { value: "WEST", label: "WEST (Western European Summer Time)", offset: 1 },
            { value: "BRST", label: "BRST (Brasília Summer Time)", offset: -2 },
            { value: "ARST", label: "ARST (Argentina Summer Time)", offset: -2 },
            { value: "CLST", label: "CLST (Chile Summer Time)", offset: -2 },
            { value: "PEST", label: "PEST (Peru Summer Time)", offset: -4 }
        ]
        
        this.currentTimezone = "UTC"
    }

    getTimezoneByValue(value) {
        return this.timezones.find(tz => tz.value === value) || this.timezones[0]
    }

    getCurrentTimezone() {
        return this.currentTimezone
    }

    setCurrentTimezone(timezone) {
        this.currentTimezone = timezone
    }

    getTimezoneOffset(timezone) {
        const tz = this.getTimezoneByValue(timezone)
        return tz ? tz.offset : 0
    }

    convertTimeToTimezone(timestamp, fromTimezone, toTimezone) {
        const fromOffset = this.getTimezoneOffset(fromTimezone)
        const toOffset = this.getTimezoneOffset(toTimezone)
        const offsetDiff = (toOffset - fromOffset) * 3600000 // I convert hours to milliseconds by multiplying by 3600000
        
        return new Date(timestamp.getTime() + offsetDiff)
    }

    convertFromUTC(timestamp, targetTimezone) {
        return this.convertTimeToTimezone(timestamp, "UTC", targetTimezone)
    }

    convertToUTC(timestamp, sourceTimezone) {
        return this.convertTimeToTimezone(timestamp, sourceTimezone, "UTC")
    }

    formatTimezoneLabel(timezone) {
        const tz = this.getTimezoneByValue(timezone)
        if (!tz) return timezone
        
        const offset = tz.offset >= 0 ? `+${tz.offset}` : `${tz.offset}`
        return `${tz.label} (UTC${offset})`
    }

    getTimezoneOptions() {
        return this.timezones.map(tz => ({
            value: tz.value,
            label: this.formatTimezoneLabel(tz.value)
        }))
    }

    detectUserTimezone() {
        try {
            const userOffset = -new Date().getTimezoneOffset() / 60
            const closest = this.timezones.reduce((prev, curr) => {
                return Math.abs(curr.offset - userOffset) < Math.abs(prev.offset - userOffset) ? curr : prev
            })
            return closest.value
        } catch (error) {
            return "UTC"
        }
    }

    getTimezoneGroups() {
        const groups = {
            "Americas": ["EST", "CST", "MST", "PST", "AST", "NST", "HST", "AKST", "BRT", "ART", "CLT", "PET"],
            "Europe": ["UTC", "GMT", "WET", "CET", "EET", "WEST", "CEST", "EEST", "BST_UK"],
            "Asia": ["JST", "CST_CN", "IST", "KST", "GST", "PKT", "BST", "ICT", "MSK"],
            "Oceania": ["AEST", "ACST", "AWST", "NZST", "FJT", "CHST", "CHUT", "PONT", "KOST", "MHT", "WAKT"],
            "Africa": ["SAST", "EAT", "WAT"],
            "Pacific": ["HST", "AKST", "CHST", "SST", "CHUT", "PONT", "KOST", "MHT", "WAKT"],
            "Daylight Saving": ["EDT", "CDT", "MDT", "PDT", "ADT", "NDT", "AKDT", "HADT", "BST_UK", "CEST", "EEST", "WEST", "BRST", "ARST", "CLST", "PEST", "CHADT", "NZDT", "AEDT", "ACDT", "AWDT"]
        }
        
        return groups
    }
}

export default TimezoneUtils; 