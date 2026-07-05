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
    profilePhoto: row.profile_photo,
    socialLinks: {
      instagram: row.instagram,
      facebook: row.facebook
    },
    createdAt: row.created_at || row.createdAt
  };
};

export const getSettings = async (req, res, next) => {
  try {
    if (isFallbackMode()) {
      await seedFallbackData();
      return res.json(getFallbackStore().settings);
    }

    try {
      let { data: settings, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!settings) {
        // Create defaults if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('site_settings')
          .insert({})
          .select()
          .single();

        if (createError) throw createError;
        settings = newSettings;
      }

      res.json(mapRow(settings));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        await seedFallbackData();
        return res.json(getFallbackStore().settings);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updateData = {};
    const textFields = ['name', 'title', 'bio', 'email', 'github', 'linkedin'];
    textFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.file) {
      updateData.profile_photo = `/uploads/${req.file.filename}`;
    }

    if (isFallbackMode()) {
      const fallbackData = { ...req.body };
      if (req.file) {
        fallbackData.profilePhoto = `/uploads/${req.file.filename}`;
      }
      getFallbackStore().settings = { ...getFallbackStore().settings, ...fallbackData };
      return res.json(getFallbackStore().settings);
    }

    try {
      // Find the settings first
      let { data: settings, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!settings) {
        // Create initial settings row first
        const { data: newSettings, error: createError } = await supabase
          .from('site_settings')
          .insert(updateData)
          .select()
          .single();

        if (createError) throw createError;
        return res.json(mapRow(newSettings));
      }

      // Update the settings row
      const { data: updatedSettings, error: updateError } = await supabase
        .from('site_settings')
        .update(updateData)
        .eq('id', settings.id)
        .select()
        .single();

      if (updateError) throw updateError;
      res.json(mapRow(updatedSettings));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        const fallbackData = { ...req.body };
        if (req.file) {
          fallbackData.profilePhoto = `/uploads/${req.file.filename}`;
        }
        getFallbackStore().settings = { ...getFallbackStore().settings, ...fallbackData };
        return res.json(getFallbackStore().settings);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
