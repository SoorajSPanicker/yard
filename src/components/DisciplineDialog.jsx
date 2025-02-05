import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Alert from './Alert';

function DisciplineDialog({ onClose, discDialog, areaname ,allDiscsInTable}) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [customAlert,setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const codeInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (discDialog) {
      setCode('');
      setName('');
      if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
    }
  }, [discDialog]);

  const handleClose = () => {
    setCode('');
    setName('');
    onClose();
  };
  const handleCodeChange = (e) => {
    const selectedCode = e.target.value;
    setCode(selectedCode);
    const selectedArea = allDiscsInTable.find((disc) => disc.disc === selectedCode);
    if (selectedArea) {
      setName(selectedArea.name);
    } else {
      setName('');
    }
  };

  const handleNameChange = (e) => {
    const selectedName = e.target.value;
    setName(selectedName);
    const selectedArea = allDiscsInTable.find((disc) => disc.name === selectedName);
    if (selectedArea) {
      setCode(selectedArea.disc);
    } else {
      setCode('');
    }
  };

  const handleOk = async (e) => {
    e.preventDefault();
    console.log('Code:', code);
    console.log('Name:', name);
    if (!code) {
      setCustomAlert(true);
      setModalMessage("Code is mandatory");
      return;
    } else {
      const data = {
        areaname: areaname,
        code: code,
        name: name,
      };
      window.api.send('save-disc-data', data);
      console.log("send request to store disc data");
      setCode('');
      setName('');
      handleClose();
    
    }
  };

  return (
    <>
     <Modal
      onHide={handleClose}
      show={discDialog}
      backdrop="static"
      keyboard={false}
      >

      <div className="area-dialog">
        <div className="title-dialog">
          <p className='text-light'>Add Discipline</p>
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
              {allDiscsInTable.map((disc) => (
                <option key={disc.discId} value={disc.disc}>
                  {disc.disc}- {disc.name}
                </option>
              ))}
            </select>
            <label>Name</label>
            <select
              value={name}
              onChange={handleNameChange}
            >
              <option value="">Select Name</option>
              {allDiscsInTable.map((disc) => (
                <option key={disc.discId} value={disc.name}>
                  {disc.name}-{disc.disc}
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
      )}</>
   
  );
}

export default DisciplineDialog;
