import React from 'react'
import { Modal } from 'react-bootstrap';

function AddWorldBox({openWorldBox,setOpenWorldBox}) {
    // const handleAddWorldBox=()=>{
    //     const fbxFilePath = `${process.env.PUBLIC_URL}/Worldbox_1000m.fbx`;
    //     console.log(`${process.env.PUBLIC_URL}`)
    //       console.log(fbxFilePath);
    //     const fbxLoader = new FBXLoader();
    //     fbxLoader.load(fbxFilePath, (object) => {
    //       console.log('Loaded FBX object:', object);
      
    //       const boundingBoxobject = calculateBoundingBox(object);
    //       const maxbbobject = boundingBoxobject.max;
    //       const minbbobject = boundingBoxobject.min;
    //       console.log(maxbbobject);
    //       console.log(minbbobject);
      
    //       const center = new THREE.Vector3();
    //       boundingBoxobject.getCenter(center);
    //       console.log('Bounding Box Center:', center.toArray());
      
    //       const offsetObject = {
    //         fileid: uuidv4(),
    //         objectName: 'worldbox.fbx', // or use file.name if available
    //         maxbbobject,
    //         minbbobject,
    //         offset: center
    //       };
      
    //       setOffsetTable([...offsetsobject, offsetObject]);
    //       setobjectoffsetTable([...objectoffsetTable, offsetObject]);
    //       const newFilePath = { name: 'Worldbox_1000m.fbx', path: fbxFilePath };
    //       setFileNamePath((prevFileNamePath) => [...prevFileNamePath, newFilePath]);
      
    //       setItemToDelete({ type: 'add-wb'});
    //       setConfirmMessage('Are you sure to add this worldBox?');
    //       setShowConfirm(true);
      
          
    //     },
    //     undefined,
    //     (error) => {
    //       console.error('Error loading FBX:', error);
    //     });
      
    //   }

    // const handleClose=()=>{
    //     setOpenWorldBox(false);
    // }
  return (
    <>
      {/* <Modal
          onHide={handleClose}
          show={openWorldBox}
          backdrop="static"
          keyboard={false}
          dialogClassName="custom-modal"
        >
          <div className="tag-dialog">
            <div className="title-dialog">
              <p className='text-light'>Add word Box</p>
              <p className='text-light cross' onClick={handleClose}>&times;</p>
            </div>
            <div className="dialog-input">
              <label>File</label>
              <input
                type="file" />
                <a style={{cursor:'pointer', color:' #00BFFF'}} onClick={handleAddWorldBox}>Add our world box</a>
            </div>
            <div className='dialog-button' style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px',bottom:0 }}>
            <button className='btn btn-secondary' onClick={handleClose}>Cancel</button>
            <button className='btn btn-dark'>Upload</button>
          </div>
          </div>
        </Modal> */}
    </>
   
  )
}

export default AddWorldBox
