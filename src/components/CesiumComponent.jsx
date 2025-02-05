import React, { useState, useEffect, useRef } from 'react';
import { DebugTilesRenderer as TilesRenderer, NONE } from '3d-tiles-renderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CesiumIonTilesRenderer } from '3d-tiles-renderer';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import Comment from './Comment';
import Alert from './Alert';
import { Modal } from 'react-bootstrap';

function CesiumComponent({gettokenNumber, viewMode ,mode,setMode,ionAssetId,orthoviewmode,showComment,setShowComment,zoomfit,setzoomfit,selectedItem,setselectedItem,showSpinner,setActiveButton,settingbox,setsettingbox,objecttable,allfilestable,allComments,allEquipementList,allLineList,userTagInfotable,showMeasure,allCommentStatus,savedViewDialog,setSavedViewDialog,allViews,setopenThreeCanvas,setiRoamercanvas}) {

  const canvasRef = useRef(null);
  const [rightClickCoordinates, setRightClickCoordinates] = useState({ x: 0, y: 0 });
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentContent, setCommentContent] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tagInfoVisible, setTagInfoVisible] = useState(false);
  const [lineEqpInfo,setLineEqpInfo] = useState(false);
  const [taginfo,settaginfo] = useState('')  
  const [focus,setFocus] = useState([]);
  const [flySpeed, setFlySpeed] = useState(1); // State letiable for fly controls speed
  const [multipleselectedfocus,setmultipleSelectedfocus] = useState('')
  const [selectedObjects,setselectedObjects] = useState([]);
  const [storedBoundingBoxMin,setstoredBoundingBoxMin] =useState(new THREE.Vector3()) ;
  const [storedBoundingBoxMax,setstoredBoundingBoxMax] =useState(new THREE.Vector3()) ;
  const [ orbitControlsTarget, setorbitControlsTarget] = useState(new THREE.Vector3());
  const [showControls,setShowControls] = useState(false);
  const [cameraDistance,setCameraDistance] = useState()
  const [flyrotationSpeed, setflyrotationSpeed] = useState(0.5); // State letiable for fly controls speed
  const [wireframeEnabled,setWireframeEnabled] = useState(true);
  const [AmbientLightcolor,setAmbientLightcolor] = useState('#ffffff');
  const [DirectionalLightcolor,setDirectionalLightcolor] = useState('#ffffff');
  const [PointLightcolor,setPointLightcolor] = useState('#ff0000')
  const [ReflectionIntensity,setReflectionIntensity] = useState(0.5);
  const [commentinfo,setcommentinfo]= useState('')
  const [commentinfotable,setcommentinfotable]= useState(false);
  const [tilesize,settilesize] = useState();
  const [showFileInfo,setShowFileInfo] = useState(false);
  const [customAlert,setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showMeasureDetails,setShowMeasureDetails] = useState(false);
  const [point1, setPoint1] = useState(null);
  const [point2, setPoint2] = useState(null);
  const [distance, setDistance] = useState(null);
  const [differences, setDifferences] = useState({ diffX: null, diffY: null, diffZ: null });
  const [angles, setAngles] = useState({ horizontalAngle: null, verticalAngle: null });
  const [showMeasureDetailsAbove,setshowMeasureDetailsAbove] = useState(false);
  const [measureDetailsPosition, setMeasureDetailsPosition] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState(''); 
  const [commentEdit,setCommentEdit] = useState('') 
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen1,setIsMenuOpen1] = useState(false);
  const [saveViewName,setSaveViewName] = useState('');
  const [saveViewMenu,setSaveViewMenu]=useState('')

  const camera = useRef(null);
  const controls = useRef(null);
  const scene = useRef(null);
  const renderer = useRef(null);
  const raycaster = useRef(null);
  const css2dRenderer = useRef(null);
  const flyModeCameraPosition = useRef(new THREE.Vector3());
  const orbitControlsTargets = useRef(new THREE.Vector3());
  const tiles = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const isMouseDown = useRef(false);
  const isPanning = useRef(false);
  const isZooming = useRef(false);
  const lastMouseMovement = useRef({ x: 0, y: 0 }); 
  const isTouching = useRef(false);
  const lastTouchMovement = useRef({ x: 0, y: 0 }); 


  let  offsetParent,labelObject;
  const params = {
    'raycast': NONE,
    'ionAssetId': ionAssetId,
    'ionAccessToken': gettokenNumber,
    'reload': () => {
      reinstantiateTiles();
    },
  };

  useEffect(()=>{
    window.api.receive('mesh-data-found',(response)=>{
		const boundingBoxData = response.data;
        createTransparentBox(boundingBoxData);
  	})	
},[])

const createTransparentBox=(boundingBoxData) =>{
    const {
        coOrdinateX, coOrdinateY, coOrdinateZ,
        maxbbX, maxbbY, maxbbZ,
        minbbX, minbbY, minbbZ
    } = boundingBoxData;

    const maxBB = new THREE.Vector3(maxbbX, maxbbY, maxbbZ);
    const minBB = new THREE.Vector3(minbbX, minbbY, minbbZ);
    const boxSize = new THREE.Vector3().subVectors(maxBB, minBB);
    const boxCenter = new THREE.Vector3().addVectors(maxBB, minBB).multiplyScalar(0.5);

    const geometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.25
    });

    const box = new THREE.Mesh(geometry, material);
    box.position.copy(boxCenter);
    scene.current.add(box);
}

useEffect(() => {  		  		
	if(ionAssetId && !showSpinner){	
		scene.current=null;
		camera.current=null;
		setup()
		setMode('orbit')
		  }
	return () => {
	  cleanUp();	 
				
	};
  }, [ionAssetId,allfilestable,orthoviewmode,showSpinner]);


  useEffect(()=>{
	switchControls(mode);		
  },[gettokenNumber,allfilestable,objecttable])

  useEffect(()=>{
	switchViewMode(viewMode);
  },[viewMode])

  useEffect(()=>{
	if(zoomfit){
		console.log(camera.current);
		FitView();
		setzoomfit(false);
	}
	if (selectedItem) {
		enableInteractions();
		disableRightClick();
		disableflycontrols();
		disableleftClick();
		} 
		else if(!selectedItem) {
		enableleftClick();	
		enableRightClick();
		disableInteractions(); 
		disableflycontrols();
		}
	  return () => {
		disableInteractions();
		disableflycontrols();
		disableRightClick();
		disableleftClick();			  
		};
    
  },[zoomfit,selectedItem,showMeasure])
 
  useEffect(() => {
	if(mode==='fly'){
		if (controls.current) {
			controls.current.dispose();
			controls.current = null;
		  }
		  console.log("fly mode",camera.current.position)
		disableInteractions();
		 // Check if the event is from a mouse or touch
		enablefycontrols()
		enabletouchcontrol()
	}	

	else {
        // Enable orbit controls
		  // Enable orbit controls
		  if (!controls.current) {
			controlssetup()
           disableInteractions();

		  }			
			// Restore camera position from fly mode
		   if (flyModeCameraPosition.current) {			
            camera.current.position.set(
                flyModeCameraPosition.current.x,
                flyModeCameraPosition.current.y,
                flyModeCameraPosition.current.z
            );
			// Get the current camera position
const cameraPosition = camera.current.position;
console.log("backtoorbit",camera.current.position)
// Get the direction the camera is facing
const cameraDirection = new THREE.Vector3(0,0,-1);
// Calculate the target point by adding the direction vector to the camera position
const target = cameraPosition.clone().add(cameraDirection);
console.log("Target point (center of camera's view):", target);
// Set the target position for the orbit controls
controls.current.target.copy(target)
camera.current.position.copy(cameraPosition);

			controls.current.update();     
		  }
		disableflycontrols()
		disabletouchcontrol()

    }
	
	// Cleanup function to remove event listeners
    return () => {
		disableInteractions();
        disableflycontrols();
		disabletouchcontrol()
		
    };
  },[mode,flySpeed,flyrotationSpeed,settingbox])
