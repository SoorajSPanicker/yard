import React, { useEffect, useState } from 'react';
import DeleteConfirm from './DeleteConfirm';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Alert from './Alert';

function EquipmentList({ allEquipementList }) {
  const [editedRowIndex, setEditedRowIndex] = useState(-1);
  const [editedEquipmentData, seteditedEquipmentData] = useState({});
  const [currentDeleteEqup, setCurrentDeleteEqup] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [customAlert, setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.api.receive('tag-exists', (data) => {
      console.log(data.message);
      setCustomAlert(true);
      setModalMessage(data.message);
    });
  }, []);

  const handleDeleteEquipmentFromTable = (number) => {
    setCurrentDeleteEqup(number);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    window.api.send('remove-equipement-table', currentDeleteEqup);
    setShowConfirm(false);
    setCurrentDeleteEqup(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setCurrentDeleteEqup(null);
  };

  const handleEditOpen = (index) => {
    setEditedRowIndex(index);
    seteditedEquipmentData(allEquipementList[index]);
  };

  const handleCloseEdit = () => {
    setEditedRowIndex(-1);
    seteditedEquipmentData({});
  };

  const handleSave = (tag) => {
    console.log(editedEquipmentData);
    const updatedLineList = [...allEquipementList];
    updatedLineList[editedRowIndex] = { ...editedEquipmentData, tag: tag };

    setEditedRowIndex(-1);
    seteditedEquipmentData({});

    window.api.send('update-equipment-table', editedEquipmentData);
  };

  const handleChange = (field, value) => {
    seteditedEquipmentData({
      ...editedEquipmentData,
      [field]: value
    });
  };

  const handleImportClick = () => {
    window.api.send('import-equipment-list');
  };

  const handleExport = () => {
    const headers = [
      'tag', 'descr', 'qty', 'capacity', 'type', 'materials', 'capacityDuty', 'dims', 'dsgnPress', 'opPress', 'dsgnTemp', 'opTemp', 'dryWeight', 'opWeight', 'supplier', 'remarks', 'initStatus', 'revision', 'revisionDate'
    ];

    const dataToExport = allEquipementList.length > 0 ? allEquipementList : [];

    const ws = XLSX.utils.json_to_sheet(dataToExport, { header: headers });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipment List');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'EquipmentList.xlsx');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredEquipmentList = allEquipementList.filter(equipment =>
    equipment.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: 'white', zIndex: '1', position: 'absolute' }}>
      <form>
       
        <div className="table-container">
          <table className='eqptable'>
            <thead>
              <tr>
                <th className='wideHead'>Tag</th>
                <th className="extraWideHead">Description</th>
                <th>Quantity</th>
                <th>Capacity (%)</th>
                <th>Equipment type</th>
                <th>Materials</th>
                <th>Capacity/duty</th>
                <th>Dimensions - ID x TT or L x W x H (mm)</th>
                <th>Design pressure</th>
                <th>Operating pressure</th>
                <th>Design temperature</th>
                <th>Operating temperature</th>
                <th>Dry weight</th>
                <th>Operating weight</th>
                <th>Supplier</th>
                <th className="extraWideHead">Remarks</th>
                <th className='wideHead'>Initial status</th>
                <th>Revision</th>
                <th>Revision date</th>
                <th>
                  <i className="fa-solid fa-upload" title="Export" onClick={handleExport}></i>
                  <i className="fa-solid fa-download ms-2" title="Import" onClick={handleImportClick}></i>
                </th>
              </tr>
              <tr>
                <th colSpan={20}>
                <input
            type="text"
            placeholder="Search by Tag"
            value={searchQuery}
            onChange={handleSearch}
            style={{ width: '100%', padding: '5px' }}
          />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipmentList.map((equipment, index) => (
                <tr key={index} style={{ color: 'black' }}>
                  <td style={{ backgroundColor: '#f0f0f0' }}>{equipment.tag}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('descr', e.target.value)} type="text" value={editedEquipmentData.descr || ''} /> : equipment.descr}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('qty', e.target.value)} type="text" value={editedEquipmentData.qty || ''} /> : equipment.qty}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('capacity', e.target.value)} type="text" value={editedEquipmentData.capacity || ''} /> : equipment.capacity}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('type', e.target.value)} type="text" value={editedEquipmentData.type || ''} /> : equipment.type}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('materials', e.target.value)} type="text" value={editedEquipmentData.materials || ''} /> : equipment.materials}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('capacityDuty', e.target.value)} type="text" value={editedEquipmentData.capacityDuty || ''} /> : equipment.capacityDuty}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('dims', e.target.value)} type="text" value={editedEquipmentData.dims || ''} /> : equipment.dims}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('dsgnPress', e.target.value)} type="text" value={editedEquipmentData.dsgnPress || ''} /> : equipment.dsgnPress}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('opPress', e.target.value)} type="text" value={editedEquipmentData.opPress || ''} /> : equipment.opPress}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('dsgnTemp', e.target.value)} type="text" value={editedEquipmentData.dsgnTemp || ''} /> : equipment.dsgnTemp}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('opTemp', e.target.value)} type="text" value={editedEquipmentData.opTemp || ''} /> : equipment.opTemp}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('dryWeight', e.target.value)} type="text" value={editedEquipmentData.dryWeight || ''} /> : equipment.dryWeight}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('opWeight', e.target.value)} type="text" value={editedEquipmentData.opWeight || ''} /> : equipment.opWeight}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('supplier', e.target.value)} type="text" value={editedEquipmentData.supplier || ''} /> : equipment.supplier}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('remarks', e.target.value)} type="text" value={editedEquipmentData.remarks || ''} /> : equipment.remarks}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('initStatus', e.target.value)} type="text" value={editedEquipmentData.initStatus || ''} /> : equipment.initStatus}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('revision', e.target.value)} type="text" value={editedEquipmentData.revision || ''} /> : equipment.revision}</td>
                  <td>{editedRowIndex === index ? <input onChange={e => handleChange('revisionDate', e.target.value)} type="date" value={editedEquipmentData.revisionDate || ''} /> : equipment.revisionDate}</td>
                  <td style={{ backgroundColor: '#f0f0f0' }}>
                    {editedRowIndex === index ?
                      <>
                        <i className="fa-solid fa-floppy-disk text-success" onClick={() => handleSave(equipment.tag)}></i>
                        <i className="fa-solid fa-xmark ms-3 text-danger" onClick={handleCloseEdit}></i>
                      </>
                      :
                      <>
                        <i className="fa-solid fa-pencil" onClick={() => handleEditOpen(index)}></i>
                        <i className="fa-solid fa-trash-can ms-3" onClick={() => handleDeleteEquipmentFromTable(equipment.tag)}></i>
                      </>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </form>
      {customAlert && (
        <Alert
          message={modalMessage}
          onAlertClose={() => setCustomAlert(false)}
        />
      )}
      {showConfirm && (
        <DeleteConfirm
          message="Are you sure you want to delete?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default EquipmentList;
