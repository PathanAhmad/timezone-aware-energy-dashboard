// Here, I handle bilingual support for the energy dashboard
// I manage the language state and provide translations between English and German

class LanguageContext {
    constructor() {
        this.currentLanguage = 'en' // I start with English as the default
        this.translations = {
            en: {
                // I define all the English text strings
                "Energy Insights Dashboard": "Energy Insights Dashboard",
                "Professional energy data analysis with timezone support": "Professional energy data analysis with timezone support",
                "Deutsch": "Deutsch",
                "Load XML Data": "Load XML Data",
                "Sample Datasets:": "Sample Datasets:",
                
                // I define configuration-related text
                "Display Timezone": "Display Timezone",
                "Western European (GMT)": "Western European (GMT)",
                "Central European (GMT+1)": "Central European (GMT+1)",
                "Eastern European (GMT+2)": "Eastern European (GMT+2)",
                "Loaded Data": "Loaded Data",
                "File:": "File:",
                "Original Timezone:": "Original Timezone:",
                
                // I define summary card labels
                "Total Energy": "Total Energy",
                "Peak Power": "Peak Power",
                "Average Power": "Average Power",
                "Data Points": "Data Points",
                
                // I define chart titles and descriptions
                "Load Duration Curve": "Load Duration Curve",
                "Power distribution and optimization potential": "Power distribution and optimization potential",
                "Daily Totals": "Daily Totals",
                "Energy consumed per day": "Energy consumed per day",
                "Hourly Distribution": "Hourly Distribution",
                "Statistical distribution by hour with outliers": "Statistical distribution by hour with outliers",
                "Usage Heatmap": "Usage Heatmap",
                "Intensity by day and hour": "Intensity by day and hour",
                "Energy Flow Analysis": "Energy Flow Analysis",
                "Energy distribution from source to usage patterns": "Energy distribution from source to usage patterns",
                
                // I define chart insight messages
                "Load data to see insights": "Load data to see insights",
                "Awaiting data...": "Awaiting data...",
                "No data to display. Please load an XML file.": "No data to display. Please load an XML file.",
                
                // I define analytics messages with placeholders
                "Peak consumption: {peakPower} kW at {peakTime}. Avg: {avgPower} kW.": "Peak consumption: {peakPower} kW at {peakTime}. Avg: {avgPower} kW.",
                "Load Duration Analysis: Peak {peakPower} kW, Base {baseLoad} kW. {peakReduction} kW reduction potential over {peakHours} hours. Load factor: {loadFactor}%.": "Load Duration Analysis: Peak {peakPower} kW, Base {baseLoad} kW. {peakReduction} kW reduction potential over {peakHours} hours. Load factor: {loadFactor}%.",
                "Highest daily: {maxDayEnergy} kWh on {maxDayDate}. Lowest: {minDayEnergy} kWh on {minDayDate}. Avg daily: {avgDailyEnergy} kWh.": "Highest daily: {maxDayEnergy} kWh on {maxDayDate}. Lowest: {minDayEnergy} kWh on {minDayDate}. Avg daily: {avgDailyEnergy} kWh.",
                "Peak hourly avg: {maxHourEnergy} kWh ({maxHour}:00). Lowest: {minHourEnergy} kWh ({minHour}:00). This suggests a {routineType} pattern.": "Peak hourly avg: {maxHourEnergy} kWh ({maxHour}:00). Lowest: {minHourEnergy} kWh ({minHour}:00). This suggests a {routineType} pattern.",
                "Highest consumption typically on {busiestDay} around {busiestHour}:00. Potential to shift load from peak hours.": "Highest consumption typically on {busiestDay} around {busiestHour}:00. Potential to shift load from peak hours.",
                "Data spans {numDays} days. Viewing in {displayTZ} (Original: {originalTZ}). Shifting peak times across zones highlights scheduling differences.": "Data spans {numDays} days. Viewing in {displayTZ} (Original: {originalTZ}). Shifting peak times across zones highlights scheduling differences.",
                
                // I define chart axis labels
                "Hour of Day": "Hour of Day",
                "Energy Consumption (kWh)": "Energy Consumption (kWh)",
                "Energy (kWh)": "Energy (kWh)",
                "Time (as per indicated timezone)": "Time (as per indicated timezone)",
                "Power (kW)": "Power (kW)",
                "Percentage of Time": "Percentage of Time",
                "Peak": "Peak",
                "Avg": "Avg",
                "Base": "Base",
                "Outlier at": "Outlier at",
                "Value:": "Value:",
                "Energy:": "Energy:",
                "Share:": "Share:",
                "Detect My Timezone": "Detect My Timezone",
                "Current:": "Current:",
                "Popular Timezones": "Popular Timezones",
                "Americas": "Americas",
                "Europe": "Europe",
                "Asia": "Asia",
                "Oceania": "Oceania",
                "Africa": "Africa",
                "Daylight Saving Time": "Daylight Saving Time",
                
                // I define chat functionality text
                "AI Energy Assistant": "Energy Data Assistant",
                "Ask questions about your energy data and get AI-powered insights": "Ask questions about your energy data and get intelligent insights",
                "Start a conversation about your energy data...": "Start a conversation about your energy data...",
                "Send": "Send",
                "Clear": "Clear",
                "Sending...": "Sending...",
                "typing...": "typing...",
                "Failed to send message. Please try again.": "Failed to send message. Please try again.",
                "API key not configured. Please check your .env file.": "API key not configured. Please check your .env file.",
                "API Error:": "API Error:",
                "Failed to connect to AI service. Please try again.": "Failed to connect to the chat service. Please try again.",
                
                // I define chat setup and error messages
                "Chat Setup Required": "Chat Setup Required",
                "Hey! You need an API key to chat": "Hey! You need an API key to chat",
                "To enable the Energy Data Assistant, you need to configure your OpenAI API key. Don't worry - it's super cheap! You can ask hundreds of questions for less than €1.": "To enable the Energy Data Assistant, you need to configure your OpenAI API key. Don't worry - it's super cheap! You can ask hundreds of questions for less than €1.",
                "Don't worry, it's super cheap - like €1 for 1000 questions! I can't include my key here for security reasons, but here's how to get yours:": "Don't worry, it's super cheap - like €1 for 1000 questions! I can't include my key here for security reasons, but here's how to get yours:",
                "Quick Setup Steps:": "Quick Setup Steps:",
                "Get a free API key from": "Get a free API key from",
                "Create a file called": "Create a file called",
                "here": "here",
                "Add:": "Add:",
                "That's it! Let me know if you need help.": "That's it! Let me know if you need help.",
                "Cost Estimate": "Cost Estimate",
                
                // I define date and time format labels
                "Date": "Date",
                "Monday": "Monday",
                "Tuesday": "Tuesday", 
                "Wednesday": "Wednesday",
                "Thursday": "Thursday",
                "Friday": "Friday",
                "Saturday": "Saturday",
                "Sunday": "Sunday",
                "January": "January",
                "February": "February",
                "March": "March",
                "April": "April",
                "May": "May",
                "June": "June",
                "July": "July",
                "August": "August",
                "September": "September",
                "October": "October",
                "November": "November",
                "December": "December"
            },
            de: {
                // I define all the German text strings
                "Energy Insights Dashboard": "Energie-Insights Dashboard",
                "Professional energy data analysis with timezone support": "Professionelle Energiedatenanalyse mit Zeitzonenunterstützung",
                "Deutsch": "English",
                "Load XML Data": "XML-Daten laden",
                "Sample Datasets:": "Beispieldatensätze:",
                
                // I define configuration-related text in German
                "Display Timezone": "Anzeige-Zeitzone",
                "Western European (GMT)": "Westeuropäisch (GMT)",
                "Central European (GMT+1)": "Mitteleuropäisch (GMT+1)",
                "Eastern European (GMT+2)": "Osteuropäisch (GMT+2)",
                "Loaded Data": "Geladene Daten",
                "File:": "Datei:",
                "Original Timezone:": "Ursprüngliche Zeitzone:",
                
                // I define summary card labels in German
                "Total Energy": "Gesamtenergie",
                "Peak Power": "Spitzenleistung",
                "Average Power": "Durchschnittsleistung",
                "Data Points": "Datenpunkte",
                
                // I define chart titles and descriptions in German
                "Load Duration Curve": "Lastdauer-Kurve",
                "Power distribution and optimization potential": "Leistungsverteilung und Optimierungspotenzial",
                "Daily Totals": "Tägliche Summen",
                "Energy consumed per day": "Energie pro Tag verbraucht",
                "Hourly Distribution": "Stündliche Verteilung",
                "Statistical distribution by hour with outliers": "Statistische Verteilung nach Stunde mit Ausreißern",
                "Usage Heatmap": "Verbrauchs-Heatmap",
                "Intensity by day and hour": "Intensität nach Tag und Stunde",
                "Energy Flow Analysis": "Energiefluss-Analyse",
                "Energy distribution from source to usage patterns": "Energieverteilung von Quelle zu Nutzungsmustern",
                
                // I define chart insight messages in German
                "Load data to see insights": "Daten laden für Einblicke",
                "Awaiting data...": "Warte auf Daten...",
                "No data to display. Please load an XML file.": "Keine Daten zum Anzeigen. Bitte laden Sie eine XML-Datei.",
                
                // I define analytics messages with placeholders in German
                "Peak consumption: {peakPower} kW at {peakTime}. Avg: {avgPower} kW.": "Spitzenverbrauch: {peakPower} kW um {peakTime}. Durchschnitt: {avgPower} kW.",
                "Load Duration Analysis: Peak {peakPower} kW, Base {baseLoad} kW. {peakReduction} kW reduction potential over {peakHours} hours. Load factor: {loadFactor}%.": "Lastdauer-Analyse: Spitze {peakPower} kW, Grundlast {baseLoad} kW. {peakReduction} kW Reduktionspotenzial über {peakHours} Stunden. Lastfaktor: {loadFactor}%.",
                "Highest daily: {maxDayEnergy} kWh on {maxDayDate}. Lowest: {minDayEnergy} kWh on {minDayDate}. Avg daily: {avgDailyEnergy} kWh.": "Höchster Tageswert: {maxDayEnergy} kWh am {maxDayDate}. Niedrigster: {minDayEnergy} kWh am {minDayDate}. Durchschnitt täglich: {avgDailyEnergy} kWh.",
                "Peak hourly avg: {maxHourEnergy} kWh ({maxHour}:00). Lowest: {minHourEnergy} kWh ({minHour}:00). This suggests a {routineType} pattern.": "Höchster Stundendurchschnitt: {maxHourEnergy} kWh ({maxHour}:00). Niedrigster: {minHourEnergy} kWh ({minHour}:00). Dies deutet auf ein {routineType}-Muster hin.",
                "Highest consumption typically on {busiestDay} around {busiestHour}:00. Potential to shift load from peak hours.": "Höchster Verbrauch typischerweise am {busiestDay} gegen {busiestHour}:00. Potenzial zur Lastverschiebung von Spitzenzeiten.",
                "Data spans {numDays} days. Viewing in {displayTZ} (Original: {originalTZ}). Shifting peak times across zones highlights scheduling differences.": "Daten umfassen {numDays} Tage. Anzeige in {displayTZ} (Original: {originalTZ}). Die Verschiebung der Spitzenzeiten über Zonen hinweg verdeutlicht Planungsunterschiede.",
                
                // I define chart axis labels in German
                "Hour of Day": "Stunde des Tages",
                "Energy Consumption (kWh)": "Energieverbrauch (kWh)",
                "Energy (kWh)": "Energie (kWh)",
                "Time (as per indicated timezone)": "Zeit (gemäß angegebener Zeitzone)",
                "Power (kW)": "Leistung (kW)",
                "Percentage of Time": "Zeitanteil",
                "Peak": "Spitze",
                "Avg": "Durchschnitt",
                "Base": "Grundlast",
                "Outlier at": "Ausreißer bei",
                "Value:": "Wert:",
                "Energy:": "Energie:",
                "Share:": "Anteil:",
                "Detect My Timezone": "Meine Zeitzone erkennen",
                "Current:": "Aktuell:",
                "Popular Timezones": "Beliebte Zeitzonen",
                "Americas": "Amerika",
                "Europe": "Europa",
                "Asia": "Asien",
                "Oceania": "Ozeanien",
                "Africa": "Afrika",
                "Daylight Saving Time": "Sommerzeit",
                
                // I define chat functionality text in German
                "AI Energy Assistant": "Energie-Daten-Assistent",
                "Ask questions about your energy data and get AI-powered insights": "Stellen Sie Fragen zu Ihren Energiedaten und erhalten Sie intelligente Einblicke",
                "Start a conversation about your energy data...": "Starten Sie ein Gespräch über Ihre Energiedaten...",
                "Send": "Senden",
                "Clear": "Löschen",
                "Sending...": "Wird gesendet...",
                "typing...": "tippt...",
                "Failed to send message. Please try again.": "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
                "API key not configured. Please check your .env file.": "API-Schlüssel nicht konfiguriert. Bitte überprüfen Sie Ihre .env-Datei.",
                "API Error:": "API-Fehler:",
                "Failed to connect to AI service. Please try again.": "Verbindung zum Chat-Service fehlgeschlagen. Bitte versuchen Sie es erneut.",
                
                // I define chat setup and error messages in German
                "Chat Setup Required": "Chat-Einrichtung erforderlich",
                "Please follow step 1 in the README Quick Start section to enable AI chat functionality.": "Bitte befolgen Sie Schritt 1 im README Quick Start Abschnitt, um die Chat-Funktionalität zu aktivieren.",
                "Chat disabled - API key required": "Chat deaktiviert - API-Schlüssel erforderlich",
                "Chat is disabled. Please configure your API key first.": "Chat ist deaktiviert. Bitte konfigurieren Sie zuerst Ihren API-Schlüssel.",
                "Chat is disabled. Please configure your API key first. See the setup instructions above for step-by-step guidance.": "Chat ist deaktiviert. Bitte konfigurieren Sie zuerst Ihren API-Schlüssel. Siehe die oben stehenden Einstellungsanweisungen für Schritt-für-Schritt-Anleitungen.",
                "Try asking: 'What are my peak energy consumption hours?' or 'How can I reduce my energy consumption?'": "Versuchen Sie zu fragen: 'Wann sind meine Spitzenenergieverbrauchszeiten?' oder 'Wie kann ich meinen Energieverbrauch reduzieren?",
                "To enable the Energy Data Assistant, you need to configure your OpenAI API key.": "Um die Energie-Daten-Assistent zu aktivieren, müssen Sie Ihren OpenAI API-Schlüssel konfigurieren.",
                "To enable the Energy Data Assistant, you need to configure your OpenAI API key. Don't worry - it's super cheap! You can ask hundreds of questions for less than €1.": "Um die Energie-Daten-Assistent zu aktivieren, müssen Sie Ihren OpenAI API-Schlüssel konfigurieren. Es ist sehr günstig! Sie können Hunderte von Fragen stellen für weniger als €1.",
                "Don't worry, it's super cheap - like €1 for 1000 questions! I can't include my key here for security reasons, but here's how to get yours:": "Keine Sorge, es ist sehr günstig - etwa €1 für 1000 Fragen! Ich kann meinen Schlüssel hier aus Sicherheitsgründen nicht einbinden, aber so bekommen Sie Ihren:",
                "Quick Setup Steps:": "Schnell-Einrichtungsschritte:",
                "Get a free API key from": "Holen Sie einen kostenlosen API-Schlüssel von",
                "Create a file called": "Erstellen Sie eine Datei namens",
                "here": "hier",
                "Add:": "Fügen Sie hinzu:",
                "That's it! Let me know if you need help.": "Das war's! Lassen Sie mich wissen, wenn Sie Hilfe brauchen.",
                "Hey! You need an API key to chat": "Hey! Sie brauchen einen API-Schlüssel zum Chatten",
                "Cost Estimate": "Kostenabschätzung",
                
                // I define date and time format labels in German
                "Date": "Datum",
                "Monday": "Montag",
                "Tuesday": "Dienstag", 
                "Wednesday": "Mittwoch",
                "Thursday": "Donnerstag",
                "Friday": "Freitag",
                "Saturday": "Samstag",
                "Sunday": "Sonntag",
                "January": "Januar",
                "February": "Februar",
                "March": "März",
                "April": "April",
                "May": "Mai",
                "June": "Juni",
                "July": "Juli",
                "August": "August",
                "September": "September",
                "October": "Oktober",
                "November": "November",
                "December": "Dezember",
                "Refresh this page": "Diese Seite aktualisieren"
            }
        }
        
        this.init()
    }
    
