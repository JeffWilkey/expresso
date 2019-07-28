const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetRouter = express.Router({ mergeParams: true });

const validateTimesheetReq = (req) => {
  const { hours, rate, date } = req.body.timesheet;
  if (!hours || !rate || !date) return true;
  else return false;
}

timesheetRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet WHERE employee_id = $employeeId';
  const values = { $employeeId: req.params.employeeId };
  db.all(sql, values, (error, timesheets) => {
    if (error) next(error);
    else res.status(200).json({ timesheets });
  });
});

timesheetRouter.post('/', (req, res, next) => {
  if (validateTimesheetReq(req)) return res.sendStatus(400);
  const { hours, rate, date } = req.body.timesheet;
  const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: req.params.employeeId
  }
  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (err, timesheet) => {
        if (err) next(err);
        else res.status(201).json({ timesheet });
      });
    }
  });
});

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = { $timesheetId: timesheetId };
  db.get(sql, values, (error, timesheet) => {
    if (error) {
      next(error)
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
  if (validateTimesheetReq(req)) return res.sendStatus(400);
  const { hours, rate, date } = req.body.timesheet;
  const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE Timesheet.id = $timesheetId';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $timesheetId: req.params.timesheetId
  }
  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (err, timesheet) => {
        if (err) next(err);
        else res.status(200).json({ timesheet });
      });
    }
  });
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = { $timesheetId: req.params.timesheetId };
  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetRouter;

