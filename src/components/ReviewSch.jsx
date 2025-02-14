// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';


// function ReviewSch({ scheduleData }) {
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false)
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });
//     const tableContainerRef = useRef(null);
//     const [startDate, setStartDate] = useState(new Date(2025, 0, 1));
//     const [endDate, setEndDate] = useState(new Date(2025, 11, 31));
//     const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));
//     const [isPlaying, setIsPlaying] = useState(false);
//     const animationRef = useRef(null);

//     // Add useEffect for animation
//     useEffect(() => {
//         if (isPlaying) {
//             const animate = () => {
//                 setCurrentDate(prevDate => {
//                     const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000); // Add one day
//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return startDate;
//                     }
//                     return newDate;
//                 });
//                 animationRef.current = requestAnimationFrame(animate);
//             };
//             animationRef.current = requestAnimationFrame(animate);
//         } else {
//             if (animationRef.current) {
//                 cancelAnimationFrame(animationRef.current);
//             }
//         }

//         return () => {
//             if (animationRef.current) {
//                 cancelAnimationFrame(animationRef.current);
//             }
//         };
//     }, [isPlaying, startDate, endDate]);


//     useEffect(() => {
//         const scrollToCurrentDate = () => {
//             if (!tableContainerRef.current || dates.length === 0) return;

//             // Get today's date (only date part)
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             // Find the index of today's date in our dates array
//             const currentDateIndex = dates.findIndex(date =>
//                 date.getTime() === today.getTime()
//             );

//             if (currentDateIndex !== -1) {
//                 // Calculate scroll position:
//                 // Each cell is approximately 32px wide (w-8 class)
//                 const cellWidth = 32;
//                 const scrollPosition = (currentDateIndex * cellWidth);

//                 // Get container width
//                 const containerWidth = tableContainerRef.current.offsetWidth;

//                 // Center the column by subtracting half the container width
//                 const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//                 // Scroll to position
//                 tableContainerRef.current.scrollLeft = centeredScrollPosition;
//             }
//         };

//         // Call the function after a short delay to ensure rendering is complete
//         setTimeout(scrollToCurrentDate, 100);
//     }, [dates]);

//     // Add useEffect for scrolling to current date
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date =>
//             date.getTime() === currentDate.setHours(0, 0, 0, 0)
//         );

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     useEffect(() => {
//         // Generate dates from 2025 to 2030
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         // Create month ranges with year
//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             // Group the flat data by place
//             const groupedByPlace = _.groupBy(scheduleData, 'place');

//             // Transform into required format
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj, // Keep all original data
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             // Create place groups with rowspan information
//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             // Flatten data for grid
//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             // Find the original schedule data for this project
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true)
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = (() => {
//         setupdatepage(true)
//     })

//     const isToday = (date) => {
//         return date.getDate() === 6 &&
//             date.getMonth() === 1 && // February (0-based month)
//             date.getFullYear() === 2025;
//     };

//     return (
//         // <div className='dashboard' >
//         //     <div className="overflow-x-auto" style={{ maxWidth: "100vw", overflowX: "auto", whiteSpace: "nowrap" }}>
//         // <div className='dashboard'>
//         //     <div
//         //         ref={tableContainerRef}
//         //         className="overflow-x-auto"
//         //         style={{ maxWidth: "100vw", overflowX: "auto", whiteSpace: "nowrap" }}
//         //     >
//         <div className='dashboard'>
//             {/* <DateSliderControl
//                 startDate={startDate}
//                 endDate={endDate}
//                 currentDate={currentDate}
//                 setCurrentDate={setCurrentDate}
//                 isPlaying={isPlaying}
//                 setIsPlaying={setIsPlaying}
//             /> */}
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={(e) => setStartDate(new Date(e.target.value))}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={(e) => setEndDate(new Date(e.target.value))}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <button
//                         onClick={() => setIsPlaying(!isPlaying)}
//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto relative"
//                 style={{ maxWidth: "100vw", overflowX: "auto", whiteSpace: "nowrap" }}
//             >
//                 <div
//                     className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
//                     style={{
//                         left: `${dates.findIndex(date =>
//                             date.getTime() === currentDate.setHours(0, 0, 0, 0)
//                         ) * 32}px`,
//                         transform: 'translateX(-50%)'
//                     }}
//                 />
//                 {/* Rest of your table code */}
//                 <table className="border-collapse" style={{ width: "2500px" }}>
//                     {/* <table className="border-collapse" style={{ width: "2500px" }}> */}
//                     <thead>
//                         <tr>
//                             <th className="border p-2 bg-gray-50 text-left">
//                                 {getCurrentDate()}
//                                 <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={() => handleEditOpen(gridData)}></i>
//                             </th>
//                             {monthRanges.map((month, idx) => (
//                                 <th
//                                     key={idx}
//                                     colSpan={month.colSpan}
//                                     className="border p-2 bg-orange-100 text-center font-bold"
//                                 >
//                                     {month.month}
//                                 </th>
//                             ))}

//                             {/* <th><i className="fa-solid fa-pencil" onClick={() => handleEditOpen(gridData)}></i></th> */}
//                         </tr>
//                         {/* onClick={() => handleEditOpen(index)} */}
//                         <tr>
//                             <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//                                 PLACE
//                             </th>
//                             {/* {dates.map((date, idx) => (
//                                 <th key={idx} className="border p-2 bg-gray-50 text-center w-8 font-bold">
//                                     {date.getDate()}
//                                 </th>
//                             ))} */}
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center w-8 font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : ''
//                                     }}
//                                 >
//                                     {date.getDate()}
//                                 </th>
//                             ))}

//                         </tr>

//                         <tr>
//                             {/* {dates.map((date, idx) => (
//                                 <th key={idx} className="border p-2 bg-gray-50 text-center font-bold">
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))} */}
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : ''
//                                     }}
//                                 >
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {gridData.map((row, rowIdx) => (
//                             <tr key={rowIdx}>
//                                 {row.isFirstInGroup && (
//                                     <td
//                                         rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                         className="border p-2 font-medium bg-white"
//                                     >
//                                         {row.place}
//                                     </td>
//                                 )}
//                                 {dates.map((date, colIdx) => {
//                                     const inProject = isDateInProject(row, date);
//                                     const isStart = isProjectStartDate(row, date);
//                                     return (
//                                         <td
//                                             key={colIdx}
//                                             className="border p-2 text-center cursor-pointer"
//                                             style={{
//                                                 backgroundColor: inProject ? '#DBEAFE' : ''
//                                             }}
//                                             onClick={() => handleCellClick(row, date)}
//                                         >
//                                             {isStart ? row.projNo : ''}
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}

//         </div>

//         // <div className="w-full bg-white">
//         //     {/* Container with fixed height and scrollbars */}
//         //     <div className="relative">
//         //         {/* Fixed header that doesn't scroll horizontally */}
//         //         <div className="sticky top-0 z-10 bg-white">
//         //             <div className="border-b font-semibold p-2">
//         //                 {getCurrentDate()}
//         //             </div>
//         //         </div>

//         //         {/* Scrollable container */}
//         //         <div className="overflow-auto max-h-[calc(100vh-120px)]"
//         //             style={{
//         //                 overflowX: 'scroll',
//         //                 overflowY: 'scroll',
//         //                 maxWidth: '100%'
//         //             }}>
//         //             <table className="border-collapse min-w-[2500px]">
//         //                 <thead className="sticky top-0 z-10 bg-white">
//         //                     <tr>
//         //                         <th className="sticky left-0 z-20 border p-2 bg-gray-50 text-left">
//         //                             PLACE
//         //                         </th>
//         //                         {monthRanges.map((month, idx) => (
//         //                             <th
//         //                                 key={idx}
//         //                                 colSpan={month.colSpan}
//         //                                 className="border p-2 bg-orange-100 text-center font-bold whitespace-nowrap"
//         //                             >
//         //                                 {month.month}
//         //                             </th>
//         //                         ))}
//         //                     </tr>
//         //                     <tr>
//         //                         <th className="sticky left-0 z-20 border p-2 bg-gray-50"></th>
//         //                         {dates.map((date, idx) => (
//         //                             <th key={idx} className="border p-2 bg-gray-50 text-center w-8 font-bold">
//         //                                 {date.getDate()}
//         //                             </th>
//         //                         ))}
//         //                     </tr>
//         //                     <tr>
//         //                         <th className="sticky left-0 z-20 border p-2 bg-gray-50"></th>
//         //                         {dates.map((date, idx) => (
//         //                             <th key={idx} className="border p-2 bg-gray-50 text-center font-bold">
//         //                                 {date.toLocaleString('default', { weekday: 'short' })[0]}
//         //                             </th>
//         //                         ))}
//         //                     </tr>
//         //                 </thead>

//         //                 <tbody>
//         //                     {gridData.map((row, rowIdx) => (
//         //                         <tr key={rowIdx}>
//         //                             {row.isFirstInGroup && (
//         //                                 <td
//         //                                     rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//         //                                     className="sticky left-0 z-10 border p-2 font-medium bg-white whitespace-nowrap"
//         //                                 >
//         //                                     {row.place}
//         //                                 </td>
//         //                             )}
//         //                             {dates.map((date, colIdx) => {
//         //                                 const inProject = isDateInProject(row, date);
//         //                                 const isStart = isProjectStartDate(row, date);
//         //                                 return (
//         //                                     <td
//         //                                         key={colIdx}
//         //                                         className="border p-2 text-center cursor-pointer"
//         //                                         style={{
//         //                                             backgroundColor: inProject ? '#DBEAFE' : '',
//         //                                             minWidth: '30px'
//         //                                         }}
//         //                                         onClick={() => handleCellClick(row, date)}
//         //                                     >
//         //                                         {isStart ? row.projNo : ''}
//         //                                     </td>
//         //                                 );
//         //                             })}
//         //                         </tr>
//         //                     ))}
//         //                 </tbody>
//         //             </table>
//         //         </div>
//         //     </div>
//         // </div>
//     )
// }

// export default ReviewSch












// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';


// function ReviewSch({ scheduleData }) {
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false)
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });
//     const tableContainerRef = useRef(null);

//     useEffect(() => {
//         // Generate dates from 2025 to 2030
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         // Create month ranges with year
//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             // Group the flat data by place
//             const groupedByPlace = _.groupBy(scheduleData, 'place');

//             // Transform into required format
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj, // Keep all original data
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             // Create place groups with rowspan information
//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             // Flatten data for grid
//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);
//     useEffect(() => {
//         const scrollToCurrentDate = () => {
//             if (!tableContainerRef.current || dates.length === 0) return;

//             // Get today's date (only date part)
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             // Find the index of today's date in our dates array
//             const currentDateIndex = dates.findIndex(date =>
//                 date.getTime() === today.getTime()
//             );

//             if (currentDateIndex !== -1) {
//                 // Calculate scroll position:
//                 // Each cell is approximately 32px wide (w-8 class)
//                 const cellWidth = 32;
//                 const scrollPosition = (currentDateIndex * cellWidth);

//                 // Get container width
//                 const containerWidth = tableContainerRef.current.offsetWidth;

//                 // Center the column by subtracting half the container width
//                 const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//                 // Scroll to position
//                 tableContainerRef.current.scrollLeft = centeredScrollPosition;
//             }
//         };

//         // Call the function after a short delay to ensure rendering is complete
//         setTimeout(scrollToCurrentDate, 100);
//     }, [dates]);


//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             // Find the original schedule data for this project
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true)
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = (() => {
//         setupdatepage(true)
//     })

// const isToday = (date) => {
//     return date.getDate() === 6 &&
//         date.getMonth() === 1 && // February (0-based month)
//         date.getFullYear() === 2025;
// };

//     return (
//         // <div className='dashboard' >
//         //     <div className="overflow-x-auto" style={{ maxWidth: "100vw", overflowX: "auto", whiteSpace: "nowrap" }}>
//         <div className='dashboard'>
//             <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto"
//                 style={{ maxWidth: "100vw", overflowX: "auto", whiteSpace: "nowrap" }}
//             >
//                 <table className="border-collapse" style={{ width: "2500px" }}>
//                     <thead>
//                         <tr>
//                             <th className="border p-2 bg-gray-50 text-left">
//                                 {getCurrentDate()}
//                                 <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={() => handleEditOpen(gridData)}></i>
//                             </th>
// {monthRanges.map((month, idx) => (
//     <th
//         key={idx}
//         colSpan={month.colSpan}
//         className="border p-2 bg-orange-100 text-center font-bold"
//     >
//         {month.month}
//     </th>
// ))}
//                             {/* <th><i className="fa-solid fa-pencil" onClick={() => handleEditOpen(gridData)}></i></th> */}
//                         </tr>
//                         {/* onClick={() => handleEditOpen(index)} */}
//                         <tr>
//                             <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//                                 PLACE
//                             </th>
//                             {/* {dates.map((date, idx) => (
//                                 <th key={idx} className="border p-2 bg-gray-50 text-center w-8 font-bold">
//                                     {date.getDate()}
//                                 </th>
//                             ))} */}
// {dates.map((date, idx) => (
//     <th
//         key={idx}
//         className="border p-2 bg-gray-50 text-center w-8 font-bold"
//         style={{
//             backgroundColor: isToday(date) ? '#FFA500' : ''
//         }}
//     >
//         {date.getDate()}
//     </th>
// ))}
//                         </tr>

//                         <tr>
//                             {/* {dates.map((date, idx) => (
//                                 <th key={idx} className="border p-2 bg-gray-50 text-center font-bold">
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))} */}
// {dates.map((date, idx) => (
//     <th
//         key={idx}
//         className="border p-2 bg-gray-50 text-center font-bold"
//         style={{
//             backgroundColor: isToday(date) ? '#FFA500' : ''
//         }}
//     >
//         {date.toLocaleString('default', { weekday: 'short' })[0]}
//     </th>
// ))}
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {gridData.map((row, rowIdx) => (
//                             <tr key={rowIdx}>
//                                 {row.isFirstInGroup && (
//                                     <td
//                                         rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                         className="border p-2 font-medium bg-white"
//                                     >
//                                         {row.place}
//                                     </td>
//                                 )}
//                                 {dates.map((date, colIdx) => {
//                                     const inProject = isDateInProject(row, date);
//                                     const isStart = isProjectStartDate(row, date);
//                                     return (
//                                         <td
//                                             key={colIdx}
//                                             className="border p-2 text-center cursor-pointer"
//                                             style={{
//                                                 backgroundColor: inProject ? '#DBEAFE' : ''
//                                             }}
//                                             onClick={() => handleCellClick(row, date)}
//                                         >
//                                             {isStart ? row.projNo : ''}
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}
//         </div>

//     )
// }

// export default ReviewSch




// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';


// function ReviewSch({ scheduleData }) {
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false)
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });
//     const tableContainerRef = useRef(null);
//     const today = new Date();
//     const [startDate, setStartDate] = useState(today);
//     const [endDate, setEndDate] = useState(new Date(2025, 11, 31));
//     const [currentDate, setCurrentDate] = useState(today);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const animationRef = useRef(null);

//     const handleStartDateChange = (e) => {
//         console.log(e.target.value);
//         const newStartDate = new Date(e.target.value);
//         console.log(`newStartDate ${newStartDate}`);
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate); // Set current date to new start date
//     };

//     const getVerticalLineStyle = () => {
//         if (!dates.length) return {};

//         const currentDateIndex = dates.findIndex(date =>
//             date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//         );

//         if (currentDateIndex === -1) return {};

//         return {
//             left: `${(currentDateIndex + 1) * 32}px`, // +1 to account for the PLACE column
//             height: '100%',
//             position: 'absolute',
//             top: 0,
//             backgroundColor: 'red',
//             width: '2px',
//             pointerEvents: 'none',
//             zIndex: 1000
//         };
//     };

//     // Add useEffect for animation
//     useEffect(() => {
//         if (isPlaying) {
//             const animate = () => {
//                 setCurrentDate(prevDate => {
//                     const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return startDate; // Reset to start date when animation completes
//                     }
//                     return newDate;
//                 });
//                 animationRef.current = requestAnimationFrame(animate);
//             };
//             animationRef.current = requestAnimationFrame(animate);
//         } else {
//             if (animationRef.current) {
//                 cancelAnimationFrame(animationRef.current);
//             }
//         }

//         return () => {
//             if (animationRef.current) {
//                 cancelAnimationFrame(animationRef.current);
//             }
//         };
//     }, [isPlaying, startDate, endDate]);




//     useEffect(() => {
//         const scrollToCurrentDate = () => {
//             if (!tableContainerRef.current || dates.length === 0) return;

//             // Get today's date (only date part)
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             // Find the index of today's date in our dates array
//             const currentDateIndex = dates.findIndex(date =>
//                 date.getTime() === today.getTime()
//             );

//             if (currentDateIndex !== -1) {
//                 // Calculate scroll position:
//                 // Each cell is approximately 32px wide (w-8 class)
//                 const cellWidth = 32;
//                 const scrollPosition = (currentDateIndex * cellWidth);

//                 // Get container width
//                 const containerWidth = tableContainerRef.current.offsetWidth;

//                 // Center the column by subtracting half the container width
//                 const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//                 // Scroll to position
//                 tableContainerRef.current.scrollLeft = centeredScrollPosition;
//             }
//         };

//         // Call the function after a short delay to ensure rendering is complete
//         setTimeout(scrollToCurrentDate, 100);
//     }, [dates]);

//     // Add useEffect for scrolling to current date
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date =>
//             date.getTime() === currentDate.setHours(0, 0, 0, 0)
//         );

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     useEffect(() => {
//         // Generate dates from 2025 to 2030
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         // Create month ranges with year
//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             // Group the flat data by place
//             const groupedByPlace = _.groupBy(scheduleData, 'place');

//             // Transform into required format
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj, // Keep all original data
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             // Create place groups with rowspan information
//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             // Flatten data for grid
//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             // Find the original schedule data for this project
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true)
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = (() => {
//         setupdatepage(true)
//     })

//     const isToday = (date) => {
//         return date.getDate() === 6 &&
//             date.getMonth() === 1 && // February (0-based month)
//             date.getFullYear() === 2025;
//     };

//     return (
//         <div className='dashboard'>
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={handleStartDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={(e) => setEndDate(new Date(e.target.value))}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <button
//                         onClick={() => setIsPlaying(!isPlaying)}
//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto relative"
//                 style={{ maxWidth: "100vw", overflowX: "auto", whiteSpace: "nowrap" }}
//             >
//                 <div style={getVerticalLineStyle()} />
//                 {/* Rest of your table code */}
//                 <table className="border-collapse" style={{ width: "2500px" }}>
//                     {/* <table className="border-collapse" style={{ width: "2500px" }}> */}
//                     <thead>
//                         <tr>
//                             <th className="border p-2 bg-gray-50 text-left">
//                                 {getCurrentDate()}
//                                 <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={() => handleEditOpen(gridData)}></i>
//                             </th>
//                             {monthRanges.map((month, idx) => (
//                                 <th
//                                     key={idx}
//                                     colSpan={month.colSpan}
//                                     className="border p-2 bg-orange-100 text-center font-bold"
//                                 >
//                                     {month.month}
//                                 </th>
//                             ))}

//                             {/* <th><i className="fa-solid fa-pencil" onClick={() => handleEditOpen(gridData)}></i></th> */}
//                         </tr>
//                         {/* onClick={() => handleEditOpen(index)} */}
//                         <tr>
//                             <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//                                 PLACE
//                             </th>
//                             {/* {dates.map((date, idx) => (
//                                 <th key={idx} className="border p-2 bg-gray-50 text-center w-8 font-bold">
//                                     {date.getDate()}
//                                 </th>
//                             ))} */}
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center w-8 font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : ''
//                                     }}
//                                 >
//                                     {date.getDate()}
//                                 </th>
//                             ))}

//                         </tr>

//                         <tr>
//                             {/* {dates.map((date, idx) => (
//                                 <th key={idx} className="border p-2 bg-gray-50 text-center font-bold">
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))} */}
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : ''
//                                     }}
//                                 >
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {gridData.map((row, rowIdx) => (
//                             <tr key={rowIdx}>
//                                 {row.isFirstInGroup && (
//                                     <td
//                                         rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                         className="border p-2 font-medium bg-white"
//                                     >
//                                         {row.place}
//                                     </td>
//                                 )}
//                                 {dates.map((date, colIdx) => {
//                                     const inProject = isDateInProject(row, date);
//                                     const isStart = isProjectStartDate(row, date);
//                                     return (
//                                         <td
//                                             key={colIdx}
//                                             className="border p-2 text-center cursor-pointer"
//                                             style={{
//                                                 backgroundColor: inProject ? '#DBEAFE' : ''
//                                             }}
//                                             onClick={() => handleCellClick(row, date)}
//                                         >
//                                             {isStart ? row.projNo : ''}
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}

//         </div>

//     )
// }

// export default ReviewSch


// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';

// function ReviewSch({ scheduleData }) {
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false);
//     const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });

//     const tableContainerRef = useRef(null);
//     const today = new Date();
//     const [startDate, setStartDate] = useState(today);
//     const [endDate, setEndDate] = useState(new Date(2025, 11, 31));
//     const [currentDate, setCurrentDate] = useState(today);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const animationRef = useRef(null);

//     // Initial data loading effect
//     useEffect(() => {
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             const groupedByPlace = _.groupBy(scheduleData, 'place');
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj,
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     // Initial scroll effect - only runs once
//     useEffect(() => {
//         if (!hasInitiallyScrolled && tableContainerRef.current && dates.length > 0) {
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             const currentDateIndex = dates.findIndex(date =>
//                 date.getTime() === today.getTime()
//             );

//             if (currentDateIndex !== -1) {
//                 const cellWidth = 32;
//                 const scrollPosition = (currentDateIndex * cellWidth);
//                 const containerWidth = tableContainerRef.current.offsetWidth;
//                 const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//                 tableContainerRef.current.scrollLeft = centeredScrollPosition;
//                 setHasInitiallyScrolled(true);
//             }
//         }
//     }, [dates, hasInitiallyScrolled]);

//     // Animation effect
//     useEffect(() => {
//         if (isPlaying) {
//             const animate = () => {
//                 setCurrentDate(prevDate => {
//                     const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return prevDate;
//                     }
//                     return newDate;
//                 });

//                 setTimeout(() => {
//                     animationRef.current = requestAnimationFrame(animate);
//                 }, 100);
//             };

//             animationRef.current = requestAnimationFrame(animate);
//         }

//         return () => {
//             if (animationRef.current) {
//                 cancelAnimationFrame(animationRef.current);
//             }
//         };
//     }, [isPlaying, endDate]);

//     // Scroll to current date effect
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date =>
//             date.getTime() === currentDate.setHours(0, 0, 0, 0)
//         );

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     const getVerticalLineStyle = () => {
//         if (!dates.length) return {};

//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex === -1) return {};

//         return {
//             left: `${(currentDateIndex + 1) * 32 + 32}px`,
//             height: 'calc(100% - 120px)',
//             position: 'absolute',
//             top: '120px',
//             backgroundColor: 'red',
//             width: '2px',
//             pointerEvents: 'none',
//             zIndex: 1000
//         };
//     };

//     // const handleStartDateChange = (e) => {
//     //     const newStartDate = new Date(e.target.value);
//     //     setStartDate(newStartDate);
//     //     setCurrentDate(newStartDate);
//     //     setIsPlaying(false);
//     // };

//     const handleStartDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newStartDate = new Date(year, month - 1, day);
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate);
//         setIsPlaying(false);
//     };

//     const handleEndDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newEndDate = new Date(year, month - 1, day);
//         setEndDate(newEndDate);
//     };

//     // Modified play button handler
//     const handlePlayClick = () => {
//         if (!isPlaying) {
//             // Reset to start date when starting new animation
//             setCurrentDate(startDate);
//         }
//         setIsPlaying(!isPlaying);
//     };

//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true);
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = () => {
//         setupdatepage(true);
//     };

//     const isToday = (date) => {
//         return date.getDate() === 6 &&
//             date.getMonth() === 1 && // February (0-based month)
//             date.getFullYear() === 2025;
//     };


//     return (
//         <div className='dashboard'>
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={handleStartDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={handleEndDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <button
//                         onClick={handlePlayClick}
//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto relative"
//                 style={{
//                     maxWidth: "100vw",
//                     overflowX: "auto",
//                     whiteSpace: "nowrap",
//                     position: "relative"
//                 }}
//             >
//                 {/* Vertical line wrapper */}
//                 <div
//                     className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
//                     style={{ position: 'sticky', left: 0 }}
//                 >
//                     <div
//                         className="absolute bg-red-500"
//                         style={{
//                             left: `${dates.findIndex(date =>
//                                 date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                             ) * 32 + 100}px`,
//                             width: '2px',
//                             top: '120px', // Start after headers
//                             bottom: '0',
//                             zIndex: 50,
//                             transition: 'left 0.3s ease'
//                         }}

//                     />
//                 </div>

//                 <table className="border-collapse" style={{ width: "2500px" }}>
//                     <thead>
//                         <tr>
//                             <th className="border p-2 bg-gray-50 text-left">
//                                 {getCurrentDate()}
//                                 <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//                             </th>
//                             {monthRanges.map((month, idx) => (
//                                 <th
//                                     key={idx}
//                                     colSpan={month.colSpan}
//                                     className="border p-2 bg-orange-100 text-center font-bold"
//                                 >
//                                     {month.month}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//                                 PLACE
//                             </th>
//                             {/* {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center w-8 font-bold"
//                                 >
//                                     {date.getDate()}
//                                 </th>
//                             ))} */}
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center w-8 font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : ''
//                                     }}
//                                 >
//                                     {date.getDate()}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             {/* {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                 >
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))} */}
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : ''
//                                     }}
//                                 >
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {gridData.map((row, rowIdx) => (
//                             <tr key={rowIdx}>
//                                 {row.isFirstInGroup && (
//                                     <td
//                                         rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                         className="border p-2 font-medium bg-white"
//                                     >
//                                         {row.place}
//                                     </td>
//                                 )}
//                                 {dates.map((date, colIdx) => {
//                                     const inProject = isDateInProject(row, date);
//                                     const isStart = isProjectStartDate(row, date);
//                                     // const isCurrentDate = new Date(date).setHours(0,0,0,0) === 
//                                     // new Date(currentDate).setHours(0,0,0,0);
//                                     return (
//                                         <td
//                                             key={colIdx}
//                                             className="border p-2 text-center cursor-pointer"
//                                             style={{
//                                                 backgroundColor: inProject ? '#DBEAFE' : ''
//                                             }}
//                                             onClick={() => handleCellClick(row, date)}
//                                         >
//                                             {isStart ? row.projNo : ''}
//                                             {/* {isCurrentDate && (
//                                                     <div 
//                                                         style={{
//                                                             position: 'absolute',
//                                                             top: '-1000px',
//                                                             bottom: '-1000px',
//                                                             left: '50%',
//                                                             width: '2px',
//                                                             backgroundColor: '#FF0000',
//                                                             zIndex: 9999,
//                                                             pointerEvents: 'none'
//                                                         }}
//                                                     />
//                                                 )} */}
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}
//         </div>
//     );
// }

// export default ReviewSch;


// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';

// function ReviewSch({ scheduleData }) {
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false);
//     const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });

//     const tableContainerRef = useRef(null);
//     const today = new Date();
//     const [startDate, setStartDate] = useState(today);
//     const [endDate, setEndDate] = useState(new Date(2025, 11, 31));
//     const [currentDate, setCurrentDate] = useState(today);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const animationRef = useRef(null);

//     // Update line position on scroll
//     useEffect(() => {
//         const updateLinePosition = () => {
//             setCurrentDate(prev => new Date(prev));
//         };

//         const container = tableContainerRef.current;
//         if (container) {
//             container.addEventListener('scroll', updateLinePosition);
//             window.addEventListener('resize', updateLinePosition);
//         }

//         return () => {
//             if (container) {
//                 container.removeEventListener('scroll', updateLinePosition);
//                 window.removeEventListener('resize', updateLinePosition);
//             }
//         };
//     }, []);

//     // Initial data loading effect
//     useEffect(() => {
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             const groupedByPlace = _.groupBy(scheduleData, 'place');
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj,
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     // Initial scroll effect
//     useEffect(() => {
//         if (!hasInitiallyScrolled && tableContainerRef.current && dates.length > 0) {
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             const currentDateIndex = dates.findIndex(date =>
//                 date.getTime() === today.getTime()
//             );

//             if (currentDateIndex !== -1) {
//                 const cellWidth = 32;
//                 const scrollPosition = (currentDateIndex * cellWidth);
//                 const containerWidth = tableContainerRef.current.offsetWidth;
//                 const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//                 tableContainerRef.current.scrollLeft = centeredScrollPosition;
//                 setHasInitiallyScrolled(true);
//             }
//         }
//     }, [dates, hasInitiallyScrolled]);

//     // Animation effect
//     useEffect(() => {
//         if (isPlaying) {
//             const animate = () => {
//                 setCurrentDate(prevDate => {
//                     const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return prevDate;
//                     }
//                     return newDate;
//                 });

//                 setTimeout(() => {
//                     animationRef.current = requestAnimationFrame(animate);
//                 }, 100);
//             };

//             animationRef.current = requestAnimationFrame(animate);
//         }

//         return () => {
//             if (animationRef.current) {
//                 cancelAnimationFrame(animationRef.current);
//             }
//         };
//     }, [isPlaying, endDate]);

//     // Scroll to current date effect
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date =>
//             date.getTime() === currentDate.setHours(0, 0, 0, 0)
//         );

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     const handleStartDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newStartDate = new Date(year, month - 1, day);
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate);
//         setIsPlaying(false);
//     };

//     const handleEndDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newEndDate = new Date(year, month - 1, day);
//         setEndDate(newEndDate);
//     };

//     const handlePlayClick = () => {
//         if (!isPlaying) {
//             setCurrentDate(startDate);
//         }
//         setIsPlaying(!isPlaying);
//     };

//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true);
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = () => {
//         setupdatepage(true);
//     };

//     return (
//         <div className='dashboard'>
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={handleStartDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={handleEndDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <button
//                         onClick={handlePlayClick}
//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto"
//                 style={{ 
//                     maxWidth: "100vw", 
//                     overflowX: "auto", 
//                     whiteSpace: "nowrap",
//                     position: "relative"
//                 }}
//             >
//                 <div style={{ position: 'relative' }}>
//                     <table className="border-collapse" style={{ width: "2500px" }}>
//                         <thead>
//                             <tr>
//                                 <th className="border p-2 bg-gray-50 text-left">
//                                     {getCurrentDate()}
//                                     <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//                                 </th>
//                                 {monthRanges.map((month, idx) => (
//                                     <th
//                                         key={idx}
//                                         colSpan={month.colSpan}
//                                         className="border p-2 bg-orange-100 text-center font-bold"
//                                     >
//                                         {month.month}
//                                     </th>
//                                 ))}
//                             </tr>
//                             <tr>
//                                 <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//                                     PLACE
//                                 </th>
//                                 {dates.map((date, idx) => (
//                                     <th
//                                         key={idx}
//                                         className="border p-2 bg-gray-50 text-center w-8 font-bold"
//                                     >
//                                         {date.getDate()}
//                                     </th>
//                                 ))}
//                             </tr>
//                             <tr>
//                                 {dates.map((date, idx) => (
//                                     <th
//                                         key={idx}
//                                         className="border p-2 bg-gray-50 text-center font-bold"
//                                     >
//                                         {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {gridData.map((row, rowIdx) => (
//                                 <tr key={rowIdx}>
//                                     {row.isFirstInGroup && (
//                                         <td
//                                             rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                             className="border p-2 font-medium bg-white"
//                                         >
//                                             {row.place}
//                                         </td>
//                                     )}
//                                     {dates.map((date, colIdx) => {
//                                         const inProject = isDateInProject(row, date);
//                                         const isStart = isProjectStartDate(row, date);
//                                         const isCurrentDate = new Date(date).setHours(0,0,0,0) === 
//                                             new Date(currentDate).setHours(0,0,0,0);

//                                         return (
//                                             <td
//                                                 key={colIdx}
//                                                 className="border p-2 text-center cursor-pointer relative"
//                                                 style={{
//                                                     backgroundColor: inProject ? '#DBEAFE' : '',
//                                                     position: 'relative'
//                                                 }}
//                                                 onClick={() => handleCellClick(row, date)}
//                                             >
//                                                 {isStart ? row.projNo : ''}
//                                                 {isCurrentDate && (
//                                                     <div 
//                                                         style={{
//                                                             position: 'absolute',
//                                                             top: '-1000px',
//                                                             bottom: '-1000px',
//                                                             left: '50%',
//                                                             width: '2px',
//                                                             backgroundColor: '#FF0000',
//                                                             zIndex: 9999,
//                                                             pointerEvents: 'none'
//                                                         }}
//                                                     />
//                                                 )}
//                                             </td>
//                                         );
//                                     })}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}
//         </div>
//     );
// }

// export default ReviewSch;



// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';

// function ReviewSch({ scheduleData }) {
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false);
//     const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });

//     const tableContainerRef = useRef(null);

//     // Initialize today with proper time setting
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const [startDate, setStartDate] = useState(today);
//     const [endDate, setEndDate] = useState(new Date(2025, 11, 31));
//     const [currentDate, setCurrentDate] = useState(today);
//     const [isPlaying, setIsPlaying] = useState(false);

//     // Helper function to create dates without timezone issues
//     const createDateWithoutTimezone = (dateStr) => {
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const date = new Date(year, month - 1, day);
//         date.setHours(0, 0, 0, 0);
//         return date;
//     };

//     // Initial data loading effect
//     useEffect(() => {
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 const newDate = new Date(d);
//                 newDate.setHours(0, 0, 0, 0);
//                 allDates.push(newDate);
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         // Rest of your existing data loading code...
//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             const groupedByPlace = _.groupBy(scheduleData, 'place');
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj,
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     // Animation effect with improved play/pause handling
//     useEffect(() => {
//         let animationFrameId;
//         let timeoutId;

//         const animate = () => {
//             if (isPlaying) {
//                 setCurrentDate(prevDate => {
//                     const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return prevDate;
//                     }
//                     return newDate;
//                 });

//                 timeoutId = setTimeout(() => {
//                     animationFrameId = requestAnimationFrame(animate);
//                 }, 100);
//             }
//         };

//         if (isPlaying) {
//             animationFrameId = requestAnimationFrame(animate);
//         }

//         return () => {
//             cancelAnimationFrame(animationFrameId);
//             clearTimeout(timeoutId);
//         };
//     }, [isPlaying, endDate]);

//     // Scroll to current date effect
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     // Fixed date handling functions
//     const handleStartDateChange = (e) => {
//         const newStartDate = createDateWithoutTimezone(e.target.value);
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate);
//         setIsPlaying(false);
//     };

//     const handleEndDateChange = (e) => {
//         const newEndDate = createDateWithoutTimezone(e.target.value);
//         setEndDate(newEndDate);
//     };

//     const handlePlayClick = () => {
//         if (!isPlaying) {
//             setCurrentDate(startDate);
//         }
//         setIsPlaying(!isPlaying);
//     };

//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true);
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = () => {
//         setupdatepage(true);
//     };

//     const isToday = (date) => {
//         return date.getDate() === 6 &&
//             date.getMonth() === 1 && // February (0-based month)
//             date.getFullYear() === 2025;
//     };

// return (
//     <div className='dashboard'>
//         <div className="slider-container p-4 bg-gray-100 mb-4">
//             <div className="flex gap-4 items-center mb-4">
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                     <input
//                         type="date"
//                         value={startDate.toISOString().split('T')[0]}
//                         onChange={handleStartDateChange}
//                         className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                     />
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                     <input
//                         type="date"
//                         value={endDate.toISOString().split('T')[0]}
//                         onChange={handleEndDateChange}
//                         className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                     />
//                 </div>
//                 <button
//                     onClick={handlePlayClick}
//                     className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                 >
//                     {isPlaying ? '⏸️' : '▶️'}
//                 </button>
//             </div>
//             <input
//                 type="range"
//                 min={startDate.getTime()}
//                 max={endDate.getTime()}
//                 value={currentDate.getTime()}
//                 onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//             />
//             <div className="text-center mt-2">
//                 Current Date: {currentDate.toLocaleDateString()}
//             </div>
//         </div>
//         <div
//             ref={tableContainerRef}
//             className="overflow-x-auto relative"
//             style={{
//                 maxWidth: "100vw",
//                 overflowX: "auto",
//                 whiteSpace: "nowrap",
//                 position: "relative"
//             }}
//         >
//             <div
//                 style={{
//                     position: 'absolute',
//                     left: `${dates.findIndex(date =>
//                         date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                     ) * 32 + 100}px`,
//                     top: '120px',
//                     bottom: '0',
//                     width: '2px',
//                     backgroundColor: 'red',
//                     zIndex: 1000,
//                     pointerEvents: 'none'
//                 }}
//             />

//             <table className="border-collapse" style={{ width: "2500px" }}>
//                 <thead>
//                     <tr>
//                         <th className="border p-2 bg-gray-50 text-left">
//                             {getCurrentDate()}
//                             <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//                         </th>
//                         {monthRanges.map((month, idx) => (
//                             <th
//                                 key={idx}
//                                 colSpan={month.colSpan}
//                                 className="border p-2 bg-orange-100 text-center font-bold"
//                             >
//                                 {month.month}
//                             </th>
//                         ))}
//                     </tr>
//                     <tr>
//                         <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//                             PLACE
//                         </th>
//                         {/* {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center w-8 font-bold"
//                                 >
//                                     {date.getDate()}
//                                 </th>
//                             ))} */}
//                         {dates.map((date, idx) => (
//                             <th
//                                 key={idx}
//                                 className="border p-2 bg-gray-50 text-center w-8 font-bold"
//                                 style={{
//                                     backgroundColor: isToday(date) ? '#FFA500' : ''
//                                 }}
//                             >
//                                 {date.getDate()}
//                             </th>
//                         ))}
//                     </tr>
//                     <tr>
//                         {/* {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                 >
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))} */}
//                         {dates.map((date, idx) => (
//                             <th
//                                 key={idx}
//                                 className="border p-2 bg-gray-50 text-center font-bold"
//                                 style={{
//                                     backgroundColor: isToday(date) ? '#FFA500' : ''
//                                 }}
//                             >
//                                 {date.toLocaleString('default', { weekday: 'short' })[0]}
//                             </th>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {gridData.map((row, rowIdx) => (
//                         <tr key={rowIdx}>
//                             {row.isFirstInGroup && (
//                                 <td
//                                     rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                     className="border p-2 font-medium bg-white"
//                                 >
//                                     {row.place}
//                                 </td>
//                             )}
//                             {dates.map((date, colIdx) => {
//                                 const inProject = isDateInProject(row, date);
//                                 const isStart = isProjectStartDate(row, date);
//                                 // const isCurrentDate = new Date(date).setHours(0,0,0,0) === 
//                                 // new Date(currentDate).setHours(0,0,0,0);
//                                 return (
//                                     <td
//                                         key={colIdx}
//                                         className="border p-2 text-center cursor-pointer"
//                                         style={{
//                                             backgroundColor: inProject ? '#DBEAFE' : ''
//                                         }}
//                                         onClick={() => handleCellClick(row, date)}
//                                     >
//                                         {isStart ? row.projNo : ''}
//                                         {/* {isCurrentDate && (
//                                                     <div 
//                                                         style={{
//                                                             position: 'absolute',
//                                                             top: '-1000px',
//                                                             bottom: '-1000px',
//                                                             left: '50%',
//                                                             width: '2px',
//                                                             backgroundColor: '#FF0000',
//                                                             zIndex: 9999,
//                                                             pointerEvents: 'none'
//                                                         }}
//                                                     />
//                                                 )} */}
//                                     </td>
//                                 );
//                             })}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//         </div>
//     </div>
// );
// }

// export default ReviewSch;


// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';

// function ReviewSch({ scheduleData }) {
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false);
//     const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });

//     const tableContainerRef = useRef(null);
//     const today = new Date();
//     // Initialize with UTC dates to prevent timezone shifts
//     const [startDate, setStartDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [endDate, setEndDate] = useState(new Date(Date.UTC(2025, 11, 31)));
//     const [currentDate, setCurrentDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [isPlaying, setIsPlaying] = useState(false);

//     // Initial data loading effect
//     useEffect(() => {
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             const groupedByPlace = _.groupBy(scheduleData, 'place');
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj,
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);
//     // Initial scroll effect - only runs once
//     useEffect(() => {
//         if (!hasInitiallyScrolled && tableContainerRef.current && dates.length > 0) {
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             const currentDateIndex = dates.findIndex(date =>
//                 date.getTime() === today.getTime()
//             );

//             if (currentDateIndex !== -1) {
//                 const cellWidth = 32;
//                 const scrollPosition = (currentDateIndex * cellWidth);
//                 const containerWidth = tableContainerRef.current.offsetWidth;
//                 const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//                 tableContainerRef.current.scrollLeft = centeredScrollPosition;
//                 setHasInitiallyScrolled(true);
//             }
//         }
//     }, [dates, hasInitiallyScrolled]);

//     // Scroll to current date effect
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     // Animation effect with improved play/pause
//     useEffect(() => {
//         let animationFrameId;

//         if (isPlaying) {
//             const animate = () => {
//                 setCurrentDate(prevDate => {
//                     const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return prevDate;
//                     }
//                     return newDate;
//                 });
//                 animationFrameId = setTimeout(() => {
//                     requestAnimationFrame(animate);
//                 }, 100);
//             };
//             animate();
//         }

//         return () => {
//             if (animationFrameId) {
//                 clearTimeout(animationFrameId);
//                 cancelAnimationFrame(animationFrameId);
//             }
//         };
//     }, [isPlaying, endDate]);

//     // Date handlers with UTC
//     const handleStartDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newStartDate = new Date(Date.UTC(year, month - 1, day));
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate);
//         setIsPlaying(false);
//     };

//     const handleEndDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newEndDate = new Date(Date.UTC(year, month - 1, day));
//         setEndDate(newEndDate);
//     };

//     // Dynamic isToday function
//     const isToday = (date) => {
//         const currentDate = new Date();
//         return date.getDate() === currentDate.getDate() &&
//             date.getMonth() === currentDate.getMonth() &&
//             date.getFullYear() === currentDate.getFullYear();
//     };



