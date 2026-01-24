import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const getAuthToken = () => {
  // You'll need to paste your token here from localStorage
  const token = 'YOUR_TOKEN_HERE';
  return token;
};

const deleteAllAttendance = async () => {
  try {
    const token = getAuthToken();
    
    if (token === 'YOUR_TOKEN_HERE') {
      console.error('❌ Please replace YOUR_TOKEN_HERE with your actual auth token');
      console.log('\nTo get your token:');
      console.log('1. Open browser console');
      console.log('2. Run: localStorage.getItem("edunity_token")');
      console.log('3. Copy the token and paste it in this file');
      return;
    }
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Get all attendance records
    console.log('📋 Fetching all attendance records...');
    const response = await axios.get(`${API_BASE_URL}/attendance`, { headers });
    
    const records = response.data.records || [];
    console.log(`✅ Found ${records.length} attendance records`);
    
    if (records.length === 0) {
      console.log('✨ No records to delete');
      return;
    }
    
    // Delete each record
    console.log('\n🗑️  Deleting records...');
    let deleted = 0;
    let failed = 0;
    
    for (const record of records) {
      try {
        await axios.delete(`${API_BASE_URL}/attendance/${record._id}`, { headers });
        deleted++;
        console.log(`✓ Deleted record ${deleted}/${records.length} (ID: ${record._id})`);
      } catch (error) {
        failed++;
        console.error(`✗ Failed to delete record ${record._id}:`, error.response?.data?.message || error.message);
      }
    }
    
    console.log(`\n✅ Deletion complete: ${deleted} deleted, ${failed} failed`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
};

// Run the script
deleteAllAttendance();
