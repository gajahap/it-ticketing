import { useState, useEffect } from 'react';
import { Button, Form, Card, Stack, Modal, Row, Col, Badge } from 'react-bootstrap';
import Select from 'react-select';
import axiosInstance from '../axiosConfig';

const SpkbAccordion = ({ onDataChange, isDateRange, isDetailNull }) => {
  // State Utama
  const [spkb, setSpkb] = useState([
    { spkb_barangs_id: '', qty_spkb_item: '', satuan_spkb_item: '', ket_spkb_item: '', start_date: '', end_date: '' },
  ]);
  const [optionBarang, setOptionBarang] = useState([]);
  const [showModal, setShowModal] = useState(false); // State untuk Pop-up Tinta

  // Mengirim data ke parent component
  useEffect(() => {
    if (onDataChange) {
      onDataChange(spkb);
    }
  }, [spkb, onDataChange]);

  // Fetch data barang dari API
  useEffect(() => {
    const fetchDataBarang = async () => {
      try {
        const response = await axiosInstance.get('/spkb-barang');
        const filteredData = response.data.filter(item => 
          isDateRange ? item.is_peminjaman === true : item.is_peminjaman === false
        );
        setOptionBarang(filteredData);
      } catch (error) {
        console.error("Gagal mengambil data barang:", error);
      }
    };
    fetchDataBarang();
  }, [isDateRange]);

  const handleAddSpkb = () => {
    setSpkb([...spkb, { spkb_barangs_id: '', qty_spkb_item: '', satuan_spkb_item: '', ket_spkb_item: '', start_date: '', end_date: '' }]);
  };

  const handleRemoveSpkb = (index) => {
    if (spkb.length > 1) {
      setSpkb(spkb.filter((_, i) => i !== index));
    }
  };

  const handleSpkbChange = (event, index) => {
    const { name, value } = event.target;
    const currentItem = spkb[index];

    // Validasi Durasi Laptop Maksimal 7 Hari
    if (name === 'start_date' || name === 'end_date') {
      const targetStart = name === 'start_date' ? value : currentItem.start_date;
      const targetEnd = name === 'end_date' ? value : currentItem.end_date;

      if (targetStart && targetEnd) {
        const startDate = new Date(targetStart);
        const endDate = new Date(targetEnd);
        const diffTime = endDate - startDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays < 0) {
          alert("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
          return;
        }

        // Cek apakah barang yang dipilih adalah Laptop
        const selectedBarang = optionBarang.find(b => b.id === currentItem.spkb_barangs_id);
        const isLaptop = selectedBarang && selectedBarang.nama_barang.toLowerCase().includes('laptop');

        if (isLaptop && diffDays > 7) {
          alert("Peringatan: Peminjaman unit Laptop tidak boleh lebih dari 1 minggu (7 hari).");
          return; // Hentikan update state jika melebihi batas
        }
      }
    }

    setSpkb(spkb.map((item, i) =>
      i === index ? { ...item, [name]: value } : item
    ));
  };

  const handleSelectChange = (selectedOption, index) => {
    if (!selectedOption) {
      setSpkb(spkb.map((item, i) =>
        i === index ? { ...item, spkb_barangs_id: '' } : item
      ));
      return;
    }

    // LOGIKA POP-UP TINTA
    if (selectedOption.label.toLowerCase().includes('tinta')) {
      setShowModal(true);
    }

    // Cek jika barang yang baru dipilih adalah laptop dan rentang tanggal yang sudah diisi melanggar aturan (> 7 hari)
    const currentItem = spkb[index];
    if (selectedOption.label.toLowerCase().includes('laptop') && currentItem.start_date && currentItem.end_date) {
      const start = new Date(currentItem.start_date);
      const end = new Date(currentItem.end_date);
      const diffDays = (end - start) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        alert("Peringatan: Peminjaman unit Laptop tidak boleh lebih dari 1 minggu (7 hari). Rentang tanggal dikosongkan kembali.");
        setSpkb(spkb.map((item, i) =>
          i === index ? { ...item, spkb_barangs_id: selectedOption.value, start_date: '', end_date: '' } : item
        ));
        return;
      }
    }

    setSpkb(spkb.map((item, i) =>
      i === index ? { ...item, spkb_barangs_id: selectedOption.value } : item
    ));
  };

  // Styling Custom untuk React Select agar senada dengan desain modern
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#f8fafc',
      borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
      borderRadius: '8px',
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.15)" : "none",
      "&:hover": { borderColor: "#cbd5e1" },
      fontSize: "14px",
      minHeight: "42px",
    }),
    menu: (base) => ({ ...base, borderRadius: 8, overflow: 'hidden', zIndex: 20 }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? "#eff6ff" : "white",
      color: state.isSelected ? "white" : "#1e293b",
      fontSize: "14px",
      cursor: "pointer",
    }),
  };

  const options = optionBarang.map(item => ({ value: item.id, label: item.nama_barang }));

  return (
    <div className="my-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className='fw-bold text-dark m-0'>{isDateRange ? 'Surat Peminjaman Barang' : 'Form Barang SPKB'}</h5>
        <span className="text-muted small">Total item: {spkb.length}</span>
      </div>
      
      {isDetailNull && (
        <div className='alert alert-danger py-2 px-3 rounded-3 d-flex align-items-center gap-2 mb-3' role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span className="small">Masih ada kolom yang belum diisi pada detail barang.</span>
        </div>
      )}

      <Stack direction="vertical" gap={3}>
        {spkb.map((item, index) => (
          <Card key={index} className="shadow-sm border rounded-3 transition-all" style={{ borderColor: '#e2e8f0' }}>
            <Card.Body className="p-3 p-md-4">
              {/* Header Kartu: Badge Nomor & Tombol Hapus */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Badge bg="secondary" className="px-2.5 py-2 rounded-pill fs-6 fw-medium">
                  Item #{index + 1}
                </Badge>
                {spkb.length > 1 && (
                  <Button 
                    variant='link' 
                    className="text-danger p-0 text-decoration-none small d-flex align-items-center gap-1"
                    onClick={() => handleRemoveSpkb(index)}
                  >
                    <i className="bi bi-trash3 fs-6"></i> Hapus Item
                  </Button>
                )}
              </div>

              <Stack direction="vertical" gap={3}>
                {/* Baris Pilih Barang */}
                <div>
                  <Form.Label className="small text-muted fw-semibold mb-1">Pilih Barang</Form.Label>
                  <Select 
                    options={options}
                    styles={customStyles}
                    value={options.find(option => option.value === item.spkb_barangs_id)}
                    onChange={(selectedOption) => handleSelectChange(selectedOption, index)}
                    placeholder="Cari atau pilih nama barang..."
                    isClearable
                  />
                </div>

                {/* Baris Input Qty, Satuan, dan Keterangan */}
                <Row className="g-3">
                  <Col xs={6} md={2}>
                    <Form.Label className="small text-muted fw-semibold mb-1">Qty</Form.Label>
                    <Form.Control
                      type="number"
                      className="bg-light border-light-subtle rounded-2"
                      name="qty_spkb_item"
                      value={item.qty_spkb_item}
                      placeholder='0'
                      style={{ fontSize: '14px', height: '42px' }}
                      onChange={(event) => handleSpkbChange(event, index)}
                    />
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Label className="small text-muted fw-semibold mb-1">Satuan</Form.Label>
                    <Form.Control
                      type="text"
                      className="bg-light border-light-subtle rounded-2"
                      name="satuan_spkb_item"
                      value={item.satuan_spkb_item}
                      placeholder='Pcs / Box'
                      style={{ fontSize: '14px', height: '42px' }}
                      onChange={(event) => handleSpkbChange(event, index)}
                    />
                  </Col>
                  <Col xs={12} md={7}>
                    <Form.Label className="small text-muted fw-semibold mb-1">Keterangan</Form.Label>
                    <Form.Control
                      type="text"
                      className="bg-light border-light-subtle rounded-2"
                      name="ket_spkb_item"
                      value={item.ket_spkb_item}
                      placeholder='Catatan tambahan (Opsional)'
                      style={{ fontSize: '14px', height: '42px' }}
                      onChange={(event) => handleSpkbChange(event, index)}
                    />
                  </Col>
                </Row>

                {/* Rentang Waktu Peminjaman (Jika Aktif) */}
                {isDateRange && (
                  <div className="p-3 rounded-3 bg-light border border-light-subtle mt-1">
                    <span className='d-block small text-secondary fw-bold mb-2'>
                      <i className="bi bi-calendar-range me-1"></i> Rentang Waktu Peminjaman
                    </span>
                    <Row className="g-2 align-items-center">
                      <Col xs={12} md={5}>
                        <Form.Control
                          type="date"
                          size="sm"
                          name="start_date"
                          value={item.start_date}
                          className="rounded-2 py-2"
                          onChange={(event) => handleSpkbChange(event, index)}
                        />
                      </Col>
                      <Col xs={12} md={2} className="text-center text-muted small d-none d-md-block">
                        s/d
                      </Col>
                      <Col xs={12} md={5}>
                        <Form.Control
                          type="date"
                          size="sm"
                          name="end_date"
                          value={item.end_date}
                          className="rounded-2 py-2"
                          onChange={(event) => handleSpkbChange(event, index)}
                        />
                      </Col>
                    </Row>
                  </div>
                )}
              </Stack>
            </Card.Body>
          </Card>
        ))}

        {/* Tombol Tambah Baris */}
        <div>
          <Button 
            variant="outline-primary" 
            className="w-100 py-2.5 rounded-3 border-dashed d-flex align-items-center justify-content-center gap-2 fw-medium" 
            onClick={handleAddSpkb}
            style={{ borderStyle: 'dashed', borderWidth: '2px' }}
          >
            <i className="bi bi-plus-circle-fill fs-5"></i> Tambah Barang Lain
          </Button>
        </div>
      </Stack>

      {/* MODAL PERINGATAN TINTA */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-warning">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> Mohon Perhatian
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center px-4 py-3">
          <p className="mb-0 text-secondary" style={{ fontSize: '15px', lineHeight: '1.6' }}>
            Untuk permintaan barang jenis <strong>Tinta</strong>, pengambilan dapat dilakukan secara mandiri setelah SPKB dibuat. Pastikan untuk mengecek ketersediaan stok terlebih dahulu dengan menghubungi Staff IT.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 justify-content-center pb-4">
          <Button variant="primary" className="px-4 rounded-pill" onClick={() => setShowModal(false)}>
            Saya Mengerti
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SpkbAccordion;