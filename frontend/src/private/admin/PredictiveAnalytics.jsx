import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';

const PredictiveAnalytics = () => {
  const [behaviorPredictions, setBehaviorPredictions] = useState([]);
  const [incentivePredictions, setIncentivePredictions] = useState([]);
  const [violationPredictions, setViolationPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPredictiveData = async () => {
      try {
        const behaviorResponse = await axiosInstance.get('/predictive/employee-behavior');
        const behaviorData = behaviorResponse.data;

        const incentiveResponse = await axiosInstance.get('/predictive/incentive-eligibility');
        const incentiveData = incentiveResponse.data;

        const violationResponse = await axiosInstance.get('/predictive/violations');
        const violationData = violationResponse.data;

        if (behaviorData.success) setBehaviorPredictions(behaviorData.predictions);
        if (incentiveData.success) setIncentivePredictions(incentiveData.incentivePredictions);
        if (violationData.success) setViolationPredictions(violationData.violations);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching predictive data:', error.message);
        setIsLoading(false);
      }
    };

    fetchPredictiveData();
  }, []);

  const getBehaviorColor = (prediction) => {
    switch (prediction) {
      case 'Potential Absenteeism': return 'bg-red-100 text-red-800';
      case 'Highly Engaged': return 'bg-green-100 text-green-800';
      case 'Balanced': return 'bg-yellow-100 text-yellow-800';
      case 'Stable Behavior': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High Risk': return 'bg-red-100 text-red-800';
      case 'Medium Risk': return 'bg-yellow-100 text-yellow-800';
      case 'Low Risk': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-2 md:p-4">
      {isLoading && <p>Loading predictive analytics...</p>}
      {!isLoading && (
        <>
          <div className="bg-white shadow-md rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4">Employee Behavior Predictions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-white text-gray-500 border-b">
                  <tr>
                    <th className="p-2 md:p-3 text-left">Employee Name</th>
                    <th className="p-2 md:p-3 text-left">Total Leaves</th>
                    <th className="p-2 md:p-3 text-left">Holidays Worked</th>
                    <th className="p-2 md:p-3 text-left">Prediction</th>
                    <th className="p-2 md:p-3 text-left">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-neutral-500 border-b">
                  {behaviorPredictions.map((employee, index) => (
                    <tr key={employee.employee_id} className="hover:bg-gray-100">
                      <td className="p-2 md:p-3 text-left">{employee.name}</td>
                      <td className="p-2 md:p-3 text-left">{employee.totalLeaves}</td>
                      <td className="p-2 md:p-3 text-left">{employee.holidaysWorked}</td>
                      <td className="p-2 md:p-3 text-left">
                        <span className={`px-2 py-1 rounded ${getBehaviorColor(employee.prediction)}`}>
                          {employee.prediction}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-left">{employee.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4">Incentive Eligibility</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-white text-gray-500 border-b">
                  <tr>
                    <th className="p-2 md:p-3 text-left">Employee Name</th>
                    <th className="p-2 md:p-3 text-left">Total Attendance</th>
                    <th className="p-2 md:p-3 text-left">Holidays Worked</th>
                    <th className="p-2 md:p-3 text-left">Total Leaves</th>
                    <th className="p-2 md:p-3 text-left">Overtime Hours</th>
                    <th className="p-2 md:p-3 text-left">Incentive Eligible</th>
                    <th className="p-2 md:p-3 text-left">Predicted Amount</th>
                    <th className="p-2 md:p-3 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-neutral-500 border-b">
                  {incentivePredictions.map((employee, index) => (
                    <tr key={employee.employee_id} className="hover:bg-gray-100">
                      <td className="p-2 md:p-3 text-left">{employee.name}</td>
                      <td className="p-2 md:p-3 text-left">{employee.totalAttendance}</td>
                      <td className="p-2 md:p-3 text-left">{employee.holidaysWorked}</td>
                      <td className="p-2 md:p-3 text-left">{employee.totalLeaves}</td>
                      <td className="p-2 md:p-3 text-left">{(employee.totalOvertimeHours || 0).toFixed(2)}</td>
                      <td className="p-2 md:p-3 text-left">
                        {employee.isEligible ? (
                          <Check className="text-green-500 mx-auto" />
                        ) : (
                          <X className="text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="p-2 md:p-3 text-left">
                        {employee.isEligible ? `₱${employee.predictedAmount}` : 'N/A'}
                      </td>
                      <td className="p-2 md:p-3 text-left">{employee.eligibilityReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Employee Retention</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-white text-gray-500 border-b">
                  <tr>
                    <th className="p-2 md:p-3 text-left">Employee Name</th>
                    <th className="p-2 md:p-3 text-left">Total Leaves</th>
                    <th className="p-2 md:p-3 text-left">Holidays Worked</th>
                    <th className="p-2 md:p-3 text-left">Total Attendance</th>
                    <th className="p-2 md:p-3 text-left">Minutes Late</th>
                    <th className="p-2 md:p-3 text-left">Previous Violations</th>
                    <th className="p-2 md:p-3 text-left">Risk Level</th>
                    <th className="p-2 md:p-3 text-left">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-neutral-500 border-b">
                  {violationPredictions.map((employee, index) => (
                    <tr key={employee.employee_id} className="hover:bg-gray-100">
                      <td className="p-2 md:p-3 text-left">{employee.name}</td>
                      <td className="p-2 md:p-3 text-left">{employee.totalLeaves}</td>
                      <td className="p-2 md:p-3 text-left">{employee.holidaysWorked}</td>
                      <td className="p-2 md:p-3 text-left">{employee.totalAttendance}</td>
                      <td className="p-2 md:p-3 text-left">{employee.totalMinutesLate}</td>
                      <td className="p-2 md:p-3 text-left">{employee.previousViolations}</td>
                      <td className="p-2 md:p-3 text-left">
                        <span className={`px-2 py-1 rounded ${getRiskColor(employee.riskLevel)}`}>
                          {employee.riskLevel}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-left">{employee.riskConfidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictiveAnalytics;
