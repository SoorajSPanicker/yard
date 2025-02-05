import React, { useState, useEffect, useRef } from "react";
import * as BABYLON from '@babylonjs/core';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';

// Define vessel data
const VESSEL_DATA = [
  { 
    id: 1, 
    name: "Container Ship A", 
    width: 35, 
    length: 180, 
    height: 40, 
    schedule: [1, 10],
    color: new BABYLON.Color3(0.75, 0.75, 0.75)
  },
  { 
    id: 2, 
    name: "Cargo Vessel B", 
    width: 30, 
    length: 150, 
    height: 35, 
    schedule: [8, 15],
    color: new BABYLON.Color3(0.8, 0.8, 0.8)
  },
  { 
    id: 3, 
    name: "Bulk Carrier C", 
    width: 40, 
    length: 200, 
    height: 45, 
    schedule: [20, 30],
    color: new BABYLON.Color3(0.7, 0.7, 0.7)
  },
  { 
    id: 4, 
    name: "Tanker Ship D", 
    width: 38, 
    length: 190, 
    height: 42, 
    schedule: [5, 25],
    color: new BABYLON.Color3(0.65, 0.65, 0.65)
  },
  { 
    id: 5, 
    name: "Ferry E", 
    width: 25, 
    length: 120, 
    height: 30, 
    schedule: [12, 35],
    color: new BABYLON.Color3(0.7, 0.7, 0.8)
  },
  { 
    id: 6, 
    name: "RoRo Vessel F", 
    width: 32, 
    length: 160, 
    height: 38, 
    schedule: [15, 40],
    color: new BABYLON.Color3(0.75, 0.7, 0.7)
  },
  { 
    id: 7, 
    name: "LNG Carrier G", 
    width: 36, 
    length: 170, 
    height: 41, 
    schedule: [3, 20],
    color: new BABYLON.Color3(0.8, 0.75, 0.7)
  },
  { 
    id: 8, 
    name: "Container Ship H", 
    width: 33, 
    length: 175, 
    height: 39, 
    schedule: [10, 30],
    color: new BABYLON.Color3(0.73, 0.73, 0.73)
  },
  { 
    id: 9, 
    name: "Bulk Carrier I", 
    width: 37, 
    length: 185, 
    height: 43, 
    schedule: [7, 28],
    color: new BABYLON.Color3(0.68, 0.68, 0.68)
  },
  { 
    id: 10, 
    name: "Chemical Tanker J", 
    width: 34, 
    length: 165, 
    height: 37, 
    schedule: [4, 22],
    color: new BABYLON.Color3(0.72, 0.72, 0.72)
  },
  { 
    id: 11, 
    name: "Car Carrier K", 
    width: 31, 
    length: 155, 
    height: 36, 
    schedule: [9, 33],
    color: new BABYLON.Color3(0.77, 0.77, 0.77)
  },
  { 
    id: 12, 
    name: "General Cargo L", 
    width: 29, 
    length: 145, 
    height: 34, 
    schedule: [6, 27],
    color: new BABYLON.Color3(0.74, 0.74, 0.74)
  }
];

const AREA_DATAS = [
  { id: 1, name: "Construction Area 1", width: 100, length: 200, position: { x: -300, z: -200 } },
  { id: 2, name: "Construction Area 2", width: 100, length: 200, position: { x: -150, z: -200 } },
  { id: 3, name: "Repair Dock 1", width: 80, length: 180, position: { x: 0, z: -200 } },
  { id: 4, name: "Repair Dock 2", width: 80, length: 180, position: { x: 150, z: -200 } },
  { id: 5, name: "Loading Area 1", width: 120, length: 250, position: { x: -250, z: 100 } },
  { id: 6, name: "Loading Area 2", width: 120, length: 250, position: { x: -100, z: 100 } },
  { id: 7, name: "Storage Area 1", width: 150, length: 150, position: { x: 100, z: 100 } },
  { id: 8, name: "Storage Area 2", width: 150, length: 150, position: { x: 250, z: 100 } },
  { id: 9, name: "Assembly Area", width: 200, length: 300, position: { x: -200, z: -500 } },
  { id: 10, name: "Testing Area", width: 200, length: 300, position: { x: 200, z: -500 } }
];


