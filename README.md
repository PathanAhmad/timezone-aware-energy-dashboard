## Team Collaboration

This project was developed through close collaboration among team members, with each person contributing their expertise to different aspects of the system. We worked together to design the architecture, implement features, and ensure the final product meets our academic objectives while providing a valuable tool for energy data analysis.

Our team approach involved:
- Meetings to discuss progress and challenges
- Code reviews and collaborative debugging sessions
- Shared decision-making on technical approaches
- Collective testing and quality assurance
- Joint documentation and presentation preparation

## Key Features

**Data Visualization**
- Time series chart with interactive zoom and pan
- Daily distribution bar chart showing hourly patterns
- Box plot analysis for statistical distribution
- Heatmap showing consumption intensity across time
- Energy flow diagram (Sankey chart)

**Timezone Support**
- 60+ timezone options covering global regions
- Automatic timezone detection
- ISO 8601-1 compliant timestamps
- Real-time data conversion between timezones

**AI Chat Assistant**
- OpenAI GPT integration for natural language queries
- German and English language support
- Context-aware responses based on data selected
- Graceful handling when API key is unavailable

**Multi-Country Data**
- Artifical datasets for Germany, Portugal, and Estonia and an actual one for Austria
- Country-specific energy consumption patterns
- XML format support for easy integration
- Custom data upload capability

## Technical Architecture

**Frontend Stack**
- Vanilla JavaScript (No frameworks as instructed)
- D3.js for data visualization
- Tailwind CSS for responsive design
- HTML5 with semantic markup

**Data Processing**
- Custom XML parser for energy data
- Comprehensive timezone utilities
- Data validation and error handling
- Efficient memory management

**AI Integration**
- OpenAI API with GPT-3.5-Turbo, so it costs 0.5 EUR after hundreds of queries
- Optimized prompts for energy analysis
- Error handling and rate limiting
- Secure API communication

## Why These Visualization Choices

**Time Series Chart**: Shows energy consumption patterns over time with interactive zoom and pan. This is the most intuitive way to see trends, peaks, and patterns in energy usage across different time periods.

**Daily Distribution Bar Chart**: Displays consumption patterns by hour of the day. This reveals daily routines, peak usage times, and helps identify when energy is consumed most heavily.

**Box Plot Analysis**: Shows statistical distribution of energy usage by hour. This helps identify outliers, understand the spread of consumption values, and see which hours have the most variable usage.

**Heatmap Visualization**: Color-coded intensity map showing consumption patterns across time periods. This provides a quick visual overview of high and low consumption periods, making it easy to spot patterns at a glance.

**Energy Flow Diagram (Sankey)**: Illustrates energy distribution and flow patterns. This helps understand how energy moves through different systems and where the main consumption occurs.

## Data Format

The project uses standardized XML format for energy data:

```xml
<Publication_MarketDocument>
  <Period>
    <timeInterval>
      <start>2025-05-01T00:00Z</start>
      <end>2025-05-02T00:00Z</end>
    </timeInterval>
    <resolution>PT15M</resolution>
    <Point>
      <position>1</position>
      <quantity>0.023</quantity>
    </Point>
  </Period>
</Publication_MarketDocument>
```

All timestamps follow ISO 8601-1 standard (YYYY-MM-DDTHH:mm:ssZ) for international compatibility.

## Setup and Installation

**Prerequisites**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x for local development server
- OpenAI API key (optional for AI features)

**Quick Start**
1. Create .env file for AI features (optional):
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
2. Start local server:
   ```
   python -m http.server 8000
   ```
3. Open http://localhost:8000 in your browser

**Project Structure**
```
project/
├── index.html              # Main application
├── Scripts/                # JavaScript modules
│   ├── main.js            # Core logic and charts
│   ├── chatLogic.js       # AI chat functionality
│   ├── xmlParser.js       # XML data processing
│   ├── languageContext.js # German/English support
│   └── timezoneUtils.js   # Timezone handling
├── Data/                  # Sample datasets
│   ├── myenergydata_output.xml  # Austria (real data)
│   ├── data_germany.xml   # Germany (simulated)
│   ├── data_portugal.xml  # Portugal (simulated)
│   └── data_estonia.xml   # Estonia (simulated)
├── .env                   # Environment variables
└── README.md              # This file
```

