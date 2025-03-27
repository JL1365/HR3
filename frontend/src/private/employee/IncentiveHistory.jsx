import React, { useEffect, useState } from "react";
import { useIncentiveTrackingStore } from "../../store/incentiveTrackingStore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";
import usePageTracking from "../../hooks/usePageTracking";

function IncentiveHistory() {
  usePageTracking("Incentive History");
  const { myIncentives, fetchMyIncentives, loading } = useIncentiveTrackingStore();

  useEffect(() => {
    fetchMyIncentives();
  }, [fetchMyIncentives]);

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
              <th className="p-3 text-left">Incentive Type</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Earned Date</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white text-neutral-500 border-b">
            {myIncentives.length > 0 ? (
              myIncentives.map((incentive) => (
                <tr key={incentive._id}>
                  <td className="p-3 border-b">{incentive.incentiveId.incentiveName || "N/A"}</td>
                  <td className="p-3 border-b">{incentive.incentiveId.incentiveType || "N/A"}</td>
                  <td className="p-3 border-b">{incentive.amount || "N/A"}</td>
                  <td className="p-3 border-b">{incentive.earnedDate ? new Date(incentive.earnedDate).toLocaleDateString() : "N/A"}</td>
                  <td className="p-3 border-b">{incentive.status || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-4">
                  No incentives found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default IncentiveHistory;