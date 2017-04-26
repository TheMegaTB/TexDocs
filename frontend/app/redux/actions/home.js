import {SEARCH_QUERY} from "../../const";
import {FILES_LISTED, THUMBNAIL_GENERATED} from "../reducers/home";
import pdfjsLib from "pdfjs-dist";
import {fetchFile, searchDrive} from "../../api/google";

export async function updateFileList(driveAPI) {
    return {
        type: FILES_LISTED,
        files: await searchDrive(driveAPI, SEARCH_QUERY + ' and not trashed', 'files(id,name,viewedByMeTime)')
    }
}

export async function generateThumbnail(driveAPI, id, width, dsrFactor) {
    const pdf = await fetchFile(driveAPI, id);
    const pdfDocument = await pdfjsLib.PDFJS.getDocument({ worker: window.pdfWorker, data: pdf });
    const page = await pdfDocument.getPage(1);

    const viewport = page.getViewport((width / page.getViewport(1.0).width) * dsrFactor);

    // Prepare canvas using PDF page dimensions
    const canvas = document.createElement("canvas");
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    await page.render({ canvasContext: context, viewport: viewport });

    return {
        type: THUMBNAIL_GENERATED,
        thumbnail: canvas.toDataURL(),
        id: id
    };
}
