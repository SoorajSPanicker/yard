import React, { useState, useRef, useEffect } from "react";
import Alert from "./Alert";


function TagRegistration({ setLoading, allShipArea }) {
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    type: "",
    area: "",
    // Dimensions
    width: "",
    length: "",
    height: "",
    // Position
    posX: "",
    posY: "",
    posZ: "",
    // Rotation (in degrees)
    rotationX: "0",
    rotationY: "0",
    rotationZ: "0",
    // Translation
    translationX: "0",
    translationY: "0",
    translationZ: "0",
  });

  const [customAlert, setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [expandDimensions, setExpandDimensions] = useState(false);
  const [expandPositions, setExpandPositions] = useState(false);
  const [expandRoatation, setExpandRotation] = useState(false);
  const [expandTarnslation, setExpandTranslation] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  useEffect(() => {
    window.api.receive("tag-exists", (data) => {
      console.log(data.message);
      setCustomAlert(true);
      setModalMessage(data.message);
    });
  }, []);


  const renderInputField = (label, id, placeholder) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}:</label>
      <input
        type="number"
        id={id}
        value={formData[id]}
        onChange={handleInputChange}
        placeholder={placeholder}
       
      />
    </div>
  );

  const handleExpandDimension = () => {
    setExpandDimensions(!expandDimensions);
    setExpandPositions(false);
    setExpandRotation(false);
    setExpandTranslation(false);
  };
  const handleExpandPosition = () => {
    setExpandPositions(!expandPositions);
    setExpandDimensions(false);
    setExpandRotation(false);
    setExpandTranslation(false);
  };
  const handleExpandRotation = () => {
    setExpandRotation(!expandRoatation);
    setExpandDimensions(false);
    setExpandPositions(false);
    setExpandTranslation(false);
  };
  const handleExpandTranslation = () => {
    setExpandTranslation(!expandTarnslation);
    setExpandDimensions(false);
    setExpandPositions(false);
    setExpandRotation(false);
  };

const handleOk = async () => {
  // Validate required fields
  if (!formData.number || !formData.name || !formData.type || !formData.area) {
    setCustomAlert(true);
    setModalMessage("Asset number,name,type and area are required");
    return;
  }

  // Send data to backend
  window.api.send('register-asset', formData);
};

