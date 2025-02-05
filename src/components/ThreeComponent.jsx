import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import Comment from './Comment';
import Alert from './Alert';
import { Modal } from 'react-bootstrap';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

class FreeCameraMouseControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        this.buttons = [];
        this.angularSensibility = 2000.0;
        this.speed = 1.0;
        
        this.offsetX = 0;
        this.offsetY = 0;
        this.previousPosition = null;
        this.direction = new THREE.Vector3(0, 0, 0);
        this.transformedDirection = new THREE.Vector3();
        this._cameraTransformMatrix = new THREE.Matrix4();
        
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        
        this.enabled = true;
        this.attachControl();
    }
    
    attachControl() {
        this.domElement.addEventListener('mousedown', this._onMouseDown, false);
        document.addEventListener('mouseup', this._onMouseUp, false);
        document.addEventListener('mousemove', this._onMouseMove, false);
    }
    
    detachControl() {
        this.domElement.removeEventListener('mousedown', this._onMouseDown);
        document.removeEventListener('mouseup', this._onMouseUp);
        document.removeEventListener('mousemove', this._onMouseMove);
        this.buttons = [];
        this.previousPosition = null;
    }
    
    _onMouseDown(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        this.domElement.focus();
        
        this.buttons.push(event.button);
        this.previousPosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    _onMouseUp(event) {
        if (!this.enabled) return;
        
        const buttonIndex = this.buttons.indexOf(event.button);
        if (buttonIndex !== -1) {
            this.buttons.splice(buttonIndex, 1);
        }
        
        this.previousPosition = null;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    
    _onMouseMove(event) {
        if (!this.enabled || !this.previousPosition) return;
        
        this.offsetX = event.clientX - this.previousPosition.x;
        this.offsetY = event.clientY - this.previousPosition.y;
        
        this.previousPosition.x = event.clientX;
        this.previousPosition.y = event.clientY;
    }
    
    update() {
        if (!this.enabled || !this.previousPosition) return;
        
        // Left mouse button - Rotate and move forward/backward
        if (this.buttons.indexOf(0) !== -1) {
            this.camera.rotation.y -= this.offsetX / (1 *this.angularSensibility);
            this.direction.set(0, 0, this.offsetY * this.speed / 300);
        }
        
        // Right mouse button - Pan camera
        if (this.buttons.indexOf(1) !== -1) {
            this.direction.set(
                this.offsetX * this.speed / 500,
                -this.offsetY * this.speed / 500,
                0
            );
        }
        
        if (this.buttons.indexOf(0) !== -1 || this.buttons.indexOf(1) !== -1) {
            // Transform direction based on camera rotation
            this._cameraTransformMatrix.makeRotationFromQuaternion(this.camera.quaternion);
            this.direction.applyMatrix4(this._cameraTransformMatrix);
            this.camera.position.add(this.direction);
        }
    }
    
    dispose() {
        this.detachControl();
    }

    updateCameraSpecialSettings(distance) {
        // Set mouse wheel/pinch sensitivity based on distance
        this.speed = distance ; // Adjust this factor as needed
        this.angularSensibility = Math.max(2000, distance * 10);
    }
}

function ThreeComponent({ viewHideThree,viewMode,viewHideThreeunassigned,setBackgroundColorTag,backgroundColorTag,mode, setMode, showComment, setShowComment, zoomfit, setzoomfit, selectedItem, setselectedItem, showSpinner, setActiveButton, settingbox, setsettingbox, objecttable, allComments, allEquipementList, allLineList,userTagInfotable,orthoviewmode ,allCommentStatus,savedViewDialog,setSavedViewDialog,allViews,showMeasure,setexpandGLobalModal,setActiveLink,leftNavVisible,setViewHideThree,setOpenSpidCanvas,setSpidOpen,setrightSideNavVisible, startGizmo,setStartGizmo}) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [cumulativeBoundingBox, setcumulativeBoundingBox] = useState(new THREE.Box3());
  const raycaster = useRef(null);
  const css2dRenderer = useRef(null);
  const flyModeCameraPosition = useRef(new THREE.Vector3());
  const orbitControlsTargets = useRef(new THREE.Vector3()); 
  const mouse = useRef({ x: 0, y: 0 });
  const isMouseDown = useRef(false);
  const isPanning = useRef(false);
  const isZooming = useRef(false);
  const lastMouseMovement = useRef({ x: 0, y: 0 });
  const [flySpeed, setFlySpeed] = useState(1); 
  const [flyrotationSpeed, setflyrotationSpeed] = useState(1); 
  const [AmbientLightcolor, setAmbientLightcolor] = useState('#ffffff');
  const [DirectionalLightcolor, setDirectionalLightcolor] = useState('#ffffff');
  const [PointLightcolor, setPointLightcolor] = useState('#ff0000')
  const [ReflectionIntensity, setReflectionIntensity] = useState(0.5);
  const objectVisibility = useRef({});  
  const [rightClickCoordinates, setRightClickCoordinates] = useState({ x: 0, y: 0 });
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentContent, setCommentContent] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tagInfoVisible, setTagInfoVisible] = useState(false);
  const [taginfo, settaginfo] = useState('')
  const [focus, setFocus] = useState([]);
  const [multipleselectedfocus, setmultipleSelectedfocus] = useState('')
  const [selectedObjects, setselectedObjects] = useState([]);
  const [loadedFiles, setLoadedFiles] = useState([]);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, bottom: 'auto' });
  const [customAlert,setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isMenuOpen1,setIsMenuOpen1] = useState(false);
  const [lineEqpInfo,setLineEqpInfo] = useState(false);
  const [showFileInfo,setShowFileInfo] = useState(false);
  const [commentinfo,setcommentinfo]= useState('')
  const [commentinfotable,setcommentinfotable]= useState(false);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState(''); 
  const [commentEdit,setCommentEdit] = useState('')   
  const [isEditing, setIsEditing] = useState(false);
  const [saveViewName,setSaveViewName] = useState('');
  const [showMeasureDetails,setShowMeasureDetails] = useState(false);
  const [point1, setPoint1] = useState(null);
  const [point2, setPoint2] = useState(null);
  const [distance, setDistance] = useState(null);
  const [differences, setDifferences] = useState({ diffX: null, diffY: null, diffZ: null });
  const [angles, setAngles] = useState({ horizontalAngle: null, verticalAngle: null });
  const [showMeasureDetailsAbove,setshowMeasureDetailsAbove] = useState(false);
  const [measureDetailsPosition, setMeasureDetailsPosition] = useState({ x: 0, y: 0 });
  const [saveViewMenu,setSaveViewMenu]=useState('');
  const [db, setDb] = useState(null);
  const flyControlsRef = useRef(null);
  const orbitControlsRef = useRef(null);
  const transformControlsRef = useRef(null);
  const [transformMode, setTransformMode] = useState('translate'); // 'translate', 'rotate', 'scale'
  const [isGizmoActive, setIsGizmoActive] = useState(false);

  let offsetParent, labelObject;
  let menuHeight = '200px'

  useEffect(() => {
    window.api.receive('fetched-Tag-path', (data) => {
      console.log("Received data from main process:", data);
      const fileDataArray = Array.isArray(data) ? data : [data];
      const formattedData = fileDataArray.map(file => ({
        tag: file.tag,
        filePath: file.filePath.replace(/\\/g, '/'),
        filename: file.filename,
		area:file.area,
		disc:file.disc,
		sys:file.sys
      }));
	  setSelectedTags(prevTags => {
		// Create a new array to avoid duplicates
		const newTags = formattedData.filter(newTag => 
		  !prevTags.some(prevTag => 
			prevTag.tag === newTag.tag && 
			prevTag.filename === newTag.filename &&
			prevTag.area === newTag.area &&
			prevTag.disc === newTag.disc &&
			prevTag.sys === newTag.sys
		  )
		);
		console.log(newTags);
		 // Highlight the tag in the scene
		 newTags.forEach(tag => highlightTagInScene(tag.filename));

		 // Update the viewHideThree state to make the eye icon open
		 newTags.forEach(tag => {
		   const tagKey = `${tag.area}-${tag.disc}-${tag.sys}-${tag.tag}`;
		   console.log(tagKey)
		   setViewHideThree(prevState => ({
			 ...prevState,
			 [tagKey]: true  // Set visibility to true
		   }));
		 });
   
		 return [...prevTags, ...newTags];
	   });
	 });
  }, []);

  useEffect(() => {
	window.api.receive('fetched-Tag-path-pid', (data) => {
	  console.log("Received data from main process:", data);
	  
	  const fileDataArray = Array.isArray(data) ? data : [data];
	  const formattedData = fileDataArray.map(file => ({
		tag: file.tag,
		filePath: file.filePath.replace(/\\/g, '/'),
		filename: file.filename,
		area: file.area,
		disc: file.disc,
		sys: file.sys
	  }));
	  
	  setSelectedTags(prevTags => {
		// Iterate through each file in formattedData
		formattedData.forEach(newTag => {
		  const isPresent = prevTags.some(prevTag => 
			prevTag.tag === newTag.tag && 
			prevTag.filename === newTag.filename &&
			prevTag.area === newTag.area &&
			prevTag.disc === newTag.disc &&
			prevTag.sys === newTag.sys
		  );
		  
		  if (isPresent) {
			// If the file is already present, highlight it only if not highlighted before
			console.log(`File ${newTag.filename} already present, checking highlight status...`);
			highlightTagInScene(newTag.filename);
			const tagKey = `${newTag.area}-${newTag.disc}-${newTag.sys}-${newTag.tag}`;
			setBackgroundColorTag(prevState => ({
				...prevState,
				[tagKey]: true  // Set visibility to true
			  }))
		  } else {
			// If the file is not present, add it to selectedTags, update the viewHideThree state, and highlight it
			console.log(`File ${newTag.filename} is new, adding and highlighting...`);
			
			// Add the new tag to selectedTags
			prevTags = [...prevTags, newTag];
			
			// Update the viewHideThree state to make the eye icon open
			const tagKey = `${newTag.area}-${newTag.disc}-${newTag.sys}-${newTag.tag}`;
			console.log(tagKey);
			setViewHideThree(prevState => ({
			  ...prevState,
			  [tagKey]: true  // Set visibility to true
			}));
			setBackgroundColorTag(prevState => ({
				...prevState,
				[tagKey]: true  // Set visibility to true
			  }))
			
			// Highlight the new tag in the scene
			highlightTagInScene(newTag.filename);
		  }
		});
		
		// Return the updated tags
		return prevTags;
	  });
	});
  }, []);

  const highlightTagInScene = (filename) => {
	if (sceneRef.current) {
	  sceneRef.current.traverse((object) => {
		// Check if the object has userData and the tag matches
		if (object.userData && object.userData.tag === filename) {
		  console.log(`Highlighting object with tag: ${filename}`);
		  
		  // Check if the object has been highlighted before
		  if (!object.userData.isHighlighted) {
			console.log("isHighlightened");
		    const material = object.material;
		    if (material) {
				if ('emissive' in material) {
					console.log("Material supports emissive, applying highlight...");
					material.emissive = new THREE.Color(0xff0000); // Red color for highlight
					material.emissiveIntensity = 0.5; // Adjust as needed
				} else if ('color' in material) {
					console.log("Material does not support emissive, changing color instead...");
					material.color.set(0xff0000); // Set to red color
				} else {
					console.warn(`Material of object ${object.name} does not support emissive or color properties.`);
				}
				material.needsUpdate = true;
				object.userData.isHighlighted = true; // Set a flag to indicate the object is now highlighted
		    } else {
				console.warn(`Object ${object.name} has no material.`);
		    }
		  } else {
		    console.log(`Object ${filename} is already highlighted.`);
		  }

		  const box = new THREE.Box3().setFromObject(object);
		  const center = new THREE.Vector3();
		  box.getCenter(center);
		  const objectSize = new THREE.Vector3();
		  box.getSize(objectSize);
		  const objectDistance = Math.max(objectSize.x, objectSize.y, objectSize.z)*2;
		  const distance = objectDistance;
		  const offset = distance / Math.sqrt(3); 
		  cameraRef.current.position.copy(center.clone().add(new THREE.Vector3(offset, offset, 0)));
		  cameraRef.current.position.z += distance;
		  cameraRef.current.lookAt(center);
		  console.log(`Camera positioned on object with tag: ${filename}`);
		 
		}
	  });
	}
};

  useEffect(() => {
    window.api.receive('fetched-unassigned-path', (data) => {
      console.log("Received data from main process:", data);
      const fileDataArray = Array.isArray(data) ? data : [data];
      const formattedData = fileDataArray.map(file => ({
        tag: file.number,
        filePath: file.filePath.replace(/\\/g, '/'),
        filename: file.filename
      }));
      
      setSelectedTags(prevTags => {
        // Create a new array to avoid duplicates
        const newTags = formattedData.filter(newTag => 
          !prevTags.some(prevTag => prevTag.tag === newTag.tag && prevTag.filename === newTag.filename)
        );
        // Return the updated array
        return [...prevTags, ...newTags];
      });
    });
  }, []);
  


  useEffect(() => {
      initThree();	  
      setMode('fly')
    return () => {
		window.removeEventListener('resize', onWindowResize);
		if (flyControlsRef.current) {
			flyControlsRef.current.dispose();
		}
		if (orbitControlsRef.current) {
			orbitControlsRef.current.dispose();
		}
		if (rendererRef.current) {
			rendererRef.current.dispose();
		}

    };
	
  }, [orthoviewmode]);

  useEffect(()=>{
	switchViewMode(viewMode);
  },[viewMode])

  useEffect(() => {
    if (zoomfit) {
      fitView();
      setzoomfit(false);
    }
    if (selectedItem) {
      console.log(startGizmo)
      enableInteractions();
	  enableMouseMove();
	  disableRightClick();
	  disableleftClick();
      } 
	  else if(!selectedItem) {
	  enableleftClick();	
	  enableRightClick();
      disableInteractions(); 
      }
    return () => {
      disableInteractions();
	  disableInteractions();
	  disableRightClick();
	  disableleftClick();
	 
            
      };
      
  }, [zoomfit,selectedItem,startGizmo])

  useEffect(() => {
    return () => {
      if (transformControlsRef.current) {
        transformControlsRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedTags.length > 0) {
		console.log("selectedTags",selectedTags);
      // Filter out tags for files that haven't been loaded yet
      const newTags = selectedTags.filter(tag => !loadedFiles.includes(tag.filename));
      if (newTags.length > 0) {
        // Load files sequentially
        loadFilesSequentially(newTags);
        // Update loaded files state
        setLoadedFiles(prevFiles => [...prevFiles, ...newTags.map(tag => tag.filename)]);
      }
    }
  }, [selectedTags, loadedFiles]);
  
  const GizmoControls = () => (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      zIndex: 100,
      display: isGizmoActive ? 'flex' : 'none',
      gap: '5px'
    }}>
      <button 
        onClick={() => {
          setTransformMode('translate');
          transformControlsRef.current?.setMode('translate');
        }}
        className={`btn ${transformMode === 'translate' ? 'btn-primary' : 'btn-secondary'}`}
      >
        Translate
      </button>
      <button 
        onClick={() => {
          setTransformMode('rotate');
          transformControlsRef.current?.setMode('rotate');
        }}
        className={`btn ${transformMode === 'rotate' ? 'btn-primary' : 'btn-secondary'}`}
      >
        Rotate
      </button>
      <button 
        onClick={() => {
          setTransformMode('scale');
          transformControlsRef.current?.setMode('scale');
        }}
        className={`btn ${transformMode === 'scale' ? 'btn-primary' : 'btn-secondary'}`}
      >
        Scale
      </button>
    </div>
  );

