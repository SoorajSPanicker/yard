import React from 'react'

//  DateSliderControl() {

function DateSliderControl({ startDate, endDate, currentDate, setCurrentDate, isPlaying, setIsPlaying }) {
    return (
        <div className="slider-container p-4 bg-gray-100 mb-4">
            <div className="flex gap-4 items-center mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date:</label>
                    <input
                        type="date"
                        value={startDate.toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        className="mt-1 block rounded-md border-gray-300 shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">End Date:</label>
                    <input
                        type="date"
                        value={endDate.toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                        className="mt-1 block rounded-md border-gray-300 shadow-sm"
                    />
                </div>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    {isPlaying ? '⏸️' : '▶️'}
                </button>
            </div>
            <input
                type="range"
                min={startDate.getTime()}
                max={endDate.getTime()}
                value={currentDate.getTime()}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-2">
                Current Date: {currentDate.toLocaleDateString()}
            </div>
        </div>
    );
};


export default DateSliderControl