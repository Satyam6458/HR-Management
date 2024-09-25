require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 5000; // Use environment port if available
const SECRET_KEY = process.env.SECRET_KEY;
const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static('uploads'));

// MySQL connection
const db = mysql.createConnection({
  port: process.env.PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

app.use(cors());
app.use(bodyParser.json());

// User signup
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  // Insert user into the database (storing password as plain text, not recommended)
  db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password],
    (err, results) => {
      if (err) {
        console.error('Error during signup:', err);
        return res.status(500).json({ success: false, message: 'Signup failed' });
      }
      res.status(201).json({ success: true, message: 'Signup successful' });
    }
  );
});

// User login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Fetch user from the database
  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, results) => {
      if (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ success: false, message: 'Login failed' });
      }
      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      const user = results[0];
      // Check if the entered password matches the stored password
      if (password !== user.password) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }

      // Generate a token
      const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });

      res.status(200).json({ success: true, message: 'Login successful', token });
    }
  );
});

// Get all employees
app.get('/employees', (req, res) => {
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch employees' });
    }
    res.status(200).json(results);
  });
});

// Get an employee by ID
app.get('/employees/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM employees WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching employee:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch employee' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json(results[0]);
  });
});

// Add a new employee
app.post('/employees', (req, res) => {
  const { name, position, email, phone, department, password } = req.body;
  db.query(
    'INSERT INTO employees (name, position, email, phone, department, password) VALUES (?, ?, ?, ?, ?, ?)',
    [name, position, email, phone, department, password],
    (err, results) => {
      if (err) {
        console.error('Error adding employee:', err);
        return res.status(500).json({ success: false, message: 'Failed to add employee' });
      }
      res.status(201).json({ success: true, message: 'Employee added successfully' });
    }
  );
});

// Update an employee
app.put('/employees/:id', (req, res) => {
  const { id } = req.params;
  const { name, position, email, phone, department, password } = req.body;
  db.query(
    'UPDATE employees SET name = ?, position = ?, email = ?, phone = ?, department = ?, password = ? WHERE id = ?',
    [name, position, email, phone, department, password, id],
    (err, results) => {
      if (err) {
        console.error('Error updating employee:', err);
        return res.status(500).json({ success: false, message: 'Failed to update employee' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      res.status(200).json({ success: true, message: 'Employee updated successfully' });
    }
  );
});

// Delete an employee
app.delete('/employees/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM employees WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error deleting employee:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete employee' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  });
});
// Departments Code
app.get('/departments', (req, res) => {
  db.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch departments' });
    }
    res.status(200).json(results);
  });
});
app.post('/departments', (req, res) => {
  const { name, description } = req.body;
  db.query(
    'INSERT INTO departments (name, description) VALUES (?, ?)',
    [name, description],
    (err, results) => {
      if (err) {
        console.error('Error adding department:', err);
        return res.status(500).json({ success: false, message: 'Failed to add department' });
      }
      res.status(201).json({ success: true, message: 'Department added successfully' });
    }
  );
});
app.put('/departments/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  db.query(
    'UPDATE departments SET name = ?, description = ? WHERE id = ?',
    [name, description, id],
    (err, results) => {
      if (err) {
        console.error('Error updating department:', err);
        return res.status(500).json({ success: false, message: 'Failed to update department' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Department not found' });
      }
      res.status(200).json({ success: true, message: 'Department updated successfully' });
    }
  );
});
app.delete('/departments/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM departments WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error deleting department:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete department' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  });
});
// Positions Code

app.get('/positions', (req, res) => {
  db.query('SELECT * FROM positions', (err, results) => {
    if (err) {
      console.error('Error fetching positions:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch positions' });
    }
    res.status(200).json(results);
  });
});
app.post('/positions', (req, res) => {
  const { name, description } = req.body;
  db.query(
    'INSERT INTO positions (name, description) VALUES (?, ?)',
    [name, description],
    (err, results) => {
      if (err) {
        console.error('Error adding position:', err);
        return res.status(500).json({ success: false, message: 'Failed to add position' });
      }
      res.status(201).json({ success: true, message: 'Position added successfully' });
    }
  );
});

