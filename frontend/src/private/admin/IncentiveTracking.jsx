import React, { useEffect, useState } from "react";
import { useIncentiveTrackingStore } from "../../store/incentiveTrackingStore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from "../../store/authStore";
import { useIncentiveStore } from "../../store/incentiveStore";
import { motion } from "framer-motion";

function IncentiveTracking() {
    const {
        incentiveTrackings,
        currentPage,
        itemsPerPage,
        fetchIncentiveTrackings,
        createIncentiveTracking,
        updateIncentiveTracking,
        deleteIncentiveTracking,
        handlePageChange,
        formatDate
    } = useIncentiveTrackingStore();

    const { users, fetchAllUsers } = useAuthStore();
    const { allIncentives, fetchAllIncentives } = useIncentiveStore();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        userId: "",
        incentiveId: "",
        amount: "",
        description: "",
        earnedDate: ""
    });

    useEffect(() => {
        fetchIncentiveTrackings();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await deleteIncentiveTracking(id);
            toast.success("Item deleted successfully!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || 
                                 error.message || 
                                 "Failed to delete item";
            
            toast.error(errorMessage);
        }
    };

    const handleEdit = (tracking) => {
        setFormData({
            _id: tracking._id,
            userId: tracking.userId?._id || "",
            incentiveId: tracking.incentiveId?._id || "",
            amount: tracking.amount || "",
            description: tracking.description || "",
            earnedDate: tracking.earnedDate || "",
        });
        fetchAllUsers();
        fetchAllIncentives();
        setIsEditing(true);
        setIsOpenModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateIncentiveTracking(formData._id, formData);
                toast.success("Incentive tracking updated successfully!");
            } else {
                await createIncentiveTracking(formData);
                toast.success("Incentive tracking created successfully!");
            }
            fetchIncentiveTrackings();
            setIsOpenModal(false);
        } catch (error) {
            // Extract error message from the response
            const errorMessage = error.response?.data?.message || 
                                 error.message || 
                                 "Failed to save incentive tracking!";
            
        
            toast.error(errorMessage);
        }
    };

    const indexOfLastIncentive = currentPage * itemsPerPage;
    const indexOfFirstIncentive = indexOfLastIncentive - itemsPerPage;
    const currentIncentives = incentiveTrackings.slice(indexOfFirstIncentive, indexOfLastIncentive);
    const totalPages = Math.ceil(incentiveTrackings.length / itemsPerPage);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-2 md:p-4"
        >
            <ToastContainer autoClose={3000} />
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full md:w-auto"
                onClick={() => {
                    fetchAllUsers();
                    fetchAllIncentives();
                    setFormData({
                        userId: "",
                        incentiveId: "",
                        amount: "",
                        description: "",
                        earnedDate: ""
                    });
                    setIsEditing(false);
                    setIsOpenModal(true);
                }}
            >
                Assign incentives
            </motion.button>
            <div className="overflow-x-auto">
                <table className="table-auto w-full pb-5 text-sm">
                    <thead className="bg-white text-gray-500 border-b">
                        <tr>
                            <th className="p-3 text-left">Employee name</th>
                            <th className="p-3 text-left">Incentive Type</th>
                            <th className="p-3 text-left">Amount</th>
                            <th className="p-3 text-left">Earned Date</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Date Received</th>
                            <th className="p-3 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white text-neutral-500 border-b">
                        {currentIncentives.length > 0 ? (
                            currentIncentives.map((tracking) => (
                                <tr key={tracking._id}>
                                    <td className="p-3 border-b">
                                        {tracking.userId ? `${tracking.user?.firstName} ${tracking.user?.lastName}` : "User not assigned"}
                                    </td>
                                    <td className="p-3 border-b">
                                        {tracking.incentiveId?.incentiveName} ({tracking.incentiveId?.incentiveType})
                                    </td>
                                    <td className="p-3 border-b">{tracking.amount}</td>
                                    <td className="p-3 border-b">{formatDate(tracking.earnedDate)}</td>
                                    <td className="p-3 border-b">{tracking.status}</td>
                                    <td className="p-3 border-b">{formatDate(tracking.dateReceived)}</td>
                                    <td className="p-3 border-b">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="btn bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400"
                                            onClick={() => handleEdit(tracking)}
                                        >
                                            Edit
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                                            onClick={() => handleDelete(tracking._id)}
                                        >
                                            Delete
                                        </motion.button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center text-gray-500 py-4">
                                    No items found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between mt-4"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary text-xs md:text-sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </motion.button>
                <span className="text-gray-700 text-xs md:text-sm">Page {currentPage}</span>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary text-xs md:text-sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={indexOfLastIncentive >= incentiveTrackings.length}
                >
                    Next
                </motion.button>
            </motion.div>
            {isOpenModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">
                            {isEditing ? "Edit Incentive " : "Assign Incentive "}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select User
                                </label>
                                <select
                                    className="input input-bordered w-full mt-1"
                                    value={formData.userId}
                                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select User --</option>
                                    {users.map((user) => (
                                        <option key={user._id} value={user._id}>
                                            {user.firstName} {user.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Incentive
                                </label>
                                <select
                                    className="input input-bordered w-full mt-1"
                                    value={formData.incentiveId}
                                    onChange={(e) => setFormData({ ...formData, incentiveId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select Incentive --</option>
                                    {allIncentives.map((incentive) => (
                                        <option key={incentive._id} value={incentive._id}>
                                            {incentive.incentiveName} ({incentive.incentiveType})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    className="input input-bordered w-full mt-1"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    className="input input-bordered w-full mt-1"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Earned Date
                                </label>
                                <input
                                    type="date"
                                    className="input input-bordered w-full mt-1"
                                    value={formData.earnedDate}
                                    onChange={(e) => setFormData({ ...formData, earnedDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsOpenModal(false)}
                                    className="btn btn-secondary mr-2"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? "Update" : "Assign"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default IncentiveTracking;
