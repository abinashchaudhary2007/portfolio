import { supabase } from '../config/db.js';
import { getFallbackStore, isFallbackMode, seedFallbackData } from '../utils/fallbackStore.js';
import { uploadToSupabase } from '../utils/uploadToSupabase.js';

const DEFAULT_CERTIFICATIONS = [
  {
    title: 'Hackathon experienced',
    subtitle: '3+ Hackathon participation 2026',
    issue_date: '2026',
    icon: 'star',
    credential_url: '',
    display_order: 1
  },
  {
    title: 'Web Development',
    subtitle: 'Certified Full-Stack Developer',
    issue_date: '2026',
    icon: 'layout',
    credential_url: '',
    display_order: 2
  },
  {
    title: 'Problem Solving',
    subtitle: 'Competitive Programming Finalist',
    issue_date: '2026',
    icon: 'award',
    credential_url: '',
    display_order: 3
  },
  {
    title: 'CS Fundamentals',
    subtitle: 'Data Structures & Algorithms Certified',
    issue_date: '2026',
    icon: 'book',
    credential_url: '',
    display_order: 4
  }
];

const mapRow = (row, index = 0) => {
  if (!row) return null;
  const rawOrder = row.display_order ?? row.order;
  const orderNum = rawOrder !== undefined && rawOrder !== null ? parseInt(rawOrder, 10) : index + 1;
  return {
    ...row,
    _id: row.id || row._id,
    order: isNaN(orderNum) ? index + 1 : orderNum,
    credentialUrl: row.credential_url || row.credentialUrl,
    issueDate: row.issue_date || row.issueDate,
    createdAt: row.created_at || row.createdAt
  };
};

/**
 * Re-balances certification orders in sequential order (1, 2, 3...).
 */
const rebalanceOrders = async (targetId = null, targetNewOrder = null) => {
  if (isFallbackMode() || !supabase) {
    const list = getFallbackStore().certifications || [];
    list.sort((a, b) => (a.order || 1) - (b.order || 1));
    if (targetId && targetNewOrder !== null) {
      const idx = list.findIndex(item => item._id === targetId);
      if (idx !== -1) {
        const [moved] = list.splice(idx, 1);
        const desiredIdx = Math.max(0, Math.min(targetNewOrder - 1, list.length));
        list.splice(desiredIdx, 0, moved);
      }
    }
    list.forEach((item, index) => {
      item.order = index + 1;
    });
    return list;
  }

  let allItems = [];
  let { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    const res = await supabase
      .from('certifications')
      .select('*')
      .order('created_at', { ascending: false });
    allItems = res.data || [];
  } else {
    allItems = data || [];
  }

  if (targetId && targetNewOrder !== null) {
    const idx = allItems.findIndex(item => item.id === targetId || item._id === targetId);
    if (idx !== -1) {
      const [moved] = allItems.splice(idx, 1);
      const desiredIdx = Math.max(0, Math.min(targetNewOrder - 1, allItems.length));
      allItems.splice(desiredIdx, 0, moved);
    }
  }

  const updatePromises = [];
  for (let i = 0; i < allItems.length; i++) {
    const expectedOrder = i + 1;
    if (allItems[i].display_order !== expectedOrder) {
      allItems[i].display_order = expectedOrder;
      allItems[i].order = expectedOrder;
      updatePromises.push(
        supabase
          .from('certifications')
          .update({ display_order: expectedOrder })
          .eq('id', allItems[i].id)
          .then(() => {})
          .catch(() => {})
      );
    }
  }

  if (updatePromises.length > 0) {
    await Promise.all(updatePromises).catch(() => {});
  }

  return allItems;
};

export const getCertifications = async (req, res, next) => {
  try {
    if (isFallbackMode() || !supabase) {
      await seedFallbackData();
      const list = getFallbackStore().certifications || [];
      list.sort((a, b) => (a.order || 1) - (b.order || 1));
      return res.json(list);
    }

    let data = null;
    let error = null;

    const resOrder = await supabase
      .from('certifications')
      .select('*')
      .order('display_order', { ascending: true });

    if (resOrder.error) {
      const resCreated = await supabase
        .from('certifications')
        .select('*')
        .order('created_at', { ascending: false });
      data = resCreated.data;
      error = resCreated.error;
    } else {
      data = resOrder.data;
    }

    if (error) {
      console.warn('Supabase getCertifications error, using fallback:', error.message);
      await seedFallbackData();
      const list = getFallbackStore().certifications || [];
      list.sort((a, b) => (a.order || 1) - (b.order || 1));
      return res.json(list);
    }

    // Auto-seed ONLY if table is completely empty
    if (!data || data.length === 0) {
      try {
        const { data: seeded, error: seedErr } = await supabase
          .from('certifications')
          .insert(DEFAULT_CERTIFICATIONS)
          .select();
        if (!seedErr && seeded && seeded.length) {
          data = seeded;
        }
      } catch (err) {
        console.warn('Auto-seed missing certifications error:', err.message);
      }
    }

    const mapped = (data || []).map((row, idx) => mapRow(row, idx));
    mapped.sort((a, b) => (a.order || 1) - (b.order || 1));
    res.json(mapped);
  } catch (error) {
    console.warn('getCertifications catch handler:', error.message);
    await seedFallbackData();
    const list = getFallbackStore().certifications || [];
    list.sort((a, b) => (a.order || 1) - (b.order || 1));
    res.json(list);
  }
};

