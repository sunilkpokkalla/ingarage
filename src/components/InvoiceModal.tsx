import { X, Printer } from 'lucide-react';
import React, { useEffect } from 'react';
import { calculateSellingPrice } from '@/utils/pricing';

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0);
}

export function InvoiceModal({ invoice, onClose, autoPrint = false }: { invoice: any, onClose: () => void, autoPrint?: boolean }) {
  useEffect(() => {
    if (invoice && autoPrint) {
      // Give the modal a frame to render before opening the print dialog
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [invoice, autoPrint]);

  if (!invoice) return null;

  const job = invoice.job;
  const parts = job?.parts || [];
  
  const laborHours = job?.laborHours || 0;
  const laborRate = job?.laborRate || 0;
  const laborTotal = laborHours * laborRate;
  
  const partsTotal = parts.reduce((sum: number, p: any) => sum + calculateSellingPrice(p.cost || 0), 0);
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center p-4 z-50 overflow-y-auto items-start print:relative print:inset-auto print:bg-white print:p-0 print:overflow-visible">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl relative my-8 print:m-0 print:border-none print:shadow-none print:w-full print:bg-white print:text-black print:text-sm invoice-print-container">
        
        {/* Header Actions */}
        <div className="absolute top-4 right-4 flex gap-2 print:hidden">
          <button onClick={handlePrint} className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-lg transition-colors" title="Print Invoice / Save as PDF">
            <Printer size={18} />
          </button>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-lg transition-colors ml-4" title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-12">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-zinc-800 pb-8">
            <div>
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">INVOICE</h1>
              <p className="text-brand-500 font-medium">#{invoice.id.slice(-8).toUpperCase()}</p>
              <div className="mt-6 text-zinc-400 space-y-1 text-sm">
                <p className="text-zinc-200 font-semibold text-base mb-2">InGarage Auto Shop</p>
                <p>123 Mechanic Ave</p>
                <p>Detroit, MI 48201</p>
                <p>support@ingarage.app</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-block px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-6 ${
                invoice.status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                invoice.status === 'Sent' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                'bg-zinc-900/50 border-slate-600 text-zinc-400'
              }`}>
                {invoice.status}
              </div>
              <div className="text-zinc-400 space-y-1 text-sm">
                <p><span className="text-zinc-500">Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}</p>
                <p><span className="text-zinc-500">Due Date:</span> Due on Receipt</p>
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Bill To</h3>
              <p className="text-zinc-50 font-medium text-lg mb-1">{job?.customer}</p>
              <p className="text-zinc-400 text-sm">{job?.phone || 'No phone provided'}</p>
              <p className="text-zinc-400 text-sm">{job?.email || 'No email provided'}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Vehicle Details</h3>
              <p className="text-zinc-50 font-medium text-lg mb-1">{job?.vehicle}</p>
              <p className="text-zinc-400 text-sm">VIN: {job?.vin || 'N/A'}</p>
              <p className="text-zinc-400 text-sm">License: {job?.license_plate || 'N/A'}</p>
            </div>
          </div>

          {/* Line Items - Parts */}
          {parts.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-zinc-50 mb-4 flex items-center gap-2">Parts</h3>
              <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900 text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Part Name</th>
                      <th className="px-4 py-3 font-medium">Supplier</th>
                      <th className="px-4 py-3 font-medium">Part Number</th>
                      <th className="px-4 py-3 font-medium text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                    {parts.map((part: any) => (
                      <tr key={part.id}>
                        <td className="px-4 py-3 text-zinc-200">{part.name}</td>
                        <td className="px-4 py-3 text-zinc-400">{part.supplier}</td>
                        <td className="px-4 py-3 text-zinc-400">{part.number || '-'}</td>
                        <td className="px-4 py-3 text-zinc-200 text-right">{currency(calculateSellingPrice(part.cost))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Line Items - Labor */}
          {laborHours > 0 && (
            <div>
              <h3 className="text-lg font-bold text-zinc-50 mb-4 flex items-center gap-2">Labor</h3>
              <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900 text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium text-right">Hours</th>
                      <th className="px-4 py-3 font-medium text-right">Rate</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-zinc-950">
                    <tr>
                      <td className="px-4 py-3 text-zinc-200">Standard Labor</td>
                      <td className="px-4 py-3 text-zinc-400 text-right">{laborHours} hrs</td>
                      <td className="px-4 py-3 text-zinc-400 text-right">{currency(laborRate)}/hr</td>
                      <td className="px-4 py-3 text-zinc-200 text-right">{currency(laborTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end pt-8 border-t border-zinc-800">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span>{currency(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Discount</span>
                  <span>-{currency(invoice.discount)}</span>
                </div>
              )}
              {(invoice.tax || 0) > 0 && (
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Sales Tax{invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}</span>
                  <span>{currency(invoice.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-zinc-400 pb-3 border-b border-zinc-800">
                <span>Amount Paid</span>
                <span>{currency(invoice.paid || 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-zinc-50 pt-1">
                <span>Total Due</span>
                <span className="text-brand-500">{currency(Math.max(0, invoice.subtotal - invoice.discount + (invoice.tax || 0) - (invoice.paid || 0)))}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
