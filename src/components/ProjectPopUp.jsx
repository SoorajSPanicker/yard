import React, { useState, useRef, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Alert from "./Alert";

function ProjectPopUp({ onClose, openProjectPopUp }) {
    const [formData, setFormData] = useState({
        projectNumber: "",
        projectName: "",
        projectType: "",
        projectDescription: ""
      });
    
      const [customAlert, setCustomAlert] = useState(false);
      const [modalMessage, setModalMessage] = useState("");
      const numberInputRef = useRef(null);
    
      useEffect(() => {
        if (openProjectPopUp) {
          setFormData({
            projectNumber: "",
            projectName: "",
            projectType: "",
            projectDescription: ""
          });
          if (numberInputRef.current) {
            setTimeout(() => {
              numberInputRef.current.focus();
            }, 100);
          }
        }
    
        // Listen for save response
        window.api.receive("save-project-response", (response) => {
          if (response.success) {
            handleClose();
          } else {
            setCustomAlert(true);
            setModalMessage(response.message || "Error saving project");
          }
        });
    
        return () => {
          window.api.removeAllListeners("save-project-response");
        };
      }, [openProjectPopUp]);
    
      const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
          ...prev,
          [id]: value,
        }));
      };
    
      const handleClose = () => {
        setFormData({
          projectNumber: "",
          projectName: "",
          projectType: "",
          projectDescription: ""
        });
        onClose();
      };
    
      const handleSave = () => {
        // Validate required fields
        if (!formData.projectNumber || !formData.projectName || !formData.projectType) {
          setCustomAlert(true);
          setModalMessage("Project number, name and type are required");
          return;
        }
    
        // Send data to backend
        window.api.send("save-ship-project", formData);
      };
 
  return (
    <>
      <Modal
        onHide={handleClose}
        show={openProjectPopUp}
        backdrop="static"
        keyboard={false}
      >
        <div className="ship-area-dialog">
          <div className="title-dialog">
            <p className="text-light">Add Project</p>
            <p className="text-light cross" onClick={handleClose}>
              &times;
            </p>
          </div>
          <div className="dialog-input">
          <label className="block text-sm font-medium mb-1">Project Number:</label>
            <input
              type="text"
              id="projectNumber"
              value={formData.projectNumber}
              onChange={handleInputChange}
              placeholder="Enter project number"
              className="w-full p-2 border rounded"
              ref={numberInputRef}
              
            />
            <label className="block text-sm font-medium mb-1">Project Name:</label>
            <input
              type="text"
              id="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              placeholder="Enter project name"
              className="w-full p-2 border rounded"
             
            />
            <label>
                     Project Type<span style={{ fontSize: "11px" }}>*</span>
                    </label>
                    <select
                     id="projectType"
                     value={formData.projectType}
                     onChange={handleInputChange}
                      style={{ width: "100%" }}
                    >
                      <option value="" disabled>
                        Choose type
                      </option>
                      <option value="Vessel upgrade">Vessel upgrade</option>
                      <option value="Module fab">Module fab</option>
                      <option value="Vessel new build">Vessel new build</option>
                      <option value="Misc projects">Misc projects</option>
                    </select>

                    <label >Project Description</label>
              <textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={handleInputChange}               
                rows="3"
                placeholder="Enter project description"
              />

        
          </div>
          <div
            className="dialog-button"
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <button className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button className="btn btn-dark" onClick={handleSave}>
              Add
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

export default ProjectPopUp;
