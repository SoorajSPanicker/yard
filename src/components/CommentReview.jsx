import React, { useState } from 'react';
import Alert from './Alert';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

function CommentReview({ allComments }) {
  const [editedRowIndex, setEditedRowIndex] = useState(-1);
  const [editedLineData, setEditedLineData] = useState({});
  const [customAlert, setCustomAlert] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleEditOpen = (index) => {
    setEditedRowIndex(index);
    setEditedLineData({ ...allComments[index] });
  }

  const handleSave = () => {
    const data = {
      commentNumber: editedLineData.number,
      comment: editedLineData.comment,
      status: editedLineData.status,
      priority: editedLineData.priority
    };

    window.api.send('editCommentStatus', data);
    setCustomAlert(true);
    setModalMessage("Comment editing success");
    setEditedRowIndex(-1);
    setEditedLineData({});
  }

  const handleCloseEdit = () => {
    setEditedRowIndex(-1);
    setEditedLineData({});
  }

  const handleChange = (field, value) => {
    setEditedLineData({
      ...editedLineData,
      [field]: value
    });
  }

  const handlePriorityChange = (value) => {
    setEditedLineData({
      ...editedLineData,
      priority: value
    });
  }

  const handleDeleteComment = (commentNumber) => {
    window.api.send("delete-comment", commentNumber);
  }

  const handleExport = () => {
    const headers = [
      'Comment Number', 'Comment', 'Status', 'Priority', 'Comment Date'
    ];
  
    const dataToExport = allComments.map(comment => ({
      'Comment Number': comment.number,
      'Comment': comment.comment,
      'Status': comment.status,
      'Priority': comment.priority,
      'Comment Date': comment.createddate,
      'Closed Date': comment.closedDate
    }));
  
    const ws = XLSX.utils.json_to_sheet(dataToExport, { header: headers });
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comment List');
  
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'CommentList.xlsx');
  };

  const handleDeleteAllComments = () => {
    window.api.send('delete-all-comments')
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  }

  const filteredComments = allComments.filter(comment => 
    comment.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.createddate.includes(searchQuery)
  );

  return (
    <div style={{ width: '100%', height: '90vh', backgroundColor: 'white', zIndex: '1', position: 'absolute' }}>
      <form>
        <div className="table-container">
          <table className='tagTable'>
            <thead>
              <tr>
                <th className="wideHead">Comment number</th>
                <th className="wideHead">Comment</th>
                <th className="wideHead">Status</th>
                <th>Priority</th>
                <th>Comment Date</th>
                <th>Closed Date</th>
                <th className="tableActionCell">
                  <i className="fa fa-download" title="Export" onClick={handleExport} ></i>
                  <i className="fa-solid fa-trash-can ms-3" title='Delete all' onClick={handleDeleteAllComments} ></i>
                </th>
               
              </tr>
              <tr>
              <th colSpan="7">
                  <input
                    type="text"
                    placeholder="Search by status or date"
                    value={searchQuery}
                    onChange={handleSearch}
                    style={{ width: '100%', padding: '5px' }}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((comment, index) => (
                <tr key={index} style={{ color: 'black' }}>
                  <td style={{ backgroundColor: '#f0f0f0' }}>{comment.number}</td>
                  <td>
                    {editedRowIndex === index ?
                      <input
                        type="text"
                        value={editedLineData.comment || ''}
                        onChange={e => handleChange('comment', e.target.value)}
                      />
                      : comment.comment
                    }
                  </td>
                  <td>
                    {editedRowIndex === index ?
                      <select
                        value={editedLineData.status || ''}
                        onChange={e => handleChange('status', e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="onhold">On Hold</option>
                      </select>
                      : comment.status
                    }
                  </td>
                  <td>
                    {editedRowIndex === index ?
                      <div>
                        <label>
                          Priority 1 <input
                            type="radio"
                            value="1"
                            checked={editedLineData.priority === '1'}
                            onChange={() => handlePriorityChange('1')}
                          />
                        </label>
                        <label>
                          Priority 2 <input
                            type="radio"
                            value="2"
                            checked={editedLineData.priority === '2'}
                            onChange={() => handlePriorityChange('2')}
                          />
                        </label>
                        <label>
                          Priority 3 <input
                            type="radio"
                            value="3"
                            checked={editedLineData.priority === '3'}
                            onChange={() => handlePriorityChange('3')}
                          />
                        </label>
                      </div>
                      : comment.priority
                    }
                  </td>
                  <td>{comment.createddate}</td>
                  <td>{comment.closedDate}</td>
                  <td style={{ backgroundColor: '#f0f0f0' }}>
                    {comment.status !== 'closed' ? (
                      editedRowIndex === index ?
                        <>
                          <i className="fa-solid fa-floppy-disk text-success" onClick={handleSave}></i>
                          <i className="fa-solid fa-xmark ms-3 text-danger" onClick={handleCloseEdit}></i>
                        </>
                        :
                        <>
                          <i className="fa-solid fa-pencil" onClick={() => handleEditOpen(index)}></i>
                          <i className="fa-solid fa-trash-can ms-3" onClick={() => handleDeleteComment(comment.number)} ></i>
                        </>
                    ) : (
                      <i className="fa-solid fa-trash-can ms-3" onClick={() => handleDeleteComment(comment.number)} ></i>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </form>

      {customAlert && (
        <Alert
          message={modalMessage}
          onAlertClose={() => setCustomAlert(false)}
        />
      )}
    </div>
  )
}

export default CommentReview;
