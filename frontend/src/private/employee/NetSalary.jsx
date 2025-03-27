import React, { useEffect, useState } from 'react';
import { useSalaryRequestStore } from '../../store/salaryRequestStore';
import { motion, AnimatePresence } from 'framer-motion';

function NetSalary() {
    const { userPayroll, fetchMyNetSalary, error } = useSalaryRequestStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchMyNetSalary();
    }, [fetchMyNetSalary]);

    useEffect(() => {
        if (error) console.error(error);
    }, [error]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const totalPages = Math.ceil(userPayroll?.dailyWorkHours?.length / itemsPerPage || 0);
    const currentItems = userPayroll?.dailyWorkHours?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ) || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4"
        >
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Net Salary Overview</h1>

            {userPayroll ? (
                userPayroll.dailyWorkHours?.length > 0 ? (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openModal}
                        className="bg-white shadow-lg rounded-2xl p-6 cursor-pointer transition-all duration-300 border border-gray-100 hover:shadow-xl"
                    >
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">Employee ID</p>
                            <p className="text-lg font-medium text-gray-800">{userPayroll.employee_id}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">First Name</p>
                                <p className="font-semibold">{userPayroll.employee_firstname}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Last Name</p>
                                <p className="font-semibold">{userPayroll.employee_lastname}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Position</p>
                                <p className="font-semibold">{userPayroll.position}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Net Salary</p>
                                <p className="text-green-600 font-bold text-lg">
                                    ₱{userPayroll.netSalary ? userPayroll.netSalary.toLocaleString() : 0}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="bg-white shadow-lg rounded-2xl p-6 transition-all duration-300 border border-gray-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">No Attendance Data</h2>
                        <p className="text-gray-600 mb-4">
                            While there is no attendance data available, the following amounts have been calculated:
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Paid Leave Amount</p>
                                <p className="text-green-600 font-bold">
                                    ₱{userPayroll?.paidLeaveAmount ? userPayroll.paidLeaveAmount.toLocaleString() : 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Incentive Amount</p>
                                <p className="text-green-600 font-bold">
                                    ₱{userPayroll?.incentiveAmount ? userPayroll.incentiveAmount.toLocaleString() : 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Deductions Amount</p>
                                <p className="text-red-600 font-bold">
                                    ₱{userPayroll?.benefitsDeductionsAmount ? userPayroll.benefitsDeductionsAmount.toLocaleString() : 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Deductible Amount</p>
                                <p className="text-red-600 font-bold">
                                    ₱{userPayroll?.deductibleAmount ? userPayroll.deductibleAmount.toLocaleString() : 0}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-500">Net Salary</p>
                            <p className="text-green-600 font-bold text-lg">
                                ₱{userPayroll?.netSalary ? userPayroll.netSalary.toLocaleString() : 0}
                            </p>
                        </div>
                    </motion.div>
                )
            ) : (
                <p className="text-gray-600">No data available.</p>
            )}

            <AnimatePresence>
                {isModalOpen && userPayroll && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 md:p-8"
                        >
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Employee Payroll Details</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Employee ID</p>
                                    <p className="font-medium">{userPayroll.employee_id}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">First Name</p>
                                        <p className="font-medium">{userPayroll.employee_firstname}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Last Name</p>
                                        <p className="font-medium">{userPayroll.employee_lastname}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Position</p>
                                    <p className="font-medium">{userPayroll.position}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Net Salary</p>
                                    <p className="text-green-600 font-bold text-lg">
                                        ₱{userPayroll.netSalary ? userPayroll.netSalary.toLocaleString() : 0}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">Daily Work Hours</h3>
                                <div className="overflow-x-auto">
                                    <table className="table-auto w-full text-left">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2">Date</th>
                                                <th className="px-4 py-2">Work Hours</th>
                                                <th className="px-4 py-2">Overtime Hours</th>
                                                <th className="px-4 py-2">Holiday</th>
                                                <th className="px-4 py-2">Deductible Amount</th>
                                                <th className="px-4 py-2">Benefit Deductions Amount</th>
                                                <th className="px-4 py-2">Paid Leave Amount</th>
                                                <th className="px-4 py-2">Incentive Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((entry, index) => (
                                                <tr key={index}>
                                                    <td className="border px-4 py-2">{new Date(entry.date).toLocaleDateString()}</td>
                                                    <td className="border px-4 py-2">{entry.hours}</td>
                                                    <td className="border px-4 py-2">
                                                        {userPayroll.dailyOvertimeHours.find(o => o.date === entry.date)?.hours || 0}
                                                    </td>
                                                    <td className="border px-4 py-2">{entry.isHoliday ? 'Yes' : 'No'}</td>
                                                    <td className="border px-4 py-2">₱{userPayroll.deductibleAmount ? userPayroll.deductibleAmount.toLocaleString() : 0}</td>
                                                    <td className="border px-4 py-2">₱{userPayroll.benefitsDeductionsAmount ? userPayroll.benefitsDeductionsAmount.toLocaleString() : 0}</td>
                                                    <td className="border px-4 py-2">₱{userPayroll.paidLeaveAmount ? userPayroll.paidLeaveAmount.toLocaleString() : 0}</td>
                                                    <td className="border px-4 py-2">₱{userPayroll.incentiveAmount ? userPayroll.incentiveAmount.toLocaleString() : 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-between mt-4">
                                    <button
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={closeModal}
                                    className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                                >
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default NetSalary;
