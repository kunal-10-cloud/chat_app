import express from 'express';
import { protectRoute as authenticate } from '../middleware/auth.middleware.js';
import * as contactController from '../controllers/contact.controller.js';

const router = express.Router();

// Search for users
router.get('/search', authenticate, contactController.searchUsers);

// Send contact request
router.post('/requests', authenticate, contactController.sendContactRequest);

// Respond to contact request (accept/reject)
router.post('/requests/:requestId/respond', authenticate, contactController.respondToRequest);

// Get contact requests (sent and received)
router.get('/requests', authenticate, contactController.getContactRequests);

// Get user's contacts
router.get('/', authenticate, contactController.getContacts);

export default router;
