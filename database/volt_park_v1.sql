-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 20, 2026 at 10:39 PM
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
(1, 'Proton'),
(2, 'Tesla');

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
(1, 1, 'e.MAS 7'),
(2, 2, 'Model 3'),
(3, 3, 'Seal');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `transaction_id` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `energy` varchar(50) DEFAULT NULL,
  `receipt_no` varchar(50) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `status` enum('Success','Pending','Failed') DEFAULT 'Success'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `transaction_id`, `user_id`, `amount`, `payment_method`, `energy`, `receipt_no`, `payment_date`, `status`) VALUES
(1, 'PAY-06231346-69', 2, 10.00, 'Visa •••• 4242', NULL, 'RCP-6130', '2026-04-20', 'Success'),
(2, 'PAY-12883819-99', 2, 0.00, 'Visa •••• 4242', '12.8 kWh', 'RCP-5234', '2026-04-20', 'Success'),
(3, 'PAY-14991535-78', 2, 0.00, 'Visa •••• 4242', '2.0 kWh', 'RCP-7584', '2026-04-20', 'Success'),
(4, 'PAY-15410245-55', 2, 0.00, 'Visa •••• 4242', '6.0 kWh', 'RCP-8847', '2026-04-20', 'Success'),
(5, 'PAY-15418493-9', 2, 0.00, 'Visa •••• 4242', '6.0 kWh', 'RCP-9590', '2026-04-20', 'Success'),
(6, 'PAY-15743131-61', 2, 0.00, 'Visa •••• 4242', '38.0 kWh', 'RCP-5723', '2026-04-20', 'Success'),
(7, 'PAY-16521408-68', 2, 0.00, 'Visa •••• 4242', '38.0 kWh', 'RCP-6373', '2026-04-20', 'Success');

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
  `status` enum('Confirmed','Active','Completed','Cancelled') DEFAULT 'Confirmed',
  `target_amount` decimal(10,2) DEFAULT 0.00,
  `actual_cost` decimal(10,2) DEFAULT 0.00,
  `actual_duration` varchar(50) DEFAULT NULL,
  `actual_energy` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`reservation_id`, `user_id`, `station_id`, `port_id`, `station_name`, `reservation_date`, `reservation_time`, `duration`, `connector`, `power`, `status`, `target_amount`, `actual_cost`, `actual_duration`, `actual_energy`) VALUES
(1, 2, 474393, NULL, 'Gentari | Petronas Ayer Keroh 3 (110kW DC)', '2026-04-20', '01:30:00', NULL, 'DC Fast', '110kW', 'Completed', 0.00, 0.00, NULL, NULL),
(2, 2, 474273, 1, 'Charge+ | Amverton Heritage Resort (120kW DC & 7kW AC)', '2026-04-20', '03:54:00', NULL, 'Port 1 (DC Fast)', '120kW', 'Completed', 0.00, 0.00, NULL, NULL),
(3, 2, 474273, 2, 'Charge+ | Amverton Heritage Resort (120kW DC & 7kW AC)', '2026-04-20', '03:55:00', NULL, 'Port 2 (AC Standard)', '120kW', 'Completed', 0.00, 0.00, NULL, NULL),
(4, 2, 474273, 1, 'Charge+ | Amverton Heritage Resort (120kW DC & 7kW AC)', '2026-04-20', '03:56:00', NULL, 'Port 1 (DC Fast)', '120kW', 'Completed', 0.00, 0.00, NULL, NULL),
(5, 2, 459494, 3, 'MYDIN MITC AYER KEROH (Shopping Mall)', '2026-04-20', '04:08:00', NULL, 'Port 1 (DC Fast)', '120kW', 'Completed', 0.00, 0.00, NULL, NULL),
(6, 2, 474274, 5, 'SQ Spirit', '2026-04-20', '04:21:00', NULL, 'Port 1 (DC Fast)', '120kW', 'Completed', 0.00, 0.00, NULL, NULL),
(7, 2, 459494, 4, 'MYDIN MITC AYER KEROH (Shopping Mall)', '2026-04-20', '04:29:00', NULL, 'Port 2 (AC Standard)', '11kW', 'Confirmed', 0.00, 0.00, NULL, NULL),
(8, 2, 193503, 7, 'Tahap Puncak Sdn Bhd', '2026-04-20', '04:29:00', NULL, 'Port 1 (DC Fast)', '120kW', 'Confirmed', 0.00, 0.00, NULL, NULL),
(9, 2, 474275, 10, 'AEON Melaka Shopping Centre', '2026-04-20', '04:29:00', NULL, 'Port 1 (DC Fast)', '120kW', 'Confirmed', 0.00, 0.00, NULL, NULL),
(10, 2, 474278, NULL, 'Pos Malaysia', '2026-04-20', '04:30:00', NULL, 'AC Standard', '11kW', 'Confirmed', 0.00, 0.00, NULL, NULL),
(11, 2, 474277, NULL, 'Proton eMAS Melaka NHL Auto Tech', '2026-04-20', '04:30:00', NULL, 'AC Standard', '11kW', 'Confirmed', 0.00, 0.00, NULL, NULL);

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
(193503, 'Tahap Puncak Sdn Bhd', '19, Jalan PPBK, Pusat Perniagaan Bukit Katil, ', 'Unknown Operator', 'AC Standard', 'Melaka Tengah', 3, 3, 3, 'Available', 1.20, 0.00),
(459494, 'MYDIN MITC AYER KEROH (Shopping Mall)', 'Mydin MITC', 'Unknown Operator', 'AC Standard', 'Melaka Tengah', 2, 2, 2, 'Available', 1.20, 0.00),
(474273, 'Charge+ | Amverton Heritage Resort (120kW DC & 7kW AC)', 'Amverton Heritage Resort', 'Unknown Operator', 'DC Fast', 'Melaka Tengah', 2, 2, 2, 'Available', 1.20, 0.00),
(474274, 'SQ Spirit', 'Jalan Eco 1', 'Unknown Operator', 'DC Fast', 'Melaka Tengah', 2, 2, 2, 'Available', 1.20, 0.00),
(474275, 'AEON Melaka Shopping Centre', 'Jalan Tun Abdul Razak', 'Unknown Operator', 'DC Fast', 'Melaka Tengah', 2, 2, 2, 'Available', 1.20, 0.00),
(474277, 'Proton eMAS Melaka NHL Auto Tech', 'Jalan IKS MJ 1', 'Unknown Operator', 'AC Standard', 'Melaka Tengah', 1, 1, 1, 'Available', 1.20, 0.00),
(474278, 'Pos Malaysia', 'Pejabat Pos Besar Melaka', 'Unknown Operator', 'AC Standard', 'Melaka Tengah', 1, 1, 1, 'Available', 1.20, 0.00),
(474393, 'Gentari | Petronas Ayer Keroh 3 (110kW DC)', NULL, 'Unknown Operator', 'AC Standard(22kW+)', 'Melaka Tengah', 1, 1, 1, 'Available', 1.20, 0.00);

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

