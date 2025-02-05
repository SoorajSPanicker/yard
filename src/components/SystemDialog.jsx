import React, { useState ,useEffect,useRef} from 'react';
import Modal from 'react-bootstrap/Modal';
import Alert from './Alert';

function SystemDialog({onClose,sysDialog,areaname,discname,allSysInTable}) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [customAlert,setCustomAlert] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const codeInputRef = useRef(null);
    const nameInputRef = useRef(null);

  useEffect(() => {
    if (sysDialog) {
      setCode('');
      setName('');
      // Focus on the code input field when the modal opens
      if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
    }
  }, [sysDialog]);
  
    const handleClose = () => {
      setCode('')
      setName('')
      onClose();
    };
    const handleCodeChange = (e) => {
      const selectedCode = e.target.value;
      setCode(selectedCode);
      const selectedArea = allSysInTable.find((sys) => sys.sys === selectedCode);
      if (selectedArea) {
        setName(selectedArea.name);
      } else {
        setName('');
      }
    };
  
    const handleNameChange = (e) => {
      const selectedName = e.target.value;
      setName(selectedName);
      const selectedArea = allSysInTable.find((sys) => sys.name === selectedName);
      if (selectedArea) {
        setCode(selectedArea.sys);
      } else {
        setCode('');
      }
    };
    const handleOk = async() => {
        if (!code) {
          setCustomAlert(true);
          setModalMessage("Code is mandatory");
          return;
        }
        else{
            const data = {
              areaname:areaname,
              discname:discname,
              code: code,
              name: name,
          };         
          window.api.send('save-sys-data', data);
          setCode('')
          setName('')
          handleClose();          
        }   
        handleClose();
      };
  return (
    <>
      <Modal
    onHide={handleClose}
    show={sysDialog}
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
            <select
              ref={codeInputRef}
              value={code}
              onChange={handleCodeChange}
            >
              <option value="">Select Code</option>
              {allSysInTable.map((sys) => (
                <option key={sys.sysId} value={sys.sys}>
                  {sys.sys}- {sys.name}
                </option>
              ))}
            </select>
            <label>Name</label>
            <select
              value={name}
              onChange={handleNameChange}
            >
              <option value="">Select Name</option>
              {allSysInTable.map((sys) => (
                <option key={sys.sysId} value={sys.name}>
                  {sys.name}-{sys.sys}
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
  
  )
}

export default SystemDialog



// export default 