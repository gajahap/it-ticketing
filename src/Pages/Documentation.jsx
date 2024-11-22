import React, { useState } from 'react';
import { Container, Card, Image, Button} from 'react-bootstrap';
import Loading from '../Components/Loading';
import ErrorHandler from '../Components/ErrorHandler';
import Logo from '../assets/images/gap.png';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

// Fungsi untuk mengimpor semua gambar dari folder yang ditentukan
function importAll(r) {
    return r.keys().map(r);
}
const documentationImages = importAll(require.context('../assets/images/documentation', false, /\.(gif|png|jpe?g)$/));

const Documentation = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    return (
        <>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    {error ? (
                        <ErrorHandler error={error} />
                    ) : (
                        <div style={{ position: 'relative', height: '100vh' }}>
                            <div style={{ overflow: 'hidden', position: 'absolute', width: '100%', height: '100%' }}>
                                <div className="half-circle"></div>
                            </div>
                            <Container className='py-5'>
                                <Card className='documentation-card'>
                                    <Button onClick={() => navigate('/')} style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center' }}><FaArrowLeft style={{ marginRight: '5px' }}/><span>Kembali</span></Button>
                                    <Image src={Logo} width="100" className="d-inline-block align-top ms-3" />
                                    <h4>Dokumentasi IT Ticketing</h4>
                                    <hr />
                                    <h5>Deskripsi</h5>
                                    <p style={{ backgroundColor: 'wheat', padding: '10px' }}>
                                        IT Ticketing adalah aplikasi berbasis web yang dikembangkan oleh tim IT Support PT. Gajah Angkasa Perkasa untuk mempermudah pengelolaan dan pencatatan tiket layanan IT.
                                        {/* Lanjutkan deskripsi... */}
                                    </p>
                                    <h5>1. Bagaimana Cara Saya Menggunakan Program ini?</h5>
                                    <p style={{ padding: '10px' }}>
                                        Ada Tiga jenis tiket diantaranya adalah tiket Perbaikan, tiket Pengajuan Barang (SPKB), Tiket Peminjaman Barang:
                                        <h5 className='mt-2'>A. Perbaikan</h5>
                                        <ul>
                                            <li>Kunjungi halaman utama situs web aplikasi IT Ticketing di alamat <a href="https://ticketing.portalgapsoft.xyz">https://ticketing.portalgapsoft.xyz</a></li>
                                            <li>Mengisi form sesuai yang diminta</li>
                                            <Image src={documentationImages[0]} alt="Documentation GIF" className="image-doc d-inline-block align-top" />
                                            <li>Pastikan anda memilih jenis permintaan <b>"Perbaikan"</b > pada form</li>
                                            <Image src={documentationImages[1]} alt="Documentation GIF" className="image-doc d-inline-block align-top" />
                                            <li>Jika anda sudah memilih jenis permintaan, maka akan muncul field note, isi field tersebut sesuai dengan permasalahan anda, jelaskan secara detail dan tidak bersifat ambigu.</li>
                                            <Image src={documentationImages[2]} alt="Documentation GIF" className="image-doc d-inline-block align-top" />
                                            <li>Anda dapat menyertakan gambar pada field <b>"Upload Foto"</b>, field ini bersifat optional, bisa diisi bisa juga tidak.</li>
                                            <li>Setelah anda memastikan semua field telah terisi dengan benar, maka Klik tombol <b>"Submit"</b>, jika berhasil anda akan diarahkan ke halaman <b>"Detail Ticketing"</b></li>
                                            <Image src={documentationImages[3]} alt="Documentation GIF" className="image-doc d-inline-block align-top" />
                                            <li>Salin No Tiket anda, lalu anda dapat mengecek progress tiket anda pada bagian <b>"Tracking"</b> pada halaman utama.</li>
                                            <Image src={documentationImages[4]} alt="Documentation GIF" className="image-doc d-inline-block align-top" />
                                            <Image src={documentationImages[5]} alt="Documentation GIF" className="image-doc d-inline-block align-top" />
                                            <li>Tiket anda akan diproses teknisi apabila tiket telah diapprove.</li>
                                        </ul>
                                        <br />
                                        <h5 className='mt-2'>B. Pengajuan Barang</h5>
                                        <p style={{backgroundColor: 'wheat', padding: '10px'}}>Untuk Pengajuan barang langkahnya hampir sama dengan langkah permintaan perbaikan diatas, namun yang membedakan adalah, anda harus memastikan untuk memilih jenis permintaan <b>"Permintaan Barang"</b>.</p>
                                        <ul>
                                           
                                            <li>Pastikan anda memilih jenis permintaan <b>"Permintaan Barang"</b> pada form.</li>
                                            <Image src={documentationImages[6]} alt="Documentation GIF" className="image-doc d-inline-block align-top" />
                                            <li>Jika anda sudah memilih jenis permintaan, maka akan muncul input untuk SPKB, silhkan pilih barang, lalu isi field yang ada di dalam detailnya. anda juga dapat mengajukan lebih dari 1  barang dengan menekan tombol bertanda<b>"+"</b>.</li>
                                            <Image src={documentationImages[7]} alt="Documentation GIF" className="image-doc d-inline-block align-top" />
                                            <li>Setelah itu anda dapat menyertakan gambar pada field <b>"Upload Foto"</b>, field ini bersifat optional, bisa diisi bisa juga tidak.</li>
                                            <li>Pada field <b>"Approved To"</b> anda harus memilih kepada siapa anda akan meminta persetujuan, dalam hal ini adalah kepala bagian.</li>
                                            <li>Setelah anda memastikan semua field telah terisi dengan benar, maka Klik tombol <b>"Submit"</b>, jika berhasil anda akan diarahkan ke halaman <b>"Detail Ticketing"</b></li>
                                            <Image src={documentationImages[8]} alt="Documentation GIF" className="image-doc d-inline-block align-top" />
                                            <li>Salin No Tiket anda, lalu anda dapat mengecek progress tiket anda pada bagian <b>"Tracking"</b> pada halaman utama.</li>
                                            <Image src={documentationImages[9]} alt="Documentation GIF" className="image-doc d-inline-block align-top" />
                                            <Image src={documentationImages[10]} alt="Documentation GIF" className="image-doc d-inline-block align-top" />
                                            <li>Tiket anda akan diproses teknisi apabila tiket telah diapprove.</li>
                                        </ul>

                                        <h5 className='mt-2'>C. Peminjaman Barang</h5>
                                        <p style={{backgroundColor: 'wheat', padding: '10px'}}>Untuk Peminjaman barang langkahnya hampir sama dengan langkah Pengajuan Barang diatas, namun yang membedakan adalah, anda harus memastikan untuk memilih jenis permintaan <b>"Peminjaman"</b>.</p>
                                        <ul>
                                           
                                            <li>Pastikan anda memilih jenis permintaan <b>"Peminjaman"</b> pada form.</li>
                                            <li>Jika anda sudah memilih jenis permintaan, maka akan muncul input untuk Surat Peminjaman Barang, silhkan pilih barang, lalu isi field yang ada di dalam detailnya. anda juga dapat mengajukan lebih dari 1  barang dengan menekan tombol bertanda<b>"+"</b>.</li>
                                            <li>Setelah itu anda dapat menyertakan gambar pada field <b>"Upload Foto"</b>, field ini bersifat optional, bisa diisi bisa juga tidak.</li>
                                            <li>Pada field <b>"Approved To"</b> anda harus memilih kepada siapa anda akan meminta persetujuan, dalam hal ini adalah kepala bagian.</li>
                                            <li>Setelah anda memastikan semua field telah terisi dengan benar, maka Klik tombol <b>"Submit"</b>, jika berhasil anda akan diarahkan ke halaman <b>"Detail Ticketing"</b></li>
                                        </ul>
                                    </p>
                                </Card>
                            </Container>
                            <footer style={{ bottom: 0, width: '100%', padding: '20px 0', textAlign: 'center', background: '#f8f9fa' }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>© {new Date().getFullYear()} PT.Gajah Angkasa Perkasa. All Rights Reserved.</p>
                    </footer>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Documentation;