const loadFilesSequentially = async (tags) => {
    for (const tag of tags) {
      const { filePath, filename } = tag;
  

      if (filename.toLowerCase().endsWith('.fbx')) {
        await loadFbxFile(filePath, filename);
      } else if (filename.toLowerCase().endsWith('.glb') || filename.toLowerCase().endsWith('.gltf')) {
        await loadGltfFile(filePath, filename);
      } else if (filename.toLowerCase().endsWith('.rvm')) {
        const data = {
          name: filename,
          path: filePath
        };
        window.api.send("rvm-gltf-converter", data);
        const convertedFilePath = await new Promise((resolve) => {
          window.api.receive('rvm-conversion-success', (data) => {
            resolve(data.convertedFilePath);
          });
        });
        await loadGltfFile(convertedFilePath, filename);
      } else {
        console.warn(`Unsupported file type for ${filename}`);
      }

      const fileMetadata = {
        filename,
        filePath,
        tag: tag.tag
      };
    //   await saveFileMetadata(db, fileMetadata);
    }
  };
  useEffect(()=>{
    // switchControls(mode);	
	// Set initial control state
	toggleControls(mode);	
    },[mode])

	useEffect(() => {
		console.log("viewHideThreeunassigned:", viewHideThreeunassigned);
		
		// Iterate through all tags in viewHideThreeunassigned
		Object.keys(viewHideThreeunassigned).forEach(tag => {
		  const tagDetail = selectedTags.find(selectedTag => selectedTag.tag === tag);
		  if (tagDetail) {
			console.log("tagDetail", tagDetail);
			console.log(`Toggling visibility for ${tagDetail.filename}: ${viewHideThreeunassigned[tag]}`);
			toggleFileVisibility(tagDetail.filename, viewHideThreeunassigned[tag]);
		  }
		});
	  }, [viewHideThreeunassigned, selectedTags]);
	  
useEffect(() => {  
	const getVisibility = (area, disc, sys, tag) => {
	  const tagKey = `${area}-${disc}-${sys}-${tag}`;
	  const sysKey = `${area}-${disc}-${sys}`;
	  const discKey = `${area}-${disc}`;
	  const areaKey = area;
  
	  if (viewHideThree[tagKey] !== undefined) return viewHideThree[tagKey];
	  if (viewHideThree[sysKey] !== undefined) return viewHideThree[sysKey];
	  if (viewHideThree[discKey] !== undefined) return viewHideThree[discKey];
	  if (viewHideThree[areaKey] !== undefined) return viewHideThree[areaKey];
	  return true; // Default to visible if no specific state is found
	};
  
	selectedTags.forEach(tag => {
	  const visibility = getVisibility(tag.area, tag.disc, tag.sys, tag.tag);
	  toggleFileVisibility(tag.filename, visibility);
	});
  }, [viewHideThree, selectedTags,backgroundColorTag]);