--
-- Dumping data for table `station_ports`
--

INSERT INTO `station_ports` (`port_id`, `station_id`, `port_name`, `charger_type`, `price_per_kwh`, `status`) VALUES
(1, 474273, 'Port 1', 'DC Fast', 1.20, 'Available'),
(2, 474273, 'Port 2', 'AC Standard', 0.90, 'Available'),
(3, 459494, 'Port 1', 'DC Fast', 1.20, 'Available'),
(4, 459494, 'Port 2', 'AC Standard', 0.90, 'Available'),
(5, 474274, 'Port 1', 'DC Fast', 1.20, 'Available'),
(6, 474274, 'Port 2', 'AC Standard', 0.90, 'Available'),
(7, 193503, 'Port 1', 'DC Fast', 1.20, 'Available'),
(8, 193503, 'Port 2', 'AC Standard', 0.90, 'Available'),
(9, 193503, 'Port 3', 'DC Fast', 1.20, 'Available'),
(10, 474275, 'Port 1', 'DC Fast', 1.20, 'Available'),
(11, 474275, 'Port 2', 'AC Standard', 0.90, 'Available'),
(12, 474278, 'Port 1', 'AC Standard', 0.90, 'Available'),
(13, 474277, 'Port 1', 'AC Standard', 0.90, 'Available');

-- --------------------------------------------------------

--
-- Table structure for table `usage_logs`
--

CREATE TABLE `usage_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `station_id` bigint(20) DEFAULT NULL,
  `port_id` int(11) DEFAULT NULL,
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
(2, 'Ahmad Rafiq', 'rafiq@gmail.com', '0119876543', '123', 'Driver');

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
(1, 2, 'DCR 5488', 'Proton eMas');

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
  ADD KEY `models_brand_fk` (`brand_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD KEY `pay_user_fk` (`user_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`reservation_id`),
  ADD KEY `res_user_fk` (`user_id`),
  ADD KEY `res_station_fk` (`station_id`),
  ADD KEY `res_port_fk` (`port_id`);

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
  ADD UNIQUE KEY `unique_port_per_station` (`station_id`,`port_name`);

--
-- Indexes for table `usage_logs`
--
ALTER TABLE `usage_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `log_user_fk` (`user_id`),
  ADD KEY `log_station_fk` (`station_id`),
  ADD KEY `log_port_fk` (`port_id`);

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
  ADD KEY `veh_user_fk` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `car_brands`
--
ALTER TABLE `car_brands`
  MODIFY `brand_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `car_models`
--
ALTER TABLE `car_models`
  MODIFY `model_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `station_ports`
--
ALTER TABLE `station_ports`
  MODIFY `port_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `usage_logs`
--
ALTER TABLE `usage_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `car_models`
--
ALTER TABLE `car_models`
  ADD CONSTRAINT `models_brand_fk` FOREIGN KEY (`brand_id`) REFERENCES `car_brands` (`brand_id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `pay_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `res_port_fk` FOREIGN KEY (`port_id`) REFERENCES `station_ports` (`port_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `res_station_fk` FOREIGN KEY (`station_id`) REFERENCES `stations` (`station_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `res_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `station_ports`
--
ALTER TABLE `station_ports`
  ADD CONSTRAINT `ports_station_fk` FOREIGN KEY (`station_id`) REFERENCES `stations` (`station_id`) ON DELETE CASCADE;

--
-- Constraints for table `usage_logs`
--
ALTER TABLE `usage_logs`
  ADD CONSTRAINT `log_port_fk` FOREIGN KEY (`port_id`) REFERENCES `station_ports` (`port_id`),
  ADD CONSTRAINT `log_station_fk` FOREIGN KEY (`station_id`) REFERENCES `stations` (`station_id`),
  ADD CONSTRAINT `log_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `veh_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
