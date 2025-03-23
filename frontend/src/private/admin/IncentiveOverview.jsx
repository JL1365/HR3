import React, { useEffect, useState } from "react";
import { useIncentiveStore } from "../../store/incentiveStore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";

function IncentiveOverview() {
  const {
    allIncentives,
    fetchAllIncentives,
    createIncentive,
    updateIncentive,
    deleteIncentive,
    loading,
  } = useIncentiveStore();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    incentiveName: "",
    incentiveDescription: "",
    incentiveType: "Others",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllIncentives();
  }, [fetchAllIncentives]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateIncentive(editingItem, formData);
        toast.success("Incentive updated successfully!");
      } else {
        await createIncentive(formData);
        toast.success("Incentive created successfully!");
      }
      resetForm();
      setIsOpenModal(false);
    } catch (error) {
      console.error("Error saving incentive:", error);
      toast.error("Error saving incentive: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEdit = (incentive) => {
    setEditingItem(incentive._id);
    setFormData({
      incentiveName: incentive.incentiveName,
      incentiveDescription: incentive.incentiveDescription,
      incentiveType: incentive.incentiveType,
    });
    setIsEditing(true);
    setIsOpenModal(true);
  };

  const resetForm = () => {
    setFormData({
      incentiveName: "",
      incentiveDescription: "",
      incentiveType: "Others",
    });
    setEditingItem(null);
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteIncentive(id);
      toast.success("Item deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  // Pagination logic
  const indexOfLastIncentive = currentPage * itemsPerPage;
  const indexOfFirstIncentive = indexOfLastIncentive - itemsPerPage;
  const currentIncentives = allIncentives.slice(indexOfFirstIncentive, indexOfLastIncentive);
  const totalPages = Math.ceil(allIncentives.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
          resetForm();
          setIsOpenModal(true);
        }}
      >
        Create Incentive
      </motion.button>
      {loading && (
        <div className="flex justify-center items-center my-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="table-auto w-full pb-5 text-sm">
          <thead className="bg-white text-gray-500 border-b">
            <tr>
              <th className="p-3 text-left">Incentive Name</th>
              <th className="p-3 text-left">Incentive Description</th>
              <th className="p-3 text-left">Incentive Type</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white text-neutral-500 border-b">
            {currentIncentives.length > 0 ? (
              currentIncentives.map((incentive) => (
                <tr key={incentive._id}>
                  <td className="p-3 border-b">{incentive.incentiveName || "N/A"}</td>
                  <td className="p-3 border-b">{incentive.incentiveDescription || "N/A"}</td>
                  <td className="p-3 border-b">{incentive.incentiveType || "N/A"}</td>
                  <td className="p-3 border-b">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="btn bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400"
                      onClick={() => handleEdit(incentive)}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                      onClick={() => handleDelete(incentive._id)}
                    >
                      Delete
                    </motion.button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-4">
                  No incentives found.
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
          disabled={indexOfLastIncentive >= allIncentives.length}
        >
          Next
        </motion.button>
      </motion.div>
      {isOpenModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? "Edit Incentive" : "Create Incentive"}
            </h2>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Incentive Name
                </label>
                <input
                  type="text"
                  name="incentiveName"
                  value={formData.incentiveName}
                  onChange={handleChange}
                  className="input input-bordered w-full mt-1"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Incentive Description
                </label>
                <input
                  type="text"
                  name="incentiveDescription"
                  value={formData.incentiveDescription}
                  onChange={handleChange}
                  className="input input-bordered w-full mt-1"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Incentive Type
                </label>
                <select
                  name="incentiveType"
                  value={formData.incentiveType}
                  onChange={handleChange}
                  className="input input-bordered w-full mt-1"
                  required
                >
                  <option value="Others">Others</option>
                  <option value="Performance-Based">Performance-Based</option>
                  <option value="Attendance-Based">Attendance-Based</option>
                  <option value="Safety and Compliance">Safety and Compliance</option>
                  <option value="Tenure-Based">Tenure-Based</option>
                  <option value="Skill Development">Skill Development</option>
                  <option value="Referral">Referral</option>
                  <option value="Special Occasion">Special Occasion</option>
                  <option value="Sales-Based">Sales-Based</option>
                </select>
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
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default IncentiveOverview;