## How to Use

**Loading Data**
- Click country buttons (Austria, Germany, Portugal, Estonia) for sample data
- Upload your own XML files using the file input
- System validates format automatically

**Exploring Charts**
- Time series: Hover for details, drag to zoom, double-click to reset
- Distribution charts: Click legend to toggle series
- Heatmap: Hover for exact values and time information
- Box plot: Identify outliers and statistical patterns

**Timezone Features**
- Click "Detect My Timezone" for automatic setup
- Select from 60+ global timezones manually
- All charts update immediately on timezone change

**AI Chat**
- Ask questions like "What's my peak usage time?"
- Request insights like "Show me patterns in my consumption"
- Get technical explanations for data anomalies

## Sample Datasets

**Country Characteristics**
- Austria (Vienna): Real energy consumption data from actual measurements
- Germany: Artificial dataset with higher industrial usage during work hours
- Portugal: Artificial dataset with elevated evening peaks (Mediterranean lifestyle)
- Estonia: Artificial dataset with lower overall consumption (Nordic patterns)

**Data Quality**
- 14-day coverage for comprehensive analysis
- 15-minute resolution for detailed insights
- Realistic patterns based on typical consumption
- Consistent XML format across all datasets

## Performance and Compatibility

**Optimizations**
- Lazy loading for charts
- Data caching in memory
- Efficient D3.js rendering
- Minimal dependencies

**Browser Support**
- Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- ES6+ features (arrow functions, template literals)
- Modern CSS (Grid, Flexbox)
- Web APIs (Fetch, File, Intl)

## Security and Privacy

**Data Handling**
- All processing happens client-side
- Energy data never leaves your browser
- API keys stored locally in .env file
- Input validation and sanitization

**AI Privacy**
- Only current visualization state sent to OpenAI
- No personal data transmitted
- HTTPS-only API communication
- Built-in rate limiting

## Troubleshooting

**Common Issues**
1. Charts not loading: Check browser console for errors
2. AI chat not working: Verify OpenAI API key in .env
3. Timezone issues: Ensure browser supports Intl API
4. File upload errors: Check XML format matches expected structure

**Debugging**
- Browser console shows detailed error messages
- Network tab monitors API calls
- Performance tab analyzes chart rendering

## Academic Context

**FNS Course Objectives**
This project demonstrates:
- Data visualization techniques
- Modern web development
- AI integration in energy analytics
- Internationalization and timezone handling
- API design and integration

**Learning Outcomes**
- Technical skills: JavaScript, D3.js, CSS, HTML5
- Data analysis and pattern recognition
- User experience design
- Complete application development
- Team collaboration and project management

## Future Enhancements

**Planned Features**
- Real-time data with WebSocket integration
- PDF reports and data export
- Advanced analytics with machine learning
- Progressive Web App capabilities

**Technical Improvements**
- Service workers for offline functionality
- WebAssembly for performance-critical processing
- WebGL for 3D visualizations
- Microservices backend architecture

## Development Guidelines

**Code Quality**
- Follow existing patterns and conventions
- Update documentation for new features
- Test across different browsers
- Monitor and optimize performance

**Best Practices**
- Consistent code formatting
- Clear documentation of complex logic
- Modular component design
- Comprehensive error handling

## Licenses and Acknowledgments

**Open Source**
- D3.js: BSD-3-Clause License
- Tailwind CSS: MIT License
- Project Code: MIT License

**Data Sources**
- Sample data generated from typical consumption patterns
- Country codes follow ISO 3166-1 alpha-2 standard
- Timezone data from IANA Time Zone Database

**AI Development Assistance**
This project was developed with technical guidance from DeepSeek AI for:
- Data visualization implementation
- XML parsing and data processing
- Timezone handling and conversion
- AI integration and prompt engineering
- Documentation and code structure

The core functionality, design decisions, and academic objectives were established by our team, with DeepSeek providing technical assistance and implementation guidance.

## Additional Credits

- **Deepseek**: Used for resolving a few bugs during development.
- **Prettier**: Used for code formatting and style consistency.
- **ChatGPT**: Used for generating code comments and for help with language context logic.

---

Built for the future of energy analytics and sustainable development through collaborative effort. 