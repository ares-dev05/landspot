import React from 'react';
import PropTypes from 'prop-types';

const UploadDocumentsTable = ({documents, onDelete, onView, isBuilder}) => (
    <table className="table upload-documents_table">
        <tbody>
            {documents.length ? (
                documents.map(
                    ({id, estate_name, type_name, name, open_count}) => (
                        <tr key={id}>
                            {!isBuilder && (
                                <td className="document-name">{estate_name}</td>
                            )}
                            <td className="upload-documents_table-type">
                                {type_name}
                            </td>
                            <td className="document-name">
                                <a
                                    href={`/landspot/my-client-file/${id}`}
                                    onClick={() => onView(id)}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    {name}
                                </a>
                            </td>
                            <td className="upload-documents_open-counts">
                                <i className="landspot-icon eye" />
                                {`${open_count} Opens`}
                            </td>
                            <td className="actions">
                                <a onClick={() => onDelete(id)}>
                                    <i className="landspot-icon trash" />
                                </a>
                            </td>
                        </tr>
                    )
                )
            ) : (
                <tr>
                    <td className="my-clients-table_one-cell">
                        No lots assigned
                    </td>
                </tr>
            )}
        </tbody>
    </table>
);

UploadDocumentsTable.propTypes = {
    documents: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default UploadDocumentsTable;
