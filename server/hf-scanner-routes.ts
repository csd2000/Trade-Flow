import { Router } from 'express';
import { hfScanner } from './hf-scanner-service';

const router = Router();

router.get('/status', async (req, res) => {
  try {
    const status = hfScanner.getStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const result = await hfScanner.getLatestScan();
    if (!result) {
      return res.json({ 
        success: true, 
        data: null, 
        message: 'No scans found. Run a scan first.' 
      });
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/alert', async (req, res) => {
  try {
    const alert = await hfScanner.getActiveAlert();
    res.json({ success: true, data: alert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/scan', async (req, res) => {
  try {
    const status = hfScanner.getStatus();
    if (status.isScanning) {
      return res.status(409).json({ 
        success: false, 
        error: 'Scan already in progress',
        status 
      });
    }

    res.json({ 
      success: true, 
      message: 'Scan started. This may take 1-2 minutes.',
      status: { ...status, isScanning: true }
    });

    hfScanner.runFullScan().catch(err => {
      console.error('Scan error:', err);
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/scan/results', async (req, res) => {
  try {
    const result = await hfScanner.getLatestScan();
    const status = hfScanner.getStatus();
    
    res.json({ 
      success: true, 
      data: result,
      status,
      isComplete: !status.isScanning && result?.job?.status === 'completed'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
