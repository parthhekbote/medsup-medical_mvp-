import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Inventory from './pages/Inventory';
import PendingActions from './pages/PendingActions';
import Accounting from './pages/Accounting';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import AuditLog from './pages/AuditLog';
import { getSupplies } from './api';

function App() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplies();
    const interval = setInterval(fetchSupplies, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSupplies = async () => {
    try {
      const data = await getSupplies();
      setSupplies(data);
    } catch (err) {
      console.error("Failed to fetch supplies", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout supplies={supplies} loading={loading} />}>
          <Route path="/" element={<Overview />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/pending" element={<PendingActions />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/audit" element={<AuditLog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
