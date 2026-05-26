import Group from '../models/Group.js';
import User from '../models/user.model.js';
import GroupMessage from '../models/GroupMessage.js';

/**
 * POST /api/groups/chat
 * Send a message to the current user's group chat.
 * Accessible to: group members + assigned mentor.
 */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Message cannot exceed 2000 characters.' });
    }

    // Resolve the group for this user
    const group = await resolveGroupForUser(userId);
    if (!group) {
      return res.status(403).json({ success: false, message: 'You are not a member of any group.' });
    }

    const message = await GroupMessage.create({
      group: group._id,
      sender: userId,
      content: content.trim(),
    });

    // Populate sender details for the response
    await message.populate('sender', 'fullName email imageUrl role');

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message.', error: error.message });
  }
};

/**
 * GET /api/groups/chat
 * Fetch messages for the current user's group (last 100, oldest first).
 * Accessible to: group members + assigned mentor.
 */
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    const group = await resolveGroupForUser(userId);
    if (!group) {
      return res.status(403).json({ success: false, message: 'You are not a member of any group.' });
    }

    const messages = await GroupMessage.find({ group: group._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('sender', 'fullName email imageUrl role')
      .lean();

    // Return oldest-first for display
    messages.reverse();

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch messages.', error: error.message });
  }
};

// ─── Helper ────────────────────────────────────────────────────────────────

/**
 * Find the group that a user belongs to.
 * Only students with a group assignment are allowed — mentors are excluded.
 */
async function resolveGroupForUser(userId) {
  const user = await User.findById(userId).select('group');
  if (user && user.group) {
    return await Group.findById(user.group);
  }
  return null;
}
