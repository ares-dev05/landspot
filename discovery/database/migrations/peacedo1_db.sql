-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 19, 2017 at 03:25 PM
-- Server version: 5.7.19-0ubuntu0.16.04.1
-- PHP Version: 7.0.22-0ubuntu0.16.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `peacedonkey`
--

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--
DROP TABLE IF EXISTS `companies`;

CREATE TABLE `companies` (
  `id` int(11) NOT NULL,
  `type` enum('builder','developer') NOT NULL DEFAULT 'builder',
  `name` varchar(256) NOT NULL,
  `theme_id` varchar(256) NOT NULL,
  `builder_id` varchar(32) NOT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `chas_multihouse` tinyint(4) NOT NULL DEFAULT '0',
  `chas_master_access` tinyint(4) NOT NULL DEFAULT '0',
  `chas_exclusive` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `theme_id`, `builder_id`, `domain`, `chas_multihouse`, `chas_master_access`, `chas_exclusive`) VALUES
(14, 'Watersun Homes', '15', 'Watersun', 'watersun.landconnect.com.au', 0, 0, 0);

INSERT INTO `companies` (`id`, `name`, `theme_id`, `builder_id`, `domain`, `chas_multihouse`, `chas_master_access`, `chas_exclusive`) VALUES
(1, 'Landconnect', 'Default', 'Default', 'landconnect.com.au', 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `house_ranges`
--

CREATE TABLE `house_ranges` (
  `id` int(11) NOT NULL,
  `cid` int(11) NOT NULL COMMENT 'company ID',
  `state_id` int(11) NOT NULL,
  `name` varchar(256) NOT NULL COMMENT 'the display name of the group',
  `folder` varchar(256) NOT NULL,
  `multihouse` tinyint(4) NOT NULL DEFAULT '0',
  `exclusive` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `house_ranges`
--

INSERT INTO `house_ranges` (`id`, `cid`, `state_id`, `name`, `folder`, `multihouse`, `exclusive`) VALUES
(57, 14, 7, 'Delta Range', 'delta', 0, 0),
(58, 14, 4, 'Aspire Range', 'aspire', 0, 0),
(59, 14, 4, 'Delta Range', 'delta', 0, 0),
(60, 14, 7, 'Aspire Range', 'aspire', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `house_states`
--

CREATE TABLE `house_states` (
  `id` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `abbrev` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `house_states`
--

INSERT INTO `house_states` (`id`, `name`, `abbrev`) VALUES
(1, 'New South Wales', 'NSW'),
(2, 'Australian Capital Territory', 'ACT'),
(3, 'Northern Territory', 'NT'),
(4, 'Queensland', 'QLD'),
(5, 'South Australia', 'SA'),
(6, 'Tasmania', 'TAS'),
(7, 'Victoria', 'VIC'),
(8, 'Western Australia', 'WA'),
(9, 'Dual Occ', 'DOC');

-- --------------------------------------------------------

--
-- Table structure for table `house_svgs`
--

CREATE TABLE `house_svgs` (
  `id` int(11) NOT NULL,
  `range_id` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `url` varchar(256) NOT NULL,
  `to_mm_factor` double NOT NULL DEFAULT '1',
  `area_data` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `house_svgs`
--

INSERT INTO `house_svgs` (`id`, `range_id`, `name`, `url`, `to_mm_factor`, `area_data`, `updated_at`) VALUES
(720, 58, 'Ashton 2670', 'ASHTON 2670 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 188.80,\n      "garage": 36.34,\n      "alfresco": 0,\n      "porch": 6.39\n    }\n  }\n}', '2017-10-19 12:05:49'),
(721, 58, 'Avondale 2900', 'AVONDALE 2900 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 205.62,\n      "garage": 36.37,\n      "alfresco": 20.19,\n      "porch": 9.65\n    }\n  }\n}', '2017-10-19 12:05:49'),
(722, 59, 'Bondi 2270', 'BONDI 2270 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 158.59,\n      "garage": 36.31,\n      "alfresco": 11.72,\n      "porch": 3.01\n    }\n  }\n}', '2017-10-19 12:05:49'),
(723, 58, 'Brooklyn 3200', 'BROOKLYN 3200 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 227.47,\n      "garage": 37.46,\n      "alfresco": 21.57,\n      "porch": 7.35\n    }\n  }\n}', '2017-10-19 12:05:49'),
(724, 58, 'Burnley 3000', 'BURNLEY 3000 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 220.00,\n      "garage": 36.31,\n      "alfresco": 15.12,\n      "porch": 8.15\n    }\n  }\n}', '2017-10-19 12:05:49'),
(725, 58, 'Canterbury 3600', 'CANTERBURY 3600 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 271.48,\n      "garage": 36.36,\n      "alfresco": 22.87,\n      "porch": 10.14\n    }\n  }\n}', '2017-10-19 12:05:49'),
(726, 59, 'Coast 2330', 'COAST 2330 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 175.26,\n      "garage": 37.50,\n      "alfresco": 0,\n      "porch": 4.19\n    }\n  }\n}', '2017-10-19 12:05:49'),
(727, 58, 'Dalton 2640', 'DALTON 2640 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 187.94,\n      "garage": 36.11,\n      "alfresco": 15.62,\n      "porch": 5.41\n    }\n  }\n}', '2017-10-19 12:05:49'),
(728, 58, 'Dawson 2910', 'DAWSON 2910 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 213.88,\n      "garage": 36.34,\n      "alfresco": 0,\n      "porch": 6.48\n    }\n  }\n}', '2017-10-19 12:05:49'),
(729, 58, 'Julianne 2500', 'JULIANNE 2500 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 172.77,\n      "garage": 36.23,\n      "alfresco": 17.67,\n      "porch": 5.7\n    }\n  }\n}', '2017-10-19 12:05:49'),
(730, 58, 'Kent 2420B', 'KENT 2420B - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 167.89,\n      "garage": 36.40,\n      "alfresco": 15.51,\n      "porch": 5.52\n    }\n  }\n}', '2017-10-19 12:05:49'),
(731, 58, 'Kent 2420L', 'KENT 2420L - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 167.89,\n      "garage": 36.40,\n      "alfresco": 15.51,\n      "porch": 5.52\n    }\n  }\n}', '2017-10-19 12:05:49'),
(732, 58, 'Kent 2650', 'KENT 2650 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 180.36,\n      "garage": 44.12,\n      "alfresco": 15.51,\n      "porch": 6.11\n    }\n  }\n}', '2017-10-19 12:05:49'),
(733, 58, 'Mason 2850', 'MASON 2850 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 206.64,\n      "garage": 36.31,\n      "alfresco": 16.16,\n      "porch": 5.65\n    }\n  }\n}', '2017-10-19 12:05:49'),
(734, 58, 'Spencer 3070', 'SPENCER 3070 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 224.88,\n      "garage": 36.23,\n      "alfresco": 18.89,\n      "porch": 7.08\n    }\n  }\n}', '2017-10-19 12:05:49'),
(735, 58, 'Stanton 3400', 'STANTON 3400 - CUSTOM.svg', 200, '{\n  "area": {\n    "facade_custom": {\n      "floor": 123.41,\n      "garage": 36.25,\n      "alfresco": 20.13,\n      "porch": 3.74\n    }\n  }\n}', '2017-10-19 12:05:49'),
(736, 58, 'Warwick 2990', 'WARWICK 2990 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 220.08,\n      "garage": 36.92,\n      "alfresco": 14.71,\n      "porch": 6.13\n    }\n  }\n}', '2017-10-19 12:05:49'),
(737, 58, 'Waverley 2700', 'WAVERLEY 2700 - CONTEM.svg', 200, '{\n  "area": {\n    "facade_contem": {\n      "floor": 110.29,\n      "garage": 36.60,\n      "alfresco": 0,\n      "porch": 2.37\n    }\n  }\n}', '2017-10-19 12:05:49'),
(738, 58, 'Waverley 3300', 'WAVERLEY 3300 - COMTEMP..svg', 200, '{\n  "area": {\n    "facade_contemp": {\n      "floor": 122.12,\n      "garage": 36.60,\n      "alfresco": 10.82,\n      "porch": 2.37\n    }\n  }\n}', '2017-10-19 12:05:49'),
(739, 58, 'Yarra 3100', 'YARRA 3100 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 229.33,\n      "garage": 37.29,\n      "alfresco": 15.72,\n      "porch": 5.80\n    }\n  }\n}', '2017-10-19 12:05:49'),
(740, 58, 'Yarra 3600', 'YARRA 3600 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 272.98,\n      "garage": 36.34,\n      "alfresco": 19.20,\n      "porch": 6.94\n    }\n  }\n}', '2017-10-19 12:05:49'),
(741, 59, 'Airlie 2400', 'AIRLIE 2400 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 178.45,\n      "garage": 36.43,\n      "alfresco": 0,\n      "porch": 3.53\n    }\n  }\n}', '2017-10-19 12:05:49'),
(742, 59, 'Airlie 2800', 'AIRLIE 2800 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 215.87,\n      "garage": 36.43,\n      "alfresco": 11.11,\n      "porch": 3.53\n    }\n  }\n}', '2017-10-19 12:05:49'),
(743, 59, 'Ashgrove 2150', 'ASHGROVE 2150 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 162.88,\n      "garage": 37.52,\n      "alfresco": 0,\n      "porch": 4.06\n    }\n  }\n}', '2017-10-19 12:05:49'),
(744, 59, 'Ashgrove 2700', 'ASHGROVE 2700 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 211.24,\n      "garage": 36.52,\n      "alfresco": 0,\n      "porch": 4.06\n    }\n  }\n}', '2017-10-19 12:05:49'),
(745, 59, 'Cairns 1900', 'CAIRNS 1900 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 141.37,\n      "garage": 36.75,\n      "alfresco": 15.22,\n      "porch": 3.16\n    }\n  }\n}', '2017-10-19 12:05:49'),
(746, 59, 'Cairns 2100', 'CAIRNS 2100 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 152.06,\n      "garage": 36.75,\n      "alfresco": 16.37,\n      "porch": 3.16\n    }\n  }\n}', '2017-10-19 12:05:49'),
(747, 59, 'Cleveland 2800', 'CLEVELAND 2800 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 213.11,\n      "garage": 36.43,\n      "alfresco": 14.62,\n      "porch": 3.53\n    }\n  }\n}', '2017-10-19 12:05:49'),
(748, 59, 'Eden 2090', 'EDEN 2090 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 144.51,\n      "garage": 36.17,\n      "alfresco": 11.06,\n      "porch": 2.37\n    }\n  }\n}', '2017-10-19 12:05:49'),
(749, 59, 'Eden 2450', 'EDEN 2450 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 176.64,\n      "garage": 36.17,\n      "alfresco": 11.06,\n      "porch": 2.93\n    }\n  }\n}', '2017-10-19 12:05:49'),
(750, 59, 'Kallista 12A', 'KALLISTA 12A - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 167.70,\n      "garage": 36.28,\n      "alfresco": 0,\n      "porch": 2.03\n    }\n  }\n}', '2017-10-19 12:05:49'),
(751, 59, 'Kallista 12D', 'KALLISTA 12D - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 150.99,\n      "garage": 36.28,\n      "alfresco": 0,\n      "porch": 2.03\n    }\n  }\n}', '2017-10-19 12:05:49'),
(752, 59, 'Kallista 12E', 'KALLISTA 12E - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 139.73,\n      "garage": 36.28,\n      "alfresco": 0,\n      "porch": 2.03\n    }\n  }\n}', '2017-10-19 12:05:49'),
(753, 59, 'Kelly 2000', 'KEELY 2000 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 149.35,\n      "garage": 37.05,\n      "alfresco": 0,\n      "porch": 3.15\n    }\n  }\n}', '2017-10-19 12:05:49'),
(754, 59, 'Kew 2000A', 'KEW 2000A - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 153.55,\n      "garage": 36.54,\n      "alfresco": 0,\n      "porch": 3.18\n    }\n  }\n}', '2017-10-19 12:05:49'),
(755, 59, 'Kew 2100A', 'KEW 2100A - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 163.02,\n      "garage": 36.43,\n      "alfresco": 0,\n      "porch": 2.68\n    }\n  }\n}', '2017-10-19 12:05:49'),
(756, 59, 'Kew 2100B', 'KEW 2100B - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 162.36,\n      "garage": 36.54,\n      "alfresco": 0,\n      "porch": 3.20\n    }\n  }\n}', '2017-10-19 12:05:49'),
(757, 59, 'Kialla 1536', 'KIALLA 1536 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 115.45,\n      "garage": 24.89,\n      "alfresco": 0,\n      "porch": 2.86\n    }\n  }\n}', '2017-10-19 12:05:49'),
(758, 59, 'Kialla 1630', 'KIALLA 1630 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 126.62,\n      "garage": 23.36,\n      "alfresco": 0,\n      "porch": 2.08\n    }\n  }\n}', '2017-10-19 12:05:49'),
(759, 59, 'Kingsley 2040', 'KINGSLEY 2040 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 154.69,\n      "garage": 36.43,\n      "alfresco": 0,\n      "porch": 3.49\n    }\n  }\n}', '2017-10-19 12:05:49'),
(760, 59, 'Kingsley 2500', 'KINGSLEY 2500 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 193.62,\n      "garage": 36.43,\n      "alfresco": 0,\n      "porch": 3.49\n    }\n  }\n}', '2017-10-19 12:05:49'),
(761, 59, 'Manly 2580 ', 'MANLY 2580 - CONTEM.svg', 200, '{\n  "area": {\n    "facade_contem": {\n      "floor": 185.65,\n      "garage": 36.43,\n      "alfresco": 13.68,\n      "porch": 3.53\n    }\n  }\n}', '2017-10-19 12:05:49'),
(762, 59, 'Paddington 2500', 'PADDINGTON 2500 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 185.60,\n      "garage": 36.37,\n      "alfresco": 0,\n      "porch": 3.49\n    }\n  }\n}', '2017-10-19 12:05:49'),
(763, 59, 'Scarborough 3100', 'SCARBOROUGH 3100 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 237.00,\n      "garage": 36.40,\n      "alfresco": 14.43,\n      "porch": 4.31\n    }\n  }\n}', '2017-10-19 12:05:49'),
(764, 57, 'Airlie 2400', 'AIRLIE 2400 - MODERN.svg', 200, '{\n  "area": {\n    "facade_modern": {\n      "floor": 178.45,\n      "garage": 36.43,\n      "alfresco": 0,\n      "porch": 3.53\n    }\n  }\n}', '2017-10-19 12:05:49'),
(765, 57, 'Airlie 2800', 'AIRLIE 2800 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 215.87,\r\n      "garage": 36.43,\r\n      "alfresco": 11.11,\r\n      "porch": 3.53\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(766, 57, 'Ashgrove 2150', 'ASHGROVE 2150 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 162.88,\r\n      "garage": 37.52,\r\n      "alfresco": 0,\r\n      "porch": 4.06\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(767, 57, 'Ashgrove 2700', 'ASHGROVE 2700 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 211.24,\r\n      "garage": 36.52,\r\n      "alfresco": 0,\r\n      "porch": 4.06\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(768, 57, 'Cairns 1900', 'CAIRNS 1900 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 141.37,\r\n      "garage": 36.75,\r\n      "alfresco": 15.22,\r\n      "porch": 3.16\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(769, 57, 'Cairns 2100', 'CAIRNS 2100 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 152.06,\r\n      "garage": 36.75,\r\n      "alfresco": 16.37,\r\n      "porch": 3.16\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(770, 57, 'Cleveland 2800', 'CLEVELAND 2800 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 213.11,\r\n      "garage": 36.43,\r\n      "alfresco": 14.62,\r\n      "porch": 3.53\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(771, 57, 'Eden 2090', 'EDEN 2090 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 144.51,\r\n      "garage": 36.17,\r\n      "alfresco": 11.06,\r\n      "porch": 2.37\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(772, 57, 'Eden 2450', 'EDEN 2450 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 176.64,\r\n      "garage": 36.17,\r\n      "alfresco": 11.06,\r\n      "porch": 2.93\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(773, 57, 'Kallista 12A', 'KALLISTA 12A - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 167.70,\r\n      "garage": 36.28,\r\n      "alfresco": 0,\r\n      "porch": 2.03\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(774, 57, 'Kallista 12D', 'KALLISTA 12D - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 150.99,\r\n      "garage": 36.28,\r\n      "alfresco": 0,\r\n      "porch": 2.03\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(775, 57, 'Kallista 12E', 'KALLISTA 12E - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 139.73,\r\n      "garage": 36.28,\r\n      "alfresco": 0,\r\n      "porch": 2.03\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(776, 57, 'Kelly 2000', 'KEELY 2000 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 149.35,\r\n      "garage": 37.05,\r\n      "alfresco": 0,\r\n      "porch": 3.15\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(777, 57, 'Kew 2000A', 'KEW 2000A - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 153.55,\r\n      "garage": 36.54,\r\n      "alfresco": 0,\r\n      "porch": 3.18\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(778, 57, 'Kew 2100A', 'KEW 2100A - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 163.02,\r\n      "garage": 36.43,\r\n      "alfresco": 0,\r\n      "porch": 2.68\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(779, 57, 'Kew 2100B', 'KEW 2100B - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 162.36,\r\n      "garage": 36.54,\r\n      "alfresco": 0,\r\n      "porch": 3.20\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(780, 57, 'Kialla 1536', 'KIALLA 1536 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 115.45,\r\n      "garage": 24.89,\r\n      "alfresco": 0,\r\n      "porch": 2.86\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(781, 57, 'Kingsley 2040', 'KINGSLEY 2040 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 154.69,\r\n      "garage": 36.43,\r\n      "alfresco": 0,\r\n      "porch": 3.49\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(782, 57, 'Kingsley 2500', 'KINGSLEY 2500 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 193.62,\r\n      "garage": 36.43,\r\n      "alfresco": 0,\r\n      "porch": 3.49\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(783, 57, 'Manly 2580 ', 'MANLY 2580 - CONTEM.svg', 200, '{\r\n  "area": {\r\n    "facade_contem": {\r\n      "floor": 185.65,\r\n      "garage": 36.43,\r\n      "alfresco": 13.68,\r\n      "porch": 3.53\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(784, 57, 'Paddington 2500', 'PADDINGTON 2500 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 185.60,\r\n      "garage": 36.37,\r\n      "alfresco": 0,\r\n      "porch": 3.49\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(785, 57, 'Scarborough 3100', 'SCARBOROUGH 3100 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 237.00,\r\n      "garage": 36.40,\r\n      "alfresco": 14.43,\r\n      "porch": 4.31\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(810, 60, 'Ashton 2670', 'ASHTON 2670 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 188.80,\r\n      "garage": 36.34,\r\n      "alfresco": 0,\r\n      "porch": 6.39\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(811, 60, 'Avondale 2900', 'AVONDALE 2900 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 205.62,\r\n      "garage": 36.37,\r\n      "alfresco": 20.19,\r\n      "porch": 9.65\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(812, 57, 'Bondi 2270', 'BONDI 2270 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 158.59,\r\n      "garage": 36.31,\r\n      "alfresco": 11.72,\r\n      "porch": 3.01\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(813, 60, 'Brooklyn 3200', 'BROOKLYN 3200 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 227.47,\r\n      "garage": 37.46,\r\n      "alfresco": 21.57,\r\n      "porch": 7.35\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(814, 60, 'Burnley 3000', 'BURNLEY 3000 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 220.00,\r\n      "garage": 36.31,\r\n      "alfresco": 15.12,\r\n      "porch": 8.15\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(815, 60, 'Canterbury 3600', 'CANTERBURY 3600 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 271.48,\n      "garage": 36.36,\n      "alfresco": 22.87,\n      "porch": 10.14\n    }\n  }\n}', '2017-10-19 12:05:49'),
(816, 57, 'Coast 2330', 'COAST 2330 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 175.26,\r\n      "garage": 37.50,\r\n      "alfresco": 0,\r\n      "porch": 4.19\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(817, 60, 'Dalton 2640', 'DALTON 2640 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 187.94,\r\n      "garage": 36.11,\r\n      "alfresco": 15.62,\r\n      "porch": 5.41\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(818, 60, 'Dawson 2910', 'DAWSON 2910 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 213.88,\r\n      "garage": 36.34,\r\n      "alfresco": 0,\r\n      "porch": 6.48\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(819, 60, 'Julianne 2500', 'JULIANNE 2500 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 172.77,\r\n      "garage": 36.23,\r\n      "alfresco": 17.67,\r\n      "porch": 5.7\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(820, 60, 'Kent 2420B', 'KENT 2420B - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 167.89,\r\n      "garage": 36.40,\r\n      "alfresco": 15.51,\r\n      "porch": 5.52\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(821, 60, 'Kent 2420L', 'KENT 2420L - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 167.89,\r\n      "garage": 36.40,\r\n      "alfresco": 15.51,\r\n      "porch": 5.52\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(822, 60, 'Kent 2650', 'KENT 2650 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 180.36,\r\n      "garage": 44.12,\r\n      "alfresco": 15.51,\r\n      "porch": 6.11\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(823, 60, 'Mason 2850', 'MASON 2850 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 206.64,\r\n      "garage": 36.31,\r\n      "alfresco": 16.16,\r\n      "porch": 5.65\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(824, 60, 'Spencer 3070', 'SPENCER 3070 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 224.88,\r\n      "garage": 36.23,\r\n      "alfresco": 18.89,\r\n      "porch": 7.08\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(825, 60, 'Stanton 3400', 'STANTON 3400 - CUSTOM.svg', 200, '{\r\n  "area": {\r\n    "facade_custom": {\r\n      "floor": 123.41,\r\n      "garage": 36.25,\r\n      "alfresco": 20.13,\r\n      "porch": 3.74\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(826, 60, 'Warwick 2990', 'WARWICK 2990 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 220.08,\r\n      "garage": 36.92,\r\n      "alfresco": 14.71,\r\n      "porch": 6.13\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(827, 60, 'Waverley 2700', 'WAVERLEY 2700 - CONTEM.svg', 200, '{\n  "area": {\n    "facade_contem": {\n      "floor": 110.29,\n      "garage": 36.60,\n      "alfresco": 0,\n      "porch": 2.37\n    }\n  }\n}', '2017-10-19 12:05:49'),
(828, 60, 'Waverley 3300', 'WAVERLEY 3300 - COMTEMP..svg', 200, '{\r\n  "area": {\r\n    "facade_contemp": {\r\n      "floor": 122.12,\r\n      "garage": 36.60,\r\n      "alfresco": 10.82,\r\n      "porch": 2.37\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(829, 60, 'Yarra 3100', 'YARRA 3100 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 229.33,\r\n      "garage": 37.29,\r\n      "alfresco": 15.72,\r\n      "porch": 5.80\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(830, 60, 'Yarra 3600', 'YARRA 3600 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 272.98,\r\n      "garage": 36.34,\r\n      "alfresco": 19.20,\r\n      "porch": 6.94\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(831, 57, 'Kardella 2100', 'KARDELLA 2100 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 164.67,\r\n      "garage": 36.28,\r\n      "alfresco": 0,\r\n      "porch": 2.72\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(832, 57, 'Kenley 2300', 'KENLEY 2300 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 174.02,\r\n      "garage": 36.46,\r\n      "alfresco": 0,\r\n      "porch": 3.53\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(833, 57, 'Killara 2300', 'KILLARA 2300 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 169.22,\r\n      "garage": 37.75,\r\n      "alfresco": 0,\r\n      "porch": 6.32\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(834, 59, 'Kardella 2100', 'KARDELLA 2100 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 164.67,\r\n      "garage": 36.28,\r\n      "alfresco": 0,\r\n      "porch": 2.72\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(835, 59, 'Kenley 2300', 'KENLEY 2300 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 174.02,\r\n      "garage": 36.46,\r\n      "alfresco": 0,\r\n      "porch": 3.53\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(836, 59, 'Kardella 2100', 'KILLARA 2300 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 169.22,\r\n      "garage": 37.75,\r\n      "alfresco": 0,\r\n      "porch": 6.32\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(844, 58, 'CAULFIELD', 'CAULFIELD - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 149.88,\n      "garage": 37.75,\n      "alfresco": 16.53,\n      "porch": 5.12\n    }    \n  }\n}', '2017-10-19 12:05:49'),
(845, 60, 'CAULFIELD', 'CAULFIELD - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 149.88,\n      "garage": 37.75,\n      "alfresco": 16.53,\n      "porch": 5.12\n    }    \n  }\n}', '2017-10-19 12:05:49'),
(846, 58, 'SEAFORD 2350', 'SEAFORD 2350 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 165.43,\n      "garage": 37.95,\n      "alfresco": 12.10,\n      "porch": 6.19\n    }    \n  }\n}', '2017-10-19 12:05:49'),
(847, 60, 'SEAFORD 2350', 'SEAFORD 2350 - PLANTATION.svg', 200, '{\n  "area": {\n    "facade_plantation": {\n      "floor": 165.43,\n      "garage": 37.95,\n      "alfresco": 12.10,\n      "porch": 6.19\n    }    \n  }\n}', '2017-10-19 12:05:49'),
(848, 57, 'BAXTER 1650', 'BAXTER 1650 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 114.11,\r\n      "garage": 36.25,\r\n      "alfresco": 0,\r\n      "porch": 2.85\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(849, 59, 'BAXTER 1650', 'BAXTER 1650 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 114.11,\r\n      "garage": 36.25,\r\n      "alfresco": 0,\r\n      "porch": 2.85\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(850, 57, 'BOSTON 1700', 'BOSTON 1700 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 125.90,\r\n      "garage": 37.09,\r\n      "alfresco": 0,\r\n      "porch": 2.00\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(851, 59, 'BOSTON 1700', 'BOSTON 1700 - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 125.90,\r\n      "garage": 37.09,\r\n      "alfresco": 0,\r\n      "porch": 2.00\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(852, 57, 'CEDUNA 1150', 'CEDUNA 1150 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 107.02,\r\n      "garage": 0,\r\n      "alfresco": 0,\r\n      "porch": 0\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(853, 59, 'CEDUNA 1150', 'CEDUNA 1150 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 107.02,\r\n      "garage": 0,\r\n      "alfresco": 0,\r\n      "porch": 0\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(854, 57, 'CEDUNA 1280', 'CEDUNA 1280 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 119.10,\r\n      "garage": 0,\r\n      "alfresco": 0,\r\n      "porch": 0\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(855, 59, 'CEDUNA 1280', 'CEDUNA 1280 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 119.10,\r\n      "garage": 0,\r\n      "alfresco": 0,\r\n      "porch": 0\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(856, 57, 'QUAY 1500', 'QUAY 1500 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 114.33,\r\n      "garage": 24.29,\r\n      "alfresco": 0,\r\n      "porch": 2.85\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(857, 59, 'QUAY 1500', 'QUAY 1500 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 114.33,\r\n      "garage": 24.29,\r\n      "alfresco": 0,\r\n      "porch": 2.85\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(858, 57, 'KARDELLA 2300', 'KARDELLA 2300 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 168.24,\r\n      "garage": 36.86,\r\n      "alfresco": 1.28,\r\n      "porch": 2.37\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(859, 59, 'KARDELLA 2300', 'KARDELLA 2300 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 168.24,\r\n      "garage": 36.86,\r\n      "alfresco": 1.28,\r\n      "porch": 2.37\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(860, 57, 'COAST 2060', 'COAST 2060 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 150.21,\r\n      "garage": 37.42,\r\n      "alfresco": 0,\r\n      "porch": 3.52\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(861, 59, 'COAST 2060', 'COAST 2060 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 150.21,\r\n      "garage": 37.42,\r\n      "alfresco": 0,\r\n      "porch": 3.52\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(862, 57, 'COAST 1770', 'COAST 1770 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 124.31,\r\n      "garage": 36.79,\r\n      "alfresco": 13.38,\r\n      "porch": 3.86\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(863, 59, 'COAST 1770', 'COAST 1770 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 124.31,\r\n      "garage": 36.79,\r\n      "alfresco": 13.38,\r\n      "porch": 3.86\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(864, 57, 'QUAY 1800', 'QUAY 1800 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 127.42,\r\n      "garage": 36.54,\r\n      "alfresco": 0,\r\n      "porch": 3.38\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(865, 59, 'QUAY 1800', 'QUAY 1800 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 127.42,\r\n      "garage": 36.54,\r\n      "alfresco": 0,\r\n      "porch": 3.38\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(866, 57, 'CEDUNA 1320', 'CEDUNA 1320 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 97.71,\r\n      "garage": 23.56,\r\n      "alfresco": 10.52,\r\n      "porch": 1.85\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(867, 59, 'CEDUNA 1320', 'CEDUNA 1320 - MODERN.svg', 200, '{\r\n  "area": {\r\n    "facade_modern": {\r\n      "floor": 97.71,\r\n      "garage": 23.56,\r\n      "alfresco": 10.52,\r\n      "porch": 1.85\r\n    }    \r\n  }\r\n}', '2017-10-19 12:05:49'),
(1242, 60, 'EASTWOOD - PLANTATION', 'EASTWOOD - PLANTATION.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 180.70,\r\n      "garage": 37.34,\r\n      "alfresco": 17.41,\r\n      "porch": 5.33\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(1243, 60, 'LINDERMAN 2800', 'LINDERMAN 2800.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 191.46,\r\n      "garage": 37.52,\r\n      "alfresco": 14.52,\r\n      "porch": 5.75\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(1244, 60, 'MACEDON 3040', 'MACEDON 3040.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 224.98,\r\n      "garage": 36.65,\r\n      "alfresco": 16.19,\r\n      "porch": 5.01\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(1245, 60, 'SANTORINI 2900', 'SANTORINI 2900.svg', 200, '{\r\n  "area": {\r\n    "facade_plantation": {\r\n      "floor": 208.03,\r\n      "garage": 36.31,\r\n      "alfresco": 16.51,\r\n      "porch": 5.19\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49'),
(1247, 60, 'NOLAN', 'NOLAN.svg', 200, '{\r\n  "area": {\r\n    "facade_wentworth": {\r\n      "floor": 153.40,\r\n      "garage": 37.96,\r\n      "alfresco": 13.31,\r\n      "porch": 6.19\r\n    }\r\n  }\r\n}', '2017-10-19 12:05:49');

-- --------------------------------------------------------

--
-- Table structure for table `ranges`
--

CREATE TABLE `ranges` (
  `id` int(11) NOT NULL,
  `cid` int(11) NOT NULL COMMENT 'company ID',
  `state_id` int(11) NOT NULL,
  `name` varchar(256) NOT NULL COMMENT 'the display name of the group'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `ranges`
--

INSERT INTO `ranges` (`id`, `cid`, `state_id`, `name`) VALUES
(57, 14, 7, 'Delta Range'),
(58, 14, 4, 'Aspire Range'),
(59, 14, 4, 'Delta Range'),
(60, 14, 7, 'Aspire Range');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `house_ranges`
--
ALTER TABLE `house_ranges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cid` (`cid`),
  ADD KEY `cid_3` (`cid`),
  ADD KEY `state_id` (`state_id`);

--
-- Indexes for table `house_states`
--
ALTER TABLE `house_states`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `house_svgs`
--
ALTER TABLE `house_svgs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `range_id` (`range_id`);

--
-- Indexes for table `ranges`
--
ALTER TABLE `ranges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cid` (`cid`),
  ADD KEY `cid_3` (`cid`),
  ADD KEY `state_id` (`state_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1002;
--
-- AUTO_INCREMENT for table `house_ranges`
--
ALTER TABLE `house_ranges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;
--
-- AUTO_INCREMENT for table `house_states`
--
ALTER TABLE `house_states`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT for table `house_svgs`
--
ALTER TABLE `house_svgs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1552;
--
-- AUTO_INCREMENT for table `ranges`
--
ALTER TABLE `ranges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `house_ranges`
--
ALTER TABLE `house_ranges`
  ADD CONSTRAINT `house_ranges_ibfk_1` FOREIGN KEY (`cid`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `house_ranges_ibfk_2` FOREIGN KEY (`state_id`) REFERENCES `house_states` (`id`);

--
-- Constraints for table `house_svgs`
--
ALTER TABLE `house_svgs`
  ADD CONSTRAINT `house_svgs_ibfk_1` FOREIGN KEY (`range_id`) REFERENCES `house_ranges` (`id`);

CREATE TABLE IF NOT EXISTS `uf_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `is_default` tinyint(1) NOT NULL,
  `can_delete` tinyint(1) NOT NULL,
  `home_page_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `uf_groups`
--

INSERT INTO `uf_groups` (`id`, `name`, `is_default`, `can_delete`, `home_page_id`) VALUES
(1, 'User', 2, 0, 18),
(2, 'Global Admins', 0, 0, 9),
(3, 'Builder Admins', 0, 0, 9),
(4, 'Developer Admins', 0, 0, 9);

-- --------------------------------------------------------

--
-- Table structure for table `uf_users`
--

CREATE TABLE IF NOT EXISTS `uf_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(50) NOT NULL,
  `display_name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(150) NOT NULL,
  `activation_token` varchar(225) NOT NULL,
  `last_activation_request` int(11) NOT NULL,
  `lost_password_request` tinyint(1) NOT NULL,
  `lost_password_timestamp` int(11) DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  `title` varchar(150) NOT NULL,
  `sign_up_stamp` int(11) NOT NULL,
  `last_sign_in_stamp` int(11) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Specifies if the account is enabled.  Disabled accounts cannot be logged in to, but they retain all of their data and settings.',
  `primary_group_id` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Specifies the primary group for the user.',
  `company_id` int(11) DEFAULT NULL,
  `state_id` int(11) NOT NULL,
  `has_multihouse` tinyint(4) NOT NULL DEFAULT '0',
  `has_exclusive` tinyint(4) NOT NULL DEFAULT '0',
  `has_portal_access` tinyint(4) NOT NULL DEFAULT '0',
  `has_master_access` tinyint(4) NOT NULL DEFAULT '0',
  `billing_access_level` tinyint(4) NOT NULL DEFAULT '0',
  `is_envelope_admin` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `state_id` (`state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `uf_user_group_matches`
--

CREATE TABLE IF NOT EXISTS `uf_user_group_matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `uf_users`
--
ALTER TABLE `uf_users`
  ADD CONSTRAINT `uf_users_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `house_states` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;