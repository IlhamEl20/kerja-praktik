import { pdfjs } from "react-pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
