import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"
import { EnergyDataParser } from "./xmlParser.js"
import { languageContext } from "./languageContext.js"
import TimezoneUtils from "./timezoneUtils.js"
import { EnergyDataChat } from "./chatLogic.js"

// Here, I keep global variables for energy data and timezone state
let energyData = { points: [], fileName: "", originalTZ: "" }
let timezoneUtils = new TimezoneUtils()
let currentTimezone = timezoneUtils.getCurrentTimezone()
let energyDataChat = null

// Here, I set up the XML parser for energy data
const xmlParser = new EnergyDataParser()

// Here, I create a D3 tooltip for interactive charts
const tooltip = d3.select(".tooltip")

// Here, I provide a translation helper using the language context
function getTranslation(key, params = {}) {
    return languageContext.getTranslation(key, params)
}

// Here, I adjust timestamps in the data to the selected timezone
function getDisplayAdjustedData(dataPoints) {
  const targetOffset = timezoneUtils.getTimezoneOffset(currentTimezone)
  return dataPoints.map((d) => ({
    ...d,
    timestamp: timezoneUtils.convertFromUTC(d.timestamp_utc, currentTimezone),
  }))
}

// Here, I update the summary cards with total, peak, and average values
function updateSummary(data) {
  if (!data || data.length === 0) {
    document.getElementById("totalEnergy").textContent = "0 kWh"
    document.getElementById("peakPower").textContent = "0 kW"
    document.getElementById("avgPower").textContent = "0 kW"
    document.getElementById("dataPoints").textContent = "0"
    return
  }
  const totalEnergy = data.reduce((sum, d) => sum + d.energy, 0)
  const peakPower = d3.max(data, (d) => d.power)
  const avgPower = d3.mean(data, (d) => d.power)

  document.getElementById("totalEnergy").textContent = `${totalEnergy.toFixed(2)} kWh`
  document.getElementById("peakPower").textContent = `${peakPower.toFixed(2)} kW`
  document.getElementById("avgPower").textContent = `${avgPower ? avgPower.toFixed(2) : 0} kW`
  document.getElementById("dataPoints").textContent = data.length
}

// Here, I load a preloaded XML file and parse it for energy data
async function loadPreloadedXML(filename, countryCodeHint) {
  try {
    console.log(`Loading XML file: ${filename}`)
    const response = await fetch(filename)
    if (!response.ok) {
      const msg = `Failed to load ${filename}: ${response.statusText}`
      console.error(msg)
      alert(msg)
      return
    }
    const text = await response.text()
    console.log(`XML content length: ${text.length} characters`)

    if (!text.trim()) {
      const msg = "XML file is empty. Please check the file."
      console.error(msg)
      alert(msg)
      return
    }

    // Here, I log the first part of the XML for debugging
    console.log("XML first 500 characters:", text.substring(0, 500))
    
    // Here, I call the XML parser with a country code hint
    console.log("Calling XML parser with country hint:", countryCodeHint)
    energyData = xmlParser.parseXMLData(text, countryCodeHint)
    
    console.log("Parser returned:", energyData)
    console.log("Number of points:", energyData.points.length)

    if (energyData.points.length === 0) {
      const msg = "No data points found in XML. Please check the file format."
      console.error(msg)
      console.error("Parser result:", energyData)
      alert(msg)
      return
    }

    energyData.fileName = filename
    document.getElementById("loadedFileName").textContent = energyData.fileName
    document.getElementById("originalFileTimezone").textContent = energyData.originalTZ
    document.getElementById("dataInfo").classList.remove("hidden")
    updateCharts()
    
    // Here, I re-initialize the chat with the new data
    if (energyDataChat) {
      energyDataChat.updateEnergyData(energyData.points)
    }
    
    console.log(`Successfully loaded ${energyData.points.length} data points`)
  } catch (error) {
    const msg = `Error processing ${filename}: ${error && error.message ? error.message : error}`
    console.error(msg)
    console.error("Full error stack:", error && error.stack ? error.stack : error)
    alert(msg)
  }
}

// Here, I handle file uploads from the user and parse the XML
function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      energyData = xmlParser.parseXMLData(e.target.result)
      energyData.fileName = file.name
      document.getElementById("loadedFileName").textContent = energyData.fileName
      document.getElementById("originalFileTimezone").textContent = energyData.originalTZ
      document.getElementById("dataInfo").classList.remove("hidden")
      updateCharts()
    }
    reader.readAsText(file)
  }
}

// Here, I update the timezone when the user changes the selection
function handleTimezoneChange() {
  currentTimezone = document.getElementById("timezoneSelect").value
  timezoneUtils.setCurrentTimezone(currentTimezone)
  updateCurrentTimezoneDisplay()
  updateCharts()
}

// Here, I update the display to show the current timezone
function updateCurrentTimezoneDisplay() {
  const display = document.getElementById("currentTimezoneDisplay")
  const tz = timezoneUtils.getTimezoneByValue(currentTimezone)
  if (display && tz) {
    const offset = tz.offset >= 0 ? `+${tz.offset}` : `${tz.offset}`
    display.textContent = `Current: ${tz.label} (UTC${offset})`
  }
}

// Here, I set up the timezone selector and detection button
function initializeTimezoneSelector() {
  const timezoneSelect = document.getElementById("timezoneSelect")
  const detectBtn = document.getElementById("detectTimezoneBtn")
  
  // Here, I set the default timezone in the selector
  timezoneSelect.value = currentTimezone
  updateCurrentTimezoneDisplay()
  
  // Here, I add event listeners for timezone changes and detection
  timezoneSelect.addEventListener("change", handleTimezoneChange)
  
  detectBtn.addEventListener("click", () => {
    const detectedTz = timezoneUtils.detectUserTimezone()
    timezoneSelect.value = detectedTz
    currentTimezone = detectedTz
    timezoneUtils.setCurrentTimezone(detectedTz)
    updateCurrentTimezoneDisplay()
    updateCharts()
  })
}