//   useEffect(() => {
//     if (mode === 'fly') {
//         if (controls.current) {
//             flyModeCameraPosition.current.copy(camera.current.position);
//             orbitControlsTargets.current.copy(controls.current.target);
// 			console.log("modefly",controls.current.target);
//             controls.current.dispose();
//             controls.current = null;
//         }
//         disableInteractions();
//         enablefycontrols();
//         enabletouchcontrol();
//     } else {
//         // Enable orbit controls
//         if (!controls.current) {
//             controlssetup();
//             disableInteractions();
// 			console.log("modeorbit",orbitControlsTargets.current)
//         }
//         // Restore camera position and target from fly mode
//         if (flyModeCameraPosition.current) {
// 			console.log("modeorbit",orbitControlsTargets.current)
// 			console.log("modeorbit",flyModeCameraPosition.current)
//             camera.current.position.copy(flyModeCameraPosition.current);
// //   ---------------------------------------
// // const direction = new THREE.Vector3();
// // camera.current.getWorldDirection(direction);
// // const newTarget = camera.current.position.clone().add(direction);
// // orbitControlsTargets.current.copy(newTarget); // Update the orbit controls target
// // controls.current.target.copy(orbitControlsTargets.current);
// // controls.current.update();
// // ----------------------------------------
           
// 			camera.current.lookAt(orbitControlsTargets.current);             
// 			controls.current.target.copy(orbitControlsTargets.current);
//             controls.current.update();
//         }
//         disableflycontrols();
//         disabletouchcontrol();
//     }

//     // Cleanup function to remove event listeners
//     return () => {
//         disableInteractions();
//         disableflycontrols();
//         disabletouchcontrol();
// 		disableleftClick();
// 		disableRightClick();
//     };
// }, [mode, flySpeed, flyrotationSpeed, settingbox]);

// useEffect(() => {
//     const raycaster = new THREE.Raycaster();
//     const mouse = new THREE.Vector2();

//     const setOrbitTargetFromRaycast = () => {
//         // Send a ray from the camera's center
//         raycaster.setFromCamera(mouse, camera.current);
//         const intersects = raycaster.intersectObjects(scene.current.children, true);
        
//         if (intersects.length > 0) {
//             const intersectedObject = intersects[0].object;
//             const objectBoundingBox = new THREE.Box3().setFromObject(intersectedObject);
//             const boundingBoxCenter = objectBoundingBox.getCenter(new THREE.Vector3());
            
//             // Set the orbit controls target to the bounding box center of the hit element
//             orbitControlsTargets.current.copy(boundingBoxCenter);
//         } else {
//             // Fallback to default if no object is hit
//             orbitControlsTargets.current.copy(camera.current.position);
//         }
//     };

//     if (mode === 'fly') {
//         if (controls.current) {
//             flyModeCameraPosition.current.copy(camera.current.position);
//             orbitControlsTargets.current.copy(controls.current.target);
//             console.log("modefly", controls.current.target);
//             controls.current.dispose();
//             controls.current = null;
//         }
//         disableInteractions();
//         enablefycontrols();
//         enabletouchcontrol();
//     } else {
//         // Enable orbit controls
//         if (!controls.current) {
//             controlssetup();
//             disableInteractions();
//         }

//         // Restore camera position from fly mode
//         if (flyModeCameraPosition.current) {
//             camera.current.position.copy(flyModeCameraPosition.current);

//             // Set the target using raycast
//             setOrbitTargetFromRaycast();

//             camera.current.lookAt(orbitControlsTargets.current);
//             controls.current.target.copy(orbitControlsTargets.current);
//             controls.current.update();
//         }
//         disableflycontrols();
//         disabletouchcontrol();
//     }

//     // Cleanup function to remove event listeners
//     return () => {
//         disableInteractions();
//         disableflycontrols();
//         disabletouchcontrol();
//     };
// }, [mode, flySpeed, flyrotationSpeed, settingbox]);

    const cameraQuternion = useRef(new THREE.Quaternion());
	let continueTranslation = false;
    let continueRotation = false;
    let translationDirection = 0;
    let rotationDirection = 0;
    let translationSpeed = 0.5; // Initial translation speed
    let rotationSpeed = 0.0001; // Initial rotation speed
	// Define sensitivity constants
    const horizontalSensitivity = 1.1; // Adjust as needed
    const verticalSensitivity = 1.1; // Adjust as needed


	// mouse events functions on fly control

    const handleMouseDown = (event) => {
		// event.preventDefault();
		const mouseEvent = event.touches ? event.touches[0] : event;
        if (mouseEvent.button === 0) { // Left mouse button pressed
			
            isMouseDown.current = true;
            mouse.current.x = mouseEvent.clientX;
            mouse.current.y = mouseEvent.clientY;
            isZooming.current = true;
			continueTranslation = true; // Enable automatic translation
			continueRotation = true; // Enable automatic rotation
			translationDirection = lastMouseMovement.current.y > 0 ? 1 : -1; // Set translation direction based on last mouse movement
			rotationDirection = lastMouseMovement.current.x > 0 ? 1 : -1; // Set rotation direction based on last mouse movement
        } else if (event.button === 1) { // Middle mouse button pressed
			console.log("middlebutton pressed")
            isPanning.current = true;
			continueTranslation = true; // Enable automatic translation
            mouse.current.x = mouseEvent.clientX;
            mouse.current.y = mouseEvent.clientY;
        }
    };

    const handleMouseUp = () => {
        isMouseDown.current = false;
        isPanning.current = false;
        isZooming.current = false;    
		lastMouseMovement.current = { x: 0, y: 0 };
    };

	const handleMouseMove = (event) => {
		event.preventDefault();

		const mouseEvent = event.touches ? event.touches[0] : event;
		if (!isMouseDown.current && !isPanning.current && !isZooming.current) return;
	
		const movementX = mouseEvent.clientX - mouse.current.x;
		const movementY = mouseEvent.clientY - mouse.current.y;
	
		lastMouseMovement.current = { x: movementX, y: movementY };
		if (isMouseDown.current) { // Left mouse button clicked
			const isHorizontal = Math.abs(movementX) > Math.abs(movementY);
			if (isHorizontal) { // Horizontal movement, rotate around Y axis
				continueCameraMovement(); 
			} else  { // Vertical movement, forward/backward
				continueCameraMovement(); // Adjust with factors
			}
		} else if (isPanning.current) { // Middle mouse button clicked

			continueCameraMovement(movementX, movementY); // Adjust with factors
		}
	
		mouse.current.x = mouseEvent.clientX;
		mouse.current.y = mouseEvent.clientY;
	};
	
		
