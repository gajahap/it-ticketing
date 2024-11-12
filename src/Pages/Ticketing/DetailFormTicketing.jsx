import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Form, Card, Image, Row, Col, Spinner ,Table, Overlay, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Logo from '../../assets/images/gap.png';
import axiosInstance from '../../axiosConfig';
import { useParams } from 'react-router-dom';
import Loading from '../../Components/Loading';

const DetailFormTicketing = () => {
    const { ticketId } = useParams(); // Ambil nilai ticketId dari URL
    const [isLoading, setIsLoading] = useState(true);
    const [data , setData] = useState([]);
    const [tooltip,setTooltip] = useState(false);
    const target = useRef(null);
    const navigate = useNavigate(); // Initialize useNavigate
    const [departmentOptions, setDepartmentOptions] = useState([]);


    // useEffect(() => {
    //     const getData = async () => {
    //         try {
    //             const response = await axiosInstance.get(`/ticketings/get/${ticketId}`);                
    //             setData(response.data);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     };
    //     getData();
    //     setIsLoading(false);
    // }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketingResponse, departmentsResponse] = await Promise.all([
                    axiosInstance.get(`/ticketings/get/${ticketId}`),
                    axiosInstance.get('/departments')
                ]);
                setData(ticketingResponse.data);
                
                const formattedDepartmentOptions = departmentsResponse.data.map(option => ({
                    id: option.id,
                    value: option.nama_depart
                }));
                setDepartmentOptions(formattedDepartmentOptions)
                setIsLoading(false); // Move this to the finally block
            } catch (error) {
                console.error(error);
                setIsLoading(false); // Move this to the finally block
            }
        };
    
        fetchData();
    }, []);

    function maskPhoneNumber(phoneNumber) {
        // Pastikan panjang nomor telepon cukup untuk disensor
        if (!phoneNumber || phoneNumber.length <= 10) return phoneNumber;
      
        // Ambil 3 angka pertama dan 2 angka terakhir
        const firstThree = phoneNumber.slice(0, 4);
        const lastTwo = phoneNumber.slice(-2);
      
        // Hitung jumlah bintang berdasarkan panjang nomor telepon
        const stars = '*'.repeat(phoneNumber.length - 5);
      
        // Gabungkan dengan tanda bintang untuk angka yang disensor
        return `${firstThree}${stars}${lastTwo}`;
      }
      

    return (
        <>
            {isLoading ? (
                <Loading/>
            ) : (
                <div style={{ position: 'relative',height: '100vh'}}>
                    {/* <ToastCustom /> */}
                    <div style={{ overflow: 'hidden', position: 'absolute', width: '100%', height: '100%'}}>
                        <div className="half-circle"></div>
                    </div>
                    <Container className="d-flex flex-column justify-content-center align-items-center py-5" style={{ height: '100%' }}>
                        <Card 
                            className="p-lg-5 p-4" 
                            style={{ maxWidth: '80em', width: '100%', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 3px 10px 0 rgba(0, 0, 0, 0.1)', borderRadius: '15px', border: 'none', marginTop: '20px' }}
                        >   
                            <Row>
                                <Col lg={4} md={12} sm={12}>
                                    <Image
                                        src={Logo}
                                        style={{ width: '80px', height: 'auto' }}
                                    />
                                </Col>
                                <Col  lg={4} md={12} sm={12} className='text-lg-center text-md-start text-sm-start align-self-center'>
                                    <h3>IT Ticketing </h3>
                                    <p>
                                        by IT Support PT. Gajah Angkasa Perkasa
                                    </p>
                                </Col>
                                <Col lg={4} md={12} sm={12} className='text-lg-end text-md-start text-sm-start align-self-center'>
                                    <h2>ID : {data.no_tiket || ''}
                                        <Button ref={target} className='btn btn-secondary ms-2' onClick={() => {
                                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                                // Gunakan Clipboard API jika tersedia
                                                navigator.clipboard.writeText(data.no_tiket);
                                                setTooltip(!tooltip);
                                            } else {
                                                // Fallback untuk dukungan yang lebih luas
                                                const textArea = document.createElement("textarea");
                                                textArea.value = data.no_tiket;
                                                document.body.appendChild(textArea);
                                                textArea.select();
                                                document.execCommand("copy");
                                                document.body.removeChild(textArea);
                                                setTooltip(!tooltip);
                                            }
                                        }}>
                                            Salin
                                        </Button>
                                        <Overlay target={target.current} show={tooltip} placement="right">
                                            {(props) => (   
                                            <Tooltip id="overlay-example" {...props}>
                                                Tersalin
                                            </Tooltip>
                                            )}
                                        </Overlay>
                                    </h2>
                                </Col>
                            </Row>
                            <hr />
                            <p>
                                <strong>Note: </strong>Request Ticketing Anda berhasil disubmit, cek progress permintaan anda pada halaman <a href="/" target="_blank">Form Ticketing</a> pada bagian <b>Track Progres</b>.
                            </p>
                            <hr />         

                            <Table>
                                <tbody>
                                    {/* <tr>
                                        <td style={{ width: '35%', wordBreak: 'break-word', whiteSpace: 'normal' }}>Date</td>
                                        <td style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{data.tgl_tiket || 'loading..'}</td>
                                    </tr> */}
                                    <tr>
                                        <td style={{ width: '35%', wordBreak: 'break-word', whiteSpace: 'normal' }}>Nama Pemohon</td>
                                        <td style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{data.nama_pemohon || 'loading..'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{width: '35%', wordBreak: 'break-word', whiteSpace: 'normal' }}>Departments</td>
                                        <td style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{departmentOptions.find(option => option.id === data.departments_id)?.value || 'loading..'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ width: '35%', wordBreak: 'break-word', whiteSpace: 'normal' }}>Contact Person</td>
                                        <td style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{maskPhoneNumber(data.contact_person) || 'loading..'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ width: '35%', wordBreak: 'break-word', whiteSpace: 'normal' }}>Tanggal dibuat</td>
                                        <td style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{data.created_at ? new Date(data.created_at).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'loading..'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ width: '35%', wordBreak: 'break-word', whiteSpace: 'normal' }}>Jenis Permintaan</td>
                                        <td style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{data.jenis_ticketings?.nama_jenis || 'loading..'}</td> 
                                    </tr>
                                    {data.description && (
                                        <tr>
                                            <td style={{ width: '35%', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                                Keterangan
                                            </td>
                                            <td style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                                {data.description || ''}
                                            </td>
                                        </tr>
                                    )}

                                </tbody>
                            </Table>




                        </Card>
                    </Container>
                    <footer style={{ bottom: 0, width: '100%', padding: '20px 0', textAlign: 'center', background: '#f8f9fa' }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>© {new Date().getFullYear()} PT.Gajah Angkasa Perkasa. All Rights Reserved.</p>
                    </footer>
                </div>
            )}
        </>
    );
};

export default DetailFormTicketing;