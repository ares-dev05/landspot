SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

CREATE TABLE `theme_colors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tid` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `color` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tid_2` (`tid`,`name`),
  KEY `tid` (`tid`),
  CONSTRAINT `theme_colors_ibfk_1` FOREIGN KEY (`tid`) REFERENCES `theme_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `theme_colors` (`id`, `tid`, `name`, `color`) VALUES
(16,	2,	'color_class_1',	16777215),
(17,	2,	'color_class_2',	15016752),
(18,	2,	'color_class_3',	10551839),
(19,	2,	'color_class_4',	7211034),
(20,	2,	'color_class_5',	15066859),
(21,	3,	'color_class_1',	16777215),
(22,	3,	'color_class_2',	10322),
(23,	3,	'color_class_3',	10322),
(24,	3,	'color_class_4',	6591927),
(25,	3,	'color_class_5',	15066859),
(27,	2,	'color_class_10',	15016752),
(28,	3,	'color_class_10',	10322),
(29,	4,	'color_class_1',	16777215),
(30,	4,	'color_class_2',	15829302),
(31,	4,	'color_class_3',	15829302),
(32,	4,	'color_class_4',	15829302),
(33,	4,	'color_class_5',	15066859),
(34,	4,	'color_class_10',	3355443),
(35,	5,	'color_class_1',	16777215),
(36,	5,	'color_class_2',	7258664),
(37,	5,	'color_class_3',	7258664),
(38,	5,	'color_class_4',	7258664),
(39,	5,	'color_class_5',	15066859),
(40,	5,	'color_class_10',	3223857),
(41,	6,	'color_class_1',	16777215),
(42,	6,	'color_class_2',	16151040),
(43,	6,	'color_class_3',	16151040),
(44,	6,	'color_class_4',	16151040),
(45,	6,	'color_class_5',	15066859),
(46,	6,	'color_class_10',	3355443),
(47,	7,	'color_class_1',	16777215),
(48,	7,	'color_class_2',	149639),
(49,	7,	'color_class_3',	149639),
(50,	7,	'color_class_4',	149639),
(51,	7,	'color_class_5',	15066859),
(52,	7,	'color_class_10',	149639),
(53,	8,	'color_class_1',	16777215),
(54,	8,	'color_class_2',	11673127),
(55,	8,	'color_class_3',	11673127),
(56,	8,	'color_class_4',	11673127),
(57,	8,	'color_class_5',	15066859),
(58,	8,	'color_class_10',	16777215),
(59,	9,	'color_class_1',	16777215),
(60,	9,	'color_class_2',	16766208),
(61,	9,	'color_class_3',	16766208),
(62,	9,	'color_class_4',	16766208),
(63,	9,	'color_class_5',	15066859),
(64,	9,	'color_class_10',	16766208),
(65,	9,	'color_class_11',	3684677),
(67,	2,	'color_class_11',	16777215),
(68,	3,	'color_class_11',	16777215),
(69,	4,	'color_class_11',	16777215),
(70,	5,	'color_class_11',	16777215),
(71,	6,	'color_class_11',	16777215),
(72,	7,	'color_class_11',	16777215),
(73,	8,	'color_class_11',	16777215),
(74,	10,	'color_class_1',	16777215),
(75,	10,	'color_class_2',	38075),
(76,	10,	'color_class_3',	38075),
(77,	10,	'color_class_4',	38075),
(78,	10,	'color_class_5',	15066859),
(79,	10,	'color_class_10',	3355443),
(80,	10,	'color_class_11',	16777215),
(81,	11,	'color_class_3',	20132),
(82,	11,	'color_class_4',	7211034),
(83,	11,	'color_class_5',	15066859),
(84,	11,	'color_class_2',	20132),
(85,	11,	'color_class_11',	16777215),
(86,	11,	'color_class_1',	16777215),
(87,	11,	'color_class_10',	16777215),
(88,	9,	'color_class_12',	16777215),
(89,	10,	'color_class_12',	16777215),
(90,	8,	'color_class_12',	11673127),
(91,	7,	'color_class_12',	16777215),
(92,	6,	'color_class_12',	16777215),
(93,	5,	'color_class_12',	16777215),
(94,	4,	'color_class_12',	16777215),
(95,	3,	'color_class_12',	16777215),
(96,	2,	'color_class_12',	16777215),
(98,	11,	'color_class_12',	0),
(99,	12,	'color_class_1',	16777215),
(100,	12,	'color_class_2',	2829877),
(101,	12,	'color_class_3',	2829877),
(102,	12,	'color_class_4',	2829877),
(103,	12,	'color_class_5',	15066859),
(104,	12,	'color_class_10',	16777215),
(105,	12,	'color_class_11',	16777215),
(106,	12,	'color_class_12',	2829877),
(107,	13,	'color_class_3',	13863957),
(108,	13,	'color_class_4',	7211034),
(109,	13,	'color_class_5',	15066859),
(110,	13,	'color_class_2',	13863957),
(111,	13,	'color_class_11',	16777215),
(112,	13,	'color_class_1',	16777215),
(113,	13,	'color_class_10',	16777215),
(114,	13,	'color_class_12',	0),
(115,	14,	'color_class_3',	16630319),
(116,	14,	'color_class_4',	7211034),
(117,	14,	'color_class_5',	15066859),
(118,	14,	'color_class_2',	12355),
(119,	14,	'color_class_11',	16777215),
(120,	14,	'color_class_1',	16777215),
(121,	14,	'color_class_10',	16777215),
(122,	14,	'color_class_12',	0),
(123,	15,	'color_class_3',	46539),
(124,	15,	'color_class_4',	7211034),
(125,	15,	'color_class_5',	15066859),
(126,	15,	'color_class_2',	46539),
(127,	15,	'color_class_11',	16777215),
(128,	15,	'color_class_1',	16777215),
(129,	15,	'color_class_10',	16777215),
(130,	15,	'color_class_12',	0),
(131,	1,	'color_class_3',	1042576),
(132,	1,	'color_class_4',	7211034),
(133,	1,	'color_class_5',	15066859),
(134,	1,	'color_class_2',	1042576),
(135,	1,	'color_class_11',	16777215),
(136,	1,	'color_class_1',	16777215),
(137,	1,	'color_class_10',	16777215),
(138,	1,	'color_class_12',	1381653),
(139,	16,	'color_class_1',	16777215),
(140,	16,	'color_class_10',	16777215),
(141,	16,	'color_class_11',	16777215),
(142,	16,	'color_class_12',	3881532),
(143,	16,	'color_class_2',	3881532),
(144,	16,	'color_class_3',	3881532),
(145,	16,	'color_class_4',	3881532),
(146,	16,	'color_class_5',	15066859),
(147,	17,	'color_class_1',	16777215),
(148,	17,	'color_class_10',	16777215),
(149,	17,	'color_class_11',	16777215),
(150,	17,	'color_class_12',	21128),
(151,	17,	'color_class_2',	21128),
(152,	17,	'color_class_3',	21128),
(153,	17,	'color_class_4',	21128),
(154,	17,	'color_class_5',	15066859),
(155,	18,	'color_class_1',	16777215),
(156,	18,	'color_class_10',	16777215),
(157,	18,	'color_class_11',	16777215),
(158,	18,	'color_class_12',	1381653),
(159,	18,	'color_class_2',	4804553),
(160,	18,	'color_class_3',	4804553),
(161,	18,	'color_class_4',	7211034),
(162,	18,	'color_class_5',	15066859);

CREATE TABLE `theme_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `theme_groups` (`id`, `name`) VALUES
(12,	'BOLD'),
(10,	'Burbank QLD (Black & Blue)'),
(4,	'Burbank Victoria (Black & Orange)'),
(1,	'Default Theme (Green)'),
(9,	'Dennis Family (Yellow)'),
(14,	'Eden Brae (Dark Cyan & Yellow)'),
(5,	'Eight Homes (Dark Gray & Green)'),
(18,	'Landconnect (New Blue)'),
(11,	'McDonald Jones (Blue & White)'),
(16,	'Mega Homes'),
(17,	'Mimosa Homes (Blue)'),
(8,	'Orbit Homes (Burgundy)'),
(3,	'Porter Davis (Blue)'),
(7,	'Sherridon Homes (Navy Blue)'),
(2,	'Simonds Theme (Pink)'),
(13,	'Style Master (White and Orange)'),
(6,	'Urban Edges (Dark Gray & Orange)'),
(15,	'Watersun Homes (White & Cyan)');
