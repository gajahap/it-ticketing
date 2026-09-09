import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Button, Form, Card, Image, Row, Col, Spinner, Tab, Tabs } from 'react-bootstrap';
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
import { showConfirm } from '../../Components/ConfirmToast';
import './FormTicketing.css';

// Small inline icons so we don't need an extra icon dependency
const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const UploadIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 15V17.5C4 18.8807 5.11929 20 6.5 20H17.5C18.8807 20 20 18.8807 20 17.5V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FormTicketing = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isNotConnected, setIsNotConnected] = useState(false);
    const [jenisPermintaan, setJenisPermintaan] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [approvedToOptions, setApprovedToOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [isTrackingLoading, setIsTrackingLoading] = useState(false);
    const [isSpkbForm, setIsSpkbForm] = useState(null);
    const [isDateRange, setIsDateRange] = useState(null);
    const [isDetailNull, setDetailNull] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ---- Wizard state ----
    const [stepIndex, setStepIndex] = useState(0);
    const [maxStepReached, setMaxStepReached] = useState(0);

    const [formData, setFormData] = useState({
        user_id: '',
        tgl_tiket: new Date().toISOString().split('T')[0],
        nama_pemohon: '',
        divisis_id: '',
        contact_person: '',
        jenis_ticketings_id: '',
        description: '',
        spkbData: [],
        file_upload: null
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
                    label: option.nama_divisi
                }));
                setDepartmentOptions(formattedDepartmentOptions);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                setIsNotConnected(true);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (message) {
            setShowModal(true);
        }
    }, [message]);

    const handleCloseMessage = () => {
        setShowModal(false);
        setMessage(null);
    };

    const handleChangeForm = (e) => {
        const { name, value, type, files } = e.target;

        if (name === 'contact_person' && value.startsWith("0")) {
            setFormData({
                ...formData,
                [name]: '62' + value.slice(1),
            });
        } else {
            if (type === 'file') {
                setFormData({
                    ...formData,
                    [name]: files[0],
                });
            } else {
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
        if (e && e.preventDefault) e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axiosInstance.post('/ticketings/store', formData);
            const id = response.data.ticketing.id;
            setIsSubmitting(false);
            navigate(`/detail-form/${id}`);
        } catch (error) {
            if (error.status === 422) {
                const errors = error.response?.data?.errors;

                if (errors?.contact_person?.some(msg => msg.includes('regex'))) {
                    setMessage('Kontak Pemohon tidak valid.');
                } else if (errors?.file_upload?.some(msg => msg.includes('mimes'))) {
                    setMessage('File yang diunggah harus berupa JPG, PNG, atau PDF dan kurang ukuran file max 3 mb.');
                } else {
                    setMessage('Kolom belum terisi seluruhnya, periksa kolom di dalam "Detail".');
                }
                console.log(error);
                

                setDetailNull(true);
            } else {
                setMessage('Terjadi kesalahan saat mengirim data.');
            }
            setError(error);
        } finally {
            setIsSubmitting(false);
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
            if (error.status === 404) {
                setTrackingDataResult(null);
                setIsTrackingLoading(false);
                setMessage('Tiket anda tidak dapat ditemukan, pastikan anda memasukan nomor tiket yang valid.');
                setError(error);
            } else {
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

    const handleSpkbDataChange = useCallback((newData) => {
        setFormData((prevFormData) => ({ ...prevFormData, spkbData: newData }));
    }, []);

    const customStyles = {
        control: (base, state) => ({
            ...base,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: state.isFocused ? "#04419c" : "#e3e7ee",
            boxShadow: state.isFocused ? "0 0 0 3px #eaf1fd" : "none",
            "&:hover": {
                borderColor: "#04419c",
            },
            padding: "2px",
            fontSize: "15px",
        }),
        menu: (base) => ({
            ...base,
            borderRadius: 10,
            marginTop: 4,
            zIndex: 10,
            overflow: 'hidden',
        }),
        menuList: (base) => ({
            ...base,
            padding: 0,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? "#04419c" : state.isFocused ? "#eaf1fd" : "white",
            color: state.isSelected ? "white" : "#101828",
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: "14.5px",
        }),
    };

    const handleRadioChange = (e, jenis) => {
        setIsSpkbForm(jenis.is_spkb || false);
        setIsDateRange(jenis.is_daterange || false);

        handleChangeForm(e);

        if (!jenis.is_spkb) {
            setFormData((prev) => ({
                ...prev,
                spkbData: []
            }));
        }
    };

    // ---- Wizard step definitions ----
    const steps = useMemo(() => {
        const base = ['tanggal', 'nama', 'divisi', 'kontak', 'jenis', 'detail', 'upload'];
        if (isSpkbForm) {
            base.push('approved');
            if (isDateRange && base.includes('upload')) { 
                //hapus upload
                base.splice(base.indexOf('upload'), 1);
            }
        }
        return base;
    }, [isSpkbForm, isDateRange]);

    useEffect(() => {
        if (stepIndex > steps.length - 1) {
            setStepIndex(steps.length - 1);
        }
        if (maxStepReached > steps.length - 1) {
            setMaxStepReached(steps.length - 1);
        }
    }, [steps, stepIndex, maxStepReached]);

    const currentStepKey = steps[stepIndex];
    const isFirstStep = stepIndex === 0;
    const isLastStep = stepIndex === steps.length - 1;

    const isStepValid = (key) => {
        switch (key) {
            case 'tanggal':
                return !!formData.tgl_tiket;
            case 'nama':
                return formData.nama_pemohon.trim().length > 0;
            case 'divisi':
                return !!formData.divisis_id;
            case 'kontak':
                return formData.contact_person && String(formData.contact_person).length >= 8;
            case 'jenis':
                return !!formData.jenis_ticketings_id;
            case 'detail':
                return isSpkbForm
                    ? formData.spkbData && formData.spkbData.length > 0
                    : formData.description.trim().length > 0;
            case 'upload':
                return true;
            case 'approved':
                return !!formData.user_id;
            default:
                return true;
        }
    };

    const currentStepValid = isStepValid(currentStepKey);

    const goNext = () => {
        if (!currentStepValid) return;
        if (isLastStep) {
            handleSubmitForm();
        } else {
            const next = Math.min(stepIndex + 1, steps.length - 1);
            setStepIndex(next);
            setMaxStepReached((m) => Math.max(m, next));
        }
    };

    const goBack = () => {
        setStepIndex((i) => Math.max(i - 1, 0));
    };

    const jumpToStep = (idx) => {
        if (idx <= maxStepReached) {
            setStepIndex(idx);
        }
    };

    const handleCancel = async () => {
        const confirmed = await showConfirm(
            'Batalkan pengisian form? Semua data yang sudah diisi akan hilang.',
            { confirmText: 'Ya, Batalkan', cancelText: 'Kembali' }
        );
        if (confirmed) {
            navigate('/');
            setFormData({
                user_id: '',
                tgl_tiket: new Date().toISOString().split('T')[0],
                nama_pemohon: '',
                divisis_id: '',
                contact_person: '',
                jenis_ticketings_id: '',
                description: '',
                spkbData: [],
                file_upload: null
            });
            setStepIndex(0);
            setMaxStepReached(0);
        }
    };

    const stepLabels = {
        tanggal: 'Tanggal',
        nama: 'Nama Pemohon',
        divisi: 'Divisi',
        kontak: 'Kontak',
        jenis: 'Jenis Permintaan',
        detail: 'Detail',
        upload: 'Upload Foto',
        approved: 'Approved To',
    };

    const stepTitles = {
        tanggal: 'Kapan tiket ini dibuat?',
        nama: 'Siapa nama Anda?',
        divisi: 'Divisi mana Anda bertugas?',
        kontak: 'Nomor kontak yang bisa dihubungi',
        jenis: 'Apa jenis permintaan Anda?',
        detail: isSpkbForm ? 'Lengkapi detail SPKB' : 'Jelaskan kendala Anda',
        upload: 'Ada foto pendukung?',
        approved: 'Siapa yang perlu menyetujui tiket ini?',
    };

    const stepHints = {
        tanggal: 'Tanggal tiket otomatis terisi hari ini, ubah bila perlu.',
        nama: 'Gunakan nama lengkap agar mudah dikenali tim IT.',
        divisi: 'Pilih divisi tempat Anda bekerja saat ini.',
        kontak: 'Tim kami akan menghubungi nomor ini untuk update progres tiket.',
        jenis: 'Pilih kategori yang paling sesuai dengan kebutuhan Anda.',
        detail: isSpkbForm ? 'Isi rincian SPKB pada formulir di bawah ini.' : 'Semakin detail penjelasan Anda, semakin cepat kami bisa membantu.',
        upload: 'Lampirkan screenshot atau foto pendukung jika ada. Langkah ini boleh dilewati.',
        approved: 'Pilih pihak yang bertanggung jawab menyetujui permintaan ini.',
    };

    const renderStep = () => {
        switch (currentStepKey) {
            case 'tanggal':
                return (
                    <Form.Group controlId="tgl_tiket">
                        <Form.Control
                            type="date"
                            name="tgl_tiket"
                            value={formData.tgl_tiket}
                            onChange={handleChangeForm}
                            autoFocus
                            required
                            style={{ maxWidth: '280px' }}
                        />
                    </Form.Group>
                );

            case 'nama':
                return (
                    <Form.Group controlId="nama_pemohon">
                        <Form.Control
                            type="text"
                            name="nama_pemohon"
                            placeholder="Nama Lengkap Anda"
                            value={formData.nama_pemohon}
                            onChange={handleChangeForm}
                            autoFocus
                            required
                        />
                    </Form.Group>
                );

            case 'divisi':
                return (
                    <Form.Group controlId="divisis_id">
                        <Select
                            name="divisis_id"
                            options={departmentOptions}
                            styles={customStyles}
                            placeholder="Pilih divisi..."
                            value={departmentOptions.find(option => option.value === formData.divisis_id) || null}
                            onChange={(selectedOption) => setFormData({ ...formData, divisis_id: selectedOption.value })}
                            autoFocus
                            required
                        />
                    </Form.Group>
                );

            case 'kontak':
                return (
                    <Form.Group controlId="contact_person">
                        <Form.Control
                            type="number"
                            name="contact_person"
                            placeholder="Contoh : 628996546548"
                            value={formData.contact_person}
                            onChange={handleChangeForm}
                            autoFocus
                            required
                        />
                    </Form.Group>
                );

            case 'jenis':
                return (
                    <div className="choice-grid" role="radiogroup" aria-label="Jenis Permintaan">
                        {jenisPermintaan && jenisPermintaan.map((jenis) => {
                            const selected = String(formData.jenis_ticketings_id) === String(jenis.id);
                            return (
                                <label
                                    key={jenis.id}
                                    className={`choice-card ${selected ? 'choice-card--selected' : ''}`}
                                    htmlFor={`jenis_ticketings_id${jenis.id}`}
                                >
                                    <input
                                        className="choice-card__input"
                                        type="radio"
                                        name="jenis_ticketings_id"
                                        id={`jenis_ticketings_id${jenis.id}`}
                                        value={jenis.id}
                                        checked={selected}
                                        onChange={(e) => handleRadioChange(e, jenis)}
                                        required
                                    />
                                    <span className="choice-card__label">{jenis.nama_jenis}</span>
                                    <span className="choice-card__check">{selected && <CheckIcon />}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'detail':
                return isSpkbForm ? null : (
                    <Form.Group controlId="description">
                        <Form.Control
                            as="textarea"
                            rows={5}
                            name="description"
                            placeholder="Tuliskan kendala yang Anda alami selengkap mungkin..."
                            value={formData.description}
                            onChange={handleChangeForm}
                            autoFocus
                            required
                        />
                    </Form.Group>
                );

            case 'upload':
                return (
                    <label className="dropzone" htmlFor="file_upload_input">
                        <input
                            id="file_upload_input"
                            className="dropzone__input"
                            type="file"
                            name="file_upload"
                            onChange={handleChangeForm}
                        />
                        <div className="dropzone__icon"><UploadIcon /></div>
                        <div className="dropzone__text">
                            {formData.file_upload ? formData.file_upload.name : 'Klik untuk memilih foto'}
                        </div>
                        <span className="dropzone__hint">Opsional &middot; JPG, PNG, atau PDF</span>
                    </label>
                );

            case 'approved':
                return (
                    <Form.Group controlId="user_id">
                        <Select
                            name="user_id"
                            options={approvedToOptions}
                            styles={customStyles}
                            placeholder="Pilih penyetuju..."
                            value={approvedToOptions.find(option => option.value === formData.user_id) || null}
                            onChange={(selectedOption) => setFormData({ ...formData, user_id: selectedOption.value })}
                            autoFocus
                            required
                        />
                    </Form.Group>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {isLoading ? (
                <Loading />
            ) : (
                /* 1. Tambahkan d-flex flex-column dan minHeight: '100vh' di sini */
                <div className="ticketing-page d-flex flex-column" style={{ minHeight: '100vh', position: 'relative' }}>
                    {/* <ToastCustom /> */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
                        <div className="half-circle"></div>
                    </div>

                    <Container className="d-flex flex-column justify-content-center align-items-center py-4 flex-grow-1" style={{ zIndex: 1 }}>
                        <Card className="ticketing-card p-lg-5 p-4 fades" >
                            <div className="d-flex justify-content-left flex-row gap-2 mb-2">
                                <Image src={Logo} style={{ width: 'auto', height: 'auto', maxWidth: '4.5em', maxHeight: '4.5em' }} />
                                <div className="p-2">
                                    <h2 className="ticketing-header__title">IT - Ticketing</h2>
                                    <p className="text-left" style={{ fontSize: '14px', color: 'var(--ink-soft)', maxWidth: '46ch' }}>By IT Departement of PT. Gajah Angkasa Perkasa.</p>
                                </div>
                            </div>

                            {isNotConnected ? (
                                <Col className="d-flex flex-column align-items-center ticketing-offline">
                                    <Image src={Elephant} alt="Elephant" style={{ width: '35%', height: 'auto' }} />
                                    <p style={{ fontSize: '16px', textAlign: 'center' }}><strong>Pesan Layanan : </strong>Maaf saat ini layanan kami belum tersedia, silahkan coba beberapa saat lagi</p>
                                </Col>
                            ) : (
                                <Tabs
                                    defaultActiveKey="form"
                                    id="uncontrolled-tab-example"
                                    className="mb-5 custom-tabs nav-justified"
                                    onSelect={() => { setStepIndex(0); setMaxStepReached(0); }}
                                >
                                    <Tab eventKey="form" title="Buat Tiket" className='fades nav-link'>
                                        {/* Circle Step Progress Bar (Menggantikan Linear Progress Bar) */}
                                        <div className="wizard-mobile-progress mb-4">
                                            <div className="d-flex align-items-center justify-content-between position-relative px-2">
                                                {/* Garis penghubung background */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '24px',
                                                    right: '24px',
                                                    height: '3px',
                                                    backgroundColor: '#e3e7ee',
                                                    transform: 'translateY(-50%)',
                                                    zIndex: 1
                                                }} />
                                                
                                                {/* Garis penghubung progress aktif */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '24px',
                                                    width: `${(stepIndex / (steps.length)) * 100}%`,
                                                    height: '3px',
                                                    backgroundColor: '#04419c87',
                                                    transform: 'translateY(-50%)',
                                                    zIndex: 1,
                                                    transition: 'width 0.3s ease'
                                                }} />

                                                {steps.map((key, idx) => {
                                                    const isDone = idx < stepIndex;
                                                    const isActive = idx === stepIndex;
                                                    const isClickable = idx <= maxStepReached;

                                                    return (
                                                        <button
                                                            key={key}
                                                            type="button"
                                                            onClick={() => jumpToStep(idx)}
                                                            disabled={!isClickable}
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '100%',
                                                                border: 'none',
                                                                backgroundColor: isDone || isActive ? '#04419c' : '#ffffff',
                                                                color: isDone || isActive ? '#ffffff' : '#6c757d',
                                                                boxShadow: isActive ? '0 0 0 4px #eaf1fd' : '0 1px 3px rgba(0,0,0,0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '13px',
                                                                fontWeight: '600',
                                                                cursor: isClickable ? 'pointer' : 'default',
                                                                zIndex: 2,
                                                                transition: 'all 0.2s ease',
                                                                padding: 0
                                                            }}
                                                            title={stepLabels[key]}
                                                        >
                                                            {isDone ? <CheckIcon /> : idx + 1}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="text-center mt-2" style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                                                {stepLabels[currentStepKey]}
                                            </div>
                                        </div>

                                        <div className="wizard-shell">
                                            <nav className="wizard-rail" aria-label="Langkah pengisian form">
                                                {steps.map((key, idx) => {
                                                    const state = idx < stepIndex ? 'done' : idx === stepIndex ? 'active' : 'upcoming';
                                                    const clickable = idx <= maxStepReached;
                                                    return (
                                                        <button
                                                            key={key}
                                                            type="button"
                                                            className={`wizard-rail__item wizard-rail__item--${state}`}
                                                            onClick={() => jumpToStep(idx)}
                                                            disabled={!clickable}
                                                        >
                                                            <span className="wizard-rail__bullet">
                                                                {state === 'done' ? <CheckIcon /> : idx + 1}
                                                            </span>
                                                            <span className="wizard-rail__label">{stepLabels[key]}</span>
                                                        </button>
                                                    );
                                                })}
                                            </nav>

                                            <Form onSubmit={(e) => e.preventDefault()} className="wizard-main">
                                                <span className="wizard-step-count">Langkah {stepIndex + 1} dari {steps.length}</span>
                                                <h4 className="wizard-step-title">
                                                    {stepTitles[currentStepKey]} {currentStepKey !== 'upload' && <span style={{ color: 'var(--danger)' }}>*</span>}
                                                </h4>
                                                <p className="wizard-step-hint">{stepHints[currentStepKey]}</p>

                                                <div className="wizard-step-body" key={currentStepKey}>
                                                    {renderStep()}
                                                </div>

                                                {isSpkbForm && (
                                                    <div style={{ display: currentStepKey === 'detail' ? 'block' : 'none' }}>
                                                        <SpkbAccordion
                                                            onDataChange={handleSpkbDataChange}
                                                            isDateRange={isDateRange}
                                                            isDetailNull={isDetailNull}
                                                        />
                                                    </div>
                                                )}

                                                <div className="wizard-actions">
                                                    <button type="button" className="btn-ghost" onClick={isFirstStep ? handleCancel : goBack}>
                                                        {isFirstStep ? 'Batal' : 'Kembali'}
                                                    </button>

                                                    <div className="wizard-actions__right">
                                                        {!isFirstStep && (
                                                            <button type="button" className="btn-ghost" onClick={handleCancel}>
                                                                Batal
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="btn-primary-wizard"
                                                            onClick={goNext}
                                                            disabled={!currentStepValid || isSubmitting}
                                                        >
                                                            {isSubmitting ? (
                                                                <Spinner animation="border" role="status" style={{ width: '1rem', height: '1rem' }}>
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </Spinner>
                                                            ) : isLastStep ? 'Kirim Tiket' : (
                                                                <>Lanjut <ChevronRightIcon /></>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </Form>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="tracking" title="Lacak Tiket">
                                        <Form onSubmit={handleSubmitTracking} className='fades'>
                                            <Form.Group className="mb-3" controlId="no_tiket">
                                                <Form.Label><strong>Nomor Tiket<span className='text-danger'>*</span></strong></Form.Label>
                                                <Form.Control type="text" name="no_tiket" placeholder="Masukkan No tiket Anda" value={trackingData.no_tiket} onChange={handleChangeTracking} required />
                                            </Form.Group>
                                            <button type="submit" className="btn-primary-wizard w-100 justify-content-center">
                                                {isTrackingLoading ? (
                                                    <Spinner animation="border" role="status" style={{ width: '1rem', height: '1rem' }}>
                                                        <span className="visually-hidden">Loading...</span>
                                                    </Spinner>
                                                ) : 'Start Tracking'}
                                            </button>
                                        </Form>
                                        {trackingDataResult && (
                                            <>
                                                <h5 className='mt-3'>Tracking Result : {trackingDataResult.no_tiket}</h5>
                                                <p>Status Approve : <span className={trackingDataResult.is_accept ? 'text-succes' : 'text-danger'}>{trackingDataResult.is_accept ? 'Sudah Approve' : 'Belum Approve'}</span></p>
                                                <div className="d-flex justify-content-left align-items-left mt-5">
                                                    <CircularProgressBar progress={trackingDataResult.status} process_by_user_id={trackingDataResult.user ? trackingDataResult.user.name : 'Teknisi'} id={trackingDataResult.id} reloadDatas={reloadTrackingData} />
                                                </div>
                                            </>
                                        )}
                                    </Tab>
                                </Tabs>
                            )}

                        </Card>
                    </Container>

                    <MessageModal show={showModal} handleClose={handleCloseMessage} message={message} error={error} />

                    {/* 2. Pastikan footer menggunakan class dengan mt-auto */}
                    <footer className="ticketing-footer w-100 py-3 text-center mt-auto" style={{ zIndex: 1 }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>© {new Date().getFullYear()} PT.Gajah Angkasa Perkasa. All Rights Reserved.</p>
                    </footer>
                </div>
            )}
        </>
    );
};

export default FormTicketing;