// Here, I create the main line chart for the load duration curve and insights
function createLineChart(data, chartId, insightId) {
  const container = d3.select(`#${chartId}`)
  container.selectAll("*").remove()
  if (!data || data.length === 0) {
    container
      .append("p")
      .attr("class", "text-center text-gray-500 p-4")
      .text(getTranslation("No data to display. Please load an XML file."))
    d3.select(`#${insightId}`).html(getTranslation("Awaiting data..."))
    return
  }

  const margin = { top: 20, right: 50, bottom: 50, left: 60 }
  const width = container.node().getBoundingClientRect().width - margin.left - margin.right
  const height = 350 - margin.top - margin.bottom

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  // Here, I sort power values descending and plot against cumulative percentage for the load duration curve
  const sortedPower = data.map(d => d.power).sort((a, b) => b - a)
  const totalPoints = sortedPower.length
  const loadDurationData = sortedPower.map((power, index) => ({
    power: power,
    duration: ((index + 1) / totalPoints) * 100, // Here, I calculate the percentage of time
    hours: ((index + 1) / totalPoints) * (totalPoints * 0.25) // Here, I estimate hours assuming 15-min intervals
  }))

  const x = d3.scaleLinear().range([0, width])
  const y = d3.scaleLinear().range([height, 0])

  x.domain([0, 100]) // Here, I set the x-axis to show duration percentage
  y.domain([0, d3.max(loadDurationData, d => d.power) * 1.1 || 10])

  // Here, I add grid lines to the chart
  svg
    .append("g")
    .attr("class", "grid-line")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10).tickSize(-height).tickFormat(""))

  svg.append("g").attr("class", "grid-line").call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))

  // Here, I draw the load duration curve line
  const line = d3
    .line()
    .x(d => x(d.duration))
    .y(d => y(d.power))
    .curve(d3.curveMonotoneX)

  // Here, I fill the area under the curve for visual impact
  const area = d3
    .area()
    .x(d => x(d.duration))
    .y0(height)
    .y1(d => y(d.power))
    .curve(d3.curveMonotoneX)

  svg.append("path").datum(loadDurationData).attr("class", "chart-area").attr("d", area)
  svg.append("path").datum(loadDurationData).attr("class", "chart-line").attr("d", line)

  // Here, I add reference lines for peak, average, and base load
  const peakPower = d3.max(loadDurationData, d => d.power)
  const avgPower = d3.mean(loadDurationData, d => d.power)
  const baseLoad = d3.quantile(loadDurationData.map(d => d.power), 0.8) // Here, I use the 80th percentile

  // Here, I draw the peak power reference line
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(peakPower))
    .attr("y2", y(peakPower))
    .attr("stroke", "#ef4444")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,3")
    .attr("opacity", 0.7)

  svg.append("text")
    .attr("x", width - 5)
    .attr("y", y(peakPower) - 5)
    .attr("text-anchor", "end")
    .attr("font-size", "10px")
    .attr("fill", "#ef4444")
    .text(`${getTranslation("Peak")}: ${peakPower.toFixed(1)} kW`)

  // Here, I draw the average power reference line
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(avgPower))
    .attr("y2", y(avgPower))
    .attr("stroke", "#10b981")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,3")
    .attr("opacity", 0.7)

  svg.append("text")
    .attr("x", width - 5)
    .attr("y", y(avgPower) - 5)
    .attr("text-anchor", "end")
    .attr("font-size", "10px")
    .attr("fill", "#10b981")
    .text(`${getTranslation("Avg")}: ${avgPower.toFixed(1)} kW`)

  // Here, I draw the base load reference line
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(baseLoad))
    .attr("y2", y(baseLoad))
    .attr("stroke", "#3b82f6")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,3")
    .attr("opacity", 0.7)

  svg.append("text")
    .attr("x", width - 5)
    .attr("y", y(baseLoad) - 5)
    .attr("text-anchor", "end")
    .attr("font-size", "10px")
    .attr("fill", "#3b82f6")
    .text(`${getTranslation("Base")}: ${baseLoad.toFixed(1)} kW`)

  // Here, I draw the axes for the chart
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10).tickFormat(d => `${d}%`))

  svg.append("g").call(
    d3
      .axisLeft(y)
      .ticks(5)
      .tickFormat((d) => `${d.toFixed(1)} kW`),
  )

  // Here, I add axis labels
  svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .text(getTranslation("Percentage of Time"))

  svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 15)
    .attr("x", -height / 2)
    .text(getTranslation("Power (kW)"))

  // Here, I set up the interactive tooltip for the chart
  const focus = svg.append("g").style("display", "none")
  focus.append("circle").attr("r", 4).attr("class", "radar-dot")

  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", () => {
      focus.style("display", null)
      tooltip.style("opacity", 1)
    })
    .on("mouseout", () => {
      focus.style("display", "none")
      tooltip.style("opacity", 0)
    })
    .on("mousemove", (event) => {
      const [mouseX] = d3.pointer(event)
      const duration = x.invert(mouseX)
      const bisect = d3.bisector(d => d.duration).left
      const i = bisect(loadDurationData, duration, 1)
      const d0 = loadDurationData[i - 1]
      const d1 = loadDurationData[i]
      const d = d1 && duration - d0.duration > d1.duration - duration ? d1 : d0

      if (d) {
        focus.attr("transform", `translate(${x(d.duration)},${y(d.power)})`)
        tooltip
          .html(
            `<strong>${d.duration.toFixed(1)}% of time</strong><br/>Power: ${d.power.toFixed(2)} kW<br/>Hours: ${d.hours.toFixed(1)}h`,
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      }
    })

  // Here, I calculate and display energy insights based on the load duration curve
  const peakReductionPotential = peakPower - baseLoad
  const peakHours = loadDurationData.filter(d => d.power > baseLoad).length * 0.25 // Here, I convert to hours
  const loadFactor = (avgPower / peakPower) * 100

  d3.select(`#${insightId}`).html(
    getTranslation("Load Duration Analysis: Peak {peakPower} kW, Base {baseLoad} kW. {peakReduction} kW reduction potential over {peakHours} hours. Load factor: {loadFactor}%.", {
      peakPower: peakPower.toFixed(1),
      baseLoad: baseLoad.toFixed(1),
      peakReduction: peakReductionPotential.toFixed(1),
      peakHours: peakHours.toFixed(1),
      loadFactor: loadFactor.toFixed(0)
    }),
  )
}

