import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import AssetSpinner from './AssetSpinner';
import ExtendModal from './ExtendModal';

function Header({selectedprojectPath,responseMessage}) {

  const [extendmodal,setExtendModal] = useState(false);

    const navigate = useNavigate()
    useEffect(()=>{
      const user = JSON.parse(localStorage.getItem('user'));
        },[])
      // logout
  const handleLogOut  = ()=>{
   
    localStorage.removeItem('user');
    localStorage.removeItem('lastUsageDate');
   
  }

  const handleActivateButton = () => {
    // Navigate to the desired URL
    window.api.send('open-webpage-pods','https://fluffy-seahorse-8d4d5c.netlify.app')
  };
  // http://localhost:3001
  // https://silly-fenglisu-45758b.netlify.app

  return (
    <>
    <div style={{zIndex:'1'}}>        
        <header >
          <img id="logoPD" src="images/logo-pd.png"/>
          {
            selectedprojectPath &&           
            <p class="text-light">{selectedprojectPath}</p>
          }
            
     <div id="logout" className='me-3' style={{display:'flex'}}>
      {responseMessage && <>
            <p>Global model processing</p> 
            <AssetSpinner/>
        </>}

{/* <p style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={handleActivateButton}>Activate</p> */}
 {/* <p style={{ padding: '8px 16px', cursor: 'pointer',color:'blue' }}  >Go to dashboard</p>  */}


          </div>
        </header>
        
  </div>
  
  <ExtendModal extendmodal={extendmodal} setExtendModal={setExtendModal}/>
    </>
    

      
  )
}

export default Header
