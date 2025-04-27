import * as htmlToImage from 'html-to-image';

import {
    Box,
    Switch,
    FormControlLabel,
    TextField,
    Chip,
    MenuItem,
    Select,
    Autocomplete,
    FormControl,
    NativeSelect,
    InputLabel,
} from '@mui/material';

import { proxy, ref, subscribe, snapshot } from 'valtio';
import { useProxy } from 'valtio/utils';
import React, { useEffect } from "react";


const courseMap = {
    "ENG1100": "Sentence and Their Elements",
    "ENG1203": "Reading and Writing",
    "CSE1101": "Introduction to Computers",
    "GED1202": "Emergence of Bangladesh",
    "MATH1101": "Mathematics I (Differential Calculus and Integral Calculus)",
    "CSE1102": "Structured Programming Language",
    "CSE1157": "Structured Programming Language Lab Works",
    "ENG1102": "English Language-II: Listening & Speaking",
    "CSE1258": "Discrete Mathematics",
    "MATH1302": "Mathematics II (Differential Equation & Fourier Analysis)",
    "CSE2111": "Data Structure",
    "CSE2162": "Data Structure Lab Works",
    "PHY1201": "Physics I (Heat and Thermodynamics, Properties of Matters, Waves and Oscillations)",
    "CSE1307": "Object Oriented Programming I (C++)",
    "CSE1360": "Object-Oriented Programming Lab Work",
    "HUM1301": "Economics",
    "CSE2263": "Algorithm Design and Analysis",
    "CSE2264": "Algorithm Design and Analysis Lab Works",
    "CSE1205": "Electrical Engineering and Circuit Analysis",
    "CSE1259": "Electrical Engineering and Circuit Analysis Lab Work",
    "CSE3168": "Numerical Methods",
    "CSE3186": "Numerical Methods Lab Works",
    "MATH2103": "Mathematics III (Matrices, Vectors & Coordinate Geometry)",
    "PHY1302": "Physics II (Heat and Thermodynamics, Properties of Matters, Waves and Oscillations)",
    "MATH2204": "Mathematics IV (Complex Variable & Laplace Transformation)",
    "CSE2215": "Digital Logic Design",
    "CSE2265": "Digital Logic Design Lab Work",
    "CSE2319": "Database Management System",
    "CSE2367": "Database Management System Lab Works",
    "BANG1101": "Bangla Language & Literature",
    "CSE2109": "Electronic Engineering",
    "CSE2161": "Electronic Engineering Lab Work",
    "CSE1290": "Software Development I (DOS programming)",
    "CSE2291": "Software Development II (Database Programming)",
    "CSE3227": "Data Communication",
    "MATH2305": "Mathematics-V (Statistics and Probability)",
    "CSE3170": "Computer Architecture",
    "CSE3187": "Computer Architecture Lab work",
    "CSE2317": "Digital Electronics & Pulse Technique",
    "CSE2366": "Digital Electronics & Pulse Technique Lab Works",
    "CSE3169": "Theory of Computation",
    "CSE3124": "Microprocessor and Assembly Language programming",
    "CSE3171": "Microprocessor and Assembly Language Programming Lab Work",
    "CSE3230": "Software Engineering",
    "CSE3228": "Compiler Design",
    "CSE3272": "Compiler Design Lab Work",
    "CSE3331": "Operating System",
    "CSE3373": "Operating System Lab Work",
    "ME4102": "Industrial Management",
    "CSE3333": "Object-Oriented Programming II (Java)",
    "CSE3374": "Object-Oriented Programming II Lab Work (Java)",
    "CSE4138": "Computer Peripherals and Interfacing",
    "CSE4177": "Computer Peripherals and Interfacing Lab Work",
    "CSE3226": "Mathematical Analysis for Computer Science",
    "CSE3375": "Communication Engineering",
    "CSE3292": "Software Development III (Web Programming)",
    "CHE2103": "Basic Chemistry",
    "CSE4136": "Computer Networks",
    "CSE4176": "Computer Networks Lab Work",
    "HUM3302": "Financial and Managerial Accounting",
    "CSE4355": "Artificial Intelligence & Expert Systems",
    "CSE4385": "Artificial Intelligence & Expert Systems Lab Works",
    "CSE4278": "Computer Graphics and Multimedia System Design",
    "CSE4288": "Computer Graphics and Multimedia System Design Lab Work",
    "CSE4241": "VLSI Design",
    "CSE4279": "VLSI Design Lab Work",
    "CSE4351": "Image Processing and Computer Vision",
    "CSE4383": "Image Processing and Computer Vision Lab Work",
    "CSE4349": "Management Information System",
    "CSE4000": "Project and Thesis",
    "CSE4389": "Field work (Industrial Training)"
};


