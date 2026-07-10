import { supabase } from '../config/db.js';
import { isFallbackMode, getFallbackStore } from '../utils/fallbackStore.js';

export const trackVisit = async (req, res, next) => {
  try {
    const {
      session_id,
      page,
      country,
      city,
      device,
      browser,
      operating_system,
      screen_resolution,
      language,
      timezone,
      referrer
    } = req.body;

    if (!session_id || !page) {
      return res.status(400).json({ message: 'Missing session_id or page' });
    }

    // 1-minute server-side deduplication per session per page
    const oneMinAgo = new Date(Date.now() - 60000).toISOString();

    if (isFallbackMode()) {
      const store = getFallbackStore();
      const duplicate = store.visitors.some(
        v => v.session_id === session_id && v.page === page && v.visited_at >= oneMinAgo
      );

      if (duplicate) {
        return res.json({ status: 'ignored', reason: 'duplicate' });
      }

      // Check if returning visitor
      const isReturning = store.visitors.some(v => v.session_id === session_id);

      const record = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        session_id,
        page,
        country: country || 'Local',
        city: city || 'Local',
        device: device || 'Desktop',
        browser: browser || 'Unknown',
        operating_system: operating_system || 'Unknown',
        screen_resolution: screen_resolution || 'Unknown',
        language: language || 'en',
        timezone: timezone || 'UTC',
        referrer: referrer || '',
        is_returning: isReturning,
        visited_at: new Date().toISOString()
      };

      store.visitors.push(record);
      return res.status(201).json({ status: 'success', record });
    } else {
      // Supabase mode
      const { data: recent, error: checkError } = await supabase
        .from('visitors')
        .select('id')
        .eq('session_id', session_id)
        .eq('page', page)
        .gte('visited_at', oneMinAgo)
        .limit(1);

      if (checkError) throw checkError;
      if (recent && recent.length > 0) {
        return res.json({ status: 'ignored', reason: 'duplicate' });
      }

      // Check returning
      const { data: past, error: checkReturningError } = await supabase
        .from('visitors')
        .select('id')
        .eq('session_id', session_id)
        .limit(1);

      if (checkReturningError) throw checkReturningError;
      const isReturning = past && past.length > 0;

      const { data: record, error: insertError } = await supabase
        .from('visitors')
        .insert([{
          session_id,
          page,
          country: country || 'Unknown',
          city: city || 'Unknown',
          device: device || 'Desktop',
          browser: browser || 'Unknown',
          operating_system: operating_system || 'Unknown',
          screen_resolution: screen_resolution || 'Unknown',
          language: language || 'en',
          timezone: timezone || 'UTC',
          referrer: referrer || '',
          is_returning: isReturning
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      return res.status(201).json({ status: 'success', record });
    }
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    if (isFallbackMode()) {
      const store = getFallbackStore();
      const visitors = store.visitors;

      const totalVisitors = new Set(visitors.map(v => v.session_id)).size;

      const todayStr = new Date().toISOString().split('T')[0];
      const visitorsToday = new Set(
        visitors.filter(v => v.visited_at.startsWith(todayStr)).map(v => v.session_id)
      ).size;

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const visitorsThisWeek = new Set(
        visitors.filter(v => v.visited_at >= oneWeekAgo).map(v => v.session_id)
      ).size;

      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const visitorsThisMonth = new Set(
        visitors.filter(v => v.visited_at >= oneMonthAgo).map(v => v.session_id)
      ).size;

      // Top viewed page
      const pageCounts = {};
      visitors.forEach(v => {
        pageCounts[v.page] = (pageCounts[v.page] || 0) + 1;
      });
      let mostViewedPage = 'N/A';
      let maxPageViews = 0;
      for (const [page, count] of Object.entries(pageCounts)) {
        if (count > maxPageViews) {
          maxPageViews = count;
          mostViewedPage = page;
        }
      }

      // Resume download count
      const resumeDownloads = visitors.filter(v => v.page === 'resume_download').length;

      // Contact message count
      const contactMessages = store.contacts.length;

      // Unique countries
      const totalCountries = new Set(visitors.map(v => v.country).filter(Boolean)).size;

      // Last visitor
      const lastVisitor = visitors.length > 0 ? visitors[visitors.length - 1] : null;

      return res.json({
        totalVisitors,
        visitorsToday,
        visitorsThisWeek,
        visitorsThisMonth,
        mostViewedPage,
        resumeDownloads,
        contactMessages,
        totalCountries,
        lastVisitor
      });
    } else {
      // Supabase mode
      const { data: allVisits, error } = await supabase
        .from('visitors')
        .select('session_id, page, country, visited_at');

      if (error) throw error;

      const totalVisitors = new Set(allVisits.map(v => v.session_id)).size;

      const todayStr = new Date().toISOString().split('T')[0];
      const visitorsToday = new Set(
        allVisits.filter(v => v.visited_at.startsWith(todayStr)).map(v => v.session_id)
      ).size;

      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const visitorsThisMonth = new Set(
        allVisits.filter(v => v.visited_at >= oneMonthAgo).map(v => v.session_id)
      ).size;

      // Top page
      const pageCounts = {};
      allVisits.forEach(v => {
        pageCounts[v.page] = (pageCounts[v.page] || 0) + 1;
      });
      let mostViewedPage = 'N/A';
      let maxPageViews = 0;
      for (const [page, count] of Object.entries(pageCounts)) {
        if (count > maxPageViews) {
          maxPageViews = count;
          mostViewedPage = page;
        }
      }

      const resumeDownloads = allVisits.filter(v => v.page === 'resume_download').length;

      // Contact count
      const { count: contactMessages, error: contactErr } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });
      if (contactErr) throw contactErr;

      const totalCountries = new Set(allVisits.map(v => v.country).filter(Boolean)).size;

      // Last visitor
      const { data: lastV, error: lastVErr } = await supabase
        .from('visitors')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(1);
      if (lastVErr) throw lastVErr;

      return res.json({
        totalVisitors,
        visitorsToday,
        visitorsThisMonth,
        mostViewedPage,
        resumeDownloads,
        contactMessages: contactMessages || 0,
        totalCountries,
        lastVisitor: lastV && lastV.length > 0 ? lastV[0] : null
      });
    }
  } catch (err) {
    next(err);
  }
};

