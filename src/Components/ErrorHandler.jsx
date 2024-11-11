import React from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import Elephant from '../assets/images/elephant.png';

const ErrorHandler = ({ error }) => {
  return (
    <Container className="d-flex justify-content-center" style={{ height: '100vh' }}>
      <Row className="m-auto align-self-center">
        <Col className="text-center">
            <h1 className="text-center">{error.response.status}</h1>
            <img
              src={Elephant}
              alt="Elephant"
              className="img-fluid d-block mx-auto"
              style={{ maxWidth: '200px' }}
            />
            <hr />
            <p className="text-center">{error.response.data.message}</p>
        </Col>
      </Row>
    </Container>
  );
};

export default ErrorHandler;
