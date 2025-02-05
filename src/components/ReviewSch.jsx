import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import ScheduleUpdate from './ScheduleUpdate';


function ReviewSch({ scheduleData }) {
    const [dates, setDates] = useState([]);
    const [monthRanges, setMonthRanges] = useState([]);
    const [gridData, setGridData] = useState([]);
    const [placeGroups, setPlaceGroups] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [updatepage, setupdatepage] = useState(false)
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        tagNo: null
    });

    useEffect(() => {
        // Generate dates from 2025 to 2030
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

        // Create month ranges with year
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
            // Group the flat data by place
            const groupedByPlace = _.groupBy(scheduleData, 'place');

            // Transform into required format
            const transformedData = Object.entries(groupedByPlace).map(([place, projects]) => ({
                place,
                projects: projects.map(proj => ({
                    ...proj, // Keep all original data
                    start: new Date(proj.startDate),
                    end: new Date(proj.endDate)
                }))
            }));

            // Create place groups with rowspan information
            const placeGroupsData = transformedData.map(({ place, projects }) => ({
                place,
                rowspan: projects.length,
                projects
            }));
            setPlaceGroups(placeGroupsData);

            // Flatten data for grid
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
            // Find the original schedule data for this project
            const schedule = scheduleData.find(item =>
                item.projNo === row.projNo &&
                item.place === row.place
            );
            if (schedule) {
                setupdatepage(true)
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

    const handleEditOpen = (() => {
        setupdatepage(true)
    })
    return (
        <div className='dashboard' >
            <div className="overflow-x-auto" style={{ maxWidth: "100vw", overflowX: "auto", whiteSpace: "nowrap" }}>
                <table className="border-collapse" style={{ width: "2500px" }}>
                    <thead>
                        <tr>
                            <th className="border p-2 bg-gray-50 text-left">
                                {getCurrentDate()}
                                <i className="fa-solid fa-pencil" style={{cursor:'pointer'}} onClick={() => handleEditOpen(gridData)}></i>
                            </th>
                            {monthRanges.map((month, idx) => (
                                <th
                                    key={idx}
                                    colSpan={month.colSpan}
                                    className="border p-2 bg-orange-100 text-center font-bold"
                                >
                                    {month.month}
                                </th>
                            ))}
                            {/* <th><i className="fa-solid fa-pencil" onClick={() => handleEditOpen(gridData)}></i></th> */}
                        </tr>
                        {/* onClick={() => handleEditOpen(index)} */}
                        <tr>
                            <th rowSpan={2} className="border p-2 bg-gray-50 text-center font-bold">
                                PLACE
                            </th>
                            {dates.map((date, idx) => (
                                <th key={idx} className="border p-2 bg-gray-50 text-center w-8 font-bold">
                                    {date.getDate()}
                                </th>
                            ))}
                        </tr>

                        <tr>
                            {dates.map((date, idx) => (
                                <th key={idx} className="border p-2 bg-gray-50 text-center font-bold">
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
                                                backgroundColor: inProject ? '#DBEAFE' : ''
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
            {updatepage && (
                    <ScheduleUpdate
                        schedule={selectedSchedule}
                        onClose={() => setSelectedSchedule(null)}
                        scheduleData={scheduleData}
                    />
                )}
        </div>

        // <div className="w-full bg-white">
        //     {/* Container with fixed height and scrollbars */}
        //     <div className="relative">
        //         {/* Fixed header that doesn't scroll horizontally */}
        //         <div className="sticky top-0 z-10 bg-white">
        //             <div className="border-b font-semibold p-2">
        //                 {getCurrentDate()}
        //             </div>
        //         </div>

        //         {/* Scrollable container */}
        //         <div className="overflow-auto max-h-[calc(100vh-120px)]"
        //             style={{
        //                 overflowX: 'scroll',
        //                 overflowY: 'scroll',
        //                 maxWidth: '100%'
        //             }}>
        //             <table className="border-collapse min-w-[2500px]">
        //                 <thead className="sticky top-0 z-10 bg-white">
        //                     <tr>
        //                         <th className="sticky left-0 z-20 border p-2 bg-gray-50 text-left">
        //                             PLACE
        //                         </th>
        //                         {monthRanges.map((month, idx) => (
        //                             <th
        //                                 key={idx}
        //                                 colSpan={month.colSpan}
        //                                 className="border p-2 bg-orange-100 text-center font-bold whitespace-nowrap"
        //                             >
        //                                 {month.month}
        //                             </th>
        //                         ))}
        //                     </tr>
        //                     <tr>
        //                         <th className="sticky left-0 z-20 border p-2 bg-gray-50"></th>
        //                         {dates.map((date, idx) => (
        //                             <th key={idx} className="border p-2 bg-gray-50 text-center w-8 font-bold">
        //                                 {date.getDate()}
        //                             </th>
        //                         ))}
        //                     </tr>
        //                     <tr>
        //                         <th className="sticky left-0 z-20 border p-2 bg-gray-50"></th>
        //                         {dates.map((date, idx) => (
        //                             <th key={idx} className="border p-2 bg-gray-50 text-center font-bold">
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
        //                                     className="sticky left-0 z-10 border p-2 font-medium bg-white whitespace-nowrap"
        //                                 >
        //                                     {row.place}
        //                                 </td>
        //                             )}
        //                             {dates.map((date, colIdx) => {
        //                                 const inProject = isDateInProject(row, date);
        //                                 const isStart = isProjectStartDate(row, date);
        //                                 return (
        //                                     <td
        //                                         key={colIdx}
        //                                         className="border p-2 text-center cursor-pointer"
        //                                         style={{
        //                                             backgroundColor: inProject ? '#DBEAFE' : '',
        //                                             minWidth: '30px'
        //                                         }}
        //                                         onClick={() => handleCellClick(row, date)}
        //                                     >
        //                                         {isStart ? row.projNo : ''}
        //                                     </td>
        //                                 );
        //                             })}
        //                         </tr>
        //                     ))}
        //                 </tbody>
        //             </table>
        //         </div>
        //     </div>
        // </div>
    )
}

export default ReviewSch