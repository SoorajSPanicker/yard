// src/components/UserSetup.js
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Link ,useNavigate} from 'react-router-dom'; 
import { base_url } from './baseurl';
import CryptoJS from 'crypto-js';
import Alert from './Alert';


const UserSetup = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [customAlert, setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
 

   const navigate = useNavigate();
   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setCustomAlert(true);
      setModalMessage('Please enter all fields.');
      return;
    }

    setLoading(true);
    const currentDateTime = new Date().toISOString();
    const appId = uuidv4();
    const hashedPassword = CryptoJS.SHA256(password).toString();

    const dataToSend = {
      username,
      email,
      password: hashedPassword,
      installeddate: currentDateTime,
    };

    try {
      const emailCheckResponse = await fetch(`${base_url}/installation?email=${encodeURIComponent(email)}`);
      const emailCheckData = await emailCheckResponse.json();

      if (emailCheckData.length > 0) {
        throw new Error('Email already exists');
      }

      const response = await fetch(`${base_url}/installation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      console.log('Response from JSON server:', data);

      window.api.send('install-app-date', appId);
      navigate('/login');
      setUsername('');
      setEmail('');
      setPassword('');
      onComplete();
    } catch (error) {
      console.error('Registration error:', error);
      setCustomAlert(true);
      setModalMessage(error.message === 'Email already exists' 
        ? 'Email already exists. If you have an account, please log in.' 
        : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="setup-container" style={{zIndex:'1'}}>
      <div className="setup-box">
      <img id="logoPD" src="images/logo-pd.png"/>
        <h2>Register new account</h2>       
          <input type="text" placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} />
        <br />
        
          <input placeholder='Email address' type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <br />
     
          <input placeholder='Password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <button
          className="setup-button btn-primary w-100"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Register'}
        </button>
        <p className='mt-2'>
              Already registered? <Link to="/login">Login here..</Link>
            </p>
      </div>
    </div>
     {customAlert && (
      <Alert
        message={modalMessage}
        onAlertClose={() => setCustomAlert(false)}
      />
    )}
    </>
    
  );
};

export default UserSetup;
