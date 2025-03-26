import React, { useEffect, useState } from 'react';
import { useSalaryRequestStore } from '../../store/salaryRequestStore';
import { motion, AnimatePresence } from 'framer-motion';

function MyPayrollHistory() {
    const { payrollHistory, fetchMyPayrollHistory, error } = useSalaryRequestStore();
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchMyPayrollHistory();
    }, [fetchMyPayrollHistory]);

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    const openModal = (payroll) => {
        setSelectedPayroll(payroll);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedPayroll(null);
        setIsModalOpen(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-2 md:p-4"
        >
            <h1 className="text-2xl font-semibold mb-4">Payroll History</h1>
            {payrollHistory && payrollHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {payrollHistory.map((payroll, index) => (
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
                <p>No payroll history available.</p>
            )}

            <AnimatePresence>
                {isModalOpen && selectedPayroll && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white p-4 md:p-6 rounded-lg w-full max-w-4xl"
                        >
                            <h2 className="text-xl font-semibold mb-4">Payroll Details</h2>
                            <div>
                                <p><strong>Batch ID:</strong> {selectedPayroll.batch_id}</p>
                                <p><strong>Employee ID:</strong> {selectedPayroll.employee_id}</p>
                                <p><strong>First Name:</strong> {selectedPayroll.employee_firstname}</p>
                                <p><strong>Last Name:</strong> {selectedPayroll.employee_lastname}</p>
                                <p><strong>Position:</strong> {selectedPayroll.position}</p>
                                <p><strong>Gross Salary:</strong> ₱{selectedPayroll.grossSalary}</p>
                                <p><strong>Net Salary:</strong> ₱{selectedPayroll.netSalary}</p>
                                {/* Add more fields as necessary */}
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
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

export default MyPayrollHistory;
