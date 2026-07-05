import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

export const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (isFallbackMode()) {
      await seedFallbackData();
      const admin = getFallbackStore().admin;
      const isMatch = await bcrypt.compare(password, admin.password);
      if (username !== admin.username || !isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ username: admin.username }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
      return res.json({ token, admin: { username: admin.username } });
    }

    try {
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;

      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
      return res.json({ token, admin: { username: admin.username } });
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory store.');
        setFallbackMode(true);
        await seedFallbackData();
        const admin = getFallbackStore().admin;
        const isMatch = await bcrypt.compare(password, admin.password);
        if (username !== admin.username || !isMatch) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ username: admin.username }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
        return res.json({ token, admin: { username: admin.username } });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const updateAdminCredentials = async (req, res, next) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required' });
    }

    if (!newUsername && !newPassword) {
      return res.status(400).json({ message: 'Provide a new username or password' });
    }

    if (isFallbackMode()) {
      await seedFallbackData();
      const admin = getFallbackStore().admin;
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      const updates = {};
      if (newUsername && newUsername.trim()) {
        updates.username = newUsername.trim();
      }
      if (newPassword && newPassword.trim()) {
        updates.password = await bcrypt.hash(newPassword.trim(), 10);
      }

      const updatedAdmin = { ...admin, ...updates };
      getFallbackStore().admin = updatedAdmin;
      return res.json({ message: 'Admin credentials updated successfully', admin: { username: updatedAdmin.username } });
    }

    try {
      const adminId = req.admin?.id;
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', adminId)
        .maybeSingle();

      if (error) throw error;
      if (!admin) {
        return res.status(404).json({ message: 'Admin account not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      const updates = {};

      if (newUsername && newUsername.trim()) {
        const { data: existing, error: existingError } = await supabase
          .from('admins')
          .select('id')
          .eq('username', newUsername.trim())
          .neq('id', adminId)
          .maybeSingle();

        if (existingError) throw existingError;
        if (existing) {
          return res.status(409).json({ message: 'Username already taken' });
        }
        updates.username = newUsername.trim();
      }

      if (newPassword && newPassword.trim()) {
        updates.password = await bcrypt.hash(newPassword.trim(), 10);
      }

      const { error: updateError } = await supabase
        .from('admins')
        .update(updates)
        .eq('id', adminId);

      if (updateError) throw updateError;

      return res.json({ message: 'Admin credentials updated successfully', admin: { username: updates.username || admin.username } });
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable during credential update. Falling back to in-memory.');
        setFallbackMode(true);
        await seedFallbackData();
        const admin = getFallbackStore().admin;
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const updates = {};
        if (newUsername && newUsername.trim()) {
          updates.username = newUsername.trim();
        }
        if (newPassword && newPassword.trim()) {
          updates.password = await bcrypt.hash(newPassword.trim(), 10);
        }

        const updatedAdmin = { ...admin, ...updates };
        getFallbackStore().admin = updatedAdmin;
        return res.json({ message: 'Admin credentials updated successfully', admin: { username: updatedAdmin.username } });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const seedAdmin = async () => {
  if (isFallbackMode()) {
    await seedFallbackData();
    return;
  }

  try {
    const { data: existing, error } = await supabase
      .from('admins')
      .select('id')
      .eq('username', 'admin')
      .maybeSingle();

    if (error) throw error;
    if (existing) return;

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const { error: insertError } = await supabase
      .from('admins')
      .insert({ username: 'admin', password: hashedPassword });

    if (insertError) throw insertError;
    console.log('Seeded default admin user successfully.');
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      console.warn('Supabase database unavailable during seeding. Falling back to in-memory.');
      setFallbackMode(true);
      await seedFallbackData();
    } else {
      console.error('Error seeding default admin:', error.message);
    }
  }
};
