import React, { useState, useEffect } from 'react';
import { useSalaryRequestStore } from '../../store/salaryRequestStore';
import { useAuthStore } from '../../store/authStore';
import { useCompensationBenefitStore } from '../../store/compensationBenefitStore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

function AddEmployeeCompensation() {
    const { addEmployeeCompensation, error } = useSalaryRequestStore();
    const { users, fetchAllUsers } = useAuthStore();
    const { benefits, fetchBenefits, fetchEmployeeCompensations, employeeCompensations, loading } = useCompensationBenefitStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        benefit: '',
        benefitType: '',
        daysLeave: 0,
        deductionAmount: 0,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const compensationsPerPage = 10;

    const indexOfLastCompensation = currentPage * compensationsPerPage;
    const indexOfFirstCompensation = indexOfLastCompensation - compensationsPerPage;
    const currentCompensations = employeeCompensations.slice(indexOfFirstCompensation, indexOfLastCompensation);

    const nextPage = () => {
        if (indexOfLastCompensation < employeeCompensations.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        fetchAllUsers();
        fetchBenefits();
        fetchEmployeeCompensations();
    }, [fetchAllUsers, fetchBenefits, fetchEmployeeCompensations]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await addEmployeeCompensation(formData);
            toast.success('Employee compensation added successfully');
            setFormData({
                employeeId: '',
                benefit: '',
                benefitType: '',
                daysLeave: 0,
                deductionAmount: 0,
            });
            setIsOpenModal(false);
        } catch (err) {
            toast.error('Failed to add employee compensation');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredBenefits = benefits.filter(benefit => {
        if (formData.benefitType === "Paid Benefit") {
            return benefit.benefitType === "Paid Benefit" && !benefit.isNeedRequest;
        } else if (formData.benefitType === "Violation Deduction") {
            return benefit.benefitType === "Violation Deduction";
        }
        return false;
    });

    return (
        <motion.div className="p-2 md:p-4">
            <ToastContainer autoClose={3000} />
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpenModal(true)}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Add Employee Compensation
            </motion.button>
            {isOpenModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white p-6 rounded shadow-lg w-96"
                    >
                        <h2 className="text-xl font-semibold mb-4">Add Employee Compensation</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Employee</label>
                                <select
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    required
                                    className="input input-bordered w-full mt-1"
                                >
                                    <option value="">Select Employee</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.firstName} {user.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Benefit Type</label>
                                <select
                                    name="benefitType"
                                    value={formData.benefitType}
                                    onChange={handleChange}
                                    required
                                    className="input input-bordered w-full mt-1"
                                >
                                    <option value="">Select Benefit Type</option>
                                    <option value="Paid Benefit">Paid Benefit</option>
                                    <option value="Violation Deduction">Violation Deduction</option>
                                </select>
                            </div>
                            {formData.benefitType && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Benefit</label>
                                    <select
                                        name="benefit"
                                        value={formData.benefit}
                                        onChange={handleChange}
                                        required
                                        className="input input-bordered w-full mt-1"
                                    >
                                        <option value="">Select Benefit</option>
                                        {filteredBenefits.map(benefit => (
                                            <option key={benefit._id} value={benefit._id}>
                                                {benefit.benefitName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {formData.benefitType === "Paid Benefit" && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Days Leave</label>
                                    <input
                                        type="number"
                                        name="daysLeave"
                                        value={formData.daysLeave}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.5"
                                        className="input input-bordered w-full mt-1"
                                    />
                                </div>
                            )}
                            {formData.benefitType === "Violation Deduction" && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Deduction Amount</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">₱</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="deductionAmount"
                                            value={formData.deductionAmount}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            className="input input-bordered w-full pl-7 mt-1"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsOpenModal(false)}
                                    className="btn btn-secondary mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`btn btn-primary ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Processing...' : 'Add Compensation'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
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
                                    <th className="p-2 md:p-3 text-left">Benefit Name</th>
                                    <th className="p-2 md:p-3 text-left">Benefit Type</th>
                                    <th className="p-2 md:p-3 text-left">Amount</th>
                                    <th className="p-2 md:p-3 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-neutral-500 border-b">
                                {currentCompensations.length > 0 ? (
                                    currentCompensations.map((compensation, index) => (
                                        <motion.tr
                                            key={compensation._id}
                                            className="text-center"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {compensation.employeeName}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {compensation.benefitName}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {compensation.benefitType}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {compensation.benefitType === "Paid Benefit" 
                                                    ? `${compensation.daysLeave} Days` 
                                                    : `₱${compensation.deductionAmount}`}
                                            </td>
                                            <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                                                {new Date(compensation.createdAt).toLocaleDateString()}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            No employee compensations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                    disabled={indexOfLastCompensation >= employeeCompensations.length}
                >
                    Next
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

export default AddEmployeeCompensation;