const CandidateModel = require('../models/candidatesModel');

const CandidateService = {
  async getAllCandidates() {
    return CandidateModel.getAll();
  },

  async countCandidates() {
    return CandidateModel.count();
  },

  async createCandidateProfile(user_id, data) {
    return CandidateModel.create({ user_id, ...data });
  },

  async updateCandidateProfile(user_id, data) {
    return CandidateModel.update(user_id, data);
  },

  async getCandidateByUserId(user_id) {
    return CandidateModel.getByUserId(user_id);
  },

  async deleteCandidateProfile(id) {
    return CandidateModel.delete(id);
  }
};

module.exports = CandidateService;