//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true);
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = () => {
//         setupdatepage(true);
//     };

//     return (
//         <div className='dashboard'>
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={handleStartDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={handleEndDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <button
//                         onClick={() => setIsPlaying(!isPlaying)}

//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto relative"
//                 style={{
//                     maxWidth: "100vw",
//                     overflowX: "auto",
//                     whiteSpace: "nowrap",
//                     position: "relative"
//                 }}

//             >
//                 <div
//                     style={{
//                         position: 'absolute',
//                         left: `${dates.findIndex(date =>
//                             date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                         ) * 32 + 100}px`,
//                         top: '120px',
//                         bottom: '0',
//                         width: '2px',
//                         backgroundColor: 'red',
//                         zIndex: 1000,
//                         pointerEvents: 'none'
//                     }}
//                 />
//                 <div
//                     className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
//                     style={{ position: 'sticky', left: 0 }}
//                 >
//                     <div
//                         className="absolute bg-red-500"
//                         style={{
//                             left: `${dates.findIndex(date =>
//                                 date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                             ) * 32 + 100}px`,
//                             width: '2px',
//                             top: '120px',
//                             bottom: '0',
//                             zIndex: 50,
//                             transition: 'left 0.3s ease'
//                         }}
//                     />
//                 </div>

//                 <table className="border-collapse" style={{ width: "2500px" }}>
//                     <thead>
//                         <tr>
//                             <th className="border p-2 bg-gray-50 text-left">
//                                 {getCurrentDate()}
//                                 <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//                             </th>
//                             {monthRanges.map((month, idx) => (
//                                 <th
//                                     key={idx}
//                                     colSpan={month.colSpan}
//                                     className="border p-2 bg-orange-100 text-center font-bold"
//                                 >
//                                     {month.month}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//                                 PLACE
//                             </th>

//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center w-8 font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : ''
//                                     }}
//                                 >
//                                     {date.getDate()}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>

//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : ''
//                                     }}
//                                 >
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {gridData.map((row, rowIdx) => (
//                             <tr key={rowIdx}>
//                                 {row.isFirstInGroup && (
//                                     <td
//                                         rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                         className="border p-2 font-medium bg-white"
//                                     >
//                                         {row.place}
//                                     </td>
//                                 )}
//                                 {dates.map((date, colIdx) => {
//                                     const inProject = isDateInProject(row, date);
//                                     const isStart = isProjectStartDate(row, date);
//                                     // const isCurrentDate = new Date(date).setHours(0,0,0,0) === 
//                                     // new Date(currentDate).setHours(0,0,0,0);
//                                     return (
//                                         <td
//                                             key={colIdx}
//                                             className="border p-2 text-center cursor-pointer"
//                                             style={{
//                                                 backgroundColor: inProject ? '#DBEAFE' : ''
//                                             }}
//                                             onClick={() => handleCellClick(row, date)}
//                                         >
//                                             {isStart ? row.projNo : ''}

//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>

//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}
//         </div>
//     );
// }

// export default ReviewSch;


// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';

// function ReviewSch({ scheduleData }) {
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false);
//     const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });

//     const tableContainerRef = useRef(null);
//     const today = new Date();
//     const [startDate, setStartDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [endDate, setEndDate] = useState(new Date(Date.UTC(2025, 11, 31)));
//     const [currentDate, setCurrentDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [isPlaying, setIsPlaying] = useState(false);

//     // Initial data loading effect
//     // useEffect(() => {
//     //     const generateDates = () => {
//     //         const allDates = [];
//     //         const startDate = new Date(2025, 0, 1);
//     //         const endDate = new Date(2030, 11, 31);

//     //         for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//     //             allDates.push(new Date(d));
//     //         }
//     //         return allDates;
//     //     };

//     //     const allDates = generateDates();
//     //     setDates(allDates);

//     //     const months = _.groupBy(allDates, d =>
//     //         `${d.getFullYear()}-${d.getMonth()}`
//     //     );

//     //     const monthRangeData = Object.entries(months).map(([key, dates]) => {
//     //         const date = dates[0];
//     //         return {
//     //             month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//     //             start: dates[0],
//     //             end: dates[dates.length - 1],
//     //             colSpan: dates.length
//     //         };
//     //     });
//     //     setMonthRanges(monthRangeData);

//     //     if (scheduleData && scheduleData.length > 0) {
//     //         const groupedByPlace = _.groupBy(scheduleData, 'place');
//     //         const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//     //             place,
//     //             projects: projects.map(proj => ({
//     //                 ...proj,
//     //                 start: new Date(proj.startDate),
//     //                 end: new Date(proj.endDate)
//     //             }))
//     //         }));

//     //         const placeGroupsData = transformedData.map(({ place, projects }) => ({
//     //             place,
//     //             rowspan: projects.length,
//     //             projects
//     //         }));
//     //         setPlaceGroups(placeGroupsData);

//     //         const flattenedData = placeGroupsData.flatMap(group =>
//     //             group.projects.map(project => ({
//     //                 ...project,
//     //                 place: group.place,
//     //                 isFirstInGroup: group.projects.indexOf(project) === 0
//     //             }))
//     //         );
//     //         setGridData(flattenedData);
//     //     }
//     // }, [scheduleData]);

//     useEffect(() => {
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             const groupedByPlace = _.groupBy(scheduleData, 'place');
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj,
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     // Initial scroll effect - only runs once
//     // useEffect(() => {
//     //     if (!hasInitiallyScrolled && tableContainerRef.current && dates.length > 0) {
//     //         const today = new Date();
//     //         today.setHours(0, 0, 0, 0);

//     //         const currentDateIndex = dates.findIndex(date =>
//     //             date.getTime() === today.getTime()
//     //         );

//     //         if (currentDateIndex !== -1) {
//     //             const cellWidth = 32;
//     //             const scrollPosition = (currentDateIndex * cellWidth);
//     //             const containerWidth = tableContainerRef.current.offsetWidth;
//     //             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//     //             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//     //             setHasInitiallyScrolled(true);
//     //         }
//     //     }
//     // }, [dates, hasInitiallyScrolled]);

//     useEffect(() => {
//         if (!hasInitiallyScrolled && tableContainerRef.current && dates.length > 0) {
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             const currentDateIndex = dates.findIndex(date =>
//                 date.getTime() === today.getTime()
//             );

//             if (currentDateIndex !== -1) {
//                 const cellWidth = 32;
//                 const scrollPosition = (currentDateIndex * cellWidth);
//                 const containerWidth = tableContainerRef.current.offsetWidth;
//                 const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//                 tableContainerRef.current.scrollLeft = centeredScrollPosition;
//                 setHasInitiallyScrolled(true);
//             }
//         }
//     }, [dates, hasInitiallyScrolled]);

//     // Scroll to current date effect
//     // useEffect(() => {
//     //     if (!tableContainerRef.current || dates.length === 0) return;

//     //     const currentDateIndex = dates.findIndex(date => {
//     //         const dateTime = new Date(date).setHours(0, 0, 0, 0);
//     //         const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//     //         return dateTime === currentDateTime;
//     //     });

//     //     if (currentDateIndex !== -1) {
//     //         const cellWidth = 32;
//     //         const scrollPosition = (currentDateIndex * cellWidth);
//     //         const containerWidth = tableContainerRef.current.offsetWidth;
//     //         const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//     //         tableContainerRef.current.scrollLeft = centeredScrollPosition;
//     //     }
//     // }, [currentDate, dates]);

//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     // Animation effect with improved play/pause
//     // useEffect(() => {
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });
//     //             animationFrameId = setTimeout(() => {
//     //                 requestAnimationFrame(animate);
//     //             }, 100);
//     //         };
//     //         animate();
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             clearTimeout(animationFrameId);
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate]);

//     useEffect(() => {
//         let animationFrameId;

//         if (isPlaying) {
//             const animate = () => {
//                 setCurrentDate(prevDate => {
//                     const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return prevDate;
//                     }
//                     return newDate;
//                 });
//                 animationFrameId = setTimeout(() => {
//                     requestAnimationFrame(animate);
//                 }, 100);
//             };
//             animate();
//         }

//         return () => {
//             if (animationFrameId) {
//                 clearTimeout(animationFrameId);
//                 cancelAnimationFrame(animationFrameId);
//             }
//         };
//     }, [isPlaying, endDate]);
//     // Date handlers with UTC
//     // const handleStartDateChange = (e) => {
//     //     const dateStr = e.target.value;
//     //     const [year, month, day] = dateStr.split('-').map(Number);
//     //     const newStartDate = new Date(Date.UTC(year, month - 1, day));
//     //     setStartDate(newStartDate);
//     //     setCurrentDate(newStartDate);
//     //     setIsPlaying(false);
//     // };

//     // const handleEndDateChange = (e) => {
//     //     const dateStr = e.target.value;
//     //     const [year, month, day] = dateStr.split('-').map(Number);
//     //     const newEndDate = new Date(Date.UTC(year, month - 1, day));
//     //     setEndDate(newEndDate);
//     // };

//     const handleStartDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newStartDate = new Date(Date.UTC(year, month - 1, day));
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate);
//         setIsPlaying(false);
//     };

//     const handleEndDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newEndDate = new Date(Date.UTC(year, month - 1, day));
//         setEndDate(newEndDate);
//     };
//     // Dynamic isToday function
//     // const isToday = (date) => {
//     //     const currentDate = new Date();
//     //     return date.getDate() === currentDate.getDate() &&
//     //         date.getMonth() === currentDate.getMonth() &&
//     //         date.getFullYear() === currentDate.getFullYear();
//     // };

//     const isToday = (date) => {
//         const currentDate = new Date();
//         return date.getDate() === currentDate.getDate() &&
//             date.getMonth() === currentDate.getMonth() &&
//             date.getFullYear() === currentDate.getFullYear();
//     };



//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true);
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = () => {
//         setupdatepage(true);
//     };

//     const getVerticalLinePosition = () => {
//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex === -1) return 0;
//         return (currentDateIndex * 32) + 100;
//     };

//     const handlePlayClick = () => {
//         if (!isPlaying) {
//             // If we're at the end date, reset to start date
//             if (currentDate.getTime() >= endDate.getTime()) {
//                 setCurrentDate(startDate);
//             }
//             setIsPlaying(true);
//         } else {
//             setIsPlaying(false);
//         }
//     };

//     return (
//         // <div className='dashboard'>
//         //     <div className="slider-container p-4 bg-gray-100 mb-4">
//         //         <div className="flex gap-4 items-center mb-4">
//         //             <div>
//         //                 <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//         //                 <input
//         //                     type="date"
//         //                     value={startDate.toISOString().split('T')[0]}
//         //                     onChange={handleStartDateChange}
//         //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
//         //                 />
//         //             </div>
//         //             <div>
//         //                 <label className="block text-sm font-medium text-gray-700">End Date:</label>
//         //                 <input
//         //                     type="date"
//         //                     value={endDate.toISOString().split('T')[0]}
//         //                     onChange={handleEndDateChange}
//         //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
//         //                 />
//         //             </div>
//         //             <button
//         //                 onClick={() => setIsPlaying(!isPlaying)}

//         //                 className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//         //             >
//         //                 {isPlaying ? '⏸️' : '▶️'}
//         //             </button>
//         //         </div>
//         //         <input
//         //             type="range"
//         //             min={startDate.getTime()}
//         //             max={endDate.getTime()}
//         //             value={currentDate.getTime()}
//         //             onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//         //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//         //         />
//         //         <div className="text-center mt-2">
//         //             Current Date: {currentDate.toLocaleDateString()}
//         //         </div>
//         //     </div>
//         //     <div
//         //         ref={tableContainerRef}
//         //         className="overflow-x-auto relative"
//         //         style={{
//         //             maxWidth: "100vw",
//         //             overflowX: "auto",
//         //             whiteSpace: "nowrap",
//         //             position: "relative"
//         //         }}

//         //     >
//         //         <div
//         //             style={{
//         //                 position: 'absolute',
//         //                 left: `${dates.findIndex(date =>
//         //                     date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//         //                 ) * 32 + 100}px`,
//         //                 top: '120px',
//         //                 bottom: '0',
//         //                 width: '2px',
//         //                 backgroundColor: 'red',
//         //                 zIndex: 1000,
//         //                 pointerEvents: 'none'
//         //             }}
//         //         />
//         //         <div
//         //             className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
//         //             style={{ position: 'sticky', left: 0 }}
//         //         >
//         //             <div
//         //                 className="absolute bg-red-500"
//         //                 style={{
//         //                     left: `${dates.findIndex(date =>
//         //                         date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//         //                     ) * 32 + 100}px`,
//         //                     width: '2px',
//         //                     top: '120px',
//         //                     bottom: '0',
//         //                     zIndex: 50,
//         //                     transition: 'left 0.3s ease'
//         //                 }}
//         //             />
//         //         </div>

//         //         <table className="border-collapse" style={{ width: "2500px" }}>

//         <div className='dashboard'>
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={handleStartDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={handleEndDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <button
//                         onClick={handlePlayClick}
//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto"
//                 style={{
//                     maxWidth: "100vw",
//                     overflowX: "auto",
//                     whiteSpace: "nowrap",
//                     position: "relative"
//                 }}
//             >
//                 {/* Vertical line with fixed positioning */}
//                 <div
//                     style={{
//                         position: 'absolute',
//                         left: `${getVerticalLinePosition()}px`,
//                         top: '0',
//                         bottom: '0',
//                         width: '2px',
//                         backgroundColor: 'red',
//                         zIndex: 1000,
//                         pointerEvents: 'none',
//                         transition: 'left 0.3s ease'
//                     }}
//                 />

//                 <table className="border-collapse" style={{ width: "2500px" }}>
// <thead>
//     <tr>
//         <th className="border p-2 bg-gray-50 text-left">
//             {getCurrentDate()}
//             <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//         </th>
//         {monthRanges.map((month, idx) => (
//             <th
//                 key={idx}
//                 colSpan={month.colSpan}
//                 className="border p-2 bg-orange-100 text-center font-bold"
//             >
//                 {month.month}
//             </th>
//         ))}
//     </tr>
//     <tr>
//         <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//             PLACE
//         </th>

//         {dates.map((date, idx) => (
//             <th
//                 key={idx}
//                 className="border p-2 bg-gray-50 text-center w-8 font-bold"
//                 style={{
//                     backgroundColor: isToday(date) ? '#FFA500' : ''
//                 }}
//             >
//                 {date.getDate()}
//             </th>
//         ))}
//     </tr>
//     <tr>

//         {dates.map((date, idx) => (
//             <th
//                 key={idx}
//                 className="border p-2 bg-gray-50 text-center font-bold"
//                 style={{
//                     backgroundColor: isToday(date) ? '#FFA500' : ''
//                 }}
//             >
//                 {date.toLocaleString('default', { weekday: 'short' })[0]}
//             </th>
//         ))}
//     </tr>
// </thead>
// <tbody>
//     {gridData.map((row, rowIdx) => (
//         <tr key={rowIdx}>
//             {row.isFirstInGroup && (
//                 <td
//                     rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                     className="border p-2 font-medium bg-white"
//                 >
//                     {row.place}
//                 </td>
//             )}
//             {dates.map((date, colIdx) => {
//                 const inProject = isDateInProject(row, date);
//                 const isStart = isProjectStartDate(row, date);
//                 // const isCurrentDate = new Date(date).setHours(0,0,0,0) === 
//                 // new Date(currentDate).setHours(0,0,0,0);
//                 return (
//                     <td
//                         key={colIdx}
//                         className="border p-2 text-center cursor-pointer"
//                         style={{
//                             backgroundColor: inProject ? '#DBEAFE' : ''
//                         }}
//                         onClick={() => handleCellClick(row, date)}
//                     >
//                         {isStart ? row.projNo : ''}

//                     </td>
//                 );
//             })}
//         </tr>
//     ))}
// </tbody>
//                 </table>

//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}
//         </div>
//     );
// }

// export default ReviewSch;



// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';

// function ReviewSch({ scheduleData }) {
//     const CELL_WIDTH = "32px";
//     const PLACE_COLUMN_WIDTH = "100px";
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false);
//     const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
//     const [animationSpeed, setAnimationSpeed] = useState(100); // Default speed
//     const [zoomLevel, setZoomLevel] = useState(1); // Default zoom
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });

//     const tableContainerRef = useRef(null);
//     const today = new Date();
//     const [startDate, setStartDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [endDate, setEndDate] = useState(new Date(Date.UTC(2025, 11, 31)));
//     const [currentDate, setCurrentDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [isPlaying, setIsPlaying] = useState(false);

//     const speedOptions = [
//         { label: '0.5x', value: 200 },
//         { label: '1x', value: 100 },
//         { label: '2x', value: 50 },
//         { label: '4x', value: 1 }
//     ];

//     const handleZoomIn = () => {
//         setZoomLevel(prev => Math.min(prev + 0.1, 2));
//     };

//     const handleZoomOut = () => {
//         setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
//     };

//     // Your existing useEffect for data loading
//     useEffect(() => {
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             const groupedByPlace = _.groupBy(scheduleData, 'place');
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj,
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     // Modified animation effect with speed control
//     // useEffect(() => {
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });
//     //             animationFrameId = setTimeout(() => {
//     //                 requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };
//     //         animate();
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             clearTimeout(animationFrameId);
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // useEffect(() => {
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 // Calculate days to jump based on speed
//     //                 const daysToJump = animationSpeed <= 25 ? 2 : 1; // Jump 2 days at faster speeds
//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });
//     //             animationFrameId = setTimeout(() => {
//     //                 requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };
//     //         animate();
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             clearTimeout(animationFrameId);
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     useEffect(() => {
//         let animationFrameId;
//         let timeoutId;

//         if (isPlaying) {
//             const animate = () => {
//                 setCurrentDate(prevDate => {
//                     const daysToJump = animationSpeed <= 25 ? 8 : 1;
//                     const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return prevDate;
//                     }
//                     return newDate;
//                 });

//                 // Clear existing timeout before setting a new one
//                 if (timeoutId) {
//                     clearTimeout(timeoutId);
//                 }

//                 timeoutId = setTimeout(() => {
//                     animationFrameId = requestAnimationFrame(animate);
//                 }, animationSpeed);
//             };

//             animate();
//         }

//         return () => {
//             if (timeoutId) {
//                 clearTimeout(timeoutId);
//             }
//             if (animationFrameId) {
//                 cancelAnimationFrame(animationFrameId);
//             }
//         };
//     }, [isPlaying, endDate, animationSpeed]); // Make sure animationSpeed is in dependencies

//     // useEffect(() => {
//     //     let animationFrameId;
//     //     let timeoutId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 // Calculate days to jump based on speed setting
//     //                 let daysToJump;
//     //                 switch (animationSpeed) {
//     //                     case 1: // 64x
//     //                         daysToJump = 8;
//     //                         break;
//     //                     case 3: // 32x
//     //                         daysToJump = 6;
//     //                         break;
//     //                     case 5: // 16x
//     //                         daysToJump = 4;
//     //                         break;
//     //                     case 10: // 8x
//     //                         daysToJump = 3;
//     //                         break;
//     //                     case 25: // 4x
//     //                         daysToJump = 2;
//     //                         break;
//     //                     default:
//     //                         daysToJump = 1;
//     //                 }

//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });

//     //             if (timeoutId) {
//     //                 clearTimeout(timeoutId);
//     //             }

//     //             timeoutId = setTimeout(() => {
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };

//     //         animate();
//     //     }

//     //     return () => {
//     //         if (timeoutId) {
//     //             clearTimeout(timeoutId);
//     //         }
//     //         if (animationFrameId) {
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // Your existing useEffect for scrolling
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     // Your existing handlers
//     const handleStartDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newStartDate = new Date(Date.UTC(year, month - 1, day));
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate);
//         setIsPlaying(false);
//     };

//     const handleEndDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newEndDate = new Date(Date.UTC(year, month - 1, day));
//         setEndDate(newEndDate);
//     };

//     const handlePlayClick = () => {
//         if (!isPlaying) {
//             if (currentDate.getTime() >= endDate.getTime()) {
//                 setCurrentDate(startDate);
//             }
//             setIsPlaying(true);
//         } else {
//             setIsPlaying(false);
//         }
//     };

//     // Your other existing handlers and helper functions...
//     const isToday = (date) => {
//         const currentDate = new Date();
//         return date.getDate() === currentDate.getDate() &&
//             date.getMonth() === currentDate.getMonth() &&
//             date.getFullYear() === currentDate.getFullYear();
//     };

