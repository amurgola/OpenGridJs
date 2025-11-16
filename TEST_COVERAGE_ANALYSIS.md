# OpenGridJs - Test Coverage Analysis & Path to 100%

**Date:** 2025-11-16
**Analyzed File:** `src/opengrid.js` (1,254 lines)
**Current Coverage:** 0% (all metrics)

---

## Executive Summary

The OpenGridJs project currently shows **0% code coverage** despite having 12 comprehensive test files with 2,702 lines of test code. The root cause is that tests load the source code using `eval()`/`new Function()` which bypasses Jest's code instrumentation, preventing coverage tracking.

### Current State
- **Test Files:** 12 files with 128 total tests (125 passing, 3 failing)
- **Test Approach:** Mix of static analysis (grep testing) and DOM integration tests
- **Coverage Tool:** Jest with jsdom environment
- **Problem:** Source code loaded outside Jest's module system

---

## Why Coverage is 0%

### Root Cause
The tests load OpenGrid using this pattern:

```javascript
// tests/filter.test.js (line 10-14)
beforeAll(() => {
    const openGridSource = fs.readFileSync(path.join(__dirname, '../src/opengrid.js'), 'utf8');
    const wrapper = new Function(openGridSource + '; window.OpenGrid = OpenGrid;');
    wrapper();  // ⚠️ This executes OUTSIDE Jest's instrumentation
});
```

### Impact
- Jest cannot track which lines are executed
- Coverage reports show 0% for all metrics
- No insight into actual test effectiveness

### Solution Required
Export OpenGrid as a proper module and import it using `require()` or `import`:

```javascript
// src/opengrid.js (add at end of file)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenGrid;
}

// tests/filter.test.js
const OpenGrid = require('../src/opengrid.js');
```

---

## Complete OpenGrid Class Structure

### Class Properties (10 properties)
| Property | Type | Purpose | Initialized In |
|----------|------|---------|----------------|
| `loadMoreDataFunction` | Function/null | Callback for infinite scroll | Constructor |
| `canLoadMoreData` | Boolean | Flag to enable/disable infinite scroll | Constructor |
| `isLoadingMoreData` | Boolean | Loading state flag | Constructor |
| `loadedAtGridHeight` | Array | Track scroll positions for load triggers | Constructor |
| `className` | String | CSS class for root element | Constructor |
| `sortState` | Object | Current sort column and direction | Constructor |
| `gridData` | Array | Processed data with metadata | Constructor |
| `headerData` | Array | Column configuration | Constructor |
| `columnFilters` | Object | Active filters per column | Constructor |
| `filteredData` | Array/null | Currently filtered dataset | Constructor |

### Public Methods (30 methods)

#### Core Initialization & Data Processing (6 methods)
1. **`constructor(className, data, gridHeight, setup, loadMoreDataFunction)`** - Lines 7-60
   - Initializes grid with sync or async data
   - Sets up DOM structure
   - Handles auto-resizing

2. **`initGrid()`** - Lines 80-86
   - Creates DOM skeleton (header, rows container)

3. **`processData(data)`** - Lines 88-101
   - Transforms raw data into grid format
   - Adds position metadata
   - Generates GUIDs for missing IDs

4. **`generateGUID()`** - Lines 72-78
   - Creates RFC4122 v4 UUIDs

5. **`generateGridHeader(setup, headerDataOverride)`** - Lines 103-175
   - Builds column headers
   - Adds drag-drop listeners
   - Adds resize handles

6. **`generateGridRows()`** - Lines 483-492
   - Sets up virtual scrolling container
   - Triggers initial render

#### Virtual Scrolling & Rendering (4 methods)
7. **`renderVisible(gridRowsContainer, gridRows)`** - Lines 504-523
   - Calculates visible rows
   - Adds/removes DOM elements efficiently

8. **`addRow(gridRows, rowItem)`** - Lines 525-553
   - Renders individual row
   - Applies formatters
   - Handles nested properties (dot notation)

9. **`removeRow(rowItem)`** - Lines 555-562
   - Removes row from DOM

10. **`rerender()`** - Lines 494-502
    - Full grid refresh
    - Preserves filters

