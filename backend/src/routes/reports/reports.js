const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const fs = require("fs");
const fastCsv = require("fast-csv");

const router = express.Router();
router.use(cors());
router.use(express.json());

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "leave_db",
    port: "3306",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Fetch all leave applications (for frontend table)
router.get("/leave-applications", async (req, res) => {
    try {
        const query = `
            SELECT la.id, 
                   u.name AS employee_name, 
                   u.email AS employee_email,
                   JSON_ARRAYAGG(DISTINCT lt.name) AS leave_types,
                   JSON_ARRAYAGG(DISTINCT DATE_FORMAT(lad.leave_date, '%M %d, %Y')) AS leave_dates,
                   la.number_of_days,
                   la.status,
                   DATE_FORMAT(la.created_at, '%M %d, %Y') AS applied_on
            FROM leave_applications la
            LEFT JOIN users u ON la.user_id = u.id
            LEFT JOIN leave_dates lad ON la.id = lad.leave_application_id
            LEFT JOIN leave_application_types lat ON la.id = lat.leave_application_id
            LEFT JOIN leave_types lt ON lat.leave_type_id = lt.id
            GROUP BY la.id
            ORDER BY la.created_at DESC
        `;
        const [results] = await db.execute(query);
        res.json(results);
    } catch (error) {
        console.error("Error fetching leave applications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Generate CSV Report
router.get("/leave-report", async (req, res) => {
    try {
        const query = `
            SELECT la.id, 
                   u.name AS employee_name, 
                   u.email AS employee_email,
                   GROUP_CONCAT(DISTINCT lt.name) AS leave_types,
                   GROUP_CONCAT(DISTINCT DATE_FORMAT(lad.leave_date, '%M %d, %Y')) AS leave_dates,
                   la.number_of_days,
                   la.status,
                   DATE_FORMAT(la.created_at, '%M %d, %Y') AS applied_on
            FROM leave_applications la
            LEFT JOIN users u ON la.user_id = u.id
            LEFT JOIN leave_dates lad ON la.id = lad.leave_application_id
            LEFT JOIN leave_application_types lat ON la.id = lat.leave_application_id
            LEFT JOIN leave_types lt ON lat.leave_type_id = lt.id
            GROUP BY la.id
            ORDER BY la.created_at DESC
        `;
        const [results] = await db.execute(query);

        const csvStream = fastCsv.format({ headers: true });
        const writableStream = fs.createWriteStream("leave_report.csv");

        csvStream.pipe(writableStream);
        results.forEach(row => csvStream.write(row));
        csvStream.end();

        writableStream.on("finish", () => {
            res.download("leave_report.csv", "leave_report.csv", (err) => {
                if (err) res.status(500).json({ error: "File download error" });
            });
        });

    } catch (error) {
        console.error("Error generating leave report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
