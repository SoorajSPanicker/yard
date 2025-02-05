import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';

const LicensingAgreement = () => {
  const [accepted, setAccepted] = useState(false);
  const [customAlert, setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();

  const handleAccept = () => {
    if (accepted) {
      localStorage.setItem('licensingAccepted', 'true'); // Set flag in localStorage
      navigate('/login'); // Navigate to setup page
    } else {
      setCustomAlert(true);
      setModalMessage('You must accept the licensing agreement to proceed.');
    }
  };

  return (
    <>
     <div className="licensing-container">
      <div className="licensing-box">
        <h2>Licensing Agreement</h2>
        <p>
          Please read and accept the licensing agreement to proceed.
        </p>
        <label>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          I accept the terms and conditions.
        </label>
        <br />
        <button onClick={handleAccept}>Accept and Continue</button>
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

export default LicensingAgreement;
