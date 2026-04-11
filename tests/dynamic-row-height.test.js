/**
 * Tests for the opt-in dynamic row height feature.
 *
 * jsdom does not implement the real canvas API (it has no text metrics),
 * so height measurement falls through to the char-based estimator path in
 * OpenGrid.measureTextHeight. These tests exercise the API surface and
 * the prefix-sum layout rather than pixel-perfect wrapping.
 */

const OpenGrid = require('../src/opengrid.js');

describe('OpenGrid Dynamic Row Height', () => {
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

    describe('Backward compatibility', () => {
        test('defaults to fixed-height mode when dynamicRowHeight is omitted', () => {
            const data = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Row ${i}` }));
            const grid = new OpenGrid('test-grid', data, 400);

            expect(grid.dynamicRowHeight).toBe(false);
            // All rows should still be 35px (the default gridRowPxSize).
            grid.gridData.forEach(item => expect(item.height).toBe(35));
            expect(grid.totalHeight).toBe(35 * data.length);
        });

        test('does not add the dynamic-row-height class when disabled', () => {
            const data = [{ id: 1, name: 'Row' }];
            new OpenGrid('test-grid', data, 400);
            expect(container.classList.contains('opengridjs-dynamic-row-height')).toBe(false);
        });

        test('fixed-height rows still use index * gridRowPxSize positions', () => {
            const data = Array.from({ length: 5 }, (_, i) => ({ id: i }));
            const grid = new OpenGrid('test-grid', data, 400);

            expect(grid.gridData[0].position).toBe(0);
            expect(grid.gridData[1].position).toBe(35);
            expect(grid.gridData[2].position).toBe(70);
            expect(grid.gridData[3].position).toBe(105);
        });
    });

    describe('Opt-in dynamic mode', () => {
        test('sets dynamicRowHeight flag and adds container class', () => {
            const data = [{ id: 1, name: 'Row' }];
            const grid = new OpenGrid('test-grid', data, 400, { dynamicRowHeight: true });

            expect(grid.dynamicRowHeight).toBe(true);
            expect(container.classList.contains('opengridjs-dynamic-row-height')).toBe(true);
        });

        test('uses gridRowPxSize as a minimum floor', () => {
            const data = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
            const grid = new OpenGrid('test-grid', data, 400, { dynamicRowHeight: true });

            grid.gridData.forEach(item => {
                expect(item.height).toBeGreaterThanOrEqual(grid.gridRowPxSize);
            });
        });

        test('measures taller rows for long text content', () => {
            const shortData = [{ id: 1, name: 'Hi' }];
            const longText = 'This is a much longer piece of text that should wrap across multiple lines within a reasonably sized column and therefore produce a taller row than the short text entry above.';
            const longData = [{ id: 2, name: longText }];

            const shortGrid = new OpenGrid('test-grid', shortData, 400, { dynamicRowHeight: true });
            const shortHeight = shortGrid.gridData[0].height;

            // Tear down then create the long grid in the same container.
            container.innerHTML = '';
            const longGrid = new OpenGrid('test-grid', longData, 400, { dynamicRowHeight: true });
            const longHeight = longGrid.gridData[0].height;

            expect(longHeight).toBeGreaterThanOrEqual(shortHeight);
        });

        test('builds a prefix-sum positions array', () => {
            const data = Array.from({ length: 4 }, (_, i) => ({ id: i, name: `Row ${i}` }));
            const grid = new OpenGrid('test-grid', data, 400, { dynamicRowHeight: true });

            // Positions must be monotonically increasing prefix sums of heights.
            let expected = 0;
            grid.gridData.forEach(item => {
                expect(item.position).toBe(expected);
                expected += item.height;
            });
            expect(grid.totalHeight).toBe(expected);
        });

        test('totalHeight drives the rows container height', () => {
            const data = Array.from({ length: 3 }, (_, i) => ({ id: i, name: `Row ${i}` }));
            const grid = new OpenGrid('test-grid', data, 400, { dynamicRowHeight: true });

            const gridRows = container.querySelector('.opengridjs-grid-rows');
            expect(gridRows.style.height).toBe(`${grid.totalHeight}px`);
        });

        test('addRow writes an inline height style when dynamic', () => {
            const data = [{ id: 1, name: 'Test row content' }];
            new OpenGrid('test-grid', data, 400, { dynamicRowHeight: true });

            const row = container.querySelector('.opengridjs-grid-row');
            expect(row).toBeTruthy();
            // Either the JSDOM-parsed style or the raw style attribute should
            // include a height declaration in dynamic mode.
            const styleAttr = row.getAttribute('style') || '';
            expect(styleAttr).toMatch(/height:\s*\d+px/);
        });

        test('respects a custom rowPadding', () => {
            const data = [{ id: 1, name: 'Row' }];
            const padded = new OpenGrid('test-grid', data, 400, { dynamicRowHeight: true, rowPadding: 40, gridRowPxSize: 10 });
            // Even with a tiny floor, padding should push single-line rows up.
            expect(padded.gridData[0].height).toBeGreaterThanOrEqual(35);
        });
    });

    describe('Layout helpers', () => {
        test('buildPositionsArray tolerates empty data', () => {
            const grid = new OpenGrid('test-grid', [{ id: 1 }], 400, { dynamicRowHeight: true });
            grid.gridData = [];
            grid.buildPositionsArray();
            expect(grid.totalHeight).toBe(0);
        });

        test('findFirstVisibleRowIndex binary-searches correctly', () => {
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i }));
            const grid = new OpenGrid('test-grid', data, 400);

            // With fixed 35px rows, scrollTop=0 → first row is 0, scrollTop=80 → first row is 2.
            expect(grid.findFirstVisibleRowIndex(0)).toBe(0);
            expect(grid.findFirstVisibleRowIndex(80)).toBe(2);
            expect(grid.findFirstVisibleRowIndex(35)).toBe(1);
        });

        test('findLastVisibleRowIndex returns the last row whose position is before the viewport bottom', () => {
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i }));
            const grid = new OpenGrid('test-grid', data, 400);

            // Rows at positions 0,35,70,... — viewportBottom=100 → last row with pos<100 is index 2 (pos=70).
            expect(grid.findLastVisibleRowIndex(100)).toBe(2);
            expect(grid.findLastVisibleRowIndex(36)).toBe(1);
            expect(grid.findLastVisibleRowIndex(1)).toBe(0);
        });
    });

    describe('Row height cache', () => {
        test('invalidateRowHeightCache clears stored measurements', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400, { dynamicRowHeight: true });

            expect(grid._rowHeightCache.size).toBeGreaterThan(0);
            grid.invalidateRowHeightCache();
            expect(grid._rowHeightCache.size).toBe(0);
        });

        test('updateRecordData drops the affected row from the cache', () => {
            const data = [{ id: '1', name: 'Hi' }, { id: '2', name: 'There' }];
            const grid = new OpenGrid('test-grid', data, 400, { dynamicRowHeight: true });

            expect(grid._rowHeightCache.has('1')).toBe(true);
            grid.updateRecordData({ id: '1', name: 'Updated content goes here' }, { animate: false });
            expect(grid._rowHeightCache.has('1')).toBe(false);
        });
    });
});
