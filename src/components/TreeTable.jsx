import React, { useState } from 'react';
import Alert from './Alert';
import DeleteConfirm from './DeleteConfirm';

function TreeTable({ allAreasInTable, allDiscsInTable, allSysInTable,allShipArea }) {
  const [currentDeleteTag, setCurrentDeleteTag] = useState('');
  const [currentDeleteType, setCurrentDeleteType] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [editedAreaRowIndex, setEditedAreaRowIndex] = useState(-1);
  const [editedDiscRowIndex, setEditedDiscRowIndex] = useState(-1);
  const [editedSysRowIndex, setEditedSysRowIndex] = useState(-1);
  const [editedLineData, setEditedLineData] = useState({});
  const [customAlert, setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleDeleteTagFromTable = (number) => {
    setCurrentDeleteTag(number);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {   
    window.api.send('remove-dock-area', currentDeleteTag);
    setShowConfirm(false);
    setCurrentDeleteTag('');
    setCurrentDeleteType('');
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setCurrentDeleteTag('');
    setCurrentDeleteType('');
  };

  const handleEditOpen = (index, id) => {
    const areaToEdit = allShipArea[index];
    console.log(areaToEdit)
    setEditedAreaRowIndex(index);
    setEditedLineData({
      id: id,
      name: areaToEdit.name,
      width: areaToEdit.width,
      length: areaToEdit.length,
      height: areaToEdit.height,
      pos_x: areaToEdit.pos_x,
      pos_y: areaToEdit.pos_y,
      pos_z: areaToEdit.pos_z,
      rotation_x: areaToEdit.rotation_x,
      rotation_y: areaToEdit.rotation_y,
      rotation_z: areaToEdit.rotation_z,
      translation_x: areaToEdit.translation_x,
      translation_y: areaToEdit.translation_y,
      translation_z: areaToEdit.translation_z,
    });
  };
  
  const handleSave = (id) => {
    if (!editedLineData.name || !editedLineData.width || !editedLineData.length) {
      setCustomAlert(true);
      setModalMessage("Name, width and length are required");
      return;
    }
  
    const updatedData = {
      id: id,
      name: editedLineData.name,
      width: editedLineData.width,
      length: editedLineData.length,
      height: editedLineData.height || 0,
      pos_x: editedLineData.pos_x || 0,
      pos_y: editedLineData.pos_y || 0,
      pos_z: editedLineData.pos_z || 0,
      rotation_x: editedLineData.rotation_x || 0,
      rotation_y: editedLineData.rotation_y || 0,
      rotation_z: editedLineData.rotation_z || 0,
      translation_x: editedLineData.translation_x || 0,
      translation_y: editedLineData.translation_y || 0,
      translation_z: editedLineData.translation_z || 0
    };  
    window.api.send('update-dock-area', updatedData);
    handleCloseEdit();
  };
  

  const handleCloseEdit = () => {
    setEditedAreaRowIndex(-1);
    setEditedDiscRowIndex(-1);
    setEditedSysRowIndex(-1);
    setEditedLineData({});
  };

  const handleChange = (field, value) => {
    setEditedLineData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  return (
    <div style={{ width: '100%', height: '90vh', backgroundColor: 'white', zIndex: '1', position: 'absolute' }}>
      <form>
        <div className="table-container">
          <h4 className='text-center'>Area table</h4>
          <table className='tagTable'>
            <thead>
              <tr>
                <th className="wideHead">Name</th>
                <th className="wideHead">Length</th>
                <th className="wideHead">Width</th>
                <th className="wideHead">Height</th>
                <th className="wideHead">Position(X,Y,Z)</th>
                <th className="wideHead">Rotation(X,Y,Z)</th>
                <th className="wideHead">Translation(X,Y,Z)</th>
                <th className="tableActionCell">
                Action
                </th>
              </tr>
            </thead>
            <tbody>
              {allShipArea.map((tag, index) => (
                <tr key={tag.Id} style={{ color: 'black' }}>
                  <td style={{ backgroundColor: '#f0f0f0' }}>
                    {editedAreaRowIndex === index ? (
                      <input
                        onChange={e => handleChange('name', e.target.value)}
                        type="text"
                        value={editedLineData.name || ''}
                      />
                    ) : (
                      tag.name
                    )}
                  </td>
                  <td>
                    {editedAreaRowIndex === index ? (
                      <input
                        onChange={e => handleChange('length', e.target.value)}
                        type="text"
                        value={editedLineData.length || ''}
                      />
                    ) : (
                      tag.length
                    )}
                  </td>
                  <td>
                    {editedAreaRowIndex === index ? (
                      <input
                        onChange={e => handleChange('width', e.target.value)}
                        type="text"
                        value={editedLineData.width || ''}
                      />
                    ) : (
                      tag.width
                    )}
                  </td>
                  <td>
                    {editedAreaRowIndex === index ? (
                      <input
                        onChange={e => handleChange('height', e.target.value)}
                        type="text"
                        value={editedLineData.height || ''}
                      />
                    ) : (
                      tag.height
                    )}
                  </td>
                  <td>
                    {editedAreaRowIndex === index ? (
                      <div className="coordinate-inputs">
                     <input
                     onChange={e => handleChange('pos_x', e.target.value)}
                     type="text"
                     value={editedLineData.pos_x || ''}
                     placeholder={editedLineData.pos_x}
                   />
                   <input
                     onChange={e => handleChange('pos_y', e.target.value)}
                     type="text"
                     value={editedLineData.pos_y || ''}
                     placeholder={editedLineData.pos_y}
                   />
                   <input
                     onChange={e => handleChange('pos_z', e.target.value)}
                     type="text"
                     value={editedLineData.pos_z || ''}
                     placeholder={editedLineData.pos_z}
                   />
                   </div>
                    ) : (
                      `${tag.pos_x || 0}, ${tag.pos_y || 0}, ${tag.pos_z || 0}`
                    )}
                  </td>
                  <td>
                    {editedAreaRowIndex === index ? (
                     <div className="coordinate-inputs">
                     <input
                       onChange={e => handleChange('rotation_x', e.target.value)}
                       type="text"
                       value={editedLineData.rotation_x || ''}
                       placeholder={editedLineData.rotation_x}
                     />
                     <input
                       onChange={e => handleChange('rotation_y', e.target.value)}
                       type="text"
                       value={editedLineData.rotation_y || ''}
                       placeholder={editedLineData.rotation_y}
                     />
                     <input
                       onChange={e => handleChange('rotation_z', e.target.value)}
                       type="text"
                       value={editedLineData.rotation_z || ''}
                       placeholder={editedLineData.rotation_z}
                     />
                   </div>
                    ) : (
                      `${tag.rotation_x || 0}, ${tag.rotation_y || 0}, ${tag.rotation_z || 0}`
                    )}
                  </td>
                  <td>
                    {editedAreaRowIndex === index ? (
                      <div className="coordinate-inputs">
                      <input
                        onChange={e => handleChange('translation_x', e.target.value)}
                        type="text"
                        value={editedLineData.translation_x || ''}
                        placeholder={editedLineData.translation_x}
                      />
                      <input
                        onChange={e => handleChange('translation_y', e.target.value)}
                        type="text"
                        value={editedLineData.translation_y || ''}
                        placeholder={editedLineData.translation_y}
                      />
                      <input
                        onChange={e => handleChange('translation_z', e.target.value)}
                        type="text"
                        value={editedLineData.translation_z || ''}
                        placeholder={editedLineData.translation_z}
                      />
                    </div>
                    ) :(
                      `${tag.translation_x || 0}, ${tag.translation_y || 0}, ${tag.translation_z || 0}`
                    )}
                  </td>
                  <td style={{ backgroundColor: '#f0f0f0' }}>
                    {editedAreaRowIndex === index ? (
                      <>
                        <i className="fa-solid fa-floppy-disk text-success" onClick={() => handleSave(tag.id)}></i>
                        <i className="fa-solid fa-xmark ms-3 text-danger" onClick={handleCloseEdit}></i>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-pencil" onClick={() => handleEditOpen(index, tag.id)}></i>
                        <i className="fa-solid fa-trash-can ms-3" onClick={() => handleDeleteTagFromTable(tag.id)}></i>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </form>
      {showConfirm && (
        <DeleteConfirm
          message="Are you sure you want to delete this tag?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      {customAlert && (
        <Alert
          message={modalMessage}
          onClose={() => setCustomAlert(false)}
        />
      )}
    </div>
  );
}

export default TreeTable;