//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true);
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = () => {
//         setupdatepage(true);
//     };

//     return (
//         // <div className='dashboard'>
//         //     <div className="slider-container p-4 bg-gray-100 mb-4">
//         //         <div className="flex gap-4 items-center mb-4">
//         //             <div>
//         //                 <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//         //                 <input
//         //                     type="date"
//         //                     value={startDate.toISOString().split('T')[0]}
//         //                     onChange={handleStartDateChange}
//         //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
//         //                 />
//         //             </div>
//         //             <div>
//         //                 <label className="block text-sm font-medium text-gray-700">End Date:</label>
//         //                 <input
//         //                     type="date"
//         //                     value={endDate.toISOString().split('T')[0]}
//         //                     onChange={handleEndDateChange}
//         //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
//         //                 />
//         //             </div>
//         //             <div className="flex items-center gap-2">
//         //                 {speedOptions.map((option) => (
//         //                     <button
//         //                         key={option.value}
//         //                         onClick={() => setAnimationSpeed(option.value)}
//         //                         className={`px-2 py-1 rounded ${animationSpeed === option.value
//         //                                 ? 'bg-blue-500 text-white'
//         //                                 : 'bg-gray-200 hover:bg-gray-300'
//         //                             }`}
//         //                     >
//         //                         {option.label}
//         //                     </button>
//         //                 ))}
//         //             </div>
//         //             <button
//         //                 onClick={handlePlayClick}
//         //                 className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//         //             >
//         //                 {isPlaying ? '⏸️' : '▶️'}
//         //             </button>
//         //             {/* <div className="flex items-center gap-2 ml-4">
//         //                 <button
//         //                     onClick={handleZoomOut}
//         //                     className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
//         //                 >
//         //                     🔍-
//         //                 </button>
//         //                 <span className="mx-2">{Math.round(zoomLevel * 100)}%</span>
//         //                 <button
//         //                     onClick={handleZoomIn}
//         //                     className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
//         //                 >
//         //                     🔍+
//         //                 </button>
//         //             </div> */}
//         //         </div>
//         //         <input
//         //             type="range"
//         //             min={startDate.getTime()}
//         //             max={endDate.getTime()}
//         //             value={currentDate.getTime()}
//         //             onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//         //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//         //         />
//         //         <div className="text-center mt-2">
//         //             Current Date: {currentDate.toLocaleDateString()}
//         //         </div>
//         //     </div>
//         //     <div
//         //         ref={tableContainerRef}
//         //         className="overflow-x-auto"
//         //         style={{
//         //             maxWidth: "100vw",
//         //             overflowX: "auto",
//         //             whiteSpace: "nowrap",
//         //             position: "relative",
//         //             transform: `scale(${zoomLevel})`,
//         //             transformOrigin: 'top left',
//         //             transition: 'transform 0.2s ease'
//         //         }}
//         //     >
//         //         <div style={{
//         //             position: 'absolute',
//         //             left: `${dates.findIndex(date =>
//         //                 date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//         //             ) * 32 + 280}px`,
//         //             top: '0',
//         //             bottom: '0',
//         //             width: '2px',
//         //             backgroundColor: 'red',
//         //             zIndex: 1000,
//         //             pointerEvents: 'none',
//         //             transition: 'left 0.3s ease'
//         //         }} />

//         //         <table className="border-collapse" style={{ width: "2500px" }}>
//         //             <thead>
//         //                 <tr>
//         //                     <th className="border p-2 bg-gray-50 text-left">
//         //                         {getCurrentDate()}
//         //                         <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//         //                     </th>
//         //                     {monthRanges.map((month, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             colSpan={month.colSpan}
//         //                             className="border p-2 bg-orange-100 text-center font-bold"
//         //                         >
//         //                             {month.month}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //                 <tr>
//         //                     <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//         //                         PLACE
//         //                     </th>

//         //                     {dates.map((date, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             className="border p-2 bg-gray-50 text-center w-8 font-bold"
//         //                             style={{
//         //                                 backgroundColor: isToday(date) ? '#FFA500' : ''
//         //                             }}
//         //                         >
//         //                             {date.getDate()}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //                 <tr>

//         //                     {dates.map((date, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             className="border p-2 bg-gray-50 text-center font-bold"
//         //                             style={{
//         //                                 backgroundColor: isToday(date) ? '#FFA500' : ''
//         //                             }}
//         //                         >
//         //                             {date.toLocaleString('default', { weekday: 'short' })[0]}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //             </thead>
//         //             <tbody>
//         //                 {gridData.map((row, rowIdx) => (
//         //                     <tr key={rowIdx}>
//         //                         {row.isFirstInGroup && (
//         //                             <td
//         //                                 rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//         //                                 className="border p-2 font-medium bg-white"
//         //                             >
//         //                                 {row.place}
//         //                             </td>
//         //                         )}
//         //                         {dates.map((date, colIdx) => {
//         //                             const inProject = isDateInProject(row, date);
//         //                             const isStart = isProjectStartDate(row, date);
//         //                             // const isCurrentDate = new Date(date).setHours(0,0,0,0) === 
//         //                             // new Date(currentDate).setHours(0,0,0,0);
//         //                             return (
//         //                                 <td
//         //                                     key={colIdx}
//         //                                     className="border p-2 text-center cursor-pointer"
//         //                                     style={{
//         //                                         backgroundColor: inProject ? '#DBEAFE' : ''
//         //                                     }}
//         //                                     onClick={() => handleCellClick(row, date)}
//         //                                 >
//         //                                     {isStart ? row.projNo : ''}

//         //                                 </td>
//         //                             );
//         //                         })}
//         //                     </tr>
//         //                 ))}
//         //             </tbody>
//         //         </table>
//         //     </div>
//         //     {updatepage && (
//         //         <ScheduleUpdate
//         //             schedule={selectedSchedule}
//         //             onClose={() => setSelectedSchedule(null)}
//         //             scheduleData={scheduleData}
//         //         />
//         //     )}
//         // </div>

//         <div className='dashboard'>
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={handleStartDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={handleEndDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div className="flex items-center gap-2">
//                         {speedOptions.map((option) => (
//                             <button
//                                 key={option.value}
//                                 onClick={() => setAnimationSpeed(option.value)}
//                                 className={`px-2 py-1 rounded ${animationSpeed === option.value
//                                     ? 'bg-blue-500 text-white'
//                                     : 'bg-gray-200 hover:bg-gray-300'
//                                     }`}
//                             >
//                                 {option.label}
//                             </button>
//                         ))}
//                     </div>
//                     <button
//                         onClick={handlePlayClick}
//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto"
//                 style={{
//                     maxWidth: "100vw",
//                     overflowX: "auto",
//                     whiteSpace: "nowrap",
//                     position: "relative",
//                     transform: `scale(${zoomLevel})`,
//                     transformOrigin: 'top left',
//                     transition: 'transform 0.2s ease'
//                 }}
//             >
//                 <div style={{
//                     position: 'absolute',
//                     left: `${dates.findIndex(date =>
//                         date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                     ) * parseInt(CELL_WIDTH) + parseInt(PLACE_COLUMN_WIDTH)}px`,
//                     top: '0',
//                     bottom: '0',
//                     width: '2px',
//                     backgroundColor: 'red',
//                     zIndex: 1000,
//                     pointerEvents: 'none',
//                     transition: 'left 0.3s ease'
//                 }} />

//                 <table className="border-collapse" style={{ width: "2500px", tableLayout: "fixed" }}>
//                     <thead>
//                         <tr>
//                             <th
//                                 className="border p-2 bg-gray-50 text-left"
//                                 style={{
//                                     width: PLACE_COLUMN_WIDTH,
//                                     minWidth: PLACE_COLUMN_WIDTH
//                                 }}
//                             >
//                                 {getCurrentDate()}
//                                 <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//                             </th>
//                             {monthRanges.map((month, idx) => (
//                                 <th
//                                     key={idx}
//                                     colSpan={month.colSpan}
//                                     className="border p-2 bg-orange-100 text-center font-bold"
//                                     style={{
//                                         width: `${month.colSpan * parseInt(CELL_WIDTH)}px`
//                                     }}
//                                 >
//                                     {month.month}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             <th
//                                 rowSpan={2}
//                                 className="border p-2 bg-gray-50 text-center font-bold"
//                                 style={{
//                                     width: PLACE_COLUMN_WIDTH,
//                                     minWidth: PLACE_COLUMN_WIDTH
//                                 }}
//                             >
//                                 PLACE
//                             </th>
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : '',
//                                         width: CELL_WIDTH,
//                                         minWidth: CELL_WIDTH,
//                                         maxWidth: CELL_WIDTH
//                                     }}
//                                 >
//                                     {date.getDate()}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : '',
//                                         width: CELL_WIDTH,
//                                         minWidth: CELL_WIDTH,
//                                         maxWidth: CELL_WIDTH
//                                     }}
//                                 >
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {gridData.map((row, rowIdx) => (
//                             <tr key={rowIdx}>
//                                 {row.isFirstInGroup && (
//                                     <td
//                                         rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                         className="border p-2 font-medium bg-white"
//                                         style={{
//                                             width: PLACE_COLUMN_WIDTH,
//                                             minWidth: PLACE_COLUMN_WIDTH
//                                         }}
//                                     >
//                                         {row.place}
//                                     </td>
//                                 )}
//                                 {dates.map((date, colIdx) => {
//                                     const inProject = isDateInProject(row, date);
//                                     const isStart = isProjectStartDate(row, date);
//                                     return (
//                                         <td
//                                             key={colIdx}
//                                             className="border p-2 text-center cursor-pointer"
//                                             style={{
//                                                 backgroundColor: inProject ? '#DBEAFE' : '',
//                                                 width: CELL_WIDTH,
//                                                 minWidth: CELL_WIDTH,
//                                                 maxWidth: CELL_WIDTH
//                                             }}
//                                             onClick={() => handleCellClick(row, date)}
//                                         >
//                                             {isStart ? row.projNo : ''}
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}
//         </div>
//     );
// }

// export default ReviewSch;


import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import ScheduleUpdate from './ScheduleUpdate';

function ReviewSch({ scheduleData }) {
    const CELL_WIDTH = "32px";
    const PLACE_COLUMN_WIDTH = "100px";
    const [dates, setDates] = useState([]);
    const [monthRanges, setMonthRanges] = useState([]);
    const [gridData, setGridData] = useState([]);
    const [placeGroups, setPlaceGroups] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [updatepage, setupdatepage] = useState(false);
    const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(100); // Default speed
    const [zoomLevel, setZoomLevel] = useState(1); // Default zoom
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        tagNo: null
    });

    const tableContainerRef = useRef(null);
    const today = new Date();
    const [startDate, setStartDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
    const [endDate, setEndDate] = useState(new Date(Date.UTC(2025, 11, 31)));
    const [currentDate, setCurrentDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
    const [isPlaying, setIsPlaying] = useState(false);

    // const speedOptions = [
    //     { label: '0.5x', value: 200 },
    //     { label: '1x', value: 100 },
    //     { label: '2x', value: 50 },
    //     { label: '4x', value: 1 }
    // ];


    const speedOptions = [
        { label: '0.5x', value: 200, daysToJump: 1 },
        { label: '1x', value: 100, daysToJump: 3 },
        { label: '2x', value: 50, daysToJump: 8 },
        { label: '4x', value: 1, daysToJump: 15 }
    ];

    // const speedOptions = [
    //     { label: '0.5x', value: 2, daysToJump: 1 },    // 0.5 days per second
    //     { label: '1x', value: 1, daysToJump: 1 },      // 1 day per second
    //     { label: '2x', value: 1, daysToJump: 2 },      // 2 days per second
    //     { label: '4x', value: 1, daysToJump: 4 }       // 4 days per second
    // ];

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.1, 2));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    };

    // Your existing useEffect for data loading
    useEffect(() => {
        const generateDates = () => {
            const allDates = [];
            const startDate = new Date(2025, 0, 1);
            const endDate = new Date(2030, 11, 31);

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                allDates.push(new Date(d));
            }
            return allDates;
        };

        const allDates = generateDates();
        setDates(allDates);

        const months = _.groupBy(allDates, d =>
            `${d.getFullYear()}-${d.getMonth()}`
        );

        const monthRangeData = Object.entries(months).map(([key, dates]) => {
            const date = dates[0];
            return {
                month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
                start: dates[0],
                end: dates[dates.length - 1],
                colSpan: dates.length
            };
        });
        setMonthRanges(monthRangeData);

        if (scheduleData && scheduleData.length > 0) {
            const groupedByPlace = _.groupBy(scheduleData, 'place');
            const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
                place,
                projects: projects.map(proj => ({
                    ...proj,
                    start: new Date(proj.startDate),
                    end: new Date(proj.endDate)
                }))
            }));

            const placeGroupsData = transformedData.map(({ place, projects }) => ({
                place,
                rowspan: projects.length,
                projects
            }));
            setPlaceGroups(placeGroupsData);

            const flattenedData = placeGroupsData.flatMap(group =>
                group.projects.map(project => ({
                    ...project,
                    place: group.place,
                    isFirstInGroup: group.projects.indexOf(project) === 0
                }))
            );
            setGridData(flattenedData);
        }
    }, [scheduleData]);

    // Modified animation effect with speed control
    // useEffect(() => {
    //     let animationFrameId;

    //     if (isPlaying) {
    //         const animate = () => {
    //             setCurrentDate(prevDate => {
    //                 const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
    //                 if (newDate > endDate) {
    //                     setIsPlaying(false);
    //                     return prevDate;
    //                 }
    //                 return newDate;
    //             });
    //             animationFrameId = setTimeout(() => {
    //                 requestAnimationFrame(animate);
    //             }, animationSpeed);
    //         };
    //         animate();
    //     }

    //     return () => {
    //         if (animationFrameId) {
    //             clearTimeout(animationFrameId);
    //             cancelAnimationFrame(animationFrameId);
    //         }
    //     };
    // }, [isPlaying, endDate, animationSpeed]);


    // useEffect(() => {
    //     let animationFrameId;

    //     if (isPlaying) {
    //         const animate = () => {
    //             setCurrentDate(prevDate => {
    //                 // Calculate days to jump based on speed
    //                 const daysToJump = animationSpeed <= 25 ? 2 : 1; // Jump 2 days at faster speeds
    //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
    //                 if (newDate > endDate) {
    //                     setIsPlaying(false);
    //                     return prevDate;
    //                 }
    //                 return newDate;
    //             });
    //             animationFrameId = setTimeout(() => {
    //                 requestAnimationFrame(animate);
    //             }, animationSpeed);
    //         };
    //         animate();
    //     }

    //     return () => {
    //         if (animationFrameId) {
    //             clearTimeout(animationFrameId);
    //             cancelAnimationFrame(animationFrameId);
    //         }
    //     };
    // }, [isPlaying, endDate, animationSpeed]);


    // useEffect(() => {
    //     let animationFrameId;
    //     let timeoutId;

    //     if (isPlaying) {
    //         const animate = () => {
    //             setCurrentDate(prevDate => {
    //                 const daysToJump = animationSpeed <= 25 ? 8 : 1;
    //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
    //                 if (newDate > endDate) {
    //                     setIsPlaying(false);
    //                     return prevDate;
    //                 }
    //                 return newDate;
    //             });

    //             // Clear existing timeout before setting a new one
    //             if (timeoutId) {
    //                 clearTimeout(timeoutId);
    //             }

    //             timeoutId = setTimeout(() => {
    //                 animationFrameId = requestAnimationFrame(animate);
    //             }, animationSpeed);
    //         };

    //         animate();
    //     }

    //     return () => {
    //         if (timeoutId) {
    //             clearTimeout(timeoutId);
    //         }
    //         if (animationFrameId) {
    //             cancelAnimationFrame(animationFrameId);
    //         }
    //     };
    // }, [isPlaying, endDate, animationSpeed]); // Make sure animationSpeed is in dependencies

    useEffect(() => {
        console.log(animationSpeed);
        // console.log(endDate);

        let animationFrameId;
        let timeoutId;

        if (isPlaying) {
            const animate = () => {
                setCurrentDate(prevDate => {
                    const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
                    console.log(currentSpeed);
                    const daysToJump = currentSpeed ? currentSpeed.daysToJump : 1;
                    console.log(daysToJump);
                    console.log(prevDate);
                    console.log(endDate);
                    const timeToEndDate = endDate.getTime() - prevDate.getTime();
                    console.log(timeToEndDate);
                    const oneDayInMs = 24 * 60 * 60 * 1000;
                    console.log(oneDayInMs);
                    // If we're close to the end date, make sure we hit it exactly
                    if (timeToEndDate <= (daysToJump * oneDayInMs)) {
                        setIsPlaying(false);
                        return new Date(endDate);
                    }

                    const newDate = new Date(prevDate.getTime() + (oneDayInMs * daysToJump));
                    console.log(newDate);

                    // Check if we would overshoot
                    if (newDate > endDate) {
                        setIsPlaying(false);
                        return new Date(endDate);
                    }

                    return newDate;
                });

                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                timeoutId = setTimeout(() => {
                    animationFrameId = requestAnimationFrame(animate);
                }, animationSpeed);
            };

            animate();
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isPlaying, endDate, animationSpeed]);

//     useEffect(() => {
//         let animationFrameId;
//         let lastTimestamp = 0;
//         const msPerHour = 60 * 60 * 1000;

//         if (isPlaying) {
//             const animate = (timestamp) => {
//                 if (!lastTimestamp) lastTimestamp = timestamp;
//                 const deltaTime = timestamp - lastTimestamp;

//                 setCurrentDate(prevDate => {
//                     const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
//                     const hoursToJump = currentSpeed ? (currentSpeed.daysToJump * 24 * deltaTime) / 1000 : 1;
//                     const timeToEndDate = endDate.getTime() - prevDate.getTime();

//                     // If we're very close to the end date, snap to it
//                     if (timeToEndDate <= msPerHour) {
//                         setIsPlaying(false);
//                         return new Date(endDate);
//                     }

//                     const newTime = prevDate.getTime() + (hoursToJump * msPerHour);
//                     const newDate = new Date(newTime);

//                     // Check if we would overshoot
//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return new Date(endDate);
//                     }

//                     return newDate;
//                 });

//                 lastTimestamp = timestamp;
//                 animationFrameId = requestAnimationFrame(animate);
//             };

//             animationFrameId = requestAnimationFrame(animate);
//         }


// }, [isPlaying, endDate, animationSpeed]);

    // useEffect(() => {
    //     let animationFrameId;
    //     let timeoutId;

    //     if (isPlaying) {
    //         const animate = () => {
    //             setCurrentDate(prevDate => {
    //                 // Calculate days to jump based on speed setting
    //                 let daysToJump;
    //                 switch (animationSpeed) {
    //                     case 1: // 64x
    //                         daysToJump = 8;
    //                         break;
    //                     case 3: // 32x
    //                         daysToJump = 6;
    //                         break;
    //                     case 5: // 16x
    //                         daysToJump = 4;
    //                         break;
    //                     case 10: // 8x
    //                         daysToJump = 3;
    //                         break;
    //                     case 25: // 4x
    //                         daysToJump = 2;
    //                         break;
    //                     default:
    //                         daysToJump = 1;
    //                 }

    //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
    //                 if (newDate > endDate) {
    //                     setIsPlaying(false);
    //                     return prevDate;
    //                 }
    //                 return newDate;
    //             });

    //             if (timeoutId) {
    //                 clearTimeout(timeoutId);
    //             }

    //             timeoutId = setTimeout(() => {
    //                 animationFrameId = requestAnimationFrame(animate);
    //             }, animationSpeed);
    //         };

    //         animate();
    //     }

    //     return () => {
    //         if (timeoutId) {
    //             clearTimeout(timeoutId);
    //         }
    //         if (animationFrameId) {
    //             cancelAnimationFrame(animationFrameId);
    //         }
    //     };
    // }, [isPlaying, endDate, animationSpeed]);


//     const FRAME_DURATION = 1000 / 60; // ~16.67ms for 60fps

// useEffect(() => {
//     let lastFrameTime = 0;
//     let animationFrameId;

//     if (isPlaying) {
//         const animate = (currentTime) => {
//             if (!lastFrameTime) lastFrameTime = currentTime;

//             const deltaTime = currentTime - lastFrameTime;
//             lastFrameTime = currentTime;

//             setCurrentDate(prevDate => {
//                 const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
//                 const daysPerSecond = (currentSpeed ? currentSpeed.daysToJump : 1) / currentSpeed.value;
//                 const oneDayInMs = 24 * 60 * 60 * 1000;

//                 // Calculate the fraction of a day to move based on elapsed time
//                 const dayFraction = (deltaTime / 1000) * daysPerSecond;
//                 const timeIncrement = oneDayInMs * dayFraction;

//                 const timeToEndDate = endDate.getTime() - prevDate.getTime();

//                 // If we're very close to the end date, snap to it
//                 if (timeToEndDate <= timeIncrement) {
//                     setIsPlaying(false);
//                     return new Date(endDate);
//                 }

//                 const newTime = prevDate.getTime() + timeIncrement;

//                 // Check if we would overshoot
//                 if (newTime > endDate.getTime()) {
//                     setIsPlaying(false);
//                     return new Date(endDate);
//                 }

//                 return new Date(newTime);
//             });

//             animationFrameId = requestAnimationFrame(animate);
//         };

//         animationFrameId = requestAnimationFrame(animate);
//     }

//     return () => {
//         if (animationFrameId) {
//             cancelAnimationFrame(animationFrameId);
//         }
//     };
// }, [isPlaying, endDate, animationSpeed]);


    // Your existing useEffect for scrolling
    useEffect(() => {
        if (!tableContainerRef.current || dates.length === 0) return;

        const currentDateIndex = dates.findIndex(date => {
            const dateTime = new Date(date).setHours(0, 0, 0, 0);
            const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
            return dateTime === currentDateTime;
        });

        if (currentDateIndex !== -1) {
            const cellWidth = 32;
            const scrollPosition = (currentDateIndex * cellWidth);
            const containerWidth = tableContainerRef.current.offsetWidth;
            const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

            tableContainerRef.current.scrollLeft = centeredScrollPosition;
        }
    }, [currentDate, dates]);

    // Your existing handlers
    const handleStartDateChange = (e) => {
        const dateStr = e.target.value;
        const [year, month, day] = dateStr.split('-').map(Number);
        const newStartDate = new Date(Date.UTC(year, month - 1, day));
        setStartDate(newStartDate);
        setCurrentDate(newStartDate);
        setIsPlaying(false);
    };

    const handleEndDateChange = (e) => {
        const dateStr = e.target.value;
        const [year, month, day] = dateStr.split('-').map(Number);
        const newEndDate = new Date(Date.UTC(year, month - 1, day));
        setEndDate(newEndDate);
    };

    const handlePlayClick = () => {
        if (!isPlaying) {
            if (currentDate.getTime() >= endDate.getTime()) {
                setCurrentDate(startDate);
            }
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    };

    // Your other existing handlers and helper functions...
    const isToday = (date) => {
        const currentDate = new Date();
        return date.getDate() === currentDate.getDate() &&
            date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear();
    };

    const isProjectStartDate = (project, date) => {
        return date.getFullYear() === project.start.getFullYear() &&
            date.getMonth() === project.start.getMonth() &&
            date.getDate() === project.start.getDate();
    };

    const isDateInProject = (project, date) => {
        const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const normalizedDate = normalizeDate(date);
        const normalizedStart = normalizeDate(project.start);
        const normalizedEnd = normalizeDate(project.end);
        return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
    };

    const handleCellClick = (row, date) => {
        if (isDateInProject(row, date)) {
            const schedule = scheduleData.find(item =>
                item.projNo === row.projNo &&
                item.place === row.place
            );
            if (schedule) {
                setupdatepage(true);
                setSelectedSchedule(schedule);
            }
        }
    };

    const getCurrentDate = () => {
        const today = new Date();
        return today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEditOpen = () => {
        setupdatepage(true);
    };

    return (
        // <div className='dashboard'>
        //     <div className="slider-container p-4 bg-gray-100 mb-4">
        //         <div className="flex gap-4 items-center mb-4">
        //             <div>
        //                 <label className="block text-sm font-medium text-gray-700">Start Date:</label>
        //                 <input
        //                     type="date"
        //                     value={startDate.toISOString().split('T')[0]}
        //                     onChange={handleStartDateChange}
        //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
        //                 />
        //             </div>
        //             <div>
        //                 <label className="block text-sm font-medium text-gray-700">End Date:</label>
        //                 <input
        //                     type="date"
        //                     value={endDate.toISOString().split('T')[0]}
        //                     onChange={handleEndDateChange}
        //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
        //                 />
        //             </div>
        //             <div className="flex items-center gap-2">
        //                 {speedOptions.map((option) => (
        //                     <button
        //                         key={option.value}
        //                         onClick={() => setAnimationSpeed(option.value)}
        //                         className={`px-2 py-1 rounded ${animationSpeed === option.value
        //                                 ? 'bg-blue-500 text-white'
        //                                 : 'bg-gray-200 hover:bg-gray-300'
        //                             }`}
        //                     >
        //                         {option.label}
        //                     </button>
        //                 ))}
        //             </div>
        //             <button
        //                 onClick={handlePlayClick}
        //                 className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        //             >
        //                 {isPlaying ? '⏸️' : '▶️'}
        //             </button>
        //             {/* <div className="flex items-center gap-2 ml-4">
        //                 <button
        //                     onClick={handleZoomOut}
        //                     className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
        //                 >
        //                     🔍-
        //                 </button>
        //                 <span className="mx-2">{Math.round(zoomLevel * 100)}%</span>
        //                 <button
        //                     onClick={handleZoomIn}
        //                     className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
        //                 >
        //                     🔍+
        //                 </button>
        //             </div> */}
        //         </div>
        //         <input
        //             type="range"
        //             min={startDate.getTime()}
        //             max={endDate.getTime()}
        //             value={currentDate.getTime()}
        //             onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
        //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        //         />
        //         <div className="text-center mt-2">
        //             Current Date: {currentDate.toLocaleDateString()}
        //         </div>
        //     </div>
        //     <div
        //         ref={tableContainerRef}
        //         className="overflow-x-auto"
        //         style={{
        //             maxWidth: "100vw",
        //             overflowX: "auto",
        //             whiteSpace: "nowrap",
        //             position: "relative",
        //             transform: `scale(${zoomLevel})`,
        //             transformOrigin: 'top left',
        //             transition: 'transform 0.2s ease'
        //         }}
        //     >
        //         <div style={{
        //             position: 'absolute',
        //             left: `${dates.findIndex(date =>
        //                 date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
        //             ) * 32 + 280}px`,
        //             top: '0',
        //             bottom: '0',
        //             width: '2px',
        //             backgroundColor: 'red',
        //             zIndex: 1000,
        //             pointerEvents: 'none',
        //             transition: 'left 0.3s ease'
        //         }} />

        //         <table className="border-collapse" style={{ width: "2500px" }}>
        //             <thead>
        //                 <tr>
        //                     <th className="border p-2 bg-gray-50 text-left">
        //                         {getCurrentDate()}
        //                         <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
        //                     </th>
        //                     {monthRanges.map((month, idx) => (
        //                         <th
        //                             key={idx}
        //                             colSpan={month.colSpan}
        //                             className="border p-2 bg-orange-100 text-center font-bold"
        //                         >
        //                             {month.month}
        //                         </th>
        //                     ))}
        //                 </tr>
        //                 <tr>
        //                     <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
        //                         PLACE
        //                     </th>

        //                     {dates.map((date, idx) => (
        //                         <th
        //                             key={idx}
        //                             className="border p-2 bg-gray-50 text-center w-8 font-bold"
        //                             style={{
        //                                 backgroundColor: isToday(date) ? '#FFA500' : ''
        //                             }}
        //                         >
        //                             {date.getDate()}
        //                         </th>
        //                     ))}
        //                 </tr>
        //                 <tr>

        //                     {dates.map((date, idx) => (
        //                         <th
        //                             key={idx}
        //                             className="border p-2 bg-gray-50 text-center font-bold"
        //                             style={{
        //                                 backgroundColor: isToday(date) ? '#FFA500' : ''
        //                             }}
        //                         >
        //                             {date.toLocaleString('default', { weekday: 'short' })[0]}
        //                         </th>
        //                     ))}
        //                 </tr>
        //             </thead>
        //             <tbody>
        //                 {gridData.map((row, rowIdx) => (
        //                     <tr key={rowIdx}>
        //                         {row.isFirstInGroup && (
        //                             <td
        //                                 rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
        //                                 className="border p-2 font-medium bg-white"
        //                             >
        //                                 {row.place}
        //                             </td>
        //                         )}
        //                         {dates.map((date, colIdx) => {
        //                             const inProject = isDateInProject(row, date);
        //                             const isStart = isProjectStartDate(row, date);
        //                             // const isCurrentDate = new Date(date).setHours(0,0,0,0) === 
        //                             // new Date(currentDate).setHours(0,0,0,0);
        //                             return (
        //                                 <td
        //                                     key={colIdx}
        //                                     className="border p-2 text-center cursor-pointer"
        //                                     style={{
        //                                         backgroundColor: inProject ? '#DBEAFE' : ''
        //                                     }}
        //                                     onClick={() => handleCellClick(row, date)}
        //                                 >
        //                                     {isStart ? row.projNo : ''}

        //                                 </td>
        //                             );
        //                         })}
        //                     </tr>
        //                 ))}
        //             </tbody>
        //         </table>
        //     </div>
        //     {updatepage && (
        //         <ScheduleUpdate
        //             schedule={selectedSchedule}
        //             onClose={() => setSelectedSchedule(null)}
        //             scheduleData={scheduleData}
        //         />
        //     )}
        // </div>

        <div className='dashboard'>
            <div className="slider-container p-4 bg-gray-100 mb-4">
                <div className="flex gap-4 items-center mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date:</label>
                        <input
                            type="date"
                            value={startDate.toISOString().split('T')[0]}
                            onChange={handleStartDateChange}
                            className="mt-1 block rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date:</label>
                        <input
                            type="date"
                            value={endDate.toISOString().split('T')[0]}
                            onChange={handleEndDateChange}
                            className="mt-1 block rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {speedOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setAnimationSpeed(option.value)}
                                className={`px-2 py-1 rounded ${animationSpeed === option.value
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handlePlayClick}
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
            <div
                ref={tableContainerRef}
                className="overflow-x-auto"
                style={{
                    maxWidth: "100vw",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    position: "relative",
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.2s ease'
                }}
            >
                <div style={{
                    position: 'absolute',
                    left: `${dates.findIndex(date =>
                        date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
                    ) * parseInt(CELL_WIDTH) + parseInt(PLACE_COLUMN_WIDTH)}px`,
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    backgroundColor: 'red',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    transition: 'left 0.3s ease'
                }} />

                <table className="border-collapse" style={{ width: "2500px", tableLayout: "fixed" }}>
                    <thead>
                        <tr>
                            <th
                                className="border p-2 bg-gray-50 text-left"
                                style={{
                                    width: PLACE_COLUMN_WIDTH,
                                    minWidth: PLACE_COLUMN_WIDTH
                                }}
                            >
                                {getCurrentDate()}
                                <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
                            </th>
                            {monthRanges.map((month, idx) => (
                                <th
                                    key={idx}
                                    colSpan={month.colSpan}
                                    className="border p-2 bg-orange-100 text-center font-bold"
                                    style={{
                                        width: `${month.colSpan * parseInt(CELL_WIDTH)}px`
                                    }}
                                >
                                    {month.month}
                                </th>
                            ))}
                        </tr>
                        <tr>
                            <th
                                rowSpan={2}
                                className="border p-2 bg-gray-50 text-center font-bold"
                                style={{
                                    width: PLACE_COLUMN_WIDTH,
                                    minWidth: PLACE_COLUMN_WIDTH
                                }}
                            >
                                PLACE
                            </th>
                            {dates.map((date, idx) => (
                                <th
                                    key={idx}
                                    className="border p-2 bg-gray-50 text-center font-bold"
                                    style={{
                                        backgroundColor: isToday(date) ? '#FFA500' : '',
                                        width: CELL_WIDTH,
                                        minWidth: CELL_WIDTH,
                                        maxWidth: CELL_WIDTH
                                    }}
                                >
                                    {date.getDate()}
                                </th>
                            ))}
                        </tr>
                        <tr>
                            {dates.map((date, idx) => (
                                <th
                                    key={idx}
                                    className="border p-2 bg-gray-50 text-center font-bold"
                                    style={{
                                        backgroundColor: isToday(date) ? '#FFA500' : '',
                                        width: CELL_WIDTH,
                                        minWidth: CELL_WIDTH,
                                        maxWidth: CELL_WIDTH
                                    }}
                                >
                                    {date.toLocaleString('default', { weekday: 'short' })[0]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {gridData.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                {row.isFirstInGroup && (
                                    <td
                                        rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
                                        className="border p-2 font-medium bg-white"
                                        style={{
                                            width: PLACE_COLUMN_WIDTH,
                                            minWidth: PLACE_COLUMN_WIDTH
                                        }}
                                    >
                                        {row.place}
                                    </td>
                                )}
                                {dates.map((date, colIdx) => {
                                    const inProject = isDateInProject(row, date);
                                    const isStart = isProjectStartDate(row, date);
                                    return (
                                        <td
                                            key={colIdx}
                                            className="border p-2 text-center cursor-pointer"
                                            style={{
                                                backgroundColor: inProject ? '#DBEAFE' : '',
                                                width: CELL_WIDTH,
                                                minWidth: CELL_WIDTH,
                                                maxWidth: CELL_WIDTH
                                            }}
                                            onClick={() => handleCellClick(row, date)}
                                        >
                                            {isStart ? row.projNo : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* {updatepage && (
                <ScheduleUpdate
                    schedule={selectedSchedule}
                    onClose={() => setSelectedSchedule(null)}
                    scheduleData={scheduleData}
                />
            )} */}
             {updatepage && (
                <ScheduleUpdate
                    onClose={() => setupdatepage(false)}
                    scheduleData={scheduleData}
                />
            )}
        </div>
    );
}

export default ReviewSch;


// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';

// function ReviewSch({ scheduleData }) {
//     const CELL_WIDTH = "32px";
//     const PLACE_COLUMN_WIDTH = "100px";
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false);
//     const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
//     const [animationSpeed, setAnimationSpeed] = useState(100); // Default speed
//     // const [zoomClicks, setZoomClicks] = useState(0); // Track number of zoom clicks
//     // const MAX_ZOOM_CLICKS = 5; // Maximum zoom level
//     const [zoomClicks, setZoomClicks] = useState(5); // Start at middle point
//     const MIN_ZOOM_CLICKS = 0; // Minimum zoom level
//     const MAX_ZOOM_CLICKS = 10; // Maximum zoom level
//     const BASE_ZOOM = 100; // Base zoom percentage
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });

//     const tableContainerRef = useRef(null);
//     const today = new Date();
//     const [startDate, setStartDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [endDate, setEndDate] = useState(new Date(Date.UTC(2025, 11, 31)));
//     const [currentDate, setCurrentDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [isPlaying, setIsPlaying] = useState(false);

//     const speedOptions = [
//         { label: '0.5x', value: 200, daysToJump: 1 },
//         { label: '1x', value: 100, daysToJump: 3 },
//         { label: '2x', value: 50, daysToJump: 8 },
//         { label: '4x', value: 1, daysToJump: 15 }
//     ];

//     // const handleZoomIn = () => {
//     //     if (zoomClicks < MAX_ZOOM_CLICKS) {
//     //         setZoomClicks(prev => prev + 1);
//     //     }
//     // };

//     // const handleZoomOut = () => {
//     //     if (zoomClicks > 0) {
//     //         setZoomClicks(prev => prev - 1);
//     //     }
//     // };


//     const handleZoomIn = () => {
//         if (zoomClicks < MAX_ZOOM_CLICKS) {
//             setZoomClicks(prev => prev + 1);
//         }
//     };

//     const handleZoomOut = () => {
//         if (zoomClicks > MIN_ZOOM_CLICKS) {
//             setZoomClicks(prev => prev - 1);
//         }
//     };

//     // Your existing useEffect for data loading
//     useEffect(() => {
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             const groupedByPlace = _.groupBy(scheduleData, 'place');
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj,
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     useEffect(() => {
//         let animationFrameId;
//         let timeoutId;

//         if (isPlaying) {
//             const animate = () => {
//                 setCurrentDate(prevDate => {
//                     const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
//                     const daysToJump = currentSpeed ? currentSpeed.daysToJump : 1;
//                     const timeToEndDate = endDate.getTime() - prevDate.getTime();
//                     const oneDayInMs = 24 * 60 * 60 * 1000;

//                     if (timeToEndDate <= (daysToJump * oneDayInMs)) {
//                         setIsPlaying(false);
//                         return new Date(endDate);
//                     }

//                     const newDate = new Date(prevDate.getTime() + (oneDayInMs * daysToJump));

//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return new Date(endDate);
//                     }

//                     return newDate;
//                 });

//                 if (timeoutId) {
//                     clearTimeout(timeoutId);
//                 }

//                 timeoutId = setTimeout(() => {
//                     animationFrameId = requestAnimationFrame(animate);
//                 }, animationSpeed);
//             };

//             animate();
//         }

//         return () => {
//             if (timeoutId) {
//                 clearTimeout(timeoutId);
//             }
//             if (animationFrameId) {
//                 cancelAnimationFrame(animationFrameId);
//             }
//         };
//     }, [isPlaying, endDate, animationSpeed]);

//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     const handleStartDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newStartDate = new Date(Date.UTC(year, month - 1, day));
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate);
//         setIsPlaying(false);
//     };

//     const handleEndDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newEndDate = new Date(Date.UTC(year, month - 1, day));
//         setEndDate(newEndDate);
//     };

//     const handlePlayClick = () => {
//         if (!isPlaying) {
//             if (currentDate.getTime() >= endDate.getTime()) {
//                 setCurrentDate(startDate);
//             }
//             setIsPlaying(true);
//         } else {
//             setIsPlaying(false);
//         }
//     };

//     const isToday = (date) => {
//         const currentDate = new Date();
//         return date.getDate() === currentDate.getDate() &&
//             date.getMonth() === currentDate.getMonth() &&
//             date.getFullYear() === currentDate.getFullYear();
//     };

//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true);
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = () => {
//         setupdatepage(true);
//     };

//     return (
//         <div className='dashboard'>
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={handleStartDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={handleEndDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div className="flex items-center gap-2">
//                         {speedOptions.map((option) => (
//                             <button
//                                 key={option.value}
//                                 onClick={() => setAnimationSpeed(option.value)}
//                                 className={`px-2 py-1 rounded ${animationSpeed === option.value
//                                     ? 'bg-blue-500 text-white'
//                                     : 'bg-gray-200 hover:bg-gray-300'
//                                     }`}
//                             >
//                                 {option.label}
//                             </button>
//                         ))}
//                     </div>
//                     <button
//                         onClick={handlePlayClick}
//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>

//                     {/* Zoom Controls */}
//                     <div className="flex items-center gap-2 ml-4">
//                         {/* <button
//                             onClick={handleZoomOut}
//                             disabled={zoomClicks === 0}
//                             className={`px-3 py-1 rounded ${zoomClicks === 0
//                                 ? 'bg-gray-300 cursor-not-allowed'
//                                 : 'bg-blue-500 text-white hover:bg-blue-600'
//                                 }`}
//                         >
//                             -
//                         </button>
//                         <span className="mx-2">{100 + (zoomClicks * 20)}%</span>
//                         <button
//                             onClick={handleZoomIn}
//                             disabled={zoomClicks === MAX_ZOOM_CLICKS}
//                             className={`px-3 py-1 rounded ${zoomClicks === MAX_ZOOM_CLICKS
//                                 ? 'bg-gray-300 cursor-not-allowed'
//                                 : 'bg-blue-500 text-white hover:bg-blue-600'
//                                 }`}
//                         >
//                             +
//                         </button> */}
//                         <button
//                             onClick={handleZoomOut}
//                             disabled={zoomClicks === MIN_ZOOM_CLICKS}
//                             className={`px-3 py-1 rounded ${zoomClicks === MIN_ZOOM_CLICKS
//                                 ? 'bg-gray-300 cursor-not-allowed'
//                                 : 'bg-blue-500 text-white hover:bg-blue-600'
//                                 }`}
//                         >
//                             -
//                         </button>
//                         <span className="mx-2">{BASE_ZOOM + ((zoomClicks - 5) * 20)}%</span>
//                         <button
//                             onClick={handleZoomIn}
//                             disabled={zoomClicks === MAX_ZOOM_CLICKS}
//                             className={`px-3 py-1 rounded ${zoomClicks === MAX_ZOOM_CLICKS
//                                 ? 'bg-gray-300 cursor-not-allowed'
//                                 : 'bg-blue-500 text-white hover:bg-blue-600'
//                                 }`}
//                         >
//                             +
//                         </button>
//                     </div>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             {/* <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto"
//                 style={{
//                     maxWidth: "100vw",
//                     overflowX: "auto",
//                     whiteSpace: "nowrap",
//                     position: "relative",
//                     width: `${100 + (zoomClicks * 20)}%`,
//                     transition: 'width 0.3s ease'
//                 }}
//             > */}

//             <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto"
//                 // style={{
//                 //     maxWidth: "100vw",
//                 //     overflowX: "auto",
//                 //     whiteSpace: "nowrap",
//                 //     position: "relative",
//                 //     width: "100%", // Changed from percentage-based width
//                 //     transform: `scale(${1 + (zoomClicks * 0.2)})`, // Use transform scale instead
//                 //     transformOrigin: 'left top',
//                 //     transition: 'transform 0.3s ease'
//                 // }}

//                 style={{
//                     maxWidth: "100vw",
//                     overflowX: "auto",
//                     whiteSpace: "nowrap",
//                     position: "relative",
//                     width: `${BASE_ZOOM + ((zoomClicks - 5) * 20)}%`, // Adjust from base zoom
//                     transition: 'width 0.3s ease'
//                 }}
//             >
//                 <div style={{
//                     position: 'absolute',
//                     left: `${dates.findIndex(date =>
//                         date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                     ) * parseInt(CELL_WIDTH) + parseInt(PLACE_COLUMN_WIDTH)}px`,
//                     top: '0',
//                     bottom: '0',
//                     width: '2px',
//                     backgroundColor: 'red',
//                     zIndex: 1000,
//                     pointerEvents: 'none',
//                     transition: 'left 0.3s ease'
//                 }} />

//                 {/* <table className="border-collapse" style={{ width: "2500px", tableLayout: "fixed" }}> */}
//                 <table
//                     className="border-collapse"
//                     style={{
//                         width: `${2500 * (1 + (zoomClicks * 0.2))}px`, // Make table width respond to zoom
//                         tableLayout: "fixed"
//                     }}
//                 >
//                     <thead>
//                         <tr>
//                             <th
//                                 className="border p-2 bg-gray-50 text-left"
//                                 style={{
//                                     width: PLACE_COLUMN_WIDTH,
//                                     minWidth: PLACE_COLUMN_WIDTH
//                                 }}
//                             >
//                                 {getCurrentDate()}
//                                 <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//                             </th>
//                             {monthRanges.map((month, idx) => (
//                                 <th
//                                     key={idx}
//                                     colSpan={month.colSpan}
//                                     className="border p-2 bg-orange-100 text-center font-bold"
//                                     style={{
//                                         width: `${month.colSpan * parseInt(CELL_WIDTH)}px`
//                                     }}
//                                 >
//                                     {month.month}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             <th
//                                 rowSpan={2}
//                                 className="border p-2 bg-gray-50 text-center font-bold"
//                                 style={{
//                                     width: PLACE_COLUMN_WIDTH,
//                                     minWidth: PLACE_COLUMN_WIDTH
//                                 }}
//                             >
//                                 PLACE
//                             </th>
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : '',
//                                         width: CELL_WIDTH,
//                                         minWidth: CELL_WIDTH,
//                                         maxWidth: CELL_WIDTH
//                                     }}
//                                 >
//                                     {date.getDate()}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : '',
//                                         width: CELL_WIDTH,
//                                         minWidth: CELL_WIDTH,
//                                         maxWidth: CELL_WIDTH
//                                     }}
//                                 >
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {gridData.map((row, rowIdx) => (
//                             <tr key={rowIdx}>
//                                 {row.isFirstInGroup && (
//                                     <td
//                                         rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                         className="border p-2 font-medium bg-white"
//                                         style={{
//                                             width: PLACE_COLUMN_WIDTH,
//                                             minWidth: PLACE_COLUMN_WIDTH
//                                         }}
//                                     >
//                                         {row.place}
//                                     </td>
//                                 )}
//                                 {dates.map((date, colIdx) => {
//                                     const inProject = isDateInProject(row, date);
//                                     const isStart = isProjectStartDate(row, date);
//                                     return (
//                                         <td
//                                             key={colIdx}
//                                             className="border p-2 text-center cursor-pointer"
//                                             style={{
//                                                 backgroundColor: inProject ? '#DBEAFE' : '',
//                                                 width: CELL_WIDTH,
//                                                 minWidth: CELL_WIDTH,
//                                                 maxWidth: CELL_WIDTH
//                                             }}
//                                             onClick={() => handleCellClick(row, date)}
//                                         >
//                                             {isStart ? row.projNo : ''}
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {
//                 updatepage && (
//                     <ScheduleUpdate
//                         schedule={selectedSchedule}
//                         onClose={() => setSelectedSchedule(null)}
//                         scheduleData={scheduleData}
//                     />
//                 )
//             }
//         </div >
//     );
// }

// export default ReviewSch;


// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';

// function ReviewSch({ scheduleData }) {
//     const CELL_WIDTH = "32px";
//     const PLACE_COLUMN_WIDTH = "100px";
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false);
//     const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
//     const [animationSpeed, setAnimationSpeed] = useState(100); // Default speed
//     const [zoomLevel, setZoomLevel] = useState(1); // Default zoom
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });

//     const tableContainerRef = useRef(null);
//     const today = new Date();
//     const [startDate, setStartDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [endDate, setEndDate] = useState(new Date(Date.UTC(2025, 11, 31)));
//     const [currentDate, setCurrentDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [isFullView, setIsFullView] = useState(false);
//     const [containerWidth, setContainerWidth] = useState(window.innerWidth);

//     // const speedOptions = [
//     //     { label: '0.5x', value: 200 },
//     //     { label: '1x', value: 100 },
//     //     { label: '2x', value: 50 },
//     //     { label: '4x', value: 1 }
//     // ];


//     const speedOptions = [
//         { label: '0.5x', value: 200, daysToJump: 1 },
//         { label: '1x', value: 100, daysToJump: 3 },
//         { label: '2x', value: 50, daysToJump: 8 },
//         { label: '4x', value: 1, daysToJump: 15 }
//     ];

//     const handleZoomIn = () => {
//         setZoomLevel(prev => Math.min(prev + 0.1, 2));
//     };

//     const handleZoomOut = () => {
//         setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
//     };

//     // Your existing useEffect for data loading
//     useEffect(() => {
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             const groupedByPlace = _.groupBy(scheduleData, 'place');
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj,
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     // Modified animation effect with speed control
//     // useEffect(() => {
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });
//     //             animationFrameId = setTimeout(() => {
//     //                 requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };
//     //         animate();
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             clearTimeout(animationFrameId);
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // useEffect(() => {
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 // Calculate days to jump based on speed
//     //                 const daysToJump = animationSpeed <= 25 ? 2 : 1; // Jump 2 days at faster speeds
//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });
//     //             animationFrameId = setTimeout(() => {
//     //                 requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };
//     //         animate();
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             clearTimeout(animationFrameId);
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // useEffect(() => {
//     //     let animationFrameId;
//     //     let timeoutId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 const daysToJump = animationSpeed <= 25 ? 8 : 1;
//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });

//     //             // Clear existing timeout before setting a new one
//     //             if (timeoutId) {
//     //                 clearTimeout(timeoutId);
//     //             }

//     //             timeoutId = setTimeout(() => {
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };

//     //         animate();
//     //     }

//     //     return () => {
//     //         if (timeoutId) {
//     //             clearTimeout(timeoutId);
//     //         }
//     //         if (animationFrameId) {
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]); // Make sure animationSpeed is in dependencies

//     useEffect(() => {
//         console.log(animationSpeed);
//         console.log(endDate);

//         let animationFrameId;
//         let timeoutId;

//         if (isPlaying) {
//             const animate = () => {
//                 setCurrentDate(prevDate => {
//                     const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
//                     console.log(currentSpeed);

//                     const daysToJump = currentSpeed ? currentSpeed.daysToJump : 1;
//                     console.log(daysToJump);

//                     const timeToEndDate = endDate.getTime() - prevDate.getTime();
//                     console.log(timeToEndDate);

//                     const oneDayInMs = 24 * 60 * 60 * 1000;
//                     console.log(oneDayInMs);


//                     // If we're close to the end date, make sure we hit it exactly
//                     if (timeToEndDate <= (daysToJump * oneDayInMs)) {
//                         setIsPlaying(false);
//                         return new Date(endDate);
//                     }

//                     const newDate = new Date(prevDate.getTime() + (oneDayInMs * daysToJump));
//                     console.log(newDate);

//                     // Check if we would overshoot
//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return new Date(endDate);
//                     }

//                     return newDate;
//                 });

//                 if (timeoutId) {
//                     clearTimeout(timeoutId);
//                 }

//                 timeoutId = setTimeout(() => {
//                     animationFrameId = requestAnimationFrame(animate);
//                 }, animationSpeed);
//             };

//             animate();
//         }

//         return () => {
//             if (timeoutId) {
//                 clearTimeout(timeoutId);
//             }
//             if (animationFrameId) {
//                 cancelAnimationFrame(animationFrameId);
//             }
//         };
//     }, [isPlaying, endDate, animationSpeed]);

//     // useEffect(() => {
//     //     let animationFrameId;
//     //     let timeoutId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 // Calculate days to jump based on speed setting
//     //                 let daysToJump;
//     //                 switch (animationSpeed) {
//     //                     case 1: // 64x
//     //                         daysToJump = 8;
//     //                         break;
//     //                     case 3: // 32x
//     //                         daysToJump = 6;
//     //                         break;
//     //                     case 5: // 16x
//     //                         daysToJump = 4;
//     //                         break;
//     //                     case 10: // 8x
//     //                         daysToJump = 3;
//     //                         break;
//     //                     case 25: // 4x
//     //                         daysToJump = 2;
//     //                         break;
//     //                     default:
//     //                         daysToJump = 1;
//     //                 }

//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });

//     //             if (timeoutId) {
//     //                 clearTimeout(timeoutId);
//     //             }

//     //             timeoutId = setTimeout(() => {
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };

//     //         animate();
//     //     }

//     //     return () => {
//     //         if (timeoutId) {
//     //             clearTimeout(timeoutId);
//     //         }
//     //         if (animationFrameId) {
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // Your existing useEffect for scrolling
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     // Your existing handlers
//     const handleStartDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newStartDate = new Date(Date.UTC(year, month - 1, day));
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate);
//         setIsPlaying(false);
//     };

