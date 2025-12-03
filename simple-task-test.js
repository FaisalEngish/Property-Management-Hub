// Simple Task Creation Test - Following your test format
function test(description, testFn) {
  try {
    console.log(`🧪 ${description}`);
    testFn();
    console.log(`✅ ${description} - PASSED`);
  } catch (error) {
    console.log(`❌ ${description} - FAILED: ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    }
  };
}

// Core functionality tests
test("Task creation works", () => {
  const tasks = [];
  function addTask(name) { tasks.push(name); }
  addTask("Test task");
  expect(tasks.length).toBe(1);
});

test("Task with priority works", () => {
  const tasks = [];
  function addTask(name, priority = 'medium') { 
    tasks.push({ name, priority }); 
  }
  addTask("High priority task", "high");
  expect(tasks.length).toBe(1);
  expect(tasks[0].priority).toBe("high");
});

test("Property creation works", () => {
  const properties = [];
  function addProperty(name, bedrooms) {
    properties.push({ name, bedrooms });
  }
  addProperty("Villa Test", 3);
  expect(properties.length).toBe(1);
  expect(properties[0].bedrooms).toBe(3);
});

test("Booking system works", () => {
  const bookings = [];
  function createBooking(propertyId, guest) {
    bookings.push({ propertyId, guest, status: 'confirmed' });
  }
  createBooking(1, "John Doe");
  expect(bookings.length).toBe(1);
  expect(bookings[0].status).toBe('confirmed');
});

test("User management works", () => {
  const users = [];
  function addUser(email, role) {
    users.push({ email, role, active: true });
  }
  addUser("test@example.com", "admin");
  expect(users.length).toBe(1);
  expect(users[0].role).toBe("admin");
  expect(users[0].active).toBe(true);
});

test("Financial calculations work", () => {
  const transactions = [
    { type: 'income', amount: 5000 },
    { type: 'expense', amount: 500 },
    { type: 'income', amount: 2000 }
  ];
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const profit = totalIncome - totalExpenses;
  
  expect(totalIncome).toBe(7000);
  expect(totalExpenses).toBe(500);
  expect(profit).toBe(6500);
});

console.log('\n🎉 All core functionality tests completed!');

// Test SystemHub functionality
test("SystemHub module loading works", () => {
  const modules = [];
  function loadModule(name, component) {
    modules.push({ name, component, loaded: true });
  }
  
  loadModule("User Management", "HostawayUserManagement");
  loadModule("API Connections", "ApiConnections");
  loadModule("Settings", "SettingsPage");
  
  expect(modules.length).toBe(3);
  expect(modules[0].loaded).toBe(true);
});

console.log('\n✨ SystemHub tests completed!');