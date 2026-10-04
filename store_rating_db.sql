-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 04, 2026 at 01:26 PM
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
-- Database: `store_rating_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `user_id`, `store_id`, `rating`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 5, '2026-10-04 10:54:41', '2026-10-04 11:13:12'),
(2, 5, 2, 4, '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(3, 6, 1, 4, '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(4, 6, 3, 5, '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(5, 7, 2, 3, '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(6, 7, 3, 4, '2026-10-04 10:54:41', '2026-10-04 10:54:41');

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `name` varchar(60) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(400) NOT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `name`, `email`, `address`, `owner_id`, `created_at`, `updated_at`) VALUES
(1, 'Apex Organic Market & Grocers', 'alex.organic@stores.com', 'Building 4, Green Valley Commerce Zone, Sector 18, City Center', 2, '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(2, 'Nexus Digital Tech Emporium', 'samantha.tech@stores.com', 'Plot 22, Innovation Plaza, Cybertech Park, North District', 3, '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(3, 'Artisan Delight Gourmet Bakery', 'chris.bakery@stores.com', 'Cornerstone Lane 12, Old Heritage Square, East Quarter', 4, '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(4, 'Seeded Fresh Mart 2095', 'freshmart.1791112392095@stores.com', '88 Fresh Way Boulevard, Green Valley Hub', 9, '2026-10-04 11:13:12', '2026-10-04 11:13:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(60) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` varchar(400) NOT NULL,
  `role` enum('ADMIN','USER','STORE_OWNER') NOT NULL DEFAULT 'USER',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `address`, `role`, `created_at`, `updated_at`) VALUES
(1, 'System Administrator Officer', 'admin@storerating.com', '$2b$10$.PQ9M0FAKk0v5uGi7riNfux2QFza41XPOnhCfPMemSpMggkFax6Mi', 'Suite 100, Admin Headquarters, 500 Silicon Avenue, Metro City', 'ADMIN', '2026-10-04 10:54:40', '2026-10-04 10:54:40'),
(2, 'Alexander Mitchell Bennett', 'alex.organic@stores.com', '$2b$10$.PQ9M0FAKk0v5uGi7riNfu1jtf1GFxs363ZdsBj1kf8OYI6odla8a', 'Building 4, Green Valley Commerce Zone, Sector 18, City Center', 'STORE_OWNER', '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(3, 'Samantha Claire Reynolds', 'samantha.tech@stores.com', '$2b$10$.PQ9M0FAKk0v5uGi7riNfu1jtf1GFxs363ZdsBj1kf8OYI6odla8a', 'Plot 22, Innovation Plaza, Cybertech Park, North District', 'STORE_OWNER', '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(4, 'Christopher James Walker', 'chris.bakery@stores.com', '$2b$10$.PQ9M0FAKk0v5uGi7riNfu1jtf1GFxs363ZdsBj1kf8OYI6odla8a', 'Cornerstone Lane 12, Old Heritage Square, East Quarter', 'STORE_OWNER', '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(5, 'Benjamin Edward Harrison', 'benjamin.harrison@gmail.com', '$2b$10$FV1.Jo4HDgxqbQ.sMHdYeuJY8EDONDjRNhV4Xvdul0fTDdKkQw6py', 'Apartment 304, Oakwood Residences, 742 Evergreen Terrace', 'USER', '2026-10-04 10:54:41', '2026-10-04 11:13:13'),
(6, 'Katherine Michelle Parker', 'katherine.parker@gmail.com', '$2b$10$.PQ9M0FAKk0v5uGi7riNfuh/iCNQRtwX5iii0JsO9.bh.XeveT4gG', 'House 82, Maple Grove Enclave, West End Boulevard', 'USER', '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(7, 'Jonathan Robert Campbell', 'jonathan.campbell@gmail.com', '$2b$10$.PQ9M0FAKk0v5uGi7riNfuh/iCNQRtwX5iii0JsO9.bh.XeveT4gG', 'Unit 15, Pinecrest Heights, Central Avenue 400', 'USER', '2026-10-04 10:54:41', '2026-10-04 10:54:41'),
(8, 'Test Verification User Account', 'test.user.1791112390421@example.com', '$2b$10$HEGMMk6lE5FmYPYym/s1yOqAcmN4lHiNOF5i70.WafBs/wznZ9.Bu', '404 Verification Street, Software Suite 200, Cyber City', 'USER', '2026-10-04 11:13:11', '2026-10-04 11:13:11'),
(9, 'Seeded Fresh Mart 2095 Store Owner', 'freshmart.1791112392095@stores.com', '$2b$10$SxxbsjCs/hgQ.vEt3nl68uMGe1gj/BEmugQGDCVyaqumM3hY8RWzu', '88 Fresh Way Boulevard, Green Valley Hub', 'STORE_OWNER', '2026-10-04 11:13:12', '2026-10-04 11:13:12'),
(10, 'New Administrator User Account', 'newadmin.1791112392270@storerating.com', '$2b$10$TXrIhc24dxuTIRovxqAua.0duuUbo6Wx1AZ6VKQzA1W6ZSks.hufe', 'Admin Operations Wing, 10th Floor, City Hub', 'ADMIN', '2026-10-04 11:13:12', '2026-10-04 11:13:12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_store` (`user_id`,`store_id`),
  ADD KEY `idx_store` (`store_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_owner` (`owner_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
