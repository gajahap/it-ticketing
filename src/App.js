import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FormTicketing from './Pages/Ticketing/FormTicketing';
import DetailFormTicketing from './Pages/Ticketing/DetailFormTicketing';
import ApprovalTicketing from './Pages/Ticketing/ApprovalTicketing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormTicketing />} />
        <Route path="/detail-form/:ticketId" element={<DetailFormTicketing />} />
        <Route path="/approval/:ticketId/:token" element={<ApprovalTicketing />} />
      </Routes>
    </Router>
  );
}

export default App;

