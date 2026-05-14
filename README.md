# Complaints Registration Platform

A full-stack, AI-powered complaint management system featuring a premium glassmorphic design.

## Features
- **AI-Powered Submissions**: Uses Google Gemini to ask relevant follow-up questions for every complaint.
- **OTP Authentication**: Secure registration using email-based one-time passwords.
- **Admin Dashboard**: Comprehensive view for admins to monitor and manage all complaints.
- **Premium UI**: Modern, responsive, and glassmorphic design built with vanilla HTML/CSS/JS.

## Project Structure
- `/Backend`: Node.js/Express API with Drizzle ORM and Supabase.
- `/Frontend`: Vanilla web application.

## Quick Start
1. **Backend**:
   - `cd Backend`
   - `npm install`
   - Configure `.env` (see `.env.example`).
   - `npm run db:push` (to sync schema with Supabase).
   - `npm start` (or `npm run dev` for development with auto-restart).
2. **Frontend**:
   - Open `Frontend/index.html` in a browser (or use a local server like Live Server).

## Tech Stack
- **Backend**: Express.js, Drizzle ORM, Supabase (PostgreSQL), Gemini AI, Nodemailer.
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism), JavaScript (Fetch API).
