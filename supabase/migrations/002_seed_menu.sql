-- ============================================================
-- Seed: Initial Menu Data
-- ============================================================
--
-- UUID Legend
--   Categories          Modifier Groups
--   ──────────────────  ────────────────────────────────────
--   breakfast  1001     protein   2001    size      2005
--   lunch      1002     spice     2002    flavor    2006
--   dinner     1003     side      2003    extras    2007
--                       addons    2004    quantity  2008
--
--   Full UUIDs follow the pattern:
--     categories      → 11111111-0000-0000-0000-00000000{id}
--     modifier_groups → 22222222-0000-0000-0000-00000000{id}
-- ============================================================


-- ─── Categories ──────────────────────────────────────────────

insert into public.categories (id, name, description, display_order) values
  ('11111111-0000-0000-0000-000000000001', 'Breakfast', 'Start your day with authentic flavors', 1),
  ('11111111-0000-0000-0000-000000000002', 'Lunch',     'Hearty midday meals',                   2),
  ('11111111-0000-0000-0000-000000000003', 'Dinner',    'Evening favorites',                     3);


-- ─── Modifier Groups ─────────────────────────────────────────

insert into public.modifier_groups
  (id, name, selection_type, is_required, min_selections, max_selections, display_order)
values
  -- id    name            type        req    min  max   ord
  ('22222222-0000-0000-0000-000000000001', 'Protein',     'single',   true,  1, 1,    1),
  ('22222222-0000-0000-0000-000000000002', 'Spice Level', 'single',   true,  1, 1,    2),
  ('22222222-0000-0000-0000-000000000003', 'Side',        'single',   false, 0, 1,    3),
  ('22222222-0000-0000-0000-000000000004', 'Add-ons',     'multiple', false, 0, null, 4),
  ('22222222-0000-0000-0000-000000000005', 'Size',        'single',   true,  1, 1,    1),
  ('22222222-0000-0000-0000-000000000006', 'Flavor',      'single',   true,  1, 1,    1),
  ('22222222-0000-0000-0000-000000000007', 'Extras',      'multiple', false, 0, null, 2),
  ('22222222-0000-0000-0000-000000000008', 'Quantity',    'single',   true,  1, 1,    1);


-- ─── Modifier Options ────────────────────────────────────────

-- Spice Level (2002)
insert into public.modifier_options (modifier_group_id, name, price_delta, is_default, display_order) values
  ('22222222-0000-0000-0000-000000000002', 'Mild',      0, true,  1),
  ('22222222-0000-0000-0000-000000000002', 'Medium',    0, false, 2),
  ('22222222-0000-0000-0000-000000000002', 'Hot',       0, false, 3),
  ('22222222-0000-0000-0000-000000000002', 'Extra Hot', 0, false, 4);

-- Side (2003)
insert into public.modifier_options (modifier_group_id, name, price_delta, is_default, display_order) values
  ('22222222-0000-0000-0000-000000000003', 'Rice',    0, true,  1),
  ('22222222-0000-0000-0000-000000000003', 'Pasta',   0, false, 2),
  ('22222222-0000-0000-0000-000000000003', 'Salad',   0, false, 3),
  ('22222222-0000-0000-0000-000000000003', 'Anjeero', 0, false, 4);

-- Add-ons (2004)
insert into public.modifier_options (modifier_group_id, name, price_delta, is_default, display_order) values
  ('22222222-0000-0000-0000-000000000004', 'Extra Sauce', 0.50, false, 1),
  ('22222222-0000-0000-0000-000000000004', 'Extra Salad', 1.00, false, 2),
  ('22222222-0000-0000-0000-000000000004', 'Side Salad',  2.50, false, 3),
  ('22222222-0000-0000-0000-000000000004', 'Bread',       1.00, false, 4);

-- Size (2005)
insert into public.modifier_options (modifier_group_id, name, price_delta, is_default, display_order) values
  ('22222222-0000-0000-0000-000000000005', 'Small (12oz)',  0,    true,  1),
  ('22222222-0000-0000-0000-000000000005', 'Medium (16oz)', 1.00, false, 2),
  ('22222222-0000-0000-0000-000000000005', 'Large (24oz)',  2.00, false, 3);

