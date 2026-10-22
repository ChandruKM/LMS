@echo off
title LMS Spring Boot Backend (Port 8081)
color 0A
cd /d "%~dp0\backend"
echo ======================================================================
echo           STARTING LMS JAVA SPRING BOOT BACKEND (PORT 8081)
echo ======================================================================
echo MySQL Database: lms_db (Port 3306)
echo Backend API:    http://localhost:8081/api
echo.
mvnw.cmd spring-boot:run
pause
