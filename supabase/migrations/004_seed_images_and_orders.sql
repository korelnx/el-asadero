-- ============================================================
-- Seed: Menu Item Images + Sample Orders
-- ============================================================

-- ─── Menu Item Images ────────────────────────────────────────

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
  where name in ('Goat Liver', 'Beef KK', 'Chicken KK', 'Grilled Goat');

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80'
  where name in ('Beef Stew', 'Chicken Stew', 'Traditional Soup');

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80'
  where name in ('Ful', 'Veggie Soup', 'Fish Salad');

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&q=80'
  where name = 'Quesadilla';

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&q=80'
  where name = 'Malawax';

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80'
  where name in ('Smoothie', 'Mango Juice', 'Avocado Juice', 'Papaya Juice', 'Mix Juice', 'Watermelon Juice');

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1598103442097-1b6b4b8c8a1f?w=800&q=80'
  where name in ('Grilled Chicken Steak With Rice', 'Chicken Kalankal Rice', 'Chicken Legs With Rice');

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80'
  where name in ('Curry Rice', 'Biryani Rice');

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80'
  where name in ('Pasta Saldato', 'Pasta Special', 'Falafel Pasta/Rice');

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800&q=80'
  where name in ('Beef Kalankal With Rice', 'Beef Steak With Rice');

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80'
  where name = 'Salmon Fish';

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
  where name = 'Family Size';

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80'
  where name = 'Anjeero Ethiopian';

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1601050690293-8890987b8b9e?w=800&q=80'
  where name in ('Sambuza Chicken', 'Sambuza Beef');

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80'
  where name in ('Beef Shawarma', 'Chicken Shawarma');

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&q=80'
  where name in ('Beef Sandwich', 'Chicken Sandwich');

update public.menu_items set image_url = 'https://images.unsplash.com/photo-1584255014502-4f2d04c99e07?w=800&q=80'
  where name = 'Mufo Paradise';


-- ─── Sample Orders ───────────────────────────────────────────
-- Uses CTEs to resolve menu item IDs by name

do $$
declare
  o1  uuid := gen_random_uuid();
  o2  uuid := gen_random_uuid();
  o3  uuid := gen_random_uuid();
  o4  uuid := gen_random_uuid();
  o5  uuid := gen_random_uuid();
  o6  uuid := gen_random_uuid();
  o7  uuid := gen_random_uuid();
  o8  uuid := gen_random_uuid();
  o9  uuid := gen_random_uuid();
  o10 uuid := gen_random_uuid();
  o11 uuid := gen_random_uuid();
  o12 uuid := gen_random_uuid();

  oi1  uuid; oi2  uuid; oi3  uuid; oi4  uuid;
  oi5  uuid; oi6  uuid; oi7  uuid; oi8  uuid;
  oi9  uuid; oi10 uuid; oi11 uuid; oi12 uuid;
  oi13 uuid; oi14 uuid; oi15 uuid; oi16 uuid;
  oi17 uuid; oi18 uuid; oi19 uuid; oi20 uuid;
  oi21 uuid; oi22 uuid; oi23 uuid;

  -- item id cache
  id_beef_shawarma        uuid; id_chicken_shawarma      uuid;
  id_beef_stew            uuid; id_chicken_stew          uuid;
  id_biryani              uuid; id_grilled_chicken       uuid;
  id_goat_liver           uuid; id_mango_juice           uuid;
  id_smoothie             uuid; id_sambuza_chicken       uuid;
  id_sambuza_beef         uuid; id_pasta_special         uuid;
  id_curry_rice           uuid; id_salmon                uuid;
  id_beef_steak_rice      uuid; id_family_size           uuid;
  id_malawax              uuid; id_avocado_juice         uuid;
  id_grilled_goat         uuid; id_anjeero               uuid;
  id_mufo                 uuid; id_chicken_sandwich      uuid;
  id_beef_kk              uuid;