const AREA_DATA = [
  { 
    id: 1, 
    name: "Dock 1", 
    width: 120, // Wider dock for multiple parallel vessels
    length: 400, 
    position: { x: -350, z: 0 },
    vessels: [1, 2, 3], // Vessels to be placed in parallel
    vesselColumns: 3 // Number of parallel vessel positions
  },
  { 
    id: 2, 
    name: "Dock 2", 
    width: 100,
    length: 400, 
    position: { x: -210, z: 0 },
    vessels: [4, 5],
    vesselColumns: 2
  },
  { 
    id: 3, 
    name: "Dock 3", 
    width: 80,
    length: 400, 
    position: { x: -70, z: 0 },
    vessels: [6],
    vesselColumns: 1
  },
  { 
    id: 4, 
    name: "Dock 4", 
    width: 80,
    length: 400, 
    position: { x: 70, z: 0 },
    vessels: [],
    vesselColumns: 1
  },
  { 
    id: 5, 
    name: "Dock 5", 
    width: 90,
    length: 400, 
    position: { x: 210, z: 0 },
    vessels: [7, 8],
    vesselColumns: 2
  },
  { 
    id: 6, 
    name: "Dock 6", 
    width: 80,
    length: 400, 
    position: { x: 350, z: 0 },
    vessels: [9, 10],
    vesselColumns: 2
  }
];


// Add a function to load the GLB model
const loadVesselModel = async (scene) => {
  try {
    console.log("Starting to load vessel model...");
    const result = await SceneLoader.ImportMeshAsync(
      "", 
      "/", 
      "vessel.glb", 
      scene
    );
    console.log("Vessel model loaded successfully:", result);

    // Hide the original loaded model
    result.meshes[0].setEnabled(false);
    return result.meshes[0];
  } catch (error) {
    console.error("Error loading vessel model:", error);
    return null;
  }
};

const loadPortModel = async (scene) => {
  try {
    console.log("Starting to load port model...");
    const result = await SceneLoader.ImportMeshAsync(
      "", 
      "/", 
      "port.glb", 
      scene
    );
    console.log("Port model loaded successfully:", result);

    // Get the main port mesh
    const portModel = result.meshes[0];
    
    // Scale the port model appropriately
    // portModel.scaling = new BABYLON.Vector3(50, 50, 50);
    
    // Rotate the model 90 degrees to make it face the correct direction
    // portModel.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
    
    // Position the port model at the back of the scene
    portModel.position = new BABYLON.Vector3(0, 5, -400);

    // Apply materials to all port meshes
    result.meshes.forEach(mesh => {
      if (mesh.material) {
        mesh.material.backFaceCulling = false;
      }
    });

    return portModel;
  } catch (error) {
    console.error("Error loading port model:", error);
    return null;
  }
};



// Update createDetailedVessel function
const createDetailedVessel = async (scene, vessel, position, originalModel) => {
  if (!originalModel) {
    console.error("Original vessel model not loaded");
    return null;
  }

  console.log(`Creating vessel ${vessel.id} at position:`, position);

  // Clone the model for this vessel
  const vesselInstance = originalModel.clone(`vessel-${vessel.id}`);
  vesselInstance.setEnabled(true);

  // Scale the model to match vessel dimensions
  vesselInstance.scaling = new BABYLON.Vector3(
    vessel.width / 35,  // Normalize to standard width
    vessel.height / 40, // Normalize to standard height
    vessel.length / 180 // Normalize to standard length
  );

  // Position the vessel
  vesselInstance.position = position;

  // Add metadata and apply materials
  vesselInstance.isPickable = true;
  vesselInstance.metadata = { 
    vesselId: vessel.id, 
    name: vessel.name,
    type: vessel.type 
  };

  // Create and apply vessel color material
  const material = new BABYLON.StandardMaterial(`vessel-${vessel.id}-material`, scene);
  material.diffuseColor = vessel.color;
  material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  material.specularPower = 32;

  vesselInstance.getChildMeshes().forEach(mesh => {
    mesh.material = material;
    mesh.isPickable = true;
    mesh.metadata = { vesselId: vessel.id, name: vessel.name };
  });

  return {
    meshes: [vesselInstance, ...vesselInstance.getChildMeshes()],
    mainHull: vesselInstance
  };
};



// Add these new helper functions after the createDetailedVessel function:

// const createArea = (scene, area) => {
//   const box = BABYLON.MeshBuilder.CreateBox(`area-${area.id}`, {
//     width: area.width,
//     height: 2,
//     depth: area.length
//   }, scene);
  
//   const material = new BABYLON.StandardMaterial(`area-${area.id}-material`, scene);
//   material.diffuseColor = new BABYLON.Color3(0.4, 0.4, 1);
//   material.alpha = 0.2;
//   material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
//   box.material = material;
  
