import React, { useEffect, useState } from 'react';
import { useCompensationStore } from '../../store/compensationStore';
import { motion, AnimatePresence } from 'framer-motion';

function MySalaryStructure() {
    const { salaryStructure, fetchMySalaryStructure, loading, error } = useCompensationStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchMySalaryStructure();
    }, [fetchMySalaryStructure]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!salaryStructure) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full text-gray-500"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <p className="text-gray-600 text-center">No salary structure available.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4"
        >
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Salary Structure</h1>

            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openModal}
                className="bg-white shadow-lg rounded-2xl p-6 cursor-pointer transition-all duration-300 border border-gray-100 hover:shadow-xl"
            >
                <div className="mb-4">
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="text-lg font-medium text-gray-800">{salaryStructure.position}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Hourly Rate</p>
                        <p className="font-semibold">{salaryStructure.hourlyRate}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Overtime Rate</p>
                        <p className="font-semibold">{salaryStructure.overTimeRate}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Holiday Rate</p>
                        <p className="font-semibold">{salaryStructure.holidayRate}</p>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 z-50 flex items-center justify-center"
                        >
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 md:p-8">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Salary Structure Details</h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Position</p>
                                        <p className="font-medium">{salaryStructure.position}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Hourly Rate</p>
                                            <p className="font-medium">{salaryStructure.hourlyRate}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Overtime Rate</p>
                                            <p className="font-medium">{salaryStructure.overTimeRate}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Holiday Rate</p>
                                        <p className="font-medium">{salaryStructure.holidayRate}</p>
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
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default MySalaryStructure;