export const createCertification = async (req, res, next) => {
  try {
    const { title, subtitle, issueDate, icon, credentialUrl, order } = req.body;

    if (!title || !subtitle) {
      return res.status(400).json({ message: 'Title and subtitle are required' });
    }

    const orderNum = parseInt(order, 10) || 1;

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
      order: orderNum,
      createdAt: new Date().toISOString()
    };

    if (isFallbackMode() || !supabase) {
      if (!getFallbackStore().certifications) getFallbackStore().certifications = [];
      getFallbackStore().certifications.push(fallbackCert);
      await rebalanceOrders(fallbackCert._id, orderNum);
      return res.status(201).json(fallbackCert);
    }

    let { data, error } = await supabase
      .from('certifications')
      .insert({
        title,
        subtitle,
        issue_date: issueDate || '2026',
        icon: icon || 'award',
        credential_url: finalCredentialUrl,
        display_order: orderNum
      })
      .select();

    if (error) {
      const resWithoutOrder = await supabase
        .from('certifications')
        .insert({
          title,
          subtitle,
          issue_date: issueDate || '2026',
          icon: icon || 'award',
          credential_url: finalCredentialUrl
        })
        .select();
      data = resWithoutOrder.data;
      error = resWithoutOrder.error;
    }

    if (error) {
      console.warn('Supabase createCertification error, using fallback:', error.message);
      if (!getFallbackStore().certifications) getFallbackStore().certifications = [];
      getFallbackStore().certifications.push(fallbackCert);
      await rebalanceOrders(fallbackCert._id, orderNum);
      return res.status(201).json(fallbackCert);
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (row && row.id) {
      await rebalanceOrders(row.id, orderNum);
    }

    res.status(201).json(mapRow(row || fallbackCert));
  } catch (error) {
    console.warn('createCertification catch handler, using fallback:', error.message);
    const { title, subtitle, issueDate, icon, credentialUrl, order } = req.body || {};
    const fallbackCert = {
      _id: `cert-${Date.now()}`,
      title: title || 'Certification',
      subtitle: subtitle || '',
      issueDate: issueDate || '2026',
      icon: icon || 'award',
      credentialUrl: credentialUrl || '',
      order: parseInt(order, 10) || 1,
      createdAt: new Date().toISOString()
    };
    if (!getFallbackStore().certifications) getFallbackStore().certifications = [];
    getFallbackStore().certifications.push(fallbackCert);
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

    let newOrder = null;
    if (req.body.order !== undefined) {
      newOrder = parseInt(req.body.order, 10) || 1;
      updates.display_order = newOrder;
    }

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
      if (updates.display_order !== undefined) item.order = updates.display_order;
      if (newOrder !== null) {
        await rebalanceOrders(req.params.id, newOrder);
      }
      return res.json(item);
    }

    let { data, error } = await supabase
      .from('certifications')
      .update(updates)
      .eq('id', req.params.id)
      .select();

    if (error && updates.display_order !== undefined) {
      delete updates.display_order;
      const resRetry = await supabase
        .from('certifications')
        .update(updates)
        .eq('id', req.params.id)
        .select();
      data = resRetry.data;
      error = resRetry.error;
    }

    if (error) {
      console.warn('Supabase updateCertification error, using fallback:', error.message);
      const store = getFallbackStore().certifications || [];
      const item = store.find((c) => c._id === req.params.id);
      if (item) {
        if (updates.display_order !== undefined) item.order = updates.display_order;
        Object.assign(item, updates);
      }
      return res.json(item || { _id: req.params.id, ...updates });
    }

    if (newOrder !== null) {
      await rebalanceOrders(req.params.id, newOrder);
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
        await rebalanceOrders();
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

    await rebalanceOrders();
    res.json({ message: 'Certification deleted' });
  } catch (error) {
    next(error);
  }
};
