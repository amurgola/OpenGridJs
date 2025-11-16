/**
 * Test Suite 3.2: Column Resizing
 * Phase 3 - Advanced Features
 *
 * Coverage targets:
 * - Lines 241-306 (resize event handlers)
 * - Lines 308-481 (width calculation methods)
 */

const OpenGrid = require('../src/opengrid.js');

describe('OpenGrid Column Resizing', () => {
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

    describe('Resize Handle Events', () => {
        test('should start resize on mousedown', () => {
            const data = [{ id: 1, name: 'Test', age: 30 }];
            const grid = new OpenGrid('test-grid', data, 400);

            const resizeHandle = container.querySelector('.opengridjs-resize-handle');
            const headerItem = resizeHandle.closest('.opengridjs-grid-header-item');

            const mouseDownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                clientX: 100
            });

            resizeHandle.dispatchEvent(mouseDownEvent);

            // Header should get resizing class
            expect(headerItem.classList.contains('opengridjs-resizing')).toBe(true);
            // Draggable should be disabled during resize
            expect(headerItem.getAttribute('draggable')).toBe('false');
        });

        test('should update width on mousemove during resize', (done) => {
            const data = [{ id: 1, name: 'Test', age: 30 }];
            const grid = new OpenGrid('test-grid', data, 400);

            const resizeHandle = container.querySelector('.opengridjs-resize-handle');
            const headerItem = resizeHandle.closest('.opengridjs-grid-header-item');
            const initialWidth = headerItem.offsetWidth;

            // Start resize
            const mouseDownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                clientX: 100
            });
            resizeHandle.dispatchEvent(mouseDownEvent);

            // Simulate mouse move
            setTimeout(() => {
                const mouseMoveEvent = new MouseEvent('mousemove', {
                    bubbles: true,
                    clientX: 150 // 50px increase
                });
                document.dispatchEvent(mouseMoveEvent);

                // Width should be updated (with minimum constraint)
                const headerIndex = parseInt(headerItem.getAttribute('data-order'));
                expect(grid.headerData[headerIndex].width).toContain('min-width:');

                done();
            }, 10);
        });

        test('should end resize on mouseup', (done) => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const resizeHandle = container.querySelector('.opengridjs-resize-handle');
            const headerItem = resizeHandle.closest('.opengridjs-grid-header-item');

            // Start resize
            resizeHandle.dispatchEvent(new MouseEvent('mousedown', {
                bubbles: true,
                clientX: 100
            }));

            expect(headerItem.classList.contains('opengridjs-resizing')).toBe(true);

            // End resize
            setTimeout(() => {
                document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

                setTimeout(() => {
                    expect(headerItem.classList.contains('opengridjs-resizing')).toBe(false);
                    expect(headerItem.getAttribute('draggable')).toBe('true');
                    done();
                }, 20);
            }, 10);
        });

        test('should enforce minimum width constraint during resize', (done) => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const resizeHandle = container.querySelector('.opengridjs-resize-handle');
            const headerItem = resizeHandle.closest('.opengridjs-grid-header-item');

            // Start resize
            resizeHandle.dispatchEvent(new MouseEvent('mousedown', {
                bubbles: true,
                clientX: 200
            }));

            // Try to resize to very small width
            setTimeout(() => {
                document.dispatchEvent(new MouseEvent('mousemove', {
                    bubbles: true,
                    clientX: 50 // Would make it negative
                }));

                const headerIndex = parseInt(headerItem.getAttribute('data-order'));
                const widthMatch = grid.headerData[headerIndex].width.match(/min-width:(\d+)px/);

                if (widthMatch) {
                    const width = parseInt(widthMatch[1]);
                    // Should be at least 80px (default minimum)
                    expect(width).toBeGreaterThanOrEqual(80);
                }

                done();
            }, 10);
        });

        test('should trigger autoResize on double-click', () => {
            const data = [{ id: 1, name: 'Test', description: 'Long text' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const resizeHandle = container.querySelector('.opengridjs-resize-handle');
            const autoResizeSpy = jest.spyOn(grid, 'autoResizeColumns');

            const dblClickEvent = new MouseEvent('dblclick', { bubbles: true });
            resizeHandle.dispatchEvent(dblClickEvent);

            expect(autoResizeSpy).toHaveBeenCalled();
        });

        test('should prevent sort after resize (wasResizing flag)', (done) => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const resizeHandle = container.querySelector('.opengridjs-resize-handle');
            const headerItem = resizeHandle.closest('.opengridjs-grid-header-item');

            // Start resize
            resizeHandle.dispatchEvent(new MouseEvent('mousedown', {
                bubbles: true,
                clientX: 100
            }));

            // End resize
            setTimeout(() => {
                document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

                // wasResizing flag should be set
                expect(headerItem._wasResizing()).toBe(true);

                // After 10ms delay, it should reset
                setTimeout(() => {
                    expect(headerItem._wasResizing()).toBe(false);
                    done();
                }, 15);
            }, 10);
        });
    });

    describe('Width Calculation Methods', () => {
        test('should calculate content minimum widths', () => {
            const data = [
                { id: 1, name: 'Short', veryLongColumnName: 'This is a very long text value' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            grid.calculateContentMinWidths();

            // Headers should have contentMinWidth set
            grid.headerData.forEach(header => {
                expect(header.contentMinWidth).toBeDefined();
                expect(header.contentMinWidth).toBeGreaterThanOrEqual(80); // Minimum 80px
            });
        });

        test('should measure text width using estimateTextWidth fallback', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const testElement = document.createElement('span');
            testElement.textContent = 'Sample Text';

            // estimateTextWidth is the fallback when canvas fails (which it does in jsdom)
            const width = grid.estimateTextWidth('Sample Text', testElement);

            expect(width).toBeGreaterThan(0);
            expect(typeof width).toBe('number');
        });

        test('should handle empty text in width measurement', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const width = grid.estimateTextWidth('', document.createElement('span'));

            expect(width).toBe(0);
        });

        test('should use character-based estimation when DOM fails', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            // Create element without appending to DOM
            const tempElement = document.createElement('span');

            const text = 'ABCDEFGHIJ'; // 10 characters
            const width = grid.estimateTextWidth(text, tempElement);

            // Should estimate ~7px per character (70px for 10 chars)
            expect(width).toBeGreaterThan(0);
        });
    });

    describe('Column Style Methods', () => {
        test('should generate correct column style for fixed width', () => {
            const data = [{ id: 1, name: 'Test' }];
            const setup = {
                columnHeaderNames: [
                    { columnName: 'id', columnWidth: '100px' }
                ]
            };
            const grid = new OpenGrid('test-grid', data, 400, setup);

            const header = grid.headerData.find(h => h.data === 'id');
            const style = grid.getColumnStyle(header);

            expect(style).toContain('flex-grow: 0');
            expect(style).toContain('flex-shrink: 0');
            expect(style).toContain('box-sizing: border-box');
        });

        test('should generate correct column style for percentage width', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const header = grid.headerData[0];
            const style = grid.getColumnStyle(header);

            expect(style).toContain('box-sizing: border-box');
        });

        test('should include contentMinWidth in column style when set', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            // Manually set contentMinWidth
            grid.headerData[0].contentMinWidth = 150;

            const style = grid.getColumnStyle(grid.headerData[0]);

            expect(style).toContain('min-width: 150px');
        });
    });

    describe('Auto Resize Columns', () => {
        test('should reset all columns to equal width', () => {
            const data = [{ id: 1, col1: 'A', col2: 'B', col3: 'C' }];
            const grid = new OpenGrid('test-grid', data, 400);

            grid.autoResizeColumns();

            // All columns should have equal width
            const widths = grid.headerData.map(h => h.width);
            const firstWidth = widths[0];

            widths.forEach(width => {
                expect(width).toBe(firstWidth);
            });
        });

        test('should calculate equal width based on container width', () => {
            const data = [{ id: 1, name: 'Test', age: 30 }];
            const grid = new OpenGrid('test-grid', data, 400);

            const gridHeader = container.querySelector('.opengridjs-grid-header');
            const containerWidth = gridHeader.offsetWidth;
            const columnCount = grid.headerData.length;

            grid.autoResizeColumns();

            const expectedWidth = Math.floor(containerWidth / columnCount);

            grid.headerData.forEach(header => {
                expect(header.width).toContain(`${expectedWidth}px`);
            });
        });
    });
});
