import React, { useState, useEffect } from 'react';
import { useViolationStore } from '../../store/violationStore';
import { useAuthStore } from '../../store/authStore';
import { usePenaltyStore } from '../../store/penaltyStore';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EmployeeViolation() {
  const [formData, setFormData] = useState({
    userId: '',
    penaltyLevel: '',
    violationDate: '',
    sanctions: ''
  });

  const { addEmployeeViolation, fetchAllEmployeeViolations, violations, isLoading, error } = useViolationStore();
  const { users, fetchAllUsers } = useAuthStore();
  const { allPenaltyLevels, fetchAllPenaltyLevels } = usePenaltyStore();

  const [currentPage, setCurrentPage] = useState(1);
  const violationsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const indexOfLastViolation = currentPage * violationsPerPage;
  const indexOfFirstViolation = indexOfLastViolation - violationsPerPage;
  const currentViolations = violations.slice(indexOfFirstViolation, indexOfLastViolation);

  const nextPage = () => {
    if (indexOfLastViolation < violations.length) {
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
    fetchAllPenaltyLevels();
    fetchAllEmployeeViolations();
  }, [fetchAllUsers, fetchAllPenaltyLevels, fetchAllEmployeeViolations]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addEmployeeViolation(formData);
      toast.success('Violation added successfully');
      setIsModalOpen(false);
      fetchAllEmployeeViolations();
    } catch (err) {
      toast.error('Error adding violation');
    }
  };

  const openModal = () => {
    setFormData({
      userId: '',
      penaltyLevel: '',
      violationDate: '',
      sanctions: ''
    });
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-2 md:p-4"
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openModal}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full md:w-auto"
      >
        Add Employee Violation
      </motion.button>
      {isLoading && <p>Loading violations...</p>}
      {error && <p className="text-red-500">{error}</p>}

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
                  <th className="p-2 md:p-3 text-left">User</th>
                  <th className="p-2 md:p-3 text-left">Penalty Level</th>
                  <th className="p-2 md:p-3 text-left">Violation Date</th>
                  <th className="p-2 md:p-3 text-left">Sanctions</th>
                </tr>
              </thead>
              <tbody className="bg-white text-neutral-500 border-b">
                {currentViolations.length > 0 ? (
                  currentViolations.map((violation, index) => (
                    <motion.tr
                      key={violation._id}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {violation.user?.firstName} {violation.user?.lastName}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {violation.penaltyLevel ? `${violation.penaltyLevel.penaltyLevel} - ${violation.penaltyLevel.violationType}` : 'No Penalty Level'}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {violation.violationDate}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {violation.sanctions}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No violations found.
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
          disabled={indexOfLastViolation >= violations.length}
        >
          Next
        </motion.button>
      </motion.div>
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
            <h2 className="text-xl font-semibold mb-4">Add Employee Violation</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select 
                  name="userId" 
                  value={formData.userId} 
                  onChange={handleChange} 
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Level</label>
                <select 
                  name="penaltyLevel" 
                  value={formData.penaltyLevel} 
                  onChange={handleChange} 
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Penalty Level</option>
                  {allPenaltyLevels.map(level => (
                    <option key={level._id} value={level._id}>
                      {level.penaltyLevel} - {level.violationType}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Violation Date</label>
                <input 
                  type="date" 
                  name="violationDate" 
                  value={formData.violationDate} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sanctions</label>
                <input 
                  type="text" 
                  name="sanctions" 
                  value={formData.sanctions} 
                  onChange={handleChange} 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Violation
                </motion.button>
              </div>
              {error && <p className="text-red-500">{error}</p>}
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default EmployeeViolation;