//   box.position = new BABYLON.Vector3(area.position.x, 1, area.position.z);
//   box.isPickable = true;
//   box.metadata = { type: 'area', id: area.id, name: area.name };

//   // Create area number display
//   const plane = BABYLON.MeshBuilder.CreatePlane(`area-label-${area.id}`, {
//     width: 20,
//     height: 20
//   }, scene);
//   plane.position = new BABYLON.Vector3(
//     area.position.x,
//     20, // Height above the area
//     area.position.z
//   );
//   plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

//   const texture = new BABYLON.DynamicTexture(`area-texture-${area.id}`, {
//     width: 256,
//     height: 256
//   }, scene);
//   const labelMaterial = new BABYLON.StandardMaterial(`area-label-material-${area.id}`, scene);
//   labelMaterial.diffuseTexture = texture;
//   labelMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
//   labelMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
//   labelMaterial.backFaceCulling = false;
//   plane.material = labelMaterial;

//   // Draw text on texture
//   texture.drawText(
//     area.id.toString(),
//     null,
//     200,
//     "bold 180px Arial",
//     "white",
//     "transparent",
//     true
//   );
  
//   return [box, plane];
// };

const createArea = (scene, area) => {
  const meshes = [];
  
  // Create main dock platform
  const platform = BABYLON.MeshBuilder.CreateBox(`dock-${area.id}`, {
    width: area.width,
    height: 5,
    depth: area.length
  }, scene);
  
  const material = new BABYLON.StandardMaterial(`dock-${area.id}-material`, scene);
  material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  platform.material = material;
  
  platform.position = new BABYLON.Vector3(area.position.x, 2.5, area.position.z);
  platform.isPickable = true;
  platform.metadata = { type: 'dock', id: area.id, name: area.name };
  meshes.push(platform);

  // Create dock walls
  const wallThickness = 5;
  const wallHeight = 10;
  
  // Left wall
  const leftWall = BABYLON.MeshBuilder.CreateBox(`dock-${area.id}-left-wall`, {
    width: wallThickness,
    height: wallHeight,
    depth: area.length
  }, scene);
  leftWall.position = new BABYLON.Vector3(
    area.position.x - (area.width/2 - wallThickness/2),
    wallHeight/2,
    area.position.z
  );
  leftWall.material = material;
  meshes.push(leftWall);

  // Right wall
  const rightWall = BABYLON.MeshBuilder.CreateBox(`dock-${area.id}-right-wall`, {
    width: wallThickness,
    height: wallHeight,
    depth: area.length
  }, scene);
  rightWall.position = new BABYLON.Vector3(
    area.position.x + (area.width/2 - wallThickness/2),
    wallHeight/2,
    area.position.z
  );
  rightWall.material = material;
  meshes.push(rightWall);

  // Create dock number display
  const plane = BABYLON.MeshBuilder.CreatePlane(`dock-label-${area.id}`, {
    width: 20,
    height: 20
  }, scene);
  plane.position = new BABYLON.Vector3(
    area.position.x,
    20,
    area.position.z - area.length/2 + 20
  );
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

  const texture = new BABYLON.DynamicTexture(`dock-texture-${area.id}`, {
    width: 256,
    height: 256
  }, scene);
  const labelMaterial = new BABYLON.StandardMaterial(`dock-label-material-${area.id}`, scene);
  labelMaterial.diffuseTexture = texture;
  labelMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  labelMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
  labelMaterial.backFaceCulling = false;
  plane.material = labelMaterial;

  texture.drawText(
    area.id.toString(),
    null,
    200,
    "bold 180px Arial",
    "white",
    "transparent",
    true
  );
  
  return meshes;
};

const createCrane = (scene, position, id) => {
  const meshes = [];

  // Base
  const base = BABYLON.MeshBuilder.CreateBox(`crane-${id}-base`, {
    width: 20,
    height: 5,
    depth: 20
  }, scene);
  base.position = new BABYLON.Vector3(position.x, 2.5, position.z);
  meshes.push(base);

  // Tower
  const tower = BABYLON.MeshBuilder.CreateBox(`crane-${id}-tower`, {
    width: 8,
    height: 100,
    depth: 8
  }, scene);
  tower.position = new BABYLON.Vector3(position.x, 52.5, position.z);
  meshes.push(tower);

  // Boom
  const boom = BABYLON.MeshBuilder.CreateBox(`crane-${id}-boom`, {
    width: 120,
    height: 5,
    depth: 5
  }, scene);
  boom.position = new BABYLON.Vector3(position.x, 100, position.z);
  meshes.push(boom);

  // Create material
  const material = new BABYLON.StandardMaterial(`crane-${id}-material`, scene);
  material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);

  meshes.forEach(mesh => {
    mesh.material = material;
    mesh.isPickable = true;
    mesh.metadata = { type: 'crane', id: id };
  });

  return meshes;
};