function createBarChart(data, chartId, insightId) {
  const container = d3.select(`#${chartId}`)
  container.selectAll("*").remove()
  if (!data || data.length === 0) {
    container
      .append("p")
      .attr("class", "text-center text-gray-500 p-4")
      .text(getTranslation("No data to display. Please load an XML file."))
    d3.select(`#${insightId}`).html(getTranslation("Awaiting data..."))
    return
  }

  const dailyData = Array.from(
    d3.group(data, (d) => d3.timeDay.floor(d.timestamp)),
    ([key, values]) => ({
      date: key,
      energy: d3.sum(values, (v) => v.energy),
    }),
  ).sort((a, b) => a.date - b.date)

  if (dailyData.length === 0) {
    container
      .append("p")
      .attr("class", "text-center text-gray-500 p-4")
      .text(getTranslation("No daily data to display."))
    d3.select(`#${insightId}`).html(getTranslation("Awaiting data..."))
    return
  }

  const margin = { top: 20, right: 30, bottom: 70, left: 60 }
  const width = container.node().getBoundingClientRect().width - margin.left - margin.right
  const height = 350 - margin.top - margin.bottom

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  const x = d3.scaleBand().range([0, width]).padding(0.2)
  const y = d3.scaleLinear().range([height, 0])

  x.domain(dailyData.map((d) => d.date))
  y.domain([0, d3.max(dailyData, (d) => d.energy) * 1.1 || 10])

  svg.append("g").attr("class", "grid-line").call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))

  // Better x-axis for daily data
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(x).tickFormat((d) => {
        if (dailyData.length <= 7) {
          return d3.timeFormat("%a %m/%d")(d)
        } else if (dailyData.length <= 31) {
          return d3.timeFormat("%m/%d")(d)
        } else {
          return d3.timeFormat("%m/%d")(d)
        }
      }),
    )
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)")

  svg.append("g").call(
    d3
      .axisLeft(y)
      .ticks(5)
      .tickFormat((d) => `${d.toFixed(1)} kWh`),
  )

  // Improved bar tooltips
  svg
    .selectAll(".bar")
    .data(dailyData)
    .enter()
    .append("rect")
    .attr("class", "chart-bar")
    .attr("x", (d) => x(d.date))
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d.energy))
    .attr("height", (d) => height - y(d.energy))
    .on("mouseover", function (event, d) {
      d3.select(this).style("fill", "#2563eb")
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d3.timeFormat("%A, %B %d, %Y")(d.date)}</strong><br/>${d.energy.toFixed(2)} kWh`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px")
    })
    .on("mouseout", function () {
      d3.select(this).style("fill", "#3b82f6")
      tooltip.style("opacity", 0)
    })

  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text(getTranslation("Date"))
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 15)
    .attr("x", -height / 2)
    .text(getTranslation("Total Energy (kWh)"))

  // Insight
  const maxDay = d3.max(dailyData, (d) => d.energy)
  const minDay = d3.min(dailyData, (d) => d.energy)
  const avgDaily = d3.mean(dailyData, (d) => d.energy)
  const maxDayData = dailyData.find((d) => d.energy === maxDay)
  const minDayData = dailyData.find((d) => d.energy === minDay)
  d3.select(`#${insightId}`).html(
    getTranslation(
      "Highest daily: {maxDayEnergy} kWh on {maxDayDate}. Lowest: {minDayEnergy} kWh on {minDayDate}. Avg daily: {avgDailyEnergy} kWh.",
      {
        maxDayEnergy: maxDay.toFixed(2),
        maxDayDate: maxDayData ? d3.timeFormat("%b %d")(maxDayData.date) : "N/A",
        minDayEnergy: minDay.toFixed(2),
        minDayDate: minDayData ? d3.timeFormat("%b %d")(minDayData.date) : "N/A",
        avgDailyEnergy: avgDaily.toFixed(2),
      },
    ),
  )
}

