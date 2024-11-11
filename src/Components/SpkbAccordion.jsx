import { useEffect, useContext, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { Button, Form, Card, Stack } from 'react-bootstrap';
import Select from 'react-select';
import axiosInstance from '../axiosConfig';

const ContextAwareToggle = ({ children, eventKey, callback }) => {
  const { activeEventKey } = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => callback && callback(eventKey),
  );
  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <Button
      variant={isCurrentEventKey ? 'primary' : 'secondary'}
      style={{ width: '100px' }}
      onClick={decoratedOnClick}
    >
      {children}
    </Button>
  );
};

const SpkbAccordion = ({ onDataChange }) => {
  const [spkb, setSpkb] = useState([
    { spkb_barangs_id: '', qty_spkb_item: '', satuan_spkb_item: '', ket_spkb_item: '' },
  ]);

  useEffect(() => {
    if (onDataChange) {
        onDataChange(spkb); // Kirim data hanya saat spkb berubah
    }
}, [spkb,onDataChange]);

  const handleAddSpkb = () => {
    setSpkb([...spkb, { spkb_barangs_id: '', qty_spkb_item: '', satuan_spkb_item: '', ket_spkb_item: '' }]);
  };

  const handleRemoveSpkb = (index) => {
    if (spkb.length > 1) {
      setSpkb(spkb.filter((_, i) => i !== index));
    }
  };

  const handleSpkbChange = (event, index) => {
    const { name, value } = event.target;
    setSpkb(spkb.map((item, i) =>
      i === index ? { ...item, [name]: value } : item
    ));
  };

  const handleSelectChange = (selectedOption, index) => {
    setSpkb(spkb.map((item, i) =>
      i === index ? { ...item, spkb_barangs_id: selectedOption.value } : item
    ));
  };

  const [optionBarang, setOptionBarang] = useState([]);

  useEffect(() => {
    const fetchDataBarang = async () => {
      try {
        const response = await axiosInstance.get('/spkb-barang');
        setOptionBarang(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDataBarang();
  }, []);

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

  const options = optionBarang.map(item => ({ value: item.id, label: item.nama_barang }));

  return (
    <>
      <hr />
      <h4 className='py-2'>SPKB</h4>
      <Accordion>
        <Stack direction="vertical" gap={2}>
          {spkb.map((item, index) => (
            <Card key={index}>
              <Card.Header>
                <Stack direction="horizontal" gap={3}>
                  <div className='text-center px-2'>{index + 1}</div>
                  <div style={{ width: '90%' }}>
                    <Select 
                      options={options}
                      styles={customStyles}
                      value={options.find(option => option.value === item.spkb_barangs_id)}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, index)}
                    />
                  </div>
                  <ContextAwareToggle eventKey={index}>Detail</ContextAwareToggle>
                  {spkb.length > 1 && (
                    <Button variant='danger' onClick={() => handleRemoveSpkb(index)}>Hapus</Button>
                  )}
                </Stack>
              </Card.Header>
              <Accordion.Collapse eventKey={index}>
                <Stack direction="horizontal" gap={3} className='p-2'>
                  <Form.Control
                    type="number"
                    className='text-center'
                    name="qty_spkb_item"
                    value={item.qty_spkb_item}
                    placeholder='Qty'
                    required
                    style={{ width: '20%' }}
                    onChange={(event) => handleSpkbChange(event, index)}
                  />
                  <Form.Control
                    type="text"
                    className='text-center'
                    name="satuan_spkb_item"
                    value={item.satuan_spkb_item}
                    placeholder='Unit'
                    required
                    style={{ width: '20%' }}
                    onChange={(event) => handleSpkbChange(event, index)}
                  />
                  <Form.Control
                    type="text"
                    name="ket_spkb_item"
                    value={item.ket_spkb_item}
                    placeholder='Keterangan'
                    style={{ width: '60%' }}
                    onChange={(event) => handleSpkbChange(event, index)}
                  />
                </Stack>
              </Accordion.Collapse>
            </Card>
          ))}
          <Button variant="secondary" onClick={handleAddSpkb}>+</Button>
        </Stack>
      </Accordion>
      <hr />
    </>
  );
};

export default SpkbAccordion;
