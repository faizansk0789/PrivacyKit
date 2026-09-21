import { PrivacyRiskItem, UrlAnalysisResult, UrlTrackingParam } from '../types';

/**
 * Known tracking, telemetry, ad attribution, and fingerprinting URL query parameters.
 */
export const KNOWN_TRACKING_PARAMS: Record<string, { category: UrlTrackingParam['category']; description: string }> = {
  // Google / UTM
  'utm_source': { category: 'Analytics', description: 'Identifies the advertiser, site, or publication sending traffic.' },
  'utm_medium': { category: 'Analytics', description: 'Advertising or marketing medium (e.g., cpc, banner, email).' },
  'utm_campaign': { category: 'Analytics', description: 'Individual campaign name or slogan.' },
  'utm_term': { category: 'Analytics', description: 'Identifies paid search keywords.' },
  'utm_content': { category: 'Analytics', description: 'Differentiates ads or links pointing to the same URL.' },
  'utm_id': { category: 'Analytics', description: 'Google Analytics campaign ID code.' },
  'utm_source_platform': { category: 'Analytics', description: 'The platform responsible for directing traffic.' },
  'utm_creative_format': { category: 'Analytics', description: 'Type of creative asset (e.g., display, native, video).' },
  'utm_marketing_tactic': { category: 'Analytics', description: 'Targeting criteria or marketing tactic.' },

  // Ad Platform Click IDs (Critical Fingerprinting)
  'gclid': { category: 'Click ID', description: 'Google Ads click identifier linking URL click to individual user session.' },
  'gbraid': { category: 'Click ID', description: 'Google App-to-Web conversion measurement identifier.' },
  'wbraid': { category: 'Click ID', description: 'Google Web-to-Web attribution identifier.' },
  'dclid': { category: 'Click ID', description: 'Google Display Network click ID.' },
  'fbclid': { category: 'Click ID', description: 'Meta / Facebook click identifier attached to outgoing links.' },
  'ttclid': { category: 'Click ID', description: 'TikTok Ads attribution click identifier.' },
  'twclid': { category: 'Click ID', description: 'Twitter / X conversion tracking click ID.' },
  'msclkid': { category: 'Click ID', description: 'Microsoft / Bing Advertising click identifier.' },
  'igshid': { category: 'Social', description: 'Instagram shared link tracking parameter identifying user session.' },
  'yclid': { category: 'Click ID', description: 'Yandex advertising click identifier.' },
  'li_fat_id': { category: 'Click ID', description: 'LinkedIn First-party Ad Tracking ID.' },
  'sc_clickid': { category: 'Click ID', description: 'Snapchat click identifier.' },
  'pin_unauth': { category: 'Social', description: 'Pinterest unauthenticated visitor tracking parameter.' },

  // Email & CRM tracking
  '_hsenc': { category: 'Advertising', description: 'HubSpot encrypted contact identifier tied to email addresses.' },
  '_hsmi': { category: 'Advertising', description: 'HubSpot marketing email message ID.' },
  'mc_cid': { category: 'Analytics', description: 'Mailchimp campaign ID tracking.' },
  'mc_eid': { category: 'Advertising', description: 'Mailchimp email subscriber unique identifier.' },
  'mkt_tok': { category: 'Advertising', description: 'Marketo marketing lead tracking token.' },
  'vero_id': { category: 'Advertising', description: 'Vero customer journey identity tag.' },
  'wickedid': { category: 'Advertising', description: 'Wicked Reports attribution click tracker.' },

  // E-Commerce / Amazon / Affiliate
  'ref_': { category: 'Referral', description: 'Amazon internal referral and click telemetry parameter.' },
  'tag': { category: 'Referral', description: 'Affiliate commission tracking tag.' },
  'linkCode': { category: 'Referral', description: 'Affiliate link format code.' },
  'camp': { category: 'Referral', description: 'Affiliate campaign identifier.' },
  'creative': { category: 'Referral', description: 'Affiliate creative placement ID.' },
  'pf_rd_r': { category: 'Analytics', description: 'Amazon customer session request identifier.' },
  'pf_rd_m': { category: 'Analytics', description: 'Amazon internal merchant tracker.' },
  'pd_rd_r': { category: 'Analytics', description: 'Amazon product recommendation tracking.' },
  'pd_rd_w': { category: 'Analytics', description: 'Amazon widget interaction tracker.' },
  'pd_rd_wg': { category: 'Analytics', description: 'Amazon recommendation group tracker.' },

  // Social Sharing & Session IDs
  'si': { category: 'Social', description: 'Spotify / YouTube share identifier linking to the sharing account.' },
  'feature': { category: 'Social', description: 'YouTube app feature sharing context tag.' },
  'app': { category: 'Social', description: 'Origin application marker on shared URLs.' },
  'src': { category: 'Referral', description: 'Generic origin traffic parameter.' },
  'session_id': { category: 'Click ID', description: 'Explicit visitor session identifier.' },
  's_kwcid': { category: 'Advertising', description: 'Adobe Analytics paid search keyword tracker.' },
};

