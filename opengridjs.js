class Opengridjs {
    constructor(className, data, gridHeight, setup) {
        this.gridData = [];
        this.headerData = [];
        this.gridRowPxSize = 35;
        this.gridRowPxVisibleArea = gridHeight;
        this.gridColumnNames = Object.keys(data[0]).map(key => ({headerName: key, field: key}));
        this.gridSelectedObject = {};
        this.initGrid(className);
        this.processData(data);
        this.generateGridHeader(setup);
        this.generateGridRows();
        this.addEventListeners(setup);
        this.contextMenuItems = setup.contextMenuOptions;
        this.contextMenuTitle = setup.contextMenuTitle;
        document.querySelector(`.${className}`).gridInstance = this;
    }

    initGrid(className) {
        const grid = document.getElementsByClassName(className)[0];
        grid.classList.add("grid-container");
        grid.innerHTML = `
        <div class='grid-additional'></div>
        <div class='grid-header'></div>
        <div class='grid-rows-container'></div>`;
    }

    processData(data) {
        this.gridData = data.map((dataItem, currentPosition) => ({
            data: dataItem,
            position: currentPosition * this.gridRowPxSize,
            isRendered: false
        }));
    }

    generateGridHeader(setup) {
        const gridHeader = document.querySelector(".grid-header");
        gridHeader.setAttribute("data-pos", gridHeader.offsetTop);

        const headers = setup.columnHeaderNames.length === 0
            ? this.gridColumnNames.map(columnNames => columnNames.headerName)
            : setup.columnHeaderNames.map(headerName => headerName.columnName);

        const gridItemWidth = 100 / headers.length;
        const gridItemWidthStyle = `width:${gridItemWidth}%`;

        this.headerData = headers.map(header => ({data: header, width: gridItemWidthStyle}));

        gridHeader.innerHTML = this.headerData.map(header => `<div class='grid-header-item' style='${header.width}'>${header.data}</div>`).join('');
    }

    generateGridRows() {
        const gridRowsContainer = document.querySelector('.grid-rows-container');
        gridRowsContainer.style.height = `${this.gridRowPxVisibleArea}px`;
        gridRowsContainer.innerHTML = "<div class='grid-rows'></div>";

        const gridRows = document.querySelector(".grid-rows");
        gridRows.style.height = `${this.gridRowPxSize * this.gridData.length}px`;

        this.renderVisible(gridRowsContainer, gridRows);
    }

    renderVisible(gridRowsContainer, gridRows, contextMenuItems) {
        const currentPosition = gridRowsContainer.scrollTop;
        const visibleItems = this.gridData.filter(data => data.isRendered === false
            && data.position >= currentPosition
            && data.position <= currentPosition + this.gridRowPxVisibleArea);
        const invisibleItems = this.gridData.filter(data => data.isRendered === true
            && data.position < (currentPosition - (this.gridRowPxSize * 2))
            || data.position > (currentPosition + this.gridRowPxVisibleArea)
        );

        visibleItems.forEach(rowItem => {
            this.addRow(gridRows, rowItem);
        });

        invisibleItems.forEach(rowItem => {
            this.removeRow(rowItem);
        });

        this.createContextMenu(this.contextMenuItems);
    }

    addRow(gridRows, rowItem) {
        rowItem.isRendered = true;
        const rowClassName = `grid-row-${rowItem.position}`;
        gridRows.innerHTML += `<div data-id='${rowItem.data.id}' class='grid-row ${rowClassName}' style='top:${rowItem.position}px'></div>`;
        const gridRow = gridRows.getElementsByClassName(rowClassName)[0];
        gridRow.innerHTML = this.headerData.map(header => {
            const found = rowItem.data[header.data];
            return `<div class='grid-column-item' style='${header.width}'>${found ? found : '&nbsp;'}</div>`;
        }).join('');
    }

    removeRow(rowItem) {
        rowItem.isRendered = false;
        const rowClassName = `grid-row-${rowItem.position}`;
        const found = document.querySelector(`.${rowClassName}`);
        if (found) {
            found.remove();
        }
    }

    addEventListeners(setup) {
        const gridRowsContainer = document.querySelector('.grid-rows-container');
        const gridRows = document.querySelector(".grid-rows");
        gridRowsContainer.addEventListener('scroll', () => this.renderVisible(gridRowsContainer, gridRows));
        gridRowsContainer.addEventListener('scroll', () => this.closeContextMenu());
        this.createContextMenu(setup.contextMenuOptions);
    }

    createContextMenu(options) {
        if(options){
            const gridRows = document.querySelectorAll('.grid-row');
            gridRows.forEach(gridRow => {
                gridRow.addEventListener('contextmenu', e => {
                    e.preventDefault();
                    this.closeContextMenu();
                    gridRow.classList.add('selected-grid-row');

                    const id = gridRow.getAttribute("data-id");
                    this.gridSelectedObject = this.gridData.find(x => x.data.id == id).data;

                    const title = this.contextMenuTitle ?? "Title";
                    const left = `${e.pageX}px`;
                    const top = `${e.pageY}px`;
                    const selections = `
                <div class="contextMenu" style="left:${left}; top: ${top}">
                    <div class="title">${title}</div><hr/>
                    ${options.map(option => `<button data-id="${id}" class="${option.className} btn" onclick="this.closest('.grid').gridInstance.closeContextMenu(() => ${option.actionFunctionName}(this.closest('.grid').gridInstance.gridSelectedObject))">${option.actionName}</button>`).join('')}
                    <br/>&nbsp;
                </div>`;

                    document.querySelector('.grid-additional').innerHTML += selections;
                });

                gridRow.addEventListener('click', () => this.closeContextMenu());
            });
        }
    }
    closeContextMenu(action) {
        document.querySelectorAll('.contextMenu').forEach(item => item.remove());
        document.querySelectorAll('.selected-grid-row').forEach(item => item.classList.remove('selected-grid-row'));
        if (action) {
            action(this.gridSelectedObject);
        }
    }
}

