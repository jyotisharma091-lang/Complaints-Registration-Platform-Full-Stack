const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../db');
const { complaints } = require('../db/schema');
const { eq } = require('drizzle-orm');
const { authenticate } = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// POST /api/ai/question
router.post('/ai/question', authenticate, async (req, res) => {
  const { complaint_text } = req.body;

  if (!complaint_text) {
    return res.status(400).json({ message: 'Complaint text is required' });
  }

  try {
    const prompt = `You are a helpful assistant for a complaint registration portal. 
    The user submitted this complaint: "${complaint_text}". 
    Ask exactly one short follow-up question to help understand the situation better. 
    Return only the question text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    res.json({ ai_question: text });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ message: 'Failed to generate AI question' });
  }
});

// POST /api/complaints
router.post('/complaints', authenticate, async (req, res) => {
  const { complaint_text, ai_question, user_answer } = req.body;

  try {
    const newComplaint = await db.insert(complaints).values({
      userId: req.user.id,
      complaintText: complaint_text,
      aiQuestion: ai_question,
      userAnswer: user_answer,
    }).returning();

    res.json(newComplaint[0]);
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({ message: 'Failed to submit complaint' });
  }
});

// GET /api/complaints/my
router.get('/complaints/my', authenticate, async (req, res) => {
  try {
    const userComplaints = await db.select()
      .from(complaints)
      .where(eq(complaints.userId, req.user.id))
      .orderBy(complaints.created_at);

    res.json(userComplaints);
  } catch (error) {
    console.error('Fetch my complaints error:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
});

module.exports = router;