const createCraneBetweenDocks = (scene, position, id, servingDocks) => {
  const meshes = [];

  // Base
  const base = BABYLON.MeshBuilder.CreateBox(`crane-${id}-base`, {
    width: 15,
    height: 5,
    depth: 15
  }, scene);
  base.position = new BABYLON.Vector3(position.x, 2.5, position.z);
  meshes.push(base);

  // Tower
  const tower = BABYLON.MeshBuilder.CreateBox(`crane-${id}-tower`, {
    width: 6,
    height: 80,
    depth: 6
  }, scene);
  tower.position = new BABYLON.Vector3(position.x, 42.5, position.z);
  meshes.push(tower);

  // Boom
  const boom = BABYLON.MeshBuilder.CreateBox(`crane-${id}-boom`, {
    width: 100,
    height: 4,
    depth: 4
  }, scene);
  boom.position = new BABYLON.Vector3(position.x, 80, position.z);
  meshes.push(boom);

  // Create material
  const material = new BABYLON.StandardMaterial(`crane-${id}-material`, scene);
  material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);

  meshes.forEach(mesh => {
    mesh.material = material;
    mesh.isPickable = true;
    // Add serving docks information to metadata
    mesh.metadata = { 
      type: 'crane', 
      id: id,
      servingDocks: servingDocks 
    };
  });

  return meshes;
};

