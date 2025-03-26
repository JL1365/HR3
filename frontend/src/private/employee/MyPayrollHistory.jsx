import React, { useEffect, useState, useRef } from "react";
import { useSalaryRequestStore } from "../../store/salaryRequestStore";
import { motion, AnimatePresence } from "framer-motion";
import jjmLogo from "../../assets/jjmlogo.jpg";

function MyPayrollHistory() {
  const { payrollHistory, fetchMyPayrollHistory, error } =
    useSalaryRequestStore();
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const detailsTableRef = useRef(null);

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

  const exportTableAsImage = () => {
    if (!detailsTableRef || !detailsTableRef.current) return;

    const originalTable = detailsTableRef.current;
    const tableClone = originalTable.cloneNode(true);

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.innerHTML = `
      <div style="background-color: white; padding: 20px; font-family: Arial;">
        <img src="${jjmLogo}" alt="Logo" style="display: block; margin: 0 auto 20px; width: 100px;">
        <h2 style="margin-bottom: 10px; text-align: center;">Payroll Details</h2>
        <p style="text-align: center;">Generated: ${new Date().toLocaleDateString()}</p>
        <p style="text-align: center;">${selectedPayroll.employee_firstname} ${selectedPayroll.employee_lastname}</p>
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
          <title>Payroll Details</title>
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
                  <table className="table-auto w-full text-left" ref={detailsTableRef}>
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
                  onClick={exportTableAsImage}
                  className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Download PDF
                </motion.button>
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
