const { assignPhoneNumber } = require('./src/services/number');

async function testPhoneAssignment() {
  console.log('🧪 Testing Phone Number Assignment...\n');

  // Test with a sample user ID
  const testUserId = 'test-user-123';
  
  try {
    console.log(`📞 Attempting to assign phone number to user: ${testUserId}`);
    
    const result = await assignPhoneNumber(testUserId);
    
    if (result.success) {
      console.log('✅ SUCCESS: Phone number assigned successfully!');
      console.log(`📱 Phone Number: ${result.phone_number}`);
    } else {
      console.log('❌ FAILED: Phone number assignment failed');
      console.log(`🔍 Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('💥 ERROR: Test failed with exception:', error);
  }
  
  console.log('\n🏁 Test completed!');
}

// Run the test
testPhoneAssignment(); 