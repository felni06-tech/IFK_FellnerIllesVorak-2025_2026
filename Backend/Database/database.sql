-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema ifk_projekt2526
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema ifk_projekt2526
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ifk_projekt2526` DEFAULT CHARACTER SET utf8 ;
USE `ifk_projekt2526` ;

-- -----------------------------------------------------
-- Table `ifk_projekt2526`.`providers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ifk_projekt2526`.`providers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `address` VARCHAR(255) NULL,
  `profession` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `avg_rating` DECIMAL(2,1) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ifk_projekt2526`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ifk_projekt2526`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `provider_id` INT NULL,
  `profile_picture` VARCHAR(255) NULL,
  `name` VARCHAR(100) NULL,
  `email` VARCHAR(100) NULL,
  `phone` VARCHAR(20) NULL,
  `password_hash` VARCHAR(255) NULL,
  `approved` TINYINT NULL DEFAULT 0,
  `reg_date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) ,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) ,
  INDEX `provider_id_idx` (`provider_id` ASC) ,
  CONSTRAINT `fk_users_provider_id`
    FOREIGN KEY (`provider_id`)
    REFERENCES `ifk_projekt2526`.`providers` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ifk_projekt2526`.`services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ifk_projekt2526`.`services` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NULL,
  `price` DECIMAL(10,2) NULL,
  `duration_minutes` INT NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ifk_projekt2526`.`provider_services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ifk_projekt2526`.`provider_services` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `provider_id` INT NULL,
  `service_id` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `provider_id_idx` (`provider_id` ASC) ,
  INDEX `service_id_idx` (`service_id` ASC) ,
  CONSTRAINT `fk_provider_services_provider_id`
    FOREIGN KEY (`provider_id`)
    REFERENCES `ifk_projekt2526`.`providers` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_provider_services_service_id`
    FOREIGN KEY (`service_id`)
    REFERENCES `ifk_projekt2526`.`services` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ifk_projekt2526`.`appointments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ifk_projekt2526`.`appointments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `provider_service_id` INT NULL,
  `user_id` INT NULL,
  `start_at` DATETIME NULL,
  `end_at` DATETIME NULL,
  `status` ENUM('available', 'booked', 'cancelled') NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `provider_service_id_idx` (`provider_service_id` ASC) ,
  INDEX ` client_id_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_appointments_provider_service_id`
    FOREIGN KEY (`provider_service_id`)
    REFERENCES `ifk_projekt2526`.`provider_services` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_appointments_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `ifk_projekt2526`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ifk_projekt2526`.`bookings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ifk_projekt2526`.`bookings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `appointment_id` INT NULL,
  `user_id` INT NULL,
  `date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('active', 'cancelled', 'completed') NULL,
  PRIMARY KEY (`id`),
  INDEX `appointment_id_idx` (`appointment_id` ASC) ,
  INDEX `client_id_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_bookings_appointment_id`
    FOREIGN KEY (`appointment_id`)
    REFERENCES `ifk_projekt2526`.`appointments` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_bookings_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `ifk_projekt2526`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ifk_projekt2526`.`reviews`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ifk_projekt2526`.`reviews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `provider_service_id` INT NULL,
  `user_id` INT NULL,
  `rating` INT NOT NULL COMMENT 'rating BETWEEN 1 AND 5',
  `comment` TEXT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `provider_service_id_idx` (`provider_service_id` ASC) ,
  INDEX `client_id_idx` (`user_id` ASC) ,
  CONSTRAINT `fk_reviews_provider_service_id`
    FOREIGN KEY (`provider_service_id`)
    REFERENCES `ifk_projekt2526`.`provider_services` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reviews_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `ifk_projekt2526`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ifk_projekt2526`.`admins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ifk_projekt2526`.`admins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NULL,
  `email` VARCHAR(100) NULL,
  `phone` VARCHAR(20) NULL,
  `password_hash` VARCHAR(255) NULL,
  `profile_picture` VARCHAR(255) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
