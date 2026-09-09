import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Card, Image, Row, Col, Table, Overlay, Tooltip, Stack, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '../../assets/images/gap.png';
import axiosInstance from '../../axiosConfig';
import MessageModal from '../../Components/MessageModal';
import ErrorHandler from '../../Components/ErrorHandler';
import Loading from '../../Components/Loading';
import { FaPrint, FaDownload, FaCopy, FaCheck, FaArrowLeft, FaTicketAlt } from "react-icons/fa";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import './DetailFormTicketing.css'; // Buat file CSS pendukung jika diperlukan

const DetailFormTicketing = () => {
    const { ticketId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    const [copied, setCopied] = useState(false);
    const target = useRef(null);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [spkbItems, setSpkbItems] = useState(null);
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
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
                setDepartmentOptions(formattedDepartmentOptions);
                setSpkbItems(spkbItmesResponse.data);
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        
    }, [ticketId]);

    const maskPhoneNumber = (phoneNumber) => {
        if (!phoneNumber || phoneNumber.length <= 5) return phoneNumber;
        const firstThree = phoneNumber.slice(0, 4);
        const lastTwo = phoneNumber.slice(-2);
        const stars = '*'.repeat(phoneNumber.length - 5);
        return `${firstThree}${stars}${lastTwo}`;
    };

    const handleCloseMessage = () => {
        setShowModal(false);
        setMessage(null);
    };

    const navigate = useNavigate();
    const printRef = useRef();

    const handleDownload = () => {
        const generatePDF = async () => {
            const element = printRef.current;
            const canvas = await html2canvas(element, { scale: 2 });
            const dataUrl = canvas.toDataURL("image/png");

            const pdf = new jsPDF("landscape", "mm", [canvas.width + 20, canvas.height + 20]);
            pdf.addImage(dataUrl, "PNG", 10, 10, canvas.width, canvas.height);
            pdf.save(`ticket_${data.no_tiket}.pdf`);
        };
        generatePDF();
    };

    const handleCopyTicketId = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(data.no_tiket);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    console.log(data);


    return (
        <>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    {error ? (
                        <ErrorHandler error={error} />
                    ) : (
                        <div className="ticket-detail-page d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', position: 'relative' }}>
                            
                            {/* Header Navigasi Kecil */}
                            <Container className="pt-4 pb-2">
                                <Button 
                                    variant="light" 
                                    className="d-flex align-items-center gap-2 fw-semibold shadow-sm border-0 px-3 py-2" 
                                    onClick={() => navigate('/')}
                                    style={{ borderRadius: '10px', color: '#04419c' }}
                                >
                                    <FaArrowLeft size={14} /> Kembali ke Beranda
                                </Button>
                            </Container>

                            {/* Main Container */}
                            <Container className="d-flex flex-column justify-content-center align-items-center py-3 flex-grow-1">
                                
                                {/* Info Banner Berhasil */}
                                <div className="w-100 mb-4" style={{ maxWidth: '850px' }}>
                                    <div className="alert-success-custom p-3 rounded-4 shadow-sm d-flex align-items-center gap-3 bg-white border-start border-4 border-success">
                                        <div className="bg-success text-white p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                            <FaCheck size={16} />
                                        </div>
                                        <div>
                                            <h6 className="mb-1 fw-bold text-dark">Tiket Berhasil Disubmit!</h6>
                                            <p className="mb-0 text-muted small">
                                                Cek progress permintaan Anda kapan saja melalui tab <b>Lacak Tiket</b> di halaman utama.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* KARTU UTAMA GAYA TIKET / RECEIPT */}
                                <Card 
                                    className="ticket-card border-0 shadow-md p-lg-5 p-4 position-relative overflow-hidden mb-4" 
                                    style={{ maxWidth: '850px', width: '100%', borderRadius: '24px', backgroundColor: '#ffffff' }}
                                >
                                    {/* Hiasan Aksen Sisi Tiket (Opsional, memberikan kesan tiket robek/perforasi) */}
                                    <div className="ticket-header-brand d-flex justify-content-between align-items-center pb-4 mb-4 border-bottom">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="p-2 rounded-3 bg-light border">
                                                <Image src={Logo} style={{ width: '45px', height: 'auto' }} />
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-0" style={{ color: '#04419c' }}>IT Ticketing System</h5>
                                                <small className="text-muted">PT. Gajah Angkasa Perkasa</small>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <span className="text-muted d-block small uppercase tracking-wider">ID TIKET</span>
                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                <span className="fw-bold fs-5 font-monospace text-dark">{data.no_tiket || '-'}</span>
                                                <Button 
                                                    ref={target}
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    className="rounded-circle p-2 d-flex align-items-center justify-content-center" 
                                                    style={{ width: '32px', height: '32px' }}
                                                    onClick={handleCopyTicketId}
                                                    title="Salin Nomor Tiket"
                                                >
                                                    {copied ? <FaCheck size={12} className="text-success" /> : <FaCopy size={12} />}
                                                </Button>
                                                <Overlay target={target.current} show={copied} placement="left">
                                                    {(props) => (
                                                        <Tooltip id="overlay-copied" {...props}>
                                                            Tersalin!
                                                        </Tooltip>
                                                    )}
                                                </Overlay>
                                            </div>
                                        </div>
                                    </div>

                                    {/* KONTEN UTAMA TIKET / SPKB */}
                                    <div ref={printRef} className="ticket-printable-area bg-white">
                                        {data.jenis_ticketings.is_spkb ? (
                                            <div>
                                                {/* Header Surat SPKB / SPB */}
                                                <div className="text-center mb-4">
                                                    <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill uppercase tracking-wider" style={{ backgroundColor: '#04419c !important' }}>
                                                        {data.jenis_ticketings.is_daterange ? 'SURAT PEMINJAMAN BARANG (SPB)' : 'SURAT PERMINTAAN KEBUTUHAN BARANG (SPKB)'}
                                                    </Badge>
                                                    <h4 className="fw-bold text-uppercase mt-2" style={{ letterSpacing: '0.5px' }}>
                                                        {data.jenis_ticketings.is_daterange ? 'S.P.B' : 'S.P.K.B'}
                                                    </h4>
                                                </div>

                                                {/* Meta Informasi Surat */}
                                                <Row className="mb-4 bg-light p-3 rounded-4 g-3">
                                                    <Col md={6}>
                                                        <div className="small text-muted mb-1">Tanggal Pengajuan</div>
                                                        <div className="fw-semibold text-dark">
                                                            {data.created_at ? new Date(data.created_at).toLocaleString('id-ID', { dateStyle: 'full' }) : '-'}
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="small text-muted mb-1">Bagian / Divisi</div>
                                                        <div className="fw-semibold text-dark">
                                                            {departmentOptions.find(option => option.id === data.divisis_id)?.value || '-'}
                                                        </div>
                                                    </Col>
                                                </Row>

                                                {/* Tabel Barang */}
                                                <div className="table-responsive mb-4">
                                                    <Table hover align="middle" className="align-middle border rounded-3 overflow-hidden">
                                                        <thead className="table-light text-uppercase fs-7 text-secondary">
                                                            <tr>
                                                                <th className="py-3 px-3">No.</th>
                                                                <th className="py-3">Qty</th>
                                                                <th className="py-3">Satuan</th>
                                                                <th className="py-3">Nama Barang</th>
                                                                {data.jenis_ticketings.is_daterange && <th className="py-3">Rentang Waktu</th>}
                                                                <th className="py-3">Keterangan</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {spkbItems && spkbItems.map((spkbItem, index) => (
                                                                <tr key={index}>
                                                                    <td className="px-3 fw-semibold text-muted">{index + 1}</td>
                                                                    <td><span className="badge bg-light text-dark border px-2 py-1">{spkbItem.qty_spkb_item}</span></td>
                                                                    <td>{spkbItem.satuan_spkb_item}</td>
                                                                    <td className="fw-bold text-dark">{spkbItem.spkb_barang?.nama_barang}</td>
                                                                    {data.jenis_ticketings.is_daterange && (
                                                                        <td>
                                                                            <small className="text-muted bg-white border px-2 py-1 rounded">
                                                                                {spkbItem.start_date ? `${new Date(spkbItem.start_date).toLocaleDateString('id-ID')} s/d ${spkbItem.end_date ? new Date(spkbItem.end_date).toLocaleDateString('id-ID') : '-'}` : '-'}
                                                                            </small>
                                                                        </td>
                                                                    )}
                                                                    <td className="text-muted small">{spkbItem.ket_spkb_item || '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>

                                                {/* Tanda Tangan / Approver Section */}
                                                <Row className="mt-5 pt-4 border-top text-center text-md-start g-4">
                                                    <Col md={6}>
                                                        <div className="p-3 border rounded-4 bg-light text-center">
                                                            <p className="text-muted small mb-4">Mengetahui Ka. Bag / Penyetuju</p>
                                                            <div className="fw-bold text-dark mt-4 pt-3 border-top border-secondary border-opacity-25 d-inline-block px-4">
                                                                {data.user ? data.user.name : 'Belum Ditentukan'}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="p-3 border rounded-4 bg-light text-center">
                                                            <p className="text-muted small mb-4">Pemohon</p>
                                                            <div className="fw-bold text-dark mt-4 pt-3 border-top border-secondary border-opacity-25 d-inline-block px-4">
                                                                {data.nama_pemohon}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        ) : (
                                            /* Detail Tiket Umum / Non-SPKB */
                                            <div className="py-2">
                                                <div className="mb-4">
                                                    <span className="badge bg-secondary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold">
                                                        <FaTicketAlt className="me-2" /> {data.jenis_ticketings?.nama_jenis || 'Tiket Umum'}
                                                    </span>
                                                </div>

                                                <Row className="g-4 mb-4">
                                                    <Col md={6}>
                                                        <div className="p-3 bg-light rounded-4 h-100">
                                                            <small className="text-muted d-block mb-1">Nama Pemohon</small>
                                                            <span className="fw-bold text-dark fs-6">{data.nama_pemohon}</span>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="p-3 bg-light rounded-4 h-100">
                                                            <small className="text-muted d-block mb-1">Divisi / Departemen</small>
                                                            <span className="fw-bold text-dark fs-6">{departmentOptions.find(option => option.id === data.divisis_id)?.value || '-'}</span>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="p-3 bg-light rounded-4 h-100">
                                                            <small className="text-muted d-block mb-1">Kontak Person (WhatsApp)</small>
                                                            <span className="fw-bold text-dark fs-6 font-monospace">{maskPhoneNumber(data.contact_person)}</span>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="p-3 bg-light rounded-4 h-100">
                                                            <small className="text-muted d-block mb-1">Tanggal Dibuat</small>
                                                            <span className="fw-bold text-dark fs-6">{data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}</span>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                {data.description && (
                                                    <div className="p-4 bg-light rounded-4 mb-4 border">
                                                        <small className="text-muted d-block fw-bold text-uppercase mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Keterangan Kendala / Permintaan</small>
                                                        <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{data.description}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Lampiran Foto jika ada */}
                                        {data.file_upload && (
                                            <div className="mt-4 pt-4 border-top">
                                                <h6 className="fw-bold mb-3 text-secondary">Lampiran File</h6>
                                                <Card className="p-2 shadow-sm border rounded-4 d-inline-block" style={{ width: '220px' }}>
                                                    <a href={`https://support.portalgapsoft.xyz${data.file_upload_url}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-dark"> 
                                                        <Card.Img 
                                                            variant="top" 
                                                            src={`https://support.portalgapsoft.xyz${data.file_upload_url}`} 
                                                            style={{ height: '130px', objectFit: 'cover', borderRadius: '10px' }}
                                                        />
                                                        <Card.Body className="px-2 py-2 text-center">
                                                            <small className="text-muted font-monospace" style={{ fontSize: '12px' }}>Lihat File Ukuran Penuh</small>
                                                        </Card.Body>
                                                    </a>
                                                </Card>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons Footer di dalam Card */}
                                    {data.jenis_ticketings.is_spkb && (
                                        <div className="mt-5 pt-4 border-top d-flex flex-wrap gap-2 justify-content-end">
                                            <Button 
                                                variant="outline-primary" 
                                                className="px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-semibold"
                                                onClick={() => navigate('/print-surat/' + data.id)}
                                            >
                                                <FaPrint /> Print Dokumen
                                            </Button>
                                            <Button 
                                                variant="primary" 
                                                className="px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-semibold"
                                                style={{ backgroundColor: '#04419c', border: 'none' }}
                                                onClick={handleDownload}
                                            >
                                                <FaDownload /> Download PDF
                                            </Button>
                                        </div>
                                    )}

                                </Card>
                            </Container>

                            <MessageModal show={showModal} handleClose={handleCloseMessage} message={message} />
                            
                            <footer className="w-100 py-3 text-center bg-white border-top mt-auto">
                                <p style={{ margin: 0, fontSize: '13px', color: '#6c757d' }}>© {new Date().getFullYear()} PT. Gajah Angkasa Perkasa. All Rights Reserved.</p>
                            </footer>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default DetailFormTicketing;