function createBoxPlotChart(data, chartId, insightId) {
  const container = d3.select(`#${chartId}`)
  container.selectAll("*").remove()
  if (!data || data.length === 0) {
    container
      .append("p")
      .attr("class", "text-center text-gray-500 p-4")
      .text(getTranslation("No data to display. Please load an XML file."))
    d3.select(`#${insightId}`).html(getTranslation("Awaiting data..."))
    return
  }

  // Group data by hour and calculate statistics
  const hourlyStats = Array.from(
    d3.group(data, (d) => d.timestamp.getHours()),
    ([hour, values]) => {
      const energies = values.map(v => v.energy).sort((a, b) => a - b)
      const q1 = d3.quantile(energies, 0.25)
      const q2 = d3.quantile(energies, 0.5)
      const q3 = d3.quantile(energies, 0.75)
      const iqr = q3 - q1
      const lowerWhisker = Math.max(q1 - 1.5 * iqr, d3.min(energies))
      const upperWhisker = Math.min(q3 + 1.5 * iqr, d3.max(energies))
      
      // Find outliers
      const outliers = energies.filter(e => e < lowerWhisker || e > upperWhisker)
      
      return {
        hour: hour,
        q1: q1,
        q2: q2,
        q3: q3,
        lowerWhisker: lowerWhisker,
        upperWhisker: upperWhisker,
        outliers: outliers,
        count: energies.length
      }
    }
  ).sort((a, b) => a.hour - b.hour)

  if (hourlyStats.length === 0) {
    container
      .append("p")
      .attr("class", "text-center text-gray-500 p-4")
      .text(getTranslation("No hourly data to display."))
    d3.select(`#${insightId}`).html(getTranslation("Awaiting data..."))
    return
  }

  const margin = { top: 40, right: 40, bottom: 60, left: 60 }
  const width = container.node().getBoundingClientRect().width - margin.left - margin.right
  const height = 350 - margin.top - margin.bottom

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  const x = d3.scaleBand()
    .domain(hourlyStats.map(d => d.hour))
    .range([0, width])
    .padding(0.1)

  const y = d3.scaleLinear()
    .domain([0, d3.max(hourlyStats, d => d.upperWhisker) * 1.1])
    .range([height, 0])

  // Grid lines
  svg.append("g")
    .attr("class", "grid-line")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))

  // X-axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d => `${d}:00`).tickValues([0, 3, 6, 9, 12, 15, 18, 21]))
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("dy", "0.35em")

  // Y-axis
  svg.append("g")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d.toFixed(2)} kWh`))

  // Box plots
  const boxWidth = x.bandwidth() * 0.8

  // Whiskers
  svg.selectAll(".whisker")
    .data(hourlyStats)
    .enter()
    .append("line")
    .attr("class", "whisker")
    .attr("x1", d => x(d.hour) + x.bandwidth() / 2)
    .attr("x2", d => x(d.hour) + x.bandwidth() / 2)
    .attr("y1", d => y(d.upperWhisker))
    .attr("y2", d => y(d.lowerWhisker))
    .style("stroke", "#374151")
    .style("stroke-width", 1)

  // Box rectangles
  svg.selectAll(".box")
    .data(hourlyStats)
    .enter()
    .append("rect")
    .attr("class", "box")
    .attr("x", d => x(d.hour) + (x.bandwidth() - boxWidth) / 2)
    .attr("y", d => y(d.q3))
    .attr("width", boxWidth)
    .attr("height", d => y(d.q1) - y(d.q3))
    .style("fill", "#8B5CF6")
    .style("stroke", "#6D28D9")
    .style("stroke-width", 1)
    .on("mouseover", function(event, d) {
      tooltip
        .style("opacity", 1)
        .html(`${d.hour}:00-${d.hour + 1}:00<br/>
               Median: ${d.q2.toFixed(3)} kWh<br/>
               Q1: ${d.q1.toFixed(3)} kWh<br/>
               Q3: ${d.q3.toFixed(3)} kWh<br/>
               Outliers: ${d.outliers.length}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px")
    })
    .on("mouseout", () => tooltip.style("opacity", 0))

  // Median lines
  svg.selectAll(".median")
    .data(hourlyStats)
    .enter()
    .append("line")
    .attr("class", "median")
    .attr("x1", d => x(d.hour) + (x.bandwidth() - boxWidth) / 2)
    .attr("x2", d => x(d.hour) + (x.bandwidth() + boxWidth) / 2)
    .attr("y1", d => y(d.q2))
    .attr("y2", d => y(d.q2))
    .style("stroke", "#1F2937")
    .style("stroke-width", 2)

  // Outliers
  svg.selectAll(".outlier")
    .data(hourlyStats.flatMap(d => d.outliers.map(o => ({ hour: d.hour, value: o }))))
    .enter()
    .append("circle")
    .attr("class", "outlier")
    .attr("cx", d => x(d.hour) + x.bandwidth() / 2)
    .attr("cy", d => y(d.value))
    .attr("r", 2)
    .style("fill", "#EF4444")
    .style("stroke", "#DC2626")
    .style("stroke-width", 1)
    .on("mouseover", function(event, d) {
      tooltip
        .style("opacity", 1)
        .html(`${getTranslation("Outlier at")} ${d.hour}:00<br/>${getTranslation("Value:")} ${d.value.toFixed(3)} kWh`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px")
    })
    .on("mouseout", () => tooltip.style("opacity", 0))

  // Axis labels
  svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text(getTranslation("Hour of Day"))

  svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 15)
    .attr("x", -height / 2)
    .text(getTranslation("Energy Consumption (kWh)"))

  // Insight analysis
  const maxMedian = d3.max(hourlyStats, d => d.q2)
  const minMedian = d3.min(hourlyStats, d => d.q2)
  const maxHour = hourlyStats.find(d => d.q2 === maxMedian)
  const minHour = hourlyStats.find(d => d.q2 === minMedian)
  
  const totalOutliers = hourlyStats.reduce((sum, d) => sum + d.outliers.length, 0)
  const highVariabilityHours = hourlyStats.filter(d => (d.q3 - d.q1) / d.q2 > 0.5)
  
  let routineType = "mixed"
  if (maxHour) {
    if (maxHour.hour >= 6 && maxHour.hour <= 9) routineType = "morning peak"
    else if (maxHour.hour >= 17 && maxHour.hour <= 21) routineType = "evening peak"
    else if (maxHour.hour >= 22 || maxHour.hour <= 5) routineType = "night activity"
    else routineType = "daytime usage"
  }

  const insight = `Peak median: ${maxMedian.toFixed(3)} kWh (${maxHour.hour}:00). Lowest: ${minMedian.toFixed(3)} kWh (${minHour.hour}:00). ${totalOutliers} outliers detected. ${highVariabilityHours.length} hours show high variability. Suggests ${routineType} pattern.`

  d3.select(`#${insightId}`).html(insight)
}

