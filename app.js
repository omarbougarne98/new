import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url'; 
import pkg from 'pg'; 
const { Pool } = pkg; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(bodyParser.urlencoded({ extended: true }));


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: '123',
    port: 5432,
});







const getUsers = async () => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
};


const createUser = async (firstName, lastName, birthDate, userImage, address, subscriptionDate, password, role) => {
    const query = `
        INSERT INTO users (first_name, last_name, birth_date, user_image, adress, subscribssion_date, password, roles)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [firstName, lastName, birthDate, userImage, address, subscriptionDate, password, role];
    await pool.query(query, values);
};


const updateUser = async (userId, firstName, lastName, birthDate, userImage, address, subscriptionDate, password, role) => {
    const query = `
        UPDATE users
        SET first_name = $1, last_name = $2, birth_date = $3, user_image = $4, adress = $5, subscribssion_date = $6, password = $7, roles = $8
        WHERE user_id = $9
    `;
    const values = [firstName, lastName, birthDate, userImage, address, subscriptionDate, password, role, userId];
    await pool.query(query, values);
};


const deleteUser = async (userId) => {
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
};




app.get('/users', async (req, res) => {
    const users = await getUsers();
    res.render('users', { users });
});


app.get('/users/new', (req, res) => {
    res.render('new-user');
});


app.post('/users', upload.single('userImage'), async (req, res) => {
    const { firstName, lastName, birthDate, address, subscriptionDate, password, role } = req.body;
    const userImage = req.file ? req.file.buffer : null; 

    await createUser(firstName, lastName, birthDate, userImage, address, subscriptionDate, password, role);
    res.redirect('/users');
});


app.get('/users/edit/:id', async (req, res) => {
    const userId = req.params.id;
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    const user = result.rows[0];
    res.render('edit-user', { user });
});


app.post('/users/edit/:id', upload.single('userImage'), async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, birthDate, address, subscriptionDate, password, role } = req.body;
    const userImage = req.file ? req.file.buffer : null; 

    await updateUser(userId, firstName, lastName, birthDate, userImage, address, subscriptionDate, password, role);
    res.redirect('/users');
});


app.post('/users/delete/:id', async (req, res) => {
    const userId = req.params.id;
    await deleteUser(userId);
    res.redirect('/users');
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