app.put('/positions/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  db.query(
    'UPDATE positions SET name = ?, description = ? WHERE id = ?',
    [name, description, id],
    (err, results) => {
      if (err) {
        console.error('Error updating position:', err);
        return res.status(500).json({ success: false, message: 'Failed to update position' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Position not found' });
      }
      res.status(200).json({ success: true, message: 'Position updated successfully' });
    }
  );
});
app.delete('/positions/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM positions WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error deleting position:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete position' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Position not found' });
    }
    res.status(200).json({ success: true, message: 'Position deleted successfully' });
  });
});
// Other imports and configurations...

// Get all holidays
app.get('/holidays', (req, res) => {
  db.query('SELECT * FROM holidays', (err, results) => {
    if (err) {
      console.error('Error fetching holidays:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch holidays' });
    }
    res.status(200).json(results);
  });
});

// Get a holiday by ID
app.get('/holidays/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM holidays WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching holiday:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch holiday' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }
    res.status(200).json(results[0]);
  });
});

// Add a new holiday
app.post('/holidays', (req, res) => {
  const { name, date, description } = req.body;
  db.query(
    'INSERT INTO holidays (name, date, description) VALUES (?, ?, ?)',
    [name, date, description],
    (err, results) => {
      if (err) {
        console.error('Error adding holiday:', err);
        return res.status(500).json({ success: false, message: 'Failed to add holiday' });
      }
      res.status(201).json({ success: true, message: 'Holiday added successfully' });
    }
  );
});

// Update a holiday
app.put('/holidays/:id', (req, res) => {
  const { id } = req.params;
  const { name, date, description } = req.body;
  db.query(
    'UPDATE holidays SET name = ?, date = ?, description = ? WHERE id = ?',
    [name, date, description, id],
    (err, results) => {
      if (err) {
        console.error('Error updating holiday:', err);
        return res.status(500).json({ success: false, message: 'Failed to update holiday' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Holiday not found' });
      }
      res.status(200).json({ success: true, message: 'Holiday updated successfully' });
    }
  );
});

// Delete a holiday
app.delete('/holidays/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM holidays WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error deleting holiday:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete holiday' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }
    res.status(200).json({ success: true, message: 'Holiday deleted successfully' });
  });
});
// Get all leave types
app.get('/leave-types', (req, res) => {
  db.query('SELECT * FROM leave_types', (err, results) => {
    if (err) {
      console.error('Error fetching leave types:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch leave types' });
    }
    res.status(200).json(results);
  });
});

// Get a leave type by ID
app.get('/leave-types/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM leave_types WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching leave type:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch leave type' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }
    res.status(200).json(results[0]);
  });
});

// Add a new leave type
app.post('/leave-types', (req, res) => {
  const { name, description } = req.body;
  db.query(
    'INSERT INTO leave_types (name, description) VALUES (?, ?)',
    [name, description],
    (err, results) => {
      if (err) {
        console.error('Error adding leave type:', err);
        return res.status(500).json({ success: false, message: 'Failed to add leave type' });
      }
      res.status(201).json({ success: true, message: 'Leave type added successfully' });
    }
  );
});

// Update a leave type
app.put('/leave-types/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  db.query(
    'UPDATE leave_types SET name = ?, description = ? WHERE id = ?',
    [name, description, id],
    (err, results) => {
      if (err) {
        console.error('Error updating leave type:', err);
        return res.status(500).json({ success: false, message: 'Failed to update leave type' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Leave type not found' });
      }
      res.status(200).json({ success: true, message: 'Leave type updated successfully' });
    }
  );
});

// Delete a leave type
app.delete('/leave-types/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM leave_types WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error deleting leave type:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete leave type' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }
    res.status(200).json({ success: true, message: 'Leave type deleted successfully' });
  });
});
// Employee login
app.post('/employeelogin', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM employees WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) {
      console.error('Error logging in:', err);
      return res.status(500).json({ success: false, message: 'Failed to login' });
    }
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.status(200).json({ success: true, employee: results[0] });
  });
});
// Fetch profile
app.get('/profile/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM employees WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
    if (results.length === 0) {
      console.log('Profile not found for ID:', id);
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    // Ensure the date is in ISO format for the client
    const profile = results[0];
    if (profile.joiningdate) {
      profile.joiningdate = new Date(profile.joiningdate).toISOString().split('T')[0]; // Format as yyyy-MM-dd
    }
    res.status(200).json(profile);
  });
});


