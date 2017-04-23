-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 23, 2017 at 05:20 PM
-- Server version: 10.1.21-MariaDB
-- PHP Version: 5.6.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `test`
--

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE `players` (
  `ID` int(11) NOT NULL,
  `games` int(11) NOT NULL,
  `won` int(11) NOT NULL,
  `lost` int(11) NOT NULL,
  `mmr` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `players`
--

INSERT INTO `players` (`ID`, `games`, `won`, `lost`, `mmr`) VALUES
(1, 0, 0, 0, 1500),
(2, 0, 0, 0, 1500),
(3, 72, 31, 33, 289),
(4, 42, 19, 16, 688),
(5, 11, 4, 7, 1000),
(6, 2, 0, 2, 995),
(7, 0, 0, 0, 1000),
(8, 0, 0, 0, 1000),
(9, 9, 6, 3, 996),
(10, 7, 3, 4, 995),
(11, 5, 4, 1, 996),
(12, 4, 2, 1, 1001),
(13, 0, 0, 0, 1000),
(14, 0, 0, 0, 1000),
(15, 0, 0, 0, 1000),
(16, 0, 0, 0, 1000),
(17, 4, 2, 2, 1001),
(18, 7, 4, 3, 1006),
(19, 0, 0, 0, 1000),
(20, 0, 0, 0, 1000);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `ID` int(11) NOT NULL,
  `mail` text CHARACTER SET utf8 COLLATE utf8_slovak_ci NOT NULL,
  `name` text CHARACTER SET utf8 COLLATE utf8_slovak_ci NOT NULL,
  `password` text CHARACTER SET utf8 COLLATE utf8_slovak_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`ID`, `mail`, `name`, `password`) VALUES
(3, '1', 'User1', '$2a$07$895z4ny7pApoM3Zf4X9fTeGdB2Ars8.T31iVb71BrKen1RL/gTQNe'),
(4, '2', 'User2', '$2a$07$nEAQRJchl6Wc.cvgXHllvuwlPYzaS6/bxyjzjVCQ6KtE7C5dnPPyi'),
(5, 'mail', 'scooty14', '$2a$07$xDxrd3FmoidbH9fw7li7JuwRulHUdVRRMaX1/VbIw4Ad.FL61cya6'),
(6, 'BMW_888@azet.sk', 'Chavi', '$2a$07$GJwH66w1P/Jd9JLTjypTsOHtZfU6jybGd7ESqAVyqzBd03W2VbpEG'),
(7, 'fuck@gmail.com', 'aspectos', '$2a$07$VAq894OMr3k3c5pkgtL.TeWYZFFw3b.EKkoXD2ESsd2e1v40jj0NK'),
(8, 'mail\' OR DROP TABLE players;', 'name\' OR DROP TABLE players;', '$2a$07$M7NCKHI9eEoucWR.o.1h.uKYuJzHsefFMtOERLPec1rTpJ5FF9HZC'),
(9, 'lol@gmail.com', 'optester', '$2a$07$2aYAcOAFHS4ANmGqqACxQOoZRw0s2sa.a5Qgvd0C.VIk1cV36AXi6'),
(10, 'kmotr6@centrum.sk', 'tvojtatko', '$2a$07$vAs/bd23mLRWVeCQKoAWROzYPhWgpNCb2pWLnKUleurJ0b7cTtA.W'),
(11, 'aaa', 'AAAAAAAAAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '$2a$07$JFBr1c7EvWME3pL9bP/aBO9hQwqbW7ACZJvuqY2lLI7EoUYa3Z5o2'),
(12, 'aaaa', 'scooty14LUL', '$2a$07$2aSL1ErNoYSuLfAD0EUaIeCLqMHs4h1lSnBS6I8P4e2hdvDIWsLT2'),
(13, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'aa', '$2a$07$PMkk/H6vzGeZ9DyORZdZ4uZQGwXLXWmMQSl6jXWWOgGwBwWWJKZEa'),
(14, 'aaaaa', 'aaaaa', '$2a$07$OdJMnm0VteD6xX/PwwIVq.76yDP6vrjROKWnw.Vhei89NGZMru5XW'),
(15, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'aaa', '$2a$07$yNHZC8uMJQWu4QNbOe77qu8i9D3o/MciC6tqiEV7EPvfviiVfomju'),
(16, 'a', 'a', '$2a$07$itl.d7NI3KHon3Bcs83OOOxDeumLBtjxOn9eAxF6hNsK3GzNo3Uee'),
(17, 'aaaaaa', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dictum convallis dui id interdum. Mauris non tellus id lorem pretium euismod vitae vitae est. Sed non euismod lectus, sed molestie mauris. Duis vel ex maximus, sodales nunc laoreet, convallis diam. Phasellus mattis ipsum ipsum, non tincidunt justo egestas quis. Etiam elit elit, auctor at tempor in, accumsan vulputate eros. Vivamus turpis nulla, semper congue dapibus id, ultricies quis purus. Sed eu interdum diam. Pellentesque orci est, consequat congue mauris et, semper commodo libero. Vivamus faucibus accumsan est ac tristique. Nulla id massa vel metus cursus posuere ac sed justo. Duis libero lorem, dapibus eget ligula nec, tristique sodales purus. Nunc at nisi ipsum. In gravida sit amet sapien vitae molestie. ', '$2a$07$tGOd8GAnlAtpkuZNEI9U2ODcH3jg7q9AcEhVgiYd0oDnnnrqL9FBm'),
(18, 'posahane3713@azet.sk', 'S.', '$2a$07$mO31HZhFx7pJIvx.UB838O05YE5ms692u2RCWWhhnkmP8NMjpVIR6'),
(19, ' ', ' ', '$2a$07$c1R9xwGV3p3czS1L5d8ntOveHfSlXhbOPgJus1cIT8cgFP5rDcVUi'),
(20, 'xD', 'xD', '$2a$07$/FLSZwkLnhZ5rLpQ2T5fI.hrJmHJ4xEpWX6wLhe4sF8Ydgrd4.cqy');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
