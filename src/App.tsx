import { Routes, Route } from 'react-router-dom';

import MarketingLayout from './layouts/MarketingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthGuard from './components/AuthGuard';

// Marketing Pages
import Home from './pages/Home';
import Features from './pages/marketing/Features';
import About from './pages/marketing/About';
import Pricing from './pages/marketing/Pricing';
import Integrations from './pages/marketing/Integrations';
import Stories from './pages/marketing/Stories';
import Resources from './pages/marketing/Resources';
import Contact from './pages/marketing/Contact';

// Public Customer Pages
import PublicInvoice from './pages/public/PublicInvoice';

// Auth & App Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Labor from './pages/Labor';
import Parts from './pages/Parts';
import Invoices from './pages/Invoices';
import Customers from './pages/Customers';
import Documents from './pages/Documents';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      
      <Route path="/pay/:id" element={<PublicInvoice />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AuthGuard />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/labor" element={<Labor />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}