#### Sorting & Filtering (6 methods)
11. **`sortData()`** - Lines 652-672
    - Sorts gridData by current sortState
    - Handles null values
    - Recalculates positions

12. **`searchFilter(term)`** - Lines 673-681
    - Global text search across all columns

13. **`toggleFilterMenu(filterButton)`** - Lines 1020-1037
    - Shows/hides filter menu for a column

14. **`showFilterMenu(filterButton, column)`** - Lines 1039-1106
    - Creates filter UI with checkboxes
    - Positions menu below header

15. **`applyColumnFilter(column, selectedValues)`** - Lines 1182-1196
    - Stores filter state
    - Triggers refilter

16. **`applyAllFilters()`** - Lines 1198-1218
    - Combines all column filters
    - Maintains sort order

17. **`clearAllFilters()`** - Lines 1237-1247
    - Resets all filters
    - Restores original data

18. **`updateFilterIndicators()`** - Lines 1220-1235
    - Visual feedback for active filters

#### Column Operations (9 methods)
19. **`handleDragStart(e)`** - Lines 177-184
    - Initiates column reordering

20. **`handleDragOver(e)`** - Lines 186-189
    - Allows drop operation

21. **`handleDragEnter(e)`** - Lines 191-197
    - Visual feedback on hover

22. **`handleDragLeave(e)`** - Lines 199-204
    - Removes hover feedback

23. **`handleDrop(e)`** - Lines 206-231
    - Reorders columns in headerData
    - Regenerates header

24. **`handleDragEnd(e)`** - Lines 233-239
    - Cleanup drag state

25. **`addResizeHandleEvents(resizeHandle, headerItem)`** - Lines 241-306
    - Mouse events for column resizing
    - Double-click to auto-resize

26. **`updateColumnWidths()`** - Lines 308-325
    - Syncs column widths across headers and cells

27. **`calculateContentMinWidths()`** - Lines 327-371
    - Measures content to set minimum widths
    - Samples first 10 rows for performance

28. **`measureTextWidth(text, element)`** - Lines 373-394
    - Canvas-based text measurement
    - Fallback for JSDOM

29. **`estimateTextWidth(text, element)`** - Lines 396-432
    - DOM-based text measurement fallback

30. **`updateHeaderWidths()`** - Lines 434-442
    - Applies calculated widths to headers

31. **`getColumnStyle(header)`** - Lines 444-461
    - Generates CSS for column sizing

32. **`autoResizeColumns()`** - Lines 463-481
    - Resets all columns to equal width

#### Event Handling (2 methods)
33. **`addEventListeners(setup)`** - Lines 564-584
    - Scroll event for virtual scrolling
    - Infinite scroll trigger

34. **`addHeaderActions()`** - Lines 586-650
    - Click handler for sorting
    - Right-click for filter menu
    - Resize operation detection

#### Context Menu & Actions (4 methods)
35. **`createContextMenu(options)`** - Lines 688-773
    - Right-click menu on rows
    - Default: Copy Row, Export to CSV

36. **`copyRow(rowData)`** - Lines 775-797
    - Copies row to clipboard
    - Modern API + fallback

37. **`fallbackCopyToClipboard(text)`** - Lines 799-818
    - Legacy clipboard method

38. **`exportToCSV()`** - Lines 820-836
    - Exports all data to CSV file

39. **`closeContextMenu(action)`** - Lines 838-845
    - Removes context menu from DOM

#### Data Management (7 methods)
40. **`reset()`** - Lines 683-686
    - Resets to original data

41. **`appendData(newData)`** - Lines 856-876
    - Adds data to end (infinite scroll)
    - Supports sync/async

42. **`updateData(newData)`** - Lines 878-890
    - Replaces entire dataset
    - Supports sync/async

43. **`updateRecordData(newData, options)`** - Lines 892-953
    - Updates specific records by ID
    - Optional animation
    - Batch updates supported

44. **`updateRecordVisually(recordId, newData, changedFields, animate, highlightDuration)`** - Lines 955-989
    - Updates DOM without full rerender
    - Applies formatters

45. **`animateFieldChange(element, change, duration)`** - Lines 991-1014
    - Adds CSS classes for visual feedback
    - Detects numeric increases/decreases

