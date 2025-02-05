import React, { useState,useRef,useEffect } from 'react'
import Alert from './Alert'
import { Modal } from 'react-bootstrap';
import DeleteConfirm from './DeleteConfirm';

function CommentStatusTable({allCommentStatus}) {
    const [status,setStatus] = useState('')
    const [color,setColor] = useState('');
    const [showStatusModal,setShowStatusModal] = useState(false)
    const [customAlert, setCustomAlert] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const codeInputRef = useRef(null);
    const [currentDeleteTag, setCurrentDeleteTag] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [importStatus, setImportStatus] = useState(false);


  useEffect(() => {
    if (showStatusModal) {
      setColor('');
      setStatus('');
      if (codeInputRef.current) {
        setTimeout(() => {
          codeInputRef.current.focus();
        }, 100); 
      }
    }
  }, [showStatusModal]);

  useEffect(() => {
    window.api.receive('tag-exists', (data) => {
      console.log(data.message);
      setCustomAlert(true);
      setModalMessage(data.message);
    })
  })

    const handleClose=()=>{
      setShowStatusModal(false);
      setStatus('');
      setColor('');

    }

    const handleAddStatus=()=>{
      setShowStatusModal(true);
    }
  const handleOk=()=>{
    const data={
      statusname:status,
      color:color
    }
    setShowStatusModal(false);
    window.api.send('status-assigned',data);

  }
  const handleDeleteStatus=(number)=>{
    setCurrentDeleteTag(number);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    window.api.send('delete-status',currentDeleteTag);
    setShowConfirm(false);
    setCurrentDeleteTag(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setCurrentDeleteTag(null);
  };

  const handleImport=()=>{
    window.api.send('import-comment-details');
  }

  return (
    <div style={{ width: '100%', height: '90vh', backgroundColor: 'white', position: 'absolute',zIndex:'1'}}>
    <form>
      <div className="table-container">
        <table className='tagTable'>
          <thead>
            <tr>
              <th className="wideHead" >Number</th>
              <th className="wideHead">Status</th>
              <th className="wideHead">Color</th>
              <th className="tableActionCell">
                <i className="fa fa-download" title="Import" onClick={handleImport} ></i>
                <i className="fa-solid fa-circle-plus ms-3" title='Add status'onClick={handleAddStatus} ></i>
              </th>
            </tr>
          </thead>
          <tbody>
              {allCommentStatus.map((status,index)=>(
               <tr key={index} style={{ color: 'black' }}>
                <td  style={{ backgroundColor: '#f0f0f0' }}>{status.number}</td>
                <td>{status.statusname}</td>
                <td>{status.color} <div style={{width:'10px',height:'10px',backgroundColor:status.color}}></div></td>
                  <td style={{ backgroundColor: '#f0f0f0' }}>
                                        {status.statusname !== 'open' && status.statusname !== 'closed' && (
                                            <i className="fa-solid fa-trash-can ms-3" title='Delete' onClick={() => handleDeleteStatus(status.number)}></i>
                                        )}
                                    </td>

               </tr>
              ))}         
          </tbody>
        </table>
      </div>
    </form>

    <Modal
      onHide={handleClose}
      show={showStatusModal}
      backdrop="static"
      keyboard={false}
      dialogClassName="custom-modal"
    >
      <div className="area-dialog">
        <div className="title-dialog">
          <p className='text-light'>Add Status</p>
          <p className='text-light cross' onClick={handleClose}>&times;</p>
        </div>
        <div className="dialog-input">
          <label>Status*</label>
          <input
            type="text"
            ref={codeInputRef}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <label>Color</label>
          <input
            type="color"  
            value={color}       
            onChange={(e) => setColor(e.target.value)}
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
    )}

{showConfirm && (
        <DeleteConfirm
          message="Are you sure you want to delete?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
  </div>
  )
}

export default CommentStatusTable
