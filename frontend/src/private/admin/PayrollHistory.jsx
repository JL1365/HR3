import React, { useEffect, useState } from 'react';
import { useSalaryRequestStore } from '../../store/salaryRequestStore';
import { motion } from 'framer-motion';

function PayrollHistory() {
  const { payrollHistory, fetchAllPayrollHistory, error } = useSalaryRequestStore();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const payrollsPerPage = 10;

  useEffect(() => {
    fetchAllPayrollHistory();
  }, [fetchAllPayrollHistory]);

  const openModal = (batch) => {
    setSelectedBatch(batch);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBatch(null);
    setIsModalOpen(false);
    setCurrentPage(1);
  };

  const indexOfLastPayroll = currentPage * payrollsPerPage;
  const indexOfFirstPayroll = indexOfLastPayroll - payrollsPerPage;
  const currentPayrolls = selectedBatch ? selectedBatch.payrolls.slice(indexOfFirstPayroll, indexOfLastPayroll) : [];

  const nextPage = () => {
    if (indexOfLastPayroll < selectedBatch.payrolls.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!payrollHistory) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-2 md:p-4"
    >
      <h1 className="text-2xl font-semibold mb-4">Payroll History</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payrollHistory.map(batch => (
          <motion.div
            key={batch._id}
            className="bg-white p-4 rounded-lg shadow-md cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal(batch)}
          >
            <h2 className="text-xl font-semibold">Batch ID: {batch._id}</h2>
            <p>Total Employees: {batch.payrolls.length}</p>
          </motion.div>
        ))}
      </div>

      {isModalOpen && selectedBatch && (
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
            className="bg-white p-4 md:p-6 rounded-lg w-full max-w-4xl"
          >
            <h2 className="text-xl font-semibold mb-4">Batch ID: {selectedBatch._id}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-white text-gray-500 border-b">
                  <tr>
                    <th className="p-2 md:p-3 text-left">Employee</th>
                    <th className="p-2 md:p-3 text-left">Position</th>
                    <th className="p-2 md:p-3 text-left">Total Work Hours</th>
                    <th className="p-2 md:p-3 text-left">Total Overtime Hours</th>
                    <th className="p-2 md:p-3 text-left">Hourly Rate</th>
                    <th className="p-2 md:p-3 text-left">Overtime Rate</th>
                    <th className="p-2 md:p-3 text-left">Holiday Rate</th>
                    <th className="p-2 md:p-3 text-left">Gross Salary</th>
                    <th className="p-2 md:p-3 text-left">Benefits Deductions</th>
                    <th className="p-2 md:p-3 text-left">Incentive Amount</th>
                    <th className="p-2 md:p-3 text-left">Net Salary</th>
                    <th className="p-2 md:p-3 text-left">Payroll Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-neutral-500 border-b">
                  {currentPayrolls.length > 0 ? (
                    currentPayrolls.map((payroll, index) => (
                      <motion.tr
                        key={payroll._id}
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.employee_firstname} {payroll.employee_lastname}
                        </td>
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.position}
                        </td>
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.totalWorkHours}
                        </td>
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.totalOvertimeHours}
                        </td>
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.hourlyRate}
                        </td>
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.overtimeRate}
                        </td>
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.holidayRate}
                        </td>
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.grossSalary}
                        </td>
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.benefitsDeductionsAmount}
                        </td>
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.incentiveAmount}
                        </td>
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.netSalary}
                        </td>
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {new Date(payroll.payroll_date).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="text-center py-4">
                        No payroll records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-4">
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
                disabled={indexOfLastPayroll >= selectedBatch.payrolls.length}
              >
                Next
              </motion.button>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeModal}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default PayrollHistory;