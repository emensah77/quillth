import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import './Chart.css';

const Chart = ({ chartId, containerStyle, bucketSize, startDate, endDate, compareStartDate, compareEndDate }) => {
    const [chartData, setChartData] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [chartDetails, setChartDetails] = useState(null);
    const [percentageChange, setPercentageChange] = useState(null);

    const xAxisTickFormatter = (tick) => {
        if (!tick) return '';  // Return empty string if tick is invalid
    
        try {
            const date = parseISO(tick);
            return format(date, 'MMM yyyy');
        } catch (error) {
            console.error("Error formatting date:", error);
            return '';  // Return empty string in case of an error
        }
    };
    

    const calculatePercentageChange = () => {
        if (chartData.length && comparisonData.length) {
            // Accessing the last data point's total value
            const lastChartData = chartData[chartData.length - 1].total_value;
            const lastComparisonData = comparisonData[comparisonData.length - 1].total_value;
    
            if (lastComparisonData !== 0) {
                const change = ((lastChartData - lastComparisonData) / lastComparisonData) * 100;
                setPercentageChange(change.toFixed(2));
            }
        } else {
            // Reset percentage change if data is not sufficient
            setPercentageChange(null);
        }
    };
    

    useEffect(() => {
        calculatePercentageChange();
    }, [chartData, comparisonData]);
    

    useEffect(() => {
        const fetchChartData = async (start, end, isComparison = false) => {
            try {
                if (!start || !end) {
                    throw new Error("Start or end date is null or invalid");
                }
        
                const queryParams = new URLSearchParams({
                    start: start.toISOString(),
                    end: end.toISOString(),
                    bucketSize
                });
        
                const response = await fetch(`http://localhost:3001/chart/${chartId}?${queryParams}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
        
                const data = await response.json();
                const formattedData = data.data.map(item => ({
                    grouped_date: item.grouped_date,  // Use the correct key from your data
                    total_value: parseFloat(item.total_value)  // Parse the value to ensure it's a number
                }));
        
                isComparison ? setComparisonData(formattedData) : setChartData(formattedData);
                if (!isComparison) setChartDetails(data);
            } catch (error) {
                console.error("Fetch error:", error.message);
            }
        };
        

        fetchChartData(startDate, endDate);
        fetchChartData(compareStartDate, compareEndDate, true);
    }, [chartId, startDate, endDate, compareStartDate, compareEndDate, bucketSize]);

    // Function to filter comparison data to match main data range
    const filterComparisonData = () => {
        if (!chartData.length || !comparisonData.length) return [];

        const mainDataStartDate = chartData[0][chartDetails.xaxisfield];
        const mainDataEndDate = chartData[chartData.length - 1][chartDetails.xaxisfield];

        return comparisonData.filter(item => {
            const itemDate = item[chartDetails.xaxisfield];
            return itemDate >= mainDataStartDate && itemDate <= mainDataEndDate;
        });
    };


    const renderChart = () => {
        if (!chartDetails || chartData.length === 0) {
            return <p>No data available for the selected date range</p>;
        }
    
        // Filter the comparison data to only include dates that overlap with the main data
        const filteredComparisonData = filterComparisonData();
        console.log("Filtered comparison data:", filteredComparisonData);
        console.log("Main data:", chartData);
        console.log("Comparison data:", comparisonData);
    
        const ChartComponent = chartDetails.chartType === 'line' ? LineChart : BarChart;
        const ChartElement = chartDetails.chartType === 'line' ? Line : Bar;
    
        return (
            <ResponsiveContainer width="100%" height={300}>
                <ChartComponent data={chartData}>
                    <XAxis dataKey="grouped_date" tickFormatter={xAxisTickFormatter} />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <ChartElement type="monotone" dataKey="total_value" stroke="blue" />
                    {comparisonData.length > 0 && (
                        <ChartElement 
                            type="monotone" 
                            dataKey="total_value" 
                            data={comparisonData} 
                            stroke={chartDetails.chartType === 'line' ? 'lightgrey' : null} 
                            fill={chartDetails.chartType === 'bar' ? 'lightgrey' : null} 
                        />
                    )}
                </ChartComponent>

            </ResponsiveContainer>
        );
    };
    

    const renderPercentageChange = () => {
        // Displaying the percentage change
        const displayPercentageChange = percentageChange != null ? `${percentageChange >= 0 ? `+${percentageChange}` : percentageChange}%` : 'N/A';
    
        // Extracting the most recent data points for display
        const lastChartDataPoint = chartData.length ? chartData[chartData.length - 1] : null;
        const lastComparisonDataPoint = comparisonData.length ? comparisonData[comparisonData.length - 1] : null;
    
        // Creating text for explanation
        const explanationText = lastChartDataPoint && lastComparisonDataPoint ? 
            `Change calculated from ${lastComparisonDataPoint.total_value} (comparison) to ${lastChartDataPoint.total_value} (current)` : 
            'Insufficient data for comparison';
    
        return (
            <div style={{ color: percentageChange >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                {displayPercentageChange}
                <div style={{ fontSize: 'smaller' }}>{explanationText}</div>
            </div>
        );
    };
    

    return (
        <div className="chart-container" style={containerStyle}>
            {renderPercentageChange()}
            {renderChart()}
        </div>
    );
};

export default Chart;