function createHeatmap(data, chartId, insightId) {
  const container = d3.select(`#${chartId}`)
  container.selectAll("*").remove()
  if (!data || data.length === 0) {
    container
      .append("p")
      .attr("class", "text-center text-gray-500 p-4")
      .text(getTranslation("No data to display. Please load an XML file."))
    d3.select(`#${insightId}`).html(getTranslation("Awaiting data..."))
    return
  }

  const dataByDayHour = Array.from(
    d3.group(
      data,
      (d) => d3.timeDay.floor(d.timestamp),
      (d) => d.timestamp.getHours(),
    ),
    ([date, hourMap]) =>
      Array.from(hourMap, ([hour, values]) => ({
        date: date,
        hour: hour,
        energy: d3.sum(values, (v) => v.energy),
      })),
  )
    .flat()
    .sort((a, b) => a.date - b.date || a.hour - b.hour)

  if (dataByDayHour.length === 0) {
    container.append("p").attr("class", "text-center text-gray-500 p-4").text(getTranslation("No data for heatmap."))
    d3.select(`#${insightId}`).html(getTranslation("Awaiting data..."))
    return
  }

  const days = Array.from(new Set(dataByDayHour.map((d) => d.date.getTime()))).map((t) => new Date(t)).sort((a, b) => a - b)
  const hours = Array.from(new Set(dataByDayHour.map((d) => d.hour))).sort((a, b) => a - b)

  const margin = { top: 50, right: 50, bottom: 70, left: 80 }
  const cellSize = Math.min(
    25,
    (container.node().getBoundingClientRect().width - margin.left - margin.right) / hours.length,
  )
  const width = hours.length * cellSize
  const height = days.length * cellSize

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  const dayFormat = d3.timeFormat("%a %d")
  const hourFormat = (d) => `${d}:00`

  const xScale = d3.scaleBand().range([0, width]).domain(hours).padding(0.05)
  const yScale = d3.scaleBand().range([0, height]).domain(days).padding(0.05)
  const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, d3.max(dataByDayHour, (d) => d.energy) || 1])

  svg
    .selectAll()
    .data(dataByDayHour, (d) => `${d.date.getTime()}:${d.hour}`)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.hour))
    .attr("y", (d) => yScale(d.date))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .style("fill", (d) => colorScale(d.energy))
    .on("mouseover", function (event, d) {
      d3.select(this).style("stroke", "black").style("stroke-width", 1.5)
      tooltip
        .style("opacity", 1)
        .html(`${dayFormat(d.date)} ${d.hour}:00<br/>${d.energy.toFixed(2)} kWh`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
    })
    .on("mouseout", function () {
      d3.select(this).style("stroke", "none")
      tooltip.style("opacity", 0)
    })

  svg
    .append("g")
    .call(d3.axisTop(xScale).tickFormat(hourFormat))
    .selectAll("text")
    .style("text-anchor", "start")
    .attr("dx", ".5em")
    .attr("dy", ".5em")
    .attr("transform", "rotate(-45)")
  svg.append("g").call(d3.axisLeft(yScale).tickFormat(dayFormat))

  // Legend
  const legendWidth = Math.min(width, 300)
  const legendCellSize = 15
  const legendPadding = 10
  const legend = svg.append("g").attr("transform", `translate(0, ${height + margin.bottom - legendCellSize - 25})`)

  const legendScale = d3.scaleLinear().domain(colorScale.domain()).range([0, legendWidth])

  const legendAxis = d3.axisBottom(legendScale).ticks(5).tickSize(legendCellSize)

  legend
    .append("g")
    .selectAll("rect")
    .data(
      d3.range(
        legendScale.domain()[0],
        legendScale.domain()[1],
        (legendScale.domain()[1] - legendScale.domain()[0]) / 50,
      ),
    )
    .enter()
    .append("rect")
    .attr("x", (d) => legendScale(d))
    .attr("y", 0)
    .attr("width", legendWidth / 50)
    .attr("height", legendCellSize)
    .attr("fill", (d) => colorScale(d))

  legend.call(legendAxis).select(".domain").remove()
  legend
    .append("text")
    .attr("class", "axis-label")
    .attr("x", legendWidth / 2)
    .attr("y", -legendPadding + 2)
    .attr("text-anchor", "middle")
    .text(getTranslation("Energy (kWh)"))

  // Insight
  const busiest = d3.max(dataByDayHour, (d) => d.energy)
  const busiestData = dataByDayHour.find((d) => d.energy === busiest)
  d3.select(`#${insightId}`).html(
    getTranslation(
      "Highest consumption typically on {busiestDay} around {busiestHour}:00. Potential to shift load from peak hours.",
      {
        busiestDay: busiestData ? dayFormat(busiestData.date) : "N/A",
        busiestHour: busiestData ? busiestData.hour : "N/A",
      },
    ),
  )
}

