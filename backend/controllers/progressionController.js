const progressionService = require('../services/progressionService');

function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  const payload = { error: error.message || 'Server error' };

  if (error.details) {
    payload.details = error.details;
  }

  return res.status(statusCode).json(payload);
}

async function getProfile(req, res) {
  try {
    const profile = await progressionService.getProfile(req.user.id);
    return res.json({ profile });
  } catch (error) {
    console.error('GET profile error:', error);
    return sendError(res, error);
  }
}

async function saveRun(req, res) {
  try {
    const profile = await progressionService.saveRun(req.user.id, req.body);
    return res.json({ message: 'Run saved', profile });
  } catch (error) {
    console.error('POST save-run error:', error);
    return sendError(res, error);
  }
}

async function unlockItem(req, res) {
  try {
    const { unlockId } = req.body;
    if (!unlockId) {
      return res.status(400).json({ error: 'unlockId is required' });
    }

    const profile = await progressionService.unlockItem(req.user.id, unlockId);
    return res.json({ message: 'Unlock successful', profile });
  } catch (error) {
    console.error('POST unlock error:', error);
    return sendError(res, error);
  }
}

async function selectBike(req, res) {
  try {
    const { bikeId } = req.body;
    if (!bikeId) {
      return res.status(400).json({ error: 'bikeId is required' });
    }

    const profile = await progressionService.selectBike(req.user.id, bikeId);
    return res.json({ message: 'Bike updated', profile });
  } catch (error) {
    console.error('POST select-bike error:', error);
    return sendError(res, error);
  }
}

module.exports = {
  getProfile,
  saveRun,
  unlockItem,
  selectBike,
};