46. **`stopLoadingMoreData()`** - Lines 1016-1018
    - Disables infinite scroll

#### Utility Methods (4 methods)
47. **`debounce(func, delay)`** - Lines 62-70
    - Rate limiting for scroll events

48. **`isNearBottom(container)`** - Lines 847-854
    - Detects scroll position for infinite load

49. **`getUniqueColumnValues(column)`** - Lines 1163-1180
    - Extracts distinct values for filters
    - Sorts results

50. **`escapeHtml(text)`** - Lines 1249-1253
    - XSS prevention

51. **`attachFilterMenuEvents(filterMenu, column, uniqueValues)`** - Lines 1108-1153
    - Wires up filter menu interactions

52. **`closeFilterMenuOnClickOutside`** - Lines 1155-1161
    - Arrow function for event cleanup

---

## Test Coverage Gaps

### What's Currently Tested
✅ Static analysis (method existence in source code)
✅ Basic grid initialization
✅ Filter menu rendering and interaction
✅ Sort functionality
✅ Column width constraints
✅ Multiple grid instances
✅ Context menu basics

### Critical Gaps (No Coverage)

#### 1. Constructor Branches
- ❌ Empty data array handling (line 45-46)
- ❌ Async data loading path (lines 25-42)
- ❌ Setup object variations
- ❌ Custom context menu options

#### 2. Data Processing
- ❌ GUID generation for missing IDs (lines 90-91)
- ❌ Nested property access with dot notation (lines 534-539)
- ❌ Null/undefined value handling in cells

#### 3. Sorting
- ❌ Null value handling in sort (lines 660-661)
- ❌ Sort state preservation during filter

#### 4. Column Operations
- ❌ Invalid drag indices (lines 217-221)
- ❌ Resize operation flag checking (lines 598-600)
- ❌ Canvas context availability (lines 379-381)
- ❌ Text width estimation fallback (lines 424-429)

#### 5. Virtual Scrolling
- ❌ Scroll position calculations
- ❌ Row visibility determination
- ❌ isNearBottom edge cases (line 848)

#### 6. Filter System
- ❌ Multiple active filters
- ❌ Filter with empty values
- ❌ Filter search functionality
- ❌ Select all / Clear all buttons
- ❌ Filter persistence during sort

#### 7. Data Updates
- ❌ updateRecordData with animation
- ❌ updateRecordVisually when row not visible (line 960)
- ❌ Numeric change detection (lines 995-1008)
- ❌ Batch record updates

#### 8. Infinite Scroll
- ❌ loadMoreDataFunction callback
- ❌ isNearBottom tracking with loadedAtGridHeight
- ❌ canLoadMoreData flag toggling
- ❌ Empty data handling (lines 863-865, 872-874)

#### 9. Export & Clipboard
- ❌ CSV export content validation
- ❌ Clipboard API success path
- ❌ Clipboard API failure → fallback
- ❌ execCommand fallback

#### 10. Error Handling
- ❌ Invalid header data (lines 138-141)
- ❌ Missing row ID in context menu (lines 722-725)
- ❌ Canvas measurement errors (lines 390-393)
- ❌ Record update with missing ID (lines 903-906, 950-951)

#### 11. Edge Cases
- ❌ Zero columns
- ❌ Single column
- ❌ Empty dataset
- ❌ Very large datasets (10,000+ rows)
- ❌ Special characters in column names
- ❌ HTML injection attempts

---

## Path to 100% Coverage

### Phase 1: Foundation Setup (Week 1)
**Goal:** Enable actual coverage tracking

#### Task 1.1: Make OpenGrid a Module
**File:** `src/opengrid.js`

Add at end of file (after line 1254):
```javascript
// Export for Node.js/Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenGrid;
}
```

**Estimated Impact:** Enables coverage tracking
**Lines Affected:** 1 line added

#### Task 1.2: Update Test Loading Pattern
**Files:** All 12 test files

Replace:
```javascript
const openGridSource = fs.readFileSync(path.join(__dirname, '../src/opengrid.js'), 'utf8');
const wrapper = new Function(openGridSource + '; window.OpenGrid = OpenGrid;');
wrapper();
```

With:
```javascript
const OpenGrid = require('../src/opengrid');
```

