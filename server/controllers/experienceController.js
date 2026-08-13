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

const mapRow = (row) => {
  if (!row) return null;
  const orderNum = parseInt(row.display_order ?? row.order ?? 1, 10);
  return {
    ...row,
    _id: row.id || row._id,
    order: isNaN(orderNum) ? 1 : orderNum,
    createdAt: row.created_at || row.createdAt
  };
};

export const getExperiences = async (req, res, next) => {
  try {
    if (isFallbackMode() || !supabase) {
      await seedFallbackData();
      const list = getFallbackStore().experiences || [];
      list.sort((a, b) => (a.order || 1) - (b.order || 1));
      return res.json(list);
    }

    let { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getExperiences error:', error.message);
      await seedFallbackData();
      const list = getFallbackStore().experiences || [];
      list.sort((a, b) => (a.order || 1) - (b.order || 1));
      return res.json(list);
    }

    // ONLY auto-seed if the experiences table is completely empty!
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

    const mapped = (data || []).map(mapRow);
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
      return res.status(201).json(fallbackExp);
    }

    const { data, error } = await supabase
      .from('experiences')
      .insert({
        title,
        period,
        description,
        display_order: orderNum
      })
      .select();

    if (error) {
      console.warn('Supabase createExperience error, using fallback:', error.message);
      if (!getFallbackStore().experiences) getFallbackStore().experiences = [];
      getFallbackStore().experiences.push(fallbackExp);
      return res.status(201).json(fallbackExp);
    }

    const row = Array.isArray(data) ? data[0] : data;
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
    if (req.body.order !== undefined) updates.display_order = parseInt(req.body.order, 10) || 1;

    if (isFallbackMode() || !supabase) {
      const store = getFallbackStore().experiences || [];
      const item = store.find((exp) => exp._id === req.params.id);
      if (!item) return res.status(404).json({ message: 'Experience not found' });
      if (updates.display_order !== undefined) updates.order = updates.display_order;
      Object.assign(item, updates);
      return res.json(item);
    }

    const { data, error } = await supabase
      .from('experiences')
      .update(updates)
      .eq('id', req.params.id)
      .select();

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
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    next(error);
  }
};
