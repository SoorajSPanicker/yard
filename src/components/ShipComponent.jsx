import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

class EarthViewerClass {
    constructor(options = {}) {
        this.cesiumContainer = options.cesiumContainer;
        this.threeContainer = options.threeContainer;
        this.cesiumViewer = null;
        this.threeRenderer = null;
        this.threeScene = null;
        this.threeCamera = null;
        this.orbitControls = null;
        this.transformControls = null;
        this.animationFrameId = null;
        this.ionToken = options.ionToken || '';
        this.currentTileset = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedObject = null;
        this.isThreeActive = false;
        this.pickHandler = null;
        this.isTransforming = false;
        this.currentTileset = null; 

        // Bind methods
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.toggleCesiumInteraction = this.toggleCesiumInteraction.bind(this);
    }

    async initialize() {
        try {
            await this.initCesium();
            this.initThree();
            this.startAnimation();
            return true;
        } catch (error) {
            console.error('Initialization error:', error);
            return false;
        }
    }

    async initCesium() {
        const Cesium = window.Cesium;
        Cesium.Ion.defaultAccessToken = this.ionToken;
        
        this.cesiumViewer = new Cesium.Viewer(this.cesiumContainer, {
            terrainProvider: await Cesium.createWorldTerrainAsync(),
            baseLayerPicker: false,
            skyBox: false,
            skyAtmosphere: false,
            sceneMode: Cesium.SceneMode.SCENE3D,
            animation: false,
            timeline: false,
            navigationHelpButton: false,
            infoBox: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            scene3DOnly: true,
            selectionIndicator: true
        });

        // Enable Cesium's event handlers
        this.toggleCesiumInteraction(true);
        
        // Set up Cesium click handling
        this.pickHandler = new Cesium.ScreenSpaceEventHandler(this.cesiumViewer.scene.canvas);
        this.setupCesiumEventHandlers();

        this.cesiumViewer.cesiumWidget.creditContainer.style.display = "none";
        this.cesiumViewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(0, 0, 20000000)
        });
    }

    async loadTileset(assetId) {
        if (!this.cesiumViewer) {
            throw new Error('Cesium viewer not initialized');
        }
    
        const Cesium = window.Cesium;
        if (!Cesium) {
            throw new Error('Cesium is not loaded');
        }
    
        try {
            // Remove any existing tileset
            if (this.currentTileset) {
                this.cesiumViewer.scene.primitives.remove(this.currentTileset);
                this.currentTileset = null;
            }
    
            // Load new tileset
            const tileset = await window.Cesium.Cesium3DTileset.fromIonAssetId(assetId, {
                maximumScreenSpaceError: 16,
                maximumMemoryUsage: 512
            });
    
            // Add tileset to scene
            this.currentTileset = this.cesiumViewer.scene.primitives.add(tileset);
    
            // Zoom to tileset
            await tileset.readyPromise;
            this.cesiumViewer.zoomTo(tileset, new window.Cesium.HeadingPitchRange(0, -0.5, 0));
    
            return tileset;
        } catch (error) {
            console.error('Error loading tileset:', error);
            throw new Error(`Failed to load asset ${assetId}: ${error.message}`);
        }
    }
    

    initThree() {
        this.threeRenderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            canvas: this.threeContainer
        });
        this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
        this.threeRenderer.setClearColor(0x000000, 0);
        
        this.threeScene = new THREE.Scene();
        this.threeCamera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.threeCamera.position.z = 5;

        // Add some basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.threeScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        this.threeScene.add(directionalLight);
    }

   

    setupEventListeners() {
        window.addEventListener('resize', this.handleResize);
        
        this.threeContainer.addEventListener('mousemove', (event) => {
            if (this.isThreeActive) {
                this.handleMouseMove(event);
            }
        });
        
        this.threeContainer.addEventListener('click', (event) => {
            if (this.isThreeActive) {
                this.handleMouseClick(event);
            }
        });

        window.addEventListener('keydown', (event) => {
            if (!this.isThreeActive || !this.transformControls) return;

            switch(event.key.toLowerCase()) {
                case 'g':
                    this.setTransformMode('translate');
                    break;
                case 'r':
                    this.setTransformMode('rotate');
                    break;
                case 's':
                    this.setTransformMode('scale');
                    break;
                case 'escape':
                    if (this.transformControls.object) {
                        this.transformControls.detach();
                        if (this.selectedObject?.material instanceof THREE.MeshPhongMaterial) {
                            this.selectedObject.material.emissive.setHex(0x000000);
                        }
                        this.selectedObject = null;
                    }
                    break;
            }
        });
        
        this.threeContainer.addEventListener('mouseenter', () => {
            this.isThreeActive = true;
            this.toggleCesiumInteraction(false);
        });
        
        this.threeContainer.addEventListener('mouseleave', () => {
            this.isThreeActive = false;
            this.toggleCesiumInteraction(true);
        });
    }

    toggleCesiumInteraction(enable) {
        if (this.cesiumViewer) {
            const controller = this.cesiumViewer.scene.screenSpaceCameraController;
            controller.enableRotate = enable;
            controller.enableTranslate = enable;
            controller.enableZoom = enable;
            controller.enableTilt = enable;
            controller.enableLook = enable;
        }
    }

    startAnimation() {
        const animate = () => {
            this.animationFrameId = requestAnimationFrame(animate);
            
            if (this.orbitControls && !this.isTransforming) {
                this.orbitControls.update();
            }

            if (this.transformControls && this.transformControls.object) {
                this.transformControls.update();
            }
            
            if (this.threeRenderer && this.threeScene && this.threeCamera) {
                this.threeRenderer.render(this.threeScene, this.threeCamera);
            }
        };
        animate();
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (this.threeCamera) {
            this.threeCamera.aspect = width / height;
            this.threeCamera.updateProjectionMatrix();
        }

        if (this.threeRenderer) {
            this.threeRenderer.setSize(width, height);
        }

        if (this.cesiumViewer) {
            this.cesiumViewer.canvas.width = width;
            this.cesiumViewer.canvas.height = height;
            this.cesiumViewer.resize();
        }
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
        
        if (this.transformControls) {
            this.transformControls.dispose();
        }

        if (this.orbitControls) {
            this.orbitControls.dispose();
        }

        if (this.pickHandler) {
            this.pickHandler.destroy();
        }

        if (this.cesiumViewer) {
            this.cesiumViewer.destroy();
        }

        if (this.threeRenderer) {
            this.threeRenderer.dispose();
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}
const EarthViewerComponent = ({gettokenNumber,ionAssetId}) => {
    const cesiumContainerRef = useRef(null);
    const canvasRef = useRef(null);
    const viewerInstanceRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [assetId, setAssetId] = useState('');
    const [isValidInput, setIsValidInput] = useState(false);

    useEffect(() => {
        const initViewer = async () => {
            if (!window.Cesium) {
                console.error('Cesium not loaded');
                return;
            }

            try {
                const viewer = new EarthViewerClass({
                    cesiumContainer: cesiumContainerRef.current,
                    threeContainer: canvasRef.current,
                    ionToken: gettokenNumber
                });

                await viewer.initialize();
                viewerInstanceRef.current = viewer;
            } catch (error) {
                console.error('Failed to initialize Earth Viewer:', error);
                setError('Failed to initialize viewer');
            }
        };

        initViewer();

        return () => {
            if (viewerInstanceRef.current) {
                viewerInstanceRef.current.destroy();
            }
        };
    }, []);

    // Validate asset ID input
    const handleAssetIdChange = (event) => {
        const value = event.target.value.trim();
        setAssetId(value);
        
        // Check if the input is a valid number
        const isValid = /^\d+$/.test(value) && parseInt(value) > 0;
        setIsValidInput(isValid);
        
        if (error) setError(null);
    };

    const handleLoadAsset = async () => {
        if (!viewerInstanceRef.current || !isValidInput) return;

        setIsLoading(true);
        setError(null);

        try {
            await viewerInstanceRef.current.loadTileset(parseInt(ionAssetId));
        } catch (error) {
            console.error('Failed to load asset:', error);
            setError('Failed to load asset');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        padding: '8px 12px',
        marginRight: '10px',
        borderRadius: '4px',
        border: error ? '2px solid #ff0000' : '1px solid #ccc',
        width: '150px',
        fontSize: '14px'
    };

    const buttonStyle = {
        padding: '8px 16px',
        backgroundColor: isValidInput ? '#4CAF50' : '#cccccc',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: isValidInput && !isLoading ? 'pointer' : 'not-allowed',
        opacity: isLoading ? 0.7 : 1
    };

    const controlsContainerStyle = {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <div 
                ref={cesiumContainerRef} 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0
                }}
            />
            <canvas 
    ref={canvasRef}
    style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'auto'
    }}
/>
            <div style={controlsContainerStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={assetId}
                        onChange={handleAssetIdChange}
                        placeholder="Enter Asset ID"
                        style={inputStyle}
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleLoadAsset}
                        disabled={!isValidInput || isLoading}
                        style={buttonStyle}
                    >
                        {isLoading ? 'Loading...' : 'Load Asset'}
                    </button>
                </div>
                {error && (
                    <div style={{ 
                        color: 'red',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        padding: '5px',
                        borderRadius: '4px'
                    }}>
                        {error}
                    </div>
                )}
                {!isValidInput && assetId && (
                    <div style={{
                        color: '#666',
                        fontSize: '12px',
                        marginTop: '5px'
                    }}>
                        Please enter a valid asset ID (positive number)
                    </div>
                )}
            </div>
        </div>
    );
};

export default EarthViewerComponent;