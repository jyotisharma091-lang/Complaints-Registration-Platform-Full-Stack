const { db } = require('../db');
const { users } = require('../db/schema');

async function getUsers() {
  const allUsers = await db.select().from(users);
  console.log(allUsers);
}
getUsers();
