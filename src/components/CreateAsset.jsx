import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'

function CreateAsset({createAssetDialog,onClose,gettokenNumber,setResponseMessage,projectNo, projectFolder}) {

  const [name,setname] = useState('');
  const [description,setDescription] = useState('');  
  const [selectFolder,setSelectFolder] = useState('');
    const handleClose=()=>{
        onClose()
    }

    const handleCreateAsset = ()=>{
      console.log(name);
      console.log(gettokenNumber);
      const data = {
        name:name,
        description:description,
        selectFolder:selectFolder,
        accessToken:gettokenNumber,
        projectNo:projectNo,
        projectFolder:projectFolder
      }
      setResponseMessage(true)
      window.api.send('create-asset',data);
      setname('');
      setDescription('');
      setSelectFolder('');
      onClose()
    }

  return (
    <Modal
    onHide={handleClose}
    show={createAssetDialog}
    backdrop="static"
    keyboard={false}
    dialogClassName="custom-modal"
  >
    <div className="area-dialog">
      <div className="title-dialog">
        <p className='text-light'>Create asset</p>
        <p className='text-light cross' onClick={handleClose}>&times;</p>
      </div>
      <div className="dialog-input">
        
        <label>Name</label>
        <input type='text'  value={name}
            onChange={(e) => setname(e.target.value)}/>
        <label>Description</label>
        <input type='text' value={description}
        onChange={(e)=>setDescription(e.target.value)}/>
         <label>Folder Name *</label>
        <select value={selectFolder} onChange={(e) => setSelectFolder(e.target.value)} style={{ width: '100%' }}>
                      <option value="" disabled>
                        Choose type
                      </option>
                      <option value="Tags">Assigned tags</option>
                      <option value="unassigned_models">Unassigned models</option>
                      <option value="Tags, unassigned_models">Both</option>
                    </select>
      </div>
      <div className='dialog-button'>
        <button className='btn btn-dark' onClick={handleCreateAsset}>Create</button>
      </div>
    </div>
  </Modal>
  )
}

export default CreateAsset
