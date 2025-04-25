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
            await connection.rollback();
            connection.release();
            return res.status(400).json({ error: "Required fields are missing" });
        }

        // Calculate working days (1 date = 1 day)
        const workingDays = leave_dates.length;

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
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    error: `Insufficient leave balance for leave type: ${leaveTypeId}`,
                    leaveTypeId,
                    available: balanceMap[leaveTypeId] || 0,
                    required: workingDays
                });
            }
        }

        // Insert ONE leave application with Pending status
        const [result] = await connection.execute(
            `INSERT INTO leave_applications 
            (user_id, other_leave_type, leave_details, number_of_days, location, 
             abroad_details, illness_details, study_leave, monetization, 
             commutation, status, created_at) 
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

        // Insert leave types (one record per type)
        if (leave_types.length > 0) {
            await connection.query(
                `INSERT INTO leave_application_types (leave_application_id, leave_type_id) 
                 VALUES ?`,
                [leave_types.map(lt => [leave_application_id, lt])]
            );
        }

        // Insert leave dates (one record per date)
        if (leave_dates.length > 0) {
            await connection.query(
                `INSERT INTO leave_dates (leave_application_id, leave_date) 
                 VALUES ?`,
                [leave_dates.map(date => [leave_application_id, date])]
            );
        }

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
            // Check if leave types are valid (optional)
            if (application.leave_types.includes('Sick Leave') && application.leave_types.includes('Vacation Leave')) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ error: "Cannot apply both Sick Leave and Vacation Leave in the same application" });
            }
        
            // Deduct from the first leave type (or implement custom logic)
            const leaveTypeToDeduct = application.leave_types[0];
            
            await connection.query(
                `UPDATE employee_leave_balances 
                 SET used_credit = used_credit + ?, 
                     remaining_credit = remaining_credit - ? 
                 WHERE user_id = ? AND leave_type_id = ?`,
                [application.number_of_days, application.number_of_days, 
                 application.user_id, leaveTypeToDeduct]
            );
        
            // Update status to Approved
            await connection.query(
                `UPDATE leave_applications SET status = 'Approved' WHERE id = ?`,
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
        const query = `
            SELECT 
                la.id,
                la.user_id,
                u.fullName,
                u.lastName,
                u.middleName,
                u.position,
                u.salary,
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
                la.number_of_days,
                (
                    SELECT GROUP_CONCAT(DISTINCT DATE_FORMAT(ld.leave_date, '%M %d, %Y') ORDER BY ld.leave_date ASC SEPARATOR ', ')
                    FROM leave_dates ld 
                    WHERE ld.leave_application_id = la.id
                ) AS leave_dates,
                (
                    SELECT GROUP_CONCAT(DISTINCT lt.name ORDER BY lt.name ASC SEPARATOR ', ')
                    FROM leave_application_types lat
                    JOIN leave_types lt ON lat.leave_type_id = lt.id
                    WHERE lat.leave_application_id = la.id
                ) AS leave_types,
                -- Get Historical Vacation Leave balance
                (
                    SELECT JSON_OBJECT(
                        'total_credit', COALESCE(
                            (SELECT SUM(credit_amount)
                             FROM leave_accrual_history lah
                             WHERE lah.user_id = la.user_id 
                             AND lah.leave_type_id = 1
                             AND lah.recorded_at <= la.created_at), 0),
                        'used_credit', COALESCE(
                            (SELECT SUM(number_of_days)
                             FROM leave_applications la2
                             JOIN leave_application_types lat2 ON la2.id = lat2.leave_application_id
                             WHERE la2.user_id = la.user_id 
                             AND lat2.leave_type_id = 1
                             AND la2.status = 'Approved'
                             AND la2.created_at < la.created_at), 0),
                        'remaining_credit', COALESCE(
                            (SELECT SUM(credit_amount)
                             FROM leave_accrual_history lah
                             WHERE lah.user_id = la.user_id 
                             AND lah.leave_type_id = 1
                             AND lah.recorded_at <= la.created_at), 0) -
                            COALESCE(
                            (SELECT SUM(number_of_days)
                             FROM leave_applications la2
                             JOIN leave_application_types lat2 ON la2.id = lat2.leave_application_id
                             WHERE la2.user_id = la.user_id 
                             AND lat2.leave_type_id = 1
                             AND la2.status = 'Approved'
                             AND la2.created_at < la.created_at), 0)
                    )
                ) AS vacationLeave,
                -- Get Historical Sick Leave balance
                (
                    SELECT JSON_OBJECT(
                        'total_credit', COALESCE(
                            (SELECT SUM(credit_amount)
                             FROM leave_accrual_history lah
                             WHERE lah.user_id = la.user_id 
                             AND lah.leave_type_id = 3
                             AND lah.recorded_at <= la.created_at), 0),
                        'used_credit', COALESCE(
                            (SELECT SUM(number_of_days)
                             FROM leave_applications la2
                             JOIN leave_application_types lat2 ON la2.id = lat2.leave_application_id
                             WHERE la2.user_id = la.user_id 
                             AND lat2.leave_type_id = 3
                             AND la2.status = 'Approved'
                             AND la2.created_at < la.created_at), 0),
                        'remaining_credit', COALESCE(
                            (SELECT SUM(credit_amount)
                             FROM leave_accrual_history lah
                             WHERE lah.user_id = la.user_id 
                             AND lah.leave_type_id = 3
                             AND lah.recorded_at <= la.created_at), 0) -
                            COALESCE(
                            (SELECT SUM(number_of_days)
                             FROM leave_applications la2
                             JOIN leave_application_types lat2 ON la2.id = lat2.leave_application_id
                             WHERE la2.user_id = la.user_id 
                             AND lat2.leave_type_id = 3
                             AND la2.status = 'Approved'
                             AND la2.created_at < la.created_at), 0)
                    )
                ) AS sickLeave
            FROM leave_applications la
            JOIN users u ON la.user_id = u.id
            ORDER BY la.created_at DESC
        `;


        const [results] = await db.execute(query);
        
        // Parse JSON strings into objects
        const processedResults = results.map(result => ({
            ...result,
            vacationLeave: JSON.parse(result.vacationLeave || '{"total_credit":0,"used_credit":0,"remaining_credit":0}'),
            sickLeave: JSON.parse(result.sickLeave || '{"total_credit":0,"used_credit":0,"remaining_credit":0}'),
            leave_dates: result.leave_dates ? result.leave_dates.split(', ') : []
        }));

        res.json(processedResults);
    } catch (error) {
        console.error("Error fetching leave applications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;