export const getCharts = async (req, res, next) => {
  try {
    let visitors = [];

    if (isFallbackMode()) {
      visitors = getFallbackStore().visitors;
    } else {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('visited_at', { ascending: true });
      if (error) throw error;
      visitors = data || [];
    }

    // 1. Daily visitors (last 7 days)
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = new Set();
    }

    visitors.forEach(v => {
      const dateStr = new Date(v.visited_at).toISOString().split('T')[0];
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr].add(v.session_id);
      }
    });

    const dailyVisitors = Object.keys(dailyMap).map(date => ({
      date,
      count: dailyMap[date].size
    }));

    // 2. Browser usage
    const browserCounts = {};
    visitors.forEach(v => {
      const b = v.browser || 'Unknown';
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    });
    const browserUsage = Object.keys(browserCounts).map(b => ({
      browser: b,
      count: browserCounts[b]
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // 3. Top Pages
    const pageCounts = {};
    visitors.forEach(v => {
      const p = v.page || '/';
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });
    const topPages = Object.keys(pageCounts).map(p => ({
      page: p,
      count: pageCounts[p]
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // 4. Device types
    const deviceCounts = { Desktop: 0, Mobile: 0 };
    visitors.forEach(v => {
      const dev = v.device === 'Mobile' ? 'Mobile' : 'Desktop';
      deviceCounts[dev]++;
    });
    const deviceTypes = Object.keys(deviceCounts).map(d => ({
      device: d,
      count: deviceCounts[d]
    }));

    return res.json({
      dailyVisitors,
      browserUsage,
      topPages,
      deviceTypes
    });
  } catch (err) {
    next(err);
  }
};

export const getVisitors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search ? req.query.search.toLowerCase() : '';
    const device = req.query.device || '';
    const country = req.query.country || '';

    let visitors = [];

    if (isFallbackMode()) {
      visitors = getFallbackStore().visitors;
    } else {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('visited_at', { ascending: false });
      if (error) throw error;
      visitors = data || [];
    }

    // Filter list
    let filtered = visitors.filter(v => {
      const matchSearch = !search ||
        (v.country && v.country.toLowerCase().includes(search)) ||
        (v.city && v.city.toLowerCase().includes(search)) ||
        (v.browser && v.browser.toLowerCase().includes(search)) ||
        (v.operating_system && v.operating_system.toLowerCase().includes(search)) ||
        (v.page && v.page.toLowerCase().includes(search)) ||
        (v.session_id && v.session_id.toLowerCase().includes(search));

      const matchDevice = !device || v.device === device;
      const matchCountry = !country || v.country === country;

      return matchSearch && matchDevice && matchCountry;
    });

    // Pagination
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    // Get list of unique countries for select dropdown
    const countries = Array.from(new Set(visitors.map(v => v.country).filter(Boolean)));

    return res.json({
      visitors: paginated,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      },
      filters: {
        countries
      }
    });
  } catch (err) {
    next(err);
  }
};
