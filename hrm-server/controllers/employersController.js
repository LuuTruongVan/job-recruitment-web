const EmployersService = require('../services/employersService');
const jwt = require('jsonwebtoken');

const EmployersController = {
  async getPublicEmployer(req, res) {
    try {
      const employer = await EmployersService.getPublicEmployer(req.params.id);
      res.json(employer);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },

  async getAllEmployers(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

      const employers = await EmployersService.getAllEmployers();
      res.json(employers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching all employers' });
    }
  },

  async countEmployers(req, res) {
    try {
      const count = await EmployersService.countEmployers();
      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching employers count' });
    }
  },

  async getEmployerByUser(req, res) {
    try {
      const employer = await EmployersService.getEmployerByUserId(req.params.userId);
      res.json(employer);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },

  async addEmployer(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

      const id = await EmployersService.addEmployer(decoded.id, req.body);
      res.status(201).json({ message: 'Employer profile added successfully', id });
    } catch (err) {
      res.status(400).json({ message: err.message || 'Error adding employer profile' });
    }
  },

  async updateEmployer(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

      await EmployersService.updateEmployer(decoded.id, req.body);
      res.json({ message: 'Employer profile updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error updating employer profile' });
    }
  },

  async deleteEmployer(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin' && decoded.role !== 'employer') return res.status(403).json({ message: 'Access denied' });

      await EmployersService.deleteEmployer(decoded.id, req.params.id, decoded.role);
      res.json({ message: 'Employer profile deleted successfully' });
    } catch (err) {
      res.status(400).json({ message: err.message || 'Error deleting employer profile' });
    }
  }
};

module.exports = EmployersController;
