import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Alert from './Alert';

function DisciplinePopUp({ onClose, discPopUpBox}) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [customAlert,setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const codeInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (discPopUpBox) {
      setCode('');
      setName('');
      if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
    }
  }, [discPopUpBox]);

  const handleClose = () => {
    setCode('');
    setName('');
    onClose();
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
        code: code,
        name: name,
      };
      window.api.send('save-disc-code-data', data);
    
      setCode('');
      setName('');
      handleClose();
    
    }
  };

  return (
    <>
     <Modal
      onHide={handleClose}
      show={discPopUpBox}
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
          <input
            ref={codeInputRef}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <label>Name</label>
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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

export default DisciplinePopUp;