const toggleControls = (controlType) => {
	if (mode === 'fly') {
		if (orbitControlsRef.current) {
			orbitControlsRef.current.enabled = false;
		}
		if (flyControlsRef.current) {
			flyControlsRef.current.enabled = true;
		}
		setMode('fly');
	} else {
		if (flyControlsRef.current) {
			flyControlsRef.current.enabled = false;
		}
		if (orbitControlsRef.current) {
			orbitControlsRef.current.enabled = true;
		}
		setMode('orbit');
	}
};
  const initThree = () => {
    sceneRef.current = new THREE.Scene();
    
    rendererRef.current = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    rendererRef.current.domElement.tabIndex = 1;
	rendererRef.current.setSize(window.innerWidth, window.innerHeight);	
	rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setClearColor('#33334c');
    rendererRef.current.domElement.style.zIndex = '0'; 	
	camersetup()
	css2dsetup();
    lightsetup();
	// Initialize both controls
	flyControlsRef.current = new FreeCameraMouseControls(cameraRef.current, rendererRef.current.domElement);
	orbitControlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
	orbitControlsRef.current.enableDamping = true;
    orbitControlsRef.current.screenSpacePanning = false;
    orbitControlsRef.current.minDistance = 1;
    orbitControlsRef.current.maxDistance = 2000;
	orbitControlsRef.current.mouseButtons = {
		LEFT: THREE.MOUSE.ROTATE, // Left click for rotation
		MIDDLE: THREE.MOUSE.DOLLY, // Middle click for zoom
		RIGHT: null, // Disable right click
	};

  transformControlsRef.current = new TransformControls(cameraRef.current, rendererRef.current.domElement);
  transformControlsRef.current.setSize(0.5); // Set a smaller default size
  transformControlsRef.current.showX = true;
  transformControlsRef.current.showY = true;
  transformControlsRef.current.showZ = true;
  
  // Add event listener for transform controls
  transformControlsRef.current.addEventListener('dragging-changed', (event) => {
    // Disable orbit/fly controls while dragging
    if (flyControlsRef.current) flyControlsRef.current.enabled = !event.value;
    if (orbitControlsRef.current) orbitControlsRef.current.enabled = !event.value;
  });
  
  // Add event listener for transform controls change
  transformControlsRef.current.addEventListener('objectChange', () => {
    // Force render when object is transformed
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  });
  
  sceneRef.current.add(transformControlsRef.current);
	
	// controlssetup();
	enableMouseMove()
    window.addEventListener('resize', onWindowResize);
    animate();
  };

  const camersetup=()=>{
	if (orthoviewmode === 'perspective') {
		cameraRef.current = new THREE.PerspectiveCamera( 75, (window.innerWidth / window.innerHeight), 0.1, 4000 );
		cameraRef.current.position.set(0, 0, 5);
		sceneRef.current.add(cameraRef.current);
		
	  } else if (orthoviewmode === 'orthographic') {
		const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;

    cameraRef.current = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2, 
      (frustumSize * aspect) / 2,  
      frustumSize / 2,             
      frustumSize / -2,            
      0.1,                        
      4000                        
    );

    cameraRef.current.position.set(0, 0, 5);
    cameraRef.current.lookAt(sceneRef.current.position);
    sceneRef.current.add(cameraRef.current);
	}
 }



  // setup light
  const lightsetup = () => {
    const light = new THREE.PointLight(PointLightcolor, ReflectionIntensity, 100);
    light.position.set(50, 50, 50);
    sceneRef.current.add(light);
    const dirLight = new THREE.DirectionalLight(DirectionalLightcolor);
    dirLight.position.set(1, 2, 3);
    sceneRef.current.add(dirLight);

    const ambLight = new THREE.AmbientLight(AmbientLightcolor);
    sceneRef.current.add(ambLight);

    offsetParent = new THREE.Group();
    sceneRef.current.add(offsetParent);

    raycaster.current = new THREE.Raycaster();
    mouse.current = new THREE.Vector2();
  }

  // setup css2dRenderer
	const css2dsetup=()=>{
		css2dRenderer.current = new CSS2DRenderer(); // Initialize CSS2DRenderer
		css2dRenderer.current.setSize(window.innerWidth, window.innerHeight);
		css2dRenderer.current.domElement.style.position = 'absolute';
		css2dRenderer.current.domElement.style.top = '0';  
		css2dRenderer.current.domElement.style.left = '0'; 
		document.body.appendChild(css2dRenderer.current.domElement);
	   }
 
	  const loadFbxFile = (filePath, filename) => {
		return new Promise((resolve, reject) => {
		  const fbxLoader = new FBXLoader();
		  fbxLoader.load(filePath, (object) => {
			if (!sceneRef.current) {
			  reject(new Error('Scene is not initialized'));
			  return;
			}
			console.log(object);
			object.userData.tag = filename;
	  
			// Set Y-up orientation
			object.rotation.x = -Math.PI / 2;
	  
			const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
			object.traverse((child) => {
			  if (child instanceof THREE.Mesh) {
				const newMaterial = child.material.clone();
				// newMaterial.color = randomColor;
				// child.material = newMaterial;
				child.userData.tag = filename;
			  }
			});
	  
			const newBoundingBox = new THREE.Box3().setFromObject(object);
			const updatedCumulativeBoundingBox = cumulativeBoundingBox.union(newBoundingBox);
			setcumulativeBoundingBox(updatedCumulativeBoundingBox);
	  
			object.addEventListener('click', () => {
			  toggleFileVisibility(filename, !object.visible);
			});
	  
			sceneRef.current.add(object);
			const isVisible = objectVisibility[filename] !== undefined ? objectVisibility[filename] : true;
			object.visible = isVisible;
			objectVisibility.current[filename] = isVisible;
			// setObjectVisibility(prev => ({ ...prev, [filename]: isVisible }));
			updateCameraAndControls(object);
			recalculateCumulativeBoundingBox();
			toggleFileVisibility(filename, isVisible); // Toggle visibility after loading
			resolve();
		  }, undefined, (error) => {
			console.error('Error loading FBX:', error);
			reject(error);
		  });
		});
	  };
	  const loadGltfFile = (filePath, filename) => {
		console.log(filePath);
		return new Promise((resolve, reject) => {
		  const loader = new GLTFLoader();
		  const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath(
            'https://unpkg.com/three@0.153.0/examples/jsm/libs/draco/gltf/'
          );

		  loader.setDRACOLoader(dracoLoader); // Set DRACOLoader instance
	  
		  loader.load(filePath, (gltf) => {
			if (!sceneRef.current) {
			  reject(new Error('Scene is not initialized'));
			  return;
			}
	  
			gltf.scene.userData.tag = filename;
	  
			// Calculate bounding box
			const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
			setcumulativeBoundingBox(cumulativeBoundingBox.union(boundingBox));
	  
			// Example: Adding click event listener
			gltf.scene.addEventListener('click', () => {
			  toggleFileVisibility(filename, !gltf.scene.visible);
			});
	  
			// Add object to scene and manage visibility
			sceneRef.current.add(gltf.scene);
			const isVisible = objectVisibility[filename] !== undefined ? objectVisibility[filename] : true;
			gltf.scene.visible = isVisible;
			objectVisibility.current[filename] = isVisible;
	  
			// Update camera and controls
			updateCameraAndControls(gltf.scene);
			recalculateCumulativeBoundingBox();
			toggleFileVisibility(filename, isVisible); // Toggle visibility after loading
	  
			resolve();
		  }, undefined, (error) => {
			console.error('Error loading GLB:', error);
			reject(error);
		  });
		});
	  };
	   

  const toggleFileVisibility = (filename, isVisible) => {
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object.userData.tag === filename) {
          object.visible = isVisible;
        }
      });
    //   setObjectVisibility(prev => ({ ...prev, [filename]: isVisible }));
      recalculateCumulativeBoundingBox();
    }
  };

  const recalculateCumulativeBoundingBox = () => {
    const newCumulativeBoundingBox = new THREE.Box3();
    sceneRef.current.traverse((object) => {
      if (object.visible) {
        newCumulativeBoundingBox.union(new THREE.Box3().setFromObject(object));
      }
    });
    setcumulativeBoundingBox(newCumulativeBoundingBox);
    console.log("Updated cumulativeBoundingBox:", newCumulativeBoundingBox);
  };

  const updateCameraAndControls = (object) => {
    const boundingBox = new THREE.Box3().setFromObject(object);
    console.log("bbbox of single file", boundingBox)
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    const distance = Math.max(size.x, size.y, size.z) * 2;

    // Update camera position based on the bounding box of the current object
    cameraRef.current.position.set(center.x, center.y, center.z + distance);
    cameraRef.current.lookAt(center);

      // Update fly controls settings
	  if (flyControlsRef.current) {
		flyControlsRef.current.updateCameraSpecialSettings(distance);
	}

	// Update orbit controls settings
	if (orbitControlsRef.current) {
		orbitControlsRef.current.target.copy(center);
		orbitControlsRef.current.minDistance = distance / 10;
		orbitControlsRef.current.maxDistance = distance * 2;
		orbitControlsRef.current.update();
	}
  };

// switch view modes
const switchViewMode = (mode) => {
    // Calculate bounding box of objects in scene
    const { storedBoundingBoxCenter, boundingBoxSize } = computeBoundingBoxData();
    const maxSize = Math.max(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z);
    const margin = maxSize * 0.1;
    const distance = maxSize + margin;

    // Switch view based on mode
    switch (mode) {
        case 'left':
            cameraRef.current.position.set(storedBoundingBoxCenter.x - distance, storedBoundingBoxCenter.y, storedBoundingBoxCenter.z);
            break;
        case 'right':
            cameraRef.current.position.set(storedBoundingBoxCenter.x + distance, storedBoundingBoxCenter.y, storedBoundingBoxCenter.z);
            break;
        case 'top':
            cameraRef.current.position.set(storedBoundingBoxCenter.x, storedBoundingBoxCenter.y + distance, storedBoundingBoxCenter.z);
            break;
        case 'bottom':
            cameraRef.current.position.set(storedBoundingBoxCenter.x, storedBoundingBoxCenter.y - distance, storedBoundingBoxCenter.z);
            break;
        case 'front':
            console.log("enter front view");
            cameraRef.current.position.set(storedBoundingBoxCenter.x, storedBoundingBoxCenter.y, storedBoundingBoxCenter.z + distance);
            break;
        case 'back':
            console.log("enter back view");
            cameraRef.current.position.set(storedBoundingBoxCenter.x, storedBoundingBoxCenter.y, storedBoundingBoxCenter.z - distance);
            break;
        default:
            console.error("Unknown view mode:", mode);
            return;
    }
    cameraRef.current.lookAt(storedBoundingBoxCenter);
};

