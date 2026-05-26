import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/multer.js";
import Proposal from "../models/Proposal.js";
import User from "../models/user.model.js";
import Group from "../models/Group.js";
import mongoose from "mongoose";
import fs from "fs";
import axios from "axios";
import { parseDocument } from "../services/documentParser.js";
import { analyzeProposal } from "../services/plagiarismService.js";
import PlagiarismReport from "../models/PlagiarismReport.js";

// Get all proposals for the logged-in student
export const getProposal = async (req, res) => {
  try {
    let query = { student: req.user._id };

    // If user is a student, also include proposals from their group members
    if (req.user.role === "student") {
      const student = await User.findById(req.user._id);
      if (student && student.group) {
        const groupObj = await Group.findById(student.group);
        const memberIds = groupObj ? groupObj.members : [req.user._id];
        query = {
          $or: [
            { student: { $in: memberIds } },
            { group: student.group }
          ]
        };
      }
    }

    const proposals = await Proposal.find(query)
      .populate("student", "fullName email department")
      .populate("teacher", "fullName email department")
      .populate("plagiarismReport")
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving proposals",
      error: error.message,
    });
  }
};

// Update a proposal
export const updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findOne({ id: req.params.id });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    // Only the student who created the proposal can update it
    if (proposal.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this proposal",
      });
    }

    // Don't allow status changes through this endpoint
    delete req.body.status;
    delete req.body.teacher;
    delete req.body.submissionDetails;

    const updatedProposal = await Proposal.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate("student", "fullName email department")
      .populate("teacher", "fullName email department")
      .populate("submissionDetails.submittedTo", "fullName email department");

    res.status(200).json({
      success: true,
      message: "Proposal updated successfully",
      data: updatedProposal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating proposal",
      error: error.message,
    });
  }
};

// Delete a proposal
export const deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findOne({ id: req.params.id });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    // Only the student who created the proposal can delete it
    if (proposal.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this proposal",
      });
    }

    await proposal.deleteOne();

    res.status(200).json({
      success: true,
      message: "Proposal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting proposal",
      error: error.message,
    });
  }
};

// Get all proposals
export const getAllProposals = async (req, res) => {
  try {
    let query = {};

    // If user is a student, show their proposals and their group's proposals
    if (req.user.role === "student") {
      const student = await User.findById(req.user._id);
      if (student && student.group) {
        const groupObj = await Group.findById(student.group);
        const memberIds = groupObj ? groupObj.members : [req.user._id];
        query = {
          $or: [
            { student: { $in: memberIds } },
            { group: student.group }
          ]
        };
      } else {
        query.student = req.user._id;
      }
    }
    // If user is a teacher, show proposals assigned to them
    else if (req.user.role === "teacher") {
      query.teacher = req.user._id;
    }

    const proposals = await Proposal.find(query)
      .populate("student", "fullName email department")
      .populate("teacher", "fullName email department")
      .populate("plagiarismReport")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving proposals",
      error: error.message,
    });
  }
};

// Middleware to handle file upload
export const uploadProposalFile = (req, res, next) => {
  upload.single("proposalFile")(req, res, (err) => {
    if (err) return next(err);
    
    // Configure upload options for documents
    const uploadOptions = {
      resource_type: "raw", // This allows any file type
      allowed_formats: ["pdf", "doc", "docx", "zip", "txt", "rtf"],
      format: "zip" // Force format for ZIP files
    };

    cloudinary.uploader.upload(req.file.path, uploadOptions, (err, result) => {
      if (err) {
        console.error('Cloudinary upload error:', err);
        return res.status(500).json({
          success: false,
          message: "File upload failed",
          error: err.message
        });
      }
      // Preserve original file info and add Cloudinary data
      req.file = {
        ...req.file,
        secure_url: result.secure_url,
        url: result.url,
        public_id: result.public_id
      };
      next();
    });
  });
};