-- Flavor (2006)
insert into public.modifier_options (modifier_group_id, name, price_delta, is_default, display_order) values
  ('22222222-0000-0000-0000-000000000006', 'Mango',        0, true,  1),
  ('22222222-0000-0000-0000-000000000006', 'Avocado',      0, false, 2),
  ('22222222-0000-0000-0000-000000000006', 'Papaya',       0, false, 3),
  ('22222222-0000-0000-0000-000000000006', 'Mixed Fruit',  0, false, 4),
  ('22222222-0000-0000-0000-000000000006', 'Strawberry',   0, false, 5);

-- Extras / Shawarma (2007)
insert into public.modifier_options (modifier_group_id, name, price_delta, is_default, display_order) values
  ('22222222-0000-0000-0000-000000000007', 'Extra Meat',    3.00, false, 1),
  ('22222222-0000-0000-0000-000000000007', 'Extra Garlic',  0,    false, 2),
  ('22222222-0000-0000-0000-000000000007', 'Extra Veggies', 0.50, false, 3),
  ('22222222-0000-0000-0000-000000000007', 'Cheese',        1.00, false, 4);

-- Quantity / Sambuza (2008)
insert into public.modifier_options (modifier_group_id, name, price_delta, is_default, display_order) values
  ('22222222-0000-0000-0000-000000000008', '1 piece',  0,    true,  1),
  ('22222222-0000-0000-0000-000000000008', '3 pieces', 5.20, false, 2),
  ('22222222-0000-0000-0000-000000000008', '5 pieces', 7.50, false, 3);


-- ─── Menu Items ──────────────────────────────────────────────

insert into public.menu_items
  (name, description, price, category_id, display_order, tags)