const computeBoundingBoxData = () => {
    const visibleObjects = [];
    // Iterate through scene objects to find visible ones
    sceneRef.current.traverse((object) => {
        if (object.visible) {
            visibleObjects.push(object);
        }
    });

    // Calculate bounding box of visible objects
    const cumulativeBoundingBox = new THREE.Box3();
    visibleObjects.forEach(object => {
        const objectBoundingBox = new THREE.Box3().setFromObject(object);
        cumulativeBoundingBox.union(objectBoundingBox);
    });

    console.log("updated cumulative bounding box in computeBoundingBoxData", cumulativeBoundingBox);

    // Calculate center and size of cumulative bounding box
    const storedBoundingBoxCenter = cumulativeBoundingBox.getCenter(new THREE.Vector3());
    const boundingBoxSize = cumulativeBoundingBox.getSize(new THREE.Vector3());

    return { storedBoundingBoxCenter, boundingBoxSize };
};
const fitView = () => {
    // Create a new bounding box for all visible objects
    const cumulativeBoundingBox = new THREE.Box3();
    const visibleObjects = [];

    // Get all visible objects and calculate their bounding box
    sceneRef.current.traverse((object) => {
        if (object.visible && object.isMesh) {
            visibleObjects.push(object);
            const objectBoundingBox = new THREE.Box3().setFromObject(object);
            cumulativeBoundingBox.union(objectBoundingBox);
        }
    });

    if (visibleObjects.length === 0) return;

    // Get the center and size of the bounding box
    const center = new THREE.Vector3();
    cumulativeBoundingBox.getCenter(center);

    // Calculate bounding box dimensions
    const size = new THREE.Vector3();
    cumulativeBoundingBox.getSize(size);

    // Calculate the radius (distance needed to view the entire bounding box)
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    const cameraDistance = (maxDim / 2) / Math.tan(fov / 2) * 1.5; // 1.5 for some padding

    // Calculate camera position based on mode
    if (mode === 'orbit') {
        // Position camera and set target for orbit controls
		const offset = new THREE.Vector3(0, 0, cameraDistance);        
		cameraRef.current.position.copy(center).add(offset);
        orbitControlsRef.current.target.copy(center);

        // Update orbit controls
        orbitControlsRef.current.minDistance = cameraDistance * 0.1;
        orbitControlsRef.current.maxDistance = cameraDistance * 2;
        orbitControlsRef.current.update();
    } else if (mode === 'fly') {
        // Position camera for fly mode
        const offset = new THREE.Vector3(0, 0, cameraDistance);
        cameraRef.current.position.copy(center).add(offset);

        // Update fly controls settings
        if (flyControlsRef.current) {
            flyControlsRef.current.updateCameraSpecialSettings(cameraDistance);
        }
    }

    // Ensure camera is looking at the center
    cameraRef.current.lookAt(center);
    cameraRef.current.updateProjectionMatrix();

    
};


  // function for handle focus selected
  const focusZoomSelected = () => {
    if (!focus) {
        console.log('No object selected or invalid object');
        closeMenu();
        return;
    }

    try {
        // Calculate bounding box and key measurements
        const box = new THREE.Box3().setFromObject(focus);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        // Calculate optimal camera distance using FOV
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = cameraRef.current.fov * (Math.PI / 180);
        const cameraDistance = (maxDim / 2) / Math.tan(fov / 2) * 2; // 2 for padding

        if (mode === 'orbit') {
            // Position camera for orbit mode
			const offset = new THREE.Vector3(
                cameraDistance * 0.3,  // Reduced X offset
                cameraDistance * 0.3,  // Reduced Y offset
                cameraDistance        // Full Z distance
            );

            // Update camera position and orientation
            cameraRef.current.position.copy(center).add(offset);
            orbitControlsRef.current.target.copy(center);

            // Update orbit controls settings
            orbitControlsRef.current.minDistance = cameraDistance * 0.1;
            orbitControlsRef.current.maxDistance = cameraDistance * 2;
            orbitControlsRef.current.update();

        } else if (mode === 'fly') {
            // Calculate position for fly mode
            const flyOffset = new THREE.Vector3(
                cameraDistance * 0.3,  // Reduced X offset
                cameraDistance * 0.3,  // Reduced Y offset
                cameraDistance        // Full Z distance
            );

            // Update camera position and orientation
            cameraRef.current.position.copy(center).add(flyOffset);
            cameraRef.current.lookAt(center);

            // Update fly controls settings
            if (flyControlsRef.current) {
                // Adjust control sensitivity based on object size
                flyControlsRef.current.speed = cameraDistance * 0.001;
                flyControlsRef.current.angularSensibility = Math.max(2000, cameraDistance * 10);
                flyControlsRef.current.updateCameraSpecialSettings(cameraDistance);
            }
        }

        // Ensure camera is looking at center
        cameraRef.current.lookAt(center);
        cameraRef.current.updateProjectionMatrix();

        // Store the center for future reference
        orbitControlsTargets.current.copy(center);

        // Trigger a render
        rendererRef.current.render(sceneRef.current, cameraRef.current);

    } catch (error) {
        console.error("Error focusing on object:", error);
        setCustomAlert(true);
        setModalMessage("Error focusing on object");
    }

    closeMenu();
    setFocus(null);
};

  const onWindowResize = () => {
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
	rendererRef.current.setPixelRatio(window.devicePixelRatio);
	css2dRenderer.current.setSize(window.innerWidth, window.innerHeight);
  };


  const animate = () => {
    requestAnimationFrame(animate);

    if (rendererRef.current && css2dRenderer.current) {
        // Update controls based on mode
        if (mode === 'fly' && flyControlsRef.current) {
            flyControlsRef.current.update();
        }
        if (mode === 'orbit' && orbitControlsRef.current) {
            orbitControlsRef.current.update();
        }

        // Update transform controls
        if (transformControlsRef.current && transformControlsRef.current.enabled && isGizmoActive) {
            // TransformControls doesn't have an update method, it updates automatically
            // Just render the scene when transform controls are active
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }

        // Render the scene
        css2dRenderer.current.render(sceneRef.current, cameraRef.current);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
};

  
  const onMouseMove = (event) => {
	const canvasRect = canvasRef.current.getBoundingClientRect();

    // Calculate mouse position relative to the canvas
    const mouseX = event.clientX - canvasRect.left;
    const mouseY = event.clientY - canvasRect.top;

    // Convert mouse coordinates to normalized device coordinates
    const mouseNormalizedX = (mouseX / canvasRect.width) * 2 - 1;
    const mouseNormalizedY = -(mouseY / canvasRect.height) * 2 + 1;

    // Update the mouse vector
    mouse.x = mouseNormalizedX;
    mouse.y = mouseNormalizedY;

    // Set up the raycaster
    raycaster.current.setFromCamera({ x: mouseNormalizedX, y: mouseNormalizedY }, cameraRef.current);

    // Calculate objects intersecting the raycaster
    const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);

    const hoverInfo = document.getElementById('hover-info');

    if (intersects.length > 0) {
        // Get the first intersected object
        const intersectedObject = intersects[0].object;     
        hoverInfo.style.display = 'block';
        hoverInfo.innerHTML = `${intersectedObject.name}`;
        hoverInfo.style.left = `${mouseX + 5}px`; 
        hoverInfo.style.top = `${mouseY + 5}px`; 
    } else {
        hoverInfo.style.display = 'none';
    }
};

const attachGizmoToMesh = (mesh) => {
  if (!mesh || !transformControlsRef.current || !startGizmo) return;

  // Get bounding box of mesh
  const boundingBox = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const maxDimension = Math.max(size.x, size.y, size.z);

  // Configure transform controls
  transformControlsRef.current.attach(mesh);
  transformControlsRef.current.setMode(transformMode);
  transformControlsRef.current.setSize(maxDimension * 0.008);
  transformControlsRef.current.enabled = true;

  // Update visibility and control states
  setIsGizmoActive(true);

  // Disable regular controls while gizmo is active
  if (flyControlsRef.current) flyControlsRef.current.enabled = false;
  if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;

  // Force render to ensure gizmo appears correctly
  rendererRef.current.render(sceneRef.current, cameraRef.current);
};

// Modify the detachGizmo function:
const detachGizmo = () => {
  if (transformControlsRef.current) {
    transformControlsRef.current.detach();
    transformControlsRef.current.enabled = false;
    setIsGizmoActive(false);
    setStartGizmo(false);

    // Re-enable regular controls
    if (mode === 'fly' && flyControlsRef.current) {
      flyControlsRef.current.enabled = true;
    }
    if (mode === 'orbit' && orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
    }

    // Force render to update scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }
};


const duplicateMesh = () => {
  if (!focus) return;

  // Function to clone materials
  const cloneMaterial = (material) => {
    if (!material) return null;
    const clonedMaterial = material.clone();
    // Preserve color and other properties
    if (material.color) clonedMaterial.color = material.color.clone();
    if (material.emissive) clonedMaterial.emissive = material.emissive.clone();
    if (material.emissiveIntensity) clonedMaterial.emissiveIntensity = material.emissiveIntensity;
    return clonedMaterial;
  };

  // Deep clone the mesh with materials
  const cloneMeshWithMaterials = (originalMesh) => {
    const clone = originalMesh.clone();
    
    // Clone materials for the main mesh
    if (clone.material) {
      clone.material = cloneMaterial(originalMesh.material);
    }
    
    // Clone materials for all child meshes
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = cloneMaterial(child.material);
        // Preserve original material for future color changes
        if (originalMesh.originalMaterial) {
          child.originalMaterial = cloneMaterial(originalMesh.originalMaterial);
        }
      }
    });

    return clone;
  };

  // Create clone with preserved materials
  const clone = cloneMeshWithMaterials(focus);
  
  // Copy userData
  clone.userData = JSON.parse(JSON.stringify(focus.userData));
  
  // Get bounding box of original mesh
  const boundingBox = new THREE.Box3().setFromObject(focus);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  
  // Position clone next to original with offset
  const offset = size.x + 10;
  clone.position.set(
    focus.position.x + offset,
    focus.position.y,
    focus.position.z
  );

  // Add to scene
  sceneRef.current.add(clone);
  
  // Add event listeners
  clone.traverse((child) => {
    if (child.isMesh) {
      child.addEventListener('click', () => {
        toggleFileVisibility(child.userData.tag, !child.visible);
      });
    }
  });

  // Update scene
  recalculateCumulativeBoundingBox();
  
  // Optional: Select the cloned object
  setFocus(clone);
  highlightObject(clone);
  
  closeMenu();
};

    // mouse click  
	let clickedCoordinates = null;
	let selectedObject  = null;
	let highlightedObject = null;
	const markers = useRef([]);
    const line = useRef(null);
    const point3 = useRef(null);
    const point4 = useRef(null);
	let multipliedDistance
	let roundedDistance 

	  const onMouseClick = (event,intersectedObject) => {
			const isCtrlPressed = event.ctrlKey || event.metaKey; // metaKey for macOS
    
			if (!isCtrlPressed) {
				// If control key is not pressed, reset multiple selection and focus
				setFocus(null);
			}
				const canvasRect = canvasRef.current.getBoundingClientRect();
				console.log(canvasRect);
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
				// Calculate mouse position relative to the canvas
				const mouseX = event.clientX - canvasRect.left;
				const mouseY = event.clientY - canvasRect.top;
				
				// Convert mouse coordinates to normalized device coordinates
				const mouseNormalizedX = (mouseX / canvasRect.width) * 2 - 1;
				const mouseNormalizedY = -(mouseY / canvasRect.height) * 2 + 1;
			
				// Set up the raycaster
				raycaster.current.setFromCamera({ x: mouseNormalizedX, y: mouseNormalizedY }, cameraRef.current);
				rendererRef.current.domElement.addEventListener('contextmenu', onContextMenu);
				css2dRenderer.current.domElement.addEventListener('contextmenu', onContextMenu); 
			
				// Perform raycasting and get intersections
				const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);	
				if (event.ctrlKey && selectedItem && intersects.length > 0) {
					console.log("press control key");
				
					// Get the clicked object
					const intersectedObject = intersects[0].object;
				
					// Check if the clicked object is already in selectedObjects
					const isSelected = selectedObjects.includes(intersectedObject);
				
					// Create a new array to hold the updated selection
					let updatedSelectedObjects;
				
					if (isSelected) {
						// If the object is already selected, deselect it
						updatedSelectedObjects = selectedObjects.filter(obj => obj !== intersectedObject);
						intersectedObject.material.color.setHex(0x00ff00); // Set color back to green
					} else {
						// If the object is not selected, select it
						
						updatedSelectedObjects = [...selectedObjects, intersectedObject];
						const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
	
						
						intersectedObject.material.color.set(randomColor); // Set color to red
					}
				
					// Update the selectedObjects array
					setselectedObjects(updatedSelectedObjects);
					setmultipleSelectedfocus(updatedSelectedObjects)
				
				}
				else if (showMeasure  && selectedItem && intersects.length > 0) {
				
					console.log('showMeasure is true and clicked an object.');
					const clickedObject = intersects[0].object;				   
					// Otherwise, set the clicked object as the focus
					console.log(clickedObject);
			
			    const intersectionPoint = intersects[0].point;
				console.log("intersectionPoint",intersectionPoint);

					// Get the clicked point
					const clickedPoint = intersects[0].point;
					console.log(clickedPoint);
					
				
					if (!point3.current) {
						setshowMeasureDetailsAbove(false);
						point3.current = clickedPoint;
						setPoint1(clickedPoint);
						placeMarker(clickedPoint);
						updateMeasureDetailsPosition(point3.current);
					} else if (!point4.current) {
						point4.current = clickedPoint;
						setPoint2(clickedPoint);
						placeMarker(clickedPoint);
		
						const distance = point3.current.distanceTo(point4.current);
						 multipliedDistance = distance * 1000;
                         roundedDistance = Math.round(multipliedDistance);
						setDistance(roundedDistance);
		
						const diffX = (point3.current.x - point4.current.x) * 1000;
                        const diffY = (point3.current.y - point4.current.y) * 1000;
                        const diffZ = (point3.current.z - point4.current.z) * 1000;

                        const roundedDiffX = Math.round(diffX );
                        const roundedDiffY = Math.round(diffY);
                        const roundedDiffZ = Math.round(diffZ);

                        setDifferences({ diffX: roundedDiffX, diffY: roundedDiffY, diffZ: roundedDiffZ });
		
						const horizontalAngle = Math.atan2(diffY, diffX) * (180 / Math.PI);
                        const roundedHorizontalAngle = Math.round(horizontalAngle) ;
						console.log(roundedHorizontalAngle)

                        const distanceXY = Math.sqrt(diffX * diffX + diffY * diffY);
                        const verticalAngle = Math.atan2(diffZ, distanceXY) * (180 / Math.PI);
                        const roundedVerticalAngle = Math.round(verticalAngle);
						console.log(roundedVerticalAngle);


                        setAngles({ horizontalAngle: roundedHorizontalAngle, verticalAngle: roundedVerticalAngle });
		
						const roundedPoint3 = {
							x: Math.round(point3.current.x ),
							y: Math.round(point3.current.y ) ,
							z: Math.round(point3.current.z)
						};
					
						const roundedPoint4 = {
							x: Math.round(point4.current.x),
							y: Math.round(point4.current.y ),
							z: Math.round(point4.current.z)
						};
					
						// You can use these rounded points to display or set in state if needed
						setPoint1(roundedPoint3);
						setPoint2(roundedPoint4);
		
						drawLine(point3.current, point4.current);
						setshowMeasureDetailsAbove(true);
		
						point3.current = null;
						point4.current = null;
					} else {
						clearMarkersAndLine();
						point3.current = clickedPoint;
						setPoint1(clickedPoint);
						placeMarker(clickedPoint);
					}

					
				  }

         // In onMouseClick function, modify the gizmo condition:
