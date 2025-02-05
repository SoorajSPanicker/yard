import React, { useState,useRef } from 'react';
import * as XLSX from 'xlsx';
import Alert from './Alert';

function BranchTableManagement() {
  const [excelData, setExcelData] = useState([]);
  const [formData, setFormData] = useState({
    documentNumber: '',
    branchTableName: '',
    revision: '',
    revisionDate: '',
  });
  const [customAlert, setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const fileInputRef = useRef(null);

  // Handle form data change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setExcelData(parsedData);
    };
    reader.readAsArrayBuffer(file);
  };

  // Helper function to get item description
  const getItemDescription = (item) => {
    const descriptions = {
      'WOL': 'Weldolet',
      'WRT': 'Reducing tee',
      'WT': 'Straight tee',
      'TR': 'Reducing tee',
      'TOL': 'Threadolet',
      'WOF': 'Reinforced nipoflange',
      'ST':'Screwed (threaded) tee',
      'SRT':'Screwed (threaded) reducing tee',
      
    };
    return descriptions[item] || 'Unknown';
  };

  const handleSubmit = () => {
    const { documentNumber, branchTableName, revision, revisionDate } = formData;

    if (!documentNumber || !branchTableName || !revision || !revisionDate || excelData.length === 0) {
      setModalMessage('Please fill in all fields and upload an Excel file.');
      setCustomAlert(true);
      return;
    }

    const excelFileId = `file_${Date.now()}`;
    const numRows = excelData.length;
    const numCols = excelData[0].length;
    const transformed = [];

    for (let i = 1; i < numRows; i++) {
      for (let j = 1; j < numCols; j++) {
        const item = excelData[i][j];
        if (item) {
          const size1 = excelData[0][j];
          const size2 = excelData[i][0];
          const itemDes = getItemDescription(item);
          transformed.push({ size1, size2, item, itemDes });
        }
      }
    }

    const tableData = {
      documentNumber,
      branchTableName,
      revision,
      revisionDate,
      excelFileId,
      transformedData: transformed,
    };

    window.api.send("branchtabledata", tableData);

    // Clear form and file input fields after submission
    setFormData({
      documentNumber: '',
      branchTableName: '',
      revision: '',
      revisionDate: '',
    });
    setExcelData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Clear file input
    }
    setModalMessage('Successfully added branch table.');
    setCustomAlert(true);
  };


  return (
    <>
    <div style={{ zIndex: '1', position: 'absolute', width: '100%', backgroundColor: '#33334c' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div id="bulkImportDiv">
          <div className="page">
            <section className="page-section">
              <div className="row">
                <h4>Create Material Branch Table</h4>
              </div>
            </section>
            <hr />
            <section className="page-section">
              <div className="row">
                <div className="col-md-6">
                  <div className="dialog-input" style={{ fontSize: '13px', lineHeight: '30px' }}>
                    <label>Document Number</label>
                    <input type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} />
                    <label>Branch Table Name</label>
                    <input type="text" name="branchTableName" value={formData.branchTableName} onChange={handleChange} />
                    <label>Revision</label>
                    <input type="text" name="revision" value={formData.revision} onChange={handleChange} />
                    <label>Revision Date</label>
                    <input type="date" name="revisionDate" value={formData.revisionDate} onChange={handleChange} />
                    <label>Choose Excel File</label>
                    <input type="file" ref={fileInputRef} accept=".xls,.xlsx" onChange={handleFileUpload} />
                    <a href="#">Download sample excel template</a>
                  </div>
                </div>
              </div>
              <hr />
              <div className="d-flex">
                <button className="btn btn-light" style={{ fontSize: '12px' }} onClick={handleSubmit}>
                  Submit
                </button>
                <button className="btn btn-light ms-5" style={{ fontSize: '12px' }}>
                  Cancel
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
     {customAlert && (
      <Alert
        message={modalMessage}
        onAlertClose={() => setCustomAlert(false)}
      />
    )}
    </>
  );
}

export default BranchTableManagement;