// Add these useEffect listeners
useEffect(() => {
  // Listen for registration response
  window.api.receive('register-asset-response', (response) => {
    setCustomAlert(true);
    setModalMessage(response.message);
    
    if (response.success) {
      // Clear form on success
      setFormData({
        number: "",
        name: "",
        type: "",
        area: "",
        width: "",
        length: "",
        height: "",
        posX: "",
        posY: "",
        posZ: "",
        rotationX: "0",
        rotationY: "0",
        rotationZ: "0",
        translationX: "0",
        translationY: "0",
        translationZ: "0",
      });
    }
  });

  // Listen for fetched assets
  window.api.receive('all-assets-fetched', (assets) => {
    // Handle fetched assets if needed
    console.log('Fetched assets:', assets);
  });

}, []);

  return (
    <div
      style={{
        zIndex: "1",
        position: "absolute",
        width: "100%",
        backgroundColor: "#33334c",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div id="bulkImportDiv">
          <div className="page">
            <section className="page-section">
              <div className="row">
                <h4>Asset Registration</h4>
              </div>
            </section>
            <hr />
            <section className="page-section">
              <div className="row">
                <div className="col-md-6">
                  <div
                    className="dialog-input"
                    style={{ fontSize: "13px", lineHeight: "30px" }}
                  >
                    <label>
                      Asset number<span style={{ fontSize: "11px" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="number"
                     value={formData.number}
                     onChange={handleInputChange}
                    />

                    <label>Name</label>
                    <input
                    type="text"
                     id="name"
                     value={formData.name}
                     onChange={handleInputChange}
                    />
                    <label>
                      Type<span style={{ fontSize: "11px" }}>*</span>
                    </label>
                    <select
                     id="type"
                     value={formData.type}
                     onChange={handleInputChange}
                      style={{ width: "100%" }}
                    >
                      <option value="" disabled>
                        Choose type
                      </option>
                      <option value="fixed_crane">Fixed Crane</option>
                        <option value="movable_crane">Movable Crane</option>
                        <option value="dry_dock">Dry Dock</option>
                        <option value="forklift">Forklift</option>
                        <option value="electrical">Electrical Equipment</option>
                        <option value="other">Other</option>
                    </select>
                    <label>
                      Area<span style={{ fontSize: "11px" }}>*</span>
                    </label>
                    <select
                     id="area"
                     value={formData.area}
                     onChange={handleInputChange}
                      style={{ width: "100%" }}
                    >
                      <option value="" disabled>
                        Select area
                      </option>
                      {allShipArea.map((area, index) => (
                        <option key={index} value={area.name}>
                          {area.name}
                        </option>
                      ))}
                    </select>

                    {/* Dimensions Section */}
                    <div className="col-span-2">
                      <label>
                        Dimensions
                        <i
                          onClick={handleExpandDimension}
                          class="ms-2 fa-solid fa-angle-down"
                        ></i>
                      </label>
                      {expandDimensions && (
                        <div className="grid grid-cols-3 gap-4">
                          {renderInputField(
                            "Width (meters)",
                            "width",
                            "e.g., 360"
                          )}
                          {renderInputField(
                            "Length (meters)",
                            "length",
                            "e.g., 65"
                          )}
                          {renderInputField(
                            "Height (meters)",
                            "height",
                            "e.g., 40"
                          )}
                        </div>
                      )}
                    </div>
                    {/* Position Section */}
                    <div className="col-span-2">
                      <label >
                        Positions
                        <i
                          onClick={handleExpandPosition}
                          class="ms-2  fa-solid fa-angle-down"
                        ></i>
                      </label>
                      {expandPositions && (
                        <div className="grid grid-cols-3 gap-4">
                          {renderInputField("Position X", "posX", "0")}
                          {renderInputField("Position Y", "posY", "0")}
                          {renderInputField("Position Z", "posZ", "0")}
                        </div>
                      )}
                    </div>

                    {/* Rotation Section */}
                    <div className="col-span-2">
                      <label>
                        Rotation (degrees){" "}
                        <i
                          onClick={handleExpandRotation}
                          class="ms-2 fa-solid fa-angle-down"
                        ></i>
                      </label>
                      {expandRoatation && (
                        <div className="grid grid-cols-3 gap-4">
                          {renderInputField("Rotation X", "rotationX", "0")}
                          {renderInputField("Rotation Y", "rotationY", "0")}
                          {renderInputField("Rotation Z", "rotationZ", "0")}
                        </div>
                      )}
                    </div>

                    {/* Translation Section */}
                    <div className="col-span-2">
                      <label >
                        Translation{" "}
                        <i
                          onClick={handleExpandTranslation}
                          class="ms-2 fa-solid fa-angle-down"
                        ></i>
                      </label>
                      {expandTarnslation && (
                        <div className="grid grid-cols-3 gap-4">
                          {renderInputField(
                            "Translation X",
                            "translationX",
                            "0"
                          )}
                          {renderInputField(
                            "Translation Y",
                            "translationY",
                            "0"
                          )}
                          {renderInputField(
                            "Translation Z",
                            "translationZ",
                            "0"
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              <button
                onClick={handleOk}
                className="btn btn-light"
                style={{ fontSize: "12px" }}
              >
                Register
              </button>
            </section>
          </div>
        </div>
      </div>
      {customAlert && (
        <Alert
          message={modalMessage}
          onAlertClose={() => setCustomAlert(false)}
        />
      )}
    </div>
  );
}

export default TagRegistration;
