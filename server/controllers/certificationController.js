import { supabase } from '../config/db.js';
import { getFallbackStore, isFallbackMode, seedFallbackData } from '../utils/fallbackStore.js';
import { uploadToSupabase } from '../utils/uploadToSupabase.js';

const DEFAULT_CERTIFICATIONS = [
  {
    title: 'Hackathon experienced',
    subtitle: '3+ Hackathon participation 2026',
    issue_date: '2026',
    icon: 'star',
    credential_url: ''
  },
  {
    title: 'Web Development',
    subtitle: 'Certified Full-Stack Developer',
    issue_date: '2026',
    icon: 'layout',
    credential_url: ''
  },
  {
    title: 'Problem Solving',
    subtitle: 'Competitive Programming Finalist',
    issue_date: '2026',
    icon: 'award',
    credential_url: ''
  },
  {
    title: 'CS Fundamentals',
    subtitle: 'Data Structures & Algorithms Certified',
    issue_date: '2026',
    icon: 'book',
    credential_url: ''
  }
];

const mapRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id || row._id,
    credentialUrl: row.credential_url || row.credentialUrl,
    issueDate: row.issue_date || row.issueDate,
    createdAt: row.created_at || row.createdAt
  };
};

export const getCertifications = async (req, res, next) => {
  try {
    if (isFallbackMode() || !supabase) {
      await seedFallbackData();
      return res.json(getFallbackStore().certifications || []);
    }

    let { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getCertifications error, using fallback:', error.message);
      await seedFallbackData();
      return res.json(getFallbackStore().certifications || []);
    }

    const existingTitles = new Set((data || []).map(item => item.title));
    const missing = DEFAULT_CERTIFICATIONS.filter(item => !existingTitles.has(item.title));
    if (missing.length > 0) {
      try {
        const { data: seeded, error: seedErr } = await supabase
          .from('certifications')
          .insert(missing)
          .select();
        if (!seedErr && seeded && seeded.length) {
          data = [...(data || []), ...seeded];
        }
      } catch (err) {
        console.warn('Auto-seed missing certifications error:', err.message);
      }
    }

    res.json((data || []).map(mapRow));
  } catch (error) {
    console.warn('getCertifications catch handler:', error.message);
    await seedFallbackData();
    res.json(getFallbackStore().certifications || []);
  }
};

export const createCertification = async (req, res, next) => {
  try {
    const { title, subtitle, issueDate, icon, credentialUrl } = req.body;

    if (!title || !subtitle) {
      return res.status(400).json({ message: 'Title and subtitle are required' });
    }

    let finalCredentialUrl = credentialUrl || '';
    const files = req.files && req.files.length ? req.files : (req.file ? [req.file] : []);
    if (files.length > 0) {
      const uploadedUrls = [];
      for (const f of files) {
        try {
          const uploadedUrl = await uploadToSupabase(f);
          if (uploadedUrl) {
            uploadedUrls.push(uploadedUrl);
          } else {
            const b64 = f.buffer.toString('base64');
            uploadedUrls.push(`data:${f.mimetype};base64,${b64}`);
          }
        } catch (err) {
          console.warn('File upload fallback triggered:', err.message);
          const b64 = f.buffer.toString('base64');
          uploadedUrls.push(`data:${f.mimetype};base64,${b64}`);
        }
      }
      if (uploadedUrls.length > 0) {
        finalCredentialUrl = uploadedUrls.join(',');
      }
    }

    const fallbackCert = {
      _id: `cert-${Date.now()}`,
      title,
      subtitle,
      issueDate: issueDate || '2026',
      icon: icon || 'award',
      credentialUrl: finalCredentialUrl,
      createdAt: new Date().toISOString()
    };

    if (isFallbackMode() || !supabase) {
      if (!getFallbackStore().certifications) getFallbackStore().certifications = [];
      getFallbackStore().certifications.unshift(fallbackCert);
      return res.status(201).json(fallbackCert);
    }

    const { data, error } = await supabase
      .from('certifications')
      .insert({
        title,
        subtitle,
        issue_date: issueDate || '2026',
        icon: icon || 'award',
        credential_url: finalCredentialUrl
      })
      .select();

    if (error) {
      console.warn('Supabase createCertification error, using fallback:', error.message);
      if (!getFallbackStore().certifications) getFallbackStore().certifications = [];
      getFallbackStore().certifications.unshift(fallbackCert);
      return res.status(201).json(fallbackCert);
    }

    const row = Array.isArray(data) ? data[0] : data;
    res.status(201).json(mapRow(row || fallbackCert));
  } catch (error) {
    console.warn('createCertification catch handler, using fallback:', error.message);
    const { title, subtitle, issueDate, icon, credentialUrl } = req.body || {};
    const fallbackCert = {
      _id: `cert-${Date.now()}`,
      title: title || 'Certification',
      subtitle: subtitle || '',
      issueDate: issueDate || '2026',
      icon: icon || 'award',
      credentialUrl: credentialUrl || '',
      createdAt: new Date().toISOString()
    };
    if (!getFallbackStore().certifications) getFallbackStore().certifications = [];
    getFallbackStore().certifications.unshift(fallbackCert);
    res.status(201).json(fallbackCert);
  }
};

