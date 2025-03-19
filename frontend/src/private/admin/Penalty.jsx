import { useEffect, useState } from "react";
import { usePenaltyStore } from "../../store/penaltyStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

function Penalty() {
  const {
    allPenaltyLevels,
    fetchAllPenaltyLevels,
    createPenaltyLevel,
    updatePenaltyLevel,
    deletePenaltyLevel,
    loading,
    error,
  } = usePenaltyStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [penaltyData, setPenaltyData] = useState({
    _id: null,
    violationType: "",
    penaltyLevel: "",
    action: "",
    consequence: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const penaltyPerPage = 10;

  const indexOfLastPenalty = currentPage * penaltyPerPage;
  const indexOfFirstPenalty = indexOfLastPenalty - penaltyPerPage;
  const currentPenalties = allPenaltyLevels.slice(
    indexOfFirstPenalty,
    indexOfLastPenalty
  );

  const nextPage = () => {
    if (indexOfLastPenalty < allPenaltyLevels.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchAllPenaltyLevels();
  }, [fetchAllPenaltyLevels]);

  const openCreateModal = () => {
    setPenaltyData({
      _id: null,
      violationType: "",
      penaltyLevel: "",
      action: "",
      consequence: "",
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (penalty) => {
    setPenaltyData(penalty);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setPenaltyData({ ...penaltyData, [e.target.name]: e.target.value });
  };

  const validateFields = () => {
    if (
      !penaltyData.violationType ||
      !penaltyData.penaltyLevel ||
      !penaltyData.action ||
      !penaltyData.consequence
    ) {
      toast.error("All fields are required");
      return false;
    }

    const level = parseInt(penaltyData.penaltyLevel);
    if (isNaN(level) || level < 1 || level > 9) {
      toast.error("Penalty level must be between 1 and 9");
      return false;
    }

    if (!isEditMode) {
      const duplicateViolationType = allPenaltyLevels.find(
        (penalty) =>
          penalty.violationType.toLowerCase() ===
          penaltyData.violationType.toLowerCase()
      );

      if (duplicateViolationType) {
        toast.error("A penalty level with this violation type already exists!");
        return false;
      }
    }

    if (isEditMode) {
      const duplicateViolationType = allPenaltyLevels.find(
        (penalty) =>
          penalty.violationType.toLowerCase() ===
            penaltyData.violationType.toLowerCase() &&
          penalty._id !== penaltyData._id
      );

      if (duplicateViolationType) {
        toast.error("Another penalty with this violation type already exists!");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    try {
      if (isEditMode) {
        await updatePenaltyLevel(penaltyData._id, penaltyData);
        toast.success("Penalty level updated successfully!");
      } else {
        await createPenaltyLevel(penaltyData);
        toast.success("Penalty level created successfully!");
      }
      setIsModalOpen(false);
      fetchAllPenaltyLevels();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this penalty level?")) {
      try {
        await deletePenaltyLevel(id);
        toast.success("Penalty level deleted successfully!");
        fetchAllPenaltyLevels();
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "An error occurred during deletion. Please try again.";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-2 md:p-4"
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-lg font-semibold mb-4">Penalty Levels</h2>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openCreateModal}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full md:w-auto"
      >
        Create Penalty Level
      </motion.button>
      {loading && <p>Loading penalty levels...</p>}
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
                  <th className="p-2 md:p-3 text-left">Violation Type</th>
                  <th className="p-2 md:p-3 text-left">Level</th>
                  <th className="p-2 md:p-3 text-left">Response</th>
                  <th className="p-2 md:p-3 text-left">Consequence</th>
                  <th className="p-2 md:p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white text-neutral-500 border-b">
                {currentPenalties.length > 0 ? (
                  currentPenalties.map((penalty, index) => (
                    <motion.tr
                      key={penalty._id}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {penalty.violationType}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {penalty.penaltyLevel}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {penalty.action}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {penalty.consequence}
                      </td>
                      <td className="p-2 md:p-3 text-left flex flex-col md:flex-row gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(penalty)}
                          className="btn bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(penalty._id)}
                          className="px-2 py-1 md:px-3 md:py-1 bg-red-500 text-white text-xs md:text-sm rounded hover:bg-red-600"
                        >
                          Delete
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No penalty levels found.
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
          disabled={indexOfLastPenalty >= allPenaltyLevels.length}
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
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? "Edit Penalty Level" : "Create Penalty Level"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Violation Type
                </label>
                <input
                  type="text"
                  name="violationType"
                  value={penaltyData.violationType}
                  onChange={handleChange}
                  placeholder="Violation Type"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penalty Level (1-9)
                </label>
                <input
                  type="number"
                  name="penaltyLevel"
                  value={penaltyData.penaltyLevel}
                  onChange={handleChange}
                  placeholder="1-9"
                  min="1"
                  max="9"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <input
                  type="text"
                  name="action"
                  value={penaltyData.action}
                  onChange={handleChange}
                  placeholder="Action"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consequence
                </label>
                <input
                  type="text"
                  name="consequence"
                  value={penaltyData.consequence}
                  onChange={handleChange}
                  placeholder="Consequence"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                {isEditMode ? "Update" : "Create"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Penalty;
