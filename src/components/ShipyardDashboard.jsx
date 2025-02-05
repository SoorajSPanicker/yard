import React, { useState, useEffect } from 'react';
import './DockManagementDashboard.css';

const DockManagementDashboard = () => {
  // State for selected week and vessels
  const [vessels, setVessels] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Generate all weeks in a year
  const totalWeeks = 52;
  
  // Sample vessel data by week (expanded)
  const vesselScheduleByWeek = {
    1: [
      { 
        vesselNo: 'VS001', 
        name: 'Maersk Line', 
        workFrom: '2024-12-10', 
        to: '2024-12-15', 
        dock: 'A1',
        cargo: 'Containers',
        capacity: '14,000 TEU',
        crew: 25,
        status: 'On Schedule'
      },
      { 
        vesselNo: 'VS002', 
        name: 'MSC Cargo', 
        workFrom: '2024-12-12', 
        to: '2024-12-18', 
        dock: 'B2',
        cargo: 'Bulk',
        capacity: '150,000 DWT',
        crew: 20,
        status: 'Delayed'
      }
    ],
    2: [
      {
        vesselNo: 'VS003',
        name: 'CMA CGM',
        workFrom: '2024-12-17',
        to: '2024-12-22',
        dock: 'A2',
        cargo: 'Containers',
        capacity: '18,000 TEU',
        crew: 28,
        status: 'On Schedule'
      }
    ],
    // Add more weeks as needed
  };

  // Update vessels when week changes
  useEffect(() => {
    setVessels(vesselScheduleByWeek[selectedWeek] || []);
  }, [selectedWeek]);

  // Format date for display
  const formatDate = (weekNumber) => {
    const date = new Date(2024, 0, 1 + (weekNumber - 1) * 7);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  

  const handleVesselClick = (vessel) => {
    // Show modal with detailed vessel information
  };

  return (
    <div className="dashboard">
      {/* Week Selector */}
      {/* <div className="week-selector">
        <h2>Schedule Week: {getWeekRange(selectedWeek)}</h2>
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max={totalWeeks}
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            className="week-slider"
          />
          <div className="slider-labels">
            <span>Week 1</span>
            <span>Week 26</span>
            <span>Week 52</span>
          </div>
        </div>
      </div> */}

      <div className="dashboard-grid">
        {/* 3D View Section */}
        <div className="view-section">
          <div className="section-header">
            <h2>3D View</h2>
            <div className="view-controls">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="control-box"></div>
              ))}
            </div>
          </div>
          <div className="view-container"></div>
        </div>

        {/* Docking Status */}
        <div className="status-section">
          <h2>Docking Status</h2>
          <div className="status-list">
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="status-item">
                <span>Dock {i + 1}</span>
                <span className={`status-indicator ${vessels.some(v => v.dock === `A${i + 1}` || v.dock === `B${i + 1}`) ? 'status-occupied' : 'status-available'}`}>
                  {vessels.some(v => v.dock === `A${i + 1}` || v.dock === `B${i + 1}`) ? 'Occupied' : 'Available'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Schedule of Vessels */}
        <div className="schedule-section">
          <h2>Schedule of Vessels</h2>
          <div className="dashboard-table-container">
            <table className='dashboard-table'>
              <thead>
                <tr>
                  <th>Vessel No</th>
                  <th>Name</th>
                  <th>Work From</th>
                  <th>To</th>
                  <th>Dock</th>
                  <th>Cargo</th>
                  <th>Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vessels.map((vessel) => (
                  <tr key={vessel.vesselNo} className="vessel-row" onClick={() => handleVesselClick(vessel)}>
                    <td className="highlighted-cell">{vessel.vesselNo}</td>
                    <td>{vessel.name}</td>
                    <td>{vessel.workFrom}</td>
                    <td>{vessel.to}</td>
                    <td className="highlighted-cell">{vessel.dock}</td>
                    <td>{vessel.cargo}</td>
                    <td>{vessel.capacity}</td>
                    <td className={`status-${vessel.status.toLowerCase().replace(' ', '-')}`}>
                      {vessel.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

       

        {/* JCB Crane Status */}
        <div className="col-span-2 bg-white rounded-lg">
          <h2 className="text-2xl font-semibold mb-6">JCB Crane Status</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Crane 1</span>
              <span className="text-green-500">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Crane 2</span>
              <span className="text-yellow-500">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Workforce Allocation */}
        <div className="col-span-2 bg-white rounded-lg">
          <h2 className="text-2xl font-semibold mb-6">Workforce Allocation</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Dock A</span>
              <span>12</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Dock B</span>
              <span>8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DockManagementDashboard;