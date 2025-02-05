import React,{useState,useEffect} from 'react'
import { useNavigate} from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Form,Button} from 'react-bootstrap'
import Footer from '../components/Footer';


function LandingPage() {
    const [showModal, setShowModal] = useState(false);
    const [normalUserInputs,setNormalUserInputs] = useState({
      accessToken:""  
    }) 
    const getandsetUserNormalInputs = (e)=>{
      const {name,value} = e.target
      setNormalUserInputs({...normalUserInputs,[name]:value})                
    }
    console.log(normalUserInputs);
    localStorage.setItem("assetdetails",normalUserInputs);
    const navigate = useNavigate() 
  
    const handlesubmit = (e)=>{
      e.preventDefault();
      const { accessToken} = normalUserInputs;
      console.log(accessToken);
       // Check if the name and accessToken are empty
    if ( !accessToken) {
        toast.warning("Please give the valid token");
        return;
    }
    else{
      localStorage.setItem("accessToken",normalUserInputs.accessToken)
      toast.success("You are enterer correct token..Please wait!!!")
      // Close the modal
      setShowModal(false);
      setTimeout(()=>{
        navigate('/home')
      },3000)
       
  
    }
    }

    const handleFreePackage =()=>{
      window.api.send("request-free-trial")
    }
  //   useEffect(()=>{
  //  window.api.recive('free-trial-activated',()=>{
  //   setTimeout(()=>{
  //     toast.success("You free version is setup...Please wait!!!")
  //     navigate('/home')
  //   },3000)
  //  })
   
    // },[])
  return (
    <div className="landing-page" >
     <header class="headfoot">
            <img id="logoPD" src="images/logo-pd.png"/>
            <div id="signIn" onClick={() => setShowModal(true)} >Sign in</div>
        </header>
        
        <div id="content">
          <div className="front-button" style={{marginTop:'18%', marginLeft:'40%'}}>
          <button className='btn btn-primary' onClick={handleFreePackage}>Free Trial</button>
          <button className='btn  btn-primary ms-3'>Premium</button>
          </div>
       

        </div>
     <Footer/>

          {/* Token Modal */}
   {showModal && (
        <div className="modal show" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter Token</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <Form>
                  <Form.Group className="mb-3" controlId="formAccessToken">
                    <Form.Label>Token</Form.Label>
                    <Form.Control type="text"  placeholder="Token" name="accessToken" value={normalUserInputs.accessToken} onChange={e=>getandsetUserNormalInputs(e)}/>
                  </Form.Group>
                </Form>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                <Button variant="primary" onClick={handlesubmit}>Confirm</Button>
              </div>
            </div>
          </div>
        </div>
      )}

<ToastContainer
position="top-center"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light" /> 
  </div>
  )
}

export default LandingPage
