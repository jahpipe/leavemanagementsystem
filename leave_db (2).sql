-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 26, 2025 at 06:50 AM
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
  `total_credit` int(11) NOT NULL,
  `used_credit` int(11) DEFAULT 0,
  `remaining_credit` int(11) GENERATED ALWAYS AS (`total_credit` - `used_credit`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_leave_balances`
--

INSERT INTO `employee_leave_balances` (`id`, `user_id`, `leave_type_id`, `total_credit`, `used_credit`) VALUES
(33, 63, 3, 6, 4),
(34, 64, 3, 25, 8),
(35, 64, 8, 23, 2),
(36, 65, 3, 2, 2),
(37, 66, 1, 23, 4);

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
  `rejection_message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_applications`
--

INSERT INTO `leave_applications` (`id`, `user_id`, `other_leave_type`, `leave_details`, `number_of_days`, `location`, `abroad_details`, `illness_details`, `study_leave`, `monetization`, `commutation`, `status`, `created_at`, `rejection_message`) VALUES
(75, 63, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":\"In Hospital\",\"studyLeave\":null}', 2, NULL, NULL, 'In Hospital', NULL, NULL, 1, 'Rejected', '2025-03-21 03:45:53', 'there are to many absents'),
(76, 64, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":\"In Hospital\",\"studyLeave\":\"Completion of Master\'s Degree\"}', 1, NULL, NULL, 'In Hospital', '', NULL, 1, '', '2025-03-24 01:42:11', NULL),
(77, 64, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":\"In Hospital\",\"studyLeave\":null}', 1, NULL, NULL, 'In Hospital', NULL, NULL, 1, '', '2025-03-24 02:07:25', NULL),
(78, 64, NULL, '{\"location\":\"Within the Philippines\",\"abroadDetails\":null,\"illnessDetails\":\"In Hospital\",\"studyLeave\":null}', 1, '', NULL, 'In Hospital', NULL, NULL, 1, '', '2025-03-24 02:08:38', NULL),
(81, 64, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":\"In Hospital\",\"studyLeave\":null}', 1, NULL, NULL, 'In Hospital', NULL, NULL, 1, 'Approved', '2025-03-24 02:25:18', ''),
(83, 65, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":\"In Hospital\",\"studyLeave\":null}', 2, NULL, NULL, 'In Hospital', NULL, NULL, 1, 'Rejected', '2025-03-24 07:35:56', 'daghan kag late'),
(84, 64, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":\"In Hospital\",\"studyLeave\":null}', 1, NULL, NULL, 'In Hospital', NULL, NULL, 1, 'Rejected', '2025-03-24 07:38:17', 'no'),
(85, 63, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":\"In Hospital\",\"studyLeave\":null}', 2, NULL, NULL, 'In Hospital', NULL, NULL, 1, 'Approved', '2025-03-24 07:38:47', ''),
(86, 66, NULL, '{\"location\":\"Within the Philippines\",\"abroadDetails\":null,\"illnessDetails\":null,\"studyLeave\":null}', 3, '', NULL, NULL, NULL, NULL, 1, 'Approved', '2025-03-25 05:35:20', ''),
(87, 66, NULL, '{\"location\":\"Within the Philippines\",\"abroadDetails\":\"shabshara mindano\",\"illnessDetails\":null,\"studyLeave\":null}', 1, '', 'shabshara mindano', NULL, '', '', 1, 'Approved', '2025-03-25 06:38:40', ''),
(88, 66, NULL, '{\"location\":\"Abroad\",\"abroadDetails\":\"newyork\",\"illnessDetails\":null,\"studyLeave\":null}', 1, 'Abroad', 'newyork', NULL, NULL, NULL, 0, 'Approved', '2025-03-25 07:17:51', '');

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
(79, 75, 3),
(80, 76, 3),
(81, 76, 8),
(82, 77, 3),
(83, 78, 3),
(87, 81, 3),
(89, 83, 3),
(90, 84, 3),
(91, 85, 3),
(92, 86, 1),
(93, 87, 1),
(94, 88, 1);

-- --------------------------------------------------------

--
-- Table structure for table `leave_balances`
--

CREATE TABLE `leave_balances` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `leave_type` enum('Vacation Leave','Mandatory/Forced Leave','Sick Leave','Maternity Leave','Paternity Leave','Special Privilege Leave','Solo Parent Leave','Study Leave','10-Day VAWC Leave','Rehabilitation Privilege','Special Leave Benefits for Women','Special Emergency (Calamity) Leave','Adoption Leave') NOT NULL,
  `balance` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(107, 75, '2025-05-07'),
(108, 75, '2025-05-09'),
(109, 76, '2025-05-07'),
(110, 76, '2025-05-09'),
(111, 77, '2025-05-07'),
(112, 77, '2025-05-09'),
(113, 78, '2025-05-07'),
(117, 81, '2025-05-07'),
(118, 81, '2025-05-09'),
(120, 83, '2025-05-07'),
(121, 83, '2025-05-09'),
(122, 84, '2025-05-07'),
(123, 84, '2025-05-09'),
(124, 85, '2025-05-07'),
(125, 85, '2025-05-09'),
(126, 86, '2025-05-07'),
(127, 86, '2025-05-09'),
(128, 86, '2025-05-19'),
(129, 87, '2025-05-07'),
(130, 88, '2025-05-07');

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
  `school_assignment` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullName`, `lastName`, `contact`, `username`, `password`, `role`, `middleName`, `position`, `salary`, `place_of_birth`, `date_of_birth`, `permanent_address`, `special_order_no`, `status_of_employment`, `effective_date`, `nature_of_appointment`, `school_assignment`) VALUES
