import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import Alert from "./Alert";
import DeleteConfirm from "./DeleteConfirm";
import { generateUUID } from "three/src/math/MathUtils.js";
import { Modal } from "react-bootstrap";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import FileUploadProgress from "./FileUploadProgress";

function ViewTagTable({ allAssets }) {
  const [currentDeleteTag, setCurrentDeleteTag] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [editedRowIndex, setEditedRowIndex] = useState(-1);
  const [editedLineData, setEditedLineData] = useState({});

  const [customAlert, setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [importTag, setImportTag] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Add search state
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.api.receive("tag-exists", (data) => {
      console.log(data.message);
      setCustomAlert(true);
      setModalMessage(data.message);
    });
  });

  const handleDeleteAsset = (number) => {
    console.log(number);
    setCurrentDeleteTag(number);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    window.api.send("remove-asset", currentDeleteTag);
    setShowConfirm(false);
    setCurrentDeleteTag(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setCurrentDeleteTag(null);
  };

  const handleEditOpen = (index) => {
    const assetToEdit = allAssets[index];
    setEditedRowIndex(index);
    console.log(assetToEdit)

    setEditedLineData({
      id: assetToEdit.id,
      asset_number: assetToEdit.asset_number,
      name: assetToEdit.name,
      type: assetToEdit.type,
      area_id: assetToEdit.area_id,      
      width: assetToEdit.width,
      length: assetToEdit.length,
      height: assetToEdit.height,
      pos_x: assetToEdit.pos_x,
      pos_y: assetToEdit.pos_y,
      pos_z: assetToEdit.pos_z,
      rotation_x: assetToEdit.rotation_x,
      rotation_y: assetToEdit.rotation_y,
      rotation_z: assetToEdit.rotation_z,
      translation_x: assetToEdit.translation_x,
      translation_y: assetToEdit.translation_y,
      translation_z: assetToEdit.translation_z,
    });
  };

  const handleChange = (field, value) => {
    setEditedLineData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (id) => {
    
    // Prepare data for update
    const updatedData = {
      id: id,
      asset_number: editedLineData.asset_number,
      name: editedLineData.name,
      type: editedLineData.type,
      area: editedLineData.area,
      width: editedLineData.width || 0,
      length: editedLineData.length || 0,
      height: editedLineData.height || 0,
      pos_x: editedLineData.pos_x || 0,
      pos_y: editedLineData.pos_y || 0,
      pos_z: editedLineData.pos_z || 0,
      rotation_x: editedLineData.rotation_x || 0,
      rotation_y: editedLineData.rotation_y || 0,
      rotation_z: editedLineData.rotation_z || 0,
      translation_x: editedLineData.translation_x || 0,
      translation_y: editedLineData.translation_y || 0,
      translation_z: editedLineData.translation_z || 0,
    };
    console.log(updatedData)

    window.api.send("update-asset", updatedData);
    handleCloseEdit();
  };

  const handleCloseEdit = () => {
    setEditedRowIndex(-1);
    setEditedLineData({});
    setProgress(0);
  };

  // Search functionality
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredAssets = allAssets.filter(
    (asset) =>
      asset.asset_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.area?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format spatial values for display
  const formatSpatialValues = (x, y, z) => {
    return `${parseFloat(x || 0).toFixed(2)}, ${parseFloat(y || 0).toFixed(
      2
    )}, ${parseFloat(z || 0).toFixed(2)}`;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "90vh",
        backgroundColor: "white",
        zIndex: "1",
        position: "absolute",
      }}
    >
      <form>
        <div className="table-container">
          <table className="tagTable">
            <thead>
              <tr>
                <th>Asset Number</th>
                <th className="wideHead">Name</th>
                <th className="wideHead">Type</th>
                <th className="wideHead">Area</th>
                <th  className="wideHead">Dimensions (W,L,H)</th>
                <th  className="wideHead">Position (X,Y,Z)</th>
                <th className="wideHead">Rotation (X,Y,Z)</th>
                <th className="wideHead">Translation (X,Y,Z)</th>
                <th className="wideHead">Actions</th>
              </tr>
              <tr>
                <th colSpan="9">
                  <input
                    type="text"
                    placeholder="Search by Asset Number or Type"
                    value={searchQuery}
                    onChange={handleSearch}
                    style={{ width: "100%", padding: "5px" }}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((tag, index) => (
                <tr key={index} style={{ color: "black" }}>
                  <td style={{ backgroundColor: "#f0f0f0" }}>
                    {tag.asset_number}
                  </td>
                  <td>
                    {editedRowIndex === index ? (
                      <input
                        onChange={(e) => handleChange("name", e.target.value)}
                        type="text"
                        value={editedLineData.name || ""}
                      />
                    ) : (
                      tag.name
                    )}
                  </td>
                  <td>
                    {editedRowIndex === index ? (
                      <select
                        value={editedLineData.type || ""}
                        onChange={(e) => handleChange("type", e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <option value="">Select Type</option>
                        <option value="fixed_crane">Fixed Crane</option>
                        <option value="movable_crane">Movable Crane</option>
                        <option value="dry_dock">Dry Dock</option>
                        <option value="forklift">Forklift</option>
                        <option value="electrical">Electrical Equipment</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      tag.type
                    )}
                  </td>
                  <td>
                    {editedRowIndex === index ? (
                      <input
                        onChange={(e) => handleChange("area_id", e.target.value)}
                        type="text"
                        value={editedLineData.area_id || ""}
                      />
                    ) : (
                      tag.area_id
                    )}
                  </td>
                  <td>
                    {" "}
                    {editedRowIndex === index ? (
                      <div className="coordinate-inputs">
                        <label>Width:</label>
                        <input
                          type="number"
                          value={editedLineData.width || ""}
                          onChange={(e) =>
                            handleChange("width", e.target.value)
                          }
                        />
                        <label>Length:</label>
                        <input
                          type="number"
                          value={editedLineData.length || ""}
                          onChange={(e) =>
                            handleChange("length", e.target.value)
                          }
                        />
                        <label>Height:</label>
                        <input
                          type="number"
                          value={editedLineData.height || ""}
                          onChange={(e) =>
                            handleChange("height", e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      `${tag.width || 0}, ${tag.length || 0}, ${
                        tag.height || 0
                      }`
                    )}
                  </td>
                  <td>
                    {editedRowIndex === index ? (
                      <div className="coordinate-inputs">
                        <input
                          type="number"
                          value={editedLineData.pos_x || ""}
                          onChange={(e) =>
                            handleChange("pos_x", e.target.value)
                          }
                          placeholder={editedLineData.pos_x}
                          
                        />
                        <input
                          type="number"
                          value={editedLineData.pos_y || ""}
                          onChange={(e) =>
                            handleChange("pos_y", e.target.value)
                          }
                          placeholder={editedLineData.pos_y}
                         
                        />
                        <input
                          type="number"
                          value={editedLineData.pos_z || ""}
                          onChange={(e) =>
                            handleChange("pos_z", e.target.value)
                          }
                          placeholder={editedLineData.pos_z}
                         
                        />
                      </div>
                    ) : (
                      formatSpatialValues(tag.pos_x, tag.pos_y, tag.pos_z)
                    )}
                  </td>
                  <td>
                    {editedRowIndex === index ? (
                      <div className="coordinate-inputs">
                        <input
                          type="number"
                          value={editedLineData.rotation_x || ""}
                          onChange={(e) =>
                            handleChange("rotation_x", e.target.value)
                          }
                          placeholder={editedLineData.rotation_x}
                          
                        />
                        <input
                          type="number"
                          value={editedLineData.rotation_y || ""}
                          onChange={(e) =>
                            handleChange("rotation_y", e.target.value)
                          }
                          placeholder={editedLineData.rotation_y}
                        />
                        <input
                          type="number"
                          value={editedLineData.rotation_z || ""}
                          onChange={(e) =>
                            handleChange("rotation_z", e.target.value)
                          }
                          placeholder={editedLineData.rotation_z}
                        />
                      </div>
                    ) : (
                      formatSpatialValues(
                        tag.rotation_x,
                        tag.rotation_y,
                        tag.rotation_z
                      )
                    )}
                  </td>
                  <td>
                    {editedRowIndex === index ? (
                      <div className="coordinate-inputs">
                        <input
                          type="number"
                          value={editedLineData.translation_x || ""}
                          onChange={(e) =>
                            handleChange("translation_x", e.target.value)
                          }
                          placeholder={editedLineData.translation_x}
                        />
                        <input
                          type="number"
                          value={editedLineData.translation_y || ""}
                          onChange={(e) =>
                            handleChange("translation_y", e.target.value)
                          }
                          placeholder={editedLineData.translation_y}
                        />
                        <input
                          type="number"
                          value={editedLineData.translation_z || ""}
                          onChange={(e) =>
                            handleChange("translation_z", e.target.value)
                          }
                          placeholder={editedLineData.translation_z}
                        />
                      </div>
                    ) : (
                      formatSpatialValues(
                        tag.translation_x,
                        tag.translation_y,
                        tag.translation_z
                      )
                    )}
                  </td>
                  <td style={{ backgroundColor: "#f0f0f0" }}>
                    {editedRowIndex === index ? (
                      <>
                        <i
                          className="fa-solid fa-floppy-disk text-success"
                          onClick={() => handleSave(tag.id)}
                        ></i>
                        <i
                          className="fa-solid fa-xmark ms-3 text-danger"
                          onClick={handleCloseEdit}
                        ></i>
                      </>
                    ) : (
                      <>
                        <i
                          className="fa-solid fa-pencil"
                          onClick={() => handleEditOpen(index)}
                        ></i>
                        <i
                          className="fa-solid fa-trash-can ms-3"
                          onClick={() => handleDeleteAsset(tag.id)}
                        ></i>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </form>

      {customAlert && (
        <Alert
          message={modalMessage}
          onAlertClose={() => setCustomAlert(false)}
        />
      )}
      {showConfirm && (
        <DeleteConfirm
          message="Are you sure you want to delete?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default ViewTagTable;
