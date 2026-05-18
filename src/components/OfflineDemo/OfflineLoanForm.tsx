import React, { useState, useEffect } from 'react';
interface OfflineLoan {
  id: string;
  customerName: string;
  amount: number;
  purpose: string;
  timestamp: Date;
  synced: boolean;
}

const OfflineLoanForm: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    purpose: '',
  });
  const [pendingLoans, setPendingLoans] = useState<OfflineLoan[]>([]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
      syncPendingLoans();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending loans from localStorage
    const saved = localStorage.getItem('pendingLoans');
    if (saved) {
      setPendingLoans(JSON.parse(saved));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingLoans = async () => {
    if (pendingLoans.length === 0) return;
    
    setSyncing(true);
    try {
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear synced loans
      localStorage.removeItem('pendingLoans');
      setPendingLoans([]);
      
      alert(`Successfully synced ${pendingLoans.length} loan applications!`);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLoan: OfflineLoan = {
      id: Date.now().toString(),
      customerName: formData.customerName,
      amount: parseFloat(formData.amount),
      purpose: formData.purpose,
      timestamp: new Date(),
      synced: isOnline,
    };

    if (isOnline) {
      // Online: submit immediately
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Loan application submitted successfully!');
      } catch (error) {
        console.error('Submission failed:', error);
        // Fallback to offline storage
        saveOfflineLoan(newLoan);
      }
    } else {
      // Offline: save to localStorage
      saveOfflineLoan(newLoan);
    }

    // Reset form
    setFormData({ customerName: '', amount: '', purpose: '' });
  };

  const saveOfflineLoan = (loan: OfflineLoan) => {
    const updated = [...pendingLoans, { ...loan, synced: false }];
    setPendingLoans(updated);
    localStorage.setItem('pendingLoans', JSON.stringify(updated));
    alert('Application saved offline. Will sync when connection resumes.');
  };

  return (
    <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,136,0.2)' }}>
      {/* Status Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#00ff88', display: 'flex', alignItems: 'center', gap: 1 }}>
          {isOnline ? <CloudQueue sx={{ color: '#00ff88' }} /> : <WifiOff sx={{ color: '#ff4444' }} />}
          {isOnline ? 'Online Mode' : 'Offline Mode'}
        </Typography>
        
        {pendingLoans.length > 0 && (
          <Chip
            icon={syncing ? <CircularProgress size={16} /> : <Sync />}
            label={`${pendingLoans.length} pending sync`}
            onClick={syncPendingLoans}
            disabled={!isOnline || syncing}
            sx={{ bgcolor: '#00ff88', color: '#040F0A' }}
          />
        )}
      </Box>

      {/* Offline Alert */}
      <Snackbar
        open={showOfflineAlert}
        autoHideDuration={6000}
        onClose={() => setShowOfflineAlert(false)}
      >
        <Alert severity="warning" icon={<CloudOff />}>
          You are offline. Applications will be saved and synced automatically when connection resumes.
        </Alert>
      </Snackbar>

      {/* Loan Application Form */}
      <form onSubmit={handleSubmit}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {isOnline 
            ? 'Submit loan application (instant processing)' 
            : 'Offline mode - application will be queued for sync'}
        </Typography>

        <TextField
          fullWidth
          label="Customer Name"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          margin="normal"
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
          }}
        />

        <TextField
          fullWidth
          label="Loan Amount (FCFA)"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          margin="normal"
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
          }}
        />

        <TextField
          fullWidth
          label="Loan Purpose"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          margin="normal"
          multiline
          rows={3}
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(0, 255, 136, 0.3)' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            bgcolor: '#00ff88',
            color: '#040F0A',
            '&:hover': { bgcolor: '#00e676' },
          }}
        >
          {isOnline ? 'Submit Application' : 'Save Offline'}
        </Button>
      </form>

      {/* Pending Loans List */}
      {pendingLoans.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#ffaa00' }}>
            Pending Sync ({pendingLoans.length})
          </Typography>
          {pendingLoans.map((loan) => (
            <Alert
              key={loan.id}
              severity="info"
              sx={{ mb: 1, bgcolor: 'rgba(0,0,0,0.3)' }}
            >
              <Typography variant="body2">
                {loan.customerName} - {loan.amount.toLocaleString()} FCFA
              </Typography>
              <Typography variant="caption">
                Submitted: {loan.timestamp.toLocaleString()}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default OfflineLoanForm;
