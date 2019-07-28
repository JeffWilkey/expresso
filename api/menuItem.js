const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemRouter = express.Router({ mergeParams: true });

const validateMenuItemReq = (req) => {
  const { name, inventory, price } = req.body.menuItem;
  if (!name || !inventory || !price) return true;
  else return false;
}

menuItemRouter.get('/', (req, res) => {
  const sql = 'SELECT * FROM MenuItem WHERE menu_id = $menuId'
  const values = { $menuId: req.params.menuId };
  db.all(sql, values, (err, menuItems) => {
    if (err) next(err);
    else res.status(200).json({ menuItems });
  });
});

menuItemRouter.post('/', (req, res, next ) => {
  if (validateMenuItemReq(req)) return res.sendStatus(400);
  const { name, description, inventory, price } = req.body.menuItem;
  const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: req.params.menuId
  }
  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (err, menuItem) => {
        if (err) next(err);
        else res.status(201).json({ menuItem });
      });
    }
  });
});

menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = { $menuItemId: menuItemId };
  db.get(sql, values, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemRouter.put('/:menuItemId', (req, res, next) => {
  if (validateMenuItemReq(req)) return res.sendStatus(400);
  const { name, description, inventory, price } = req.body.menuItem;
  const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE MenuItem.id = $menuItemId';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuItemId: req.params.menuItemId
  }
  db.run(sql, values, function(error) {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, (err, menuItem) => {
        if (err) next(err);
        else res.status(200).json({ menuItem });
      });
    }
  });
});

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = { $menuItemId: req.params.menuItemId };
  db.run(sql, values, function(error) {
    if (error) next(error);
    else res.sendStatus(204);
  });
});

module.exports = menuItemRouter;