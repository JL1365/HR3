import { useEffect, useState } from "react";
import { useCompensationBenefitStore } from "../../store/compensationBenefitStore";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddEmployeeCompensation from './AddEmployeeCompensation';
function CompensationBenefit() {
  const {
    benefits,
    fetchBenefits,
    loading,
    createCompensationBenefitPlan,
    updateCompensationBenefitPlan,
    deleteCompensationBenefit,
  } = useCompensationBenefitStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [newPlan, setNewPlan] = useState({
    benefitName: "",
    benefitType: "",
    benefitAmount: 0,
    isNeedRequest: false,
    isAvailable: false,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const plansPerPage = 10;

  const indexOfLastPlan = currentPage * plansPerPage;
  const indexOfFirstPlan = indexOfLastPlan - plansPerPage;
  const currentPlans = benefits.slice(indexOfFirstPlan, indexOfLastPlan);

  const nextPage = () => {
    if (indexOfLastPlan < benefits.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlan({
      ...newPlan,
      [name]: value,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPlan({
      ...editingPlan,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    setNewPlan({
      ...newPlan,
      isAvailable: e.target.checked,
    });
  };

  const handleEditCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditingPlan({
      ...editingPlan,
      [name]: checked,
    });
  };

  const handleEditClick = (plan) => {
    setEditingPlan({
      ...plan,
      benefitAmount: Number(plan.benefitAmount),
    });
    setIsEditModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!newPlan.benefitName) {
      toast.error("Benefit Name is required!");
      return;
    }

    if (!newPlan.benefitType) {
      toast.error("Benefit Type is required!");
      return;
    }

    if (newPlan.benefitAmount <= 0) {
      toast.error("Benefit Amount must be greater than 0!");
      return;
    }

    try {
      const planToCreate = {
        benefitName: newPlan.benefitName,
        benefitType: newPlan.benefitType,
        benefitAmount: Number(newPlan.benefitAmount),
        isAvailable: newPlan.isAvailable,
        ...(newPlan.benefitType === "Deductible Benefit" && {
          isNeedRequest: newPlan.isNeedRequest,
        }),
      };

      const response = await createCompensationBenefitPlan(planToCreate);

      if (response && response.success) {
        toast.success("Compensation Benefit Plan created successfully!");
        setIsAddModalOpen(false);
        setNewPlan({
          benefitName: "",
          benefitType: "",
          benefitAmount: 0,
          isNeedRequest: false,
          isAvailable: false,
        });
        fetchBenefits();
      } else {
        toast.error(
          response?.message || "Failed to create compensation benefit plan!"
        );
      }
    } catch (err) {
      console.error("Error creating compensation benefit plan:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to create compensation benefit plan!";
      toast.error(errorMsg);
    }
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();

    if (!editingPlan.benefitName) {
      toast.error("Benefit Name is required!");
      return;
    }

    if (!editingPlan.benefitType) {
      toast.error("Benefit Type is required!");
      return;
    }

    if (editingPlan.benefitAmount <= 0) {
      toast.error("Benefit Amount must be greater than 0!");
      return;
    }

    try {
      const planToUpdate = {
        benefitName: editingPlan.benefitName,
        benefitType: editingPlan.benefitType,
        benefitAmount: Number(editingPlan.benefitAmount),
        isAvailable: editingPlan.isAvailable,
        ...(editingPlan.benefitType === "Deductible Benefit" && {
          isNeedRequest: editingPlan.isNeedRequest,
        }),
      };

      const response = await updateCompensationBenefitPlan(
        editingPlan._id,
        planToUpdate
      );

      if (response && response.message) {
        toast.success("Compensation Benefit Plan updated successfully!");
        setIsEditModalOpen(false);
        setEditingPlan(null);
        fetchBenefits();
      } else {
        toast.error(
          response?.message || "Failed to update compensation benefit plan!"
        );
      }
    } catch (err) {
      console.error("Error updating compensation benefit plan:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to update compensation benefit plan!";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, [fetchBenefits]);

  const handleDeleteClick = async (planId) => {
    try {
      const confirmation = window.confirm(
        "Are you sure you want to delete this compensation benefit plan?"
      );
      if (confirmation) {
        const response = await deleteCompensationBenefit(planId);
        if (response.success) {
          toast.success("Compensation Benefit Plan deleted successfully!");
          fetchBenefits();
        } else {
          toast.error(
            response.message || "Failed to delete compensation benefit plan!"
          );
        }
      }
    } catch (err) {
      console.error("Error deleting compensation benefit plan:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to delete compensation benefit plan!"
      );
    }
  };

  const filterPlansByType = (type) => {
    return benefits.filter((plan) => plan.benefitType === type);
  };

  const renderTable = (plans, title) => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full pb-5 text-sm">
          <thead className="bg-white text-gray-500 border-b">
            <tr>
              <th className="p-3 text-left">
                {title === "Paid Benefits"
                  ? "Paid Benefit Name"
                  : title === "Deductible Benefits"
                  ? "Deductible Benefit Name"
                  : "Violation Deduction Name"}
              </th>
              <th className="p-3 text-left">Benefit Type</th>
              <th className="p-3 text-left">Benefit Amount</th>
              <th className="p-3 text-left">Is Available?</th>
              <th className="p-3 text-left">Is NeedRequest?</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white text-neutral-500 border-b">
            {plans.length > 0 ? (
              plans.map((plan) => (
                <tr key={plan._id}>
                  <td className="p-3 border-b">{plan.benefitName || "N/A"}</td>
                  <td className="p-3 border-b">{plan.benefitType || "N/A"}</td>
                  <td className="p-3 border-b">
                    ₱{parseFloat(plan.benefitAmount).toFixed(2) || "N/A"}
                  </td>
                  <td className="p-3 border-b">
                    {plan.isAvailable ? "Yes" : "No"}
                  </td>
                  <td className="p-3 border-b">
                    {plan.isNeedRequest ? "Yes" : "No"}
                  </td>
                  <td className="p-3 border-b">
                    <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="p-3 border-b">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="btn bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400"
                      onClick={() => handleEditClick(plan)}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                      onClick={() => handleDeleteClick(plan._id)}
                    >
                      Delete
                    </motion.button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-4">
                  No {title.toLowerCase()} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

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
        onClick={() => setIsAddModalOpen(true)}
      >
        Create Compensation Benefit
      </motion.button>
      {loading && (
        <div className="flex justify-center items-center my-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}
      {/* Modal for Creating New Compensation Benefit Plan */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Create New Compensation Benefit
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Benefit Name
                </label>
                <input
                  type="text"
                  name="benefitName"
                  value={newPlan.benefitName}
                  onChange={handleInputChange}
                  className="input input-bordered w-full mt-1"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Benefit Type
                </label>
                <select
                  name="benefitType"
                  value={newPlan.benefitType}
                  onChange={handleInputChange}
                  className="input input-bordered w-full mt-1"
                  required
                >
                  <option value="">Select Benefit Type</option>
                  <option value="Paid Benefit">Paid Benefit</option>
                  <option value="Deductible Benefit">Deductible Benefit</option>
                  <option value="Violation Deduction">Violation Deduction</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Benefit Amount
                </label>
                <input
                  type="number"
                  name="benefitAmount"
                  value={newPlan.benefitAmount}
                  onChange={handleInputChange}
                  className="input input-bordered w-full mt-1"
                  required
                />
              </div>

              {newPlan.benefitType === "Deductible Benefit" && (
                <div className="mb-4">
                  <label className="inline-flex items-center text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      name="isNeedRequest"
                      checked={newPlan.isNeedRequest}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          isNeedRequest: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    Need Request for Deduction?
                  </label>
                </div>
              )}

              <div className="mb-4">
                <label className="inline-flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={newPlan.isAvailable}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  Is Available?
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Compensation Benefit Plan */}
      {isEditModalOpen && editingPlan && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Edit Compensation Benefit
            </h2>
            <form onSubmit={handleEditFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Benefit Name
                </label>
                <input
                  type="text"
                  name="benefitName"
                  value={editingPlan.benefitName}
                  onChange={handleEditInputChange}
                  className="input input-bordered w-full mt-1"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Benefit Type
                </label>
                <select
                  name="benefitType"
                  value={editingPlan.benefitType}
                  onChange={handleEditInputChange}
                  className="input input-bordered w-full mt-1"
                  required
                >
                  <option value="">Select Benefit Type</option>
                  <option value="Paid Benefit">Paid Benefit</option>
                  <option value="Deductible Benefit">Deductible Benefit</option>
                  <option value="Violation Deduction">Violation Deduction</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Benefit Amount
                </label>
                <input
                  type="number"
                  name="benefitAmount"
                  value={editingPlan.benefitAmount}
                  onChange={handleEditInputChange}
                  className="input input-bordered w-full mt-1"
                  required
                />
              </div>

              {editingPlan.benefitType === "Deductible Benefit" && (
                <div className="mb-4">
                  <label className="inline-flex items-center text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      name="isNeedRequest"
                      checked={editingPlan.isNeedRequest}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          isNeedRequest: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    Need Request for Deduction?
                  </label>
                </div>
              )}

              <div className="mb-4">
                <label className="inline-flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={editingPlan.isAvailable}
                    onChange={handleEditCheckboxChange}
                    className="mr-2"
                  />
                  Is Available?
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-secondary mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {renderTable(filterPlansByType("Paid Benefit"), "Paid Benefits")}
      {renderTable(filterPlansByType("Deductible Benefit"), "Deductible Benefits")}
      {renderTable(filterPlansByType("Violation Deduction"), "Violation Deductions")}

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
        <span className="text-gray-700 text-xs md:text-sm">Page {currentPage}</span>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary text-xs md:text-sm" 
          onClick={nextPage} 
          disabled={indexOfLastPlan >= benefits.length}
        >
          Next
        </motion.button>
      </motion.div>
      <AddEmployeeCompensation />
    </motion.div>
  );
}

export default CompensationBenefit;