else if (selectedItem && startGizmo && intersects.length > 0) {
  const clickedObject = intersects[0].object;
  if (clickedObject.isMesh) { // Make sure we're attaching to a mesh
    setFocus(clickedObject);
    selectedObject = clickedObject;
    highlightObject(selectedObject);
    attachGizmoToMesh(clickedObject);
    
  
  }
}
				  						
				else if (selectedItem && intersects.length>0) {
					console.log(selectedItem)
					const clickedObject = intersects[0].object;				   
							// Otherwise, set the clicked object as the focus
							console.log(clickedObject);
							setFocus(clickedObject);
							selectedObject= intersects[0].object ;					
					const intersectionPoint = intersects[0].point;
					const intersectionPointX=intersectionPoint.x
					const intersectionPointY=intersectionPoint.y
					const intersectionPointZ=intersectionPoint.z
					setCommentContent({intersectionPointX,intersectionPointY,intersectionPointZ});
		
					selectedObject= clickedObject ;
					highlightObject(selectedObject);
					
         
			
		
					const center = new THREE.Vector3();
					
			
			// Assuming 'selectedObject' is the object you want to get the bounding box for
			const box = new THREE.Box3().setFromObject(clickedObject);
			
			// 'box' now contains the bounding box information
			const min = box.min; // Minimum coordinates of the bounding box
			const max = box.max; // Maximum coordinates of the bounding box
			console.log("min",min);
		console.log("max",max);
			
			// Dimensions of the bounding box
			const width = max.x - min.x;
			const height = max.y - min.y;
			const depth = max.z - min.z;
			// Calculate the center of the bounding box
			const centerX = (max.x + min.x) / 2;
			const centerY = (max.y + min.y) / 2;
			const centerZ = (max.z + min.z) / 2;
			
			// Set camera position to focus on the clicked object
			box.getCenter(center);
			 // Store the bounding box center coordinates of the selected object
			 clickedCoordinates = center;
			 console.log("clickedcoordinate",clickedCoordinates)
			 const threshold = 0.001;
	  // Check if the center is (0,0,0)
	  if (Math.abs(center.x) < threshold  && center.y === 0 && center.z === 0) {
		// Hide the object
		clickedObject.visible = false;
	}
	let threeJSX = center.x;
    let threeJSY = center.y;
    let threeJSZ = center.z;
		// Check if the clicked object is part of an FBX file
		if (clickedObject.userData && clickedObject.userData.tag && clickedObject.userData.tag.includes("fbx")) {
			// Convert Cesium Z-up to Three.js Y-up for FBX objects
			threeJSX = center.x;
			threeJSY = -center.z; // Negate Z
			threeJSZ = center.y; // Swap Y and Z
		}
			const toleranceX = 0.1; // You can adjust this value as needed
			const toleranceY = 0.1; 
			const toleranceZ = 0.1; 
		// Find the corresponding object in the objecttable based on the bounding box center
		
		const clickedObjectInfo = objecttable.find((obj) =>
			Math.abs(obj.coOrdinateX - threeJSX) <toleranceX &&
			Math.abs(obj.coOrdinateY - threeJSY) <toleranceY &&
			Math.abs(obj.coOrdinateZ - threeJSZ) <toleranceZ
			
		);
		console.log("clickedObjectInfo",clickedObjectInfo);
			  settaginfo(clickedObjectInfo)
			  
			  // If the corresponding object is found, log its file ID and filename
			  if (clickedObjectInfo) {
				console.log("File ID:", clickedObjectInfo.meshid);
				console.log("Filename:", clickedObjectInfo.fileName);
				const filename =clickedObjectInfo.fileName.replace(/\.[^/.]+$/, '');
				const fileId = clickedObjectInfo.fileid;
				const tagid = clickedObjectInfo.tagId;
				const selectedObjectsInfo = objecttable.filter((obj) => obj.fileid === fileId);
				setCommentContent({ filename, fileId, intersectionPointX,intersectionPointY,intersectionPointZ});
				console.log(allEquipementList)
			if (selectedObjectsInfo.length > 0) {
				// Log all objects in the object table that have the same file ID
				console.log('All objects with the same file ID:', selectedObjectsInfo);
			} else {
				console.log('No objects found in objecttable with the same file ID.');
			}
			 // Check if the filename is present in linelist or equipmentlist
			 const linelistDetails = allLineList.find((line) => line.tagId === tagid);
			 const equipmentlistDetails = allEquipementList.find((equipment) => equipment.tagId === tagid);

			 const UsertagInfoDetails = userTagInfotable.find((tag) => tag.tagId === tagid);
			
 
			 if (linelistDetails) {
				 console.log("Details from linelist:", linelistDetails);
				 // You can update the state or perform other actions with linelistDetails
			 }
 
			 if (equipmentlistDetails) {
				 console.log("Details from equipmentlist:", equipmentlistDetails);
				 // You can update the state or perform other actions with equipmentlistDetails
			 }
			 const tagInfoDetails = {
				tagId:clickedObjectInfo.tagId,
				meshid:clickedObjectInfo.meshid,
                fileid: clickedObjectInfo.fileid,
                filename: clickedObjectInfo.fileName,
				meshname:clickedObjectInfo.meshName,
                linelistDetails: linelistDetails || null,
                equipmentlistDetails: equipmentlistDetails || null,
				UsertagInfoDetails:UsertagInfoDetails || null

            };

            settaginfo(tagInfoDetails);
			  } else {
				console.log("No object found in objecttable for the clicked bounding box center.");
			  }		
			}
			
			else {
				console.log("no click events")
        detachGizmo();
				 // Disable right-click functionality if no object is selected
				 if (highlightedObject) {
					highlightedObject.material = highlightedObject.originalMaterial;
					highlightedObject = null;
				}
				 rendererRef.current.domElement.removeEventListener('contextmenu', onContextMenu);
				 css2dRenderer.current.domElement.removeEventListener('contextmenu', onContextMenu);	
				 disableInteractions();
				 clickedCoordinates = null;
				 setCommentContent(null);
				 setIsMenuOpen(false)
				 setIsMenuOpen1(false);
				 clearSelection();
				 setselectedItem(false);
				 setActiveButton(null);
				 setIsCommentOpen(false);
				 setshowMeasureDetailsAbove(false);
                 setDifferences(null);
				 setDistance(null);
				 setAngles(null);
				 setPoint1(null);
				 setPoint2(null);
				 if (line.current) {
					sceneRef.current.remove(line.current);
					line.current.geometry.dispose();
					line.current.material.dispose();
					line.current = null;
				  }	
				  markers.current.forEach(marker => {
					sceneRef.current.remove(marker);
					marker.geometry.dispose();
					marker.material.dispose();
				  });
				  markers.current = [];				
			}
			
	  };

	  const placeMarker = (point) => {
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(point);
        sceneRef.current.add(marker);
        markers.current.push(marker);
    };

    const clearMarkersAndLine = () => {
        markers.current.forEach(marker => {
			sceneRef.current.remove(marker);
			marker.geometry.dispose();
			marker.material.dispose();
		  });
		  markers.current = [];
		
		  // Remove the line if it exists
		  if (line.current) {
			sceneRef.current.remove(line.current);
			line.current.geometry.dispose();
			line.current.material.dispose();
			line.current = null;
		  }
    };

    const drawLine = (pointA, pointB) => {
		if (line.current) {
			sceneRef.current.remove(line.current);
			line.current.geometry.dispose();
			line.current.material.dispose();
			line.current = null;
		  }
        const lineGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([pointA.x, pointA.y, pointA.z, pointB.x, pointB.y, pointB.z]);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        line.current = new THREE.Line(lineGeometry, lineMaterial);
        sceneRef.current.add(line.current);
    };

	const updateMeasureDetailsPosition = (point) => {
        const vector = new THREE.Vector3(point.x, point.y, point.z);
        vector.project(cameraRef.current);

        const widthHalf = canvasRef.current.clientWidth / 2;
        const heightHalf = canvasRef.current.clientHeight / 2;

        const x = (vector.x * widthHalf) + widthHalf;
        const y = -(vector.y * heightHalf) + heightHalf;

        setMeasureDetailsPosition({ x, y });
    };


	  // Function to clear selection
    const clearSelection = () => {
    // Reset the color of all selected objects to white
    selectedObjects.forEach(obj => {
        obj.material.color.set(0xffffff); // Set color to white
    });
    setselectedObjects([]);
   
};
	// setup enable interactions
  const enableInteractions = () => {
		css2dRenderer.current.domElement.addEventListener('mousemove', onMouseMove);
		css2dRenderer.current.domElement.addEventListener('click', onMouseClick);

	  };

	const enableMouseMove =()=>{
		rendererRef.current.domElement.addEventListener('mousemove', onMouseMove);
		rendererRef.current.domElement.addEventListener('click', onMouseClick);
	}  

   const disableInteractions = () => {
    rendererRef.current.domElement.removeEventListener('click', onMouseClick);
    css2dRenderer.current.domElement.removeEventListener('click', onMouseClick);
   };

   const disableMouseMove =()=>{
	rendererRef.current.domElement.removeEventListener('mousemove', onMouseMove);
	rendererRef.current.domElement.removeEventListener('click', onMouseClick);
}  

	  const highlightObject = (object) => {
		// Check if there's a previously highlighted object
		if (highlightedObject !== object) {
			// Reset the previously highlighted object to its original material
			if (highlightedObject !== null && highlightedObject.originalMaterial) {
				highlightedObject.material = highlightedObject.originalMaterial;
			}
			
			// Create a highlight material
			const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	
			// Store the original material of the object if not already stored
			if (!object.originalMaterial) {
				object.originalMaterial = object.material;
			}
	
			// Apply the highlight material to the object
			object.material = highlightMaterial;
	
			// Update the highlightedObject reference
			highlightedObject = object;
		}
	}

	// deselect
	const handleDeselect=()=>{
		 // Disable right-click functionality if no object is selected
		 if (focus) {
			focus.material = focus.originalMaterial;
		}
		setFocus(null);
		setIsMenuOpen(false)
		setselectedItem(false);
		setActiveButton(null);
		closeMenu();

	}

	const handleChangeColor = () => {
		// Check if there's a selected object
		if (focus) {
			// Generate a random color
			const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
			// Set the material color of the selected object
			focus.material.color.set(randomColor);
			// Store the new color information in the object itself or somewhere else
			focus.userData.color = randomColor; // Assuming 'userData' is available for storing custom data
		} else {
			console.warn("No object is currently focused to change its color.");
		}
		closeMenu(); // Close the menu in both cases
	};
	
	const calculateBoundingBox = () => {
		// Check if there are selected objects
		if (selectedObjects.length === 0) return;
	
		// Calculate cumulative bounding box
		const cumulativeBoundingBox = new THREE.Box3();
		selectedObjects.forEach((object) => {
			const objectBoundingBox = new THREE.Box3().setFromObject(object);
			cumulativeBoundingBox.union(objectBoundingBox);
		});
	
		// Get center and size
		const center = new THREE.Vector3();
		cumulativeBoundingBox.getCenter(center);
		const size = new THREE.Vector3();
		cumulativeBoundingBox.getSize(size);
	
		// Calculate optimal camera distance
		const maxDim = Math.max(size.x, size.y, size.z);
		const fov = cameraRef.current.fov * (Math.PI / 180);
		const cameraDistance = (maxDim / 2) / Math.tan(fov / 2) * 1.5; // 1.5 for padding
	
		if (mode === 'orbit') {
			// Position camera for orbit mode
			const offset = new THREE.Vector3(
				cameraDistance * 0.5,
				cameraDistance * 0.5,
				cameraDistance
			);
			
			cameraRef.current.position.copy(center).add(offset);
			orbitControlsRef.current.target.copy(center);
			
			// Update orbit controls settings
			orbitControlsRef.current.minDistance = cameraDistance * 0.1;
			orbitControlsRef.current.maxDistance = cameraDistance * 2;
			orbitControlsRef.current.update();
	
		} else if (mode === 'fly') {
			// Position camera for fly mode
			const offset = new THREE.Vector3(
				cameraDistance * 0.5,
				cameraDistance * 0.5,
				cameraDistance
			);
			
			cameraRef.current.position.copy(center).add(offset);
			cameraRef.current.lookAt(center);
	
			// Update fly controls settings
			if (flyControlsRef.current) {
				flyControlsRef.current.speed = cameraDistance * 0.001; // Adjust speed based on distance
				flyControlsRef.current.angularSensibility = Math.max(2000, cameraDistance * 10);
				flyControlsRef.current.updateCameraSpecialSettings(cameraDistance);
			}
		}
	
		// Ensure camera is looking at center
		cameraRef.current.lookAt(center);
		cameraRef.current.updateProjectionMatrix();
	
		// Store the center for future reference
		// orbitControlsTargets.current.copy(center);
	
		// Clear selection after focusing
		setselectedObjects([]);
	
		// Trigger a render
		// rendererRef.current.render(sceneRef.current, cameraRef.current);
	};
	
	// Update the handlefocusSelected function to include error handling
	const handlefocusSelected = () => {
		if (selectedObjects && selectedObjects.length > 0) {
			try {
				calculateBoundingBox();
				closeMenu();
			} catch (error) {
				console.error("Error focusing on selected objects:", error);
				setCustomAlert(true);
				setModalMessage("Error focusing on selected objects");
			}
		} else {
			setCustomAlert(true);
			setModalMessage("Please select multiple objects");
			closeMenu();
		}
	};
	
	  const handleGotoGlobalModal=()=>{
		if(focus){
			console.log(taginfo.meshid)
			window.api.send('get-mesh-data',taginfo.meshid);
			setexpandGLobalModal(true);
			setActiveLink('globalexpand')

		}
	  }
	// right click	
	const onContextMenu = (event) => {
		// Prevent the default right-click context menu
		event.preventDefault();
		const { clientX, clientY } = event;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Calculate if there is more space above or below the click point
    const isSpaceBelow = clientY + menuHeight <= windowHeight;
    const isSpaceRight = clientX + 180 <= windowWidth; // assuming menu width is 180px

    // Set the position to either use 'top' or 'bottom' based on the available space
    const top = isSpaceBelow ? clientY : clientY - menuHeight;
    const left = isSpaceRight ? clientX : clientX - 180;

    setMenuPosition({ top, left });
		
		
		if(selectedObjects){
			const x = event.clientX;
			const y = event.clientY;
			console.log(x,y)
			setRightClickCoordinates({ x, y });
			setIsMenuOpen(true);
			
		}
		else if(focus){
			const x = event.clientX;
			const y = event.clientY;
			setRightClickCoordinates({ x, y });
			setIsMenuOpen(true);
		}
		else {
			console.log("No click events");
		}
	
	
	}

	// right click	
	const onRightClickMenu = (event) => {
		// Prevent the default right-click context menu
		event.preventDefault();
		const { clientX, clientY } = event;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Calculate if there is more space above or below the click point
    const isSpaceBelow = clientY + menuHeight <= windowHeight;
    const isSpaceRight = clientX + 180 <= windowWidth; // assuming menu width is 180px

    // Set the position to either use 'top' or 'bottom' based on the available space
    const top = isSpaceBelow ? clientY : clientY - menuHeight;
    const left = isSpaceRight ? clientX : clientX - 180;

    setMenuPosition({ top, left });		
			const x = event.clientX;
			const y = event.clientY;
			console.log(x,y)
			setRightClickCoordinates({ x, y });
			setIsMenuOpen1(true);
	}
	const enableRightClick=()=>{
		rendererRef.current.domElement.addEventListener('contextmenu', onRightClickMenu);
		css2dRenderer.current.domElement.addEventListener('contextmenu', onRightClickMenu);
	}

	const disableRightClick=()=>{
		rendererRef.current.domElement.removeEventListener('contextmenu', onRightClickMenu);
		css2dRenderer.current.domElement.removeEventListener('contextmenu', onRightClickMenu);
	}

	const onLeftClickMenu=()=>{
		setIsMenuOpen1(false);
	}

	const enableleftClick=()=>{
		rendererRef.current.domElement.addEventListener('click', onLeftClickMenu);
		css2dRenderer.current.domElement.addEventListener('click', onLeftClickMenu);
	}
	const disableleftClick=()=>{
		rendererRef.current.domElement.removeEventListener('click', onLeftClickMenu);
		css2dRenderer.current.domElement.removeEventListener('click', onLeftClickMenu);
	}

	// Function to handle hiding the selected object
