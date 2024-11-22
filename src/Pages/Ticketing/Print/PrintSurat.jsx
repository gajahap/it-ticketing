import React, { useEffect, useState } from "react";
import axiosInstance from '../../../axiosConfig';
import { useParams } from "react-router-dom";
import { Container, Button, Card, Image, Row, Col, Spinner ,Table, Overlay, Tooltip, Stack } from 'react-bootstrap';


const PrintSurat = () => {
    const { ticketId } = useParams();
    const [data, setData] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [spkbItems, setSpkbItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [departmentOptions, setDepartmentOptions] = useState([]);

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
                setDepartmentOptions(formattedDepartmentOptions)
    
                setSpkbItems(spkbItmesResponse.data);
    
                setIsLoading(false); // Move this to the finally block
                
            } catch (error) {
                console.error(error);
                setIsLoading(false); // Move this to the finally block
                console.error(error);
            }
        };
    
        fetchData();
    }, [ticketId]);

    // Automatically trigger print when the page loads
    useEffect(() => {
        if (!isLoading) {
            window.print();
        }
    }, [isLoading]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
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
                <p></p>
            </Col>
            <Col>
                <p style={{ textAlign: 'center',paddingTop:'10%'}} className="text-center">Pemohon,</p>
                <p style={{ textAlign: 'center',paddingTop:'20%'}}>{data.nama_pemohon}</p>
            </Col>
        </Row>
    </Card>
    );
};

export default PrintSurat;