function createSankeyChart(dataPoints, chartId, insightId) {
  const container = d3.select(`#${chartId}`)
  container.selectAll("*").remove()
  if (!dataPoints || dataPoints.length === 0) {
    container
      .append("p")
      .attr("class", "text-center text-gray-500 p-4")
      .text(getTranslation("No data to display. Please load an XML file."))
    d3.select(`#${insightId}`).html(getTranslation("Awaiting data..."))
    return
  }

  const margin = { top: 20, right: 20, bottom: 20, left: 20 }
  const width = container.node().getBoundingClientRect().width - margin.left - margin.right
  const height = 350 - margin.top - margin.bottom

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  // Analyze energy flow patterns
  const totalEnergy = d3.sum(dataPoints, d => d.energy)
  const peakPower = d3.max(dataPoints, d => d.power)
  const avgPower = d3.mean(dataPoints, d => d.power)
  
  // Categorize usage by time periods
  const timeCategories = {
    "Peak Hours (6-9, 17-21)": 0,
    "Off-Peak Hours (10-16)": 0,
    "Night Hours (22-5)": 0
  }
  
  dataPoints.forEach(d => {
    const hour = d.timestamp.getHours()
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 21)) {
      timeCategories["Peak Hours (6-9, 17-21)"] += d.energy
    } else if (hour >= 10 && hour <= 16) {
      timeCategories["Off-Peak Hours (10-16)"] += d.energy
    } else {
      timeCategories["Night Hours (22-5)"] += d.energy
    }
  })

  // Create Sankey data structure
  const nodes = [
    { id: "Energy Source", x: 0, y: height / 2 },
    { id: "Peak Hours", x: width * 0.3, y: height * 0.2 },
    { id: "Off-Peak Hours", x: width * 0.3, y: height * 0.5 },
    { id: "Night Hours", x: width * 0.3, y: height * 0.8 },
    { id: "High Usage", x: width * 0.7, y: height * 0.15 },
    { id: "Medium Usage", x: width * 0.7, y: height * 0.5 },
    { id: "Low Usage", x: width * 0.7, y: height * 0.85 }
  ]

  const links = [
    {
      source: "Energy Source",
      target: "Peak Hours",
      value: timeCategories["Peak Hours (6-9, 17-21)"],
      color: "#EF4444"
    },
    {
      source: "Energy Source", 
      target: "Off-Peak Hours",
      value: timeCategories["Off-Peak Hours (10-16)"],
      color: "#10B981"
    },
    {
      source: "Energy Source",
      target: "Night Hours", 
      value: timeCategories["Night Hours (22-5)"],
      color: "#3B82F6"
    },
    {
      source: "Peak Hours",
      target: "High Usage",
      value: timeCategories["Peak Hours (6-9, 17-21)"] * 0.8,
      color: "#EF4444"
    },
    {
      source: "Peak Hours",
      target: "Medium Usage", 
      value: timeCategories["Peak Hours (6-9, 17-21)"] * 0.2,
      color: "#F59E0B"
    },
    {
      source: "Off-Peak Hours",
      target: "Medium Usage",
      value: timeCategories["Off-Peak Hours (10-16)"] * 0.7,
      color: "#10B981"
    },
    {
      source: "Off-Peak Hours",
      target: "Low Usage",
      value: timeCategories["Off-Peak Hours (10-16)"] * 0.3,
      color: "#6B7280"
    },
    {
      source: "Night Hours",
      target: "Low Usage",
      value: timeCategories["Night Hours (22-5)"] * 0.9,
      color: "#3B82F6"
    },
    {
      source: "Night Hours",
      target: "Medium Usage",
      value: timeCategories["Night Hours (22-5)"] * 0.1,
      color: "#8B5CF6"
    }
  ]

  // Create curved paths for Sankey links
  const linkPath = d3.linkHorizontal()
    .x(d => d.x)
    .y(d => d.y)

  // Draw links
  svg.selectAll(".sankey-link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "sankey-link")
    .attr("d", d => {
      const sourceNode = nodes.find(n => n.id === d.source)
      const targetNode = nodes.find(n => n.id === d.target)
      return linkPath({
        source: sourceNode,
        target: targetNode
      })
    })
    .style("fill", "none")
    .style("stroke", d => d.color)
    .style("stroke-width", d => Math.max(2, (d.value / totalEnergy) * 50))
    .style("stroke-opacity", 0.6)
    .on("mouseover", function(event, d) {
      tooltip
        .style("opacity", 1)
        .html(`${d.source} → ${d.target}<br/>${getTranslation("Energy:")} ${d.value.toFixed(2)} kWh<br/>${getTranslation("Share:")} ${((d.value / totalEnergy) * 100).toFixed(1)}%`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px")
      
      d3.select(this)
        .style("stroke-opacity", 1)
        .style("stroke-width", Math.max(3, (d.value / totalEnergy) * 60))
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0)
      d3.select(this)
        .style("stroke-opacity", 0.6)
        .style("stroke-width", d => Math.max(2, (d.value / totalEnergy) * 50))
    })

  // Draw nodes
  svg.selectAll(".sankey-node")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "sankey-node")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 8)
    .style("fill", d => {
      if (d.id === "Energy Source") return "#1F2937"
      if (d.id.includes("Peak")) return "#EF4444"
      if (d.id.includes("Off-Peak")) return "#10B981"
      if (d.id.includes("Night")) return "#3B82F6"
      if (d.id.includes("High")) return "#DC2626"
      if (d.id.includes("Medium")) return "#F59E0B"
      return "#6B7280"
    })
    .style("stroke", "#FFFFFF")
    .style("stroke-width", 2)
    .on("mouseover", function(event, d) {
      tooltip
        .style("opacity", 1)
        .html(d.id)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px")
    })
    .on("mouseout", () => tooltip.style("opacity", 0))

  // Add node labels
  svg.selectAll(".node-label")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "node-label")
    .attr("x", d => d.x + (d.x < width / 2 ? 15 : -15))
    .attr("y", d => d.y)
    .attr("text-anchor", d => d.x < width / 2 ? "start" : "end")
    .attr("dy", "0.35em")
    .style("font-size", "12px")
    .style("font-weight", "500")
    .style("fill", "#374151")
    .text(d => d.id)

  // Add flow values
  svg.selectAll(".flow-value")
    .data(links)
    .enter()
    .append("text")
    .attr("class", "flow-value")
    .attr("x", d => {
      const sourceNode = nodes.find(n => n.id === d.source)
      const targetNode = nodes.find(n => n.id === d.target)
      return (sourceNode.x + targetNode.x) / 2
    })
    .attr("y", d => {
      const sourceNode = nodes.find(n => n.id === d.source)
      const targetNode = nodes.find(n => n.id === d.target)
      return (sourceNode.y + targetNode.y) / 2
    })
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .style("font-size", "10px")
    .style("fill", "#6B7280")
    .style("pointer-events", "none")
    .text(d => `${((d.value / totalEnergy) * 100).toFixed(1)}%`)

  // Insight analysis
  const peakShare = (timeCategories["Peak Hours (6-9, 17-21)"] / totalEnergy) * 100
  const offPeakShare = (timeCategories["Off-Peak Hours (10-16)"] / totalEnergy) * 100
  const nightShare = (timeCategories["Night Hours (22-5)"] / totalEnergy) * 100
  
  let optimizationPotential = "low"
  if (peakShare > 50) optimizationPotential = "high"
  else if (peakShare > 35) optimizationPotential = "medium"
  
  const insight = `Energy flow: ${peakShare.toFixed(1)}% peak hours, ${offPeakShare.toFixed(1)}% off-peak, ${nightShare.toFixed(1)}% night. ${optimizationPotential} optimization potential through load shifting.`

  d3.select(`#${insightId}`).html(insight)
}