// Controls Component
const WeekControls = ({ selectedWeek, setSelectedWeek, isPlaying, setIsPlaying }) => {
  const formatWeekDate = (week) => {
    const date = new Date(2024, 0, 1 + (week - 1) * 7);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    // <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 
    //                 text-white rounded-lg px-6 py-4 min-w-[300px] max-w-[500px]">
    //   <div className="text-center mb-2">
    //     Week {selectedWeek}: {formatWeekDate(selectedWeek)}
    //   </div>
    //   <div className="progress-bar mb-4">
    //     <input 
    //       type="range" 
    //       min="1" 
    //       max="52" 
    //       value={selectedWeek}
    //       onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
    //       className="w-full h-2 rounded-lg appearance-none cursor-pointer 
    //                  bg-gray-700 accent-white"
    //     />
    //   </div>
    //   <div className="controls flex justify-center gap-8">
    //     <button 
    //       className="control-button text-2xl hover:text-gray-300 transition-colors"
    //       onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
    //     >
    //       ⏮️
    //     </button>
    //     <button 
    //       className="play-pause-button text-2xl hover:text-gray-300 transition-colors" 
    //       onClick={() => setIsPlaying(!isPlaying)}
    //     >
    //       {isPlaying ? "⏸️" : "▶️"}
    //     </button>
    //     <button 
    //       className="control-button text-2xl hover:text-gray-300 transition-colors"
    //       onClick={() => setSelectedWeek(prev => Math.min(52, prev + 1))}
    //     >
    //       ⏭️
    //     </button>
    //   </div>
    // </div>
    <div className="music-player">
    <div className="progress-bar">
    <div className="text-center mb-2">
         Week {selectedWeek}: {formatWeekDate(selectedWeek)}
       </div>
      <input type="range" min="1"  max="52"  value={selectedWeek}  onChange={(e) => setSelectedWeek(parseInt(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-white" />
    </div>
    <div className="controls">
      <button className="control-button"  onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}>⏮️</button>
      <button className="play-pause-button"  onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? "⏸️" : "▶️"}
      </button>
      <button className="control-button"  onClick={() => setSelectedWeek(prev => Math.min(52, prev + 1))}>⏭️</button>
    </div>
  </div>
  );
};

// Create detailed vessel
// Enhanced vessel creation with more detailed geometry
// const createDetailedVessel = (scene, vessel, position) => {
//   const meshes = [];
  
//   // Create curved hull path
//   const hullPath = [
//     new BABYLON.Vector3(-vessel.width/2, 0, -vessel.length * 0.45),
//     new BABYLON.Vector3(vessel.width/2, 0, -vessel.length * 0.45),
//     new BABYLON.Vector3(vessel.width/2, vessel.height * 0.4, -vessel.length * 0.45),
//     new BABYLON.Vector3(-vessel.width/2, vessel.height * 0.4, -vessel.length * 0.45),
//     // Curved bow section
//     new BABYLON.Vector3(-vessel.width/3, 0, vessel.length * 0.45),
//     new BABYLON.Vector3(vessel.width/3, 0, vessel.length * 0.45),
//     new BABYLON.Vector3(vessel.width/3, vessel.height * 0.35, vessel.length * 0.45),
//     new BABYLON.Vector3(-vessel.width/3, vessel.height * 0.35, vessel.length * 0.45),
//   ];

//   // Create main hull
//   const hull = BABYLON.MeshBuilder.CreateRibbon("hull", {
//     pathArray: [
//       hullPath.slice(0, 4),
//       hullPath.slice(4, 8)
//     ],
//     closeArray: true
//   }, scene);
//   hull.position = position.clone();
//   meshes.push(hull);

//   // Create curved stern section
//   const sternCurve = [];
//   const sternRadius = vessel.width * 0.4;
//   for (let i = 0; i <= 180; i += 10) {
//     const angle = (i * Math.PI) / 180;
//     sternCurve.push(
//       new BABYLON.Vector3(
//         sternRadius * Math.cos(angle),
//         0,
//         sternRadius * Math.sin(angle)
//       )
//     );
//   }
  
//   const stern = BABYLON.MeshBuilder.CreateTube(
//     "stern",
//     {
//       path: sternCurve,
//       radius: vessel.height * 0.2,
//       cap: BABYLON.Mesh.CAP_ALL
//     },
//     scene
//   );
//   stern.position = new BABYLON.Vector3(
//     position.x,
//     position.y + vessel.height * 0.2,
//     position.z - vessel.length * 0.45
//   );
//   stern.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI/2);
//   meshes.push(stern);

//   // Add container blocks (yellow boxes)
//   const containerPositions = [
//     { x: 0, y: 0.45, z: -0.2, w: 0.8, h: 0.1, d: 0.1 },
//     { x: 0, y: 0.45, z: -0.1, w: 0.8, h: 0.1, d: 0.1 },
//     { x: 0, y: 0.45, z: 0, w: 0.8, h: 0.1, d: 0.1 },
//     { x: 0, y: 0.45, z: 0.1, w: 0.8, h: 0.1, d: 0.1 }
//   ];

//   const containerMaterial = new BABYLON.StandardMaterial("containerMat", scene);
//   containerMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0);

//   containerPositions.forEach(pos => {
//     const container = BABYLON.MeshBuilder.CreateBox("container", {
//       width: vessel.width * pos.w,
//       height: vessel.height * pos.h,
//       depth: vessel.length * pos.d
//     }, scene);
//     container.position = new BABYLON.Vector3(
//       position.x + vessel.width * pos.x,
//       position.y + vessel.height * pos.y,
//       position.z + vessel.length * pos.z
//     );
//     container.material = containerMaterial;
//     meshes.push(container);
//   });

//   // Add the red and blue structures
//   const createColoredStructure = (color, dimensions, pos) => {
//     const structure = BABYLON.MeshBuilder.CreateBox("structure", dimensions, scene);
//     const material = new BABYLON.StandardMaterial(`${color}Mat`, scene);
//     material.diffuseColor = color === 'red' ? 
//       new BABYLON.Color3(1, 0, 0) : 
//       new BABYLON.Color3(0, 0, 1);
//     structure.material = material;
//     structure.position = new BABYLON.Vector3(
//       position.x + vessel.width * pos.x,
//       position.y + vessel.height * pos.y,
//       position.z + vessel.length * pos.z
//     );
//     meshes.push(structure);
//   };

//   // Add red structures
//   createColoredStructure('red', {
//     width: vessel.width * 0.1,
//     height: vessel.height * 0.3,
//     depth: vessel.length * 0.05
//   }, { x: 0, y: 0.6, z: 0.2 });

//   createColoredStructure('red', {
//     width: vessel.width * 0.1,
//     height: vessel.height * 0.25,
//     depth: vessel.length * 0.05
//   }, { x: 0, y: 0.6, z: -0.1 });

//   // Add blue structures
//   createColoredStructure('blue', {
//     width: vessel.width * 0.08,
//     height: vessel.height * 0.2,
//     depth: vessel.length * 0.04
//   }, { x: 0.1, y: 0.6, z: 0.2 });

//   // Add masts and antennae
//   const createMast = (offsetX, offsetZ, height, width) => {
//     const mast = BABYLON.MeshBuilder.CreateCylinder("mast", {
//       height: height,
//       diameter: width
//     }, scene);
//     mast.position = new BABYLON.Vector3(
//       position.x + vessel.width * offsetX,
//       position.y + vessel.height * height/2,
//       position.z + vessel.length * offsetZ
//     );
//     meshes.push(mast);
//   };

//   createMast(0, 0.3, 1.2, 2);
//   createMast(0, -0.2, 0.8, 1.5);
//   createMast(0, -0.3, 0.6, 1);

//   // Create and apply main material
//   const material = new BABYLON.StandardMaterial("vesselMat", scene);
//   material.diffuseColor = vessel.color;
//   material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
//   material.specularPower = 32;

//   // Apply materials and metadata
//   [hull, stern].forEach(mesh => {
//     mesh.material = material;
//     mesh.isPickable = true;
//     mesh.metadata = { vesselId: vessel.id };
//   });

//   return {
//     meshes,
//     mainHull: hull
//   };
// };

// Main visualization component
const ShipyardVisualization = ({ selectedWeek, vessels }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const sceneRef = useRef(null);
  const meshesRef = useRef({});
  const gizmoManagerRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const originalModelRef = useRef(null);

  

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize engine and scene
    engineRef.current = new BABYLON.Engine(canvasRef.current, true);
    sceneRef.current = new BABYLON.Scene(engineRef.current);
    sceneRef.current.clearColor = new BABYLON.Color4(0.1, 0.1, 0.2, 1);


    // Camera setup
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 3,
      500,
      new BABYLON.Vector3(0, 0, 0),
      sceneRef.current
    );
    camera.attachControl(canvasRef.current, true);
    camera.upperBetaLimit = Math.PI / 2;
    camera.lowerRadiusLimit = 0;
    camera.upperRadiusLimit = 4000;

    // Lighting
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      sceneRef.current
    );
    light.intensity = 0.7;

    const directionalLight = new BABYLON.DirectionalLight(
      "directionalLight",
      new BABYLON.Vector3(-1, -2, -1),
      sceneRef.current
    );
    directionalLight.intensity = 0.5;

    gizmoManagerRef.current = new BABYLON.GizmoManager(sceneRef.current);
    gizmoManagerRef.current.positionGizmoEnabled = false;
    gizmoManagerRef.current.rotationGizmoEnabled = false;
    gizmoManagerRef.current.scaleGizmoEnabled = false;
    gizmoManagerRef.current.boundingBoxGizmoEnabled = false;
    gizmoManagerRef.current.usePointerToAttachGizmos = false;

    // Create water
      // Shadow generator
  const shadowGenerator = new BABYLON.ShadowGenerator(2048, directionalLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurScale = 2;

  // Create water plane (below everything)
  // const water = BABYLON.MeshBuilder.CreateGround(
  //   "water",
  //   { width: 4000, height: 4000 },
  //   sceneRef.current
  // );
  // const waterMaterial = new BABYLON.StandardMaterial("waterMat", sceneRef.current);
  // waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.2, 0.4);
  // waterMaterial.alpha = 0.8;
  // waterMaterial.specularPower = 128;
  // waterMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.4);
  // water.material = waterMaterial;
  // water.position.y = -10; // Lower water level

    // Create ground
    // const ground = BABYLON.MeshBuilder.CreateGround(
    //   "ground",
    //   { width: 1600, height: 1200 }, // Increased width for more docks
    //   sceneRef.current
    // );
    // const groundMaterial = new BABYLON.StandardMaterial("groundMat", sceneRef.current);
    // groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    // ground.material = groundMaterial;

     // Create areas
    //  AREA_DATA.forEach(area => {
    //   // createArea(sceneRef.current, area);
    // });

    // Create cranes
    const cranePositions = [
      { x: -250, z: -300 },
      { x: 250, z: -300 },
      { x: -250, z: 0 },
      { x: 250, z: 0 }
    ];

    // cranePositions.forEach((pos, index) => {
    //   createCrane(sceneRef.current, pos, index + 1);
    // });
   

     // Create docks
    //  AREA_DATA.forEach(dock => {
    //   createArea(sceneRef.current, dock);
    // });
     const craneBetweenPositions = [
      { x: -280, z: 0, servingDocks: [1, 2] },
      { x: -140, z: 0, servingDocks: [2, 3] },
      { x: 0, z: 0, servingDocks: [3, 4] },
      { x: 140, z: 0, servingDocks: [4, 5] },
      { x: 280, z: 0, servingDocks: [5, 6] }
    ];

    craneBetweenPositions.forEach((pos, index) => {
      createCraneBetweenDocks(
        sceneRef.current, 
        pos, 
        index + 1,
        pos.servingDocks
      );
    });

   

    craneBetweenPositions.forEach((pos, index) => {
      createCraneBetweenDocks(sceneRef.current, pos, index + 1);
    });

    // // Update camera for wider view
    // camera.setPosition(new BABYLON.Vector3(0, 600, -1000));
    // camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    // craneBetweenPositions.forEach((pos, index) => {
    //   createCraneBetweenDocks(sceneRef.current, pos, index + 1);
    // });

    // // Create and position vessels
    // vessels.forEach((vessel) => {
    //   // Find which dock this vessel is assigned to
    //   const assignedDock = AREA_DATA.find(dock => dock.vessels.includes(vessel.id));
      
    //   if (assignedDock) {
    //     // Calculate position within dock
    //     const vesselIndex = assignedDock.vessels.indexOf(vessel.id);
    //     const spacingInDock = (assignedDock.length - 100) / Math.max(assignedDock.vessels.length, 1);
        
    //     const position = new BABYLON.Vector3(
    //       assignedDock.position.x, // Dock's x position
    //       0, // Ground level
    //       assignedDock.position.z - (assignedDock.length/2) + 100 + (vesselIndex * spacingInDock) // Position along dock length
    //     );
        
    //     const vesselObject = createDetailedVessel(sceneRef.current, vessel, position);
    //     meshesRef.current[vessel.id] = vesselObject;
    //   }
    // });

    
  const initScene = async () => {
    try {
      // Load port model first
      const portModel = await loadPortModel(sceneRef.current);
      
      if (portModel) {
        shadowGenerator.addShadowCaster(portModel, true);
        portModel.receiveShadows = true;
      }

      // Load vessel model
      originalModelRef.current = await loadVesselModel(sceneRef.current);

      if (!originalModelRef.current) {
        console.error("Failed to load vessel model");
        return;
      }

      // Create docks in front of the port
      // Create docks above the port
      AREA_DATA.forEach(dock => {
        const dockMeshes = createArea(sceneRef.current, dock);
        dockMeshes.forEach(mesh => {
          shadowGenerator.addShadowCaster(mesh);
          mesh.receiveShadows = true;
          // Raise docks above port model
          mesh.position.y += 20;
        });
      });
  
      // Position vessels above docks
      for (const vessel of vessels) {
        const assignedDock = AREA_DATA.find(dock => dock.vessels.includes(vessel.id));
        
        if (assignedDock) {
          const vesselIndex = assignedDock.vessels.indexOf(vessel.id);
          const vesselSpacing = 20;
          const totalVessels = assignedDock.vessels.length;
          const availableLength = assignedDock.length - (vesselSpacing * (totalVessels - 1));
          const startZ = assignedDock.position.z - (assignedDock.length / 2) + (availableLength / totalVessels / 2);
          
          const position = new BABYLON.Vector3(
            assignedDock.position.x,
            35, // Raise vessels above docks
            startZ + (vesselIndex * (availableLength / totalVessels + vesselSpacing))
          );
          
          const vesselObject = await createDetailedVessel(
            sceneRef.current,
            vessel,
            position,
            originalModelRef.current
          );
          
          if (vesselObject) {
            vesselObject.mainHull.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
            shadowGenerator.addShadowCaster(vesselObject.mainHull);
            meshesRef.current[vessel.id] = vesselObject;
          }
        }
      }
  
      // Position cranes between docks
      craneBetweenPositions.forEach((pos, index) => {
        const craneMeshes = createCraneBetweenDocks(
          sceneRef.current, 
          {
            x: pos.x,
            y: 20, // Raise cranes to dock level
            z: pos.z
          }, 
          index + 1,
          pos.servingDocks
        );
        craneMeshes.forEach(mesh => {
          shadowGenerator.addShadowCaster(mesh);
          mesh.receiveShadows = true;
        });
      });
  
      // Adjust camera for better view of layered scene
      camera.setPosition(new BABYLON.Vector3(0, 1200, -1200));
      camera.setTarget(new BABYLON.Vector3(0, 0, 0));

    } catch (error) {
      console.error("Error during scene initialization:", error);
    }
  };
  
    initScene();

    // Render loop
    engineRef.current.runRenderLoop(() => {
      sceneRef.current.render();
    });

     // Add pointer event handling
    // Update pointer event handling to show alert for crane clicks
    sceneRef.current.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
        const pickResult = sceneRef.current.pick(
          sceneRef.current.pointerX,
          sceneRef.current.pointerY,
          mesh => mesh.isPickable
        );

        if (pickResult.hit && pickResult.pickedMesh) {
          const metadata = pickResult.pickedMesh.metadata;
          
          // Show alert if it's a crane
          if (metadata?.type === 'crane') {
            alert(`Crane ${metadata.id} is used for Dock ${metadata.servingDocks[0]} and Dock ${metadata.servingDocks[1]}`);
          }

          setSelectedObject(pickResult.pickedMesh);
          gizmoManagerRef.current.attachToMesh(pickResult.pickedMesh);
          gizmoManagerRef.current.positionGizmoEnabled = true;
        } else {
          setSelectedObject(null);
          gizmoManagerRef.current.attachToMesh(null);
          gizmoManagerRef.current.positionGizmoEnabled = false;
        }
      }
    });

    // Add keyboard controls for gizmo
    const handleKeyDown = (e) => {
      if (!selectedObject) return;

      switch(e.key.toLowerCase()) {
        case 'w':
          gizmoManagerRef.current.positionGizmoEnabled = true;
          gizmoManagerRef.current.rotationGizmoEnabled = false;
          gizmoManagerRef.current.scaleGizmoEnabled = false;
          break;
        case 'e':
          gizmoManagerRef.current.positionGizmoEnabled = false;
          gizmoManagerRef.current.rotationGizmoEnabled = true;
          gizmoManagerRef.current.scaleGizmoEnabled = false;
          break;
        case 'r':
          gizmoManagerRef.current.positionGizmoEnabled = false;
          gizmoManagerRef.current.rotationGizmoEnabled = false;
          gizmoManagerRef.current.scaleGizmoEnabled = true;
          break;
        case 'escape':
          setSelectedObject(null);
          gizmoManagerRef.current.attachToMesh(null);
          gizmoManagerRef.current.positionGizmoEnabled = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Handle resize
    const handleResize = () => {
      engineRef.current.resize();
    };
    window.addEventListener('resize', handleResize);
 return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      engineRef.current.dispose();
      sceneRef.current.dispose();
    };
  }, [vessels]);

  // Update vessel visibility based on schedule
  useEffect(() => {
    vessels.forEach(vessel => {
      const vesselGroup = meshesRef.current[vessel.id];
      if (vesselGroup) {
        const isVisible = selectedWeek >= vessel.schedule[0] && selectedWeek <= vessel.schedule[1];
        vesselGroup.meshes.forEach(mesh => mesh.setEnabled(isVisible));
      }
    });
  }, [selectedWeek, vessels]);

  return (
    <>
    <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    {selectedObject && (
      <div className="fixed top-5 right-5 bg-black bg-opacity-80 text-white p-4 rounded-lg" style={{position:'absoulte', top:'30px',left:'30px'}}>
        <h3>Selected: {selectedObject.metadata?.type} {selectedObject.metadata?.id}</h3>
        <p className="text-sm text-gray-300">{selectedObject.metadata?.name}</p>
        <div className="text-sm mt-2">
          <div>W - Move</div>
          <div>E - Rotate</div>
          <div>R - Scale</div>
          <div>ESC - Deselect</div>
        </div>
      </div>
    )}
  </>  );
};

// Main scheduler component
const ShipyardScheduler = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef();
  const lastUpdateTime = useRef(0);

  useEffect(() => {
    if (isPlaying) {
      const animate = (timestamp) => {
        // Update every 500ms (half a second) for slower animation
        if (timestamp - lastUpdateTime.current >= 500) {
          setSelectedWeek(prev => {
            if (prev >= 52) {
              setIsPlaying(false);
              return 1;
            }
            return prev + 1;
          });
          lastUpdateTime.current = timestamp;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      
      // Start the animation loop
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Clean up animation when stopped
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="absolute w-full h-screen">
      <ShipyardVisualization
        selectedWeek={selectedWeek}
        vessels={VESSEL_DATA}
      />
      <WeekControls
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />
    </div>
  );
};

export default ShipyardScheduler;
