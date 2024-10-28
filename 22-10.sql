--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Ubuntu 16.4-1.pgdg22.04+1)
-- Dumped by pg_dump version 16.4 (Ubuntu 16.4-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: accounts_gender_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.accounts_gender_enum AS ENUM (
    'male',
    'female'
);


ALTER TYPE public.accounts_gender_enum OWNER TO postgres;

--
-- Name: accounts_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.accounts_role_enum AS ENUM (
    'learner',
    'expert',
    'admin'
);


ALTER TYPE public.accounts_role_enum OWNER TO postgres;

--
-- Name: actions_name_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.actions_name_enum AS ENUM (
    'daily_login',
    'task_completed',
    'daily_streak'
);


ALTER TYPE public.actions_name_enum OWNER TO postgres;

--
-- Name: buckets_permission_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.buckets_permission_enum AS ENUM (
    'public',
    'private'
);


ALTER TYPE public.buckets_permission_enum OWNER TO postgres;

--
-- Name: buckets_upload_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.buckets_upload_status_enum AS ENUM (
    'pending',
    'uploaded'
);


ALTER TYPE public.buckets_upload_status_enum OWNER TO postgres;

--
-- Name: learner_profiles_rank_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.learner_profiles_rank_enum AS ENUM (
    'bronze',
    'silver',
    'gold',
    'platinum',
    'diamond',
    'master'
);


ALTER TYPE public.learner_profiles_rank_enum OWNER TO postgres;

--
-- Name: lesson_processes_band_score_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.lesson_processes_band_score_enum AS ENUM (
    'pre_ielts',
    '4.5',
    '5.0',
    '5.5',
    '6.0',
    '6.5',
    '7.0'
);


ALTER TYPE public.lesson_processes_band_score_enum OWNER TO postgres;

--
-- Name: lessons_band_score_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.lessons_band_score_enum AS ENUM (
    'pre_ielts',
    '4.5',
    '5.0',
    '5.5',
    '6.0',
    '6.5',
    '7.0'
);


ALTER TYPE public.lessons_band_score_enum OWNER TO postgres;

--
-- Name: missions_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.missions_type_enum AS ENUM (
    'daily',
    'monthly'
);


ALTER TYPE public.missions_type_enum OWNER TO postgres;

--
-- Name: profile_mission_progress_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.profile_mission_progress_status_enum AS ENUM (
    'assigned',
    'completed',
    'received'
);


ALTER TYPE public.profile_mission_progress_status_enum OWNER TO postgres;

--
-- Name: question_types_skill_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.question_types_skill_enum AS ENUM (
    'speaking',
    'listening',
    'reading',
    'writing'
);


ALTER TYPE public.question_types_skill_enum OWNER TO postgres;

--
-- Name: questions_cefr_level_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.questions_cefr_level_enum AS ENUM (
    'A1',
    'A2',
    'B1',
    'B2',
    'C1',
    'C2',
    'Any'
);


ALTER TYPE public.questions_cefr_level_enum OWNER TO postgres;

--
-- Name: questions_content_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.questions_content_type_enum AS ENUM (
    'multiple_choice',
    'fill_in_the_blank',
    'matching'
);


ALTER TYPE public.questions_content_type_enum OWNER TO postgres;

--
-- Name: quests_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.quests_type_enum AS ENUM (
    'daily',
    'monthly'
);


ALTER TYPE public.quests_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    provider_id character varying(36) NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(50) NOT NULL,
    role public.accounts_role_enum DEFAULT 'learner'::public.accounts_role_enum NOT NULL,
    full_name character varying(50),
    dob date,
    gender public.accounts_gender_enum,
    learner_profile_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    avatar_id uuid
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actions (
    id integer NOT NULL,
    name public.actions_name_enum NOT NULL
);


ALTER TABLE public.actions OWNER TO postgres;

--
-- Name: actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.actions_id_seq OWNER TO postgres;

--
-- Name: actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.actions_id_seq OWNED BY public.actions.id;


--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    action_id integer NOT NULL,
    profile_id uuid NOT NULL,
    finished_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: badges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.badges (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    description text NOT NULL,
    requirements integer DEFAULT 0 NOT NULL,
    action_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.badges OWNER TO postgres;

--
-- Name: buckets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buckets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    owner uuid NOT NULL,
    permission public.buckets_permission_enum DEFAULT 'public'::public.buckets_permission_enum NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    upload_status public.buckets_upload_status_enum DEFAULT 'pending'::public.buckets_upload_status_enum NOT NULL
);


ALTER TABLE public.buckets OWNER TO postgres;

--
-- Name: instructions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    content text NOT NULL,
    image_id uuid,
    audio_id uuid,
    question_type_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.instructions OWNER TO postgres;

--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    price integer NOT NULL,
    duration integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: learner_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learner_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    rank public.learner_profiles_rank_enum DEFAULT 'bronze'::public.learner_profiles_rank_enum NOT NULL,
    level_id integer DEFAULT 1 NOT NULL,
    xp integer DEFAULT 0 NOT NULL,
    carrots integer DEFAULT 0 NOT NULL,
    streak_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.learner_profiles OWNER TO postgres;

--
-- Name: lesson_processes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_processes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    learner_profile_id uuid NOT NULL,
    question_type_id integer NOT NULL,
    current_lesson_id integer NOT NULL,
    band_score public.lesson_processes_band_score_enum NOT NULL,
    xp jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.lesson_processes OWNER TO postgres;

--
-- Name: lesson_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    lesson_id integer NOT NULL,
    learner_profile_id uuid NOT NULL,
    correct_answers integer NOT NULL,
    wrong_answers integer NOT NULL,
    duration integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.lesson_records OWNER TO postgres;

--
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id integer NOT NULL,
    name text NOT NULL,
    "order" integer NOT NULL,
    question_type_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    band_score public.lessons_band_score_enum
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessons_id_seq OWNER TO postgres;

--
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- Name: levels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.levels (
    id integer NOT NULL,
    xp integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.levels OWNER TO postgres;

--
-- Name: levels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.levels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.levels_id_seq OWNER TO postgres;

--
-- Name: levels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.levels_id_seq OWNED BY public.levels.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: missions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.missions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type public.missions_type_enum NOT NULL,
    quest_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.missions OWNER TO postgres;

--
-- Name: profile_badges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_badges (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    profile_id uuid NOT NULL,
    badge_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.profile_badges OWNER TO postgres;

--
-- Name: profile_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    item_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    exp_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.profile_items OWNER TO postgres;

--
-- Name: profile_missions_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_missions_progress (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    profile_id uuid NOT NULL,
    mission_id uuid NOT NULL,
    status public.profile_mission_progress_status_enum DEFAULT 'assigned'::public.profile_mission_progress_status_enum NOT NULL,
    current integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.profile_missions_progress OWNER TO postgres;

--
-- Name: question_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_types (
    id integer NOT NULL,
    name text NOT NULL,
    skill public.question_types_skill_enum NOT NULL,
    image_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    band_score_requires jsonb
);


ALTER TABLE public.question_types OWNER TO postgres;

--
-- Name: question_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_types_id_seq OWNER TO postgres;

--
-- Name: question_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_types_id_seq OWNED BY public.question_types.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    content_type public.questions_content_type_enum NOT NULL,
    content jsonb NOT NULL,
    image_id uuid,
    audio_id uuid,
    cefr_level public.questions_cefr_level_enum NOT NULL,
    explanation text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: questions_to_lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions_to_lessons (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    question_id uuid NOT NULL,
    lesson_id integer NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.questions_to_lessons OWNER TO postgres;

--
-- Name: quests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    requirements integer DEFAULT 0 NOT NULL,
    rewards integer DEFAULT 0 NOT NULL,
    action_id integer NOT NULL,
    type public.quests_type_enum NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category character varying(255) NOT NULL
);


ALTER TABLE public.quests OWNER TO postgres;

--
-- Name: streaks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.streaks (
    id integer NOT NULL,
    current integer DEFAULT 0 NOT NULL,
    target integer DEFAULT 0 NOT NULL,
    record integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.streaks OWNER TO postgres;

--
-- Name: streaks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.streaks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.streaks_id_seq OWNER TO postgres;

--
-- Name: streaks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.streaks_id_seq OWNED BY public.streaks.id;


--
-- Name: actions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions ALTER COLUMN id SET DEFAULT nextval('public.actions_id_seq'::regclass);


--
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- Name: levels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.levels ALTER COLUMN id SET DEFAULT nextval('public.levels_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: question_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_types ALTER COLUMN id SET DEFAULT nextval('public.question_types_id_seq'::regclass);


--
-- Name: streaks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streaks ALTER COLUMN id SET DEFAULT nextval('public.streaks_id_seq'::regclass);


--
-- Name: levels PK_05f8dd8f715793c64d49e3f1901; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT "PK_05f8dd8f715793c64d49e3f1901" PRIMARY KEY (id);


--
-- Name: questions PK_08a6d4b0f49ff300bf3a0ca60ac; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY (id);


--
-- Name: instructions PK_1695991f6159e4ae33b136a67ef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructions
    ADD CONSTRAINT "PK_1695991f6159e4ae33b136a67ef" PRIMARY KEY (id);


--
-- Name: lesson_records PK_302542b59645d269a43fe0826b8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_records
    ADD CONSTRAINT "PK_302542b59645d269a43fe0826b8" PRIMARY KEY (id);


--
-- Name: streaks PK_52547016a1a6409f6e5287ed859; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streaks
    ADD CONSTRAINT "PK_52547016a1a6409f6e5287ed859" PRIMARY KEY (id);


--
-- Name: accounts PK_5a7a02c20412299d198e097a8fe; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY (id);


--
-- Name: buckets PK_6274370d823fcc89d22efd86580; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buckets
    ADD CONSTRAINT "PK_6274370d823fcc89d22efd86580" PRIMARY KEY (id);


--
-- Name: question_types PK_6351ae77232205c3ee112cfb7f6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_types
    ADD CONSTRAINT "PK_6351ae77232205c3ee112cfb7f6" PRIMARY KEY (id);


--
-- Name: profile_items PK_6aa0c7999008ca1980efb8c9ee1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_items
    ADD CONSTRAINT "PK_6aa0c7999008ca1980efb8c9ee1" PRIMARY KEY (id);


--
-- Name: profile_badges PK_73457370a2395d72f60cf6a4a19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_badges
    ADD CONSTRAINT "PK_73457370a2395d72f60cf6a4a19" PRIMARY KEY (id);


--
-- Name: missions PK_787aebb1ac5923c9904043c6309; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT "PK_787aebb1ac5923c9904043c6309" PRIMARY KEY (id);


--
-- Name: actions PK_7bfb822f56be449c0b8adbf83cf; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf" PRIMARY KEY (id);


--
-- Name: activities PK_7f4004429f731ffb9c88eb486a8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY (id);


--
-- Name: lesson_processes PK_829041a8bccb8ec7ed58f23d7ac; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_processes
    ADD CONSTRAINT "PK_829041a8bccb8ec7ed58f23d7ac" PRIMARY KEY (id);


--
-- Name: badges PK_8a651318b8de577e8e217676466; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT "PK_8a651318b8de577e8e217676466" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: lessons PK_9b9a8d455cac672d262d7275730; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY (id);


--
-- Name: quests PK_a037497017b64f530fe09c75364; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quests
    ADD CONSTRAINT "PK_a037497017b64f530fe09c75364" PRIMARY KEY (id);


--
-- Name: questions_to_lessons PK_b915ac4ddad8da21af2acfd443c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions_to_lessons
    ADD CONSTRAINT "PK_b915ac4ddad8da21af2acfd443c" PRIMARY KEY (id);


--
-- Name: items PK_ba5885359424c15ca6b9e79bcf6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY (id);


--
-- Name: profile_missions_progress PK_d52adcba69a8a2ca6513d6882f4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_missions_progress
    ADD CONSTRAINT "PK_d52adcba69a8a2ca6513d6882f4" PRIMARY KEY (id);


--
-- Name: learner_profiles PK_d5c5325dd0d1716cf414f357c08; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_profiles
    ADD CONSTRAINT "PK_d5c5325dd0d1716cf414f357c08" PRIMARY KEY (id);


--
-- Name: actions actions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_name_key UNIQUE (name);


--
-- Name: accounts FK_ACCOUNTS_AVATAR_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "FK_ACCOUNTS_AVATAR_ID" FOREIGN KEY (avatar_id) REFERENCES public.buckets(id);


--
-- Name: accounts FK_ACCOUNTS_LEARNER_PROFILE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "FK_ACCOUNTS_LEARNER_PROFILE_ID" FOREIGN KEY (learner_profile_id) REFERENCES public.learner_profiles(id);


--
-- Name: activities FK_ACTIVITIES_ACTION_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_ACTIVITIES_ACTION_ID" FOREIGN KEY (action_id) REFERENCES public.actions(id) ON DELETE CASCADE;


--
-- Name: activities FK_ACTIVITIES_PROFILE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "FK_ACTIVITIES_PROFILE_ID" FOREIGN KEY (profile_id) REFERENCES public.learner_profiles(id) ON DELETE CASCADE;


--
-- Name: badges FK_BADGES_ACTION_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT "FK_BADGES_ACTION_ID" FOREIGN KEY (action_id) REFERENCES public.actions(id) ON DELETE CASCADE;


--
-- Name: instructions FK_INSTRUCTION_AUDIO_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructions
    ADD CONSTRAINT "FK_INSTRUCTION_AUDIO_ID" FOREIGN KEY (audio_id) REFERENCES public.buckets(id);


--
-- Name: instructions FK_INSTRUCTION_IMAGE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructions
    ADD CONSTRAINT "FK_INSTRUCTION_IMAGE_ID" FOREIGN KEY (image_id) REFERENCES public.buckets(id);


--
-- Name: instructions FK_INSTRUCTION_QUESTION_TYPE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructions
    ADD CONSTRAINT "FK_INSTRUCTION_QUESTION_TYPE_ID" FOREIGN KEY (question_type_id) REFERENCES public.question_types(id);


--
-- Name: learner_profiles FK_LEARNER_PROFILES_LEVEL_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_profiles
    ADD CONSTRAINT "FK_LEARNER_PROFILES_LEVEL_ID" FOREIGN KEY (level_id) REFERENCES public.levels(id);


--
-- Name: learner_profiles FK_LEARNER_PROFILES_STREAK_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learner_profiles
    ADD CONSTRAINT "FK_LEARNER_PROFILES_STREAK_ID" FOREIGN KEY (streak_id) REFERENCES public.streaks(id);


--
-- Name: lessons FK_LESSONS_QUESTION_TYPE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT "FK_LESSONS_QUESTION_TYPE_ID" FOREIGN KEY (question_type_id) REFERENCES public.question_types(id);


--
-- Name: lesson_processes FK_LESSON_PROCESSES_CURRENT_LESSON_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_processes
    ADD CONSTRAINT "FK_LESSON_PROCESSES_CURRENT_LESSON_ID" FOREIGN KEY (current_lesson_id) REFERENCES public.lessons(id);


--
-- Name: lesson_processes FK_LESSON_PROCESSES_LEARNER_PROFILE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_processes
    ADD CONSTRAINT "FK_LESSON_PROCESSES_LEARNER_PROFILE_ID" FOREIGN KEY (learner_profile_id) REFERENCES public.learner_profiles(id);


--
-- Name: lesson_processes FK_LESSON_PROCESSES_QUESTION_TYPE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_processes
    ADD CONSTRAINT "FK_LESSON_PROCESSES_QUESTION_TYPE_ID" FOREIGN KEY (question_type_id) REFERENCES public.question_types(id);


--
-- Name: lesson_records FK_LESSON_RECORDS_LEARNER_PROFILE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_records
    ADD CONSTRAINT "FK_LESSON_RECORDS_LEARNER_PROFILE_ID" FOREIGN KEY (learner_profile_id) REFERENCES public.learner_profiles(id);


--
-- Name: lesson_records FK_LESSON_RECORDS_LESSON_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_records
    ADD CONSTRAINT "FK_LESSON_RECORDS_LESSON_ID" FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: missions FK_MISSIONS_QUEST_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT "FK_MISSIONS_QUEST_ID" FOREIGN KEY (quest_id) REFERENCES public.quests(id) ON DELETE CASCADE;


--
-- Name: profile_badges FK_PROFILE_BADGES_BADGE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_badges
    ADD CONSTRAINT "FK_PROFILE_BADGES_BADGE_ID" FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;


--
-- Name: profile_badges FK_PROFILE_BADGES_PROFILE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_badges
    ADD CONSTRAINT "FK_PROFILE_BADGES_PROFILE_ID" FOREIGN KEY (profile_id) REFERENCES public.learner_profiles(id) ON DELETE CASCADE;


--
-- Name: profile_items FK_PROFILE_ITEMS_ITEM_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_items
    ADD CONSTRAINT "FK_PROFILE_ITEMS_ITEM_ID" FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: profile_items FK_PROFILE_ITEMS_PROFILE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_items
    ADD CONSTRAINT "FK_PROFILE_ITEMS_PROFILE_ID" FOREIGN KEY (profile_id) REFERENCES public.learner_profiles(id) ON DELETE CASCADE;


--
-- Name: profile_missions_progress FK_PROFILE_MISSIONS_MISSION_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_missions_progress
    ADD CONSTRAINT "FK_PROFILE_MISSIONS_MISSION_ID" FOREIGN KEY (mission_id) REFERENCES public.missions(id) ON DELETE CASCADE;


--
-- Name: profile_missions_progress FK_PROFILE_MISSIONS_PROFILE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_missions_progress
    ADD CONSTRAINT "FK_PROFILE_MISSIONS_PROFILE_ID" FOREIGN KEY (profile_id) REFERENCES public.learner_profiles(id) ON DELETE CASCADE;


--
-- Name: questions FK_QUESTION_AUDIO_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "FK_QUESTION_AUDIO_ID" FOREIGN KEY (audio_id) REFERENCES public.buckets(id);


--
-- Name: questions FK_QUESTION_IMAGE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "FK_QUESTION_IMAGE_ID" FOREIGN KEY (image_id) REFERENCES public.buckets(id);


--
-- Name: questions_to_lessons FK_QUESTION_TO_LESSON_LESSON_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions_to_lessons
    ADD CONSTRAINT "FK_QUESTION_TO_LESSON_LESSON_ID" FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: questions_to_lessons FK_QUESTION_TO_LESSON_QUESTION_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions_to_lessons
    ADD CONSTRAINT "FK_QUESTION_TO_LESSON_QUESTION_ID" FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: question_types FK_QUESTION_TYPES_IMAGE_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_types
    ADD CONSTRAINT "FK_QUESTION_TYPES_IMAGE_ID" FOREIGN KEY (image_id) REFERENCES public.buckets(id);


--
-- Name: quests FK_QUESTS_ACTION_ID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quests
    ADD CONSTRAINT "FK_QUESTS_ACTION_ID" FOREIGN KEY (action_id) REFERENCES public.actions(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

