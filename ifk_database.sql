SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Create schema
CREATE SCHEMA IF NOT EXISTS `ifk_projekt2526` DEFAULT CHARACTER SET utf8;
USE `ifk_projekt2526`;

-- USERS
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `profile_type` ENUM('admin', 'provider', 'client') NULL,
  `profile_picture` VARCHAR(255) NULL,
  `name` VARCHAR(100) NULL,
  `email` VARCHAR(100) NULL,
  `phone` VARCHAR(20) NULL,
  `password_hash` VARCHAR(255) NULL,
  `approved` TINYINT NULL DEFAULT 0,
  `registration_date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE (`email`)
) ENGINE=InnoDB;

-- PROVIDERS
CREATE TABLE IF NOT EXISTS `providers` (
  `provider_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `address` VARCHAR(255) NULL,
  `profession` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `avg_rating` DECIMAL(2,1) NULL,
  PRIMARY KEY (`provider_id`),
  INDEX `user_id_idx` (`user_id`),
  CONSTRAINT `fk_providers_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- SERVICES
CREATE TABLE IF NOT EXISTS `services` (
  `service_id` INT NOT NULL AUTO_INCREMENT,
  `service_name` VARCHAR(100) NULL,
  `category` VARCHAR(50) NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB;

-- PROVIDER_SERVICES
CREATE TABLE IF NOT EXISTS `provider_services` (
  `provider_service_id` INT NOT NULL AUTO_INCREMENT,
  `provider_id` INT NULL,
  `service_id` INT NULL,
  `price` DECIMAL(10,2) NULL,
  `duration_minutes` INT NULL,
  `details` TEXT NULL,
  PRIMARY KEY (`provider_service_id`),
  INDEX `provider_id_idx` (`provider_id`),
  INDEX `service_id_idx` (`service_id`),
  CONSTRAINT `fk_provider_services_provider_id`
    FOREIGN KEY (`provider_id`)
    REFERENCES `providers` (`provider_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_provider_services_service_id`
    FOREIGN KEY (`service_id`)
    REFERENCES `services` (`service_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS `appointments` (
  `appointment_id` INT NOT NULL AUTO_INCREMENT,
  `provider_service_id` INT NULL,
  `client_id` INT NULL,
  `start_time` DATETIME NULL,
  `end_time` DATETIME NULL,
  `status` ENUM('available', 'booked', 'cancelled') NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  INDEX `provider_service_id_idx` (`provider_service_id`),
  INDEX `client_id_idx` (`client_id`),
  CONSTRAINT `fk_appointments_provider_service_id`
    FOREIGN KEY (`provider_service_id`)
    REFERENCES `provider_services` (`provider_service_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_appointments_client_id`
    FOREIGN KEY (`client_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- BOOKINGS
CREATE TABLE IF NOT EXISTS `bookings` (
  `booking_id` INT NOT NULL AUTO_INCREMENT,
  `appointment_id` INT NULL,
  `client_id` INT NULL,
  `booking_date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('active', 'cancelled', 'completed') NULL,
  PRIMARY KEY (`booking_id`),
  INDEX `appointment_id_idx` (`appointment_id`),
  INDEX `client_id_idx` (`client_id`),
  CONSTRAINT `fk_bookings_appointment_id`
    FOREIGN KEY (`appointment_id`)
    REFERENCES `appointments` (`appointment_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_bookings_client_id`
    FOREIGN KEY (`client_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

-- REVIEWS
CREATE TABLE IF NOT EXISTS `reviews` (
  `review_id` INT NOT NULL AUTO_INCREMENT,
  `provider_service_id` INT NULL,
  `client_id` INT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  INDEX `provider_service_id_idx` (`provider_service_id`),
  INDEX `client_id_idx` (`client_id`),
  CONSTRAINT `fk_reviews_provider_service_id`
    FOREIGN KEY (`provider_service_id`)
    REFERENCES `provider_services` (`provider_service_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reviews_client_id`
    FOREIGN KEY (`client_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;