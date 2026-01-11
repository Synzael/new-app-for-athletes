@echo off
REM Commit script for Athlete Recruiting & NIL Showcase Platform transformation
REM This script stages all changes and commits them to git

echo ============================================
echo  Athlete Recruiting Platform - Commit Script
echo ============================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not a git repository!
    exit /b 1
)

echo Current branch:
git branch --show-current
echo.

echo Checking git status...
git status --short
echo.

REM Ask for confirmation
set /p confirm="Do you want to stage and commit all changes? (y/n): "
if /i not "%confirm%"=="y" (
    echo Commit cancelled.
    exit /b 0
)

echo.
echo Staging all changes...
git add -A

echo.
echo Creating commit...
git commit -m "Transform GraphQL Airbnb clone to REST API Athlete Recruiting Platform" -m "Major Changes:" -m "- Replaced GraphQL with Express REST API" -m "- Added Athlete, PerformanceStat, and Video entities" -m "- Implemented weighted star rating system (1-5 stars)" -m "- Added user roles: ATHLETE, COACH, BRAND, ADMIN" -m "- Created comprehensive API endpoints for athletes, ratings, auth" -m "- Added middleware: auth, role-based access, validation, error handling" -m "- Converted frontend controllers from Apollo/GraphQL to Axios/REST" -m "- Created AthleteDirectory and AthleteProfile UI components" -m "- Added rating.service.ts with weighted algorithm" -m "- Created .env.example and updated README.md" -m "" -m "API Endpoints:" -m "- POST/GET /api/v1/auth/* (register, login, logout, password reset)" -m "- GET/POST/PUT/DELETE /api/v1/athletes/* (CRUD + search)" -m "- GET/PUT/POST /api/v1/ratings/* (rating breakdown, update, recalculate)" -m "" -m "Rating Algorithm:" -m "- Performance: 40%%" -m "- Physical: 20%%" -m "- Academic: 15%%" -m "- Social: 15%%" -m "- Evaluation: 10%%"

if errorlevel 1 (
    echo.
    echo ERROR: Commit failed!
    exit /b 1
)

echo.
echo ============================================
echo  Commit successful!
echo ============================================
echo.

echo Latest commit:
git log -1 --oneline
echo.

set /p push="Do you want to push to remote? (y/n): "
if /i "%push%"=="y" (
    echo Pushing to remote...
    git push
    if errorlevel 1 (
        echo ERROR: Push failed!
        exit /b 1
    )
    echo Push successful!
) else (
    echo.
    echo To push later, run: git push
)

echo.
echo Done!
