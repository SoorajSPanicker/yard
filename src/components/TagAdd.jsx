import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Alert from './Alert';
import { generateUUID } from 'three/src/math/MathUtils.js';
import FileUploadProgress from './FileUploadProgress';



function TagAdd({ onClose, showTagDialog, areaname, discname, sysname, alltags,setLoading }) {
  const [progress, setProgress] = useState(0);
  const [addNewTag, setaddNewTag] = useState(false);
  const [tagNo, setTagNo] = useState('');
  const [tagname, setTagName] = useState('');
  const [tagtype, setTagType] = useState('');
  const [fileName, setFilename] = useState('');
  const [parentTag,setParentTag] =useState('')
  const [filePath, setFilePath] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query
  let offsets = [];
  let offsetsobject = [];
  const [offsetTable, setOffsetTable] = useState([]);
  const [objectoffsetTable, setobjectoffsetTable] = useState([]);
  const [customAlert, setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [convertedFilename,setConvertedFileName] = useState('');
  const [convertedfilePath,setConvertedFilePath] = useState('');
  const [selectAll, setSelectAll] = useState(false);


  const handleClose = () => {
    onClose();
  };

  const handleOk = async () => {
    console.log(areaname);
    console.log(discname);
    console.log(sysname);
    console.log(tagNo);
    console.log(tagname);
    console.log(tagtype);
    console.log(fileName.name);
    console.log(fileName.path);
    const filenameToUse = convertedFilename || fileName.name;
    const filepathToUse = convertedfilePath || fileName.path;

    if (!tagNo || !tagtype) {
      setCustomAlert(true);
      setModalMessage('TagNo & tagtype is mandatory');
      return;
    } else {
      setFilePath(fileName.path);
      const data = {
        areaname: areaname,
        discname: discname,
        sysname: sysname,
        tagNo: tagNo,
        tagname: tagname,
        parentTag:parentTag,
        tagtype: tagtype,
        fileName: filenameToUse,
        filePath: filepathToUse,
        meshtable: offsetTable,
        fileTable: objectoffsetTable
      };
      window.api.send('save-tag-data', data);
      setLoading(true);
      console.log("send request to store data");
      setTagNo('');
      setTagName('');
      setTagType('');
      setFilename('');
      setFilePath('');
      handleCloseTag();
    }
    handleCloseTag();
  };

  const handleaddnewTag = () => {
    setaddNewTag(true);
  }
  const handleCloseTag = () => {
    setaddNewTag(false);
  }

  const toggleTagSelection = (tagNumber) => {
    console.log(tagNumber);
    setSelectedTags((prevSelectedTags) =>
      prevSelectedTags.includes(tagNumber)
        ? prevSelectedTags.filter((number) => number !== tagNumber)
        : [...prevSelectedTags, tagNumber]
    );
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      // If selecting all, add all filtered tag numbers to selectedTags
      const allFilteredTagNumbers = filteredTags.map(tag => tag.number);
      setSelectedTags(allFilteredTagNumbers);
    } else {
      // If deselecting all, clear selectedTags
      setSelectedTags([]);
    }
  };

  const handleTagOk = () => {
    if (selectedTags.length === 0) {
      setCustomAlert(true);
      setModalMessage("Please select tags.");
    } else {
      const tagDataArray = selectedTags.map(tagNumber => {
        const tag = alltags.find(t => t.number === tagNumber);
        return {
          areaname,
          discname,
          sysname,
          tagNo: tag.number,
          tagName: tag.name
        };
      });
      window.api.send('save-tag-sys-data', tagDataArray);
      handleClose();
    }
  };

  const handleFileChange = (e) => {
    console.log(e);
    setFilename(e.target.files[0]);
    const file = e.target.files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'fbx') {
      loadFBXFiles(file);
    } else if (fileExtension === 'gltf' || fileExtension === 'glb') {
      loadGLTFFiles(file);
    }
      else if (fileExtension === 'rvm') {
      const data = {
        name: file.name,
        path: file.path
      };
      window.api.send("rvm-gltf-converter", data);
      window.api.receive('rvm-conversion-success', (data) => {
        console.log(data);
        setConvertedFileName(data.convertedFileName);
        setConvertedFilePath(data.convertedFilePath);
        loadGLTFFiles({ name: data.convertedFilePath.split('/').pop(), path: data.convertedFilePath });
      });
    }
    else if (fileExtension === 'iges'|| fileExtension === 'igs') {
      const data = {
        name: file.name,
        path: file.path
      };
      window.api.send("iges-gltf-converter", data);
      window.api.receive('iges-conversion-success', (data) => {
        console.log(data);
        setConvertedFileName(data.convertedFileName);
        setConvertedFilePath(data.convertedFilePath);
        loadGLTFFiles({ name: data.convertedFilePath.split('/').pop(), path: data.convertedFilePath });
      });
    }
    else if (fileExtension === 'ifc') {
      const data = {
        name: file.name,
        path: file.path
      };
      window.api.send("ifc-gltf-converter", data);
      window.api.receive('ifc-conversion-success', (data) => {
        console.log(data);
        setConvertedFileName(data.convertedFileName);
        setConvertedFilePath(data.convertedFilePath);
        loadGLTFFiles({ name: data.convertedFilePath.split('/').pop(), path: data.convertedFilePath });
      });
    }
    else if (fileExtension === 'dae') {
      const data = {
        name: file.name,
        path: file.path
      };
      window.api.send("dae-gltf-converter", data);
      window.api.receive('dae-conversion-success', (data) => {
        console.log(data);
        setConvertedFileName(data.convertedFileName);
        setConvertedFilePath(data.convertedFilePath);
        loadGLTFFiles({ name: data.convertedFilePath.split('/').pop(), path: data.convertedFilePath });
      });
    }
    else {
      setCustomAlert(true);
      setModalMessage('Unsupported file type. Please select an FBX, GLTF, or GLB file.');
    }
  };

  function generateCustomID(prefix) {
    const uuid = generateUUID();
    const uniqueID = prefix + uuid.replace(/-/g, '').slice(0, 6);
    return uniqueID;
  }

  const loadFBXFiles = (selectedFiles) => {
    console.log(selectedFiles);
    if (!selectedFiles) return;
    const fbxLoader = new FBXLoader();

    const loadedObjects = [];
    const loadedOffsets = [];
    const loadedOffsetsobject = [];
    const offsetBoundingBoxCenters = [];

    const file = selectedFiles;
    const id = generateCustomID('F');

    fbxLoader.load(URL.createObjectURL(file), (object) => {
      console.log('Loaded FBX object:', object);
      loadedObjects.push({ object, filename: file.name });
      const totalMeshes = object.children.length;
      let meshesProcessed = 0;
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const boundingBox = calculateBoundingBox(child);
          const maxbb = boundingBox.max;
          const minbb = boundingBox.min;

          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          console.log(`File - Mesh Bounding Box Center:`, center.toArray());
          const offset = boundingBox.getCenter(new THREE.Vector3());
          loadedOffsets.push(offset);
          offsets.push(offset);
          offsetBoundingBoxCenters.push({
            fileid: id,
            fileName: file.name.substring(0, file.name.lastIndexOf('.fbx')),
            meshName: child.name,
            tagNo: child.name.replace(/[^a-zA-Z0-9]/g, ''),
            maxbb: maxbb,
            minbb: minbb,
            offset: offset
          });
          console.log(offsetBoundingBoxCenters);
          meshesProcessed++;
          const progressPercentage = Math.min((meshesProcessed / totalMeshes) * 100, 100);
          setProgress(progressPercentage);
        }
      });

      const boundingBoxobject = calculateBoundingBox(object);
      const maxbbobject = boundingBoxobject.max;
      const minbbobject = boundingBoxobject.min;

      const center = new THREE.Vector3();
      boundingBoxobject.getCenter(center);
      console.log(`File - Bounding Box Center:`, center.toArray());
      const offsetObject = center;
      loadedOffsetsobject.push({
        fileid: id,
        objectName: file.name.substring(0, file.name.lastIndexOf('.fbx')),
        maxbbobject: maxbbobject,
        minbbobject: minbbobject,
        offset: offsetObject
      });
      offsetsobject.push(offsetObject);
    },
      undefined,
      (error) => {
        console.error('Error loading FBX:', error);
      }
    );

    setOffsetTable(offsetBoundingBoxCenters);
    setobjectoffsetTable(loadedOffsetsobject);
  };

  const loadGLTFFiles = (selectedFile) => {
    console.log(selectedFile);
    if (!selectedFile) return;
   

    const gltfLoader = new GLTFLoader();
    const loadedObjects = [];
    const loadedOffsets = [];
    const loadedOffsetsobject = [];
    const offsetBoundingBoxCenters = [];

    const file = selectedFile;
    const id = generateCustomID('F');

    gltfLoader.load(
      selectedFile.path ? selectedFile.path : URL.createObjectURL(file),
      (gltf) => {
        const object = gltf.scene;
        console.log('Loaded GLTF object:', object);
        const filenameToUse = convertedFilename || file.name;
        console.log("filenameToUse",filenameToUse);

        loadedObjects.push({ object, filename: filenameToUse });
        const totalMeshes = object.children.length;
        let meshesProcessed = 0;
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const boundingBox = calculateBoundingBox(child);
            const maxbb = boundingBox.max;
            const minbb = boundingBox.min;

            const center = new THREE.Vector3();
            boundingBox.getCenter(center);
            console.log(`File - Mesh Bounding Box Center:`, center.toArray());
            const offset = boundingBox.getCenter(new THREE.Vector3());
            loadedOffsets.push(offset);
            offsets.push(offset);
            offsetBoundingBoxCenters.push({
              fileid: id,
              fileName: filenameToUse,
              meshName: child.name,
              tagNo: child.name.replace(/[^a-zA-Z0-9]/g, ''),
              maxbb: maxbb,
              minbb: minbb,
              offset: offset,
            });
            console.log(offsetBoundingBoxCenters);
            meshesProcessed++;
            const progressPercentage = Math.min((meshesProcessed / totalMeshes) * 100, 100);
            setProgress(progressPercentage);
          }
        });

        const boundingBoxobject = calculateBoundingBox(object);
        const maxbbobject = boundingBoxobject.max;
        const minbbobject = boundingBoxobject.min;
        const center = new THREE.Vector3();
        boundingBoxobject.getCenter(center);
        console.log(`File - Bounding Box Center:`, center.toArray());
        const offsetObject = center;
        loadedOffsetsobject.push({
          fileid: id,
          objectName: filenameToUse,
          maxbbobject: maxbbobject,
          minbbobject: minbbobject,
          offset: offsetObject,
        });
        offsetsobject.push(offsetObject);
      },
      undefined,
      (error) => {
        console.error('Error loading GLTF:', error);
      }
    );

    setOffsetTable(offsetBoundingBoxCenters);
    setobjectoffsetTable(loadedOffsetsobject);
  };

  const calculateBoundingBox = (object) => {
    const boundingBox = new THREE.Box3().setFromObject(object);
    return boundingBox;
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredTags = alltags.filter(tag =>
    tag.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Modal
        onHide={handleClose}
        show={showTagDialog}
        backdrop="static"
        keyboard={false}>
        <div className="Tag-dialog">
          <div className="title-dialog">
            <p className='text-light'>Add Tags</p>
            <p className='text-light cross' onClick={handleClose}>&times;</p>
          </div>
          <div className="dialog-input mt-4" style={{ border: 'none', borderRadius: '5px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="search"
                placeholder="Search"
                style={{ border: 'none', borderRadius: '5px', paddingLeft: '25px' }}
                value={searchQuery} // Add search query state to input value
                onChange={handleSearch} // Add onChange event to handle search
              />
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '5px', top: '50%', transform: 'translateY(-50%)', color: 'grey' }}></i>
            </div>
          </div>
          <div className="tagListContainer" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <ul className="alltags" style={{ padding: '5px', listStyleType: 'none', margin: '0' }}>
            <li style={{ marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
        <input
          type="checkbox"
          style={{ marginRight: '5px' }}
          checked={selectAll}
          onChange={handleSelectAll}
        />
        <span><strong>Select All</strong></span>
      </li>
              {filteredTags.map((tag, index) => ( // Use filteredTags instead of alltags
                <li key={index} style={{ marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    style={{ marginRight: '5px' }}
                    checked={selectedTags.includes(tag.number)}
                    onChange={() => toggleTagSelection(tag.number)}
                  />
                  <span>{tag.number.length > 17 ? tag.number.slice(0, 17) : tag.number}...</span>
                </li>
              ))}
            </ul>
          </div>
          <div className='dialog-buttons' style={{ bottom: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#515CBC', cursor: 'pointer' }} onClick={handleaddnewTag}>Register New Tag</p>
            <div className='btn1' onClick={handleTagOk}><p>Ok</p></div>
          </div>
        </div>
      </Modal>
      {
        addNewTag &&
        <Modal
          onHide={handleCloseTag}
          show={addNewTag}
          backdrop="static"
          keyboard={false}
        >
          <div className="Tag-dialog">
            <div className="title-dialog">
              <p className='text-light'>Register Tag</p>
              <p className='text-light cross' onClick={handleCloseTag}>&times;</p>
            </div>
            <div className="dialog-input">
              <label>Tag number<span style={{ fontSize: '11px' }}>*</span></label>
              <input type="text" value={tagNo} onChange={(e) => setTagNo(e.target.value)} />
              <label>Parent Tag:</label>
          <select value={parentTag} onChange={(e) => setParentTag(e.target.value)} style={{ width: '100%' }}>
            <option value="">Select Parent Tag</option>
            {alltags.map((tag,index) => (
              <option key={index} value={tag.name}>{tag.number}</option>
            ))}
          </select>
              <label>Name</label>
              <input type="text" value={tagname} onChange={(e) => setTagName(e.target.value)} />
              <label>Type<span style={{ fontSize: '11px' }}>*</span></label>
              <select onChange={(e) => setTagType(e.target.value)} style={{ width: '100%' }}>
                <option value={tagtype} selected></option>
                <option value="Line">Line</option>
                <option value="Equipment">Equipment</option>
                <option value="Valve">Valve</option>
                <option value="Structural">Structural</option>
                <option value="Other">Other</option>
              </select>
              <label>Model</label>
              <input type="file" onChange={(e) => handleFileChange(e)} />
              <div className="row z-up" style={{ paddingTop: '10px' }}>
                            <div className="col">
                                {fileName && <FileUploadProgress progress={progress} />}
                            </div>
                        </div>
            </div>
            <div className="checkbox-container">
              <input type="checkbox" />
              <p>Use Z-Up</p>
            </div>
            <div className='dialog-button' style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className='btn2 btn-dark' onClick={handleOk}>OK</button>
            </div>
          </div>
        </Modal>
      }
      {customAlert && (
        <Alert
          message={modalMessage}
          onAlertClose={() => setCustomAlert(false)}
        />
      )}
    </>
  )
}

export default TagAdd;
