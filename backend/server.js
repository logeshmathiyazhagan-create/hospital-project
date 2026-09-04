const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
port: 3306,
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0
});

// ===============================
// Test Database Connection
// ===============================
async function testDatabase() {
try {
const connection = await db.getConnection();

    console.log("RDS MySQL connected successfully");

    connection.release();
} catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);
}

}

testDatabase();

// ===============================
// Health Check API
// ===============================
app.get("/api/health", async (req, res) => {
try {
await db.query("SELECT 1");

    res.json({
        status: "online",
        message: "Hospital backend is working",
        database: "connected"
    });
} catch (error) {
    console.error("Health check error:", error.message);

    res.status(500).json({
        status: "error",
        message: "Database connection failed"
    });
}

});

// ===============================
// Book Appointment
// ===============================
app.post("/api/appointments", async (req, res) => {
try {
const {
patientName,
doctorName,
department,
appointmentDate,
appointmentTime
} = req.body;

    // Check required fields
    if (
        !patientName ||
        !doctorName ||
        !department ||
        !appointmentDate ||
        !appointmentTime
    ) {
        return res.status(400).json({
            success: false,
            message: "All appointment fields are required"
        });
    }

    // Insert appointment into MySQL
    const sql =
        "INSERT INTO appointments (patient_name, doctor_name, department, appointment_date, appointment_time) VALUES (?, ?, ?, ?, ?)";

    const values = [
        patientName,
        doctorName,
        department,
        appointmentDate,
        appointmentTime
    ];

    const [result] = await db.execute(sql, values);

    console.log("Appointment stored successfully");
    console.log("Appointment ID:", result.insertId);

    res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        appointmentId: result.insertId
    });

} catch (error) {
    console.error("Appointment booking error:");
    console.error(error.message);

    res.status(500).json({
        success: false,
        message: "Failed to store appointment",
        error: error.message
    });
}

});

// ===============================
// Get All Appointments
// ===============================
app.get("/api/appointments", async (req, res) => {
try {
const [rows] = await db.execute(
"SELECT * FROM appointments ORDER BY id DESC"
);

    res.json({
        success: true,
        appointments: rows
    });

} catch (error) {
    console.error("Fetch appointments error:");
    console.error(error.message);

    res.status(500).json({
        success: false,
        message: "Failed to fetch appointments"
    });
}

});

// ===============================
// Start Server
// ===============================
app.listen(PORT, "0.0.0.0", () => {
console.log("Hospital backend running on port " + PORT);
});