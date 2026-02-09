-- ============================================
-- SECTION 13: SEED SYSTEM LAYOUTS
-- ============================================

INSERT INTO public.layouts (slug, name, description, is_system, sort_order) VALUES
  ('blank', 'Blank', 'Empty page with no photo zones', true, 0),
  ('single', 'Single', 'One large photo centered', true, 1),
  ('double', 'Double', 'Two photos side by side', true, 2),
  ('triple', 'Triple', 'One large photo with two smaller ones', true, 3),
  ('grid-4', 'Grid 4', '2x2 grid of equal photos', true, 4),
  ('grid-6', 'Grid 6', '2x3 grid of equal photos', true, 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 0, 'photo', 10, 10, 80, 80 FROM public.layouts WHERE slug = 'single'
ON CONFLICT (layout_id, zone_index) DO NOTHING;

INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 0, 'photo', 5, 10, 42.5, 80 FROM public.layouts WHERE slug = 'double'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 1, 'photo', 52.5, 10, 42.5, 80 FROM public.layouts WHERE slug = 'double'
ON CONFLICT (layout_id, zone_index) DO NOTHING;

INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 0, 'photo', 5, 10, 60, 80 FROM public.layouts WHERE slug = 'triple'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 1, 'photo', 70, 10, 25, 37.5 FROM public.layouts WHERE slug = 'triple'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 2, 'photo', 70, 52.5, 25, 37.5 FROM public.layouts WHERE slug = 'triple'
ON CONFLICT (layout_id, zone_index) DO NOTHING;

INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 0, 'photo', 5, 5, 42.5, 42.5 FROM public.layouts WHERE slug = 'grid-4'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 1, 'photo', 52.5, 5, 42.5, 42.5 FROM public.layouts WHERE slug = 'grid-4'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 2, 'photo', 5, 52.5, 42.5, 42.5 FROM public.layouts WHERE slug = 'grid-4'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 3, 'photo', 52.5, 52.5, 42.5, 42.5 FROM public.layouts WHERE slug = 'grid-4'
ON CONFLICT (layout_id, zone_index) DO NOTHING;

INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 0, 'photo', 5, 3, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 1, 'photo', 52.5, 3, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 2, 'photo', 5, 36, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 3, 'photo', 52.5, 36, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 4, 'photo', 5, 69, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 5, 'photo', 52.5, 69, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;

-- ============================================
-- SECTION 14: SEED TEMPLATE CATEGORIES
-- ============================================

INSERT INTO public.template_categories (slug, name, description, icon, sort_order) VALUES
  ('vacation', 'Vacation', 'Travel and adventure photobooks', 'Plane', 1),
  ('wedding', 'Wedding', 'Wedding and engagement memories', 'Heart', 2),
  ('baby', 'Baby & Family', 'Baby milestones and family moments', 'Baby', 3),
  ('birthday', 'Birthday', 'Birthday celebrations', 'Cake', 4),
  ('graduation', 'Graduation', 'Academic achievements', 'GraduationCap', 5),
  ('portfolio', 'Portfolio', 'Professional portfolios', 'Briefcase', 6),
  ('general', 'General', 'Multipurpose templates', 'Book', 7)
ON CONFLICT (slug) DO NOTHING;
