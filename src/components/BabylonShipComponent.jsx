import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import "cesium/Build/Cesium/Widgets/widgets.css";

class BabylonEarthViewerClass {
  constructor(options = {}) {
    this.cesiumContainer = options.cesiumContainer;
    this.babylonContainer = options.babylonContainer;
    this.cesiumViewer = null;
    this.engine = null;
    this.scene = null;
    this.camera = null;
    this.transformNode = null;
    this.selectedMesh = null;
    this.gizmoManager = null;
    this.isTransforming = false;
    this.currentTileset = null;
    this.ionToken = options.ionToken || "";
    this.isSceneActive = false;

    // Bind methods
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.toggleCesiumInteraction = this.toggleCesiumInteraction.bind(this);
  }

 // Add this method to create test objects
initTestObjects() {
    if (!this.scene) return;

    // Create a few test spheres
    for (let i = 0; i < 5; i++) {
        const sphere = BABYLON.MeshBuilder.CreateSphere(
            `sphere${i}`,
            { diameter: 1 },
            this.scene
        );
        
        // Position spheres in different locations
        sphere.position = new BABYLON.Vector3(i * 2 - 4, 0, 0);
        
        // Create and assign a material
        const material = new BABYLON.StandardMaterial(`sphereMaterial${i}`, this.scene);
        material.diffuseColor = new BABYLON.Color3(
            Math.random(),
            Math.random(),
            Math.random()
        );
        sphere.material = material;
        
        // Make sure the mesh is pickable
        sphere.isPickable = true;
    }

    // Create a box for variety
    const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, this.scene);
    box.position = new BABYLON.Vector3(0, 2, 0);
    const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", this.scene);
    boxMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    box.material = boxMaterial;
    box.isPickable = true;
}

// Update the handlePointerDown method to improve picking
handlePointerDown(event) {
    if (!this.isSceneActive || this.isTransforming) return;

    const pickResult = this.scene.pick(event.clientX, event.clientY, 
        (mesh) => mesh.isPickable && mesh instanceof BABYLON.Mesh
    );

    if (pickResult.hit && pickResult.pickedMesh) {
        console.log("Selected mesh:", pickResult.pickedMesh.name);
        this.selectMesh(pickResult.pickedMesh);
    } else {
        this.clearSelection();
    }
}

// Update the initialize method to create test objects
async initialize() {
    try {
        await this.initCesium();
        this.initBabylon();
        if (this.scene) {
            this.initGizmoManager();
            this.initTestObjects(); // Add this line
        }
        this.setupEventListeners();
        this.startRenderLoop();
        return true;
    } catch (error) {
        console.error('Initialization error:', error);
        return false;
    }
}

// Update selectMesh to ensure proper material handling
selectMesh(mesh) {
    this.clearSelection();
    this.selectedMesh = mesh;

    // Create highlight material
    const highlightMaterial = new BABYLON.StandardMaterial("highlightMaterial", this.scene);
    highlightMaterial.diffuseColor = mesh.material ? mesh.material.diffuseColor.clone() : new BABYLON.Color3(1, 1, 1);
    highlightMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    highlightMaterial.alpha = 1.0;

    // Store original material for later restoration
    mesh.originalMaterial = mesh.material;
    mesh.material = highlightMaterial;

    // Attach gizmos
    if (this.gizmoManager) {
        this.gizmoManager.attachToMesh(mesh);
    }
}

