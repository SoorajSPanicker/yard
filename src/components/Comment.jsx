import React, { useState, useEffect } from 'react';

function Comment({ x, y, isOpen, onClose, content,allCommentStatus,docdetnum }) {
    const [comment, setComment] = useState('');
    const [status,setstatus] = useState('');
    const [priority,setPriority] = useState('');
    const [comments, setComments] = useState([]);
  
    const handleCommentClick = async(clickX, clickY) => {
       
        setComment('');
        onClose();
       
        if(!comment){
            alert("please fill correctly or the given object details not availible")
        }
        else{
            if(docdetnum){
                const data = {
                    docnumber:docdetnum,
                    comment:comment,
                    status:status,
                    priority:priority,
                    coordinateX: content.isx,
                    coordinateY: content.isy,
                }
                console.log(data);
                window.api.send('add-comment',data)
                setComment('');
                setstatus('');
                setPriority('');
                onClose()
                
            }
            else{
                const data = {
                    comment:comment,
                    status:status,
                    priority:priority,
                    coordinateX:content.intersectionPointX,
                    coordinateY:content.intersectionPointY,
                    coordinateZ:content.intersectionPointZ
                }
                window.api.send('add-comment',data)
                setComment('');
                setstatus('');
                setPriority('');
                onClose()
                }
            }
            
          
            

    };

    useEffect(() => {
        if (!isOpen) {
            setComment('');
            setstatus('');
            setPriority('');
        }
    }, [isOpen]);
    const menuHeight = '400px'

    return (
        <>
        
          
            {isOpen && (
  
    // <!-- Modal -->
<div id="commentModal" class="modalcomment"  style={{
                        position: 'absolute',
                        width:'300px',
                        top: y+ menuHeight>window.innerHeight ? y-menuHeight:y,
                        left: x-250,
                        transform: 'translate(-50%, -50%)',
                        background: '#fff',
                        borderRadius: '5px',
                        boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        borderBlockColor: 'black',
                        color:'black'
                    }}>
  {/* <!-- Modal content --> */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'black', color: 'white', padding: '10px' }}>
    <h6 style={{ margin: '0' }}>Set Comment</h6><span class="closes" onClick={onClose}>&times;</span>
    </div>
  <div class="comment-modal-content">

    <label>comment</label>
    <textarea id="commentInput" placeholder="Enter your comment here..." value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
    <label for="status" >Status:</label>
    <select
                            id="status"
                            value={status}
                            onChange={(e) => setstatus(e.target.value)}
                        >
                            <option value="" disabled>Choose status</option>
                            {allCommentStatus.map((statusOption) => (
                                <option style={{color:'black'}} key={statusOption.statusname} value={statusOption.statusname}>
                                    {statusOption.statusname}
                                </option>
                            ))}
                        </select>
    <div class="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
      <label className='label'>Priority:</label>
      <div style={{display:'flex', flexDirection:'row' , alignItems:'center'}}>
      <input type="radio" id="priority1" name="priority" value="1"/>
      <label for="priority1"  style={{ marginRight: '5px' }}>1</label>
      <input type="radio" id="priority2" name="priority" value="2"/>
      <label for="priority2" style={{ margin: '0 5px' }}>2</label>
      <input type="radio" id="priority3" name="priority" value="3"/>
      <label for="priority3"  style={{ marginLeft: '5px' }}>3</label>
      </div>
      
    </div>
    <button id="addCommentBtn" className='btn' onClick={() => handleCommentClick(x, y)}>Save Comment</button>
  </div>
</div>

            )}
              
        </>
    );
}

export default Comment;
