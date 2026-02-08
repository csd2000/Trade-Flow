export interface SECRiskFlags {
  symbol: string;
  status: 'ALERT' | 'CLEAR' | 'UNAVAILABLE';
  riskScore: number;
  keywordsFound: string[];
  filingType: string | null;
  filingDate: string | null;
  checkedAt: number;
}

const SEC_RISK_KEYWORDS = [
  'lawsuit',
  'audit',
  'impairment',
  'litigation',
  'going concern'
];

const CIK_CACHE: Map<string, string> = new Map();
const SEC_FLAGS_CACHE: Map<string, { data: SECRiskFlags; timestamp: number }> = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;

async function getCIKForSymbol(symbol: string): Promise<string | null> {
  const cached = CIK_CACHE.get(symbol.toUpperCase());
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(symbol)}&type=10-K&dateb=&owner=include&count=1&output=atom`,
      {
        headers: {
          'User-Agent': 'CryptoFlowPro/1.0 (research@example.com)',
          'Accept': 'application/atom+xml'
        }
      }
    );

    if (!response.ok) {
      console.warn(`SEC CIK lookup failed for ${symbol}: ${response.status}`);
      return null;
    }

    const text = await response.text();
    const cikMatch = text.match(/CIK=(\d{10})/i) || text.match(/cik=(\d+)/i);
    
    if (cikMatch) {
      const cik = cikMatch[1].padStart(10, '0');
      CIK_CACHE.set(symbol.toUpperCase(), cik);
      return cik;
    }

    const tickerResponse = await fetch(
      'https://www.sec.gov/files/company_tickers.json',
      {
        headers: {
          'User-Agent': 'CryptoFlowPro/1.0 (research@example.com)'
        }
      }
    );

    if (tickerResponse.ok) {
      const tickers = await tickerResponse.json();
      for (const key of Object.keys(tickers)) {
        if (tickers[key].ticker?.toUpperCase() === symbol.toUpperCase()) {
          const cik = String(tickers[key].cik_str).padStart(10, '0');
          CIK_CACHE.set(symbol.toUpperCase(), cik);
          return cik;
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Error getting CIK for ${symbol}:`, error);
    return null;
  }
}

async function fetchLatestFiling(cik: string): Promise<{ type: string; date: string; url: string } | null> {
  try {
    const response = await fetch(
      `https://data.sec.gov/submissions/CIK${cik}.json`,
      {
        headers: {
          'User-Agent': 'CryptoFlowPro/1.0 (research@example.com)',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn(`SEC submissions fetch failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const filings = data.filings?.recent;
    
    if (!filings || !filings.form) return null;

    for (let i = 0; i < filings.form.length; i++) {
      const form = filings.form[i];
      if (form === '10-K' || form === '10-Q') {
        return {
          type: form,
          date: filings.filingDate[i],
          url: `https://www.sec.gov/Archives/edgar/data/${cik}/${filings.accessionNumber[i].replace(/-/g, '')}/${filings.primaryDocument[i]}`
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching SEC filing:', error);
    return null;
  }
}

async function scanFilingForRisks(filingUrl: string): Promise<{ keywords: string[]; riskScore: number }> {
  try {
    const response = await fetch(filingUrl, {
      headers: {
        'User-Agent': 'CryptoFlowPro/1.0 (research@example.com)'
      }
    });

    if (!response.ok) {
      return { keywords: [], riskScore: 0 };
    }

    const html = await response.text();
    
    const riskSectionMatch = html.match(/risk\s*factors|legal\s*proceedings/gi);
    const textToScan = riskSectionMatch ? html : html.slice(0, 500000);

    const foundKeywords: string[] = [];
    const lowerText = textToScan.toLowerCase();

    for (const keyword of SEC_RISK_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches && matches.length > 0) {
        foundKeywords.push(keyword);
      }
    }

    const uniqueKeywords = Array.from(new Set(foundKeywords));
    return {
      keywords: uniqueKeywords,
      riskScore: uniqueKeywords.length
    };
  } catch (error) {
    console.error('Error scanning SEC filing:', error);
    return { keywords: [], riskScore: 0 };
  }
}

export async function getSECFlags(symbol: string): Promise<SECRiskFlags> {
  const upperSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, '');
  
  const cached = SEC_FLAGS_CACHE.get(upperSymbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const cik = await getCIKForSymbol(upperSymbol);
    
    if (!cik) {
      const result: SECRiskFlags = {
        symbol: upperSymbol,
        status: 'UNAVAILABLE',
        riskScore: 0,
        keywordsFound: [],
        filingType: null,
        filingDate: null,
        checkedAt: Date.now()
      };
      SEC_FLAGS_CACHE.set(upperSymbol, { data: result, timestamp: Date.now() });
      return result;
    }

    const filing = await fetchLatestFiling(cik);
    
    if (!filing) {
      const result: SECRiskFlags = {
        symbol: upperSymbol,
        status: 'UNAVAILABLE',
        riskScore: 0,
        keywordsFound: [],
        filingType: null,
        filingDate: null,
        checkedAt: Date.now()
      };
      SEC_FLAGS_CACHE.set(upperSymbol, { data: result, timestamp: Date.now() });
      return result;
    }

    const { keywords, riskScore } = await scanFilingForRisks(filing.url);
    
    const result: SECRiskFlags = {
      symbol: upperSymbol,
      status: riskScore >= 2 ? 'ALERT' : 'CLEAR',
      riskScore,
      keywordsFound: keywords,
      filingType: filing.type,
      filingDate: filing.date,
      checkedAt: Date.now()
    };

    SEC_FLAGS_CACHE.set(upperSymbol, { data: result, timestamp: Date.now() });
    console.log(`📋 SEC Risk Check for ${upperSymbol}: ${result.status} (score: ${riskScore}, keywords: ${keywords.join(', ') || 'none'})`);
    
    return result;
  } catch (error) {
    console.error(`Error getting SEC flags for ${symbol}:`, error);
    return {
      symbol: upperSymbol,
      status: 'UNAVAILABLE',
      riskScore: 0,
      keywordsFound: [],
      filingType: null,
      filingDate: null,
      checkedAt: Date.now()
    };
  }
}

export function clearSECCache(): void {
  SEC_FLAGS_CACHE.clear();
  CIK_CACHE.clear();
}
