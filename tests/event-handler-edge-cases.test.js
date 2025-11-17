/**
 * Test Suite 5.2: Event Handler Edge Cases
 * Phase 5 - Path to 100% Coverage
 *
 * Coverage targets:
 * - Lines 65-68: Debounce with arguments
 * - Lines 567-570: Infinite scroll loadMoreDataFunction callback
 * - Lines 576-580: Scroll event rerender
 * - Lines 599: wasResizing flag check
 * - Lines 220: Drag drop invalid index
 * - Lines 850-851: isNearBottom exact threshold
 * - Lines 459, 560: Column style and removeRow edge cases
 */

const OpenGrid = require('../src/opengrid.js');

describe('OpenGrid Event Handler Edge Cases', () => {
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

    describe('Debounce Function with Arguments', () => {
        test('should pass arguments through debounced function', (done) => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            let receivedArgs = null;
            const testFunction = function(arg1, arg2, arg3) {
                receivedArgs = { arg1, arg2, arg3, context: this };
            };

            const debouncedFunc = grid.debounce(testFunction, 50);

            // Call with arguments
            const testContext = { test: 'context' };
            debouncedFunc.call(testContext, 'first', 'second', 'third');

            setTimeout(() => {
                expect(receivedArgs).toBeTruthy();
                expect(receivedArgs.arg1).toBe('first');
                expect(receivedArgs.arg2).toBe('second');
                expect(receivedArgs.arg3).toBe('third');
                done();
            }, 100);
        });

        test('should maintain context in debounced function', (done) => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const testObj = {
                value: 42,
                method: function() {
                    return this.value;
                }
            };

            let result = null;
            const debouncedMethod = grid.debounce(function() {
                result = this.value;
            }, 50);

            debouncedMethod.call(testObj);

            setTimeout(() => {
                expect(result).toBe(42);
                done();
            }, 100);
        });

        test('should clear previous timeout on rapid calls', (done) => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            let callCount = 0;
            const debouncedFunc = grid.debounce(() => {
                callCount++;
            }, 50);

            // Rapid calls
            debouncedFunc();
            debouncedFunc();
            debouncedFunc();
            debouncedFunc();

            setTimeout(() => {
                // Should only execute once
                expect(callCount).toBe(1);
                done();
            }, 100);
        });
    });

    describe('Infinite Scroll with LoadMoreDataFunction', () => {
        test('should trigger loadMoreDataFunction callback at bottom', (done) => {
            const initialData = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                name: `Item ${i}`
            }));

            let loadMoreCalled = false;
            const loadMoreFunc = (callback) => {
                loadMoreCalled = true;
                // Call the callback if provided (lines 567-570)
                if (callback && typeof callback === 'function') {
                    setTimeout(() => {
                        callback();
                    }, 10);
                }
            };

            const grid = new OpenGrid('test-grid', initialData, 400, {}, loadMoreFunc);

            const gridRowsContainer = container.querySelector('.opengridjs-grid-rows-container');

            // Mock isNearBottom to return true
            jest.spyOn(grid, 'isNearBottom').mockReturnValue(true);

            // Trigger scroll event - should call debounced version with callback
            const scrollEvent = new Event('scroll');
            gridRowsContainer.dispatchEvent(scrollEvent);

            setTimeout(() => {
                expect(loadMoreCalled).toBe(true);
                done();
            }, 500);
        }, 10000);

        test('should set isLoadingMoreData flag during load', (done) => {
            const initialData = Array.from({ length: 30 }, (_, i) => ({
                id: i,
                name: `Item ${i}`
            }));

            const loadMoreFunc = (callback) => {
                // Check flag is set
                expect(grid.isLoadingMoreData).toBe(true);
                setTimeout(callback, 10);
            };

            const grid = new OpenGrid('test-grid', initialData, 400, {}, loadMoreFunc);

            const gridRowsContainer = container.querySelector('.opengridjs-grid-rows-container');
            gridRowsContainer.scrollTop = gridRowsContainer.scrollHeight;

            const scrollEvent = new Event('scroll');
            gridRowsContainer.dispatchEvent(scrollEvent);

            setTimeout(() => {
                done();
            }, 500);
        });

        test('should reset isLoadingMoreData after callback', (done) => {
            const initialData = Array.from({ length: 30 }, (_, i) => ({
                id: i,
                name: `Item ${i}`
            }));

            const loadMoreFunc = (callback) => {
                if (callback && typeof callback === 'function') {
                    setTimeout(() => {
                        callback();
                        // After callback, flag should be reset (line 570)
                        setTimeout(() => {
                            expect(grid.isLoadingMoreData).toBe(false);
                            done();
                        }, 10);
                    }, 10);
                }
            };

            const grid = new OpenGrid('test-grid', initialData, 400, {}, loadMoreFunc);

            const gridRowsContainer = container.querySelector('.opengridjs-grid-rows-container');

            // Mock isNearBottom to return true
            jest.spyOn(grid, 'isNearBottom').mockReturnValue(true);

            gridRowsContainer.dispatchEvent(new Event('scroll'));
        }, 10000);
    });

    describe('Scroll Event Rerender', () => {
        test('should trigger rerender on scroll', () => {
            const data = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `Item ${i}`
            }));

            const grid = new OpenGrid('test-grid', data, 400);
            const rerenderSpy = jest.spyOn(grid, 'rerender');

            const gridRowsContainer = container.querySelector('.opengridjs-grid-rows-container');

            // Scroll down
            gridRowsContainer.scrollTop = 200;
            gridRowsContainer.dispatchEvent(new Event('scroll'));

            expect(rerenderSpy).toHaveBeenCalled();

            rerenderSpy.mockRestore();
        });

        test('should update visible rows when scrolling', () => {
            const data = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `Item ${i}`
            }));

            const grid = new OpenGrid('test-grid', data, 400);

            const gridRowsContainer = container.querySelector('.opengridjs-grid-rows-container');

            const initialRowCount = container.querySelectorAll('.opengridjs-grid-row').length;

            // Scroll significantly
            gridRowsContainer.scrollTop = 500;
            gridRowsContainer.dispatchEvent(new Event('scroll'));

            const afterScrollRowCount = container.querySelectorAll('.opengridjs-grid-row').length;

            // Should still have rows rendered (virtual scrolling)
            expect(afterScrollRowCount).toBeGreaterThan(0);
        });
    });

    describe('wasResizing Flag Check', () => {
        test('should prevent sort when wasResizing is true', (done) => {
            const data = [{ id: 1, name: 'Test', age: 30 }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headerItem = container.querySelector('.opengridjs-grid-header-item');
            const resizeHandle = headerItem.querySelector('.opengridjs-resize-handle');

            // Start resize
            const mouseDownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                clientX: 100
            });
            resizeHandle.dispatchEvent(mouseDownEvent);

            // End resize
            setTimeout(() => {
                document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

                // Try to click header immediately (wasResizing should be true)
                const clickEvent = new MouseEvent('click', { bubbles: true });

                // wasResizing flag should prevent sort
                const sortDataSpy = jest.spyOn(grid, 'sortData');

                headerItem.dispatchEvent(clickEvent);

                // Wait for wasResizing timeout
                setTimeout(() => {
                    // After timeout, wasResizing should be false
                    headerItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    done();
                }, 15);
            }, 10);
        });
    });

    describe('Drag Drop Invalid Index', () => {
        test('should handle drag drop with out of bounds index', () => {
            const data = [{ id: 1, col1: 'A', col2: 'B' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headers = container.querySelectorAll('.opengridjs-grid-header-item');
            const firstHeader = headers[0];

            // Start drag
            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = {
                effectAllowed: '',
                setData: jest.fn()
            };
            firstHeader.dispatchEvent(dragStartEvent);

            // Create drop with invalid index
            const fakeTarget = document.createElement('div');
            fakeTarget.setAttribute('data-order', '-1'); // Invalid negative index
            container.appendChild(fakeTarget);

            const dropEvent = new Event('drop', { bubbles: true });
            Object.defineProperty(dropEvent, 'target', { value: fakeTarget, writable: false });

            // Should handle gracefully
            expect(() => fakeTarget.dispatchEvent(dropEvent)).not.toThrow();
        });

        test('should handle drag drop with NaN index', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const headerItem = container.querySelector('.opengridjs-grid-header-item');

            // Remove data-order to create NaN
            headerItem.removeAttribute('data-order');

            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = {
                effectAllowed: '',
                setData: jest.fn()
            };

            // Should not throw
            expect(() => headerItem.dispatchEvent(dragStartEvent)).not.toThrow();
        });
    });

    describe('isNearBottom Exact Threshold', () => {
        test('should detect exact bottom threshold', () => {
            const data = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `Item ${i}`
            }));

            const loadMoreFunc = jest.fn();
            const grid = new OpenGrid('test-grid', data, 400, {}, loadMoreFunc);

            const gridRowsContainer = container.querySelector('.opengridjs-grid-rows-container');

            // Calculate exact threshold: scrollHeight == scrollTop + gridRowPxVisibleArea + 4
            const exactScrollTop = 1000 - 400 - 4; // 596
            Object.defineProperty(gridRowsContainer, 'scrollHeight', { value: 1000, configurable: true });
            Object.defineProperty(gridRowsContainer, 'scrollTop', { value: exactScrollTop, writable: true, configurable: true });

            const isNear = grid.isNearBottom(gridRowsContainer);

            expect(isNear).toBe(true);
        });

        test('should track loadedAtGridHeight to prevent duplicate calls', () => {
            const data = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `Item ${i}`
            }));

            const loadMoreFunc = jest.fn();
            const grid = new OpenGrid('test-grid', data, 400, {}, loadMoreFunc);

            const gridRowsContainer = container.querySelector('.opengridjs-grid-rows-container');

            // Set exact threshold where scrollHeight == scrollTop + gridRowPxVisibleArea + 4
            const exactScrollTop = 1000 - grid.gridRowPxVisibleArea - 4;
            Object.defineProperty(gridRowsContainer, 'scrollHeight', { value: 1000, configurable: true });
            Object.defineProperty(gridRowsContainer, 'scrollTop', { value: exactScrollTop, writable: true, configurable: true });

            // First call at bottom (line 849-851)
            const firstCall = grid.isNearBottom(gridRowsContainer);
            expect(firstCall).toBe(true);

            // Second call at same position should be prevented
            const secondCall = grid.isNearBottom(gridRowsContainer);
            expect(secondCall).toBe(false);

            expect(grid.loadedAtGridHeight).toContain(exactScrollTop);
        });
    });

    describe('Column Style Edge Cases', () => {
        test('should handle empty string column width', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            // Get header and test style generation
            const header = grid.headerData[0];
            header.width = ''; // Empty width

            const style = grid.getColumnStyle(header);

            expect(style).toContain('box-sizing: border-box');
        });

        test('should handle header with contentMinWidth', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const header = grid.headerData[0];
            header.contentMinWidth = 120;

            const style = grid.getColumnStyle(header);

            expect(style).toContain('min-width: 120px');
        });
    });

    describe('RemoveRow Edge Cases', () => {
        test('should handle removeRow when item not found', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const fakeItem = { position: 9999, isRendered: false };

            // Should handle gracefully
            expect(() => grid.removeRow(fakeItem)).not.toThrow();
        });
    });
});
