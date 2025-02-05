import React from 'react'

function ReviewSpecMaterialTable() {
  return (
    <div style={{ zIndex: '1', position: 'absolute', width: '100%', backgroundColor: '#33334c',height:'100vh' }}>
   
    <h4 style={{fontWeight:'bold',  color: '#515CBC', textAlign:'left', paddingLeft:'20px', paddingTop:'15px'}}>Review Spec Material Table</h4>
    <hr style={{color:'white'}}/>
   
    <div style={{color: 'white', margin:'0',padding:'0' }}>
       
          <div>
            <h4>Size Table</h4>
            {/* <div className="table-container"> */}
          <table className='tagTable'>
            <thead>
              <tr>
                <th className="wideHead">1</th>
                <th className="wideHead">1</th>
                <th className="mediumHead">1</th>
                <th className="wideHead">1</th>
                <th className="tableActionCell">
               EDIT/DELETE
                </th>
              </tr>
            </thead>
            <tbody>
                <tr>
                    <td>ND</td>
                    <td>OD</td>
                    <td>THCK</td>
                    <td>SCH</td>
                    <td>WEIGHT</td>
                    <i className="fa-solid fa-pencil"></i>
                        <i className="fa-solid fa-trash-can ms-3" ></i>
                </tr>
            
            </tbody>
          </table>
          </div>          
          {/* </div> */}
          <div>
            <h4>Temperature/Pressure Table</h4>
            {/* <div className="table-container"> */}
          <table className='tagTable'>
            <thead>
              <tr>
                <th className="wideHead">Size1</th>
                <th className="wideHead">Size2</th>
                <th className="mediumHead">Item</th>
                <th className="wideHead">Item Description</th>
                <th className="tableActionCell">
                <i className="fa fa-download" title="Import" ></i>
                </th>
              </tr>
            </thead>
            <tbody>
                <tr>
                    <td>aaaa</td>
                    <td>bbbb</td>
                    <td>cccc</td>
                    <td>aaaa</td>
                    <i className="fa-solid fa-pencil"></i>
                        <i className="fa-solid fa-trash-can ms-3" ></i>
                </tr>
            
            </tbody>
          </table>
          {/* </div>           */}
          </div>
          <div>
            <h4>Materials table</h4>
            {/* <div className="table-container"> */}
          <table className='tagTable'>
            <thead>
              <tr>
                <th className="wideHead">Size1</th>
                <th className="wideHead">Size2</th>
                <th className="mediumHead">Item</th>
                <th className="wideHead">Item Description</th>
                <th className="tableActionCell">
                <i className="fa fa-download" title="Import" ></i>
                </th>
              </tr>
            </thead>
            <tbody>
                <tr>
                    <td>aaaa</td>
                    <td>bbbb</td>
                    <td>cccc</td>
                    <td>aaaa</td>
                    <i className="fa-solid fa-pencil"></i>
                        <i className="fa-solid fa-trash-can ms-3" ></i>
                </tr>
            
            </tbody>
          </table>
          {/* </div>           */}
          </div>
          <div>
            <h4>Spec Details Table</h4>
            {/* <div className="table-container"> */}
          <table className='tagTable'>
            <thead>
              <tr>
                <th className="wideHead">Size1</th>
                <th className="wideHead">Size2</th>
                <th className="mediumHead">Item</th>
                <th className="wideHead">Item Description</th>
                <th className="tableActionCell">
                <i className="fa fa-download" title="Import" ></i>
                </th>
              </tr>
            </thead>
            <tbody>
                <tr>
                    <td>aaaa</td>
                    <td>bbbb</td>
                    <td>cccc</td>
                    <td>aaaa</td>
                    <i className="fa-solid fa-pencil"></i>
                        <i className="fa-solid fa-trash-can ms-3" ></i>
                </tr>
            
            </tbody>
          </table>
          {/* </div>           */}
          </div>
        
      </div>
   
   

    </div>
  )
}

export default ReviewSpecMaterialTable
