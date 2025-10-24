import { useEffect, useRef } from "react";
import { pdfjs } from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer({ fileUrl }) {
    const viewerRef = useRef(null);

    useEffect(() => {
        const container = viewerRef.current;
        const eventBus = new pdfjs.EventBus();
        const linkService = new pdfjs.PDFLinkService({ eventBus });
        const pdfViewer = new pdfjs.PDFViewer({
            container,
            eventBus,
            linkService,
        });

        const loadingTask = pdfjs.getDocument(fileUrl);
        loadingTask.promise.then((pdfDocument) => {
            pdfViewer.setDocument(pdfDocument);
            linkService.setDocument(pdfDocument, null);
        });

        return () => {
            pdfViewer.cleanup();
        };
    }, [fileUrl]);

    return (
        <div
            className="pdfViewerContainer"
            style={{ height: "90vh", overflow: "auto" }}
        >
            <div ref={viewerRef} className="pdfViewer"></div>
        </div>
    );
}
