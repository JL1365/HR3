import { BenefitDocument } from "../models/benefitDocumentsModel.js";

export const uploadDocument = async (req, res) => {
  try {
    console.log(req.file); 

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { description,remarks } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const fileUrl = req.file.path;

    const newDocument = new BenefitDocument({
      documentFile: fileUrl,
      description,
      remarks:remarks || "",
    });

    await newDocument.save();

    res.status(200).json({ message: 'File uploaded successfully', document: newDocument });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};

export const getUploadedDocuments = async (req, res) => {
  try {
    const documents = await BenefitDocument.find({});
    if (documents.length === 0) {
      return res.status(404).json({ message: "No documents found!" });
    }
    res.status(200).json({ message: "Fetching documents success:", documents });
  } catch (error) {
    console.log(`Error in fetching documents: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
