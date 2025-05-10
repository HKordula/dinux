const { body, param, validationResult } = require('express-validator');
const pool = require('../config/db');
const constants = require('../config/constants');

const validate = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    next();
  };
};

const dinosaurRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
  
  body('species_id')
    .isInt().withMessage('Invalid species ID')
    .custom(async value => {
      const [rows] = await pool.query('SELECT id FROM species WHERE id = ?', [value]);
      if (!rows.length) throw new Error('Species does not exist');
      return true;
    }),
  
  body('diet_id')
    .isInt().withMessage('Invalid diet ID')
    .custom(async value => {
      const [rows] = await pool.query('SELECT id FROM diets WHERE id = ?', [value]);
      if (!rows.length) throw new Error('Diet does not exist');
      return true;
    }),
  
  body('categories.*')
    .isInt().withMessage('Invalid category ID')
    .custom(async value => {
      const [rows] = await pool.query('SELECT id FROM categories WHERE id = ?', [value]);
      if (!rows.length) throw new Error(`Category ${value} does not exist`);
      return true;
    }),
];

const validateDinosaur = validate(dinosaurRules);

const idParamCheck = [
  param('id')
    .isInt().withMessage('Invalid ID format')
];

module.exports = {
  validate,
  validateDinosaur,
  idParamCheck
};