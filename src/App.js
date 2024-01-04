import React, { useState, useEffect } from 'react';
import { subDays, startOfMonth, endOfMonth, subMonths, differenceInDays } from 'date-fns';
import './App.css';
import Dashboard from './components/Dashboard';
import Chart from './components/Chart';

function App() {
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'chart'
  const [startDate, setStartDate] = useState(subDays(new Date(), 30)); // Default to last 30 days
  const [endDate, setEndDate] = useState(new Date());
  const [preset, setPreset] = useState('LAST_30_DAYS'); // Preset for date range
  const [comparisonPreset, setComparisonPreset] = useState('PREVIOUS_PERIOD'); // New state for comparison preset
  const [compareStartDate, setCompareStartDate] = useState(subDays(subDays(new Date(), 60), 30));
  const [compareEndDate, setCompareEndDate] = useState(subDays(new Date(), 30));
  const [bucketSize, setBucketSize] = useState('day');



  
  // Function to update the date range based on the preset
  const updateDateRange = (presetValue) => {
    let start, end;
    switch (presetValue) {
      case 'LAST_90_DAYS':
        start = subDays(new Date(), 90);
        end = new Date();
        break;
      case 'LAST_30_DAYS':
        start = subDays(new Date(), 30);
        end = new Date();
        break;
      case 'CURRENT_MONTH':
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      default:
        start = new Date();
        end = new Date();
    }
    setStartDate(start);
    setEndDate(end);
    // Ensure the comparison dates are updated to reflect the new preset
    updateComparisonDates(start, end, comparisonPreset);
  };

  // Function to update the comparison date range based on the preset
  const updateComparisonDates = (comparisonPresetValue, currentStart, currentEnd) => {
    let compareStart, compareEnd;
    const duration = currentEnd - currentStart;

    switch (comparisonPresetValue) {
      case 'PREVIOUS_PERIOD':
        compareStart = new Date(currentStart.getTime() - duration);
        compareEnd = currentStart;
        break;
      case 'PREVIOUS_90_DAYS':
        compareStart = subDays(currentStart, 90);
        compareEnd = subDays(currentEnd, 90);
        break;
      case 'PREVIOUS_30_DAYS':
        compareStart = subDays(currentStart, 30);
        compareEnd = subDays(currentEnd, 30);
        break;
      case 'PREVIOUS_MONTH':
        compareStart = subMonths(currentStart, 1);
        compareEnd = subMonths(currentEnd, 1);
        break;
      default:
        compareStart = new Date(currentStart.getTime() - duration);
        compareEnd = currentStart;
    }

    setCompareStartDate(compareStart);
    setCompareEndDate(compareEnd);
  };

  // Update comparison dates whenever the comparison preset or main date range changes
  useEffect(() => {
    updateComparisonDates(comparisonPreset, startDate, endDate);
  }, [comparisonPreset, startDate, endDate]);

  // Update date range when preset changes
  useEffect(() => {
    updateDateRange(preset);
  }, [preset]);

  // Function to determine bucket size
const determineBucketSize = (start, end, preset) => {
  if (preset === 'LAST_90_DAYS') return 'month';
  if (preset === 'CURRENT_MONTH') return 'week';
  // Fallback to day bucketing for LAST_30_DAYS or any custom range
  const diffDays = differenceInDays(end, start);
  return diffDays <= 30 ? 'day' : 'week';
};

// Update bucket size whenever the date range or preset changes
useEffect(() => {
  const newBucketSize = determineBucketSize(startDate, endDate, preset);
  setBucketSize(newBucketSize);
}, [startDate, endDate, preset]);



  // Handle click events on dashboard items
  const handleClickDashboardItem = (dashboardItem) => {
    console.log('Clicked on:', dashboardItem);
  };

  // Toggle between Dashboard and Chart views
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-logo">Quill</div>
      </header>
      <div className="App-subtitle">
        Ship dashboards to your users, without building from scratch
      </div>
      <div className="nav-tabs">
        <button onClick={() => toggleViewMode('dashboard')} className={`view-toggle ${viewMode === 'dashboard' ? 'active' : ''}`}>
          Dashboard
        </button>
        <button onClick={() => toggleViewMode('chart')} className={`view-toggle ${viewMode === 'chart' ? 'active' : ''}`}>
          Chart
        </button>
      </div>
      <main className="main-content">
        {viewMode === 'dashboard' ? (
          <Dashboard
            name="Finance Dashboard"
            containerStyle={{ margin: '20px' }}
            onClickDashboardItem={handleClickDashboardItem}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            preset={preset}
            setPreset={setPreset}
            comparisonPreset={comparisonPreset}
            setComparisonPreset={setComparisonPreset}
            compareStartDate={compareStartDate}
            compareEndDate={compareEndDate}
            bucketSize={bucketSize}
          />
        ) : (
          <Chart
            chartId={3}
            containerStyle={{ margin: '20px' }}
            startDate={startDate}
            endDate={endDate}
            compareStartDate={compareStartDate}
            compareEndDate={compareEndDate}
            bucketSize={bucketSize}
          />
        )}
      </main>
    </div>
  );
}

export default App;
