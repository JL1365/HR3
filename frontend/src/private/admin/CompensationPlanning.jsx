import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCompensationStore } from "../../store/compensationStore";
import { useAuthStore } from "../../store/authStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CompensationPlanning() {
  const {
    compensationPlans,
    fetchCompensationPlans,
    createCompensationPlan,
    updateCompensationPlan,
    loading,
    error,
  } = useCompensationStore();
  const { allPositions, fetchAllPositions } = useAuthStore();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    position: "",
    hourlyRate: "",
    overTimeRate: "",
    holidayRate: "",
    benefits: [{ benefitType: "", deductionsAmount: 0 }],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 10;

  const indexOfLastPlan = currentPage * plansPerPage;
  const indexOfFirstPlan = indexOfLastPlan - plansPerPage;
  const currentPlans = compensationPlans.slice(indexOfFirstPlan, indexOfLastPlan);

  const nextPage = () => {
    if (indexOfLastPlan < compensationPlans.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchCompensationPlans();
    fetchAllPositions();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const showBenefits = (benefits) => {
    setSelectedBenefits(benefits);
    setIsOpenModal(true);
  };

  const handleAddOrUpdatePlan = async () => {
    if (!newPlan.position) {
      toast.error("Position is required!");
      return;
    }

    if (!newPlan.hourlyRate) {
      toast.error("Hourly rate is required!");
      return;
    }

    try {
      const planData = {
        position: newPlan.position,
        hourlyRate: parseFloat(newPlan.hourlyRate),
        overTimeRate: parseFloat(newPlan.overTimeRate),
        holidayRate: parseFloat(newPlan.holidayRate),
        benefits: newPlan.benefits.filter(
          (benefit) => benefit.benefitType.trim() !== ""
        ),
      };

      if (newPlan._id) {
        await updateCompensationPlan(newPlan._id, planData);
        toast.success("Compensation plan updated successfully!");
        fetchCompensationPlans();
      } else {
        await createCompensationPlan(planData);
        toast.success("Compensation plan created successfully!");
        fetchCompensationPlans();
      }

      setIsAddModalOpen(false);
      setNewPlan({
        position: "",
        hourlyRate: "",
        overTimeRate: "",
        holidayRate: "",
        benefits: [{ benefitType: "", deductionsAmount: 0 }],
      });
    } catch (err) {
      console.error("Error in compensation plan operation:", err);
    }
  };

  const openEditModal = (plan) => {
    setNewPlan({
      ...plan,

      benefits:
        plan.benefits && plan.benefits.length > 0
          ? plan.benefits
          : [{ benefitType: "", deductionsAmount: 0 }],
    });
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setNewPlan({
      position: "",
      hourlyRate: "",
      overTimeRate: "",
      holidayRate: "",
      benefits: [{ benefitType: "", deductionsAmount: 0 }],
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-2">
      <ToastContainer position="top-right" autoClose={3000} />

      <button
        className="btn btn-success mb-4"
        onClick={() => {
          setNewPlan({
            position: "",
            hourlyRate: "",
            overTimeRate: "",
            holidayRate: "",
            benefits: [{ benefitType: "", deductionsAmount: 0 }],
          });
          setIsAddModalOpen(true);
        }}
      >
        Add Compensation Plan
      </button>

      {loading && (
        <div className="flex justify-center items-center my-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="table-auto w-full pb-5 text-sm">
            <thead className="bg-white text-gray-500 border-b">
              <tr>
                <th className="p-3 text-left">Position</th>
                <th className="p-3 text-left">Hourly Rate</th>
                <th className="p-3 text-left">Overtime Rate</th>
                <th className="p-3 text-left">Holiday Rate</th>
                <th className="p-3 text-left">Benefits</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white text-neutral-500 border-b">
              {currentPlans.length > 0 ? (
                currentPlans.map((plan) => (
                  <tr key={plan._id}>
                    <td className="p-3 border-b">{plan.positionName || "N/A"}</td>
                    <td className="p-3 border-b">₱{parseFloat(plan.hourlyRate).toFixed(2)}</td>
                    <td className="p-3 border-b">₱{parseFloat(plan.overTimeRate).toFixed(2)}</td>
                    <td className="p-3 border-b">₱{parseFloat(plan.holidayRate).toFixed(2)}</td>
                    <td className="p-3 border-b">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => showBenefits(plan.benefits || [])}
                        disabled={!plan.benefits || plan.benefits.length === 0}
                      >
                        View Benefits
                      </button>
                    </td>
                    <td className="p-3 border-b">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => openEditModal(plan)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-4">
                    No compensation plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="flex justify-between mt-4">
        <button className="btn btn-primary" onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span className="text-gray-700">Page {currentPage}</span>
        <button className="btn btn-primary" onClick={nextPage} disabled={indexOfLastPlan >= compensationPlans.length}>
          Next
        </button>
      </div>

      {isOpenModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Benefits</h2>
            {selectedBenefits && selectedBenefits.length > 0 ? (
              <div className="overflow-y-auto max-h-80">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="p-3 text-left">Benefit Type</th>
                      <th className="p-3 text-left">Deductions Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBenefits.map((benefit, index) => (
                      <tr key={benefit._id || index}>
                        <td className="p-3 border-b">{benefit.benefitType}</td>
                        <td className="p-3 border-b">
                          ₱{parseFloat(benefit.deductionsAmount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4">No Benefits</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-primary"
                onClick={() => setIsOpenModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {newPlan._id ? "Edit" : "Add"} Compensation Plan
            </h2>

            <div className="space-y-4">
              {!newPlan._id && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position*
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={newPlan.position}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, position: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select Position
                    </option>
                    {allPositions && allPositions.length > 0 ? (
                      allPositions.map((position, index) => (
                        <option key={index} value={position}>
                          {position}
                        </option>
                      ))
                    ) : (
                      <option disabled>No positions available</option>
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Hourly Rate*
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered w-full"
                  value={newPlan.hourlyRate}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, hourlyRate: e.target.value })
                  }
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Overtime Rate
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered w-full"
                  value={newPlan.overTimeRate}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, overTimeRate: e.target.value })
                  }
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Holiday Rate
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered w-full"
                  value={newPlan.holidayRate}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, holidayRate: e.target.value })
                  }
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Benefits:
                </label>
                {newPlan.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Benefit Type"
                      className="input input-bordered flex-1"
                      value={benefit.benefitType}
                      onChange={(e) => {
                        const updatedBenefits = [...newPlan.benefits];
                        updatedBenefits[index].benefitType = e.target.value;
                        setNewPlan({ ...newPlan, benefits: updatedBenefits });
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      className="input input-bordered w-1/3"
                      value={benefit.deductionsAmount}
                      onChange={(e) => {
                        const updatedBenefits = [...newPlan.benefits];
                        updatedBenefits[index].deductionsAmount = Number(
                          e.target.value
                        );
                        setNewPlan({ ...newPlan, benefits: updatedBenefits });
                      }}
                      step="0.01"
                      min="0"
                    />
                    {newPlan.benefits.length > 1 && (
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => {
                          const updatedBenefits = newPlan.benefits.filter(
                            (_, i) => i !== index
                          );
                          setNewPlan({ ...newPlan, benefits: updatedBenefits });
                        }}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="btn btn-outline btn-sm mt-2"
                  onClick={() => {
                    setNewPlan({
                      ...newPlan,
                      benefits: [
                        ...newPlan.benefits,
                        { benefitType: "", deductionsAmount: 0 },
                      ],
                    });
                  }}
                >
                  + Add Benefit
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button className="btn" onClick={resetForm}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddOrUpdatePlan}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : newPlan._id ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompensationPlanning;
