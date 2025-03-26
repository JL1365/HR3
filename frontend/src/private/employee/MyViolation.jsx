import { useEffect, useState } from 'react';
import { useViolationStore } from '../../store/violationStore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

function MyViolations() {
  const { myViolations, getMyViolations, isLoading, error } = useViolationStore();
  const [currentPage, setCurrentPage] = useState(1);
  const violationsPerPage = 10;

  useEffect(() => {
    getMyViolations();
  }, [getMyViolations]);

  const indexOfLastViolation = currentPage * violationsPerPage;
  const indexOfFirstViolation = indexOfLastViolation - violationsPerPage;
  const currentViolations = myViolations.slice(indexOfFirstViolation, indexOfLastViolation);

  const nextPage = () => {
    if (indexOfLastViolation < myViolations.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    toast.error(error);
    return <p>Error: {error}</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-2 md:p-4"
    >
      <ToastContainer position="top-right" autoClose={3000} />
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
                  <th className="p-2 md:p-3 text-left">Action</th>
                  <th className="p-2 md:p-3 text-left">Consequence</th>
                  <th className="p-2 md:p-3 text-left">Amount</th>
                  <th className="p-2 md:p-3 text-left">Violation Date</th>
                  <th className="p-2 md:p-3 text-left">Sanctions</th>
                  <th className="p-2 md:p-3 text-left">Status</th>
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
                        {violation.penaltyLevel.violationType}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {violation.penaltyLevel.action}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {violation.penaltyLevel.consequence}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {violation.penaltyLevel.amount}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {new Date(violation.violationDate).toLocaleDateString()}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {violation.sanctions}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {violation.status}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
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
          disabled={indexOfLastViolation >= myViolations.length}
        >
          Next
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default MyViolations;