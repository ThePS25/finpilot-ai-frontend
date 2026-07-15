import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialApi } from '@/api/financial.api';
import { useProfileStore } from '@/store';
import { Button, Card, Loader, Input, Modal, Select } from '@/components/ui';
import type { Payslip, PayslipExtractedData, PayslipConfirmPayload } from '@/types';
import { formatCurrency, getErrorMessage, MONTHS } from '@/utils/format';
import styles from './PayslipsPage.module.scss';

const EMPTY_EXTRACTED: PayslipExtractedData = {
  basicSalary: 0,
  hra: 0,
  specialAllowance: 0,
  otherAllowances: 0,
  grossSalary: 0,
  pf: 0,
  professionalTax: 0,
  tax: 0,
  otherDeductions: 0,
  totalDeductions: 0,
  bonus: 0,
  netSalary: 0,
  employerName: '',
  employeeName: '',
  employeeId: '',
  designation: '',
  panNumber: '',
  payPeriod: '',
};

const EARNING_FIELDS: { key: keyof PayslipExtractedData; label: string }[] = [
  { key: 'basicSalary', label: 'Basic Salary' },
  { key: 'hra', label: 'HRA' },
  { key: 'specialAllowance', label: 'Special Allowance' },
  { key: 'otherAllowances', label: 'Other Allowances' },
  { key: 'grossSalary', label: 'Gross Salary' },
  { key: 'bonus', label: 'Bonus / Incentives' },
];

const DEDUCTION_FIELDS: { key: keyof PayslipExtractedData; label: string }[] = [
  { key: 'pf', label: 'Provident Fund (PF)' },
  { key: 'professionalTax', label: 'Professional Tax' },
  { key: 'tax', label: 'Income Tax (TDS)' },
  { key: 'otherDeductions', label: 'Other Deductions' },
  { key: 'totalDeductions', label: 'Total Deductions' },
  { key: 'netSalary', label: 'Net Salary (Take Home)' },
];

const INFO_FIELDS: { key: keyof PayslipExtractedData; label: string }[] = [
  { key: 'employerName', label: 'Employer' },
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'employeeId', label: 'Employee ID' },
  { key: 'designation', label: 'Designation' },
  { key: 'panNumber', label: 'PAN' },
  { key: 'payPeriod', label: 'Pay Period' },
];

