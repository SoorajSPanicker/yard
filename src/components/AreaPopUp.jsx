import React, { useState, useRef, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Alert from "./Alert";

function AreaPopUp({ onClose, areaPopUpBox }) {
  const [formData, setFormData] = useState({
    name: '',
    // Dimensions
    width: '',
    length: '',
    height: '',
    // Position
    posX: '',
    posY: '',
    posZ: '',
    // Rotation (in degrees)
    rotationX: '0',
    rotationY: '0',
    rotationZ: '0',
    // Translation
    translationX: '0',
    translationY: '0',
    translationZ: '0',
  });

  const [customAlert, setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const nameInputRef = useRef(null);
  const [expandDimensions,setExpandDimensions] = useState(false);
  const [expandPositions,setExpandPositions] = useState(false);
  const [expandRoatation,setExpandRotation] = useState(false);
  const [expandTarnslation,setExpandTranslation] = useState(false);


  useEffect(() => {
    if (areaPopUpBox) {
      setFormData({
        name: '',
        width: '',
        length: '',
        height: '',
        posX: '',
        posY: '',
        posZ: '',
        rotationX: '0',
        rotationY: '0',
        rotationZ: '0',
        translationX: '0',
        translationY: '0',
        translationZ: '0',
      });
      if (nameInputRef.current) {
        setTimeout(() => {
          nameInputRef.current.focus();
        }, 100);
      }
    }

    window.api.receive('save-dock-area-response', (response) => {
      if (response.success) {
        handleClose();
      } else {
        setCustomAlert(true);
        setModalMessage(response.message || 'Error saving dock area');
      }
    });
  }, [areaPopUpBox]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleClose = () => {
    setFormData({
      name: '',
      width: '',
      length: '',
      height: '',
      posX: '',
      posY: '',
      posZ: '',
      rotationX: '0',
      rotationY: '0',
      rotationZ: '0',
      translationX: '0',
      translationY: '0',
      translationZ: '0',
    });
    onClose();
  };

  const handleSave = () => {
    if (!formData.name || !formData.width || !formData.length ) {
      setCustomAlert(true);
      setModalMessage("Name, width and length are required");
      return;
    }

    if (isNaN(formData.width) || isNaN(formData.length)) {
      setCustomAlert(true);
      setModalMessage("Dimensions must be valid numbers");
      return;
    }

    window.api.send('save-dock-area', formData);
    handleClose();
  };

  const renderInputField = (label, id, placeholder) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}:</label>
      <input
        type="number"
        id={id}
        value={formData[id]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full p-2 border rounded"
      />
    </div>
  );

  const handleExpandDimension = ()=>{
    setExpandDimensions(!expandDimensions);
    setExpandPositions(false);
    setExpandRotation(false);
    setExpandTranslation(false);
  }
  const handleExpandPosition = ()=>{
    setExpandPositions(!expandPositions);
    setExpandDimensions(false);
    setExpandRotation(false);
    setExpandTranslation(false);  
  }
  const handleExpandRotation = ()=>{
    setExpandRotation(!expandRoatation);
    setExpandDimensions(false);
    setExpandPositions(false);
    setExpandTranslation(false);
    }
  const handleExpandTranslation = ()=>{
    setExpandTranslation(!expandTarnslation);
    setExpandDimensions(false);
    setExpandPositions(false);
    setExpandRotation(false);  }

  return (
    <>
      <Modal
        onHide={handleClose}
        show={areaPopUpBox}
        backdrop="static"
        keyboard={false}
      >
        <div className="ship-area-dialog">
          <div className="title-dialog">
            <p className="text-light">Add Area</p>
            <p className="text-light cross" onClick={handleClose}>
              &times;
            </p>
          </div>
          <div className="dialog-input">
            <label className="block text-sm font-medium mb-1">Area Name:</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., DOCK1"
              className="w-full p-2 border rounded"
              ref={nameInputRef}
            />

            {/* Dimensions Section */}
            <div className="col-span-2">
              <h5>Dimensions<i onClick={handleExpandDimension} class="ms-2 fs-5 fa-solid fa-angle-down"></i></h5>
              {
                expandDimensions && <div className="grid grid-cols-3 gap-4">
                {renderInputField("Width (meters)", "width", "e.g., 360")}
                {renderInputField("Length (meters)", "length", "e.g., 65")}
                {renderInputField("Height (meters)", "height", "e.g., 40")}
              </div>
              }
              
            </div>
            {/* Position Section */}
            <div className="col-span-2">
              <h5 >Positions<i onClick={handleExpandPosition} class="ms-2 fs-5 fa-solid fa-angle-down"></i></h5>
              {
                expandPositions && 
                <div className="grid grid-cols-3 gap-4">
                {renderInputField("Position X", "posX", "0")}
                {renderInputField("Position Y", "posY", "0")}
                {renderInputField("Position Z", "posZ", "0")}
              </div>
              }
            </div>

            {/* Rotation Section */}
            <div className="col-span-2">
              <h5 >Rotation(degrees) <i onClick={handleExpandRotation} class="ms-2 fs-5 fa-solid fa-angle-down"></i></h5>
            {
                expandRoatation && 
                <div className="grid grid-cols-3 gap-4">
                  {renderInputField("Rotation X", "rotationX", "0")}
                  {renderInputField("Rotation Y", "rotationY", "0")}
                  {renderInputField("Rotation Z", "rotationZ", "0")}
                </div>
            }
            </div>

            {/* Translation Section */}
            <div className="col-span-2">
              <h5>Translation <i onClick={handleExpandTranslation} class="ms-2 fs-5 fa-solid fa-angle-down"></i></h5>
             {
              expandTarnslation &&  <div className="grid grid-cols-3 gap-4">
              {renderInputField("Translation X", "translationX", "0")}
              {renderInputField("Translation Y", "translationY", "0")}
              {renderInputField("Translation Z", "translationZ", "0")}
            </div>
             }
            </div>

            
          </div>
          <div
            className="dialog-button"
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <button className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button className="btn btn-dark" onClick={handleSave}>
              Ok
            </button>
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
  );
}

export default AreaPopUp;
