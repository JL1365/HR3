import React, { useState, useEffect } from 'react';
import { useSalaryRequestStore } from '../../store/salaryRequestStore';
import { useAuthStore } from '../../store/authStore';
import { useCompensationBenefitStore } from '../../store/compensationBenefitStore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddEmployeeCompensation() {
    const { addEmployeeCompensation, error } = useSalaryRequestStore();
    const { users, fetchAllUsers } = useAuthStore();
    const { benefits, fetchBenefits } = useCompensationBenefitStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        benefit: '',
        benefitType: '',
        daysLeave: 0,
        deductionAmount: 0,
    });

    useEffect(() => {
        fetchAllUsers();
        fetchBenefits();
    }, [fetchAllUsers, fetchBenefits]);

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
        } else if (formData.benefitType === "Deduction") {
            return benefit.benefitType === "Deduction";
        }
        return false;
    });

    return (
        <div>
            <ToastContainer autoClose={3000} />
            <button
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setIsOpenModal(true)}
            >
                Add Employee Compensation
            </button>
            {isOpenModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
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
                                    <option value="Deduction">Deduction</option>
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
                            {formData.benefitType === "Deduction" && (
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
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddEmployeeCompensation;