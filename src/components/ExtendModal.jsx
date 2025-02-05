import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';

function ExtendModal({ extendmodal, setExtendModal }) {
  const [selectedDuration, setSelectedDuration] = useState('1 month'); // Default to 1 month

  const handleExtendValidity = () => {
    // Logic to handle validity extension based on selectedDuration
    console.log('Extend validity by:', selectedDuration);

    window.api.send('extend-validity', selectedDuration);
    setExtendModal(false);
  };

  const handleClose = () => {
    setExtendModal(false);
  };

  const handleChange = (e) => {
    setSelectedDuration(e.target.value);
  };

  return (
    <Modal
      onHide={handleClose}
      show={extendmodal}
      backdrop="static"
      keyboard={false}
      dialogClassName="custom-modal"
    >
      <div className="extendmodal-card" style={{ width: '18rem' }}>
        <div className="extendmodal-card-body">
          <h5 className="extendmodal-card-title">Extend Validity</h5>
          <p className="card-text">
            Please choose the duration to extend your validity.
          </p>
          <div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="oneMonth"
                name="validityDuration"
                value="1 month"
                checked={selectedDuration === '1 month'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="oneMonth">
                1 Month
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="sixMonths"
                name="validityDuration"
                value="6 months"
                checked={selectedDuration === '6 months'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="sixMonths">
                6 Months
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="oneYear"
                name="validityDuration"
                value="1 year"
                checked={selectedDuration === '1 year'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="oneYear">
                1 Year
              </label>
            </div>
          </div>
          <button onClick={handleExtendValidity} className="btn btn-primary">
            Extend
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ExtendModal;
