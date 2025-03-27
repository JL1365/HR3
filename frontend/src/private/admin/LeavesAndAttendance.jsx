import React, { useEffect, useState } from 'react';
import { useAttendanceStore } from '../../store/attendanceStore';
import { motion } from 'framer-motion';

function LeavesAndAttendance() {
    const { behavioralAnalytics, fetchBehavioralAnalytics, error, clearError } = useAttendanceStore();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchBehavioralAnalytics();
    }, [fetchBehavioralAnalytics]);

    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [error, clearError]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAnalytics = behavioralAnalytics?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const totalPages = Math.ceil((behavioralAnalytics?.length || 0) / itemsPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-2 md:p-4"
        >
            <h1 className="text-lg font-semibold mb-4">Leaves and Attendance</h1>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="overflow-x-auto"
            >
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full table-auto text-sm">
                            <thead className="bg-white text-gray-500 border-b">
                                <tr>
                                    <th className="p-2 md:p-3 text-left">Employee Name</th>
                                    <th className="p-2 md:p-3 text-left">Total Leaves</th>
                                    <th className="p-2 md:p-3 text-left">Leave Types</th>
                                    <th className="p-2 md:p-3 text-left">Total Attendance Records</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-neutral-500 border-b">
                                {currentAnalytics.length > 0 ? (
                                    currentAnalytics.map((employee, index) => (
                                        <motion.tr
                                            key={employee.employee_id}
                                            className="text-center"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {employee.employee_name}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {employee.leaveAnalytics.totalLeaves}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                <ul>
                                                    {Object.entries(employee.leaveAnalytics.leaveTypes).map(([type, count]) => (
                                                        <li key={type}>
                                                            {type}: {count}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {employee.attendanceAnalytics.totalAttendanceRecords}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            No analytics data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {behavioralAnalytics && behavioralAnalytics.length === 0 && (
                            <div className="text-center text-gray-500 mt-4">
                                No data found.
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
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
                    onClick={handlePageChange.bind(null, 'prev')}
                    disabled={currentPage === 1}
                >
                    Previous
                </motion.button>
                <span className="text-gray-700 text-xs md:text-sm">
                    Page {currentPage} of {totalPages}
                </span>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary text-xs md:text-sm"
                    onClick={handlePageChange.bind(null, 'next')}
                    disabled={currentPage === totalPages}
                >
                    Next
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

export default LeavesAndAttendance;