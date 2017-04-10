import React, {Component} from 'react';
import {Paper} from "material-ui";
import {RENDER_DELAY} from "../../../../const";

export default class Page extends Component {
    constructor(args) {
        super(args);

        this.state = {
            height: 0
        };

        this.renderPage = this.renderPage.bind(this);
        this.updatePage = this.updatePage.bind(this);
    }

    renderPage() {
        const container = this;

        this.props.pdf.getPage(this.props.page).then((page) => {
            const scalingFactor = this.props.width / page.getViewport(1.0).width;
            const viewport = page.getViewport(scalingFactor * 2);

            // Prepare canvas using PDF page dimensions
            const canvas = container.canvas;
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            container.setState({
                height: page.getViewport(scalingFactor).height
            });

            // Render PDF page into canvas context
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);
            renderTask.then(function () {
                console.log('Page rendered');
            });
        }, (err) => {
            console.log(err);
            throw err;
        });
    }

    updatePage() {
        if (this.renderTimeout) clearTimeout(this.renderTimeout);

        this.renderTimeout = setTimeout(this.renderPage, RENDER_DELAY);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.width !== prevProps.width || this.props.pdf !== prevProps.pdf)
            this.updatePage();
    }

    componentDidMount() {
        this.renderPage();
    }

    render() {
        return (
            <Paper className="pdf-paper" zDepth={2} style={{width: this.props.width, height: this.state.height}}>
                <canvas ref={(canvas) => {
                    this.canvas = canvas;
                }}/>
            </Paper>
        );
    }
}
