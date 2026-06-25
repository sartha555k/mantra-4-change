import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ReviewPrepPage from './pages/ReviewPrepPage';
import GrantReportingPage from './pages/GrantReportingPage';
import { DEFAULT_FILTERS } from './utils/format';

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage filters={filters} setFilters={setFilters} />} />
        <Route path="/review-prep" element={<ReviewPrepPage filters={filters} setFilters={setFilters} />} />
        <Route path="/grants" element={<GrantReportingPage />} />
      </Routes>
    </Layout>
  );
}
