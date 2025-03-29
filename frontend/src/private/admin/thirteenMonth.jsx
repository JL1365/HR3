import React, { useEffect, useState } from "react";
import { useThirteenMonthStore } from "../../store/thirteenMonthStore";
import { motion, AnimatePresence } from "framer-motion";
import jjmLogo from "../../assets/jjmlogo.jpg";

function ThirteenMonth() {
  const { thirteenMonthData, fetchThirteenMonthData, error } = useThirteenMonthStore();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchThirteenMonthData();
  }, [fetchThirteenMonthData]);

  const openModal = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
    setCurrentPage(1); // Reset pagination when opening the modal
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(selectedEmployee.batch_details.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const downloadPDF = () => {
    if (!selectedEmployee) return;

    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "-9999px";
    tempDiv.innerHTML = `
      <div style="background-color: white; padding: 20px; font-family: Arial;">
        <img src="${jjmLogo}" alt="Logo" style="display: block; margin: 0 auto 20px; width: 100px;">
        <h2 style="margin-bottom: 10px; text-align: center;">13th Month Pay Details</h2>
        <p style="text-align: center;">Employee: ${selectedEmployee.employee_name}</p>
        <p style="text-align: center;">Generated: ${new Date().toLocaleDateString()}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Batch ID</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Payroll Date</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Gross Salary</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Net Salary</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Daily Work Hours</th>
            </tr>
          </thead>
          <tbody>
            ${selectedEmployee.batch_details
              .map(
                (batch) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${batch.batch_id}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${new Date(batch.payroll_date).toLocaleDateString()}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">₱${batch.grossSalary.toLocaleString()}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">₱${batch.netSalary.toLocaleString()}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">
                  ${batch.dailyWorkHours
                    .map(
                      (day) =>
                        `${new Date(day.date).toLocaleDateString()}: ${day.hours} hrs ${
                          day.isHoliday ? "(Holiday)" : ""
                        }`
                    )
                    .join("<br>")}
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
    document.body.appendChild(tempDiv);

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export the table");
      document.body.removeChild(tempDiv);
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>13th Month Pay Details</title>
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

  const downloadAllPDF = () => {
    if (!thirteenMonthData.length) return;

    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "-9999px";
    tempDiv.innerHTML = `
      <div style="background-color: white; padding: 20px; font-family: Arial;">
        <img src="${jjmLogo}" alt="Logo" style="display: block; margin: 0 auto 20px; width: 100px;">
        <h2 style="margin-bottom: 10px; text-align: center;">13th Month Pay Report</h2>
        <p style="text-align: center;">Generated: ${new Date().toLocaleDateString()}</p>
        ${thirteenMonthData
          .map(
            (employee) => `
          <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px;">Employee: ${employee.employee_name}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #ddd; padding: 8px;">Batch ID</th>
                  <th style="border: 1px solid #ddd; padding: 8px;">Payroll Date</th>
                  <th style="border: 1px solid #ddd; padding: 8px;">Gross Salary</th>
                  <th style="border: 1px solid #ddd; padding: 8px;">Net Salary</th>
                  <th style="border: 1px solid #ddd; padding: 8px;">Total Days in Batch</th>
                  <th style="border: 1px solid #ddd; padding: 8px;">13th Month Pay</th>
                </tr>
              </thead>
              <tbody>
                ${employee.batch_details
                  .map(
                    (batch) => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${batch.batch_id}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${new Date(batch.payroll_date).toLocaleDateString()}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">₱${batch.grossSalary.toLocaleString()}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">₱${batch.netSalary.toLocaleString()}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${batch.totalDaysInBatch}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">₱${batch.thirteenthMonthPay.toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
          )
          .join("")}
      </div>
    `;
    document.body.appendChild(tempDiv);

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export the table");
      document.body.removeChild(tempDiv);
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>13th Month Pay Report</title>
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

  if (!thirteenMonthData.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">13th Month Pay</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadAllPDF}
          className="btn btn-sm btn-success"
        >
          Download PDF
        </motion.button>
      </div>
      <table className="table w-full table-zebra">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Total Gross Salary</th>
            <th>Total Days Worked</th>
            <th>13th Month Pay</th>
            <th>Batch Details</th>
          </tr>
        </thead>
        <tbody>
          {thirteenMonthData.map((employee) => (
            <tr
              key={employee.employee_id}
              className="cursor-pointer"
              onClick={() => openModal(employee)}
            >
              <td>{employee.employee_name}</td>
              <td>₱{employee.totalGrossSalary.toLocaleString()}</td>
              <td>{employee.totalDaysWorked}</td>
              <td>₱{employee.thirteenthMonthPay.toLocaleString()}</td>
              <td>
                <button className="btn btn-sm btn-primary">View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AnimatePresence>
        {isModalOpen && selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-lg max-w-4xl w-full overflow-y-auto max-h-[90vh]"
            >
              <div className="sticky top-0 bg-white p-4 border-b z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">
                    Employee: {selectedEmployee.employee_name}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-sm btn-error"
                    onClick={closeModal}
                  >
                    Close
                  </motion.button>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold mb-2">Batch Details</h4>
                <table className="table w-full table-zebra">
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Payroll Date</th>
                      <th>Gross Salary</th>
                      <th>Net Salary</th>
                      <th>Total Days in Batch</th>
                      <th>13th Month Pay</th>
                      <th>Daily Work Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEmployee.batch_details
                      .slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      )
                      .map((batch, index) => (
                        <tr key={index}>
                          <td>{batch.batch_id}</td>
                          <td>{new Date(batch.payroll_date).toLocaleDateString()}</td>
                          <td>₱{batch.grossSalary.toLocaleString()}</td>
                          <td>₱{batch.netSalary.toLocaleString()}</td>
                          <td>{batch.totalDaysInBatch}</td>
                          <td>₱{batch.thirteenthMonthPay.toLocaleString()}</td>
                          <td>
                            {batch.dailyWorkHours.map((day, i) => (
                              <div key={i}>
                                {new Date(day.date).toLocaleDateString()}: {day.hours} hrs{" "}
                                {day.isHoliday ? "(Holiday)" : ""}
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-center mt-4">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of{" "}
                    {Math.ceil(selectedEmployee.batch_details.length / itemsPerPage)}
                  </span>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={nextPage}
                    disabled={
                      currentPage ===
                      Math.ceil(selectedEmployee.batch_details.length / itemsPerPage)
                    }
                  >
                    Next
                  </button>
                </div>

                <div className="flex justify-end mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadPDF}
                    className="btn btn-sm btn-success"
                  >
                    Download PDF
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThirteenMonth;