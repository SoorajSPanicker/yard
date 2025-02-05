import React, { useState } from 'react'

function CreateMto() {
    const [buttonState,setButtonState] = useState(false);
  return (
    <div style={{ zIndex: '1', position: 'absolute', width: '100%', backgroundColor: '#33334c' ,color:'white'}}>
         <div id="mtoDiv" class="sideLnkDiv">
                <div id="mtoRegDiv" class="tabContentR mtoTab" >
                    <form>
                        <div class="tabContentHead" style={{display:'flex',justifyContent:'space-between',alignItems:'center', padding:'20px'}}>
                            <h1 style={{color:'white', paddingLeft:'20px'}} >Create MTO</h1>
                            <div style={{padding:'10px', flex:'1',textAlign:'right'}} >
                                {
                                    buttonState?<button className='btn btn-secondary'>Save</button>:<button className='btn btn-secondary'>Back to list</button>
                                }
                             </div>
                         </div>
                         <hr style={{marginTop:'-10px'}}/>
                        <div class="pageFit" style={{padding:'20px',height:'80vh',overflowY:'auto'}}>
                            <section class="page-section" style={{borderBottom:'0px',display:'flex'}} >
                                <div className="form-group">
                                    <label for="mtoPId">Project ID *</label>
                                    <br/>
                                    <input type="text" id="mtoPId" required=""/>
                                </div>
                                <div  className="form-group ms-3">
                                    <label for="mtoDocNo">Document NO*</label>
                                    <br/>
                                    <input type="text" id="mtoDocNo" required="" />
                                </div>   
                                <div className="form-group ms-3 me-3">
                                    <label for="mtoDocNo">Document Name*</label>
                                    <br/>
                                    <input type="text" id="mtoDocName" required="" />
                                </div>
                            </section>
                            <div class="subHeadBg" style={{backgroundColor:'#424444', padding:'10px'}}>
                                <label style={{fontSize:'20px'}} >Revision</label>
                            </div>
                            <section  style={{paddingTop:'20px', paddingLeft:'40px',paddingRight:'10px', boxShadow:' 0 0 2px #e8dede'}} >
                               <div style={{display:'flex',marginBottom:'10px'}}>
                               <div className="form-group">
                                    <label for="mtoRevNo">Rev. No*</label>
                                    <br/>
                                    <input type="text" id="mtoRevNo" required="" />
                                </div>
                                <div className="form-group ms-3">
                                    <label for="mtoRevDate">Rev. Date</label>
                                    <br/>
                                    <input type="text" id="mtoRevDate" />
                                </div>
                               </div>
                                <div className="w-100" style={{marginBottom:'10px'}}  >
                                    <label for="mtoRevDesc">Rev.Description</label>
                                    <br/>
                                    <textarea type="text" id="mtoRevDesc" style={{minWidth:'244px',width:'--webkit-fill-available'}} ></textarea>
                                </div>
                                <div style={{display:'flex',paddingBottom:'20px'}}>
                                <div className="form-group">
                                    <label for="mtoPreparedBy">Rev. Prepared_By*</label>
                                    <br/>
                                    <input type="text" id="mtoPreparedBy" />
                                </div>
                                <div className="form-group ms-3">
                                    <label for="mtoRevCheckedBy">Rev. Checked_By*</label>
                                    <br/>
                                    <input type="text" id="mtoRevCheckedBy"  />
                                </div>
                                <div className="form-group ms-3">
                                    <label for="mtoRevApprovedBy">Rev. Approved_By*</label>
                                    <br/>
                                    <input type="text" id="mtoRevApprovedBy"  />
                                </div>
                                </div>
                               
                            </section>

                            <div class="row" style={{padding:'10px'}} >
                                <i class="fa fa-list-alt" style={{fontSize:'20px'}}  ></i>
                                <h2 style={{display:'inline-block'}}>Add Items</h2>
                            </div>
                            <div class="row" style={{padding:'10px'}} >
                                <i class="fa fa-list-alt" style={{fontSize:'20px'}}  ></i>
                                <h2 style={{display:'inline-block'}}>Add Items</h2>
                            </div>
                            <div class="row" style={{padding:'10px'}} >
                                <i class="fa fa-list-alt" style={{fontSize:'20px'}}  ></i>
                                <h2 style={{display:'inline-block'}}>Add Items</h2>
                            </div>
                            <div class="row" style={{padding:'10px'}} >
                                <i class="fa fa-list-alt" style={{fontSize:'20px'}}  ></i>
                                <h2 style={{display:'inline-block'}}>Add Items</h2>
                            </div>
                            <div class="row" style={{padding:'10px'}} >
                                <i class="fa fa-list-alt" style={{fontSize:'20px'}}  ></i>
                                <h2 style={{display:'inline-block'}}>Add Items</h2>
                            </div>
                            <div class="row" style={{padding:'10px'}} >
                                <i class="fa fa-list-alt" style={{fontSize:'20px'}}  ></i>
                                <h2 style={{display:'inline-block'}}>Add Items</h2>
                            </div>
                  </div>
                  </form>
               
      </div>
      </div>
    </div>
  )
}

export default CreateMto
