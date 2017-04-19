import {MIME_TYPE} from "../const";

export function printPdf(state) {
    const iframe = document.getElementById('print-target');

    iframe.style.display = 'none';
    iframe.onload = function() {
        setTimeout(function() {
            iframe.focus();
            iframe.contentWindow.print();
        }, 1);
    };

    iframe.src = state.get('pdfURL');
}

export function downloadFile(url, filename) {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = filename;
    setTimeout(() => {
        a.click();
        a.parentNode.removeChild(a);
    }, 1000);
}

export function downloadPdf(state) {
    const url = state.get('pdfURL');
    downloadFile(url, state.get('metadata').get('name') + '.pdf');
}

export function downloadTex(content, state) {
    const fileName = state.get('metadata').get('name') + '.tex';
    const text = `data:${MIME_TYPE};charset=utf-8,${encodeURIComponent(content)}`;
    downloadFile(text, fileName);
}
