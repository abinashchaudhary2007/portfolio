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
    techStack: row.tech_stack || [],
    githubUrl: row.github_url,
    liveUrl: row.live_url,
    createdAt: row.created_at || row.createdAt
  };
};

const parseTechStack = (tech) => {
  if (!tech) return [];
  if (Array.isArray(tech)) return tech;
  return tech.split(',').map(t => t.trim()).filter(Boolean);
};

export const getProjects = async (req, res, next) => {
  try {
    if (isFallbackMode()) {
      await seedFallbackData();
      return res.json(getFallbackStore().projects);
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json((data || []).map(mapRow));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        await seedFallbackData();
        return res.json(getFallbackStore().projects);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { title, description, techStack, githubUrl, liveUrl, featured } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const parsedTech = parseTechStack(techStack);
    const isFeatured = featured === 'true' || featured === true;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (isFallbackMode()) {
      const project = {
        _id: `project-${Date.now()}`,
        title,
        description,
        techStack: parsedTech,
        githubUrl,
        liveUrl,
        image: imageUrl,
        featured: isFeatured,
        createdAt: new Date().toISOString(),
      };
      getFallbackStore().projects.unshift(project);
      return res.status(201).json(project);
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          tech_stack: parsedTech,
          github_url: githubUrl,
          live_url: liveUrl,
          image: imageUrl,
          featured: isFeatured,
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(mapRow(data));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        const project = {
          _id: `project-${Date.now()}`,
          title,
          description,
          techStack: parsedTech,
          githubUrl,
          liveUrl,
          image: imageUrl,
          featured: isFeatured,
          createdAt: new Date().toISOString(),
        };
        getFallbackStore().projects.unshift(project);
        return res.status(201).json(project);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const parsedTech = req.body.techStack ? parseTechStack(req.body.techStack) : undefined;
    const isFeatured = req.body.featured !== undefined ? (req.body.featured === 'true' || req.body.featured === true) : undefined;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (isFallbackMode()) {
      const project = getFallbackStore().projects.find((item) => item._id === req.params.id);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      
      const updateData = { ...req.body };
      if (parsedTech !== undefined) updateData.techStack = parsedTech;
      if (isFeatured !== undefined) updateData.featured = isFeatured;
      if (imageUrl !== undefined) updateData.image = imageUrl;
      
      Object.assign(project, updateData);
      return res.json(project);
    }

    try {
      // Find the project first to ensure it exists
      const { data: project, error: getErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();

      if (getErr) throw getErr;
      if (!project) return res.status(404).json({ message: 'Project not found' });

      const updates = {
        title: req.body.title || project.title,
        description: req.body.description || project.description,
        github_url: req.body.githubUrl !== undefined ? req.body.githubUrl : project.github_url,
        live_url: req.body.liveUrl !== undefined ? req.body.liveUrl : project.live_url,
      };

      if (parsedTech !== undefined) updates.tech_stack = parsedTech;
      if (isFeatured !== undefined) updates.featured = isFeatured;
      if (imageUrl !== undefined) updates.image = imageUrl;

      const { data: updatedProject, error: updateErr } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      res.json(mapRow(updatedProject));
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        const project = getFallbackStore().projects.find((item) => item._id === req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        
        const updateData = { ...req.body };
        if (parsedTech !== undefined) updateData.techStack = parsedTech;
        if (isFeatured !== undefined) updateData.featured = isFeatured;
        if (imageUrl !== undefined) updateData.image = imageUrl;
        
        Object.assign(project, updateData);
        return res.json(project);
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    if (isFallbackMode()) {
      getFallbackStore().projects = getFallbackStore().projects.filter((item) => item._id !== req.params.id);
      return res.json({ message: 'Project deleted' });
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ message: 'Project deleted' });
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        console.warn('Supabase database unavailable. Falling back to in-memory.');
        setFallbackMode(true);
        getFallbackStore().projects = getFallbackStore().projects.filter((item) => item._id !== req.params.id);
        return res.json({ message: 'Project deleted' });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
