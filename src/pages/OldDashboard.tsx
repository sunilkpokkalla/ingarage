import { useMemo, useState } from 'react'
import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  Camera,
  CarFront,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  FileCheck2,
  FileText,
  Filter,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  MessageSquareText,
  PackageCheck,
  PackageSearch,
  ReceiptText,
  Search,
  ShieldCheck,
  Smartphone,
  Timer,
  Truck,
  UserCheck,
  Wrench,
} from 'lucide-react'
import './App.css'

type Job = {
  id: string
  vehicle: string
  customer: string
  insurer: string
  vin: string
  status: string
  stage: number
  eta: string
  priority: string
  estimator: string
  techs: string[]
  laborHours: number
  laborRate: number
  partsCost: number
  discount: number
  paid: number
  photos: string[]
  damages: string[]
}

const jobs: Job[] = [
  {
    id: 'JOB-1048',
    vehicle: '2023 Toyota Camry XSE',
    customer: 'Maya Hernandez',
    insurer: 'State Mutual',
    vin: '4T1K61AK9PU122489',
    status: 'Paint booth',
    stage: 72,
    eta: 'Jun 14',
    priority: 'Insurance claim',
    estimator: 'Avery Holt',
    techs: ['Nolan', 'Priya'],
    laborHours: 31.4,
    laborRate: 86,
    partsCost: 2380,
    discount: 150,
    paid: 0,
    photos: [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?auto=format&fit=crop&w=900&q=80',
    ],
    damages: ['Front bumper cover cracked', 'Left fender blend required', 'Radar calibration pending'],
  },
  {
    id: 'JOB-1049',
    vehicle: '2021 Ford F-150 Lariat',
    customer: 'Chris Benton',
    insurer: 'Direct Auto',
    vin: '1FTFW1E82MFB77602',
    status: 'Structural repair',
    stage: 48,
    eta: 'Jun 18',
    priority: 'Fleet account',
    estimator: 'Samira Duke',
    techs: ['Mateo', 'Nolan'],
    laborHours: 44.2,
    laborRate: 92,
    partsCost: 4150,
    discount: 0,
    paid: 1100,
    photos: [
      'https://images.unsplash.com/photo-1612825173281-9a193378527e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517026575980-3e1e2dedeab4?auto=format&fit=crop&w=900&q=80',
    ],
    damages: ['Bedside panel replacement', 'Frame rail measure complete', 'Tail lamp harness backordered'],
  },
  {
    id: 'JOB-1050',
    vehicle: '2024 Tesla Model Y',
    customer: 'Elaine Porter',
    insurer: 'Northstar Claims',
    vin: '7SAYGDEE8RA044810',
    status: 'Reassembly',
    stage: 84,
    eta: 'Jun 12',
    priority: 'Customer-pay supplement',
    estimator: 'Avery Holt',
    techs: ['Priya', 'Devon'],
    laborHours: 26.6,
    laborRate: 105,
    partsCost: 3190,
    discount: 240,
    paid: 2800,
    photos: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=900&q=80',
    ],
    damages: ['Quarter panel repair', 'Liftgate trim refit', 'Post-scan scheduled'],
  },
]

const suppliers = [
  { name: 'Keystone', part: 'OEM bumper cover', price: 620, eta: '1 day', status: 'In stock' },
  { name: 'PartsTrader', part: 'Headlamp assembly', price: 842, eta: '2 days', status: 'Best price' },
  { name: 'LKQ', part: 'Recycled liftgate', price: 1190, eta: 'Tomorrow', status: 'Ordered' },
  { name: 'Toyota Direct', part: 'Radar bracket kit', price: 218, eta: 'Jun 11', status: 'Delivery booked' },
]

const technicians = [
  { name: 'Priya Shah', active: 'JOB-1050', today: 6.8, efficiency: 118, cost: 612 },
  { name: 'Nolan Reed', active: 'JOB-1048', today: 7.2, efficiency: 104, cost: 590 },
  { name: 'Mateo Cruz', active: 'JOB-1049', today: 5.9, efficiency: 96, cost: 507 },
]

const reports = [
  { label: 'Gross profit per job', value: '$2,184 avg', trend: '+14%' },
  { label: 'Technician productivity', value: '106%', trend: '+8%' },
  { label: 'Cash flow this week', value: '$38.6k', trend: '+$9.1k' },
  { label: 'Unbilled supplements', value: '$7.4k', trend: '5 claims' },
]