app.put('/profile/:id', upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const { name, position, email, phone, department, joiningdate, address, password, maritalStatus, gender } = req.body;
  const newPhoto = req.file ? req.file.path : null;

  const updateFields = {
    name,
    position,
    email,
    phone,
    department,
    joiningdate,
    address,
    maritalStatus,
    gender,
    ...(newPhoto && { photo: newPhoto }),
  };

  // Update query
  const sql = `UPDATE employees SET ? WHERE id = ?`;
  db.query(sql, [updateFields, id], (error, results) => {
    if (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ message: 'Error updating profile' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  });
});





// Get leave types
app.get('/leavetypes', (req, res) => {
  db.query('SELECT * FROM leave_types', (err, results) => {
    if (err) {
      console.error('Error fetching leave types:', err);
      return res.status(500).json({ message: 'Failed to fetch leave types' });
    }
    res.status(200).json(results);
  });
});

// Utility function to calculate working days
function calculateWorkingDays(startDate, endDate) {
  let start = new Date(startDate);
  let end = new Date(endDate);
  let count = 0;

  while (start <= end) {
    // Get the day of the week: 0 (Sunday) - 6 (Saturday)
    const day = start.getDay();
    // Count only if it's a weekday
    if (day !== 0 && day !== 6) {
      count++;
    }
    // Move to the next day
    start.setDate(start.getDate() + 1);
  }

  return count;
}

// Apply for leave
app.post('/leaveapplication', async (req, res) => {
  const { employeeId, startDate, endDate, reason, leaveType } = req.body;

  // Check for overlapping approved or pending leave requests
  db.query(
    'SELECT startDate, endDate FROM leaves WHERE employeeId = ? AND status != "rejected" AND (startDate <= ? AND endDate >= ?) AND status !="Withdrawn"',
    [employeeId, endDate, startDate],
    (err, results) => {
      if (err) {
        console.error('Error checking for overlapping leave:', err);
        return res.status(500).json({ success: false, message: 'Failed to check leave overlap' });
      }

      if (results.length > 0) {
        // Overlapping leave found
        const overlappingLeave = results[0];
        return res.status(400).json({
          success: false,
          message: `Leave already applied for this period: ${overlappingLeave.startDate} to ${overlappingLeave.endDate}. Please select a new date to apply leave.`,
          overlap: { startDate: overlappingLeave.startDate, endDate: overlappingLeave.endDate },
        });
      }

      // No overlapping leave, check leave balance
      db.query('SELECT leaveBalance FROM employees WHERE id = ?', [employeeId], (err, results) => {
        if (err) {
          console.error('Error fetching leave balance:', err);
          return res.status(500).json({ success: false, message: 'Failed to fetch leave balance' });
        }

        if (results.length === 0) {
          // Employee not found
          return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        let leaveBalance = JSON.parse(results[0].leaveBalance);
        let leaveDays = calculateWorkingDays(startDate, endDate);

        if (leaveType === 'Loss Of Pay') {
          // Add to Loss Of Pay
          leaveBalance['Loss Of Pay'] = (leaveBalance['Loss Of Pay'] || 0) + leaveDays;
        } else {
          // Check for sufficient leave balance
          if (!leaveBalance[leaveType] || leaveBalance[leaveType] < leaveDays) {
            // Not enough leave balance
            return res.status(400).json({ success: false, message: 'Insufficient leave balance' });
          }

          // Update leave balance
          leaveBalance[leaveType] -= leaveDays;
        }

        db.query(
          'UPDATE employees SET leaveBalance = ? WHERE id = ?',
          [JSON.stringify(leaveBalance), employeeId],
          (err, results) => {
            if (err) {
              console.error('Error updating leave balance:', err);
              return res.status(500).json({ success: false, message: 'Failed to update leave balance' });
            }

            // Insert leave application
            db.query(
              'INSERT INTO leaves (employeeId, startDate, endDate, reason, leaveType) VALUES (?, ?, ?, ?, ?)',
              [employeeId, startDate, endDate, reason, leaveType],
              (err, results) => {
                if (err) {
                  console.error('Error applying for leave:', err);
                  return res.status(500).json({ success: false, message: 'Failed to apply for leave' });
                }
                res.status(201).json({ success: true, message: 'Leave applied successfully' });
              }
            );
          }
        );
      });
    }
  );
});

app.get('/leavehistory/:employeeId', (req, res) => {
  const { employeeId } = req.params;

  db.query(
    'SELECT * FROM leaves WHERE employeeId = ?',
    [employeeId],
    (err, results) => {
      if (err) {
        console.error('Error fetching leave history:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch leave history' });
      }
      res.json(results);
    }
  );
});
// Utility function to calculate working days
function calculateWorkingDays(startDate, endDate) {
  let start = new Date(startDate);
  let end = new Date(endDate);
  let count = 0;

  while (start <= end) {
      const day = start.getDay();
      // Monday to Friday are working days
      if (day !== 0 && day !== 6) {
          count++;
      }
      start.setDate(start.getDate() + 1);
  }

  return count;
}

