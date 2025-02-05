import React, { useState,useEffect } from 'react'
import Alert from './Alert';
import DeleteConfirm from './DeleteConfirm';
import { Token } from 'aws-sdk';


function NewProject({loadProject,setloadProject,setProjectFolder,setprojectNo,setselectedprojectPath, setAssetList,setgettokenNumber,setunassignedmodel,setAllLineList,setAllEquipementList,setAlltags,setAllDocuments,setAllArea, setallDisc,setallSys,setUserTagInfoTable ,setGeneralTagInfoFields,setAllCommentStatus}) {

  
    const [showprojectmodal,setshowprojectmodal] = useState(false);
    const [showallprojects,setshowallprojects] = useState(false);
    const [allprojects,setallprojects] = useState([])
    const [projectNumber, setProjectNumber] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [selectedDirectory, setSelectedDirectory] = useState('');
    const [customAlert,setCustomAlert] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [currentDeleteNumber, setCurrentDeleteNumber] = useState(null);
    const [mapprojectmodal,setmapProjectModal] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [editProjectNumber, setEditProjectNumber] = useState('');
    const [editProjectName, setEditProjectName] = useState('');
    const [editProjectDescription, setEditProjectDescription] = useState('');
    const [editProjectPath,setEditProjectPath] = useState('')
    const [showEditModal, setShowEditModal] = useState(false);




    const handleConfirm = () => {
      setShowConfirm(false);
      switch (itemToDelete.type) {
        case 'deleteall':
          window.api.send('delete-all-project'); 
          handleClose()
          break;
        case 'deleteproject':
          window.api.send('delete-project', currentDeleteNumber);
          handleClose()
          break;
        default:
          break;
      }
      setShowConfirm(false);
      setItemToDelete(null);
    };
  
    const handleCancel = () => {
      setShowConfirm(false);
    };
     const handleClose = () => setloadProject(false);

     const handlecreatenewproject=()=>{
      setshowprojectmodal(true);
     }

     const handleMapProject =()=>{
      setmapProjectModal(true);
     }
     

     useEffect(() => {
      // Define the function to handle IPC messages
      const handleDataFetched = (data) => {
        console.log("Received data from main process:",data);
        setSelectedDirectory(data);
      };
  
      window.api.receive('select-folder-fetched', handleDataFetched);
    }, []); 

     useEffect(() => {
      // Request data from main process when component mounts
      console.log("Sending 'fetch-data' request to main process");
      window.api.send('fetch-data');
      console.log("Receiving response from main process ");
   
      // Listen for response from main process
      window.api.receive('data-fetched', (data) => {
        console.log("Received data from main process:", data);
        setallprojects(data);
    });   
   }, []);

   const handleshowallprojects =()=>{
     setshowallprojects(!showallprojects);
   }
   const handleDirectoryChange = () => {
    console.log("Sending 'select-folder' request to main process");
    window.api.send('select-folder');
  };
  
  const handleCreateProject = async() => {
 // Check if project name is provided
 console.log(projectNumber)
 console.log(projectName)
 console.log(projectDescription)
 console.log(selectedDirectory);
//  setProjectFolder(projectName);
//  setprojectNo(projectNumber);

 if (!projectNumber || !projectName || !selectedDirectory) {
  
  setCustomAlert(true);
  setModalMessage(('Please fill all fields and choose a folder'))
  return;
}
else{
  const data = {
    projectNumber: projectNumber,
    projectName: projectName,
    projectDescription: projectDescription,
    selectedDirectory:selectedDirectory
};

window.api.send('save-data', data);
setProjectNumber('');
setProjectName('');
setProjectDescription('');
setSelectedDirectory('');
setAllArea([]);
setallDisc([]);
setallSys([]);
setunassignedmodel([]);
setAllLineList([]);
setAllEquipementList([])
setAlltags([]);
setAllDocuments([])
setUserTagInfoTable([])
setAllCommentStatus([]);
setGeneralTagInfoFields([]);
handleCloseProject();
handleClose();
 
}
  };

 const handleCloseProject=()=>{
    setshowprojectmodal(false)
    setmapProjectModal(false);
    setProjectNumber('');
    setProjectName('');
    setProjectDescription('');
    setSelectedDirectory('');
 }
 const handleOpenProject = (projectNumber,projectName,projectPath,tokennumber) => {
   console.log(tokennumber)
  if (projectNumber ) {
    console.log("Sending 'open-project' request to main process");
    setprojectNo(projectNumber);
    setProjectFolder(projectName);
    setselectedprojectPath(projectPath);
    setgettokenNumber(tokennumber)
    console.log("token",tokennumber)
    handleClose();
    window.api.send('open-project',projectNumber); 
   
  } 
};
const handleDeleteEntireProject=()=>{
  setItemToDelete({ type: 'deleteall'});
  setShowConfirm(true);
}

const handleDeleteProject=(projectId)=>{
  setItemToDelete({ type: 'deleteproject',data:projectId});
  setCurrentDeleteNumber(projectId);
  setShowConfirm(true);
}
const handleEditProject = (projectId) => {
  const projectToEdit = allprojects.find(project => project.projectId === projectId);
  if (projectToEdit) {
    setEditingProject(projectToEdit);
    setEditProjectNumber(projectToEdit.projectNumber);
    setEditProjectName(projectToEdit.projectName);
    setEditProjectDescription(projectToEdit.projectDescription);
    setEditProjectPath(projectToEdit.projectPath)
    setShowEditModal(true);
  } else {
    console.error(`Project with ID ${projectId} not found.`);
  }
};

const handleMapproject =()=>{
  if(selectedDirectory){
    window.api.send('map-project',selectedDirectory);
    handleCloseProject();
    handleClose();
  }
  else{
    setCustomAlert(true);
    setModalMessage("Please choose folder...")
  }

}

const handleSaveEditedProject = () => {
  const updatedFields = {
    projectId: editingProject.projectId,
    projectNumber:editProjectNumber,
    projectName:editProjectName,
    projectDescription:editProjectDescription,
    projectPath:editProjectPath
    
  };

  console.log(updatedFields);

  // Send only the updated fields to the main process
  window.api.send('edit-project', updatedFields);

  // Update local state
  setallprojects(prevProjects =>
    prevProjects.map(project =>
      project.projectId === editingProject.projectId ? { ...project, ...updatedFields } : project
    )
  );

  setShowEditModal(false);
  setEditingProject(null); // Clear editingProject state after saving
};
  return (

    <div className='mainpro'>
      {
        loadProject &&  <div className='project-model'>
        <div className='heading' >
            <h6>Load project</h6>
            <div className="icons">
             <i className="fa-solid fa-trash" title='Delete all project' onClick={handleDeleteEntireProject}></i>
            <i class="fa-solid fa-folder  ms-3" onClick={handleMapProject} title='Map project' ></i>
            <i class="fa-solid fa-circle-plus ms-3 " title='Create new project' onClick  ={handlecreatenewproject}></i>
            <i class="fa-solid fa-xmark ms-3 "title='Close project' onClick={handleClose}></i>
             </div>
        </div>
        {showallprojects ? (
          <div style={{ textAlign: 'center', backgroundColor: '#272626', height: '30px', color: 'grey' }}>
            <p>(Empty)</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#272626', height: 'auto', color: 'grey', overflowY: 'auto' }}>
            {allprojects.length > 0 ? (
              <table className='table table-light'>
                <tbody>
                  {allprojects.map((project, index) => (
                    <tr key={index}>
                      <td style={{ backgroundColor: '#515CBC', textAlign: 'center' }}>{project.projectNumber}</td>
                      <td style={{ display: 'flex', alignItems: 'center', backgroundColor: '#272626', color: 'white' }}>
                        {project.projectName}
                        <button onClick={() => handleOpenProject(project.projectNumber, project.projectName, project.projectPath, project.TokenNumber)} style={{ marginLeft: 'auto', background: 'none', border: 'none' }}>
                        <i class="fa-solid fa-folder-open text-light" title='Open-project'></i>                         
                        </button>
                        <i className="fa-solid fa-pencil text-light ms-3 me-2" onClick={()=>handleEditProject(project.projectId)} title='Edit-project'></i>

                        <i className="fa-solid fa-trash text-light ms-3 me-2" onClick={()=>handleDeleteProject(project.projectId)} title='Delete-project'></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', backgroundColor: '#272626', height: 'auto', color: 'grey' }}>
                <p>(Empty)</p>
              </div>
            )}
          </div>
        )}  
        <div className='footing'>
          
            {
              showallprojects ?<p>
              Show projects<input type="checkbox" onClick={handleshowallprojects}/>
            </p> :<p>
              Hide projects<input type="checkbox" onClick={handleshowallprojects}/>
            </p> 
            }
           
          
        </div>
      </div>
      }
    
      {
      showprojectmodal && <div className="whole">
      <div className="project-dialog">
      <div className="title-dialog">
      <p className='text-light'>Add New Project</p>
      <p className='text-light cross' onClick={handleCloseProject}>&times;</p>
      </div>  
      <div className="dialog-input">
      <label>Project number *</label>
      <input type="text" value={projectNumber} onChange={(e) => setProjectNumber(e.target.value)} />
      <label>Project Name*</label>
      <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
      <label>Project Description</label>
      <textarea value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)}
       />
       <button className='btn projectbtn' onClick={handleDirectoryChange}>Choose Folder</button>
       {
        selectedDirectory && <p>{selectedDirectory}</p>
       }
        </div>       
        <div className='dialog-button' style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className='btn btn-secondary' onClick={handleCloseProject}>Cancel</button>
        <button className='btn btn-dark' onClick={handleCreateProject}>Ok</button>
      </div>
    </div>
      </div>
    }
{
      mapprojectmodal && <div className="whole">
      <div className="project-dialog">
      <div className="title-dialog">
      <p className='text-light'>Map Project</p>
      <p className='text-light cross' onClick={handleCloseProject}>&times;</p>
      </div>  
      <div className="dialog-input">
      
       <button className='btn projectbtn' onClick={handleDirectoryChange}>Choose Folder</button>
       {
        selectedDirectory && <p>{selectedDirectory}</p>
       }
        </div>       
      <div className='dialog-button'>
      <button className='btn btn-secondary' onClick={handleCloseProject}>Cancel</button>
      <button className='btn btn-dark' onClick={handleMapproject}>Ok</button>
      </div>
    </div>
      </div>
    }

{
  showEditModal && (
    <div className="whole">
      <div className="project-dialog">
        <div className="title-dialog">
          <p className="text-light">Edit Project</p>
          <p className="text-light cross" onClick={() => setShowEditModal(false)}>&times;</p>
        </div>
        <div className="dialog-input">
          <label>Project Number *</label>
          <input type="text" value={editProjectNumber} onChange={(e) => setEditProjectNumber(e.target.value)} />
          <label>Project Name *</label>
          <input type="text" value={editProjectName} onChange={(e) => setEditProjectName(e.target.value)} />
          <label>Project Description</label>
          <textarea value={editProjectDescription} onChange={(e) => setEditProjectDescription(e.target.value)} />
        </div>
        <div className="dialog-button" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
          <button className="btn btn-dark" onClick={handleSaveEditedProject}>Save</button>
        </div>
      </div>
    </div>
  )
}

     {customAlert && (
        <Alert
          message={modalMessage}
          onAlertClose={() => setCustomAlert(false)}
        />
      )}

{showConfirm && (
        <DeleteConfirm
          message="Are you sure you want to delete?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>

    
    
  )
}

export default NewProject
