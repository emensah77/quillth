import React, { useState, useEffect } from 'react';
import Chart from './Chart';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { subDays, startOfMonth, endOfMonth } from 'date-fns';
import './Dashboard.css';

const Dashboard = ({
    name,
    containerStyle,
    onClickDashboardItem,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    preset,
    setPreset,
    comparisonPreset, // This prop will be passed down from App.js
    setComparisonPreset, // This prop will be passed down from App.js
    compareStartDate,
    compareEndDate,
    bucketSize,
}) => {
    const [charts, setCharts] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [startDate, endDate, preset, comparisonPreset, name]); // Include comparisonPreset in the dependency array

    const fetchDashboardData = async () => {
        try {
            const response = await fetch(`http://localhost:3001/dashboard/${name}?start=${startDate.toISOString()}&end=${endDate.toISOString()}&preset=${preset}&comparison=${comparisonPreset}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            setCharts(data);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    // Update the comparison preset
    const handleComparisonPresetChange = (event) => {
        setComparisonPreset(event.target.value);
    };

    return (
        <div className="dashboard" style={containerStyle}>
            <div className="date-picker-dropdowns">
                <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                />
                <DatePicker
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                />
                <select value={preset} onChange={e => setPreset(e.target.value)}>
                    <option value="LAST_90_DAYS">Last 90 Days</option>
                    <option value="LAST_30_DAYS">Last 30 Days</option>
                    <option value="CURRENT_MONTH">Current Month</option>
                </select>
                <select value={comparisonPreset} onChange={handleComparisonPresetChange}>
                    <option value="PREVIOUS_PERIOD">Previous Period</option>
                    <option value="PREVIOUS_90_DAYS">Previous 90 Days</option>
                    <option value="PREVIOUS_30_DAYS">Previous 30 Days</option>
                    <option value="PREVIOUS_MONTH">Previous Month</option>
                </select>
            </div>

            {charts.map(chart => (
                <div key={chart.id} onClick={() => onClickDashboardItem(chart)}>
                    <Chart 
                        chartId={chart.id} 
                        containerStyle={{ margin: '20px' }}
                        startDate={startDate}
                        endDate={endDate}
                        compareStartDate={compareStartDate}
                        compareEndDate={compareEndDate}
                        bucketSize={bucketSize}
                    />
                </div>
            ))}
        </div>
    );
};

export default Dashboard;
