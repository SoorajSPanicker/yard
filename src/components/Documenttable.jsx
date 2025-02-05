import React,{useState} from 'react'
import DeleteConfirm from './DeleteConfirm';

function Documenttable({allDocuments}) {

  const [currentDeleteDocument, setCurrentDeleteDocument] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteDocumentFromTable = (number) => {
    setCurrentDeleteDocument(number);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    window.api.send('remove-document-table', currentDeleteDocument);
    setShowConfirm(false);
    setCurrentDeleteDocument(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setCurrentDeleteDocument(null);
  };
  return (
    <div style={{width:'100%', height:'100vh',backgroundColor:'white',zIndex:'1',position:'absolute'}}>
    <form>
  <div class="table-container">
    <table className='tagTable'>
    <thead>
       <tr >
            <th class="wideHead">Document number</th>
            <th class="wideHead">Title</th>
            <th class="">Description</th>
            <th class="wideHead">Type</th>
            <th>File</th>
            <th class="tableActionCell">
            <i class="fa fa-download" title="Import documents"></i>
            </th>
        </tr>
    </thead>
    <tbody>
    {allDocuments.map((document, index) => (
                        <tr key={index} style={{color:'black'}}>
                            <td style={{ backgroundColor:'#f0f0f0'}}>{document.number}</td>
                            <td>{document.title}</td>
                            <td>{document.descr}</td>
                            <td>{document.type}</td>
                            <td>{document.filename}</td>
                            <td style={{backgroundColor:'#f0f0f0'}}>
                            <i class="fa-solid fa-pencil"></i>
                            <i class="fa-solid fa-trash-can ms-3" onClick={()=>handleDeleteDocumentFromTable(document.number)}></i>

                            </td>
                        </tr>
                    ))}
    
    </tbody>

    </table>

  </div>
  </form>

{showConfirm && (
        <DeleteConfirm
          message="Are you sure you want to delete?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
</div>
  )
}

export default Documenttable
