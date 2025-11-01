# Routine Management System

A comprehensive academic timetable management system built with Flask and PostgreSQL for educational institutions to efficiently generate, manage, and publish class schedules.

## 🎯 Features

### Core Functionality
- **Teacher Management** - Add, edit, and manage faculty information with department tracking
- **Subject Management** - Organize subjects with unique codes and descriptions
- **Class Management** - Handle class sections with room assignments and capacity
- **Time Slot Configuration** - Define weekly periods including break times
- **Timetable Creation** - Manual schedule creation with intelligent assignment

### Smart Scheduling
- **Intelligent Clash Detection**
  - Prevents teacher double-booking (same teacher at multiple locations)
  - Prevents class conflicts (same class with multiple subjects)
  - Prevents room conflicts (different classes using same physical room)
  
### Visualization & Export
- **Interactive Timetable Grid** - View schedules in an intuitive weekly grid format
- **Advanced Filtering** - Filter by class, teacher, or specific day
- **PDF Export** - Generate professional timetable PDFs for distribution
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Quick Start
1. Click the "Initialize Sample Data" button on the dashboard to populate the system with example data
2. Navigate through different sections using the top menu:
   - **Teachers** - Manage faculty members
   - **Subjects** - Configure course offerings
   - **Classes** - Set up class sections and rooms
   - **Time Slots** - Define your schedule structure
   - **Timetable** - Create and view schedules

### Creating a Timetable
1. Ensure you have added teachers, subjects, classes, and time slots
2. Go to the **Timetable** section
3. Click "Add Entry" to create a new schedule entry
4. Select the class, teacher, subject, day, and time slot
5. The system will automatically prevent scheduling conflicts
6. Save the entry to add it to the timetable

### Viewing & Exporting
1. Use the filter dropdowns to view specific timetables:
   - Filter by **Class** to see a class's complete schedule
   - Filter by **Teacher** to see a teacher's workload
   - Filter by **Day** to see a specific day's schedule
2. When viewing a class timetable, click "Export to PDF" to download

## 📊 Database Structure

The system uses PostgreSQL with the following models:

- **Teacher** - Faculty information (name, email, phone, department)
- **Subject** - Course details (code, name, description)
- **Class** - Section information (name, section, room, capacity)
- **TimeSlot** - Period definitions (day, start/end time, break flag)
- **TimetableEntry** - Schedule assignments linking all entities

## 🔒 Clash Detection

The system enforces three types of conflict prevention:

1. **Teacher Conflict** - A teacher cannot teach multiple classes simultaneously
2. **Class Conflict** - A class cannot have multiple subjects at the same time
3. **Room Conflict** - Different classes cannot use the same physical room simultaneously

## 🛠️ Technology Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Relational database
- **ReportLab** - PDF generation

### Frontend
- **Bootstrap 5** - Responsive UI framework
- **Font Awesome** - Icons
- **Vanilla JavaScript** - Interactive functionality

## 📝 API Endpoints

### Teachers
- `GET /api/teachers` - List all teachers
- `POST /api/teachers` - Create new teacher
- `GET /api/teachers/<id>` - Get teacher details
- `PUT /api/teachers/<id>` - Update teacher
- `DELETE /api/teachers/<id>` - Delete teacher

### Subjects
- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Create new subject
- `GET /api/subjects/<id>` - Get subject details
- `PUT /api/subjects/<id>` - Update subject
- `DELETE /api/subjects/<id>` - Delete subject

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create new class
- `GET /api/classes/<id>` - Get class details
- `PUT /api/classes/<id>` - Update class
- `DELETE /api/classes/<id>` - Delete class

### Time Slots
- `GET /api/timeslots` - List all time slots
- `POST /api/timeslots` - Create new time slot
- `GET /api/timeslots/<id>` - Get time slot details
- `PUT /api/timeslots/<id>` - Update time slot
- `DELETE /api/timeslots/<id>` - Delete time slot

### Timetable
- `GET /api/timetable` - List timetable entries (supports filtering)
- `POST /api/timetable` - Create new entry (with clash detection)
- `GET /api/timetable/<id>` - Get entry details
- `PUT /api/timetable/<id>` - Update entry (with clash detection)
- `DELETE /api/timetable/<id>` - Delete entry
- `GET /api/timetable/export/<class_id>` - Export class timetable as PDF

### Utilities
- `POST /api/init-sample-data` - Initialize sample data for testing

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Database schema design and relationships
- ✅ RESTful API implementation
- ✅ Automation logic (intelligent clash detection algorithms)
- ✅ UI/UX integration with backend systems
- ✅ CRUD operations with proper error handling
- ✅ PDF generation and reporting
- ✅ Responsive web design



---

**Built with Flask, PostgreSQL, and modern web technologies** 🚀