// Function to handle scroll events and rotate the camera around the target point
   const handleWheel = (event) => {
	const rotationAngle = -event.deltaY * 0.001;

	// Get the camera's up vector
    let cameraUp = new THREE.Vector3(1, 0, 0); // Assuming Y-axis is up
    cameraUp.applyQuaternion(camera.current.quaternion);

    // Create a quaternion representing the rotation around the camera's up vector
    let quaternion = new THREE.Quaternion().setFromAxisAngle(cameraUp, rotationAngle);

    camera.current.applyQuaternion(quaternion);
    storeCameraPosition(); // Assuming this function stores camera position

    };

    const continueCameraMovement = () => {
		const adjustedTranslationSpeed = flySpeed * translationSpeed ;
		if (isMouseDown.current && (continueTranslation || continueRotation)) {
			
				requestAnimationFrame(continueCameraMovement);
				const movementX = lastMouseMovement.current.x;
				const movementY = lastMouseMovement.current.y;
				const tileSizeFactor = calculateTileSizeFactor(); // Implement this function to calculate the factor based on tile size
				const isHorizontal = Math.abs(movementX) > Math.abs(movementY);
				if(isHorizontal){
					const rotationAngle = -movementX * rotationSpeed * horizontalSensitivity * flyrotationSpeed *tileSizeFactor;

					// Get the camera's up vector
					let cameraUp = camera.current.up.clone().normalize();
					
					// Create a quaternion representing the rotation around the camera's up vector
					let quaternion = new THREE.Quaternion().setFromAxisAngle(cameraUp, rotationAngle);
					
					camera.current.applyQuaternion(quaternion);
					cameraQuternion.current =camera.current.quaternion.clone();
					console.log("cameraQuternion",cameraQuternion.current)
					storeCameraPosition();

				}
				else {
					const zoomSpeed = movementY * 0.01; // Adjust zoom speed based on last recorded mouse movement

					const forwardDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.current.quaternion);
				// Move the camera forward/backward along its local forward direction
				camera.current.position.add(forwardDirection.multiplyScalar(zoomSpeed * adjustedTranslationSpeed * tileSizeFactor));
				storeCameraPosition();

				}			
		}
		
		else if (isPanning.current && (continueTranslation)) {
			requestAnimationFrame(continueCameraMovement);
			const tileSizeFactor = calculateTileSizeFactor();
			const movementY = lastMouseMovement.current.y;
			const movementX = lastMouseMovement.current.x;
        const adjustedHorizontalSensitivity = horizontalSensitivity * tileSizeFactor*0.001;
        const adjustedVerticalSensitivity = verticalSensitivity * tileSizeFactor*0.001;

			// Calculate movement speed based on mouse movement and sensitivity
			const moveSpeedX = movementX * adjustedHorizontalSensitivity;
			const moveSpeedY = movementY * adjustedVerticalSensitivity;
		   
			const isHorizontal = Math.abs(movementX) > Math.abs(movementY);
			const isVertical = Math.abs(movementY) > Math.abs(movementX);
		
			if (isHorizontal) {
				// Move the camera along its local x axis
				camera.current.translateX(moveSpeedX);
				storeCameraPosition()
			} else if (isVertical) {
				// Move the camera along its local y axis
				camera.current.translateY(-moveSpeedY);
				storeCameraPosition()

			}


		}
	};

	const calculateTileSizeFactor = () => {
		// Assuming tileSize is the variable representing the size of loaded tiles
		const tileSize = tilesize; // Implement calculateTileSize() function to get the size of loaded tiles
	
		// Define a reference size
		const referenceSize = 200; // Adjust as needed, this could be the average size of tiles in your application
	
		// Calculate the factor as the ratio of tileSize to referenceSize
		const factor = tileSize / referenceSize;
	
		// Return the factor
		return factor;
	};

	const storeCameraPosition = () => {
		flyModeCameraPosition.current.copy(camera.current.position);
		if (controls.current) {
			orbitControlsTargets.current.copy(controls.current.target);
		}
	};

	const  handleSaveView = () => {
		if(!saveViewName){
			setCustomAlert(true);
			setModalMessage('Please type name')
		}
		else{
			const posX = camera.current.position.x;
			const posY = camera.current.position.y;
			const posZ = camera.current.position.z;
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
// touch function
const handleTouchStart = (event) => {
	// event.preventDefault(); 
	const touch = event.touches[0];
	mouse.current.x = touch.clientX;
	mouse.current.y = touch.clientY;
	isTouching.current = true;
	isZooming.current = true;
  };

  const handleTouchEnd = () => {
	isTouching.current = false;
	isPanning.current = false;
	isZooming.current = false;
  };

  const handleTouchMove = (event) => {
	if (!isTouching.current && !isPanning.current && !isZooming.current) return;

	const touch = event.touches[0];
	const movementX = touch.clientX - mouse.current.x;
	const movementY = touch.clientY - mouse.current.y;
	lastTouchMovement.current = { x: movementX, y: movementY };

	const isHorizontal = Math.abs(movementX) > Math.abs(movementY);

	if (isTouching.current) {
	  if (isHorizontal) {
		// camera.current.rotation.y -= movementX * 0.005;
		// camera.current.rotation.x -= movementY * 0.005;
		continueCameraMovement(); 

	  } else {
		// const zoomSpeed = movementY * 0.01;
		// camera.current.position.z += zoomSpeed;
		continueCameraMovement(); 
	  }
	} else if (isPanning.current) {
	  camera.current.position.x -= movementX * 0.01;
	  camera.current.position.y += movementY * 0.01;
	}

	mouse.current.x = touch.clientX;
	mouse.current.y = touch.clientY;
  };

  const handleTouchLeave = () => {
	isTouching.current = false;
  };

  const handleTouchCancel = () => {
	isTouching.current = false;
  };
// enablefycontrols
const enablefycontrols=()=>{
	document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    // document.addEventListener('wheel', handleWheel);
}
// disableflycontrols
const disableflycontrols=()=>{
	document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousemove', handleMouseMove);    
    // document.removeEventListener('wheel', handleWheel);
}

// enable touch control
const enabletouchcontrol=()=>{
	document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchleave', handleTouchLeave);
	document.addEventListener('touchcancel', handleTouchCancel);
    // document.addEventListener('wheel', handleWheel, { passive: false });
}

// disable touch control
const disabletouchcontrol=()=>{
	document.removeEventListener('touchstart', handleTouchStart);
	document.removeEventListener('touchend', handleTouchEnd);
	document.removeEventListener('touchmove', handleTouchMove);
	document.removeEventListener('touchleave', handleTouchLeave);
	document.removeEventListener('touchcancel', handleTouchCancel);
	document.removeEventListener('wheel', handleWheel);
}


   //   tiles set up
   const setupTiles = () => {
    tiles.current.fetchOptions.mode = 'cors';

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      'https://unpkg.com/three@0.153.0/examples/jsm/libs/draco/gltf/'
    );

    const loader = new GLTFLoader(tiles.current.manager);
    loader.setDRACOLoader(dracoLoader);

    tiles.current.manager.addHandler(/\.gltf$/, loader);
    offsetParent.add(tiles.current.group);	
    };
	  
	const reinstantiateTiles = () => {
		if (tiles.current) {
		  scene.current.remove(tiles.current.group);
		  tiles.current.dispose();
		  tiles.current = null;
		}
		  tiles.current = new CesiumIonTilesRenderer(params.ionAssetId, gettokenNumber);
		  console.log(tiles.current);
		  tiles.current.onLoadTileSet = () => {	
			  
			const sphere = new THREE.Sphere();
			tiles.current.getBoundingSphere(sphere);
			const tileSize = sphere.radius * 2; // Calculate tile size based on the sphere's radius
			settilesize(tileSize);
			console.log("Tile Size:", tileSize);  
			const position = sphere.center.clone();	
			const distanceToEllipsoidCenter = position.length(); 
			const surfaceDirection = position.normalize();
			const up = new THREE.Vector3(0, 1, 0);
			const rotationToNorthPole = rotationBetweenDirections(surfaceDirection, up);  
			tiles.current.group.quaternion.x = rotationToNorthPole.x;
			tiles.current.group.quaternion.y = rotationToNorthPole.y;
			tiles.current.group.quaternion.z = rotationToNorthPole.z;
			tiles.current.group.quaternion.w = rotationToNorthPole.w;
	  
			tiles.current.group.position.y = -distanceToEllipsoidCenter;
		  };
		  setupTiles();
	};

	
	const rotationBetweenDirections = (dir1, dir2) => {
		const rotation = new THREE.Quaternion();
		const a = new THREE.Vector3().crossVectors(dir1, dir2);
		rotation.x = a.x;
		rotation.y = a.y;
		rotation.z = a.z;
		rotation.w = 1 + dir1.clone().dot(dir2);
		rotation.normalize();
	
		return rotation;
	};
	// set up scene
	const scenesetup=()=>{
		scene.current = new THREE.Scene();		
	}	
	// set up renderer
	const renderersetup=()=>{
		renderer.current = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current});
		renderer.current.setClearColor("#33334c")
		// #33334c
		renderer.current.domElement.tabIndex = 1;
		renderer.current.setSize(window.innerWidth, window.innerHeight);
		renderer.current.setPixelRatio( window.devicePixelRatio);
		renderer.current.domElement.style.zIndex = '0'; 
		document.body.appendChild(renderer.current.domElement);
		// canvasRef.current.appendChild(renderer.current.domElement)
	}

	// setup camera
	 const camersetup=()=>{
		if (orthoviewmode === 'perspective') {
			camera.current = new THREE.PerspectiveCamera();
			camera.current.position.set(0, 0, 500);
			scene.current.add(camera.current);
			
		  } else if (orthoviewmode === 'orthographic') {
			const aspectRatio = window.innerWidth / window.innerHeight;
	const frustumSize = 300;
	camera.current = new THREE.OrthographicCamera(
		frustumSize * aspectRatio / -2,
		frustumSize * aspectRatio / 2,
		frustumSize / 2,
		frustumSize / -2,
		1,
		4000
	);
	scene.current.add(camera.current);
	
	const { storedBoundingBoxCenter, boundingBoxSize } = computeBoundingBoxData();
	
	// Calculate the appropriate zoom level to fit the bounding box within the camera frustum
	const maxDim = Math.max(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z);
	const cameraView = frustumSize / maxDim;
	camera.current.zoom = cameraView;
	camera.current.updateProjectionMatrix();
	
	camera.current.position.set(storedBoundingBoxCenter.x, storedBoundingBoxCenter.y, 500);
	camera.current.lookAt(storedBoundingBoxCenter);
	camera.current.up.set(0, 1, 0);
		}
	 }

	// setup light
	const lightsetup=()=>{
	const light = new THREE.PointLight( PointLightcolor, ReflectionIntensity, 100 );
    light.position.set( 50, 50, 50 );
    scene.current.add( light );
    const dirLight = new THREE.DirectionalLight(DirectionalLightcolor);
    // dirLight.position.set(1, 2, 3);
    scene.current.add(dirLight);

    const ambLight = new THREE.AmbientLight(AmbientLightcolor);
    scene.current.add(ambLight);

	offsetParent = new THREE.Group();
    scene.current.add(offsetParent);

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
	// setup controls
	const controlssetup = () => {
		controls.current = new OrbitControls(camera.current, css2dRenderer.current.domElement);
		controls.current.enableDamping = true; // Smooth camera movements
		controls.current.screenSpacePanning = false;
		controls.current.minDistance = 1;
		controls.current.maxDistance = 2000;
		controls.current.mouseButtons = {
			LEFT: THREE.MOUSE.ROTATE,
			MIDDLE: THREE.MOUSE.PAN,
			RIGHT: null
		};
		controls.current.enabled = true;
		if (orbitControlsTargets.current) {
			controls.current.target.copy(orbitControlsTargets.current);
		}
		controls.current.update();
	};
	
   const switchControls = (mode) => {
        if (mode === 'orbit') {
            controls.current.enabled = true;
        } else if (mode === 'fly' ) {
			if(controls.current){
				controls.current.enabled = false;

			}
        }
	
  };
  const computeBoundingBoxData = () => {
	const storedBoundingBoxCenter = new THREE.Vector3();
	storedBoundingBoxCenter.addVectors(storedBoundingBoxMin, storedBoundingBoxMax).multiplyScalar(0.5);
	
	const boundingBoxSize = new THREE.Vector3();
	boundingBoxSize.subVectors(storedBoundingBoxMax, storedBoundingBoxMin);
	
	return { storedBoundingBoxCenter, boundingBoxSize };
};

// switch view modes
const switchViewMode = (mode) => {
	const { storedBoundingBoxCenter, boundingBoxSize } = computeBoundingBoxData();
	const maxSize = Math.max(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z);
	const margin = maxSize * 0.1;
	const distance = maxSize + margin;
	
	if (mode === 'left') {
		camera.current.position.set(storedBoundingBoxCenter.x - distance, storedBoundingBoxCenter.y, storedBoundingBoxCenter.z);
		camera.current.lookAt(storedBoundingBoxCenter);
	} else if (mode === 'right') {
		camera.current.position.set(storedBoundingBoxCenter.x + distance, storedBoundingBoxCenter.y, storedBoundingBoxCenter.z);
		camera.current.lookAt(storedBoundingBoxCenter);
	} else if (mode === 'top') {
		camera.current.position.set(storedBoundingBoxCenter.x, storedBoundingBoxCenter.y + distance, storedBoundingBoxCenter.z);
		camera.current.lookAt(storedBoundingBoxCenter);
	} else if (mode === 'bottom') {
		camera.current.position.set(storedBoundingBoxCenter.x, storedBoundingBoxCenter.y - distance, storedBoundingBoxCenter.z);
		camera.current.lookAt(storedBoundingBoxCenter);
	} else if (mode === 'front') {
		console.log("enter front view");
		camera.current.position.set(storedBoundingBoxCenter.x, storedBoundingBoxCenter.y, storedBoundingBoxCenter.z + distance);
		camera.current.lookAt(storedBoundingBoxCenter);
	} else if (mode === 'back') {
		console.log("enter back view");
		camera.current.position.set(storedBoundingBoxCenter.x, storedBoundingBoxCenter.y, storedBoundingBoxCenter.z - distance);
		camera.current.lookAt(storedBoundingBoxCenter);
	}
};
    
	  // camera position setup
     const FitView = () => {
		scene.current.remove(scene.current.children.filter(child => child instanceof THREE.Camera));

	console.log(storedBoundingBoxMax)
	console.log(storedBoundingBoxMin)
 
	const storedBoundingBoxCenter = new THREE.Vector3();
	storedBoundingBoxCenter.addVectors(storedBoundingBoxMin, storedBoundingBoxMax).multiplyScalar(0.5);
	console.log(storedBoundingBoxCenter)
	const boundingBoxSize = new THREE.Vector3();
	boundingBoxSize.subVectors(storedBoundingBoxMax, storedBoundingBoxMin);
	const distance = Math.max(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z) ;
	// Add a margin to the distance for a better view
    const margin = distance * 0.001; // Adjust the margin as needed
	
	const cameraPosition = storedBoundingBoxCenter.clone().add(new THREE.Vector3(0, 0, distance + margin));
	
			
	 if(mode==='orbit'){
		// camera.current.position.copy(cameraPosition);
		const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        camera.current.applyQuaternion(quaternion);

		camera.current.position.set(cameraPosition.x,cameraPosition.y,cameraPosition.z);
	camera.current.lookAt(storedBoundingBoxCenter);
		controls.current.target.copy(storedBoundingBoxCenter);
		setorbitControlsTarget(storedBoundingBoxCenter)
		orbitControlsTargets.current.copy(storedBoundingBoxCenter)
		setCameraDistance(distance)
		controls.current.update();
	 }
	 else if(mode==='fly'){
		
		camera.current.position.set(cameraPosition.x,cameraPosition.y,cameraPosition.z);
		camera.current.lookAt(storedBoundingBoxCenter);

		 }
	 else if(mode==='player'){
		camera.current.position.copy(storedBoundingBoxCenter);
		camera.current.position.z += distance;
		camera.current.lookAt(storedBoundingBoxCenter)
	 }
	
}

	//  mouse move setup 
	  const onMouseMove = (event) => {
		// mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		// mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		const canvasRect = canvasRef.current.getBoundingClientRect();
	
		// Calculate mouse position relative to the canvas
		const mouseX = event.clientX - canvasRect.left;
		const mouseY = event.clientY - canvasRect.top;
		
		// Convert mouse coordinates to normalized device coordinates
		const mouseNormalizedX = (mouseX / canvasRect.width) * 2 - 1;
		const mouseNormalizedY = -(mouseY / canvasRect.height) * 2 + 1;
	
		// Set up the raycaster
		raycaster.current.setFromCamera({ x: mouseNormalizedX, y: mouseNormalizedY }, camera.current);
		const intersects = raycaster.current.intersectObjects(scene.current.children, true);
		const hoverInfo = document.getElementById('hover-info');
  
		if (intersects.length > 0) {
		  const intersectedObject = intersects[0].object;
		  const boundingBox = new THREE.Box3().setFromObject(intersectedObject);
		  const boundingBoxCenter = boundingBox.getCenter(new THREE.Vector3());
		  const cesiumX = boundingBoxCenter.x;
		  const cesiumY = boundingBoxCenter.y;
		  const cesiumZ = boundingBoxCenter.z;
		  
		  
		  // Convert Cesium Z-up to Three.js Y-up
		  const threeJSX = cesiumX;
		  const threeJSY = -cesiumZ; // Negate Z
		  const threeJSZ = cesiumY; // Swap Y and Z
			  const toleranceX = 0.1; // You can adjust this value as needed
			  const toleranceY = 0.1; 
			  const toleranceZ = 0.1; 
		 
		  const clickedObjectInfo = allfilestable.find((obj) =>
			Math.abs(obj.coOrdinateX - threeJSX) <toleranceX &&
			Math.abs(obj.coOrdinateY - threeJSY) <toleranceY &&
			Math.abs(obj.coOrdinateZ - threeJSZ) <toleranceZ
		  );
  
		  if (clickedObjectInfo) {
			hoverInfo.style.display = 'block';
			hoverInfo.innerHTML = `${clickedObjectInfo.fileName}`;
			hoverInfo.style.left = `${mouseX - 10}px`;
			hoverInfo.style.top = `${mouseY - 10}px`;
		  } else {
			hoverInfo.style.display = 'none';
		  }
		} else {
		  hoverInfo.style.display = 'none';
		}

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
			
				// Calculate mouse position relative to the canvas
				const mouseX = event.clientX - canvasRect.left;
				const mouseY = event.clientY - canvasRect.top;
				
				// Convert mouse coordinates to normalized device coordinates
				const mouseNormalizedX = (mouseX / canvasRect.width) * 2 - 1;
				const mouseNormalizedY = -(mouseY / canvasRect.height) * 2 + 1;
			
				// Set up the raycaster
				raycaster.current.setFromCamera({ x: mouseNormalizedX, y: mouseNormalizedY }, camera.current);
				renderer.current.domElement.addEventListener('contextmenu', onContextMenu);
				css2dRenderer.current.domElement.addEventListener('contextmenu', onContextMenu); 
			
				// Perform raycasting and get intersections
				const intersects = raycaster.current.intersectObjects(scene.current.children, true);	
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
				  						
				else if (selectedItem && intersects.length>0) {
					console.log(selectedItem)
					const clickedObject = intersects[0].object;				   
							// Otherwise, set the clicked object as the focus
							console.log(clickedObject);
							setFocus(clickedObject);
					
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
			// Cesium coordinates
		const cesiumX = center.x;
		const cesiumY = center.y;
		const cesiumZ = center.z;
		
		
		// Convert Cesium Z-up to Three.js Y-up
		const threeJSX = cesiumX;
		const threeJSY = -cesiumZ; // Negate Z
		const threeJSZ = cesiumY; // Swap Y and Z
			const toleranceX = 0.1; // You can adjust this value as needed
			const toleranceY = 0.1; 
			const toleranceZ = 0.1; 
		// Find the corresponding object in the objecttable based on the bounding box center
		
		const clickedObjectInfo = allfilestable.find((obj) =>
			Math.abs(obj.coOrdinateX - threeJSX) <toleranceX &&
			Math.abs(obj.coOrdinateY - threeJSY) <toleranceY &&
			Math.abs(obj.coOrdinateZ - threeJSZ) <toleranceZ
			
		);
		console.log("clickedObjectInfo",clickedObjectInfo);
			  settaginfo(clickedObjectInfo)
			  
			  // If the corresponding object is found, log its file ID and filename
			  if (clickedObjectInfo) {
				console.log("File ID:", clickedObjectInfo.fileid);
				console.log("Filename:", clickedObjectInfo.fileName);
				const filename =clickedObjectInfo.fileName.replace(/\.[^/.]+$/, '');
				const fileId = clickedObjectInfo.fileid;
				const selectedObjectsInfo = objecttable.filter((obj) => obj.fileid === fileId);
				setCommentContent({ filename, fileId, intersectionPointX,intersectionPointY,intersectionPointZ});
			if (selectedObjectsInfo.length > 0) {
				// Log all objects in the object table that have the same file ID
				console.log('All objects with the same file ID:', selectedObjectsInfo);
			} else {
				console.log('No objects found in objecttable with the same file ID.');
			}
			 // Check if the filename is present in linelist or equipmentlist
			 const linelistDetails = allLineList.find((line) => line.tag === filename);
			 const equipmentlistDetails = allEquipementList.find((equipment) => equipment.tag === filename);

			 const UsertagInfoDetails = userTagInfotable.find((tag) => tag.tag === filename);
			
 
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
                fileid: clickedObjectInfo.fileid,
                filename: clickedObjectInfo.fileName,
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
				
				 // Disable right-click functionality if no object is selected
				 if (highlightedObject) {
					highlightedObject.material = highlightedObject.originalMaterial;
					highlightedObject = null;
				}
				 renderer.current.domElement.removeEventListener('contextmenu', onContextMenu);
				 css2dRenderer.current.domElement.removeEventListener('contextmenu', onContextMenu);	
				 disableInteractions();
				 clickedCoordinates = null;
				 setCommentContent(null);
				 setIsMenuOpen(false)
				 setIsMenuOpen1(false);
				//  clearSelection();
				 setselectedItem(false);
				 setActiveButton(null);
				 setIsCommentOpen(false);
				setshowMeasureDetailsAbove(false);
				setDifferences(null);
				 setDistance(null);
				 setAngles(null);
				 setPoint1(null);
				 setPoint2(null);
				markers.current.forEach(marker => {
					scene.current.remove(marker);
					marker.geometry.dispose();
					marker.material.dispose();
				  });
				  markers.current = [];
				
				  // Remove the line if it exists
				  if (line.current) {
					scene.current.remove(line.current);
					line.current.geometry.dispose();
					line.current.material.dispose();
					line.current = null;
				  }

					
			}
			
	  };

	  const placeMarker = (point) => {
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(point);
        scene.current.add(marker);
        markers.current.push(marker);
    };

    const clearMarkersAndLine = () => {
		markers.current.forEach(marker => {
			scene.current.remove(marker);
			marker.geometry.dispose();
			marker.material.dispose();
		  });
		  markers.current = [];
		
		  // Remove the line if it exists
		  if (line.current) {
			scene.current.remove(line.current);
			line.current.geometry.dispose();
			line.current.material.dispose();
			line.current = null;
		  }
    };

    const drawLine = (pointA, pointB) => {
		if (line.current) {
			scene.current.remove(line.current);
			line.current.geometry.dispose();
			line.current.material.dispose();
			line.current = null;
		  }
        const lineGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([pointA.x, pointA.y, pointA.z, pointB.x, pointB.y, pointB.z]);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        line.current = new THREE.Line(lineGeometry, lineMaterial);
        scene.current.add(line.current);
    };

	const updateMeasureDetailsPosition = (point) => {
        const vector = new THREE.Vector3(point.x, point.y, point.z);
        vector.project(camera.current);

        const widthHalf = canvasRef.current.clientWidth / 2;
        const heightHalf = canvasRef.current.clientHeight / 2;

        const x = (vector.x * widthHalf) + widthHalf;
        const y = -(vector.y * heightHalf) + heightHalf;

        setMeasureDetailsPosition({ x, y });
    };

	  // Function to clear selection
// const clearSelection = () => {
//     // Reset the color of all selected objects to white
//     selectedObjects.forEach(obj => {
//         obj.material.color.set(0xffffff); // Set color to white
//     });
//     setselectedObjects([]);
   
// };

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
	
	const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, bottom: 'auto' });
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
			// If no objects are selected or focused, simply do nothing
			console.log("No objects selected or focused.");
		}
	
	
	}

	// Function to handle closing the menu
