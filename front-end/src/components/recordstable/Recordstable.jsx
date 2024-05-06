import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import './Recordstable.css';
import UpdateFormModal from '../updateformmodal/UpdateformModal';
import FormModal from '../formmodal/Formmodal';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPenToSquare, faTrash} from "@fortawesome/free-solid-svg-icons"

const RecordsTable = ({ records, onDeleteRecord }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [recordToUpdate, setRecordToUpdate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const recordsPerPage = 5;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;


  
  
  // Filter records based on search query
  const filteredRecords = records.filter(record =>
    (record.Name && record.Name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (record.Type && record.Type.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (record.ResourceRecords && record.ResourceRecords.some(rr => rr.Value.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const handleDeleteRecord = async (record) => {
    const { Name, Type, ResourceRecords } = record;
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/dns-records/${Name}/${Type}/${ResourceRecords[0].Value}`, {
        method: 'DELETE'
      });
  
      if (response.ok) {
        setSuccessMessage('Record deleted successfully');
        setTimeout(() => {
          setSuccessMessage(null); // Clear success message after 2000ms
        }, 2000);
      } else {
        console.error('This record cant be deleted:', response.statusText);
        setErrorMessage('This record cant be deleted');
        setTimeout(() => {
          setErrorMessage(null); // Clear error message after 2000ms
        }, 2000);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      setErrorMessage('Error deleting record');
      setTimeout(() => {
        setErrorMessage(null); // Clear error message after 2000ms
      }, 2000);
    }
  };
  

  const handleOpenUpdateModal = (record) => {
    setRecordToUpdate(record);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setRecordToUpdate(null);
    setShowUpdateModal(false);
  };

  const navigateToDashboard = () => {
    window.location.href = '';
  };

  return (
    <div className="records-table-wrapper">
      <div className="records-table-container">
        <h2 className="table-heading">DNS Records Table</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

      <Button onClick={() => setShowModal(true)} className='add-record-button'>Add New Record</Button>

        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <Table striped bordered hover className='records-table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Value</th>
              <th colSpan={2}>Options</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.Name}</td>
                <td>{record.Type}</td>
                <td>{record.ResourceRecords.map(rr => rr.Value).join(', ')}</td>
                <td><FontAwesomeIcon icon={faTrash} onClick={() => handleDeleteRecord(record)} className="delete-button"/></td>
                <td><FontAwesomeIcon icon={faPenToSquare} onClick={() => handleOpenUpdateModal(record)} className="update-button"/>
                </td>
              </tr>
              

              

            ))}

             {showModal && <FormModal onClose={() => setShowModal(false)} />} 
          </tbody>
        </Table>
        <div className="pagination">
          {Array.from({ length: Math.ceil(filteredRecords.length / recordsPerPage) }, (_, index) => (
            <Button variant="info" key={index} onClick={() => paginate(index + 1)} className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}>
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
      <Button variant="danger" onClick={navigateToDashboard}>Close Records Table</Button>

      {showUpdateModal && (
        <UpdateFormModal
          recordToUpdate={recordToUpdate}
          onUpdate={(updatedRecord) => {
            console.log('Updated record:', updatedRecord);
          }}
          onClose={handleCloseUpdateModal}
        />
      )}
    </div>
  );
};

export default RecordsTable;