const initialStatusNotes: Record<string, string> = {
  'JOB-1048': 'Paint blend verified. Waiting for booth cycle.',
  'JOB-1049': 'Frame measurements passed. Bedside panel is clamped for weld prep.',
  'JOB-1050': 'Reassembly checklist is active. Post-scan and calibration are queued.',
}

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function App() {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0].id)
  const [statusNotes, setStatusNotes] = useState(initialStatusNotes)
  const activeJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0]
  const statusNote = statusNotes[activeJob.id]

  const invoice = useMemo(() => {
    const labor = activeJob.laborHours * activeJob.laborRate
    const subtotal = labor + activeJob.partsCost
    const due = subtotal - activeJob.discount - activeJob.paid
    return { labor, subtotal, due }
  }, [activeJob])

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand-lockup">
          <div className="brand-mark">
            <CarFront size={24} />
          </div>
          <div>
            <strong>InGarage</strong>
            <span>InGarage</span>
          </div>
        </div>

        <nav className="nav-list">
          {[
            ['Command center', LayoutDashboard],
            ['Jobs', Wrench],
            ['Labor', Timer],
            ['Parts', PackageSearch],
            ['Documents', FileCheck2],
            ['Invoices', ReceiptText],
            ['Customers', MessageSquareText],
            ['Analytics', Gauge],
          ].map(([label, Icon]) => (
            <button className={label === 'Command center' ? 'active' : ''} type="button" key={label as string}>
              <Icon size={18} />
              <span>{label as string}</span>
            </button>
          ))}
        </nav>

        <div className="tenant-card">
          <Building2 size={18} />
          <div>
            <span>Tenant workspace</span>
            <strong>Brightline Collision</strong>
          </div>
          <ChevronDown size={16} />
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Independent collision center platform</p>
            <h1>End-to-end repair visibility</h1>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={18} />
              <input value="Camry, claim, radar" aria-label="Search jobs and parts" readOnly />
            </label>
            <button className="icon-button" type="button" aria-label="Notifications" title="Notifications">
              <Bell size={18} />
            </button>
            <button className="primary-button" type="button">
              <Camera size={18} />
              New intake
            </button>
          </div>
        </header>

        <section className="metric-grid" aria-label="Shop metrics">
          <Metric icon={<Activity size={19} />} label="Active jobs" value="42" detail="11 move today" />
          <Metric icon={<Clock size={19} />} label="Labor captured" value="318h" detail="Auto-costed" />
          <Metric icon={<PackageCheck size={19} />} label="Parts in transit" value="27" detail="8 arrive today" />
          <Metric icon={<CreditCard size={19} />} label="Online payments" value="$18.9k" detail="Last 7 days" />
        </section>

        <section className="main-grid">
          <section className="panel job-board">
            <PanelHeader icon={<Filter size={18} />} title="Live Job Management" action="All locations" />
            <div className="job-list">
              {jobs.map((job) => (
                <button
                  className={`job-row ${job.id === activeJob.id ? 'selected' : ''}`}
                  type="button"
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <img src={job.photos[0]} alt={`${job.vehicle} intake`} />
                  <div className="job-copy">
                    <div>
                      <strong>{job.vehicle}</strong>
                      <span>{job.customer} · {job.id}</span>
                    </div>
                    <div className="progress-track" aria-label={`${job.stage}% complete`}>
                      <span style={{ width: `${job.stage}%` }} />
                    </div>
                  </div>
                  <div className="job-meta">
                    <b>{job.status}</b>
                    <span>ETA {job.eta}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="panel profile-panel">
            <PanelHeader icon={<CarFront size={18} />} title="Vehicle Profile" action={activeJob.priority} />
            <div className="profile-head">
              <div>
                <p className="eyebrow">{activeJob.id} · {activeJob.vin}</p>
                <h2>{activeJob.vehicle}</h2>
                <span>{activeJob.customer} · {activeJob.insurer}</span>
              </div>
              <strong className="status-pill">{activeJob.status}</strong>
            </div>
            <div className="photo-strip">
              {activeJob.photos.map((photo, index) => (
                <img src={photo} alt={`${activeJob.vehicle} repair photo ${index + 1}`} key={photo} />
              ))}
            </div>
            <div className="damage-grid">
              {activeJob.damages.map((damage) => (
                <div className="damage-item" key={damage}>
                  <Check size={16} />
                  <span>{damage}</span>
                </div>
              ))}
            </div>
            <label className="live-note">
              <span>Technician real-time status</span>
              <textarea
                value={statusNote}
                onChange={(event) =>
                  setStatusNotes((current) => ({
                    ...current,
                    [activeJob.id]: event.target.value,
                  }))
                }
              />
            </label>
          </section>
        </section>

        <section className="module-grid">
          <section className="panel">
            <PanelHeader icon={<Timer size={18} />} title="Labor Tracking" action="Timesheets eliminated" />
            <div className="cost-row">
              <span>Logged hours</span>
              <strong>{activeJob.laborHours}h</strong>
            </div>
            <div className="cost-row">
              <span>Shop rate</span>
              <strong>{currency(activeJob.laborRate)}/h</strong>
            </div>
            <div className="cost-total">
              <span>Calculated labor cost</span>
              <b>{currency(invoice.labor)}</b>
            </div>
            <div className="tech-list">
              {technicians.map((tech) => (
                <div className="tech-row" key={tech.name}>
                  <UserCheck size={17} />
                  <span>{tech.name}</span>
                  <b>{tech.today}h</b>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <PanelHeader icon={<PackageSearch size={18} />} title="Parts Inventory" action="Supplier sync" />
            <div className="supplier-table">
              {suppliers.map((supplier) => (
                <div className="supplier-row" key={supplier.name}>
                  <div>
                    <strong>{supplier.part}</strong>
                    <span>{supplier.name} · {supplier.status}</span>
                  </div>
                  <b>{currency(supplier.price)}</b>
                  <small>{supplier.eta}</small>
                </div>
              ))}
            </div>
            <button className="secondary-button full" type="button">
              <Truck size={17} />
              Place best-price order
            </button>
          </section>

          <section className="panel">
            <PanelHeader icon={<FileText size={18} />} title="Documentation Generator" action="PDF-ready" />
            <div className="doc-stack">
              {['Intake photos', 'Damage assessment', 'Parts list', 'Labor breakdown'].map((item) => (
                <div key={item}>
                  <FileCheck2 size={17} />
                  <span>{item}</span>
                  <Check size={16} />
                </div>
              ))}
            </div>
            <button className="secondary-button full" type="button">
              <FileText size={17} />
              Generate claim PDF
            </button>
          </section>

          <section className="panel invoice-panel">
            <PanelHeader icon={<ReceiptText size={18} />} title="Invoice Automation" action="Stripe connected" />
            <div className="invoice-lines">
              <Line label="Parts" value={currency(activeJob.partsCost)} />
              <Line label="Labor" value={currency(invoice.labor)} />
              <Line label="Discount" value={`-${currency(activeJob.discount)}`} />
              <Line label="Paid" value={`-${currency(activeJob.paid)}`} />
            </div>
            <div className="invoice-due">
              <span>Balance due</span>
              <strong>{currency(invoice.due)}</strong>
            </div>
            <button className="primary-button full" type="button">
              <CreditCard size={17} />
              Send payment link
            </button>
          </section>
        </section>

        <section className="wide-grid">
          <section className="panel portal-panel">
            <PanelHeader icon={<MessageSquareText size={18} />} title="Customer Portal" action="Online payments" />
            <div className="portal-preview">
              <div className="portal-card">
                <span>Hi {activeJob.customer.split(' ')[0]}, your repair is {activeJob.stage}% complete.</span>
                <div className="progress-track tall">
                  <span style={{ width: `${activeJob.stage}%` }} />
                </div>
                <p>{statusNote}</p>
                <button className="secondary-button" type="button">
                  <CreditCard size={17} />
                  Pay invoice
                </button>
              </div>
              <div className="message-feed">
                <p>Automated SMS sent after paint stage update.</p>
                <p>Customer approved supplement and discount.</p>
                <p>Delivery reminder scheduled for {activeJob.eta}.</p>
              </div>
            </div>
          </section>

          <section className="panel phone-panel">
            <PanelHeader icon={<Smartphone size={18} />} title="Technician Mobile App" action="Shop floor" />
            <div className="phone-frame">
              <div className="phone-top">
                <span>{activeJob.id}</span>
                <b>{activeJob.status}</b>
              </div>
              <button className="clock-button" type="button">
                <Clock size={20} />
                Clock in
              </button>
              <div className="mobile-task">
                <Wrench size={17} />
                <span>Refit bumper cover</span>
                <Check size={16} />
              </div>
              <div className="mobile-task">
                <Camera size={17} />
                <span>Add progress photo</span>
                <Check size={16} />
              </div>
            </div>
          </section>
        </section>

        <section className="bottom-grid">
          <section className="panel analytics-panel">
            <PanelHeader icon={<Gauge size={18} />} title="Reporting & Analytics" action="Owner view" />
            <div className="report-grid">
              {reports.map((report) => (
                <div className="report-card" key={report.label}>
                  <span>{report.label}</span>
                  <strong>{report.value}</strong>
                  <b>{report.trend}</b>
                </div>
              ))}
            </div>
            <div className="bar-chart" aria-label="Cash flow trend chart">
              {[42, 64, 48, 79, 68, 88, 73, 96].map((height, index) => (
                <span style={{ height: `${height}%` }} key={index} />
              ))}
            </div>
          </section>

          <section className="panel security-panel">
            <PanelHeader icon={<ShieldCheck size={18} />} title="Multi-Tenant Security" action="Audit ready" />
            <div className="security-list">
              <div><LockKeyhole size={17} /><span>Role-based authentication for owners, estimators, techs, and customers</span></div>
              <div><Building2 size={17} /><span>Data partitioning across multiple collision center tenants</span></div>
              <div><CreditCard size={17} /><span>Payment integration for invoice checkout, deposits, and receipts</span></div>
              <div><CalendarDays size={17} /><span>End-to-end audit trail from intake through delivery</span></div>
            </div>
          </section>
        </section>
      </section>
    </main>
  )
}

function Metric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
}) {
  return (
    <section className="metric-card">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </section>
  )
}

function PanelHeader({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode
  title: string
  action: string
}) {
  return (
    <header className="panel-header">
      <div>
        {icon}
        <h2>{title}</h2>
      </div>
      <span>{action}</span>
    </header>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="line-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
