import React, { useState, useEffect } from 'react';

const ShipAreaVisualization = ({allShipArea}) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [scale, setScale] = useState(0.1); // Scale factor for visualization


  // Calculate maximum dimensions to set viewport scale
  useEffect(() => {
    if (allShipArea.length > 0) {
      const maxLength = Math.max(...allShipArea.map(area => parseFloat(area.length)));
      const maxWidth = Math.max(...allShipArea.map(area => parseFloat(area.width)));
      const newScale = Math.min(800 / maxLength, 600 / maxWidth);
      setScale(newScale);
    }
  }, [allShipArea]);

  const handleBoxClick = (area) => {
    setSelectedArea(area);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Ship Area Visualization</h2>
        <p className="text-sm text-gray-600">
          Total Areas: {allShipArea.length}
        </p>
      </div>

      {/* Visualization Container */}
      <div className="border rounded-lg bg-white p-4 relative" style={{ height: '600px' }}>
        <div className="absolute inset-0 overflow-auto">
          {allShipArea.map((area, index) => {
            // Parse the boxGeometry if it exists
            const geometry = area.boxGeometry ? JSON.parse(area.boxGeometry) : null;
            const length = parseFloat(area.length);
            const width = parseFloat(area.width);
            const height = parseFloat(area.height);

            // Calculate position to arrange boxes in a grid
            const rowSize = Math.ceil(Math.sqrt(allShipArea.length));
            const row = Math.floor(index / rowSize);
            const col = index % rowSize;
            const spacing = 20; // Spacing between boxes

            return (
              <div
                key={area.name || index}
                className={`absolute border-2 cursor-pointer transition-all duration-200 
                  ${selectedArea === area ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-gray-50'}
                  hover:shadow-lg hover:border-blue-300`}
                style={{
                  left: `${col * (Math.max(...allShipArea.map(a => parseFloat(a.width))) * scale + spacing)}px`,
                  top: `${row * (Math.max(...allShipArea.map(a => parseFloat(a.length))) * scale + spacing)}px`,
                  width: `${width * scale}px`,
                  height: `${length * scale}px`,
                }}
                onClick={() => handleBoxClick(area)}
              >
                <div className="absolute inset-0 p-2">
                  <div className="text-xs font-medium truncate">{area.name}</div>
                  <div className="text-xs text-gray-500">
                    {length}m × {width}m × {height}m
                  </div>
                </div>

                {/* Depth indicator */}
                <div 
                  className="absolute right-0 bottom-0 w-2 bg-gray-300"
                  style={{
                    height: `${(height / Math.max(...allShipArea.map(a => parseFloat(a.height)))) * 100}%`
                  }}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Ruler guides */}
        <div className="absolute left-0 top-0 w-full h-8 border-b border-gray-200 flex">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-gray-200 text-xs text-gray-400 text-center">
              {i * 10}m
            </div>
          ))}
        </div>
      </div>

      {/* Selected Area Details */}
      {selectedArea && (
        <div className="mt-4 p-4 border rounded-lg bg-white">
          <h3 className="font-medium mb-2">{selectedArea.name} Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Dimensions</p>
              <p>Length: {selectedArea.length}m</p>
              <p>Width: {selectedArea.width}m</p>
              <p>Height: {selectedArea.height}m</p>
            </div>
            {selectedArea.boxGeometry && (
              <div>
                <p className="text-gray-600">Calculations</p>
                <p>Volume: {JSON.parse(selectedArea.boxGeometry).volume.toFixed(2)}m³</p>
                <p>Surface Area: {JSON.parse(selectedArea.boxGeometry).surfaceArea.toFixed(2)}m²</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipAreaVisualization;