import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Alert from './Alert';

function AreaDialog({ onClose, showAreaDialog ,allAreasInTable}) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [customAlert,setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const codeInputRef = useRef(null);

  useEffect(() => {
    if (showAreaDialog) {
      setCode('');
      setName('');
      if (codeInputRef.current) {
        setTimeout(() => {
          codeInputRef.current.focus();
        }, 100); 
      }
    }
  }, [showAreaDialog]);

  const handleClose = () => {
    setCode('');
    setName('');
    onClose();
  };
  const handleCodeChange = (e) => {
    const selectedCode = e.target.value;
    setCode(selectedCode);
    const selectedArea = allAreasInTable.find((area) => area.area === selectedCode);
    if (selectedArea) {
      setName(selectedArea.name);
    } else {
      setName('');
    }
  };

  const handleNameChange = (e) => {
    const selectedName = e.target.value;
    setName(selectedName);
    const selectedArea = allAreasInTable.find((area) => area.name === selectedName);
    if (selectedArea) {
      setCode(selectedArea.area);
    } else {
      setCode('');
    }
  };


  const handleOk = async () => {
    
    if (!code) {
      setCustomAlert(true);
      setModalMessage("Code is mandatory");
      return;
    } else {
      const data = {
        code: code,
        name: name,
      };
      window.api.send('save-code-data', data);
      handleClose();
      
    }
  };

  return (
    <>
    <Modal
      onHide={handleClose}
      show={showAreaDialog}
      backdrop="static"
      keyboard={false}
      dialogClassName="custom-modal"
    >
      <div className="area-dialog">
        <div className="title-dialog">
          <p className='text-light'>Add Area</p>
          <p className='text-light cross' onClick={handleClose}>&times;</p>
        </div>
        <div className="dialog-input">
        <label>Code *</label>
            <select
              ref={codeInputRef}
              value={code}
              onChange={handleCodeChange}
            >
              <option value="">Select Code</option>
              {allAreasInTable.map((area) => (
                <option key={area.areaId} value={area.area}>
                  {area.area}- {area.name}
                </option>
              ))}
            </select>
            <label>Name</label>
            <select
              value={name}
              onChange={handleNameChange}
            >
              <option value="">Select Name</option>
              {allAreasInTable.map((area) => (
                <option key={area.id} value={area.name}>
                  {area.name}
                </option>
              ))}
            </select>
        </div>
        <div className='dialog-button' style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className='btn btn-secondary' onClick={handleClose}>Cancel</button>
        <button className='btn btn-dark' onClick={handleOk}>Ok</button>
      </div>
      </div>
    </Modal>
    {customAlert && (
        <Alert
          message={modalMessage}
          onAlertClose={() => setCustomAlert(false)}
        />
      )}
    </>
    

  );
}

export default AreaDialog;
