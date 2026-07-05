import { supabase } from '../config/db.js';
import { getFallbackStore, isFallbackMode, seedFallbackData, setFallbackMode } from '../utils/fallbackStore.js';

const isDatabaseUnavailableError = (error) => {
  const message = error?.message || '';
  return (
    message.includes('fetch failed') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ENOTFOUND') ||
    message.includes('network') ||
    error?.status === 502 ||
    error?.status === 503 ||
    error?.status === 504
  );
};

const mapRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    _id: row.id,
    createdAt: row.created_at || row.createdAt
  };
};

export const getSkills = async (req, res, next) => {
  try {
    if (isFallbackMode()) {
      await seedFallbackData();
      return res.json(getFallbackStore().skills);
    }

    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json((data || []).map(mapRow));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        await seedFallbackData();
        return res.json(getFallbackStore().skills);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const createSkill = async (req, res, next) => {
  try {
    const { name, percentage, category } = req.body;

    if (!name || percentage === undefined || !category) {
      return res.status(400).json({ message: 'Name, percentage and category are required' });
    }

    const numericPercentage = Number(percentage);

    if (isFallbackMode()) {
      const skill = { _id: `skill-${Date.now()}`, name, percentage: numericPercentage, category };
      getFallbackStore().skills.unshift(skill);
      return res.status(201).json(skill);
    }

    try {
      const { data, error } = await supabase
        .from('skills')
        .insert({ name, percentage: numericPercentage, category })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(mapRow(data));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        const skill = { _id: `skill-${Date.now()}`, name, percentage: numericPercentage, category };
        getFallbackStore().skills.unshift(skill);
        return res.status(201).json(skill);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.percentage !== undefined) updates.percentage = Number(req.body.percentage);
    if (req.body.category !== undefined) updates.category = req.body.category;

    if (isFallbackMode()) {
      const skill = getFallbackStore().skills.find((item) => item._id === req.params.id);
      if (!skill) return res.status(404).json({ message: 'Skill not found' });
      Object.assign(skill, updates);
      return res.json(skill);
    }

    try {
      const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ message: 'Skill not found' });
      res.json(mapRow(data));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        const skill = getFallbackStore().skills.find((item) => item._id === req.params.id);
        if (!skill) return res.status(404).json({ message: 'Skill not found' });
        Object.assign(skill, updates);
        return res.json(skill);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    if (isFallbackMode()) {
      getFallbackStore().skills = getFallbackStore().skills.filter((item) => item._id !== req.params.id);
      return res.json({ message: 'Skill deleted' });
    }

    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ message: 'Skill deleted' });
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        getFallbackStore().skills = getFallbackStore().skills.filter((item) => item._id !== req.params.id);
        return res.json({ message: 'Skill deleted' });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