const hideSelectedObject = () => {
	console.log("selectedObject",focus);
    if (focus) {
        console.log(focus);
        if (sceneRef.current.children.includes(focus)) {
            focus.userData.originalVisibility = focus.visible;
            focus.visible = false; // Hide the selected object
        }
		
    } else {
        console.log('Selected object is not defined.');
    }
    closeMenu();
};

// Function to handle hiding all objects
const handleHideAll = () => {
    if (sceneRef.current) {
        sceneRef.current.children.forEach((object) => {
            object.userData.originalVisibility = object.visible; // Store original visibility
            object.visible = false; // Hide the object
        });
        closeMenu(); // Close the menu
    } else {
        console.log('Scene is not defined.');
    }
};

// Function to restore the original visibility of all objects
const handleUnhideAll = () => {
    if (sceneRef.current) {
        sceneRef.current.children.forEach((object) => {
            if (object.userData.originalVisibility !== undefined) {
                object.visible = object.userData.originalVisibility; // Restore original visibility
                delete object.userData.originalVisibility; // Clean up
            }
        });
        closeMenu(); // Close the menu
    } else {
        console.log('Scene is not defined.');
    }
};

// Function to handle hiding unselected objects
const hideUnSelectedObject = () => {
    console.log(focus);
    if (sceneRef.current) {
        sceneRef.current.children.forEach((object) => {
            object.userData.originalVisibility = object.visible; // Store original visibility
            object.visible = false; // Hide the object
        });
        if (sceneRef.current.children.includes(focus)) {
            focus.visible = true; // Make focus visible
        } else {
            sceneRef.current.add(focus);
            focus.visible = true;
        }
        closeMenu();
    } else {
        console.log('Scene is not defined.');
    }
};
	// Function to handle reload action
const handleReload = () => {
    // Handle reload logic here
    window.location.reload(); // Example: Reload the page
};

	// Function to handle closing the menu
const closeMenu = () => {
    setIsMenuOpen(false);
	setIsMenuOpen1(false);
};

 
const handleShowlineEqpInfo = () => {
	if(taginfo){
	    setLineEqpInfo(true);	
		closeMenu()
	}
	else{
		setCustomAlert(true);
		setModalMessage("No Info availible!!!!")
		closeMenu();
	}
  };
  const handleShowFileInfo =()=>{
	if(taginfo){
		setShowFileInfo(true);
		closeMenu();
	}
	else{
		setModalMessage("No Info availible!!!!")
		closeMenu();
	}

  }
  const handleTagInfo=()=>{
	console.log("enter tag info");
	if(taginfo){
	setTagInfoVisible(true);
	closeMenu();

	}
	else{
		setCustomAlert(true);
		setModalMessage("No Info availible!!!!")
		closeMenu();
	}
  }

  const handleAddComment = () => {
	// Implement logic to add a comment
	setIsCommentOpen(true);
	closeMenu(); 
  };

  const handleCloseComment = () => {
	setIsCommentOpen(false);
  };

  const handleCloselineEqpInfo = () => {
    setLineEqpInfo(false);
  };

  const handleCloseFileInfo = () => {
    setShowFileInfo(false);
  };
  const handleCloseTagInfo = () => {
    setTagInfoVisible(false);
  };

  const newLabelObjects = useRef({});
	const createLabels = () => {
		// Assuming tiles.current is not null and other setup is done
	
		// Clear existing labels
		Object.values(newLabelObjects.current).forEach((labelObject) => {
		  sceneRef.current.remove(labelObject);
		});
		newLabelObjects.current = {};
		if (showComment) {
			allComments.forEach((item) => {
				// Create label element
				const labelDiv = document.createElement('div');
				labelDiv.className = 'label';
				labelDiv.innerHTML = item.number;
				labelDiv.style.color = '#ffffff';
				labelDiv.style.padding = '3px';
				labelDiv.style.marginTop='4.3%'
				labelDiv.onclick = () => handleCommentInfo(item);
				
				 const statusColor = allCommentStatus.find(status => status.statusname === item.status)?.color || 'gray';
				 labelDiv.style.backgroundColor = statusColor;
				
				const labelObject = new CSS2DObject(labelDiv);
				
				labelObject.position.set(item.coOrdinateX, item.coOrdinateY, item.coOrdinateZ);
				sceneRef.current.add(labelObject);
				newLabelObjects.current[item.number] = labelObject;
			  });
		}
	}


