const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const router = express.Router();
router.use(cors());
router.use(express.json());

// MySQL Connection Pool
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

router.post("/apply-leave", async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        console.log("Received apply-leave request:", req.body);

        const {
            user_id,
            leave_types,
            number_of_days,
            leave_dates,
            other_leave_type,
            leave_details,
            location,
            abroad_details,
            illness_details,
            study_leave = false,
            monetization = false,
            commutation = false,
            status = "Pending",
        } = req.body;

        // Validate required fields
        if (!user_id || !Array.isArray(leave_types) || leave_types.length === 0 || !Array.isArray(leave_dates) || leave_dates.length === 0) {
            connection.release();
            return res.status(400).json({ error: "user_id, at least one leave_type, and leave_date(s) are required" });
        }

        // Format and sort leave dates
        const formattedLeaveDates = leave_dates
            .map((date) => new Date(date).toISOString().split("T")[0])
            .sort((a, b) => new Date(a) - new Date(b));

        // Fetch user leave balances
        const [balances] = await connection.query(
            `SELECT leave_type_id, total_credit, used_credit, remaining_credit 
             FROM employee_leave_balances 
             WHERE user_id = ? AND leave_type_id IN (?)`,
            [user_id, leave_types]
        );

        // Convert balance results into a map
        const balanceMap = {};
        balances.forEach(({ leave_type_id, remaining_credit }) => {
            balanceMap[leave_type_id] = remaining_credit;
        });

        // Check if user has enough leave balance
        for (const leaveTypeId of leave_types) {
            if (!balanceMap[leaveTypeId] || balanceMap[leaveTypeId] < number_of_days) {
                connection.release();
                return res.status(400).json({
                    error: `Insufficient leave balance for leave_type_id: ${leaveTypeId}`,
                });
            }
        }

        // Deduct leave balance
        for (const leaveTypeId of leave_types) {
            await connection.query(
                `UPDATE employee_leave_balances 
                 SET used_credit = used_credit + ?, remaining_credit = remaining_credit - ? 
                 WHERE user_id = ? AND leave_type_id = ?`,
                [number_of_days, number_of_days, user_id, leaveTypeId]
            );
        }

        // Insert into leave_applications table
        const [result] = await connection.execute(
            `INSERT INTO leave_applications 
            (user_id, other_leave_type, leave_details, number_of_days, location, abroad_details, illness_details, study_leave, monetization, commutation, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [user_id, other_leave_type || null, leave_details || null, number_of_days, location || null, abroad_details || null, illness_details || null, study_leave, monetization, commutation, status]
        );

        const leave_application_id = result.insertId;

        // Insert into leave_application_types
        const leaveTypeQuery = `INSERT INTO leave_application_types (leave_application_id, leave_type_id) VALUES ?`;
        const leaveTypeValues = leave_types.map((leaveTypeId) => [leave_application_id, leaveTypeId]);
        await connection.query(leaveTypeQuery, [leaveTypeValues]);

        // Insert leave dates
        const leaveDateQuery = `INSERT INTO leave_dates (leave_application_id, leave_date) VALUES ?`;
        const leaveDateValues = formattedLeaveDates.map((date) => [leave_application_id, date]);
        await connection.query(leaveDateQuery, [leaveDateValues]);

        // Commit transaction
        await connection.commit();
        connection.release();

        res.status(201).json({
            message: "Leave application submitted successfully",
            leave_application_id,
        });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("Error submitting leave application:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Fetch all leave applications with multiple leave types and dates
router.get("/leave-applications", async (req, res) => {
    try {
        console.log("Fetching all leave applications...");
        const query = `
            SELECT la.*, 
                   JSON_ARRAYAGG(DISTINCT DATE_FORMAT(lad.leave_date, '%M %d, %Y')) AS leave_dates,
                   JSON_ARRAYAGG(DISTINCT lt.name) AS leave_types,
                   DATE_FORMAT(la.created_at, '%M %d, %Y') AS formatted_date
            FROM leave_applications la
            LEFT JOIN leave_dates lad ON la.id = lad.leave_application_id
            LEFT JOIN leave_application_types lat ON la.id = lat.leave_application_id
            LEFT JOIN leave_types lt ON lat.leave_type_id = lt.id
            GROUP BY la.id
            ORDER BY lad.leave_date ASC
        `;
        const [results] = await db.execute(query);

        console.log("Fetched leave applications:", results.length);
        res.json(results);
    } catch (error) {
        console.error("Error fetching leave applications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
