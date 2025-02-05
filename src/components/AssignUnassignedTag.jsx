import React,{useState} from 'react'
import { Modal} from 'react-bootstrap';
import Alert from './Alert';


function AssignUnassignedTag({onClose,assignTagUnassigned,setselectunassigned,selectAllUnassignedModels,setselectAllUnassignedModels,unassignedmodel,setunassignedmodel,unassignedCheckboxStates,setUnassignedCheckboxStates}) {
    const [tagtype,setTagType] = useState('');
    const [customAlert,setCustomAlert] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const handleClose=()=>{
        setTagType('');
        onClose();

    }
    const removeFileExtension = (filename) => {
        return filename.replace(/\.[^.\/\\]*$/, '');
      };

    const handleSubmit = () => {
        if(!tagtype){
            setCustomAlert(true);
            setModalMessage("Please choose tag type")
        }
        else{
            const modelsData = selectAllUnassignedModels.map(tag => ({
                tagId:tag.number,
                filename: tag.filename,
                tagNo: removeFileExtension(tag.filename),
                tagType: tagtype,
            }));

            window.api.send('assign-tags', modelsData);
            const updatedModels = unassignedmodel.filter((model, index) => !unassignedCheckboxStates[index]);
            setunassignedmodel(updatedModels);     
            setUnassignedCheckboxStates({});
            setselectAllUnassignedModels([])
            setselectunassigned(false);
            setTagType('');
            handleClose();
            
        } 
    };
  return (
    
    <div>
    <Modal
        onHide={handleClose}
        show={assignTagUnassigned}
        backdrop="static"
        keyboard={false}>
        <div className="Unassigned-dialog" >
            <div className="title-dialog">
                <p className='text-light'>Assign Tags</p>
                <p className='text-light cross' onClick={handleClose}>&times;</p>
            </div>  
            <div className="tag-list-container" style={{ maxHeight: '300px', overflowY: 'auto',paddingLeft:'15px',paddingRight:'15px'}}>
            <p className='pt-3'>Models</p>
                <ul className="alltags" style={{ padding: '5px', listStyleType: 'disc' }}>
                    {selectAllUnassignedModels.map((tag, index) => (
                        <li key={index} style={{ marginBottom: '3px',fontSize:'13px' }}>
                            <span><i class="fa-solid fa-circle" style={{fontSize:'5px'}}></i> {removeFileExtension(tag.filename.substring(0, 22))}...</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className='pb-3' style={{paddingLeft:'15px',paddingRight:'15px'}}>
            <label >Type<span style={{ fontSize: '11px' }}>*</span></label>
                <select onChange={(e) => setTagType(e.target.value)}  style={{width:'100%'}}>
                  <option value={tagtype}selected></option>
                  <option value="Line">Line</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Valve">Valve</option>
                  <option value="Structural">Structural</option>
                  <option value="Other">Other</option>
                </select>

            </div>
         
            <div className='dialog-buttons' style={{ bottom: '0',display: 'flex', justifyContent: 'flex-end'}}>
                <div className='btn1'>
                    <p onClick={handleSubmit}>Ok</p>
                </div>
            </div>
        </div>
    </Modal>
    {customAlert && (
        <Alert
          message={modalMessage}
          onAlertClose={() => setCustomAlert(false)}
        />
      )}
</div>
  )
}

export default AssignUnassignedTag
