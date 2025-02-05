import React from 'react'
import {Modal} from 'react-bootstrap'

function RegisterDocument({openRegisterDocument,onCloseRegister}) {
  const handleClose=()=>{
    onCloseRegister()
  }
  return (
   
    <div>
        <Modal
        onHide={handleClose}
        show={openRegisterDocument}
        backdrop="static"
        keyboard={false}>
 <div className="Tag-dialog">
    <div className="title-dialog">
    <p className='text-light'>Register Document</p>
    <p className='text-light cross' onClick={handleClose}>&times;</p>
    </div>  
    <div className="dialog-input mt-4"style={{border:'none' , borderRadius:'5px'}}>
                                    <label for="docRegNumber">Document number *</label>
                                    <br/>
                                    <input type="text" id="docRegNumber" class="page-input" ng-model="doc.number" maxlength="20"
                                        ng-keypress="isLegalCharacter($event)" required/>
                                    <label for="docRegTitle">Title</label>
                                    <br/>
                                    <textarea type="text" id="docRegTitle" class="page-input" ng-model="doc.title" maxlength="100"/>
                                    <label for="docRegDescr">Description</label>
                                    <br/>
                                    <textarea id="docRegDescr" class="page-input-long" ng-model="doc.descr"></textarea>
                               
                                    <label for="docRegFile">Model file</label>
                                    <br/>
                                    <input type="file" id="docRegFile" class="page-input" ng-file-model="doc.file"/>
    
      </div>  
     
      <div className='dialog-buttons' style={{width:'100%',bottom:'0',display: 'flex', justifyContent: 'flex-end' }}>
       
      <div className='btn1'><p>Ok</p></div>
    </div>

 
  </div>
        </Modal>
      
    </div>
  )
}

export default RegisterDocument
