const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuRouter = express.Router();
const menuItemRouter = require('./menuItem');

const validateMenuReq = (req) => {
  if (!req.body.menu.title) return true;
  else return false;
}

menuRouter.use('/:menuId/menu-items', menuItemRouter);

menuRouter.get('/', (req, res) => {
  db.all('SELECT * FROM Menu', (error, menus) => {
    if (error) next(error);
    else res.status(200).json({ menus });
  });
});

menuRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = { $menuId: menuId };
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuRouter.get('/:menuId', (req, res) => {
  res.status(200).json({ menu: req.menu });
});

menuRouter.post('/', (req, res, next) => {
  if (validateMenuReq(req)) return res.sendStatus(400);
  const { title } = req.body.menu;
  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const values = { $title: title };
  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (err, menu) => {
        if (err) next(err);
        else res.status(201).json({ menu });
      });
    }
  });
});

menuRouter.put('/:menuId', (req, res, next) => {
  if (validateMenuReq(req)) return res.sendStatus(400);
  const { title } = req.body.menu;
  const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
  const values = {
    $title: title,
    $menuId: req.params.menuId
  }
  db.run(sql, values, function (error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (err, menu) => {
        if (err) next(err);
        else res.status(200).json({ menu });
      });
    }
  });
});

menuRouter.delete('/:menuId', (req, res, next) => {
  const menuItemSql = 'SELECT * FROM MenuItem WHERE menu_id = $menuId';
  const menuItemValues = { $menuId: req.params.menuId };
  db.all(menuItemSql, menuItemValues, function(error, menuItems) {
    if (error) {
      next(error)
    } else if (menuItems.length) {
      return res.sendStatus(400);
    } else {
      db.run(`DELETE FROM Menu WHERE Menu.id = ${req.params.menuId}`, function(error) {
        if (error) next(error);
        else res.sendStatus(204);
      });
    }
  });
});

module.exports = menuRouter;