//     const handleEndDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newEndDate = new Date(Date.UTC(year, month - 1, day));
//         setEndDate(newEndDate);
//     };

//     const handlePlayClick = () => {
//         if (!isPlaying) {
//             if (currentDate.getTime() >= endDate.getTime()) {
//                 setCurrentDate(startDate);
//             }
//             setIsPlaying(true);
//         } else {
//             setIsPlaying(false);
//         }
//     };

//     // Your other existing handlers and helper functions...
//     const isToday = (date) => {
//         const currentDate = new Date();
//         return date.getDate() === currentDate.getDate() &&
//             date.getMonth() === currentDate.getMonth() &&
//             date.getFullYear() === currentDate.getFullYear();
//     };

//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true);
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = () => {
//         setupdatepage(true);
//     };

//     // Add this useEffect for window resize handling
//     useEffect(() => {
//         const handleResize = () => {
//             setContainerWidth(window.innerWidth);
//         };

//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     // Add this function to calculate scale factor
//     const getScaleFactor = () => {
//         if (!isFullView) return 1;
//         const tableWidth = 2500;
//         const padding = 40;
//         return (containerWidth - padding) / tableWidth;
//     };

//     // Add toggle function
//     const toggleTableView = () => {
//         setIsFullView(!isFullView);
//         if (tableContainerRef.current) {
//             tableContainerRef.current.scrollLeft = 0;
//         }
//     };

//     // Modify the scroll effect to handle scaling
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             // Apply scroll position with scale factor consideration
//             if (isFullView) {
//                 const scaleFactor = getScaleFactor();
//                 tableContainerRef.current.scrollLeft = centeredScrollPosition * scaleFactor;
//             } else {
//                 tableContainerRef.current.scrollLeft = centeredScrollPosition;
//             }
//         }
//     }, [currentDate, dates, isFullView]);
//     return (
//         // <div className='dashboard'>
//         //     <div className="slider-container p-4 bg-gray-100 mb-4">
//         //         <div className="flex gap-4 items-center mb-4">
//         //             <div>
//         //                 <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//         //                 <input
//         //                     type="date"
//         //                     value={startDate.toISOString().split('T')[0]}
//         //                     onChange={handleStartDateChange}
//         //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
//         //                 />
//         //             </div>
//         //             <div>
//         //                 <label className="block text-sm font-medium text-gray-700">End Date:</label>
//         //                 <input
//         //                     type="date"
//         //                     value={endDate.toISOString().split('T')[0]}
//         //                     onChange={handleEndDateChange}
//         //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
//         //                 />
//         //             </div>
//         //             <div className="flex items-center gap-2">
//         //                 {speedOptions.map((option) => (
//         //                     <button
//         //                         key={option.value}
//         //                         onClick={() => setAnimationSpeed(option.value)}
//         //                         className={`px-2 py-1 rounded ${animationSpeed === option.value
//         //                                 ? 'bg-blue-500 text-white'
//         //                                 : 'bg-gray-200 hover:bg-gray-300'
//         //                             }`}
//         //                     >
//         //                         {option.label}
//         //                     </button>
//         //                 ))}
//         //             </div>
//         //             <button
//         //                 onClick={handlePlayClick}
//         //                 className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//         //             >
//         //                 {isPlaying ? '⏸️' : '▶️'}
//         //             </button>
//         //             {/* <div className="flex items-center gap-2 ml-4">
//         //                 <button
//         //                     onClick={handleZoomOut}
//         //                     className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
//         //                 >
//         //                     🔍-
//         //                 </button>
//         //                 <span className="mx-2">{Math.round(zoomLevel * 100)}%</span>
//         //                 <button
//         //                     onClick={handleZoomIn}
//         //                     className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
//         //                 >
//         //                     🔍+
//         //                 </button>
//         //             </div> */}
//         //         </div>
//         //         <input
//         //             type="range"
//         //             min={startDate.getTime()}
//         //             max={endDate.getTime()}
//         //             value={currentDate.getTime()}
//         //             onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//         //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//         //         />
//         //         <div className="text-center mt-2">
//         //             Current Date: {currentDate.toLocaleDateString()}
//         //         </div>
//         //     </div>
//         //     <div
//         //         ref={tableContainerRef}
//         //         className="overflow-x-auto"
//         //         style={{
//         //             maxWidth: "100vw",
//         //             overflowX: "auto",
//         //             whiteSpace: "nowrap",
//         //             position: "relative",
//         //             transform: `scale(${zoomLevel})`,
//         //             transformOrigin: 'top left',
//         //             transition: 'transform 0.2s ease'
//         //         }}
//         //     >
//         //         <div style={{
//         //             position: 'absolute',
//         //             left: `${dates.findIndex(date =>
//         //                 date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//         //             ) * 32 + 280}px`,
//         //             top: '0',
//         //             bottom: '0',
//         //             width: '2px',
//         //             backgroundColor: 'red',
//         //             zIndex: 1000,
//         //             pointerEvents: 'none',
//         //             transition: 'left 0.3s ease'
//         //         }} />

//         //         <table className="border-collapse" style={{ width: "2500px" }}>
//         //             <thead>
//         //                 <tr>
//         //                     <th className="border p-2 bg-gray-50 text-left">
//         //                         {getCurrentDate()}
//         //                         <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//         //                     </th>
//         //                     {monthRanges.map((month, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             colSpan={month.colSpan}
//         //                             className="border p-2 bg-orange-100 text-center font-bold"
//         //                         >
//         //                             {month.month}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //                 <tr>
//         //                     <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//         //                         PLACE
//         //                     </th>

//         //                     {dates.map((date, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             className="border p-2 bg-gray-50 text-center w-8 font-bold"
//         //                             style={{
//         //                                 backgroundColor: isToday(date) ? '#FFA500' : ''
//         //                             }}
//         //                         >
//         //                             {date.getDate()}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //                 <tr>

//         //                     {dates.map((date, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             className="border p-2 bg-gray-50 text-center font-bold"
//         //                             style={{
//         //                                 backgroundColor: isToday(date) ? '#FFA500' : ''
//         //                             }}
//         //                         >
//         //                             {date.toLocaleString('default', { weekday: 'short' })[0]}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //             </thead>
//         //             <tbody>
//         //                 {gridData.map((row, rowIdx) => (
//         //                     <tr key={rowIdx}>
//         //                         {row.isFirstInGroup && (
//         //                             <td
//         //                                 rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//         //                                 className="border p-2 font-medium bg-white"
//         //                             >
//         //                                 {row.place}
//         //                             </td>
//         //                         )}
//         //                         {dates.map((date, colIdx) => {
//         //                             const inProject = isDateInProject(row, date);
//         //                             const isStart = isProjectStartDate(row, date);
//         //                             // const isCurrentDate = new Date(date).setHours(0,0,0,0) === 
//         //                             // new Date(currentDate).setHours(0,0,0,0);
//         //                             return (
//         //                                 <td
//         //                                     key={colIdx}
//         //                                     className="border p-2 text-center cursor-pointer"
//         //                                     style={{
//         //                                         backgroundColor: inProject ? '#DBEAFE' : ''
//         //                                     }}
//         //                                     onClick={() => handleCellClick(row, date)}
//         //                                 >
//         //                                     {isStart ? row.projNo : ''}

//         //                                 </td>
//         //                             );
//         //                         })}
//         //                     </tr>
//         //                 ))}
//         //             </tbody>
//         //         </table>
//         //     </div>
//         //     {updatepage && (
//         //         <ScheduleUpdate
//         //             schedule={selectedSchedule}
//         //             onClose={() => setSelectedSchedule(null)}
//         //             scheduleData={scheduleData}
//         //         />
//         //     )}
//         // </div>

//         <div className='dashboard'>
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={handleStartDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={handleEndDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div className="flex items-center gap-2">
//                         {speedOptions.map((option) => (
//                             <button
//                                 key={option.value}
//                                 onClick={() => setAnimationSpeed(option.value)}
//                                 className={`px-2 py-1 rounded ${animationSpeed === option.value
//                                     ? 'bg-blue-500 text-white'
//                                     : 'bg-gray-200 hover:bg-gray-300'
//                                     }`}
//                             >
//                                 {option.label}
//                             </button>
//                         ))}
//                     </div>
//                     <button
//                         onClick={handlePlayClick}
//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>
//                     <button
//                         onClick={toggleTableView}
//                         className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
//                     >
//                         {isFullView ? 'Normal View' : 'Full View'}
//                     </button>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             {/* <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto"
//                 style={{
//                     maxWidth: "100vw",
//                     overflowX: "auto",
//                     whiteSpace: "nowrap",
//                     position: "relative",
//                     transform: `scale(${zoomLevel})`,
//                     transformOrigin: 'top left',
//                     transition: 'transform 0.2s ease'
//                 }}
//             >
//                 <div style={{
//                     position: 'absolute',
//                     left: `${dates.findIndex(date =>
//                         date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                     ) * parseInt(CELL_WIDTH) + parseInt(PLACE_COLUMN_WIDTH)}px`,
//                     top: '0',
//                     bottom: '0',
//                     width: '2px',
//                     backgroundColor: 'red',
//                     zIndex: 1000,
//                     pointerEvents: 'none',
//                     transition: 'left 0.3s ease'
//                 }} />

//                 <table className="border-collapse" style={{ width: "2500px", tableLayout: "fixed" }}> */}

//             <div style={{
//                 position: 'relative',
//                 width: '100%',
//                 overflow: 'hidden'
//             }}>
//                 <div
//                     ref={tableContainerRef}
//                     className="overflow-x-auto"
//                     style={{
//                         position: 'relative',
//                         width: '100%',
//                         overflowX: 'auto',
//                         transformOrigin: 'top left',
//                         maxHeight: isFullView ? '80vh' : 'auto',
//                     }}
//                 >
//                     <div style={{
//                         position: 'relative',
//                         width: '2500px',
//                         transform: isFullView ? `scale(${getScaleFactor()})` : 'none',
//                         transformOrigin: 'top left',
//                         marginBottom: isFullView ? '100px' : '0',
//                     }}>
//                         <div style={{
//                             position: 'absolute',
//                             left: `${dates.findIndex(date =>
//                                 date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                             ) * parseInt(CELL_WIDTH) + parseInt(PLACE_COLUMN_WIDTH)}px`,
//                             top: '0',
//                             height: '100%',
//                             width: '2px',
//                             backgroundColor: 'red',
//                             zIndex: 1000,
//                             pointerEvents: 'none',
//                             transition: isPlaying ? 'none' : 'left 0.3s ease-out'
//                         }} />

//                         <table className="border-collapse" style={{
//                             width: '100%',
//                             tableLayout: "fixed",
//                             position: 'relative',
//                             minHeight: isFullView ? '60vh' : 'auto'
//                         }}>
//                             <thead>
//                                 <tr>
//                                     <th
//                                         className="border p-2 bg-gray-50 text-left"
//                                         style={{
//                                             width: PLACE_COLUMN_WIDTH,
//                                             minWidth: PLACE_COLUMN_WIDTH
//                                         }}
//                                     >
//                                         {getCurrentDate()}
//                                         <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//                                     </th>
//                                     {monthRanges.map((month, idx) => (
//                                         <th
//                                             key={idx}
//                                             colSpan={month.colSpan}
//                                             className="border p-2 bg-orange-100 text-center font-bold"
//                                             style={{
//                                                 width: `${month.colSpan * parseInt(CELL_WIDTH)}px`
//                                             }}
//                                         >
//                                             {month.month}
//                                         </th>
//                                     ))}
//                                 </tr>
//                                 <tr>
//                                     <th
//                                         rowSpan={2}
//                                         className="border p-2 bg-gray-50 text-center font-bold"
//                                         style={{
//                                             width: PLACE_COLUMN_WIDTH,
//                                             minWidth: PLACE_COLUMN_WIDTH
//                                         }}
//                                     >
//                                         PLACE
//                                     </th>
//                                     {dates.map((date, idx) => (
//                                         <th
//                                             key={idx}
//                                             className="border p-2 bg-gray-50 text-center font-bold"
//                                             style={{
//                                                 backgroundColor: isToday(date) ? '#FFA500' : '',
//                                                 width: CELL_WIDTH,
//                                                 minWidth: CELL_WIDTH,
//                                                 maxWidth: CELL_WIDTH
//                                             }}
//                                         >
//                                             {date.getDate()}
//                                         </th>
//                                     ))}
//                                 </tr>
//                                 <tr>
//                                     {dates.map((date, idx) => (
//                                         <th
//                                             key={idx}
//                                             className="border p-2 bg-gray-50 text-center font-bold"
//                                             style={{
//                                                 backgroundColor: isToday(date) ? '#FFA500' : '',
//                                                 width: CELL_WIDTH,
//                                                 minWidth: CELL_WIDTH,
//                                                 maxWidth: CELL_WIDTH
//                                             }}
//                                         >
//                                             {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {gridData.map((row, rowIdx) => (
//                                     <tr key={rowIdx}>
//                                         {row.isFirstInGroup && (
//                                             <td
//                                                 rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                                 className="border p-2 font-medium bg-white"
//                                                 style={{
//                                                     width: PLACE_COLUMN_WIDTH,
//                                                     minWidth: PLACE_COLUMN_WIDTH
//                                                 }}
//                                             >
//                                                 {row.place}
//                                             </td>
//                                         )}
//                                         {dates.map((date, colIdx) => {
//                                             const inProject = isDateInProject(row, date);
//                                             const isStart = isProjectStartDate(row, date);
//                                             return (
//                                                 <td
//                                                     key={colIdx}
//                                                     className="border p-2 text-center cursor-pointer"
//                                                     style={{
//                                                         backgroundColor: inProject ? '#DBEAFE' : '',
//                                                         width: CELL_WIDTH,
//                                                         minWidth: CELL_WIDTH,
//                                                         maxWidth: CELL_WIDTH
//                                                     }}
//                                                     onClick={() => handleCellClick(row, date)}
//                                                 >
//                                                     {isStart ? row.projNo : ''}
//                                                 </td>
//                                             );
//                                         })}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div >
//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}
//         </div>
//     );
// }

// export default ReviewSch;


// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';

// function ReviewSch({ scheduleData }) {
//     const CELL_WIDTH = "32px";
//     const PLACE_COLUMN_WIDTH = "100px";
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false);
//     const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
//     const [animationSpeed, setAnimationSpeed] = useState(1); // Default speed multiplier
//     const [zoomLevel, setZoomLevel] = useState(1);
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });

