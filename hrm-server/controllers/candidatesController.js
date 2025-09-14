const jwt = require('jsonwebtoken');
const CandidateService = require('../services/candidatesService');

const CandidatesController = {
  async getAll(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

      const candidates = await CandidateService.getAllCandidates();
      res.json(candidates);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching candidates' });
    }
  },

  async count(req, res) {
    try {
      const count = await CandidateService.countCandidates();
      res.json({ count });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error counting candidates' });
    }
  },

  async create(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'candidate') return res.status(403).json({ message: 'Access denied' });

      const { full_name, phone, address, skills, avatar_url } = req.body;
      const profileId = await CandidateService.createCandidateProfile(decoded.id, { full_name, phone, address, skills, avatar_url });
      res.status(201).json({ message: 'Candidate profile added', profileId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message || 'Error creating profile' });
    }
  },

  async update(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'candidate') return res.status(403).json({ message: 'Access denied' });

      const { full_name, phone, address, skills, avatar_url } = req.body;
      await CandidateService.updateCandidateProfile(decoded.id, { full_name, phone, address, skills, avatar_url });
      res.json({ message: 'Candidate profile updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating profile' });
    }
  },

  async getProfile(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'candidate') return res.status(403).json({ message: 'Access denied' });

      const profile = await CandidateService.getCandidateByUserId(decoded.id);
      if (!profile) return res.status(404).json({ message: 'Profile not found' });

      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  },

  async delete(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!['admin', 'candidate'].includes(decoded.role)) return res.status(403).json({ message: 'Access denied' });

      const { id } = req.params;

      // candidate only delete own profile
      if (decoded.role === 'candidate') {
        const profile = await CandidateService.getCandidateByUserId(decoded.id);
        if (!profile || profile.id != id) return res.status(404).json({ message: 'Not found or unauthorized' });
      }

      await CandidateService.deleteCandidateProfile(id);
      res.json({ message: 'Profile deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting profile' });
    }
  },

  async getByUser(req, res) {
    try {
      const { userId } = req.params;
      const profile = await CandidateService.getCandidateByUserId(userId);
      if (!profile) return res.status(404).json({ message: 'Candidate not found' });
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = CandidatesController;
