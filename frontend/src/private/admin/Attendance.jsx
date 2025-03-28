import { useEffect, useState } from 'react';
import { useAttendanceStore } from '../../store/attendanceStore';
import { motion } from 'framer-motion';

function Attendance() {
    const { attendanceData = [], leaveData = [], fetchAttendanceData, fetchLeaveData } = useAttendanceStore(); // Default to empty arrays
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
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full table-auto text-sm">
                            <thead className="bg-white text-gray-500 border-b">
                                <tr>
                                    <th className="p-2 md:p-3 text-left">Employee name</th>
                                    <th className="p-2 md:p-3 text-left">Position</th>
                                    <th className="p-2 md:p-3 text-left">Time In</th>
                                    <th className="p-2 md:p-3 text-left">Time Out</th>
                                    <th className="p-2 md:p-3 text-left">Total Hours</th>
                                    <th className="p-2 md:p-3 text-left">Overtime Hours</th>
                                    <th className="p-2 md:p-3 text-left">Entry Type</th>
                                    <th className="p-2 md:p-3 text-left">Is Holiday</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-neutral-500 border-b">
                                {currentAttendance.length > 0 ? (
                                    currentAttendance.map((record, index) => (
                                        <motion.tr
                                            key={record._id}
                                            className="text-center"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {record.employee_firstname}  {record.employee_lastname}
                                            </td>
                              
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {record.position}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {record.time_in ? new Date(record.time_in).toLocaleString() : '—'}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {record.time_out ? new Date(record.time_out).toLocaleString() : '—'}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {record.total_hours}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {record.overtime_hours}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {record.entry_type}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {record.isHoliday ? 'Yes' : 'No'}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            No attendance records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
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
            <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full table-auto text-sm">
                            <thead className="bg-white text-gray-500 border-b">
                                <tr>
                                    <th className="p-2 md:p-3 text-left">Employee name</th>
                                    <th className="p-2 md:p-3 text-left">Department</th>
                                    <th className="p-2 md:p-3 text-left">Leave Type</th>
                                    <th className="p-2 md:p-3 text-left">Start Date</th>
                                    <th className="p-2 md:p-3 text-left">End Date</th>
                                    <th className="p-2 md:p-3 text-left">Reason</th>
                                    <th className="p-2 md:p-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-neutral-500 border-b">
                                {currentLeave.length > 0 ? (
                                    currentLeave.map((leave, index) => (
                                        <motion.tr
                                            key={leave.leave_id}
                                            className="text-center"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {leave.employee_firstname} {leave.employee_lastname}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {leave.employee_department}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {leave.leave_type}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {new Date(leave.start_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {new Date(leave.end_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {leave.reason}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {leave.status}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            No leave records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
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
