import React, { useEffect, useState } from "react";
import { useIncentiveStore } from "../../store/incentiveStore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";

function IncentivesOverview() {
  const { allIncentives, fetchAllIncentives, loading } = useIncentiveStore();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllIncentives();
  }, [fetchAllIncentives]);

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
            </tr>
          </thead>
          <tbody className="bg-white text-neutral-500 border-b">
            {currentIncentives.length > 0 ? (
              currentIncentives.map((incentive) => (
                <tr key={incentive._id}>
                  <td className="p-3 border-b">{incentive.incentiveName || "N/A"}</td>
                  <td className="p-3 border-b">{incentive.incentiveDescription || "N/A"}</td>
                  <td className="p-3 border-b">{incentive.incentiveType || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-gray-500 py-4">
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
    </motion.div>
  );
}

export default IncentivesOverview;