**Estimated Impact:** Immediate coverage reporting
**Files to Update:**
- filter.test.js
- default-context-menu.test.js
- multiple-grid-and-right-click.test.js
- All other integration tests

#### Task 1.3: Run Baseline Coverage Report
```bash
npm run test:coverage
```

**Expected Output:** Coverage metrics (likely 40-60% to start)

---

### Phase 2: Core Functionality (Week 2)
**Goal:** 70% coverage

#### Test Suite 2.1: Constructor & Initialization
**New File:** `tests/constructor.test.js`

**Test Cases (15 tests):**
1. ✓ Constructor with sync data
2. ✓ Constructor with async data (Promise)
3. ✓ Constructor with empty array
4. ✓ Constructor with single row
5. ✓ Constructor with custom setup.contextMenuOptions
6. ✓ Constructor with custom setup.contextMenuTitle
7. ✓ Constructor with custom setup.columnHeaderNames
8. ✓ Constructor with loadMoreDataFunction
9. ✓ Auto-resize triggers after initialization
10. ✓ gridColumnNames extraction from data
11. ✓ GUID generation for missing IDs
12. ✓ GUID generation for null IDs
13. ✓ GUID generation for empty string IDs
14. ✓ Multiple grids with different classNames
15. ✓ Grid with no data (empty array)

**Coverage Target:** Lines 7-60 (constructor), 72-78 (GUID), 80-101 (init/process)

#### Test Suite 2.2: Data Processing & Formatters
**New File:** `tests/data-processing.test.js`

**Test Cases (12 tests):**
1. ✓ processData with valid data array
2. ✓ processData calculates correct positions (35px per row)
3. ✓ Nested property access with dot notation (e.g., "user.address.city")
4. ✓ Formatter function applied to cell values
5. ✓ Null values in cells render as &nbsp;
6. ✓ Undefined values in cells render as &nbsp;
7. ✓ Empty string values in cells render as &nbsp;
8. ✓ Boolean values in cells
9. ✓ Date objects in cells
10. ✓ Object values in cells (should stringify)
11. ✓ Array values in cells (should stringify)
12. ✓ Special characters in data (HTML escaping)

**Coverage Target:** Lines 88-101, 525-553

#### Test Suite 2.3: Virtual Scrolling
**New File:** `tests/virtual-scrolling.test.js`

**Test Cases (10 tests):**
1. ✓ renderVisible adds rows in viewport
2. ✓ renderVisible removes rows outside viewport
3. ✓ Scroll down triggers rerender
4. ✓ Scroll up triggers rerender
5. ✓ isNearBottom returns true at bottom
6. ✓ isNearBottom returns false mid-scroll
7. ✓ isNearBottom tracks loadedAtGridHeight
8. ✓ Virtual scrolling with 10,000 rows (performance)
9. ✓ Row positioning calculation (position = index * 35)
10. ✓ isRendered flag management

**Coverage Target:** Lines 504-523, 847-854

---

### Phase 3: Advanced Features (Week 3)
**Goal:** 85% coverage

#### Test Suite 3.1: Column Reordering (Drag & Drop)
**New File:** `tests/column-reorder.test.js`

**Test Cases (10 tests):**
1. ✓ dragstart sets draggedColumn
2. ✓ dragstart adds opengridjs-dragging class
3. ✓ dragenter adds opengridjs-drag-over class
4. ✓ dragleave removes opengridjs-drag-over class
5. ✓ drop reorders headerData
6. ✓ drop triggers rerender
7. ✓ drop with invalid indices (NaN, negative, out of bounds)
8. ✓ drop on same column (no-op)
9. ✓ dragend cleanup
10. ✓ Full drag-drop sequence (first column to last)

**Coverage Target:** Lines 177-239

#### Test Suite 3.2: Column Resizing
**New File:** `tests/column-resize.test.js`

**Test Cases (12 tests):**
1. ✓ mousedown on resize handle starts resize
2. ✓ mousemove updates column width
3. ✓ mouseup ends resize
4. ✓ Minimum width constraint (80px or contentMinWidth)
5. ✓ Double-click triggers autoResizeColumns
6. ✓ Resize disables draggable
7. ✓ Resize sets wasResizing flag
8. ✓ wasResizing prevents sort trigger (line 598-600)
9. ✓ calculateContentMinWidths samples 10 rows
10. ✓ measureTextWidth with canvas
11. ✓ measureTextWidth fallback when canvas fails
12. ✓ estimateTextWidth character estimation (line 424-429)

