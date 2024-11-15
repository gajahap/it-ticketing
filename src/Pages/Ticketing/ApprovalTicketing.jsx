import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Card, Image, Row, Col, Spinner ,Table, Overlay, Tooltip, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Logo from '../../assets/images/gap.png';
import axiosInstance from '../../axiosConfig';
import { useParams } from 'react-router-dom';
import MessageModal from '../../Components/MessageModal';
import ErrorHandler from '../../Components/ErrorHandler';
import Loading from '../../Components/Loading';

const DetailFormTicketing = () => {
    const { ticketId, token } = useParams(); // Ambil nilai ticketId dari URL
    const [isLoading, setIsLoading] = useState(true);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [data , setData] = useState(null);
    const [tooltip,setTooltip] = useState(false);
    const target = useRef(null);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [spkbItems, setSpkbItems] = useState(null);
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false); // Control for modal visibility
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketingResponse, departmentsResponse, spkbItmesResponse] = await Promise.all([
                    axiosInstance.get(`/ticketing/approval/${ticketId}/${token}`),
                    axiosInstance.get('/departments'),
                    axiosInstance.get(`/spkb-items/list/${ticketId}`)
                ]);
                setData(ticketingResponse.data.ticketing);
                
                const formattedDepartmentOptions = departmentsResponse.data.map(option => ({
                    id: option.id,
                    value: option.nama_divisi
                }));
                setDepartmentOptions(formattedDepartmentOptions)

                setSpkbItems(spkbItmesResponse.data);
                setIsLoading(false); // Move this to the finally block
            } catch (error) {
                console.error(error);
                setError(error);
                setIsLoading(false); // Move this to the finally block
            }
        };
    
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ticketingResponse, departmentsResponse, spkbItmesResponse] = await Promise.all([
                axiosInstance.get(`/ticketings/get/${ticketId}`),
                axiosInstance.get('/departments'),
                axiosInstance.get(`/spkb-items/list/${ticketId}`)

            ]);
            setData(ticketingResponse.data);
            
            const formattedDepartmentOptions = departmentsResponse.data.map(option => ({
                id: option.id,
                value: option.nama_divisi
            }));
            setDepartmentOptions(formattedDepartmentOptions)

            setSpkbItems(spkbItmesResponse.data);

            setIsLoading(false); // Move this to the finally block
            
        } catch (error) {
            console.error(error);
            setIsLoading(false); // Move this to the finally block
            console.error(error);
        }
    };

    function maskPhoneNumber(phoneNumber) {
        // Pastikan panjang nomor telepon cukup untuk disensor
        if (!phoneNumber || phoneNumber.length <= 5) return phoneNumber;
      
        // Ambil 3 angka pertama dan 2 angka terakhir
        const firstThree = phoneNumber.slice(0, 4);
        const lastTwo = phoneNumber.slice(-2);
      
        // Hitung jumlah bintang berdasarkan panjang nomor telepon
        const stars = '*'.repeat(phoneNumber.length - 5);
      
        // Gabungkan dengan tanda bintang untuk angka yang disensor
        return `${firstThree}${stars}${lastTwo}`;
      }


      const handleSubmitApprove = async () => {
        setIsButtonLoading(true);
        try {
            await axiosInstance.put(`/ticketing/approved/closed/${ticketId}`);
            setMessage("Tiket Berhasil di Approve");
            setShowModal(true);
            setIsButtonLoading(false);
            fetchData();
        } catch (error) {
            setIsButtonLoading(false);
        } finally {
            setIsLoading(false);
            setIsButtonLoading(false);
        }
      };

      const handleCloseMessage = () => {
        setShowModal(false);
        setMessage(null); // Clear the message when modal closes
    };
      

    return (
        <>
            {isLoading ? (
                <Loading/>
            ) : (
                <>
                {error ? (
                    <ErrorHandler error={error}/>
                ):(
                    <div style={{ position: 'relative',height: '100vh'}}>
                    {/* <ToastCustom /> */}
                    <div style={{ overflow: 'hidden', position: 'absolute', width: '100%', height: '100%'}}>
                        <div className="half-circle"></div>
                    </div>
                    <Container className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: '100%' }}>
                        <Card 
                            className="p-lg-5 p-4" 
                            style={{ maxWidth: '1200px', width: '100%', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 3px 10px 0 rgba(0, 0, 0, 0.1)', borderRadius: '15px', border: 'none', marginTop: '20px' }}>   
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
                                    <h2>No : {data.no_tiket || ''}
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
                            <p style={{marginBottom:'0', backgroundColor:'wheat', padding:'15px'}}>
                                {data.is_accept ? (
                                    <> 
                                        <strong>Pesan : </strong>Dear Bapak/Ibu [{data.user && data.user.name}], tiket {data.jenis_ticketings.is_spkb ? 'SPKB' : 'permintaan perbaikan'} ini sudah disetujui pada {new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(data.approved_time))}
                                    </>
                                ):(
                                    <> 
                                         <strong>Pesan : </strong>Dear Bapak/Ibu [{data.user && data.user.name  }], tiket {data.jenis_ticketings.is_spkb ? 'SPKB' : 'permintaan perbaikan'} ini menunggu persetujuan dari Bapak/Ibu untuk dapat diproses oleh teknisi, silakan tinjau kembali tiket ini sebelum melakukan approvement.
                                    </>
                                )}
                            </p>
                            <hr />         


                            {data.jenis_ticketings.is_spkb ? (
                                <>
                                <Card className='p-2'>
                                    <Row className='flex-md-row-reverse'>
                                        <Col lg={4} md={12} sm={12}>
                                            <p style={{ textAlign: 'right', fontSize: '20px',paddingTop:'10%'}} className="text-center">PT. GAJAH ANGKASA PERKASA BANDUNG</p>
                                        </Col>
                                        <Col lg={4} md={12} sm={12}>
                                            {data.jenis_ticketings.is_daterange ? (
                                                <>
                                                    <h1 className='text-center'>S.P.B</h1>
                                                    <hr />
                                                    <p className='text-center'>(SURAT PEMINJAMAN BARANG)</p>
                                                </>
                                            ):(
                                                <>
                                                    <h1 className='text-center'>S.P.K.B</h1>
                                                    <hr />
                                                    <p className='text-center'>(SURAT PERMINTAAN KEBUTUHAN BARANG)</p>
                                                </>
                                            )} 

                                        </Col>
                                        <Col lg={4} md={12} sm={12}>
                                            <Table >
                                                <tbody>
                                                    <tr>
                                                        <td style={{fontWeight:'bold'}}>Tgl:</td>
                                                        <td>{data.created_at ? new Date(data.created_at).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'loading...'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{fontWeight:'bold'}}>{data.jenis_ticketings.is_daterange ? 'No. SPB' : 'No. SPKB'}:</td>
                                                        <td>{data.no_tiket || 'loading...'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ width: '35%', wordBreak: 'break-word', whiteSpace: 'normal',fontWeight:'bold' }}>Bag:</td>
                                                        <td style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{departmentOptions.find(option => option.id === data.divisis_id)?.value || 'loading...'}</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <div style={{ overflow: 'auto', maxHeight: '300px' }}>
                                        <Table bordered>
                                            <thead>
                                                <tr>
                                                    <th>No.</th>
                                                    <th>Banyak Barang</th>
                                                    <th>Satuan</th>
                                                    <th>Nama Barang</th>
                                                    {data.jenis_ticketings.is_daterange ? (
                                                        <th>Rentang Waktu</th>
                                                    ):null}
                                                    <th>Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {spkbItems && spkbItems.map((spkbItem, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{spkbItem.qty_spkb_item}</td>
                                                        <td>{spkbItem.satuan_spkb_item}</td>
                                                        <td>{spkbItem.spkb_barang?.nama_barang}</td>
                                                        {data.jenis_ticketings.is_daterange ? (
                                                            <td>{spkbItem.start_date ? `${new Date(spkbItem.start_date).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })} - ${spkbItem.end_date ? new Date(spkbItem.end_date).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}` : ''}</td>
                                                        ):null}
                                                        <td>{spkbItem.ket_spkb_item}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                    <Row>
                                        <Col>

                                        </Col>
                                        <Col>
                                            <p style={{ textAlign: 'center',paddingTop:'10%'}} className="text-center">Mengetahui Ka. Bag</p>
                                            <p style={{ textAlign: 'center',paddingTop:'20%'}}>{data.user && data.user.name}</p>
                                        </Col>
                                        <Col>
                                            <p style={{ textAlign: 'center',paddingTop:'10%'}} className="text-center">Pemohon,</p>
                                            <p style={{ textAlign: 'center',paddingTop:'20%'}}>{data.nama_pemohon}</p>
                                        </Col>
                                    </Row>  
                                </Card>
                                </>
                            ) : (
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
                            )}

                            {data.file_upload_url === null ? (
                                <>
                                <Stack gap={3}>
                                    <strong>Lampiran</strong>
                                    <Card className="p-2"style={{ width: '300px', height: '200px'}}>
                                        <a href={`http://192.168.2.40:8000${data.file_upload_url}`} className="text-decoration-none text-dark"> 
                                            <Card.Img variant="top" src={`http://192.168.2.40:8000${data.file_upload_url}`}  style={{ maxWidth: '100%', height: '30%', objectFit: 'cover' }}
                                            />
                                            <Card.Body>
                                                {data.created_at ? new Date(data.created_at).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'loading..'}
                                            </Card.Body>
                                        </a>
                                    </Card>
                                </Stack>
                                </>
                            ):null}
                            {data.is_accept ? 
                                null
                            :(
                            <Button variant="primary" className='mt-3' onClick={handleSubmitApprove}>
                             {isButtonLoading ? (
                                    <Spinner animation="border" role="status" style={{ width: '1rem', height: '1rem' }}>
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                ) : 'Approve'}
                            </Button>
                            )}




                        </Card>
                    </Container>
                    <MessageModal show={showModal} handleClose={handleCloseMessage} message={message}/>
                    <footer style={{ bottom: 0, width: '100%', padding: '20px 0', textAlign: 'center', background: '#f8f9fa' }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#6c757d'}}>© {new Date().getFullYear()} PT.Gajah Angkasa Perkasa. All Rights Reserved.</p>
                    </footer>
                </div>
                )}

                </>

            )}
        </>
    );
};

export default DetailFormTicketing;