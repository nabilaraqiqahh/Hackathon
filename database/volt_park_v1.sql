-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 20, 2026 at 04:19 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `volt_park`
--

-- --------------------------------------------------------

--
-- Table structure for table `car_brands`
--

CREATE TABLE `car_brands` (
  `brand_id` int(11) NOT NULL,
  `brand_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car_brands`
--

INSERT INTO `car_brands` (`brand_id`, `brand_name`) VALUES
(3, 'BYD'),
(7, 'Chery'),
(6, 'GWM'),
(5, 'MG'),
(2, 'Perodua'),
(1, 'Proton'),
(4, 'Tesla');

-- --------------------------------------------------------

--
-- Table structure for table `car_models`
--

CREATE TABLE `car_models` (
  `model_id` int(11) NOT NULL,
  `brand_id` int(11) DEFAULT NULL,
  `model_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car_models`
--

INSERT INTO `car_models` (`model_id`, `brand_id`, `model_name`) VALUES
(1, 1, 'e.MAS 5'),
(2, 1, 'e.MAS 7'),
(3, 2, 'QV-E'),
(4, 2, 'EM-O'),
(5, 3, 'Atto 3'),
(6, 3, 'Dolphin'),
(7, 3, 'Seal'),
(8, 4, 'Model 3'),
(9, 4, 'Model Y'),
(10, 5, 'MG4 EV'),
(11, 5, 'MG S5'),
(12, 6, 'Ora Good Cat'),
(13, 6, 'Ora 07'),
(14, 7, 'Omoda E5');

-- --------------------------------------------------------

--
-- Table structure for table `feedbacks`
--

CREATE TABLE `feedbacks` (
  `feedback_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `feedback_type` enum('general','issue') NOT NULL DEFAULT 'general',
  `station_name` varchar(100) DEFAULT NULL,
  `message` text NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `transaction_id` varchar(20) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `energy` varchar(50) DEFAULT NULL,
  `receipt_no` varchar(50) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `status` enum('Success','Pending','Failed') DEFAULT 'Success'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `reservation_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `station_id` bigint(20) DEFAULT NULL,
  `port_id` int(11) DEFAULT NULL,
  `station_name` varchar(150) DEFAULT NULL,
  `reservation_date` date NOT NULL,
  `reservation_time` time NOT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `connector` varchar(100) DEFAULT NULL,
  `power` varchar(50) DEFAULT NULL,
  `status` enum('Confirmed','Active','Completed','Cancelled') DEFAULT 'Confirmed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stations`
--

CREATE TABLE `stations` (
  `station_id` bigint(20) NOT NULL,
  `station_name` varchar(150) NOT NULL,
  `address` text DEFAULT NULL,
  `operator_name` varchar(100) DEFAULT 'Unknown Operator',
  `charger_type` varchar(100) NOT NULL DEFAULT 'AC Standard(22kW+)',
  `district` varchar(100) NOT NULL DEFAULT 'Melaka Tengah',
  `total_bays` int(11) NOT NULL DEFAULT 1,
  `connectors` int(11) DEFAULT 1,
  `available_bays` int(11) NOT NULL DEFAULT 1,
  `status` enum('Available','Maintenance','Full','Unknown') DEFAULT 'Available',
  `price_per_kwh` decimal(10,2) DEFAULT 1.20,
  `idle_fee` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stations`
--

INSERT INTO `stations` (`station_id`, `station_name`, `address`, `operator_name`, `charger_type`, `district`, `total_bays`, `connectors`, `available_bays`, `status`, `price_per_kwh`, `idle_fee`) VALUES
(474393, 'Gentari | Petronas Ayer Keroh 3 (110kW DC)', '2854, Jalan Tun Abdul Razak', 'Unknown Operator', 'DC Fast', 'Melaka Tengah', 1, 1, 1, 'Available', 1.20, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `station_ports`
--

CREATE TABLE `station_ports` (
  `port_id` int(11) NOT NULL,
  `station_id` bigint(20) NOT NULL,
  `port_name` varchar(50) NOT NULL,
  `charger_type` varchar(100) NOT NULL,
  `price_per_kwh` decimal(10,2) DEFAULT 1.20,
  `status` enum('Available','Occupied','Maintenance') DEFAULT 'Available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usage_logs`
--

CREATE TABLE `usage_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `station_id` bigint(20) DEFAULT NULL,
  `session_date` date NOT NULL,
  `energy_consumed` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_no` varchar(15) DEFAULT NULL,
  `password` varchar(255) DEFAULT '123',
  `user_type` enum('Driver','Admin') DEFAULT 'Driver'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `phone_no`, `password`, `user_type`) VALUES
(1, 'Nabil Husni', 'nabil@melaka.gov.my', '0123456789', '123', 'Admin'),
(2, 'Ahmad Rafiq', 'rafiq@gmail.com', '0119876543', '123', 'Driver'),
(3, 'Siti Aminah', 'siti@outlook.com', '0172233445', '123', 'Driver');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicle_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plat_no` varchar(20) NOT NULL,
  `car_model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `user_id`, `plat_no`, `car_model`) VALUES
(1, 1, 'MCU 1234', 'BYD Seal'),
(2, 2, 'VFD 5678', 'Tesla Model 3'),
(3, 3, 'JQQ 9999', 'Ora Good Cat');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `car_brands`
--
ALTER TABLE `car_brands`
  ADD PRIMARY KEY (`brand_id`),
  ADD UNIQUE KEY `brand_name` (`brand_name`);

--
-- Indexes for table `car_models`
--
ALTER TABLE `car_models`
  ADD PRIMARY KEY (`model_id`),
  ADD KEY `brand_id` (`brand_id`);

--
-- Indexes for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`reservation_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `station_id` (`station_id`),
  ADD KEY `reservations_ibfk_3` (`port_id`);

--
-- Indexes for table `stations`
--
ALTER TABLE `stations`
  ADD PRIMARY KEY (`station_id`);

--
-- Indexes for table `station_ports`
--
ALTER TABLE `station_ports`
  ADD PRIMARY KEY (`port_id`),
  ADD KEY `station_id` (`station_id`);

--
-- Indexes for table `usage_logs`
--
ALTER TABLE `usage_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `station_id` (`station_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicle_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `car_brands`
--
ALTER TABLE `car_brands`
  MODIFY `brand_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `car_models`
--
ALTER TABLE `car_models`
  MODIFY `model_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `feedbacks`
--
ALTER TABLE `feedbacks`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station_ports`
--
ALTER TABLE `station_ports`
  MODIFY `port_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usage_logs`
--
ALTER TABLE `usage_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `car_models`
--
ALTER TABLE `car_models`
  ADD CONSTRAINT `car_models_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `car_brands` (`brand_id`) ON DELETE CASCADE;

--
-- Constraints for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD CONSTRAINT `feedbacks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_3` FOREIGN KEY (`port_id`) REFERENCES `station_ports` (`port_id`) ON DELETE SET NULL;

--
-- Constraints for table `station_ports`
--
ALTER TABLE `station_ports`
  ADD CONSTRAINT `station_ports_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`station_id`) ON DELETE CASCADE;

--
-- Constraints for table `usage_logs`
--
ALTER TABLE `usage_logs`
  ADD CONSTRAINT `usage_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `usage_logs_ibfk_2` FOREIGN KEY (`station_id`) REFERENCES `stations` (`station_id`);

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