values

  -- Breakfast (1001) ─────────────────────────────────────────
  ('Goat Liver',    'Tender goat liver cooked with traditional spices',     20.00, '11111111-0000-0000-0000-000000000001',  1, array['halal']),
  ('Beef Stew',     'Slow-cooked beef in rich aromatic sauce',              20.00, '11111111-0000-0000-0000-000000000001',  2, array['halal']),
  ('Ful',           'Traditional fava bean stew with spices and olive oil', 20.00, '11111111-0000-0000-0000-000000000001',  3, array['halal','vegetarian']),
  ('Chicken Stew',  'Tender chicken simmered in flavorful sauce',           20.00, '11111111-0000-0000-0000-000000000001',  4, array['halal']),
  ('Beef KK',       'Beef prepared in our signature KK style',              22.50, '11111111-0000-0000-0000-000000000001',  5, array['halal']),
  ('Chicken KK',    'Chicken prepared in our signature KK style',           22.50, '11111111-0000-0000-0000-000000000001',  6, array['halal']),
  ('Quesadilla',    'Crispy flatbread with savory filling',                 15.00, '11111111-0000-0000-0000-000000000001',  7, array[]::text[]),
  ('Malawax',       'Sweet Somali pancake, soft and spongy',                 1.30, '11111111-0000-0000-0000-000000000001',  8, array['vegetarian']),
  ('Smoothie',      'Fresh blended fruit smoothie',                          4.50, '11111111-0000-0000-0000-000000000001',  9, array['vegan','vegetarian']),
  ('Mango Juice',   'Fresh pressed mango juice',                             4.50, '11111111-0000-0000-0000-000000000001', 10, array['vegan','vegetarian']),
  ('Avocado Juice', 'Creamy fresh avocado blend',                            4.50, '11111111-0000-0000-0000-000000000001', 11, array['vegan','vegetarian']),
  ('Papaya Juice',  'Sweet tropical papaya juice',                           4.50, '11111111-0000-0000-0000-000000000001', 12, array['vegan','vegetarian']),
  ('Mix Juice',     'Blend of seasonal fresh fruits',                        4.50, '11111111-0000-0000-0000-000000000001', 13, array['vegan','vegetarian']),

  -- Lunch (1002) ─────────────────────────────────────────────
  ('Grilled Chicken Steak With Rice', 'Juicy grilled chicken served with seasoned rice',   22.50, '11111111-0000-0000-0000-000000000002',  1, array['halal']),
  ('Curry Rice',                      'Fragrant curry sauce over fluffy rice',              13.75, '11111111-0000-0000-0000-000000000002',  2, array['vegetarian']),
  ('Pasta Saldato',                   'Pasta in our special house sauce',                  13.75, '11111111-0000-0000-0000-000000000002',  3, array[]::text[]),
  ('Biryani Rice',                    'Aromatic spiced rice with herbs',                   15.00, '11111111-0000-0000-0000-000000000002',  4, array['halal']),
  ('Beef Kalankal With Rice',         'Grilled beef cubes served with rice',               22.50, '11111111-0000-0000-0000-000000000002',  5, array['halal']),
  ('Chicken Kalankal Rice',           'Grilled chicken cubes served with rice',            22.50, '11111111-0000-0000-0000-000000000002',  6, array['halal']),
  ('Beef Steak With Rice',            'Tender beef steak with seasoned rice',              23.75, '11111111-0000-0000-0000-000000000002',  7, array['halal']),
  ('Falafel Pasta/Rice',              'Crispy falafel with your choice of pasta or rice',  29.00, '11111111-0000-0000-0000-000000000002',  8, array['vegetarian']),
  ('Chicken Legs With Rice',          'Roasted chicken legs served with rice',             22.50, '11111111-0000-0000-0000-000000000002',  9, array['halal']),
  ('Salmon Fish',                     'Fresh salmon fillet, grilled to perfection',        25.00, '11111111-0000-0000-0000-000000000002', 10, array[]::text[]),
  ('Fish Salad',                      'Fresh fish over crisp garden salad',                25.00, '11111111-0000-0000-0000-000000000002', 11, array[]::text[]),
  ('Traditional Soup',                'Hearty traditional soup recipe',                     2.00, '11111111-0000-0000-0000-000000000002', 12, array['halal']),
  ('Family Size',                     'Large portion perfect for sharing',                 51.25, '11111111-0000-0000-0000-000000000002', 13, array['halal']),
  ('Veggie Soup',                     'Fresh vegetable soup',                               2.00, '11111111-0000-0000-0000-000000000002', 14, array['vegan','vegetarian']),
  ('Anjeero Ethiopian',               'Ethiopian-style injera platter',                    25.50, '11111111-0000-0000-0000-000000000002', 15, array['halal']),
  ('Grilled Goat',                    'Tender goat meat grilled with spices',              24.70, '11111111-0000-0000-0000-000000000002', 16, array['halal']),
  ('Sambuza Chicken',                 'Crispy pastry filled with spiced chicken',           2.60, '11111111-0000-0000-0000-000000000002', 17, array['halal']),
  ('Sambuza Beef',                    'Crispy pastry filled with spiced beef',              2.60, '11111111-0000-0000-0000-000000000002', 18, array['halal']),
  ('Malawax',                         'Sweet Somali pancake, soft and spongy',              1.30, '11111111-0000-0000-0000-000000000002', 19, array['vegetarian']),
  ('Smoothie',                        'Fresh blended fruit smoothie',                       4.50, '11111111-0000-0000-0000-000000000002', 20, array['vegan','vegetarian']),
  ('Mango Juice',                     'Fresh pressed mango juice',                          4.50, '11111111-0000-0000-0000-000000000002', 21, array['vegan','vegetarian']),
  ('Avocado Juice',                   'Creamy fresh avocado blend',                         4.50, '11111111-0000-0000-0000-000000000002', 22, array['vegan','vegetarian']),
  ('Watermelon Juice',                'Refreshing watermelon juice',                        4.50, '11111111-0000-0000-0000-000000000002', 23, array['vegan','vegetarian']),
  ('Papaya Juice',                    'Sweet tropical papaya juice',                        4.50, '11111111-0000-0000-0000-000000000002', 24, array['vegan','vegetarian']),
  ('Mix Juice',                       'Blend of seasonal fresh fruits',                     4.50, '11111111-0000-0000-0000-000000000002', 25, array['vegan','vegetarian']),

  -- Dinner (1003) ────────────────────────────────────────────
  ('Beef Shawarma',    'Seasoned beef wrapped in fresh bread',        17.50, '11111111-0000-0000-0000-000000000003',  1, array['halal']),
  ('Pasta Special',    'Chef''s special pasta creation',              15.00, '11111111-0000-0000-0000-000000000003',  2, array[]::text[]),
  ('Beef Sandwich',    'Tender beef in fresh baked bread',            16.25, '11111111-0000-0000-0000-000000000003',  3, array['halal']),
  ('Mufo Paradise',    'Our signature Paradise specialty dish',       23.75, '11111111-0000-0000-0000-000000000003',  4, array['halal']),
  ('Chicken Sandwich', 'Grilled chicken in fresh baked bread',        16.25, '11111111-0000-0000-0000-000000000003',  5, array['halal']),
  ('Chicken Shawarma', 'Seasoned chicken wrapped in fresh bread',     17.50, '11111111-0000-0000-0000-000000000003',  6, array['halal']),
  ('Beef Stew',        'Slow-cooked beef in rich aromatic sauce',     20.00, '11111111-0000-0000-0000-000000000003',  7, array['halal']),
  ('Chicken Stew',     'Tender chicken simmered in flavorful sauce',  20.00, '11111111-0000-0000-0000-000000000003',  8, array['halal']),
  ('Grilled Goat',     'Tender goat meat grilled with spices',        24.70, '11111111-0000-0000-0000-000000000003',  9, array['halal']),
  ('Malawax',          'Sweet Somali pancake, soft and spongy',        1.30, '11111111-0000-0000-0000-000000000003', 10, array['vegetarian']),
  ('Mango Juice',      'Fresh pressed mango juice',                    4.50, '11111111-0000-0000-0000-000000000003', 11, array['vegan','vegetarian']),
  ('Avocado Juice',    'Creamy fresh avocado blend',                   4.50, '11111111-0000-0000-0000-000000000003', 12, array['vegan','vegetarian']),
  ('Papaya Juice',     'Sweet tropical papaya juice',                  4.50, '11111111-0000-0000-0000-000000000003', 13, array['vegan','vegetarian']),
  ('Mix Juice',        'Blend of seasonal fresh fruits',               4.50, '11111111-0000-0000-0000-000000000003', 14, array['vegan','vegetarian']);


-- ─── Assign Modifier Groups to Menu Items ────────────────────

-- Spice level (2002) → stews, grilled meats, shawarmas
insert into public.menu_item_modifier_groups (menu_item_id, modifier_group_id, display_order)
select mi.id, '22222222-0000-0000-0000-000000000002', 1
from public.menu_items mi
where mi.name in (
  'Goat Liver', 'Beef Stew', 'Ful', 'Chicken Stew', 'Beef KK', 'Chicken KK',
  'Grilled Chicken Steak With Rice', 'Beef Kalankal With Rice', 'Chicken Kalankal Rice',
  'Beef Steak With Rice', 'Chicken Legs With Rice', 'Anjeero Ethiopian', 'Grilled Goat',
  'Beef Shawarma', 'Beef Sandwich', 'Chicken Sandwich', 'Chicken Shawarma', 'Mufo Paradise'
);

-- Add-ons (2004) → main dishes
insert into public.menu_item_modifier_groups (menu_item_id, modifier_group_id, display_order)
select mi.id, '22222222-0000-0000-0000-000000000004', 2
from public.menu_items mi
where mi.name in (
  'Goat Liver', 'Beef Stew', 'Chicken Stew', 'Beef KK', 'Chicken KK',
  'Grilled Chicken Steak With Rice', 'Beef Kalankal With Rice', 'Chicken Kalankal Rice',
  'Beef Steak With Rice', 'Chicken Legs With Rice', 'Anjeero Ethiopian', 'Grilled Goat'
);

-- Extras (2007) → shawarmas & sandwiches
insert into public.menu_item_modifier_groups (menu_item_id, modifier_group_id, display_order)
select mi.id, '22222222-0000-0000-0000-000000000007', 2
from public.menu_items mi
where mi.name in ('Beef Shawarma', 'Chicken Shawarma', 'Beef Sandwich', 'Chicken Sandwich');

-- Size (2005) → juices
insert into public.menu_item_modifier_groups (menu_item_id, modifier_group_id, display_order)
select mi.id, '22222222-0000-0000-0000-000000000005', 1
from public.menu_items mi
where mi.name in ('Mango Juice', 'Avocado Juice', 'Papaya Juice', 'Mix Juice', 'Watermelon Juice');

-- Flavor (2006) → smoothies
insert into public.menu_item_modifier_groups (menu_item_id, modifier_group_id, display_order)
select mi.id, '22222222-0000-0000-0000-000000000006', 1
from public.menu_items mi
where mi.name = 'Smoothie';

-- Quantity (2008) → sambuza
insert into public.menu_item_modifier_groups (menu_item_id, modifier_group_id, display_order)
select mi.id, '22222222-0000-0000-0000-000000000008', 1
from public.menu_items mi
where mi.name in ('Sambuza Chicken', 'Sambuza Beef');

-- Side (2003) → falafel
insert into public.menu_item_modifier_groups (menu_item_id, modifier_group_id, display_order)
select mi.id, '22222222-0000-0000-0000-000000000003', 1
from public.menu_items mi
where mi.name = 'Falafel Pasta/Rice';
