import { PayrollHistory } from "../models/payrollHistoryModel.js";

export const calculate13MonthPay = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    console.log("Calculating 13th-month pay for the year:", currentYear);

    const payrolls = await PayrollHistory.aggregate([
      {
        $match: {
          payroll_date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $addFields: {
          totalDaysWorked: {
            $size: {
              $filter: {
                input: "$dailyWorkHours",
                as: "day",
                cond: { $gt: ["$$day.hours", 0] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$employee_id",
          employee_firstname: { $first: "$employee_firstname" },
          employee_lastname: { $first: "$employee_lastname" },
          totalGrossSalary: { $sum: "$grossSalary" },
          totalDaysWorked: { $sum: "$totalDaysWorked" },
          batch_details: {
            $push: {
              batch_id: "$batch_id",
              payroll_date: "$payroll_date",
              grossSalary: "$grossSalary",
              dailyWorkHours: "$dailyWorkHours",
              totalDaysInBatch: {
                $size: {
                  $filter: {
                    input: "$dailyWorkHours",
                    as: "day",
                    cond: { $gt: ["$$day.hours", 0] }
                  }
                }
              },
              thirteenthMonthPay: {
                $round: [{ $divide: ["$grossSalary", 12] }, 2]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          employee_id: "$_id",
          employee_name: {
            $concat: ["$employee_firstname", " ", "$employee_lastname"]
          },
          totalGrossSalary: 1,
          totalDaysWorked: 1,
          batch_details: 1,
          thirteenthMonthPay: {
            $round: [{ $divide: ["$totalGrossSalary", 12] }, 2]
          }
        }
      },
      { $sort: { employee_name: 1 } }
    ]);

    console.log("Payroll aggregation result:", payrolls);

    if (payrolls.length === 0) {
      console.warn("No payroll records found for the current year.");
      return res.status(404).json({ message: "No payroll records found for the current year." });
    }

    return res.status(200).json({
      message: "13th-month pay calculated successfully for the current year.",
      data: payrolls
    });
  } catch (error) {
    console.error("Error in calculate13MonthPay:", error.message);
    return res.status(500).json({ message: "Error calculating 13th-month pay." });
  }
};