// Endpoint to withdraw a leave
app.put('/withdrawLeave/:id', (req, res) => {
  const leaveId = req.params.id;

  // Check the leave details
  db.query('SELECT * FROM leaves WHERE id = ?', [leaveId], (err, results) => {
      if (err) {
          console.error('Error fetching leave details:', err);
          return res.status(500).json({ success: false, message: 'Failed to fetch leave details' });
      }

      if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'Leave not found' });
      }

      const leave = results[0];
      const currentDate = new Date();
      const workingDays = calculateWorkingDays(leave.startDate, leave.endDate);

      if (leave.status !== 'Pending' || new Date(leave.startDate) <= currentDate) {
          return res.status(400).json({ success: false, message: 'Cannot withdraw this leave' });
      }

      // Fetch the employee's current leave balance
      db.query('SELECT leaveBalance FROM employees WHERE id = ?', [leave.employeeId], (err, results) => {
          if (err) {
              console.error('Error fetching employee leave balance:', err);
              return res.status(500).json({ success: false, message: 'Failed to fetch employee leave balance' });
          }

          if (results.length === 0) {
              return res.status(404).json({ success: false, message: 'Employee not found' });
          }

          let leaveBalance = JSON.parse(results[0].leaveBalance);

          // Adjust leave balance based on the leave type
          if (leave.leaveType === 'Loss Of Pay') {
              // Subtract working days for Loss Of Pay
              leaveBalance[leave.leaveType] = (leaveBalance[leave.leaveType] || 0) - workingDays;
          } else {
              // Add working days for other types of leave
              leaveBalance[leave.leaveType] = (leaveBalance[leave.leaveType] || 0) + workingDays;
          }

          // Update the leave balance in the database
          db.query(
              'UPDATE employees SET leaveBalance = ? WHERE id = ?',
              [JSON.stringify(leaveBalance), leave.employeeId],
              (err, results) => {
                  if (err) {
                      console.error('Error updating employee leave balance:', err);
                      return res.status(500).json({ success: false, message: 'Failed to update employee leave balance' });
                  }

                  // Withdraw the leave by marking it as withdrawn
                  db.query('UPDATE leaves SET status = ? WHERE id = ?', ['Withdrawn', leaveId], (err, results) => {
                      if (err) {
                          console.error('Error withdrawing leave:', err);
                          return res.status(500).json({ success: false, message: 'Failed to withdraw leave' });
                      }

                      // Fetch the updated leave history for the employee
                      db.query('SELECT * FROM leaves WHERE employeeId = ?', [leave.employeeId], (err, results) => {
                          if (err) {
                              console.error('Error fetching updated leave history:', err);
                              return res.status(500).json({ success: false, message: 'Failed to fetch updated leave history' });
                          }
                          res.status(200).json({ success: true, updatedLeaves: results });
                      });
                  });
              }
          );
      });
  });
});


