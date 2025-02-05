import React, { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

function ScheduleReg() {
    const fileInputRef = useRef(null);
    const schInputRef = useRef([]);
    const [scheduleData, setScheduleData] = useState([]);
    const [sdata, setsdata] = useState([]);
    const [viewType, setViewType] = useState('table'); // 'table' or 'excel'

    // useEffect(() => {
    //     console.log(schdata);

    // }, [schdata])

    const generateCustomID = (prefix) => {
        const uuid = uuidv4();
        const uniqueID = prefix + uuid.replace(/-/g, '').slice(0, 6);
        return uniqueID;
    };

    const formatDate = (dateStr) => {
        // Extract month and date from format "MONTH date (day)"
        const [month, rest] = dateStr.split(' ');
        const date = rest.split(' ')[0];

        // Map month names to numbers
        const monthMap = {
            'JANUARY': '01',
            'FEBRUARY': '02',
            'MARCH': '03',
            'APRIL': '04',
            'MAY': '05',
            'JUNE': '06',
            'JULY': '07',
            'AUGUST': '08',
            'SEPTEMBER': '09',
            'OCTOBER': '10',
            'NOVEMBER': '11',
            'DECEMBER': '12'
        };

        // Format as YYYY-MM-DD
        return `2025-${monthMap[month]}-${date.padStart(2, '0')}`;
    };

    const sendToDatabase = (schedule, excelId) => {
        schedule.forEach(place => {
            place.projects.forEach(project => {
                const data = {
                    excelId: excelId,
                    projId: generateCustomID('Proj'),
                    place: place.place,
                    projNo: project.code,
                    planSDate: formatDate(project.startDate),
                    planEDate: formatDate(project.endDate),
                    startDate: formatDate(project.startDate),
                    endDate: formatDate(project.endDate),
                    workDays: project.weekdays.toString()
                };
                console.log(data);
                schInputRef.current.push(data)
                // Send data to electron backend
                window.api.send('excel-data-save', data);
            });
        });
    };

    const processExcelData = (rawData, workbook) => {
        const schedule = [];
        let currentPlace = '';
        const excelId = generateCustomID('Excel'); // Generate unique ID for this Excel file

        // Get the first sheet and merged cells info
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const merges = sheet['!merges'] || [];

        // Process month headers
        const months = [];
        rawData[0].forEach((cell, index) => {
            if (cell && typeof cell === 'string' && cell.includes(',')) {
                months.push({
                    name: cell.split(',')[0],
                    startIndex: index
                });
            }
        });

        // Helper function to get month for a column index
        const getMonthForColumn = (colIndex) => {
            for (let i = months.length - 1; i >= 0; i--) {
                if (colIndex >= months[i].startIndex) {
                    return months[i].name;
                }
            }
            return months[0].name;
        };

        // Helper function to find merge range for a cell
        const findMergeRange = (rowIndex, colIndex) => {
            const merge = merges.find(m =>
                rowIndex >= m.s.r && rowIndex <= m.e.r &&
                colIndex >= m.s.c && colIndex <= m.e.c
            );
            return merge ? {
                startCol: merge.s.c,
                endCol: merge.e.c
            } : null;
        };

        // Process each row
        rawData.forEach((row, rowIndex) => {
            if (rowIndex > 2) {
                // Update current place if there's a value in first column
                if (row[0] && row[0].trim() && !row[0].startsWith(' ')) {
                    currentPlace = row[0].trim();
                }

                if (currentPlace) {
                    // Look for projects in the row
                    for (let colIndex = 1; colIndex < row.length; colIndex++) {
                        const cell = row[colIndex];
                        if (cell && typeof cell === 'string' && cell.trim()) {
                            const projectCode = cell.trim();

                            // Find merge range for this cell
                            const mergeRange = findMergeRange(rowIndex, colIndex);

                            if (mergeRange) {
                                const startMonth = getMonthForColumn(mergeRange.startCol);
                                const endMonth = getMonthForColumn(mergeRange.endCol);
                                const startDate = rawData[1][mergeRange.startCol];
                                const endDate = rawData[1][mergeRange.endCol];
                                const startDay = rawData[2][mergeRange.startCol];
                                const endDay = rawData[2][mergeRange.endCol];

                                // Calculate weekdays
                                let weekdayCount = 0;
                                for (let i = mergeRange.startCol; i <= mergeRange.endCol; i++) {
                                    const day = rawData[2][i];
                                    if (day && day !== 'S') {
                                        weekdayCount++;
                                    }
                                }

                                // Find or create place entry
                                let placeEntry = schedule.find(p => p.place === currentPlace);
                                if (!placeEntry) {
                                    placeEntry = {
                                        place: currentPlace,
                                        projects: []
                                    };
                                    schedule.push(placeEntry);
                                }

                                // Add project
                                placeEntry.projects.push({
                                    code: projectCode,
                                    startDate: `${startMonth} ${startDate} (${startDay})`,
                                    endDate: `${endMonth} ${endDate} (${endDay})`,
                                    weekdays: weekdayCount
                                });

                                // Skip to end of merge range
                                colIndex = mergeRange.endCol;
                            }
                        }
                    }
                }
            }
        });

        setsdata(schedule);
        sendToDatabase(schedule, excelId);
        console.log(schInputRef.current);
        setScheduleData(schInputRef.current)

    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, {
                type: 'array',
                cellStyles: true,
                cellNF: true,
                cellDates: true
            });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            processExcelData(parsedData, workbook);
        };

        reader.readAsArrayBuffer(file);
    };

    // Rest of your render code remains the same...
    return (
                <div className='dashboard'>
                    <div className="mb-4">
                        <label className="block mb-2">Choose Excel File</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".xls,.xlsx"
                            onChange={handleFileUpload}
                            className="border p-2 rounded"
                            style={{zIndex:'2',cursor:'pointer'}}
                        />
                    </div>
        {/* 
                    <div>
                        <label className="block mb-2 font-medium">View Type</label>
                        <select 
                                    value={viewType} 
                                    onChange={(e) => setViewType(e.target.value)}
                                    className="border p-2 rounded"
                                >
                                    <option value="table">Table View</option>
                                    <option value="excel">Excel View</option>
                                </select>
                    </div> */}

                    {sdata.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border p-2 bg-gray-100">Place</th>
                                        <th className="border p-2 bg-gray-100">Project</th>
                                        <th className="border p-2 bg-gray-100">Start Date</th>
                                        <th className="border p-2 bg-gray-100">End Date</th>
                                        <th className="border p-2 bg-gray-100">Duration (Weekdays)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sdata.map((place, placeIndex) => (
                                        place.projects.map((project, projectIndex) => (
                                            <tr key={`${placeIndex}-${projectIndex}`}>
                                                {projectIndex === 0 ? (
                                                    <td rowSpan={place.projects.length} className="border p-2">
                                                        {place.place}
                                                    </td>
                                                ) : null}
                                                <td className="border p-2">{project.code}</td>
                                                <td className="border p-2">{project.startDate}</td>
                                                <td className="border p-2">{project.endDate}</td>
                                                <td className="border p-2 text-center">{project.weekdays}</td>
                                            </tr>
                                        ))
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* {scheduleData.length>0 && <ExcelInterface scheduleData={scheduleData}/>} */}

                    {/* {scheduleData.length > 0 && viewType === 'excel' && (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <ExcelInterface scheduleData={scheduleData} />
                            </div>
                        )} */}
                </div>

        // <div className="bg-white p-4">
        //     <div className="mb-4">
        //         <label className="block mb-2 cursor-pointer" htmlFor="file-input">
        //             Choose Excel File
        //         </label>
        //         <input
        //             id="file-input"
        //             type="file"
        //             ref={fileInputRef}
        //             accept=".xls,.xlsx"
        //             onChange={handleFileUpload}
        //             className="block w-full text-sm text-gray-500
        //                 file:mr-4 file:py-2 file:px-4
        //                 file:rounded-md file:border-0
        //                 file:text-sm file:font-semibold
        //                 file:bg-blue-50 file:text-blue-700
        //                 hover:file:bg-blue-100
        //                 cursor-pointer"
        //         />
        //     </div>

        //     {sdata.length > 0 && (
        //         <div className="overflow-x-auto">
        //             <table className="w-full border-collapse">
        //                 <thead>
        //                     <tr>
        //                         <th className="border p-2 bg-gray-100">Place</th>
        //                         <th className="border p-2 bg-gray-100">Project</th>
        //                         <th className="border p-2 bg-gray-100">Start Date</th>
        //                         <th className="border p-2 bg-gray-100">End Date</th>
        //                         <th className="border p-2 bg-gray-100">Duration (Weekdays)</th>
        //                     </tr>
        //                 </thead>
        //                 <tbody>
        //                     {sdata.map((place, placeIndex) => (
        //                         place.projects.map((project, projectIndex) => (
        //                             <tr key={`${placeIndex}-${projectIndex}`}>
        //                                 {projectIndex === 0 ? (
        //                                     <td rowSpan={place.projects.length} className="border p-2">
        //                                         {place.place}
        //                                     </td>
        //                                 ) : null}
        //                                 <td className="border p-2">{project.code}</td>
        //                                 <td className="border p-2">{project.startDate}</td>
        //                                 <td className="border p-2">{project.endDate}</td>
        //                                 <td className="border p-2 text-center">{project.weekdays}</td>
        //                             </tr>
        //                         ))
        //                     ))}
        //                 </tbody>
        //             </table>
        //         </div>
        //     )}
        // </div>

    );
}
export default ScheduleReg