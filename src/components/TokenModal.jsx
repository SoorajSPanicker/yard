import React,{useState} from 'react'
import { Modal } from 'react-bootstrap';
import Alert from './Alert';

function TokenModal({onClose,assigntokenmodal,projectNo,projectFolder}) {

    const [initialionToken,setinitialionToken] = useState('');
    const [accountDetails,setaccountDetails] = useState('');
    const [customAlert,setCustomAlert] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const handleClose = () => {
        onClose();
      };
        const fetchCesiumAccountDetails = async () => {
          try {
            const response = await fetch(`https://api.cesium.com/v1/me`, {
              headers: {
                Authorization: `Bearer ${initialionToken}`,
              },
            });
    
            if (response.ok) {
              const data = await response.json();
            setaccountDetails(data);
             
            } else {
              console.error('Error fetching asset details:', response.statusText);
            }
          } catch (error) {
            console.error('Error fetching asset details:', error.message);
          }
        };
    
        const handleOk = async() => {
          

            // Add your logic here to handle the 'Ok' action, such as sending data to the backend
            if (!projectNo || !projectFolder || !initialionToken || !accountDetails.username || !accountDetails.id) {
              setCustomAlert(true);
              setModalMessage('Please check all fields.....All fields are mandatory!!!');
              return;
            }
            else{
                const data = {
                  projectNo: projectNo,
                  projectName: projectFolder,
                  token:initialionToken,
                  username:accountDetails.username,
                  userid:accountDetails.id
              };
        
              
              window.api.send('save-token', data);
              setaccountDetails('')
              setinitialionToken('')
              setCustomAlert(true);
              setModalMessage("Token added successfully!!!!")
              handleClose();             
            }        
            handleClose();
          };
    
  return (
    <>
    <Modal
        onHide={handleClose}
        show={assigntokenmodal}
        backdrop="static"
        keyboard={false}>
         <div className="token-dialog">

      <div className="title-dialog">
      <p className='text-light'>Assign Token</p>
      <p className='text-light cross' onClick={handleClose}>&times;</p>
      </div>  
      <div className="dialog-input">
      <p>Project No: {projectNo}</p>
      <p>Project Name: {projectFolder}</p>
      <label>Token</label>
      <input type="text" value={initialionToken} onChange={(e) => setinitialionToken(e.target.value)} />
      <div className="btn btn-success mt-2" onClick={fetchCesiumAccountDetails}>Verify</div>
      {
        accountDetails && 
        <>
        <p>User Id:{accountDetails.id} </p>
        <p>UserName:{accountDetails.username} </p>
        </>
        
      }
     
        </div>       
      <div className='dialog-button'>
        <button className='btn btn-dark' onClick={handleOk} >Assign</button>
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

export default TokenModal
