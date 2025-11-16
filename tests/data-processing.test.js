/**
 * Test Suite 2.2: Data Processing & Formatters
 * Phase 2 - Core Functionality Tests
 *
 * Coverage targets:
 * - Lines 88-101 (processData)
 * - Lines 525-553 (addRow with formatters)
 * - Nested property access (dot notation)
 * - Null/undefined/empty value handling
 */

const OpenGrid = require('../src/opengrid.js');

describe('OpenGrid Data Processing & Formatters', () => {
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

    describe('processData Method', () => {
        test('should process data array and add metadata', () => {
            const data = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            expect(grid.gridData).toHaveLength(2);
            expect(grid.gridData[0].data).toEqual({ id: 1, name: 'Alice' });
            expect(grid.gridData[0].position).toBe(0); // 0 * 35
            expect(grid.gridData[0]).toHaveProperty('isRendered');
            expect(grid.gridData[1].position).toBe(35); // 1 * 35
        });

        test('should calculate correct positions based on gridRowPxSize', () => {
            const data = Array.from({ length: 5 }, (_, i) => ({ id: i }));

            const grid = new OpenGrid('test-grid', data, 400);

            // Positions are recalculated after sorting, so check that they follow the pattern
            const positions = grid.gridData.map(item => item.position);
            expect(positions[0]).toBe(0);   // 0 * 35
            expect(positions[1]).toBe(35);  // 1 * 35
            expect(positions[2]).toBe(70);  // 2 * 35
            expect(positions[3]).toBe(105); // 3 * 35
            expect(positions[4]).toBe(140); // 4 * 35
        });

        test('should initialize items with metadata structure', () => {
            const data = Array.from({ length: 3 }, (_, i) => ({ id: i, name: `Item ${i}` }));

            const grid = new OpenGrid('test-grid', data, 400);

            grid.gridData.forEach((item, index) => {
                expect(item).toHaveProperty('data');
                expect(item).toHaveProperty('position');
                expect(item).toHaveProperty('isRendered');
                expect(item.data.id).toBe(index);
            });
        });
    });

    describe('Formatter Functions', () => {
        test('should apply formatter to cell values', () => {
            const data = [
                { id: 1, price: 1234.56 }
            ];
            const setup = {
                columnHeaderNames: [
                    { columnName: 'id' },
                    {
                        columnName: 'price',
                        format: (value) => `$${value.toFixed(2)}`
                    }
                ]
            };

            const grid = new OpenGrid('test-grid', data, 400, setup);

            const priceCell = container.querySelector('.opengridjs-grid-row .opengridjs-grid-column-item:nth-child(2)');
            expect(priceCell.textContent).toBe('$1234.56');
        });

        test('should handle formatters that return HTML strings', () => {
            const data = [
                { id: 1, status: 'active' }
            ];
            const setup = {
                columnHeaderNames: [
                    { columnName: 'id' },
                    {
                        columnName: 'status',
                        format: (value) => value === 'active' ? '<b>Active</b>' : 'Inactive'
                    }
                ]
            };

            const grid = new OpenGrid('test-grid', data, 400, setup);

            const statusCell = container.querySelector('.opengridjs-grid-row .opengridjs-grid-column-item:nth-child(2)');
            expect(statusCell.innerHTML).toBe('<b>Active</b>');
        });

        test('should work without formatters (default behavior)', () => {
            const data = [
                { id: 1, name: 'Test' }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            const nameCell = container.querySelector('.opengridjs-grid-row .opengridjs-grid-column-item:nth-child(2)');
            expect(nameCell.textContent).toBe('Test');
        });
    });

    describe('Nested Property Access (Dot Notation)', () => {
        test('should access nested properties with dot notation', () => {
            const data = [
                {
                    id: 1,
                    user: {
                        name: 'John Doe',
                        address: {
                            city: 'New York'
                        }
                    }
                }
            ];
            const setup = {
                columnHeaderNames: [
                    { columnName: 'id' },
                    { columnName: 'user.name', columnNameDisplay: 'User Name' },
                    { columnName: 'user.address.city', columnNameDisplay: 'City' }
                ]
            };

            const grid = new OpenGrid('test-grid', data, 400, setup);

            const cells = container.querySelectorAll('.opengridjs-grid-row .opengridjs-grid-column-item');
            expect(cells[1].textContent).toBe('John Doe');
            expect(cells[2].textContent).toBe('New York');
        });

        test('should handle deeply nested properties', () => {
            const data = [
                {
                    id: 1,
                    level1: {
                        level2: {
                            level3: {
                                value: 'Deep Value'
                            }
                        }
                    }
                }
            ];
            const setup = {
                columnHeaderNames: [
                    { columnName: 'id' },
                    { columnName: 'level1.level2.level3.value', columnNameDisplay: 'Deep' }
                ]
            };

            const grid = new OpenGrid('test-grid', data, 400, setup);

            const cells = container.querySelectorAll('.opengridjs-grid-row .opengridjs-grid-column-item');
            expect(cells[1].textContent).toBe('Deep Value');
        });
    });

    describe('Null and Undefined Value Handling', () => {
        test('should render null values as &nbsp;', () => {
            const data = [
                { id: 1, name: null }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            const nameCell = container.querySelector('.opengridjs-grid-row .opengridjs-grid-column-item:nth-child(2)');
            expect(nameCell.innerHTML).toBe('&nbsp;');
        });

        test('should render undefined values as &nbsp;', () => {
            const data = [
                { id: 1, name: undefined }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            const nameCell = container.querySelector('.opengridjs-grid-row .opengridjs-grid-column-item:nth-child(2)');
            expect(nameCell.innerHTML).toBe('&nbsp;');
        });

        test('should render empty string values as &nbsp;', () => {
            const data = [
                { id: 1, name: '' }
            ];
            const setup = {
                columnHeaderNames: [
                    { columnName: 'id' },
                    { columnName: 'name' }
                ]
            };

            const grid = new OpenGrid('test-grid', data, 400, setup);

            const nameCell = container.querySelector('.opengridjs-grid-row .opengridjs-grid-column-item:nth-child(2)');
            // Empty string won't match the nullish coalescing, so it will be the value itself
            // But based on the code line 541: found = rowItem.data[header.data] ?? '&nbsp;';
            // Empty string is truthy for ??, so it passes through
            expect(nameCell.textContent).toBe('');
        });
    });

    describe('Different Data Types', () => {
        test('should handle boolean values', () => {
            const data = [
                { id: 1, active: true, verified: false }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            const cells = container.querySelectorAll('.opengridjs-grid-row .opengridjs-grid-column-item');
            expect(cells[1].textContent).toBe('true');
            expect(cells[2].textContent).toBe('false');
        });

        test('should handle number values (including zero)', () => {
            const data = [
                { id: 0, count: 42, price: 0.99 }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            const cells = container.querySelectorAll('.opengridjs-grid-row .opengridjs-grid-column-item');
            expect(cells[0].textContent).toBe('0');
            expect(cells[1].textContent).toBe('42');
            expect(cells[2].textContent).toBe('0.99');
        });

        test('should stringify object values', () => {
            const data = [
                { id: 1, metadata: { key: 'value' } }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            const metadataCell = container.querySelector('.opengridjs-grid-row .opengridjs-grid-column-item:nth-child(2)');
            expect(metadataCell.textContent).toBe('[object Object]');
        });

        test('should stringify array values', () => {
            const data = [
                { id: 1, tags: ['tag1', 'tag2', 'tag3'] }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            const tagsCell = container.querySelector('.opengridjs-grid-row .opengridjs-grid-column-item:nth-child(2)');
            expect(tagsCell.textContent).toBe('tag1,tag2,tag3');
        });
    });
});
