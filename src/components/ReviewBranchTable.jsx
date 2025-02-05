import React, { useState } from 'react';


function ReviewBranchTable({branchTableDetails,branchTableDataDetails}) {
  const [view, setView] = useState('table');
  const [viewBranchTable, setViewBranchTable] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // New state for filtered data
  const [branchName,setBranchName] = useState('')

  // Function to toggle between views
  const handleViewChange = (event, selectedView) => {
    event.preventDefault(); // Prevents form submission
    setView(selectedView);
    if (selectedView === 'grid') {
      convertOriginal();
    }
  };

  const handleOpenBranchTable = (branchName, branchId) => {
    setBranchName(branchName)
    setViewBranchTable(false); // Close the table temporarily to reset it
    setTimeout(() => {
      setSelectedBranch(branchName);
      // Filter data based on branchId
      const data = branchTableDataDetails.filter((row) => row.branchId === branchId);
      setFilteredData(data);
      setOriginalData([]); // Reset originalData when switching branches
      setViewBranchTable(true); // Open the table again after setting data
    }, 0); // Delay to allow state to reset
  };

  const handleCloseBranchTable = () => {
    setViewBranchTable(false);
    setOriginalData([]); 
  };

  const convertOriginal = () => {
    // Get unique MainSize and branchSize values to determine row and column headers
    const uniqueSize1 = [...new Set(filteredData.map((row) => row.MainSize))];
    const uniqueSize2 = [...new Set(filteredData.map((row) => row.branchSize))];
  
    // Initialize 2D array with MainSize as row headers and branchSize as column headers
    const matrix = Array(uniqueSize1.length + 1)
      .fill()
      .map(() => Array(uniqueSize2.length + 1).fill(null));
  
    // Set headers in the first row and column
    matrix[0][0] = ''; // Top-left cell
    uniqueSize1.forEach((size, index) => (matrix[index + 1][0] = size)); // MainSize headers
    uniqueSize2.forEach((size, index) => (matrix[0][index + 1] = size)); // branchSize headers
  
    // Populate matrix with items
    filteredData.forEach(({ MainSize, branchSize, Item }) => {
      const rowIndex = uniqueSize1.indexOf(MainSize) + 1;
      const colIndex = uniqueSize2.indexOf(branchSize) + 1;
      matrix[rowIndex][colIndex] = Item;
    });
  
    setOriginalData(matrix); // Update state with the reconstructed matrix
  };

  
 
  const TableView = () => (
    <table className='tagTable'>
    <thead>
      <tr>
        <th className="border p-2">Main Size (Size1)</th>
        <th className="border p-2">Branch Size (Size2)</th>
        <th className="border p-2">Item</th>
        <th className="border p-2">Item Description</th>
        <th className="border p-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredData.map((row, index) => (
        <tr key={index}>
          <td className='text-dark' style={{ backgroundColor: '#f0f0f0' }}>{row.MainSize}</td>
          <td className='text-dark'>{row.branchSize}</td>
          <td className='text-dark'>{row.Item}</td>
          <td className='text-dark'>{row.ItemDescription}</td>
          <td style={{ backgroundColor: '#f0f0f0', color: 'black' }}>
            <i className="fa-solid fa-pencil"></i>
            <i className="fa-solid fa-trash-can ms-3"></i>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  );

  const GridView = () => (
    <table className='tagTable'>
    <thead>
      <tr>
        {originalData[0]?.map((header, index) => (
          <th style={{ backgroundColor: '#f0f0f0', color: 'black' }} key={index}>{header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {originalData.slice(1).map((row, rowIndex) => (
        <tr key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <td style={{ backgroundColor: '#f0f0f0', color: 'black' }} key={cellIndex}>{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
  );

  return (
    <div style={{ width: '100%', height: '90vh', backgroundColor: 'white', zIndex: '1', position: 'absolute' }}>
      <form>
        <div className="table-container">
          <div >
            <table className='tagTable'>
              <thead>
                <tr>
                  <th className="wideHead">Document No:</th>
                  <th className="wideHead">Branch name</th>
                  <th className="mediumHead">Revision</th>
                  <th className="wideHead">Revision Date</th>
                  <th className="wideHead">Prepared by</th>
                  <th className="wideHead">Checked by</th>
                  <th className="wideHead">Approved by</th>
                  <th className="tableActionCell" >
                    <i className="fa fa-download" title="Import"></i>
                  </th>
                </tr>
                <tr>
                  <th colSpan="8">
                    <input
                      type="text"
                      placeholder="Search"
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
              {branchTableDetails.map((row, index) => (
                <tr key={index}>
                  <td style={{ backgroundColor: '#f0f0f0', color: 'black' }}>{row.Documentnumber}</td>
                  <td className='text-primary' style={{ cursor: 'pointer' }} onClick={() => handleOpenBranchTable(row.branchtableName, row.branchId)}>{row.branchtableName}</td>
                  <td className='text-dark'>{row.Revision}</td>
                  <td className='text-dark'>{row.RevisionDate}</td>
                  <td className='text-dark'></td>
                  <td className='text-dark'></td>
                  <td className='text-dark'></td>
                  <td style={{ backgroundColor: '#f0f0f0', color: 'black' }}>
                    <i className="fa-solid fa-pencil"></i>
                    <i className="fa-solid fa-trash-can ms-3"></i>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
            {viewBranchTable && (
              <div className="mt-2">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {view === 'table' ? (
                    <button
                      onClick={(e) => handleViewChange(e, 'grid')}
                      className='btn btn-secondary ms-3'
                    >
                      Table View
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleViewChange(e, 'table')}
                      className='btn btn-secondary ms-3'
                    >
                       Grid View
                    </button>
                  )}
                  <button className='btn btn-primary rounded me-3'>{branchName}                        <i className="fa-solid fa-xmark ps-3 text-dark" onClick={handleCloseBranchTable}></i>
                  </button>
                </div>
                {view === 'table' ? <TableView /> : <GridView />}
              </div>
            )}
          
          </div>
         
        
        </div>
      </form>
    </div>
  );
}

export default ReviewBranchTable;
