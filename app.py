from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, time
import os
from io import BytesIO
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

app = Flask(__name__)
CORS(app)

database_url = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'dev-secret-key')

db = SQLAlchemy(app)

class Teacher(db.Model):
    __tablename__ = 'teachers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True)
    phone = db.Column(db.String(20))
    department = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    timetable_entries = db.relationship('TimetableEntry', backref='teacher', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'department': self.department
        }

class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    timetable_entries = db.relationship('TimetableEntry', backref='subject', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description
        }

class Class(db.Model):
    __tablename__ = 'classes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    section = db.Column(db.String(10))
    room = db.Column(db.String(50))
    capacity = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    timetable_entries = db.relationship('TimetableEntry', backref='class_obj', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'section': self.section,
            'room': self.room,
            'capacity': self.capacity
        }

class TimeSlot(db.Model):
    __tablename__ = 'timeslots'
    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.String(20), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    period_name = db.Column(db.String(50))
    is_break = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    timetable_entries = db.relationship('TimetableEntry', backref='timeslot', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'day': self.day,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'period_name': self.period_name,
            'is_break': self.is_break
        }

class TimetableEntry(db.Model):
    __tablename__ = 'timetable_entries'
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    timeslot_id = db.Column(db.Integer, db.ForeignKey('timeslots.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.name if self.teacher else None,
            'subject_id': self.subject_id,
            'subject_name': self.subject.name if self.subject else None,
            'subject_code': self.subject.code if self.subject else None,
            'class_id': self.class_id,
            'class_name': f"{self.class_obj.name} {self.class_obj.section}" if self.class_obj else None,
            'room': self.class_obj.room if self.class_obj else None,
            'timeslot_id': self.timeslot_id,
            'day': self.timeslot.day if self.timeslot else None,
            'start_time': self.timeslot.start_time.strftime('%H:%M') if self.timeslot and self.timeslot.start_time else None,
            'end_time': self.timeslot.end_time.strftime('%H:%M') if self.timeslot and self.timeslot.end_time else None,
            'period_name': self.timeslot.period_name if self.timeslot else None
        }

def check_clash(teacher_id, timeslot_id, class_id, exclude_entry_id=None):
    query = TimetableEntry.query.filter_by(timeslot_id=timeslot_id)
    
    if exclude_entry_id:
        query = query.filter(TimetableEntry.id != exclude_entry_id)
    
    teacher_clash = query.filter_by(teacher_id=teacher_id).first()
    if teacher_clash:
        return {'clash': True, 'type': 'teacher', 'message': f'Teacher is already assigned at this time slot'}
    
    room_clash = query.filter_by(class_id=class_id).first()
    if room_clash:
        return {'clash': True, 'type': 'room', 'message': f'This class already has a subject scheduled at this time slot'}
    
    return {'clash': False}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/teachers', methods=['GET', 'POST'])
def teachers():
    if request.method == 'GET':
        teachers = Teacher.query.all()
        return jsonify([t.to_dict() for t in teachers])
    
    elif request.method == 'POST':
        data = request.json
        teacher = Teacher(
            name=data['name'],
            email=data.get('email'),
            phone=data.get('phone'),
            department=data.get('department')
        )
        db.session.add(teacher)
        db.session.commit()
        return jsonify(teacher.to_dict()), 201

@app.route('/api/teachers/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def teacher_detail(id):
    teacher = Teacher.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(teacher.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        teacher.name = data.get('name', teacher.name)
        teacher.email = data.get('email', teacher.email)
        teacher.phone = data.get('phone', teacher.phone)
        teacher.department = data.get('department', teacher.department)
        db.session.commit()
        return jsonify(teacher.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(teacher)
        db.session.commit()
        return '', 204

@app.route('/api/subjects', methods=['GET', 'POST'])
def subjects():
    if request.method == 'GET':
        subjects = Subject.query.all()
        return jsonify([s.to_dict() for s in subjects])
    
    elif request.method == 'POST':
        data = request.json
        subject = Subject(
            name=data['name'],
            code=data['code'],
            description=data.get('description')
        )
        db.session.add(subject)
        db.session.commit()
        return jsonify(subject.to_dict()), 201

@app.route('/api/subjects/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def subject_detail(id):
    subject = Subject.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(subject.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        subject.name = data.get('name', subject.name)
        subject.code = data.get('code', subject.code)
        subject.description = data.get('description', subject.description)
        db.session.commit()
        return jsonify(subject.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(subject)
        db.session.commit()
        return '', 204

@app.route('/api/classes', methods=['GET', 'POST'])
def classes():
    if request.method == 'GET':
        classes = Class.query.all()
        return jsonify([c.to_dict() for c in classes])
    
    elif request.method == 'POST':
        data = request.json
        class_obj = Class(
            name=data['name'],
            section=data.get('section'),
            room=data.get('room'),
            capacity=data.get('capacity')
        )
        db.session.add(class_obj)
        db.session.commit()
        return jsonify(class_obj.to_dict()), 201

@app.route('/api/classes/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def class_detail(id):
    class_obj = Class.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(class_obj.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        class_obj.name = data.get('name', class_obj.name)
        class_obj.section = data.get('section', class_obj.section)
        class_obj.room = data.get('room', class_obj.room)
        class_obj.capacity = data.get('capacity', class_obj.capacity)
        db.session.commit()
        return jsonify(class_obj.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(class_obj)
        db.session.commit()
        return '', 204

@app.route('/api/timeslots', methods=['GET', 'POST'])
def timeslots():
    if request.method == 'GET':
        timeslots = TimeSlot.query.order_by(TimeSlot.day, TimeSlot.start_time).all()
        return jsonify([t.to_dict() for t in timeslots])
    
    elif request.method == 'POST':
        data = request.json
        start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        
        timeslot = TimeSlot(
            day=data['day'],
            start_time=start_time,
            end_time=end_time,
            period_name=data.get('period_name'),
            is_break=data.get('is_break', False)
        )
        db.session.add(timeslot)
        db.session.commit()
        return jsonify(timeslot.to_dict()), 201

@app.route('/api/timeslots/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def timeslot_detail(id):
    timeslot = TimeSlot.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(timeslot.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        timeslot.day = data.get('day', timeslot.day)
        if 'start_time' in data:
            timeslot.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        if 'end_time' in data:
            timeslot.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        timeslot.period_name = data.get('period_name', timeslot.period_name)
        timeslot.is_break = data.get('is_break', timeslot.is_break)
        db.session.commit()
        return jsonify(timeslot.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(timeslot)
        db.session.commit()
        return '', 204

@app.route('/api/timetable', methods=['GET', 'POST'])
def timetable():
    if request.method == 'GET':
        class_id = request.args.get('class_id', type=int)
        teacher_id = request.args.get('teacher_id', type=int)
        day = request.args.get('day')
        
        query = TimetableEntry.query
        
        if class_id:
            query = query.filter_by(class_id=class_id)
        if teacher_id:
            query = query.filter_by(teacher_id=teacher_id)
        if day:
            query = query.join(TimeSlot).filter(TimeSlot.day == day)
        
        entries = query.all()
        return jsonify([e.to_dict() for e in entries])
    
    elif request.method == 'POST':
        data = request.json
        
        clash_result = check_clash(
            data['teacher_id'],
            data['timeslot_id'],
            data['class_id']
        )
        
        if clash_result['clash']:
            return jsonify(clash_result), 409
        
        entry = TimetableEntry(
            teacher_id=data['teacher_id'],
            subject_id=data['subject_id'],
            class_id=data['class_id'],
            timeslot_id=data['timeslot_id']
        )
        db.session.add(entry)
        db.session.commit()
        return jsonify(entry.to_dict()), 201

@app.route('/api/timetable/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def timetable_detail(id):
    entry = TimetableEntry.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(entry.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        
        clash_result = check_clash(
            data.get('teacher_id', entry.teacher_id),
            data.get('timeslot_id', entry.timeslot_id),
            data.get('class_id', entry.class_id),
            exclude_entry_id=id
        )
        
        if clash_result['clash']:
            return jsonify(clash_result), 409
        
        entry.teacher_id = data.get('teacher_id', entry.teacher_id)
        entry.subject_id = data.get('subject_id', entry.subject_id)
        entry.class_id = data.get('class_id', entry.class_id)
        entry.timeslot_id = data.get('timeslot_id', entry.timeslot_id)
        db.session.commit()
        return jsonify(entry.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(entry)
        db.session.commit()
        return '', 204

@app.route('/api/timetable/export/<int:class_id>')
def export_timetable(class_id):
    class_obj = Class.query.get_or_404(class_id)
    
    entries = TimetableEntry.query.filter_by(class_id=class_id).all()
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4))
    elements = []
    
    styles = getSampleStyleSheet()
    title = Paragraph(f"Timetable - {class_obj.name} {class_obj.section or ''}", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 0.3*inch))
    
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    timeslots = TimeSlot.query.filter(TimeSlot.is_break == False).order_by(TimeSlot.start_time).all()
    
    data = [['Time'] + days]
    
    for slot in timeslots:
        row = [f"{slot.start_time.strftime('%H:%M')}-{slot.end_time.strftime('%H:%M')}"]
        for day in days:
            entry = next((e for e in entries if e.timeslot.day == day and e.timeslot_id == slot.id), None)
            if entry:
                cell_text = f"{entry.subject.code}\n{entry.teacher.name}"
            else:
                cell_text = "-"
            row.append(cell_text)
        data.append(row)
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f'timetable_{class_obj.name}.pdf', mimetype='application/pdf')

@app.route('/api/init-sample-data', methods=['POST'])
def init_sample_data():
    teachers = [
        Teacher(name='Dr. John Smith', email='john@school.edu', department='Mathematics'),
        Teacher(name='Prof. Sarah Johnson', email='sarah@school.edu', department='Science'),
        Teacher(name='Ms. Emily Davis', email='emily@school.edu', department='English'),
        Teacher(name='Mr. Michael Brown', email='michael@school.edu', department='History'),
    ]
    db.session.add_all(teachers)
    
    subjects = [
        Subject(name='Mathematics', code='MATH101', description='Basic Mathematics'),
        Subject(name='Physics', code='PHY101', description='Introduction to Physics'),
        Subject(name='Chemistry', code='CHEM101', description='General Chemistry'),
        Subject(name='English', code='ENG101', description='English Literature'),
        Subject(name='History', code='HIST101', description='World History'),
    ]
    db.session.add_all(subjects)
    
    classes = [
        Class(name='Grade 10', section='A', room='Room 101', capacity=30),
        Class(name='Grade 10', section='B', room='Room 102', capacity=30),
        Class(name='Grade 11', section='A', room='Room 201', capacity=35),
    ]
    db.session.add_all(classes)
    
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    periods = [
        ('09:00', '10:00', 'Period 1'),
        ('10:00', '11:00', 'Period 2'),
        ('11:00', '11:15', 'Break', True),
        ('11:15', '12:15', 'Period 3'),
        ('12:15', '13:15', 'Period 4'),
        ('13:15', '14:00', 'Lunch', True),
        ('14:00', '15:00', 'Period 5'),
    ]
    
    for day in days:
        for period in periods:
            start_time = datetime.strptime(period[0], '%H:%M').time()
            end_time = datetime.strptime(period[1], '%H:%M').time()
            is_break = period[3] if len(period) > 3 else False
            
            timeslot = TimeSlot(
                day=day,
                start_time=start_time,
                end_time=end_time,
                period_name=period[2],
                is_break=is_break
            )
            db.session.add(timeslot)
    
    db.session.commit()
    return jsonify({'message': 'Sample data initialized successfully'}), 201

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