(19, 'moreno', 'moreno', '123123', 'moreno', '$2b$10$Fva8QRB8iUURYGn3yfQzaexSoA3vg1uK0pJusjyN3jv/8ELeiQlCW', 'admin', 'A', 'ADMINISTRETOR', 99999999.99, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(63, 'lorabell', 'tabinas', '13131', 'lorabell', '$2b$10$89BaLtwGmFCWG/BiMsKIee0b1J0r9Se1CPRwxwuq74LDDmz/LLkRq', 'employee', 'alcos', 'OFFICER', 25000.00, 'BAYBAY LEYTE CITY', '2025-03-21', 'BOYHANG', 'KS#22', 'PERMANENT', '2025-03-21', 'ORIGINAL', 'POMPONAN HIGH SCHOOL'),
(64, 'cleaire', 'Moreno', '13132', 'cleaire', '$2b$10$ThqDLFBOrlskROVNS1PhVeciT0.iZJCO26B1fERgf53m2qf8KIxBK', 'employee', 'S', 'Teacher', 24000.00, 'BAYBAY LEYTE CITY', '2006-08-24', 'ZONE 15', 'KS#42', 'PERMANENT', '2025-03-24', 'ORIGINAL', 'BALINTAWAK ELEM SCHOOL'),
(65, 'karap', 'karap', 'karap', 'karapkarap', '$2b$10$95Kd.GfU.70H190bLj3CHOwHqmGvQ1I6YcAvuPhym02RvM.zO4/qG', 'employee', 'karap', 'karap', 2312313.00, 'karap', '2025-01-29', 'karap', 'karap', 'karap', '2025-03-24', 'karap', 'karap'),
(66, 'butanding', 'butanding', 'butanding', 'butanding', '$2b$10$11TeFWa53Z5wDkVpeQisHuX7p.KiXBmx46xJZbJ.2tQe3HJhaXxpC', 'employee', 'butanding', 'butanding', 1333333.00, 'butanding', '2025-03-25', 'butanding', 'butanding', 'butanding', '2025-03-27', 'butanding', 'butanding'),
(67, 'Angelo', 'Tabinas', '0923123123', 'ANGELO', '$2b$10$s5hjF8EbHmVukN7iLqNHbeT9UqMJDX1OleKHUAvIcMABW7omPrO3K', 'employee', 'P', 'Assistant Schools Division Superintendent', 45000.00, 'BAYBAY LEYTE CITY', '1994-07-26', 'BUNGA BAYBAY', 'KSS#552', 'PERMANENT', '2025-03-26', 'ORIGINAL', 'SURSOGON ELEMENTARY SCHOOL');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employee_leave_balances`
--
ALTER TABLE `employee_leave_balances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user` (`user_id`),
  ADD KEY `fk_leave_type` (`leave_type_id`);

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
-- Indexes for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employee_leave_balances`
--
ALTER TABLE `employee_leave_balances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `leave_applications`
--
ALTER TABLE `leave_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `leave_application_types`
--
ALTER TABLE `leave_application_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `leave_balances`
--
ALTER TABLE `leave_balances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_dates`
--
ALTER TABLE `leave_dates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

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
-- Constraints for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD CONSTRAINT `leave_balances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_dates`
--
ALTER TABLE `leave_dates`
  ADD CONSTRAINT `leave_dates_ibfk_1` FOREIGN KEY (`leave_application_id`) REFERENCES `leave_applications` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
