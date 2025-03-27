import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useBenefitDeductiontStore } from "../../store/benefitDeductionStore";
import usePageTracking from "../../hooks/usePageTracking";

function MyDeductions() {
  usePageTracking("My Deductions");
  const {
    myDeductions = [],
    fetchMyDeductions,
    loading,
  } = useBenefitDeductiontStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [deductionsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  
  useEffect(() => {
    fetchMyDeductions();
  }, []);

  const groupedDeductions = myDeductions.reduce((acc, deduction) => {
    const benefitName = deduction.BenefitRequestId?.compensationBenefitId?.benefitName || "N/A";
    if (!acc[benefitName]) {
      acc[benefitName] = [];
    }
    acc[benefitName].push(deduction);
    return acc;
  }, {});

  const benefitNames = Object.keys(groupedDeductions);
  const totalPages = Math.ceil(benefitNames.length / deductionsPerPage);

  const indexOfLastBenefit = currentPage * deductionsPerPage;
  const indexOfFirstBenefit = indexOfLastBenefit - deductionsPerPage;
  const currentBenefits = benefitNames.slice(indexOfFirstBenefit, indexOfLastBenefit);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        duration: 0.5 
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: { 
        duration: 0.2 
      }
    }
  };

  const handleRowClick = (benefitName) => {
    setSelectedBenefit(benefitName);
    setIsModalOpen(true);
  };

  return (
    <div className="p-2 md:p-4 space-y-4 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="overflow-x-auto">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">My Deductions</h2>
            <div className="text-sm text-gray-500">
              {benefitNames.length > 0
                ? `Showing ${indexOfFirstBenefit + 1} - ${Math.min(
                    indexOfLastBenefit,
                    benefitNames.length
                  )} of ${benefitNames.length} benefits`
                : "No deductions found"}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : benefitNames.length === 0 ? (
            <motion.p
              variants={itemVariants}
              className="p-4 text-center text-gray-500"
            >
              No deductions found.
            </motion.p>
          ) : (
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3">Benefit Name</th>
                  <th className="px-4 py-3">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {currentBenefits.map((benefitName) => {
                  const totalAmount = groupedDeductions[benefitName].reduce(
                    (sum, deduction) => sum + deduction.amount,
                    0
                  );
                  return (
                    <motion.tr
                      key={benefitName}
                      variants={itemVariants}
                      className="cursor-pointer hover:bg-gray-50 border-b"
                      onClick={() => handleRowClick(benefitName)}
                    >
                      <td className="px-4 py-3">{benefitName}</td>
                      <td className="px-4 py-3">₱{totalAmount}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {benefitNames.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center mt-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-outline btn-sm"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            Previous
          </motion.button>

          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-outline btn-sm"
            onClick={nextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Deduction Details</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-sm btn-circle"
                >
                  ✕
                </motion.button>
              </div>
              
              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="table w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr>
                      <th className="px-4 py-3">Benefit Name</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedDeductions[selectedBenefit]?.map((deduction) => (
                      <motion.tr 
                        key={deduction._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b"
                      >
                        <td className="px-4 py-3">
                          {deduction.BenefitRequestId?.compensationBenefitId?.benefitName || "N/A"}
                        </td>
                        <td className="px-4 py-3">₱{deduction.amount}</td>
                        <td className="px-4 py-3">
                          {new Date(deduction.createdAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-primary"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MyDeductions;
