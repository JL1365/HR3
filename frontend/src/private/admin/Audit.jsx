import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuditStore } from '../../store/auditStore';
import './Audit.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Audit() {
    const { audits, fetchAudits, createAudit, fetchMyRequests, loading, error } = useAuditStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        department: 'Hr 3',
        description: '',
        task: ['']
    });
    const [imageTooltip, setImageTooltip] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [myRequests, setMyRequests] = useState([]);
    const auditsPerPage = 10;
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [selectedResponse, setSelectedResponse] = useState(null);

    const handleFetchMyRequests = async () => {
        try {
            const response = await fetchMyRequests();
            setMyRequests(response.audits);
        } catch (err) {
            toast.error('Failed to fetch your audit requests.');
        }
    };
    

    useEffect(() => {
        fetchAudits();
        handleFetchMyRequests();
    }, [fetchAudits]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTaskChange = (index, value) => {
        const newTasks = [...formData.task];
        newTasks[index] = value;
        setFormData({ ...formData, task: newTasks });
    };

    const addTaskField = () => {
        setFormData({ ...formData, task: [...formData.task, ''] });
    };

    const removeTaskField = (index) => {
        const newTasks = formData.task.filter((_, i) => i !== index);
        setFormData({ ...formData, task: newTasks });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description.trim()) {
            toast.error('Description is required.');
            return;
        }
        if (formData.task.some(task => !task.trim())) {
            toast.error('All tasks are required.');
            return;
        }
        try {
            await createAudit(formData);
            toast.success('Audit created successfully!');
            setIsModalOpen(false);
            handleFetchMyRequests(); 
            fetchAudits(); 
        } catch (err) {
            toast.error('Failed to create audit. Please try again.');
            console.error(err);
        }
    };
    

    const indexOfLastAudit = currentPage * auditsPerPage;
    const indexOfFirstAudit = indexOfLastAudit - auditsPerPage;
    const currentAudits = audits.slice(indexOfFirstAudit, indexOfLastAudit);

    const nextPage = () => {
        if (indexOfLastAudit < audits.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const tableVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    };

    const handleTaskClick = (audit) => {
        setSelectedAudit(audit);
    };

    const handleResponseClick = (response) => {
        setSelectedResponse(response);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <motion.div
            className="p-4 max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        
            {audits.length === 0 ? (
                <p>No audits found</p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow">
                    <motion.table
                        className="table-auto w-full pb-5 text-sm"
                        variants={tableVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <thead className="bg-white text-gray-500 border-b">
                            <tr>
                                <th className="p-3 text-left">Department</th>
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3 text-left">Tasks</th>
                                <th className="p-3 text-left">Responses</th>
                                <th className="p-3 text-left">Completed At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentAudits.map((audit) => (
                                <motion.tr
                                    key={audit._id}
                                    variants={rowVariants}
                                    whileHover={{ backgroundColor: "#f9fafb" }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {audit.department}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {audit.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() => handleTaskClick(audit)}
                                            className="text-blue-500 hover:underline"
                                        >
                                            View Tasks
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() => handleResponseClick(audit.responses)}
                                            className="text-blue-500 hover:underline"
                                        >
                                            View Responses
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(audit.completedAt).toLocaleString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </motion.table>
                </div>
            )}
    <motion.button onClick={() => setIsModalOpen(true)}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
              className="mt-8 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full md:w-auto"
                >Create Audit  
            </motion.button>
            {myRequests.length > 0 && (
                <div className="overflow-x-auto rounded-lg shadow mt-8">
                    <h2>My Audit Requests</h2>
                    <motion.table
                        className="table-auto w-full pb-5 text-sm"
                        variants={tableVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <thead className="bg-white text-gray-500 border-b">
                            <tr>
                                <th className="p-3 text-left">Department</th>
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3 text-left">Tasks</th>
                                <th className="p-3 text-left">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {myRequests.map((audit) => (
                                <motion.tr
                                    key={audit._id}
                                    variants={rowVariants}
                                    whileHover={{ backgroundColor: "#f9fafb" }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {audit.department}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {audit.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <ul>
                                            {audit.task.map((task, index) => (
                                                <li key={index}>{task}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(audit.createdAt).toLocaleString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </motion.table>
                </div>
            )}

            {isModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md md:max-w-lg"
                    >
                        <h2 className="text-xl font-semibold mb-4">Create Audit</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    placeholder="Department"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Description"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tasks
                                </label>
                                {formData.task.map((task, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <textarea
                                            name={`task-${index}`}
                                            value={task}
                                            onChange={(e) => handleTaskChange(index, e.target.value)}
                                            placeholder="Task"
                                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeTaskField(index)}
                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addTaskField}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Add Task
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Submit
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {selectedAudit && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md md:max-w-lg"
                    >
                        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
                        <ul className="space-y-2">
                            {selectedAudit.task.map((task, index) => (
                                <li key={index} className="p-2 border rounded bg-gray-100">
                                    {task}
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end space-x-2 mt-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedAudit(null)}
                                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                                Close
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {selectedResponse && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md md:max-w-lg"
                    >
                        <h2 className="text-xl font-semibold mb-4">Responses</h2>
                        <ul>
                            {selectedResponse.map((response) => (
                                <li key={response._id}>
                                    {response.text}
                                    <br />
                                    <a
                                        href={response.image}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <motion.img
                                            src={response.image}
                                            alt="response"
                                            className="w-16 h-12 object-cover border rounded cursor-pointer"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        />
                                    </a>
                                    <br />
                                    {new Date(response.createdAt).toLocaleString()}
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end space-x-2 mt-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedResponse(null)}
                                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                                Close
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between mt-4"
            ></motion.div>
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
                    disabled={indexOfLastAudit >= audits.length}
                >
                    Next
                </motion.button>
            </motion.div>
    );
}

export default Audit;