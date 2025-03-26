import React, { useEffect, useState, useRef } from 'react'; 
import { useSalaryRequestStore } from '../../store/salaryRequestStore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import PayrollHistory from './PayrollHistory';
import jjmLogo from '../../assets/jjmlogo.jpg'
function SalaryComputation() {
  const {
    grossSalaryData,
    netSalaryData,
    fetchGrossSalary,
    fetchNetSalary,
    finalizePayroll,
    error,
  } = useSalaryRequestStore();

  const [openModalData, setOpenModalData] = useState(null);
  const [activeTab, setActiveTab] = useState('workHours');
  const grossTableRef = useRef(null);
  const netTableRef = useRef(null);
  const detailsTableRef = useRef(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [batchId, setBatchId] = useState(null);

  useEffect(() => {
    fetchGrossSalary();
    fetchNetSalary();
  }, [fetchGrossSalary, fetchNetSalary]);
  
  useEffect(() => {
    if (grossSalaryData?.length > 0) {
      setBatchId(grossSalaryData[0].batch_id);
    } else if (netSalaryData?.length > 0) {
      setBatchId(netSalaryData[0].batch_id);
    }
  }, [grossSalaryData, netSalaryData]);

  const exportTableAsImage = (tableRef, fileName) => {
    if (!tableRef || !tableRef.current) return;
    
    const originalTable = tableRef.current;
    const tableClone = originalTable.cloneNode(true);
    
    const headerRow = tableClone.querySelector('thead tr');
    let actionColumnIndex = -1;
    
    Array.from(headerRow.cells).forEach((cell, index) => {
      if (cell.textContent.trim() === 'Actions') {
        actionColumnIndex = index;
      }
    });
    
    if (actionColumnIndex !== -1) {
      headerRow.deleteCell(actionColumnIndex);
      
      const rows = tableClone.querySelectorAll('tbody tr');
      rows.forEach(row => {
        if (row.cells.length > actionColumnIndex) {
          row.deleteCell(actionColumnIndex);
        }
      });
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.innerHTML = `
      <div style="background-color: white; padding: 20px; font-family: Arial;">
       <img src="${jjmLogo}" alt="Logo" style="display: block; margin: 0 auto 20px; width: 100px;">
        <h2 style="margin-bottom: 10px; text-align: center;">Salary Computation Report</h2>
        <p style="text-align: center;">Generated: ${new Date().toLocaleDateString()}</p>
        ${tableClone.outerHTML}
      </div>
    `;
    document.body.appendChild(tempDiv);
    
    const printContent = tempDiv.firstChild;
    const contentWidth = printContent.offsetWidth;
    const contentHeight = printContent.offsetHeight;
    
    const canvas = document.createElement('canvas');
    canvas.width = contentWidth;
    canvas.height = contentHeight;
    
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
          <title>${fileName}</title>
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

  const handleFinalizePayroll = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to finalize the payroll?"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setIsFinalizing(true);
      await finalizePayroll(batchId);
      toast.success("Payroll finalized successfully.");
      
      // Reload data after finalization
      await fetchGrossSalary();
      await fetchNetSalary();
    } catch (error) {
      console.error("Error finalizing payroll:", error);
      toast.error(
        error.response?.data?.message || "Failed to finalize payroll"
      );
    } finally {
      setIsFinalizing(false);
    }
  };

const renderTable = (data, type) => {
  const totalNetSalary = data.reduce((sum, batch) => {
    return sum + parseFloat(batch.totalNetSalary || "0");
  }, 0).toFixed(2);

  return (
    <div className="overflow-x-auto">
      <table className="table w-full table-zebra" ref={type === 'gross' ? grossTableRef : netTableRef}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Total Work Hours</th>
            <th>Total Overtime Hours</th>
            <th>Gross Salary</th>
            {type === 'net' && (
              <>
                <th>Benefits Deductions</th>
                <th>Incentive Amount</th>
                <th>Paid Leave Amount</th>
                <th>Deductible Amount</th>
                <th>Net Salary</th>
              </>
            )}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((batch) =>
            batch.employees.map((employee) => (
              <motion.tr 
                key={employee.employee_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <td>{employee.employee_firstname}</td>
                <td>{employee.employee_lastname}</td>
                <td>{employee.totalWorkHours}</td>
                <td>{employee.totalOvertimeHours}</td>
                <td>{employee.grossSalary}</td>
                {type === 'net' && (
                  <>
                    <td>{employee.benefitsDeductionsAmount}</td>
                    <td>{employee.incentiveAmount}</td>
                    <td>{employee.paidLeaveAmount}</td>
                    <td>{employee.deductibleAmount}</td>
                    <td>{employee.netSalary}</td>
                  </>
                )}
                <td>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => setOpenModalData(employee)}
                  >
                    View Details
                  </button>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
        {/* Add footer row with total net salary - only show for net salary table */}
        {type === 'net' && (
          <tfoot>
            <tr className="font-bold text-base">
              <td colSpan={type === 'net' ? 9 : 4} className="text-right">Total Net Salary:</td>
              <td className="text-primary text-lg">{totalNetSalary}</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

  const renderEmployeeDetailsTable = () => {
    if (!openModalData) return null;
    
    return (
      <div ref={detailsTableRef} style={{display: 'none'}}>
        <table className="table w-full table-zebra">
          <thead>
            <tr>
              <th colSpan="2">Employee Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Name</td>
              <td>{openModalData.employee_firstname} {openModalData.employee_lastname}</td>
            </tr>
            <tr>
              <td>Position</td>
              <td>{openModalData.position}</td>
            </tr>
            <tr>
              <td>Total Work Hours</td>
              <td>{openModalData.totalWorkHours}</td>
            </tr>
            <tr>
              <td>Total Overtime Hours</td>
              <td>{openModalData.totalOvertimeHours}</td>
            </tr>
            <tr>
              <td>Gross Salary</td>
              <td>{openModalData.grossSalary}</td>
            </tr>
            {'netSalary' in openModalData && (
              <>
                <tr>
                  <td>Benefits Deductions</td>
                  <td>{openModalData.benefitsDeductionsAmount}</td>
                </tr>
                <tr>
                  <td>Incentive Amount</td>
                  <td>{openModalData.incentiveAmount}</td>
                </tr>
                <tr>
                  <td>Paid Leave Amount</td>
                  <td>{openModalData.paidLeaveAmount}</td>
                </tr>
                <tr>
                  <td>Deductible Amount</td>
                  <td>{openModalData.deductibleAmount}</td>
                </tr>
                <tr>
                  <td>Net Salary</td>
                  <td>{openModalData.netSalary}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {openModalData.benefitsDeductionsDetails?.length > 0 && (
          <table className="table w-full table-zebra mt-4">
            <thead>
              <tr>
                <th colSpan="3">Benefits Deductions</th>
              </tr>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {openModalData.benefitsDeductionsDetails.map(item => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>{item.amount}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td>Total</td>
                <td colSpan="2">{openModalData.benefitsDeductionsAmount}</td>
              </tr>
            </tbody>
          </table>
        )}

        {openModalData.deductibleDetails?.length > 0 && (
          <table className="table w-full table-zebra mt-4">
            <thead>
              <tr>
                <th colSpan="3">Deductible Amounts</th>
              </tr>
              <tr>
                <th>Benefit Name</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {openModalData.deductibleDetails.map(item => (
                <tr key={item.id}>
                  <td>{item.benefitName}</td>
                  <td>{item.amount}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td>Total</td>
                <td colSpan="2">{openModalData.deductibleAmount}</td>
              </tr>
            </tbody>
          </table>
        )}

        {openModalData.incentiveDetails?.length > 0 && (
          <table className="table w-full table-zebra mt-4">
            <thead>
              <tr>
                <th colSpan="3">Incentives</th>
              </tr>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {openModalData.incentiveDetails.map(item => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>{item.amount}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td>Total</td>
                <td colSpan="2">{openModalData.incentiveAmount}</td>
              </tr>
            </tbody>
          </table>
        )}

        {openModalData.paidLeaveDetails?.length > 0 && (
          <table className="table w-full table-zebra mt-4">
            <thead>
              <tr>
                <th colSpan="4">Paid Leave</th>
              </tr>
              <tr>
                <th>Benefit Name</th>
                <th>Days</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {openModalData.paidLeaveDetails.map(item => (
                <tr key={item.id}>
                  <td>{item.benefitName}</td>
                  <td>{item.daysLeave}</td>
                  <td>{item.amount}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td>Total</td>
                <td colSpan="3">{openModalData.paidLeaveAmount}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      className="p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer />
      
      <motion.div 
        className="flex flex-col items-center mb-6 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-2xl font-bold mb-2">Salary Computation</h1>
        {batchId && (
          <motion.div 
            className="bg-primary text-white py-2 px-4 rounded-lg shadow-md"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg">Batch ID: {batchId}</h2>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFinalizePayroll}
          className="btn btn-primary mt-4"
          disabled={isFinalizing || !batchId}
        >
          {isFinalizing ? "Finalizing..." : "Finalize Payroll"}
        </motion.button>
      </motion.div>

      <motion.div 
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-lg font-semibold mb-2 md:mb-0">Gross Salary Data</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-sm btn-primary"
            onClick={() => exportTableAsImage(grossTableRef, 'gross-salary-data')}
          >
            Export Gross Salary Data
          </motion.button>
        </div>
        
        {grossSalaryData ? renderTable(grossSalaryData, 'gross') : (
          <motion.div 
            className="flex justify-center p-6"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <p>Loading...</p>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-lg font-semibold mb-2 md:mb-0">Net Salary Data</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-sm btn-primary"
            onClick={() => exportTableAsImage(netTableRef, 'net-salary-data')}
          >
            Export Net Salary Data
          </motion.button>
        </div>
        
        {netSalaryData ? renderTable(netSalaryData, 'net') : (
          <motion.div 
            className="flex justify-center p-6"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <p>Loading...</p>
          </motion.div>
        )}
      </motion.div>

      {renderEmployeeDetailsTable()}

      <AnimatePresence>
        {openModalData && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-lg max-w-4xl w-full overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="sticky top-0 bg-white p-4 border-b z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <h3 className="text-lg font-bold mb-2 md:mb-0">
                    Employee Details - {openModalData.employee_firstname} {openModalData.employee_lastname}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-sm btn-error"
                    onClick={() => setOpenModalData(null)}
                  >
                    Close
                  </motion.button>
                </div>

                <div className="tabs tabs-boxed overflow-x-auto flex-nowrap whitespace-nowrap">
                  <button 
                    className={`tab ${activeTab === 'workHours' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('workHours')}>
                    Work Hours
                  </button>
                  <button 
                    className={`tab ${activeTab === 'deductions' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('deductions')}>
                    Benefits & Deductions
                  </button>
                  <button 
                    className={`tab ${activeTab === 'incentives' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('incentives')}>
                    Incentives
                  </button>
                  <button 
                    className={`tab ${activeTab === 'paidLeave' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('paidLeave')}>
                    Paid Leave
                  </button>
                  <button 
                    className={`tab ${activeTab === 'summary' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('summary')}>
                    Summary
                  </button>
                </div>
              </div>

              <div className="p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'workHours' && (
                      <div className="overflow-x-auto">
                        <h4 className="font-semibold mb-2">Daily Work & Overtime Hours</h4>
                        <table className="table table-zebra w-full">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Work Hours</th>
                              <th>Overtime Hours</th>
                              <th>Holiday</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const workMap = new Map();
                              openModalData.dailyWorkHours?.forEach(entry => {
                                workMap.set(entry.date, {
                                  workHours: entry.hours,
                                  isHoliday: entry.isHoliday
                                });
                              });

                              const overtimeMap = new Map();
                              openModalData.dailyOvertimeHours?.forEach(entry => {
                                overtimeMap.set(entry.date, entry.hours);
                              });

                              const allDates = Array.from(
                                new Set([
                                  ...workMap.keys(),
                                  ...overtimeMap.keys()
                                ])
                              ).sort();

                              return allDates.map(date => {
                                const workEntry = workMap.get(date);
                                const overtimeHours = overtimeMap.get(date) || 0;

                                return (
                                  <tr key={date}>
                                    <td>{new Date(date).toLocaleDateString()}</td>
                                    <td>{workEntry?.workHours ?? 0}</td>
                                    <td>{overtimeHours}</td>
                                    <td>{workEntry?.isHoliday ? 'Yes' : 'No'}</td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === 'deductions' && (
                      <div className="overflow-x-auto">
                        <h4 className="font-semibold mb-2">Benefits Deductions</h4>
                        {openModalData.benefitsDeductionsDetails?.length > 0 ? (
                          <table className="table table-zebra w-full mb-4">
                            <thead>
                              <tr>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {openModalData.benefitsDeductionsDetails.map(item => (
                                <tr key={item.id}>
                                  <td>{item.description}</td>
                                  <td>{item.amount}</td>
                                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                              <tr className="font-bold">
                                <td>Total</td>
                                <td colSpan="2">{openModalData.benefitsDeductionsAmount}</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <p>No benefit deductions found.</p>
                        )}

                        <h4 className="font-semibold mb-2 mt-4">Deductible Amounts</h4>
                        {openModalData.deductibleDetails?.length > 0 ? (
                          <table className="table table-zebra w-full">
                            <thead>
                              <tr>
                                <th>Benefit Name</th>
                                <th>Amount</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {openModalData.deductibleDetails.map(item => (
                                <tr key={item.id}>
                                  <td>{item.benefitName}</td>
                                  <td>{item.amount}</td>
                                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                              <tr className="font-bold">
                                <td>Total</td>
                                <td colSpan="2">{openModalData.deductibleAmount}</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <p>No deductible amounts found.</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'incentives' && (
                      <div className="overflow-x-auto">
                        <h4 className="font-semibold mb-2">Incentives</h4>
                        {openModalData.incentiveDetails?.length > 0 ? (
                          <table className="table table-zebra w-full">
                            <thead>
                              <tr>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {openModalData.incentiveDetails.map(item => (
                                <tr key={item.id}>
                                  <td>{item.description}</td>
                                  <td>{item.amount}</td>
                                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                              <tr className="font-bold">
                                <td>Total</td>
                                <td colSpan="2">{openModalData.incentiveAmount}</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <p>No incentives found.</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'paidLeave' && (
                      <div className="overflow-x-auto">
                        <h4 className="font-semibold mb-2">Paid Leave</h4>
                        {openModalData.paidLeaveDetails?.length > 0 ? (
                          <table className="table table-zebra w-full">
                            <thead>
                              <tr>
                                <th>Benefit Name</th>
                                <th>Days</th>
                                <th>Amount</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {openModalData.paidLeaveDetails.map(item => (
                                <tr key={item.id}>
                                  <td>{item.benefitName}</td>
                                  <td>{item.daysLeave}</td>
                                  <td>{item.amount}</td>
                                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                              <tr className="font-bold">
                                <td>Total</td>
                                <td colSpan="3">{openModalData.paidLeaveAmount}</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <p>No paid leave found.</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'summary' && (
                      <div className="overflow-x-auto">
                        <h4 className="font-semibold mb-2">Salary Summary</h4>
                        <table className="table table-zebra w-full">
                          <thead>
                            <tr>
                              <th>Category</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Gross Salary</td>
                              <td>{openModalData.grossSalary}</td>
                            </tr>
                            <tr>
                              <td>Benefits Deductions</td>
                              <td>-{openModalData.benefitsDeductionsAmount}</td>
                            </tr>
                            <tr>
                              <td>Deductible Amount</td>
                              <td>-{openModalData.deductibleAmount}</td>
                            </tr>
                            <tr>
                              <td>Incentive Amount</td>
                              <td>+{openModalData.incentiveAmount}</td>
                            </tr>
                            <tr>
                              <td>Paid Leave Amount</td>
                              <td>+{openModalData.paidLeaveAmount}</td>
                            </tr>
                            <tr className="font-bold text-lg">
                              <td>Net Salary</td>
                              <td>{openModalData.netSalary}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <PayrollHistory />
    </motion.div>
  );
}

export default SalaryComputation;