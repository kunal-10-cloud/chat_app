import User from "../models/User.js";
import ContactRequest from "../models/ContactRequest.js";
import { validationResult } from "express-validator";

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters long" });
    }

    // Search by username or email (case insensitive partial match)
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('-password -contacts -contactRequests');

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendContactRequest = async (req, res) => {
  try {
    const { recipientId, message = '' } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === recipientId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already contacts
    const sender = await User.findById(senderId);
    if (sender.contacts.includes(recipientId)) {
      return res.status(400).json({ message: 'User is already in your contacts' });
    }

    // Check if request already exists
    const existingRequest = await ContactRequest.findOne({
      sender: senderId,
      recipient: recipientId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Contact request already sent' });
    }

    // Create new contact request
    const contactRequest = new ContactRequest({
      sender: senderId,
      recipient: recipientId,
      message: message.trim(),
      status: 'pending'
    });

    await contactRequest.save();

    // Add request to recipient's contact requests
    await User.findByIdAndUpdate(recipientId, {
      $addToSet: { contactRequests: contactRequest._id }
    });

    // Populate sender info for the response
    await contactRequest.populate('sender', 'username email profilePic');
    await contactRequest.populate('recipient', 'username email profilePic');

    res.status(201).json(contactRequest);
  } catch (error) {
    console.error('Error sending contact request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const userId = req.user._id;

    const contactRequest = await ContactRequest.findById(requestId)
      .populate('sender', 'username email profilePic')
      .populate('recipient', 'username email profilePic');

    if (!contactRequest) {
      return res.status(404).json({ message: 'Contact request not found' });
    }

    // Verify the current user is the recipient
    if (contactRequest.recipient._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (contactRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    if (action === 'accept') {
      // Add each other to contacts
      await Promise.all([
        User.findByIdAndUpdate(contactRequest.recipient._id, {
          $addToSet: { contacts: contactRequest.sender._id },
          $pull: { contactRequests: contactRequest._id }
        }),
        User.findByIdAndUpdate(contactRequest.sender._id, {
          $addToSet: { contacts: contactRequest.recipient._id }
        }),
        ContactRequest.findByIdAndUpdate(contactRequest._id, {
          status: 'accepted'
        })
      ]);
    } else if (action === 'reject') {
      await ContactRequest.findByIdAndUpdate(contactRequest._id, {
        status: 'rejected'
      });
      
      // Remove from recipient's contact requests
      await User.findByIdAndUpdate(userId, {
        $pull: { contactRequests: contactRequest._id }
      });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    res.json({ 
      message: `Contact request ${action}ed successfully`,
      status: action === 'accept' ? 'accepted' : 'rejected'
    });
  } catch (error) {
    console.error('Error responding to contact request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getContactRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const requests = await ContactRequest.find({
      $or: [
        { recipient: userId, status: 'pending' },
        { sender: userId, status: 'pending' }
      ]
    })
    .populate('sender', 'username email profilePic')
    .populate('recipient', 'username email profilePic')
    .sort({ createdAt: -1 });

    // Categorize requests
    const sentRequests = [];
    const receivedRequests = [];

    requests.forEach(request => {
      if (request.sender._id.toString() === userId.toString()) {
        sentRequests.push({
          ...request.toObject(),
          type: 'sent',
          user: request.recipient
        });
      } else {
        receivedRequests.push({
          ...request.toObject(),
          type: 'received',
          user: request.sender
        });
      }
    });

    res.json({
      sent: sentRequests,
      received: receivedRequests
    });
  } catch (error) {
    console.error('Error getting contact requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getContacts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate('contacts', 'username email profilePic')
      .select('contacts');

    res.json(user.contacts);
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
