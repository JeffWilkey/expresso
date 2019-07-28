const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const employeeRouter = express.Router();
const timesheetRouter = require('./timesheets');

const validateEmployeeReq = (req) => {
  const { name, position, wage } = req.body.employee;
  if (!name || !position || !wage) return true;
  else return false;
}

employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.get('/', (req, res) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employees) => {
    if (err) next(err);
    else res.status(200).json({ employees });
  });
});

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = { $employeeId: employeeId };
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

employeeRouter.get('/:employeeId', (req, res) => {
  res.status(200).json({ employee: req.employee });
})

employeeRouter.post('/', (req, res, next) => {
  if (validateEmployeeReq(req)) res.sendStatus(400);
  const { name, position, wage } = req.body.employee;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  }
  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (err, employee) => {
        if (err) next(err);
        else res.status(201).json({ employee });
      });
    }
  });
});

employeeRouter.put('/:employeeId', (req, res, next) => {
  if (validateEmployeeReq(req)) res.sendStatus(400);
  const { name, position, wage } = req.body.employee;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE Employee.id = $employeeId';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee,
    $employeeId: req.params.employeeId
  }
  db.run(sql, values, function(error) {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
        if (err) next(err);
        else res.status(200).json({ employee });
      });
    }
  });
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
  const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId';
  const values = { $employeeId: req.params.employeeId };
  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
        if (err) next(err);
        else res.status(200).json({ employee });
      });
    }
  });
});

module.exports = employeeRouter;