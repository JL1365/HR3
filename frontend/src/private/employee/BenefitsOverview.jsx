import { useEffect, useState } from "react";
import { useCompensationBenefitStore } from "../../store/compensationBenefitStore";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BenefitsOverview() {
  const { benefits, fetchBenefits, loading } = useCompensationBenefitStore();
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    fetchBenefits();
  }, [fetchBenefits]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-2 md:p-4"
    >
      <ToastContainer autoClose={3000} />
      {loading && (
        <div className="flex justify-center items-center my-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="table-auto w-full pb-5 text-sm">
            <thead className="bg-white text-gray-500 border-b">
              <tr>
                <th className="p-3 text-left">Benefit Name</th>
                <th className="p-3 text-left">Benefit Type</th>
                <th className="p-3 text-left">Benefit Amount</th>
                <th className="p-3 text-left">Is Available?</th>
                <th className="p-3 text-left">Is NeedRequest?</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white text-neutral-500 border-b">
              {currentPlans.length > 0 ? (
                currentPlans.map((plan) => (
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-4">
                    No compensation benefit plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    </motion.div>
  );
}

export default BenefitsOverview;