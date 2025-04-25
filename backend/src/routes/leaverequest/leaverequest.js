const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

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

router.post("/apply-leave", async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const {
            user_id,
            leave_types,
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
        if (!user_id || !Array.isArray(leave_types) || leave_types.length === 0 || 
            !Array.isArray(leave_dates) || leave_dates.length === 0) {
            connection.release();
            return res.status(400).json({ error: "Required fields are missing" });
        }

        // Calculate working days (excluding weekends)
        const workingDays = leave_dates.filter(dateStr => {
            const date = new Date(dateStr);
            const day = date.getDay();
            return day !== 0 && day !== 6; // Not Sunday or Saturday
        }).length;

        // Check leave balances but DON'T deduct yet
        const [balances] = await connection.query(
            `SELECT leave_type_id, remaining_credit 
             FROM employee_leave_balances 
             WHERE user_id = ? AND leave_type_id IN (?)`,
            [user_id, leave_types]
        );

        const balanceMap = {};
        balances.forEach(({ leave_type_id, remaining_credit }) => {
            balanceMap[leave_type_id] = remaining_credit;
        });

        // Validate balances
        for (const leaveTypeId of leave_types) {
            if (!balanceMap[leaveTypeId] || balanceMap[leaveTypeId] < workingDays) {
                connection.release();
                return res.status(400).json({
                    error: `Insufficient leave balance for leave type: ${leaveTypeId}`,
                    leaveTypeId,
                    available: balanceMap[leaveTypeId] || 0,
                    required: workingDays
                });
            }
        }

        // Insert leave application with Pending status
        const [result] = await connection.execute(
            `INSERT INTO leave_applications 
            (user_id, other_leave_type, leave_details, number_of_days, location, abroad_details, illness_details, study_leave, monetization, commutation, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                user_id, 
                other_leave_type || null, 
                leave_details || null, 
                workingDays, 
                location || null, 
                abroad_details || null, 
                illness_details || null, 
                study_leave, 
                monetization, 
                commutation, 
                status
            ]
        );

        const leave_application_id = result.insertId;

        // Insert leave types
        const leaveTypeValues = leave_types.map(lt => [leave_application_id, lt]);
        await connection.query(
            `INSERT INTO leave_application_types (leave_application_id, leave_type_id) VALUES ?`,
            [leaveTypeValues]
        );

        // Insert leave dates
        const leaveDateValues = leave_dates.map(date => [leave_application_id, date]);
        await connection.query(
            `INSERT INTO leave_dates (leave_application_id, leave_date) VALUES ?`,
            [leaveDateValues]
        );

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

router.post("/approve-leave/:id", async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;
        const { action } = req.body; // 'approve' or 'reject'

        // First get the leave application with its types
        const [applications] = await connection.query(
            `SELECT la.user_id, la.number_of_days, la.status, lat.leave_type_id
             FROM leave_applications la
             JOIN leave_application_types lat ON la.id = lat.leave_application_id
             WHERE la.id = ?`,
            [id]
        );

        if (applications.length === 0) {
            connection.release();
            return res.status(404).json({ error: "Leave application not found" });
        }

        const application = {
            user_id: applications[0].user_id,
            number_of_days: applications[0].number_of_days,
            status: applications[0].status,
            leave_types: applications.map(app => app.leave_type_id)
        };

        // Only process if currently pending
        if (application.status !== 'Pending') {
            connection.release();
            return res.status(400).json({ error: "Leave application already processed" });
        }

        if (action === 'approve') {
            // Deduct balances only when approved
            for (const leaveTypeId of application.leave_types) {
                await connection.query(
                    `UPDATE employee_leave_balances 
                     SET used_credit = used_credit + ?, 
                         remaining_credit = remaining_credit - ? 
                     WHERE user_id = ? AND leave_type_id = ?`,
                    [application.number_of_days, application.number_of_days, 
                     application.user_id, leaveTypeId]
                );
            }

            // Update status to Approved
            await connection.query(
                `UPDATE leave_applications SET status = 'Approved' WHERE id = ?`,
                [id]
            );
        } else if (action === 'reject') {
            // Just update status to Rejected (no balance changes)
            await connection.query(
                `UPDATE leave_applications SET status = 'Rejected' WHERE id = ?`,
                [id]
            );
        }

        await connection.commit();
        connection.release();

        res.json({ 
            message: `Leave application ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
        });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("Error processing leave application:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/leave-applications", async (req, res) => {
    try {
        console.log("Fetching all leave applications...");

        const query = `
            SELECT 
                la.id,
                la.user_id,
                la.location,
                la.abroad_details,
                la.illness_details,
                la.study_leave,
                la.monetization,
                la.commutation,
                la.status,
                la.created_at,
                la.rejection_message,
                u.school_assignment,
                GROUP_CONCAT(DISTINCT DATE_FORMAT(ld.leave_date, '%M %d, %Y')) AS leave_dates,
                GROUP_CONCAT(DISTINCT lt.name ORDER BY lt.name ASC) AS leave_types
            FROM leave_applications la
            LEFT JOIN leave_dates ld ON la.id = ld.leave_application_id
            LEFT JOIN leave_application_types lat ON la.id = lat.leave_application_id
            LEFT JOIN leave_types lt ON lat.leave_type_id = lt.id
            LEFT JOIN users u ON la.user_id = u.id
            GROUP BY la.id, u.school_assignment
            ORDER BY la.created_at DESC
        `;

        const [results] = await db.execute(query);

        console.log("Fetched leave applications:", results.length);

        results.forEach((application, index) => {
            console.log(`Leave Application #${index + 1}:`, {
                id: application.id,
                user_id: application.user_id,
                location: application.location,
                abroad_details: application.abroad_details,
                illness_details: application.illness_details,
                study_leave: application.study_leave,
                monetization: application.monetization,
                commutation: application.commutation,
                status: application.status,
                created_at: application.created_at,
                rejection_message: application.rejection_message,
                school_assignment: application.school_assignment,  
                leave_dates: application.leave_dates,
                leave_types: application.leave_types,
            });
        });

        res.json(results);
    } catch (error) {
        console.error("Error fetching leave applications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;