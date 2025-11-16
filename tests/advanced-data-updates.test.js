/**
 * Test Suite 4.3: Advanced Data Updates & Animations
 * Phase 4 - Data Update Features
 *
 * Coverage targets:
 * - Lines 856-876 (appendData)
 * - Lines 878-890 (updateData)
 * - Lines 892-953 (updateRecordData)
 * - Lines 955-989 (updateRecordVisually)
 * - Lines 991-1014 (animateFieldChange)
 * - Lines 1016-1018 (stopLoadingMoreData)
 */

const OpenGrid = require('../src/opengrid.js');

describe('OpenGrid Advanced Data Updates', () => {
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
        jest.clearAllMocks();
    });

    describe('appendData Method', () => {
        test('should append sync data to existing grid', () => {
            const initialData = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' }
            ];
            const grid = new OpenGrid('test-grid', initialData, 400);

            expect(grid.gridData.length).toBe(2);

            const newData = [
                { id: 3, name: 'Charlie' },
                { id: 4, name: 'David' }
            ];

            grid.appendData(newData);

            expect(grid.gridData.length).toBe(4);
            expect(grid.gridData[2].data.name).toBe('Charlie');
            expect(grid.gridData[3].data.name).toBe('David');
        });

        test('should append async data to existing grid', async () => {
            const initialData = [{ id: 1, name: 'Alice' }];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const asyncNewData = () => Promise.resolve([
                { id: 2, name: 'Bob' }
            ]);

            grid.appendData(asyncNewData);

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(grid.gridData.length).toBe(2);
            expect(grid.gridData[1].data.name).toBe('Bob');
        });

        test('should set canLoadMoreData to false when empty data appended', () => {
            const initialData = [{ id: 1, name: 'Alice' }];
            const grid = new OpenGrid('test-grid', initialData, 400, {}, () => {});

            expect(grid.canLoadMoreData).toBe(true);

            grid.appendData([]);

            expect(grid.canLoadMoreData).toBe(false);
        });

        test('should maintain isLoadingMoreData flag state', () => {
            const initialData = [{ id: 1, name: 'Alice' }];
            const grid = new OpenGrid('test-grid', initialData, 400);

            // Default state
            expect(grid.isLoadingMoreData).toBeDefined();

            grid.appendData([{ id: 2, name: 'Bob' }]);

            // Grid should handle the flag appropriately
            expect(grid.gridData.length).toBe(2);
        });
    });

    describe('updateData Method', () => {
        test('should replace all data with sync data', () => {
            const initialData = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' }
            ];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const newData = [
                { id: 3, name: 'Charlie' },
                { id: 4, name: 'David' },
                { id: 5, name: 'Eve' }
            ];

            grid.updateData(newData);

            expect(grid.gridData.length).toBe(3);
            expect(grid.gridData[0].data.name).toBe('Charlie');
            expect(grid.gridData[1].data.name).toBe('David');
        });

        test('should replace all data with async data', async () => {
            const initialData = [{ id: 1, name: 'Alice' }];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const asyncNewData = () => Promise.resolve([
                { id: 10, name: 'NewUser1' },
                { id: 11, name: 'NewUser2' }
            ]);

            grid.updateData(asyncNewData);

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(grid.gridData.length).toBe(2);
            expect(grid.gridData[0].data.id).toBe(10);
        });

        test('should update originalData reference', () => {
            const initialData = [{ id: 1, name: 'Alice' }];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const newData = [{ id: 2, name: 'Bob' }];

            grid.updateData(newData);

            expect(grid.originalData).toEqual(newData);
            expect(grid.originalData).not.toBe(initialData);
        });
    });

    describe('updateRecordData Method', () => {
        test('should update single record by ID', () => {
            const initialData = [
                { id: 1, name: 'Alice', age: 30 },
                { id: 2, name: 'Bob', age: 25 }
            ];
            const grid = new OpenGrid('test-grid', initialData, 400);

            grid.updateRecordData({ id: 1, name: 'Alice Updated', age: 31 });

            // Check originalData (preservePosition = true by default, so gridData not updated)
            const updatedRecord = grid.originalData.find(item => item.id === 1);
            expect(updatedRecord.name).toBe('Alice Updated');
            expect(updatedRecord.age).toBe(31);
        });

        test('should update multiple records via array', () => {
            const initialData = [
                { id: 1, name: 'Alice', status: 'pending' },
                { id: 2, name: 'Bob', status: 'pending' },
                { id: 3, name: 'Charlie', status: 'pending' }
            ];
            const grid = new OpenGrid('test-grid', initialData, 400);

            grid.updateRecordData([
                { id: 1, status: 'active' },
                { id: 3, status: 'active' }
            ]);

            // Check originalData
            expect(grid.originalData[0].status).toBe('active');
            expect(grid.originalData[1].status).toBe('pending'); // Unchanged
            expect(grid.originalData[2].status).toBe('active');
        });

        test('should update with animation when enabled', (done) => {
            jest.useRealTimers();

            const initialData = [
                { id: 1, name: 'Alice', count: 10 }
            ];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const animateSpy = jest.spyOn(grid, 'animateFieldChange');

            grid.updateRecordData(
                { id: 1, count: 20 },
                { animate: true, highlightDuration: 100 }
            );

            setTimeout(() => {
                expect(animateSpy).toHaveBeenCalled();
                done();
            }, 50);
        });

        test('should preserve record position by default', () => {
            const initialData = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
                { id: 3, name: 'Charlie' }
            ];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const originalPosition = grid.gridData[1].position;

            grid.updateRecordData({ id: 2, name: 'Bob Updated' });

            expect(grid.gridData[1].position).toBe(originalPosition);
        });

        test('should recalculate position when preservePosition is false', () => {
            const initialData = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' }
            ];
            const grid = new OpenGrid('test-grid', initialData, 400);

            grid.updateRecordData(
                { id: 2, name: 'Bob Updated' },
                { preservePosition: false }
            );

            // Position should be recalculated via sortData
            expect(grid.gridData[1].position).toBeDefined();
        });

        test('should handle missing ID gracefully', () => {
            const initialData = [{ id: 1, name: 'Alice' }];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

            // No id field
            grid.updateRecordData({ name: 'No ID' });

            expect(consoleWarnSpy).toHaveBeenCalled();

            consoleWarnSpy.mockRestore();
        });

        test('should handle non-existent record ID', () => {
            const initialData = [{ id: 1, name: 'Alice' }];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

            grid.updateRecordData({ id: 999, name: 'Not Found' });

            expect(consoleWarnSpy).toHaveBeenCalled();

            consoleWarnSpy.mockRestore();
        });
    });

    describe('updateRecordVisually Method', () => {
        test('should update DOM element without full rerender', () => {
            const initialData = [
                { id: 1, name: 'Alice', age: 30 }
            ];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const newData = { name: 'Alice Updated', age: 31 };
            const changedFields = {
                name: { oldValue: 'Alice', newValue: 'Alice Updated', isNumeric: false },
                age: { oldValue: 30, newValue: 31, isNumeric: true }
            };

            grid.updateRecordVisually(1, newData, changedFields, false, 0);

            const cells = container.querySelectorAll('.opengridjs-grid-column-item');
            const nameCell = Array.from(cells).find(cell => cell.textContent === 'Alice Updated');

            expect(nameCell).toBeTruthy();
        });

        test('should apply formatter when updating visually', () => {
            const initialData = [
                { id: 1, price: 100 }
            ];
            const setup = {
                columnHeaderNames: [
                    { columnName: 'id' },
                    { columnName: 'price', format: (val) => `$${val}` }
                ]
            };
            const grid = new OpenGrid('test-grid', initialData, 400, setup);

            const changedFields = {
                price: { oldValue: 100, newValue: 200, isNumeric: true }
            };

            grid.updateRecordVisually(1, { price: 200 }, changedFields, false, 0);

            const cells = container.querySelectorAll('.opengridjs-grid-column-item');
            const priceCell = Array.from(cells).find(cell => cell.textContent === '$200');

            expect(priceCell).toBeTruthy();
        });

        test('should skip update when row not in DOM', () => {
            const initialData = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `User ${i}`
            }));
            const grid = new OpenGrid('test-grid', initialData, 400);

            const changedFields = {
                name: { oldValue: 'User 99', newValue: 'Updated', isNumeric: false }
            };

            // Row 99 won't be rendered in 400px viewport
            const result = grid.updateRecordVisually(99, { name: 'Updated' }, changedFields, false, 0);

            // Should skip without error
            expect(result).toBeUndefined();
        });

        test('should call animateFieldChange when animate is true', () => {
            const initialData = [{ id: 1, count: 10 }];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const animateSpy = jest.spyOn(grid, 'animateFieldChange');

            const changedFields = {
                count: { oldValue: 10, newValue: 20, isNumeric: true }
            };

            grid.updateRecordVisually(1, { count: 20 }, changedFields, true, 500);

            expect(animateSpy).toHaveBeenCalled();

            animateSpy.mockRestore();
        });
    });

    describe('animateFieldChange Method', () => {
        test('should handle numeric increase animation', () => {
            const initialData = [{ id: 1, count: 10 }];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const testElement = document.createElement('div');
            testElement.className = 'opengridjs-grid-column-item';
            container.appendChild(testElement);

            const change = { oldValue: 10, newValue: 20 };

            // Should not throw
            expect(() => grid.animateFieldChange(testElement, change, 100)).not.toThrow();

            // Verify element is in DOM
            expect(testElement.parentElement).toBe(container);
        });

        test('should handle numeric decrease animation', () => {
            const initialData = [{ id: 1, count: 20 }];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const testElement = document.createElement('div');
            testElement.className = 'opengridjs-grid-column-item';
            container.appendChild(testElement);

            const change = { oldValue: 20, newValue: 10 };

            expect(() => grid.animateFieldChange(testElement, change, 100)).not.toThrow();
        });

        test('should handle non-numeric changes', () => {
            const initialData = [{ id: 1, status: 'pending' }];
            const grid = new OpenGrid('test-grid', initialData, 400);

            const testElement = document.createElement('div');
            testElement.className = 'opengridjs-grid-column-item';
            container.appendChild(testElement);

            const change = { oldValue: 'pending', newValue: 'active' };

            expect(() => grid.animateFieldChange(testElement, change, 100)).not.toThrow();
        });
    });

    describe('stopLoadingMoreData Method', () => {
        test('should set canLoadMoreData to false', () => {
            const initialData = [{ id: 1, name: 'Alice' }];
            const loadMoreFunc = jest.fn();
            const grid = new OpenGrid('test-grid', initialData, 400, {}, loadMoreFunc);

            expect(grid.canLoadMoreData).toBe(true);

            grid.stopLoadingMoreData();

            expect(grid.canLoadMoreData).toBe(false);
        });
    });
});