    init() {
        // I set the initial language when the page loads
        this.updateLanguage()
        
        // I add an event listener for the language toggle button
        const languageToggle = document.getElementById('languageToggle')
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.toggleLanguage())
        }
    }
    
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'de' : 'en'
        this.updateLanguage()
        
        // I trigger chart updates if data is loaded to refresh the display
        if (typeof updateCharts === 'function') {
            updateCharts()
        }
    }
    
    updateLanguage() {
        // I update all elements that have data-en and data-de attributes
        document.querySelectorAll('[data-en]').forEach(element => {
            const key = element.getAttribute('data-en')
            const translation = this.getTranslation(key)
            if (translation) {
                element.textContent = translation
            }
        })
        
        // I update the language toggle button text
        const toggleButton = document.getElementById('languageToggle')
        if (toggleButton) {
            const span = toggleButton.querySelector('span')
            if (span) {
                span.textContent = this.currentLanguage === 'en' ? 'Deutsch' : 'English'
            }
        }
    }
    
    getTranslation(key, params = {}) {
        let text = this.translations[this.currentLanguage][key] || 
                   this.translations['en'][key] || 
                   key
        
        // I replace parameters in the text with actual values
        for (const param in params) {
            text = text.replace(`{${param}}`, params[param])
        }
        
        return text
    }
    
    getCurrentLanguage() {
        return this.currentLanguage
    }
}

// I create and export the language context instance
const languageContext = new LanguageContext()

// I export this so other modules can use it
export { languageContext } 