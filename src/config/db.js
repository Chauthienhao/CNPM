import sql from 'mysql2/promise';
let db =sql.createPool({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "smartschoolbustest",
});
export default db;