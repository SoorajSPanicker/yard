import React, { useState,useEffect } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import FileUploadProgress from './FileUploadProgress';
import { v4 as uuidv4 } from 'uuid';
import Alert from './Alert';

function BulkModelImport({ setLoading }) {
    const [progress, setProgress] = useState(0);
    const [offsetTable, setOffsetTable] = useState([]);
    const [objectoffsetTable, setobjectoffsetTable] = useState([]);
    const [files, setFiles] = useState([]);
    const [fileNamePath, setFileNamePath] = useState([]);
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
    const [customAlert, setCustomAlert] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [convertedFilename,setConvertedFileName] = useState('');
    const [convertedfilePath,setConvertedFilePath] = useState('');
    let Receivedfilename = null;
    let ReceivedfilePath = null;

    let offsets = [];
    let offsetsobject = [];
   

    const handleFileChange = (e) => {
        e.preventDefault();
        const selectedFiles = Array.from(e.target.files);
        processFiles(selectedFiles);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const items = e.dataTransfer.items;
        const selectedFiles = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i].webkitGetAsEntry();
            if (item.isDirectory) {
                readDirectory(item, selectedFiles, () => {
                    processFiles(selectedFiles);
                });
            } else {
                const file = items[i].getAsFile();
                selectedFiles.push(file);
            }
        }
        // Process directly dropped files
        processFiles(selectedFiles);
    };

    const readDirectory = (directory, fileArray, callback) => {
        const reader = directory.createReader();
        reader.readEntries((entries) => {
            let entryIndex = 0;

            const readNextEntry = () => {
                if (entryIndex < entries.length) {
                    const entry = entries[entryIndex++];
                    if (entry.isFile) {
                        entry.file((file) => {
                            fileArray.push(file);
                            readNextEntry();
                        });
                    } else if (entry.isDirectory) {
                        readDirectory(entry, fileArray, readNextEntry);
                    } else {
                        readNextEntry();
                    }
                } else {
                    callback();
                }
            };

            readNextEntry();
        });
    };

    const processFiles = (selectedFiles) => {
        const updatedFiles = [...files, ...selectedFiles];
        setFiles(updatedFiles);
        const filesWithPath = updatedFiles.map((file) => {
            return { name: file.name, path: file.path };
        });
        setFileNamePath(filesWithPath);
        loadFiles(selectedFiles);
    };

    const handleCheckboxChange = (e) => {
        setIsCheckboxChecked(e.target.checked);
    };

    const loadFiles = (selectedFiles) => {
        if (!selectedFiles) return;
        const totalFiles = selectedFiles.length;
        let filesLoaded = 0;
    
        const loadedObjects = [];
        const loadedOffsets = [];
        const loadedOffsetsobject = [];
        const offsetBoundingBoxCenters = [];
    
        const updateProgress = () => {
            filesLoaded++;
            const progressPercentage = Math.min((filesLoaded / totalFiles) * 100, 100);
            setProgress(progressPercentage);
        };
    
        const processFile = (file, object, id,convertedFilename) => {
            console.log(convertedFilename)
            console.log(Receivedfilename);
            const filenameToUse = Receivedfilename || file.name;
            
            console.log("filenameToUse",filenameToUse);

            loadedObjects.push({ object, filename: filenameToUse });
    
            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const boundingBox = calculateBoundingBox(child);
                    const maxbb = boundingBox.max;
                    const minbb = boundingBox.min;
    
                    const center = new THREE.Vector3();
                    boundingBox.getCenter(center);
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
                        offset: offset
                    });
                }
            });
    
            const boundingBoxobject = calculateBoundingBox(object);
            const maxbbobject = boundingBoxobject.max;
            const minbbobject = boundingBoxobject.min;
    
            const center = new THREE.Vector3();
            boundingBoxobject.getCenter(center);
            const offsetObject = center;
            loadedOffsetsobject.push({
                fileid: id,
                objectName: filenameToUse,
                maxbbobject: maxbbobject,
                minbbobject: minbbobject,
                offset: offsetObject
            });
            offsetsobject.push(offsetObject);
    
            updateProgress();
        };
    
        const handleFileLoad = (file, id, onLoad, onError) => {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const originalFilePath = file.path;
    const originalFileName = file.name;

    const updateFilePath = (convertedFileName, convertedFilePath) => {
        setFileNamePath((prevFileNamePath) =>
            prevFileNamePath.map((file) =>
                file.path === originalFilePath
                    ? { name: convertedFileName, path: convertedFilePath }
                    : file
            )
        );
    };
            
            if (fileExtension === 'fbx') {
                const fbxLoader = new FBXLoader();
                fbxLoader.load(URL.createObjectURL(file), onLoad, undefined, onError);
            } else if (fileExtension === 'gltf' || fileExtension === 'glb') {
                const dracoLoader = new DRACOLoader();
                dracoLoader.setDecoderPath('https://unpkg.com/three@0.153.0/examples/jsm/libs/draco/gltf/');
                const gltfLoader = new GLTFLoader();
                gltfLoader.setDRACOLoader(dracoLoader);
                gltfLoader.load(URL.createObjectURL(file), (gltf) => onLoad(gltf.scene), undefined, onError);
            } else if (fileExtension === 'rvm') {
                const data = {
                    name: file.name,
                    path: file.path
                };
                window.api.send("rvm-gltf-converter", data);
                window.api.receive('rvm-conversion-success', (data) => {
                    setConvertedFileName(data.convertedFileName);
                    setConvertedFilePath(data.convertedFilePath);
                    Receivedfilename = data.convertedFileName
                    ReceivedfilePath = data.convertedFilePath
                    updateFilePath(data.convertedFileName, data.convertedFilePath);
                    console.log(data.convertedFilePath);
                    console.log(data.convertedFileName);

                    const dracoLoader = new DRACOLoader();
                    dracoLoader.setDecoderPath('https://unpkg.com/three@0.153.0/examples/jsm/libs/draco/gltf/');
                    const gltfLoader = new GLTFLoader();
                    gltfLoader.setDRACOLoader(dracoLoader);
                    gltfLoader.load(data.convertedFilePath, (gltf) => onLoad(gltf.scene), undefined, onError);
                });
            } else if (fileExtension === 'iges' || fileExtension === 'igs' ) {
                const data = {
                    name: file.name,
                    path: file.path
                };
                window.api.send("iges-gltf-converter", data);
                window.api.receive('iges-conversion-success', (data) => {
                    setConvertedFileName(data.convertedFileName);
                    setConvertedFilePath(data.convertedFilePath);
                    Receivedfilename = data.convertedFileName
                    ReceivedfilePath = data.convertedFilePath
                    console.log(data.convertedFilePath);
                    console.log(data.convertedFileName);
                    updateFilePath(data.convertedFileName, data.convertedFilePath);

                    const dracoLoader = new DRACOLoader();
                    dracoLoader.setDecoderPath('https://unpkg.com/three@0.153.0/examples/jsm/libs/draco/gltf/');
                    const gltfLoader = new GLTFLoader();
                    gltfLoader.setDRACOLoader(dracoLoader);
                    gltfLoader.load(data.convertedFilePath, (gltf) => onLoad(gltf.scene), undefined, onError);
                });
            }
            else if (fileExtension === 'dae') {
                const data = {
                    name: file.name,
                    path: file.path
                };
                window.api.send("dae-gltf-converter", data);
                window.api.receive('dae-conversion-success', (data) => {
                    setConvertedFileName(data.convertedFileName);
                    setConvertedFilePath(data.convertedFilePath);
                    Receivedfilename = data.convertedFileName
                    ReceivedfilePath = data.convertedFilePath
                    console.log(data.convertedFilePath);
                    console.log(data.convertedFileName);
                    updateFilePath(data.convertedFileName, data.convertedFilePath);

                    const dracoLoader = new DRACOLoader();
                    dracoLoader.setDecoderPath('https://unpkg.com/three@0.153.0/examples/jsm/libs/draco/gltf/');
                    const gltfLoader = new GLTFLoader();
                    gltfLoader.setDRACOLoader(dracoLoader);
                    gltfLoader.load(data.convertedFilePath, (gltf) => onLoad(gltf.scene), undefined, onError);
                });
            }else {
                setCustomAlert(true);
      setModalMessage('Unsupported file type. Please select an FBX, GLTF, or GLB file.');
                
            }
        };
    
        const loadAllFiles = async () => {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                console.log(file);
                const id = uuidv4();
    
                await new Promise((resolve, reject) => {
                    const onLoad = (object, Receivedfilename) => {
                        processFile(file, object, id, Receivedfilename);
                        resolve();
                    }
    
                    const onError = (error) => {
                        console.error(`Error loading ${file.name.split('.').pop().toUpperCase()}:`, error);
                        updateProgress();
                        resolve();
                    };
    
                    handleFileLoad(file, id, onLoad, onError);
                });
            }
    
            setOffsetTable(offsetBoundingBoxCenters);
            setobjectoffsetTable(loadedOffsetsobject);
        };
    
        loadAllFiles();
    };
    

    const calculateBoundingBox = (object) => {
        const boundingBox = new THREE.Box3().setFromObject(object);
        return boundingBox;
    };

    const handleRemoveFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        const updatedFileNamePath = fileNamePath.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        setFileNamePath(updatedFileNamePath);
    };

    const handleSubmitFiles = () => {
        if (files.length === 0) {
            setCustomAlert(true);
            setModalMessage("Please choose files");
            return;
        }

        setLoading(true);
        console.log("fileNamePath",fileNamePath)
        const data = {
            fileNamePath: fileNamePath,
            meshtable: offsetTable,
            fileTable: objectoffsetTable
        };
        window.api.send("save-unassigned-data", data);
        setFiles([]);
        setOffsetTable([]);
        setobjectoffsetTable([]);
        setFileNamePath([]);
        setProgress(0);
        setIsCheckboxChecked(false);
        offsets = null;
        offsetsobject = null;
    };

    return (
        <div style={{ zIndex: '1', position: 'absolute', width: '100%', backgroundColor: '#33334c' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div id="bulkImportDiv">
                    <div className="page">
                        <section className="page-section">
                            <div className="row">
                                <h4>Bulk model import</h4>
                            </div>
                        </section>
                        <hr />
                        <section className="page-section">
                            <div className="row drop-zone">
                                <div className="drop-file">
                                    <label htmlFor="bulkImportFiles" style={{ cursor: 'pointer' }}>Drag and drop folder or click here</label>
                                    <input id="bulkImportFiles" type="file" multiple webkitdirectory="" onChange={handleFileChange} style={{ display: 'none' }} />
                                    <div>
                                        <label htmlFor="singleFileInput" style={{ cursor: 'pointer', paddingTop: '8%' }}>Drag and drop files or click here</label>
                                        <input id="singleFileInput" type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                                    </div>
                                </div>
                                {files.length > 0 && (
                                    <div className="row dropped-files">
                                        {files.map((file, index) => (
                                            <div key={index} className="file">
                                                <div className="file-info">
                                                    <i className="fa fa-file"></i> {file.name}
                                                </div>
                                                <div className="file-actions">
                                                    <i className="fa fa-close" onClick={() => handleRemoveFile(index)}></i>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                        <div className="row z-up" style={{ paddingTop: '20px' }}>
                            <div className="col">
                                {files.length > 0 && <FileUploadProgress progress={progress} />}
                            </div>
                        </div>
                        <hr />
                        <button onClick={handleSubmitFiles} className='btn btn-light' style={{ fontSize: '12px' }}>Import</button>
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

export default BulkModelImport;


