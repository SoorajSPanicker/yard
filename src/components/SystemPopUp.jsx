
import React, { useState ,useEffect,useRef} from 'react';
import Modal from 'react-bootstrap/Modal';
import Alert from './Alert';

function SystemPopUp({onClose,sysPopUpBox}) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [customAlert,setCustomAlert] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const codeInputRef = useRef(null);
    const nameInputRef = useRef(null);

  useEffect(() => {
    if (sysPopUpBox) {
      setCode('');
      setName('');
      // Focus on the code input field when the modal opens
      if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
    }
  }, [sysPopUpBox]);
  
    const handleClose = () => {
      setCode('')
      setName('')
      onClose();
    };
   
    const handleOk = async() => {

        if (!code) {
          setCustomAlert(true);
          setModalMessage("Code is mandatory");
          return;
        }
        else{          
          setCode('')
          setName('')
          handleClose();         
        }
        const data = {
          code: code,
          name: name,
        };
        window.api.send('save-sys-code-data', data);
        handleClose();
      };
  return (
    <>
      <Modal
    onHide={handleClose}
    show={sysPopUpBox}
    backdrop="static"
    keyboard={false}
    >
    <div className="area-dialog">
    <div className="title-dialog">
    <p className='text-light'>Add System</p>
    <p className='text-light cross' onClick={handleClose}>&times;</p>
    </div>  
    <div className="dialog-input">
    <label>Code *</label>
    <input type="text" ref={codeInputRef} value={code} onChange={(e) => setCode(e.target.value)}  />
    <label>Name</label>
    <input type="text" ref={nameInputRef} value={name} onChange={(e) => setName(e.target.value)} />
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
  
  )
}

export default SystemPopUp



