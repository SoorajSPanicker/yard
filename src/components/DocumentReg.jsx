import React, { useState, useRef,useEffect } from 'react';
import Alert from './Alert';
function DocumentReg() {
    const [documentNumber, setDocumentNumber] = useState('');
    const [documentTitle, setDocumenTitle] = useState('');
    const [documentType, setDocumentType] = useState('');
    const [documentDescription, setDocumentDescription] = useState('');
    const [documentFiles, setDocumentFiles] = useState('');
    const fileInputRef = useRef(null);
    const [customAlert,setCustomAlert] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [convertedFilename,setConvertedFileName] = useState('');
    const [convertedfilePath,setConvertedFilePath] = useState('');
    
   
    const docs = {
        types: [
            { code: 'AA', name: 'Accounting/Budget' },
            { code: 'CA', name: 'Analysis, test and calculation' },
            { code: 'DS', name: 'Data sheets' },
            { code: 'FD', name: 'Project design criteria and philosophies' },
            { code: 'iKA', name: 'Interactive procedures' },
            { code: 'iXB', name: 'Smart P&ID' },
            { code: 'iXX', name: 'H-Doc' },
            { code: 'KA', name: 'Procedures' },
            { code: 'LA', name: 'List/Registers' },
            { code: 'MA', name: 'Equipment user manual (ref. NS5820)' },
            { code: 'MB', name: 'Operating and maintenance instructions' },
            { code: 'MC', name: 'Spare parts list' },
            { code: 'PA', name: 'Purchase orders' },
            { code: 'PB', name: 'Blanket order/frame agreement' },
            { code: 'PD', name: 'Contract' },
            { code: 'RA', name: 'Reports' },
            { code: 'RD', name: 'System design reports and system user manuals' },
            { code: 'RE', name: 'DFI (Design - Fabrication - Installation) resumes' },
            { code: 'SA', name: 'Specifications & Standards' },
            { code: 'TA', name: 'Plans/schedules' },
            { code: 'TB', name: 'Work plan' },
            { code: 'TE', name: 'Estimates' },
            { code: 'TF', name: 'Work package' },
            { code: 'VA', name: 'Manufacturing/Fabrication and verifying documentation, including certificate of performance, material tractability, weld and NDE documents, list of certificates, third party verification/certificates and photos of submerged structures/equipment' },
            { code: 'VB', name: 'Certificates' },
            { code: 'XA', name: 'Flow diagrams' },
            { code: 'XB', name: 'Pipe and instrument diagram (P&ID)' },
            { code: 'XC', name: 'Duct and instrument diagrams (D&ID)' },
            { code: 'XD', name: 'General arrangement' },
            { code: 'XE', name: 'Layout drawings' },
            { code: 'XF', name: 'Location drawings (plot plans)' },
            { code: 'XG', name: 'Structural information; including main structural steel, secondary/outfitting steel, structural fire protection and acoustic/thermal insulation and fire protection' },
            { code: 'XH', name: 'Free span calculation' },
            { code: 'XI', name: 'System topology and block diagrams' },
            { code: 'XJ', name: 'Single line diagrams' },
            { code: 'XK', name: 'Circuit diagrams' },
            { code: 'XL', name: 'Logic diagrams' },
            { code: 'XM', name: 'Level diagrams' },
            { code: 'XN', name: 'Isometric drawings, including fabrication, heat tracing, stress and pressure testing' },
            { code: 'XO', name: 'Piping supports' },
            { code: 'XQ', name: 'Pneumatic/hydraulic connection drawings' },
            { code: 'XR', name: 'Cause and effect' },
            { code: 'XS', name: 'Detail cross sectional drawings' },
            { code: 'XT', name: 'Wiring diagrams' },
            { code: 'XU', name: 'Loop diagram' },
            { code: 'XX', name: 'Drawings - miscellaneous' },
            { code: 'ZA', name: 'EDP documentation' }
        ]
    };

    const handleFileChange = (e) => {
        setDocumentFiles(e.target.files[0]);
        const file = e.target.files[0];
        const data = {
            name: file.name,
            path: file.path
          };
          console.log(data);
          setDocumentFiles('')
        window.api.send('dwg-svg-converter',data)
        window.api.receive('dxf-conversion-success', (data) => {
            console.log(data);
            setConvertedFileName(data.convertedFileName);
            setConvertedFilePath(data.convertedFilePath);          
        });
    };

    const handleRegisterDocument = (e) => {
        e.preventDefault();

        if (!documentNumber || !documentType) {
            setCustomAlert(true);
            setModalMessage('Please fill documentNumber & documentType');
            return;
        } else {
            const data = {
                number: documentNumber,
                title: documentTitle,
                descr: documentDescription,
                type: documentType,
                filename: documentFiles.name || convertedFilename,
                filePath: documentFiles.path || convertedfilePath
            };          
            window.api.send('save-document-data', data);
            setDocumentNumber('');
            setDocumenTitle('');
            setDocumentDescription('');
            setDocumentFiles('');
            setDocumentType('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    return (
        <div style={{ zIndex: '1', position: 'absolute', width: '100%', backgroundColor: '#33334c' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div id="bulkImportDiv">
                    <div className="page">
                        <section className="page-section">
                            <div className="row">
                                <h4>Document registration</h4>
                            </div>
                        </section>
                        <hr />
                        <section className="page-section">
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="reg-input" style={{ fontSize: '13px', lineHeight: '30px' }}>
                                        <label>Document number<span style={{ fontSize: '11px' }}>*</span></label>
                                        <input type="text"  value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
                                        <label>Title</label>
                                        <input type="text" value={documentTitle} onChange={(e) => setDocumenTitle(e.target.value)} />
                                        <label>Description</label>
                                        <textarea type="text" value={documentDescription} onChange={(e) => setDocumentDescription(e.target.value)} />
                                        <label>Type<span style={{ fontSize: '11px' }}>*</span></label>
                                        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={{ width: '100%' }}>
                                            <option value="" disabled>Select document type</option>
                                            {docs.types.map((type) => (
                                                <option key={type.code} value={type.code}>{type.name}</option>
                                            ))}
                                        </select>
                                        <label>Model file</label>
                                        <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e)} />
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <button onClick={handleRegisterDocument} className="btn btn-light" style={{ fontSize: '12px' }}>Register</button>
                        </section>
                    </div>
                </div>
            </div>
            {customAlert && (
        <Alert
          message={modalMessage}
          onAlertClose={() => setCustomAlert(false)}
        />
      )}
        </div>
    );
}

export default DocumentReg;
