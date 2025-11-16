/**
 * Test Suite 3.1: Column Reordering (Drag & Drop)
 * Phase 3 - Advanced Features
 *
 * Coverage targets:
 * - Lines 177-239 (drag and drop handlers)
 */

const OpenGrid = require('../src/opengrid.js');

describe('OpenGrid Column Reordering', () => {
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

    describe('Drag Start', () => {
        test('should set draggedColumn on dragstart', () => {
            const data = [{ id: 1, name: 'Test', age: 30 }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headerItem = container.querySelector('.opengridjs-grid-header-item');
            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = {
                effectAllowed: '',
                setData: jest.fn()
            };

            headerItem.dispatchEvent(dragStartEvent);

            expect(grid.draggedColumn).toBe(headerItem);
            expect(headerItem.classList.contains('opengridjs-dragging')).toBe(true);
        });

        test('should set dataTransfer properties on dragstart', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headerItem = container.querySelector('.opengridjs-grid-header-item');
            const setDataMock = jest.fn();
            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = {
                effectAllowed: '',
                setData: setDataMock
            };

            headerItem.dispatchEvent(dragStartEvent);

            expect(dragStartEvent.dataTransfer.effectAllowed).toBe('move');
            expect(setDataMock).toHaveBeenCalledWith('text/html', headerItem.outerHTML);
        });
    });

    describe('Drag Over', () => {
        test('should prevent default and set dropEffect', () => {
            const data = [{ id: 1, name: 'Test', age: 30 }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headerItem = container.querySelector('.opengridjs-grid-header-item');
            const dragOverEvent = new Event('dragover', { bubbles: true });
            dragOverEvent.dataTransfer = { dropEffect: '' };

            const preventDefaultSpy = jest.spyOn(dragOverEvent, 'preventDefault');
            headerItem.dispatchEvent(dragOverEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(dragOverEvent.dataTransfer.dropEffect).toBe('move');
        });
    });

    describe('Drag Enter', () => {
        test('should add drag-over class on dragenter', () => {
            const data = [{ id: 1, name: 'Test', age: 30, status: 'active' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headers = container.querySelectorAll('.opengridjs-grid-header-item');
            const firstHeader = headers[0];
            const secondHeader = headers[1];

            // Start drag on first header
            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = {
                effectAllowed: '',
                setData: jest.fn()
            };
            firstHeader.dispatchEvent(dragStartEvent);

            // Drag enter second header
            const dragEnterEvent = new Event('dragenter', { bubbles: true });
            Object.defineProperty(dragEnterEvent, 'target', { value: secondHeader, writable: false });

            const preventDefaultSpy = jest.spyOn(dragEnterEvent, 'preventDefault');
            secondHeader.dispatchEvent(dragEnterEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(secondHeader.classList.contains('opengridjs-drag-over')).toBe(true);
        });
    });

    describe('Drag Leave', () => {
        test('should remove drag-over class on dragleave', () => {
            const data = [{ id: 1, name: 'Test', age: 30 }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headerItem = container.querySelector('.opengridjs-grid-header-item');
            headerItem.classList.add('opengridjs-drag-over');

            const dragLeaveEvent = new Event('dragleave', { bubbles: true });
            Object.defineProperty(dragLeaveEvent, 'relatedTarget', { value: null, writable: false });
            headerItem.dispatchEvent(dragLeaveEvent);

            expect(headerItem.classList.contains('opengridjs-drag-over')).toBe(false);
        });
    });

    describe('Drop', () => {
        test('should reorder columns on drop', () => {
            const data = [{ id: 1, col1: 'A', col2: 'B', col3: 'C' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headers = container.querySelectorAll('.opengridjs-grid-header-item');
            const firstHeader = headers[0];
            const lastHeader = headers[headers.length - 1];

            // Get initial order
            const initialFirstHeader = grid.headerData[0].data;
            const initialLastHeader = grid.headerData[grid.headerData.length - 1].data;

            // Start drag on first header
            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = {
                effectAllowed: '',
                setData: jest.fn()
            };
            firstHeader.dispatchEvent(dragStartEvent);

            // Drop on last header
            const dropEvent = new Event('drop', { bubbles: true });
            const preventDefaultSpy = jest.spyOn(dropEvent, 'preventDefault');
            lastHeader.dispatchEvent(dropEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();

            // Verify headers were reordered
            expect(grid.headerData[0].data).not.toBe(initialFirstHeader);
        });

        test('should handle invalid drop indices gracefully', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headerItem = container.querySelector('.opengridjs-grid-header-item');

            // Remove data-order to create invalid index
            headerItem.removeAttribute('data-order');

            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = {
                effectAllowed: '',
                setData: jest.fn()
            };
            headerItem.dispatchEvent(dragStartEvent);

            const dropEvent = new Event('drop', { bubbles: true });
            jest.spyOn(dropEvent, 'preventDefault');

            // Should not throw error
            expect(() => headerItem.dispatchEvent(dropEvent)).not.toThrow();
        });

        test('should not reorder when dropping on same column', () => {
            const data = [{ id: 1, name: 'Test', age: 30 }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headerItem = container.querySelector('.opengridjs-grid-header-item');
            const initialHeaderData = [...grid.headerData];

            // Start drag
            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = {
                effectAllowed: '',
                setData: jest.fn()
            };
            headerItem.dispatchEvent(dragStartEvent);

            // Drop on same element
            const dropEvent = new Event('drop', { bubbles: true });
            headerItem.dispatchEvent(dropEvent);

            // Header data should remain unchanged
            expect(grid.headerData).toEqual(initialHeaderData);
        });
    });

    describe('Drag End', () => {
        test('should cleanup drag state on dragend', () => {
            const data = [{ id: 1, name: 'Test', age: 30 }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headers = container.querySelectorAll('.opengridjs-grid-header-item');
            headers.forEach(h => {
                h.classList.add('opengridjs-dragging');
                h.classList.add('opengridjs-drag-over');
            });

            const dragEndEvent = new Event('dragend', { bubbles: true });
            headers[0].dispatchEvent(dragEndEvent);

            // All drag classes should be removed
            headers.forEach(h => {
                expect(h.classList.contains('opengridjs-dragging')).toBe(false);
                expect(h.classList.contains('opengridjs-drag-over')).toBe(false);
            });

            expect(grid.draggedColumn).toBeNull();
        });
    });

    describe('Full Drag and Drop Sequence', () => {
        test('should successfully reorder columns through full drag-drop cycle', () => {
            const data = [{ id: 1, first: 'A', second: 'B', third: 'C' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headers = container.querySelectorAll('.opengridjs-grid-header-item');
            const firstHeader = headers[0];
            const thirdHeader = headers[2];

            // Record initial state
            const initialOrder = grid.headerData.map(h => h.data);

            // 1. Drag start
            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = {
                effectAllowed: '',
                setData: jest.fn()
            };
            firstHeader.dispatchEvent(dragStartEvent);
            expect(grid.draggedColumn).toBe(firstHeader);

            // 2. Drag over target
            const dragOverEvent = new Event('dragover', { bubbles: true });
            dragOverEvent.dataTransfer = { dropEffect: '' };
            jest.spyOn(dragOverEvent, 'preventDefault');
            thirdHeader.dispatchEvent(dragOverEvent);

            // 3. Drop
            const dropEvent = new Event('drop', { bubbles: true });
            jest.spyOn(dropEvent, 'preventDefault');
            thirdHeader.dispatchEvent(dropEvent);

            // 4. Drag end
            const dragEndEvent = new Event('dragend', { bubbles: true });
            firstHeader.dispatchEvent(dragEndEvent);

            // Verify order changed
            const finalOrder = grid.headerData.map(h => h.data);
            expect(finalOrder).not.toEqual(initialOrder);
            expect(grid.draggedColumn).toBeNull();
        });
    });
});