function extractRoutine(json) {

    let currentDay = '';
    let timeSlots = [];
    let routine = [];

    function extractTimeSlots(headerRow) {
        return headerRow
            .slice(1)
            .filter((_, index) => index % 3 === 0);
    }

    function processRoomSchedule(roomRow) {
        const courses = [];
        for (let i = 1; i < roomRow.length; i += 3) { // i=1 changable
            if (roomRow[i]) {
                courses.push({
                    timeSlotIndex: Math.floor((i - 1) / 3),
                    course: roomRow[i],
                    section: roomRow[i + 1],
                    teacher: roomRow[i + 2]
                });
            }
        }
        return courses;
    }

    for (let i = 0; i < json.length; i++) {
        const row = json[i];

        if (row.find(cell => ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(cell?.toLowerCase?.()))) {
            currentDay = row[1].toUpperCase(); // maybe find first
            continue;
        }

        if (row.length > 1 && /\d{1,2}:\d{2}\s*(AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)/.test(row[1])) {
            timeSlots = extractTimeSlots(row);
            continue;
        }

        if (row[0] && row[0] !== '' && currentDay) {
            const coursesInRoom = processRoomSchedule(row);
            coursesInRoom.forEach(course => {
                routine.push({
                    day: currentDay,
                    time: timeSlots[course.timeSlotIndex],
                    course: course.course,
                    section: course.section,
                    teacher: course.teacher,
                    room: row[0]
                });
            });
        }
    }

    return routine;
}

function extractRoutineFiltered(json, section = "", teacher = "") {

    let currentDay = '';
    let timeSlots = [];
    let routine = [];

    function extractTimeSlots(headerRow) {
        return headerRow
            .slice(1)
            .filter((_, index) => index % 3 === 0);
    }

    function processRoomSchedule(roomRow) {
        const courses = [];
        for (let i = 1; i < roomRow.length; i += 3) { // i=1 changable
            if (roomRow[i] &&
                (section && roomRow[i + 1]?.toLowerCase() === section?.toLowerCase())
                || (teacher && roomRow[i + 2]?.toLowerCase() === teacher?.toLowerCase())
            ) {
                courses.push({
                    timeSlotIndex: Math.floor((i - 1) / 3),
                    course: roomRow[i],
                    section: roomRow[i + 1],
                    teacher: roomRow[i + 2]
                });
            }
        }
        return courses;
    }

    for (let i = 0; i < json.length; i++) {
        const row = json[i];

        if (row.find(cell => ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(cell?.toLowerCase?.()))) {
            currentDay = row[1].toUpperCase(); // maybe find first
            continue;
        }

        if (row.length > 1 && /\d{1,2}:\d{2}\s*(AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)/.test(row[1])) {
            timeSlots = extractTimeSlots(row);
            continue;
        }

        if (row[0] && row[0] !== '' && currentDay) {
            const coursesInRoom = processRoomSchedule(row);
            coursesInRoom.forEach(course => {
                routine.push({
                    day: currentDay,
                    time: timeSlots[course.timeSlotIndex],
                    course: course.course,
                    section: course.section,
                    teacher: course.teacher,
                    room: row[0]
                });
            });
        }
    }

    return routine;
}