**Coverage Target:** Lines 241-432

#### Test Suite 3.3: Filter System (Advanced)
**New File:** `tests/filter-advanced.test.js`

**Test Cases (15 tests):**
1. ✓ Multiple active filters on different columns
2. ✓ Filter with null values
3. ✓ Filter with undefined values
4. ✓ Filter with empty strings
5. ✓ Filter search input filtering options
6. ✓ Select All button checks all checkboxes
7. ✓ Clear All button unchecks all checkboxes
8. ✓ Apply button with all values selected (removes filter)
9. ✓ Apply button with partial selection
10. ✓ Cancel button closes menu without applying
11. ✓ Click outside closes filter menu
12. ✓ Filter menu positioning (centered under header)
13. ✓ Filter indicators show active state
14. ✓ clearAllFilters removes all filters
15. ✓ Filter + Sort combination maintains order

**Coverage Target:** Lines 1020-1247

#### Test Suite 3.4: Data Updates
**New File:** `tests/data-updates.test.js`

**Test Cases (12 tests):**
1. ✓ updateData with sync data
2. ✓ updateData with async data (Promise)
3. ✓ appendData with sync data
4. ✓ appendData with async data (Promise)
5. ✓ appendData with empty array sets canLoadMoreData = false
6. ✓ updateRecordData single record
7. ✓ updateRecordData batch (array of records)
8. ✓ updateRecordData with animation enabled
9. ✓ updateRecordData preservePosition = false
10. ✓ updateRecordData with missing ID (console.warn)
11. ✓ updateRecordData for non-existent record
12. ✓ animateFieldChange numeric increase/decrease detection

**Coverage Target:** Lines 856-1014

---

### Phase 4: Edge Cases & Error Handling (Week 4)
**Goal:** 95% coverage

#### Test Suite 4.1: Error Handling
**New File:** `tests/error-handling.test.js`

**Test Cases (10 tests):**
1. ✓ Invalid header data logs warning (line 138-141)
2. ✓ Context menu on row without ID shows error (line 722-725)
3. ✓ Canvas measurement error triggers fallback (line 390-393)
4. ✓ updateRecordData with no ID field warns (line 903-906)
5. ✓ updateRecordVisually when row not visible (line 959-961)
6. ✓ Clipboard API failure triggers fallback (line 786-789)
7. ✓ execCommand fallback error handling (line 813-814)
8. ✓ sortData with all null values
9. ✓ getUniqueColumnValues with mixed types
10. ✓ Filter menu with 1000+ unique values (performance)

**Coverage Target:** Error paths and console.warn/error calls

#### Test Suite 4.2: Edge Cases
**New File:** `tests/edge-cases.test.js`

