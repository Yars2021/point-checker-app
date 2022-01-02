export class Graph {
    PARAMETER_R = 2;

    MARGIN_LEFT = 10;
    MARGIN_TOP = 40;

    // Graph limits
    LIMITS = {
        'x': {
            'min': -2,
            'max': 2
        },
        'y': {
            'min': -3,
            'max': 5
        },
        'r': {
            'min': -2,
            'max': 2
        }
    };

    // Graph colors
    colors = {
        'background': 'White',
        'axis': 'Black',
        'mark': 'Brown',
        'limits': '#EDE0D47F',
        'dot': {
            'hit': 'Lime',
            'miss': 'Red'
        },
        'figure': '#1E90FFAF',
        'crosshair': {
            'lines': 'MediumSeaGreen',
            'sight': 'DarkGreen'
        }
    };

    dots = [];

    mouse = {
        x: undefined,
        y: undefined
    };

    constructor(_graphContainer, _width, _height, _coordXContainer, _coordYContainer, _checkPoint, _callbackHolder) {
        this.graphContainer = _graphContainer;
        this.callbackHolder = _callbackHolder;
        this.WIDTH = _width;
        this.HEIGHT = _height;

        if ((_coordXContainer !== undefined) && (_coordYContainer !== undefined)) {
            this.coordinateXContainer = document.querySelector(_coordXContainer);
            this.coordinateYContainer = document.querySelector(_coordYContainer);
        } else {
            this.coordinateXContainer = undefined;
            this.coordinateYContainer = undefined;
        }
        this.checkPointCallback = _checkPoint;

        this.drawing = false;

        // Canvas definition
        this.DPI_WIDTH = this.WIDTH * 2;
        this.DPI_HEIGHT = this.HEIGHT * 2;

        this.BIGGER_AXIS = this.WIDTH > this.HEIGHT ? this.WIDTH : this.HEIGHT;

        this.metrics = this.getMetrics(this.LIMITS);

        // Create canvases in container
        this.container = document.querySelector(this.graphContainer);
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.container.append(this.canvas);

        this.canvas.id = 'canvasGraph';
        this.canvas.graphComponent = this;
        this.canvas.metrics = this.metrics;
        this.canvas.getMousePos = this.getMousePos;
        this.canvas.checkPointCallback = this.checkPointCallback;
        this.canvas.drawDot = this.drawDot;
        this.canvas.valueR = this.PARAMETER_R;
        this.canvas.callbackHolder = this.callbackHolder;
        this.canvas.style.width = this.WIDTH + 'px';
        this.canvas.style.height = this.HEIGHT + 'px';
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = this.MARGIN_LEFT + 'px';
        this.canvas.style.top = this.MARGIN_TOP + 'px';
        this.canvas.style.zIndex = 1;
        this.canvas.width = this.DPI_WIDTH;
        this.canvas.height = this.DPI_HEIGHT;

        this.canvasCrosshair = document.createElement("canvas");
        this.ctxCrosshair = this.canvas.getContext('2d');
        this.container.append(this.canvasCrosshair);

        this.canvasCrosshair.id = 'canvasCrosshair';
        this.canvasCrosshair.mouse = this.mouse;
        this.canvasCrosshair.updateCoordinates = this.updateCoordinates;
        this.canvasCrosshair.metrics = this.metrics;

        this.canvasCrosshair.style.width = this.WIDTH + 'px';
        this.canvasCrosshair.style.height = this.HEIGHT + 'px';
        this.canvasCrosshair.style.backgroundColor = 'transparent';
        this.canvasCrosshair.style.cursor = 'none';
        this.canvasCrosshair.style.position = 'absolute';
        this.canvasCrosshair.style.left = this.MARGIN_LEFT + 'px';
        this.canvasCrosshair.style.top = this.MARGIN_TOP + 'px';
        this.canvasCrosshair.style.zIndex = 2;
        this.canvasCrosshair.width = this.DPI_WIDTH;
        this.canvasCrosshair.height = this.DPI_HEIGHT;

        // Add 'onMouseDown' listener to the canvas
        this.canvasCrosshair.onmousedown = function (e) {
            let cgx = document.getElementById('canvasGraph');
            let [x, y] = cgx.getMousePos(e, cgx.metrics);
            if (cgx.checkPointCallback !== undefined) {
                let _hit = cgx.checkPointCallback(x, y, cgx.valueR, cgx.callbackHolder);
                cgx.drawDot(x, y, cgx.metrics, true, _hit);
            }
        }

        // Add 'onMouseDown' listener to the canvas
        this.canvasCrosshair.onmousemove = function (e) {
            let rect = this.getBoundingClientRect();
            let ccx = document.getElementById('canvasCrosshair');
            ccx.mouse.x = e.clientX * 2 - rect.left * 2;
            ccx.mouse.y = e.clientY * 2 - rect.top * 2;
            ccx.updateCoordinates(ccx.mouse.x, ccx.mouse.y, ccx.metrics);
        }

    }

    setGraphR = (_r) => {
        this.PARAMETER_R = _r;
        this.canvas.valueR = _r;
    }

    // Get max value for the scale calculation
    getMaxMetric = (data) => {
        let max = 0;
        const keys = Object.keys(data);
        keys.forEach(key => {
            let limits = Object.keys(data[key]);
            limits.forEach(limit => {
                if (Math.abs(data[key][limit]) > max) {
                    max = Math.abs(data[key][limit]);
                }
            })
        });
        return max + 1;
    }

    getMetrics = (definition) => {
        let maxMetric = this.getMaxMetric(definition);
        let STEP = this.BIGGER_AXIS / maxMetric;
        return {
            "maxMetric": maxMetric,
            "step": STEP
        }
    }

    graphToCanvasCoordinates = (gX, gY, step) => {
        let x = this.WIDTH + gX * step;
        let y = this.HEIGHT - gY * step;
        return [x, y];
    }

    canvasToGraphCoordinates = (cX, cY, step) => {
        let x = (cX - this.WIDTH) / step;
        let y = (this.HEIGHT - cY) / step;
        return [x.toFixed(1), y.toFixed(1)];
    }


    // Pass 'true' to force dark theme, 'false' otherwise
    setTheme = (forceDark) => {
        if (forceDark) {
            this.colors.background = '#333';
            this.colors.axis = 'Lime';
            this.colors.mark = 'White';
            this.colors.dot.hit = 'White';
            this.colors.dot.miss = 'Brown';
            this.colors.figure = 'rgba(30,255,67,0.69)';
            this.colors.crosshair.lines = 'Yellow';
            this.colors.crosshair.sight = 'Orange';
        } else {
            this.colors.background = 'White';
            this.colors.axis = 'Black';
            this.colors.mark = 'Brown';
            this.colors.dot.hit = 'Lime';
            this.colors.dot.miss = 'Red';
            this.colors.figure = '#1E90FFAF';
            this.colors.crosshair.lines = 'MediumSeaGreen';
            this.colors.crosshair.sight = 'DarkGreen';
        }
    }

    drawLayout = (metrics) => {
        let strokeStyle = this.ctx.strokeStyle;
        let fillStyle = this.ctx.fillStyle;
        let lineWidth = this.ctx.lineWidth;

        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.DPI_WIDTH, this.DPI_HEIGHT);
        this.ctx.beginPath();

        this.ctx.strokeStyle = this.colors.axis;
        this.ctx.fillStyle = this.colors.mark;
        this.ctx.lineWidth = 2;
        // Axis
        this.ctx.moveTo(0, this.HEIGHT);
        this.ctx.lineTo(this.DPI_WIDTH, this.HEIGHT);
        this.ctx.moveTo(this.WIDTH, 0);
        this.ctx.lineTo(this.WIDTH, this.DPI_HEIGHT);
        // X axis arrow
        this.ctx.moveTo(this.DPI_WIDTH - 16, this.HEIGHT - 8);
        this.ctx.lineTo(this.DPI_WIDTH, this.HEIGHT);
        this.ctx.lineTo(this.DPI_WIDTH - 16, this.HEIGHT + 8);
        // Y axis arrow
        this.ctx.moveTo(this.WIDTH - 8, 16);
        this.ctx.lineTo(this.WIDTH, 0);
        this.ctx.lineTo(this.WIDTH + 8, 16);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.limits;
        let [sX, sY] = this.graphToCanvasCoordinates(this.LIMITS.x.min, this.LIMITS.y.min, metrics.step);
        let [fX, fY] = this.graphToCanvasCoordinates(this.LIMITS.x.max, this.LIMITS.y.max, metrics.step);
        this.ctx.moveTo(sX, sY);
        this.ctx.lineTo(sX, fY);
        this.ctx.lineTo(fX, fY);
        this.ctx.lineTo(fX, sY);
        this.ctx.lineTo(sX, sY);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.fillStyle = this.colors.mark;

        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        // X axis marks
        this.ctx.font = 'normal 16px sans-serif';
        for (let i = 1; i < this.metrics.maxMetric; i++) {
            this.ctx.moveTo(this.WIDTH - metrics.step * i, this.HEIGHT - 8);
            this.ctx.lineTo(this.WIDTH - metrics.step * i, this.HEIGHT + 8);
            this.ctx.fillText('-' + i, this.WIDTH - metrics.step * i - 16, this.HEIGHT + 16);
            this.ctx.moveTo(this.WIDTH + metrics.step * i, this.HEIGHT - 8);
            this.ctx.lineTo(this.WIDTH + metrics.step * i, this.HEIGHT + 8);
            this.ctx.fillText('' + i, this.WIDTH + metrics.step * i + 4, this.HEIGHT + 16);
        }
        // Y axis marks
        for (let i = 1; i < this.metrics.maxMetric; i++) {
            this.ctx.moveTo(this.WIDTH - 8, this.HEIGHT - metrics.step * i);
            this.ctx.lineTo(this.WIDTH + 8, this.HEIGHT - metrics.step * i);
            this.ctx.fillText('' + i, this.WIDTH + 4, this.HEIGHT - metrics.step * i - 4);
            this.ctx.moveTo(this.WIDTH - 8, this.HEIGHT + metrics.step * i);
            this.ctx.lineTo(this.WIDTH + 8, this.HEIGHT + metrics.step * i);
            this.ctx.fillText('-' + i, this.WIDTH + 4, this.HEIGHT + metrics.step * i + 16);
        }

        // Display graph
        this.ctx.stroke();
        this.ctx.closePath();

        // Axis labels
        this.ctx.font = 'bold 24px sans-serif';
        this.ctx.fillText('0', this.WIDTH - 32, this.HEIGHT + 32);
        this.ctx.fillText('X', this.DPI_WIDTH - 20, this.HEIGHT + 32);
        this.ctx.fillText('Y', this.WIDTH - 32, 24);
        this.ctx.fillStyle = this.colors.figure;
        this.ctx.fillText('-R/2', this.WIDTH - this.PARAMETER_R * metrics.step / 2 - 44, this.HEIGHT + 40);
        this.ctx.fillText('R', this.WIDTH + this.PARAMETER_R * metrics.step, this.HEIGHT + 40);
        this.ctx.fillText('-R/2', this.WIDTH - 55, this.HEIGHT + this.PARAMETER_R * metrics.step / 2 + 20);
        this.ctx.fillText('R', this.WIDTH - 26, this.HEIGHT - this.PARAMETER_R * metrics.step - 4);

        this.ctx.lineWidth = lineWidth;
        this.ctx.fillStyle = fillStyle;
        this.ctx.strokeStyle = strokeStyle;
    }

    // Draw dot on the graph
    drawDot = (x, y, metrics, push, hit = false) => {
        let fillStyle = this.ctx.fillStyle;
        this.ctx.beginPath();
        let [cX, cY] = this.graphToCanvasCoordinates(x, y, metrics.step);
        this.ctx.fillStyle = Boolean(hit) ? this.ctx.fillStyle = this.colors.dot.hit : this.ctx.fillStyle = this.colors.dot.miss;
        this.ctx.arc(cX, cY, 4, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.fillStyle = fillStyle;
        if (push) {
            this.addDot(x, y, hit);
        }
    }

    // Adds dot to the dots array
    addDot = (x, y, hit) => {
        this.dots.push({ 'x': x, 'y': y, 'hit': hit });
    }

    // Reads proper mouse position inside Canvas
    getMousePos = (evt, metrics) => {
        const rect = this.canvas.getBoundingClientRect();
        return this.canvasToGraphCoordinates(evt.clientX * 2 - rect.left * 2, evt.clientY * 2 - rect.top * 2, this.metrics.step);
    }

    updateCoordinates = (x, y) => {
        if ((this.coordinateXContainer !== undefined) &&
            (this.coordinateYContainer !== undefined)) {
            let [gX, gY] = this.canvasToGraphCoordinates(x, y, this.metrics.step);
            this.coordinateXContainer.innerText = gX;
            this.coordinateYContainer.innerText = gY;
        }
    }

    // Block the page if enabled
    drawDots = () => {
        if (!this.drawing) {
            this.drawing = true;
            this.dots.forEach((dot) => {
                this.drawDot(dot.x, dot.y, this.metrics, false, dot.hit)
            })
            this.drawing = false;
        }
    }

    drawFigure = (r) => {
        let fillStyle = this.ctx.fillStyle;
        this.ctx.fillStyle = this.colors.figure;
        this.ctx.beginPath();
        let [startX, startY] = this.graphToCanvasCoordinates(0, 0, this.metrics.step);
        this.ctx.moveTo(startX, startY);
        let [toX, toY] = this.graphToCanvasCoordinates(- r / 2, 0, this.metrics.step);
        this.ctx.lineTo(toX, toY);
        [toX, toY] = this.graphToCanvasCoordinates(- r / 2, r, this.metrics.step);
        this.ctx.lineTo(toX, toY);
        [toX, toY] = this.graphToCanvasCoordinates(0, r, this.metrics.step);
        this.ctx.lineTo(toX, toY);
        this.ctx.lineTo(startX, startY);
        [toX, toY] = this.graphToCanvasCoordinates(r, 0, this.metrics.step);
        this.ctx.moveTo(toX, toY);
        [toX, toY] = this.graphToCanvasCoordinates(0, - r / 2, this.metrics.step);
        this.ctx.lineTo(toX, toY);
        this.ctx.lineTo(startX, startY);
        this.ctx.arc(startX, startY, this.metrics.step * Math.abs(r) / 2, Math.PI / 2 + (r < 0 ? Math.PI : 0), Math.PI + (r < 0 ? Math.PI : 0), false);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.fillStyle = fillStyle;
    }

    drawCrosshair = () => {

        let strokeStyle = this.ctxCrosshair.strokeStyle;
        let fillStyle = this.ctxCrosshair.fillStyle;

        this.ctxCrosshair.strokeStyle = this.colors.crosshair.lines;
        this.ctxCrosshair.fillStyle = this.colors.crosshair.lines;

        this.ctxCrosshair.beginPath();
        this.ctxCrosshair.moveTo(0, this.mouse.y + 0.5);
        this.ctxCrosshair.lineTo(this.ctxCrosshair.canvas.width, this.mouse.y + 0.5);
        this.ctxCrosshair.moveTo(this.mouse.x + 0.5, 0);
        this.ctxCrosshair.lineTo(this.mouse.x + 0.5, this.ctxCrosshair.canvas.height);
        this.ctxCrosshair.stroke();
        this.ctxCrosshair.closePath();
        this.ctxCrosshair.strokeStyle = this.colors.crosshair.sight;
        this.ctxCrosshair.fillStyle = this.colors.crosshair.sight;
        this.ctxCrosshair.beginPath();
        this.ctxCrosshair.arc(this.mouse.x, this.mouse.y, 16, 0, 2 * Math.PI);
        this.ctxCrosshair.stroke();
        this.ctxCrosshair.closePath();
        this.ctxCrosshair.beginPath();
        this.ctxCrosshair.arc(this.mouse.x, this.mouse.y, 10, 0, 2 * Math.PI);
        this.ctxCrosshair.stroke();
        this.ctxCrosshair.closePath();
        this.ctxCrosshair.beginPath();
        this.ctxCrosshair.arc(this.mouse.x, this.mouse.y, 4, 0, 2 * Math.PI);
        this.ctxCrosshair.fill();
        this.ctxCrosshair.closePath();
        this.ctxCrosshair.fillStyle = fillStyle;
        this.ctxCrosshair.strokeStyle = strokeStyle;
    }

    // Draws the scene
    drawScene = (r, metrics) => {
        this.drawLayout(metrics);
        this.drawFigure(r);
        this.drawDots();
        this.drawCrosshair();
    }

    // Starts animation cycle to show the scene and crosshair
    animate = () => {
        this.ctxCrosshair.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawScene(this.PARAMETER_R, this.metrics);
        requestAnimationFrame(this.animate);
    };
}