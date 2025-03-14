-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 14, 2025 at 04:22 AM
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
(13, 43, 8, 3, 0),
(14, 47, 3, 3, 2),
(15, 47, 8, 3, 0),
(16, 36, 8, 12, 0),
(17, 36, 2, 123, 0),
(18, 35, 2, 123, 0),
(19, 39, 13, 12, 0),
(20, 48, 14, 23, 2),
(21, 54, 8, 2, 2);

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
  `commutation` enum('Requested','Not Requested') NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_applications`
--

INSERT INTO `leave_applications` (`id`, `user_id`, `other_leave_type`, `leave_details`, `number_of_days`, `location`, `abroad_details`, `illness_details`, `study_leave`, `monetization`, `commutation`, `status`, `created_at`) VALUES
(56, 43, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":\"In Hospital\",\"studyLeave\":null}', 2, NULL, NULL, 'In Hospital', NULL, NULL, 'Requested', 'Rejected', '2025-03-11 05:28:10'),
(57, 43, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":\"In Hospital\",\"studyLeave\":null}', 1, NULL, NULL, 'In Hospital', NULL, NULL, 'Requested', 'Approved', '2025-03-11 05:29:17'),
(58, 47, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":\"In Hospital\",\"studyLeave\":null}', 2, NULL, NULL, 'In Hospital', NULL, NULL, 'Requested', 'Approved', '2025-03-11 06:02:41'),
(59, 48, 'magtagai, manglaag', '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":null,\"studyLeave\":null}', 2, NULL, NULL, NULL, NULL, NULL, 'Requested', 'Approved', '2025-03-13 03:02:08'),
(60, 54, NULL, '{\"location\":null,\"abroadDetails\":null,\"illnessDetails\":null,\"studyLeave\":\"Completion of Master\'s Degree\"}', 2, NULL, NULL, NULL, '', NULL, 'Requested', 'Approved', '2025-03-13 08:34:06');

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
(59, 56, 3),
(60, 57, 3),
(61, 58, 3),
(62, 59, 14),
(63, 60, 8);

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
(75, 56, '2025-05-07'),
(76, 56, '2025-05-09'),
(77, 57, '2025-05-27'),
(78, 58, '2025-05-07'),
(79, 58, '2025-05-09'),
(80, 59, '2025-05-07'),
(81, 59, '2025-05-09'),
(82, 60, '2025-05-07'),
(83, 60, '2025-05-09');

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
  `salary` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullName`, `lastName`, `contact`, `username`, `password`, `role`, `middleName`, `position`, `salary`) VALUES
(19, 'moreno', 'moreno', '123123', 'moreno', '$2b$10$s62pg4G.G2J218Q4uSxn2eq1Z34CsJdhgvMrMp.URyXWHkDkwJNVu', 'admin', 'A', NULL, NULL),
(35, 'lorabell', 'alcos', '123-123', 'lorabell', '$2b$10$1KEpTM/5I87xnVXatj1XVupmR8WoXdw8ZkjsG03U/lnTlREQk1B6.', 'employee', 'rasta', 'Assistant Schools Division Superintendent', 50000.00),
(36, 'claire', 'servande', '123123', 'servande', '$2b$10$QTshaH8vkFy66X/ov1xat.M38t3ghXLKtSyU42WVKQOgiOvdu.jtC', 'employee', 'rasta', 'Assistant Schools Division Superintendent', 240000.00),
(37, 'christine', 'christine', '1273', 'christine', '$2b$10$f/lEMNp.lb0iW1G01SUmme3GC6CSeXZHNDPF6YQhmwWJWeatOXkKi', 'employee', 'S', 'information technologoy support', 240000.00),
(38, 'babalik', 'babalik', '123', 'babalik', '$2b$10$OI8GCCrKL2zAlIsKjN/93Outy9ZUKJUAl4WDqK.WRrWz3L4I3ZPLu', 'employee', 'F', 'junior officer', 2400.00),
(39, 'sangkoko', 'picolo', '123213', 'sangkoko', '$2b$10$s6xrjhIqXO71qF1.T7g0/.YKxzC5Au2DhB51m9ajHkxPm6v5qlXnq', 'employee', 'G', 'junior officer', 50000.00),
(40, 'rene', 'rene', '123123', 'renerene', '$2b$10$my6CRupEtyDh41U0VMaXb.3AKKHGie0tosNkP0EOYOoNBNNCt8UGq', 'employee', 'S', 'Superintendent', 100000.00),
(41, 'cathlyen', 'joy', '123123', 'cathlyen', '$2b$10$QSvxIoh4EGwjcjLphmNYiu/oXKzwloBEhhFSR.qaFEU7biU1lej/a', 'employee', NULL, NULL, NULL),
(43, 'bingoy', 'bingoy', '123123', 'bingoy', '$2b$10$kJYvPH78Td8BBv/4qRXEqOtCt5Dzb.5Q0lFB8rE2Xi/7SR8e9V7PC', 'employee', 'S', 'Superintendent', 2333333.00),
(47, 'angelo', 'tabinas', '123123', 'tabinas', '$2b$10$Z1wuEqYIG1zMXWI6FKSgeOlCOG2xaSZtf5naD2yevWgd1CwrGH28i', 'employee', NULL, NULL, NULL),
(48, 'choyaks', 'choyaks', '123132', 'choyaks', '$2b$10$lhHzA15cE2H9GatoQYsXKuWlEnvxDIjwUxCY6TLnTrJL/laRft68O', 'employee', NULL, NULL, NULL),
(53, 'browner', 'Bagol', '123124', 'browner', '$2b$10$6WzkC8DGnRUmWHI1h0LfoOV8WIJG/FnPyMnU5yhTPVryPCqMw6cDi', 'employee', 'M', 'Assistant Schools Division Superintendent', 240000.00),
(54, 'jessica', 'latoreno', '123812', 'jessica', '$2b$10$0OmNvYNgRXWMhqSjH4DvvOq.usBmJaQKbc/4hq51lEfqMylnjZ.d6', 'employee', 'M', 'Assistant Schools Division Superintendent', 230000.00);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `leave_applications`
--
ALTER TABLE `leave_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `leave_application_types`
--
ALTER TABLE `leave_application_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `leave_balances`
--
ALTER TABLE `leave_balances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_dates`
--
ALTER TABLE `leave_dates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

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