//     const tableContainerRef = useRef(null);
//     const animationFrameRef = useRef(null);
//     const lastUpdateTimeRef = useRef(0);

//     const today = new Date();
//     const [startDate, setStartDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [endDate, setEndDate] = useState(new Date(Date.UTC(2025, 11, 31)));
//     const [currentDate, setCurrentDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [isPlaying, setIsPlaying] = useState(false);

//     const speedOptions = [
//         { label: '0.5x', value: 0.5, msPerDay: 10 },
//         { label: '1x', value: 1, msPerDay: 5 },
//         { label: '2x', value: 2, msPerDay: 3 },
//         { label: '4x', value: 4, msPerDay: 1 }
//     ];

//     const handleZoomIn = () => {
//         setZoomLevel(prev => Math.min(prev + 0.1, 2));
//     };

//     const handleZoomOut = () => {
//         setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
//     };

//     // Your existing useEffect for data loading
//     useEffect(() => {
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             const groupedByPlace = _.groupBy(scheduleData, 'place');
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj,
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     // Modified animation effect with speed control
//     // useEffect(() => {
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });
//     //             animationFrameId = setTimeout(() => {
//     //                 requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };
//     //         animate();
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             clearTimeout(animationFrameId);
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // useEffect(() => {
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 // Calculate days to jump based on speed
//     //                 const daysToJump = animationSpeed <= 25 ? 2 : 1; // Jump 2 days at faster speeds
//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });
//     //             animationFrameId = setTimeout(() => {
//     //                 requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };
//     //         animate();
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             clearTimeout(animationFrameId);
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // useEffect(() => {
//     //     let animationFrameId;
//     //     let timeoutId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 const daysToJump = animationSpeed <= 25 ? 8 : 1;
//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });

//     //             // Clear existing timeout before setting a new one
//     //             if (timeoutId) {
//     //                 clearTimeout(timeoutId);
//     //             }

//     //             timeoutId = setTimeout(() => {
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };

//     //         animate();
//     //     }

//     //     return () => {
//     //         if (timeoutId) {
//     //             clearTimeout(timeoutId);
//     //         }
//     //         if (animationFrameId) {
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]); // Make sure animationSpeed is in dependencies

//     // useEffect(() => {
//     //     if (!isPlaying) {
//     //         if (animationFrameRef.current) {
//     //             cancelAnimationFrame(animationFrameRef.current);
//     //         }
//     //         return;
//     //     }

//     //     const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
//     //     const msPerDay = currentSpeed ? currentSpeed.msPerDay : 100;

//     //     const animate = (timestamp) => {
//     //         if (!lastUpdateTimeRef.current) {
//     //             lastUpdateTimeRef.current = timestamp;
//     //         }

//     //         const elapsed = timestamp - lastUpdateTimeRef.current;

//     //         if (elapsed >= msPerDay) {
//     //             setCurrentDate(prevDate => {
//     //                 const millisecondsToAdd = elapsed * animationSpeed;
//     //                 const newDate = new Date(prevDate.getTime() + millisecondsToAdd);

//     //                 if (newDate >= endDate) {
//     //                     setIsPlaying(false);
//     //                     return new Date(endDate);
//     //                 }
//     //                 return newDate;
//     //             });
//     //             lastUpdateTimeRef.current = timestamp;
//     //         }

//     //         animationFrameRef.current = requestAnimationFrame(animate);
//     //     };

//     //     animationFrameRef.current = requestAnimationFrame(animate);

//     //     return () => {
//     //         if (animationFrameRef.current) {
//     //             cancelAnimationFrame(animationFrameRef.current);
//     //         }
//     //         lastUpdateTimeRef.current = 0;
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     useEffect(() => {
//         if (!isPlaying) {
//             if (animationFrameRef.current) {
//                 cancelAnimationFrame(animationFrameRef.current);
//             }
//             return;
//         }

//         const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
//         const msPerDay = currentSpeed ? currentSpeed.msPerDay : 100;

//         const animate = (timestamp) => {
//             if (!lastUpdateTimeRef.current) {
//                 lastUpdateTimeRef.current = timestamp;
//             }

//             const elapsed = timestamp - lastUpdateTimeRef.current;

//             if (elapsed >= msPerDay) {
//                 setCurrentDate(prevDate => {
//                     const millisecondsToAdd = elapsed * animationSpeed * 24 * 60 * 60;
//                     const newDate = new Date(prevDate.getTime() + millisecondsToAdd);

//                     if (newDate >= endDate) {
//                         setIsPlaying(false);
//                         return new Date(endDate);
//                     }
//                     return newDate;
//                 });
//                 lastUpdateTimeRef.current = timestamp;
//             }

//             animationFrameRef.current = requestAnimationFrame(animate);
//         };

//         animationFrameRef.current = requestAnimationFrame(animate);

//         return () => {
//             if (animationFrameRef.current) {
//                 cancelAnimationFrame(animationFrameRef.current);
//             }
//             lastUpdateTimeRef.current = 0;
//         };
//     }, [isPlaying, endDate, animationSpeed]);

//     // useEffect(() => {
//     //     let animationFrameId;
//     //     let timeoutId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 // Calculate days to jump based on speed setting
//     //                 let daysToJump;
//     //                 switch (animationSpeed) {
//     //                     case 1: // 64x
//     //                         daysToJump = 8;
//     //                         break;
//     //                     case 3: // 32x
//     //                         daysToJump = 6;
//     //                         break;
//     //                     case 5: // 16x
//     //                         daysToJump = 4;
//     //                         break;
//     //                     case 10: // 8x
//     //                         daysToJump = 3;
//     //                         break;
//     //                     case 25: // 4x
//     //                         daysToJump = 2;
//     //                         break;
//     //                     default:
//     //                         daysToJump = 1;
//     //                 }

//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });

//     //             if (timeoutId) {
//     //                 clearTimeout(timeoutId);
//     //             }

//     //             timeoutId = setTimeout(() => {
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };

//     //         animate();
//     //     }

//     //     return () => {
//     //         if (timeoutId) {
//     //             clearTimeout(timeoutId);
//     //         }
//     //         if (animationFrameId) {
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // Your existing useEffect for scrolling
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     // Your existing handlers
//     const handleStartDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newStartDate = new Date(Date.UTC(year, month - 1, day));
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate);
//         setIsPlaying(false);
//     };

//     const handleEndDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newEndDate = new Date(Date.UTC(year, month - 1, day));
//         setEndDate(newEndDate);
//     };

//     const handlePlayClick = () => {
//         if (!isPlaying) {
//             if (currentDate.getTime() >= endDate.getTime()) {
//                 setCurrentDate(startDate);
//             }
//             lastUpdateTimeRef.current = 0;
//             setIsPlaying(true);
//         } else {
//             setIsPlaying(false);
//         }
//     };

//     // Your other existing handlers and helper functions...
//     const isToday = (date) => {
//         const currentDate = new Date();
//         return date.getDate() === currentDate.getDate() &&
//             date.getMonth() === currentDate.getMonth() &&
//             date.getFullYear() === currentDate.getFullYear();
//     };

//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true);
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = () => {
//         setupdatepage(true);
//     };

//     return (
//         // <div className='dashboard'>
//         //     <div className="slider-container p-4 bg-gray-100 mb-4">
//         //         <div className="flex gap-4 items-center mb-4">
//         //             <div>
//         //                 <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//         //                 <input
//         //                     type="date"
//         //                     value={startDate.toISOString().split('T')[0]}
//         //                     onChange={handleStartDateChange}
//         //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
//         //                 />
//         //             </div>
//         //             <div>
//         //                 <label className="block text-sm font-medium text-gray-700">End Date:</label>
//         //                 <input
//         //                     type="date"
//         //                     value={endDate.toISOString().split('T')[0]}
//         //                     onChange={handleEndDateChange}
//         //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
//         //                 />
//         //             </div>
//         //             <div className="flex items-center gap-2">
//         //                 {speedOptions.map((option) => (
//         //                     <button
//         //                         key={option.value}
//         //                         onClick={() => setAnimationSpeed(option.value)}
//         //                         className={`px-2 py-1 rounded ${animationSpeed === option.value
//         //                                 ? 'bg-blue-500 text-white'
//         //                                 : 'bg-gray-200 hover:bg-gray-300'
//         //                             }`}
//         //                     >
//         //                         {option.label}
//         //                     </button>
//         //                 ))}
//         //             </div>
//         //             <button
//         //                 onClick={handlePlayClick}
//         //                 className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//         //             >
//         //                 {isPlaying ? '⏸️' : '▶️'}
//         //             </button>
//         //             {/* <div className="flex items-center gap-2 ml-4">
//         //                 <button
//         //                     onClick={handleZoomOut}
//         //                     className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
//         //                 >
//         //                     🔍-
//         //                 </button>
//         //                 <span className="mx-2">{Math.round(zoomLevel * 100)}%</span>
//         //                 <button
//         //                     onClick={handleZoomIn}
//         //                     className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
//         //                 >
//         //                     🔍+
//         //                 </button>
//         //             </div> */}
//         //         </div>
//         //         <input
//         //             type="range"
//         //             min={startDate.getTime()}
//         //             max={endDate.getTime()}
//         //             value={currentDate.getTime()}
//         //             onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//         //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//         //         />
//         //         <div className="text-center mt-2">
//         //             Current Date: {currentDate.toLocaleDateString()}
//         //         </div>
//         //     </div>
//         //     <div
//         //         ref={tableContainerRef}
//         //         className="overflow-x-auto"
//         //         style={{
//         //             maxWidth: "100vw",
//         //             overflowX: "auto",
//         //             whiteSpace: "nowrap",
//         //             position: "relative",
//         //             transform: `scale(${zoomLevel})`,
//         //             transformOrigin: 'top left',
//         //             transition: 'transform 0.2s ease'
//         //         }}
//         //     >
//         //         <div style={{
//         //             position: 'absolute',
//         //             left: `${dates.findIndex(date =>
//         //                 date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//         //             ) * 32 + 280}px`,
//         //             top: '0',
//         //             bottom: '0',
//         //             width: '2px',
//         //             backgroundColor: 'red',
//         //             zIndex: 1000,
//         //             pointerEvents: 'none',
//         //             transition: 'left 0.3s ease'
//         //         }} />

//         //         <table className="border-collapse" style={{ width: "2500px" }}>
//         //             <thead>
//         //                 <tr>
//         //                     <th className="border p-2 bg-gray-50 text-left">
//         //                         {getCurrentDate()}
//         //                         <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//         //                     </th>
//         //                     {monthRanges.map((month, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             colSpan={month.colSpan}
//         //                             className="border p-2 bg-orange-100 text-center font-bold"
//         //                         >
//         //                             {month.month}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //                 <tr>
//         //                     <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//         //                         PLACE
//         //                     </th>

//         //                     {dates.map((date, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             className="border p-2 bg-gray-50 text-center w-8 font-bold"
//         //                             style={{
//         //                                 backgroundColor: isToday(date) ? '#FFA500' : ''
//         //                             }}
//         //                         >
//         //                             {date.getDate()}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //                 <tr>

//         //                     {dates.map((date, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             className="border p-2 bg-gray-50 text-center font-bold"
//         //                             style={{
//         //                                 backgroundColor: isToday(date) ? '#FFA500' : ''
//         //                             }}
//         //                         >
//         //                             {date.toLocaleString('default', { weekday: 'short' })[0]}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //             </thead>
//         //             <tbody>
//         //                 {gridData.map((row, rowIdx) => (
//         //                     <tr key={rowIdx}>
//         //                         {row.isFirstInGroup && (
//         //                             <td
//         //                                 rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//         //                                 className="border p-2 font-medium bg-white"
//         //                             >
//         //                                 {row.place}
//         //                             </td>
//         //                         )}
//         //                         {dates.map((date, colIdx) => {
//         //                             const inProject = isDateInProject(row, date);
//         //                             const isStart = isProjectStartDate(row, date);
//         //                             // const isCurrentDate = new Date(date).setHours(0,0,0,0) === 
//         //                             // new Date(currentDate).setHours(0,0,0,0);
//         //                             return (
//         //                                 <td
//         //                                     key={colIdx}
//         //                                     className="border p-2 text-center cursor-pointer"
//         //                                     style={{
//         //                                         backgroundColor: inProject ? '#DBEAFE' : ''
//         //                                     }}
//         //                                     onClick={() => handleCellClick(row, date)}
//         //                                 >
//         //                                     {isStart ? row.projNo : ''}

//         //                                 </td>
//         //                             );
//         //                         })}
//         //                     </tr>
//         //                 ))}
//         //             </tbody>
//         //         </table>
//         //     </div>
//         //     {updatepage && (
//         //         <ScheduleUpdate
//         //             schedule={selectedSchedule}
//         //             onClose={() => setSelectedSchedule(null)}
//         //             scheduleData={scheduleData}
//         //         />
//         //     )}
//         // </div>

//         <div className="dashboard">
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={handleStartDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={handleEndDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div className="flex items-center gap-2">
//                         {speedOptions.map((option) => (
//                             <button
//                                 key={option.value}
//                                 onClick={() => setAnimationSpeed(option.value)}
//                                 className={`px-2 py-1 rounded ${animationSpeed === option.value
//                                         ? 'bg-blue-500 text-white'
//                                         : 'bg-gray-200 hover:bg-gray-300'
//                                     }`}
//                             >
//                                 {option.label}
//                             </button>
//                         ))}
//                     </div>
//                     <button
//                         onClick={handlePlayClick}
//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto"
//                 style={{
//                     maxWidth: "100vw",
//                     overflowX: "auto",
//                     whiteSpace: "nowrap",
//                     position: "relative",
//                     transform: `scale(${zoomLevel})`,
//                     transformOrigin: 'top left',
//                     transition: 'transform 0.2s ease'
//                 }}
//             >
//                 <div style={{
//                     position: 'absolute',
//                     left: `${dates.findIndex(date =>
//                         date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                     ) * parseInt(CELL_WIDTH) + parseInt(PLACE_COLUMN_WIDTH)}px`,
//                     top: '0',
//                     bottom: '0',
//                     width: '2px',
//                     backgroundColor: 'red',
//                     zIndex: 1000,
//                     pointerEvents: 'none',
//                     transition: 'left 0.3s ease'
//                 }} />

//                 <table className="border-collapse" style={{ width: "2500px", tableLayout: "fixed" }}>
//                     <thead>
//                         <tr>
//                             <th
//                                 className="border p-2 bg-gray-50 text-left"
//                                 style={{
//                                     width: PLACE_COLUMN_WIDTH,
//                                     minWidth: PLACE_COLUMN_WIDTH
//                                 }}
//                             >
//                                 {getCurrentDate()}
//                                 <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//                             </th>
//                             {monthRanges.map((month, idx) => (
//                                 <th
//                                     key={idx}
//                                     colSpan={month.colSpan}
//                                     className="border p-2 bg-orange-100 text-center font-bold"
//                                     style={{
//                                         width: `${month.colSpan * parseInt(CELL_WIDTH)}px`
//                                     }}
//                                 >
//                                     {month.month}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             <th
//                                 rowSpan={2}
//                                 className="border p-2 bg-gray-50 text-center font-bold"
//                                 style={{
//                                     width: PLACE_COLUMN_WIDTH,
//                                     minWidth: PLACE_COLUMN_WIDTH
//                                 }}
//                             >
//                                 PLACE
//                             </th>
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : '',
//                                         width: CELL_WIDTH,
//                                         minWidth: CELL_WIDTH,
//                                         maxWidth: CELL_WIDTH
//                                     }}
//                                 >
//                                     {date.getDate()}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : '',
//                                         width: CELL_WIDTH,
//                                         minWidth: CELL_WIDTH,
//                                         maxWidth: CELL_WIDTH
//                                     }}
//                                 >
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {gridData.map((row, rowIdx) => (
//                             <tr key={rowIdx}>
//                                 {row.isFirstInGroup && (
//                                     <td
//                                         rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                         className="border p-2 font-medium bg-white"
//                                         style={{
//                                             width: PLACE_COLUMN_WIDTH,
//                                             minWidth: PLACE_COLUMN_WIDTH
//                                         }}
//                                     >
//                                         {row.place}
//                                     </td>
//                                 )}
//                                 {dates.map((date, colIdx) => {
//                                     const inProject = isDateInProject(row, date);
//                                     const isStart = isProjectStartDate(row, date);
//                                     return (
//                                         <td
//                                             key={colIdx}
//                                             className="border p-2 text-center cursor-pointer"
//                                             style={{
//                                                 backgroundColor: inProject ? '#DBEAFE' : '',
//                                                 width: CELL_WIDTH,
//                                                 minWidth: CELL_WIDTH,
//                                                 maxWidth: CELL_WIDTH
//                                             }}
//                                             onClick={() => handleCellClick(row, date)}
//                                         >
//                                             {isStart ? row.projNo : ''}
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}
//         </div>
//     );
// }

// export default ReviewSch;



// import React, { useState, useEffect, useRef } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';

// function ReviewSch({ scheduleData }) {
//     const CELL_WIDTH = "32px";
//     const PLACE_COLUMN_WIDTH = "100px";
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false);
//     const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
//     const [currentSpeedMultiplier, setcurrentSpeedMultiplier] = useState(100); // Default speed
//     const [zoomLevel, setZoomLevel] = useState(1); // Default zoom
//     const [contextMenu, setContextMenu] = useState({
//         visible: false,
//         x: 0,
//         y: 0,
//         tagNo: null
//     });

//     const tableContainerRef = useRef(null);
//     const today = new Date();
//     const [startDate, setStartDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [endDate, setEndDate] = useState(new Date(Date.UTC(2025, 11, 31)));
//     const [currentDate, setCurrentDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [isPlaying, setIsPlaying] = useState(false);

//     // const speedOptions = [
//     //     { label: '0.5x', value: 200 },
//     //     { label: '1x', value: 100 },
//     //     { label: '2x', value: 50 },
//     //     { label: '4x', value: 1 }
//     // ];


//     // const speedOptions = [
//     //     { label: '0.5x', value: 200, daysToJump: 1 },
//     //     { label: '1x', value: 100, daysToJump: 3 },
//     //     { label: '2x', value: 50, daysToJump: 8 },
//     //     { label: '4x', value: 1, daysToJump: 15 }
//     // ];

//     const speedOptions = [
//         { label: '0.5x', multiplier: 0.5 },
//         { label: '1x', multiplier: 1 },
//         { label: '2x', multiplier: 2 },
//         { label: '4x', multiplier: 4 }
//     ];
//     const handleZoomIn = () => {
//         setZoomLevel(prev => Math.min(prev + 0.1, 2));
//     };

//     const handleZoomOut = () => {
//         setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
//     };

//     // Your existing useEffect for data loading
//     useEffect(() => {
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             const groupedByPlace = _.groupBy(scheduleData, 'place');
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj,
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     // Modified animation effect with speed control
//     // useEffect(() => {
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });
//     //             animationFrameId = setTimeout(() => {
//     //                 requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };
//     //         animate();
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             clearTimeout(animationFrameId);
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // useEffect(() => {
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 // Calculate days to jump based on speed
//     //                 const daysToJump = animationSpeed <= 25 ? 2 : 1; // Jump 2 days at faster speeds
//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });
//     //             animationFrameId = setTimeout(() => {
//     //                 requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };
//     //         animate();
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             clearTimeout(animationFrameId);
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // useEffect(() => {
//     //     let animationFrameId;
//     //     let timeoutId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 const daysToJump = animationSpeed <= 25 ? 8 : 1;
//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });

//     //             // Clear existing timeout before setting a new one
//     //             if (timeoutId) {
//     //                 clearTimeout(timeoutId);
//     //             }

//     //             timeoutId = setTimeout(() => {
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };

//     //         animate();
//     //     }

//     //     return () => {
//     //         if (timeoutId) {
//     //             clearTimeout(timeoutId);
//     //         }
//     //         if (animationFrameId) {
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]); // Make sure animationSpeed is in dependencies

