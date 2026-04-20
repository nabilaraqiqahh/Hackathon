-- --------------------------------------------------------
-- RUN THIS IN XAMPP PHP MYADMIN (MySQL)
-- This updates your current database to support Member 2's new UI features
-- --------------------------------------------------------

-- 1. Create a new Vehicles table (since users can have multiple cars with license plates now)
CREATE TABLE `vehicles` (
  `vehicle_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `plat_no` varchar(20) NOT NULL,
  `car_model` varchar(100) NOT NULL,
  PRIMARY KEY (`vehicle_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Add new columns to Reservations
ALTER TABLE `reservations` 
ADD COLUMN `duration` varchar(50) DEFAULT NULL,
ADD COLUMN `connector` varchar(50) DEFAULT NULL,
ADD COLUMN `power` varchar(50) DEFAULT NULL;

-- 3. Add new columns to Payments
ALTER TABLE `payments` 
ADD COLUMN `payment_method` varchar(50) DEFAULT NULL,
ADD COLUMN `energy` varchar(50) DEFAULT NULL,
ADD COLUMN `receipt_no` varchar(50) DEFAULT NULL;

