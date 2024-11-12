import React from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import Elephant from '../assets/images/elephant.png';

const ErrorHandler = ({ error }) => {
  const errorMessage = error.response ? error.response.data.message : 'Terjadi kesalahan tidak diketahui.';

  return (
    <Container className="d-flex justify-content-center" style={{ height: '100vh' }}>
      <Row className="m-auto align-self-center">
        <Col className="text-center">
          <h1 className="text-center">{error.response ? error.response.status : 'Error'}</h1>
          <img
            src={Elephant}
            alt="Elephant"
            className="img-fluid d-block mx-auto"
            style={{ maxWidth: '200px' }}
          />
          <hr />
          {error.response && error.response.status === 500 ? (
            <Alert variant="danger" className="text-center">
              Terjadi kesalahan pada server, silakan coba lagi nanti.
            </Alert>
          ) : (
            <p className="text-center">{errorMessage}</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ErrorHandler;