**Test Cases (15 tests):**
1. ✓ Grid with zero columns
2. ✓ Grid with single column
3. ✓ Grid with 100 columns
4. ✓ Grid with zero rows
5. ✓ Grid with single row
6. ✓ Grid with 10,000 rows (performance)
7. ✓ Column name with special characters (!@#$%^&*)
8. ✓ Column name with spaces
9. ✓ Column name with HTML tags (<script>)
10. ✓ Cell value with HTML tags (XSS test)
11. ✓ escapeHtml prevents XSS
12. ✓ Sort column with mixed types (strings, numbers, null)
13. ✓ Filter during active sort
14. ✓ Resize during active filter
15. ✓ Multiple grids with overlapping filters

**Coverage Target:** Boundary conditions

#### Test Suite 4.3: Infinite Scroll
**New File:** `tests/infinite-scroll.test.js`

**Test Cases (8 tests):**
1. ✓ isNearBottom at exact bottom (scrollHeight == scrollTop + height + 4)
2. ✓ isNearBottom prevents duplicate calls (loadedAtGridHeight)
3. ✓ loadMoreDataFunction callback invoked
4. ✓ isLoadingMoreData flag prevents concurrent loads
5. ✓ appendData with empty array disables loading
6. ✓ stopLoadingMoreData sets canLoadMoreData = false
7. ✓ Debounced scroll handler (300ms delay)
8. ✓ Scroll event triggers both rerender and load check

**Coverage Target:** Lines 564-584, 847-876

---

### Phase 5: Integration & Cleanup (Week 5)
**Goal:** 100% coverage

#### Test Suite 5.1: Full Workflows
**New File:** `tests/integration.test.js`

**Test Cases (10 tests):**
1. ✓ Full user workflow: init → sort → filter → export
2. ✓ Full user workflow: init → resize → reorder → sort
3. ✓ Full user workflow: load → scroll → infinite load
4. ✓ Full user workflow: filter → sort → update data → clear filter
5. ✓ Multiple grids on same page (no interference)
6. ✓ Grid destruction and recreation
7. ✓ Context menu on all rows
8. ✓ Copy row for all data types
9. ✓ Export CSV with special characters
10. ✓ Right-click header opens filter (line 633-649)

**Coverage Target:** Interaction paths

#### Test Suite 5.2: CSV Export
**New File:** `tests/export.test.js`

**Test Cases (8 tests):**
1. ✓ exportToCSV creates blob
2. ✓ exportToCSV includes header row
3. ✓ exportToCSV escapes commas in values
4. ✓ exportToCSV handles null values
5. ✓ exportToCSV handles quotes in values
6. ✓ exportToCSV uses filtered data when active
7. ✓ copyRow formats data correctly
8. ✓ copyRow with all data types (boolean, number, date, string)

**Coverage Target:** Lines 775-836

#### Task 5.3: Coverage Report Analysis
```bash
npm run test:coverage
```

**Actions:**
1. Review HTML coverage report (`coverage/index.html`)
2. Identify remaining uncovered lines
3. Add targeted tests for missed branches
4. Verify all edge cases

---

## Coverage Metrics Projection

### Current State
| Metric | Current | Target |
|--------|---------|--------|
| Statements | 0% | 100% |
| Branches | 0% | 100% |
| Functions | 0% | 100% |
| Lines | 0% | 100% |

### Phase Projections
| Phase | Statements | Branches | Functions | Lines |
|-------|-----------|----------|-----------|-------|
| Phase 1 | 50% | 40% | 60% | 50% |
| Phase 2 | 70% | 60% | 80% | 70% |
| Phase 3 | 85% | 75% | 90% | 85% |
| Phase 4 | 95% | 90% | 100% | 95% |
| Phase 5 | 100% | 100% | 100% | 100% |

---

## Test File Organization (Final Structure)

```
tests/
├── setup.js                              # Global mocks and helpers
├── constructor.test.js                   # Phase 2.1 (NEW)
├── data-processing.test.js              # Phase 2.2 (NEW)
├── virtual-scrolling.test.js            # Phase 2.3 (NEW)
├── column-reorder.test.js               # Phase 3.1 (NEW)
├── column-resize.test.js                # Phase 3.2 (NEW)
├── filter-advanced.test.js              # Phase 3.3 (NEW)
├── data-updates.test.js                 # Phase 3.4 (NEW)
├── error-handling.test.js               # Phase 4.1 (NEW)
├── edge-cases.test.js                   # Phase 4.2 (NEW)
├── infinite-scroll.test.js              # Phase 4.3 (NEW)
├── integration.test.js                  # Phase 5.1 (NEW)
├── export.test.js                       # Phase 5.2 (NEW)
├── opengrid.test.js                     # Existing (static analysis - DEPRECATE)
├── opengrid.comprehensive.test.js       # Existing (static analysis - DEPRECATE)
├── filter.test.js                       # Existing (UPDATE to use require)
├── sort-click-debug.test.js            # Existing (UPDATE to use require)
├── header-cell-alignment.test.js       # Existing (UPDATE to use require)
├── min-width-constraints.test.js       # Existing (UPDATE to use require)
├── column-width-alignment.test.js      # Existing (UPDATE to use require)
├── filter-sort-bug.test.js             # Existing (UPDATE to use require)
├── filter-sort.test.js                 # Existing (UPDATE to use require)
├── multiple-grid-and-right-click.test.js # Existing (UPDATE to use require)
├── default-context-menu.test.js        # Existing (UPDATE to use require)
└── visual-sort-test.test.js            # Existing (UPDATE to use require)
```

**Total Test Files:** 25 (13 new, 12 updated)

---

## Critical Implementation Notes

### 1. Module Export Compatibility
The module export must not break browser usage:
```javascript
// src/opengrid.js (line 1255)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenGrid;
} else if (typeof window !== 'undefined') {
    window.OpenGrid = OpenGrid;
}
```

### 2. JSDOM Limitations
Some features require mocking in tests:
- Canvas API (lines 376-393): Mock `getContext('2d')`
- Clipboard API (lines 783-789): Mock `navigator.clipboard`
- Blob downloads (lines 828-835): Mock URL.createObjectURL

### 3. Async Testing
Constructor accepts async data (line 25-42):
```javascript
test('async data loading', async () => {
    const asyncData = () => Promise.resolve([{id: 1}]);
    const grid = new OpenGrid('test', asyncData, 400);
    await new Promise(resolve => setTimeout(resolve, 10)); // Wait for Promise
    expect(grid.gridData.length).toBe(1);
});
```

### 4. Event Simulation
Use JSDOM event helpers:
```javascript
const event = new MouseEvent('click', { bubbles: true });
element.dispatchEvent(event);
```

### 5. Timer Management
Use Jest timers for debounce/setTimeout:
```javascript
jest.useFakeTimers();
// ... trigger debounced function
jest.advanceTimersByTime(300);
jest.useRealTimers();
```

---

## Maintenance & CI Integration

### Continuous Integration
Add to CI pipeline (GitHub Actions):
```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Check coverage thresholds
  run: |
    npx jest --coverage --coverageThreshold='{"global":{"statements":90,"branches":90,"functions":90,"lines":90}}'
```

### Coverage Badges
Add to README.md:
```markdown
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
```

### Pre-commit Hook
Prevent commits that drop coverage:
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:coverage && npx coverage-threshold-check"
    }
  }
}
```

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Module export breaks browser usage | High | Conditional export with window fallback |
| Test execution time increases | Medium | Parallel test execution (`--maxWorkers=4`) |
| JSDOM doesn't support canvas | Low | Mock canvas API in setup.js |
| Async tests are flaky | Medium | Use `waitFor` helpers, increase timeouts |
| Coverage drops during refactoring | Low | Enforce 90% threshold in CI |

---

## Success Metrics

### Quantitative
- ✅ 100% statement coverage
- ✅ 100% branch coverage
- ✅ 100% function coverage
- ✅ 100% line coverage
- ✅ All 128+ tests passing
- ✅ Test execution time < 30 seconds

### Qualitative
- ✅ Every method has dedicated tests
- ✅ All error paths tested
- ✅ All edge cases documented and tested
- ✅ Coverage integrated in CI/CD
- ✅ Coverage badge in README

---

## Timeline Summary

| Phase | Duration | Tests Added | Coverage Target |
|-------|----------|-------------|-----------------|
| Phase 1 | Week 1 | 0 (infrastructure) | Enable tracking |
| Phase 2 | Week 2 | 37 tests | 70% |
| Phase 3 | Week 3 | 49 tests | 85% |
| Phase 4 | Week 4 | 33 tests | 95% |
| Phase 5 | Week 5 | 26 tests | 100% |
| **Total** | **5 weeks** | **145 new tests** | **100%** |

---

## Conclusion

Achieving 100% test coverage for OpenGridJs is achievable within 5 weeks by:

1. **Fixing the instrumentation** (Phase 1) - Critical foundation
2. **Systematic testing** (Phases 2-4) - Method-by-method coverage
3. **Integration validation** (Phase 5) - Real-world scenarios

The current 0% coverage is **not a reflection of test quality** but rather a **technical limitation** in how tests load the source code. Once resolved, the existing 125 passing tests will immediately contribute to coverage metrics.

**Key Success Factor:** Phase 1 must be completed first. All subsequent work depends on proper module loading.

---

**Next Steps:**
1. Review and approve this plan
2. Create feature branch for coverage work
3. Execute Phase 1 (1-2 days)
4. Validate baseline coverage report
5. Proceed with Phases 2-5
