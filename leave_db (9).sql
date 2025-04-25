-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 22, 2025 at 09:30 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `leave_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `employee_leave_balances`
--

CREATE TABLE `employee_leave_balances` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `accrual_start_date` date DEFAULT '2025-01-01',
  `monthly_credit` decimal(5,2) DEFAULT 1.25,
  `credit_to_hours_ratio` decimal(5,2) DEFAULT 8.00,
  `total_credit` decimal(10,2) DEFAULT NULL,
  `used_credit` int(11) DEFAULT 0,
  `used_hours` decimal(7,2) DEFAULT 0.00,
  `remaining_credit` decimal(10,2) DEFAULT NULL,
  `period` date DEFAULT NULL,
  `recorded_by` int(11) DEFAULT NULL,
  `recorded_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `absences_with_pay` int(11) DEFAULT 0,
  `last_application_date` date DEFAULT NULL,
  `last_accrual_date` date DEFAULT NULL,
  `particulars` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_accrual_history`
--

CREATE TABLE `leave_accrual_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `accrual_date` datetime NOT NULL,
  `credit_amount` decimal(10,2) NOT NULL DEFAULT 1.25,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `recorded_by` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `is_manual` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_applications`
--

CREATE TABLE `leave_applications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `other_leave_type` varchar(255) DEFAULT NULL,
  `leave_details` text DEFAULT NULL,
  `number_of_days` int(11) NOT NULL,
  `location` enum('Within Philippines','Abroad') DEFAULT NULL,
  `abroad_details` varchar(255) DEFAULT NULL,
  `illness_details` varchar(255) DEFAULT NULL,
  `study_leave` enum('Masters Degree','BAR/Board Examination Review','Other') DEFAULT NULL,
  `monetization` enum('Monetization of Leave Credits','Terminal Leave') DEFAULT NULL,
  `commutation` tinyint(1) DEFAULT 0 COMMENT '0 = Not Requested, 1 = Requested',
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `rejection_message` text DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `leave_applications`
--
DELIMITER $$
CREATE TRIGGER `after_leave_approval` AFTER UPDATE ON `leave_applications` FOR EACH ROW BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE employee_leave_balances elb
    JOIN leave_application_types lat ON lat.leave_application_id = NEW.id
    SET elb.used_credit = elb.used_credit + 
        (SELECT COUNT(*) FROM leave_dates WHERE leave_application_id = NEW.id)
    WHERE elb.user_id = NEW.user_id 
    AND elb.leave_type_id = lat.leave_type_id;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `leave_application_types`
--

CREATE TABLE `leave_application_types` (
  `id` int(11) NOT NULL,
  `leave_application_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `leave_card_view`
-- (See below for the actual view)
--
CREATE TABLE `leave_card_view` (
`employee_id` int(11)
,`name` varchar(302)
,`assignment` varchar(255)
,`first_day_service` date
,`leave_application_id` int(11)
,`leave_type` varchar(255)
,`period` timestamp
,`particulars` text
,`earned` int(11)
,`status` enum('Pending','Approved','Rejected')
,`recorded_date` timestamp
,`total_earned` decimal(10,2)
,`abs_und_wp` int(11)
,`balance` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `leave_dates`
--

CREATE TABLE `leave_dates` (
  `id` int(11) NOT NULL,
  `leave_application_id` int(11) NOT NULL,
  `leave_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`id`, `name`) VALUES
