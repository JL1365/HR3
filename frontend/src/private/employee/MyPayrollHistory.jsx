import React, { useEffect, useState } from "react";
import { useSalaryRequestStore } from "../../store/salaryRequestStore";
import { motion, AnimatePresence } from "framer-motion";

function MyPayrollHistory() {
  const { payrollHistory, fetchMyPayrollHistory, error } =
    useSalaryRequestStore();
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMyPayrollHistory();
  }, [fetchMyPayrollHistory]);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const openModal = (payroll) => {
    setSelectedPayroll(payroll);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPayroll(null);
    setIsModalOpen(false);
  };

  const totalPages = Math.ceil(
    selectedPayroll?.dailyWorkHours?.length / itemsPerPage || 0
  );
  const currentItems =
    selectedPayroll?.dailyWorkHours?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-2 md:p-4"
    >
      <h1 className="text-2xl font-semibold mb-4">Payroll History</h1>
      {payrollHistory && payrollHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payrollHistory.map((payroll, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal(payroll)}
            >
              <div className="mb-4">
                <p className="text-sm text-gray-500">Batch ID</p>
                <p className="text-lg font-medium text-gray-800">
                  {payroll.batch_id}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Gross Salary</p>
                  <p className="font-semibold">₱{payroll.grossSalary}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Net Salary</p>
                  <p className="font-semibold text-green-600">
                    ₱{payroll.netSalary}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Starting Date</p>
                  <p className="font-medium">
                    {new Date(
                      payroll.dailyWorkHours[0].date
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payroll Date</p>
                  <p className="font-medium">
                    {new Date(payroll.payroll_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p>No payroll history available.</p>
      )}

      <AnimatePresence>
        {isModalOpen && selectedPayroll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-4 md:p-6 rounded-lg w-full max-w-4xl"
            >
              <h2 className="text-xl font-semibold mb-4">Payroll Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-medium">{selectedPayroll.employee_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">First Name</p>
                    <p className="font-medium">
                      {selectedPayroll.employee_firstname}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="font-medium">
                      {selectedPayroll.employee_lastname}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Net Salary</p>
                  <p className="text-green-600 font-bold text-lg">
                    ₱
                    {selectedPayroll.netSalary
                      ? selectedPayroll.netSalary.toLocaleString()
                      : 0}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Starting Date</p>
                    <p className="font-medium">
                      {new Date(
                        selectedPayroll.dailyWorkHours[0].date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payroll Date</p>
                    <p className="font-medium">
                      {new Date(
                        selectedPayroll.payroll_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Daily Work Hours</h3>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full text-left">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Work Hours</th>
                        <th className="px-4 py-2">Overtime Hours</th>
                        <th className="px-4 py-2">Holiday</th>
                        <th className="px-4 py-2">Deductible Amount</th>
                        <th className="px-4 py-2">Benefit Deductions Amount</th>
                        <th className="px-4 py-2">Paid Leave Amount</th>
                        <th className="px-4 py-2">Incentive Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((entry, index) => (
                        <tr key={index}>
                          <td className="border px-4 py-2">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="border px-4 py-2">{entry.hours}</td>
                          <td className="border px-4 py-2">
                            {selectedPayroll.dailyOvertimeHours.find(
                              (o) => o.date === entry.date
                            )?.hours || 0}
                          </td>
                          <td className="border px-4 py-2">
                            {entry.isHoliday ? "Yes" : "No"}
                          </td>
                          <td className="border px-4 py-2">
                            ₱
                            {selectedPayroll.deductibleAmount
                              ? selectedPayroll.deductibleAmount.toLocaleString()
                              : 0}
                          </td>
                          <td className="border px-4 py-2">
                            ₱
                            {selectedPayroll.benefitsDeductionsAmount
                              ? selectedPayroll.benefitsDeductionsAmount.toLocaleString()
                              : 0}
                          </td>
                          <td className="border px-4 py-2">
                            ₱
                            {selectedPayroll.paidLeaveAmount
                              ? selectedPayroll.paidLeaveAmount.toLocaleString()
                              : 0}
                          </td>
                          <td className="border px-4 py-2">
                            ₱
                            {selectedPayroll.incentiveAmount
                              ? selectedPayroll.incentiveAmount.toLocaleString()
                              : 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                  className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default MyPayrollHistory;