//     // useEffect(() => {
//     //     if (isPlaying) {
//     //         let lastTimestamp = null;
//     //         let animationFrameId;

//     //         const animate = (timestamp) => {
//     //             if (!lastTimestamp) {
//     //                 lastTimestamp = timestamp;
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //                 return;
//     //             }

//     //             const deltaTime = timestamp - lastTimestamp;
//     //             // Adjust the time step calculation
//     //             const timeStep = (deltaTime * currentSpeedMultiplier) / (24 * 60 * 60);

//     //             setCurrentDate(prevDate => {
//     //                 const newTime = prevDate.getTime() + timeStep;

//     //                 // Check if we've reached the end date
//     //                 if (newTime >= endDate.getTime()) {
//     //                     setIsPlaying(false);
//     //                     return endDate;
//     //                 }

//     //                 return new Date(newTime);
//     //             });

//     //             lastTimestamp = timestamp;

//     //             if (isPlaying) {
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             }
//     //         };

//     //         animationFrameId = requestAnimationFrame(animate);

//     //         return () => {
//     //             if (animationFrameId) {
//     //                 cancelAnimationFrame(animationFrameId);
//     //             }
//     //         };
//     //     }
//     // }, [isPlaying, endDate, currentSpeedMultiplier]);



//     // useEffect(() => {
//     //     if (isPlaying) {
//     //         let lastTimestamp = null;
//     //         let animationFrameId;

//     //         const interpolateTime = (current, target, factor) => {
//     //             return current + (target - current) * factor;
//     //         };

//     //         const animate = (timestamp) => {
//     //             if (!lastTimestamp) {
//     //                 lastTimestamp = timestamp;
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //                 return;
//     //             }

//     //             const deltaTime = timestamp - lastTimestamp;
//     //             const timeStep = (deltaTime * currentSpeedMultiplier) / (24 * 60 * 60);

//     //             setCurrentDate(prevDate => {
//     //                 const smoothFactor = 0.1; // Adjust this value for different smoothing levels
//     //                 const targetTime = prevDate.getTime() + timeStep;
//     //                 const interpolatedTime = interpolateTime(prevDate.getTime(), targetTime, smoothFactor);

//     //                 // Check if we've reached the end date
//     //                 if (interpolatedTime >= endDate.getTime()) {
//     //                     setIsPlaying(false);
//     //                     return endDate;
//     //                 }

//     //                 return new Date(interpolatedTime);
//     //             });

//     //             lastTimestamp = timestamp;

//     //             if (isPlaying) {
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             }
//     //         };

//     //         animationFrameId = requestAnimationFrame(animate);

//     //         return () => {
//     //             if (animationFrameId) {
//     //                 cancelAnimationFrame(animationFrameId);
//     //             }
//     //         };
//     //     }
//     // }, [isPlaying, endDate, currentSpeedMultiplier]);


//     useEffect(() => {
//         if (isPlaying) {
//             let lastTimestamp = null;
//             let animationFrameId;

//             const animate = (timestamp) => {
//                 if (!lastTimestamp) {
//                     lastTimestamp = timestamp;
//                     animationFrameId = requestAnimationFrame(animate);
//                     return;
//                 }

//                 const deltaTime = timestamp - lastTimestamp;
//                 // Convert to milliseconds and apply speed multiplier
//                 const millisecondsPerDay = 24 * 60 * 60 * 1000;
//                 const timeStep = (deltaTime * currentSpeedMultiplier * millisecondsPerDay) / 1000;

//                 setCurrentDate(prevDate => {
//                     const newTime = prevDate.getTime() + timeStep;

//                     if (newTime >= endDate.getTime()) {
//                         setIsPlaying(false);
//                         return endDate;
//                     }

//                     return new Date(newTime);
//                 });

//                 lastTimestamp = timestamp;

//                 if (isPlaying) {
//                     animationFrameId = requestAnimationFrame(animate);
//                 }
//             };

//             animationFrameId = requestAnimationFrame(animate);

//             return () => {
//                 if (animationFrameId) {
//                     cancelAnimationFrame(animationFrameId);
//                 }
//             };
//         }
//     }, [isPlaying, endDate, currentSpeedMultiplier]);


//     //     useEffect(() => {
//     //         let animationFrameId;
//     //         let lastTimestamp = 0;
//     //         const msPerHour = 60 * 60 * 1000;

//     //         if (isPlaying) {
//     //             const animate = (timestamp) => {
//     //                 if (!lastTimestamp) lastTimestamp = timestamp;
//     //                 const deltaTime = timestamp - lastTimestamp;

//     //                 setCurrentDate(prevDate => {
//     //                     const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
//     //                     const hoursToJump = currentSpeed ? (currentSpeed.daysToJump * 24 * deltaTime) / 1000 : 1;
//     //                     const timeToEndDate = endDate.getTime() - prevDate.getTime();

//     //                     // If we're very close to the end date, snap to it
//     //                     if (timeToEndDate <= msPerHour) {
//     //                         setIsPlaying(false);
//     //                         return new Date(endDate);
//     //                     }

//     //                     const newTime = prevDate.getTime() + (hoursToJump * msPerHour);
//     //                     const newDate = new Date(newTime);

//     //                     // Check if we would overshoot
//     //                     if (newDate > endDate) {
//     //                         setIsPlaying(false);
//     //                         return new Date(endDate);
//     //                     }

//     //                     return newDate;
//     //                 });

//     //                 lastTimestamp = timestamp;
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             };

//     //             animationFrameId = requestAnimationFrame(animate);
//     //         }


//     // }, [isPlaying, endDate, animationSpeed]);

//     // useEffect(() => {
//     //     let animationFrameId;
//     //     let timeoutId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 // Calculate days to jump based on speed setting
//     //                 let daysToJump;
//     //                 switch (animationSpeed) {
//     //                     case 1: // 64x
//     //                         daysToJump = 8;
//     //                         break;
//     //                     case 3: // 32x
//     //                         daysToJump = 6;
//     //                         break;
//     //                     case 5: // 16x
//     //                         daysToJump = 4;
//     //                         break;
//     //                     case 10: // 8x
//     //                         daysToJump = 3;
//     //                         break;
//     //                     case 25: // 4x
//     //                         daysToJump = 2;
//     //                         break;
//     //                     default:
//     //                         daysToJump = 1;
//     //                 }

//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });

//     //             if (timeoutId) {
//     //                 clearTimeout(timeoutId);
//     //             }

//     //             timeoutId = setTimeout(() => {
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };

//     //         animate();
//     //     }

//     //     return () => {
//     //         if (timeoutId) {
//     //             clearTimeout(timeoutId);
//     //         }
//     //         if (animationFrameId) {
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     //     const FRAME_DURATION = 1000 / 60; // ~16.67ms for 60fps

//     // useEffect(() => {
//     //     let lastFrameTime = 0;
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = (currentTime) => {
//     //             if (!lastFrameTime) lastFrameTime = currentTime;

//     //             const deltaTime = currentTime - lastFrameTime;
//     //             lastFrameTime = currentTime;

//     //             setCurrentDate(prevDate => {
//     //                 const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
//     //                 const daysPerSecond = (currentSpeed ? currentSpeed.daysToJump : 1) / currentSpeed.value;
//     //                 const oneDayInMs = 24 * 60 * 60 * 1000;

//     //                 // Calculate the fraction of a day to move based on elapsed time
//     //                 const dayFraction = (deltaTime / 1000) * daysPerSecond;
//     //                 const timeIncrement = oneDayInMs * dayFraction;

//     //                 const timeToEndDate = endDate.getTime() - prevDate.getTime();

//     //                 // If we're very close to the end date, snap to it
//     //                 if (timeToEndDate <= timeIncrement) {
//     //                     setIsPlaying(false);
//     //                     return new Date(endDate);
//     //                 }

//     //                 const newTime = prevDate.getTime() + timeIncrement;

//     //                 // Check if we would overshoot
//     //                 if (newTime > endDate.getTime()) {
//     //                     setIsPlaying(false);
//     //                     return new Date(endDate);
//     //                 }

//     //                 return new Date(newTime);
//     //             });

//     //             animationFrameId = requestAnimationFrame(animate);
//     //         };

//     //         animationFrameId = requestAnimationFrame(animate);
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // Your existing useEffect for scrolling
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             tableContainerRef.current.scrollLeft = centeredScrollPosition;
//         }
//     }, [currentDate, dates]);

//     // Your existing handlers
//     const handleStartDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newStartDate = new Date(Date.UTC(year, month - 1, day));
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate);
//         setIsPlaying(false);
//     };

//     const handleEndDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newEndDate = new Date(Date.UTC(year, month - 1, day));
//         setEndDate(newEndDate);
//     };

//     const handlePlayClick = () => {
//         if (!isPlaying) {
//             if (currentDate.getTime() >= endDate.getTime()) {
//                 setCurrentDate(startDate);
//             }
//             setIsPlaying(true);
//         } else {
//             setIsPlaying(false);
//         }
//     };

//     // Your other existing handlers and helper functions...
//     const isToday = (date) => {
//         const currentDate = new Date();
//         return date.getDate() === currentDate.getDate() &&
//             date.getMonth() === currentDate.getMonth() &&
//             date.getFullYear() === currentDate.getFullYear();
//     };

//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true);
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = () => {
//         setupdatepage(true);
//     };



//     return (
//         // <div className='dashboard'>
//         //     <div className="slider-container p-4 bg-gray-100 mb-4">
//         //         <div className="flex gap-4 items-center mb-4">
//         //             <div>
//         //                 <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//         //                 <input
//         //                     type="date"
//         //                     value={startDate.toISOString().split('T')[0]}
//         //                     onChange={handleStartDateChange}
//         //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
//         //                 />
//         //             </div>
//         //             <div>
//         //                 <label className="block text-sm font-medium text-gray-700">End Date:</label>
//         //                 <input
//         //                     type="date"
//         //                     value={endDate.toISOString().split('T')[0]}
//         //                     onChange={handleEndDateChange}
//         //                     className="mt-1 block rounded-md border-gray-300 shadow-sm"
//         //                 />
//         //             </div>
//         //             <div className="flex items-center gap-2">
//         //                 {speedOptions.map((option) => (
//         //                     <button
//         //                         key={option.value}
//         //                         onClick={() => setAnimationSpeed(option.value)}
//         //                         className={`px-2 py-1 rounded ${animationSpeed === option.value
//         //                                 ? 'bg-blue-500 text-white'
//         //                                 : 'bg-gray-200 hover:bg-gray-300'
//         //                             }`}
//         //                     >
//         //                         {option.label}
//         //                     </button>
//         //                 ))}
//         //             </div>
//         //             <button
//         //                 onClick={handlePlayClick}
//         //                 className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//         //             >
//         //                 {isPlaying ? '⏸️' : '▶️'}
//         //             </button>
//         //             {/* <div className="flex items-center gap-2 ml-4">
//         //                 <button
//         //                     onClick={handleZoomOut}
//         //                     className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
//         //                 >
//         //                     🔍-
//         //                 </button>
//         //                 <span className="mx-2">{Math.round(zoomLevel * 100)}%</span>
//         //                 <button
//         //                     onClick={handleZoomIn}
//         //                     className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
//         //                 >
//         //                     🔍+
//         //                 </button>
//         //             </div> */}
//         //         </div>
//         //         <input
//         //             type="range"
//         //             min={startDate.getTime()}
//         //             max={endDate.getTime()}
//         //             value={currentDate.getTime()}
//         //             onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//         //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//         //         />
//         //         <div className="text-center mt-2">
//         //             Current Date: {currentDate.toLocaleDateString()}
//         //         </div>
//         //     </div>
//         //     <div
//         //         ref={tableContainerRef}
//         //         className="overflow-x-auto"
//         //         style={{
//         //             maxWidth: "100vw",
//         //             overflowX: "auto",
//         //             whiteSpace: "nowrap",
//         //             position: "relative",
//         //             transform: `scale(${zoomLevel})`,
//         //             transformOrigin: 'top left',
//         //             transition: 'transform 0.2s ease'
//         //         }}
//         //     >
//         //         <div style={{
//         //             position: 'absolute',
//         //             left: `${dates.findIndex(date =>
//         //                 date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//         //             ) * 32 + 280}px`,
//         //             top: '0',
//         //             bottom: '0',
//         //             width: '2px',
//         //             backgroundColor: 'red',
//         //             zIndex: 1000,
//         //             pointerEvents: 'none',
//         //             transition: 'left 0.3s ease'
//         //         }} />

//         //         <table className="border-collapse" style={{ width: "2500px" }}>
//         //             <thead>
//         //                 <tr>
//         //                     <th className="border p-2 bg-gray-50 text-left">
//         //                         {getCurrentDate()}
//         //                         <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//         //                     </th>
//         //                     {monthRanges.map((month, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             colSpan={month.colSpan}
//         //                             className="border p-2 bg-orange-100 text-center font-bold"
//         //                         >
//         //                             {month.month}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //                 <tr>
//         //                     <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
//         //                         PLACE
//         //                     </th>

//         //                     {dates.map((date, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             className="border p-2 bg-gray-50 text-center w-8 font-bold"
//         //                             style={{
//         //                                 backgroundColor: isToday(date) ? '#FFA500' : ''
//         //                             }}
//         //                         >
//         //                             {date.getDate()}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //                 <tr>

//         //                     {dates.map((date, idx) => (
//         //                         <th
//         //                             key={idx}
//         //                             className="border p-2 bg-gray-50 text-center font-bold"
//         //                             style={{
//         //                                 backgroundColor: isToday(date) ? '#FFA500' : ''
//         //                             }}
//         //                         >
//         //                             {date.toLocaleString('default', { weekday: 'short' })[0]}
//         //                         </th>
//         //                     ))}
//         //                 </tr>
//         //             </thead>
//         //             <tbody>
//         //                 {gridData.map((row, rowIdx) => (
//         //                     <tr key={rowIdx}>
//         //                         {row.isFirstInGroup && (
//         //                             <td
//         //                                 rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//         //                                 className="border p-2 font-medium bg-white"
//         //                             >
//         //                                 {row.place}
//         //                             </td>
//         //                         )}
//         //                         {dates.map((date, colIdx) => {
//         //                             const inProject = isDateInProject(row, date);
//         //                             const isStart = isProjectStartDate(row, date);
//         //                             // const isCurrentDate = new Date(date).setHours(0,0,0,0) === 
//         //                             // new Date(currentDate).setHours(0,0,0,0);
//         //                             return (
//         //                                 <td
//         //                                     key={colIdx}
//         //                                     className="border p-2 text-center cursor-pointer"
//         //                                     style={{
//         //                                         backgroundColor: inProject ? '#DBEAFE' : ''
//         //                                     }}
//         //                                     onClick={() => handleCellClick(row, date)}
//         //                                 >
//         //                                     {isStart ? row.projNo : ''}

//         //                                 </td>
//         //                             );
//         //                         })}
//         //                     </tr>
//         //                 ))}
//         //             </tbody>
//         //         </table>
//         //     </div>
//         //     {updatepage && (
//         //         <ScheduleUpdate
//         //             schedule={selectedSchedule}
//         //             onClose={() => setSelectedSchedule(null)}
//         //             scheduleData={scheduleData}
//         //         />
//         //     )}
//         // </div>

//         <div className='dashboard'>
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={handleStartDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={handleEndDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div className="flex items-center gap-2">
//                         {speedOptions.map((option) => (
//                             // <button
//                             //     key={option.value}
//                             //     onClick={() => setcurrentSpeedMultiplier(option.multiplier)}
//                             //     className={`px-2 py-1 rounded ${currentSpeedMultiplier === option.multiplier
//                             //         ? 'bg-blue-500 text-white'
//                             //         : 'bg-gray-200 hover:bg-gray-300'
//                             //         }`}
//                             // >
//                             //     {option.label}
//                             // </button>
//                             <button
//                                 key={option.label}
//                                 onClick={() => setcurrentSpeedMultiplier(option.multiplier)}
//                                 className={`px-2 py-1 rounded ${currentSpeedMultiplier === option.multiplier
//                                     ? 'bg-blue-500 text-white'
//                                     : 'bg-gray-200 hover:bg-gray-300'
//                                     }`}
//                             >
//                                 {option.label}
//                             </button>
//                         ))}
//                     </div>
//                     <button
//                         onClick={handlePlayClick}
//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             <div
//                 ref={tableContainerRef}
//                 className="overflow-x-auto"
//                 style={{
//                     maxWidth: "100vw",
//                     overflowX: "auto",
//                     whiteSpace: "nowrap",
//                     position: "relative",
//                     transform: `scale(${zoomLevel})`,
//                     transformOrigin: 'top left',
//                     transition: 'transform 0.2s ease'
//                 }}
//             >
//                 {/* <div style={{
//                     position: 'absolute',
//                     left: `${dates.findIndex(date =>
//                         date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                     ) * parseInt(CELL_WIDTH) + parseInt(PLACE_COLUMN_WIDTH)}px`,
//                     top: '0',
//                     bottom: '0',
//                     width: '2px',
//                     backgroundColor: 'red',
//                     zIndex: 1000,
//                     pointerEvents: 'none',
//                     transition: 'left 0.3s ease'
//                 }} /> */}


//                 <div style={{
//                     position: 'absolute',
//                     left: `${dates.findIndex(date =>
//                         date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                     ) * parseInt(CELL_WIDTH) + parseInt(PLACE_COLUMN_WIDTH)}px`,
//                     top: '0',
//                     bottom: '0',
//                     width: '2px',
//                     backgroundColor: 'red',
//                     zIndex: 1000,
//                     pointerEvents: 'none',
//                     transition: 'left 0.1s linear' // Changed from 0.3s ease
//                 }} />

//                 <table className="border-collapse" style={{ width: "2500px", tableLayout: "fixed" }}>
//                     <thead>
//                         <tr>
//                             <th
//                                 className="border p-2 bg-gray-50 text-left"
//                                 style={{
//                                     width: PLACE_COLUMN_WIDTH,
//                                     minWidth: PLACE_COLUMN_WIDTH
//                                 }}
//                             >
//                                 {getCurrentDate()}
//                                 <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//                             </th>
//                             {monthRanges.map((month, idx) => (
//                                 <th
//                                     key={idx}
//                                     colSpan={month.colSpan}
//                                     className="border p-2 bg-orange-100 text-center font-bold"
//                                     style={{
//                                         width: `${month.colSpan * parseInt(CELL_WIDTH)}px`
//                                     }}
//                                 >
//                                     {month.month}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             <th
//                                 rowSpan={2}
//                                 className="border p-2 bg-gray-50 text-center font-bold"
//                                 style={{
//                                     width: PLACE_COLUMN_WIDTH,
//                                     minWidth: PLACE_COLUMN_WIDTH
//                                 }}
//                             >
//                                 PLACE
//                             </th>
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : '',
//                                         width: CELL_WIDTH,
//                                         minWidth: CELL_WIDTH,
//                                         maxWidth: CELL_WIDTH
//                                     }}
//                                 >
//                                     {date.getDate()}
//                                 </th>
//                             ))}
//                         </tr>
//                         <tr>
//                             {dates.map((date, idx) => (
//                                 <th
//                                     key={idx}
//                                     className="border p-2 bg-gray-50 text-center font-bold"
//                                     style={{
//                                         backgroundColor: isToday(date) ? '#FFA500' : '',
//                                         width: CELL_WIDTH,
//                                         minWidth: CELL_WIDTH,
//                                         maxWidth: CELL_WIDTH
//                                     }}
//                                 >
//                                     {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {gridData.map((row, rowIdx) => (
//                             <tr key={rowIdx}>
//                                 {row.isFirstInGroup && (
//                                     <td
//                                         rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                         className="border p-2 font-medium bg-white"
//                                         style={{
//                                             width: PLACE_COLUMN_WIDTH,
//                                             minWidth: PLACE_COLUMN_WIDTH
//                                         }}
//                                     >
//                                         {row.place}
//                                     </td>
//                                 )}
//                                 {dates.map((date, colIdx) => {
//                                     const inProject = isDateInProject(row, date);
//                                     const isStart = isProjectStartDate(row, date);
//                                     return (
//                                         <td
//                                             key={colIdx}
//                                             className="border p-2 text-center cursor-pointer"
//                                             style={{
//                                                 backgroundColor: inProject ? '#DBEAFE' : '',
//                                                 width: CELL_WIDTH,
//                                                 minWidth: CELL_WIDTH,
//                                                 maxWidth: CELL_WIDTH
//                                             }}
//                                             onClick={() => handleCellClick(row, date)}
//                                         >
//                                             {isStart ? row.projNo : ''}
//                                         </td>
//                                     );
//                                 })}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}
//         </div>
//     );
// }

// export default ReviewSch;


// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import _ from 'lodash';
// import ScheduleUpdate from './ScheduleUpdate';

// function ReviewSch({ scheduleData }) {
//     const CELL_WIDTH = "32px";
//     const PLACE_COLUMN_WIDTH = "100px";
//     const [dates, setDates] = useState([]);
//     const [monthRanges, setMonthRanges] = useState([]);
//     const [gridData, setGridData] = useState([]);
//     const [placeGroups, setPlaceGroups] = useState([]);
//     const [selectedSchedule, setSelectedSchedule] = useState(null);
//     const [updatepage, setupdatepage] = useState(false);
//     const [animationSpeed, setAnimationSpeed] = useState(100);
//     const [isFullView, setIsFullView] = useState(false);
//     const [containerWidth, setContainerWidth] = useState(window.innerWidth);

//     const tableContainerRef = useRef(null);
//     const today = new Date();
//     const [startDate, setStartDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [endDate, setEndDate] = useState(new Date(Date.UTC(2025, 11, 31)));
//     const [currentDate, setCurrentDate] = useState(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
//     const [isPlaying, setIsPlaying] = useState(false);

//     const speedOptions = [
//         { label: '0.5x', value: 200, daysToJump: 1 },
//         { label: '1x', value: 100, daysToJump: 3 },
//         { label: '2x', value: 50, daysToJump: 8 },
//         { label: '4x', value: 1, daysToJump: 15 }
//     ];

//     // Memoized scale factor calculation
//     const scaleFactor = useMemo(() => {
//         if (!isFullView) return 1;
//         const tableWidth = 2500;
//         const padding = 40;
//         return (containerWidth - padding) / tableWidth;
//     }, [isFullView, containerWidth]);

//     // Window resize handler with debounce
//     useEffect(() => {
//         const handleResize = _.debounce(() => {
//             setContainerWidth(window.innerWidth);
//         }, 100);

//         window.addEventListener('resize', handleResize);
//         return () => {
//             handleResize.cancel();
//             window.removeEventListener('resize', handleResize);
//         };
//     }, []);

//     // Your existing useEffect for data loading
//     useEffect(() => {
//         const generateDates = () => {
//             const allDates = [];
//             const startDate = new Date(2025, 0, 1);
//             const endDate = new Date(2030, 11, 31);

//             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                 allDates.push(new Date(d));
//             }
//             return allDates;
//         };

//         const allDates = generateDates();
//         setDates(allDates);

//         const months = _.groupBy(allDates, d =>
//             `${d.getFullYear()}-${d.getMonth()}`
//         );

//         const monthRangeData = Object.entries(months).map(([key, dates]) => {
//             const date = dates[0];
//             return {
//                 month: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
//                 start: dates[0],
//                 end: dates[dates.length - 1],
//                 colSpan: dates.length
//             };
//         });
//         setMonthRanges(monthRangeData);

//         if (scheduleData && scheduleData.length > 0) {
//             const groupedByPlace = _.groupBy(scheduleData, 'place');
//             const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
//                 place,
//                 projects: projects.map(proj => ({
//                     ...proj,
//                     start: new Date(proj.startDate),
//                     end: new Date(proj.endDate)
//                 }))
//             }));

//             const placeGroupsData = transformedData.map(({ place, projects }) => ({
//                 place,
//                 rowspan: projects.length,
//                 projects
//             }));
//             setPlaceGroups(placeGroupsData);

//             const flattenedData = placeGroupsData.flatMap(group =>
//                 group.projects.map(project => ({
//                     ...project,
//                     place: group.place,
//                     isFirstInGroup: group.projects.indexOf(project) === 0
//                 }))
//             );
//             setGridData(flattenedData);
//         }
//     }, [scheduleData]);

//     // Modified animation effect with speed control
//     // useEffect(() => {
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 const newDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });
//     //             animationFrameId = setTimeout(() => {
//     //                 requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };
//     //         animate();
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             clearTimeout(animationFrameId);
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // useEffect(() => {
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 // Calculate days to jump based on speed
//     //                 const daysToJump = animationSpeed <= 25 ? 2 : 1; // Jump 2 days at faster speeds
//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });
//     //             animationFrameId = setTimeout(() => {
//     //                 requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };
//     //         animate();
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             clearTimeout(animationFrameId);
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // useEffect(() => {
//     //     let animationFrameId;
//     //     let timeoutId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 const daysToJump = animationSpeed <= 25 ? 8 : 1;
//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });

//     //             // Clear existing timeout before setting a new one
//     //             if (timeoutId) {
//     //                 clearTimeout(timeoutId);
//     //             }

//     //             timeoutId = setTimeout(() => {
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };

