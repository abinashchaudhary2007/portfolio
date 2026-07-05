import { supabase } from '../config/db.js';
import { getFallbackStore, isFallbackMode, setFallbackMode } from '../utils/fallbackStore.js';

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

export const createContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (isFallbackMode()) {
      const contact = {
        _id: `contact-${Date.now()}`,
        name,
        email,
        subject,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      };
      getFallbackStore().contacts.unshift(contact);
      return res.status(201).json(contact);
    }

    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({ name, email, subject, message })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(mapRow(data));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        const contact = {
          _id: `contact-${Date.now()}`,
          name,
          email,
          subject,
          message,
          read: false,
          createdAt: new Date().toISOString(),
        };
        getFallbackStore().contacts.unshift(contact);
        return res.status(201).json(contact);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    if (isFallbackMode()) {
      return res.json(getFallbackStore().contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }

    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json((data || []).map(mapRow));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        return res.json(getFallbackStore().contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const markContactAsRead = async (req, res, next) => {
  try {
    if (isFallbackMode()) {
      const contact = getFallbackStore().contacts.find((item) => item._id === req.params.id);
      if (!contact) return res.status(404).json({ message: 'Message not found' });
      contact.read = true;
      return res.json(contact);
    }

    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ read: true })
        .eq('id', req.params.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ message: 'Message not found' });
      res.json(mapRow(data));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        const contact = getFallbackStore().contacts.find((item) => item._id === req.params.id);
        if (!contact) return res.status(404).json({ message: 'Message not found' });
        contact.read = true;
        return res.json(contact);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    if (isFallbackMode()) {
      getFallbackStore().contacts = getFallbackStore().contacts.filter((item) => item._id !== req.params.id);
      return res.json({ message: 'Message deleted' });
    }

    try {
      const { error, count } = await supabase
        .from('contacts')
        .delete({ count: 'exact' })
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ message: 'Message deleted' });
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        getFallbackStore().contacts = getFallbackStore().contacts.filter((item) => item._id !== req.params.id);
        return res.json({ message: 'Message deleted' });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
