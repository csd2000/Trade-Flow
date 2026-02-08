import { Router } from 'express';
import { institutionalDataService } from './institutional-data-service';

const router = Router();

router.get('/sources', async (req, res) => {
  try {
    const sources = await institutionalDataService.getDataSources();
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get data sources' });
  }
});

router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await institutionalDataService.getInstitutionalQuote(symbol.toUpperCase());
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get quote' });
  }
});

router.get('/breadth', async (req, res) => {
  try {
    const breadth = await institutionalDataService.getMarketBreadth();
    res.json(breadth);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get market breadth' });
  }
});

router.get('/sectors', async (req, res) => {
  try {
    const sectors = await institutionalDataService.getSectorFlows();
    res.json(sectors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sector flows' });
  }
});

router.get('/flows/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const flows = await institutionalDataService.getInstitutionalFlows(symbol.toUpperCase());
    res.json(flows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get institutional flows' });
  }
});

router.get('/economic', async (req, res) => {
  try {
    const indicators = await institutionalDataService.getEconomicIndicators();
    res.json(indicators);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get economic indicators' });
  }
});

router.get('/fixed-income', async (req, res) => {
  try {
    const data = await institutionalDataService.getFixedIncomeData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get fixed income data' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const summary = await institutionalDataService.getMarketSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get market summary' });
  }
});

export default router;