// Update clearSelection to properly restore materials
clearSelection() {
    if (this.selectedMesh) {
        // Restore original material
        if (this.selectedMesh.originalMaterial) {
            this.selectedMesh.material = this.selectedMesh.originalMaterial;
            this.selectedMesh.originalMaterial = null;
        }
        this.selectedMesh = null;
    }
    if (this.gizmoManager) {
        this.gizmoManager.attachToMesh(null);
    }
} async initialize() {
    try {
        await this.initCesium();
        this.initBabylon(); // Scene is created here
        if (this.scene) {
            this.initGizmoManager(); // Only initialize gizmos after scene exists
        }
        this.setupEventListeners();
        this.startRenderLoop();
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
      selectionIndicator: true,
    });

    this.toggleCesiumInteraction(true);
    this.cesiumViewer.cesiumWidget.creditContainer.style.display = "none";
    this.cesiumViewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(0, 0, 20000000),
    });
  }

  initBabylon() {
    // Create engine
    this.engine = new BABYLON.Engine(this.babylonContainer, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    // Create scene
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    // Create camera
    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      0,
      Math.PI / 3,
      10,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(this.babylonContainer, true);
    this.camera.lowerRadiusLimit = 1;
    this.camera.upperRadiusLimit = 50;

    // Add lights
    new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(1, 1, 0),
      this.scene
    );
    new BABYLON.DirectionalLight(
      "light2",
      new BABYLON.Vector3(-1, -1, -1),
      this.scene
    );
  }

  // Update the initGizmoManager method to include proper positioning and z-index
  initGizmoManager() {
    if (!this.scene) {
        console.error("Scene must be initialized before gizmo manager");
        return;
    }

    // Create gizmo manager
    this.gizmoManager = new BABYLON.GizmoManager(this.scene);

    // Basic setup
    this.gizmoManager.usePointerToAttachGizmos = true;
    this.gizmoManager.attachableMeshes = [];

    // Initialize gizmo states
    this.gizmoManager.positionGizmoEnabled = false;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;
    this.gizmoManager.boundingBoxGizmoEnabled = true;

    try {
        // Configure gizmos
        if (this.gizmoManager.gizmos.positionGizmo) {
            this.gizmoManager.gizmos.positionGizmo.scaleRatio = 1.5;
        }

        if (this.gizmoManager.gizmos.rotationGizmo) {
            this.gizmoManager.gizmos.rotationGizmo.scaleRatio = 1.5;
        }

        if (this.gizmoManager.gizmos.scaleGizmo) {
            this.gizmoManager.gizmos.scaleGizmo.scaleRatio = 1.5;
        }

        if (this.gizmoManager.gizmos.boundingBoxGizmo) {
            this.gizmoManager.gizmos.boundingBoxGizmo.scaleBoxSize = 0.03;
            this.gizmoManager.gizmos.boundingBoxGizmo.rotationSphereSize = 0.03;
        }

        // Setup utility layer
        const utilityLayer = new BABYLON.UtilityLayerRenderer(this.scene);
        utilityLayer.utilityLayerScene.autoClear = false;
        utilityLayer.renderOnTop = true;

        // Handle drag events
        if (this.gizmoManager.onGizmoAxisDragStartObservable) {
            this.gizmoManager.onGizmoAxisDragStartObservable.add(() => {
                this.isTransforming = true;
                if (this.camera) {
                    this.camera.detachControl(this.babylonContainer);
                }
            });
        }

        if (this.gizmoManager.onGizmoAxisDragEndObservable) {
            this.gizmoManager.onGizmoAxisDragEndObservable.add(() => {
                this.isTransforming = false;
                if (this.camera) {
                    this.camera.attachControl(this.babylonContainer, true);
                }
            });
        }

        // Setup render observer
        if (this.scene.onBeforeRenderObservable) {
            this.scene.onBeforeRenderObservable.add(() => {
                this.updateGizmoPositions();
            });
        }
    } catch (error) {
        console.error("Error initializing gizmo manager:", error);
    }
}

// Add this helper method for updating gizmo positions
updateGizmoPositions() {
    if (!this.selectedMesh || !this.gizmoManager || !this.gizmoManager.gizmos) return;

    try {
        const boundingBox = this.selectedMesh.getBoundingInfo().boundingBox;
        const center = boundingBox.center;

        const gizmos = this.gizmoManager.gizmos;
        Object.values(gizmos).forEach(gizmo => {
            if (gizmo && gizmo.position) {
                gizmo.position.copyFrom(center);
            }
        });
    } catch (error) {
        console.warn("Error updating gizmo positions:", error);
    }
}
  

  async loadTileset(assetId) {
    if (!this.cesiumViewer) {
      throw new Error("Cesium viewer not initialized");
    }

    try {
      if (this.currentTileset) {
        this.cesiumViewer.scene.primitives.remove(this.currentTileset);
        this.currentTileset = null;
      }

      const tileset = await window.Cesium.Cesium3DTileset.fromIonAssetId(
        assetId
      );
      this.currentTileset = this.cesiumViewer.scene.primitives.add(tileset);

      await tileset.readyPromise;
      this.cesiumViewer.zoomTo(tileset);

      return tileset;
    } catch (error) {
      console.error("Error loading tileset:", error);
      throw new Error(`Failed to load asset ${assetId}: ${error.message}`);
    }
  }

  handlePointerMove(event) {
    if (!this.isSceneActive || this.isTransforming) return;

    const pickResult = this.scene.pick(event.clientX, event.clientY);
    if (pickResult.hit && pickResult.pickedMesh) {
      this.babylonContainer.style.cursor = "pointer";
    } else {
      this.babylonContainer.style.cursor = "default";
    }
  }



  setTransformMode(mode) {
    this.gizmoManager.positionGizmoEnabled = false;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;

    switch (mode) {
      case "translate":
        this.gizmoManager.positionGizmoEnabled = true;
        break;
      case "rotate":
        this.gizmoManager.rotationGizmoEnabled = true;
        break;
      case "scale":
        this.gizmoManager.scaleGizmoEnabled = true;
        break;
    }
  }
  duplicateSelectedMesh() {
    if (!this.selectedMesh) return;

    // Clone the mesh with all its children
    const clone = this.selectedMesh.clone(
      "clone_" + this.selectedMesh.name,
      null,
      true
    );

    // Offset the position slightly so it's visible
    clone.position.addInPlace(new BABYLON.Vector3(1, 0, 0));

    // Clone materials to avoid shared modifications
    if (clone.material) {
      clone.material = this.selectedMesh.material.clone();
    }

    // Make sure the clone is pickable
    clone.isPickable = true;

    // Select the new clone
    this.selectMesh(clone);
  }

  setupEventListeners() {
    window.addEventListener("resize", this.handleResize);

    this.scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERMOVE:
          this.handlePointerMove(pointerInfo.event);
          break;
        case BABYLON.PointerEventTypes.POINTERDOWN:
          this.handlePointerDown(pointerInfo.event);
          break;
      }
    });

    window.addEventListener("keydown", (event) => {
      if (!this.isSceneActive) return;

      switch (event.key.toLowerCase()) {
        case "w":
          this.gizmoManager.positionGizmoEnabled =
            !this.gizmoManager.positionGizmoEnabled;
          break;
        case "e":
          this.gizmoManager.rotationGizmoEnabled =
            !this.gizmoManager.rotationGizmoEnabled;
          break;
        case "r":
          this.gizmoManager.scaleGizmoEnabled =
            !this.gizmoManager.scaleGizmoEnabled;
          break;
        case "q":
          this.gizmoManager.boundingBoxGizmoEnabled =
            !this.gizmoManager.boundingBoxGizmoEnabled;
          break;
        case "d":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.duplicateSelectedMesh();
          }
          break;
      }
    });

    this.babylonContainer.addEventListener("mouseenter", () => {
      this.isSceneActive = true;
      this.toggleCesiumInteraction(false);
    });

    this.babylonContainer.addEventListener("mouseleave", () => {
      this.isSceneActive = false;
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

  startRenderLoop() {
    this.engine.runRenderLoop(() => {
      if (this.scene) {
        this.scene.render();
      }
    });
  }

  handleResize() {
    if (this.engine) {
      this.engine.resize();
    }

    if (this.cesiumViewer) {
      this.cesiumViewer.resize();
    }
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);

    if (this.gizmoManager) {
      this.gizmoManager.dispose();
    }

    if (this.scene) {
      this.scene.dispose();
    }

    if (this.engine) {
      this.engine.dispose();
    }

    if (this.cesiumViewer) {
      this.cesiumViewer.destroy();
    }
  }
}

