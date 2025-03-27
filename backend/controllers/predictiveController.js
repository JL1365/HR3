import * as tf from '@tensorflow/tfjs';
import { Attendance } from "../models/attendanceModel.js";
import { EmployeeLeave } from "../models/employeeLeaveModel.js";
import { Violation } from "../models/violationModel.js";

const normalizeData = (data) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  return data.map(value => (value - min) / (max - min));
};

export const predictEmployeeBehavior = async (req, res) => {
  try {
    const employees = await EmployeeLeave.find({});
    const attendanceRecords = await Attendance.find({});

    const features = [];
    const labels = [];
    const employeeMetadata = [];

    employees.forEach(employee => {
      const employeeAttendance = attendanceRecords.filter(
        record => record.employee_id.toString() === employee.employee_id.toString()
      );

      const totalLeaves = employee.leave_count || 0;
      const leaveTypesUsed = employee.leaves?.map(leave => leave.leave_type) || [];
      const holidaysWorked = employeeAttendance.filter(record => record.isHoliday).length || 0;
      const totalAttendance = employeeAttendance.length || 0;

      features.push([
        totalLeaves,
        leaveTypesUsed.length,
        holidaysWorked,
        totalAttendance
      ]);

      let label;
      if (totalLeaves > 10 && holidaysWorked < 3) {
        label = [1, 0, 0, 0];
      } else if (holidaysWorked > 10 && totalLeaves < 5) {
        label = [0, 1, 0, 0];
      } else if (totalLeaves > 5 && holidaysWorked > 5) {
        label = [0, 0, 1, 0];
      } else {
        label = [0, 0, 0, 1];
      }

      labels.push(label);

      employeeMetadata.push({
        employee_id: employee.employee_id,
        name: `${employee.employee_firstname} ${employee.employee_lastname}`,
        totalLeaves,
        leaveTypesUsed,
        holidaysWorked,
        totalAttendance
      });
    });

    const normalizedFeatures = features.map(feature => normalizeData(feature));

    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [4], units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 4, activation: 'softmax' }));

    model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

    const xs = tf.tensor2d(normalizedFeatures);
    const ys = tf.tensor2d(labels);

    await model.fit(xs, ys, { epochs: 100, batchSize: 32 });

    const predictions = await Promise.all(employeeMetadata.map(async (employee, index) => {
      const input = tf.tensor2d([normalizedFeatures[index]]);
      const prediction = model.predict(input);
      const predictionArray = (await prediction.array())[0];
      input.dispose();
      prediction.dispose();

      const categories = ['Potential Absenteeism', 'Highly Engaged', 'Balanced', 'Stable Behavior'];
      const predictedIndex = predictionArray.indexOf(Math.max(...predictionArray));

      return {
        ...employee,
        prediction: categories[predictedIndex],
        reason: `Confidence: ${(predictionArray[predictedIndex] * 100).toFixed(2)}%`
      };
    }));

    xs.dispose();
    ys.dispose();

    res.status(200).json({ success: true, predictions });
  } catch (err) {
    console.error("Error in predictive analysis:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const predictIncentiveEligibility = async (req, res) => {
  try {
    const employees = await EmployeeLeave.find({});
    const attendanceRecords = await Attendance.find({});

    const features = [];
    const incentiveMetadata = [];

    employees.forEach(employee => {
      const employeeAttendance = attendanceRecords.filter(
        record => record.employee_id.toString() === employee.employee_id.toString()
      );

      const totalLeaves = employee.leave_count || 0;
      const holidaysWorked = employeeAttendance.filter(record => record.isHoliday).length || 0;
      const totalAttendance = employeeAttendance.length || 0;
      const totalOvertimeHours = employeeAttendance.reduce((sum, record) => {
        const [hours, minutes] = record.overtime_hours.split('h ').map(Number);
        return sum + hours + minutes / 60;
      }, 0);

      features.push([totalAttendance, holidaysWorked, totalLeaves, totalOvertimeHours]);

      incentiveMetadata.push({
        employee_id: employee.employee_id,
        name: `${employee.employee_firstname} ${employee.employee_lastname}`,
        totalAttendance,
        holidaysWorked,
        totalLeaves,
        totalOvertimeHours
      });
    });

    const normalizedFeatures = features.map(feature => normalizeData(feature));

    const model = tf.sequential();
    model.add(tf.layers.dense({
      inputShape: [4],
      units: 10,
      activation: 'relu'
    }));
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));

    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    const xs = tf.tensor2d(normalizedFeatures);
    const ys = tf.tensor1d(features.map(f => 
      f[0] > 200 && f[1] > 10 && f[2] < 5 && f[3] > 50 ? 1 : 0
    ));

    await model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32
    });

    const incentivePredictions = await Promise.all(incentiveMetadata.map(async (employee, index) => {
      const input = tf.tensor2d([normalizedFeatures[index]]);
      const prediction = model.predict(input);
      const isEligible = (await prediction.array())[0][0] > 0.5;
      input.dispose();
      prediction.dispose();

      return {
        ...employee,
        isEligible,
        eligibilityReason: isEligible
          ? 'High attendance, significant holiday work, low leave usage, and high overtime hours'
          : 'Does not meet attendance, holiday work, leave, or overtime criteria'
      };
    }));

    xs.dispose();
    ys.dispose();

    res.status(200).json({ success: true, incentivePredictions });
  } catch (err) {
    console.error("Error in incentive prediction:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const predictViolations = async (req, res) => {
  try {
    const employees = await EmployeeLeave.find({});
    const attendanceRecords = await Attendance.find({});

    const features = [];
    const violationMetadata = [];

    for (const employee of employees) {
      const employeeAttendance = attendanceRecords.filter(record => {
        if (!record.employee_id) {
          console.warn(`Attendance record missing employee_id: ${JSON.stringify(record)}`);
          return false;
        }
        return record.employee_id.toString() === employee.employee_id.toString();
      });

      const totalLeaves = employee.leave_count || 0;
      const holidaysWorked = employeeAttendance.filter(record => record.isHoliday).length || 0;
      const totalAttendance = employeeAttendance.length || 0;
      const totalMinutesLate = employeeAttendance.reduce((sum, record) => sum + (record.minutes_late || 0), 0);

      const previousViolations = await Violation.countDocuments({ userId: employee.employee_id });

      features.push([totalLeaves, holidaysWorked, totalAttendance, totalMinutesLate, previousViolations]);

      violationMetadata.push({
        employee_id: employee.employee_id,
        name: `${employee.employee_firstname} ${employee.employee_lastname}`,
        totalLeaves,
        holidaysWorked,
        totalAttendance,
        totalMinutesLate,
        previousViolations
      });
    }

    const normalizedFeatures = features.map(feature => normalizeData(feature));

    const model = tf.sequential();
    model.add(tf.layers.dense({
      inputShape: [5],
      units: 16,
      activation: 'relu'
    }));
    model.add(tf.layers.dense({
      units: 3,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    const xs = tf.tensor2d(normalizedFeatures);
    const ys = tf.tensor2d(features.map(f => {
      if (f[4] > 3 || f[3] > 500) return [1, 0, 0]; 
      if (f[0] > 10 || f[3] > 200) return [0, 1, 0]; 
      return [0, 0, 1];
    }));

    await model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32
    });

    const violationPredictions = await Promise.all(violationMetadata.map(async (employee, index) => {
      const input = tf.tensor2d([normalizedFeatures[index]]);
      const prediction = model.predict(input);
      const predictionArray = (await prediction.array())[0];
      input.dispose();
      prediction.dispose();

      const riskLevels = ['High Risk', 'Medium Risk', 'Low Risk'];
      const predictedIndex = predictionArray.indexOf(Math.max(...predictionArray));

      return {
        ...employee,
        riskLevel: riskLevels[predictedIndex],
        riskConfidence: `${(predictionArray[predictedIndex] * 100).toFixed(2)}%`
      };
    }));

    xs.dispose();
    ys.dispose();

    res.status(200).json({ success: true, violations: violationPredictions });
  } catch (err) {
    console.error("Error in violation prediction:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};