// Server-side code to get all leave applications along with employee names
app.get('/leaves', (req, res) => {
  const query = `
    SELECT 
      leaves.id, 
      leaves.employeeId, 
      employees.name as employeeName, 
      leaves.startDate, 
      leaves.endDate, 
      leaves.reason, 
      leaves.leaveType, 
      leaves.status
    FROM 
      leaves 
    INNER JOIN 
      employees 
    ON 
      leaves.employeeId = employees.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching leaves:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch leaves' });
    }
    console.log(results[0]);
    res.status(200).json(results);
  });
});

// Utility function to calculate working days
function calculateWorkingDays(startDate, endDate) {
  let start = new Date(startDate);
  let end = new Date(endDate);
  let count = 0;

  while (start <= end) {
    const day = start.getDay();
    // Monday to Friday are working days
    if (day !== 0 && day !== 6) {
      count++;
    }
    start.setDate(start.getDate() + 1);
  }

  return count;
}

// Update the status of a leave application
app.put('/leaves/:id', (req, res) => {
  const leaveId = req.params.id;
  const { status } = req.body;

  // Fetch leave details to calculate working days and adjust balance
  db.query('SELECT * FROM leaves WHERE id = ?', [leaveId], (err, results) => {
    if (err) {
      console.error('Error fetching leave details:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch leave details' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    const leave = results[0];
    const workingDays = calculateWorkingDays(leave.startDate, leave.endDate);

    // If leave is rejected, adjust leave balance
    if (status === 'rejected') {
      db.query('SELECT leaveBalance FROM employees WHERE id = ?', [leave.employeeId], (err, results) => {
        if (err) {
          console.error('Error fetching employee leave balance:', err);
          return res.status(500).json({ success: false, message: 'Failed to fetch employee leave balance' });
        }

        if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        let leaveBalance = JSON.parse(results[0].leaveBalance);

        // Add or subtract the working days from the respective leave type balance
        if (leave.leaveType === 'Loss Of Pay') {
          leaveBalance[leave.leaveType] = (leaveBalance[leave.leaveType] || 0) - workingDays;
        } else {
          leaveBalance[leave.leaveType] = (leaveBalance[leave.leaveType] || 0) + workingDays;
        }

        // Ensure the balance does not go negative
        if (leaveBalance[leave.leaveType] < 0) {
          leaveBalance[leave.leaveType] = 0;
        }

        // Update the leave balance in the database
        db.query(
          'UPDATE employees SET leaveBalance = ? WHERE id = ?',
          [JSON.stringify(leaveBalance), leave.employeeId],
          (err, results) => {
            if (err) {
              console.error('Error updating employee leave balance:', err);
              return res.status(500).json({ success: false, message: 'Failed to update employee leave balance' });
            }

            // Update the leave status
            db.query(
              'UPDATE leaves SET status = ? WHERE id = ?',
              [status, leaveId],
              (err, results) => {
                if (err) {
                  console.error('Error updating leave status:', err);
                  return res.status(500).json({ success: false, message: 'Failed to update leave status' });
                }

                res.status(200).json({ success: true, message: 'Leave status updated and balance adjusted successfully' });
              }
            );
          }
        );
      });
    } else {
      // If not rejected, just update the status
      db.query(
        'UPDATE leaves SET status = ? WHERE id = ?',
        [status, leaveId],
        (err, results) => {
          if (err) {
            console.error('Error updating leave status:', err);
            return res.status(500).json({ success: false, message: 'Failed to update leave status' });
          }

          res.status(200).json({ success: true, message: 'Leave status updated successfully' });
        }
      );
    }
  });
});


app.get('/employee/:id/leavebalance', (req, res) => {
  const employeeId = req.params.id;
  
  const query = 'SELECT leaveBalance FROM employees WHERE id = ?';
  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error('Error fetching leave balance:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (results.length > 0) {
      // Parse the leave balance JSON from the database
      const leaveBalance = JSON.parse(results[0].leaveBalance);

      // Respond with the leave balance in the desired format
      res.status(200).json(leaveBalance);
    } else {
      // No employee found with the given ID
      res.status(404).json({ error: 'Employee not found' });
    }
  });
});
// Route to get all departments
app.get('/departments', (req, res) => {
  db.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch departments' });
    }
    res.status(200).json(results);
  });
});

// Route to get all positions
app.get('/positions', (req, res) => {
  db.query('SELECT * FROM positions', (err, results) => {
    if (err) {
      console.error('Error fetching positions:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch positions' });
    }
    res.status(200).json(results);
  });
});


// Other routes and configurations...

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