const BabylonEarthViewerComponent = ({ gettokenNumber, ionAssetId }) => {
  const cesiumContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const viewerInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assetId, setAssetId] = useState("");
  const [isValidInput, setIsValidInput] = useState(false);

  useEffect(() => {
    const initViewer = async () => {
      if (!window.Cesium) {
        console.error("Cesium not loaded");
        return;
      }

      try {
        const viewer = new BabylonEarthViewerClass({
          cesiumContainer: cesiumContainerRef.current,
          babylonContainer: canvasRef.current,
          ionToken: gettokenNumber,
        });

        await viewer.initialize();
        viewerInstanceRef.current = viewer;
      } catch (error) {
        console.error("Failed to initialize Earth Viewer:", error);
        setError("Failed to initialize viewer");
      }
    };

    initViewer();

    return () => {
      if (viewerInstanceRef.current) {
        viewerInstanceRef.current.destroy();
      }
    };
  }, [gettokenNumber]);

  const handleAssetIdChange = (event) => {
    const value = event.target.value.trim();
    setAssetId(value);
    setIsValidInput(/^\d+$/.test(value) && parseInt(value) > 0);
    if (error) setError(null);
  };

  const handleLoadAsset = async () => {
    if (!viewerInstanceRef.current || !isValidInput) return;

    setIsLoading(true);
    setError(null);

    try {
      await viewerInstanceRef.current.loadTileset(parseInt(ionAssetId));
    } catch (error) {
      console.error("Failed to load asset:", error);
      setError("Failed to load asset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        ref={cesiumContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "auto",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 2,
          padding: "15px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="text"
            value={assetId}
            onChange={handleAssetIdChange}
            placeholder="Enter Asset ID"
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: error ? "2px solid #ff0000" : "1px solid #ccc",
              width: "150px",
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleLoadAsset}
            disabled={!isValidInput || isLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: isValidInput ? "#4CAF50" : "#cccccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isValidInput && !isLoading ? "pointer" : "not-allowed",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Loading..." : "Load Asset"}
          </button>
        </div>
        {error && (
          <div
            style={{
              color: "red",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "5px",
              marginTop: "10px",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}
        {!isValidInput && assetId && (
          <div
            style={{
              color: "#666",
              fontSize: "12px",
              marginTop: "5px",
            }}
          >
            Please enter a valid asset ID (positive number)
          </div>
        )}
        {/* <div
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: "#444",
          }}
        >
          <div>Transform Controls:</div>
          <div>W - Toggle Position Gizmo</div>
          <div>E - Toggle Rotation Gizmo</div>
          <div>R - Toggle Scale Gizmo</div>
          <div>Q - Toggle Bounding Box</div>
          <div>Ctrl+D - Duplicate Selected</div>
          <div>ESC - Clear Selection</div>
        </div> */}
      </div>
    </div>
  );
};

export default BabylonEarthViewerComponent;
