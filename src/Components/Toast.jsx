import React, { useState } from 'react';
import { Toast } from 'react-bootstrap';
import personVector from '../assets/images/logo_gajah.jpg'; // Ensure you have this path correctly set to your vector image file

const ToastCustom = () => {
  const [show, setShow] = useState(true);

  const toggleShow = () => setShow(!show);

  return (
    <>
        <Toast className="bounce" show={show} style={{ position: 'absolute', top: '25%', left: '20px', zIndex: 9999 }}>
            <Toast.Header closeButton={false}>
                <img src={personVector} alt="Person Icon" className="rounded me-2" style={{ width: 'auto', height: '20px' }} />

                <strong className="me-auto">Staff IT</strong>
                <small>Baru saja</small>
                <button
                    type="button"
                    className="btn-close ms-2 mb-1"
                    aria-label="Close"
                    onClick={toggleShow}
                ></button>
            </Toast.Header>
            <Toast.Body><p>Hai, salam hangat. silahkan mengisi <b>"Form"</b> untuk mengajukan tiket, dan pastikan anda mengisi form dengan benar.</p><p>Anda Juga dapat memeriksa progress dari tiket anda pada bagian <b>"Tracking"</b>.</p> </Toast.Body>
        </Toast>
    </>

  );
};

export default ToastCustom; 
