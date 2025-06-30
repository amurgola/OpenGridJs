// Test setup file
const fs = require('fs');
const path = require('path');

// Mock fetch for tests
global.fetch = jest.fn();

// Add CSS for proper testing
document.head.innerHTML = `
  <style>
    .opengridjs-grid-container {
      display: flex;
      flex-direction: column;
    }
    .opengridjs-grid-header {
      display: flex;
    }
    .opengridjs-grid-rows-container {
      overflow-y: scroll;
      position: relative;
      height: 300px;
    }
    .opengridjs-grid-row {
      position: absolute;
      width: 100%;
      height: 35px;
    }
  </style>
`;

// Helper to create test data
global.createTestData = (count = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Test User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    age: 20 + i,
    status: i % 2 === 0 ? 'active' : 'inactive'
  }));
};