export function PayslipsPage() {
  const queryClient = useQueryClient();
  const profiles = useProfileStore((s) => s.profiles);
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const [uploadProfileId, setUploadProfileId] = useState(activeProfileId || profiles[0]?._id || '');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [confirming, setConfirming] = useState<Payslip | null>(null);
  const [formData, setFormData] = useState<PayslipExtractedData>(EMPTY_EXTRACTED);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [syncToIncome, setSyncToIncome] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['payslips', activeProfileId],
    queryFn: async () => {
      const params = activeProfileId ? { profileId: activeProfileId } : {};
      return (await financialApi.getPayslips(params)).data.data.payslips;
    },
  });

  const openReview = (p: Payslip) => {
    setConfirming(p);
    setFormData({ ...EMPTY_EXTRACTED, ...p.extractedData });
    setMonth(p.month || new Date().getMonth() + 1);
    setYear(p.year || new Date().getFullYear());
    setSyncToIncome(!p.isSyncedToIncome);
    setErrorMsg('');
  };

  const confirmMutation = useMutation({
    mutationFn: (payload: PayslipConfirmPayload) =>
      financialApi.confirmPayslip(confirming!._id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setConfirming(null);
      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(''), 5000);
    },
    onError: (err) => setErrorMsg(getErrorMessage(err)),
  });

  const reExtractMutation = useMutation({
    mutationFn: (id: string) => financialApi.reExtractPayslip(id),
    onSuccess: (res) => {
      openReview(res.data.data.payslip);
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
    },
    onError: (err) => setErrorMsg(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialApi.deletePayslip(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payslips'] }),
  });

  const uploadFile = useCallback(async (file: File) => {
    const profileId = uploadProfileId || activeProfileId || profiles[0]?._id;
    if (!profileId) {
      setErrorMsg('Please create a profile first');
      return;
    }
    setUploading(true);
    setErrorMsg('');
    try {
      const res = await financialApi.uploadPayslip(profileId, file);
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
      openReview(res.data.data.payslip);
      setSuccessMsg(res.data.message);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }, [uploadProfileId, activeProfileId, profiles, queryClient]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const updateField = (key: keyof PayslipExtractedData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    confirmMutation.mutate({
      extractedData: formData,
      month,
      year,
      syncToIncome,
    });
  };

  if (isLoading) return <Loader fullPage />;

  return (
    <>
      {successMsg && <div className={styles.alertSuccess}>{successMsg}</div>}
      {errorMsg && !confirming && <div className={styles.alertError}>{errorMsg}</div>}

      <Card title="Upload Payslip" subtitle="PDF, PNG, or JPG — AI extracts salary components automatically">
        <div className={styles.uploadSection}>
          {profiles.length > 0 && (
            <Select
              label="Profile"
              value={uploadProfileId}
              onChange={(e) => setUploadProfileId(e.target.value)}
              options={profiles.map((p) => ({ value: p._id, label: `${p.name} (${p.relation})` }))}
            />
          )}
          <div
            className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''} ${uploading ? styles.uploading : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className={styles.dropIcon}>📄</div>
            <p className={styles.dropTitle}>
              {uploading ? 'Uploading & extracting data...' : 'Drag & drop your payslip here'}
            </p>
            <p className={styles.dropHint}>Supports PDF, PNG, JPG up to 10MB</p>
            <label className={styles.browseBtn}>
              Browse Files
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileInput} hidden disabled={uploading} />
            </label>
          </div>
        </div>
      </Card>

      <div className={styles.list}>
        {(data || []).map((p) => (
          <Card
            key={p._id}
            title={`${p.extractedData.employerName || 'Payslip'}${p.month ? ` — ${MONTHS[p.month - 1]} ${p.year}` : ''}`}
            action={
              <div className={styles.cardActions}>
                <a href={p.fileUrl} target="_blank" rel="noreferrer" className={styles.viewLink}>View</a>
                {!p.isVerified && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => reExtractMutation.mutate(p._id)} disabled={reExtractMutation.isPending}>
                      Re-extract
                    </Button>
                    <Button size="sm" onClick={() => openReview(p)}>Review</Button>
                  </>
                )}
                <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(p._id)}>Delete</Button>
              </div>
            }
          >
            <div className={styles.statusRow}>
              <span className={`${styles.badge} ${styles[p.extractionStatus || 'pending']}`}>
                {p.extractionStatus === 'success' ? 'Extracted' : p.extractionStatus === 'failed' ? 'Needs Review' : 'Pending'}
              </span>
              {p.isVerified && <span className={styles.verified}>✓ Saved</span>}
              {p.isSyncedToIncome && <span className={styles.synced}>↗ Synced to Income</span>}
            </div>
            <div className={styles.summaryGrid}>
              <div><label>Gross</label><strong>{formatCurrency(p.extractedData.grossSalary || 0)}</strong></div>
              <div><label>Net Salary</label><strong>{formatCurrency(p.extractedData.netSalary)}</strong></div>
              <div><label>Tax</label><strong>{formatCurrency(p.extractedData.tax)}</strong></div>
              <div><label>PF</label><strong>{formatCurrency(p.extractedData.pf)}</strong></div>
            </div>
          </Card>
        ))}
      </div>

      {(data || []).length === 0 && (
        <Card><p className={styles.empty}>No payslips yet. Upload your first payslip above.</p></Card>
      )}

      <Modal
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        title="Review Extracted Payslip Data"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirming(null)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? 'Saving...' : syncToIncome ? 'Save & Sync to Income' : 'Save Payslip'}
            </Button>
          </>
        }
      >
        {errorMsg && confirming && <div className={styles.alertError}>{errorMsg}</div>}
        {confirming?.extractionError && (
          <div className={styles.alertWarn}>{confirming.extractionError}. Please verify all fields below.</div>
        )}

        <div className={styles.periodRow}>
          <Select
            label="Month"
            value={String(month)}
            onChange={(e) => setMonth(Number(e.target.value))}
            options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))}
          />
          <Input label="Year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </div>

        <h4 className={styles.sectionTitle}>Earnings</h4>
        <div className={styles.formGrid}>
          {EARNING_FIELDS.map(({ key, label }) => (
            <Input
              key={key}
              label={label}
              type="number"
              value={Number(formData[key]) || 0}
              onChange={(e) => updateField(key, Number(e.target.value))}
            />
          ))}
        </div>

        <h4 className={styles.sectionTitle}>Deductions & Net Pay</h4>
        <div className={styles.formGrid}>
          {DEDUCTION_FIELDS.map(({ key, label }) => (
            <Input
              key={key}
              label={label}
              type="number"
              value={Number(formData[key]) || 0}
              onChange={(e) => updateField(key, Number(e.target.value))}
            />
          ))}
        </div>

        <h4 className={styles.sectionTitle}>Employment Details</h4>
        <div className={styles.formGrid}>
          {INFO_FIELDS.map(({ key, label }) => (
            <Input
              key={key}
              label={label}
              value={String(formData[key] || '')}
              onChange={(e) => updateField(key, e.target.value)}
            />
          ))}
        </div>

        <label className={styles.syncCheck}>
          <input type="checkbox" checked={syncToIncome} onChange={(e) => setSyncToIncome(e.target.checked)} />
          <span>
            <strong>Sync to Income records</strong>
            <small>Creates monthly salary (+ bonus if present) under this profile</small>
          </span>
        </label>
      </Modal>
    </>
  );
}
