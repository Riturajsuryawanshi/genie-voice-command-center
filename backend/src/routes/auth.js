const express = require('express');
const router = express.Router();
const { assignPhoneNumber, getUserPhoneNumber } = require('../services/number');

// POST /api/auth/onboard - Assign phone number to user
router.post('/onboard', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing user_id' 
      });
    }

    console.log(`Attempting to assign phone number to user: ${user_id}`);
    const result = await assignPhoneNumber(user_id);
    
    if (result.success) {
      console.log(`Successfully assigned phone number: ${result.phone_number}`);
      return res.json({ 
        success: true, 
        phone_number: result.phone_number 
      });
    } else {
      console.error(`Failed to assign phone number: ${result.error}`);
      return res.status(400).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Onboard endpoint error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/auth/phone/:user_id - Get user's phone number
router.get('/phone/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing user_id' 
      });
    }

    const result = await getUserPhoneNumber(user_id);
    
    if (result.success) {
      return res.json({ 
        success: true, 
        phone_number: result.phone_number 
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Get phone number error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router; 