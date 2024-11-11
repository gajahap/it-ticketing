import React, { useState } from 'react';
import axiosInstance from '../../axiosConfig';
import './CircularProgressBar.css';
import { Button } from 'react-bootstrap';
import MessageModal from '../MessageModal';

const CircularProgressBar = ({ progress, process_by_user_id, id, reloadDatas }) => {
  const [isLoading, setIsLoading] = useState(false);
  const circlesWithDescriptions = [
    "Pending",
    `Tiket telah diproses oleh [${process_by_user_id ||'Teknisi'}]`,
    "Selesai",
    "Closed"
  ];

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // Control for modal visibility

  const handleCloseTicket = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.put(`/ticketings/closed/${id}`);
      setMessage("Tiket Berhasil Di Close");
      setShowModal(true);
      reloadDatas(); // Reload data after successful submit
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseMessage = () => {
      setShowModal(false);
      setMessage(null); // Clear the message when modal closes
  };

  return (
    <div className="progress-container-vertical">
      {circlesWithDescriptions.map((value, index) => (
        <div key={index+1} className="circle-container">
          {index > 0 && (
            <div className={`connector ${progress >= index+1 ? 'active' : ''}`} />
          )}
          <div className="circle-content">
            <div className={`circle ${progress >= index+1 ? 'active' : ''}`}></div>
            <div className="description" style={{fontWeight: progress === index+1 ? 'bold' : 'normal'}}>
              {value}
              {index+1 === 3 && progress === index+1 && 
                <Button
                  variant="danger"
                  className="ms-2"
                  style={{width:'5em', height:'2em', fontSize:'0.8em', padding: 0}}
                  onClick={handleCloseTicket}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Close'}
                </Button>
              }
            </div>
          </div>
        </div>  
      ))}

      <MessageModal show={showModal} handleClose={handleCloseMessage} message={message} error={error}/>

    </div>

  );
};
export default CircularProgressBar;


