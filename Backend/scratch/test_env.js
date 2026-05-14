require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not Loaded');
console.log('PORT:', process.env.PORT);
