const { db } = require('../db');
const { users } = require('../db/schema');

async function checkUsers() {
    try {
        const allUsers = await db.select().from(users);
        console.log('All Users:', JSON.stringify(allUsers, null, 2));
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        process.exit();
    }
}

checkUsers();