const ScheduleTable = ({ routine, modifiedTime, spreadsheetId }) => {
    const proxyState = useProxy(window.state);

    useEffect(() => {
        if (!localStorage.selectedSection && !localStorage.selectedTeacher) localStorage.selectedSection = '8A';
        proxyState.selectedSection = proxyState.selectedSection || localStorage.selectedSection;
        if (!proxyState.selectedSection) proxyState.selectedTeacher = proxyState.selectedTeacher || localStorage.selectedTeacher;

        let sub = (
            selector, cb
        ) => {
            let oldValue = selector(snapshot(state));
            return subscribe(state, () => {
                const newValue = selector(snapshot(state));
                if (oldValue === newValue) return;
                oldValue = newValue;
                cb(oldValue, selector(state));
            });
        };

        sub(() => state.selectedSection, () => {
            localStorage.selectedSection = state.selectedSection;
        });
        sub(() => state.selectedTeacher, () => {
            localStorage.selectedTeacher = state.selectedTeacher;
        });

    }, []);

    let [info, setInfo] = React.useState('');
    let [isDragging, setIsDragging] = React.useState(false);
    let [startX, setStartX] = React.useState(0);
    let [startY, setStartY] = React.useState(0);
    let [scrollLeft, setScrollLeft] = React.useState(0);
    let [scrollTop, setScrollTop] = React.useState(0);
    let containerRef = React.useRef(null);

    // Mouse drag event handlers for scrolling
    function handleMouseDown(e) {
        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setStartY(e.pageY - containerRef.current.offsetTop);
        setScrollLeft(containerRef.current.scrollLeft);
        setScrollTop(containerRef.current.scrollTop);
        containerRef.current.style.cursor = 'grabbing';
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const x = e.pageX - containerRef.current.offsetLeft;
        const y = e.pageY - containerRef.current.offsetTop;

        // Calculate how far the mouse has moved
        const walkX = (x - startX) * 1.5; // Adjust scrolling speed with multiplier
        const walkY = (y - startY) * 1.5;

        // Update scroll position
        containerRef.current.scrollLeft = scrollLeft - walkX;
        containerRef.current.scrollTop = scrollTop - walkY;
    }

    function handleMouseUp() {
        setIsDragging(false);
        containerRef.current.style.cursor = 'grab';
    }

    function handleMouseLeave() {
        if (isDragging) {
            setIsDragging(false);
            containerRef.current.style.cursor = 'grab';
        }
    }

    let TIME_SLOTS = [
        "8:00 AM - 9:20 AM",
        "9:30 AM - 10:50 AM",
        "11:00 AM - 12:20 PM",
        "1:00 PM - 2:20 PM",
        "2:30 PM - 3:50 PM",
        "4:00 PM - 5:20 PM"
    ];
    let DAYS = [
        "SATURDAY",
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY"
    ];


    const routineData = routine.values;

    DAYS = DAYS.filter(day => {
        return extractRoutineFiltered(routine.values, proxyState.selectedSection, proxyState.selectedTeacher).some(cell => cell.day === day);
    });
    TIME_SLOTS = TIME_SLOTS.filter(time => {
        return extractRoutineFiltered(routine.values, proxyState.selectedSection, proxyState.selectedTeacher).some(cell => cell.time === time);
    });

    const findScheduleItem = (day, time) => {
        const routineDataExtracted = extractRoutineFiltered(routine.values, proxyState.selectedSection, proxyState.selectedTeacher);
        return routineDataExtracted.find(item => item.day === day && item.time === time);
    };
    async function handleDownload(e) {
        e?.preventDefault();
        let ssTable = document.querySelector('.schedule-table').cloneNode(true);
        document.body.appendChild(ssTable);
        // white bg to cover table
        let cover = document.createElement('div');
        cover.style.position = 'fixed';
        cover.style.top = '0';
        cover.style.left = '0';
        cover.style.width = '100vw';
        cover.style.height = '100vh';
        cover.style.background = 'white';
        cover.style.zIndex = '-9999998';
        // document.body.appendChild(cover);
        // make invisible
        ssTable.style.position = 'fixed';
        ssTable.style.zIndex = '-9999999';
        ssTable.style.top = '9999';

        let desiredRes = {
            width: 1920,
            height: 1080
        }
        ssTable.style.transform = `scale(${desiredRes.width / ssTable.getBoundingClientRect().width})`;
        htmlToImage.toPng(ssTable, { width: ssTable.getBoundingClientRect().width, height: ssTable.getBoundingClientRect().height })
            .then(function (dataUrl) {
                ssTable.remove();
                var img = new Image();
                img.src = dataUrl;
                let a = document.createElement('a');
                a.href = dataUrl;
                a.download = 'schedule.png';
                a.click();
            })
            .catch(function (error) {
                console.error('oops, something went wrong!', error);
            });

    }

    React.useEffect(() => {
        const fetchInfo = async () => {
            try {
                setInfo(
                    JSON.parse(await (await fetch('https://nub-live-default-rtdb.asia-southeast1.firebasedatabase.app/online_courses.json')).text()).courses.join(', ')
                );
            } catch (error) {
                console.error("Failed to fetch info data:", error);
                setInfo("Error loading online course information.");
            }
        };
        if (routine) {
            fetchInfo();
        }
    }, [routine]);

    // Set cursor style on mount
    React.useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }
        setUpTable();
        adjustScale();
    }, []);
    subscribe(state, () => {
        ; (async () => {
            await utils.frame(() => document.querySelector('table'));
            // await for visibility 
            await utils.frame(() => document.querySelector('table').offsetHeight);
            adjustScale();
        })()
    });



    const adjustScale = () => {
        let content2 = document.querySelector('.table-container');
        const container = content2.parentElement;
        let content = content2.querySelector('.schedule-table');
        if (container && content) {
            const parentHeight = container.clientHeight;
            const tableHeight = content.scrollHeight; // Natural height of table

            if (tableHeight > 0) {
                const newScaleHeight = parentHeight / tableHeight;
                const newScaleWidth = container.clientWidth / content.clientWidth;
                let newScale = Math.min(newScaleHeight, newScaleWidth);


                // content.style.transition = "left 0.3s ease, top 0.3s ease, transform 0.3s ease";
                content.style.transformOrigin = "top left";
                content.style.left = `${0}px`;
                content.style.top = `${0}px`; content.style.transform = `scale(${newScale})`;


                content2.style.height = `${content.getBoundingClientRect().height}px`;
                content2.style.width = `${content.getBoundingClientRect().width}px`;

            }
        }
    }

    function setUpTable() {

        let content2 = document.querySelector('.table-container');
        const container = content2.parentElement;
        let content = content2.querySelector('.schedule-table');

        const handleScale = (e) => {
            if (!e.ctrlKey) return;
            e.preventDefault();

            let direction = e.deltaY > 0 ? -1 : 1;
            let currentScale = content.style.transform.match(/scale\((.*?)\)/)?.[1] || 1;
            let newScale = parseFloat(currentScale) * (1 + (direction * 0.1));

            // Calculate the minimum scale to fit container
            // Get the original unscaled dimensions of the content
            const originalWidth = content.scrollWidth;
            const originalHeight = content.scrollHeight;

            // Calculate minimum scale to fit within container (considering both width and height)
            const minScaleWidth = container.clientWidth / originalWidth;
            const minScaleHeight = container.clientHeight / originalHeight;
            const minScale = Math.min(minScaleWidth, minScaleHeight);

            // Clamp the scale to never go below the minimum
            if (newScale < minScale) {
                newScale = minScale;
            }

            // Apply the new scale with transition
            content.style.transform = `scale(${newScale})`;


            requestAnimationFrame(() => {
                content2.style.height = `${content.getBoundingClientRect().height}px`;
                content2.style.width = `${content.getBoundingClientRect().width}px`;
            });

        };

        container.addEventListener("wheel", handleScale, { passive: false });
        const handlePinch = (e) => {
            if (e.touches.length !== 2) return;
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            // Store the initial distance when pinch starts
            if (!e.target.dataset.initialDistance) {
                e.target.dataset.initialDistance = currentDistance;
                e.target.dataset.initialScale = content.style.transform.match(/scale\((.*?)\)/)?.[1] || 1;
                return;
            }

            const initialDistance = parseFloat(e.target.dataset.initialDistance);
            const initialScale = parseFloat(e.target.dataset.initialScale);

            const scaleFactor = currentDistance / initialDistance;
            let newScale = initialScale * scaleFactor;

            // Calculate the minimum scale to fit container
            // Get the original unscaled dimensions of the content
            const originalWidth = content.scrollWidth;
            const originalHeight = content.scrollHeight;

            // Calculate minimum scale to fit within container (considering both width and height)
            const minScaleWidth = container.clientWidth / originalWidth;
            const minScaleHeight = container.clientHeight / originalHeight;
            const minScale = Math.min(minScaleWidth, minScaleHeight);

            // Clamp the scale to never go below the minimum
            if (newScale < minScale) {
                newScale = minScale;
            }

            // Apply the new scale
            content.style.transform = `scale(${newScale})`;


            requestAnimationFrame(() => {
                content2.style.height = `${content.getBoundingClientRect().height}px`;
                content2.style.width = `${content.getBoundingClientRect().width}px`;
            });

        };
        // Add touch event listeners for pinch gestures
        container.addEventListener("touchstart", (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
            }
        }, { passive: false });

        container.addEventListener("touchmove", handlePinch, { passive: false });

        container.addEventListener("touchend", (e) => {
            // Reset the stored initial distance when touch ends
            delete e.target.dataset.initialDistance;
            delete e.target.dataset.initialScale;
        }, { passive: false });

    }



    if (!proxyState.sheetData?.values)
        return (<div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mx-auto" role="status" aria-label="loading"><span className="sr-only">Loading...</span></div>
        </div>);

    return (
        <div className="w-full grow flex flex-col bg-white p-6 max-w-6xl mx-auto rounded-lg ">
            <div className="flex gap-4 justify-center">
                {proxyState.sheetData && (
                    <>
                        <FormControl sx={{ width: '100%' }}>
                            <InputLabel id="section-select-label">Section</InputLabel>
                            <Select
                                labelId="section-select-label"
                                id="section-select"
                                label="Section"
                                displayEmpty
                                value={proxyState.selectedSection || ''}
                                onChange={(e) => { proxyState.selectedSection = e.target.value; proxyState.selectedTeacher = '' }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {([...new Set(extractRoutine(proxyState.sheetData?.values || []).map(item => item.section))]).sort((a, b) => {
                                    let numberA = a.match(/\d+/)?.[0] || 0;
                                    let characterA = a.match(/[a-zA-Z]+/)?.[0] || '';
                                    let numberB = b.match(/\d+/)?.[0] || 0;
                                    let characterB = b.match(/[a-zA-Z]+/)?.[0] || '';

                                    if (numberA !== numberB) {
                                        return numberA - numberB;
                                    }
                                    return characterA.localeCompare(characterB);
                                })
                                    .map((section, index) => (
                                        <MenuItem key={index} value={section}>{section}</MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControl sx={{ width: '100%' }}>
                            <InputLabel id="teacher-select-label">Teacher</InputLabel>
                            <Select
                                labelId="teacher-select-label"
                                id="teacher-select"
                                label="Teacher"
                                displayEmpty
                                value={proxyState.selectedTeacher || ''}
                                onChange={(e) => { proxyState.selectedTeacher = e.target.value; proxyState.selectedSection = '' }}
                            >
                                {([...new Set(extractRoutine(proxyState.sheetData?.values || []).map(item => item.teacher))]).sort((a, b) => {
                                    let numberA = a.match(/\d+/)?.[0] || 0;
                                    let characterA = a.match(/[a-zA-Z]+/)?.[0] || '';
                                    let numberB = b.match(/\d+/)?.[0] || 0;
                                    let characterB = b.match(/[a-zA-Z]+/)?.[0] || '';

                                    if (numberA !== numberB) {
                                        return numberA - numberB;
                                    }
                                    return characterA.localeCompare(characterB);
                                })
                                    .map((teacher, index) => (
                                        <MenuItem key={index} value={teacher}>{teacher}</MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </>
                )}
            </div>
            <div className="my-4"></div>
            <div
                className="grow overflow-auto grid place-items-center select-none aspect-video"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="table-container relative">
                    <div className="schedule-table shadow rounded-xl absolute top-0 left-0 overflow-hidden">
                        <div className="border border-gray-400 rounded-xl overflow-hidden">
                            <table className="table divide-y divide-gray-300 text-center border-blue-500"
                                ref={(ref) => { }}
                            >
                                <thead className="bg-gradient-to-r from-blue-200 to-blue-300 text-white">
                                    <tr>
                                        <th className="px-1 py-4 text-md font-semibold uppercase tracking-wider border-b border-r border-gray-300 min-w-[150px]">
                                            Day / Time
                                        </th>
                                        {TIME_SLOTS.map((time, index) => (
                                            <th
                                                key={index}
                                                className="px-1 py-4 text-sm font-semibold uppercase tracking-wider border-b border-r border-gray-300 min-w-[200px]"
                                            >
                                                {time}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-300">
                                    {DAYS.map((day, dayIndex) => (
                                        <tr key={dayIndex} className="transition-colors ">
                                            <td className="px-2 py-4 whitespace-nowrap text-md font-medium text-gray-700 border-r border-gray-300 bg-gray-100">
                                                {day}
                                            </td>
                                            {TIME_SLOTS.map((time, timeIndex) => {
                                                const scheduleItem = findScheduleItem(day, time);
                                                return (
                                                    <td
                                                        key={timeIndex}
                                                        className="px-2 py-4 whitespace-nowrap border-r border-gray-300 max-w-[200px]  "
                                                    >
                                                        {scheduleItem ? (
                                                            <div className="flex flex-col items-center justify-center">
                                                                <div className="text-lg font-bold text-blue-700 text-center">
                                                                    {scheduleItem.course.replaceAll(/[\s-]/g, '')}
                                                                </div>
                                                                <div className="flex flex-col text-sm text-gray-500 font-medium text-center w-full max-w-[200px] text-ellipsis overflow-hidden break-words whitespace-normal">
                                                                    <div className="line-clamp-2 leading-tight">
                                                                        {courseMap[scheduleItem.course.replaceAll(/[\s-]/g, '')] || ''}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                                    <div>{scheduleItem.teacher}</div>
                                                                    <div className="text-gray-400">•</div>
                                                                    <div>{scheduleItem.section}</div>
                                                                    <div className="text-gray-400">•</div>
                                                                    <div>{`(${scheduleItem.room})`}</div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-16 flex items-center justify-center text-gray-400 text-md">
                                                                ...
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-100 my-4"></div>
            <div className="">
                <div className="text-xs text-gray-500 flex flex-col md:flex-row md:justify-between items-start gap-2">
                    <div className="flex gap-4 md:order-1">
                        <a
                            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=0`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors font-medium flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Google Sheets
                        </a>
                        <a
                            href="#"
                            onClick={handleDownload}
                            className="text-blue-600 hover:text-blue-800 transition-colors font-medium flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Image
                        </a>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-xs text-gray-500">
                            <span className="font-medium">Last Update:</span> {new Date(modifiedTime).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                            <span className="font-medium">Online Courses:</span> {info ? <span>{info}</span> : 'Loading...'}
                        </div>
                    </div>
                </div>
                <div className="my-6"></div>
            </div>
        </div>
    );
};



const Home = () => {
    const proxyState = useProxy(window.state);

    return <div className="h-full w-full">
        {proxyState.sheetData && <ScheduleTable routine={proxyState.sheetData} modifiedTime={proxyState.modifiedTime} spreadsheetId={proxyState.spreadsheetId} />
            || <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mx-auto" role="status" aria-label="loading"><span className="sr-only">Loading...</span></div>
            </div>}
    </div>
}

export default Home;