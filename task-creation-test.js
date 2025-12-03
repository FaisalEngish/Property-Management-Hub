// Real Task Creation Test - Tests actual task creation API
const baseUrl = 'http://localhost:5000';

async function testTaskCreation() {
  console.log('🧪 Testing Real Task Creation API...\n');
  
  try {
    // First login with correct demo credentials
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'admin@test.com',
        password: 'admin123' 
      }),
      credentials: 'include'
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }
    
    console.log('✅ Login successful');
    
    // Get current tasks count
    const initialTasksResponse = await fetch(`${baseUrl}/api/tasks`, {
      credentials: 'include'
    });
    
    if (!initialTasksResponse.ok) {
      console.log('❌ Could not fetch initial tasks');
      return;
    }
    
    const initialTasks = await initialTasksResponse.json();
    console.log(`📋 Initial task count: ${initialTasks.length}`);
    
    // Create a new test task
    const newTask = {
      title: 'Test Task - API Integration',
      description: 'This is a test task created via API',
      priority: 'high',
      propertyId: 1, // Use first property
      assignedTo: 'demo-admin',
      status: 'pending',
      category: 'maintenance'
    };
    
    const createTaskResponse = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
      credentials: 'include'
    });
    
    if (createTaskResponse.ok) {
      const createdTask = await createTaskResponse.json();
      console.log('✅ Task created successfully:', createdTask.title);
      console.log(`   ID: ${createdTask.id}, Priority: ${createdTask.priority}`);
      
      // Verify task was added
      const updatedTasksResponse = await fetch(`${baseUrl}/api/tasks`, {
        credentials: 'include'
      });
      
      if (updatedTasksResponse.ok) {
        const updatedTasks = await updatedTasksResponse.json();
        console.log(`📋 Updated task count: ${updatedTasks.length}`);
        
        if (updatedTasks.length > initialTasks.length) {
          console.log('✅ Task creation test PASSED - task count increased');
        } else {
          console.log('❌ Task creation test FAILED - task count did not increase');
        }
      }
      
    } else {
      console.log('❌ Task creation failed:', createTaskResponse.status);
      const errorText = await createTaskResponse.text();
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

// Property creation test
async function testPropertyCreation() {
  console.log('\n🏠 Testing Property Creation API...\n');
  
  try {
    const newProperty = {
      name: 'Test Property - API Integration',
      address: '123 Test Street, Test City',
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      pricePerNight: 150,
      status: 'active'
    };
    
    const createPropertyResponse = await fetch(`${baseUrl}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProperty),
      credentials: 'include'
    });
    
    if (createPropertyResponse.ok) {
      const createdProperty = await createPropertyResponse.json();
      console.log('✅ Property created successfully:', createdProperty.name);
      console.log(`   ID: ${createdProperty.id}, Bedrooms: ${createdProperty.bedrooms}`);
    } else {
      console.log('❌ Property creation failed:', createPropertyResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Property test error:', error.message);
  }
}

// Run both tests
async function runIntegrationTests() {
  await testTaskCreation();
  await testPropertyCreation();
  console.log('\n🎯 Integration tests completed!');
}

runIntegrationTests();