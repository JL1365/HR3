import { useEffect, useState } from 'react';
import { useAttendanceStore } from '../../store/attendanceStore';

import { motion } from 'framer-motion';

function Attendance() {
    const { attendanceData, leaveData, fetchAttendanceData, fetchLeaveData } = useAttendanceStore();
    const [currentAttendancePage, setCurrentAttendancePage] = useState(1);
    const [currentLeavePage, setCurrentLeavePage] = useState(1);
    const recordsPerPage = 10;

    const indexOfLastAttendanceRecord = currentAttendancePage * recordsPerPage;
    const indexOfFirstAttendanceRecord = indexOfLastAttendanceRecord - recordsPerPage;
    const currentAttendance = attendanceData.slice(indexOfFirstAttendanceRecord, indexOfLastAttendanceRecord).reverse();

    const indexOfLastLeaveRecord = currentLeavePage * recordsPerPage;
    const indexOfFirstLeaveRecord = indexOfLastLeaveRecord - recordsPerPage;
    const currentLeave = leaveData.slice(indexOfFirstLeaveRecord, indexOfLastLeaveRecord).reverse();

    const nextAttendancePage = () => {
        if (indexOfLastAttendanceRecord < attendanceData.length) {
            setCurrentAttendancePage(currentAttendancePage + 1);
        }
    };

    const prevAttendancePage = () => {
        if (currentAttendancePage > 1) {
            setCurrentAttendancePage(currentAttendancePage - 1);
        }
    };

    const nextLeavePage = () => {
        if (indexOfLastLeaveRecord < leaveData.length) {
            setCurrentLeavePage(currentLeavePage + 1);
        }
    };

    const prevLeavePage = () => {
        if (currentLeavePage > 1) {
            setCurrentLeavePage(currentLeavePage - 1);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
        fetchLeaveData();
    }, [fetchAttendanceData, fetchLeaveData]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-4"
        >
            <h1 className="text-2xl font-semibold mb-4">Attendance Records</h1>
            <div className="overflow-x-auto">
                <table className="table-auto w-full border">
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Position</th>
                            <th>Time In</th>
                            <th>Time Out</th>
                            <th>Total Hours</th>
                            <th>Overtime Hours</th>
                            <th>Entry Type</th>
                            <th>Is Holiday</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAttendance && currentAttendance.map(record => (
                            <motion.tr
                                key={record._id}
                                className="border-t"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td>{record.employee_firstname}</td>
                                <td>{record.employee_lastname}</td>
                                <td>{record.position}</td>
                                <td>{record.time_in ? new Date(record.time_in).toLocaleString() : '—'}</td>
                                <td>{record.time_out ? new Date(record.time_out).toLocaleString() : '—'}</td>
                                <td>{record.total_hours}</td>
                                <td>{record.overtime_hours}</td>
                                <td>{record.entry_type}</td>
                                <td>{record.isHoliday ? 'Yes' : 'No'}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between mt-4"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary text-xs md:text-sm"
                    onClick={prevAttendancePage}
                    disabled={currentAttendancePage === 1}
                >
                    Previous
                </motion.button>
                <span className="text-gray-700 text-xs md:text-sm">
                    Page {currentAttendancePage}
                </span>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary text-xs md:text-sm"
                    onClick={nextAttendancePage}
                    disabled={indexOfLastAttendanceRecord >= attendanceData.length}
                >
                    Next
                </motion.button>
            </motion.div>

            <h1 className="text-2xl font-semibold mt-8 mb-4">Leave Records</h1>
            <table className="table-auto w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 border">Name</th>
                        <th className="px-4 py-2 border">Department</th>
                        <th className="px-4 py-2 border">Leave Type</th>
                        <th className="px-4 py-2 border">Start Date</th>
                        <th className="px-4 py-2 border">End Date</th>
                        <th className="px-4 py-2 border">Reason</th>
                        <th className="px-4 py-2 border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {currentLeave && currentLeave.map((leave) => (
                        <motion.tr
                            key={leave.leave_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <td className="px-4 py-2 border">{leave.employee_firstname} {leave.employee_lastname}</td>
                            <td className="px-4 py-2 border">{leave.employee_department}</td>
                            <td className="px-4 py-2 border">{leave.leave_type}</td>
                            <td className="px-4 py-2 border">{new Date(leave.start_date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 border">{new Date(leave.end_date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 border">{leave.reason}</td>
                            <td className="px-4 py-2 border">{leave.status}</td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between mt-4"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary text-xs md:text-sm"
                    onClick={prevLeavePage}
                    disabled={currentLeavePage === 1}
                >
                    Previous
                </motion.button>
                <span className="text-gray-700 text-xs md:text-sm">
                    Page {currentLeavePage}
                </span>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary text-xs md:text-sm"
                    onClick={nextLeavePage}
                    disabled={indexOfLastLeaveRecord >= leaveData.length}
                >
                    Next
                </motion.button>
            </motion.div>

        </motion.div>
    );
}

export default Attendance;