//     //         animate();
//     //     }

//     //     return () => {
//     //         if (timeoutId) {
//     //             clearTimeout(timeoutId);
//     //         }
//     //         if (animationFrameId) {
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]); // Make sure animationSpeed is in dependencies

//     useEffect(() => {
//         let animationFrameId;
//         let timeoutId;

//         if (isPlaying) {
//             const animate = () => {
//                 setCurrentDate(prevDate => {
//                     const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
//                     const daysToJump = currentSpeed ? currentSpeed.daysToJump : 1;
//                     const timeToEndDate = endDate.getTime() - prevDate.getTime();
//                     const oneDayInMs = 24 * 60 * 60 * 1000;

//                     if (timeToEndDate <= (daysToJump * oneDayInMs)) {
//                         setIsPlaying(false);
//                         return new Date(endDate);
//                     }

//                     const newDate = new Date(prevDate.getTime() + (oneDayInMs * daysToJump));
//                     if (newDate > endDate) {
//                         setIsPlaying(false);
//                         return new Date(endDate);
//                     }

//                     return newDate;
//                 });

//                 timeoutId = setTimeout(() => {
//                     animationFrameId = requestAnimationFrame(animate);
//                 }, animationSpeed);
//             };

//             animate();
//         }

//         return () => {
//             if (timeoutId) clearTimeout(timeoutId);
//             if (animationFrameId) cancelAnimationFrame(animationFrameId);
//         };
//     }, [isPlaying, endDate, animationSpeed, speedOptions]);

//     //     useEffect(() => {
//     //         let animationFrameId;
//     //         let lastTimestamp = 0;
//     //         const msPerHour = 60 * 60 * 1000;

//     //         if (isPlaying) {
//     //             const animate = (timestamp) => {
//     //                 if (!lastTimestamp) lastTimestamp = timestamp;
//     //                 const deltaTime = timestamp - lastTimestamp;

//     //                 setCurrentDate(prevDate => {
//     //                     const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
//     //                     const hoursToJump = currentSpeed ? (currentSpeed.daysToJump * 24 * deltaTime) / 1000 : 1;
//     //                     const timeToEndDate = endDate.getTime() - prevDate.getTime();

//     //                     // If we're very close to the end date, snap to it
//     //                     if (timeToEndDate <= msPerHour) {
//     //                         setIsPlaying(false);
//     //                         return new Date(endDate);
//     //                     }

//     //                     const newTime = prevDate.getTime() + (hoursToJump * msPerHour);
//     //                     const newDate = new Date(newTime);

//     //                     // Check if we would overshoot
//     //                     if (newDate > endDate) {
//     //                         setIsPlaying(false);
//     //                         return new Date(endDate);
//     //                     }

//     //                     return newDate;
//     //                 });

//     //                 lastTimestamp = timestamp;
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             };

//     //             animationFrameId = requestAnimationFrame(animate);
//     //         }


//     // }, [isPlaying, endDate, animationSpeed]);

//     // useEffect(() => {
//     //     let animationFrameId;
//     //     let timeoutId;

//     //     if (isPlaying) {
//     //         const animate = () => {
//     //             setCurrentDate(prevDate => {
//     //                 // Calculate days to jump based on speed setting
//     //                 let daysToJump;
//     //                 switch (animationSpeed) {
//     //                     case 1: // 64x
//     //                         daysToJump = 8;
//     //                         break;
//     //                     case 3: // 32x
//     //                         daysToJump = 6;
//     //                         break;
//     //                     case 5: // 16x
//     //                         daysToJump = 4;
//     //                         break;
//     //                     case 10: // 8x
//     //                         daysToJump = 3;
//     //                         break;
//     //                     case 25: // 4x
//     //                         daysToJump = 2;
//     //                         break;
//     //                     default:
//     //                         daysToJump = 1;
//     //                 }

//     //                 const newDate = new Date(prevDate.getTime() + (24 * 60 * 60 * 1000 * daysToJump));
//     //                 if (newDate > endDate) {
//     //                     setIsPlaying(false);
//     //                     return prevDate;
//     //                 }
//     //                 return newDate;
//     //             });

//     //             if (timeoutId) {
//     //                 clearTimeout(timeoutId);
//     //             }

//     //             timeoutId = setTimeout(() => {
//     //                 animationFrameId = requestAnimationFrame(animate);
//     //             }, animationSpeed);
//     //         };

//     //         animate();
//     //     }

//     //     return () => {
//     //         if (timeoutId) {
//     //             clearTimeout(timeoutId);
//     //         }
//     //         if (animationFrameId) {
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     //     const FRAME_DURATION = 1000 / 60; // ~16.67ms for 60fps

//     // useEffect(() => {
//     //     let lastFrameTime = 0;
//     //     let animationFrameId;

//     //     if (isPlaying) {
//     //         const animate = (currentTime) => {
//     //             if (!lastFrameTime) lastFrameTime = currentTime;

//     //             const deltaTime = currentTime - lastFrameTime;
//     //             lastFrameTime = currentTime;

//     //             setCurrentDate(prevDate => {
//     //                 const currentSpeed = speedOptions.find(option => option.value === animationSpeed);
//     //                 const daysPerSecond = (currentSpeed ? currentSpeed.daysToJump : 1) / currentSpeed.value;
//     //                 const oneDayInMs = 24 * 60 * 60 * 1000;

//     //                 // Calculate the fraction of a day to move based on elapsed time
//     //                 const dayFraction = (deltaTime / 1000) * daysPerSecond;
//     //                 const timeIncrement = oneDayInMs * dayFraction;

//     //                 const timeToEndDate = endDate.getTime() - prevDate.getTime();

//     //                 // If we're very close to the end date, snap to it
//     //                 if (timeToEndDate <= timeIncrement) {
//     //                     setIsPlaying(false);
//     //                     return new Date(endDate);
//     //                 }

//     //                 const newTime = prevDate.getTime() + timeIncrement;

//     //                 // Check if we would overshoot
//     //                 if (newTime > endDate.getTime()) {
//     //                     setIsPlaying(false);
//     //                     return new Date(endDate);
//     //                 }

//     //                 return new Date(newTime);
//     //             });

//     //             animationFrameId = requestAnimationFrame(animate);
//     //         };

//     //         animationFrameId = requestAnimationFrame(animate);
//     //     }

//     //     return () => {
//     //         if (animationFrameId) {
//     //             cancelAnimationFrame(animationFrameId);
//     //         }
//     //     };
//     // }, [isPlaying, endDate, animationSpeed]);


//     // Your existing useEffect for scrolling
//     useEffect(() => {
//         if (!tableContainerRef.current || dates.length === 0) return;

//         const currentDateIndex = dates.findIndex(date => {
//             const dateTime = new Date(date).setHours(0, 0, 0, 0);
//             const currentDateTime = new Date(currentDate).setHours(0, 0, 0, 0);
//             return dateTime === currentDateTime;
//         });

//         if (currentDateIndex !== -1) {
//             const cellWidth = 32;
//             const scrollPosition = (currentDateIndex * cellWidth);
//             const containerWidth = tableContainerRef.current.offsetWidth;
//             const centeredScrollPosition = scrollPosition - (containerWidth / 2) + cellWidth;

//             // Use transform for smooth animation instead of scrollLeft
//             if (tableContainerRef.current) {
//                 const transformX = -centeredScrollPosition * (isFullView ? scaleFactor : 1);
//                 tableContainerRef.current.style.transform = `translateX(${transformX}px)`;
//             }
//         }
//     }, [currentDate, dates, isFullView, scaleFactor]);

//     // Your existing handlers
//     const handleStartDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newStartDate = new Date(Date.UTC(year, month - 1, day));
//         setStartDate(newStartDate);
//         setCurrentDate(newStartDate);
//         setIsPlaying(false);
//     };

//     const handleEndDateChange = (e) => {
//         const dateStr = e.target.value;
//         const [year, month, day] = dateStr.split('-').map(Number);
//         const newEndDate = new Date(Date.UTC(year, month - 1, day));
//         setEndDate(newEndDate);
//     };

//     const handlePlayClick = () => {
//         if (!isPlaying) {
//             if (currentDate.getTime() >= endDate.getTime()) {
//                 setCurrentDate(startDate);
//             }
//             setIsPlaying(true);
//         } else {
//             setIsPlaying(false);
//         }
//     };

//     // Your other existing handlers and helper functions...
//     const isToday = (date) => {
//         const currentDate = new Date();
//         return date.getDate() === currentDate.getDate() &&
//             date.getMonth() === currentDate.getMonth() &&
//             date.getFullYear() === currentDate.getFullYear();
//     };

//     const isProjectStartDate = (project, date) => {
//         return date.getFullYear() === project.start.getFullYear() &&
//             date.getMonth() === project.start.getMonth() &&
//             date.getDate() === project.start.getDate();
//     };

//     const isDateInProject = (project, date) => {
//         const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
//         const normalizedDate = normalizeDate(date);
//         const normalizedStart = normalizeDate(project.start);
//         const normalizedEnd = normalizeDate(project.end);
//         return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
//     };

//     const handleCellClick = (row, date) => {
//         if (isDateInProject(row, date)) {
//             const schedule = scheduleData.find(item =>
//                 item.projNo === row.projNo &&
//                 item.place === row.place
//             );
//             if (schedule) {
//                 setupdatepage(true);
//                 setSelectedSchedule(schedule);
//             }
//         }
//     };

//     const getCurrentDate = () => {
//         const today = new Date();
//         return today.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     };

//     const handleEditOpen = () => {
//         setupdatepage(true);
//     };

//     return (

//         <div className='dashboard'>
//             <div className="slider-container p-4 bg-gray-100 mb-4">
//                 <div className="flex gap-4 items-center mb-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Start Date:</label>
//                         <input
//                             type="date"
//                             value={startDate.toISOString().split('T')[0]}
//                             onChange={handleStartDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">End Date:</label>
//                         <input
//                             type="date"
//                             value={endDate.toISOString().split('T')[0]}
//                             onChange={handleEndDateChange}
//                             className="mt-1 block rounded-md border-gray-300 shadow-sm"
//                         />
//                     </div>
//                     <div className="flex items-center gap-2">
//                         {speedOptions.map((option) => (
//                             <button
//                                 key={option.value}
//                                 onClick={() => setAnimationSpeed(option.value)}
//                                 className={`px-2 py-1 rounded ${animationSpeed === option.value
//                                     ? 'bg-blue-500 text-white'
//                                     : 'bg-gray-200 hover:bg-gray-300'
//                                     }`}
//                             >
//                                 {option.label}
//                             </button>
//                         ))}
//                     </div>
//                     <button
//                         onClick={handlePlayClick}
//                         className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                     >
//                         {isPlaying ? '⏸️' : '▶️'}
//                     </button>
//                     <button
//                         onClick={() => setIsFullView(!isFullView)}
//                         className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
//                     >
//                         {isFullView ? 'Normal View' : 'Full View'}
//                     </button>
//                 </div>
//                 <input
//                     type="range"
//                     min={startDate.getTime()}
//                     max={endDate.getTime()}
//                     value={currentDate.getTime()}
//                     onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="text-center mt-2">
//                     Current Date: {currentDate.toLocaleDateString()}
//                 </div>
//             </div>
//             <div className="relative w-full overflow-hidden">
//                 <div
//                     ref={tableContainerRef}
//                     className="relative w-full"
//                     style={{
//                         height: isFullView ? '80vh' : 'auto',
//                         transition: 'transform 0.3s ease-out'
//                     }}
//                 >
//                     {/* Red line indicator */}
//                     <div
//                         style={{
//                             position: 'absolute',
//                             left: `${dates.findIndex(date =>
//                                 date.getTime() === new Date(currentDate).setHours(0, 0, 0, 0)
//                             ) * parseInt(CELL_WIDTH) + parseInt(PLACE_COLUMN_WIDTH)}px`,
//                             top: 0,
//                             height: '100%',
//                             width: '2px',
//                             backgroundColor: 'red',
//                             zIndex: 1000,
//                             pointerEvents: 'none',
//                             transform: `scale(${scaleFactor}, 1)`,
//                             transformOrigin: 'top left',
//                             transition: 'left 0.3s ease-out'
//                         }}
//                     />

//                     <div
//                         style={{
//                             transform: `scale(${scaleFactor})`,
//                             transformOrigin: 'top left',
//                             transition: 'transform 0.3s ease-out'
//                         }}
//                     >
//                         <table className="border-collapse" style={{ width: '2500px', tableLayout: "fixed" }}>
//                             <thead>
//                                 <tr>
//                                     <th
//                                         className="border p-2 bg-gray-50 text-left"
//                                         style={{
//                                             width: PLACE_COLUMN_WIDTH,
//                                             minWidth: PLACE_COLUMN_WIDTH
//                                         }}
//                                     >
//                                         {getCurrentDate()}
//                                         <i className="fa-solid fa-pencil" style={{ cursor: 'pointer' }} onClick={handleEditOpen} />
//                                     </th>
//                                     {monthRanges.map((month, idx) => (
//                                         <th
//                                             key={idx}
//                                             colSpan={month.colSpan}
//                                             className="border p-2 bg-orange-100 text-center font-bold"
//                                             style={{
//                                                 width: `${month.colSpan * parseInt(CELL_WIDTH)}px`
//                                             }}
//                                         >
//                                             {month.month}
//                                         </th>
//                                     ))}
//                                 </tr>
//                                 <tr>
//                                     <th
//                                         rowSpan={2}
//                                         className="border p-2 bg-gray-50 text-center font-bold"
//                                         style={{
//                                             width: PLACE_COLUMN_WIDTH,
//                                             minWidth: PLACE_COLUMN_WIDTH
//                                         }}
//                                     >
//                                         PLACE
//                                     </th>
//                                     {dates.map((date, idx) => (
//                                         <th
//                                             key={idx}
//                                             className="border p-2 bg-gray-50 text-center font-bold"
//                                             style={{
//                                                 backgroundColor: isToday(date) ? '#FFA500' : '',
//                                                 width: CELL_WIDTH,
//                                                 minWidth: CELL_WIDTH,
//                                                 maxWidth: CELL_WIDTH
//                                             }}
//                                         >
//                                             {date.getDate()}
//                                         </th>
//                                     ))}
//                                 </tr>
//                                 <tr>
//                                     {dates.map((date, idx) => (
//                                         <th
//                                             key={idx}
//                                             className="border p-2 bg-gray-50 text-center font-bold"
//                                             style={{
//                                                 backgroundColor: isToday(date) ? '#FFA500' : '',
//                                                 width: CELL_WIDTH,
//                                                 minWidth: CELL_WIDTH,
//                                                 maxWidth: CELL_WIDTH
//                                             }}
//                                         >
//                                             {date.toLocaleString('default', { weekday: 'short' })[0]}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {gridData.map((row, rowIdx) => (
//                                     <tr key={rowIdx}>
//                                         {row.isFirstInGroup && (
//                                             <td
//                                                 rowSpan={placeGroups.find(g => g.place === row.place).rowspan}
//                                                 className="border p-2 font-medium bg-white"
//                                                 style={{
//                                                     width: PLACE_COLUMN_WIDTH,
//                                                     minWidth: PLACE_COLUMN_WIDTH
//                                                 }}
//                                             >
//                                                 {row.place}
//                                             </td>
//                                         )}
//                                         {dates.map((date, colIdx) => {
//                                             const inProject = isDateInProject(row, date);
//                                             const isStart = isProjectStartDate(row, date);
//                                             return (
//                                                 <td
//                                                     key={colIdx}
//                                                     className="border p-2 text-center cursor-pointer"
//                                                     style={{
//                                                         backgroundColor: inProject ? '#DBEAFE' : '',
//                                                         width: CELL_WIDTH,
//                                                         minWidth: CELL_WIDTH,
//                                                         maxWidth: CELL_WIDTH
//                                                     }}
//                                                     onClick={() => handleCellClick(row, date)}
//                                                 >
//                                                     {isStart ? row.projNo : ''}
//                                                 </td>
//                                             );
//                                         })}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//             {updatepage && (
//                 <ScheduleUpdate
//                     schedule={selectedSchedule}
//                     onClose={() => setSelectedSchedule(null)}
//                     scheduleData={scheduleData}
//                 />
//             )}
//         </div>
//     );
// }

// export default ReviewSch;