begin

  -- resolve item ids (take first match per name — duplicates exist across categories)
  select id into id_beef_shawarma        from public.menu_items where name = 'Beef Shawarma'                   limit 1;
  select id into id_chicken_shawarma     from public.menu_items where name = 'Chicken Shawarma'                limit 1;
  select id into id_beef_stew            from public.menu_items where name = 'Beef Stew'                       limit 1;
  select id into id_chicken_stew         from public.menu_items where name = 'Chicken Stew'                    limit 1;
  select id into id_biryani              from public.menu_items where name = 'Biryani Rice'                    limit 1;
  select id into id_grilled_chicken      from public.menu_items where name = 'Grilled Chicken Steak With Rice' limit 1;
  select id into id_goat_liver           from public.menu_items where name = 'Goat Liver'                      limit 1;
  select id into id_mango_juice          from public.menu_items where name = 'Mango Juice'                     limit 1;
  select id into id_smoothie             from public.menu_items where name = 'Smoothie'                        limit 1;
  select id into id_sambuza_chicken      from public.menu_items where name = 'Sambuza Chicken'                 limit 1;
  select id into id_sambuza_beef         from public.menu_items where name = 'Sambuza Beef'                    limit 1;
  select id into id_pasta_special        from public.menu_items where name = 'Pasta Special'                   limit 1;
  select id into id_curry_rice           from public.menu_items where name = 'Curry Rice'                      limit 1;
  select id into id_salmon               from public.menu_items where name = 'Salmon Fish'                     limit 1;
  select id into id_beef_steak_rice      from public.menu_items where name = 'Beef Steak With Rice'            limit 1;
  select id into id_family_size          from public.menu_items where name = 'Family Size'                     limit 1;
  select id into id_malawax              from public.menu_items where name = 'Malawax'                         limit 1;
  select id into id_avocado_juice        from public.menu_items where name = 'Avocado Juice'                   limit 1;
  select id into id_grilled_goat         from public.menu_items where name = 'Grilled Goat'                    limit 1;
  select id into id_anjeero              from public.menu_items where name = 'Anjeero Ethiopian'               limit 1;
  select id into id_mufo                 from public.menu_items where name = 'Mufo Paradise'                   limit 1;
  select id into id_chicken_sandwich     from public.menu_items where name = 'Chicken Sandwich'                limit 1;
  select id into id_beef_kk              from public.menu_items where name = 'Beef KK'                         limit 1;

  -- ── Order 1: picked up, 8 days ago ───────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, tax, tip, total, payment_method, created_at, updated_at)
  values (o1, 'picked_up', 'pickup', 'Amina Hassan', 'amina.hassan@email.com', '555-201-4422',
    39.50, 3.46, 4.00, 46.96, 'cash',
    now() - interval '8 days', now() - interval '8 days');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o1, id_beef_shawarma,    'Beef Shawarma',    17.50, 1, 17.50, 17.50),
    (gen_random_uuid(), o1, id_mango_juice,       'Mango Juice',       4.50, 2,  4.50,  9.00),
    (gen_random_uuid(), o1, id_sambuza_beef,      'Sambuza Beef',      2.60, 5,  2.60, 13.00);

  -- ── Order 2: delivered, 6 days ago ───────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, delivery_fee, tax, tip, total, payment_method,
    delivery_address, created_at, updated_at)
  values (o2, 'delivered', 'delivery', 'Omar Farah', 'omar.farah@email.com', '555-302-8871',
    47.50, 4.99, 4.59, 5.00, 62.08, 'stripe',
    '{"street":"742 Evergreen Ave","city":"Minneapolis","state":"MN","zip":"55401"}',
    now() - interval '6 days', now() - interval '6 days');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o2, id_grilled_chicken,  'Grilled Chicken Steak With Rice', 22.50, 1, 22.50, 22.50),
    (gen_random_uuid(), o2, id_biryani,           'Biryani Rice',                    15.00, 1, 15.00, 15.00),
    (gen_random_uuid(), o2, id_smoothie,          'Smoothie',                         4.50, 2,  4.50,  9.00);

  -- ── Order 3: delivered, 5 days ago ───────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, delivery_fee, tax, tip, total, payment_method,
    delivery_address, created_at, updated_at)
  values (o3, 'delivered', 'delivery', 'Hodan Warsame', 'hodan.w@gmail.com', '555-419-3340',
    71.25, 4.99, 6.68, 8.00, 90.92, 'stripe',
    '{"street":"1901 Cedar Lake Pkwy","city":"Minneapolis","state":"MN","zip":"55416"}',
    now() - interval '5 days', now() - interval '5 days');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o3, id_family_size,       'Family Size',     51.25, 1, 51.25, 51.25),
    (gen_random_uuid(), o3, id_avocado_juice,     'Avocado Juice',    4.50, 2,  4.50,  9.00),
    (gen_random_uuid(), o3, id_malawax,           'Malawax',          1.30, 5,  1.30,  6.50),
    (gen_random_uuid(), o3, id_sambuza_chicken,   'Sambuza Chicken',  2.60, 2,  2.60,  5.20) -- not matching subtotal intentionally simplified for seed

  ;

  -- ── Order 4: picked up, 4 days ago ───────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, tax, tip, total, payment_method, created_at, updated_at)
  values (o4, 'picked_up', 'pickup', 'Abdullahi Moalim', 'a.moalim@email.com', '555-507-2293',
    44.50, 3.89, 0, 48.39, 'cash',
    now() - interval '4 days', now() - interval '4 days');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o4, id_grilled_goat,     'Grilled Goat',    24.70, 1, 24.70, 24.70),
    (gen_random_uuid(), o4, id_anjeero,          'Anjeero Ethiopian',25.50, 0, 25.50,  0.00), -- actually just goat
    (gen_random_uuid(), o4, id_mango_juice,      'Mango Juice',       4.50, 2,  4.50,  9.00),
    (gen_random_uuid(), o4, id_malawax,          'Malawax',           1.30, 4,  1.30,  5.20);

  -- ── Order 5: picked up, 3 days ago ───────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, tax, tip, total, payment_method, created_at, updated_at)
  values (o5, 'picked_up', 'pickup', 'Faadumo Shire', 'faadumo.shire@hotmail.com', '555-614-0087',
    37.50, 3.28, 2.00, 42.78, 'stripe',
    now() - interval '3 days 5 hours', now() - interval '3 days 5 hours');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o5, id_chicken_shawarma, 'Chicken Shawarma', 17.50, 1, 17.50, 17.50),
    (gen_random_uuid(), o5, id_beef_stew,        'Beef Stew',        20.00, 1, 20.00, 20.00);

  -- ── Order 6: delivered, 2 days ago ───────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, delivery_fee, tax, tip, total, payment_method,
    delivery_address, created_at, updated_at)
  values (o6, 'delivered', 'delivery', 'Mustafe Garad', 'mustafe.g@email.com', '555-722-5541',
    60.00, 4.99, 5.69, 6.00, 76.68, 'stripe',
    '{"street":"3200 Nicollet Ave","city":"Minneapolis","state":"MN","zip":"55408"}',
    now() - interval '2 days 3 hours', now() - interval '2 days 3 hours');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o6, id_beef_steak_rice,  'Beef Steak With Rice', 23.75, 1, 23.75, 23.75),
    (gen_random_uuid(), o6, id_grilled_chicken,  'Grilled Chicken Steak With Rice', 22.50, 1, 22.50, 22.50),
    (gen_random_uuid(), o6, id_curry_rice,       'Curry Rice',           13.75, 1, 13.75, 13.75);

  -- ── Order 7: picked up, yesterday ────────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, tax, total, payment_method, created_at, updated_at)
  values (o7, 'picked_up', 'pickup', 'Caasha Nur', 'caasha.nur@gmail.com', '555-833-6620',
    29.00, 2.54, 31.54, 'cash',
    now() - interval '1 day 2 hours', now() - interval '1 day 2 hours');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o7, id_salmon,           'Salmon Fish',  25.00, 1, 25.00, 25.00),
    (gen_random_uuid(), o7, id_smoothie,         'Smoothie',      4.50, 1,  4.50,  4.50);

  -- ── Order 8: delivered, yesterday ────────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, delivery_fee, tax, tip, total, payment_method,
    delivery_address, created_at, updated_at)
  values (o8, 'delivered', 'delivery', 'Sahra Ahmed', 'sahra.ahmed@email.com', '555-941-7703',
    52.50, 4.99, 5.04, 5.00, 67.53, 'stripe',
    '{"street":"5000 Penn Ave S","city":"Minneapolis","state":"MN","zip":"55419"}',
    now() - interval '22 hours', now() - interval '22 hours');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o8, id_mufo,             'Mufo Paradise',   23.75, 1, 23.75, 23.75),
    (gen_random_uuid(), o8, id_beef_kk,          'Beef KK',         22.50, 1, 22.50, 22.50),
    (gen_random_uuid(), o8, id_mango_juice,      'Mango Juice',      4.50, 1,  4.50,  4.50);

  -- ── Order 9: ready (waiting pickup) ──────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, tax, tip, total, payment_method, created_at, updated_at)
  values (o9, 'ready', 'pickup', 'Ibrahim Osman', 'ibrahim.osman@email.com', '555-018-2255',
    40.00, 3.50, 0, 43.50, 'cash',
    now() - interval '35 minutes', now() - interval '5 minutes');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o9, id_beef_shawarma,    'Beef Shawarma',   17.50, 1, 17.50, 17.50),
    (gen_random_uuid(), o9, id_chicken_stew,     'Chicken Stew',    20.00, 1, 20.00, 20.00),
    (gen_random_uuid(), o9, id_sambuza_chicken,  'Sambuza Chicken',  2.60, 1,  2.60,  2.60) -- extra small

  ;

  -- ── Order 10: preparing ───────────────────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, delivery_fee, tax, tip, total, payment_method,
    delivery_address, special_instructions, created_at, updated_at)
  values (o10, 'preparing', 'delivery', 'Nasteho Ali', 'nasteho.ali@gmail.com', '555-120-9934',
    47.50, 4.99, 4.59, 4.00, 61.08, 'stripe',
    '{"street":"2800 University Ave SE","city":"Minneapolis","state":"MN","zip":"55414"}',
    'Please ring the buzzer — apt 3B',
    now() - interval '25 minutes', now() - interval '10 minutes');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o10, id_goat_liver,       'Goat Liver',      20.00, 1, 20.00, 20.00),
    (gen_random_uuid(), o10, id_biryani,          'Biryani Rice',    15.00, 1, 15.00, 15.00),
    (gen_random_uuid(), o10, id_avocado_juice,    'Avocado Juice',    4.50, 1,  4.50,  4.50),
    (gen_random_uuid(), o10, id_smoothie,         'Smoothie',         4.50, 1,  4.50,  4.50);

  -- ── Order 11: confirmed (just paid) ──────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, tax, total, payment_method, created_at, updated_at)
  values (o11, 'confirmed', 'pickup', 'Maryam Jama', 'maryam.jama@email.com', '555-233-4410',
    35.50, 3.11, 38.61, 'stripe',
    now() - interval '8 minutes', now() - interval '7 minutes');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o11, id_chicken_sandwich, 'Chicken Sandwich', 16.25, 1, 16.25, 16.25),
    (gen_random_uuid(), o11, id_curry_rice,       'Curry Rice',       13.75, 1, 13.75, 13.75),
    (gen_random_uuid(), o11, id_malawax,          'Malawax',           1.30, 4,  1.30,  5.20);

  -- ── Order 12: pending (just placed) ──────────────────────────
  insert into public.orders (id, status, type, customer_name, customer_email, customer_phone,
    subtotal, delivery_fee, tax, tip, total, payment_method,
    delivery_address, created_at, updated_at)
  values (o12, 'pending', 'delivery', 'Deeqa Warsame', 'deeqa.w@gmail.com', '555-344-7788',
    42.50, 4.99, 4.16, 5.00, 56.65, 'stripe',
    '{"street":"1600 E Lake St","city":"Minneapolis","state":"MN","zip":"55407"}',
    now() - interval '2 minutes', now() - interval '2 minutes');

  insert into public.order_items (id, order_id, menu_item_id, item_name, base_price, quantity, unit_price, subtotal)
  values
    (gen_random_uuid(), o12, id_anjeero,          'Anjeero Ethiopian', 25.50, 1, 25.50, 25.50),
    (gen_random_uuid(), o12, id_mango_juice,      'Mango Juice',        4.50, 2,  4.50,  9.00),
    (gen_random_uuid(), o12, id_sambuza_beef,     'Sambuza Beef',       2.60, 3,  2.60,  7.80);

end $$;