const closeMenu = () => {
    setIsMenuOpen(false);
	setIsMenuOpen1(false);

};
 
	// Function to handle adding a comment
const handleAddComment = () => {
	// Implement logic to add a comment
	setIsCommentOpen(true);
	setIsMenuOpen(false)
	closeMenu(); 
  };
//   show tag info
 
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

  const handleCloselineEqpInfo = () => {
    setLineEqpInfo(false);
  };

  const handleCloseFileInfo = () => {
    setShowFileInfo(false);
  };
  const handleCloseTagInfo = () => {
    setTagInfoVisible(false);
  };
	// Function to handle closing the comment

	const handleCloseComment = () => {
		setIsCommentOpen(false);
	  };
 		  

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
		renderer.current.domElement.addEventListener('contextmenu', onRightClickMenu);
		css2dRenderer.current.domElement.addEventListener('contextmenu', onRightClickMenu);
	}

	const disableRightClick=()=>{
		renderer.current.domElement.removeEventListener('contextmenu', onRightClickMenu);
		css2dRenderer.current.domElement.removeEventListener('contextmenu', onRightClickMenu);
	}

	const onLeftClickMenu=()=>{
		setIsMenuOpen1(false);
	}

	const enableleftClick=()=>{
		renderer.current.domElement.addEventListener('click', onLeftClickMenu);
		css2dRenderer.current.domElement.addEventListener('click', onLeftClickMenu);
	}
	const disableleftClick=()=>{
		renderer.current.domElement.removeEventListener('click', onLeftClickMenu);
		css2dRenderer.current.domElement.removeEventListener('click', onLeftClickMenu);
	}
	const newLabelObjects = useRef({});
	const createLabels = () => {
		// Assuming tiles.current is not null and other setup is done
	
		// Clear existing labels
		Object.values(newLabelObjects.current).forEach((labelObject) => {
		  scene.current.remove(labelObject);
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
				const statusColor = allCommentStatus.find(status => status.statusname === item.status)?.color || 'gray';
				labelDiv.style.backgroundColor = statusColor;
				
				const labelObject = new CSS2DObject(labelDiv);
				labelObject.position.set(item.coOrdinateX, item.coOrdinateY, item.coOrdinateZ);
				scene.current.add(labelObject);
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
	
		// setup enable interactions
	  const enableInteractions = () => {
		renderer.current.domElement.addEventListener('mousemove', onMouseMove);
		renderer.current.domElement.addEventListener('click', onMouseClick);
		// document.addEventListener('keydown', onKeyDown, false);

		css2dRenderer.current.domElement.addEventListener('mousemove', onMouseMove);
		css2dRenderer.current.domElement.addEventListener('click', onMouseClick);
		// css2dRenderer.current.addEventListener('keydown', onKeyDown, false);

	  };

	  // Function to disable interactions (remove event listeners)
const disableInteractions = () => {
    renderer.current.domElement.removeEventListener('mousemove', onMouseMove);
    renderer.current.domElement.removeEventListener('click', onMouseClick);
    css2dRenderer.current.domElement.removeEventListener('mousemove', onMouseMove);
    css2dRenderer.current.domElement.removeEventListener('click', onMouseClick);
};
		// window resize
	  const onWindowResize = () => {
		camera.current.aspect = window.innerWidth / window.innerHeight;
		camera.current.updateProjectionMatrix();
		renderer.current.setSize(window.innerWidth, window.innerHeight);
		renderer.current.setPixelRatio(window.devicePixelRatio);
		css2dRenderer.current.setSize(window.innerWidth, window.innerHeight);


	  };
	  
//    remove world box using ray cast
const handleRaycasting = () => {
    // Set up the raycaster
    raycaster.current.setFromCamera(mouse.current, camera.current);

	let objectRemoved = false;
	const boundingBox = new THREE.Box3();
    
    // Perform raycasting and get intersections
    const intersects = raycaster.current.intersectObjects(scene.current.children, true);
    
    // Check if there are intersections
    if (intersects.length > 0) {
        // Loop through all intersected objects
        for (const intersect of intersects) {
            const clickedObject = intersect.object;

            // Get the bounding box of the clicked object
            const boundingBox = new THREE.Box3().setFromObject(clickedObject);
            
            // Calculate the center of the bounding box
            const boundingBoxCenter = new THREE.Vector3();
            boundingBox.getCenter(boundingBoxCenter);
            
            // Define the threshold for "nearly zero"
            const threshold = 0.0001;
  
            // Check if the distance from the center to the origin is within the threshold
            if (Math.abs(boundingBoxCenter.x) < threshold && 
                boundingBoxCenter.y< threshold && 
				boundingBoxCenter.z===0 ) {
                // Remove the object from the scene
				const removalGroup = new THREE.Group();
                 scene.current.add(removalGroup);

// Assuming 'clickedObject' is the object you want to remove
// clickedObject.visible = false; // Hide the object
removalGroup.add(clickedObject); // Add the object to the removal group

// Later, when you want to remove the object completely
// You can call remove() on its parent
removalGroup.remove(clickedObject);

// Make sure to dispose the object's geometry and material to free up memory
clickedObject.geometry.dispose();
clickedObject.material.dispose();
                // clickedObject.visible = false;
                console.log('Object with bounding box center nearly zero removed.');
				objectRemoved = true; // Set the flag to true
                break; // Exit the loop after removing the object
            }
        }
		if (objectRemoved) {
            // Recalculate the bounding box of the remaining objects
            boundingBox.makeEmpty(); // Reset the bounding box
            // Traverse through the scene's children again to calculate the bounding box
            scene.current.traverse((object) => {
                if (object.type === 'Mesh' && object.visible) {
                    // Ensure only visible meshes are considered
                    // Update the bounding box with each mesh in the scene
                    boundingBox.expandByObject(object);
                }
            });

            // Log the bounding box dimensions
			const center = new  THREE.Vector3()
			boundingBox.getCenter(center)
			setstoredBoundingBoxMax(boundingBox.max)
		setstoredBoundingBoxMin(boundingBox.min)
            
            objectRemoved = false; // Reset the flag
        }
        
 }
};

	//  re render
	  const render = () => {
		// Check if tiles object is defined and not null
		if (tiles.current && tiles.current.setCamera) {
			tiles.current.setCamera(camera.current);
			tiles.current.setResolutionFromRenderer(camera.current, renderer.current);
	
		  camera.current.updateMatrixWorld();
		  
		  tiles.current.update();
	
		  if(renderer.current && css2dRenderer.current){
	 // Render the scene
	 css2dRenderer.current.render(scene.current, camera.current);
	 renderer.current.render(scene.current, camera.current);	
	  }	 
	  } 	  
	  else {
		  console.error('Tiles object is not properly initialized.');
	  }
	   }
	//    animate
	  const animate = () => {
		requestAnimationFrame(animate);
		handleRaycasting()
		
		if (!tiles.current) return;
	
		render(); // Trigger a re-render    
		if (controls.current) {
		  controls.current.update();
		}
        // Update camera position based on moveState
	}

	// clean up
	// Clean up function
const cleanUp = () => {
    // Remove tiles from the scene
    scene.current.remove(tiles.current);

    // Remove labelObject if it exists
    if (labelObject) {
        scene.current.remove(labelObject);
        labelObject = null; // Set labelObject to null after removal
    }

    // Dispose controls if they exist
    if (controls.current) {
        controls.current.dispose();
    }

    // Remove all objects from the scene
    scene.current.remove(...scene.current.children);

    // Remove css2dRenderer from the scene
    scene.current.remove(css2dRenderer.current);

    // Remove event listeners from the renderer and css2dRenderer
    renderer.current.domElement.removeEventListener('mousemove', onMouseMove);
    renderer.current.domElement.removeEventListener('click', onMouseClick);
    css2dRenderer.current.domElement.removeEventListener('mousemove', onMouseMove);
    css2dRenderer.current.domElement.removeEventListener('click', onMouseClick);

    // Dispose renderer
    renderer.current.dispose();

    // Set active button to null
    setActiveButton(null);	
};


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

	
	// function for handle select tag
	const handlefocusSelected =()=>{
		if(selectedObjects){
			calculateBoundingBox();
			closeMenu(); 
		}
		 else{
		setCustomAlert(true);
		setModalMessage("Please select multiple inputs")
			closeMenu();
		 }       
	 }

	// function for handle focus selected
	 const focusZoomSelected = () => {
	
		if (focus) {
			    setorbitControlsTarget([])
					// Get the bounding box of the selected object
					const box = new THREE.Box3().setFromObject(focus);
			
					// Calculate the center of the bounding box
					const center = new THREE.Vector3();
					box.getCenter(center);
				
					// Calculate distance from the object to adjust camera position
					const objectSize = new THREE.Vector3();
					box.getSize(objectSize);
		
		
					const objectDistance = Math.max(objectSize.x, objectSize.y, objectSize.z)*2;
					 
					// Set camera position
					const distance = objectDistance ; // Adjust this factor as needed
					const offset = distance / Math.sqrt(3); 
					
		
					// Distance to ensure the object fits within the frustum
					// camera.current.position.copy(center.clone().add(new THREE.Vector3(offset, offset, 0)));
					camera.current.position.copy(center.clone().add(new THREE.Vector3(offset, offset, 0)));
					camera.current.lookAt(center)
					setorbitControlsTarget(center)
					orbitControlsTargets.current.copy(center);
					// Update controls to focus on the clicked object
					if(mode==='orbit'){
						controls.current.target.copy(center);
						controls.current.update(); // Update controls to reflect the new camera position
					}
					if(mode==='fly'){
						const box = new THREE.Box3().setFromObject(focus);
			
						const center = box.getCenter(new THREE.Vector3());
						const size = box.getSize(new THREE.Vector3());
						const distance = Math.max(size.x, size.y, size.z) * 2;
						const offset = distance / Math.sqrt(3); 					
						camera.current.position.copy(center.clone().add(new THREE.Vector3(offset, offset, 0)));
						camera.current.position.z += distance;
						camera.current.lookAt(center)
					}
					
		
				  }
				  else {
					console.log('No object selected or invalid object');
				}
		  closeMenu()
		  setFocus(null);
		
	  };

	// function for handle hide selected object
	  const hideSelectedObject = () => {
		if (focus) {
		  focus.visible = false;
		}
		closeMenu()
	};

	// function for handle hide all
	const handlehideall=()=>{
	 if (scene.current) {
			scene.current.children.forEach((object) => {
				object.visible = false;
				closeMenu()
			});
		} else {
			console.log('Scene is not defined.');
		}
		closeMenu()
	}

	// function for handle hide unselected
	const hideUnSelectedObject=()=>{
		console.log(focus);
		if (scene.current) {
			   scene.current.children.forEach((object) => {
				   object.visible = false;
				   closeMenu()
			   });
			   scene.current.add(focus);
			   focus.visible=true;

		   } else {
			   console.log('Scene is not defined.');
		   }
		   closeMenu()
	   }

	   // Function to restore the original visibility of all objects
	const handleUnhideAll = () => {
		if (scene.current) {
			scene.current.children.forEach((object) => {
				if (object.userData.originalVisibility !== undefined) {
					object.visible = object.userData.originalVisibility; // Restore original visibility
					delete object.userData.originalVisibility; // Clean up
				}
			});
			closeMenu();
		} else {
			console.log('Scene is not defined.');
		}
		closeMenu();
	};

	const handleDeleteView=()=>{
		console.log("saveview name",saveViewMenu);
		window.api.send('delete-view',saveViewMenu);
		closeMenu();

	}

	
	// Function to handle reload action
const handleReload = () => {
    // Handle reload logic here
    window.location.reload(); // Example: Reload the page
};

   // Function to calculate bb of  multiple  selected objects
   const calculateBoundingBox = () => {
	const cumulativeBoundingBox = new THREE.Box3();
    selectedObjects.forEach((object) => {
        const objectBoundingBox = new THREE.Box3().setFromObject(object);
        cumulativeBoundingBox.union(objectBoundingBox);
    });
	const center = new THREE.Vector3();
    cumulativeBoundingBox.getCenter(center);
	

	// Calculate distance from the object to adjust camera position
	const objectSize = new THREE.Vector3();
	cumulativeBoundingBox.getSize(objectSize);


	const objectDistance = Math.max(objectSize.x, objectSize.y, objectSize.z)*2;
	 
	// Set camera position
	const distance = objectDistance ; // Adjust this factor as needed
	const offset = distance / Math.sqrt(3); 
	// Update controls to focus on the clicked object
	
	 controls.current.target.copy(center);
	controls.current.update();
    
	setselectedObjects([]);
  };
     // Function to handle fly controls speed change
	 const handleFlySpeedChange = (event) => {
		event.preventDefault();
		console.log(event.target.value)
		setFlySpeed(event.target.value);
	};

	 // Function to handle fly controls rotation speed change
	 const handleFlyRotationSpeedChange = (event) => {
		setflyrotationSpeed(event.target.value);
	};

	const handleGoToThree=()=>{
		if(focus){
			console.log("taginfo",taginfo)
			window.api.send('open-in-three',taginfo.tagId)
			setopenThreeCanvas(true);
			setiRoamercanvas(true);
			closeMenu();
		}
	}
		// Define menu options
		const menuOptions = [
			{ label: 'Add Comment', action: handleAddComment },
			{label: 'change color', action: handleChangeColor},
			{label: 'Line/equipment info',action:handleShowlineEqpInfo},
			{label: 'Tag GenInfo',action:handleTagInfo},
			{label: 'Deselect ',action:handleDeselect},
			{label: 'Zoom selected',action:focusZoomSelected},		
			{label:'Focus Selected',action:handlefocusSelected},
			{label: 'Go to Three',action:handleGoToThree},
			{label: 'Smart P&ID',},
			{label:'Hide all',action:handlehideall},
			{label:'Hide selected',action:hideSelectedObject},
			// {label:'Hide unselected',action:hideUnSelectedObject},
			{label:'Reload',action:handleReload},
		
		
			// Add other menu options here
		  ];

		  const menuOptions1 = [
			{label: 'Unhide all',action:handleUnhideAll },
			{label: 'Unselect',action:handleDeselect},
			{label: 'Delete view',action:handleDeleteView}

			];
 const setup=()=>{       
	    scenesetup();
		renderersetup();
		camersetup();
		lightsetup();
		css2dsetup();
		controlssetup();
		renderer.current.domElement.addEventListener('mousemove', onMouseMove);
	    css2dRenderer.current.domElement.addEventListener('mousemove', onMouseMove);
		reinstantiateTiles()
		onWindowResize();
		window.addEventListener('resize', onWindowResize, false);
		animate()
 }
   const handleclosesetting=()=>{
	setsettingbox(false);
   }
   const handleclosecommentinfo=()=>{
	setIsEditing(false);
	setcommentinfotable(false);
	setcommentinfo(null);
	
   }

   const handlecontrolsopen=()=>{
	setShowControls(!showControls)
   }
   const speedBar = mode === 'fly' && (
    <div className="speed-bar" style={{ position: 'absolute', bottom: mode === 'fly' ? '20px' : 'unset', left: mode === 'fly' ? '0' : 'unset', zIndex: '1' }}>
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

  const switchToWireframe = (object) => {
	  object.traverse(child => {
		  if (child.isMesh) {			 
			  const wireframeMaterial = new THREE.MeshBasicMaterial({ color: child.material.color, wireframe: true });
			  child.material = wireframeMaterial;
		  }
	  });
  }; 
  const switchToNormalMaterial = (object) => {
	  object.traverse(child => {
		  if (child.isMesh) {
			const wireframeMaterial = new THREE.MeshBasicMaterial({ color:child.material.color, wireframe: false });
			child.material = wireframeMaterial;


		  }
	  });
  };
  
  const handleWireFrame = () => {
	  setWireframeEnabled(!wireframeEnabled)
	  if (wireframeEnabled) {
		  switchToWireframe(tiles.current.group)
	  } else {
		  switchToNormalMaterial(tiles.current.group);
	  }
  }
const handleReflectionIntensityChange=(e)=>{
	setReflectionIntensity(e.target.value)

}

const handleambientcolorchange=(e)=>{
	setAmbientLightcolor(e.target.value)
}

const handledirectionalcolorchange=(e)=>{
	setDirectionalLightcolor(e.target.value)
}
const handlepointcolorchange=(e)=>{
	setPointLightcolor(e.target.value)
}

const handleResetSettings = () => {
    setReflectionIntensity(0.5);
    setAmbientLightcolor('#ffffff');
    setDirectionalLightcolor('#ffffff');
    setPointLightcolor('#ff0000');
};

const deletecomment =(commentNumber)=>{
	console.log(commentNumber)
	window.api.send("delete-comment",commentNumber);
	const deletedLabel = newLabelObjects.current[commentNumber];
    if (deletedLabel) {
        scene.current.remove(deletedLabel);
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
	setModalMessage("Comment editing success")
	handleclosecommentinfo()
}
const handleCloseSavedView=()=>{
	setSavedViewDialog(false);
}

useEffect(()=>{
	if(settingbox){
		 // Remove existing lights
		 scene.current.remove(scene.current.children.filter(child => child instanceof THREE.PointLight));
		 scene.current.remove(scene.current.children.filter(child => child instanceof THREE.DirectionalLight));
		 scene.current.remove(scene.current.children.filter(child => child instanceof THREE.AmbientLight));
	 
		lightsetup()
	}
  },[AmbientLightcolor,DirectionalLightcolor,PointLightcolor,ReflectionIntensity])

let menuHeight = '200px'
const handleShowMeasureDetails=()=>{
	setShowMeasureDetails(!showMeasureDetails);
}

const applyView = (view) => {
	setSaveViewMenu(view.name)
	camera.current.position.set(view.posX, view.posY, view.posZ);
	orbitControlsTargets.current.set(view.targX, view.targY, view.targZ);
	camera.current.lookAt(orbitControlsTargets.current);
	if (controls.current) {
		controls.current.target.copy(orbitControlsTargets.current);
		controls.current.update();
	}
};

  return (
	<div >
		<div style={{width:'100%',maxHeight:'100vh'}} >
			<canvas  ref={canvasRef} style={{ position: 'absolute', top: '0',left:'0',right:'0',bottom:'0',overflow:'hidden',zIndex:'0'}} cleanup ={cleanUp}  >		
		</canvas> 
		
		<div id="hover-info" style={{
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '5px',
        borderRadius: '3px',
        pointerEvents: 'none',
        display: 'none',
		zIndex:'1000'
      }}></div>	
		<div>
		{speedBar}	 
        </div>
		<div className="circle-container">
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
           <h5 className='text-center fw-bold '>{taginfo.equipmentlistDetails?'Equipment Info' :'Line info'}</h5> 
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
            <p>Fluidcode: {taginfo.linelistDetails.fluidCode}</p>
            <p>Medium: {taginfo.linelistDetails.medium}</p>
            <p>Line Size (inch): {taginfo.linelistDetails.lineSizeIn}</p>
            <p>Line Size (NB): {taginfo.linelistDetails.lineSizeNb}</p>
            <p>Piping Spec: {taginfo.linelistDetails.pipingSpec}</p>
            <p>Insulation Type: {taginfo.linelistDetails.insType}</p>
            <p>Insulation Thickness: {taginfo.linelistDetails.insThickness}</p>
            <p>Heat Tracing: {taginfo.linelistDetails.heatTrace}</p>
            <p>Line From: {taginfo.linelistDetails.lineFrom}</p>
            <p>Line To: {taginfo.linelistDetails.lineTo}</p>
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
            <p>PWHT: {taginfo.linelistDetails.pwht}</p>
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

	        {/* Render setting */}
			{settingbox && (
        <div className='setting'
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
			width:'25%',
            height: 'auto',
            backgroundColor: 'black',
			boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
			zIndex: 1000,
			display: 'flex',
			flexDirection: 'column',
			borderBlockColor: 'black',
          }}
        >
			<div className='text-center'>
			<button onClick={handleclosesetting} className='btn btn-dark'><i class="fa-solid fa-xmark"></i></button>
			</div>
		  
       <div className="controlsetting">
		<div className="controlhead">	   <i class="fa-solid fa-caret-right" onClick={handlecontrolsopen}></i>Controls
</div>
	   {
		showControls && (
			<div className="insidecontrolsetting">
				<div className="flyrotspeed">
				FlyVerticalSpeed:  <input
           type="range"
           min="0.5"
           max="2"
           step="0.1"
           value={flySpeed}
           onChange={handleFlySpeedChange}
        />     <span>{flySpeed}</span>  

            
		</div>
				<div className="flyverspeed">
				FlyRotationSpeed: <input
           type="range"
		   min="0.2"
		   max="2"
		   step="0.1"
		   value={flyrotationSpeed}
		   onChange={handleFlyRotationSpeedChange}
            
        /> 
		</div>
		<div className="wirefram">
		Wireframe: <input
            type="checkbox"
			checked={!wireframeEnabled}
			onChange={handleWireFrame}
           
        />
		<div className="ambient">
		Ambient Light:<input
            type="color" value={AmbientLightcolor}			
			onChange={handleambientcolorchange}
           
        />

		</div>
		<div className="directional">
		Directional Light:<input
            type="color" value={DirectionalLightcolor}			
			onChange={handledirectionalcolorchange}
           
        />

		</div>
		<div className="directional">
		Point Light:<input
            type="color" value={PointLightcolor}			
			onChange={handlepointcolorchange}
           
        />
		

		</div>
		<div className="directional">
		Reflection:<div className="slider-container">
    <input
        className="slider"
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={ReflectionIntensity}
        onChange={handleReflectionIntensityChange}
    />
</div>
<div className="default">
		<button className="btn btn-light" onClick={handleResetSettings}>Default</button>
		</div>
		

		</div>
		</div>
			
		
	
		   </div>
		)
	   }
	  
	   </div>
        </div>
      )}

	     {/* comment info*/}
		 {commentinfotable && commentinfo && (
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
			<p>Comment:
				{
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
                <select value={status || ''} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
                  <option value="" disabled>
                    Choose type
                  </option>
                  {allCommentStatus.map((statusOption, idx) => (
                    <option key={idx} value={statusOption.statusname}>{statusOption.statusname}</option>
                  ))}
                </select>
              ) : (
                commentinfo.status
              )}
            </p>
			<p>Priority:
        {isEditing ? (
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
  )
}

export default CesiumComponent;