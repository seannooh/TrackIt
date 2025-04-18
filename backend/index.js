const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./database.db');
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// CREATE DATABASE TABLE FOR USER LOGIN INFO
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            password TEXT NOT NULL
        )
    `);
});

// SIGNUP
app.post('/signup', (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    // CHECK IF EMAIL IS ALREADY IN DATABASE
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Database error: " + err.message });
        }

        // ERROR MESSAGE IF EMAIL FOUND
        if (row) {
            return res.status(400).json({ error: "Email is already in use." });
        }

        // ADD USER INFO TO DATABASE
        const stmt = db.prepare('INSERT INTO users(email, first_name, last_name, password) VALUES (?,?,?,?)');
        stmt.run(email, firstName, lastName, password, function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error saving user data' });
            }
            res.status(201).json({ message: 'User created successfully', userId: this.lastID });
        });
        stmt.finalize();
    });
});

// LOGIN
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Database error: " + err.message });
        }

        // ERROR MESSAGE IF EMAIL IS NOT FOUND
        if (!row) {
            return res.status(400).json({ error: "Wrong email or password." });
        }

        // CHECK INPUT PASSWORD AND DATABASE PASSWORD
        if (password === row.password) {
            res.json({ message: 'Login successful', userId: row.id });
        } else {
            res.status(400).json({ error: 'Wrong email or password.' });
        }
    });
});

// GET USER INFO
app.get('/user/:userId', (req, res) => {
    const userId = req.params.userId;

    db.get('SELECT first_name, last_name, email FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Database error: " + err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json(row);
    });
});

// UPDATE USER INFO
app.patch('/update-user', (req, res) => {
    const { userId, firstName, lastName, email, password } = req.body;

    let updates = [];
    let values = [];

    if (firstName) {
        updates.push("first_name = ?");
        values.push(firstName);
    }
    if (lastName) {
        updates.push("last_name = ?");
        values.push(lastName);
    }
    if (email) {
        updates.push("email = ?");
        values.push(email);
    }
    if (password) {
        updates.push("password = ?");
        values.push(password);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: "No fields provided for update" });
    }

    values.push(userId);
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?;`

    db.run(query, values, function (err) {
        if (err) {
            return res.status(500).json({ error: "Error updating user data: " + err.message });
        }
        res.json({ message: 'User updated successfully' });
    });
});

// DELETE ACCOUNT
app.delete('/delete-user', (req, res) => {
    const { userId } = req.body;

    db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
        if (err) {
            return res.status(500).json({ error: "Error deleting user: " + err.message });
        }
        res.json({ message: 'User deleted successfully' });
    });
});


////////////////////////////////////////////////////////////////

// CREATE A TABLE FOR JOURNAL ENTRIES
db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS journal (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            entry_date TEXT,
            meal_type TEXT,
            food_name TEXT,
            serving_size REAL,
            quantity INTEGER,
            calories REAL,
            carbohydrates_total_g REAL,
            protein_g REAL,
            fat_total_g REAL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);
});

// ADD JOURNAL ENTRIES
app.post('/journal', async (req, res) => {
    const { userId, entry_date, mealType, foodName, serving_size, quantity, calories, carbohydrates_total_g, protein_g, fat_total_g } = req.body;

    if (!userId || !entry_date || !mealType || !foodName) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    db.get(
        `SELECT * FROM journal WHERE user_id = ? AND entry_date = ? AND meal_type = ? AND food_name = ?`,
        [userId, entry_date, mealType, foodName],
        (err, row) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ error: err.message });
            }

            if (row) {
                // If food exists, update the quantity
                const updatedQuantity = row.quantity + 1;
                db.run(
                    `UPDATE journal SET quantity = ? WHERE id = ?`,
                    [updatedQuantity, row.id],
                    function (updateErr) {
                        if (updateErr) {
                            console.error('Error updating quantity:', updateErr.message);
                            return res.status(500).json({ error: updateErr.message });
                        }
                        res.json({ message: `Updated ${foodName} quantity to ${updatedQuantity}` });
                    }
                );
            } else {
                // If food does not exist, insert it
                db.run(
                    `INSERT INTO journal (user_id, entry_date, meal_type, food_name, serving_size, quantity, calories, carbohydrates_total_g, protein_g, fat_total_g)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userId, entry_date, mealType, foodName, serving_size, 1, calories, carbohydrates_total_g, protein_g, fat_total_g],
                    function (insertErr) {
                        if (insertErr) {
                            console.error('Error inserting new food item:', insertErr.message);
                            return res.status(500).json({ error: insertErr.message });
                        }
                        res.status(201).json({ message: `Added ${foodName} to journal` });
                    }
                );
            }
        }
    );
});

// FETCH JOURNAL ENTRIES
app.get('/journal', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing user ID" });

    db.all(
        `SELECT id, entry_date, meal_type, food_name, serving_size, quantity, calories, carbohydrates_total_g, protein_g, fat_total_g 
         FROM journal WHERE user_id = ? ORDER BY entry_date DESC`,
        [userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Organize results into a structured journal format
            const journalEntries = {};
            rows.forEach((row) => {
                if (!journalEntries[row.entry_date]) {
                    journalEntries[row.entry_date] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
                }
                journalEntries[row.entry_date][row.meal_type].push(row);
            });

            res.json({ journal: journalEntries });
        }
    );
});

// UPDATE JOURNAL ENTRIES
app.patch("/update-journal", async (req, res) => {
    const { userId, date, mealType, foodName, newQuantity } = req.body;

    try {
        // Retrieve the journal entry for the given date, mealType, and foodName
        const existingEntry = await db.get(
            "SELECT * FROM journal WHERE user_id = ? AND entry_date = ? AND meal_type = ? AND food_name = ?",
            [userId, date, mealType, foodName]
        );

        if (!existingEntry) {
            console.log("Journal entry not found:", { userId, date, mealType, foodName });
            return res.status(404).json({ message: "Journal entry not found" });
        }

        // If newQuantity is 0, remove the food entry from the journal
        if (newQuantity === 0) {
            // Remove the food entry
            await db.run(
                "DELETE FROM journal WHERE user_id = ? AND entry_date = ? AND meal_type = ? AND food_name = ?",
                [userId, date, mealType, foodName]
            );
            console.log("Food entry removed successfully!");
            return res.json({ message: "Food entry removed successfully" });
        }

        // Otherwise, update the quantity of the food entry
        await db.run(
            "UPDATE journal SET quantity = ? WHERE user_id = ? AND entry_date = ? AND meal_type = ? AND food_name = ?",
            [newQuantity, userId, date, mealType, foodName]
        );

        console.log("Quantity updated successfully!");
        res.json({ message: "Quantity updated successfully" });
    } catch (error) {
        console.error("Error updating journal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});