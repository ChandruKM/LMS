@echo off
title Launching LMS System (Backend + Frontend)
color 0B
echo ======================================================================
echo                LAUNCHING FULL LMS APPLICATION STACK
echo ======================================================================
echo 1. Starting Java Spring Boot Backend on Port 8081...
start "LMS Backend [Port 8081]" cmd /k "cd /d %~dp0\backend && mvnw.cmd spring-boot:run"

echo 2. Starting Next.js Frontend on Port 3000...
start "LMS Frontend [Port 3000]" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ======================================================================
echo Both servers have been launched in separate windows!
echo - Frontend URL: http://localhost:3000
echo - Backend URL:  http://localhost:8081
echo ======================================================================
timeout /t 5
