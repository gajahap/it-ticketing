import React, { useState, useEffect,useCallback  } from 'react';
import { Container, Button, Form, Card, Image, Row, Col, Spinner, Tab, Tabs, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/gap.png';
import ToastCustom from '../../Components/Toast';
import SpkbAccordion from '../../Components/SpkbAccordion';
import axiosInstance from '../../axiosConfig';
import MessageModal from '../../Components/MessageModal';
import Select from 'react-select';
import Elephant from '../../assets/images/elephant.png';
import CircularProgressBar from '../../Components/CircularProgressBar/CircularProgressBar';
import Loading from '../../Components/Loading';
import { FaBook } from "react-icons/fa";

const FormTicketing = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isNotConnected, setIsNotConnected] = useState(false);
    const [jenisPermintaan, setJenisPermintaan] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false); // Control for modal visibility
    const [approvedToOptions, setApprovedToOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [isTrackingLoading, setIsTrackingLoading] = useState(false);
    const [isSpkbForm, setIsSpkbForm] = useState(null);
    const [progress, setProgress] = useState(0);
    const descriptions = [
        "Pending",
        // "Tiket telah disetujui oleh kepala bagian",
        "Tiket telah diproses oleh Rizky",
        "Selesai",
        "Closed"
      ];

    const [formData, setFormData] = useState({
        user_id: '',
        tgl_tiket: new Date().toISOString().split('T')[0],
        nama_pemohon: '',
        departments_id: '',
        contact_person: '',
        jenis_ticketings_id: '',
        description: '',
        spkbData:[],
        file_upload:null
    });

    const [trackingData, setTrackingData] = useState({
        no_tiket: '',
    });

    const [trackingDataResult, setTrackingDataResult] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jenisPermintaanResponse, approvedToResponse, departmentsResponse] = await Promise.all([
                    axiosInstance.get('/jenis-ticketing'),
                    axiosInstance.get('/users/approved'),
                    axiosInstance.get('/departments')
                ]);
    
                setJenisPermintaan(jenisPermintaanResponse.data);
    
                const formattedApprovedToOptions = approvedToResponse.data.map(option => ({
                    value: option.id,
                    label: option.name
                }));
                setApprovedToOptions(formattedApprovedToOptions);
    
                const formattedDepartmentOptions = departmentsResponse.data.map(option => ({
                    value: option.id,
                    label: option.nama_depart
                }));
                setDepartmentOptions(formattedDepartmentOptions);
                setIsLoading(false); // Move this to the finally block
            } catch (error) {
                console.error(error);
                setIsNotConnected(true);
                setIsLoading(false); // Move this to the finally block
            }
        };
    
        fetchData();
    }, []);
    
    useEffect(() => {
        if (message) {
            setShowModal(true); // Show modal when there's a message
        }
    }, [message]);

    const handleCloseMessage = () => {
        setShowModal(false);
        setMessage(null); // Clear the message when modal closes
    };

    const handleChangeForm = (e) => {
        const { name, value, type, files } = e.target;
        
        // Jika input adalah contact_person dan nilai dimulai dengan "0", ganti dengan "62"
        if (name === 'contact_person' && value.startsWith("0")) {
            setFormData({
            ...formData,
            [name]: '62' + value.slice(1), // Ganti "0" dengan "62"
            });
            
        } else {
            // Handle file upload jika tipe adalah 'file'
            if (type === 'file') {
            setFormData({
                ...formData,
                [name]: files[0], // Ambil file pertama dari input file
            });
            } else {
            // Handle input lainnya (seperti teks, email, dll)
            setFormData({
                ...formData,
                [name]: value,
            });
            }
        }
    };
      

    const handleChangeTracking = (e) => {
        const { name, value } = e.target;
        setTrackingData({ ...trackingData, [name]: value });
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/ticketings/store', formData);
            const id = response.data.ticketing.id;
            navigate(`/detail-form/${id}`);
        } catch (error) {
            setMessage('Terjadi kesalahan saat mengirim data.');
            setError(error);
            console.log(error); 
            
        }
    };

    const handleSubmitTracking = async (e) => {
        e.preventDefault();
        setIsTrackingLoading(true);
        try {
            const no_tiket = trackingData.no_tiket;
            const response = await axiosInstance.get(`/ticketing/status/${no_tiket}`, trackingData);
            setTrackingDataResult(response.data);
            setIsTrackingLoading(false);
        } catch (error) {
            if(error.status === 404){
                setTrackingDataResult(null);
                setIsTrackingLoading(false);
                setMessage('Tiket anda tidak dapat ditemukan, pastikan anda memasukan nomor tiket yang valid.');
                setError(error);
            }else{
                setTrackingDataResult(null);
                setIsTrackingLoading(false);
                setMessage('Terjadi kesalahan saat mengambil data.');
                setError(error);
            }
        }
    };


    const reloadTrackingData = async () => {
        try {
          const { no_tiket } = trackingData;
          const response = await axiosInstance.get(`/ticketing/status/${no_tiket}`);
          setTrackingDataResult(response.data);
        } catch (error) {
          console.error('Error reloading data', error);
        }
      };


    // const handleSpkbDataChange = (newSpkbData) => {
    //     setFormData({ ...formData, spkbData: newSpkbData });
    // };

    const handleSpkbDataChange = useCallback((newData) => {
        setFormData((prevFormData) => ({ ...prevFormData, spkbData: newData }));
    }, []); // Add dependencies if necessary

    const customStyles = {
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? "#04419c" : "#ddd",
          boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
          "&:hover": {
            borderColor: "#4A90E2",
          },
          fontSize: "16px",
        }),
        menu: (base) => ({
          ...base,
          borderRadius: 8,
          marginTop: 0,
          zIndex: 10,
        }),
        menuList: (base) => ({
          ...base,
          padding: 0,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected ? "#04419c" : state.isFocused ? "#E3F2FD" : "white",
          color: state.isSelected ? "white" : "black",
          padding: "10px 20px",
          cursor: "pointer",
        }),
      };    

    return (
        <>
            {isLoading ? (
                <Loading/>
            ) : (
                <div style={{ position: 'relative', height: '100vh' }}>
                    <ToastCustom />
                    <div style={{ overflow: 'hidden', position: 'absolute', width: '100%', height: '100%' }}>
                        <div className="half-circle"></div>
                    </div>

                    <Container className="d-flex flex-column justify-content-center align-items-center py-5 mb-3">

                        <Card className="p-lg-5 p-4 fades card" style={{ maxWidth: '850px', width: '100%', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 3px 10px 0 rgba(0, 0, 0, 0.1)', borderRadius: '15px', border: 'none', marginTop: '20px', minHeight: '800px' }}>
                            <div className="d-flex justify-content-left flex-row gap-2">
                                <Image src={Logo} style={{ width: 'auto', height: 'auto', maxWidth: '8em', maxHeight: '8em' }} />
                                <div className="p-2">
                                    <h2 className="text-left" style={{ color: '#04419c', fontWeight: '700', fontSize: '30px' }}>IT <span style={{ fontSize: '30px', fontWeight: '400' }}>Ticketing</span></h2>
                                    <p className="text-left" style={{ fontSize: '14px' }}>Mengotomatisasikan, Sesuaikan, Prioritaskan. Tiket kami membantu Anda menyelesaikan <b>permasalahan anda yang berkaitan dengan IT</b>.</p>
                                </div>
                            </div>
                            <hr />
                            {isNotConnected ? (
                            <Col className="d-flex flex-column  align-items-center">
                                <Image src={Elephant} alt="Elephant" style={{ width: '35%', height: 'auto' }} />
                                <p style={{ fontSize: '16px', textAlign: 'center'}}><strong>Pesan Layanan : </strong>Maaf saat ini layanan kami belum tersedia, silahkan coba beberapa saat lagi</p>
                            </Col>
                            ): (
                            <Tabs defaultActiveKey="form" id="uncontrolled-tab-example" className="mb-3 custom-tabs">
                                <Tab eventKey="form" title="Form" className='fades'>
                                    <Form className="mt-2" onSubmit={handleSubmitForm}>
                                        <Row className="mb-3">
                                            <Col>
                                                <Form.Group controlId="tgl_tiket">
                                                    <Form.Label><strong>Tanggal <span className='text-danger'>*</span></strong></Form.Label>
                                                    <Form.Control type="date" name="tgl_tiket" value={formData.tgl_tiket} onChange={handleChangeForm} required />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3" controlId="nama_pemohon">
                                            <Form.Label><strong>Nama Pemohon <span className='text-danger'>*</span></strong></Form.Label>
                                            <Form.Control type="text" name="nama_pemohon" placeholder="Nama Lengkap Anda" value={formData.nama_pemohon} onChange={handleChangeForm} required />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="departments_id">
                                            <Form.Label><strong>Department <span className='text-danger'>*</span></strong></Form.Label>
                                            <Select
                                                name="departments_id"
                                                options={departmentOptions}
                                                styles={customStyles}
                                                value={departmentOptions.find(option => option.value === formData.departments_id)}
                                                onChange={(selectedOption) => setFormData({ ...formData, departments_id: selectedOption.value })}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="contact_person">
                                            <Form.Label><strong>Kontak Pemohon <span className='text-danger'>*</span></strong></Form.Label>
                                            <Form.Control type="number" name="contact_person" placeholder="Contoh : 628996546548" value={formData.contact_person} onChange={handleChangeForm} required />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="jenis_ticketings_id">
                                            <Form.Label><strong>Jenis Permintaan <span className='text-danger'>*</span></strong></Form.Label>
                                            {jenisPermintaan && jenisPermintaan.map((jenis) => (
                                                <Form.Check 
                                                    key={jenis.id} 
                                                    type='radio' 
                                                    name="jenis_ticketings_id" 
                                                    id={`jenis_ticketings_id${jenis.id}`} 
                                                    label={jenis.nama_jenis} 
                                                    value={jenis.id}
                                                    onChange={(e) => {
                                                        setIsSpkbForm(jenis.is_spkb);
                                                        handleChangeForm(e);
                                                    }}
                                                    required 
                                                />
                                            ))}
                                        </Form.Group>
                                        
                                        {isSpkbForm === null ? null : isSpkbForm ? (
                                            <SpkbAccordion onDataChange={handleSpkbDataChange} />
                                        ) : (
                                            <Form.Group className="mb-3" controlId="description">
                                            <Form.Label><strong>Note<span className='text-danger'>*</span></strong></Form.Label>
                                            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChangeForm} required />
                                            <span className='text-muted' style={{ fontSize: '9px' }}><i>Jelaskan secara terperinci permasalah yang anda alami.</i></span>
                                        </Form.Group>
                                        )}

                                        <Form.Group className="mb-3" controlId="nama_pemohon">
                                            <Form.Label><strong>Upload Foto <span className='text-danger'></span></strong></Form.Label>
                                            <Form.Control type="file" name="file_upload" placeholder="Pilih File" onChange={handleChangeForm} />
                                        </Form.Group>   

                                        <Form.Group className="mb-3" controlId="user_id">
                                            <Form.Label><strong>Approved to <span className='text-danger'>*</span></strong></Form.Label>
                                            <Select
                                                name="user_id"
                                                options={approvedToOptions}
                                                styles={customStyles}
                                                value={approvedToOptions.find(option => option.value === formData.user_id)}
                                                onChange={(selectedOption) => setFormData({ ...formData, user_id: selectedOption.value })}
                                                required
                                            />
                                        </Form.Group>

                                        <Button variant="primary" type="submit" className="w-100">
                                            Submit
                                        </Button>
                                    </Form>
                                </Tab>
                                <Tab eventKey="tracking" title="Tracking">
                                    <Form onSubmit={handleSubmitTracking} className='fades'>
                                        <Form.Group className="mb-3" controlId="no_tiket">
                                            <Form.Label><strong>Nomor Tiket<span className='text-danger'>*</span></strong></Form.Label>
                                            <Form.Control type="text" name="no_tiket" placeholder="Masukkan id tiket Anda" value={trackingData.no_tiket} onChange={handleChangeTracking} required />
                                        </Form.Group>
                                        <Button variant="primary" type="submit" className="w-100">
                                            {isTrackingLoading ? (
                                                <Spinner animation="border" role="status" style={{ width: '1rem', height: '1rem' }}>
                                                    <span className="visually-hidden">Loading...</span>
                                                </Spinner>
                                            ) : 'Start Tracking'}
                                        </Button>
                                    </Form>
                                    {trackingDataResult && (
                                        <>
                                            <hr />
                                            <h5>Tracking Result : {trackingDataResult.no_tiket}</h5>
                                            <p>Status Approve : <span className={trackingDataResult.is_accept ? 'text-succes' : 'text-danger'}>{trackingDataResult.is_accept ? 'Sudah Approve' : 'Belum Approve'}</span></p>
                                            <div className="d-flex justify-content-left align-items-left mt-5">
                                                <CircularProgressBar progress={trackingDataResult.status} process_by_user_id={trackingDataResult.user ? trackingDataResult.user.name : 'Teknisi'} id={trackingDataResult.id} reloadDatas={reloadTrackingData}/>
                                            </div>
                                        </>
                                    )}

                                </Tab>
                            </Tabs>
                            )}

                        </Card>
                    </Container>
                    
                    <MessageModal show={showModal} handleClose={handleCloseMessage} message={message} error={error}/>

                    <footer style={{ bottom: 0, width: '100%', padding: '20px 0', textAlign: 'center', background: '#f8f9fa' }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>© {new Date().getFullYear()} PT.Gajah Angkasa Perkasa. All Rights Reserved.</p>
                    </footer>
                </div>
            )}
        </>
    );
};

export default FormTicketing;