export const updateCertification = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.subtitle !== undefined) updates.subtitle = req.body.subtitle;
    if (req.body.issueDate !== undefined) updates.issue_date = req.body.issueDate;
    if (req.body.icon !== undefined) updates.icon = req.body.icon;

    let finalCredentialUrl = req.body.credentialUrl;
    const files = req.files && req.files.length ? req.files : (req.file ? [req.file] : []);
    if (files.length > 0) {
      const uploadedUrls = [];
      for (const f of files) {
        try {
          const uploadedUrl = await uploadToSupabase(f);
          uploadedUrls.push(uploadedUrl || `data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
        } catch (err) {
          uploadedUrls.push(`data:${f.mimetype};base64,${f.buffer.toString('base64')}`);
        }
      }
      if (uploadedUrls.length > 0) {
        finalCredentialUrl = uploadedUrls.join(',');
      }
    }
    if (finalCredentialUrl !== undefined) updates.credential_url = finalCredentialUrl;

    if (isFallbackMode() || !supabase) {
      const store = getFallbackStore().certifications || [];
      const item = store.find((c) => c._id === req.params.id);
      if (!item) return res.status(404).json({ message: 'Certification not found' });
      if (updates.title) item.title = updates.title;
      if (updates.subtitle) item.subtitle = updates.subtitle;
      if (updates.issue_date) item.issueDate = updates.issue_date;
      if (updates.icon) item.icon = updates.icon;
      if (updates.credential_url) item.credentialUrl = updates.credential_url;
      return res.json(item);
    }

    const { data, error } = await supabase
      .from('certifications')
      .update(updates)
      .eq('id', req.params.id)
      .select();

    if (error) {
      console.warn('Supabase updateCertification error, using fallback:', error.message);
      const store = getFallbackStore().certifications || [];
      const item = store.find((c) => c._id === req.params.id);
      if (item) Object.assign(item, updates);
      return res.json(item || { _id: req.params.id, ...updates });
    }

    const row = Array.isArray(data) ? data[0] : data;
    res.json(mapRow(row));
  } catch (error) {
    next(error);
  }
};

export const deleteCertification = async (req, res, next) => {
  try {
    if (isFallbackMode() || !supabase) {
      if (getFallbackStore().certifications) {
        getFallbackStore().certifications = getFallbackStore().certifications.filter(
          (item) => item._id !== req.params.id
        );
      }
      return res.json({ message: 'Certification deleted' });
    }

    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.warn('Supabase deleteCertification error, using fallback:', error.message);
      if (getFallbackStore().certifications) {
        getFallbackStore().certifications = getFallbackStore().certifications.filter(
          (item) => item._id !== req.params.id
        );
      }
    }
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    next(error);
  }
};
