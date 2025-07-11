const supabase = require('../config/supabase');

/**
 * Assign a unique phone number to a user if they don't have one.
 * @param {string} user_id - The user's unique ID (from Google auth)
 * @returns {Promise<{ success: boolean, phone_number?: string, error?: string }>}
 */
async function assignPhoneNumber(user_id) {
  try {
    // 1. Check if user already has a phone number
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone_number')
      .eq('id', user_id)
      .single();

    if (userError) {
      console.error('User lookup error:', userError);
      return { success: false, error: 'User not found' };
    }
    
    if (user.phone_number) {
      return { success: true, phone_number: user.phone_number };
    }

    // 2. Find an available phone number from the pool
    const { data: phone, error: phoneError } = await supabase
      .from('phone_pool')
      .select('id, number')
      .eq('assigned', false)
      .limit(1)
      .single();

    if (phoneError || !phone) {
      console.error('Phone pool error:', phoneError);
      return { success: false, error: 'No available phone numbers' };
    }

    // 3. Assign the phone number to the user and mark as assigned
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ phone_number: phone.number })
      .eq('id', user_id);

    const { error: updatePoolError } = await supabase
      .from('phone_pool')
      .update({ assigned: true, assigned_to: user_id })
      .eq('id', phone.id);

    if (updateUserError || updatePoolError) {
      console.error('Assignment errors:', { updateUserError, updatePoolError });
      return { success: false, error: 'Failed to assign phone number' };
    }

    console.log(`Successfully assigned phone number ${phone.number} to user ${user_id}`);
    return { success: true, phone_number: phone.number };
    
  } catch (error) {
    console.error('Phone number assignment error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Get user's phone number
 * @param {string} user_id - The user's unique ID
 * @returns {Promise<{ success: boolean, phone_number?: string, error?: string }>}
 */
async function getUserPhoneNumber(user_id) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('phone_number')
      .eq('id', user_id)
      .single();

    if (error) {
      return { success: false, error: 'User not found' };
    }

    return { 
      success: true, 
      phone_number: user.phone_number 
    };
  } catch (error) {
    console.error('Get user phone number error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

module.exports = { 
  assignPhoneNumber,
  getUserPhoneNumber
}; 