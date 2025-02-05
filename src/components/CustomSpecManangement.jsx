import React, { useState } from 'react';

function CustomSpecManagement() {
  // State to store table rows
  const [rows, setRows] = useState([]);

  // Function to add a new row
  const addRow = () => {
    setRows([...rows, {}]); // Adds an empty object for each new row
  };

  return (
    <div style={{ width: '100%', height: '90vh', backgroundColor: 'white', zIndex: '1', position: 'absolute' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 className='ms-4 mt-2'>Create Custom Material Spec</h4>
        <i className="fa-solid fa-circle-plus me-3" onClick={addRow} style={{ cursor: 'pointer' }}></i>
      </div>

      <form>
        <div>
          <div className="table-container">
            <table className='tagTable'>
              <thead>
                <tr>
                  <th className="wideHead">Item type</th>
                  <th className="wideHead">Fitting type</th>
                  <th className="mediumHead">Size1</th>
                  <th className="wideHead">Size2</th>
                  <th className="wideHead">Geometric std</th>
                  <th className="wideHead">EDS/VDS</th>
                  <th className="wideHead">End Conn</th>
                  <th className="wideHead">Material Descri</th>
                  <th className="wideHead">MDS</th>
                  <th className="wideHead">Rating</th>
                  <th className="wideHead">SCHD</th>
                  <th className="wideHead">Notes</th>
                  <th className="wideHead">Remarks</th>
                  <th className="wideHead">Prepared by</th>
                  <th className="wideHead">Checked by</th>
                  <th className="wideHead">Approved by</th>
                  <th className="tableActionCell">
                    <i className="fa fa-download" title="Import"></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CustomSpecManagement;
