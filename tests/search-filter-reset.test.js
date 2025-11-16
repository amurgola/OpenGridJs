/**
 * Test Suite 3.3: Search Filter & Reset
 * Phase 3 - Advanced Features
 *
 * Coverage targets:
 * - Lines 673-681 (searchFilter)
 * - Lines 683-686 (reset)
 */

const OpenGrid = require('../src/opengrid.js');

describe('OpenGrid Search Filter & Reset', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    });

    describe('searchFilter Method', () => {
        test('should filter data by search term (case insensitive)', () => {
            const data = [
                { id: 1, name: 'Alice', email: 'alice@example.com' },
                { id: 2, name: 'Bob', email: 'bob@example.com' },
                { id: 3, name: 'Charlie', email: 'charlie@example.com' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            grid.searchFilter('alice');

            expect(grid.gridData.length).toBe(1);
            expect(grid.gridData[0].data.name).toBe('Alice');
        });

        test('should filter across all columns', () => {
            const data = [
                { id: 1, name: 'Alice', email: 'alice@test.com', role: 'admin' },
                { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
                { id: 3, name: 'Charlie', email: 'charlie@test.com', role: 'user' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            // Search for 'test' - should match email column for Alice and Charlie
            grid.searchFilter('test');

            expect(grid.gridData.length).toBe(2);
            expect(grid.gridData.some(item => item.data.name === 'Alice')).toBe(true);
            expect(grid.gridData.some(item => item.data.name === 'Charlie')).toBe(true);
        });

        test('should handle partial matches', () => {
            const data = [
                { id: 1, name: 'Alexander' },
                { id: 2, name: 'Alexandra' },
                { id: 3, name: 'Bob' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            grid.searchFilter('alex');

            expect(grid.gridData.length).toBe(2);
        });

        test('should return empty results for no matches', () => {
            const data = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            grid.searchFilter('xyz');

            expect(grid.gridData.length).toBe(0);
        });

        test('should handle numeric search terms', () => {
            const data = [
                { id: 123, name: 'Alice' },
                { id: 456, name: 'Bob' },
                { id: 789, name: 'Charlie' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            grid.searchFilter(456);

            expect(grid.gridData.length).toBe(1);
            expect(grid.gridData[0].data.name).toBe('Bob');
        });

        test('should be case insensitive', () => {
            const data = [
                { id: 1, name: 'ALICE' },
                { id: 2, name: 'bob' },
                { id: 3, name: 'ChArLiE' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            grid.searchFilter('CHARLIE');

            expect(grid.gridData.length).toBe(1);
            expect(grid.gridData[0].data.name).toBe('ChArLiE');
        });
    });

    describe('reset Method', () => {
        test('should reset filtered data back to original', () => {
            const data = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
                { id: 3, name: 'Charlie' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            // Apply filter
            grid.searchFilter('alice');
            expect(grid.gridData.length).toBe(1);

            // Reset
            grid.reset();

            expect(grid.gridData.length).toBe(3);
        });

        test('should restore all original data after reset', () => {
            const data = [
                { id: 1, name: 'Alice', age: 30 },
                { id: 2, name: 'Bob', age: 25 },
                { id: 3, name: 'Charlie', age: 35 }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            grid.searchFilter('bob');
            grid.reset();

            // All records should be present
            expect(grid.gridData).toHaveLength(3);
            expect(grid.gridData.some(item => item.data.name === 'Alice')).toBe(true);
            expect(grid.gridData.some(item => item.data.name === 'Bob')).toBe(true);
            expect(grid.gridData.some(item => item.data.name === 'Charlie')).toBe(true);
        });

        test('should work after multiple filters and resets', () => {
            const data = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
                { id: 3, name: 'Charlie' },
                { id: 4, name: 'David' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            // First filter
            grid.searchFilter('a'); // Alice, Charlie, David
            expect(grid.gridData.length).toBe(3);

            // Reset
            grid.reset();
            expect(grid.gridData.length).toBe(4);

            // Second filter
            grid.searchFilter('b'); // Bob
            expect(grid.gridData.length).toBe(1);

            // Reset again
            grid.reset();
            expect(grid.gridData.length).toBe(4);
        });

        test('should reset maintains data integrity', () => {
            const data = [
                { id: 1, name: 'Alice', email: 'alice@test.com', active: true }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            grid.searchFilter('xyz'); // No matches
            grid.reset();

            // Data should be fully restored
            expect(grid.gridData[0].data).toEqual(data[0]);
        });
    });

    describe('searchFilter and reset Integration', () => {
        test('should filter, reset, and filter again correctly', () => {
            const data = [
                { id: 1, category: 'fruit', name: 'Apple' },
                { id: 2, category: 'vegetable', name: 'Broccoli' },
                { id: 3, category: 'fruit', name: 'Banana' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            // Filter for 'fruit'
            grid.searchFilter('fruit');
            expect(grid.gridData.length).toBe(2);

            // Reset
            grid.reset();
            expect(grid.gridData.length).toBe(3);

            // Filter for 'vegetable'
            grid.searchFilter('vegetable');
            expect(grid.gridData.length).toBe(1);
            expect(grid.gridData[0].data.name).toBe('Broccoli');
        });
    });
});