(9, '10-Day VAWC Leave'),
(13, 'Adoption Leave'),
(2, 'Mandatory/Forced Leave'),
(4, 'Maternity Leave'),
(14, 'Others'),
(5, 'Paternity Leave'),
(10, 'Rehabilitation Privilege'),
(3, 'Sick Leave'),
(7, 'Solo Parent Leave'),
(12, 'Special Emergency (Calamity) Leave'),
(11, 'Special Leave Benefits for Women'),
(6, 'Special Privilege Leave'),
(8, 'Study Leave'),
(1, 'Vacation Leave');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `contact` varchar(15) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','employee') NOT NULL,
  `middleName` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `place_of_birth` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `special_order_no` varchar(255) DEFAULT NULL,
  `status_of_employment` varchar(255) DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `nature_of_appointment` varchar(255) DEFAULT NULL,
  `school_assignment` varchar(255) DEFAULT NULL,
  `employment_history` text DEFAULT NULL,
  `status` enum('active','offline') DEFAULT 'offline'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullName`, `lastName`, `contact`, `username`, `password`, `role`, `middleName`, `position`, `salary`, `place_of_birth`, `date_of_birth`, `permanent_address`, `special_order_no`, `status_of_employment`, `effective_date`, `nature_of_appointment`, `school_assignment`, `employment_history`, `status`) VALUES
(1, 'moreno', 'moreno', '123123', 'moreno', '$2b$10$Fva8QRB8iUURYGn3yfQzaexSoA3vg1uK0pJusjyN3jv/8ELeiQlCW', 'admin', 'A', 'ADMINISTRETOR', 0.00, 'zone 2', '2018-03-27', 'BOYHANG', 'KIJU#8', 'PERMANENT', '2025-03-27', 'ORIGINAL', 'USA', NULL, 'offline'),
(76, 'hesodgeees', 'EBORDA', '123123', 'hesodgee', '$2b$10$y3V36AUyJHg73R5W0ew1quOH5Q1QhfYDbcBmiMzT2zEEu9yRt3w3.', 'employee', 'A', 'ITO', 233321.00, 'HIPUSNGO BAYBAY LEYTE', '2016-07-12', 'HIPUSNGO', 'KS#50w2', 'PERMANENT', '2025-04-04', 'ORIGINAL', 'USA', '[{\"date_changed\":\"2025-04-07T05:26:08.935Z\",\"effective_date\":\"2025-04-05\",\"position\":\"Assistant Schools Division Superintendent\",\"salary\":\"233321.00\",\"status_of_employment\":\"PERMANENT\",\"special_order_no\":\"KS#50w2\",\"nature_of_appointment\":\"ORIGINAL\",\"school_assignment\":\"USA\"},{\"date_changed\":\"2025-04-07T05:27:51.466Z\",\"effective_date\":\"2025-04-04\",\"position\":\"TEACHER I\",\"salary\":\"233321.00\",\"status_of_employment\":\"PERMANENT\",\"special_order_no\":\"KS#50w2\",\"nature_of_appointment\":\"ORIGINAL\",\"school_assignment\":\"USA\"}]', 'offline'),
(78, 'john', 'DOE', '123123', 'johndoe', '$2b$10$ZiqXOWT64Qft2sHctIlyCOFCXfDvhIb4X/ta8gY.obOKPNT9igvs2', 'employee', 'D', 'TEACHER I', 12313132.00, 'SABSHARA MINDANO', '1998-12-28', 'MANDAMANDA', 'KS#50w2', 'PERMANENT', '2025-04-08', 'ORIGINAL', 'POMPONAN HIGH SCHOOL', NULL, 'offline'),
(79, 'angelo', 'tabinas', '7812738', 'angelo', '$2b$10$RB1LuLRRa2XBJKoRNy9y1.R4aJ4pNu1v8h//rGL6KAgjiE4p6xx2G', 'employee', 'B', 'TEACHER I', 234444.00, 'LEYTE', '1999-07-07', 'PUNONG BEACH', 'KS#50w2', 'PERMANENT', '2025-04-11', 'ORIGINAL', 'POMPONAN HIGH SCHOOL', NULL, 'offline'),
(80, 'friends', 'friends', '123131', 'friends', '$2b$10$RFDt98tPun89xUJP9ghh5O2.KS1F3ju637whAMXKGit/WkFsjKp7y', 'employee', 'f', 'Superintendent', 1231312.00, 'BAYBAY', '1998-06-09', 'KAN-ASI', 'KS#50w2', 'PERMANENT', '2025-04-22', 'ORIGINAL', 'DIVISION OFFICE', NULL, 'offline');

-- --------------------------------------------------------

--
-- Table structure for table `users_temp`
--

CREATE TABLE `users_temp` (
  `id` int(11) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `contact` varchar(15) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','employee') NOT NULL,
  `middleName` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `place_of_birth` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `special_order_no` varchar(255) DEFAULT NULL,
  `status_of_employment` varchar(255) DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `nature_of_appointment` varchar(255) DEFAULT NULL,
  `school_assignment` varchar(255) DEFAULT NULL,
  `employment_history` text DEFAULT NULL,
  `status` enum('active','offline') DEFAULT 'offline'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users_temp`
--

