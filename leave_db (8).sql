-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 11, 2025 at 08:42 AM
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
  `recorded_by` int(11) NOT NULL,
  `recorded_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `absences_with_pay` int(11) DEFAULT 0,
  `last_application_date` date DEFAULT NULL,
  `last_accrual_date` date DEFAULT NULL,
  `particulars` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_leave_balances`
--

INSERT INTO `employee_leave_balances` (`id`, `user_id`, `leave_type_id`, `accrual_start_date`, `monthly_credit`, `credit_to_hours_ratio`, `total_credit`, `used_credit`, `used_hours`, `remaining_credit`, `period`, `recorded_by`, `recorded_date`, `absences_with_pay`, `last_application_date`, `last_accrual_date`, `particulars`) VALUES
(20, 78, 1, '2025-04-08', 1.25, 8.00, 2.50, 3, 0.00, 0.50, NULL, 0, '2025-04-08 02:59:39', 0, NULL, '2025-04-08', NULL),
(21, 78, 3, '2025-04-10', 1.25, 8.00, 22.50, 2, 0.00, 21.50, NULL, 0, '2025-04-10 08:22:17', 0, NULL, '2025-04-11', NULL),
(22, 76, 3, '2025-04-10', 1.25, 8.00, 12.00, 0, 0.00, 12.00, NULL, 0, '2025-04-10 08:36:30', 0, NULL, NULL, NULL),
(26, 79, 3, '2025-04-11', 0.00, 8.00, 1.25, 0, 0.00, 1.25, NULL, 79, '2025-04-11 06:36:23', 0, NULL, NULL, NULL);

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

--
-- Dumping data for table `leave_accrual_history`
--

INSERT INTO `leave_accrual_history` (`id`, `user_id`, `leave_type_id`, `accrual_date`, `credit_amount`, `recorded_at`, `recorded_by`, `notes`, `is_manual`) VALUES
(36, 78, 1, '2025-04-08 10:59:39', 1.25, '2025-04-08 02:59:39', 0, NULL, 0),
(37, 78, 1, '2025-04-08 10:59:54', 1.25, '2025-04-08 02:59:54', 0, NULL, 0),
(38, 78, 3, '2025-04-10 16:22:17', 4.00, '2025-04-10 08:22:17', 0, NULL, 0),
(39, 76, 3, '2025-04-10 16:36:30', 12.00, '2025-04-10 08:36:30', 0, NULL, 0),
(40, 78, 3, '2025-04-10 16:45:13', 2.00, '2025-04-10 08:45:13', 0, NULL, 0),
(41, 78, 3, '2025-04-11 08:42:48', 4.00, '2025-04-11 00:42:48', 0, NULL, 0),
(42, 78, 3, '2025-04-11 08:43:09', 1.25, '2025-04-11 00:43:09', 0, NULL, 0),
(43, 78, 3, '2025-04-11 08:43:26', 1.25, '2025-04-11 00:43:26', 0, NULL, 0),
(44, 78, 3, '2025-04-11 08:43:35', 1.25, '2025-04-11 00:43:35', 0, NULL, 0),
(45, 78, 3, '2025-04-11 08:43:59', 5.00, '2025-04-11 00:43:59', 0, NULL, 0),
(46, 78, 3, '2025-04-11 09:18:52', 1.25, '2025-04-11 01:18:52', 0, NULL, 0),
(47, 78, 3, '2025-04-11 09:57:58', 1.25, '2025-04-11 01:57:58', 0, NULL, 0),
(48, 78, 3, '2025-04-11 10:01:47', 1.25, '2025-04-11 02:01:47', 0, '#nothingimposiblesdsd', 0),
(49, 79, 3, '2025-04-11 14:36:23', 1.25, '2025-04-11 06:36:23', 0, NULL, 0);

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
-- Dumping data for table `leave_applications`
--

INSERT INTO `leave_applications` (`id`, `user_id`, `other_leave_type`, `leave_details`, `number_of_days`, `location`, `abroad_details`, `illness_details`, `study_leave`, `monetization`, `commutation`, `status`, `created_at`, `rejection_message`, `updated_at`) VALUES
(127, 78, NULL, '{\"location\":\"Abroad\",\"abroadDetails\":\"shabshara mindano\",\"illnessType\":null,\"illnessDetails\":null,\"studyLeave\":null}', 1, 'Abroad', 'shabshara mindano', NULL, NULL, NULL, 0, 'Rejected', '2025-04-08 03:01:41', 'LOW LEAVE BALANCE', NULL),
(128, 78, NULL, '{\"location\":\"Within the Philippines\",\"abroadDetails\":null,\"illnessType\":null,\"illnessDetails\":null,\"studyLeave\":null}', 1, '', NULL, NULL, NULL, NULL, 0, 'Approved', '2025-04-08 03:03:11', '', NULL),
(129, 78, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessType\":\"In Hospital\",\"illnessDetails\":\"home visit\",\"studyLeave\":null}', 1, NULL, NULL, 'home visit', NULL, NULL, 0, 'Approved', '2025-04-11 05:28:55', '', NULL);

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

--
-- Dumping data for table `leave_application_types`
--

INSERT INTO `leave_application_types` (`id`, `leave_application_id`, `leave_type_id`) VALUES
(9, 127, 1),
(10, 128, 1),
(11, 129, 3);

-- --------------------------------------------------------

--
-- Table structure for table `leave_dates`
--

CREATE TABLE `leave_dates` (
  `id` int(11) NOT NULL,
  `leave_application_id` int(11) NOT NULL,
  `leave_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_dates`
--

INSERT INTO `leave_dates` (`id`, `leave_application_id`, `leave_date`) VALUES
(9, 127, '2025-05-07'),
(10, 128, '2025-05-07'),
(11, 129, '2025-05-27');

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
(79, 'angelo', 'tabinas', '7812738', 'angelo', '$2b$10$RB1LuLRRa2XBJKoRNy9y1.R4aJ4pNu1v8h//rGL6KAgjiE4p6xx2G', 'employee', 'B', 'TEACHER I', 234444.00, 'LEYTE', '1999-07-07', 'PUNONG BEACH', 'KS#50w2', 'PERMANENT', '2025-04-11', 'ORIGINAL', 'POMPONAN HIGH SCHOOL', NULL, 'offline');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `leave_accrual_history`
--
ALTER TABLE `leave_accrual_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `leave_applications`
--
ALTER TABLE `leave_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `leave_application_types`
--
ALTER TABLE `leave_application_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `leave_dates`
--
ALTER TABLE `leave_dates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

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
  ADD CONSTRAINT `fk_recorded_by` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`),
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
