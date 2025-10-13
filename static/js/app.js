let teachers = [];
let subjects = [];
let classes = [];
let timeslots = [];
let timetableEntries = [];

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(section).style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
    
    if (section === 'dashboard') {
        loadDashboard();
    } else if (section === 'teachers') {
        loadTeachers();
    } else if (section === 'subjects') {
        loadSubjects();
    } else if (section === 'classes') {
        loadClasses();
    } else if (section === 'timeslots') {
        loadTimeslots();
    } else if (section === 'timetable') {
        loadTimetable();
    }
}

async function loadDashboard() {
    try {
        const [teachersRes, subjectsRes, classesRes, entriesRes] = await Promise.all([
            fetch('/api/teachers'),
            fetch('/api/subjects'),
            fetch('/api/classes'),
            fetch('/api/timetable')
        ]);
        
        const teachersData = await teachersRes.json();
        const subjectsData = await subjectsRes.json();
        const classesData = await classesRes.json();
        const entriesData = await entriesRes.json();
        
        document.getElementById('teacherCount').textContent = teachersData.length;
        document.getElementById('subjectCount').textContent = subjectsData.length;
        document.getElementById('classCount').textContent = classesData.length;
        document.getElementById('entryCount').textContent = entriesData.length;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function initializeSampleData() {
    if (confirm('This will initialize sample data. Continue?')) {
        try {
            const response = await fetch('/api/init-sample-data', { method: 'POST' });
            if (response.ok) {
                alert('Sample data initialized successfully!');
                loadDashboard();
            }
        } catch (error) {
            console.error('Error initializing sample data:', error);
            alert('Error initializing sample data');
        }
    }
}

async function loadTeachers() {
    try {
        const response = await fetch('/api/teachers');
        teachers = await response.json();
        
        const tbody = document.getElementById('teachersList');
        tbody.innerHTML = teachers.map(t => `
            <tr>
                <td>${t.name}</td>
                <td>${t.email || '-'}</td>
                <td>${t.phone || '-'}</td>
                <td>${t.department || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-action" onclick="editTeacher(${t.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteTeacher(${t.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

function showAddTeacherModal() {
    document.getElementById('teacherForm').reset();
    document.getElementById('teacherId').value = '';
    document.querySelector('#teacherModal .modal-title').textContent = 'Add Teacher';
    new bootstrap.Modal(document.getElementById('teacherModal')).show();
}

async function editTeacher(id) {
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
        document.getElementById('teacherId').value = teacher.id;
        document.getElementById('teacherName').value = teacher.name;
        document.getElementById('teacherEmail').value = teacher.email || '';
        document.getElementById('teacherPhone').value = teacher.phone || '';
        document.getElementById('teacherDepartment').value = teacher.department || '';
        document.querySelector('#teacherModal .modal-title').textContent = 'Edit Teacher';
        new bootstrap.Modal(document.getElementById('teacherModal')).show();
    }
}

async function saveTeacher() {
    const id = document.getElementById('teacherId').value;
    const data = {
        name: document.getElementById('teacherName').value,
        email: document.getElementById('teacherEmail').value,
        phone: document.getElementById('teacherPhone').value,
        department: document.getElementById('teacherDepartment').value
    };
    
    try {
        const url = id ? `/api/teachers/${id}` : '/api/teachers';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('teacherModal')).hide();
            loadTeachers();
        }
    } catch (error) {
        console.error('Error saving teacher:', error);
    }
}

async function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        try {
            const response = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadTeachers();
            }
        } catch (error) {
            console.error('Error deleting teacher:', error);
        }
    }
}

async function loadSubjects() {
    try {
        const response = await fetch('/api/subjects');
        subjects = await response.json();
        
        const tbody = document.getElementById('subjectsList');
        tbody.innerHTML = subjects.map(s => `
            <tr>
                <td>${s.code}</td>
                <td>${s.name}</td>
                <td>${s.description || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-action" onclick="editSubject(${s.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteSubject(${s.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

function showAddSubjectModal() {
    document.getElementById('subjectForm').reset();
    document.getElementById('subjectId').value = '';
    document.querySelector('#subjectModal .modal-title').textContent = 'Add Subject';
    new bootstrap.Modal(document.getElementById('subjectModal')).show();
}

async function editSubject(id) {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
        document.getElementById('subjectId').value = subject.id;
        document.getElementById('subjectCode').value = subject.code;
        document.getElementById('subjectName').value = subject.name;
        document.getElementById('subjectDescription').value = subject.description || '';
        document.querySelector('#subjectModal .modal-title').textContent = 'Edit Subject';
        new bootstrap.Modal(document.getElementById('subjectModal')).show();
    }
}

async function saveSubject() {
    const id = document.getElementById('subjectId').value;
    const data = {
        code: document.getElementById('subjectCode').value,
        name: document.getElementById('subjectName').value,
        description: document.getElementById('subjectDescription').value
    };
    
    try {
        const url = id ? `/api/subjects/${id}` : '/api/subjects';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('subjectModal')).hide();
            loadSubjects();
        }
    } catch (error) {
        console.error('Error saving subject:', error);
    }
}

async function deleteSubject(id) {
    if (confirm('Are you sure you want to delete this subject?')) {
        try {
            const response = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadSubjects();
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
        }
    }
}

async function loadClasses() {
    try {
        const response = await fetch('/api/classes');
        classes = await response.json();
        
        const tbody = document.getElementById('classesList');
        tbody.innerHTML = classes.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.section || '-'}</td>
                <td>${c.room || '-'}</td>
                <td>${c.capacity || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-action" onclick="editClass(${c.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteClass(${c.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

function showAddClassModal() {
    document.getElementById('classForm').reset();
    document.getElementById('classId').value = '';
    document.querySelector('#classModal .modal-title').textContent = 'Add Class';
    new bootstrap.Modal(document.getElementById('classModal')).show();
}

async function editClass(id) {
    const classObj = classes.find(c => c.id === id);
    if (classObj) {
        document.getElementById('classId').value = classObj.id;
        document.getElementById('className').value = classObj.name;
        document.getElementById('classSection').value = classObj.section || '';
        document.getElementById('classRoom').value = classObj.room || '';
        document.getElementById('classCapacity').value = classObj.capacity || '';
        document.querySelector('#classModal .modal-title').textContent = 'Edit Class';
        new bootstrap.Modal(document.getElementById('classModal')).show();
    }
}

async function saveClass() {
    const id = document.getElementById('classId').value;
    const data = {
        name: document.getElementById('className').value,
        section: document.getElementById('classSection').value,
        room: document.getElementById('classRoom').value,
        capacity: parseInt(document.getElementById('classCapacity').value) || null
    };
    
    try {
        const url = id ? `/api/classes/${id}` : '/api/classes';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('classModal')).hide();
            loadClasses();
        }
    } catch (error) {
        console.error('Error saving class:', error);
    }
}

async function deleteClass(id) {
    if (confirm('Are you sure you want to delete this class?')) {
        try {
            const response = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadClasses();
            }
        } catch (error) {
            console.error('Error deleting class:', error);
        }
    }
}

async function loadTimeslots() {
    try {
        const response = await fetch('/api/timeslots');
        timeslots = await response.json();
        
        const tbody = document.getElementById('timeslotsList');
        tbody.innerHTML = timeslots.map(t => `
            <tr>
                <td>${t.day}</td>
                <td>${t.period_name || '-'}</td>
                <td>${t.start_time}</td>
                <td>${t.end_time}</td>
                <td>${t.is_break ? '<span class="badge bg-warning">Yes</span>' : 'No'}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-action" onclick="editTimeslot(${t.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteTimeslot(${t.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading timeslots:', error);
    }
}

function showAddTimeslotModal() {
    document.getElementById('timeslotForm').reset();
    document.getElementById('timeslotId').value = '';
    document.querySelector('#timeslotModal .modal-title').textContent = 'Add Time Slot';
    new bootstrap.Modal(document.getElementById('timeslotModal')).show();
}

async function editTimeslot(id) {
    const timeslot = timeslots.find(t => t.id === id);
    if (timeslot) {
        document.getElementById('timeslotId').value = timeslot.id;
        document.getElementById('timeslotDay').value = timeslot.day;
        document.getElementById('timeslotPeriod').value = timeslot.period_name || '';
        document.getElementById('timeslotStart').value = timeslot.start_time;
        document.getElementById('timeslotEnd').value = timeslot.end_time;
        document.getElementById('timeslotBreak').checked = timeslot.is_break;
        document.querySelector('#timeslotModal .modal-title').textContent = 'Edit Time Slot';
        new bootstrap.Modal(document.getElementById('timeslotModal')).show();
    }
}

async function saveTimeslot() {
    const id = document.getElementById('timeslotId').value;
    const data = {
        day: document.getElementById('timeslotDay').value,
        period_name: document.getElementById('timeslotPeriod').value,
        start_time: document.getElementById('timeslotStart').value,
        end_time: document.getElementById('timeslotEnd').value,
        is_break: document.getElementById('timeslotBreak').checked
    };
    
    try {
        const url = id ? `/api/timeslots/${id}` : '/api/timeslots';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('timeslotModal')).hide();
            loadTimeslots();
        }
    } catch (error) {
        console.error('Error saving timeslot:', error);
    }
}

async function deleteTimeslot(id) {
    if (confirm('Are you sure you want to delete this time slot?')) {
        try {
            const response = await fetch(`/api/timeslots/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadTimeslots();
            }
        } catch (error) {
            console.error('Error deleting timeslot:', error);
        }
    }
}

async function loadTimetable() {
    await Promise.all([
        loadTeachersForFilter(),
        loadClassesForFilter(),
        loadTimeslotsData(),
        loadTimetableEntries()
    ]);
}

async function loadTeachersForFilter() {
    const response = await fetch('/api/teachers');
    teachers = await response.json();
    
    const select = document.getElementById('filterTeacher');
    select.innerHTML = '<option value="">All Teachers</option>' + 
        teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
}

async function loadClassesForFilter() {
    const response = await fetch('/api/classes');
    classes = await response.json();
    
    const select = document.getElementById('filterClass');
    select.innerHTML = '<option value="">All Classes</option>' + 
        classes.map(c => `<option value="${c.id}">${c.name} ${c.section || ''}</option>`).join('');
}

async function loadTimeslotsData() {
    const response = await fetch('/api/timeslots');
    timeslots = await response.json();
}

async function loadTimetableEntries() {
    try {
        const classId = document.getElementById('filterClass').value;
        const teacherId = document.getElementById('filterTeacher').value;
        const day = document.getElementById('filterDay').value;
        
        let url = '/api/timetable?';
        if (classId) url += `class_id=${classId}&`;
        if (teacherId) url += `teacher_id=${teacherId}&`;
        if (day) url += `day=${day}&`;
        
        const response = await fetch(url);
        timetableEntries = await response.json();
        
        renderTimetableGrid();
    } catch (error) {
        console.error('Error loading timetable entries:', error);
    }
}

function renderTimetableGrid() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = timeslots.filter(t => !t.is_break);
    
    let html = '<div class="timetable-grid"><table class="table table-bordered timetable-table">';
    html += '<thead><tr><th>Time</th>';
    
    days.forEach(day => {
        html += `<th>${day}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    periods.forEach(period => {
        html += `<tr><td><strong>${period.start_time} - ${period.end_time}</strong><br><small>${period.period_name || ''}</small></td>`;
        
        days.forEach(day => {
            const dayPeriods = timeslots.filter(t => t.day === day && t.start_time === period.start_time);
            
            if (dayPeriods.length > 0) {
                const slot = dayPeriods[0];
                const entries = timetableEntries.filter(e => e.timeslot_id === slot.id);
                
                html += '<td class="timetable-cell">';
                entries.forEach(entry => {
                    html += `
                        <div class="timetable-entry">
                            <div class="entry-subject">${entry.subject_code} - ${entry.subject_name}</div>
                            <div class="entry-teacher"><i class="fas fa-user"></i> ${entry.teacher_name}</div>
                            <div class="entry-room"><i class="fas fa-door-open"></i> ${entry.class_name} (${entry.room || 'N/A'})</div>
                            <div class="mt-1">
                                <button class="btn btn-xs btn-sm btn-primary btn-action" onclick="editEntry(${entry.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-xs btn-sm btn-danger btn-action" onclick="deleteEntry(${entry.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
                html += '</td>';
            } else {
                html += '<td class="timetable-cell">-</td>';
            }
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    
    const classId = document.getElementById('filterClass').value;
    if (classId) {
        html += `<button class="btn btn-success export-btn" onclick="exportTimetable(${classId})">
            <i class="fas fa-file-pdf"></i> Export to PDF
        </button>`;
    }
    
    document.getElementById('timetableView').innerHTML = html;
}

async function showAddEntryModal() {
    await Promise.all([
        loadDropdownData()
    ]);
    
    document.getElementById('entryForm').reset();
    document.getElementById('entryId').value = '';
    document.getElementById('clashAlert').style.display = 'none';
    document.querySelector('#entryModal .modal-title').textContent = 'Add Timetable Entry';
    new bootstrap.Modal(document.getElementById('entryModal')).show();
}

async function loadDropdownData() {
    const [teachersRes, subjectsRes, classesRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch('/api/subjects'),
        fetch('/api/classes')
    ]);
    
    teachers = await teachersRes.json();
    subjects = await subjectsRes.json();
    classes = await classesRes.json();
    
    document.getElementById('entryTeacher').innerHTML = '<option value="">Select Teacher</option>' +
        teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    
    document.getElementById('entrySubject').innerHTML = '<option value="">Select Subject</option>' +
        subjects.map(s => `<option value="${s.id}">${s.code} - ${s.name}</option>`).join('');
    
    document.getElementById('entryClass').innerHTML = '<option value="">Select Class</option>' +
        classes.map(c => `<option value="${c.id}">${c.name} ${c.section || ''}</option>`).join('');
}

async function loadTimeslotsForDay() {
    const day = document.getElementById('entryDay').value;
    if (!day) {
        document.getElementById('entryTimeslot').innerHTML = '<option value="">Select Time Slot</option>';
        return;
    }
    
    const response = await fetch('/api/timeslots');
    const allSlots = await response.json();
    const daySlots = allSlots.filter(t => t.day === day && !t.is_break);
    
    document.getElementById('entryTimeslot').innerHTML = '<option value="">Select Time Slot</option>' +
        daySlots.map(t => `<option value="${t.id}">${t.start_time} - ${t.end_time} (${t.period_name || ''})</option>`).join('');
}

async function saveEntry() {
    const id = document.getElementById('entryId').value;
    const data = {
        teacher_id: parseInt(document.getElementById('entryTeacher').value),
        subject_id: parseInt(document.getElementById('entrySubject').value),
        class_id: parseInt(document.getElementById('entryClass').value),
        timeslot_id: parseInt(document.getElementById('entryTimeslot').value)
    };
    
    try {
        const url = id ? `/api/timetable/${id}` : '/api/timetable';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.status === 409) {
            const result = await response.json();
            document.getElementById('clashAlert').textContent = result.message;
            document.getElementById('clashAlert').style.display = 'block';
            return;
        }
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('entryModal')).hide();
            loadTimetableEntries();
        }
    } catch (error) {
        console.error('Error saving entry:', error);
    }
}

async function editEntry(id) {
    const entry = timetableEntries.find(e => e.id === id);
    if (entry) {
        await loadDropdownData();
        
        document.getElementById('entryId').value = entry.id;
        document.getElementById('entryClass').value = entry.class_id;
        document.getElementById('entryTeacher').value = entry.teacher_id;
        document.getElementById('entrySubject').value = entry.subject_id;
        document.getElementById('entryDay').value = entry.day;
        
        await loadTimeslotsForDay();
        document.getElementById('entryTimeslot').value = entry.timeslot_id;
        
        document.getElementById('clashAlert').style.display = 'none';
        document.querySelector('#entryModal .modal-title').textContent = 'Edit Timetable Entry';
        new bootstrap.Modal(document.getElementById('entryModal')).show();
    }
}

async function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        try {
            const response = await fetch(`/api/timetable/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadTimetableEntries();
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    }
}

function exportTimetable(classId) {
    window.open(`/api/timetable/export/${classId}`, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
