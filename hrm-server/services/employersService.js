const EmployersModel = require('../models/employersModel');

const EmployersService = {
  async getPublicEmployer(id) {
    const employer = await EmployersModel.getPublicEmployerById(id);
    if (!employer) throw new Error('Employer not found');
    return employer;
  },

  async getAllEmployers() {
    return EmployersModel.getAllEmployers();
  },

  async countEmployers() {
    return EmployersModel.countEmployers();
  },

  async getEmployerByUserId(userId) {
    const employer = await EmployersModel.getEmployerByUserId(userId);
    if (!employer) throw new Error('Employer not found');
    return employer;
  },

  async addEmployer(userId, data) {
    const existing = await EmployersModel.getEmployerByUserId(userId);
    if (existing) throw new Error('Profile already exists');

    return EmployersModel.addEmployer({ ...data, user_id: userId });
  },

  async updateEmployer(userId, data) {
    await EmployersModel.updateEmployer({ ...data, user_id: userId });
  },

  async deleteEmployer(userId, id, role) {
    if (role === 'employer') {
      const existing = await EmployersModel.getEmployerByUserId(userId);
      if (!existing || existing.id !== parseInt(id)) throw new Error('Not found or unauthorized');
    }
    await EmployersModel.deleteEmployerById(id);
  }
};

module.exports = EmployersService;
