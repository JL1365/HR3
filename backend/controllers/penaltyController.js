import { PenaltyLevel } from "../models/penaltyModel.js";

export const createPenaltyLevel = async (req, res) => {
    try {
      const { violationType, penaltyLevel, action, consequence } = req.body;
  
      if (!violationType || !penaltyLevel || !action || !consequence) {
        return res.status(400).json({ message: "All fields are required!" });
      }
  
      if (penaltyLevel < 1 || penaltyLevel > 9) {
        return res.status(400).json({ message: "Invalid penalty level! It must be between 1 and 9." });
      }
  
      const existingPenalty = await PenaltyLevel.findOne({ violationType });
      if (existingPenalty) {
        return res.status(400).json({ message: "A penalty level with this violation type already exists!" });
      }
  
      const newPenaltyLevel = new PenaltyLevel({
        violationType,
        penaltyLevel,
        action,
        consequence,
      });
  
      await newPenaltyLevel.save();
  
      return res.status(201).json({
        message: "Penalty level created successfully!",
        penaltyLevel: newPenaltyLevel,
      });
    } catch (error) {
      console.error(`Error in creating penalty: ${error.message}`);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

export const getPenaltyLevels = async (req, res) => {
  try {
    const allPenaltyLevels = await PenaltyLevel.find();

    if (!allPenaltyLevels.length) {
      return res.status(404).json({ message: 'No penalty levels found' });
    }

    return res.status(200).json({ allPenaltyLevels });
  } catch (error) {
    console.error(`Error in retrieving penalty: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error'});
  }
};

export const updatePenaltyLevel = async (req, res) => {
    try {
      const { id } = req.params;
      const { violationType, penaltyLevel, action, consequence } = req.body;
  
      const penalty = await PenaltyLevel.findById(id);
      if (!penalty) {
        return res.status(404).json({ message: "Penalty level not found" });
      }
  
      if (violationType) {
        const existingPenalty = await PenaltyLevel.findOne({
          violationType,
          _id: { $ne: id },
        });
  
        if (existingPenalty) {
          return res.status(400).json({ message: "Another penalty with this violation type already exists!" });
        }
      }
  
      if (penaltyLevel !== undefined && (penaltyLevel < 1 || penaltyLevel > 9)) {
        return res.status(400).json({ message: "Penalty level must be between 1 and 9!" });
      }
  
      penalty.violationType = violationType || penalty.violationType;
      penalty.penaltyLevel = penaltyLevel !== undefined ? penaltyLevel : penalty.penaltyLevel;
      penalty.action = action || penalty.action;
      penalty.consequence = consequence || penalty.consequence;
  
      await penalty.save();
  
      return res.status(200).json({ message: "Penalty level updated successfully", penalty });
    } catch (error) {
      console.error(`Error in updating penalty: ${error.message}`);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

export const deletePenaltyLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const penalty = await PenaltyLevel.findByIdAndDelete(id);
    if (!penalty) {
      return res.status(404).json({ message: 'Penalty level not found' });
    }

    return res.status(200).json({ message: 'Penalty level deleted successfully' });
  } catch (error) {
    console.error(`Error in deleting penalty: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error'});
  }
};
