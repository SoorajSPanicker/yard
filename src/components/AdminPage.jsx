import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handlegobackHome=()=>{
    console.log("go back home")
    navigate('/home');
 }
  useEffect(() => {
    // Fetch data from the server
    fetch('http://localhost:4000/installation') 
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);
  const deleteAllData = async () => {
    setLoading(true);
    try {
      // Replace these URLs with your actual endpoints
      const endpoints = [
        'http://localhost:4000/users', // or 'http://localhost:4000/installation' based on your setup
        // Add other endpoints if needed
      ];

      await Promise.all(endpoints.map(url =>
        fetch(url, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to delete data from ${url}`);
          }
        })
      ));
      alert('All data deleted successfully');
    } catch (error) {
      setError(error);
      alert(`Error deleting data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{zIndex:'1'}}>
      <h1>Admin Page</h1>
      <button style={{zIndex:'1'}} onClick={handlegobackHome} className='btn btn-warning'>Back</button>
      <button onClick={deleteAllData} className='btn btn-danger'>
        Delete All Data
      </button>
      <div className="table-container">

      <table  className="linetable" style={{color:'black'}}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>App ID</th>
            <th>Installed Date</th>
            <th>Password</th>
            <th>Usage Count</th>
            <th>Last Usage Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id}>
              <td>{user.username || '-'}</td>
              <td>{user.email || '-'}</td>
              <td>{user.appId || '-'}</td>
              <td>{user.installeddate || '-'}</td>
              <td>{user.password || '-'}</td>
              <td>{user.usageCount || '-'}</td>
              <td>{user.lastUsageDate || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default AdminPage;
