# Routine Management System

## Overview
An academic timetable management system built with Flask and PostgreSQL that enables schools and educational institutions to generate, manage, and publish academic timetables with teacher-subject allocation and intelligent clash detection.

**Current State**: Fully functional MVP with complete CRUD operations, clash detection, timetable visualization, and PDF export capabilities.

## Recent Changes
- **2025-10-13**: Initial implementation completed
  - Set up Flask backend with PostgreSQL database
  - Implemented database models (Teacher, Subject, Class, TimeSlot, TimetableEntry)
  - Built RESTful API endpoints for all entities
  - Created intelligent clash detection for teacher, class, and room conflicts
  - Fixed room conflict detection to prevent different classes from using same room simultaneously
  - Developed responsive frontend with Bootstrap 5
  - Implemented timetable grid visualization with filtering
  - Added PDF export functionality using ReportLab
  - Included sample data initialization feature
  - All features tested and verified working correctly

## Project Architecture

### Backend (Flask + PostgreSQL)
- **Database Models**:
  - `Teacher`: Manages faculty information (name, email, phone, department)
  - `Subject`: Handles subject details (code, name, description)
  - `Class`: Stores class information (name, section, room, capacity)
  - `TimeSlot`: Defines time periods (day, start/end time, period name, break flag)
  - `TimetableEntry`: Links teachers, subjects, classes, and timeslots

- **API Endpoints**:
  - `/api/teachers` - CRUD operations for teachers
  - `/api/subjects` - CRUD operations for subjects
  - `/api/classes` - CRUD operations for classes
  - `/api/timeslots` - CRUD operations for time slots
  - `/api/timetable` - CRUD operations for timetable entries with filtering
  - `/api/timetable/export/<class_id>` - PDF export for specific class
  - `/api/init-sample-data` - Initialize sample data for testing

- **Clash Detection Logic**:
  - Prevents teacher double-booking (same teacher in multiple classes at same time)
  - Prevents room conflicts (same class with multiple subjects at same time)
  - Returns HTTP 409 with descriptive error messages on conflicts

### Frontend (HTML/CSS/JavaScript)
- **Technologies**: Bootstrap 5, Font Awesome, Vanilla JavaScript
- **Features**:
  - Dashboard with entity counts and quick start guide
  - CRUD interfaces for Teachers, Subjects, Classes, and Time Slots
  - Timetable creation with modal forms
  - Grid-based timetable visualization
  - Filtering by class, teacher, and day
  - Real-time clash detection alerts
  - PDF export button (appears when class is selected)

### File Structure
```
.
├── app.py                  # Main Flask application
├── templates/
│   └── index.html         # Single-page application template
├── static/
│   ├── css/
│   │   └── style.css      # Custom styles
│   └── js/
│       └── app.js         # Frontend JavaScript logic
├── .gitignore             # Python gitignore
└── replit.md             # Project documentation
```

## Features Implemented

### Core Features (MVP)
✅ Teacher management with department tracking
✅ Subject management with codes and descriptions
✅ Class/section management with room assignments
✅ Time slot configuration with break periods
✅ Manual timetable creation interface
✅ Intelligent clash detection (teacher & room conflicts)
✅ Timetable viewing with multiple filter options
✅ PDF export functionality
✅ Sample data initialization
✅ Responsive, academic-themed UI

### Clash Detection Rules
1. **Teacher Conflict**: A teacher cannot be assigned to multiple classes at the same time slot
2. **Room Conflict**: A class cannot have multiple subjects scheduled at the same time slot

### PDF Export Format
- Landscape A4 format
- Grid layout with days (Monday-Friday) as columns
- Time slots as rows
- Each cell shows: Subject code, Teacher name, and Room
- Professional styling with headers and borders

## User Workflow
1. **Setup Phase**:
   - Add teachers with their details
   - Create subjects with unique codes
   - Define classes with room assignments
   - Configure time slots for the week

2. **Timetable Creation**:
   - Navigate to Timetable section
   - Click "Add Entry" to create new assignments
   - Select class, teacher, subject, day, and time slot
   - System validates and prevents clashes automatically
   - Save successful entries

3. **Viewing & Export**:
   - Use filters to view specific timetables
   - Filter by class, teacher, or day
   - Export to PDF for printing/distribution

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `SESSION_SECRET`: Flask session secret key (auto-configured)

## Database Schema
The application uses PostgreSQL with SQLAlchemy ORM. All tables are created automatically on first run using `db.create_all()`.

**Relationships**:
- TimetableEntry → Teacher (many-to-one)
- TimetableEntry → Subject (many-to-one)
- TimetableEntry → Class (many-to-one)
- TimetableEntry → TimeSlot (many-to-one)

## Future Enhancements (Next Phase)
- Automated timetable generation algorithm using constraint satisfaction
- Teacher workload balancing and optimization
- Teacher preference system for time slots
- Timetable versioning and comparison
- Bulk import/export via Excel
- Email notifications for timetable changes
- Multi-semester support
- Advanced analytics and reporting

## Development Notes
- Using PostgreSQL instead of MySQL (Replit's built-in database)
- Development server runs on port 5000
- Debug mode enabled for development
- CORS enabled for API access
- Cascade delete configured for referential integrity

## User Preferences
None specified yet.

## Learning Outcomes Achieved
✅ Design automation logic (clash detection algorithms)
✅ Integrate UI/UX with backend systems (REST API + responsive frontend)
✅ Database schema design and relationships
✅ CRUD operations implementation
✅ PDF generation and reporting
