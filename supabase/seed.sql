-- ============================================================
-- All Eyes On Me — Seed Data
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ─── Step 1: Extend profiles table ───────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS follower_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── Step 2: Seed users ───────────────────────────────────────
-- Inserts directly into auth.users; the trigger auto-creates profiles.
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES
  ('aeom0001-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'antoine.dubois@seed.aeom', '', now(), now()-interval '5 months', now(),
   '{"username":"antoinedb"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, '','','',''),
  ('aeom0002-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'sophie.martin@seed.aeom', '', now(), now()-interval '4 months', now(),
   '{"username":"sophiemfit"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, '','','',''),
  ('aeom0003-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'lucas.bernard@seed.aeom', '', now(), now()-interval '4 months', now(),
   '{"username":"lucasbdev"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, '','','',''),
  ('aeom0004-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'camille.dupont@seed.aeom', '', now(), now()-interval '3 months', now(),
   '{"username":"camillecreates"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, '','','',''),
  ('aeom0005-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'maxime.leroy@seed.aeom', '', now(), now()-interval '3 months', now(),
   '{"username":"maxcoach"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, '','','',''),
  ('aeom0006-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'ines.moreau@seed.aeom', '', now(), now()-interval '2 months', now(),
   '{"username":"inesarch"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, '','','',''),
  ('aeom0007-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'thomas.girard@seed.aeom', '', now(), now()-interval '2 months', now(),
   '{"username":"thomasmusik"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, '','','',''),
  ('aeom0008-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'jade.petit@seed.aeom', '', now(), now()-interval '1 month', now(),
   '{"username":"jadedoc"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, '','','',''),
  ('aeom0009-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'hugo.roux@seed.aeom', '', now(), now()-interval '1 month', now(),
   '{"username":"hugorx"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, '','','',''),
  ('aeom000a-0000-0000-0000-00000000000a','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'lea.fontaine@seed.aeom', '', now(), now()-interval '3 weeks', now(),
   '{"username":"leaphoto"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, '','','','')
ON CONFLICT (id) DO NOTHING;

-- ─── Step 3: Update profiles with full data ───────────────────
UPDATE public.profiles SET
  bio = 'Co-fondateur d''une startup SaaS B2B à Lyon. Ex-ingénieur Thales, passionné par le product management et la croissance. En route vers le premier million.',
  avatar_url = 'https://i.pravatar.cc/150?img=11',
  follower_count = 4231, is_verified = TRUE, credits = 5000
WHERE id = 'aeom0001-0000-0000-0000-000000000001';

UPDATE public.profiles SET
  bio = 'Athlète amateur & coach fitness à Paris. Prépare son premier Ironman 70.3. Adepte du lever 5h du mat et des smoothies protéinés. 🏊‍♀️🚴‍♀️🏃‍♀️',
  avatar_url = 'https://i.pravatar.cc/150?img=1',
  follower_count = 12843, is_verified = TRUE, credits = 8000
WHERE id = 'aeom0002-0000-0000-0000-000000000002';

UPDATE public.profiles SET
  bio = 'Développeur full-stack indépendant, Bordeaux. Je construis un SaaS RH pour les PME françaises. TypeScript, Next.js, Supabase. Toujours en train de builder.',
  avatar_url = 'https://i.pravatar.cc/150?img=12',
  follower_count = 2156, is_verified = FALSE, credits = 3500
WHERE id = 'aeom0003-0000-0000-0000-000000000003';

UPDATE public.profiles SET
  bio = 'Créatrice de contenu lifestyle & voyage 🌍 Paris. Collaborations avec +40 marques. Je construis mon empire digital une story à la fois.',
  avatar_url = 'https://i.pravatar.cc/150?img=5',
  follower_count = 28574, is_verified = TRUE, credits = 12000
WHERE id = 'aeom0004-0000-0000-0000-000000000004';

UPDATE public.profiles SET
  bio = 'Coach sportif certifié & entrepreneur, Marseille. J''aide les gens à transformer leur corps et leur mindset. Ouverture de ma première salle en 2025.',
  avatar_url = 'https://i.pravatar.cc/150?img=15',
  follower_count = 6789, is_verified = TRUE, credits = 4500
WHERE id = 'aeom0005-0000-0000-0000-000000000005';

UPDATE public.profiles SET
  bio = 'Architecte d''intérieur diplômée ENSBA, Paris. Je crée des espaces qui racontent des histoires. En train de lancer ma propre agence après 5 ans en cabinet.',
  avatar_url = 'https://i.pravatar.cc/150?img=9',
  follower_count = 8923, is_verified = TRUE, credits = 6000
WHERE id = 'aeom0006-0000-0000-0000-000000000006';

UPDATE public.profiles SET
  bio = 'Musicien, producteur et compositeur à Toulouse. Mélange de jazz, électro et chanson française. En studio sur mon premier album. 🎹🎶',
  avatar_url = 'https://i.pravatar.cc/150?img=21',
  follower_count = 5412, is_verified = FALSE, credits = 3000
WHERE id = 'aeom0007-0000-0000-0000-000000000007';

UPDATE public.profiles SET
  bio = 'Interne en médecine, spécialisation cardiologie, Lyon. Futur cardiologue interventionnel. Je documente mon parcours médical avec transparence. 🫀',
  avatar_url = 'https://i.pravatar.cc/150?img=32',
  follower_count = 3241, is_verified = TRUE, credits = 2500
WHERE id = 'aeom0008-0000-0000-0000-000000000008';

UPDATE public.profiles SET
  bio = 'Investisseur indépendant & trader, Paris. 10 ans de marchés financiers. Je construis mon propre fonds. Rendements 2023: +31%, 2024: +28%.',
  avatar_url = 'https://i.pravatar.cc/150?img=33',
  follower_count = 15678, is_verified = TRUE, credits = 20000
WHERE id = 'aeom0009-0000-0000-0000-000000000009';

UPDATE public.profiles SET
  bio = 'Photographe professionnelle & artiste visuelle, Nice → Paris. Spécialisée portrait et architecture. Je veux que mes photos racontent l''invisible. 📷',
  avatar_url = 'https://i.pravatar.cc/150?img=44',
  follower_count = 19234, is_verified = TRUE, credits = 7500
WHERE id = 'aeom000a-0000-0000-0000-00000000000a';

-- ─── Step 4: Insert markets ───────────────────────────────────
INSERT INTO public.markets (id, creator_id, title, description, category, resolution_date, yes_pool, no_pool, created_at) VALUES

-- Antoine (uid1) — Entrepreneur/SaaS
('m001a000-0000-0000-0000-000000000001', 'aeom0001-0000-0000-0000-000000000001',
 'Vais-je lever 500k€ pour ma startup avant fin 2025 ?',
 'Je suis en discussion avec 3 fonds d''amorçage. Les termes se précisent mais rien n''est signé. Résolution : closing signé avant le 31 déc 2025.',
 'career', '2025-12-31', 1800, 2700, now()-interval '4 months'),

('m001b000-0000-0000-0000-000000000002', 'aeom0001-0000-0000-0000-000000000001',
 'Est-ce que mon MRR atteindra 15 000€ avant décembre ?',
 'Actuellement à 4 200€ MRR. Objectif : 15k€ avant le 1er décembre 2025. J''ai 3 gros prospects en pipe.',
 'finance', '2025-12-01', 2400, 1600, now()-interval '3 months'),

('m001c000-0000-0000-0000-000000000003', 'aeom0001-0000-0000-0000-000000000001',
 'Vais-je quitter mon CDI pour me consacrer 100% à ma startup cette année ?',
 'Mon employeur est au courant du projet. La décision dépend des financements et du MRR. Pas de CDI = résolution YES.',
 'career', '2025-09-30', 3200, 1800, now()-interval '3 months'),

-- Sophie (uid2) — Fitness/Athlète
('m002a000-0000-0000-0000-000000000001', 'aeom0002-0000-0000-0000-000000000002',
 'Vais-je finir mon premier Ironman 70.3 en moins de 5h30 ?',
 'Mon premier half-ironman est en juin 2026. Entraînement 12h/semaine depuis 6 mois. Objectif : 5h30 chrono.',
 'health', '2026-06-15', 4200, 2100, now()-interval '3 months'),

('m002b000-0000-0000-0000-000000000002', 'aeom0002-0000-0000-0000-000000000002',
 'Vais-je atteindre 50 000 abonnés Instagram avant juillet 2025 ?',
 'Je suis à 31k abonnés aujourd''hui. Croissance actuelle : ~1 200/mois. Objectif 50k avant le 1er juillet.',
 'personal', '2025-07-01', 1500, 3500, now()-interval '2 months'),

('m002c000-0000-0000-0000-000000000003', 'aeom0002-0000-0000-0000-000000000002',
 'Est-ce que je cours le Marathon de Paris en moins de 3h45 ?',
 'Marathon de Paris 2025. Je cours depuis 3 ans, meilleur temps 3h58. Je veux briser les 3h45 cette année.',
 'health', '2025-04-13', 2800, 2200, now()-interval '2 months'),

-- Lucas (uid3) — Développeur SaaS
('m003a000-0000-0000-0000-000000000001', 'aeom0003-0000-0000-0000-000000000003',
 'Vais-je avoir 100 clients payants sur mon SaaS avant fin 2025 ?',
 'Mon outil RH SaaS est en beta depuis janvier. 8 clients payants à ce jour. Il me faut atteindre 100 avant décembre.',
 'career', '2025-12-31', 900, 2700, now()-interval '2 months'),

('m003b000-0000-0000-0000-000000000002', 'aeom0003-0000-0000-0000-000000000003',
 'Est-ce que je lance ma chaîne YouTube de coding avant août 2025 ?',
 'Je veux documenter mon parcours de dev indépendant en vidéo. Déjà 3 scripts rédigés. Lancement avant le 1er août.',
 'creative', '2025-08-01', 1800, 1200, now()-interval '1 month'),

('m003c000-0000-0000-0000-000000000003', 'aeom0003-0000-0000-0000-000000000003',
 'Vais-je passer la certification AWS Solutions Architect en 2025 ?',
 'J''ai commencé la formation en janvier. Examen prévu pour novembre. Ça dépend de ma charge client.',
 'education', '2025-11-30', 3500, 1500, now()-interval '1 month'),

-- Camille (uid4) — Créatrice de contenu
('m004a000-0000-0000-0000-000000000001', 'aeom0004-0000-0000-0000-000000000004',
 'Vais-je collaborer avec une marque à plus de 100k€ de contrat cette année ?',
 'J''ai 2 discussions en cours avec des marques luxury et une marque sport. Objectif : signer avant fin 2025.',
 'finance', '2025-12-31', 3600, 2400, now()-interval '2 months'),

('m004b000-0000-0000-0000-000000000002', 'aeom0004-0000-0000-0000-000000000004',
 'Est-ce que je voyage dans 10 pays différents cette année ?',
 'J''en suis à 4 pays depuis janvier (Japon, Portugal, Maroc, Islande). 6 autres trips planifiés. On y croit !',
 'travel', '2025-12-31', 5500, 1500, now()-interval '1 month'),

('m004c000-0000-0000-0000-000000000003', 'aeom0004-0000-0000-0000-000000000004',
 'Vais-je lancer ma propre ligne de produits lifestyle avant décembre ?',
 'J''ai un partenariat en négociation avec un fabricant. Lancement prévu Q4 2025 mais les délais sont serrés.',
 'career', '2025-12-01', 1200, 3800, now()-interval '3 weeks'),

-- Maxime (uid5) — Coach sportif
('m005a000-0000-0000-0000-000000000001', 'aeom0005-0000-0000-0000-000000000005',
 'Vais-je ouvrir ma propre salle de sport à Marseille avant fin 2025 ?',
 'Local trouvé, dossier bancaire déposé. Il manque 40k€ de financement. Objectif ouverture : octobre 2025.',
 'career', '2025-12-31', 2800, 4200, now()-interval '3 months'),

('m005b000-0000-0000-0000-000000000002', 'aeom0005-0000-0000-0000-000000000005',
 'Est-ce que j''atteins 5% de masse graisseuse avant mars 2026 ?',
 'Je suis à 11% actuellement. Protocole de sèche sur 8 mois, supervision médicale. Mesure DEXA officielle.',
 'health', '2026-03-01', 4500, 1500, now()-interval '2 months'),

('m005c000-0000-0000-0000-000000000003', 'aeom0005-0000-0000-0000-000000000005',
 'Vais-je former et certifier 20 nouveaux coachs sportifs cette année ?',
 'Je gère une formation de coaching certifiée. 7 coachs certifiés depuis janvier. Objectif 20 avant décembre.',
 'education', '2025-12-31', 2100, 900, now()-interval '1 month'),

-- Inès (uid6) — Architecte
('m006a000-0000-0000-0000-000000000001', 'aeom0006-0000-0000-0000-000000000006',
 'Vais-je lancer mon agence d''architecture indépendante en 2025 ?',
 'Après 5 ans en cabinet, je veux voler de mes propres ailes. J''ai 2 clients potentiels et un associé pressenti.',
 'career', '2025-12-31', 3200, 1600, now()-interval '2 months'),

('m006b000-0000-0000-0000-000000000002', 'aeom0006-0000-0000-0000-000000000006',
 'Est-ce que je décroche mon premier projet à plus de 100 000€ ?',
 'Je réponds à un appel d''offres pour la rénovation d''un hôtel particulier à Paris. Budget estimé : 120k€.',
 'finance', '2025-12-31', 1400, 3600, now()-interval '6 weeks'),

('m006c000-0000-0000-0000-000000000003', 'aeom0006-0000-0000-0000-000000000006',
 'Vais-je emménager dans mon propre appart à Paris avant juillet ?',
 'Je loue en coloc depuis 4 ans. J''ai un appartement en vue dans le 11e. Signature du bail = résolution YES.',
 'personal', '2025-07-01', 2500, 2500, now()-interval '1 month'),

-- Thomas (uid7) — Musicien
('m007a000-0000-0000-0000-000000000001', 'aeom0007-0000-0000-0000-000000000007',
 'Vais-je sortir mon premier album studio avant fin 2025 ?',
 '10 titres enregistrés sur 12. Mixage prévu pour l''été, sortie visée en octobre. La prod est presque bouclée.',
 'creative', '2025-12-31', 4800, 2400, now()-interval '3 months'),

('m007b000-0000-0000-0000-000000000002', 'aeom0007-0000-0000-0000-000000000007',
 'Est-ce que je joue à l''Olympia avant mes 30 ans ?',
 'J''ai 27 ans. L''Olympia est un rêve depuis l''enfance. Je travaille avec un booker mais les salles comme ça, ça se mérite.',
 'career', '2028-12-31', 600, 3400, now()-interval '2 months'),

('m007c000-0000-0000-0000-000000000003', 'aeom0007-0000-0000-0000-000000000007',
 'Vais-je signer avec un label musical cette année ?',
 'J''ai eu 2 meetings avec des labels indés. Rien de concret pour l''instant. Ça pourrait se décider après la sortie de l''album.',
 'career', '2025-12-31', 1600, 2400, now()-interval '1 month'),

-- Jade (uid8) — Médecin
('m008a000-0000-0000-0000-000000000001', 'aeom0008-0000-0000-0000-000000000008',
 'Vais-je réussir mon concours de spécialisation en cardiologie ?',
 'Concours des ECNi prévu en juin 2026. Je me prépare depuis 18 mois. Cardiologie = spécialité très sélective.',
 'education', '2026-06-30', 5600, 1400, now()-interval '2 months'),

('m008b000-0000-0000-0000-000000000002', 'aeom0008-0000-0000-0000-000000000008',
 'Est-ce que je publie un article dans une revue médicale indexée cette année ?',
 'Je rédige un article sur les cardiopathies chez les jeunes sportifs. Soumission prévue au JAMA ou European Heart Journal.',
 'education', '2025-12-31', 3600, 1800, now()-interval '5 weeks'),

('m008c000-0000-0000-0000-000000000003', 'aeom0008-0000-0000-0000-000000000008',
 'Vais-je faire un stage clinique à l''hôpital Mount Sinai de New York en 2025 ?',
 'J''ai déposé une candidature pour un stage observership de 3 mois. Réponse attendue en avril.',
 'travel', '2025-09-01', 2200, 2800, now()-interval '3 weeks'),

-- Hugo (uid9) — Investisseur
('m009a000-0000-0000-0000-000000000001', 'aeom0009-0000-0000-0000-000000000009',
 'Est-ce que mon portefeuille actions dépasse +40% de rendement en 2025 ?',
 'Mon portefeuille est concentré sur la tech et les semi-conducteurs. +18% YTD à fin mars. Objectif +40% sur l''année.',
 'finance', '2025-12-31', 1800, 3600, now()-interval '2 months'),

('m009b000-0000-0000-0000-000000000002', 'aeom0009-0000-0000-0000-000000000009',
 'Vais-je lancer mon propre fonds d''investissement avant fin 2025 ?',
 'J''ai 3 LPs potentiels et une structure juridique en cours de création. Ticket minimum : 50k€. Objectif : 500k€ under management.',
 'finance', '2025-12-31', 2400, 3200, now()-interval '6 weeks'),

('m009c000-0000-0000-0000-000000000003', 'aeom0009-0000-0000-0000-000000000009',
 'Est-ce que j''achète un appartement à Paris avant décembre ?',
 'Budget : 600k€, apport 20%. Je visite régulièrement dans le 9e et le 10e. Le marché est tendu mais je suis patient.',
 'personal', '2025-12-01', 3800, 2200, now()-interval '1 month'),

-- Léa (uid10) — Photographe
('m00aa000-0000-0000-0000-000000000001', 'aeom000a-0000-0000-0000-00000000000a',
 'Vais-je exposer mes photos dans une galerie parisienne en 2025 ?',
 'J''ai 2 galeries intéressées dans le Marais. Exposition solo ou collective, je prends. Vernissage avant fin 2025.',
 'creative', '2025-12-31', 4200, 2100, now()-interval '3 weeks'),

('m00ab000-0000-0000-0000-000000000002', 'aeom000a-0000-0000-0000-00000000000a',
 'Est-ce que je signe avec une agence photo internationale cette année ?',
 'J''ai envoyé mon portfolio à Getty Images, Magnum et 2 agences parisiennes. C''est long, c''est sélectif.',
 'career', '2025-12-31', 2100, 4900, now()-interval '2 weeks'),

('m00ac000-0000-0000-0000-000000000003', 'aeom000a-0000-0000-0000-00000000000a',
 'Vais-je vendre 50 tirages photo à plus de 500€ pièce cette année ?',
 'Je vends en éditions limitées (30 ex.) sur mon site. 7 tirages vendus depuis janvier. Il en faut 43 de plus.',
 'finance', '2025-12-31', 1600, 2400, now()-interval '1 week')

ON CONFLICT (id) DO NOTHING;

-- ─── Step 5: Insert bets ──────────────────────────────────────
INSERT INTO public.bets (user_id, market_id, position, amount, created_at) VALUES

-- Bets on Antoine's markets
('aeom0002-0000-0000-0000-000000000002','m001a000-0000-0000-0000-000000000001','YES',800,  now()-interval '115 days'),
('aeom0005-0000-0000-0000-000000000005','m001a000-0000-0000-0000-000000000001','NO', 1200, now()-interval '110 days'),
('aeom0009-0000-0000-0000-000000000009','m001a000-0000-0000-0000-000000000001','YES',1000, now()-interval '105 days'),
('aeom0006-0000-0000-0000-000000000006','m001a000-0000-0000-0000-000000000001','NO', 900,  now()-interval '100 days'),
('aeom0004-0000-0000-0000-000000000004','m001a000-0000-0000-0000-000000000001','NO', 600,  now()-interval '95 days'),

('aeom0003-0000-0000-0000-000000000003','m001b000-0000-0000-0000-000000000002','YES',1200, now()-interval '88 days'),
('aeom0009-0000-0000-0000-000000000009','m001b000-0000-0000-0000-000000000002','YES',600,  now()-interval '85 days'),
('aeom0007-0000-0000-0000-000000000007','m001b000-0000-0000-0000-000000000002','NO', 800,  now()-interval '80 days'),
('aeom000a-0000-0000-0000-00000000000a','m001b000-0000-0000-0000-000000000002','YES',600,  now()-interval '75 days'),
('aeom0008-0000-0000-0000-000000000008','m001b000-0000-0000-0000-000000000002','NO', 800,  now()-interval '70 days'),

('aeom0004-0000-0000-0000-000000000004','m001c000-0000-0000-0000-000000000003','YES',1500, now()-interval '85 days'),
('aeom0009-0000-0000-0000-000000000009','m001c000-0000-0000-0000-000000000003','YES',900,  now()-interval '80 days'),
('aeom0006-0000-0000-0000-000000000006','m001c000-0000-0000-0000-000000000003','NO', 1200, now()-interval '75 days'),
('aeom0002-0000-0000-0000-000000000002','m001c000-0000-0000-0000-000000000003','YES',800,  now()-interval '70 days'),
('aeom0005-0000-0000-0000-000000000005','m001c000-0000-0000-0000-000000000003','NO', 600,  now()-interval '65 days'),

-- Bets on Sophie's markets
('aeom0005-0000-0000-0000-000000000005','m002a000-0000-0000-0000-000000000001','YES',2000, now()-interval '90 days'),
('aeom0001-0000-0000-0000-000000000001','m002a000-0000-0000-0000-000000000001','YES',1200, now()-interval '85 days'),
('aeom0006-0000-0000-0000-000000000006','m002a000-0000-0000-0000-000000000001','NO', 1100, now()-interval '80 days'),
('aeom0008-0000-0000-0000-000000000008','m002a000-0000-0000-0000-000000000001','YES',1000, now()-interval '75 days'),
('aeom0003-0000-0000-0000-000000000003','m002a000-0000-0000-0000-000000000001','NO', 1000, now()-interval '70 days'),

('aeom0004-0000-0000-0000-000000000004','m002b000-0000-0000-0000-000000000002','YES',1500, now()-interval '60 days'),
('aeom000a-0000-0000-0000-00000000000a','m002b000-0000-0000-0000-000000000002','NO', 1200, now()-interval '55 days'),
('aeom0007-0000-0000-0000-000000000007','m002b000-0000-0000-0000-000000000002','NO', 1300, now()-interval '50 days'),
('aeom0001-0000-0000-0000-000000000001','m002b000-0000-0000-0000-000000000002','NO', 1000, now()-interval '45 days'),

('aeom0005-0000-0000-0000-000000000005','m002c000-0000-0000-0000-000000000003','YES',1500, now()-interval '55 days'),
('aeom0008-0000-0000-0000-000000000008','m002c000-0000-0000-0000-000000000003','YES',1300, now()-interval '50 days'),
('aeom0006-0000-0000-0000-000000000006','m002c000-0000-0000-0000-000000000003','NO', 1400, now()-interval '45 days'),
('aeom0001-0000-0000-0000-000000000001','m002c000-0000-0000-0000-000000000003','NO', 800,  now()-interval '40 days'),

-- Bets on Lucas's markets
('aeom0001-0000-0000-0000-000000000001','m003a000-0000-0000-0000-000000000001','YES',500,  now()-interval '58 days'),
('aeom0009-0000-0000-0000-000000000009','m003a000-0000-0000-0000-000000000001','NO', 1500, now()-interval '55 days'),
('aeom0004-0000-0000-0000-000000000004','m003a000-0000-0000-0000-000000000001','NO', 700,  now()-interval '50 days'),
('aeom0007-0000-0000-0000-000000000007','m003a000-0000-0000-0000-000000000001','YES',400,  now()-interval '45 days'),
('aeom000a-0000-0000-0000-00000000000a','m003a000-0000-0000-0000-000000000001','NO', 500,  now()-interval '40 days'),

('aeom0001-0000-0000-0000-000000000001','m003b000-0000-0000-0000-000000000002','YES',800,  now()-interval '35 days'),
('aeom0004-0000-0000-0000-000000000004','m003b000-0000-0000-0000-000000000002','YES',1000, now()-interval '30 days'),
('aeom0007-0000-0000-0000-000000000007','m003b000-0000-0000-0000-000000000002','NO', 800,  now()-interval '25 days'),
('aeom000a-0000-0000-0000-00000000000a','m003b000-0000-0000-0000-000000000002','NO', 400,  now()-interval '20 days'),

('aeom0001-0000-0000-0000-000000000001','m003c000-0000-0000-0000-000000000003','YES',1500, now()-interval '28 days'),
('aeom0009-0000-0000-0000-000000000009','m003c000-0000-0000-0000-000000000003','YES',1200, now()-interval '24 days'),
('aeom0008-0000-0000-0000-000000000008','m003c000-0000-0000-0000-000000000003','YES',800,  now()-interval '20 days'),
('aeom0006-0000-0000-0000-000000000006','m003c000-0000-0000-0000-000000000003','NO', 1000, now()-interval '16 days'),
('aeom0005-0000-0000-0000-000000000005','m003c000-0000-0000-0000-000000000003','NO', 500,  now()-interval '12 days'),

-- Bets on Camille's markets
('aeom0002-0000-0000-0000-000000000002','m004a000-0000-0000-0000-000000000001','YES',1800, now()-interval '55 days'),
('aeom000a-0000-0000-0000-00000000000a','m004a000-0000-0000-0000-000000000001','YES',1000, now()-interval '50 days'),
('aeom0007-0000-0000-0000-000000000007','m004a000-0000-0000-0000-000000000001','NO', 1400, now()-interval '45 days'),
('aeom0009-0000-0000-0000-000000000009','m004a000-0000-0000-0000-000000000001','YES',800,  now()-interval '40 days'),
('aeom0006-0000-0000-0000-000000000006','m004a000-0000-0000-0000-000000000001','NO', 1000, now()-interval '35 days'),

('aeom0002-0000-0000-0000-000000000002','m004b000-0000-0000-0000-000000000002','YES',2000, now()-interval '30 days'),
('aeom000a-0000-0000-0000-00000000000a','m004b000-0000-0000-0000-000000000002','YES',1500, now()-interval '25 days'),
('aeom0007-0000-0000-0000-000000000007','m004b000-0000-0000-0000-000000000002','YES',2000, now()-interval '20 days'),
('aeom0008-0000-0000-0000-000000000008','m004b000-0000-0000-0000-000000000002','NO', 1500, now()-interval '15 days'),

('aeom0002-0000-0000-0000-000000000002','m004c000-0000-0000-0000-000000000003','YES',600,  now()-interval '20 days'),
('aeom000a-0000-0000-0000-00000000000a','m004c000-0000-0000-0000-000000000003','YES',600,  now()-interval '17 days'),
('aeom0009-0000-0000-0000-000000000009','m004c000-0000-0000-0000-000000000003','NO', 2000, now()-interval '14 days'),
('aeom0007-0000-0000-0000-000000000007','m004c000-0000-0000-0000-000000000003','NO', 1000, now()-interval '11 days'),
('aeom0001-0000-0000-0000-000000000001','m004c000-0000-0000-0000-000000000003','NO', 800,  now()-interval '8 days'),

-- Bets on Maxime's markets
('aeom0001-0000-0000-0000-000000000001','m005a000-0000-0000-0000-000000000001','YES',1200, now()-interval '88 days'),
('aeom0002-0000-0000-0000-000000000002','m005a000-0000-0000-0000-000000000001','YES',1600, now()-interval '82 days'),
('aeom0003-0000-0000-0000-000000000003','m005a000-0000-0000-0000-000000000001','NO', 2200, now()-interval '76 days'),
('aeom0009-0000-0000-0000-000000000009','m005a000-0000-0000-0000-000000000001','NO', 2000, now()-interval '70 days'),

('aeom0002-0000-0000-0000-000000000002','m005b000-0000-0000-0000-000000000002','YES',2000, now()-interval '62 days'),
('aeom0008-0000-0000-0000-000000000008','m005b000-0000-0000-0000-000000000002','YES',1500, now()-interval '56 days'),
('aeom0006-0000-0000-0000-000000000006','m005b000-0000-0000-0000-000000000002','YES',1000, now()-interval '50 days'),
('aeom0001-0000-0000-0000-000000000001','m005b000-0000-0000-0000-000000000002','NO', 900,  now()-interval '44 days'),
('aeom000a-0000-0000-0000-00000000000a','m005b000-0000-0000-0000-000000000002','NO', 600,  now()-interval '38 days'),

('aeom0002-0000-0000-0000-000000000002','m005c000-0000-0000-0000-000000000003','YES',1200, now()-interval '30 days'),
('aeom0008-0000-0000-0000-000000000008','m005c000-0000-0000-0000-000000000003','YES',900,  now()-interval '25 days'),
('aeom0006-0000-0000-0000-000000000006','m005c000-0000-0000-0000-000000000003','NO', 900,  now()-interval '20 days'),

-- Bets on Inès's markets
('aeom0009-0000-0000-0000-000000000009','m006a000-0000-0000-0000-000000000001','YES',1500, now()-interval '58 days'),
('aeom0001-0000-0000-0000-000000000001','m006a000-0000-0000-0000-000000000001','YES',1000, now()-interval '52 days'),
('aeom0004-0000-0000-0000-000000000004','m006a000-0000-0000-0000-000000000001','YES',700,  now()-interval '46 days'),
('aeom0007-0000-0000-0000-000000000007','m006a000-0000-0000-0000-000000000001','NO', 1000, now()-interval '40 days'),
('aeom0003-0000-0000-0000-000000000003','m006a000-0000-0000-0000-000000000001','NO', 600,  now()-interval '34 days'),

('aeom0001-0000-0000-0000-000000000001','m006b000-0000-0000-0000-000000000002','YES',800,  now()-interval '42 days'),
('aeom0009-0000-0000-0000-000000000009','m006b000-0000-0000-0000-000000000002','YES',600,  now()-interval '36 days'),
('aeom0004-0000-0000-0000-000000000004','m006b000-0000-0000-0000-000000000002','NO', 1800, now()-interval '30 days'),
('aeom0002-0000-0000-0000-000000000002','m006b000-0000-0000-0000-000000000002','NO', 1000, now()-interval '24 days'),
('aeom000a-0000-0000-0000-00000000000a','m006b000-0000-0000-0000-000000000002','NO', 800,  now()-interval '18 days'),

('aeom0004-0000-0000-0000-000000000004','m006c000-0000-0000-0000-000000000003','YES',1200, now()-interval '28 days'),
('aeom0002-0000-0000-0000-000000000002','m006c000-0000-0000-0000-000000000003','YES',800,  now()-interval '22 days'),
('aeom0007-0000-0000-0000-000000000007','m006c000-0000-0000-0000-000000000003','YES',500,  now()-interval '16 days'),
('aeom0009-0000-0000-0000-000000000009','m006c000-0000-0000-0000-000000000003','NO', 1500, now()-interval '10 days'),
('aeom000a-0000-0000-0000-00000000000a','m006c000-0000-0000-0000-000000000003','NO', 1000, now()-interval '5 days'),

-- Bets on Thomas's markets
('aeom0004-0000-0000-0000-000000000004','m007a000-0000-0000-0000-000000000001','YES',2000, now()-interval '85 days'),
('aeom000a-0000-0000-0000-00000000000a','m007a000-0000-0000-0000-000000000001','YES',1800, now()-interval '78 days'),
('aeom0002-0000-0000-0000-000000000002','m007a000-0000-0000-0000-000000000001','YES',1000, now()-interval '71 days'),
('aeom0005-0000-0000-0000-000000000005','m007a000-0000-0000-0000-000000000001','NO', 1400, now()-interval '64 days'),
('aeom0003-0000-0000-0000-000000000003','m007a000-0000-0000-0000-000000000001','NO', 1000, now()-interval '57 days'),

('aeom000a-0000-0000-0000-00000000000a','m007b000-0000-0000-0000-000000000002','YES',300,  now()-interval '60 days'),
('aeom0004-0000-0000-0000-000000000004','m007b000-0000-0000-0000-000000000002','YES',300,  now()-interval '55 days'),
('aeom0009-0000-0000-0000-000000000009','m007b000-0000-0000-0000-000000000002','NO', 1500, now()-interval '50 days'),
('aeom0005-0000-0000-0000-000000000005','m007b000-0000-0000-0000-000000000002','NO', 1200, now()-interval '45 days'),
('aeom0008-0000-0000-0000-000000000008','m007b000-0000-0000-0000-000000000002','NO', 700,  now()-interval '40 days'),

('aeom000a-0000-0000-0000-00000000000a','m007c000-0000-0000-0000-000000000003','YES',800,  now()-interval '30 days'),
('aeom0004-0000-0000-0000-000000000004','m007c000-0000-0000-0000-000000000003','YES',800,  now()-interval '25 days'),
('aeom0009-0000-0000-0000-000000000009','m007c000-0000-0000-0000-000000000003','NO', 1000, now()-interval '20 days'),
('aeom0008-0000-0000-0000-000000000008','m007c000-0000-0000-0000-000000000003','NO', 800,  now()-interval '15 days'),
('aeom0001-0000-0000-0000-000000000001','m007c000-0000-0000-0000-000000000003','NO', 600,  now()-interval '10 days'),

-- Bets on Jade's markets
('aeom0003-0000-0000-0000-000000000003','m008a000-0000-0000-0000-000000000001','YES',2000, now()-interval '55 days'),
('aeom0006-0000-0000-0000-000000000006','m008a000-0000-0000-0000-000000000001','YES',1800, now()-interval '48 days'),
('aeom0002-0000-0000-0000-000000000002','m008a000-0000-0000-0000-000000000001','YES',1000, now()-interval '41 days'),
('aeom0005-0000-0000-0000-000000000005','m008a000-0000-0000-0000-000000000001','YES',800,  now()-interval '34 days'),
('aeom0007-0000-0000-0000-000000000007','m008a000-0000-0000-0000-000000000001','NO', 1400, now()-interval '27 days'),

('aeom0006-0000-0000-0000-000000000006','m008b000-0000-0000-0000-000000000002','YES',1500, now()-interval '38 days'),
('aeom0003-0000-0000-0000-000000000003','m008b000-0000-0000-0000-000000000002','YES',1200, now()-interval '32 days'),
('aeom0002-0000-0000-0000-000000000002','m008b000-0000-0000-0000-000000000002','YES',900,  now()-interval '26 days'),
('aeom0005-0000-0000-0000-000000000005','m008b000-0000-0000-0000-000000000002','NO', 1000, now()-interval '20 days'),
('aeom0007-0000-0000-0000-000000000007','m008b000-0000-0000-0000-000000000002','NO', 800,  now()-interval '14 days'),

('aeom0006-0000-0000-0000-000000000006','m008c000-0000-0000-0000-000000000003','YES',1200, now()-interval '21 days'),
('aeom000a-0000-0000-0000-00000000000a','m008c000-0000-0000-0000-000000000003','YES',1000, now()-interval '17 days'),
('aeom0009-0000-0000-0000-000000000009','m008c000-0000-0000-0000-000000000003','NO', 1500, now()-interval '13 days'),
('aeom0004-0000-0000-0000-000000000004','m008c000-0000-0000-0000-000000000003','NO', 1000, now()-interval '9 days'),
('aeom0003-0000-0000-0000-000000000003','m008c000-0000-0000-0000-000000000003','NO', 300,  now()-interval '5 days'),

-- Bets on Hugo's markets
('aeom0001-0000-0000-0000-000000000001','m009a000-0000-0000-0000-000000000001','YES',800,  now()-interval '60 days'),
('aeom0006-0000-0000-0000-000000000006','m009a000-0000-0000-0000-000000000001','YES',1000, now()-interval '54 days'),
('aeom0003-0000-0000-0000-000000000003','m009a000-0000-0000-0000-000000000001','NO', 1500, now()-interval '48 days'),
('aeom0005-0000-0000-0000-000000000005','m009a000-0000-0000-0000-000000000001','NO', 1200, now()-interval '42 days'),
('aeom0008-0000-0000-0000-000000000008','m009a000-0000-0000-0000-000000000001','NO', 900,  now()-interval '36 days'),

('aeom0001-0000-0000-0000-000000000001','m009b000-0000-0000-0000-000000000002','YES',1200, now()-interval '42 days'),
('aeom0006-0000-0000-0000-000000000006','m009b000-0000-0000-0000-000000000002','YES',1200, now()-interval '36 days'),
('aeom0003-0000-0000-0000-000000000003','m009b000-0000-0000-0000-000000000002','NO', 1500, now()-interval '30 days'),
('aeom0004-0000-0000-0000-000000000004','m009b000-0000-0000-0000-000000000002','NO', 800,  now()-interval '24 days'),
('aeom0005-0000-0000-0000-000000000005','m009b000-0000-0000-0000-000000000002','NO', 900,  now()-interval '18 days'),

('aeom0001-0000-0000-0000-000000000001','m009c000-0000-0000-0000-000000000003','YES',1800, now()-interval '28 days'),
('aeom0006-0000-0000-0000-000000000006','m009c000-0000-0000-0000-000000000003','YES',1200, now()-interval '22 days'),
('aeom0004-0000-0000-0000-000000000004','m009c000-0000-0000-0000-000000000003','YES',800,  now()-interval '16 days'),
('aeom0003-0000-0000-0000-000000000003','m009c000-0000-0000-0000-000000000003','NO', 1200, now()-interval '10 days'),
('aeom0005-0000-0000-0000-000000000005','m009c000-0000-0000-0000-000000000003','NO', 1000, now()-interval '4 days'),

-- Bets on Léa's markets
('aeom0004-0000-0000-0000-000000000004','m00aa000-0000-0000-0000-000000000001','YES',2000, now()-interval '20 days'),
('aeom0002-0000-0000-0000-000000000002','m00aa000-0000-0000-0000-000000000001','YES',1200, now()-interval '16 days'),
('aeom0007-0000-0000-0000-000000000007','m00aa000-0000-0000-0000-000000000001','YES',1000, now()-interval '12 days'),
('aeom0006-0000-0000-0000-000000000006','m00aa000-0000-0000-0000-000000000001','NO', 1500, now()-interval '8 days'),
('aeom0001-0000-0000-0000-000000000001','m00aa000-0000-0000-0000-000000000001','NO', 600,  now()-interval '4 days'),

('aeom0004-0000-0000-0000-000000000004','m00ab000-0000-0000-0000-000000000002','YES',1200, now()-interval '14 days'),
('aeom0007-0000-0000-0000-000000000007','m00ab000-0000-0000-0000-000000000002','YES',900,  now()-interval '11 days'),
('aeom0009-0000-0000-0000-000000000009','m00ab000-0000-0000-0000-000000000002','NO', 2500, now()-interval '8 days'),
('aeom0002-0000-0000-0000-000000000002','m00ab000-0000-0000-0000-000000000002','NO', 1400, now()-interval '5 days'),
('aeom0006-0000-0000-0000-000000000006','m00ab000-0000-0000-0000-000000000002','NO', 1000, now()-interval '2 days'),

('aeom0004-0000-0000-0000-000000000004','m00ac000-0000-0000-0000-000000000003','YES',800,  now()-interval '7 days'),
('aeom0007-0000-0000-0000-000000000007','m00ac000-0000-0000-0000-000000000003','YES',800,  now()-interval '5 days'),
('aeom0009-0000-0000-0000-000000000009','m00ac000-0000-0000-0000-000000000003','NO', 1200, now()-interval '3 days'),
('aeom0002-0000-0000-0000-000000000002','m00ac000-0000-0000-0000-000000000003','NO', 800,  now()-interval '2 days'),
('aeom0006-0000-0000-0000-000000000006','m00ac000-0000-0000-0000-000000000003','NO', 400,  now()-interval '1 day');

-- ─── Done ─────────────────────────────────────────────────────
-- 10 verified subjects, 30 markets, 150 bets inserted.
-- Probability summary:
--   Antoine:  40% YES  |  60% YES  |  64% YES
--   Sophie:   67% YES  |  30% YES  |  56% YES
--   Lucas:    25% YES  |  60% YES  |  70% YES
--   Camille:  60% YES  |  79% YES  |  24% YES
--   Maxime:   40% YES  |  75% YES  |  70% YES
--   Inès:     67% YES  |  28% YES  |  50% YES
--   Thomas:   67% YES  |  15% YES  |  40% YES
--   Jade:     80% YES  |  67% YES  |  44% YES
--   Hugo:     33% YES  |  43% YES  |  63% YES
--   Léa:      67% YES  |  30% YES  |  40% YES