function updateCharts() {
  if (energyData.points.length === 0) {
    const chartInfos = [
      { chartId: "lineChart", insightId: "lineInsight" },
      { chartId: "barChart", insightId: "barInsight" },
      { chartId: "boxPlotChart", insightId: "boxPlotInsight" },
      { chartId: "heatmapChart", insightId: "heatmapInsight" },
      { chartId: "sankeyChart", insightId: "sankeyInsight" },
    ]
    chartInfos.forEach((info) => {
      d3.select(`#${info.chartId}`)
        .selectAll("*")
        .remove()
        .append("p")
        .attr("class", "text-center text-gray-500 p-4")
        .text(getTranslation("No data to display. Please load an XML file."))
      d3.select(`#${info.insightId}`).html(getTranslation("Awaiting data..."))
    })
    updateSummary([])
    return
  }

  const displayAdjusted = getDisplayAdjustedData(energyData.points)

  updateSummary(displayAdjusted)
  createLineChart(displayAdjusted, "lineChart", "lineInsight")
  createBarChart(displayAdjusted, "barChart", "barInsight")
  createBoxPlotChart(displayAdjusted, "boxPlotChart", "boxPlotInsight")
  createHeatmap(displayAdjusted, "heatmapChart", "heatmapInsight")
  createSankeyChart(displayAdjusted, "sankeyChart", "sankeyInsight")
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fileInput").addEventListener("change", handleFileUpload)
  
  // Initialize timezone selector
  initializeTimezoneSelector()

  // Initialize print functionality
  initializePrintButton()

  // Initial setup
  loadPreloadedXML("Data/myenergydata_output.xml", "AT") // Default load

  // Initialize chat functionality
  initializeChat()
})

