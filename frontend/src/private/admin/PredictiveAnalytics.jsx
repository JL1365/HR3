import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { axiosInstance } from '../../lib/axios';

const EmployeeBehaviorPredictor = () => {
  const [predictions, setPredictions] = useState([]);
  const [model, setModel] = useState(null);
  const [incentivePredictions, setIncentivePredictions] = useState([]);

  const prepareTrainingData = (rawData) => {
    const features = rawData.map(employee => [
      employee.totalLeaves,
      employee.leaveTypesUsed.length,
      employee.holidaysWorked,
      employee.totalAttendance
    ]);

    const labels = rawData.map(employee => {
      switch (employee.prediction) {
        case 'High leave frequency, low holiday work — Potential absenteeism':
          return [1, 0, 0, 0];
        case 'Low leave usage, high holiday work — Highly engaged':
          return [0, 1, 0, 0];
        case 'Balanced: Takes leaves but still works on holidays':
          return [0, 0, 1, 0];
        default:
          return [0, 0, 0, 1];
      }
    });

    return { features, labels };
  };

  const trainModel = async (features, labels) => {
    const model = tf.sequential();

    model.add(tf.layers.dense({
      inputShape: [4],
      units: 16,
      activation: 'relu'
    }));

    model.add(tf.layers.dense({
      units: 4,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    await model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32
    });

    return model;
  };

  useEffect(() => {
    const fetchAndTrainModel = async () => {
      try {
        const response = await axiosInstance.get('/predictive/employee-behavior');
        const data = response.data;

        if (data.success) {
          const { features, labels } = prepareTrainingData(data.predictions);
          const trainedModel = await trainModel(features, labels);

          setModel(trainedModel);
          setPredictions(data.predictions);
        }
      } catch (error) {
        console.error('Error fetching or training model:', error);
      }
    };

    fetchAndTrainModel();
  }, []);

  useEffect(() => {
    const fetchIncentivePredictions = async () => {
      try {
        const response = await axiosInstance.get('/predictive/incentive-eligibility');
        const data = response.data; 

        if (data.success) {
          setIncentivePredictions(data.incentivePredictions);
        }
      } catch (error) {
        console.error('Error fetching incentive predictions:', error);
      }
    };

    fetchIncentivePredictions();
  }, []);

  const predictBehavior = (employeeFeatures) => {
    if (!model) return 'Analyzing...';

    const input = tf.tensor2d([employeeFeatures]);
    const prediction = model.predict(input);
    const predictionArray = prediction.arraySync()[0];

    const categories = [
      'Potential Absenteeism',
      'Highly Engaged',
      'Balanced',
      'Stable Behavior'
    ];

    const predictedIndex = predictionArray.indexOf(Math.max(...predictionArray));
    return categories[predictedIndex];
  };

  const sanitizeLeaveTypes = (leaveTypes) => {
    if (!Array.isArray(leaveTypes)) return [];
    return leaveTypes.filter(type => typeof type === 'string' && type.trim() !== '');
  };

  return (
    <div className="space-y-8">
      <div className="w-full max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Employee Behavior Predictive Analytics</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-2 border">Employee</th>
                <th className="p-2 border">Total Leaves</th>
                <th className="p-2 border">Leave Types</th>
                <th className="p-2 border">Holidays Worked</th>
                <th className="p-2 border">Total Attendance</th>
                <th className="p-2 border">Backend Prediction</th>
                <th className="p-2 border">ML Model Prediction</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((employee) => (
                <tr key={employee.employee_id}>
                  <td className="p-2 border">{employee.name || 'N/A'}</td>
                  <td className="p-2 border text-center">{employee.totalLeaves ?? 'N/A'}</td>
                  <td className="p-2 border">{sanitizeLeaveTypes(employee.leaveTypesUsed).join(', ') || 'N/A'}</td>
                  <td className="p-2 border text-center">{employee.holidaysWorked ?? 'N/A'}</td>
                  <td className="p-2 border text-center">{employee.totalAttendance ?? 'N/A'}</td>
                  <td className="p-2 border">{employee.prediction || 'N/A'}</td>
                  <td className="p-2 border">
                    {predictBehavior([
                      employee.totalLeaves ?? 0,
                      sanitizeLeaveTypes(employee.leaveTypesUsed).length,
                      employee.holidaysWorked ?? 0,
                      employee.totalAttendance ?? 0
                    ])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Incentive Eligibility Analytics</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-2 border">Employee</th>
                <th className="p-2 border">Total Attendance</th>
                <th className="p-2 border">Holidays Worked</th>
                <th className="p-2 border">Total Leaves</th>
                <th className="p-2 border">Eligible for Incentive</th>
              </tr>
            </thead>
            <tbody>
              {incentivePredictions.map((employee) => (
                <tr key={employee.employee_id}>
                  <td className="p-2 border">{employee.name || 'N/A'}</td>
                  <td className="p-2 border text-center">{employee.totalAttendance ?? 'N/A'}</td>
                  <td className="p-2 border text-center">{employee.holidaysWorked ?? 'N/A'}</td>
                  <td className="p-2 border text-center">{employee.totalLeaves ?? 'N/A'}</td>
                  <td className="p-2 border text-center">
                    {employee.isEligible ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeBehaviorPredictor;
