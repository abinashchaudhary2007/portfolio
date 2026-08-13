import { supabase } from '../config/db.js';
import { getFallbackStore, isFallbackMode, seedFallbackData } from '../utils/fallbackStore.js';

const DEFAULT_EXPERIENCES = [
  {
    title: '3+Hackathon participation',
    period: '2026',
    description: 'Successful participation in hackathon building Nyaya Mitra, a legal aid platform for underserved communities. Connect grow a platform for students to learn, earn and grow.',
    display_order: 1
  },
  {
    title: 'Open Source Contributor',
    period: '2026',
    description: 'Active contributor to open-source projects with meaningful PRs merged into community repositories.',
    display_order: 2
  },
  {
    title: 'BSc. CSIT Student',
    period: '2026- Present',
    description: 'Pursuing Computer Science & Information Technology with focus on software engineering and web development.',
    display_order: 3
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
    createdAt: row.created_at || row.createdAt
  };
};

/**
 * Re-balances experience orders in sequential order (1, 2, 3...).
 */
const rebalanceOrders = async (targetId = null, targetNewOrder = null) => {
  if (isFallbackMode() || !supabase) {
    const list = getFallbackStore().experiences || [];
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

  // Fetch experiences safely from Supabase
  let allItems = [];
  let { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    // If display_order column doesn't exist yet on Supabase table, query by created_at
    const res = await supabase
      .from('experiences')
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

  // Re-assign 1, 2, 3...
  const updatePromises = [];
  for (let i = 0; i < allItems.length; i++) {
    const expectedOrder = i + 1;
    if (allItems[i].display_order !== expectedOrder) {
      allItems[i].display_order = expectedOrder;
      allItems[i].order = expectedOrder;
      updatePromises.push(
        supabase
          .from('experiences')
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

export const getExperiences = async (req, res, next) => {
  try {
    if (isFallbackMode() || !supabase) {
      await seedFallbackData();
      const list = getFallbackStore().experiences || [];
      list.sort((a, b) => (a.order || 1) - (b.order || 1));
      return res.json(list);
    }

    let data = null;
    let error = null;

    // Try ordering by display_order first
    const resOrder = await supabase
      .from('experiences')
      .select('*')
      .order('display_order', { ascending: true });

    if (resOrder.error) {
      // Fall back to created_at if display_order column isn't in Supabase yet
      const resCreated = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false });
      data = resCreated.data;
      error = resCreated.error;
    } else {
      data = resOrder.data;
    }

    if (error) {
      console.warn('Supabase getExperiences error:', error.message);
      await seedFallbackData();
      const list = getFallbackStore().experiences || [];
      list.sort((a, b) => (a.order || 1) - (b.order || 1));
      return res.json(list);
    }

    // Auto-seed ONLY if table is completely empty
    if (!data || data.length === 0) {
      try {
        const { data: seeded, error: seedErr } = await supabase
          .from('experiences')
          .insert(DEFAULT_EXPERIENCES)
          .select();
        if (!seedErr && seeded && seeded.length) {
          data = seeded;
        }
      } catch (err) {
        console.warn('Auto-seed missing experiences error:', err.message);
      }
    }

    const mapped = (data || []).map((row, idx) => mapRow(row, idx));
    mapped.sort((a, b) => (a.order || 1) - (b.order || 1));
    res.json(mapped);
  } catch (error) {
    console.warn('getExperiences catch handler:', error.message);
    await seedFallbackData();
    const list = getFallbackStore().experiences || [];
    list.sort((a, b) => (a.order || 1) - (b.order || 1));
    res.json(list);
  }
};

export const createExperience = async (req, res, next) => {
  try {
    const { title, period, description, order } = req.body;

    if (!title || !period || !description) {
      return res.status(400).json({ message: 'Title, period, and description are required' });
    }

    const orderNum = parseInt(order, 10) || 1;

    const fallbackExp = {
      _id: `exp-${Date.now()}`,
      title,
      period,
      description,
      order: orderNum,
      createdAt: new Date().toISOString()
    };

    if (isFallbackMode() || !supabase) {
      if (!getFallbackStore().experiences) getFallbackStore().experiences = [];
      getFallbackStore().experiences.push(fallbackExp);
      await rebalanceOrders(fallbackExp._id, orderNum);
      return res.status(201).json(fallbackExp);
    }

    // Try inserting with display_order
    let { data, error } = await supabase
      .from('experiences')
      .insert({
        title,
        period,
        description,
        display_order: orderNum
      })
      .select();

    if (error) {
      // Fallback insert without display_order column if missing
      const resWithoutOrder = await supabase
        .from('experiences')
        .insert({ title, period, description })
        .select();
      data = resWithoutOrder.data;
      error = resWithoutOrder.error;
    }

    if (error) {
      console.warn('Supabase createExperience error, using fallback:', error.message);
      if (!getFallbackStore().experiences) getFallbackStore().experiences = [];
      getFallbackStore().experiences.push(fallbackExp);
      await rebalanceOrders(fallbackExp._id, orderNum);
      return res.status(201).json(fallbackExp);
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (row && row.id) {
      await rebalanceOrders(row.id, orderNum);
    }

    res.status(201).json(mapRow(row || fallbackExp));
  } catch (error) {
    console.warn('createExperience catch handler, using fallback:', error.message);
    const { title, period, description, order } = req.body || {};
    const fallbackExp = {
      _id: `exp-${Date.now()}`,
      title: title || 'Experience',
      period: period || '2026',
      description: description || '',
      order: parseInt(order, 10) || 1,
      createdAt: new Date().toISOString()
    };
    if (!getFallbackStore().experiences) getFallbackStore().experiences = [];
    getFallbackStore().experiences.push(fallbackExp);
    res.status(201).json(fallbackExp);
  }
};

export const updateExperience = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.period !== undefined) updates.period = req.body.period;
    if (req.body.description !== undefined) updates.description = req.body.description;
    
    let newOrder = null;
    if (req.body.order !== undefined) {
      newOrder = parseInt(req.body.order, 10) || 1;
      updates.display_order = newOrder;
    }

    if (isFallbackMode() || !supabase) {
      const store = getFallbackStore().experiences || [];
      const item = store.find((exp) => exp._id === req.params.id);
      if (!item) return res.status(404).json({ message: 'Experience not found' });
      if (updates.display_order !== undefined) updates.order = updates.display_order;
      Object.assign(item, updates);
      if (newOrder !== null) {
        await rebalanceOrders(req.params.id, newOrder);
      }
      return res.json(item);
    }

    let { data, error } = await supabase
      .from('experiences')
      .update(updates)
      .eq('id', req.params.id)
      .select();

    if (error && updates.display_order !== undefined) {
      // If display_order column doesn't exist on Supabase, retry update without display_order
      delete updates.display_order;
      const resRetry = await supabase
        .from('experiences')
        .update(updates)
        .eq('id', req.params.id)
        .select();
      data = resRetry.data;
      error = resRetry.error;
    }

    if (error) {
      console.warn('Supabase updateExperience error, using fallback:', error.message);
      const store = getFallbackStore().experiences || [];
      const item = store.find((exp) => exp._id === req.params.id);
      if (item) {
        if (updates.display_order !== undefined) updates.order = updates.display_order;
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

export const deleteExperience = async (req, res, next) => {
  try {
    if (isFallbackMode() || !supabase) {
      if (getFallbackStore().experiences) {
        getFallbackStore().experiences = getFallbackStore().experiences.filter(
          (item) => item._id !== req.params.id
        );
        await rebalanceOrders();
      }
      return res.json({ message: 'Experience deleted' });
    }

    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.warn('Supabase deleteExperience error, using fallback:', error.message);
      if (getFallbackStore().experiences) {
        getFallbackStore().experiences = getFallbackStore().experiences.filter(
          (item) => item._id !== req.params.id
        );
      }
    }

    await rebalanceOrders();
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    next(error);
  }
};
