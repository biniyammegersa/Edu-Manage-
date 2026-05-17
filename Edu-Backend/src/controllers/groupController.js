import Group from '../models/Group.js';
import User from '../models/user.model.js';

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    if (!members || !Array.isArray(members)) {
      return res.status(400).json({ success: false, message: 'Members array is required' });
    }

    // Include the creator in the members list if not already included
    const allMembers = members.includes(userId.toString()) ? members : [...members, userId.toString()];

    // Validate member count (3-5)
    if (allMembers.length < 3 || allMembers.length > 5) {
      return res.status(400).json({ success: false, message: 'A group must have between 3 and 5 members' });
    }

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ success: false, message: 'Group name already exists' });
    }

    // Check if any member is already in a group
    const users = await User.find({ _id: { $in: allMembers } });
    
    if (users.length !== allMembers.length) {
      return res.status(400).json({ success: false, message: 'One or more selected students do not exist' });
    }

    const alreadyInGroup = users.filter(user => user.group !== null && user.group !== undefined);
    if (alreadyInGroup.length > 0) {
      const names = alreadyInGroup.map(u => u.fullName).join(', ');
      return res.status(400).json({ 
        success: false, 
        message: `The following students are already in a group: ${names}` 
      });
    }

    // Create the group
    const newGroup = new Group({
      name,
      members: allMembers,
      createdBy: userId
    });

    await newGroup.save();

    // Update all members to reference this group
    await User.updateMany(
      { _id: { $in: allMembers } },
      { $set: { group: newGroup._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: newGroup
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating group',
      error: error.message
    });
  }
};

// Get the group for the currently logged-in user
export const getMyGroup = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the user to get their groupId
    const user = await User.findById(userId);

    if (!user || !user.group) {
      return res.status(404).json({ success: false, message: 'You are not in any group' });
    }

    // Find the group and populate members and mentor
    const group = await Group.findById(user.group)
      .populate({
        path: 'members',
        select: 'fullName email department imageUrl role'
      })
      .populate('mentor', 'fullName email department imageUrl role');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    res.status(200).json({
      success: true,
      data: group
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching group',
      error: error.message
    });
  }
};

// Get all groups
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('createdBy', 'fullName email')
      .populate({
        path: 'members',
        select: 'fullName email department imageUrl role'
      })
      .populate('mentor', 'fullName email department imageUrl role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching groups',
      error: error.message
    });
  }
};

// Assign a mentor to a group (Admin only)
export const assignMentor = async (req, res) => {
  try {
    const { groupId, mentorId } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can assign mentors' });
    }

    if (!groupId || !mentorId) {
      return res.status(400).json({ success: false, message: 'GroupId and MentorId are required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const mentor = await User.findOne({ _id: mentorId, role: 'teacher' });
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found or user is not a teacher' });
    }

    group.mentor = mentorId;
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Mentor assigned successfully',
      data: group
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning mentor',
      error: error.message
    });
  }
};

export default {
  createGroup,
  getMyGroup,
  getAllGroups,
  assignMentor
};
