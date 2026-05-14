const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { complaints, users } = require('../db/schema');
const { eq } = require('drizzle-orm');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// GET /api/admin/complaints
router.get('/complaints', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const allComplaints = await db.select({
      id: complaints.id,
      complaintText: complaints.complaintText,
      aiQuestion: complaints.aiQuestion,
      userAnswer: complaints.userAnswer,
      created_at: complaints.created_at,
      userName: users.name,
      userEmail: users.email
    })
    .from(complaints)
    .innerJoin(users, eq(complaints.userId, users.id))
    .orderBy(complaints.created_at);

    res.json(allComplaints);
  } catch (error) {
    console.error('Fetch admin complaints error:', error);
    res.status(500).json({ message: 'Failed to fetch all complaints' });
  }
});

module.exports = router;
