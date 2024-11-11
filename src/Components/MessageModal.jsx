// MessageModal.js
import React from 'react';
import { Modal, Card ,Stack, Col, Button} from 'react-bootstrap';


const MessageModal = ({ show, handleClose, message, error }) => {
    return (
        <Modal show={show} onHide={handleClose} centered style={{border: 'none'}}>
            <Card 
                style={{border: 'none'}}
            >
                <Card.Body>
                <Stack>
                    <Col className='text-center mb-3'>
                        <strong>Message : </strong>{message}  
                    </Col>
                    <Button
                        variant='success'
                        className="ms-2 mb-1"
                        onClick={handleClose}
                    >Close</Button>
                </Stack>
                </Card.Body>
            </Card>

        </Modal>
    );
};

export default MessageModal;
