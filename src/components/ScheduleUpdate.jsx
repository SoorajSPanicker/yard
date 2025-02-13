import React, { useEffect, useState } from 'react'

function ScheduleUpdate({ schedule, onclose, scheduleData }) {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [editedRowIndex, setEditedRowIndex] = useState(-1);
    const [editedLineData, setEditedLineData] = useState({});
    const [currentDeleteNumber, setCurrentDeleteNumber] = useState(null);
    useEffect(() => {
        console.log(schedule);

    }, [schedule])

    useEffect(() => {
        console.log(scheduleData);

    }, [scheduleData])

    const handleMouseDown = (e) => {
        if (isMinimized || isMaximized) return;
        setIsDragging(true);
        setOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || isMinimized || isMaximized) return;

        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;

        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMinimize = () => {
        setIsMinimized(true);
        setIsMaximized(false);
    };

    const handleMaximize = () => {
        setIsMaximized(!isMaximized);
        setIsMinimized(false);
    };

    const handleClose = () => {
        setIsVisible(false);
    };
    const tableHeaderStyle = {
        padding: '8px',
        textAlign: 'left',
        borderBottom: '2px solid #ddd',
        backgroundColor: '#f8f9fa',
        fontWeight: 'bold'
    };
    
    const tableCellStyle = {
        padding: '8px',
        borderBottom: '1px solid #ddd'
    };
    const handleDeleteLineFromTable = (tagNumber) => {
        setCurrentDeleteNumber(tagNumber);
        // setShowConfirm(true);
    };

    const handleEditOpen = (index) => {
        setEditedRowIndex(index);
        setEditedLineData(scheduleData[index]);
    };

    const handleCloseEdit = () => {
        setEditedRowIndex(-1);
        setEditedLineData({});
    };

    const handleSave = (tag) => {
        const updatedLineList = [...scheduleData];
        updatedLineList[editedRowIndex] = { ...editedLineData, tag: tag };

        setEditedRowIndex(-1);
        setEditedLineData({});

        window.api.send("update-schedule-table", editedLineData);
    };

    const handleChange = (field, value) => {
        setEditedLineData({
            ...editedLineData,
            [field]: value
        });
    };
    return (
        // <div
        //     className="popup"
        //     // style={{
        //     //     top: isMaximized ? 0 : position.y,
        //     //     left: isMaximized ? 0 : position.x,
        //     //     width: isMaximized ? "100vw" : isMinimized ? "200px" : "300px",
        //     //     height: isMaximized ? "100vh" : isMinimized ? "50px" : "200px",
        //     //     position: "absolute",
        //     //     cursor: isDragging ? "grabbing" : "default",
        //     //     zIndex: 3,
        //     //     color: 'black'
        //     // }}
        //     style={{
        //         top: isMaximized ? 0 : position.y,
        //         left: isMaximized ? 0 : position.x,
        //         width: isMaximized ? "100vw" : isMinimized ? "200px" : "300px",
        //         height: isMaximized ? "100vh" : isMinimized ? "50px" : "200px",
        //         position: "absolute",
        //         cursor: isDragging ? "grabbing" : "default",
        //         zIndex: 3,
        //         color: 'black',
        //         overflow: 'hidden', // Add this to prevent content overflow
        //         display: 'flex',    // Add this for better layout control
        //         flexDirection: 'column' // Add this to stack children vertically
        //     }}
        //     onMouseDown={handleMouseDown}
        //     onMouseMove={handleMouseMove}
        //     onMouseUp={handleMouseUp}
        //     onMouseLeave={handleMouseUp}
        // >
        //     <div className="popup-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        //         {/* <p>Draggable Popup</p> */}
        //         <p>Area Select</p>
        //         <div className="popup-controls">
        //             <button onClick={handleMinimize}>_</button>
        //             <button onClick={handleMaximize}>{isMaximized ? "❐" : "□"}</button>
        //             <button onClick={handleClose}>×</button>
        //         </div>
        //     </div>
        //     {!isMinimized && (
        //         <div className="popup-content">
        //             <table className='border border-black mx-5' style={{ justifyContent: 'space-around' }}>
        //                 <thead>
        //                     <tr>
        //                         <th>Place</th>
        //                         <th>Project Number</th>
        //                         <th>Start date</th>
        //                         <th>End date</th>
        //                     </tr>

        //                 </thead>
        //                 <tbody>
        //                     {scheduleData.map((row, rowIdx) => (
        //                         <tr key={rowIdx}>
        //                             <td>{row.place}</td>
        //                             <td>{row.projNo}</td>
        //                             <td>{row.startDate}</td>
        //                             <td>{row.endDatw}</td>
        //                         </tr>
        //                     ))}
        //                 </tbody>

        //             </table>
        //             {/* <p>This is a draggable popup window with minimize, maximize, and close buttons.</p>
        //             <label>Select Area:- </label>
        //             <select
        //                 value={name}
        //                 onChange={handleNameChange}
        //             >
        //                 <option value="">Select Name</option>
        //                 {allAreasInTable.map((area) => (
        //                     <option key={area.areaId} value={area.name}>
        //                         {area.name}-{area.area}
        //                     </option>
        //                 ))}
        //             </select> */}
        //         </div>
        //     )}
        //     <div style={{ display: 'flex', alignItems: 'center', padding: '20px' }}>
        //         <button type='submit' >Next</button>
        //         {/* onClick={handlematpage} */}
        //     </div>

        // </div>

        <div
            className="popup"
            style={{
                top: isMaximized ? 0 : position.y,
                left: isMaximized ? 0 : position.x,
                width: isMaximized ? "100vw" : isMinimized ? "200px" : "400px", // Increased width
                height: isMaximized ? "100vh" : isMinimized ? "50px" : "300px", // Increased height
                position: "absolute",
                cursor: isDragging ? "grabbing" : "default",
                zIndex: 3,
                color: 'black',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f0f0f0',
                borderRadius: '7px',
                boxShadow: '-1px 3px 10px 2px #111111'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className="popup-header"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: '#e0e0e0',
                    borderBottom: '1px solid #ccc',
                    flexShrink: 0
                }}>
                <p style={{ margin: 0 }}>Schedule</p>
                <div className="popup-controls">
                    <button style={{ marginLeft: '5px', padding: '2px 6px', border: '1px solid #ccc', borderRadius: '3px', background: 'white', cursor: 'pointer' }} onClick={handleMinimize}>_</button>
                    <button style={{ marginLeft: '5px', padding: '2px 6px', border: '1px solid #ccc', borderRadius: '3px', background: 'white', cursor: 'pointer' }} onClick={handleMaximize}>{isMaximized ? "❐" : "□"}</button>
                    <button style={{ marginLeft: '5px', padding: '2px 6px', border: '1px solid #ccc', borderRadius: '3px', background: 'white', cursor: 'pointer' }} onClick={handleClose}>×</button>
                </div>
            </div>
            {!isMinimized && (
                <div className="popup-content" style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '10px'
                }}>
                    <div style={{ overflow: 'auto', width: '100%' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            backgroundColor: 'white'
                        }}>
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>
                                <tr>
                                    <th style={tableHeaderStyle}>Place</th>
                                    <th style={tableHeaderStyle}>Project Number</th>
                                    <th style={tableHeaderStyle}>Start date</th>
                                    <th style={tableHeaderStyle}>End date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {scheduleData.map((row, index) => (
                                    <tr key={index}>
                                         <td>{editedRowIndex === index ? <input onChange={e => handleChange('place', e.target.value)} type="text" value={editedLineData.place || ''} /> : row.place}</td>
                                         <td>{editedRowIndex === index ? <input onChange={e => handleChange('projNo', e.target.value)} type="text" value={editedLineData.projNo || ''} /> : row.projNo}</td>
                                         <td>{editedRowIndex === index ? <input onChange={e => handleChange('startDate', e.target.value)} type="text" value={editedLineData.startDate || ''} /> : row.startDate}</td>
                                         <td>{editedRowIndex === index ? <input onChange={e => handleChange('endDate', e.target.value)} type="text" value={editedLineData.endDate || ''} /> : row.endDate}</td>
                                        {/* <td style={tableCellStyle}>{row.place}</td>
                                        <td style={tableCellStyle}>{row.projNo}</td>
                                        <td style={tableCellStyle}>{row.startDate}</td>
                                        <td style={tableCellStyle}>{row.endDate}</td> */}
                                         <td style={{ backgroundColor: '#f0f0f0' }}>
                                        {editedRowIndex === index ?
                                            <>
                                                <i className="fa-solid fa-floppy-disk text-success" onClick={() => handleSave(row.projId)}></i>
                                                <i className="fa-solid fa-xmark ms-3 text-danger" onClick={handleCloseEdit}></i>
                                            </>
                                            :
                                            <>
                                                <i className="fa-solid fa-pencil" onClick={() => handleEditOpen(index)}></i>
                                                <i className="fa-solid fa-trash-can ms-3" onClick={() => handleDeleteLineFromTable(row.projId)}></i>
                                            </>
                                        }
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderTop: '1px solid #ccc',
                backgroundColor: '#f0f0f0',
                flexShrink: 0
            }}>
                {/* <button
                    type='submit'
                    style={{
                        padding: '5px 15px',
                        borderRadius: '3px',
                        border: '1px solid #ccc',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        width: '100%'
                    }}
                >
                    Next
                </button> */}
            </div>
        </div>
    )
}

export default ScheduleUpdate