useEffect(() => {
    createLabels();
    // Update visibility based on showComment state
    Object.values(newLabelObjects.current).forEach((labelObject) => {
      labelObject.visible = showComment;
    });
  }, [showComment, allComments]);
	


	const handleCommentInfo=(item)=>{
		console.log("enter");
		setcommentinfo(item)
		setcommentinfotable(true);
	}

	const handleclosecommentinfo=()=>{
		setIsEditing(false);
		setcommentinfotable(false);
		setcommentinfo(null);
		
	   }

	   const deletecomment =(commentNumber)=>{
		console.log(commentNumber)
		window.api.send("delete-comment",commentNumber);
		const deletedLabel = newLabelObjects.current[commentNumber];
		if (deletedLabel) {
			sceneRef.current.remove(deletedLabel);
			delete newLabelObjects.current[commentNumber];
		}
		setcommentinfotable(false);
		setcommentinfo(null);
	
	}

	const handleEditButtonClick = (number) => {
		setIsEditing(true);
		setCommentEdit(commentinfo.comment); 
		setStatus(commentinfo.status);
		setPriority(commentinfo.priority);
	  };
	
	const handleSaveButtonClick =(commentNumber)=>{
		setIsEditing(false);
		const data = {
			commentNumber:commentNumber,
			comment:commentEdit,
			status :status,
			priority:priority
		}
		window.api.send('editCommentStatus',data);
		setCustomAlert(true);
		setModalMessage("Status updated")
		handleclosecommentinfo()
	}
	
   // Function to handle fly controls speed change
	 const handleFlySpeedChange = (event) => {
		event.preventDefault();
		console.log(event.target.value)
		setFlySpeed(event.target.value);
	};

	const handleGotoPID=()=>{
		const tagNumber =taginfo.filename.replace(/\.[^/.]+$/, '');
		window.api.send('open-pid-from-three',tagNumber)
        setOpenSpidCanvas(true);
        setSpidOpen(true);
		setrightSideNavVisible(false);
		closeMenu();
	}

  const speedBar = mode === 'fly' && (
    <div className="speed-bar" style={{position:'absolute',top:'85vh',left:0, zIndex: '100' }}>
        <input
           type="range"
           min="0.5"
           max="2"
           step="0.1"
           value={flySpeed}
           onChange={handleFlySpeedChange}
        /> 
    </div>
);
// Define menu options
const menuOptions = [
  { label: 'Add Comment', action: handleAddComment },
  {label: 'change color',action: handleChangeColor },
  {label: 'Line/equipment info',action:handleShowlineEqpInfo},
  {label: 'Tag GenInfo',action:handleTagInfo},
  {label: 'File Info',action:handleShowFileInfo},
  {label: 'Deselect ',action:handleDeselect},
  {label: 'Zoom selected',action:focusZoomSelected},		
  {label:'Focus Selected',action:handlefocusSelected},
  {label: 'Go to Global model',action:handleGotoGlobalModal},
  {label: 'Smart P&ID',action:handleGotoPID},
  {label: 'Duplicate', action: duplicateMesh },
  {label:'Hide all',action:handleHideAll},
  {label:'Unhide all',action:handleUnhideAll},
  {label:'Hide selected',action:hideSelectedObject},
  {label:'Hide unselected',action:hideUnSelectedObject},
  {label:'Reload',action:handleReload}
  ];

  const menuOptions1 = [
	{ label: 'Unhide all',action:handleUnhideAll },
	{label: 'Unselect',action:handleDeselect},
	];
  
	const  handleSaveView = () => {
		if(!saveViewName){
			setCustomAlert(true);
			setModalMessage('Please type name')
		}
		else{
			const posX = cameraRef.current.position.x;
			const posY = cameraRef.current.position.y;
			const posZ = cameraRef.current.position.z;
			const targX = orbitControlsTargets.current.x;
			const targY = orbitControlsTargets.current.y;
			const targZ = orbitControlsTargets.current.z;
	
			const data={
				name:saveViewName,
				posX:posX,
				posY:posY,
				posZ:posZ,
				targX:targX,
				targY:targY,
				targZ:targZ
			}
	
			window.api.send('save-camera-view',data);
			setSavedViewDialog(false);
			setSaveViewName('');
		}
		
	}
	
	const handleCloseSavedView=()=>{
		setSavedViewDialog(false);
	}

	const handleShowMeasureDetails=()=>{
		setShowMeasureDetails(!showMeasureDetails);
	}

	const applyView = (view) => {
		setSaveViewMenu(view.name)
		cameraRef.current.position.set(view.posX, view.posY, view.posZ);
		orbitControlsTargets.current.set(view.targX, view.targY, view.targZ);
		cameraRef.current.lookAt(orbitControlsTargets.current);
		if (controlsRef.current) {
			controlsRef.current.target.copy(orbitControlsTargets.current);
			controlsRef.current.update();
		}
	};
  return (
	<div>
	 <div style={{ width: '100%', maxHeight: '100vh',position:'absolute',zIndex:'1'}} >
		
      <canvas ref={canvasRef} style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', overflow: 'hidden', zIndex: '0' }}>
	  </canvas>

	  <div>
		{speedBar}
{    selectedItem && <GizmoControls/>
}        </div>
		
	  <div id="hover-info" style={{
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '5px',
        borderRadius: '3px',
        pointerEvents: 'none',
        display: 'none'
      }}></div>
	  <div className="circle-containerthree">
                {allViews.map((view, index) => (
                    <div key={view.name} className="circle" onClick={() => applyView(view)}>
                        {index + 1}
                    </div>
                ))}
            </div>
     
     
    </div>

	<Comment
        x={rightClickCoordinates.x}
        y={rightClickCoordinates.y}
		
        isOpen={isCommentOpen}
        onClose={handleCloseComment}
		content={commentContent} 
		allCommentStatus={allCommentStatus}
		
      />

{customAlert && (
        <Alert
          message={modalMessage}
          onAlertClose={() => setCustomAlert(false)}
        />
      )}
	{
		isMenuOpen && <div className="menu" style={{ position: 'absolute',width:'180px', top: `${menuPosition.top}px`,
		left: `${menuPosition.left-200}px`,}}>
		{menuOptions.map((option, index) => (
		  <div key={index} className="menu-option" onClick={option.action}>
			{option.label}
		  </div>
		))}
	  </div>
	  }

      {
		isMenuOpen1 && <div className="menu" style={{ position: 'absolute',width:'180px', top: `${menuPosition.top}px`,
		left: `${menuPosition.left-200}px`,}}>
		{menuOptions1.map((option, index) => (
		  <div key={index} className="menu-option" onClick={option.action}>
			{option.label}
		  </div>
		))}
	  </div>
	  }

{
		showMeasure && (
			<>
         <div style={{ position: 'absolute', marginTop:'30%', display: 'flex', flexDirection: 'row',zIndex:'1' }}>
		 {
		showMeasureDetails ? (
			<>
			 <div className='measureInfo' style={{ left: 0,border: '1px solid black',zIndex: 1 }}>
                                <table class="measureInfoTable">
                                    <tbody>
									<tr class="bottomBordered">
                                    <th class="measureCornerCell left"></th>
                                    <th>X</th>
                                    <th>Y</th>
                                    <th>Z</th>
                                </tr>
								<tr>
                                    <th class="left">P<sub>1</sub></th>
                                    <td>{point1 ? point1.x:''}</td>
                                    <td>{point1 ? point1.z:''}</td>
                                    <td>{point1 ? point1.y:''}</td>
                                </tr>

                                <tr>
                                    <th class="left">P<sub>2</sub></th>
                                    <td>{point1 ? point1.x:''}</td>
                                    <td>{point1 ? point1.z:''}</td>
                                    <td>{point1 ? point1.y:''}</td>
                                </tr>
								<tr>
                                    <th class="left">Difference</th>
                                    <td>{differences ? differences.diffX : ''}</td>
                                    <td>{differences ? differences.diffZ : ''}</td>
                                    <td>{differences ? differences.diffY : ''}</td>
                                </tr>
								<tr class="topBordered">
                                    <th class="left">Distance</th>
                                    <td colspan="3">{distance ? distance : ''}mm</td>
                                </tr>
								<tr class="topBordered">
                                    <th class="left">Angle</th>
                                    <td colspan="3">{angles ? angles.horizontalAngle : ''} &emsp;{angles ? angles.verticalAngle: ''}</td>
                                </tr>
                                    </tbody>
                                </table>
                            </div>

			</>
		):''
	  }	
        <button onClick= {handleShowMeasureDetails} style={{writingMode: 'vertical-lr',margin:'0' }} className='btn btn-secondary'>Measurements</button>
		
      </div>	
	 	
	  </>
		)
	  }
	  
  {showMeasureDetailsAbove && (
                <div style={{
                    position: 'absolute',
                    marginLeft: measureDetailsPosition.x,
                    marginTop: `${measureDetailsPosition.y}-10px`,
                    zIndex: 1
                }}>
					<div className="row" style={{margin:'0',padding:'0'}}>
						<div className="row" style={{backgroundColor:'orange',padding:'3px',margin:'0'}}>{distance ? distance: ''}mm</div>
						<div className="row"  style={{padding:'3px',margin:'0'}}>
							<div className="col">
								<div className="row" style={{backgroundColor:'red',padding:'3px'}}>X</div>
								<div className="row" style={{backgroundColor:'green',padding:'3px'}}>Y</div>
								<div className="row" style={{backgroundColor:'blue',padding:'3px'}}>Z</div>
							</div>
							<div className="col" style={{backgroundColor:'black',color:'white'}}>
							<div className="row"  style={{padding:'3px'}}>{differences ? (differences.diffX) : ''}</div>
								<div className="row"style={{padding:'3px'}} >{differences ? differences.diffY: ''}</div>
								<div className="row"style={{padding:'3px'}} >{differences ? differences.diffZ : ''}</div>

							</div>
						</div>
						
					</div>
                </div>
            )}
	

	   {/* Render tag info */}
	   {lineEqpInfo && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: '-75px',
            height: '100vh',
            backgroundColor: '#272626',
            padding: '20px',
			boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
			zIndex: 1000,
			display: 'flex',
			flexDirection: 'column',
			color:'#fff',
			overflowY:'auto'
          }}
        >
           <div style={{ display:'flex',justifyContent:'flex-end' }}>
      <button className='btn btn-light' onClick={handleCloselineEqpInfo}>
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>

          <div>
            {/* Display your tag information here */}
           <h5 className='text-center fw-bold '>{taginfo.equipmentlistDetails?'Crane Info' :'Vessel info'}</h5> 
		   <p>{taginfo.filename}</p>
			{taginfo.equipmentlistDetails ? (
        <>
            <p>Description: {taginfo.equipmentlistDetails.descr}</p>
            <p>Quantity: {taginfo.equipmentlistDetails.qty}</p>
            <p>Capacity: {taginfo.equipmentlistDetails.capacity}</p>
            <p>EquipmentType: {taginfo.equipmentlistDetails.type}</p>
            <p>Materials: {taginfo.equipmentlistDetails.materials}</p>
            <p>Capacity/Duty: {taginfo.equipmentlistDetails.capacityDuty}</p>
            <p>Dimensions: {taginfo.equipmentlistDetails.dims}</p>
            <p>Design Pressure: {taginfo.equipmentlistDetails.dsgnPress}</p>
            <p>Optimum Pressure: {taginfo.equipmentlistDetails.opPress}</p>
            <p>Design Temperature: {taginfo.equipmentlistDetails.dsgnTemp}</p>
            <p>Operating Temp: {taginfo.equipmentlistDetails.opTemp}</p>
            <p>Dry Weight: {taginfo.equipmentlistDetails.dryWeight}</p>
            <p>Operating Weight: {taginfo.equipmentlistDetails.opWeight}</p>
            <p>Supplier: {taginfo.equipmentlistDetails.supplier}</p>
            <p>Remarks: {taginfo.equipmentlistDetails.remarks}</p>
            <p>Initial Status: {taginfo.equipmentlistDetails.initStatus}</p>
            <p>Revision: {taginfo.equipmentlistDetails.revision}</p>
            <p>Revision Date: {taginfo.equipmentlistDetails.revisionDate}</p>
        </>
    ) : taginfo.linelistDetails ? (
        <>
            <p>vessel id: {taginfo.linelistDetails.fluidCode}</p>
            <p>vessel type: {taginfo.linelistDetails.medium}</p>
            <p>vessel name : {taginfo.linelistDetails.lineSizeIn}</p>
            <p>Size: {taginfo.linelistDetails.lineSizeNb}</p>
            <p>Arrival time: {taginfo.linelistDetails.pipingSpec}</p>
            <p>Docking duration: {taginfo.linelistDetails.insType}</p>
            <p>Docking location: {taginfo.linelistDetails.insThickness}</p>
            <p>Crane requirements : {taginfo.linelistDetails.heatTrace}</p>
            <p>Company name : {taginfo.linelistDetails.lineFrom}</p>
            <p>Flag state : {taginfo.linelistDetails.lineTo}</p>

            
            {/* <p>Line To: {taginfo.linelistDetails.lineTo}</p>
            <p>MOP: {taginfo.linelistDetails.maxOpPress}</p>
            <p>MOT: {taginfo.linelistDetails.maxOpTemp}</p>
            <p>Design Pressure: {taginfo.linelistDetails.dsgnPress}</p>
            <p>Min Design Temp: {taginfo.linelistDetails.minDsgnTemp}</p>
            <p>Max Design Temp: {taginfo.linelistDetails.maxDsgnTemp}</p>
            <p>Test Pressure: {taginfo.linelistDetails.testPress}</p>
            <p>Test Medium: {taginfo.linelistDetails.testMedium}</p>
            <p>Test Medium Phase: {taginfo.linelistDetails.testMediumPhase}</p>
            <p>Mass Flow: {taginfo.linelistDetails.massFlow}</p>
            <p>Volume Flow: {taginfo.linelistDetails.volFlow}</p>
            <p>Density: {taginfo.linelistDetails.density}</p>
            <p>Velocity: {taginfo.linelistDetails.velocity}</p>
            <p>Paint System: {taginfo.linelistDetails.paintSystem}</p>
            <p>NDT Group: {taginfo.linelistDetails.ndtGroup}</p>
            <p>Chemical Cleaning: {taginfo.linelistDetails.chemCleaning}</p>
            <p>PWHT: {taginfo.linelistDetails.pwht}</p> */}
        </>
    ) : (
        <p></p>
    )}
		
          </div>
        </div>
      )}

   {/* file info */}
     {showFileInfo && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: '-75px',
            height: '100vh',
            backgroundColor: '#272626',
            padding: '20px',
			boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
			zIndex: 1000,
			display: 'flex',
			flexDirection: 'column',
			color:'#fff'
          }}
        >
           <div style={{ display:'flex',justifyContent:'flex-end' }}>
      <button className='btn btn-light' onClick={handleCloseFileInfo}>
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>

          <div>
            {/* Display your tag information here */}
           <h5 className='text-center fw-bold '>File Info </h5> 
			{/* <p>{taginfo.fileid}</p> */}
			<p>Filename:{taginfo.filename}</p>
			<p>Mesh name:{taginfo.meshname}</p>
			
          </div>
        </div>
      )}

	  {/* user tag info */}
	  {tagInfoVisible && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: '-75px',
            height: '100vh',
            backgroundColor: '#272626',
            padding: '20px',
			boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
			zIndex: 1000,
			display: 'flex',
			flexDirection: 'column',
			color:'#fff'
          }}
        >
           <div style={{ display:'flex',justifyContent:'flex-end' }}>
      <button className='btn btn-light' onClick={handleCloseTagInfo}>
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>

          <div>
            {/* Display your tag information here */}
           <h5 className='text-center fw-bold '>General Tag Info </h5> 
			        <p>Filename:{taginfo.filename}</p>
					{taginfo.UsertagInfoDetails ? (
        <>
          <p>TagInfo1: {taginfo.UsertagInfoDetails.taginfo1}</p>
          <p>TagInfo2: {taginfo.UsertagInfoDetails.taginfo2}</p>
          <p>TagInfo3: {taginfo.UsertagInfoDetails.taginfo3}</p>
          <p>TagInfo4: {taginfo.UsertagInfoDetails.taginfo4}</p>
          <p>TagInfo5: {taginfo.UsertagInfoDetails.taginfo5}</p>
          <p>TagInfo6: {taginfo.UsertagInfoDetails.taginfo6}</p>
          <p>TagInfo7: {taginfo.UsertagInfoDetails.taginfo7}</p>
          <p>TagInfo8: {taginfo.UsertagInfoDetails.taginfo8}</p>
          <p>TagInfo9: {taginfo.UsertagInfoDetails.taginfo9}</p>
          <p>TagInfo10: {taginfo.UsertagInfoDetails.taginfo10}</p>
        </>
      ) : (
        <p>No additional information available.</p>
      )}

			
          </div>
        </div>
      )}

	   {/* comment info*/}
	   {commentinfotable && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: '-75px',
            height: '100vh',
            backgroundColor: '#272626',
            padding: '20px',
			boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
			zIndex: 1000,
			display: 'flex',
			flexDirection: 'column',
            color:'#fff'          
		}}
        >
          {/* Close button */}
		  <div className='w-100' style={{display:'flex',justifyContent:'space-between', alignItems:'center'}}>
		  <button className='btn btn-dark' onClick={handleclosecommentinfo}><i class="fa-solid fa-xmark"></i></button>
		  <div className="btn btn-dark" onClick={()=>deletecomment(commentinfo.number)} ><i class="fa-solid fa-trash"></i></div>
		  {(commentinfo.status === 'open' || commentinfo.status === 'onhold' || commentinfo.status === 'ongoing') && (
              isEditing ? (
                <div className="btn btn-dark" onClick={()=>handleSaveButtonClick(commentinfo.number)}>
                  <i className="fa-solid fa-save"></i>
                </div>
              ) : (
                <div className="btn btn-dark" onClick={()=>handleEditButtonClick(commentinfo.number)}>
                  <i className="fa-solid fa-pencil"></i>
                </div>
              )
            )}	  
			</div>
          <div>
           <h6>Comment Info </h6> 
			<p>Comment No:{commentinfo.number}</p>
			<p>Comment:{
			isEditing?
			(<textarea
            value={commentEdit || ''}
            onChange={e => setCommentEdit(e.target.value)}
            style={{ width: '100%' }}
          />):(commentinfo.comment)}</p>
			<p>Date:{commentinfo.createddate}</p>
			<p>Created:{commentinfo.createdby}</p>
			<p>Status: 
              {isEditing ? (
				<select value={status || ''} onChange={e => setStatus( e.target.value)} style={{ width: '100%' }}>
				<option value="" disabled>
				  Choose type
				</option>
				<option value="open">Open</option>
				<option value="onhold">Onhold</option>
				<option value="closed">Closed</option>
				<option value="ongoing">Ongoing</option>
			  </select> 
              ) : (
                commentinfo.status
              )}
            </p>
			<p>Priority:{isEditing ? (
          <div>
            <label>
              <input
                type="radio"
                value="1"
                checked={priority === '1'}
                onChange={e => setPriority(e.target.value)}
              />
              1
            </label>
            <label>
              <input
                type="radio"
                value="2"
                checked={priority === '2'}
                onChange={e => setPriority(e.target.value)}
              />
              2
            </label>
            <label>
              <input
                type="radio"
                value="3"
                checked={priority === '3'}
                onChange={e => setPriority(e.target.value)}
              />
              3
            </label>
          </div>
        ) : (
          commentinfo.priority
        )}</p>
			{
				commentinfo.closedBy?<p>Closed By:{commentinfo.closedBy}</p>:''
			}
			{
               commentinfo.closedDate?<p>Closed By:{commentinfo.closedDate}</p>:''
			}
			


          </div>
        </div>
      )}
	  <Modal
      onHide={handleCloseSavedView}
      show={savedViewDialog}
      backdrop="static"
      keyboard={false}
      dialogClassName="custom-modal"
    >
      <div className="save-dialog">
        <div className="title-dialog">
          <p className='text-light'>Save view</p>
          <p className='text-light cross' onClick={handleCloseSavedView}>&times;</p>
        </div>
        <div className="dialog-input">
          <label>Name*</label>
          <input
            type="text"
			value={saveViewName}
			onChange={(e) => setSaveViewName(e.target.value)}          
          />
         
        </div>
        <div className='dialog-button' style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className='btn btn-secondary' onClick={handleCloseSavedView}>Cancel</button>
        <button className='btn btn-dark'onClick={handleSaveView}>Save</button>
      </div>
      </div>
    </Modal>
	</div>
   
  );
}

export default ThreeComponent;
