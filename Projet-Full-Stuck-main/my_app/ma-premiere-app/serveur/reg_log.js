const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "26182619Iz@",
    database: "users",
    insecureAuth: true
});


const app = express();
var corsOptions = {
    origin: "http://localhost:3000"
};
app.use(cors(corsOptions));


app.use(bodyParser.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.post("/api/registre", async (req, res) => {
    const { nom, prenom, ddn, carteEtudiant, classe, email, password } = req.body;
    const passwordcrypt = await bcrypt.hash(password, 10);

    try {
        
        const [rows] = await pool.query('SELECT * FROM registre WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        
        const [results] = await pool.query('INSERT INTO registre (nom, prenom, ddn, carteEtudiant, classe, email, password) VALUES (?,?,?,?,?,?,?)', [nom, prenom, ddn, carteEtudiant, classe, email, passwordcrypt]);

        return res.status(200).json({
            success: true,
            message: "User registered successfully",
        });
    } catch (err) {
        console.log("error: ", err);
        return res.status(500).json({
            success: false,
            message: "An error occurred while registering the user"
        });
    }
});


app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [result] = await pool.query('SELECT * FROM registre WHERE email = ?', [email]);
        if (result.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = result[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const token = jwt.sign({ email }, 'secret-key');
            return res.status(200).json({ token, user });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }
    } catch (err) {
        console.log("error: ", err);
        return res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
});






const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('image'), async (req, res) => {
    const image = req.file;
    if (!image) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const query = 'INSERT INTO images (filename, originalname, path) VALUES (?, ?, ?)';
    try {
        await pool.query(query, [image.filename, image.originalname, image.path]);
        res.json({ message: 'Image uploaded successfully.' });
    } catch (err) {
        console.error('Error saving image:', err);
        res.status(500).json({ error: 'Error saving image' });
    }
});

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Access unauthorized. Missing token.' });
    }

    jwt.verify(token, 'secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Access unauthorized. Invalid token.' });
        }

        req.user = user; 
        next(); 
    });
};


app.get('/api/getFileData', authenticateToken, async (req, res) => {
    let query = "SELECT * FROM images";

    try {
        const [results] = await pool.query(query);
        res.send(results);
    } catch (err) {
        console.log("Error retrieving image data:", err);
        res.status(500).send({
            message: err.message || "An error occurred while retrieving image data."
        });
    }
});

app.get('/api/getAllUser', async (req, res) => {
    let query = "SELECT * FROM registre ORDER BY id";

    try {
        const [data] = await pool.query(query);
        res.send(data);
    } catch (err) {
        console.log("error: ", err);
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    }
});

app.get('/api/removeUser/:id', async (req, res) => {
    const userId = req.params.id;
    let query = "DELETE FROM registre WHERE id = ?";

    try {
        await pool.query(query, [userId]);
        res.send({
            message: "User removed successfully."
        });
    } catch (err) {
        console.log("error: ", err);
        res.status(500).send({
            message: err.message || "Some error occurred while removing the user."
        });
    }
});

app.listen(3100, () => {
    console.log('Server started on port 3100');
});
