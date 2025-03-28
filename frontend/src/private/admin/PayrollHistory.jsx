import React, { useEffect, useState } from "react";
import { useSalaryRequestStore } from "../../store/salaryRequestStore";
import { motion, AnimatePresence } from "framer-motion";
import jjmLogo from '../../assets/jjmlogo.jpg';

function PayrollHistory() {
  const { payrollHistory, fetchAllPayrollHistory, error } =
    useSalaryRequestStore();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const payrollsPerPage = 10;
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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

  const openEmployeeModal = (employee) => {
    setSelectedEmployee(employee);
  };

  const closeEmployeeModal = () => {
    setSelectedEmployee(null);
  };

  const indexOfLastPayroll = currentPage * payrollsPerPage;
  const indexOfFirstPayroll = indexOfLastPayroll - payrollsPerPage;
  const currentPayrolls = selectedBatch
    ? selectedBatch.payrolls.slice(indexOfFirstPayroll, indexOfLastPayroll)
    : [];

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

  const generatePDF = () => {
    if (!selectedBatch) return;

    const originalTable = document.querySelector(".payroll-table");
    const tableClone = originalTable.cloneNode(true);

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.innerHTML = `
      <div style="background-color: white; padding: 20px; font-family: Arial;">
        <img src="${jjmLogo}" alt="Logo" style="display: block; margin: 0 auto 20px; width: 100px;">
        <h2 style="margin-bottom: 10px; text-align: center;">Payroll Batch Details</h2>
        <p style="text-align: center;">Generated: ${new Date().toLocaleDateString()}</p>
        ${tableClone.outerHTML}
      </div>
    `;
    document.body.appendChild(tempDiv);

    const printContent = tempDiv.firstChild;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export the table');
      document.body.removeChild(tempDiv);
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payroll Batch Details</title>
          <style>
            body { font-family: Arial; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .print-btn { display: block; margin: 20px auto; padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; }
            .download-btn { display: block; margin: 20px auto; padding: 10px 20px; background: #2196F3; color: white; border: none; cursor: pointer; }
            @media print {
              .print-btn, .download-btn { display: none; }
            }
          </style>
        </head>
        <body>
          ${tempDiv.innerHTML}
          <button class="print-btn" onclick="window.print()">Print</button>
          <button class="download-btn" onclick="window.close()">Close</button>
        </body>
      </html>
    `);
    printWindow.document.close();

    document.body.removeChild(tempDiv);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!payrollHistory) {
    return <div>Loading...</div>;
  }

  const totalPages = selectedEmployee
    ? Math.ceil(selectedEmployee.dailyWorkHours.length / payrollsPerPage)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-2 md:p-4"
    >
      <h1 className="text-2xl font-semibold mb-4">Payroll History</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payrollHistory.map((batch) => (
          <motion.div
            key={batch._id}
            className="bg-white p-4 rounded-lg shadow-md cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal(batch)}
          >
            <h2 className="text-xl font-semibold">Batch ID: {batch._id}</h2>
            <p>Total Employees: {batch.payrolls.length}</p>
            <p className="font-semibold text-green-600">
              Total Net Salary: ₱
              {batch.totalNetSalary ||
                batch.payrolls
                  .reduce(
                    (sum, payroll) => sum + parseFloat(payroll.netSalary || 0),
                    0
                  )
                  .toFixed(2)}
            </p>
            <p>
              <strong>Starting Date:</strong>{" "}
              {new Date(
                batch.payrolls[0].dailyWorkHours[0].date
              ).toLocaleDateString()}
            </p>
            <p>
              <strong>Payroll Date:</strong>{" "}
              {new Date(batch.payrolls[0].payroll_date).toLocaleDateString()}
            </p>
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
            <h2 className="text-xl font-semibold mb-4">
              Batch ID: {selectedBatch._id}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm payroll-table">
                <thead className="bg-white text-gray-500 border-b">
                  <tr>
                    <th className="p-2 md:p-3 text-left">Employee name</th>
                    <th className="p-2 md:p-3 text-left">Position</th>
                    <th className="p-2 md:p-3 text-left">Total Work Hours</th>
                    <th className="p-2 md:p-3 text-left">
                      Total Overtime Hours
                    </th>
                    <th className="p-2 md:p-3 text-left">Hourly Rate</th>
                    <th className="p-2 md:p-3 text-left">Overtime Rate</th>
                    <th className="p-2 md:p-3 text-left">Holiday Rate</th>
                    <th className="p-2 md:p-3 text-left">Gross Salary</th>
                    <th className="p-2 md:p-3 text-left">
                      Benefits Deductions
                    </th>
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
                        className="text-center cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => openEmployeeModal(payroll)}
                      >
                        <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                          {payroll.employee_firstname}{" "}
                          {payroll.employee_lastname}
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
                onClick={generatePDF}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Download PDF
              </motion.button>
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
      <AnimatePresence>
        {selectedEmployee && (
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
              <h2 className="text-xl font-semibold mb-4">Employee Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-medium">{selectedEmployee.employee_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">First Name</p>
                    <p className="font-medium">
                      {selectedEmployee.employee_firstname}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="font-medium">
                      {selectedEmployee.employee_lastname}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Net Salary</p>
                  <p className="text-green-600 font-bold text-lg">
                    ₱
                    {selectedEmployee.netSalary
                      ? selectedEmployee.netSalary.toLocaleString()
                      : 0}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Starting Date</p>
                    <p className="font-medium">
                      {new Date(
                        selectedEmployee.dailyWorkHours[0].date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payroll Date</p>
                    <p className="font-medium">
                      {new Date(
                        selectedEmployee.payroll_date
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
                      {selectedEmployee.dailyWorkHours.map((entry, index) => (
                        <tr key={index}>
                          <td className="border px-4 py-2">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="border px-4 py-2">{entry.hours}</td>
                          <td className="border px-4 py-2">
                            {selectedEmployee.dailyOvertimeHours.find(
                              (o) => o.date === entry.date
                            )?.hours || 0}
                          </td>
                          <td className="border px-4 py-2">
                            {entry.isHoliday ? "Yes" : "No"}
                          </td>
                          <td className="border px-4 py-2">
                            ₱
                            {selectedEmployee.deductibleAmount
                              ? selectedEmployee.deductibleAmount.toLocaleString()
                              : 0}
                          </td>
                          <td className="border px-4 py-2">
                            ₱
                            {selectedEmployee.benefitsDeductionsAmount
                              ? selectedEmployee.benefitsDeductionsAmount.toLocaleString()
                              : 0}
                          </td>
                          <td className="border px-4 py-2">
                            ₱
                            {selectedEmployee.paidLeaveAmount
                              ? selectedEmployee.paidLeaveAmount.toLocaleString()
                              : 0}
                          </td>
                          <td className="border px-4 py-2">
                            ₱
                            {selectedEmployee.incentiveAmount
                              ? selectedEmployee.incentiveAmount.toLocaleString()
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
                  onClick={closeEmployeeModal}
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

export default PayrollHistory;
