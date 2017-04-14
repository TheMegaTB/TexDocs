import React, {Component} from "react";
import pdfjsLib from "pdfjs-dist";
import {Scrollbars} from "react-custom-scrollbars";
import Measure from "react-measure";
import Hammer from "hammerjs";

import "./PDFView.css";
import Loader from "../../../Loader/Loader";
import Page from "./Page";

pdfjsLib.PDFJS.workerSrc = `/pdf.worker.js`;

function hammerIt(elm, cb) {
    const hammertime = new Hammer(elm, {});
    hammertime.get('pinch').set({
        enable: true
    });
    var posX = 0,
        posY = 0,
        scale = 1,
        last_scale = 1,
        last_posX = 0,
        last_posY = 0,
        max_pos_x = 0,
        max_pos_y = 0,
        transform = "",
        el = elm;

    hammertime.on('doubletap pan pinch panend pinchend', function(ev) {
        if (ev.type == "doubletap") {
            transform =
                "translate3d(0, 0, 0) " +
                "scale3d(2, 2, 1) ";
            scale = 2;
            last_scale = 2;
            try {
                if (window.getComputedStyle(el, null).getPropertyValue('-webkit-transform').toString() != "matrix(1, 0, 0, 1, 0, 0)") {
                    transform =
                        "translate3d(0, 0, 0) " +
                        "scale3d(1, 1, 1) ";
                    scale = 1;
                    last_scale = 1;
                }
            } catch (err) {}
            el.style.webkitTransform = transform;
            transform = "";
        }

        //pan
        if (scale != 1) {
            posX = last_posX + ev.deltaX;
            posY = last_posY + ev.deltaY;
            max_pos_x = Math.ceil((scale - 1) * el.clientWidth / 2);
            max_pos_y = Math.ceil((scale - 1) * el.clientHeight / 2);
            if (posX > max_pos_x) {
                posX = max_pos_x;
            }
            if (posX < -max_pos_x) {
                posX = -max_pos_x;
            }
            if (posY > max_pos_y) {
                posY = max_pos_y;
            }
            if (posY < -max_pos_y) {
                posY = -max_pos_y;
            }
        }


        //pinch
        if (ev.type == "pinch") {
            scale = Math.max(1, Math.min(last_scale * (ev.scale), 4));
        }
        if(ev.type == "pinchend"){last_scale = scale;}

        //panend
        if(ev.type == "panend"){
            last_posX = posX < max_pos_x ? posX : max_pos_x;
            last_posY = posY < max_pos_y ? posY : max_pos_y;
        }

        if (scale != 1) {
            transform =
                "translate3d(" + posX + "px," + posY + "px, 0) " +
                "scale3d(" + scale + ", " + scale + ", 1)";
        }

        if (typeof cb === 'function') cb(scale);
        // console.log(scale);
        // if (transform) {
        //     el.style.webkitTransform = transform;
        // }
    });
}

export default class PDFView extends Component {
    constructor(args) {
        super(args);

        this.state = {
            pdf: undefined,
            width: 0,
            height: 0,
            scale: 1
        };

        this.updateDocument = this.updateDocument.bind(this);
        this.updateWidth = this.updateWidth.bind(this);
    }

    renderDocument(doc) {
        pdfjsLib.PDFJS.getDocument(doc).then((pdf) => {
            this.setState({
                pdf: pdf
            });
        }, (err) => {
            // Silently ignore errors
            // TODO Make some kind of error pane that shows errors (including ones from the server)
            // console.log(err);
            // throw err;
        });
    }

    updateDocument() {
        const viewer = this;
        if (this.props.pdf instanceof Blob) {
            const fileReader = new FileReader();
            fileReader.onload = () => viewer.renderDocument({ data: fileReader.result });
            fileReader.readAsArrayBuffer(this.props.pdf);
        } else {
            viewer.renderDocument(this.props.pdf);
        }
    }

    componentWillMount() {
        this.updateDocument();
    }

    updateWidth(e) {
        this.setState({width: e.width - 40, height: e.height});
    }

    componentDidUpdate(prevProps, nextState) {
        if (prevProps.pdf !== this.props.pdf)
            this.updateDocument();
    }

    componentDidMount() {
        hammerIt(this.wrapper, (scale) => {
            console.log('scaled', scale);
            // this.setState({
            //     scale: scale
            // });
        });
    }

    render() {
        const pages = this.state.pdf ? [...new Array(this.state.pdf.numPages + 1).keys()] : [1];
        if (pages.length > 1) pages.shift(); // Remove page 0 since counting starts @ 1

        return <Measure onMeasure={this.updateWidth}>
            <div className="paper-wrapper" ref={(wrapper) => this.wrapper = wrapper}>
                { this.state.pdf
                    ? pages.map((page) => <Page key={page} pdf={this.state.pdf} page={page} width={this.state.width} scale={this.state.scale}/>)
                    : <Loader text="Loading PDF"/>}
            </div>
        </Measure>;
    }
}