INSERT INTO `users_temp` (`id`, `fullName`, `lastName`, `contact`, `username`, `password`, `role`, `middleName`, `position`, `salary`, `place_of_birth`, `date_of_birth`, `permanent_address`, `special_order_no`, `status_of_employment`, `effective_date`, `nature_of_appointment`, `school_assignment`, `employment_history`, `status`) VALUES
(1, 'moreno', 'moreno', '123123', 'moreno', '$2b$10$Fva8QRB8iUURYGn3yfQzaexSoA3vg1uK0pJusjyN3jv/8ELeiQlCW', 'admin', 'A', 'ADMINISTRETOR', 0.00, 'zone 2', '2018-03-27', 'BOYHANG', 'KIJU#8', 'PERMANENT', '2025-03-27', 'ORIGINAL', 'USA', NULL, 'offline'),
(2, 'lorabell', 'lorabell', 'lorabell', 'lorabell', '$2b$10$vJI4TS.0Ufs6L57hHT0d7efVJ9OhzEslmwwQWrH7KGg8JI5DPAUNm', 'employee', 'lorabell', 'TEACHER I', 1333333.00, 'lorabell', '2025-04-06', 'ZONE 15', 'KS#50w2', 'PERMANENT', '2025-04-04', 'ORIGINAL', 'PADRE BURGOS', NULL, 'offline');

-- --------------------------------------------------------

--
-- Structure for view `leave_card_view`
--
DROP TABLE IF EXISTS `leave_card_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `leave_card_view`  AS SELECT `u`.`id` AS `employee_id`, concat(`u`.`fullName`,' ',`u`.`middleName`,' ',`u`.`lastName`) AS `name`, `u`.`school_assignment` AS `assignment`, `u`.`effective_date` AS `first_day_service`, `la`.`id` AS `leave_application_id`, `lt`.`name` AS `leave_type`, `la`.`created_at` AS `period`, `la`.`leave_details` AS `particulars`, `la`.`number_of_days` AS `earned`, `la`.`status` AS `status`, `la`.`created_at` AS `recorded_date`, `elb`.`total_credit` AS `total_earned`, `elb`.`used_credit` AS `abs_und_wp`, `elb`.`remaining_credit` AS `balance` FROM ((((`users` `u` left join `leave_applications` `la` on(`u`.`id` = `la`.`user_id`)) left join `leave_application_types` `lat` on(`la`.`id` = `lat`.`leave_application_id`)) left join `leave_types` `lt` on(`lat`.`leave_type_id` = `lt`.`id`)) left join `employee_leave_balances` `elb` on(`u`.`id` = `elb`.`user_id` and `lt`.`id` = `elb`.`leave_type_id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employee_leave_balances`
--
ALTER TABLE `employee_leave_balances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user` (`user_id`),
  ADD KEY `fk_leave_type` (`leave_type_id`),
  ADD KEY `fk_recorded_by` (`recorded_by`);

--
-- Indexes for table `leave_accrual_history`
--
ALTER TABLE `leave_accrual_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `leave_type_id` (`leave_type_id`);

--
-- Indexes for table `leave_applications`
--
ALTER TABLE `leave_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `leave_application_types`
--
ALTER TABLE `leave_application_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leave_application_id` (`leave_application_id`),
  ADD KEY `leave_type_id` (`leave_type_id`);

--
-- Indexes for table `leave_dates`
--
ALTER TABLE `leave_dates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leave_application_id` (`leave_application_id`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `users_temp`
--
ALTER TABLE `users_temp`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employee_leave_balances`
--
ALTER TABLE `employee_leave_balances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_accrual_history`
--
ALTER TABLE `leave_accrual_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_applications`
--
ALTER TABLE `leave_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=136;

--
-- AUTO_INCREMENT for table `leave_application_types`
--
ALTER TABLE `leave_application_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `leave_dates`
--
ALTER TABLE `leave_dates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `users_temp`
--
ALTER TABLE `users_temp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employee_leave_balances`
--
ALTER TABLE `employee_leave_balances`
  ADD CONSTRAINT `fk_leave_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`),
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `leave_accrual_history`
--
ALTER TABLE `leave_accrual_history`
  ADD CONSTRAINT `leave_accrual_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `leave_accrual_history_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`);

--
-- Constraints for table `leave_applications`
--
ALTER TABLE `leave_applications`
  ADD CONSTRAINT `leave_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_application_types`
--
ALTER TABLE `leave_application_types`
  ADD CONSTRAINT `leave_application_types_ibfk_1` FOREIGN KEY (`leave_application_id`) REFERENCES `leave_applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leave_application_types_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_dates`
--
ALTER TABLE `leave_dates`
  ADD CONSTRAINT `leave_dates_ibfk_1` FOREIGN KEY (`leave_application_id`) REFERENCES `leave_applications` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