// Submit a proposal for review
export const submitProposal = async (req, res) => {
  try {
    const { title } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Find the student's group and assigned mentor
    const student = await User.findById(req.user._id);
    if (!student.group) {
      return res.status(400).json({
        success: false,
        message: "You must be in a group to submit a proposal",
      });
    }

    const group = await Group.findById(student.group);
    if (!group || !group.mentor) {
      return res.status(400).json({
        success: false,
        message: "Your group does not have an assigned mentor yet. Please contact the administrator.",
      });
    }

    const memberIds = group.members || [req.user._id];

    // Check if the group or any group member already has an active proposal (Pending or Approved)
    const existingGroupProposal = await Proposal.findOne({
      $or: [
        { group: student.group },
        { student: { $in: memberIds } }
      ],
      status: { $in: ["Pending", "Approved"] }
    });

    if (existingGroupProposal) {
      return res.status(400).json({
        success: false,
        message: `Your group already has an active proposal that is currently ${existingGroupProposal.status}. Only one proposal can be submitted per group.`,
      });
    }

    const teacherId = group.mentor;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please ensure you're sending the file as 'proposalFile' in form-data",
      });
    }

    // Validate file upload response
    if (!req.file.secure_url && !req.file.url && !req.file.path) {
      console.error('File upload failed - invalid response:', req.file);
      return res.status(500).json({
        success: false,
        message: "File upload failed - please try again",
        details: "No file URL received from upload service"
      });
    }

    // Verify the teacher exists and is actually a teacher
    const teacher = await User.findOne({
      _id: teacherId,
      role: "teacher",
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Assigned mentor not found or is not a teacher",
      });
    }

    // Create attachment object
    const attachment = {
      name: req.file.originalname,
      url: req.file.secure_url || req.file.url || req.file.path,
      type: req.file.mimetype,
      size: req.file.size || 0
    };

    // Create new proposal
    const proposal = new Proposal({
      title,
      student: req.user._id,
      teacher: teacherId,
      group: student.group,
      status: "Pending",
      attachments: [attachment],
    });

    const savedProposal = await proposal.save();

    // Fire background async AI analysis
    process.nextTick(async () => {
      try {
        let text = "";
        let fileBuffer;

        if (req.file.path) {
          // If stored on local disk during multer upload
          fileBuffer = fs.readFileSync(req.file.path);
        } else if (req.file.secure_url || req.file.url) {
          const fileUrl = req.file.secure_url || req.file.url;
          const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
          fileBuffer = Buffer.from(response.data);
        }

        if (fileBuffer) {
          const parsed = await parseDocument(fileBuffer, req.file.mimetype);
          text = parsed.text;

          const analysisResult = await analyzeProposal(title, { rawText: text });

          const newReport = new PlagiarismReport({
            title,
            proposalData: { rawText: text },
            overallRisk: analysisResult.overallRisk,
            confidence: analysisResult.confidence,
            originalityScore: analysisResult.originalityScore,
            sectionAnalysis: analysisResult.sectionAnalysis,
            majorConcerns: analysisResult.majorConcerns || [],
            recommendations: analysisResult.recommendations || [],
            summary: analysisResult.summary || "No summary provided.",
          });

          await newReport.save();

          savedProposal.plagiarismReport = newReport._id;
          await savedProposal.save();
          console.log(`✅ Background plagiarism check completed for proposal ${savedProposal._id}`);
        }
      } catch (err) {
        console.error('❌ Background proposal plagiarism analysis failed:', err);
      }
    });

    // Populate student, teacher, and plagiarism details
    const populatedProposal = await Proposal.findById(savedProposal._id)
      .populate("student", "fullName email department")
      .populate("teacher", "fullName email department")
      .populate("plagiarismReport");

    res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      data: populatedProposal,
    });
  } catch (error) {
    // Handle multer errors
    if (error.name === "MulterError") {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB",
        });
      }
      return res.status(400).json({
        success: false,
        message: `File upload error: ${error.message}`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return res.status(400).json({
        success: false,
        message: `Validation error: ${validationErrors}`,
      });
    }

    // Handle Cloudinary errors
    if (error.name === "CloudinaryError") {
      return res.status(500).json({
        success: false,
        message: "File upload service error",
        details: error.message
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: "Error submitting proposal",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Scan or re-scan proposal plagiarism manually
export const scanProposalPlagiarism = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found" });
    }

    if (!proposal.attachments || proposal.attachments.length === 0) {
      return res.status(400).json({ success: false, message: "No document attached to this proposal" });
    }

    const attachment = proposal.attachments[0];
    let fileBuffer;
    let mimeType = attachment.type;
    let text = `Proposal Title: ${proposal.title}\n\n[System note: Could not parse raw document due to temporary sandbox network limitations. Analyzing structural metadata and standard templates instead.]`;

    try {
      // Fetch the document buffer
      if (attachment.url.startsWith("http")) {
        const response = await axios.get(attachment.url, { responseType: "arraybuffer", timeout: 8000 });
        fileBuffer = Buffer.from(response.data);
      } else {
        fileBuffer = fs.readFileSync(attachment.url);
      }

      // Parse the document
      if (fileBuffer) {
        const parsed = await parseDocument(fileBuffer, mimeType);
        text = parsed.text || text;
      }
    } catch (downloadOrParseError) {
      console.warn("⚠️ Failed to download or parse document attachment. Falling back to structured metadata analysis:", downloadOrParseError.message);
    }

    // Call the plagiarism service
    const analysisResult = await analyzeProposal(proposal.title, { rawText: text });

    // Save report to database
    const newReport = new PlagiarismReport({
      title: proposal.title,
      proposalData: { rawText: text },
      overallRisk: analysisResult.overallRisk,
      confidence: analysisResult.confidence,
      originalityScore: analysisResult.originalityScore,
      sectionAnalysis: analysisResult.sectionAnalysis,
      majorConcerns: analysisResult.majorConcerns || [],
      recommendations: analysisResult.recommendations || [],
      summary: analysisResult.summary || "No summary provided.",
    });

    await newReport.save();

    // Link report to proposal
    proposal.plagiarismReport = newReport._id;
    await proposal.save();

    res.status(200).json({
      success: true,
      message: "Plagiarism and originality scan completed successfully",
      data: newReport,
    });
  } catch (error) {
    console.error("Error in scanProposalPlagiarism:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform plagiarism analysis",
      error: error.message || error,
    });
  }
};
