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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 bg-gray-50">

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Employee Behavior Predictions</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border">Employee Name</th>
                <th className="p-3 border">Total Leaves</th>
                <th className="p-3 border">Holidays Worked</th>
                <th className="p-3 border">Prediction</th>
                <th className="p-3 border">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {behaviorPredictions.map((employee) => (
                <tr key={employee.employee_id} className="hover:bg-gray-100">
                  <td className="p-3 border">{employee.name}</td>
                  <td className="p-3 border text-center">{employee.totalLeaves}</td>
                  <td className="p-3 border text-center">{employee.holidaysWorked}</td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded ${getBehaviorColor(employee.prediction)}`}>
                      {employee.prediction}
                    </span>
                  </td>
                  <td className="p-3 border">{employee.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Incentive Eligibility</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border">Employee Name</th>
                <th className="p-3 border">Total Attendance</th>
                <th className="p-3 border">Holidays Worked</th>
                <th className="p-3 border">Total Leaves</th>
                <th className="p-3 border">Overtime Hours</th>
                <th className="p-3 border">Incentive Eligible</th>
              </tr>
            </thead>
            <tbody>
              {incentivePredictions.map((employee) => (
                <tr key={employee.employee_id} className="hover:bg-gray-100">
                  <td className="p-3 border">{employee.name}</td>
                  <td className="p-3 border text-center">{employee.totalAttendance}</td>
                  <td className="p-3 border text-center">{employee.holidaysWorked}</td>
                  <td className="p-3 border text-center">{employee.totalLeaves}</td>
                  <td className="p-3 border text-center">
                    {(employee.totalOvertimeHours || 0).toFixed(2)}
                  </td>
                  <td className="p-3 border text-center">
                    {employee.isEligible ? (
                      <Check className="text-green-500 mx-auto" />
                    ) : (
                      <X className="text-red-500 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Employee Retention</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border">Employee Name</th>
                <th className="p-3 border">Total Leaves</th>
                <th className="p-3 border">Holidays Worked</th>
                <th className="p-3 border">Total Attendance</th>
                <th className="p-3 border">Minutes Late</th>
                <th className="p-3 border">Previous Violations</th>
                <th className="p-3 border">Risk Level</th>
                <th className="p-3 border">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {violationPredictions.map((employee) => (
                <tr key={employee.employee_id} className="hover:bg-gray-100">
                  <td className="p-3 border">{employee.name}</td>
                  <td className="p-3 border text-center">{employee.totalLeaves}</td>
                  <td className="p-3 border text-center">{employee.holidaysWorked}</td>
                  <td className="p-3 border text-center">{employee.totalAttendance}</td>
                  <td className="p-3 border text-center">{employee.totalMinutesLate}</td>
                  <td className="p-3 border text-center">{employee.previousViolations}</td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded ${getRiskColor(employee.riskLevel)}`}>
                      {employee.riskLevel}
                    </span>
                  </td>
                  <td className="p-3 border">{employee.riskConfidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PredictiveAnalytics;