/**
 * Analyzes and cleans a URL, identifying trackers, calculating privacy score, and creating cleaned output.
 */
export function analyzeAndCleanUrl(rawUrl: string): UrlAnalysisResult {
  let urlString = rawUrl.trim();
  if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    urlString = `https://${urlString}`;
  }

  try {
    const parsed = new URL(urlString);
    const trackingParams: UrlTrackingParam[] = [];
    const cleanParams: Record<string, string> = {};
    const risks: PrivacyRiskItem[] = [];

    const searchParams = new URLSearchParams(parsed.search);
    let totalParams = 0;

    for (const [key, value] of searchParams.entries()) {
      totalParams++;
      const lowerKey = key.toLowerCase();
      
      const known = KNOWN_TRACKING_PARAMS[lowerKey] || 
        (lowerKey.startsWith('utm_') ? { category: 'Analytics', description: 'Marketing campaign parameter' } : undefined) ||
        (lowerKey.startsWith('pf_rd_') || lowerKey.startsWith('pd_rd_') ? { category: 'Analytics', description: 'E-commerce telemetry parameter' } : undefined) ||
        (lowerKey.includes('click_id') || lowerKey.includes('aff_') ? { category: 'Referral', description: 'Affiliate click identifier' } : undefined);

      if (known) {
        trackingParams.push({
          key,
          value,
          category: known.category,
          description: known.description,
        });

        const isHighRisk = known.category === 'Click ID' || lowerKey.includes('eid') || lowerKey.includes('hsenc');
        const isMedRisk = known.category === 'Advertising' || known.category === 'Social';

        risks.push({
          id: `tracker-${key}`,
          category: 'Tracking',
          title: `Tracking Parameter: ${key}`,
          description: known.description,
          value: `${key}=${value.length > 25 ? value.substring(0, 22) + '...' : value}`,
          risk: isHighRisk ? 'high' : isMedRisk ? 'medium' : 'low',
          removable: true,
          actionLabel: `Remove ${key}`,
        });
      } else {
        cleanParams[key] = value;
      }
    }

    // Build Clean URL
    const cleanUrlObj = new URL(parsed.origin + parsed.pathname);
    for (const [k, v] of Object.entries(cleanParams)) {
      cleanUrlObj.searchParams.append(k, v);
    }
    if (parsed.hash) {
      cleanUrlObj.hash = parsed.hash;
    }

    const cleanUrl = cleanUrlObj.toString();

    // If no risks detected
    if (risks.length === 0) {
      risks.push({
        id: 'url-clean-safe',
        category: 'Tracking',
        title: 'No Known Trackers Found',
        description: 'No advertising click IDs, UTM tags, or referral identifiers were detected in query parameters.',
        value: 'Standard Clean Link',
        risk: 'safe',
        removable: false,
      });
    }

    // Calculate score
    let deductions = 0;
    for (const risk of risks) {
      if (risk.risk === 'high') deductions += 35;
      else if (risk.risk === 'medium') deductions += 20;
      else if (risk.risk === 'low') deductions += 10;
    }
    const privacyScore = Math.max(20, Math.min(100, 100 - deductions));

    let redirectNotice: string | undefined;
    if (parsed.pathname.includes('/redirect') || parsed.pathname.includes('/out') || parsed.searchParams.has('url') || parsed.searchParams.has('redirect_url')) {
      redirectNotice = 'This URL appears to use a gateway redirect intermediary before navigating to the destination.';
    }

    return {
      originalUrl: rawUrl,
      cleanUrl,
      domain: parsed.hostname,
      protocol: parsed.protocol,
      pathname: parsed.pathname,
      trackingParams,
      cleanParams,
      totalParams,
      removedParamsCount: trackingParams.length,
      privacyScore,
      risks,
      redirectNotice,
    };
  } catch (err) {
    throw new Error('Please enter a valid web URL (e.g. https://example.com/page?utm_source=news)');
  }
}