// Chat functionality
function initializeChat() {
  energyDataChat = new EnergyDataChat()
  const chatInput = document.getElementById("chatInput")
  const sendBtn = document.getElementById("sendChatBtn")
  const clearBtn = document.getElementById("clearChatBtn")
  const chatMessages = document.getElementById("chatMessages")

  // Check API key availability and setup chat interface
  async function setupChatInterface() {
    const apiKeyStatus = await energyDataChat.loadApiKey()
    
    if (!apiKeyStatus.success) {
      // Disable chat interface
      chatInput.disabled = true
      sendBtn.disabled = true
      clearBtn.disabled = true
      
      // Show prominent setup message with clear instructions
      chatMessages.innerHTML = `
        <div class="p-8">
          <div class="flex items-center justify-center h-full">
            <div class="text-center max-w-md">
              <!-- Simple warning icon -->
              <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              
              <!-- Simple, personal message -->
              <h3 class="text-lg font-semibold text-gray-900 mb-4">${getTranslation("Hey! You need an API key to chat")}</h3>
              
              <p class="text-gray-600 text-sm mb-6 leading-relaxed">${getTranslation("Don't worry, it's super cheap - like €1 for 1000 questions! I can't include my key here for security reasons, but here's how to get yours:")}</p>
              
              <!-- Simple steps -->
              <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <ol class="text-sm text-gray-700 space-y-2">
                  <li>1. ${getTranslation("Get a free API key from")} <a href="https://platform.openai.com/api-keys" target="_blank" class="text-blue-600 hover:underline">OpenAI</a></li>
                  <li>2. ${getTranslation("Create a file called")} <code class="bg-gray-200 px-1 rounded">.env</code> ${getTranslation("here")}</li>
                  <li>3. ${getTranslation("Add:")} <code class="bg-gray-200 px-1 rounded">OPENAI_API_KEY=your_key_here</code></li>
                  <li>4. ${getTranslation("Refresh this page")}</li>
                </ol>
              </div>
              
              <p class="text-xs text-gray-500">${getTranslation("That's it! Let me know if you need help.")}</p>
            </div>
          </div>
        </div>
      `
      
      // Update input placeholder
      chatInput.placeholder = getTranslation("Chat disabled - API key required")
      
      return false
    }
    
    // Enable chat interface
    chatInput.disabled = false
    sendBtn.disabled = false
    clearBtn.disabled = false
    
    // Show welcome message
    chatMessages.innerHTML = `
      <div class="p-8">
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-200">
              <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <p class="text-gray-600 text-sm font-medium mb-3">${getTranslation("Start a conversation about your energy data...")}</p>
            <p class="text-gray-400 text-xs leading-relaxed">${getTranslation("Try asking: 'What are my peak energy consumption hours?' or 'How can I reduce my energy consumption?'")}</p>
          </div>
        </div>
      </div>
    `
    
    return true
  }

  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `chat-message mb-4 ${isUser ? 'ml-8' : 'mr-8'}`
    
    const messageContent = document.createElement("div")
    messageContent.className = `p-4 rounded-lg ${isUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 shadow-sm'}`
    
    const textDiv = document.createElement("div")
    textDiv.className = "text-sm leading-relaxed"
    textDiv.textContent = content
    messageContent.appendChild(textDiv)
    
    messageDiv.appendChild(messageContent)
    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  function addErrorMessage(error) {
    const errorDiv = document.createElement("div")
    errorDiv.className = "chat-message mb-4 mr-8"
    
    const errorContent = document.createElement("div")
    errorContent.className = "p-4 rounded-lg bg-red-50 border border-red-200 shadow-sm"
    
    const textDiv = document.createElement("div")
    textDiv.className = "text-sm text-red-800 leading-relaxed"
    textDiv.textContent = error
    errorContent.appendChild(textDiv)
    
    errorDiv.appendChild(errorContent)
    chatMessages.appendChild(errorDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  async function sendMessage() {
    const message = chatInput.value.trim()
    if (!message) return

    // Check if API key is available before sending
    if (!energyDataChat.isApiKeyAvailable()) {
      addErrorMessage(getTranslation("Chat is disabled. Please configure your API key first. See the setup instructions above for step-by-step guidance."))
      return
    }

    // Add user message
    addMessage(message, true)
    chatInput.value = ""
    sendBtn.disabled = true
    sendBtn.textContent = getTranslation("Sending...")

    // Add typing indicator as a message bubble
    const typingDiv = document.createElement("div")
    typingDiv.className = "p-3 rounded-lg bg-white border border-gray-200 mr-8"
    typingDiv.id = "typingIndicator"
    
    const typingContent = document.createElement("div")
    typingContent.className = "flex items-center space-x-2"
    typingContent.innerHTML = `
      <div class="flex space-x-1">
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
      <span class="text-sm text-gray-500">${getTranslation("typing...")}</span>
    `
    typingDiv.appendChild(typingContent)
    chatMessages.appendChild(typingDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight

    try {
      const result = await energyDataChat.sendMessage(message, energyData.points)
      
      // Remove typing indicator
      const typingIndicator = document.getElementById("typingIndicator")
      if (typingIndicator) {
        typingIndicator.remove()
      }
      
      if (result.error) {
        addErrorMessage(result.error)
      } else {
        addMessage(result.response)
      }
    } catch (error) {
      // Remove typing indicator
      const typingIndicator = document.getElementById("typingIndicator")
      if (typingIndicator) {
        typingIndicator.remove()
      }
      addErrorMessage(getTranslation("Failed to send message. Please try again."))
    } finally {
      sendBtn.disabled = false
      sendBtn.textContent = getTranslation("Send")
    }
  }

  // Event listeners
  sendBtn.addEventListener("click", sendMessage)
  clearBtn.addEventListener("click", () => {
    if (energyDataChat.isApiKeyAvailable()) {
      energyDataChat.clearHistory()
      chatMessages.innerHTML = `
        <div class="p-8">
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-200">
                <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <p class="text-gray-600 text-sm font-medium mb-3">${getTranslation("Start a conversation about your energy data...")}</p>
              <p class="text-gray-400 text-xs leading-relaxed">${getTranslation("Try asking: 'What are my peak energy consumption hours?' or 'How can I reduce my energy consumption?'")}</p>
            </div>
          </div>
        </div>
      `
    }
  })

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  })

  // Initialize the chat interface
  setupChatInterface()
}

// Expose functions to global scope for HTML onclick handlers
window.loadPreloadedXML = loadPreloadedXML

// Print functionality
function initializePrintButton() {
  const printButton = document.getElementById("printButton")
  if (printButton) {
    printButton.addEventListener("click", printReport)
  }
}

function printReport() {
  if ( !energyData || energyData.points.length === 0 ) {
    alert ( getTranslation ( "No data to print. Please load data first." ) )
    return
  }

  // Use the browser's print functionality
  window.print ( )
}
