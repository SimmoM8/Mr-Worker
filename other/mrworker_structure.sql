-- MySQL dump 10.13  Distrib 9.3.0, for macos14.7 (x86_64)
--
-- Host: localhost    Database: simmo
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.21-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `course_lang_1` varchar(255) NOT NULL,
  `school` varchar(50) DEFAULT NULL,
  `area` varchar(25) NOT NULL,
  `country_lang_1` varchar(25) NOT NULL,
  `start_date` varchar(8) NOT NULL,
  `end_date` varchar(8) NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `course_lang_2` varchar(255) DEFAULT NULL,
  `course_lang_3` varchar(255) DEFAULT NULL,
  `course_lang_4` varchar(255) DEFAULT NULL,
  `country_lang_2` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `education`
--

DROP TABLE IF EXISTS `education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `courseId` int(3) DEFAULT NULL,
  `skill_lang_1` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `skill_lang_2` varchar(255) DEFAULT NULL,
  `skill_lang_3` varchar(255) DEFAULT NULL,
  `skill_lang_4` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `education_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employers`
--

DROP TABLE IF EXISTS `employers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employers` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `job_position_lang_1` varchar(50) DEFAULT NULL,
  `employer` varchar(255) NOT NULL,
  `area` varchar(25) NOT NULL,
  `country_lang_1` varchar(25) NOT NULL,
  `start_date` varchar(8) NOT NULL,
  `end_date` varchar(8) NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `job_position_lang_2` varchar(255) DEFAULT NULL,
  `job_position_lang_3` varchar(255) DEFAULT NULL,
  `job_position_lang_4` varchar(255) DEFAULT NULL,
  `country_lang_2` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employers_ibfk_1` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `global_language_translations`
--

DROP TABLE IF EXISTS `global_language_translations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_language_translations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `language_id` int(11) NOT NULL,
  `translation_code` varchar(10) NOT NULL,
  `translated_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `language_id` (`language_id`,`translation_code`),
  CONSTRAINT `global_language_translations_ibfk_1` FOREIGN KEY (`language_id`) REFERENCES `global_languages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14642 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `global_languages`
--

DROP TABLE IF EXISTS `global_languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_languages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `chatgpt_supported` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hard_skills`
--

DROP TABLE IF EXISTS `hard_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hard_skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `skill_lang_1` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `skill_lang_2` varchar(255) DEFAULT NULL,
  `skill_lang_3` varchar(255) DEFAULT NULL,
  `skill_lang_4` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `hard_skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `languages` (
  `id` int(2) NOT NULL AUTO_INCREMENT,
  `percentage` int(3) NOT NULL DEFAULT 100,
  `user_id` int(11) NOT NULL,
  `language_code` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `fk_languages_language` (`language_code`),
  CONSTRAINT `languages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `licenses`
--

DROP TABLE IF EXISTS `licenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `licenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `license_lang_1` varchar(255) NOT NULL,
  `description_lang_1` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `license_lang_2` varchar(255) DEFAULT NULL,
  `license_lang_3` varchar(255) DEFAULT NULL,
  `license_lang_4` varchar(255) DEFAULT NULL,
  `description_lang_2` varchar(255) DEFAULT NULL,
  `description_lang_3` varchar(255) DEFAULT NULL,
  `description_lang_4` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `licenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires` datetime NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resumes`
--

DROP TABLE IF EXISTS `resumes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resumes` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `title_lang_1` varchar(255) DEFAULT NULL,
  `last_updated` datetime(6) DEFAULT NULL,
  `grad_color_1` varchar(7) NOT NULL DEFAULT '#ffffff',
  `grad_color_2` varchar(7) NOT NULL DEFAULT '#ffffff',
  `background_color` varchar(7) NOT NULL DEFAULT '#ffffff',
  `bubble_color` varchar(7) NOT NULL DEFAULT '#ffffff',
  `hard_skills` varchar(255) DEFAULT NULL,
  `soft_skills` varchar(255) DEFAULT NULL,
  `languages` varchar(255) DEFAULT NULL,
  `licenses` varchar(255) DEFAULT NULL,
  `employers` varchar(255) DEFAULT NULL,
  `work_experience` varchar(1023) DEFAULT NULL,
  `courses` varchar(255) DEFAULT NULL,
  `education` varchar(511) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `title_lang_2` varchar(255) DEFAULT NULL,
  `title_lang_3` varchar(255) DEFAULT NULL,
  `title_lang_4` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `resumes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=235 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `soft_skills`
--

DROP TABLE IF EXISTS `soft_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `soft_skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `skill_lang_1` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `skill_lang_2` varchar(255) DEFAULT NULL,
  `skill_lang_3` varchar(255) DEFAULT NULL,
  `skill_lang_4` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `soft_skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_languages`
--

DROP TABLE IF EXISTS `user_languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_languages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `lang_1` varchar(10) NOT NULL,
  `lang_2` varchar(10) DEFAULT NULL,
  `lang_3` varchar(10) DEFAULT NULL,
  `lang_4` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_languages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_reports`
--

DROP TABLE IF EXISTS `user_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_reports` (
  `report_message` varchar(255) DEFAULT NULL,
  `user_id` int(10) NOT NULL,
  `report_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(25) NOT NULL,
  `country_code` varchar(3) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `street` varchar(50) DEFAULT NULL,
  `town` varchar(50) DEFAULT NULL,
  `post_code` varchar(10) DEFAULT NULL,
  `country_lang_1` varchar(255) DEFAULT NULL,
  `password` varchar(60) DEFAULT NULL,
  `date_joined` date DEFAULT current_timestamp(),
  `about_me_lang_1` text DEFAULT '',
  `img_path` varchar(255) DEFAULT '''''',
  `img_scale` float DEFAULT 1,
  `img_pos_x` float DEFAULT 0,
  `img_pos_y` float DEFAULT 0,
  `country_lang_2` varchar(255) DEFAULT NULL,
  `about_me_lang_2` text DEFAULT NULL,
  `about_me_lang_3` text DEFAULT NULL,
  `about_me_lang_4` text DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `work_experience`
--

DROP TABLE IF EXISTS `work_experience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_experience` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employerId` int(11) DEFAULT NULL,
  `skill_lang_1` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `skill_lang_2` varchar(255) DEFAULT NULL,
  `skill_lang_3` varchar(255) DEFAULT NULL,
  `skill_lang_4` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `work_experience_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=221 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-31 20:08:06
