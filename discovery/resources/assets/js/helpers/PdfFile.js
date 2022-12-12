import React, {useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {ResizableBox} from 'react-resizable';

import {Document, Page, pdfjs} from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.2.6.347.js';

import {LoadingSpinner} from '~/helpers';
import useWindowDimensions from '~/helpers/hooks/useWindowDimensions';


const PdfFile = ({
                     pdfUrl,
                     pdfExist,
                     wrapperClass = '',
                     docClass = '',
                     pageClass = '',
                     width = 0.45
                 }) => {
    const {width: windowWidth} = useWindowDimensions();
    const [numPages, setNumPages] = useState(null);
    const [pagesRendered, setPagesRendered] = useState(null);

    const file = React.useMemo(() => ({url: pdfUrl}), [pdfUrl]);

    const pagesRenderedPlusOne = useCallback(() => Math.min(pagesRendered + 1, numPages), [pagesRendered, numPages])();

    const pageRenderSuccess = useCallback(() => setPagesRendered(pagesRendered + 1), [pagesRendered]);

    const documentLoadSuccess = useCallback(({numPages}) => {
        setPagesRendered(0);
        setNumPages(numPages);
    }, [numPages]);

    return (
        <div className={classNames('pdf-wrapper', wrapperClass)}>
            {pdfExist
                ? <ResizableBox
                    className="pdf-container"
                    width={Infinity}
                    height={0}
                    axis="x"
                >
                    <Document
                        file={file}
                        onLoadSuccess={documentLoadSuccess}
                        loading={<LoadingSpinner className="overlay"/>}
                        className={classNames('pdf-document', docClass)}
                    >
                        {
                            Array.from(
                                new Array(pagesRenderedPlusOne),
                                (el, index) => {
                                    const isCurrentlyRendering = pagesRenderedPlusOne === index + 1;
                                    const isLastPage = numPages === index + 1;
                                    const needsCallbackToRenderNextPage = isCurrentlyRendering && !isLastPage;

                                    return (
                                        <Page
                                            key={`page_${index + 1}`}
                                            onRenderSuccess={needsCallbackToRenderNextPage ? pageRenderSuccess : null}
                                            pageNumber={index + 1}
                                            loading={<LoadingSpinner className="static"/>}
                                            width={windowWidth - windowWidth * width}
                                            className={classNames('pdf-page', pageClass)}
                                        />
                                    );
                                },
                            )
                        }
                    </Document>
                </ResizableBox>
                : <div className={'centered'}>
                    No pdf file found
                </div>
            }
        </div>
    );
};

PdfFile.propTypes = {
    pdfUrl: PropTypes.string.isRequired,
    pdfExist: PropTypes.bool.isRequired,
    wrapperClass: PropTypes.string,
    docClass: PropTypes.string,
    pageClass: PropTypes.string,
    width: PropTypes.oneOf([...Array.from({length: 100}, (_, i) => parseFloat('0.' + i)), 1])
};

export default React.memo(PdfFile);