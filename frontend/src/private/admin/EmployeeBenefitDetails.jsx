import { useEffect, useMemo, useRef, useState } from "react";
import { useBenefitStore } from "../../store/benefitStore";
import jjmLogo from '../../assets/jjmlogo.jpg';
import { motion } from "framer-motion";

function EmployeeBenefitDetails() {
  const {
    allBenefitRequests,
    allBenefitDeductions,
    loading,
    error,
    fetchAllEmployeeBenefitDetails,
    clearError,
  } = useBenefitStore();

  const tableRef = useRef();
  const [yearFilter, setYearFilter] = useState("all");
  const [benefitFilter, setBenefitFilter] = useState("all");

  useEffect(() => {
    fetchAllEmployeeBenefitDetails();
    return () => clearError();
  }, [fetchAllEmployeeBenefitDetails, clearError]);

  const availableYears = useMemo(() => {
    const years = new Set();
    allBenefitRequests.forEach(request => {
      if (request.createdAt) {
        const year = new Date(request.createdAt).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [allBenefitRequests]);

  const availableBenefits = useMemo(() => {
    const benefits = new Set();
    allBenefitRequests.forEach(request => {
      if (request.compensationBenefitId?.benefitName) {
        benefits.add(request.compensationBenefitId.benefitName);
      }
    });
    return Array.from(benefits).sort();
  }, [allBenefitRequests]);

  const groupedBenefits = useMemo(() => {
    const grouped = {};
    allBenefitRequests.forEach((request) => {
      const userId = request.userId?._id;
      const benefitId = request.compensationBenefitId?._id;
      const key = `${userId}-${benefitId}`;
      if (!grouped[key]) {
        grouped[key] = {
          userId,
          userName: `${request.userId?.firstName} ${request.userId?.lastName}`,
          benefitName: request.compensationBenefitId?.benefitName,
          benefitType: request.compensationBenefitId?.benefitType,
          status: request.status,
          requestDate: request.createdAt,
          year: request.createdAt ? new Date(request.createdAt).getFullYear() : null,
          deductions: [],
        };
      }
    });

    allBenefitDeductions.forEach((deduction) => {
      const userId = deduction.user?._id;
      const benefitId = deduction.BenefitRequestId?.compensationBenefitId?._id;
      const key = `${userId}-${benefitId}`;
      if (grouped[key]) {
        grouped[key].deductions.push({
          _id: deduction._id,
          amount: deduction.amount,
          deductionDate: deduction.createdAt,
        });
      }
    });

    return Object.values(grouped);
  }, [allBenefitRequests, allBenefitDeductions]);

  // Apply filters to the grouped benefits
  const filteredBenefits = useMemo(() => {
    return groupedBenefits.filter(benefit => {
      // Apply year filter
      if (yearFilter !== "all" && benefit.year !== parseInt(yearFilter)) {
        return false;
      }
      
      // Apply benefit filter
      if (benefitFilter !== "all" && benefit.benefitName !== benefitFilter) {
        return false;
      }
      
      return true;
    });
  }, [groupedBenefits, yearFilter, benefitFilter]);

  const formatPDFDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const handleDownloadPDF = () => {
    let filterTitle = "";
    if (yearFilter !== "all") {
      filterTitle += ` - Year: ${yearFilter}`;
    }
    if (benefitFilter !== "all") {
      filterTitle += ` - Benefit: ${benefitFilter}`;
    }

    const printWindow = window.open("", "", "width=900,height=650");
    
    const pdfTableContent = `
      <table class="benefit-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Benefit</th>
            <th>Type</th>
            <th>Status</th>
            <th>Request Date</th>
            <th>Deductions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredBenefits.map(benefit => `
            <tr>
              <td>${benefit.userName || "N/A"}</td>
              <td>${benefit.benefitName || "N/A"}</td>
              <td>${benefit.benefitType || "N/A"}</td>
              <td class="${getStatusClass(benefit.status)}">${benefit.status || "N/A"}</td>
              <td>${formatPDFDate(benefit.requestDate)}</td>
              <td>
                ${benefit.deductions.length > 0 
                  ? `<ul>
                      ${benefit.deductions.map(deduction => `
                        <li>
                          <strong>₱${deduction.amount.toLocaleString()}</strong> - 
                          ${formatPDFDate(deduction.deductionDate)}
                        </li>
                      `).join('')}
                    </ul>`
                  : `<span class="no-data">No deductions</span>`
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>${filterTitle}</title>
          <style>
            /* General Styles */
            body {
              font-family: 'Arial', sans-serif;
              color: #333;
              line-height: 1.5;
              padding: 30px;
              max-width: 1200px;
              margin: 0 auto;
            }
            
            /* Header Styles */
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 20px;
            }
            .logo-container {
              margin-bottom: 15px;
            }
            .logo-container img {
              width: 150px;
              height: auto;
            }
            .report-title {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
              color: #2563eb;
            }
            .report-date {
              font-size: 14px;
              color: #6b7280;
            }
            
            /* Table Styles */
            .benefit-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #e5e7eb;
              margin-top: 20px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
              font-size: 13px;
            }
            .benefit-table th {
              background-color: #f3f4f6;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              border-bottom: 2px solid #d1d5db;
              color: #4b5563;
            }
            .benefit-table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              vertical-align: top;
            }
            
            /* Status Styles */
            .status-approved {
              color: #10b981;
              font-weight: 600;
            }
            .status-pending {
              color: #f59e0b;
              font-weight: 600;
            }
            .status-rejected {
              color: #ef4444;
              font-weight: 600;
            }
            
            /* List Styles */
            ul {
              margin: 0;
              padding-left: 20px;
            }
            li {
              margin-bottom: 6px;
            }
            .no-data {
              color: #9ca3af;
              font-style: italic;
            }
            
            /* Footer Styles */
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              padding-top: 10px;
              border-top: 1px solid #eee;
            }
            
            /* Alternating row colors */
            .benefit-table tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            @media print {
              body {
                padding: 0;
                font-size: 12px;
              }
              .report-title {
                font-size: 18px;
              }
              .benefit-table th, .benefit-table td {
                padding: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-container">
              <img src="${jjmLogo}" alt="Company Logo" />
            </div>
            <h1 class="report-title">${filterTitle}</h1>
            <div class="report-date">Generated on: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
          
          ${filteredBenefits.length > 0 
            ? pdfTableContent 
            : `<div style="text-align: center; padding: 40px; color: #6b7280; font-style: italic;">
                <p>No benefit data available for the selected filters.</p>
              </div>`
          }
          
          <div class="footer">
            <p>JJM Employee Benefit Report</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const tableVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const resetFilters = () => {
    setYearFilter("all");
    setBenefitFilter("all");
  };

  return (
    <div className="p-4 md:p-6 max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Employee Benefit Details
        </h2>
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md shadow transition-colors flex items-center space-x-2"
          disabled={filteredBenefits.length === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download PDF</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Filters:</h3>
          
          <div className="flex flex-wrap gap-4">
            {/* Year Filter */}
            <div className="flex items-center">
              <label htmlFor="yearFilter" className="mr-2 text-sm text-gray-600">Year:</label>
              <select
                id="yearFilter"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <label htmlFor="benefitFilter" className="mr-2 text-sm text-gray-600">Benefit:</label>
              <select
                id="benefitFilter"
                value={benefitFilter}
                onChange={(e) => setBenefitFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Benefits</option>
                {availableBenefits.map(benefit => (
                  <option key={benefit} value={benefit}>{benefit}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          {yearFilter !== "all" || benefitFilter !== "all" ? (
            <div className="italic">
              Showing 
              {benefitFilter !== "all" ? ` "${benefitFilter}" benefits` : " all benefits"}
              {yearFilter !== "all" ? ` from ${yearFilter}` : ""}
              {filteredBenefits.length > 0 ? ` (${filteredBenefits.length} results)` : " (No results)"}
            </div>
          ) : null}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredBenefits.length > 0 ? (
            <div className="overflow-x-auto">
              <motion.table
                ref={tableRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="min-w-full divide-y divide-gray-200"
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Benefit
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deductions
                    </th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={tableVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white divide-y divide-gray-200"
                >
                  {filteredBenefits.map((benefit, index) => (
                    <motion.tr
                      key={index}
                      variants={rowVariants}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{benefit.userName || "N/A"}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{benefit.benefitName || "N/A"}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{benefit.benefitType || "N/A"}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(benefit.status)}`}>
                          {benefit.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {benefit.requestDate 
                            ? new Date(benefit.requestDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {benefit.deductions.length > 0 ? (
                          <ul className="text-sm text-gray-700 list-disc pl-5">
                            {benefit.deductions.map((deduction) => (
                              <li key={deduction._id} className="mb-1 last:mb-0">
                                <span className="font-medium">₱{deduction.amount.toLocaleString()}</span>
                                <span className="text-gray-500 text-xs ml-2">
                                  {new Date(deduction.deductionDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400 text-sm italic">No deductions</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </motion.table>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <svg 
                className="mx-auto h-12 w-12 text-gray-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
              <h3 className="mt-2 text-base font-medium text-gray-600">No matching benefit data</h3>
              <p className="mt-1 text-sm text-gray-500">
                {yearFilter !== "all" || benefitFilter !== "all" 
                  ? "Try changing your filter settings to see more results." 
                  : "No employee benefits have been requested yet."}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

export default EmployeeBenefitDetails;