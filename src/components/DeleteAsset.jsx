import React, { useState,useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import axios from 'axios';
import Alert from './Alert';
import DeleteConfirm from './DeleteConfirm';


function DeleteAsset({onClose,projectNo,openDeleteModal,assetIdProject,gettokenNumber,assetList}) {

   const [deleteassetId,setDeleteAssetId] = useState('')
   const [customAlert,setCustomAlert] = useState(false);
   const [modalMessage, setModalMessage] = useState('');
   const [currentDeleteNumber, setCurrentDeleteNumber] = useState(null);
   const [showConfirm, setShowConfirm] = useState(false);
   const [confirmMessage, setConfirmMessage] = useState('');
   const [assetArray, setAssetArray] = useState([]);

   
   useEffect(() => {
     if (typeof assetIdProject === 'string') {
       setAssetArray(assetIdProject.split(','));
     } else {
       setAssetArray([]);
     }
   }, [assetIdProject]);


      const handleClose = () => {
        onClose();
      };   
      // const assetArray = typeof assetIdProject === 'string' ? assetIdProject.split(',') : [];

      const handleAssetSelection = (e)=>{
        setDeleteAssetId(e.target.value);
        }

      const deleteAsset= (e) =>{
        e.preventDefault();
        if(!deleteassetId ){
          setCustomAlert(true);
          setModalMessage("Please fill the form")
        }
        else{
          setCurrentDeleteNumber(deleteassetId);
          setConfirmMessage('Are you sure you want to delete?');
          setShowConfirm(true);       

        }
      }

      const handleCancelDelete = () => {
        setShowConfirm(false);
      };

      const handleConfirmDelete =()=>{
        const data={
          projectNo:projectNo,
          assetid:deleteassetId
        }
        window.api.send('delete-asset',data);
        try {
          console.log(`Deleting asset with ID: ${deleteassetId}`);
          const response= axios.delete(`https://api.cesium.com/v1/assets/${deleteassetId}`, {
            headers: { Authorization: `Bearer ${gettokenNumber}` },
          });      
          setDeleteAssetId('')
          handleClose();  
        } catch (error) {
          console.log(`Error deleting asset with ID ${deleteassetId}: ${error.message}`);
        }
     handleClose();
     setDeleteAssetId('')
      }
    
  return (
    <>
<Modal
        onHide={handleClose}
        show={openDeleteModal}
        backdrop="static"
        keyboard={false}>
         <div className="delete-dialog">

      <div className="title-dialog">
      <p className='text-light'>Delete Asset</p>
      <p className='text-light cross' onClick={handleClose}>&times;</p>
      </div>  
      <div className="dialog-input mt-3">
      <label>Choose Asset Id</label>
      <select onChange={handleAssetSelection} style={{width:'150px'}} >
           <option value="" ></option>
           {assetArray.map((assetid) => (
             <option key={assetid} value={assetid}>
               {assetid}
             </option>
           ))}
         </select>
        </div>       
      <div className='dialog-button'>
        <button className='btn btn-dark' onClick={e=>deleteAsset(e)}>Delete</button>
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
          message={confirmMessage}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

    </>
  )
}

export default DeleteAsset
