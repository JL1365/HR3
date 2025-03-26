import React, { useEffect, useState } from 'react';
import { useSalaryRequestStore } from '../../store/salaryRequestStore';
import { motion, AnimatePresence } from 'framer-motion';

function PayrollHistory() {
    const { payrollHistory, fetchMyPayrollHistory, error } = useSalaryRequestStore();
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const payrollsPerPage = 10;

    useEffect(() => {
        fetchMyPayrollHistory();
    }, [fetchMyPayrollHistory]);

    useEffect(() => {
        if (error) console.error(error);
    }, [error]);

    const openModal = (payroll) => {
        setSelectedPayroll(payroll);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedPayroll(null);
        setIsModalOpen(false);
        setCurrentPage(1);
    };

    const indexOfLastPayroll = currentPage * payrollsPerPage;
    const indexOfFirstPayroll = indexOfLastPayroll - payrollsPerPage;
    const currentPayrolls = payrollHistory ? payrollHistory.slice(indexOfFirstPayroll, indexOfLastPayroll) : [];

    const nextPage = () => {
        if (indexOfLastPayroll < payrollHistory.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4"
        >
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Payroll History</h1>
            {payrollHistory && payrollHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentPayrolls.map((payroll, index) => (
                        <motion.div
                            key={index}
                            className="bg-white p-4 rounded-lg shadow-md cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openModal(payroll)}
                        >
                            <p><strong>Batch ID:</strong> {payroll.batch_id}</p>
                            <p><strong>Employee ID:</strong> {payroll.employee_id}</p>
                            <p><strong>First Name:</strong> {payroll.employee_firstname}</p>
                            <p><strong>Last Name:</strong> {payroll.employee_lastname}</p>
                            <p><strong>Position:</strong> {payroll.position}</p>
                            <p><strong>Gross Salary:</strong> ₱{payroll.grossSalary}</p>
                            <p><strong>Net Salary:</strong> ₱{payroll.netSalary}</p>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600">No payroll history available.</p>
            )}

            <div className="flex justify-between mt-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary text-xs md:text-sm"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </motion.button>
                <span className="text-gray-700 text-xs md:text-sm">
                    Page {currentPage}
                </span>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary text-xs md:text-sm"
                    onClick={nextPage}
                    disabled={indexOfLastPayroll >= payrollHistory.length}
                >
                    Next
                </motion.button>
            </div>

            <AnimatePresence>
                {isModalOpen && selectedPayroll && (
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
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Payroll Details</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Batch ID</p>
                                    <p className="font-medium">{selectedPayroll.batch_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Employee ID</p>
                                    <p className="font-medium">{selectedPayroll.employee_id}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">First Name</p>
                                        <p className="font-medium">{selectedPayroll.employee_firstname}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Last Name</p>
                                        <p className="font-medium">{selectedPayroll.employee_lastname}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Position</p>
                                    <p className="font-medium">{selectedPayroll.position}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gross Salary</p>
                                    <p className="text-green-600 font-bold text-lg">₱{selectedPayroll.grossSalary.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Net Salary</p>
                                    <p className="text-green-600 font-bold text-lg">₱{selectedPayroll.netSalary.toLocaleString()}</p>
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

export default PayrollHistory;
