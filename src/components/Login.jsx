import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Alert from './Alert';
import { base_url } from './baseurl';
import CryptoJS from 'crypto-js'; // Import CryptoJS for hashing
import { GoogleLogin } from '@react-oauth/google';
import { useMsal } from '@azure/msal-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [customAlert, setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const[passwordReset,setPasswordReset] = useState('');
  const[confirmpasswordReset,setConfirmPasswordReset] = useState('');
  const [token,setToken] = useState('');
  const [tokenfield,setTokenfield] = useState(false);
  const [microsofttoken,setMicrosoftToken] = useState(false);
  const [microsofttokenfield,setMicrosoftTokenField] = useState('');

  const history = useNavigate();
  const { instance } = useMsal();

  const handleMicroLogin = () => {
    instance.loginPopup({
      scopes: ['user.read'],
    }).then(response => {
      // Handle the response
    }).catch(error => {
      // Handle the error
      console.error('Login error:', error);
    });
  };


  // Custom login handler
  const handleLogin = async () => {
    if (email && password) {
      setLoading(true);

      try {
        // Fetch user data based on email
        const response = await fetch(`${base_url}/installation?email=${encodeURIComponent(email)}`);
        const userData = await response.json();
        console.log(userData);

        if (userData.length > 0) {
          // Hash the entered password
          const hashedPassword = CryptoJS.SHA256(password).toString();
          // Compare hashed entered password with stored hashed password
          if (userData[0].password === hashedPassword) {
            localStorage.setItem('user', JSON.stringify(userData[0]));
            localStorage.setItem('lastUsageDate', new Date().toISOString());
            history('/home');
          } else {
            setCustomAlert(true);
            setModalMessage('Invalid email or password.');
          }
        } else {
          setCustomAlert(true);
          setModalMessage('Invalid email or password.');
        }
      } catch (error) {
        console.error('Error during login:', error);
        setCustomAlert(true);
        setModalMessage('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setCustomAlert(true);
      setModalMessage('Please enter both email and password.');
    }
  };

  // Reset password handler
  const handleResetPassword = async () => {
    if (resetEmail && passwordReset && confirmpasswordReset) {
      
      if (passwordReset === confirmpasswordReset) {
        try {
          // Check if the user exists
          const response = await fetch(`${base_url}/installation?email=${encodeURIComponent(resetEmail)}`);
          const userData = await response.json();
  
          if (userData.length > 0) {
            const user = userData[0];
            const appId = user.id;
            
            // Hash the new password
            const hashedPassword = CryptoJS.SHA256(passwordReset).toString();
            
            // Update the password in the database
            const updateResponse = await fetch(`${base_url}/installation/${appId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ...userData,password: hashedPassword }),
            });
  
            if (updateResponse.ok) {
              setCustomAlert(true);
              setModalMessage('Password updated successfully.');
              setIsResetting(false);
            } else {
              throw new Error('Failed to update password.');
            }
          } else {
            setCustomAlert(true);
            setModalMessage('No user found with that email address.');
          }
        } catch (error) {
          console.error('Error:', error);
          setCustomAlert(true);
          setModalMessage('Failed to update password.');
        }
      } else {
        setCustomAlert(true);
        setModalMessage('Mismatch in password and confirm password.');
      }
    } else {
      setCustomAlert(true);
      setModalMessage('Please enter your email and new password.');
    }
  };
  
const handlegooglelogin=()=>{
  setTokenfield(true)
  window.api.send('google-login');
}

const handleGoogleloginSubmit=()=>{
  setTokenfield(false);
  window.api.send('oauth2callback',token)
}

const handleMicrosoftLogin = ()=>{
  setMicrosoftToken(true)
  window.api.send('microsoft-login');
}

const handleMicrosoftloginSubmit=()=>{
  setMicrosoftToken(false);
  window.api.send('oauth2callback-microsoft',microsofttokenfield);
}
useEffect(()=>{
  window.api.receive('google-login-success',(data)=>{
    if(data){
      console.log(data)
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('lastUsageDate', new Date().toISOString());
      history('/home');
    }

  })
  window.api.receive('google-login-error',(data)=>{
    if(data.message){
      console.log(data.message)
    }

  })
  window.api.receive('microsoft-login-error',(data)=>{
    if(data.message){
      console.log(data.message)
    }

  })
  window.api.receive('response-message-success',(data)=>{
    if(data){
      console.log(data)
    }
  })
  window.api.receive('microsoft-login-success',(data)=>{
    if(data){
      console.log(data)
    }
  })
})

  return (
    <div className="setup-container" style={{ zIndex: '1' }}>
      <div className="setup-box" style={{ zIndex: '1' }}>
        {isResetting ? (
          <>
            <h2>Reset Password</h2>
            <label>
              Email:
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </label>
            <br />
            <label>
              Password:
              <input
                type="password"
                value={passwordReset}
                onChange={(e) => setPasswordReset(e.target.value)}
              />
            </label>
            <br />
            <label>
              Confirm password:
              <input
                type="password"
                value={confirmpasswordReset}
                onChange={(e) => setConfirmPasswordReset(e.target.value)}
              />
            </label>
            <br />
            <button
              className="setup-button"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset'}
            </button>
            <button
              className="setup-button ms-3"
              onClick={() => setIsResetting(false)}
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
          <div className='text-center w-100'>
          <img id="logoPD" src="images/logo-pd.png"/>
          </div>
          <h2 className='text-center'>Welcome</h2>
           
              <input
                type="email"
                value={email} placeholder='Email address'
                onChange={(e) => setEmail(e.target.value)}
              />
            <br />
              <input
                type="password"
                value={password} placeholder='Password'
                onChange={(e) => setPassword(e.target.value)}
              />
            <br />
            <p>
              <a style={{ cursor: 'pointer', color: 'blue' }} onClick={() => setIsResetting(true)}>Reset Password?</a>
            </p>
            <button
              className="setup-button btn btn-primary w-100"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Continue'}
            </button>
            <p className='mt-2'>
             Don't have an account? <Link to="/setup">Sign up...</Link>
            </p>
            <div style={{width:'100%', display:'flex', alignItems:'center'}}>
              <div style={{width:'150px',height:'1px',backgroundColor:'grey'}}></div>
              <p>OR</p>
              <div style={{width:'150px',height:'1px',backgroundColor:'grey'}}></div>
            </div>
            <div className='btn' 
              onClick={handlegooglelogin}
            style={{width:'100%',padding:'10px', border:'solid', borderBlockColor:'grey',borderRadius:'10px',borderWidth:'1px'}}><img style={{width:'30px',height:'30px'}} src="https://www.pngmart.com/files/16/Google-Logo-PNG-Image.png" alt="" /> Contine with google</div>
            {
              tokenfield && <>
            <input className='mt-1 w-100' type="text" value={token} placeholder='Verification code'
                onChange={(e) => setToken(e.target.value)}/>
            <button className='btn btn-primary w-100 mt-1' onClick={handleGoogleloginSubmit}>Verify</button>
              </>
            }
             <div className='btn mt-2'  onClick={handleMicrosoftLogin}          
             style={{width:'100%',padding:'10px', border:'solid', borderBlockColor:'grey',borderRadius:'10px',borderWidth:'1px'}}><img style={{width:'30px',height:'30px'}} src="https://cdn-icons-png.flaticon.com/512/732/732221.png" alt="" /> Continue with microsoft</div>
              {
              microsofttoken && <>
            <input className='mt-1 w-100' type="text" value={microsofttokenfield} placeholder='Verification code'
                onChange={(e) => setMicrosoftTokenField(e.target.value)}/>
            <button className='btn btn-primary w-100 mt-1' onClick={handleMicrosoftloginSubmit}>Verify</button>
              </>
            }
           
           <div>
        <button onClick={handleMicroLogin}>Login with Microsoft</button>
           </div>
           
          </>
        )}
      </div>
      
     
      {customAlert && (
        <Alert
          message={modalMessage}
          onAlertClose={() => setCustomAlert(false)}
        />
      )}
    </div>
  );
};

export default LoginPage;
