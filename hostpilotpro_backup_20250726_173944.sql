--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addon_bookings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.addon_bookings (
    id integer NOT NULL,
    service_id integer NOT NULL,
    booking_id integer,
    property_id integer NOT NULL,
    guest_name character varying NOT NULL,
    guest_email character varying,
    guest_phone character varying,
    scheduled_date timestamp without time zone NOT NULL,
    duration integer,
    total_price numeric(10,2) NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    charged_to character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    organization_id character varying NOT NULL,
    quantity integer DEFAULT 1,
    base_price numeric(10,2),
    billing_type character varying NOT NULL,
    gift_reason text,
    booked_by character varying NOT NULL,
    booked_by_role character varying NOT NULL,
    approved_by character varying,
    approval_status character varying DEFAULT 'auto-approved'::character varying,
    internal_notes text
);


ALTER TABLE public.addon_bookings OWNER TO neondb_owner;

--
-- Name: addon_bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.addon_bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.addon_bookings_id_seq OWNER TO neondb_owner;

--
-- Name: addon_bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.addon_bookings_id_seq OWNED BY public.addon_bookings.id;


--
-- Name: addon_services; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.addon_services (
    id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    category character varying NOT NULL,
    duration integer,
    is_active boolean DEFAULT true,
    available_properties integer[],
    max_advance_booking_days integer DEFAULT 30,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    organization_id character varying NOT NULL,
    pricing_model character varying DEFAULT 'fixed'::character varying NOT NULL,
    base_price numeric(10,2),
    hourly_rate numeric(10,2),
    minimum_charge numeric(10,2),
    requires_approval boolean DEFAULT false,
    allow_guest_booking boolean DEFAULT true,
    allow_manager_booking boolean DEFAULT true
);


ALTER TABLE public.addon_services OWNER TO neondb_owner;

--
-- Name: addon_services_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.addon_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.addon_services_id_seq OWNER TO neondb_owner;

--
-- Name: addon_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.addon_services_id_seq OWNED BY public.addon_services.id;


--
-- Name: agent_bookings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.agent_bookings (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    retail_agent_id character varying NOT NULL,
    property_id integer NOT NULL,
    booking_id integer,
    guest_name character varying NOT NULL,
    guest_email character varying NOT NULL,
    guest_phone character varying,
    check_in date NOT NULL,
    check_out date NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    commission_rate numeric(5,2) DEFAULT 10.00,
    commission_amount numeric(10,2) NOT NULL,
    booking_status character varying DEFAULT 'confirmed'::character varying,
    commission_status character varying DEFAULT 'pending'::character varying,
    hostaway_booking_id character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.agent_bookings OWNER TO neondb_owner;

--
-- Name: agent_bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.agent_bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agent_bookings_id_seq OWNER TO neondb_owner;

--
-- Name: agent_bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.agent_bookings_id_seq OWNED BY public.agent_bookings.id;


--
-- Name: agent_media_access; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.agent_media_access (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    agent_id character varying NOT NULL,
    media_file_id integer,
    folder_id integer,
    access_type character varying NOT NULL,
    access_reason character varying,
    ip_address character varying,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.agent_media_access OWNER TO neondb_owner;

--
-- Name: agent_media_access_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.agent_media_access_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agent_media_access_id_seq OWNER TO neondb_owner;

--
-- Name: agent_media_access_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.agent_media_access_id_seq OWNED BY public.agent_media_access.id;


--
-- Name: agent_payouts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.agent_payouts (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    agent_id character varying NOT NULL,
    agent_type character varying NOT NULL,
    payout_month character varying NOT NULL,
    total_earnings numeric(10,2) NOT NULL,
    payout_amount numeric(10,2) NOT NULL,
    payout_status character varying DEFAULT 'pending'::character varying,
    payout_method character varying,
    payment_reference character varying,
    receipt_url character varying,
    processed_by character varying,
    notes text,
    requested_at timestamp without time zone DEFAULT now(),
    approved_at timestamp without time zone,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.agent_payouts OWNER TO neondb_owner;

--
-- Name: agent_payouts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.agent_payouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agent_payouts_id_seq OWNER TO neondb_owner;

--
-- Name: agent_payouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.agent_payouts_id_seq OWNED BY public.agent_payouts.id;


--
-- Name: ai_configuration; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_configuration (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    auto_processing_enabled boolean DEFAULT true,
    ai_provider character varying DEFAULT 'keyword'::character varying,
    confidence_threshold numeric(3,2) DEFAULT 0.75,
    auto_task_creation boolean DEFAULT true,
    require_manager_approval boolean DEFAULT false,
    notification_settings jsonb,
    processing_cooldown integer DEFAULT 300,
    debug_mode boolean DEFAULT false,
    last_updated_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_configuration OWNER TO neondb_owner;

--
-- Name: ai_configuration_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ai_configuration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_configuration_id_seq OWNER TO neondb_owner;

--
-- Name: ai_configuration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ai_configuration_id_seq OWNED BY public.ai_configuration.id;


--
-- Name: ai_generated_tasks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_generated_tasks (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    message_id integer,
    task_id integer,
    guest_id character varying NOT NULL,
    property_id integer NOT NULL,
    department character varying NOT NULL,
    task_type character varying NOT NULL,
    urgency character varying NOT NULL,
    ai_description text NOT NULL,
    ai_keywords text[] DEFAULT ARRAY[]::text[],
    confidence numeric(5,2) NOT NULL,
    status character varying DEFAULT 'pending'::character varying,
    assigned_to character varying,
    approved_by character varying,
    approved_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_generated_tasks OWNER TO neondb_owner;

--
-- Name: ai_generated_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ai_generated_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_generated_tasks_id_seq OWNER TO neondb_owner;

--
-- Name: ai_generated_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ai_generated_tasks_id_seq OWNED BY public.ai_generated_tasks.id;


--
-- Name: ai_media_suggestions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_media_suggestions (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    suggestion_type character varying NOT NULL,
    suggestion_text text NOT NULL,
    priority character varying DEFAULT 'medium'::character varying NOT NULL,
    confidence_score character varying,
    detected_issues character varying[],
    suggested_actions character varying[],
    trigger_source character varying,
    auto_actionable boolean DEFAULT false,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    reviewed_by character varying,
    review_date timestamp without time zone,
    review_notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_media_suggestions OWNER TO neondb_owner;

--
-- Name: ai_media_suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ai_media_suggestions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_media_suggestions_id_seq OWNER TO neondb_owner;

--
-- Name: ai_media_suggestions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ai_media_suggestions_id_seq OWNED BY public.ai_media_suggestions.id;


--
-- Name: ai_ops_anomalies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_ops_anomalies (
    id integer NOT NULL,
    organization_id text DEFAULT 'default-org'::text NOT NULL,
    property_id integer,
    anomaly_type text NOT NULL,
    severity text NOT NULL,
    status text NOT NULL,
    details jsonb,
    auto_fixed boolean DEFAULT false NOT NULL,
    fix_action text,
    detected_at timestamp without time zone NOT NULL,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ai_ops_anomalies_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))),
    CONSTRAINT ai_ops_anomalies_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in-progress'::text, 'resolved'::text])))
);


ALTER TABLE public.ai_ops_anomalies OWNER TO neondb_owner;

--
-- Name: ai_ops_anomalies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ai_ops_anomalies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_ops_anomalies_id_seq OWNER TO neondb_owner;

--
-- Name: ai_ops_anomalies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ai_ops_anomalies_id_seq OWNED BY public.ai_ops_anomalies.id;


--
-- Name: ai_roi_predictions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_roi_predictions (
    id integer NOT NULL,
    organization_id text NOT NULL,
    property_id integer,
    forecast_start date,
    forecast_end date,
    predicted_roi numeric(6,2),
    predicted_occupancy numeric(6,2),
    ai_notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_roi_predictions OWNER TO neondb_owner;

--
-- Name: ai_roi_predictions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ai_roi_predictions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_roi_predictions_id_seq OWNER TO neondb_owner;

--
-- Name: ai_roi_predictions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ai_roi_predictions_id_seq OWNED BY public.ai_roi_predictions.id;


--
-- Name: ai_task_rules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_task_rules (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    rule_name character varying NOT NULL,
    keywords jsonb NOT NULL,
    task_type character varying NOT NULL,
    task_title character varying NOT NULL,
    task_description text,
    assign_to_department character varying,
    default_assignee character varying,
    priority character varying DEFAULT 'medium'::character varying,
    auto_assign boolean DEFAULT true,
    is_active boolean DEFAULT true,
    trigger_count integer DEFAULT 0,
    last_triggered timestamp without time zone,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_task_rules OWNER TO neondb_owner;

--
-- Name: ai_task_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ai_task_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_task_rules_id_seq OWNER TO neondb_owner;

--
-- Name: ai_task_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ai_task_rules_id_seq OWNED BY public.ai_task_rules.id;


--
-- Name: ai_virtual_managers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_virtual_managers (
    id integer NOT NULL,
    property_id integer,
    organization_id character varying NOT NULL,
    avatar_name character varying DEFAULT 'HostPilot AI'::character varying,
    knowledge_base jsonb,
    language character varying DEFAULT 'en'::character varying,
    last_active timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    total_interactions integer DEFAULT 0,
    avg_response_time numeric(8,2) DEFAULT 0,
    satisfaction_score numeric(3,2) DEFAULT 0
);


ALTER TABLE public.ai_virtual_managers OWNER TO neondb_owner;

--
-- Name: ai_virtual_managers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ai_virtual_managers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_virtual_managers_id_seq OWNER TO neondb_owner;

--
-- Name: ai_virtual_managers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ai_virtual_managers_id_seq OWNED BY public.ai_virtual_managers.id;


--
-- Name: booking_cost_breakdowns; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.booking_cost_breakdowns (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    booking_id integer NOT NULL,
    cost_type character varying NOT NULL,
    description character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying DEFAULT 'THB'::character varying,
    quantity integer DEFAULT 1,
    unit_price numeric(10,2),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.booking_cost_breakdowns OWNER TO neondb_owner;

--
-- Name: booking_cost_breakdowns_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.booking_cost_breakdowns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_cost_breakdowns_id_seq OWNER TO neondb_owner;

--
-- Name: booking_cost_breakdowns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.booking_cost_breakdowns_id_seq OWNED BY public.booking_cost_breakdowns.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    property_id integer,
    guest_name character varying NOT NULL,
    guest_email character varying,
    guest_phone character varying,
    check_in date NOT NULL,
    check_out date NOT NULL,
    guests integer NOT NULL,
    total_amount numeric(10,2),
    status character varying DEFAULT 'confirmed'::character varying NOT NULL,
    hostaway_id character varying,
    special_requests text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    organization_id character varying NOT NULL,
    external_id character varying,
    currency character varying DEFAULT 'AUD'::character varying,
    booking_reference character varying,
    guest_total_price numeric(10,2),
    platform_payout numeric(10,2),
    ota_commission_amount numeric(10,2),
    ota_commission_percentage numeric(5,2),
    booking_platform character varying DEFAULT 'direct'::character varying,
    stripe_fees numeric(10,2),
    net_host_payout numeric(10,2),
    manual_override boolean DEFAULT false,
    override_reason text,
    revenue_verified boolean DEFAULT false
);


ALTER TABLE public.bookings OWNER TO neondb_owner;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO neondb_owner;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: commission_earnings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.commission_earnings (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    user_id character varying NOT NULL,
    source_type character varying NOT NULL,
    source_id integer,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying,
    commission_rate numeric(5,2) NOT NULL,
    base_amount numeric(10,2) NOT NULL,
    period character varying NOT NULL,
    status character varying DEFAULT 'pending'::character varying,
    processed_by character varying,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.commission_earnings OWNER TO neondb_owner;

--
-- Name: commission_earnings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.commission_earnings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commission_earnings_id_seq OWNER TO neondb_owner;

--
-- Name: commission_earnings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.commission_earnings_id_seq OWNED BY public.commission_earnings.id;


--
-- Name: commission_invoice_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.commission_invoice_items (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    invoice_id integer NOT NULL,
    commission_log_id integer,
    description text NOT NULL,
    property_name character varying,
    reference_number character varying,
    commission_date character varying NOT NULL,
    commission_amount character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.commission_invoice_items OWNER TO neondb_owner;

--
-- Name: commission_invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.commission_invoice_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commission_invoice_items_id_seq OWNER TO neondb_owner;

--
-- Name: commission_invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.commission_invoice_items_id_seq OWNED BY public.commission_invoice_items.id;


--
-- Name: commission_invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.commission_invoices (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    agent_id character varying NOT NULL,
    agent_type character varying NOT NULL,
    invoice_number character varying NOT NULL,
    invoice_date character varying NOT NULL,
    period_start character varying NOT NULL,
    period_end character varying NOT NULL,
    total_commissions character varying NOT NULL,
    currency character varying DEFAULT 'THB'::character varying NOT NULL,
    description text,
    agent_notes text,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    submitted_at timestamp without time zone,
    approved_at timestamp without time zone,
    approved_by character varying,
    rejected_reason text,
    admin_notes text,
    generated_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    due_date character varying,
    CONSTRAINT commission_invoices_agent_type_check CHECK (((agent_type)::text = ANY ((ARRAY['retail-agent'::character varying, 'referral-agent'::character varying])::text[]))),
    CONSTRAINT commission_invoices_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'submitted'::character varying, 'approved'::character varying, 'rejected'::character varying, 'paid'::character varying])::text[])))
);


ALTER TABLE public.commission_invoices OWNER TO neondb_owner;

--
-- Name: commission_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.commission_invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commission_invoices_id_seq OWNER TO neondb_owner;

--
-- Name: commission_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.commission_invoices_id_seq OWNED BY public.commission_invoices.id;


--
-- Name: commission_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.commission_log (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    agent_id character varying NOT NULL,
    agent_type character varying NOT NULL,
    property_id integer,
    booking_id integer,
    reference_number character varying,
    base_amount character varying NOT NULL,
    commission_rate character varying NOT NULL,
    commission_amount character varying NOT NULL,
    currency character varying DEFAULT 'THB'::character varying NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    is_adjustment boolean DEFAULT false,
    original_commission_id integer,
    adjustment_reason text,
    processed_by character varying,
    processed_at timestamp without time zone,
    admin_notes text,
    commission_month integer,
    commission_year integer,
    payout_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT commission_log_agent_type_check CHECK (((agent_type)::text = ANY ((ARRAY['retail-agent'::character varying, 'referral-agent'::character varying])::text[]))),
    CONSTRAINT commission_log_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.commission_log OWNER TO neondb_owner;

--
-- Name: commission_log_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.commission_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commission_log_id_seq OWNER TO neondb_owner;

--
-- Name: commission_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.commission_log_id_seq OWNED BY public.commission_log.id;


--
-- Name: currency_rates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.currency_rates (
    id integer NOT NULL,
    base_currency character varying(3) NOT NULL,
    target_currency character varying(3) NOT NULL,
    rate numeric(10,6) NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.currency_rates OWNER TO neondb_owner;

--
-- Name: currency_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.currency_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.currency_rates_id_seq OWNER TO neondb_owner;

--
-- Name: currency_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.currency_rates_id_seq OWNED BY public.currency_rates.id;


--
-- Name: custom_expense_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.custom_expense_categories (
    id integer NOT NULL,
    organization_id character varying(255) NOT NULL,
    category_name character varying(255) NOT NULL,
    description text,
    billing_cycle character varying(50) DEFAULT 'monthly'::character varying,
    default_amount character varying(50),
    currency character varying(10) DEFAULT 'THB'::character varying,
    display_order integer DEFAULT 1,
    created_by character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_recurring boolean DEFAULT true,
    auto_reminder boolean DEFAULT true,
    reminder_days integer DEFAULT 5,
    is_active boolean DEFAULT true
);


ALTER TABLE public.custom_expense_categories OWNER TO neondb_owner;

--
-- Name: custom_expense_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.custom_expense_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_expense_categories_id_seq OWNER TO neondb_owner;

--
-- Name: custom_expense_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.custom_expense_categories_id_seq OWNED BY public.custom_expense_categories.id;


--
-- Name: damage_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.damage_reports (
    id integer NOT NULL,
    booking_id integer,
    property_id integer,
    description text,
    photo_url text,
    repair_cost numeric(10,2),
    charged_to_guest boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.damage_reports OWNER TO neondb_owner;

--
-- Name: damage_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.damage_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.damage_reports_id_seq OWNER TO neondb_owner;

--
-- Name: damage_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.damage_reports_id_seq OWNED BY public.damage_reports.id;


--
-- Name: dynamic_pricing_recommendations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.dynamic_pricing_recommendations (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer,
    current_rate numeric(10,2),
    recommended_rate numeric(10,2),
    market_source character varying,
    confidence_score numeric(4,2),
    generated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.dynamic_pricing_recommendations OWNER TO neondb_owner;

--
-- Name: dynamic_pricing_recommendations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.dynamic_pricing_recommendations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dynamic_pricing_recommendations_id_seq OWNER TO neondb_owner;

--
-- Name: dynamic_pricing_recommendations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.dynamic_pricing_recommendations_id_seq OWNED BY public.dynamic_pricing_recommendations.id;


--
-- Name: feedback_processing_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.feedback_processing_log (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    feedback_id integer NOT NULL,
    processing_type character varying NOT NULL,
    triggered_rule_id integer,
    matched_keywords jsonb,
    confidence_score numeric(3,2),
    action_taken character varying NOT NULL,
    created_task_id integer,
    processed_by character varying,
    ai_model character varying,
    processing_time integer,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.feedback_processing_log OWNER TO neondb_owner;

--
-- Name: feedback_processing_log_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.feedback_processing_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feedback_processing_log_id_seq OWNER TO neondb_owner;

--
-- Name: feedback_processing_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.feedback_processing_log_id_seq OWNED BY public.feedback_processing_log.id;


--
-- Name: finances; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.finances (
    id integer NOT NULL,
    property_id integer,
    booking_id integer,
    type character varying NOT NULL,
    category character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text,
    date date NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    subcategory character varying,
    due_date date,
    is_recurring boolean DEFAULT false,
    recurring_type character varying,
    next_due_date date,
    owner_id character varying,
    agent_id character varying,
    commission_rate numeric(5,2),
    source character varying NOT NULL,
    source_type character varying,
    processed_by character varying,
    reference_number character varying,
    attachment_url character varying
);


ALTER TABLE public.finances OWNER TO neondb_owner;

--
-- Name: finances_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.finances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.finances_id_seq OWNER TO neondb_owner;

--
-- Name: finances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.finances_id_seq OWNED BY public.finances.id;


--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.financial_transactions (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    transaction_type character varying NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(3) DEFAULT 'AUD'::character varying,
    from_party character varying,
    to_party character varying,
    reference_type character varying,
    reference_id integer,
    booking_reference character varying,
    source_platform character varying,
    platform_booking_id character varying,
    description text NOT NULL,
    category character varying,
    status character varying DEFAULT 'pending'::character varying,
    processed_by character varying,
    processed_at timestamp without time zone,
    receipt_url character varying,
    invoice_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.financial_transactions OWNER TO neondb_owner;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.financial_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financial_transactions_id_seq OWNER TO neondb_owner;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.financial_transactions_id_seq OWNED BY public.financial_transactions.id;


--
-- Name: guest_activity_timeline; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_activity_timeline (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    guest_session_id integer NOT NULL,
    booking_id integer,
    activity_type character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    status character varying DEFAULT 'pending'::character varying,
    requested_at timestamp without time zone NOT NULL,
    confirmed_at timestamp without time zone,
    completed_at timestamp without time zone,
    estimated_cost numeric(10,2),
    actual_cost numeric(10,2),
    charge_assignment character varying DEFAULT 'guest'::character varying,
    is_visible boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guest_activity_timeline OWNER TO neondb_owner;

--
-- Name: guest_activity_timeline_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_activity_timeline_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_activity_timeline_id_seq OWNER TO neondb_owner;

--
-- Name: guest_activity_timeline_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_activity_timeline_id_seq OWNED BY public.guest_activity_timeline.id;


--
-- Name: guest_addon_bookings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_addon_bookings (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    service_id integer NOT NULL,
    property_id integer NOT NULL,
    guest_name character varying NOT NULL,
    guest_email character varying NOT NULL,
    guest_phone character varying,
    booking_date timestamp without time zone DEFAULT now(),
    service_date timestamp without time zone NOT NULL,
    status character varying DEFAULT 'pending'::character varying,
    total_amount character varying NOT NULL,
    currency character varying DEFAULT 'AUD'::character varying,
    billing_route character varying NOT NULL,
    complimentary_type character varying,
    payment_status character varying DEFAULT 'pending'::character varying,
    payment_method character varying,
    stripe_payment_intent_id character varying,
    special_requests text,
    internal_notes text,
    assigned_task_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    booked_by character varying,
    confirmed_by character varying,
    cancelled_by character varying,
    cancellation_reason text
);


ALTER TABLE public.guest_addon_bookings OWNER TO neondb_owner;

--
-- Name: guest_addon_bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_addon_bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_addon_bookings_id_seq OWNER TO neondb_owner;

--
-- Name: guest_addon_bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_addon_bookings_id_seq OWNED BY public.guest_addon_bookings.id;


--
-- Name: guest_addon_service_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_addon_service_requests (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    guest_session_id integer NOT NULL,
    booking_id integer,
    service_id integer,
    service_name character varying NOT NULL,
    service_type character varying NOT NULL,
    requested_date date NOT NULL,
    requested_time character varying,
    duration integer,
    guest_count integer DEFAULT 1,
    unit_price numeric(10,2) NOT NULL,
    quantity integer DEFAULT 1,
    total_cost numeric(10,2) NOT NULL,
    charge_assignment character varying DEFAULT 'guest'::character varying,
    assignment_reason text,
    special_requests text,
    guest_notes text,
    request_status character varying DEFAULT 'pending'::character varying,
    confirmed_by character varying,
    confirmed_at timestamp without time zone,
    completed_at timestamp without time zone,
    completion_notes text,
    guest_rating integer,
    guest_review text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guest_addon_service_requests OWNER TO neondb_owner;

--
-- Name: guest_addon_service_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_addon_service_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_addon_service_requests_id_seq OWNER TO neondb_owner;

--
-- Name: guest_addon_service_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_addon_service_requests_id_seq OWNED BY public.guest_addon_service_requests.id;


--
-- Name: guest_addon_services; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_addon_services (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    service_name character varying NOT NULL,
    description text,
    category character varying NOT NULL,
    pricing_type character varying NOT NULL,
    base_price character varying NOT NULL,
    currency character varying DEFAULT 'AUD'::character varying NOT NULL,
    is_active boolean DEFAULT true,
    requires_time_slot boolean DEFAULT false,
    max_advance_booking_days integer DEFAULT 30,
    cancellation_policy_hours integer DEFAULT 24,
    auto_create_task boolean DEFAULT true,
    task_type character varying,
    task_priority character varying DEFAULT 'medium'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    created_by character varying
);


ALTER TABLE public.guest_addon_services OWNER TO neondb_owner;

--
-- Name: guest_addon_services_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_addon_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_addon_services_id_seq OWNER TO neondb_owner;

--
-- Name: guest_addon_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_addon_services_id_seq OWNED BY public.guest_addon_services.id;


--
-- Name: guest_ai_faq_knowledge; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_ai_faq_knowledge (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer,
    question_keyword character varying NOT NULL,
    response_text text NOT NULL,
    category character varying DEFAULT 'general'::character varying,
    priority integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guest_ai_faq_knowledge OWNER TO neondb_owner;

--
-- Name: guest_ai_faq_knowledge_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_ai_faq_knowledge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_ai_faq_knowledge_id_seq OWNER TO neondb_owner;

--
-- Name: guest_ai_faq_knowledge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_ai_faq_knowledge_id_seq OWNED BY public.guest_ai_faq_knowledge.id;


--
-- Name: guest_chat_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_chat_messages (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    guest_session_id integer NOT NULL,
    booking_id integer,
    message_type character varying NOT NULL,
    sender_type character varying NOT NULL,
    message_content text NOT NULL,
    message_thread_id character varying,
    ai_processed boolean DEFAULT false,
    detected_issue character varying,
    issue_severity character varying,
    requires_staff_response boolean DEFAULT false,
    sent_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guest_chat_messages OWNER TO neondb_owner;

--
-- Name: guest_chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_chat_messages_id_seq OWNER TO neondb_owner;

--
-- Name: guest_chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_chat_messages_id_seq OWNED BY public.guest_chat_messages.id;


--
-- Name: guest_feedback; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_feedback (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    booking_id integer,
    property_id integer,
    guest_name character varying NOT NULL,
    guest_email character varying,
    feedback_type character varying NOT NULL,
    feedback_channel character varying DEFAULT 'portal'::character varying,
    original_message text NOT NULL,
    detected_keywords jsonb,
    sentiment_score numeric(3,2),
    urgency_level character varying DEFAULT 'medium'::character varying,
    is_processed boolean DEFAULT false,
    requires_action boolean DEFAULT false,
    assigned_task_id integer,
    processed_by character varying,
    processing_notes text,
    received_at timestamp without time zone DEFAULT now(),
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guest_feedback OWNER TO neondb_owner;

--
-- Name: guest_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_feedback_id_seq OWNER TO neondb_owner;

--
-- Name: guest_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_feedback_id_seq OWNED BY public.guest_feedback.id;


--
-- Name: guest_id_scans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_id_scans (
    id integer NOT NULL,
    booking_id integer,
    guest_name character varying,
    document_type character varying,
    scan_url text,
    ocr_data jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guest_id_scans OWNER TO neondb_owner;

--
-- Name: guest_id_scans_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_id_scans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_id_scans_id_seq OWNER TO neondb_owner;

--
-- Name: guest_id_scans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_id_scans_id_seq OWNED BY public.guest_id_scans.id;


--
-- Name: guest_maintenance_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_maintenance_reports (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    guest_session_id integer NOT NULL,
    booking_id integer,
    property_id integer NOT NULL,
    issue_type character varying NOT NULL,
    issue_title character varying NOT NULL,
    issue_description text NOT NULL,
    location_in_property character varying NOT NULL,
    severity_level character varying DEFAULT 'medium'::character varying,
    report_images text[],
    report_videos text[],
    report_status character varying DEFAULT 'pending'::character varying,
    assigned_to character varying,
    assigned_at timestamp without time zone,
    estimated_resolution_time timestamp without time zone,
    actual_resolution_time timestamp without time zone,
    resolution_notes text,
    resolution_images text[],
    reported_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guest_maintenance_reports OWNER TO neondb_owner;

--
-- Name: guest_maintenance_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_maintenance_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_maintenance_reports_id_seq OWNER TO neondb_owner;

--
-- Name: guest_maintenance_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_maintenance_reports_id_seq OWNED BY public.guest_maintenance_reports.id;


--
-- Name: guest_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_messages (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    guest_id character varying NOT NULL,
    guest_name character varying NOT NULL,
    guest_email character varying,
    booking_id integer,
    property_id integer,
    message_content text NOT NULL,
    message_type character varying NOT NULL,
    priority character varying DEFAULT 'normal'::character varying,
    status character varying DEFAULT 'new'::character varying,
    ai_processed boolean DEFAULT false,
    ai_keywords text[] DEFAULT ARRAY[]::text[],
    ai_sentiment character varying,
    ai_confidence numeric(5,2),
    ai_suggestions text[] DEFAULT ARRAY[]::text[],
    staff_response text,
    responded_by character varying,
    responded_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guest_messages OWNER TO neondb_owner;

--
-- Name: guest_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_messages_id_seq OWNER TO neondb_owner;

--
-- Name: guest_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_messages_id_seq OWNED BY public.guest_messages.id;


--
-- Name: guest_portal_access; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_portal_access (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    guest_email character varying NOT NULL,
    access_token character varying NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true,
    booking_reference character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    guest_name character varying,
    check_in_date timestamp without time zone,
    check_out_date timestamp without time zone,
    created_by character varying,
    last_accessed_at timestamp without time zone
);


ALTER TABLE public.guest_portal_access OWNER TO neondb_owner;

--
-- Name: guest_portal_access_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_portal_access_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_portal_access_id_seq OWNER TO neondb_owner;

--
-- Name: guest_portal_access_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_portal_access_id_seq OWNED BY public.guest_portal_access.id;


--
-- Name: guest_portal_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_portal_sessions (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    booking_id integer,
    guest_email character varying NOT NULL,
    access_token character varying NOT NULL,
    property_id integer,
    check_in_date date NOT NULL,
    check_out_date date NOT NULL,
    guest_name character varying,
    guest_phone character varying,
    is_active boolean DEFAULT true,
    expires_at timestamp without time zone NOT NULL,
    last_accessed timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guest_portal_sessions OWNER TO neondb_owner;

--
-- Name: guest_portal_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_portal_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_portal_sessions_id_seq OWNER TO neondb_owner;

--
-- Name: guest_portal_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_portal_sessions_id_seq OWNED BY public.guest_portal_sessions.id;


--
-- Name: guest_property_local_info; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_property_local_info (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    location_type character varying NOT NULL,
    location_name character varying NOT NULL,
    description text,
    location_address text,
    distance_from_property numeric(5,2),
    estimated_cost numeric(10,2),
    recommendation_score integer,
    operating_hours character varying,
    contact_info character varying,
    booking_url character varying,
    display_order integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guest_property_local_info OWNER TO neondb_owner;

--
-- Name: guest_property_local_info_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_property_local_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_property_local_info_id_seq OWNER TO neondb_owner;

--
-- Name: guest_property_local_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_property_local_info_id_seq OWNED BY public.guest_property_local_info.id;


--
-- Name: guest_service_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guest_service_requests (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    guest_id character varying NOT NULL,
    guest_name character varying NOT NULL,
    booking_id integer,
    property_id integer NOT NULL,
    service_type character varying NOT NULL,
    service_name character varying NOT NULL,
    requested_date timestamp without time zone,
    requested_time character varying,
    number_of_guests integer DEFAULT 1,
    special_requests text,
    estimated_cost numeric(10,2),
    currency character varying DEFAULT 'AUD'::character varying,
    payment_method character varying,
    status character varying DEFAULT 'pending'::character varying,
    confirmed_by character varying,
    confirmed_at timestamp without time zone,
    completed_at timestamp without time zone,
    guest_rating integer,
    guest_feedback text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.guest_service_requests OWNER TO neondb_owner;

--
-- Name: guest_service_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guest_service_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guest_service_requests_id_seq OWNER TO neondb_owner;

--
-- Name: guest_service_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.guest_service_requests_id_seq OWNED BY public.guest_service_requests.id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inventory (
    id integer NOT NULL,
    property_id integer,
    item_name character varying NOT NULL,
    category character varying NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    min_quantity integer DEFAULT 0,
    unit_cost numeric(10,2),
    supplier character varying,
    last_restocked timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    usage_tracking boolean DEFAULT false
);


ALTER TABLE public.inventory OWNER TO neondb_owner;

--
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_id_seq OWNER TO neondb_owner;

--
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inventory_id_seq OWNED BY public.inventory.id;


--
-- Name: invoice_line_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoice_line_items (
    id integer NOT NULL,
    invoice_id integer,
    description text NOT NULL,
    quantity numeric(10,2) DEFAULT '1'::numeric,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    reference_id character varying,
    reference_type character varying
);


ALTER TABLE public.invoice_line_items OWNER TO neondb_owner;

--
-- Name: invoice_line_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.invoice_line_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_line_items_id_seq OWNER TO neondb_owner;

--
-- Name: invoice_line_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.invoice_line_items_id_seq OWNED BY public.invoice_line_items.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    invoice_number character varying NOT NULL,
    sender_type character varying NOT NULL,
    sender_id character varying,
    sender_name character varying NOT NULL,
    sender_address text,
    receiver_type character varying NOT NULL,
    receiver_id character varying,
    receiver_name character varying NOT NULL,
    receiver_address text,
    invoice_type character varying NOT NULL,
    description text NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT '0'::numeric,
    tax_amount numeric(10,2) DEFAULT '0'::numeric,
    total_amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying,
    status character varying DEFAULT 'draft'::character varying,
    due_date date,
    paid_date date,
    reference_number character varying,
    notes text,
    attachments jsonb,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.invoices OWNER TO neondb_owner;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO neondb_owner;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: legal_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.legal_templates (
    id integer NOT NULL,
    organization_id character varying DEFAULT 'default-org'::character varying NOT NULL,
    country_code character varying(3) NOT NULL,
    doc_type character varying NOT NULL,
    template_text text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.legal_templates OWNER TO neondb_owner;

--
-- Name: legal_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.legal_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.legal_templates_id_seq OWNER TO neondb_owner;

--
-- Name: legal_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.legal_templates_id_seq OWNED BY public.legal_templates.id;


--
-- Name: maintenance_approval_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.maintenance_approval_logs (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    suggestion_id integer NOT NULL,
    action character varying NOT NULL,
    action_by character varying NOT NULL,
    action_reason text,
    previous_status character varying,
    new_status character varying,
    approval_notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.maintenance_approval_logs OWNER TO neondb_owner;

--
-- Name: maintenance_approval_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.maintenance_approval_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_approval_logs_id_seq OWNER TO neondb_owner;

--
-- Name: maintenance_approval_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.maintenance_approval_logs_id_seq OWNED BY public.maintenance_approval_logs.id;


--
-- Name: maintenance_budget_forecasts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.maintenance_budget_forecasts (
    id integer NOT NULL,
    property_id integer,
    forecast_year integer NOT NULL,
    expected_cost numeric(12,2),
    ai_notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.maintenance_budget_forecasts OWNER TO neondb_owner;

--
-- Name: maintenance_budget_forecasts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.maintenance_budget_forecasts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_budget_forecasts_id_seq OWNER TO neondb_owner;

--
-- Name: maintenance_budget_forecasts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.maintenance_budget_forecasts_id_seq OWNED BY public.maintenance_budget_forecasts.id;


--
-- Name: maintenance_suggestion_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.maintenance_suggestion_settings (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    owner_approval_required boolean DEFAULT true,
    auto_approve_under_amount numeric(10,2) DEFAULT 100.00,
    approval_timeout_days integer DEFAULT 7,
    require_multiple_quotes boolean DEFAULT false,
    multiple_quotes_threshold numeric(10,2) DEFAULT 500.00,
    require_photos boolean DEFAULT true,
    require_detailed_description boolean DEFAULT true,
    max_attachment_size integer DEFAULT 10485760,
    allowed_file_types text[] DEFAULT ARRAY['jpg'::text, 'jpeg'::text, 'png'::text, 'pdf'::text, 'doc'::text, 'docx'::text],
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.maintenance_suggestion_settings OWNER TO neondb_owner;

--
-- Name: maintenance_suggestion_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.maintenance_suggestion_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_suggestion_settings_id_seq OWNER TO neondb_owner;

--
-- Name: maintenance_suggestion_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.maintenance_suggestion_settings_id_seq OWNED BY public.maintenance_suggestion_settings.id;


--
-- Name: maintenance_suggestions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.maintenance_suggestions (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    title character varying NOT NULL,
    maintenance_type character varying NOT NULL,
    description text NOT NULL,
    estimated_cost numeric(10,2),
    is_urgent boolean DEFAULT false,
    photos text[] DEFAULT ARRAY[]::text[],
    status character varying DEFAULT 'pending'::character varying,
    approval_status character varying DEFAULT 'pending'::character varying,
    owner_comments text,
    suggested_by character varying NOT NULL,
    approved_by character varying,
    payment_responsibility character varying DEFAULT 'owner'::character varying,
    external_contractor_required boolean DEFAULT false,
    preferred_contractor_id integer,
    completion_deadline date,
    approval_deadline date,
    task_created_id integer,
    finance_entry_id integer,
    timeline_entry_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    urgency_level character varying DEFAULT 'normal'::character varying,
    currency character varying DEFAULT 'AUD'::character varying,
    cost_breakdown jsonb,
    who_pays_cost character varying DEFAULT 'owner'::character varying,
    attachments text[] DEFAULT ARRAY[]::text[],
    evidence_photos text[] DEFAULT ARRAY[]::text[],
    supporting_documents text[] DEFAULT ARRAY[]::text[],
    submitted_by_role character varying,
    submission_reason text,
    owner_response character varying,
    owner_response_notes text,
    owner_responded_at timestamp without time zone,
    external_contractor_info jsonb,
    task_created_at timestamp without time zone,
    finance_recorded_at timestamp without time zone,
    system_notes text,
    visible_to_owner boolean DEFAULT true,
    notification_sent_at timestamp without time zone,
    reminder_count integer DEFAULT 0,
    submitted_by character varying
);


ALTER TABLE public.maintenance_suggestions OWNER TO neondb_owner;

--
-- Name: maintenance_suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.maintenance_suggestions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_suggestions_id_seq OWNER TO neondb_owner;

--
-- Name: maintenance_suggestions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.maintenance_suggestions_id_seq OWNED BY public.maintenance_suggestions.id;


--
-- Name: maintenance_timeline_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.maintenance_timeline_entries (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    suggestion_id integer NOT NULL,
    entry_type character varying NOT NULL,
    entry_title character varying NOT NULL,
    entry_description text,
    entry_icon character varying DEFAULT 'wrench'::character varying,
    visible_to_owner boolean DEFAULT true,
    visible_to_staff boolean DEFAULT true,
    visible_to_guests boolean DEFAULT false,
    created_by character varying NOT NULL,
    affects_users text[] DEFAULT ARRAY[]::text[],
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.maintenance_timeline_entries OWNER TO neondb_owner;

--
-- Name: maintenance_timeline_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.maintenance_timeline_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_timeline_entries_id_seq OWNER TO neondb_owner;

--
-- Name: maintenance_timeline_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.maintenance_timeline_entries_id_seq OWNED BY public.maintenance_timeline_entries.id;


--
-- Name: marketing_packs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.marketing_packs (
    id integer NOT NULL,
    organization_id character varying DEFAULT 'default-org'::character varying NOT NULL,
    property_id integer,
    generated_by character varying,
    pdf_url text,
    ai_summary text,
    pack_type character varying DEFAULT 'standard'::character varying,
    target_audience character varying DEFAULT 'general'::character varying,
    language character varying DEFAULT 'en'::character varying,
    status character varying DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.marketing_packs OWNER TO neondb_owner;

--
-- Name: marketing_packs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.marketing_packs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marketing_packs_id_seq OWNER TO neondb_owner;

--
-- Name: marketing_packs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.marketing_packs_id_seq OWNED BY public.marketing_packs.id;


--
-- Name: marketplace_service_analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.marketplace_service_analytics (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    service_id integer NOT NULL,
    property_id integer,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_bookings integer DEFAULT 0,
    total_revenue numeric(12,2) DEFAULT 0,
    average_rating numeric(3,2) DEFAULT 0,
    most_requested_time character varying,
    peak_season_months text[],
    customer_satisfaction_score numeric(3,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.marketplace_service_analytics OWNER TO neondb_owner;

--
-- Name: marketplace_service_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.marketplace_service_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marketplace_service_analytics_id_seq OWNER TO neondb_owner;

--
-- Name: marketplace_service_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.marketplace_service_analytics_id_seq OWNED BY public.marketplace_service_analytics.id;


--
-- Name: marketplace_services; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.marketplace_services (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    vendor_id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying NOT NULL,
    description text,
    short_description text,
    photos text[],
    pricing_type character varying NOT NULL,
    base_price numeric(10,2),
    currency character varying DEFAULT 'THB'::character varying,
    price_notes text,
    requires_approval boolean DEFAULT false,
    requires_pre_payment boolean DEFAULT false,
    cancellation_policy text,
    duration character varying,
    availability character varying,
    booking_instructions text,
    special_notes text,
    tags text[],
    is_active boolean DEFAULT true,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.marketplace_services OWNER TO neondb_owner;

--
-- Name: marketplace_services_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.marketplace_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marketplace_services_id_seq OWNER TO neondb_owner;

--
-- Name: marketplace_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.marketplace_services_id_seq OWNED BY public.marketplace_services.id;


--
-- Name: media_folders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.media_folders (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    folder_name character varying NOT NULL,
    folder_description text,
    cloud_folder_link character varying,
    cloud_provider character varying DEFAULT 'google_drive'::character varying NOT NULL,
    access_level character varying DEFAULT 'private'::character varying NOT NULL,
    is_agent_approved boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.media_folders OWNER TO neondb_owner;

--
-- Name: media_folders_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.media_folders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_folders_id_seq OWNER TO neondb_owner;

--
-- Name: media_folders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.media_folders_id_seq OWNED BY public.media_folders.id;


--
-- Name: media_usage_analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.media_usage_analytics (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    media_file_id integer NOT NULL,
    view_count integer DEFAULT 0,
    download_count integer DEFAULT 0,
    share_count integer DEFAULT 0,
    weekly_views integer DEFAULT 0,
    monthly_views integer DEFAULT 0,
    popularity_score character varying,
    last_accessed timestamp without time zone,
    trending_score integer DEFAULT 0,
    reset_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.media_usage_analytics OWNER TO neondb_owner;

--
-- Name: media_usage_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.media_usage_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_usage_analytics_id_seq OWNER TO neondb_owner;

--
-- Name: media_usage_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.media_usage_analytics_id_seq OWNED BY public.media_usage_analytics.id;


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notification_preferences (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    user_id character varying NOT NULL,
    enable_in_app boolean DEFAULT true,
    enable_email boolean DEFAULT true,
    enable_sms boolean DEFAULT false,
    enable_whatsapp boolean DEFAULT false,
    enable_line boolean DEFAULT false,
    task_assignments boolean DEFAULT true,
    booking_updates boolean DEFAULT true,
    payout_actions boolean DEFAULT true,
    maintenance_approvals boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notification_preferences OWNER TO neondb_owner;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.notification_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_preferences_id_seq OWNER TO neondb_owner;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.notification_preferences_id_seq OWNED BY public.notification_preferences.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    user_id character varying NOT NULL,
    type character varying NOT NULL,
    title character varying NOT NULL,
    message text NOT NULL,
    related_entity_type character varying,
    related_entity_id integer,
    priority character varying DEFAULT 'normal'::character varying,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    action_url character varying,
    action_label character varying,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO neondb_owner;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: offline_task_cache; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.offline_task_cache (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer,
    staff_id character varying NOT NULL,
    task_data jsonb NOT NULL,
    synced boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    synced_at timestamp without time zone
);


ALTER TABLE public.offline_task_cache OWNER TO neondb_owner;

--
-- Name: offline_task_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.offline_task_cache_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.offline_task_cache_id_seq OWNER TO neondb_owner;

--
-- Name: offline_task_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.offline_task_cache_id_seq OWNED BY public.offline_task_cache.id;


--
-- Name: onboarding_step_details; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.onboarding_step_details (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    onboarding_id integer NOT NULL,
    step_number integer NOT NULL,
    step_name character varying NOT NULL,
    step_description text,
    is_completed boolean DEFAULT false,
    completed_at timestamp without time zone,
    completed_by character varying,
    step_data jsonb,
    validation_errors text[],
    attempt_count integer DEFAULT 0,
    last_attempt_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.onboarding_step_details OWNER TO neondb_owner;

--
-- Name: onboarding_step_details_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.onboarding_step_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.onboarding_step_details_id_seq OWNER TO neondb_owner;

--
-- Name: onboarding_step_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.onboarding_step_details_id_seq OWNED BY public.onboarding_step_details.id;


--
-- Name: organization_api_keys; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.organization_api_keys (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    provider character varying NOT NULL,
    key_name character varying NOT NULL,
    encrypted_value text NOT NULL,
    description character varying,
    is_active boolean DEFAULT true,
    last_used timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.organization_api_keys OWNER TO neondb_owner;

--
-- Name: organization_api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.organization_api_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organization_api_keys_id_seq OWNER TO neondb_owner;

--
-- Name: organization_api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.organization_api_keys_id_seq OWNED BY public.organization_api_keys.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.organizations (
    id character varying NOT NULL,
    name character varying NOT NULL,
    domain character varying NOT NULL,
    subdomain character varying NOT NULL,
    company_logo character varying,
    settings jsonb,
    subscription_tier character varying DEFAULT 'basic'::character varying,
    max_users integer DEFAULT 10,
    max_properties integer DEFAULT 50,
    is_active boolean DEFAULT true,
    trial_ends_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    custom_domain character varying,
    branding_logo_url text,
    theme_color character varying DEFAULT '#0066ff'::character varying
);


ALTER TABLE public.organizations OWNER TO neondb_owner;

--
-- Name: owner_activity_timeline; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_activity_timeline (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    owner_id character varying NOT NULL,
    activity_type character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    metadata jsonb,
    reference_id integer,
    reference_type character varying,
    created_at timestamp without time zone DEFAULT now(),
    created_by character varying
);


ALTER TABLE public.owner_activity_timeline OWNER TO neondb_owner;

--
-- Name: owner_activity_timeline_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_activity_timeline_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_activity_timeline_id_seq OWNER TO neondb_owner;

--
-- Name: owner_activity_timeline_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_activity_timeline_id_seq OWNED BY public.owner_activity_timeline.id;


--
-- Name: owner_balances; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_balances (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    current_balance numeric(12,2) DEFAULT 0,
    total_earnings numeric(12,2) DEFAULT 0,
    total_expenses numeric(12,2) DEFAULT 0,
    total_payouts_requested numeric(12,2) DEFAULT 0,
    total_payouts_paid numeric(12,2) DEFAULT 0,
    this_month_earnings numeric(12,2) DEFAULT 0,
    this_month_expenses numeric(12,2) DEFAULT 0,
    this_month_net numeric(12,2) DEFAULT 0,
    last_calculated timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.owner_balances OWNER TO neondb_owner;

--
-- Name: owner_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_balances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_balances_id_seq OWNER TO neondb_owner;

--
-- Name: owner_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_balances_id_seq OWNED BY public.owner_balances.id;


--
-- Name: owner_charge_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_charge_requests (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    charged_by character varying NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(3) DEFAULT 'AUD'::character varying,
    reason text NOT NULL,
    description text,
    due_date date,
    payment_method character varying,
    payment_reference character varying,
    payment_receipt_url character varying,
    status character varying DEFAULT 'pending'::character varying,
    charged_at timestamp without time zone DEFAULT now(),
    paid_at timestamp without time zone,
    processed_by character varying
);


ALTER TABLE public.owner_charge_requests OWNER TO neondb_owner;

--
-- Name: owner_charge_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_charge_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_charge_requests_id_seq OWNER TO neondb_owner;

--
-- Name: owner_charge_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_charge_requests_id_seq OWNED BY public.owner_charge_requests.id;


--
-- Name: owner_documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_documents (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    process_id integer,
    owner_id character varying NOT NULL,
    property_id integer,
    category character varying NOT NULL,
    file_name character varying NOT NULL,
    original_file_name character varying,
    file_type character varying,
    file_path character varying,
    title character varying NOT NULL,
    description text,
    file_url character varying NOT NULL,
    file_size integer,
    mime_type character varying,
    has_expiration boolean DEFAULT false,
    expiration_date timestamp without time zone,
    expiration_alert_sent boolean DEFAULT false,
    status character varying DEFAULT 'pending'::character varying,
    uploaded_by character varying NOT NULL,
    reviewed_by character varying,
    reviewed_at timestamp without time zone,
    review_comments text,
    is_public boolean DEFAULT false,
    visibility character varying DEFAULT 'private'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT owner_documents_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'expired'::character varying])::text[])))
);


ALTER TABLE public.owner_documents OWNER TO neondb_owner;

--
-- Name: owner_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_documents_id_seq OWNER TO neondb_owner;

--
-- Name: owner_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_documents_id_seq OWNED BY public.owner_documents.id;


--
-- Name: owner_financial_summary; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_financial_summary (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    property_id integer,
    period_start date NOT NULL,
    period_end date NOT NULL,
    rental_income numeric(12,2) DEFAULT 0,
    addon_revenue numeric(12,2) DEFAULT 0,
    management_fees numeric(12,2) DEFAULT 0,
    utility_deductions numeric(12,2) DEFAULT 0,
    service_deductions numeric(12,2) DEFAULT 0,
    net_balance numeric(12,2) DEFAULT 0,
    breakdown jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.owner_financial_summary OWNER TO neondb_owner;

--
-- Name: owner_financial_summary_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_financial_summary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_financial_summary_id_seq OWNER TO neondb_owner;

--
-- Name: owner_financial_summary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_financial_summary_id_seq OWNED BY public.owner_financial_summary.id;


--
-- Name: owner_invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_invoices (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    property_id integer,
    invoice_number character varying NOT NULL,
    invoice_type character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    currency character varying DEFAULT 'AUD'::character varying,
    period_start date,
    period_end date,
    due_date date,
    status character varying DEFAULT 'pending'::character varying,
    pdf_url character varying,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    created_by character varying,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.owner_invoices OWNER TO neondb_owner;

--
-- Name: owner_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_invoices_id_seq OWNER TO neondb_owner;

--
-- Name: owner_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_invoices_id_seq OWNED BY public.owner_invoices.id;


--
-- Name: owner_onboarding_processes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_onboarding_processes (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    property_id integer,
    step1_owner_contact_info boolean DEFAULT false,
    step2_property_basics boolean DEFAULT false,
    step3_location_mapping boolean DEFAULT false,
    step4_photo_uploads boolean DEFAULT false,
    step5_property_description boolean DEFAULT false,
    step6_utility_info boolean DEFAULT false,
    step7_legal_documents boolean DEFAULT false,
    step8_security_access boolean DEFAULT false,
    step9_services_setup boolean DEFAULT false,
    total_steps integer DEFAULT 9,
    completed_steps integer DEFAULT 0,
    progress_percentage numeric(5,2) DEFAULT 0.00,
    current_step integer DEFAULT 1,
    onboarding_deadline timestamp without time zone,
    deadline_set_by character varying,
    priority character varying DEFAULT 'medium'::character varying,
    estimated_days_remaining integer,
    is_overdue boolean DEFAULT false,
    admin_notes text,
    owner_instructions text,
    next_step_instructions text,
    last_activity_at timestamp without time zone,
    last_updated_by character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT owner_onboarding_processes_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying])::text[])))
);


ALTER TABLE public.owner_onboarding_processes OWNER TO neondb_owner;

--
-- Name: owner_onboarding_processes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_onboarding_processes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_onboarding_processes_id_seq OWNER TO neondb_owner;

--
-- Name: owner_onboarding_processes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_onboarding_processes_id_seq OWNED BY public.owner_onboarding_processes.id;


--
-- Name: owner_payout_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_payout_requests (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying DEFAULT 'AUD'::character varying,
    period_start date NOT NULL,
    period_end date NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    request_notes text,
    admin_notes text,
    payment_receipt_url character varying,
    payment_method character varying,
    payment_reference character varying,
    requested_at timestamp without time zone DEFAULT now(),
    approved_at timestamp without time zone,
    approved_by character varying,
    payment_uploaded_at timestamp without time zone,
    payment_uploaded_by character varying,
    completed_at timestamp without time zone,
    completed_by character varying
);


ALTER TABLE public.owner_payout_requests OWNER TO neondb_owner;

--
-- Name: owner_payout_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_payout_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_payout_requests_id_seq OWNER TO neondb_owner;

--
-- Name: owner_payout_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_payout_requests_id_seq OWNED BY public.owner_payout_requests.id;


--
-- Name: owner_payouts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_payouts (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    property_id integer,
    requested_amount character varying NOT NULL,
    currency character varying DEFAULT 'USD'::character varying NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    request_date timestamp without time zone DEFAULT now(),
    requested_by character varying NOT NULL,
    request_notes text,
    approved_by character varying,
    approved_date timestamp without time zone,
    approval_notes text,
    payment_method character varying,
    payment_reference character varying,
    payment_date timestamp without time zone,
    paid_by character varying,
    receipt_url character varying,
    receipt_uploaded_by character varying,
    receipt_uploaded_date timestamp without time zone,
    confirmed_by character varying,
    confirmed_date timestamp without time zone,
    period_start_date character varying,
    period_end_date character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.owner_payouts OWNER TO neondb_owner;

--
-- Name: owner_payouts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_payouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_payouts_id_seq OWNER TO neondb_owner;

--
-- Name: owner_payouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_payouts_id_seq OWNED BY public.owner_payouts.id;


--
-- Name: owner_preferences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_preferences (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    task_approval_required boolean DEFAULT false,
    maintenance_alerts boolean DEFAULT true,
    guest_addon_notifications boolean DEFAULT true,
    financial_notifications boolean DEFAULT true,
    weekly_reports boolean DEFAULT true,
    preferred_currency character varying DEFAULT 'AUD'::character varying,
    notification_email character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.owner_preferences OWNER TO neondb_owner;

--
-- Name: owner_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_preferences_id_seq OWNER TO neondb_owner;

--
-- Name: owner_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_preferences_id_seq OWNED BY public.owner_preferences.id;


--
-- Name: owner_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_settings (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    task_approval_required boolean DEFAULT false,
    maintenance_alerts boolean DEFAULT true,
    guest_addon_notifications boolean DEFAULT true,
    financial_notifications boolean DEFAULT true,
    weekly_reports boolean DEFAULT true,
    preferred_currency character varying(3) DEFAULT 'AUD'::character varying,
    notification_email character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tax_region character varying DEFAULT 'default'::character varying,
    transparency_mode character varying DEFAULT 'summary'::character varying,
    custom_branding jsonb
);


ALTER TABLE public.owner_settings OWNER TO neondb_owner;

--
-- Name: owner_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_settings_id_seq OWNER TO neondb_owner;

--
-- Name: owner_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_settings_id_seq OWNED BY public.owner_settings.id;


--
-- Name: owner_timeline_activity; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.owner_timeline_activity (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    owner_id character varying NOT NULL,
    property_id integer,
    activity_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    property_name character varying(255),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.owner_timeline_activity OWNER TO neondb_owner;

--
-- Name: owner_timeline_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.owner_timeline_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_timeline_activity_id_seq OWNER TO neondb_owner;

--
-- Name: owner_timeline_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.owner_timeline_activity_id_seq OWNED BY public.owner_timeline_activity.id;


--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.platform_settings (
    id integer NOT NULL,
    setting_key character varying NOT NULL,
    setting_value text,
    setting_type character varying NOT NULL,
    category character varying NOT NULL,
    description text,
    is_secret boolean DEFAULT false,
    updated_by character varying,
    updated_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.platform_settings OWNER TO neondb_owner;

--
-- Name: platform_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.platform_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_settings_id_seq OWNER TO neondb_owner;

--
-- Name: platform_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.platform_settings_id_seq OWNED BY public.platform_settings.id;


--
-- Name: pm_commission_balance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pm_commission_balance (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    manager_id character varying NOT NULL,
    total_earned numeric(10,2) DEFAULT 0,
    total_paid numeric(10,2) DEFAULT 0,
    current_balance numeric(10,2) DEFAULT 0,
    last_payout_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pm_commission_balance OWNER TO neondb_owner;

--
-- Name: pm_commission_balance_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pm_commission_balance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_commission_balance_id_seq OWNER TO neondb_owner;

--
-- Name: pm_commission_balance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pm_commission_balance_id_seq OWNED BY public.pm_commission_balance.id;


--
-- Name: pm_notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pm_notifications (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    manager_id character varying NOT NULL,
    type character varying NOT NULL,
    title character varying NOT NULL,
    message text NOT NULL,
    severity character varying DEFAULT 'info'::character varying,
    action_required boolean DEFAULT false,
    is_read boolean DEFAULT false,
    related_type character varying,
    related_id character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pm_notifications OWNER TO neondb_owner;

--
-- Name: pm_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pm_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_notifications_id_seq OWNER TO neondb_owner;

--
-- Name: pm_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pm_notifications_id_seq OWNED BY public.pm_notifications.id;


--
-- Name: pm_payout_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pm_payout_requests (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    manager_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'AUD'::character varying,
    request_notes text,
    admin_notes text,
    status character varying DEFAULT 'pending'::character varying,
    receipt_url character varying,
    requested_at timestamp without time zone DEFAULT now(),
    approved_at timestamp without time zone,
    approved_by character varying,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    processed_by character varying
);


ALTER TABLE public.pm_payout_requests OWNER TO neondb_owner;

--
-- Name: pm_payout_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pm_payout_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_payout_requests_id_seq OWNER TO neondb_owner;

--
-- Name: pm_payout_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pm_payout_requests_id_seq OWNED BY public.pm_payout_requests.id;


--
-- Name: pm_property_performance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pm_property_performance (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    manager_id character varying NOT NULL,
    property_id integer NOT NULL,
    period character varying NOT NULL,
    revenue numeric(10,2) DEFAULT 0,
    expenses numeric(10,2) DEFAULT 0,
    net_income numeric(10,2) DEFAULT 0,
    commission_earned numeric(10,2) DEFAULT 0,
    occupancy_rate numeric(5,2) DEFAULT 0,
    booking_count integer DEFAULT 0,
    avg_rating numeric(3,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pm_property_performance OWNER TO neondb_owner;

--
-- Name: pm_property_performance_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pm_property_performance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_property_performance_id_seq OWNER TO neondb_owner;

--
-- Name: pm_property_performance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pm_property_performance_id_seq OWNED BY public.pm_property_performance.id;


--
-- Name: pm_task_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pm_task_logs (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    manager_id character varying NOT NULL,
    property_id integer,
    task_title character varying NOT NULL,
    department character varying,
    staff_assigned character varying,
    status character varying NOT NULL,
    result text,
    notes text,
    evidence_photos text[],
    receipts text[],
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pm_task_logs OWNER TO neondb_owner;

--
-- Name: pm_task_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pm_task_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_task_logs_id_seq OWNER TO neondb_owner;

--
-- Name: pm_task_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pm_task_logs_id_seq OWNED BY public.pm_task_logs.id;


--
-- Name: portfolio_assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.portfolio_assignments (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    manager_id character varying NOT NULL,
    property_id integer,
    commission_rate numeric(5,2) DEFAULT '50'::numeric,
    assigned_at timestamp without time zone DEFAULT now(),
    unassigned_at timestamp without time zone,
    is_active boolean DEFAULT true
);


ALTER TABLE public.portfolio_assignments OWNER TO neondb_owner;

--
-- Name: portfolio_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.portfolio_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.portfolio_assignments_id_seq OWNER TO neondb_owner;

--
-- Name: portfolio_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.portfolio_assignments_id_seq OWNED BY public.portfolio_assignments.id;


--
-- Name: portfolio_health_scores; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.portfolio_health_scores (
    id integer NOT NULL,
    property_id integer,
    score numeric(5,2),
    factors jsonb,
    calculated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.portfolio_health_scores OWNER TO neondb_owner;

--
-- Name: portfolio_health_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.portfolio_health_scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.portfolio_health_scores_id_seq OWNER TO neondb_owner;

--
-- Name: portfolio_health_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.portfolio_health_scores_id_seq OWNED BY public.portfolio_health_scores.id;


--
-- Name: properties; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.properties (
    id integer NOT NULL,
    name character varying NOT NULL,
    address text NOT NULL,
    description text,
    bedrooms integer,
    bathrooms integer,
    max_guests integer,
    price_per_night numeric(10,2),
    status character varying DEFAULT 'active'::character varying NOT NULL,
    amenities text[],
    images text[],
    hostaway_id character varying,
    owner_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    organization_id character varying NOT NULL,
    external_id character varying,
    currency character varying DEFAULT 'AUD'::character varying,
    google_maps_link text
);


ALTER TABLE public.properties OWNER TO neondb_owner;

--
-- Name: properties_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.properties_id_seq OWNER TO neondb_owner;

--
-- Name: properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;


--
-- Name: property_agents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_agents (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    agent_id character varying NOT NULL,
    agent_type character varying NOT NULL,
    assigned_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_agents OWNER TO neondb_owner;

--
-- Name: property_agents_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_agents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_agents_id_seq OWNER TO neondb_owner;

--
-- Name: property_agents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_agents_id_seq OWNED BY public.property_agents.id;


--
-- Name: property_chat_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_chat_messages (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer,
    sender_id character varying NOT NULL,
    recipient_id character varying,
    role character varying NOT NULL,
    message text NOT NULL,
    translated_message text,
    language_detected character varying(5),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_chat_messages OWNER TO neondb_owner;

--
-- Name: property_chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_chat_messages_id_seq OWNER TO neondb_owner;

--
-- Name: property_chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_chat_messages_id_seq OWNED BY public.property_chat_messages.id;


--
-- Name: property_custom_expenses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_custom_expenses (
    id integer NOT NULL,
    organization_id character varying(255) NOT NULL,
    property_id integer NOT NULL,
    category_id integer,
    amount character varying(50),
    billing_cycle character varying(50) DEFAULT 'monthly'::character varying,
    next_due_date date,
    is_active boolean DEFAULT true,
    notes text,
    created_by character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_custom_expenses OWNER TO neondb_owner;

--
-- Name: property_custom_expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_custom_expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_custom_expenses_id_seq OWNER TO neondb_owner;

--
-- Name: property_custom_expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_custom_expenses_id_seq OWNED BY public.property_custom_expenses.id;


--
-- Name: property_documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_documents (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer,
    doc_type character varying NOT NULL,
    file_url text NOT NULL,
    expiry_date date,
    uploaded_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_documents OWNER TO neondb_owner;

--
-- Name: property_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_documents_id_seq OWNER TO neondb_owner;

--
-- Name: property_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_documents_id_seq OWNED BY public.property_documents.id;


--
-- Name: property_insurance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_insurance (
    id integer NOT NULL,
    property_id integer,
    policy_number character varying,
    insurer_name character varying,
    coverage_details text,
    expiry_date date,
    uploaded_by character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_insurance OWNER TO neondb_owner;

--
-- Name: property_insurance_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_insurance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_insurance_id_seq OWNER TO neondb_owner;

--
-- Name: property_insurance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_insurance_id_seq OWNED BY public.property_insurance.id;


--
-- Name: property_investments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_investments (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer,
    investment_type character varying,
    description text,
    amount numeric(12,2),
    investment_date date,
    expected_roi numeric(5,2),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_investments OWNER TO neondb_owner;

--
-- Name: property_investments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_investments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_investments_id_seq OWNER TO neondb_owner;

--
-- Name: property_investments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_investments_id_seq OWNED BY public.property_investments.id;


--
-- Name: property_media_files; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_media_files (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    file_name character varying NOT NULL,
    media_type character varying NOT NULL,
    description text,
    cloud_link character varying NOT NULL,
    cloud_provider character varying DEFAULT 'google_drive'::character varying NOT NULL,
    thumbnail_url character varying,
    access_level character varying DEFAULT 'private'::character varying NOT NULL,
    tags text[],
    is_agent_approved boolean DEFAULT false,
    is_unbranded boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    uploaded_by character varying NOT NULL,
    approved_by character varying,
    approval_date timestamp without time zone,
    file_size_bytes bigint,
    capture_location character varying,
    captured_date timestamp without time zone,
    last_updated_date timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_media_files OWNER TO neondb_owner;

--
-- Name: property_media_files_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_media_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_media_files_id_seq OWNER TO neondb_owner;

--
-- Name: property_media_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_media_files_id_seq OWNED BY public.property_media_files.id;


--
-- Name: property_media_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_media_settings (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    auto_approval_enabled boolean DEFAULT false,
    agent_upload_enabled boolean DEFAULT false,
    watermark_enabled boolean DEFAULT false,
    watermark_template character varying,
    quality_requirements jsonb,
    approval_workflow jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_media_settings OWNER TO neondb_owner;

--
-- Name: property_media_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_media_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_media_settings_id_seq OWNER TO neondb_owner;

--
-- Name: property_media_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_media_settings_id_seq OWNED BY public.property_media_settings.id;


--
-- Name: property_payout_rules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_payout_rules (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer,
    airbnb_owner_percent numeric(5,2) DEFAULT 70,
    airbnb_management_percent numeric(5,2) DEFAULT 30,
    vrbo_owner_percent numeric(5,2) DEFAULT 0,
    vrbo_management_percent numeric(5,2) DEFAULT 100,
    booking_owner_percent numeric(5,2) DEFAULT 0,
    booking_management_percent numeric(5,2) DEFAULT 100,
    direct_owner_percent numeric(5,2) DEFAULT 0,
    direct_management_percent numeric(5,2) DEFAULT 100,
    stripe_fee_percent numeric(5,2) DEFAULT 5,
    stripe_fee_note text DEFAULT '5% processing fee applied'::text,
    allow_booking_override boolean DEFAULT true,
    default_currency character varying(3) DEFAULT 'AUD'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_payout_rules OWNER TO neondb_owner;

--
-- Name: property_payout_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_payout_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_payout_rules_id_seq OWNER TO neondb_owner;

--
-- Name: property_payout_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_payout_rules_id_seq OWNED BY public.property_payout_rules.id;


--
-- Name: property_referrals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_referrals (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    referral_agent_id character varying NOT NULL,
    referral_date timestamp without time zone DEFAULT now(),
    commission_rate numeric(5,2) DEFAULT 10.00,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_referrals OWNER TO neondb_owner;

--
-- Name: property_referrals_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_referrals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_referrals_id_seq OWNER TO neondb_owner;

--
-- Name: property_referrals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_referrals_id_seq OWNED BY public.property_referrals.id;


--
-- Name: property_revenue_targets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_revenue_targets (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    target_year integer NOT NULL,
    target_quarter integer,
    target_amount numeric(12,2) NOT NULL,
    currency character varying DEFAULT 'THB'::character varying NOT NULL,
    current_revenue numeric(12,2) DEFAULT 0,
    description text,
    is_active boolean DEFAULT true,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_revenue_targets OWNER TO neondb_owner;

--
-- Name: property_revenue_targets_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_revenue_targets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_revenue_targets_id_seq OWNER TO neondb_owner;

--
-- Name: property_revenue_targets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_revenue_targets_id_seq OWNED BY public.property_revenue_targets.id;


--
-- Name: property_reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_reviews (
    id integer NOT NULL,
    property_id integer,
    source character varying NOT NULL,
    reviewer_name character varying,
    rating numeric(3,2),
    review_text text,
    ai_summary text,
    sentiment_score numeric(4,2),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_reviews OWNER TO neondb_owner;

--
-- Name: property_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_reviews_id_seq OWNER TO neondb_owner;

--
-- Name: property_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_reviews_id_seq OWNED BY public.property_reviews.id;


--
-- Name: property_status; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_status (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer,
    status character varying NOT NULL,
    last_update timestamp without time zone DEFAULT now(),
    notes text
);


ALTER TABLE public.property_status OWNER TO neondb_owner;

--
-- Name: property_status_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_status_id_seq OWNER TO neondb_owner;

--
-- Name: property_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_status_id_seq OWNED BY public.property_status.id;


--
-- Name: property_utility_accounts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_utility_accounts (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    utility_type character varying NOT NULL,
    provider character varying NOT NULL,
    account_number character varying NOT NULL,
    package_info text,
    expected_bill_day integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_utility_accounts OWNER TO neondb_owner;

--
-- Name: property_utility_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_utility_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_utility_accounts_id_seq OWNER TO neondb_owner;

--
-- Name: property_utility_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_utility_accounts_id_seq OWNED BY public.property_utility_accounts.id;


--
-- Name: property_utility_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.property_utility_settings (
    id integer NOT NULL,
    organization_id character varying(255) NOT NULL,
    property_id integer NOT NULL,
    utility_type character varying(50) NOT NULL,
    provider_id integer,
    account_number character varying(255),
    account_holder character varying(255),
    is_active boolean DEFAULT true,
    created_by character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.property_utility_settings OWNER TO neondb_owner;

--
-- Name: property_utility_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.property_utility_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.property_utility_settings_id_seq OWNER TO neondb_owner;

--
-- Name: property_utility_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.property_utility_settings_id_seq OWNED BY public.property_utility_settings.id;


--
-- Name: recurring_service_charges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.recurring_service_charges (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer,
    service_name character varying NOT NULL,
    service_category character varying NOT NULL,
    provider_name character varying,
    provider_contact character varying,
    monthly_rate numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'THB'::character varying,
    billing_day integer DEFAULT 1,
    charge_assignment character varying DEFAULT 'owner'::character varying,
    auto_deduct boolean DEFAULT true,
    requires_approval boolean DEFAULT false,
    service_frequency character varying DEFAULT 'weekly'::character varying,
    service_day character varying,
    service_time character varying,
    is_active boolean DEFAULT true,
    start_date date NOT NULL,
    end_date date,
    last_charged_date date,
    next_charge_date date,
    notes text,
    contract_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.recurring_service_charges OWNER TO neondb_owner;

--
-- Name: recurring_service_charges_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.recurring_service_charges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recurring_service_charges_id_seq OWNER TO neondb_owner;

--
-- Name: recurring_service_charges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.recurring_service_charges_id_seq OWNED BY public.recurring_service_charges.id;


--
-- Name: referral_earnings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.referral_earnings (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    referral_agent_id character varying NOT NULL,
    property_id integer NOT NULL,
    earnings_month character varying NOT NULL,
    management_fee numeric(10,2) NOT NULL,
    commission_rate numeric(5,2) DEFAULT 10.00,
    commission_amount numeric(10,2) NOT NULL,
    occupancy_rate numeric(5,2),
    average_review_score numeric(3,1),
    total_bookings integer DEFAULT 0,
    is_confirmed boolean DEFAULT false,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.referral_earnings OWNER TO neondb_owner;

--
-- Name: referral_earnings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.referral_earnings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.referral_earnings_id_seq OWNER TO neondb_owner;

--
-- Name: referral_earnings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.referral_earnings_id_seq OWNED BY public.referral_earnings.id;


--
-- Name: seasonal_forecasts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.seasonal_forecasts (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer,
    forecast_month character varying NOT NULL,
    expected_occupancy numeric(5,2),
    expected_rate numeric(10,2),
    ai_notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.seasonal_forecasts OWNER TO neondb_owner;

--
-- Name: seasonal_forecasts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.seasonal_forecasts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seasonal_forecasts_id_seq OWNER TO neondb_owner;

--
-- Name: seasonal_forecasts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.seasonal_forecasts_id_seq OWNED BY public.seasonal_forecasts.id;


--
-- Name: security_deposits; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.security_deposits (
    id integer NOT NULL,
    booking_id integer,
    property_id integer,
    guest_id character varying,
    amount numeric(10,2),
    status character varying DEFAULT 'held'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    released_at timestamp without time zone
);


ALTER TABLE public.security_deposits OWNER TO neondb_owner;

--
-- Name: security_deposits_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.security_deposits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.security_deposits_id_seq OWNER TO neondb_owner;

--
-- Name: security_deposits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.security_deposits_id_seq OWNED BY public.security_deposits.id;


--
-- Name: service_bookings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.service_bookings (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    service_id integer NOT NULL,
    property_id integer NOT NULL,
    booking_number character varying NOT NULL,
    guest_name character varying NOT NULL,
    guest_email character varying,
    guest_phone character varying,
    guest_notes text,
    requested_date date,
    requested_time character varying,
    estimated_duration integer,
    total_amount numeric(10,2),
    currency character varying DEFAULT 'THB'::character varying,
    billing_assignment character varying NOT NULL,
    status character varying DEFAULT 'pending'::character varying,
    payment_status character varying DEFAULT 'pending'::character varying,
    requested_by character varying NOT NULL,
    requested_by_role character varying NOT NULL,
    approved_by character varying,
    approved_at timestamp without time zone,
    rejected_by character varying,
    rejected_at timestamp without time zone,
    rejection_reason text,
    confirmed_by character varying,
    confirmed_at timestamp without time zone,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    completion_notes text,
    cancelled_at timestamp without time zone,
    cancellation_reason text,
    internal_notes text,
    vendor_notes text,
    access_instructions text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.service_bookings OWNER TO neondb_owner;

--
-- Name: service_bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.service_bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_bookings_id_seq OWNER TO neondb_owner;

--
-- Name: service_bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.service_bookings_id_seq OWNED BY public.service_bookings.id;


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.service_categories (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    name character varying NOT NULL,
    description text,
    icon character varying,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    color character varying DEFAULT '#6B7280'::character varying
);


ALTER TABLE public.service_categories OWNER TO neondb_owner;

--
-- Name: service_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.service_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_categories_id_seq OWNER TO neondb_owner;

--
-- Name: service_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.service_categories_id_seq OWNED BY public.service_categories.id;


--
-- Name: service_reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.service_reviews (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    service_id integer NOT NULL,
    booking_id integer NOT NULL,
    vendor_id integer NOT NULL,
    rating integer NOT NULL,
    title character varying,
    review text,
    reviewer_type character varying NOT NULL,
    reviewer_name character varying,
    is_anonymous boolean DEFAULT false,
    quality_rating integer,
    timeliness_rating integer,
    value_rating integer,
    communication_rating integer,
    is_approved boolean DEFAULT true,
    is_public boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.service_reviews OWNER TO neondb_owner;

--
-- Name: service_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.service_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_reviews_id_seq OWNER TO neondb_owner;

--
-- Name: service_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.service_reviews_id_seq OWNED BY public.service_reviews.id;


--
-- Name: service_vendor_analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.service_vendor_analytics (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    vendor_id integer NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_bookings integer DEFAULT 0,
    completed_bookings integer DEFAULT 0,
    cancelled_bookings integer DEFAULT 0,
    total_revenue numeric(12,2) DEFAULT 0,
    average_rating numeric(3,2) DEFAULT 0,
    response_time_hours numeric(5,2) DEFAULT 0,
    completion_rate numeric(5,2) DEFAULT 0,
    repeat_customer_rate numeric(5,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.service_vendor_analytics OWNER TO neondb_owner;

--
-- Name: service_vendor_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.service_vendor_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_vendor_analytics_id_seq OWNER TO neondb_owner;

--
-- Name: service_vendor_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.service_vendor_analytics_id_seq OWNED BY public.service_vendor_analytics.id;


--
-- Name: service_vendors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.service_vendors (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    name character varying NOT NULL,
    description text,
    logo character varying,
    vendor_type character varying DEFAULT 'external'::character varying NOT NULL,
    contact_person character varying,
    phone character varying,
    email character varying,
    address text,
    website character varying,
    business_license character varying,
    tax_id character varying,
    bank_details text,
    rating numeric(3,2) DEFAULT 5.00,
    review_count integer DEFAULT 0,
    response_time_hours integer DEFAULT 24,
    commission_rate numeric(5,2) DEFAULT 0.00,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    available_days text[],
    working_hours jsonb,
    payment_terms character varying DEFAULT 'net_30'::character varying,
    delivery_time character varying,
    service_area text,
    specializations text[],
    certifications text[],
    tags text[],
    notes text,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    preferred_payment_method character varying DEFAULT 'bank_transfer'::character varying
);


ALTER TABLE public.service_vendors OWNER TO neondb_owner;

--
-- Name: service_vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.service_vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_vendors_id_seq OWNER TO neondb_owner;

--
-- Name: service_vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.service_vendors_id_seq OWNED BY public.service_vendors.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL,
    organization_id character varying
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: shared_cost_splits; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shared_cost_splits (
    id integer NOT NULL,
    shared_cost_id integer,
    property_id integer,
    owner_id character varying,
    split_amount numeric(10,2) NOT NULL
);


ALTER TABLE public.shared_cost_splits OWNER TO neondb_owner;

--
-- Name: shared_cost_splits_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.shared_cost_splits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shared_cost_splits_id_seq OWNER TO neondb_owner;

--
-- Name: shared_cost_splits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.shared_cost_splits_id_seq OWNED BY public.shared_cost_splits.id;


--
-- Name: shared_costs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shared_costs (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    building_id character varying NOT NULL,
    description text,
    total_amount numeric(10,2) NOT NULL,
    cost_type character varying DEFAULT 'electricity'::character varying,
    period_start date,
    period_end date,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.shared_costs OWNER TO neondb_owner;

--
-- Name: shared_costs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.shared_costs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shared_costs_id_seq OWNER TO neondb_owner;

--
-- Name: shared_costs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.shared_costs_id_seq OWNED BY public.shared_costs.id;


--
-- Name: staff_salaries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.staff_salaries (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    user_id character varying NOT NULL,
    monthly_salary numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying,
    bonus_structure jsonb,
    commission_rate numeric(5,2) DEFAULT '0'::numeric,
    is_active boolean DEFAULT true,
    effective_from date NOT NULL,
    effective_to date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.staff_salaries OWNER TO neondb_owner;

--
-- Name: staff_salaries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.staff_salaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_salaries_id_seq OWNER TO neondb_owner;

--
-- Name: staff_salaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.staff_salaries_id_seq OWNED BY public.staff_salaries.id;


--
-- Name: staff_skills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.staff_skills (
    id integer NOT NULL,
    staff_id character varying NOT NULL,
    skill_name character varying NOT NULL,
    certification_url text,
    expiry_date date,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.staff_skills OWNER TO neondb_owner;

--
-- Name: staff_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.staff_skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_skills_id_seq OWNER TO neondb_owner;

--
-- Name: staff_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.staff_skills_id_seq OWNED BY public.staff_skills.id;


--
-- Name: staff_workload_stats; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.staff_workload_stats (
    id integer NOT NULL,
    staff_id character varying NOT NULL,
    week_start date,
    tasks_assigned integer DEFAULT 0,
    hours_logged numeric(5,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.staff_workload_stats OWNER TO neondb_owner;

--
-- Name: staff_workload_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.staff_workload_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_workload_stats_id_seq OWNER TO neondb_owner;

--
-- Name: staff_workload_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.staff_workload_stats_id_seq OWNED BY public.staff_workload_stats.id;


--
-- Name: supply_orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.supply_orders (
    id integer NOT NULL,
    vendor_id integer,
    property_id integer,
    item_name character varying NOT NULL,
    quantity integer,
    cost_total numeric(10,2),
    status character varying DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.supply_orders OWNER TO neondb_owner;

--
-- Name: supply_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.supply_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.supply_orders_id_seq OWNER TO neondb_owner;

--
-- Name: supply_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.supply_orders_id_seq OWNED BY public.supply_orders.id;


--
-- Name: sustainability_metrics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sustainability_metrics (
    id integer NOT NULL,
    property_id integer,
    period_start date,
    period_end date,
    water_usage numeric(10,2),
    electricity_usage numeric(10,2),
    carbon_score numeric(5,2),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sustainability_metrics OWNER TO neondb_owner;

--
-- Name: sustainability_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sustainability_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sustainability_metrics_id_seq OWNER TO neondb_owner;

--
-- Name: sustainability_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sustainability_metrics_id_seq OWNED BY public.sustainability_metrics.id;


--
-- Name: task_ai_scan_results; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.task_ai_scan_results (
    id integer NOT NULL,
    task_id integer,
    photo_url text NOT NULL,
    ai_findings jsonb,
    confidence_score numeric(4,2),
    flagged boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.task_ai_scan_results OWNER TO neondb_owner;

--
-- Name: task_ai_scan_results_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.task_ai_scan_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_ai_scan_results_id_seq OWNER TO neondb_owner;

--
-- Name: task_ai_scan_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.task_ai_scan_results_id_seq OWNED BY public.task_ai_scan_results.id;


--
-- Name: task_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.task_history (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    task_id integer NOT NULL,
    property_id integer,
    action character varying NOT NULL,
    previous_status character varying,
    new_status character varying,
    performed_by character varying,
    notes text,
    evidence_photos text[] DEFAULT '{}'::text[],
    issues_found text[] DEFAULT '{}'::text[],
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.task_history OWNER TO neondb_owner;

--
-- Name: task_history_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.task_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_history_id_seq OWNER TO neondb_owner;

--
-- Name: task_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.task_history_id_seq OWNED BY public.task_history.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying NOT NULL,
    description text,
    type character varying NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    priority character varying DEFAULT 'medium'::character varying NOT NULL,
    property_id integer,
    assigned_to character varying,
    created_by character varying,
    due_date timestamp without time zone,
    completed_at timestamp without time zone,
    estimated_cost numeric(10,2),
    actual_cost numeric(10,2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    department character varying,
    is_recurring boolean DEFAULT false,
    recurring_type character varying,
    recurring_interval integer DEFAULT 1,
    next_due_date timestamp without time zone,
    parent_task_id integer,
    organization_id character varying NOT NULL,
    completion_notes text,
    evidence_photos text[] DEFAULT '{}'::text[],
    issues_found text[] DEFAULT '{}'::text[],
    skip_reason text,
    reschedule_reason text,
    rescheduled_date timestamp without time zone,
    auto_assigned boolean DEFAULT false,
    ai_confidence numeric(4,2)
);


ALTER TABLE public.tasks OWNER TO neondb_owner;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO neondb_owner;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: tax_rules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tax_rules (
    id integer NOT NULL,
    region character varying NOT NULL,
    vat_rate numeric(5,2),
    gst_rate numeric(5,2),
    wht_rate numeric(5,2),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tax_rules OWNER TO neondb_owner;

--
-- Name: tax_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.tax_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tax_rules_id_seq OWNER TO neondb_owner;

--
-- Name: tax_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.tax_rules_id_seq OWNED BY public.tax_rules.id;


--
-- Name: upsell_recommendations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.upsell_recommendations (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    guest_id character varying,
    property_id integer,
    recommendation_type character varying,
    message text,
    status character varying DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.upsell_recommendations OWNER TO neondb_owner;

--
-- Name: upsell_recommendations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.upsell_recommendations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upsell_recommendations_id_seq OWNER TO neondb_owner;

--
-- Name: upsell_recommendations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.upsell_recommendations_id_seq OWNED BY public.upsell_recommendations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    role character varying DEFAULT 'guest'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    organization_id character varying NOT NULL,
    is_active boolean DEFAULT true,
    last_login_at timestamp without time zone,
    password text
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: utility_bill_reminders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.utility_bill_reminders (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    utility_bill_id integer,
    reminder_type character varying NOT NULL,
    sent_at timestamp without time zone DEFAULT now(),
    sent_to character varying NOT NULL,
    reminder_message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.utility_bill_reminders OWNER TO neondb_owner;

--
-- Name: utility_bill_reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.utility_bill_reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.utility_bill_reminders_id_seq OWNER TO neondb_owner;

--
-- Name: utility_bill_reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.utility_bill_reminders_id_seq OWNED BY public.utility_bill_reminders.id;


--
-- Name: utility_bills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.utility_bills (
    id integer NOT NULL,
    property_id integer NOT NULL,
    type character varying NOT NULL,
    provider character varying,
    account_number character varying,
    amount numeric(10,2),
    due_date date NOT NULL,
    bill_period_start date,
    bill_period_end date,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    receipt_url character varying,
    reminder_sent boolean DEFAULT false,
    is_recurring boolean DEFAULT true,
    next_due_date date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    organization_id character varying NOT NULL,
    utility_account_id integer,
    currency character varying DEFAULT 'AUD'::character varying,
    billing_month character varying NOT NULL,
    receipt_filename character varying,
    responsible_party character varying DEFAULT 'owner'::character varying NOT NULL,
    is_owner_billable boolean DEFAULT true,
    uploaded_by character varying,
    uploaded_at timestamp without time zone,
    notes text
);


ALTER TABLE public.utility_bills OWNER TO neondb_owner;

--
-- Name: utility_bills_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.utility_bills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.utility_bills_id_seq OWNER TO neondb_owner;

--
-- Name: utility_bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.utility_bills_id_seq OWNED BY public.utility_bills.id;


--
-- Name: utility_providers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.utility_providers (
    id integer NOT NULL,
    organization_id character varying(255) NOT NULL,
    utility_type character varying(50) NOT NULL,
    provider_name character varying(255) NOT NULL,
    country character varying(100) NOT NULL,
    is_default boolean DEFAULT false,
    display_order integer DEFAULT 1,
    created_by character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    region character varying,
    is_active boolean DEFAULT true,
    contact_info text,
    billing_cycle character varying DEFAULT 'monthly'::character varying,
    notes text
);


ALTER TABLE public.utility_providers OWNER TO neondb_owner;

--
-- Name: utility_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.utility_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.utility_providers_id_seq OWNER TO neondb_owner;

--
-- Name: utility_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.utility_providers_id_seq OWNED BY public.utility_providers.id;


--
-- Name: vendor_service_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendor_service_history (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    vendor_id integer NOT NULL,
    service_id integer NOT NULL,
    property_id integer NOT NULL,
    completed_date date NOT NULL,
    quality_score integer,
    timeliness_score integer,
    cost numeric(10,2),
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vendor_service_history OWNER TO neondb_owner;

--
-- Name: vendor_service_history_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vendor_service_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendor_service_history_id_seq OWNER TO neondb_owner;

--
-- Name: vendor_service_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vendor_service_history_id_seq OWNED BY public.vendor_service_history.id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    name character varying NOT NULL,
    contact_info text,
    api_url text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vendors OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: welcome_pack_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.welcome_pack_items (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    name character varying NOT NULL,
    category character varying NOT NULL,
    unit_cost numeric(10,2) NOT NULL,
    currency character varying DEFAULT 'AUD'::character varying,
    supplier character varying,
    restock_threshold integer DEFAULT 10,
    current_stock integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.welcome_pack_items OWNER TO neondb_owner;

--
-- Name: welcome_pack_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.welcome_pack_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.welcome_pack_items_id_seq OWNER TO neondb_owner;

--
-- Name: welcome_pack_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.welcome_pack_items_id_seq OWNED BY public.welcome_pack_items.id;


--
-- Name: welcome_pack_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.welcome_pack_templates (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    item_id integer NOT NULL,
    default_quantity integer NOT NULL,
    is_complimentary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.welcome_pack_templates OWNER TO neondb_owner;

--
-- Name: welcome_pack_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.welcome_pack_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.welcome_pack_templates_id_seq OWNER TO neondb_owner;

--
-- Name: welcome_pack_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.welcome_pack_templates_id_seq OWNED BY public.welcome_pack_templates.id;


--
-- Name: welcome_pack_usage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.welcome_pack_usage (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    property_id integer NOT NULL,
    booking_id integer,
    item_id integer NOT NULL,
    quantity_used integer NOT NULL,
    unit_cost numeric(10,2) NOT NULL,
    total_cost numeric(10,2) NOT NULL,
    billing_option character varying DEFAULT 'owner_bill'::character varying NOT NULL,
    processed_by character varying,
    usage_date date NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.welcome_pack_usage OWNER TO neondb_owner;

--
-- Name: welcome_pack_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.welcome_pack_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.welcome_pack_usage_id_seq OWNER TO neondb_owner;

--
-- Name: welcome_pack_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.welcome_pack_usage_id_seq OWNED BY public.welcome_pack_usage.id;


--
-- Name: whatsapp_bot_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.whatsapp_bot_logs (
    id integer NOT NULL,
    organization_id character varying NOT NULL,
    user_id character varying,
    command character varying NOT NULL,
    response text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.whatsapp_bot_logs OWNER TO neondb_owner;

--
-- Name: whatsapp_bot_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.whatsapp_bot_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.whatsapp_bot_logs_id_seq OWNER TO neondb_owner;

--
-- Name: whatsapp_bot_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.whatsapp_bot_logs_id_seq OWNED BY public.whatsapp_bot_logs.id;


--
-- Name: addon_bookings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addon_bookings ALTER COLUMN id SET DEFAULT nextval('public.addon_bookings_id_seq'::regclass);


--
-- Name: addon_services id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addon_services ALTER COLUMN id SET DEFAULT nextval('public.addon_services_id_seq'::regclass);


--
-- Name: agent_bookings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_bookings ALTER COLUMN id SET DEFAULT nextval('public.agent_bookings_id_seq'::regclass);


--
-- Name: agent_media_access id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_media_access ALTER COLUMN id SET DEFAULT nextval('public.agent_media_access_id_seq'::regclass);


--
-- Name: agent_payouts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_payouts ALTER COLUMN id SET DEFAULT nextval('public.agent_payouts_id_seq'::regclass);


--
-- Name: ai_configuration id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_configuration ALTER COLUMN id SET DEFAULT nextval('public.ai_configuration_id_seq'::regclass);


--
-- Name: ai_generated_tasks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_generated_tasks ALTER COLUMN id SET DEFAULT nextval('public.ai_generated_tasks_id_seq'::regclass);


--
-- Name: ai_media_suggestions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_media_suggestions ALTER COLUMN id SET DEFAULT nextval('public.ai_media_suggestions_id_seq'::regclass);


--
-- Name: ai_ops_anomalies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_ops_anomalies ALTER COLUMN id SET DEFAULT nextval('public.ai_ops_anomalies_id_seq'::regclass);


--
-- Name: ai_roi_predictions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_roi_predictions ALTER COLUMN id SET DEFAULT nextval('public.ai_roi_predictions_id_seq'::regclass);


--
-- Name: ai_task_rules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_task_rules ALTER COLUMN id SET DEFAULT nextval('public.ai_task_rules_id_seq'::regclass);


--
-- Name: ai_virtual_managers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_virtual_managers ALTER COLUMN id SET DEFAULT nextval('public.ai_virtual_managers_id_seq'::regclass);


--
-- Name: booking_cost_breakdowns id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.booking_cost_breakdowns ALTER COLUMN id SET DEFAULT nextval('public.booking_cost_breakdowns_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: commission_earnings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.commission_earnings ALTER COLUMN id SET DEFAULT nextval('public.commission_earnings_id_seq'::regclass);


--
-- Name: commission_invoice_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.commission_invoice_items ALTER COLUMN id SET DEFAULT nextval('public.commission_invoice_items_id_seq'::regclass);


--
-- Name: commission_invoices id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.commission_invoices ALTER COLUMN id SET DEFAULT nextval('public.commission_invoices_id_seq'::regclass);


--
-- Name: commission_log id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.commission_log ALTER COLUMN id SET DEFAULT nextval('public.commission_log_id_seq'::regclass);


--
-- Name: currency_rates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.currency_rates ALTER COLUMN id SET DEFAULT nextval('public.currency_rates_id_seq'::regclass);


--
-- Name: custom_expense_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_expense_categories ALTER COLUMN id SET DEFAULT nextval('public.custom_expense_categories_id_seq'::regclass);


--
-- Name: damage_reports id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.damage_reports ALTER COLUMN id SET DEFAULT nextval('public.damage_reports_id_seq'::regclass);


--
-- Name: dynamic_pricing_recommendations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dynamic_pricing_recommendations ALTER COLUMN id SET DEFAULT nextval('public.dynamic_pricing_recommendations_id_seq'::regclass);


--
-- Name: feedback_processing_log id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback_processing_log ALTER COLUMN id SET DEFAULT nextval('public.feedback_processing_log_id_seq'::regclass);


--
-- Name: finances id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.finances ALTER COLUMN id SET DEFAULT nextval('public.finances_id_seq'::regclass);


--
-- Name: financial_transactions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financial_transactions ALTER COLUMN id SET DEFAULT nextval('public.financial_transactions_id_seq'::regclass);


--
-- Name: guest_activity_timeline id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_activity_timeline ALTER COLUMN id SET DEFAULT nextval('public.guest_activity_timeline_id_seq'::regclass);


--
-- Name: guest_addon_bookings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_addon_bookings ALTER COLUMN id SET DEFAULT nextval('public.guest_addon_bookings_id_seq'::regclass);


--
-- Name: guest_addon_service_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_addon_service_requests ALTER COLUMN id SET DEFAULT nextval('public.guest_addon_service_requests_id_seq'::regclass);


--
-- Name: guest_addon_services id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_addon_services ALTER COLUMN id SET DEFAULT nextval('public.guest_addon_services_id_seq'::regclass);


--
-- Name: guest_ai_faq_knowledge id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_ai_faq_knowledge ALTER COLUMN id SET DEFAULT nextval('public.guest_ai_faq_knowledge_id_seq'::regclass);


--
-- Name: guest_chat_messages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_chat_messages ALTER COLUMN id SET DEFAULT nextval('public.guest_chat_messages_id_seq'::regclass);


--
-- Name: guest_feedback id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_feedback ALTER COLUMN id SET DEFAULT nextval('public.guest_feedback_id_seq'::regclass);


--
-- Name: guest_id_scans id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_id_scans ALTER COLUMN id SET DEFAULT nextval('public.guest_id_scans_id_seq'::regclass);


--
-- Name: guest_maintenance_reports id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_maintenance_reports ALTER COLUMN id SET DEFAULT nextval('public.guest_maintenance_reports_id_seq'::regclass);


--
-- Name: guest_messages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_messages ALTER COLUMN id SET DEFAULT nextval('public.guest_messages_id_seq'::regclass);


--
-- Name: guest_portal_access id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_portal_access ALTER COLUMN id SET DEFAULT nextval('public.guest_portal_access_id_seq'::regclass);


--
-- Name: guest_portal_sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_portal_sessions ALTER COLUMN id SET DEFAULT nextval('public.guest_portal_sessions_id_seq'::regclass);


--
-- Name: guest_property_local_info id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_property_local_info ALTER COLUMN id SET DEFAULT nextval('public.guest_property_local_info_id_seq'::regclass);


--
-- Name: guest_service_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_service_requests ALTER COLUMN id SET DEFAULT nextval('public.guest_service_requests_id_seq'::regclass);


--
-- Name: inventory id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory ALTER COLUMN id SET DEFAULT nextval('public.inventory_id_seq'::regclass);


--
-- Name: invoice_line_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_line_items ALTER COLUMN id SET DEFAULT nextval('public.invoice_line_items_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: legal_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.legal_templates ALTER COLUMN id SET DEFAULT nextval('public.legal_templates_id_seq'::regclass);


--
-- Name: maintenance_approval_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_approval_logs ALTER COLUMN id SET DEFAULT nextval('public.maintenance_approval_logs_id_seq'::regclass);


--
-- Name: maintenance_budget_forecasts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_budget_forecasts ALTER COLUMN id SET DEFAULT nextval('public.maintenance_budget_forecasts_id_seq'::regclass);


--
-- Name: maintenance_suggestion_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_suggestion_settings ALTER COLUMN id SET DEFAULT nextval('public.maintenance_suggestion_settings_id_seq'::regclass);


--
-- Name: maintenance_suggestions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_suggestions ALTER COLUMN id SET DEFAULT nextval('public.maintenance_suggestions_id_seq'::regclass);


--
-- Name: maintenance_timeline_entries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_timeline_entries ALTER COLUMN id SET DEFAULT nextval('public.maintenance_timeline_entries_id_seq'::regclass);


--
-- Name: marketing_packs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketing_packs ALTER COLUMN id SET DEFAULT nextval('public.marketing_packs_id_seq'::regclass);


--
-- Name: marketplace_service_analytics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketplace_service_analytics ALTER COLUMN id SET DEFAULT nextval('public.marketplace_service_analytics_id_seq'::regclass);


--
-- Name: marketplace_services id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketplace_services ALTER COLUMN id SET DEFAULT nextval('public.marketplace_services_id_seq'::regclass);


--
-- Name: media_folders id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.media_folders ALTER COLUMN id SET DEFAULT nextval('public.media_folders_id_seq'::regclass);


--
-- Name: media_usage_analytics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.media_usage_analytics ALTER COLUMN id SET DEFAULT nextval('public.media_usage_analytics_id_seq'::regclass);


--
-- Name: notification_preferences id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.notification_preferences_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: offline_task_cache id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.offline_task_cache ALTER COLUMN id SET DEFAULT nextval('public.offline_task_cache_id_seq'::regclass);


--
-- Name: onboarding_step_details id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.onboarding_step_details ALTER COLUMN id SET DEFAULT nextval('public.onboarding_step_details_id_seq'::regclass);


--
-- Name: organization_api_keys id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organization_api_keys ALTER COLUMN id SET DEFAULT nextval('public.organization_api_keys_id_seq'::regclass);


--
-- Name: owner_activity_timeline id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_activity_timeline ALTER COLUMN id SET DEFAULT nextval('public.owner_activity_timeline_id_seq'::regclass);


--
-- Name: owner_balances id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_balances ALTER COLUMN id SET DEFAULT nextval('public.owner_balances_id_seq'::regclass);


--
-- Name: owner_charge_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_charge_requests ALTER COLUMN id SET DEFAULT nextval('public.owner_charge_requests_id_seq'::regclass);


--
-- Name: owner_documents id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_documents ALTER COLUMN id SET DEFAULT nextval('public.owner_documents_id_seq'::regclass);


--
-- Name: owner_financial_summary id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_financial_summary ALTER COLUMN id SET DEFAULT nextval('public.owner_financial_summary_id_seq'::regclass);


--
-- Name: owner_invoices id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_invoices ALTER COLUMN id SET DEFAULT nextval('public.owner_invoices_id_seq'::regclass);


--
-- Name: owner_onboarding_processes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_onboarding_processes ALTER COLUMN id SET DEFAULT nextval('public.owner_onboarding_processes_id_seq'::regclass);


--
-- Name: owner_payout_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_payout_requests ALTER COLUMN id SET DEFAULT nextval('public.owner_payout_requests_id_seq'::regclass);


--
-- Name: owner_payouts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_payouts ALTER COLUMN id SET DEFAULT nextval('public.owner_payouts_id_seq'::regclass);


--
-- Name: owner_preferences id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_preferences ALTER COLUMN id SET DEFAULT nextval('public.owner_preferences_id_seq'::regclass);


--
-- Name: owner_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_settings ALTER COLUMN id SET DEFAULT nextval('public.owner_settings_id_seq'::regclass);


--
-- Name: owner_timeline_activity id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_timeline_activity ALTER COLUMN id SET DEFAULT nextval('public.owner_timeline_activity_id_seq'::regclass);


--
-- Name: platform_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.platform_settings ALTER COLUMN id SET DEFAULT nextval('public.platform_settings_id_seq'::regclass);


--
-- Name: pm_commission_balance id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_commission_balance ALTER COLUMN id SET DEFAULT nextval('public.pm_commission_balance_id_seq'::regclass);


--
-- Name: pm_notifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_notifications ALTER COLUMN id SET DEFAULT nextval('public.pm_notifications_id_seq'::regclass);


--
-- Name: pm_payout_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_payout_requests ALTER COLUMN id SET DEFAULT nextval('public.pm_payout_requests_id_seq'::regclass);


--
-- Name: pm_property_performance id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_property_performance ALTER COLUMN id SET DEFAULT nextval('public.pm_property_performance_id_seq'::regclass);


--
-- Name: pm_task_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_task_logs ALTER COLUMN id SET DEFAULT nextval('public.pm_task_logs_id_seq'::regclass);


--
-- Name: portfolio_assignments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.portfolio_assignments ALTER COLUMN id SET DEFAULT nextval('public.portfolio_assignments_id_seq'::regclass);


--
-- Name: portfolio_health_scores id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.portfolio_health_scores ALTER COLUMN id SET DEFAULT nextval('public.portfolio_health_scores_id_seq'::regclass);


--
-- Name: properties id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);


--
-- Name: property_agents id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_agents ALTER COLUMN id SET DEFAULT nextval('public.property_agents_id_seq'::regclass);


--
-- Name: property_chat_messages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_chat_messages ALTER COLUMN id SET DEFAULT nextval('public.property_chat_messages_id_seq'::regclass);


--
-- Name: property_custom_expenses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_custom_expenses ALTER COLUMN id SET DEFAULT nextval('public.property_custom_expenses_id_seq'::regclass);


--
-- Name: property_documents id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_documents ALTER COLUMN id SET DEFAULT nextval('public.property_documents_id_seq'::regclass);


--
-- Name: property_insurance id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_insurance ALTER COLUMN id SET DEFAULT nextval('public.property_insurance_id_seq'::regclass);


--
-- Name: property_investments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_investments ALTER COLUMN id SET DEFAULT nextval('public.property_investments_id_seq'::regclass);


--
-- Name: property_media_files id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_media_files ALTER COLUMN id SET DEFAULT nextval('public.property_media_files_id_seq'::regclass);


--
-- Name: property_media_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_media_settings ALTER COLUMN id SET DEFAULT nextval('public.property_media_settings_id_seq'::regclass);


--
-- Name: property_payout_rules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_payout_rules ALTER COLUMN id SET DEFAULT nextval('public.property_payout_rules_id_seq'::regclass);


--
-- Name: property_referrals id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_referrals ALTER COLUMN id SET DEFAULT nextval('public.property_referrals_id_seq'::regclass);


--
-- Name: property_revenue_targets id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_revenue_targets ALTER COLUMN id SET DEFAULT nextval('public.property_revenue_targets_id_seq'::regclass);


--
-- Name: property_reviews id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_reviews ALTER COLUMN id SET DEFAULT nextval('public.property_reviews_id_seq'::regclass);


--
-- Name: property_status id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_status ALTER COLUMN id SET DEFAULT nextval('public.property_status_id_seq'::regclass);


--
-- Name: property_utility_accounts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_utility_accounts ALTER COLUMN id SET DEFAULT nextval('public.property_utility_accounts_id_seq'::regclass);


--
-- Name: property_utility_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_utility_settings ALTER COLUMN id SET DEFAULT nextval('public.property_utility_settings_id_seq'::regclass);


--
-- Name: recurring_service_charges id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recurring_service_charges ALTER COLUMN id SET DEFAULT nextval('public.recurring_service_charges_id_seq'::regclass);


--
-- Name: referral_earnings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referral_earnings ALTER COLUMN id SET DEFAULT nextval('public.referral_earnings_id_seq'::regclass);


--
-- Name: seasonal_forecasts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.seasonal_forecasts ALTER COLUMN id SET DEFAULT nextval('public.seasonal_forecasts_id_seq'::regclass);


--
-- Name: security_deposits id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_deposits ALTER COLUMN id SET DEFAULT nextval('public.security_deposits_id_seq'::regclass);


--
-- Name: service_bookings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_bookings ALTER COLUMN id SET DEFAULT nextval('public.service_bookings_id_seq'::regclass);


--
-- Name: service_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_categories ALTER COLUMN id SET DEFAULT nextval('public.service_categories_id_seq'::regclass);


--
-- Name: service_reviews id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_reviews ALTER COLUMN id SET DEFAULT nextval('public.service_reviews_id_seq'::regclass);


--
-- Name: service_vendor_analytics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_vendor_analytics ALTER COLUMN id SET DEFAULT nextval('public.service_vendor_analytics_id_seq'::regclass);


--
-- Name: service_vendors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_vendors ALTER COLUMN id SET DEFAULT nextval('public.service_vendors_id_seq'::regclass);


--
-- Name: shared_cost_splits id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shared_cost_splits ALTER COLUMN id SET DEFAULT nextval('public.shared_cost_splits_id_seq'::regclass);


--
-- Name: shared_costs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shared_costs ALTER COLUMN id SET DEFAULT nextval('public.shared_costs_id_seq'::regclass);


--
-- Name: staff_salaries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_salaries ALTER COLUMN id SET DEFAULT nextval('public.staff_salaries_id_seq'::regclass);


--
-- Name: staff_skills id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_skills ALTER COLUMN id SET DEFAULT nextval('public.staff_skills_id_seq'::regclass);


--
-- Name: staff_workload_stats id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_workload_stats ALTER COLUMN id SET DEFAULT nextval('public.staff_workload_stats_id_seq'::regclass);


--
-- Name: supply_orders id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.supply_orders ALTER COLUMN id SET DEFAULT nextval('public.supply_orders_id_seq'::regclass);


--
-- Name: sustainability_metrics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sustainability_metrics ALTER COLUMN id SET DEFAULT nextval('public.sustainability_metrics_id_seq'::regclass);


--
-- Name: task_ai_scan_results id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.task_ai_scan_results ALTER COLUMN id SET DEFAULT nextval('public.task_ai_scan_results_id_seq'::regclass);


--
-- Name: task_history id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.task_history ALTER COLUMN id SET DEFAULT nextval('public.task_history_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: tax_rules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tax_rules ALTER COLUMN id SET DEFAULT nextval('public.tax_rules_id_seq'::regclass);


--
-- Name: upsell_recommendations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upsell_recommendations ALTER COLUMN id SET DEFAULT nextval('public.upsell_recommendations_id_seq'::regclass);


--
-- Name: utility_bill_reminders id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.utility_bill_reminders ALTER COLUMN id SET DEFAULT nextval('public.utility_bill_reminders_id_seq'::regclass);


--
-- Name: utility_bills id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.utility_bills ALTER COLUMN id SET DEFAULT nextval('public.utility_bills_id_seq'::regclass);


--
-- Name: utility_providers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.utility_providers ALTER COLUMN id SET DEFAULT nextval('public.utility_providers_id_seq'::regclass);


--
-- Name: vendor_service_history id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_service_history ALTER COLUMN id SET DEFAULT nextval('public.vendor_service_history_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Name: welcome_pack_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.welcome_pack_items ALTER COLUMN id SET DEFAULT nextval('public.welcome_pack_items_id_seq'::regclass);


--
-- Name: welcome_pack_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.welcome_pack_templates ALTER COLUMN id SET DEFAULT nextval('public.welcome_pack_templates_id_seq'::regclass);


--
-- Name: welcome_pack_usage id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.welcome_pack_usage ALTER COLUMN id SET DEFAULT nextval('public.welcome_pack_usage_id_seq'::regclass);


--
-- Name: whatsapp_bot_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.whatsapp_bot_logs ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_bot_logs_id_seq'::regclass);


--
-- Data for Name: addon_bookings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.addon_bookings (id, service_id, booking_id, property_id, guest_name, guest_email, guest_phone, scheduled_date, duration, total_price, status, charged_to, notes, created_at, updated_at, organization_id, quantity, base_price, billing_type, gift_reason, booked_by, booked_by_role, approved_by, approval_status, internal_notes) FROM stdin;
\.


--
-- Data for Name: addon_services; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.addon_services (id, name, description, category, duration, is_active, available_properties, max_advance_booking_days, created_at, updated_at, organization_id, pricing_model, base_price, hourly_rate, minimum_charge, requires_approval, allow_guest_booking, allow_manager_booking) FROM stdin;
2	Airport Pickup	Comfortable airport transfer service	transportation	60	t	\N	30	2025-07-02 07:51:33.357157	2025-07-02 07:51:33.357157	demo-org	fixed	85.00	\N	\N	f	t	t
3	In-Villa Massage	Professional massage therapist service	massage	\N	t	\N	30	2025-07-02 07:51:33.357157	2025-07-02 07:51:33.357157	demo-org	variable	\N	120.00	120.00	f	t	t
4	Private Chef	Personal chef for in-villa dining	chef	\N	t	\N	30	2025-07-02 07:51:33.357157	2025-07-02 07:51:33.357157	demo-org	variable	\N	85.00	340.00	f	f	t
5	Extra Cleaning	Additional housekeeping service	cleaning	120	t	\N	30	2025-07-02 07:51:33.357157	2025-07-02 07:51:33.357157	demo-org	fixed	75.00	\N	\N	f	t	t
6	Welcome Gift	Complimentary welcome basket	concierge	\N	t	\N	30	2025-07-02 07:51:33.357157	2025-07-02 07:51:33.357157	demo-org	complimentary	0.00	\N	\N	f	f	t
7	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 07:53:44.731919	2025-07-24 07:53:44.731919	default-org	fixed	\N	\N	\N	f	t	t
8	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 07:53:44.731919	2025-07-24 07:53:44.731919	default-org	fixed	\N	\N	\N	f	t	t
9	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 07:53:44.731919	2025-07-24 07:53:44.731919	default-org	fixed	\N	\N	\N	f	t	t
10	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 07:53:44.731919	2025-07-24 07:53:44.731919	default-org	fixed	\N	\N	\N	f	t	t
11	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 07:53:44.731919	2025-07-24 07:53:44.731919	default-org	fixed	\N	\N	\N	f	t	t
12	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 15:47:58.53627	2025-07-24 15:47:58.53627	default-org	fixed	\N	\N	\N	f	t	t
13	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 15:47:58.53627	2025-07-24 15:47:58.53627	default-org	fixed	\N	\N	\N	f	t	t
14	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 15:47:58.53627	2025-07-24 15:47:58.53627	default-org	fixed	\N	\N	\N	f	t	t
15	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 15:47:58.53627	2025-07-24 15:47:58.53627	default-org	fixed	\N	\N	\N	f	t	t
16	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 15:47:58.53627	2025-07-24 15:47:58.53627	default-org	fixed	\N	\N	\N	f	t	t
17	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 15:48:19.638357	2025-07-24 15:48:19.638357	default-org	fixed	\N	\N	\N	f	t	t
18	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 15:48:19.638357	2025-07-24 15:48:19.638357	default-org	fixed	\N	\N	\N	f	t	t
19	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 15:48:19.638357	2025-07-24 15:48:19.638357	default-org	fixed	\N	\N	\N	f	t	t
20	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 15:48:19.638357	2025-07-24 15:48:19.638357	default-org	fixed	\N	\N	\N	f	t	t
21	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 15:48:19.638357	2025-07-24 15:48:19.638357	default-org	fixed	\N	\N	\N	f	t	t
22	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 15:48:38.465315	2025-07-24 15:48:38.465315	default-org	fixed	\N	\N	\N	f	t	t
23	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 15:48:38.465315	2025-07-24 15:48:38.465315	default-org	fixed	\N	\N	\N	f	t	t
24	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 15:48:38.465315	2025-07-24 15:48:38.465315	default-org	fixed	\N	\N	\N	f	t	t
25	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 15:48:38.465315	2025-07-24 15:48:38.465315	default-org	fixed	\N	\N	\N	f	t	t
26	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 15:48:38.465315	2025-07-24 15:48:38.465315	default-org	fixed	\N	\N	\N	f	t	t
27	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 15:49:43.032262	2025-07-24 15:49:43.032262	default-org	fixed	\N	\N	\N	f	t	t
28	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 15:49:43.032262	2025-07-24 15:49:43.032262	default-org	fixed	\N	\N	\N	f	t	t
29	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 15:49:43.032262	2025-07-24 15:49:43.032262	default-org	fixed	\N	\N	\N	f	t	t
30	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 15:49:43.032262	2025-07-24 15:49:43.032262	default-org	fixed	\N	\N	\N	f	t	t
31	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 15:49:43.032262	2025-07-24 15:49:43.032262	default-org	fixed	\N	\N	\N	f	t	t
32	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 15:50:04.803182	2025-07-24 15:50:04.803182	default-org	fixed	\N	\N	\N	f	t	t
33	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 15:50:04.803182	2025-07-24 15:50:04.803182	default-org	fixed	\N	\N	\N	f	t	t
34	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 15:50:04.803182	2025-07-24 15:50:04.803182	default-org	fixed	\N	\N	\N	f	t	t
35	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 15:50:04.803182	2025-07-24 15:50:04.803182	default-org	fixed	\N	\N	\N	f	t	t
36	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 15:50:04.803182	2025-07-24 15:50:04.803182	default-org	fixed	\N	\N	\N	f	t	t
37	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 15:53:43.105666	2025-07-24 15:53:43.105666	default-org	fixed	\N	\N	\N	f	t	t
38	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 15:53:43.105666	2025-07-24 15:53:43.105666	default-org	fixed	\N	\N	\N	f	t	t
39	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 15:53:43.105666	2025-07-24 15:53:43.105666	default-org	fixed	\N	\N	\N	f	t	t
40	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 15:53:43.105666	2025-07-24 15:53:43.105666	default-org	fixed	\N	\N	\N	f	t	t
41	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 15:53:43.105666	2025-07-24 15:53:43.105666	default-org	fixed	\N	\N	\N	f	t	t
42	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 15:54:07.053899	2025-07-24 15:54:07.053899	default-org	fixed	\N	\N	\N	f	t	t
43	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 15:54:07.053899	2025-07-24 15:54:07.053899	default-org	fixed	\N	\N	\N	f	t	t
44	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 15:54:07.053899	2025-07-24 15:54:07.053899	default-org	fixed	\N	\N	\N	f	t	t
45	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 15:54:07.053899	2025-07-24 15:54:07.053899	default-org	fixed	\N	\N	\N	f	t	t
46	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 15:54:07.053899	2025-07-24 15:54:07.053899	default-org	fixed	\N	\N	\N	f	t	t
47	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 16:02:46.05578	2025-07-24 16:02:46.05578	default-org	fixed	\N	\N	\N	f	t	t
48	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 16:02:46.05578	2025-07-24 16:02:46.05578	default-org	fixed	\N	\N	\N	f	t	t
49	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 16:02:46.05578	2025-07-24 16:02:46.05578	default-org	fixed	\N	\N	\N	f	t	t
50	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 16:02:46.05578	2025-07-24 16:02:46.05578	default-org	fixed	\N	\N	\N	f	t	t
51	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 16:02:46.05578	2025-07-24 16:02:46.05578	default-org	fixed	\N	\N	\N	f	t	t
52	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 16:06:37.485348	2025-07-24 16:06:37.485348	default-org	fixed	\N	\N	\N	f	t	t
53	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 16:06:37.485348	2025-07-24 16:06:37.485348	default-org	fixed	\N	\N	\N	f	t	t
54	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 16:06:37.485348	2025-07-24 16:06:37.485348	default-org	fixed	\N	\N	\N	f	t	t
55	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 16:06:37.485348	2025-07-24 16:06:37.485348	default-org	fixed	\N	\N	\N	f	t	t
56	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 16:06:37.485348	2025-07-24 16:06:37.485348	default-org	fixed	\N	\N	\N	f	t	t
57	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 16:07:28.724575	2025-07-24 16:07:28.724575	default-org	fixed	\N	\N	\N	f	t	t
58	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 16:07:28.724575	2025-07-24 16:07:28.724575	default-org	fixed	\N	\N	\N	f	t	t
59	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 16:07:28.724575	2025-07-24 16:07:28.724575	default-org	fixed	\N	\N	\N	f	t	t
60	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 16:07:28.724575	2025-07-24 16:07:28.724575	default-org	fixed	\N	\N	\N	f	t	t
61	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 16:07:28.724575	2025-07-24 16:07:28.724575	default-org	fixed	\N	\N	\N	f	t	t
62	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 17:51:06.938814	2025-07-24 17:51:06.938814	default-org	fixed	\N	\N	\N	f	t	t
63	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 17:51:06.938814	2025-07-24 17:51:06.938814	default-org	fixed	\N	\N	\N	f	t	t
64	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 17:51:06.938814	2025-07-24 17:51:06.938814	default-org	fixed	\N	\N	\N	f	t	t
65	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 17:51:06.938814	2025-07-24 17:51:06.938814	default-org	fixed	\N	\N	\N	f	t	t
66	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 17:51:06.938814	2025-07-24 17:51:06.938814	default-org	fixed	\N	\N	\N	f	t	t
67	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 17:52:29.178833	2025-07-24 17:52:29.178833	default-org	fixed	\N	\N	\N	f	t	t
68	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 17:52:29.178833	2025-07-24 17:52:29.178833	default-org	fixed	\N	\N	\N	f	t	t
69	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 17:52:29.178833	2025-07-24 17:52:29.178833	default-org	fixed	\N	\N	\N	f	t	t
70	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 17:52:29.178833	2025-07-24 17:52:29.178833	default-org	fixed	\N	\N	\N	f	t	t
71	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 17:52:29.178833	2025-07-24 17:52:29.178833	default-org	fixed	\N	\N	\N	f	t	t
72	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 17:57:11.441731	2025-07-24 17:57:11.441731	default-org	fixed	\N	\N	\N	f	t	t
73	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 17:57:11.441731	2025-07-24 17:57:11.441731	default-org	fixed	\N	\N	\N	f	t	t
74	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 17:57:11.441731	2025-07-24 17:57:11.441731	default-org	fixed	\N	\N	\N	f	t	t
75	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 17:57:11.441731	2025-07-24 17:57:11.441731	default-org	fixed	\N	\N	\N	f	t	t
76	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 17:57:11.441731	2025-07-24 17:57:11.441731	default-org	fixed	\N	\N	\N	f	t	t
77	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 18:18:51.379844	2025-07-24 18:18:51.379844	default-org	fixed	\N	\N	\N	f	t	t
78	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 18:18:51.379844	2025-07-24 18:18:51.379844	default-org	fixed	\N	\N	\N	f	t	t
79	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 18:18:51.379844	2025-07-24 18:18:51.379844	default-org	fixed	\N	\N	\N	f	t	t
80	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 18:18:51.379844	2025-07-24 18:18:51.379844	default-org	fixed	\N	\N	\N	f	t	t
81	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 18:18:51.379844	2025-07-24 18:18:51.379844	default-org	fixed	\N	\N	\N	f	t	t
82	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-24 18:22:30.4467	2025-07-24 18:22:30.4467	default-org	fixed	\N	\N	\N	f	t	t
83	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-24 18:22:30.4467	2025-07-24 18:22:30.4467	default-org	fixed	\N	\N	\N	f	t	t
84	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-24 18:22:30.4467	2025-07-24 18:22:30.4467	default-org	fixed	\N	\N	\N	f	t	t
85	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-24 18:22:30.4467	2025-07-24 18:22:30.4467	default-org	fixed	\N	\N	\N	f	t	t
86	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-24 18:22:30.4467	2025-07-24 18:22:30.4467	default-org	fixed	\N	\N	\N	f	t	t
87	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 03:47:34.991779	2025-07-25 03:47:34.991779	default-org	fixed	\N	\N	\N	f	t	t
88	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 03:47:34.991779	2025-07-25 03:47:34.991779	default-org	fixed	\N	\N	\N	f	t	t
89	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 03:47:34.991779	2025-07-25 03:47:34.991779	default-org	fixed	\N	\N	\N	f	t	t
90	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 03:47:34.991779	2025-07-25 03:47:34.991779	default-org	fixed	\N	\N	\N	f	t	t
91	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 03:47:34.991779	2025-07-25 03:47:34.991779	default-org	fixed	\N	\N	\N	f	t	t
92	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 04:12:49.764294	2025-07-25 04:12:49.764294	default-org	fixed	\N	\N	\N	f	t	t
93	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 04:12:49.764294	2025-07-25 04:12:49.764294	default-org	fixed	\N	\N	\N	f	t	t
94	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 04:12:49.764294	2025-07-25 04:12:49.764294	default-org	fixed	\N	\N	\N	f	t	t
95	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 04:12:49.764294	2025-07-25 04:12:49.764294	default-org	fixed	\N	\N	\N	f	t	t
96	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 04:12:49.764294	2025-07-25 04:12:49.764294	default-org	fixed	\N	\N	\N	f	t	t
97	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 04:22:57.538076	2025-07-25 04:22:57.538076	default-org	fixed	\N	\N	\N	f	t	t
98	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 04:22:57.538076	2025-07-25 04:22:57.538076	default-org	fixed	\N	\N	\N	f	t	t
99	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 04:22:57.538076	2025-07-25 04:22:57.538076	default-org	fixed	\N	\N	\N	f	t	t
100	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 04:22:57.538076	2025-07-25 04:22:57.538076	default-org	fixed	\N	\N	\N	f	t	t
101	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 04:22:57.538076	2025-07-25 04:22:57.538076	default-org	fixed	\N	\N	\N	f	t	t
102	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 04:39:29.090342	2025-07-25 04:39:29.090342	default-org	fixed	\N	\N	\N	f	t	t
103	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 04:39:29.090342	2025-07-25 04:39:29.090342	default-org	fixed	\N	\N	\N	f	t	t
104	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 04:39:29.090342	2025-07-25 04:39:29.090342	default-org	fixed	\N	\N	\N	f	t	t
105	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 04:39:29.090342	2025-07-25 04:39:29.090342	default-org	fixed	\N	\N	\N	f	t	t
106	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 04:39:29.090342	2025-07-25 04:39:29.090342	default-org	fixed	\N	\N	\N	f	t	t
107	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 04:42:30.176555	2025-07-25 04:42:30.176555	default-org	fixed	\N	\N	\N	f	t	t
108	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 04:42:30.176555	2025-07-25 04:42:30.176555	default-org	fixed	\N	\N	\N	f	t	t
109	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 04:42:30.176555	2025-07-25 04:42:30.176555	default-org	fixed	\N	\N	\N	f	t	t
110	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 04:42:30.176555	2025-07-25 04:42:30.176555	default-org	fixed	\N	\N	\N	f	t	t
111	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 04:42:30.176555	2025-07-25 04:42:30.176555	default-org	fixed	\N	\N	\N	f	t	t
112	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 05:30:34.279502	2025-07-25 05:30:34.279502	default-org	fixed	\N	\N	\N	f	t	t
113	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 05:30:34.279502	2025-07-25 05:30:34.279502	default-org	fixed	\N	\N	\N	f	t	t
114	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 05:30:34.279502	2025-07-25 05:30:34.279502	default-org	fixed	\N	\N	\N	f	t	t
115	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 05:30:34.279502	2025-07-25 05:30:34.279502	default-org	fixed	\N	\N	\N	f	t	t
116	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 05:30:34.279502	2025-07-25 05:30:34.279502	default-org	fixed	\N	\N	\N	f	t	t
117	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 05:31:56.708613	2025-07-25 05:31:56.708613	default-org	fixed	\N	\N	\N	f	t	t
118	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 05:31:56.708613	2025-07-25 05:31:56.708613	default-org	fixed	\N	\N	\N	f	t	t
119	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 05:31:56.708613	2025-07-25 05:31:56.708613	default-org	fixed	\N	\N	\N	f	t	t
120	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 05:31:56.708613	2025-07-25 05:31:56.708613	default-org	fixed	\N	\N	\N	f	t	t
121	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 05:31:56.708613	2025-07-25 05:31:56.708613	default-org	fixed	\N	\N	\N	f	t	t
122	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 05:33:30.769712	2025-07-25 05:33:30.769712	default-org	fixed	\N	\N	\N	f	t	t
123	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 05:33:30.769712	2025-07-25 05:33:30.769712	default-org	fixed	\N	\N	\N	f	t	t
124	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 05:33:30.769712	2025-07-25 05:33:30.769712	default-org	fixed	\N	\N	\N	f	t	t
125	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 05:33:30.769712	2025-07-25 05:33:30.769712	default-org	fixed	\N	\N	\N	f	t	t
126	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 05:33:30.769712	2025-07-25 05:33:30.769712	default-org	fixed	\N	\N	\N	f	t	t
127	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 05:35:37.350439	2025-07-25 05:35:37.350439	default-org	fixed	\N	\N	\N	f	t	t
128	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 05:35:37.350439	2025-07-25 05:35:37.350439	default-org	fixed	\N	\N	\N	f	t	t
129	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 05:35:37.350439	2025-07-25 05:35:37.350439	default-org	fixed	\N	\N	\N	f	t	t
130	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 05:35:37.350439	2025-07-25 05:35:37.350439	default-org	fixed	\N	\N	\N	f	t	t
131	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 05:35:37.350439	2025-07-25 05:35:37.350439	default-org	fixed	\N	\N	\N	f	t	t
132	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 05:55:12.965579	2025-07-25 05:55:12.965579	default-org	fixed	\N	\N	\N	f	t	t
133	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 05:55:12.965579	2025-07-25 05:55:12.965579	default-org	fixed	\N	\N	\N	f	t	t
134	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 05:55:12.965579	2025-07-25 05:55:12.965579	default-org	fixed	\N	\N	\N	f	t	t
135	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 05:55:12.965579	2025-07-25 05:55:12.965579	default-org	fixed	\N	\N	\N	f	t	t
136	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 05:55:12.965579	2025-07-25 05:55:12.965579	default-org	fixed	\N	\N	\N	f	t	t
137	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 05:55:46.184503	2025-07-25 05:55:46.184503	default-org	fixed	\N	\N	\N	f	t	t
138	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 05:55:46.184503	2025-07-25 05:55:46.184503	default-org	fixed	\N	\N	\N	f	t	t
139	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 05:55:46.184503	2025-07-25 05:55:46.184503	default-org	fixed	\N	\N	\N	f	t	t
140	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 05:55:46.184503	2025-07-25 05:55:46.184503	default-org	fixed	\N	\N	\N	f	t	t
141	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 05:55:46.184503	2025-07-25 05:55:46.184503	default-org	fixed	\N	\N	\N	f	t	t
142	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 05:59:08.606695	2025-07-25 05:59:08.606695	default-org	fixed	\N	\N	\N	f	t	t
143	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 05:59:08.606695	2025-07-25 05:59:08.606695	default-org	fixed	\N	\N	\N	f	t	t
144	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 05:59:08.606695	2025-07-25 05:59:08.606695	default-org	fixed	\N	\N	\N	f	t	t
145	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 05:59:08.606695	2025-07-25 05:59:08.606695	default-org	fixed	\N	\N	\N	f	t	t
146	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 05:59:08.606695	2025-07-25 05:59:08.606695	default-org	fixed	\N	\N	\N	f	t	t
147	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 06:08:22.206206	2025-07-25 06:08:22.206206	default-org	fixed	\N	\N	\N	f	t	t
148	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 06:08:22.206206	2025-07-25 06:08:22.206206	default-org	fixed	\N	\N	\N	f	t	t
149	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 06:08:22.206206	2025-07-25 06:08:22.206206	default-org	fixed	\N	\N	\N	f	t	t
150	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 06:08:22.206206	2025-07-25 06:08:22.206206	default-org	fixed	\N	\N	\N	f	t	t
151	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 06:08:22.206206	2025-07-25 06:08:22.206206	default-org	fixed	\N	\N	\N	f	t	t
152	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 08:57:07.679371	2025-07-25 08:57:07.679371	default-org	fixed	\N	\N	\N	f	t	t
153	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 08:57:07.679371	2025-07-25 08:57:07.679371	default-org	fixed	\N	\N	\N	f	t	t
154	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 08:57:07.679371	2025-07-25 08:57:07.679371	default-org	fixed	\N	\N	\N	f	t	t
155	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 08:57:07.679371	2025-07-25 08:57:07.679371	default-org	fixed	\N	\N	\N	f	t	t
156	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 08:57:07.679371	2025-07-25 08:57:07.679371	default-org	fixed	\N	\N	\N	f	t	t
157	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 09:07:59.45151	2025-07-25 09:07:59.45151	default-org	fixed	\N	\N	\N	f	t	t
158	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 09:07:59.45151	2025-07-25 09:07:59.45151	default-org	fixed	\N	\N	\N	f	t	t
159	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 09:07:59.45151	2025-07-25 09:07:59.45151	default-org	fixed	\N	\N	\N	f	t	t
160	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 09:07:59.45151	2025-07-25 09:07:59.45151	default-org	fixed	\N	\N	\N	f	t	t
161	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 09:07:59.45151	2025-07-25 09:07:59.45151	default-org	fixed	\N	\N	\N	f	t	t
162	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 09:09:33.688373	2025-07-25 09:09:33.688373	default-org	fixed	\N	\N	\N	f	t	t
163	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 09:09:33.688373	2025-07-25 09:09:33.688373	default-org	fixed	\N	\N	\N	f	t	t
164	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 09:09:33.688373	2025-07-25 09:09:33.688373	default-org	fixed	\N	\N	\N	f	t	t
165	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 09:09:33.688373	2025-07-25 09:09:33.688373	default-org	fixed	\N	\N	\N	f	t	t
166	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 09:09:33.688373	2025-07-25 09:09:33.688373	default-org	fixed	\N	\N	\N	f	t	t
167	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 09:12:07.398351	2025-07-25 09:12:07.398351	default-org	fixed	\N	\N	\N	f	t	t
168	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 09:12:07.398351	2025-07-25 09:12:07.398351	default-org	fixed	\N	\N	\N	f	t	t
169	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 09:12:07.398351	2025-07-25 09:12:07.398351	default-org	fixed	\N	\N	\N	f	t	t
170	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 09:12:07.398351	2025-07-25 09:12:07.398351	default-org	fixed	\N	\N	\N	f	t	t
171	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 09:12:07.398351	2025-07-25 09:12:07.398351	default-org	fixed	\N	\N	\N	f	t	t
172	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 09:21:20.471333	2025-07-25 09:21:20.471333	default-org	fixed	\N	\N	\N	f	t	t
173	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 09:21:20.471333	2025-07-25 09:21:20.471333	default-org	fixed	\N	\N	\N	f	t	t
174	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 09:21:20.471333	2025-07-25 09:21:20.471333	default-org	fixed	\N	\N	\N	f	t	t
175	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 09:21:20.471333	2025-07-25 09:21:20.471333	default-org	fixed	\N	\N	\N	f	t	t
176	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 09:21:20.471333	2025-07-25 09:21:20.471333	default-org	fixed	\N	\N	\N	f	t	t
177	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 09:23:30.442874	2025-07-25 09:23:30.442874	default-org	fixed	\N	\N	\N	f	t	t
178	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 09:23:30.442874	2025-07-25 09:23:30.442874	default-org	fixed	\N	\N	\N	f	t	t
179	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 09:23:30.442874	2025-07-25 09:23:30.442874	default-org	fixed	\N	\N	\N	f	t	t
180	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 09:23:30.442874	2025-07-25 09:23:30.442874	default-org	fixed	\N	\N	\N	f	t	t
181	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 09:23:30.442874	2025-07-25 09:23:30.442874	default-org	fixed	\N	\N	\N	f	t	t
182	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 09:36:27.400807	2025-07-25 09:36:27.400807	default-org	fixed	\N	\N	\N	f	t	t
183	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 09:36:27.400807	2025-07-25 09:36:27.400807	default-org	fixed	\N	\N	\N	f	t	t
184	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 09:36:27.400807	2025-07-25 09:36:27.400807	default-org	fixed	\N	\N	\N	f	t	t
185	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 09:36:27.400807	2025-07-25 09:36:27.400807	default-org	fixed	\N	\N	\N	f	t	t
186	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 09:36:27.400807	2025-07-25 09:36:27.400807	default-org	fixed	\N	\N	\N	f	t	t
187	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 09:39:53.739294	2025-07-25 09:39:53.739294	default-org	fixed	\N	\N	\N	f	t	t
188	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 09:39:53.739294	2025-07-25 09:39:53.739294	default-org	fixed	\N	\N	\N	f	t	t
189	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 09:39:53.739294	2025-07-25 09:39:53.739294	default-org	fixed	\N	\N	\N	f	t	t
190	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 09:39:53.739294	2025-07-25 09:39:53.739294	default-org	fixed	\N	\N	\N	f	t	t
191	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 09:39:53.739294	2025-07-25 09:39:53.739294	default-org	fixed	\N	\N	\N	f	t	t
192	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 09:43:47.50673	2025-07-25 09:43:47.50673	default-org	fixed	\N	\N	\N	f	t	t
193	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 09:43:47.50673	2025-07-25 09:43:47.50673	default-org	fixed	\N	\N	\N	f	t	t
194	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 09:43:47.50673	2025-07-25 09:43:47.50673	default-org	fixed	\N	\N	\N	f	t	t
195	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 09:43:47.50673	2025-07-25 09:43:47.50673	default-org	fixed	\N	\N	\N	f	t	t
196	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 09:43:47.50673	2025-07-25 09:43:47.50673	default-org	fixed	\N	\N	\N	f	t	t
197	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 09:46:13.714933	2025-07-25 09:46:13.714933	default-org	fixed	\N	\N	\N	f	t	t
198	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 09:46:13.714933	2025-07-25 09:46:13.714933	default-org	fixed	\N	\N	\N	f	t	t
199	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 09:46:13.714933	2025-07-25 09:46:13.714933	default-org	fixed	\N	\N	\N	f	t	t
200	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 09:46:13.714933	2025-07-25 09:46:13.714933	default-org	fixed	\N	\N	\N	f	t	t
201	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 09:46:13.714933	2025-07-25 09:46:13.714933	default-org	fixed	\N	\N	\N	f	t	t
202	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 11:52:37.104	2025-07-25 11:52:37.104	default-org	fixed	\N	\N	\N	f	t	t
203	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 11:52:37.104	2025-07-25 11:52:37.104	default-org	fixed	\N	\N	\N	f	t	t
204	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 11:52:37.104	2025-07-25 11:52:37.104	default-org	fixed	\N	\N	\N	f	t	t
205	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 11:52:37.104	2025-07-25 11:52:37.104	default-org	fixed	\N	\N	\N	f	t	t
206	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 11:52:37.104	2025-07-25 11:52:37.104	default-org	fixed	\N	\N	\N	f	t	t
207	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 11:54:01.470311	2025-07-25 11:54:01.470311	default-org	fixed	\N	\N	\N	f	t	t
208	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 11:54:01.470311	2025-07-25 11:54:01.470311	default-org	fixed	\N	\N	\N	f	t	t
209	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 11:54:01.470311	2025-07-25 11:54:01.470311	default-org	fixed	\N	\N	\N	f	t	t
210	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 11:54:01.470311	2025-07-25 11:54:01.470311	default-org	fixed	\N	\N	\N	f	t	t
211	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 11:54:01.470311	2025-07-25 11:54:01.470311	default-org	fixed	\N	\N	\N	f	t	t
212	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 12:18:47.307355	2025-07-25 12:18:47.307355	default-org	fixed	\N	\N	\N	f	t	t
213	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 12:18:47.307355	2025-07-25 12:18:47.307355	default-org	fixed	\N	\N	\N	f	t	t
214	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 12:18:47.307355	2025-07-25 12:18:47.307355	default-org	fixed	\N	\N	\N	f	t	t
215	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 12:18:47.307355	2025-07-25 12:18:47.307355	default-org	fixed	\N	\N	\N	f	t	t
216	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 12:18:47.307355	2025-07-25 12:18:47.307355	default-org	fixed	\N	\N	\N	f	t	t
217	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 12:22:25.020639	2025-07-25 12:22:25.020639	default-org	fixed	\N	\N	\N	f	t	t
218	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 12:22:25.020639	2025-07-25 12:22:25.020639	default-org	fixed	\N	\N	\N	f	t	t
219	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 12:22:25.020639	2025-07-25 12:22:25.020639	default-org	fixed	\N	\N	\N	f	t	t
220	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 12:22:25.020639	2025-07-25 12:22:25.020639	default-org	fixed	\N	\N	\N	f	t	t
221	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 12:22:25.020639	2025-07-25 12:22:25.020639	default-org	fixed	\N	\N	\N	f	t	t
222	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-25 12:25:08.51879	2025-07-25 12:25:08.51879	default-org	fixed	\N	\N	\N	f	t	t
223	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-25 12:25:08.51879	2025-07-25 12:25:08.51879	default-org	fixed	\N	\N	\N	f	t	t
224	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-25 12:25:08.51879	2025-07-25 12:25:08.51879	default-org	fixed	\N	\N	\N	f	t	t
225	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-25 12:25:08.51879	2025-07-25 12:25:08.51879	default-org	fixed	\N	\N	\N	f	t	t
226	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-25 12:25:08.51879	2025-07-25 12:25:08.51879	default-org	fixed	\N	\N	\N	f	t	t
227	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 07:42:41.186354	2025-07-26 07:42:41.186354	default-org	fixed	\N	\N	\N	f	t	t
228	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 07:42:41.186354	2025-07-26 07:42:41.186354	default-org	fixed	\N	\N	\N	f	t	t
229	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 07:42:41.186354	2025-07-26 07:42:41.186354	default-org	fixed	\N	\N	\N	f	t	t
230	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 07:42:41.186354	2025-07-26 07:42:41.186354	default-org	fixed	\N	\N	\N	f	t	t
231	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 07:42:41.186354	2025-07-26 07:42:41.186354	default-org	fixed	\N	\N	\N	f	t	t
232	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:07:27.172819	2025-07-26 08:07:27.172819	default-org	fixed	\N	\N	\N	f	t	t
233	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:07:27.172819	2025-07-26 08:07:27.172819	default-org	fixed	\N	\N	\N	f	t	t
234	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:07:27.172819	2025-07-26 08:07:27.172819	default-org	fixed	\N	\N	\N	f	t	t
235	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:07:27.172819	2025-07-26 08:07:27.172819	default-org	fixed	\N	\N	\N	f	t	t
236	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:07:27.172819	2025-07-26 08:07:27.172819	default-org	fixed	\N	\N	\N	f	t	t
237	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:09:22.151471	2025-07-26 08:09:22.151471	default-org	fixed	\N	\N	\N	f	t	t
238	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:09:22.151471	2025-07-26 08:09:22.151471	default-org	fixed	\N	\N	\N	f	t	t
239	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:09:22.151471	2025-07-26 08:09:22.151471	default-org	fixed	\N	\N	\N	f	t	t
240	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:09:22.151471	2025-07-26 08:09:22.151471	default-org	fixed	\N	\N	\N	f	t	t
241	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:09:22.151471	2025-07-26 08:09:22.151471	default-org	fixed	\N	\N	\N	f	t	t
242	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:14:59.605173	2025-07-26 08:14:59.605173	default-org	fixed	\N	\N	\N	f	t	t
243	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:14:59.605173	2025-07-26 08:14:59.605173	default-org	fixed	\N	\N	\N	f	t	t
244	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:14:59.605173	2025-07-26 08:14:59.605173	default-org	fixed	\N	\N	\N	f	t	t
245	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:14:59.605173	2025-07-26 08:14:59.605173	default-org	fixed	\N	\N	\N	f	t	t
246	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:14:59.605173	2025-07-26 08:14:59.605173	default-org	fixed	\N	\N	\N	f	t	t
247	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:19:57.001457	2025-07-26 08:19:57.001457	default-org	fixed	\N	\N	\N	f	t	t
248	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:19:57.001457	2025-07-26 08:19:57.001457	default-org	fixed	\N	\N	\N	f	t	t
249	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:19:57.001457	2025-07-26 08:19:57.001457	default-org	fixed	\N	\N	\N	f	t	t
250	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:19:57.001457	2025-07-26 08:19:57.001457	default-org	fixed	\N	\N	\N	f	t	t
251	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:19:57.001457	2025-07-26 08:19:57.001457	default-org	fixed	\N	\N	\N	f	t	t
252	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:23:02.180601	2025-07-26 08:23:02.180601	default-org	fixed	\N	\N	\N	f	t	t
253	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:23:02.180601	2025-07-26 08:23:02.180601	default-org	fixed	\N	\N	\N	f	t	t
254	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:23:02.180601	2025-07-26 08:23:02.180601	default-org	fixed	\N	\N	\N	f	t	t
255	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:23:02.180601	2025-07-26 08:23:02.180601	default-org	fixed	\N	\N	\N	f	t	t
256	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:23:02.180601	2025-07-26 08:23:02.180601	default-org	fixed	\N	\N	\N	f	t	t
257	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:25:44.956472	2025-07-26 08:25:44.956472	default-org	fixed	\N	\N	\N	f	t	t
258	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:25:44.956472	2025-07-26 08:25:44.956472	default-org	fixed	\N	\N	\N	f	t	t
259	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:25:44.956472	2025-07-26 08:25:44.956472	default-org	fixed	\N	\N	\N	f	t	t
260	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:25:44.956472	2025-07-26 08:25:44.956472	default-org	fixed	\N	\N	\N	f	t	t
261	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:25:44.956472	2025-07-26 08:25:44.956472	default-org	fixed	\N	\N	\N	f	t	t
262	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:27:57.873423	2025-07-26 08:27:57.873423	default-org	fixed	\N	\N	\N	f	t	t
263	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:27:57.873423	2025-07-26 08:27:57.873423	default-org	fixed	\N	\N	\N	f	t	t
264	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:27:57.873423	2025-07-26 08:27:57.873423	default-org	fixed	\N	\N	\N	f	t	t
265	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:27:57.873423	2025-07-26 08:27:57.873423	default-org	fixed	\N	\N	\N	f	t	t
266	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:27:57.873423	2025-07-26 08:27:57.873423	default-org	fixed	\N	\N	\N	f	t	t
267	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:30:22.26041	2025-07-26 08:30:22.26041	default-org	fixed	\N	\N	\N	f	t	t
268	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:30:22.26041	2025-07-26 08:30:22.26041	default-org	fixed	\N	\N	\N	f	t	t
269	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:30:22.26041	2025-07-26 08:30:22.26041	default-org	fixed	\N	\N	\N	f	t	t
270	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:30:22.26041	2025-07-26 08:30:22.26041	default-org	fixed	\N	\N	\N	f	t	t
271	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:30:22.26041	2025-07-26 08:30:22.26041	default-org	fixed	\N	\N	\N	f	t	t
272	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:33:24.11331	2025-07-26 08:33:24.11331	default-org	fixed	\N	\N	\N	f	t	t
273	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:33:24.11331	2025-07-26 08:33:24.11331	default-org	fixed	\N	\N	\N	f	t	t
274	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:33:24.11331	2025-07-26 08:33:24.11331	default-org	fixed	\N	\N	\N	f	t	t
275	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:33:24.11331	2025-07-26 08:33:24.11331	default-org	fixed	\N	\N	\N	f	t	t
276	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:33:24.11331	2025-07-26 08:33:24.11331	default-org	fixed	\N	\N	\N	f	t	t
277	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:36:16.58076	2025-07-26 08:36:16.58076	default-org	fixed	\N	\N	\N	f	t	t
278	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:36:16.58076	2025-07-26 08:36:16.58076	default-org	fixed	\N	\N	\N	f	t	t
279	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:36:16.58076	2025-07-26 08:36:16.58076	default-org	fixed	\N	\N	\N	f	t	t
280	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:36:16.58076	2025-07-26 08:36:16.58076	default-org	fixed	\N	\N	\N	f	t	t
281	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:36:16.58076	2025-07-26 08:36:16.58076	default-org	fixed	\N	\N	\N	f	t	t
282	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:39:23.404607	2025-07-26 08:39:23.404607	default-org	fixed	\N	\N	\N	f	t	t
283	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:39:23.404607	2025-07-26 08:39:23.404607	default-org	fixed	\N	\N	\N	f	t	t
284	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:39:23.404607	2025-07-26 08:39:23.404607	default-org	fixed	\N	\N	\N	f	t	t
285	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:39:23.404607	2025-07-26 08:39:23.404607	default-org	fixed	\N	\N	\N	f	t	t
286	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:39:23.404607	2025-07-26 08:39:23.404607	default-org	fixed	\N	\N	\N	f	t	t
287	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 08:43:47.669461	2025-07-26 08:43:47.669461	default-org	fixed	\N	\N	\N	f	t	t
288	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 08:43:47.669461	2025-07-26 08:43:47.669461	default-org	fixed	\N	\N	\N	f	t	t
289	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 08:43:47.669461	2025-07-26 08:43:47.669461	default-org	fixed	\N	\N	\N	f	t	t
290	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 08:43:47.669461	2025-07-26 08:43:47.669461	default-org	fixed	\N	\N	\N	f	t	t
291	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 08:43:47.669461	2025-07-26 08:43:47.669461	default-org	fixed	\N	\N	\N	f	t	t
292	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:00:07.651605	2025-07-26 09:00:07.651605	default-org	fixed	\N	\N	\N	f	t	t
293	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:00:07.651605	2025-07-26 09:00:07.651605	default-org	fixed	\N	\N	\N	f	t	t
294	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:00:07.651605	2025-07-26 09:00:07.651605	default-org	fixed	\N	\N	\N	f	t	t
295	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:00:07.651605	2025-07-26 09:00:07.651605	default-org	fixed	\N	\N	\N	f	t	t
296	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:00:07.651605	2025-07-26 09:00:07.651605	default-org	fixed	\N	\N	\N	f	t	t
297	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:00:59.124952	2025-07-26 09:00:59.124952	default-org	fixed	\N	\N	\N	f	t	t
298	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:00:59.124952	2025-07-26 09:00:59.124952	default-org	fixed	\N	\N	\N	f	t	t
299	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:00:59.124952	2025-07-26 09:00:59.124952	default-org	fixed	\N	\N	\N	f	t	t
300	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:00:59.124952	2025-07-26 09:00:59.124952	default-org	fixed	\N	\N	\N	f	t	t
301	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:00:59.124952	2025-07-26 09:00:59.124952	default-org	fixed	\N	\N	\N	f	t	t
302	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:03:51.208675	2025-07-26 09:03:51.208675	default-org	fixed	\N	\N	\N	f	t	t
303	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:03:51.208675	2025-07-26 09:03:51.208675	default-org	fixed	\N	\N	\N	f	t	t
304	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:03:51.208675	2025-07-26 09:03:51.208675	default-org	fixed	\N	\N	\N	f	t	t
305	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:03:51.208675	2025-07-26 09:03:51.208675	default-org	fixed	\N	\N	\N	f	t	t
306	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:03:51.208675	2025-07-26 09:03:51.208675	default-org	fixed	\N	\N	\N	f	t	t
307	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:07:51.20978	2025-07-26 09:07:51.20978	default-org	fixed	\N	\N	\N	f	t	t
308	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:07:51.20978	2025-07-26 09:07:51.20978	default-org	fixed	\N	\N	\N	f	t	t
309	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:07:51.20978	2025-07-26 09:07:51.20978	default-org	fixed	\N	\N	\N	f	t	t
310	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:07:51.20978	2025-07-26 09:07:51.20978	default-org	fixed	\N	\N	\N	f	t	t
311	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:07:51.20978	2025-07-26 09:07:51.20978	default-org	fixed	\N	\N	\N	f	t	t
312	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:11:09.379917	2025-07-26 09:11:09.379917	default-org	fixed	\N	\N	\N	f	t	t
313	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:11:09.379917	2025-07-26 09:11:09.379917	default-org	fixed	\N	\N	\N	f	t	t
314	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:11:09.379917	2025-07-26 09:11:09.379917	default-org	fixed	\N	\N	\N	f	t	t
315	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:11:09.379917	2025-07-26 09:11:09.379917	default-org	fixed	\N	\N	\N	f	t	t
316	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:11:09.379917	2025-07-26 09:11:09.379917	default-org	fixed	\N	\N	\N	f	t	t
317	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:15:12.525633	2025-07-26 09:15:12.525633	default-org	fixed	\N	\N	\N	f	t	t
318	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:15:12.525633	2025-07-26 09:15:12.525633	default-org	fixed	\N	\N	\N	f	t	t
319	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:15:12.525633	2025-07-26 09:15:12.525633	default-org	fixed	\N	\N	\N	f	t	t
320	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:15:12.525633	2025-07-26 09:15:12.525633	default-org	fixed	\N	\N	\N	f	t	t
321	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:15:12.525633	2025-07-26 09:15:12.525633	default-org	fixed	\N	\N	\N	f	t	t
322	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:17:28.237753	2025-07-26 09:17:28.237753	default-org	fixed	\N	\N	\N	f	t	t
323	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:17:28.237753	2025-07-26 09:17:28.237753	default-org	fixed	\N	\N	\N	f	t	t
324	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:17:28.237753	2025-07-26 09:17:28.237753	default-org	fixed	\N	\N	\N	f	t	t
325	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:17:28.237753	2025-07-26 09:17:28.237753	default-org	fixed	\N	\N	\N	f	t	t
326	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:17:28.237753	2025-07-26 09:17:28.237753	default-org	fixed	\N	\N	\N	f	t	t
327	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:18:50.580711	2025-07-26 09:18:50.580711	default-org	fixed	\N	\N	\N	f	t	t
328	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:18:50.580711	2025-07-26 09:18:50.580711	default-org	fixed	\N	\N	\N	f	t	t
329	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:18:50.580711	2025-07-26 09:18:50.580711	default-org	fixed	\N	\N	\N	f	t	t
330	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:18:50.580711	2025-07-26 09:18:50.580711	default-org	fixed	\N	\N	\N	f	t	t
331	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:18:50.580711	2025-07-26 09:18:50.580711	default-org	fixed	\N	\N	\N	f	t	t
332	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:22:20.81932	2025-07-26 09:22:20.81932	default-org	fixed	\N	\N	\N	f	t	t
333	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:22:20.81932	2025-07-26 09:22:20.81932	default-org	fixed	\N	\N	\N	f	t	t
334	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:22:20.81932	2025-07-26 09:22:20.81932	default-org	fixed	\N	\N	\N	f	t	t
335	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:22:20.81932	2025-07-26 09:22:20.81932	default-org	fixed	\N	\N	\N	f	t	t
336	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:22:20.81932	2025-07-26 09:22:20.81932	default-org	fixed	\N	\N	\N	f	t	t
337	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:23:48.446854	2025-07-26 09:23:48.446854	default-org	fixed	\N	\N	\N	f	t	t
338	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:23:48.446854	2025-07-26 09:23:48.446854	default-org	fixed	\N	\N	\N	f	t	t
339	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:23:48.446854	2025-07-26 09:23:48.446854	default-org	fixed	\N	\N	\N	f	t	t
340	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:23:48.446854	2025-07-26 09:23:48.446854	default-org	fixed	\N	\N	\N	f	t	t
341	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:23:48.446854	2025-07-26 09:23:48.446854	default-org	fixed	\N	\N	\N	f	t	t
342	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:24:18.380298	2025-07-26 09:24:18.380298	default-org	fixed	\N	\N	\N	f	t	t
343	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:24:18.380298	2025-07-26 09:24:18.380298	default-org	fixed	\N	\N	\N	f	t	t
344	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:24:18.380298	2025-07-26 09:24:18.380298	default-org	fixed	\N	\N	\N	f	t	t
345	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:24:18.380298	2025-07-26 09:24:18.380298	default-org	fixed	\N	\N	\N	f	t	t
346	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:24:18.380298	2025-07-26 09:24:18.380298	default-org	fixed	\N	\N	\N	f	t	t
347	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:26:49.582602	2025-07-26 09:26:49.582602	default-org	fixed	\N	\N	\N	f	t	t
348	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:26:49.582602	2025-07-26 09:26:49.582602	default-org	fixed	\N	\N	\N	f	t	t
349	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:26:49.582602	2025-07-26 09:26:49.582602	default-org	fixed	\N	\N	\N	f	t	t
350	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:26:49.582602	2025-07-26 09:26:49.582602	default-org	fixed	\N	\N	\N	f	t	t
351	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:26:49.582602	2025-07-26 09:26:49.582602	default-org	fixed	\N	\N	\N	f	t	t
352	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:29:09.128498	2025-07-26 09:29:09.128498	default-org	fixed	\N	\N	\N	f	t	t
353	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:29:09.128498	2025-07-26 09:29:09.128498	default-org	fixed	\N	\N	\N	f	t	t
354	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:29:09.128498	2025-07-26 09:29:09.128498	default-org	fixed	\N	\N	\N	f	t	t
355	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:29:09.128498	2025-07-26 09:29:09.128498	default-org	fixed	\N	\N	\N	f	t	t
356	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:29:09.128498	2025-07-26 09:29:09.128498	default-org	fixed	\N	\N	\N	f	t	t
357	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:29:27.214967	2025-07-26 09:29:27.214967	default-org	fixed	\N	\N	\N	f	t	t
358	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:29:27.214967	2025-07-26 09:29:27.214967	default-org	fixed	\N	\N	\N	f	t	t
359	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:29:27.214967	2025-07-26 09:29:27.214967	default-org	fixed	\N	\N	\N	f	t	t
360	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:29:27.214967	2025-07-26 09:29:27.214967	default-org	fixed	\N	\N	\N	f	t	t
361	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:29:27.214967	2025-07-26 09:29:27.214967	default-org	fixed	\N	\N	\N	f	t	t
362	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:32:26.793249	2025-07-26 09:32:26.793249	default-org	fixed	\N	\N	\N	f	t	t
363	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:32:26.793249	2025-07-26 09:32:26.793249	default-org	fixed	\N	\N	\N	f	t	t
364	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:32:26.793249	2025-07-26 09:32:26.793249	default-org	fixed	\N	\N	\N	f	t	t
365	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:32:26.793249	2025-07-26 09:32:26.793249	default-org	fixed	\N	\N	\N	f	t	t
366	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:32:26.793249	2025-07-26 09:32:26.793249	default-org	fixed	\N	\N	\N	f	t	t
367	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:34:44.582797	2025-07-26 09:34:44.582797	default-org	fixed	\N	\N	\N	f	t	t
368	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:34:44.582797	2025-07-26 09:34:44.582797	default-org	fixed	\N	\N	\N	f	t	t
369	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:34:44.582797	2025-07-26 09:34:44.582797	default-org	fixed	\N	\N	\N	f	t	t
370	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:34:44.582797	2025-07-26 09:34:44.582797	default-org	fixed	\N	\N	\N	f	t	t
371	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:34:44.582797	2025-07-26 09:34:44.582797	default-org	fixed	\N	\N	\N	f	t	t
372	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:37:36.348673	2025-07-26 09:37:36.348673	default-org	fixed	\N	\N	\N	f	t	t
373	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:37:36.348673	2025-07-26 09:37:36.348673	default-org	fixed	\N	\N	\N	f	t	t
374	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:37:36.348673	2025-07-26 09:37:36.348673	default-org	fixed	\N	\N	\N	f	t	t
375	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:37:36.348673	2025-07-26 09:37:36.348673	default-org	fixed	\N	\N	\N	f	t	t
376	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:37:36.348673	2025-07-26 09:37:36.348673	default-org	fixed	\N	\N	\N	f	t	t
377	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:40:26.824486	2025-07-26 09:40:26.824486	default-org	fixed	\N	\N	\N	f	t	t
378	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:40:26.824486	2025-07-26 09:40:26.824486	default-org	fixed	\N	\N	\N	f	t	t
379	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:40:26.824486	2025-07-26 09:40:26.824486	default-org	fixed	\N	\N	\N	f	t	t
380	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:40:26.824486	2025-07-26 09:40:26.824486	default-org	fixed	\N	\N	\N	f	t	t
381	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:40:26.824486	2025-07-26 09:40:26.824486	default-org	fixed	\N	\N	\N	f	t	t
382	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:43:42.998694	2025-07-26 09:43:42.998694	default-org	fixed	\N	\N	\N	f	t	t
383	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:43:42.998694	2025-07-26 09:43:42.998694	default-org	fixed	\N	\N	\N	f	t	t
384	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:43:42.998694	2025-07-26 09:43:42.998694	default-org	fixed	\N	\N	\N	f	t	t
385	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:43:42.998694	2025-07-26 09:43:42.998694	default-org	fixed	\N	\N	\N	f	t	t
386	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:43:42.998694	2025-07-26 09:43:42.998694	default-org	fixed	\N	\N	\N	f	t	t
387	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:47:03.962695	2025-07-26 09:47:03.962695	default-org	fixed	\N	\N	\N	f	t	t
388	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:47:03.962695	2025-07-26 09:47:03.962695	default-org	fixed	\N	\N	\N	f	t	t
389	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:47:03.962695	2025-07-26 09:47:03.962695	default-org	fixed	\N	\N	\N	f	t	t
390	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:47:03.962695	2025-07-26 09:47:03.962695	default-org	fixed	\N	\N	\N	f	t	t
391	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:47:03.962695	2025-07-26 09:47:03.962695	default-org	fixed	\N	\N	\N	f	t	t
392	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:52:17.869927	2025-07-26 09:52:17.869927	default-org	fixed	\N	\N	\N	f	t	t
393	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:52:17.869927	2025-07-26 09:52:17.869927	default-org	fixed	\N	\N	\N	f	t	t
394	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:52:17.869927	2025-07-26 09:52:17.869927	default-org	fixed	\N	\N	\N	f	t	t
395	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:52:17.869927	2025-07-26 09:52:17.869927	default-org	fixed	\N	\N	\N	f	t	t
396	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:52:17.869927	2025-07-26 09:52:17.869927	default-org	fixed	\N	\N	\N	f	t	t
397	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:53:48.783824	2025-07-26 09:53:48.783824	default-org	fixed	\N	\N	\N	f	t	t
398	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:53:48.783824	2025-07-26 09:53:48.783824	default-org	fixed	\N	\N	\N	f	t	t
399	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:53:48.783824	2025-07-26 09:53:48.783824	default-org	fixed	\N	\N	\N	f	t	t
400	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:53:48.783824	2025-07-26 09:53:48.783824	default-org	fixed	\N	\N	\N	f	t	t
401	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:53:48.783824	2025-07-26 09:53:48.783824	default-org	fixed	\N	\N	\N	f	t	t
402	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 09:59:17.67448	2025-07-26 09:59:17.67448	default-org	fixed	\N	\N	\N	f	t	t
403	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 09:59:17.67448	2025-07-26 09:59:17.67448	default-org	fixed	\N	\N	\N	f	t	t
404	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 09:59:17.67448	2025-07-26 09:59:17.67448	default-org	fixed	\N	\N	\N	f	t	t
405	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 09:59:17.67448	2025-07-26 09:59:17.67448	default-org	fixed	\N	\N	\N	f	t	t
406	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 09:59:17.67448	2025-07-26 09:59:17.67448	default-org	fixed	\N	\N	\N	f	t	t
407	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:04:45.200696	2025-07-26 10:04:45.200696	default-org	fixed	\N	\N	\N	f	t	t
408	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:04:45.200696	2025-07-26 10:04:45.200696	default-org	fixed	\N	\N	\N	f	t	t
409	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:04:45.200696	2025-07-26 10:04:45.200696	default-org	fixed	\N	\N	\N	f	t	t
410	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:04:45.200696	2025-07-26 10:04:45.200696	default-org	fixed	\N	\N	\N	f	t	t
411	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:04:45.200696	2025-07-26 10:04:45.200696	default-org	fixed	\N	\N	\N	f	t	t
412	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:07:26.244152	2025-07-26 10:07:26.244152	default-org	fixed	\N	\N	\N	f	t	t
413	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:07:26.244152	2025-07-26 10:07:26.244152	default-org	fixed	\N	\N	\N	f	t	t
414	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:07:26.244152	2025-07-26 10:07:26.244152	default-org	fixed	\N	\N	\N	f	t	t
415	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:07:26.244152	2025-07-26 10:07:26.244152	default-org	fixed	\N	\N	\N	f	t	t
416	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:07:26.244152	2025-07-26 10:07:26.244152	default-org	fixed	\N	\N	\N	f	t	t
417	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:11:15.49457	2025-07-26 10:11:15.49457	default-org	fixed	\N	\N	\N	f	t	t
418	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:11:15.49457	2025-07-26 10:11:15.49457	default-org	fixed	\N	\N	\N	f	t	t
419	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:11:15.49457	2025-07-26 10:11:15.49457	default-org	fixed	\N	\N	\N	f	t	t
420	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:11:15.49457	2025-07-26 10:11:15.49457	default-org	fixed	\N	\N	\N	f	t	t
421	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:11:15.49457	2025-07-26 10:11:15.49457	default-org	fixed	\N	\N	\N	f	t	t
422	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:19:20.835083	2025-07-26 10:19:20.835083	default-org	fixed	\N	\N	\N	f	t	t
423	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:19:20.835083	2025-07-26 10:19:20.835083	default-org	fixed	\N	\N	\N	f	t	t
424	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:19:20.835083	2025-07-26 10:19:20.835083	default-org	fixed	\N	\N	\N	f	t	t
425	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:19:20.835083	2025-07-26 10:19:20.835083	default-org	fixed	\N	\N	\N	f	t	t
426	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:19:20.835083	2025-07-26 10:19:20.835083	default-org	fixed	\N	\N	\N	f	t	t
427	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:19:48.950562	2025-07-26 10:19:48.950562	default-org	fixed	\N	\N	\N	f	t	t
428	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:19:48.950562	2025-07-26 10:19:48.950562	default-org	fixed	\N	\N	\N	f	t	t
429	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:19:48.950562	2025-07-26 10:19:48.950562	default-org	fixed	\N	\N	\N	f	t	t
430	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:19:48.950562	2025-07-26 10:19:48.950562	default-org	fixed	\N	\N	\N	f	t	t
431	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:19:48.950562	2025-07-26 10:19:48.950562	default-org	fixed	\N	\N	\N	f	t	t
432	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:28:33.349718	2025-07-26 10:28:33.349718	default-org	fixed	\N	\N	\N	f	t	t
433	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:28:33.349718	2025-07-26 10:28:33.349718	default-org	fixed	\N	\N	\N	f	t	t
434	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:28:33.349718	2025-07-26 10:28:33.349718	default-org	fixed	\N	\N	\N	f	t	t
435	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:28:33.349718	2025-07-26 10:28:33.349718	default-org	fixed	\N	\N	\N	f	t	t
436	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:28:33.349718	2025-07-26 10:28:33.349718	default-org	fixed	\N	\N	\N	f	t	t
437	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:30:38.478074	2025-07-26 10:30:38.478074	default-org	fixed	\N	\N	\N	f	t	t
438	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:30:38.478074	2025-07-26 10:30:38.478074	default-org	fixed	\N	\N	\N	f	t	t
439	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:30:38.478074	2025-07-26 10:30:38.478074	default-org	fixed	\N	\N	\N	f	t	t
440	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:30:38.478074	2025-07-26 10:30:38.478074	default-org	fixed	\N	\N	\N	f	t	t
441	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:30:38.478074	2025-07-26 10:30:38.478074	default-org	fixed	\N	\N	\N	f	t	t
442	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:31:18.972518	2025-07-26 10:31:18.972518	default-org	fixed	\N	\N	\N	f	t	t
443	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:31:18.972518	2025-07-26 10:31:18.972518	default-org	fixed	\N	\N	\N	f	t	t
444	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:31:18.972518	2025-07-26 10:31:18.972518	default-org	fixed	\N	\N	\N	f	t	t
445	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:31:18.972518	2025-07-26 10:31:18.972518	default-org	fixed	\N	\N	\N	f	t	t
446	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:31:18.972518	2025-07-26 10:31:18.972518	default-org	fixed	\N	\N	\N	f	t	t
447	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:37:53.200905	2025-07-26 10:37:53.200905	default-org	fixed	\N	\N	\N	f	t	t
448	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:37:53.200905	2025-07-26 10:37:53.200905	default-org	fixed	\N	\N	\N	f	t	t
449	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:37:53.200905	2025-07-26 10:37:53.200905	default-org	fixed	\N	\N	\N	f	t	t
450	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:37:53.200905	2025-07-26 10:37:53.200905	default-org	fixed	\N	\N	\N	f	t	t
451	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:37:53.200905	2025-07-26 10:37:53.200905	default-org	fixed	\N	\N	\N	f	t	t
452	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:38:52.678703	2025-07-26 10:38:52.678703	default-org	fixed	\N	\N	\N	f	t	t
453	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:38:52.678703	2025-07-26 10:38:52.678703	default-org	fixed	\N	\N	\N	f	t	t
454	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:38:52.678703	2025-07-26 10:38:52.678703	default-org	fixed	\N	\N	\N	f	t	t
455	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:38:52.678703	2025-07-26 10:38:52.678703	default-org	fixed	\N	\N	\N	f	t	t
456	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:38:52.678703	2025-07-26 10:38:52.678703	default-org	fixed	\N	\N	\N	f	t	t
457	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:40:14.594007	2025-07-26 10:40:14.594007	default-org	fixed	\N	\N	\N	f	t	t
458	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:40:14.594007	2025-07-26 10:40:14.594007	default-org	fixed	\N	\N	\N	f	t	t
459	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:40:14.594007	2025-07-26 10:40:14.594007	default-org	fixed	\N	\N	\N	f	t	t
460	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:40:14.594007	2025-07-26 10:40:14.594007	default-org	fixed	\N	\N	\N	f	t	t
461	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:40:14.594007	2025-07-26 10:40:14.594007	default-org	fixed	\N	\N	\N	f	t	t
462	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:40:30.478943	2025-07-26 10:40:30.478943	default-org	fixed	\N	\N	\N	f	t	t
463	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:40:30.478943	2025-07-26 10:40:30.478943	default-org	fixed	\N	\N	\N	f	t	t
464	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:40:30.478943	2025-07-26 10:40:30.478943	default-org	fixed	\N	\N	\N	f	t	t
465	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:40:30.478943	2025-07-26 10:40:30.478943	default-org	fixed	\N	\N	\N	f	t	t
466	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:40:30.478943	2025-07-26 10:40:30.478943	default-org	fixed	\N	\N	\N	f	t	t
467	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:41:16.135748	2025-07-26 10:41:16.135748	default-org	fixed	\N	\N	\N	f	t	t
468	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:41:16.135748	2025-07-26 10:41:16.135748	default-org	fixed	\N	\N	\N	f	t	t
469	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:41:16.135748	2025-07-26 10:41:16.135748	default-org	fixed	\N	\N	\N	f	t	t
470	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:41:16.135748	2025-07-26 10:41:16.135748	default-org	fixed	\N	\N	\N	f	t	t
471	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:41:16.135748	2025-07-26 10:41:16.135748	default-org	fixed	\N	\N	\N	f	t	t
472	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:48:11.974949	2025-07-26 10:48:11.974949	default-org	fixed	\N	\N	\N	f	t	t
473	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:48:11.974949	2025-07-26 10:48:11.974949	default-org	fixed	\N	\N	\N	f	t	t
474	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:48:11.974949	2025-07-26 10:48:11.974949	default-org	fixed	\N	\N	\N	f	t	t
475	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:48:11.974949	2025-07-26 10:48:11.974949	default-org	fixed	\N	\N	\N	f	t	t
476	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:48:11.974949	2025-07-26 10:48:11.974949	default-org	fixed	\N	\N	\N	f	t	t
477	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:54:36.125057	2025-07-26 10:54:36.125057	default-org	fixed	\N	\N	\N	f	t	t
478	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:54:36.125057	2025-07-26 10:54:36.125057	default-org	fixed	\N	\N	\N	f	t	t
479	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:54:36.125057	2025-07-26 10:54:36.125057	default-org	fixed	\N	\N	\N	f	t	t
480	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:54:36.125057	2025-07-26 10:54:36.125057	default-org	fixed	\N	\N	\N	f	t	t
481	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:54:36.125057	2025-07-26 10:54:36.125057	default-org	fixed	\N	\N	\N	f	t	t
482	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 10:59:35.249758	2025-07-26 10:59:35.249758	default-org	fixed	\N	\N	\N	f	t	t
483	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 10:59:35.249758	2025-07-26 10:59:35.249758	default-org	fixed	\N	\N	\N	f	t	t
484	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 10:59:35.249758	2025-07-26 10:59:35.249758	default-org	fixed	\N	\N	\N	f	t	t
485	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 10:59:35.249758	2025-07-26 10:59:35.249758	default-org	fixed	\N	\N	\N	f	t	t
486	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 10:59:35.249758	2025-07-26 10:59:35.249758	default-org	fixed	\N	\N	\N	f	t	t
487	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 11:01:05.603209	2025-07-26 11:01:05.603209	default-org	fixed	\N	\N	\N	f	t	t
488	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 11:01:05.603209	2025-07-26 11:01:05.603209	default-org	fixed	\N	\N	\N	f	t	t
489	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 11:01:05.603209	2025-07-26 11:01:05.603209	default-org	fixed	\N	\N	\N	f	t	t
490	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 11:01:05.603209	2025-07-26 11:01:05.603209	default-org	fixed	\N	\N	\N	f	t	t
491	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 11:01:05.603209	2025-07-26 11:01:05.603209	default-org	fixed	\N	\N	\N	f	t	t
492	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 11:01:44.526307	2025-07-26 11:01:44.526307	default-org	fixed	\N	\N	\N	f	t	t
493	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 11:01:44.526307	2025-07-26 11:01:44.526307	default-org	fixed	\N	\N	\N	f	t	t
494	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 11:01:44.526307	2025-07-26 11:01:44.526307	default-org	fixed	\N	\N	\N	f	t	t
495	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 11:01:44.526307	2025-07-26 11:01:44.526307	default-org	fixed	\N	\N	\N	f	t	t
496	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 11:01:44.526307	2025-07-26 11:01:44.526307	default-org	fixed	\N	\N	\N	f	t	t
497	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 11:04:26.488994	2025-07-26 11:04:26.488994	default-org	fixed	\N	\N	\N	f	t	t
498	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 11:04:26.488994	2025-07-26 11:04:26.488994	default-org	fixed	\N	\N	\N	f	t	t
499	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 11:04:26.488994	2025-07-26 11:04:26.488994	default-org	fixed	\N	\N	\N	f	t	t
500	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 11:04:26.488994	2025-07-26 11:04:26.488994	default-org	fixed	\N	\N	\N	f	t	t
501	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 11:04:26.488994	2025-07-26 11:04:26.488994	default-org	fixed	\N	\N	\N	f	t	t
502	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 16:27:28.142501	2025-07-26 16:27:28.142501	default-org	fixed	\N	\N	\N	f	t	t
503	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 16:27:28.142501	2025-07-26 16:27:28.142501	default-org	fixed	\N	\N	\N	f	t	t
504	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 16:27:28.142501	2025-07-26 16:27:28.142501	default-org	fixed	\N	\N	\N	f	t	t
505	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 16:27:28.142501	2025-07-26 16:27:28.142501	default-org	fixed	\N	\N	\N	f	t	t
506	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 16:27:28.142501	2025-07-26 16:27:28.142501	default-org	fixed	\N	\N	\N	f	t	t
507	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 16:34:15.523714	2025-07-26 16:34:15.523714	default-org	fixed	\N	\N	\N	f	t	t
508	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 16:34:15.523714	2025-07-26 16:34:15.523714	default-org	fixed	\N	\N	\N	f	t	t
509	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 16:34:15.523714	2025-07-26 16:34:15.523714	default-org	fixed	\N	\N	\N	f	t	t
510	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 16:34:15.523714	2025-07-26 16:34:15.523714	default-org	fixed	\N	\N	\N	f	t	t
511	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 16:34:15.523714	2025-07-26 16:34:15.523714	default-org	fixed	\N	\N	\N	f	t	t
512	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:03:14.976206	2025-07-26 17:03:14.976206	default-org	fixed	\N	\N	\N	f	t	t
513	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:03:14.976206	2025-07-26 17:03:14.976206	default-org	fixed	\N	\N	\N	f	t	t
514	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:03:14.976206	2025-07-26 17:03:14.976206	default-org	fixed	\N	\N	\N	f	t	t
515	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:03:14.976206	2025-07-26 17:03:14.976206	default-org	fixed	\N	\N	\N	f	t	t
516	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:03:14.976206	2025-07-26 17:03:14.976206	default-org	fixed	\N	\N	\N	f	t	t
517	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:05:04.074279	2025-07-26 17:05:04.074279	default-org	fixed	\N	\N	\N	f	t	t
518	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:05:04.074279	2025-07-26 17:05:04.074279	default-org	fixed	\N	\N	\N	f	t	t
519	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:05:04.074279	2025-07-26 17:05:04.074279	default-org	fixed	\N	\N	\N	f	t	t
520	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:05:04.074279	2025-07-26 17:05:04.074279	default-org	fixed	\N	\N	\N	f	t	t
521	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:05:04.074279	2025-07-26 17:05:04.074279	default-org	fixed	\N	\N	\N	f	t	t
522	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:06:29.639403	2025-07-26 17:06:29.639403	default-org	fixed	\N	\N	\N	f	t	t
523	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:06:29.639403	2025-07-26 17:06:29.639403	default-org	fixed	\N	\N	\N	f	t	t
524	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:06:29.639403	2025-07-26 17:06:29.639403	default-org	fixed	\N	\N	\N	f	t	t
525	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:06:29.639403	2025-07-26 17:06:29.639403	default-org	fixed	\N	\N	\N	f	t	t
526	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:06:29.639403	2025-07-26 17:06:29.639403	default-org	fixed	\N	\N	\N	f	t	t
527	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:07:09.843537	2025-07-26 17:07:09.843537	default-org	fixed	\N	\N	\N	f	t	t
528	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:07:09.843537	2025-07-26 17:07:09.843537	default-org	fixed	\N	\N	\N	f	t	t
529	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:07:09.843537	2025-07-26 17:07:09.843537	default-org	fixed	\N	\N	\N	f	t	t
530	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:07:09.843537	2025-07-26 17:07:09.843537	default-org	fixed	\N	\N	\N	f	t	t
531	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:07:09.843537	2025-07-26 17:07:09.843537	default-org	fixed	\N	\N	\N	f	t	t
532	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:08:37.02229	2025-07-26 17:08:37.02229	default-org	fixed	\N	\N	\N	f	t	t
533	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:08:37.02229	2025-07-26 17:08:37.02229	default-org	fixed	\N	\N	\N	f	t	t
534	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:08:37.02229	2025-07-26 17:08:37.02229	default-org	fixed	\N	\N	\N	f	t	t
535	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:08:37.02229	2025-07-26 17:08:37.02229	default-org	fixed	\N	\N	\N	f	t	t
536	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:08:37.02229	2025-07-26 17:08:37.02229	default-org	fixed	\N	\N	\N	f	t	t
537	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:11:04.7771	2025-07-26 17:11:04.7771	default-org	fixed	\N	\N	\N	f	t	t
538	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:11:04.7771	2025-07-26 17:11:04.7771	default-org	fixed	\N	\N	\N	f	t	t
539	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:11:04.7771	2025-07-26 17:11:04.7771	default-org	fixed	\N	\N	\N	f	t	t
540	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:11:04.7771	2025-07-26 17:11:04.7771	default-org	fixed	\N	\N	\N	f	t	t
541	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:11:04.7771	2025-07-26 17:11:04.7771	default-org	fixed	\N	\N	\N	f	t	t
542	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:12:30.743701	2025-07-26 17:12:30.743701	default-org	fixed	\N	\N	\N	f	t	t
543	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:12:30.743701	2025-07-26 17:12:30.743701	default-org	fixed	\N	\N	\N	f	t	t
544	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:12:30.743701	2025-07-26 17:12:30.743701	default-org	fixed	\N	\N	\N	f	t	t
545	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:12:30.743701	2025-07-26 17:12:30.743701	default-org	fixed	\N	\N	\N	f	t	t
546	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:12:30.743701	2025-07-26 17:12:30.743701	default-org	fixed	\N	\N	\N	f	t	t
547	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:13:44.147191	2025-07-26 17:13:44.147191	default-org	fixed	\N	\N	\N	f	t	t
548	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:13:44.147191	2025-07-26 17:13:44.147191	default-org	fixed	\N	\N	\N	f	t	t
549	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:13:44.147191	2025-07-26 17:13:44.147191	default-org	fixed	\N	\N	\N	f	t	t
550	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:13:44.147191	2025-07-26 17:13:44.147191	default-org	fixed	\N	\N	\N	f	t	t
551	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:13:44.147191	2025-07-26 17:13:44.147191	default-org	fixed	\N	\N	\N	f	t	t
552	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:15:22.138687	2025-07-26 17:15:22.138687	default-org	fixed	\N	\N	\N	f	t	t
553	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:15:22.138687	2025-07-26 17:15:22.138687	default-org	fixed	\N	\N	\N	f	t	t
554	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:15:22.138687	2025-07-26 17:15:22.138687	default-org	fixed	\N	\N	\N	f	t	t
555	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:15:22.138687	2025-07-26 17:15:22.138687	default-org	fixed	\N	\N	\N	f	t	t
556	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:15:22.138687	2025-07-26 17:15:22.138687	default-org	fixed	\N	\N	\N	f	t	t
557	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:19:40.638664	2025-07-26 17:19:40.638664	default-org	fixed	\N	\N	\N	f	t	t
558	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:19:40.638664	2025-07-26 17:19:40.638664	default-org	fixed	\N	\N	\N	f	t	t
559	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:19:40.638664	2025-07-26 17:19:40.638664	default-org	fixed	\N	\N	\N	f	t	t
560	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:19:40.638664	2025-07-26 17:19:40.638664	default-org	fixed	\N	\N	\N	f	t	t
561	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:19:40.638664	2025-07-26 17:19:40.638664	default-org	fixed	\N	\N	\N	f	t	t
562	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:22:14.167396	2025-07-26 17:22:14.167396	default-org	fixed	\N	\N	\N	f	t	t
563	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:22:14.167396	2025-07-26 17:22:14.167396	default-org	fixed	\N	\N	\N	f	t	t
564	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:22:14.167396	2025-07-26 17:22:14.167396	default-org	fixed	\N	\N	\N	f	t	t
565	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:22:14.167396	2025-07-26 17:22:14.167396	default-org	fixed	\N	\N	\N	f	t	t
566	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:22:14.167396	2025-07-26 17:22:14.167396	default-org	fixed	\N	\N	\N	f	t	t
567	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:23:33.945335	2025-07-26 17:23:33.945335	default-org	fixed	\N	\N	\N	f	t	t
568	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:23:33.945335	2025-07-26 17:23:33.945335	default-org	fixed	\N	\N	\N	f	t	t
569	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:23:33.945335	2025-07-26 17:23:33.945335	default-org	fixed	\N	\N	\N	f	t	t
570	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:23:33.945335	2025-07-26 17:23:33.945335	default-org	fixed	\N	\N	\N	f	t	t
571	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:23:33.945335	2025-07-26 17:23:33.945335	default-org	fixed	\N	\N	\N	f	t	t
572	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:24:33.262305	2025-07-26 17:24:33.262305	default-org	fixed	\N	\N	\N	f	t	t
573	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:24:33.262305	2025-07-26 17:24:33.262305	default-org	fixed	\N	\N	\N	f	t	t
574	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:24:33.262305	2025-07-26 17:24:33.262305	default-org	fixed	\N	\N	\N	f	t	t
575	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:24:33.262305	2025-07-26 17:24:33.262305	default-org	fixed	\N	\N	\N	f	t	t
576	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:24:33.262305	2025-07-26 17:24:33.262305	default-org	fixed	\N	\N	\N	f	t	t
577	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:26:16.69957	2025-07-26 17:26:16.69957	default-org	fixed	\N	\N	\N	f	t	t
578	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:26:16.69957	2025-07-26 17:26:16.69957	default-org	fixed	\N	\N	\N	f	t	t
579	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:26:16.69957	2025-07-26 17:26:16.69957	default-org	fixed	\N	\N	\N	f	t	t
580	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:26:16.69957	2025-07-26 17:26:16.69957	default-org	fixed	\N	\N	\N	f	t	t
581	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:26:16.69957	2025-07-26 17:26:16.69957	default-org	fixed	\N	\N	\N	f	t	t
582	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:27:53.804762	2025-07-26 17:27:53.804762	default-org	fixed	\N	\N	\N	f	t	t
583	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:27:53.804762	2025-07-26 17:27:53.804762	default-org	fixed	\N	\N	\N	f	t	t
584	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:27:53.804762	2025-07-26 17:27:53.804762	default-org	fixed	\N	\N	\N	f	t	t
585	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:27:53.804762	2025-07-26 17:27:53.804762	default-org	fixed	\N	\N	\N	f	t	t
586	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:27:53.804762	2025-07-26 17:27:53.804762	default-org	fixed	\N	\N	\N	f	t	t
587	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:35:49.139512	2025-07-26 17:35:49.139512	default-org	fixed	\N	\N	\N	f	t	t
588	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:35:49.139512	2025-07-26 17:35:49.139512	default-org	fixed	\N	\N	\N	f	t	t
589	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:35:49.139512	2025-07-26 17:35:49.139512	default-org	fixed	\N	\N	\N	f	t	t
590	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:35:49.139512	2025-07-26 17:35:49.139512	default-org	fixed	\N	\N	\N	f	t	t
591	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:35:49.139512	2025-07-26 17:35:49.139512	default-org	fixed	\N	\N	\N	f	t	t
592	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:36:10.721726	2025-07-26 17:36:10.721726	default-org	fixed	\N	\N	\N	f	t	t
593	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:36:10.721726	2025-07-26 17:36:10.721726	default-org	fixed	\N	\N	\N	f	t	t
594	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:36:10.721726	2025-07-26 17:36:10.721726	default-org	fixed	\N	\N	\N	f	t	t
595	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:36:10.721726	2025-07-26 17:36:10.721726	default-org	fixed	\N	\N	\N	f	t	t
596	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:36:10.721726	2025-07-26 17:36:10.721726	default-org	fixed	\N	\N	\N	f	t	t
597	Airport Transfer	Premium airport pickup and drop-off service	transport	\N	t	\N	30	2025-07-26 17:36:46.131781	2025-07-26 17:36:46.131781	default-org	fixed	\N	\N	\N	f	t	t
598	In-House Massage	Professional massage therapy in your accommodation	wellness	\N	t	\N	30	2025-07-26 17:36:46.131781	2025-07-26 17:36:46.131781	default-org	fixed	\N	\N	\N	f	t	t
599	Grocery Pre-Stocking	Pre-arrival grocery shopping and stocking service	convenience	\N	t	\N	30	2025-07-26 17:36:46.131781	2025-07-26 17:36:46.131781	default-org	fixed	\N	\N	\N	f	t	t
600	Private Chef Service	Personal chef for in-home dining experience	dining	\N	t	\N	30	2025-07-26 17:36:46.131781	2025-07-26 17:36:46.131781	default-org	fixed	\N	\N	\N	f	t	t
601	Pet Sitting	Professional pet care during your stay	pet-care	\N	t	\N	30	2025-07-26 17:36:46.131781	2025-07-26 17:36:46.131781	default-org	fixed	\N	\N	\N	f	t	t
\.


--
-- Data for Name: agent_bookings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.agent_bookings (id, organization_id, retail_agent_id, property_id, booking_id, guest_name, guest_email, guest_phone, check_in, check_out, total_amount, commission_rate, commission_amount, booking_status, commission_status, hostaway_booking_id, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: agent_media_access; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.agent_media_access (id, organization_id, property_id, agent_id, media_file_id, folder_id, access_type, access_reason, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: agent_payouts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.agent_payouts (id, organization_id, agent_id, agent_type, payout_month, total_earnings, payout_amount, payout_status, payout_method, payment_reference, receipt_url, processed_by, notes, requested_at, approved_at, paid_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_configuration; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_configuration (id, organization_id, auto_processing_enabled, ai_provider, confidence_threshold, auto_task_creation, require_manager_approval, notification_settings, processing_cooldown, debug_mode, last_updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_generated_tasks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_generated_tasks (id, organization_id, message_id, task_id, guest_id, property_id, department, task_type, urgency, ai_description, ai_keywords, confidence, status, assigned_to, approved_by, approved_at, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_media_suggestions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_media_suggestions (id, organization_id, property_id, suggestion_type, suggestion_text, priority, confidence_score, detected_issues, suggested_actions, trigger_source, auto_actionable, status, reviewed_by, review_date, review_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_ops_anomalies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_ops_anomalies (id, organization_id, property_id, anomaly_type, severity, status, details, auto_fixed, fix_action, detected_at, resolved_at, created_at, updated_at) FROM stdin;
1	default-org	17	missing-task	high	resolved	{"daysOverdue": 5, "description": "Pool cleaning task missing for Villa Samui Breeze", "expectedTask": "Pool cleaning and chemical balance check", "affectedAreas": ["pool", "water quality"], "lastCompleted": "2025-01-20", "recommendations": ["Schedule immediate pool cleaning", "Set up recurring weekly maintenance"]}	t	Automatically created pool cleaning task for today with high priority	2025-01-25 08:30:00	2025-01-25 08:35:00	2025-07-26 10:41:16.475	2025-07-26 10:41:16.475
2	default-org	18	payout-mismatch	critical	open	{"month": "January 2025", "currency": "THB", "bookingId": "BK-2025-001", "description": "Owner payout calculation mismatch detected", "discrepancy": 2500, "actualPayout": 42500, "expectedPayout": 45000, "recommendations": ["Review commission calculations", "Verify OTA fees", "Check for missing charges"]}	f	\N	2025-01-25 10:15:00	\N	2025-07-26 10:41:16.475	2025-07-26 10:41:16.475
3	default-org	19	overdue-maintenance	medium	in-progress	{"nextDue": "2025-01-10", "priority": "medium", "daysOverdue": 12, "description": "HVAC system maintenance overdue by 12 days", "lastService": "2024-01-10", "estimatedCost": 8500, "maintenanceType": "HVAC Annual Service", "recommendations": ["Schedule HVAC technician visit", "Check air filters", "Inspect cooling efficiency"]}	t	Created maintenance task and contacted preferred HVAC vendor	2025-01-22 14:20:00	\N	2025-07-26 10:41:16.475	2025-07-26 10:41:16.475
4	default-org	20	booking-conflict	high	resolved	{"dates": ["2025-02-14", "2025-02-15", "2025-02-16"], "platform1": "Airbnb", "platform2": "Booking.com", "description": "Double booking detected for February 14-16", "recommendations": ["Contact guests to resolve", "Update calendar sync", "Implement buffer time"], "conflictingBookings": ["BK-2025-014", "BK-2025-015"]}	t	Automatically blocked dates on all platforms and notified property manager	2025-01-24 16:45:00	2025-01-24 17:30:00	2025-07-26 10:41:16.475	2025-07-26 10:41:16.475
5	default-org	\N	system-performance	low	open	{"duration": "2 hours", "description": "API response times elevated above normal threshold", "normalThreshold": 800, "recommendations": ["Monitor database performance", "Check server load", "Review recent deployments"], "affectedEndpoints": ["/api/bookings", "/api/properties"], "averageResponseTime": 1250}	f	\N	2025-01-25 11:00:00	\N	2025-07-26 10:41:16.475	2025-07-26 10:41:16.475
6	default-org	17	financial-discrepancy	medium	resolved	{"month": "December 2024", "category": "electricity", "currency": "THB", "variance": 800, "description": "Utility bill amount higher than predicted", "actualAmount": 3200, "possibleCauses": ["Increased AC usage", "Guest activities", "Equipment malfunction"], "predictedAmount": 2400, "recommendations": ["Inspect AC units", "Review guest feedback", "Check electrical systems"]}	t	Created maintenance inspection task and updated cost predictions	2025-01-23 09:15:00	2025-01-23 10:00:00	2025-07-26 10:41:16.475	2025-07-26 10:41:16.475
\.


--
-- Data for Name: ai_roi_predictions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_roi_predictions (id, organization_id, property_id, forecast_start, forecast_end, predicted_roi, predicted_occupancy, ai_notes, created_at) FROM stdin;
5	default-org	1	2025-01-01	2025-01-31	18.20	94.60	Villa Samui Breeze forecast for high season: excellent ROI potential with high occupancy expected. Peak tourism period with strong demand. Recommendations: target luxury family market.	2025-07-26 11:01:44.985151
6	default-org	1	2025-04-01	2025-04-30	12.70	74.30	Villa Samui Breeze forecast for shoulder season: strong performance expected with good occupancy rates. Moderate demand expected. Recommendations: target luxury family market.	2025-07-26 11:01:45.026635
7	default-org	2	2025-02-01	2025-02-28	14.50	88.20	Villa Ocean View forecast for high season: strong performance expected with high occupancy expected. Peak tourism period with strong demand. Recommendations: target luxury family market.	2025-07-26 11:01:45.06541
8	default-org	2	2025-07-01	2025-07-31	8.30	58.70	Villa Ocean View forecast for low season: average performance with standard occupancy levels. Rainy season with reduced tourist activity. Recommendations: focus on maintenance and renovations, enhance marketing efforts.	2025-07-26 11:01:45.100971
9	default-org	3	2025-12-01	2025-12-31	22.40	96.80	Villa Aruna Demo forecast for high season: excellent ROI potential with high occupancy expected. Peak tourism period with strong demand. Recommendations: target luxury family market.	2025-07-26 11:01:45.134081
10	default-org	3	2025-05-01	2025-05-31	15.10	79.50	Villa Aruna Demo forecast for shoulder season: excellent ROI potential with good occupancy rates. Moderate demand expected. Recommendations: target luxury family market.	2025-07-26 11:01:45.169393
11	default-org	4	2025-03-01	2025-03-31	16.80	92.40	Sunset Villa Bondi forecast for high season: excellent ROI potential with high occupancy expected. Peak tourism period with strong demand. Recommendations: target luxury family market.	2025-07-26 11:01:45.202568
12	default-org	10	2025-02-01	2025-02-28	13.80	85.40	Villa Tropical Paradise forecast for high season: strong performance expected with high occupancy expected. Peak tourism period with strong demand. Recommendations: enhance marketing efforts.	2025-07-26 11:01:45.23838
13	default-org	10	2025-06-01	2025-06-30	7.20	48.90	Villa Tropical Paradise forecast for low season: below-average returns predicted with lower occupancy anticipated. Rainy season with reduced tourist activity. Recommendations: consider pricing optimization, enhance marketing efforts, focus on maintenance and renovations.	2025-07-26 11:01:45.272397
14	default-org	17	2025-10-01	2025-10-31	11.40	68.70	Villa Tropical Paradise forecast for shoulder season: strong performance expected with good occupancy rates. Moderate demand expected. Recommendations: enhance marketing efforts.	2025-07-26 11:01:45.307825
15	default-org	2	2025-11-01	2025-11-30	13.20	76.30	Villa Ocean View forecast for shoulder season: strong performance expected with good occupancy rates. Moderate demand expected. Recommendations: target luxury family market.	2025-07-26 11:01:45.341491
16	default-org	1	2025-08-01	2025-08-31	6.90	52.10	Villa Samui Breeze forecast for low season: below-average returns predicted with lower occupancy anticipated. Rainy season with reduced tourist activity. Recommendations: consider pricing optimization, enhance marketing efforts, focus on maintenance and renovations.	2025-07-26 11:01:45.377305
\.


--
-- Data for Name: ai_task_rules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_task_rules (id, organization_id, rule_name, keywords, task_type, task_title, task_description, assign_to_department, default_assignee, priority, auto_assign, is_active, trigger_count, last_triggered, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_virtual_managers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_virtual_managers (id, property_id, organization_id, avatar_name, knowledge_base, language, last_active, is_active, total_interactions, avg_response_time, satisfaction_score) FROM stdin;
\.


--
-- Data for Name: booking_cost_breakdowns; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.booking_cost_breakdowns (id, organization_id, booking_id, cost_type, description, amount, currency, quantity, unit_price, created_at) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bookings (id, property_id, guest_name, guest_email, guest_phone, check_in, check_out, guests, total_amount, status, hostaway_id, special_requests, created_at, updated_at, organization_id, external_id, currency, booking_reference, guest_total_price, platform_payout, ota_commission_amount, ota_commission_percentage, booking_platform, stripe_fees, net_host_payout, manual_override, override_reason, revenue_verified) FROM stdin;
9	1	John Smith	john.smith@email.com	\N	2025-01-15	2025-01-20	2	25000.00	confirmed	\N	\N	2025-07-26 09:51:47.123317	2025-07-26 09:51:47.123317	default-org	\N	AUD	\N	\N	\N	\N	\N	direct	\N	\N	f	\N	f
10	2	Sarah Wilson	sarah.wilson@email.com	\N	2025-01-22	2025-01-28	1	18000.00	confirmed	\N	\N	2025-07-26 09:51:47.123317	2025-07-26 09:51:47.123317	default-org	\N	AUD	\N	\N	\N	\N	\N	direct	\N	\N	f	\N	f
11	3	Chen Wei	chen.wei@email.com	\N	2025-02-01	2025-02-05	2	32000.00	confirmed	\N	\N	2025-07-26 09:51:47.123317	2025-07-26 09:51:47.123317	default-org	\N	AUD	\N	\N	\N	\N	\N	direct	\N	\N	f	\N	f
12	4	Hiroshi Tanaka	hiroshi.tanaka@email.com	\N	2025-02-10	2025-02-15	3	40000.00	confirmed	\N	\N	2025-07-26 09:51:47.123317	2025-07-26 09:51:47.123317	default-org	\N	AUD	\N	\N	\N	\N	\N	direct	\N	\N	f	\N	f
13	1	Emma Johnson	emma.johnson@email.com	\N	2025-02-20	2025-02-25	2	28000.00	confirmed	\N	\N	2025-07-26 09:51:47.123317	2025-07-26 09:51:47.123317	default-org	\N	AUD	\N	\N	\N	\N	\N	direct	\N	\N	f	\N	f
14	2	Klaus Mueller	klaus.mueller@email.com	\N	2025-03-01	2025-03-08	4	56000.00	confirmed	\N	\N	2025-07-26 09:51:47.123317	2025-07-26 09:51:47.123317	default-org	\N	AUD	\N	\N	\N	\N	\N	direct	\N	\N	f	\N	f
15	3	Somchai Jaidee	somchai.jaidee@email.com	\N	2025-03-10	2025-03-15	2	30000.00	confirmed	\N	\N	2025-07-26 09:51:47.123317	2025-07-26 09:51:47.123317	default-org	\N	AUD	\N	\N	\N	\N	\N	direct	\N	\N	f	\N	f
16	4	Pierre Dubois	pierre.dubois@email.com	\N	2025-03-20	2025-03-25	1	22000.00	confirmed	\N	\N	2025-07-26 09:51:47.123317	2025-07-26 09:51:47.123317	default-org	\N	AUD	\N	\N	\N	\N	\N	direct	\N	\N	f	\N	f
\.


--
-- Data for Name: commission_earnings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.commission_earnings (id, organization_id, user_id, source_type, source_id, amount, currency, commission_rate, base_amount, period, status, processed_by, processed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: commission_invoice_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.commission_invoice_items (id, organization_id, invoice_id, commission_log_id, description, property_name, reference_number, commission_date, commission_amount, created_at) FROM stdin;
\.


--
-- Data for Name: commission_invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.commission_invoices (id, organization_id, agent_id, agent_type, invoice_number, invoice_date, period_start, period_end, total_commissions, currency, description, agent_notes, status, submitted_at, approved_at, approved_by, rejected_reason, admin_notes, generated_by, created_at, updated_at, due_date) FROM stdin;
\.


--
-- Data for Name: commission_log; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.commission_log (id, organization_id, agent_id, agent_type, property_id, booking_id, reference_number, base_amount, commission_rate, commission_amount, currency, status, is_adjustment, original_commission_id, adjustment_reason, processed_by, processed_at, admin_notes, commission_month, commission_year, payout_id, created_at, updated_at) FROM stdin;
1	default-org	demo-agent	retail-agent	1	1	BKG-001-2024	15000.00	10.0	1500.00	THB	pending	f	\N	\N	\N	\N	\N	12	2024	\N	2025-07-02 18:48:07.347107	2025-07-02 18:48:07.347107
2	default-org	demo-agent	retail-agent	2	2	BKG-002-2024	12000.00	8.5	1020.00	THB	paid	f	\N	\N	demo-admin	2024-11-15 00:00:00	\N	11	2024	\N	2025-07-02 18:48:07.392428	2025-07-02 18:48:07.392428
3	default-org	demo-agent	retail-agent	1	3	BKG-003-2024	18000.00	10.0	1800.00	THB	pending	f	\N	\N	\N	\N	\N	12	2024	\N	2025-07-02 18:48:07.426322	2025-07-02 18:48:07.426322
4	default-org	demo-agent	retail-agent	2	4	BKG-004-2024	22000.00	12.0	2640.00	THB	paid	f	\N	\N	demo-admin	2024-10-20 00:00:00	\N	10	2024	\N	2025-07-02 18:48:07.459537	2025-07-02 18:48:07.459537
5	default-org	demo-referral-agent	referral-agent	1	\N	REF-001-2024	25000.00	5.0	1250.00	THB	pending	f	\N	\N	\N	\N	\N	12	2024	\N	2025-07-02 18:48:07.493413	2025-07-02 18:48:07.493413
6	default-org	demo-referral-agent	referral-agent	2	\N	REF-002-2024	30000.00	6.0	1800.00	THB	paid	f	\N	\N	demo-admin	2024-11-25 00:00:00	\N	11	2024	\N	2025-07-02 18:48:07.527542	2025-07-02 18:48:07.527542
7	default-org	demo-referral-agent	referral-agent	1	\N	REF-003-2024	20000.00	5.5	1100.00	THB	pending	f	\N	\N	\N	\N	\N	12	2024	\N	2025-07-02 18:48:07.561476	2025-07-02 18:48:07.561476
\.


--
-- Data for Name: currency_rates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.currency_rates (id, base_currency, target_currency, rate, updated_at) FROM stdin;
1	THB	USD	0.029412	2025-07-26 08:13:32.996327
2	THB	EUR	0.027027	2025-07-26 08:13:32.996327
3	THB	GBP	0.023256	2025-07-26 08:13:32.996327
4	USD	THB	34.000000	2025-07-26 08:13:32.996327
5	EUR	THB	37.000000	2025-07-26 08:13:32.996327
6	GBP	THB	43.000000	2025-07-26 08:13:32.996327
7	USD	EUR	0.919000	2025-07-26 08:13:32.996327
8	EUR	USD	1.088000	2025-07-26 08:13:32.996327
9	USD	GBP	0.791000	2025-07-26 08:13:32.996327
10	GBP	USD	1.264000	2025-07-26 08:13:32.996327
\.


--
-- Data for Name: custom_expense_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.custom_expense_categories (id, organization_id, category_name, description, billing_cycle, default_amount, currency, display_order, created_by, created_at, updated_at, is_recurring, auto_reminder, reminder_days, is_active) FROM stdin;
1	demo-org-1	Gas	Cooking gas and propane cylinders	monthly	500	THB	1	demo-admin	2025-07-02 17:17:46.486995	2025-07-02 17:17:46.486995	t	t	5	t
2	demo-org-1	Pest Control	Regular pest control services	monthly	800	THB	2	demo-admin	2025-07-02 17:17:46.486995	2025-07-02 17:17:46.486995	t	t	5	t
3	demo-org-1	Residence Fee	Building or community fees	monthly	1200	THB	3	demo-admin	2025-07-02 17:17:46.486995	2025-07-02 17:17:46.486995	t	t	5	t
4	demo-org-1	Security Service	Security guard or monitoring service	monthly	2000	THB	4	demo-admin	2025-07-02 17:17:46.486995	2025-07-02 17:17:46.486995	t	t	5	t
5	demo-org-1	Landscaping	Garden maintenance and landscaping	monthly	1500	THB	5	demo-admin	2025-07-02 17:17:46.486995	2025-07-02 17:17:46.486995	t	t	5	t
\.


--
-- Data for Name: damage_reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.damage_reports (id, booking_id, property_id, description, photo_url, repair_cost, charged_to_guest, created_at) FROM stdin;
1	\N	14	Broken bathroom mirror - guest accidentally knocked it during check-out	https://example.com/photos/broken-mirror.jpg	2500.00	t	2025-07-26 09:31:22.233429
2	\N	2	Wine stain on white sofa cushion - requires professional cleaning	https://example.com/photos/wine-stain.jpg	1800.00	t	2025-07-26 09:31:22.233429
3	\N	10	Pool tile cracked - appears to be normal wear and tear	https://example.com/photos/pool-tile.jpg	3200.00	f	2025-07-26 09:31:22.233429
4	\N	3	Air conditioning remote control missing - guest may have taken accidentally	https://example.com/photos/missing-remote.jpg	800.00	t	2025-07-26 09:31:22.233429
5	\N	4	Kitchen glass door scratched - small scratch from luggage	https://example.com/photos/glass-scratch.jpg	1200.00	f	2025-07-26 09:31:22.233429
\.


--
-- Data for Name: dynamic_pricing_recommendations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.dynamic_pricing_recommendations (id, organization_id, property_id, current_rate, recommended_rate, market_source, confidence_score, generated_at) FROM stdin;
1	default-org	1	6500.00	7200.00	Airbnb	0.89	2025-07-26 08:32:21.890165
2	default-org	1	6500.00	6800.00	Booking.com	0.84	2025-07-26 08:32:21.890165
3	default-org	1	6500.00	7100.00	VRBO	0.82	2025-07-26 08:32:21.890165
4	default-org	1	6500.00	6400.00	Agoda	0.86	2025-07-26 08:32:21.890165
5	default-org	3	12000.00	13500.00	Airbnb	0.91	2025-07-26 08:32:21.890165
6	default-org	3	12000.00	12600.00	Booking.com	0.87	2025-07-26 08:32:21.890165
7	default-org	3	12000.00	13200.00	VRBO	0.85	2025-07-26 08:32:21.890165
8	default-org	3	12000.00	11800.00	Agoda	0.83	2025-07-26 08:32:21.890165
9	default-org	17	20000.00	22500.00	Airbnb	0.93	2025-07-26 08:32:21.890165
10	default-org	17	20000.00	21000.00	Booking.com	0.88	2025-07-26 08:32:21.890165
11	default-org	17	20000.00	22000.00	VRBO	0.90	2025-07-26 08:32:21.890165
12	default-org	17	20000.00	19500.00	Agoda	0.85	2025-07-26 08:32:21.890165
\.


--
-- Data for Name: feedback_processing_log; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.feedback_processing_log (id, organization_id, feedback_id, processing_type, triggered_rule_id, matched_keywords, confidence_score, action_taken, created_task_id, processed_by, ai_model, processing_time, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: finances; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.finances (id, property_id, booking_id, type, category, amount, description, date, status, created_at, updated_at, subcategory, due_date, is_recurring, recurring_type, next_due_date, owner_id, agent_id, commission_rate, source, source_type, processed_by, reference_number, attachment_url) FROM stdin;
2	1	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 15:47:58.580324	2025-07-24 15:47:58.580324	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
3	1	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 15:47:58.580324	2025-07-24 15:47:58.580324	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
4	2	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 15:47:58.580324	2025-07-24 15:47:58.580324	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
5	3	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 15:47:58.580324	2025-07-24 15:47:58.580324	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
6	4	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 15:47:58.580324	2025-07-24 15:47:58.580324	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
7	1	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 15:48:19.6827	2025-07-24 15:48:19.6827	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
8	1	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 15:48:19.6827	2025-07-24 15:48:19.6827	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
9	2	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 15:48:19.6827	2025-07-24 15:48:19.6827	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
10	3	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 15:48:19.6827	2025-07-24 15:48:19.6827	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
11	4	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 15:48:19.6827	2025-07-24 15:48:19.6827	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
12	1	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 15:48:38.505537	2025-07-24 15:48:38.505537	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
13	1	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 15:48:38.505537	2025-07-24 15:48:38.505537	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
14	2	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 15:48:38.505537	2025-07-24 15:48:38.505537	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
15	3	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 15:48:38.505537	2025-07-24 15:48:38.505537	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
16	4	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 15:48:38.505537	2025-07-24 15:48:38.505537	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
17	1	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 15:49:43.072082	2025-07-24 15:49:43.072082	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
18	1	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 15:49:43.072082	2025-07-24 15:49:43.072082	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
19	2	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 15:49:43.072082	2025-07-24 15:49:43.072082	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
20	3	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 15:49:43.072082	2025-07-24 15:49:43.072082	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
21	4	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 15:49:43.072082	2025-07-24 15:49:43.072082	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
22	1	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 15:50:04.838832	2025-07-24 15:50:04.838832	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
23	1	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 15:50:04.838832	2025-07-24 15:50:04.838832	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
24	2	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 15:50:04.838832	2025-07-24 15:50:04.838832	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
25	3	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 15:50:04.838832	2025-07-24 15:50:04.838832	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
26	4	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 15:50:04.838832	2025-07-24 15:50:04.838832	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
27	1	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 15:53:43.149651	2025-07-24 15:53:43.149651	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
28	1	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 15:53:43.149651	2025-07-24 15:53:43.149651	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
29	2	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 15:53:43.149651	2025-07-24 15:53:43.149651	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
30	3	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 15:53:43.149651	2025-07-24 15:53:43.149651	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
31	4	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 15:53:43.149651	2025-07-24 15:53:43.149651	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
32	1	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 15:54:07.09273	2025-07-24 15:54:07.09273	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
33	1	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 15:54:07.09273	2025-07-24 15:54:07.09273	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
34	2	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 15:54:07.09273	2025-07-24 15:54:07.09273	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
35	3	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 15:54:07.09273	2025-07-24 15:54:07.09273	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
36	4	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 15:54:07.09273	2025-07-24 15:54:07.09273	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
37	1	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 16:02:46.100463	2025-07-24 16:02:46.100463	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
38	1	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 16:02:46.100463	2025-07-24 16:02:46.100463	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
39	2	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 16:02:46.100463	2025-07-24 16:02:46.100463	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
40	3	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 16:02:46.100463	2025-07-24 16:02:46.100463	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
41	4	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 16:02:46.100463	2025-07-24 16:02:46.100463	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
42	1	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 16:06:37.533449	2025-07-24 16:06:37.533449	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
43	1	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 16:06:37.533449	2025-07-24 16:06:37.533449	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
44	2	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 16:06:37.533449	2025-07-24 16:06:37.533449	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
45	3	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 16:06:37.533449	2025-07-24 16:06:37.533449	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
46	4	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 16:06:37.533449	2025-07-24 16:06:37.533449	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
47	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 16:07:28.760061	2025-07-24 16:07:28.760061	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
48	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 16:07:28.760061	2025-07-24 16:07:28.760061	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
49	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 16:07:28.760061	2025-07-24 16:07:28.760061	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
50	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 16:07:28.760061	2025-07-24 16:07:28.760061	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
51	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 16:07:28.760061	2025-07-24 16:07:28.760061	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
52	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 17:51:06.989951	2025-07-24 17:51:06.989951	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
53	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 17:51:06.989951	2025-07-24 17:51:06.989951	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
54	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 17:51:06.989951	2025-07-24 17:51:06.989951	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
55	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 17:51:06.989951	2025-07-24 17:51:06.989951	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
56	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 17:51:06.989951	2025-07-24 17:51:06.989951	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
57	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 17:52:29.216761	2025-07-24 17:52:29.216761	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
58	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 17:52:29.216761	2025-07-24 17:52:29.216761	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
59	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 17:52:29.216761	2025-07-24 17:52:29.216761	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
60	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 17:52:29.216761	2025-07-24 17:52:29.216761	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
61	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 17:52:29.216761	2025-07-24 17:52:29.216761	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
62	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 17:57:11.483122	2025-07-24 17:57:11.483122	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
63	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 17:57:11.483122	2025-07-24 17:57:11.483122	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
64	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 17:57:11.483122	2025-07-24 17:57:11.483122	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
65	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 17:57:11.483122	2025-07-24 17:57:11.483122	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
66	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 17:57:11.483122	2025-07-24 17:57:11.483122	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
67	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 18:18:51.436778	2025-07-24 18:18:51.436778	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
68	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 18:18:51.436778	2025-07-24 18:18:51.436778	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
69	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 18:18:51.436778	2025-07-24 18:18:51.436778	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
70	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 18:18:51.436778	2025-07-24 18:18:51.436778	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
71	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 18:18:51.436778	2025-07-24 18:18:51.436778	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
72	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-24 18:22:30.488903	2025-07-24 18:22:30.488903	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
73	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-24 18:22:30.488903	2025-07-24 18:22:30.488903	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
74	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-24 18:22:30.488903	2025-07-24 18:22:30.488903	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
75	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-24 18:22:30.488903	2025-07-24 18:22:30.488903	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
76	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-24 18:22:30.488903	2025-07-24 18:22:30.488903	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
77	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 03:47:35.03163	2025-07-25 03:47:35.03163	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
78	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 03:47:35.03163	2025-07-25 03:47:35.03163	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
79	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 03:47:35.03163	2025-07-25 03:47:35.03163	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
80	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 03:47:35.03163	2025-07-25 03:47:35.03163	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
81	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 03:47:35.03163	2025-07-25 03:47:35.03163	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
82	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 04:12:49.804004	2025-07-25 04:12:49.804004	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
83	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 04:12:49.804004	2025-07-25 04:12:49.804004	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
84	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 04:12:49.804004	2025-07-25 04:12:49.804004	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
85	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 04:12:49.804004	2025-07-25 04:12:49.804004	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
86	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 04:12:49.804004	2025-07-25 04:12:49.804004	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
87	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 04:22:57.578491	2025-07-25 04:22:57.578491	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
88	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 04:22:57.578491	2025-07-25 04:22:57.578491	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
89	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 04:22:57.578491	2025-07-25 04:22:57.578491	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
90	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 04:22:57.578491	2025-07-25 04:22:57.578491	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
91	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 04:22:57.578491	2025-07-25 04:22:57.578491	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
92	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 04:39:29.132546	2025-07-25 04:39:29.132546	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
93	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 04:39:29.132546	2025-07-25 04:39:29.132546	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
94	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 04:39:29.132546	2025-07-25 04:39:29.132546	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
95	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 04:39:29.132546	2025-07-25 04:39:29.132546	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
96	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 04:39:29.132546	2025-07-25 04:39:29.132546	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
97	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 04:42:30.219039	2025-07-25 04:42:30.219039	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
98	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 04:42:30.219039	2025-07-25 04:42:30.219039	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
99	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 04:42:30.219039	2025-07-25 04:42:30.219039	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
100	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 04:42:30.219039	2025-07-25 04:42:30.219039	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
101	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 04:42:30.219039	2025-07-25 04:42:30.219039	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
102	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 05:30:34.321617	2025-07-25 05:30:34.321617	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
103	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 05:30:34.321617	2025-07-25 05:30:34.321617	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
104	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 05:30:34.321617	2025-07-25 05:30:34.321617	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
105	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 05:30:34.321617	2025-07-25 05:30:34.321617	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
106	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 05:30:34.321617	2025-07-25 05:30:34.321617	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
107	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 05:31:56.74532	2025-07-25 05:31:56.74532	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
108	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 05:31:56.74532	2025-07-25 05:31:56.74532	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
109	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 05:31:56.74532	2025-07-25 05:31:56.74532	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
110	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 05:31:56.74532	2025-07-25 05:31:56.74532	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
111	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 05:31:56.74532	2025-07-25 05:31:56.74532	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
112	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 05:33:30.805053	2025-07-25 05:33:30.805053	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
113	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 05:33:30.805053	2025-07-25 05:33:30.805053	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
114	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 05:33:30.805053	2025-07-25 05:33:30.805053	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
115	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 05:33:30.805053	2025-07-25 05:33:30.805053	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
116	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 05:33:30.805053	2025-07-25 05:33:30.805053	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
117	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 05:35:37.396951	2025-07-25 05:35:37.396951	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
118	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 05:35:37.396951	2025-07-25 05:35:37.396951	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
119	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 05:35:37.396951	2025-07-25 05:35:37.396951	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
120	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 05:35:37.396951	2025-07-25 05:35:37.396951	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
121	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 05:35:37.396951	2025-07-25 05:35:37.396951	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
122	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 05:55:13.007112	2025-07-25 05:55:13.007112	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
123	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 05:55:13.007112	2025-07-25 05:55:13.007112	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
124	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 05:55:13.007112	2025-07-25 05:55:13.007112	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
125	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 05:55:13.007112	2025-07-25 05:55:13.007112	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
126	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 05:55:13.007112	2025-07-25 05:55:13.007112	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
127	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 05:55:46.22308	2025-07-25 05:55:46.22308	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
128	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 05:55:46.22308	2025-07-25 05:55:46.22308	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
129	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 05:55:46.22308	2025-07-25 05:55:46.22308	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
130	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 05:55:46.22308	2025-07-25 05:55:46.22308	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
131	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 05:55:46.22308	2025-07-25 05:55:46.22308	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
132	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 05:59:08.652782	2025-07-25 05:59:08.652782	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
133	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 05:59:08.652782	2025-07-25 05:59:08.652782	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
134	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 05:59:08.652782	2025-07-25 05:59:08.652782	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
135	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 05:59:08.652782	2025-07-25 05:59:08.652782	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
136	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 05:59:08.652782	2025-07-25 05:59:08.652782	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
137	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 06:08:22.250095	2025-07-25 06:08:22.250095	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
138	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 06:08:22.250095	2025-07-25 06:08:22.250095	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
139	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 06:08:22.250095	2025-07-25 06:08:22.250095	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
140	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 06:08:22.250095	2025-07-25 06:08:22.250095	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
141	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 06:08:22.250095	2025-07-25 06:08:22.250095	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
142	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 08:57:07.71891	2025-07-25 08:57:07.71891	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
143	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 08:57:07.71891	2025-07-25 08:57:07.71891	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
144	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 08:57:07.71891	2025-07-25 08:57:07.71891	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
145	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 08:57:07.71891	2025-07-25 08:57:07.71891	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
146	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 08:57:07.71891	2025-07-25 08:57:07.71891	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
147	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 09:07:59.488801	2025-07-25 09:07:59.488801	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
148	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 09:07:59.488801	2025-07-25 09:07:59.488801	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
149	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 09:07:59.488801	2025-07-25 09:07:59.488801	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
150	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 09:07:59.488801	2025-07-25 09:07:59.488801	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
151	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 09:07:59.488801	2025-07-25 09:07:59.488801	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
152	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 09:09:33.724626	2025-07-25 09:09:33.724626	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
153	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 09:09:33.724626	2025-07-25 09:09:33.724626	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
154	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 09:09:33.724626	2025-07-25 09:09:33.724626	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
155	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 09:09:33.724626	2025-07-25 09:09:33.724626	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
156	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 09:09:33.724626	2025-07-25 09:09:33.724626	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
157	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 09:12:07.441359	2025-07-25 09:12:07.441359	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
158	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 09:12:07.441359	2025-07-25 09:12:07.441359	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
159	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 09:12:07.441359	2025-07-25 09:12:07.441359	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
160	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 09:12:07.441359	2025-07-25 09:12:07.441359	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
161	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 09:12:07.441359	2025-07-25 09:12:07.441359	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
162	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 09:21:20.51244	2025-07-25 09:21:20.51244	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
163	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 09:21:20.51244	2025-07-25 09:21:20.51244	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
164	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 09:21:20.51244	2025-07-25 09:21:20.51244	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
165	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 09:21:20.51244	2025-07-25 09:21:20.51244	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
166	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 09:21:20.51244	2025-07-25 09:21:20.51244	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
167	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 09:23:30.484172	2025-07-25 09:23:30.484172	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
168	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 09:23:30.484172	2025-07-25 09:23:30.484172	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
169	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 09:23:30.484172	2025-07-25 09:23:30.484172	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
170	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 09:23:30.484172	2025-07-25 09:23:30.484172	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
171	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 09:23:30.484172	2025-07-25 09:23:30.484172	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
172	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 09:36:27.44099	2025-07-25 09:36:27.44099	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
173	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 09:36:27.44099	2025-07-25 09:36:27.44099	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
174	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 09:36:27.44099	2025-07-25 09:36:27.44099	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
175	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 09:36:27.44099	2025-07-25 09:36:27.44099	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
176	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 09:36:27.44099	2025-07-25 09:36:27.44099	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
177	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 09:39:53.783092	2025-07-25 09:39:53.783092	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
178	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 09:39:53.783092	2025-07-25 09:39:53.783092	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
179	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 09:39:53.783092	2025-07-25 09:39:53.783092	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
180	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 09:39:53.783092	2025-07-25 09:39:53.783092	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
181	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 09:39:53.783092	2025-07-25 09:39:53.783092	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
182	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 09:43:47.547901	2025-07-25 09:43:47.547901	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
183	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 09:43:47.547901	2025-07-25 09:43:47.547901	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
184	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 09:43:47.547901	2025-07-25 09:43:47.547901	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
185	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 09:43:47.547901	2025-07-25 09:43:47.547901	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
186	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 09:43:47.547901	2025-07-25 09:43:47.547901	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
187	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 09:46:13.750447	2025-07-25 09:46:13.750447	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
188	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 09:46:13.750447	2025-07-25 09:46:13.750447	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
189	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 09:46:13.750447	2025-07-25 09:46:13.750447	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
190	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 09:46:13.750447	2025-07-25 09:46:13.750447	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
191	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 09:46:13.750447	2025-07-25 09:46:13.750447	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
192	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 11:52:37.145205	2025-07-25 11:52:37.145205	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
193	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 11:52:37.145205	2025-07-25 11:52:37.145205	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
194	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 11:52:37.145205	2025-07-25 11:52:37.145205	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
195	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 11:52:37.145205	2025-07-25 11:52:37.145205	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
196	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 11:52:37.145205	2025-07-25 11:52:37.145205	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
197	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 11:54:01.505847	2025-07-25 11:54:01.505847	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
198	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 11:54:01.505847	2025-07-25 11:54:01.505847	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
199	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 11:54:01.505847	2025-07-25 11:54:01.505847	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
200	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 11:54:01.505847	2025-07-25 11:54:01.505847	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
201	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 11:54:01.505847	2025-07-25 11:54:01.505847	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
202	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 12:18:47.345927	2025-07-25 12:18:47.345927	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
203	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 12:18:47.345927	2025-07-25 12:18:47.345927	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
204	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 12:18:47.345927	2025-07-25 12:18:47.345927	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
205	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 12:18:47.345927	2025-07-25 12:18:47.345927	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
206	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 12:18:47.345927	2025-07-25 12:18:47.345927	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
207	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 12:22:25.061105	2025-07-25 12:22:25.061105	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
208	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 12:22:25.061105	2025-07-25 12:22:25.061105	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
209	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 12:22:25.061105	2025-07-25 12:22:25.061105	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
210	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 12:22:25.061105	2025-07-25 12:22:25.061105	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
211	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 12:22:25.061105	2025-07-25 12:22:25.061105	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
212	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-25 12:25:08.561755	2025-07-25 12:25:08.561755	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
213	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-25 12:25:08.561755	2025-07-25 12:25:08.561755	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
214	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-25 12:25:08.561755	2025-07-25 12:25:08.561755	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
215	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-25 12:25:08.561755	2025-07-25 12:25:08.561755	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
216	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-25 12:25:08.561755	2025-07-25 12:25:08.561755	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
217	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 07:42:41.225731	2025-07-26 07:42:41.225731	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
218	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 07:42:41.225731	2025-07-26 07:42:41.225731	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
219	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 07:42:41.225731	2025-07-26 07:42:41.225731	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
220	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 07:42:41.225731	2025-07-26 07:42:41.225731	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
221	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 07:42:41.225731	2025-07-26 07:42:41.225731	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
222	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:07:27.217116	2025-07-26 08:07:27.217116	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
223	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:07:27.217116	2025-07-26 08:07:27.217116	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
224	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:07:27.217116	2025-07-26 08:07:27.217116	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
225	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:07:27.217116	2025-07-26 08:07:27.217116	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
226	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:07:27.217116	2025-07-26 08:07:27.217116	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
227	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:09:22.195766	2025-07-26 08:09:22.195766	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
228	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:09:22.195766	2025-07-26 08:09:22.195766	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
229	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:09:22.195766	2025-07-26 08:09:22.195766	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
230	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:09:22.195766	2025-07-26 08:09:22.195766	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
231	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:09:22.195766	2025-07-26 08:09:22.195766	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
232	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:14:59.646214	2025-07-26 08:14:59.646214	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
233	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:14:59.646214	2025-07-26 08:14:59.646214	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
234	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:14:59.646214	2025-07-26 08:14:59.646214	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
235	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:14:59.646214	2025-07-26 08:14:59.646214	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
236	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:14:59.646214	2025-07-26 08:14:59.646214	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
237	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:19:57.046066	2025-07-26 08:19:57.046066	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
238	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:19:57.046066	2025-07-26 08:19:57.046066	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
239	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:19:57.046066	2025-07-26 08:19:57.046066	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
240	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:19:57.046066	2025-07-26 08:19:57.046066	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
241	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:19:57.046066	2025-07-26 08:19:57.046066	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
242	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:23:02.222618	2025-07-26 08:23:02.222618	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
243	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:23:02.222618	2025-07-26 08:23:02.222618	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
244	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:23:02.222618	2025-07-26 08:23:02.222618	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
245	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:23:02.222618	2025-07-26 08:23:02.222618	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
246	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:23:02.222618	2025-07-26 08:23:02.222618	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
247	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:25:44.993321	2025-07-26 08:25:44.993321	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
248	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:25:44.993321	2025-07-26 08:25:44.993321	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
249	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:25:44.993321	2025-07-26 08:25:44.993321	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
250	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:25:44.993321	2025-07-26 08:25:44.993321	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
251	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:25:44.993321	2025-07-26 08:25:44.993321	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
252	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:27:57.910604	2025-07-26 08:27:57.910604	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
253	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:27:57.910604	2025-07-26 08:27:57.910604	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
254	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:27:57.910604	2025-07-26 08:27:57.910604	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
255	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:27:57.910604	2025-07-26 08:27:57.910604	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
256	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:27:57.910604	2025-07-26 08:27:57.910604	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
257	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:30:22.301288	2025-07-26 08:30:22.301288	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
258	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:30:22.301288	2025-07-26 08:30:22.301288	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
259	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:30:22.301288	2025-07-26 08:30:22.301288	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
260	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:30:22.301288	2025-07-26 08:30:22.301288	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
261	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:30:22.301288	2025-07-26 08:30:22.301288	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
262	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:33:24.155881	2025-07-26 08:33:24.155881	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
263	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:33:24.155881	2025-07-26 08:33:24.155881	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
264	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:33:24.155881	2025-07-26 08:33:24.155881	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
265	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:33:24.155881	2025-07-26 08:33:24.155881	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
266	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:33:24.155881	2025-07-26 08:33:24.155881	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
267	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:36:16.620968	2025-07-26 08:36:16.620968	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
268	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:36:16.620968	2025-07-26 08:36:16.620968	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
269	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:36:16.620968	2025-07-26 08:36:16.620968	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
270	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:36:16.620968	2025-07-26 08:36:16.620968	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
271	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:36:16.620968	2025-07-26 08:36:16.620968	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
272	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:39:23.445608	2025-07-26 08:39:23.445608	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
273	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:39:23.445608	2025-07-26 08:39:23.445608	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
274	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:39:23.445608	2025-07-26 08:39:23.445608	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
275	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:39:23.445608	2025-07-26 08:39:23.445608	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
276	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:39:23.445608	2025-07-26 08:39:23.445608	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
277	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 08:43:47.710041	2025-07-26 08:43:47.710041	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
278	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 08:43:47.710041	2025-07-26 08:43:47.710041	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
279	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 08:43:47.710041	2025-07-26 08:43:47.710041	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
280	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 08:43:47.710041	2025-07-26 08:43:47.710041	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
281	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 08:43:47.710041	2025-07-26 08:43:47.710041	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
282	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:00:07.699752	2025-07-26 09:00:07.699752	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
283	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:00:07.699752	2025-07-26 09:00:07.699752	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
284	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:00:07.699752	2025-07-26 09:00:07.699752	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
285	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:00:07.699752	2025-07-26 09:00:07.699752	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
286	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:00:07.699752	2025-07-26 09:00:07.699752	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
287	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:00:59.162781	2025-07-26 09:00:59.162781	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
288	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:00:59.162781	2025-07-26 09:00:59.162781	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
289	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:00:59.162781	2025-07-26 09:00:59.162781	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
290	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:00:59.162781	2025-07-26 09:00:59.162781	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
291	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:00:59.162781	2025-07-26 09:00:59.162781	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
292	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:03:51.255478	2025-07-26 09:03:51.255478	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
293	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:03:51.255478	2025-07-26 09:03:51.255478	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
294	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:03:51.255478	2025-07-26 09:03:51.255478	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
295	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:03:51.255478	2025-07-26 09:03:51.255478	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
296	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:03:51.255478	2025-07-26 09:03:51.255478	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
297	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:07:51.250588	2025-07-26 09:07:51.250588	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
298	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:07:51.250588	2025-07-26 09:07:51.250588	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
299	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:07:51.250588	2025-07-26 09:07:51.250588	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
300	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:07:51.250588	2025-07-26 09:07:51.250588	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
301	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:07:51.250588	2025-07-26 09:07:51.250588	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
302	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:11:09.421974	2025-07-26 09:11:09.421974	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
303	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:11:09.421974	2025-07-26 09:11:09.421974	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
304	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:11:09.421974	2025-07-26 09:11:09.421974	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
305	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:11:09.421974	2025-07-26 09:11:09.421974	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
306	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:11:09.421974	2025-07-26 09:11:09.421974	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
307	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:15:12.569713	2025-07-26 09:15:12.569713	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
308	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:15:12.569713	2025-07-26 09:15:12.569713	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
309	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:15:12.569713	2025-07-26 09:15:12.569713	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
310	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:15:12.569713	2025-07-26 09:15:12.569713	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
311	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:15:12.569713	2025-07-26 09:15:12.569713	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
312	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:17:28.273127	2025-07-26 09:17:28.273127	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
313	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:17:28.273127	2025-07-26 09:17:28.273127	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
314	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:17:28.273127	2025-07-26 09:17:28.273127	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
315	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:17:28.273127	2025-07-26 09:17:28.273127	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
316	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:17:28.273127	2025-07-26 09:17:28.273127	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
317	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:18:50.618345	2025-07-26 09:18:50.618345	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
318	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:18:50.618345	2025-07-26 09:18:50.618345	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
319	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:18:50.618345	2025-07-26 09:18:50.618345	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
320	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:18:50.618345	2025-07-26 09:18:50.618345	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
321	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:18:50.618345	2025-07-26 09:18:50.618345	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
322	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:22:20.864001	2025-07-26 09:22:20.864001	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
323	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:22:20.864001	2025-07-26 09:22:20.864001	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
324	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:22:20.864001	2025-07-26 09:22:20.864001	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
325	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:22:20.864001	2025-07-26 09:22:20.864001	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
326	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:22:20.864001	2025-07-26 09:22:20.864001	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
327	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:23:48.483868	2025-07-26 09:23:48.483868	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
328	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:23:48.483868	2025-07-26 09:23:48.483868	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
329	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:23:48.483868	2025-07-26 09:23:48.483868	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
330	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:23:48.483868	2025-07-26 09:23:48.483868	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
331	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:23:48.483868	2025-07-26 09:23:48.483868	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
332	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:24:18.416967	2025-07-26 09:24:18.416967	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
333	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:24:18.416967	2025-07-26 09:24:18.416967	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
334	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:24:18.416967	2025-07-26 09:24:18.416967	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
335	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:24:18.416967	2025-07-26 09:24:18.416967	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
336	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:24:18.416967	2025-07-26 09:24:18.416967	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
337	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:26:49.619275	2025-07-26 09:26:49.619275	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
338	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:26:49.619275	2025-07-26 09:26:49.619275	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
339	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:26:49.619275	2025-07-26 09:26:49.619275	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
340	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:26:49.619275	2025-07-26 09:26:49.619275	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
341	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:26:49.619275	2025-07-26 09:26:49.619275	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
342	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:29:09.166375	2025-07-26 09:29:09.166375	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
343	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:29:09.166375	2025-07-26 09:29:09.166375	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
344	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:29:09.166375	2025-07-26 09:29:09.166375	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
345	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:29:09.166375	2025-07-26 09:29:09.166375	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
346	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:29:09.166375	2025-07-26 09:29:09.166375	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
347	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:29:27.253254	2025-07-26 09:29:27.253254	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
348	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:29:27.253254	2025-07-26 09:29:27.253254	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
349	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:29:27.253254	2025-07-26 09:29:27.253254	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
350	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:29:27.253254	2025-07-26 09:29:27.253254	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
351	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:29:27.253254	2025-07-26 09:29:27.253254	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
352	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:32:26.834339	2025-07-26 09:32:26.834339	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
353	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:32:26.834339	2025-07-26 09:32:26.834339	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
354	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:32:26.834339	2025-07-26 09:32:26.834339	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
355	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:32:26.834339	2025-07-26 09:32:26.834339	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
356	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:32:26.834339	2025-07-26 09:32:26.834339	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
357	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:34:44.617742	2025-07-26 09:34:44.617742	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
358	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:34:44.617742	2025-07-26 09:34:44.617742	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
359	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:34:44.617742	2025-07-26 09:34:44.617742	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
360	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:34:44.617742	2025-07-26 09:34:44.617742	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
361	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:34:44.617742	2025-07-26 09:34:44.617742	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
362	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:37:36.386316	2025-07-26 09:37:36.386316	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
363	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:37:36.386316	2025-07-26 09:37:36.386316	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
364	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:37:36.386316	2025-07-26 09:37:36.386316	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
365	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:37:36.386316	2025-07-26 09:37:36.386316	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
366	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:37:36.386316	2025-07-26 09:37:36.386316	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
367	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:40:26.864484	2025-07-26 09:40:26.864484	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
368	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:40:26.864484	2025-07-26 09:40:26.864484	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
369	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:40:26.864484	2025-07-26 09:40:26.864484	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
370	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:40:26.864484	2025-07-26 09:40:26.864484	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
371	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:40:26.864484	2025-07-26 09:40:26.864484	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
372	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:43:43.03787	2025-07-26 09:43:43.03787	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
373	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:43:43.03787	2025-07-26 09:43:43.03787	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
374	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:43:43.03787	2025-07-26 09:43:43.03787	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
375	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:43:43.03787	2025-07-26 09:43:43.03787	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
376	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:43:43.03787	2025-07-26 09:43:43.03787	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
377	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:47:04.003648	2025-07-26 09:47:04.003648	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
378	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:47:04.003648	2025-07-26 09:47:04.003648	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
379	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:47:04.003648	2025-07-26 09:47:04.003648	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
380	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:47:04.003648	2025-07-26 09:47:04.003648	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
381	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:47:04.003648	2025-07-26 09:47:04.003648	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
382	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:52:17.91205	2025-07-26 09:52:17.91205	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
383	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:52:17.91205	2025-07-26 09:52:17.91205	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
384	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:52:17.91205	2025-07-26 09:52:17.91205	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
385	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:52:17.91205	2025-07-26 09:52:17.91205	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
386	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:52:17.91205	2025-07-26 09:52:17.91205	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
387	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:53:48.819744	2025-07-26 09:53:48.819744	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
388	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:53:48.819744	2025-07-26 09:53:48.819744	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
389	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:53:48.819744	2025-07-26 09:53:48.819744	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
390	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:53:48.819744	2025-07-26 09:53:48.819744	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
391	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:53:48.819744	2025-07-26 09:53:48.819744	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
392	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 09:59:17.718405	2025-07-26 09:59:17.718405	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
393	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 09:59:17.718405	2025-07-26 09:59:17.718405	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
394	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 09:59:17.718405	2025-07-26 09:59:17.718405	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
395	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 09:59:17.718405	2025-07-26 09:59:17.718405	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
396	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 09:59:17.718405	2025-07-26 09:59:17.718405	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
397	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:04:45.244276	2025-07-26 10:04:45.244276	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
398	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:04:45.244276	2025-07-26 10:04:45.244276	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
399	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:04:45.244276	2025-07-26 10:04:45.244276	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
400	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:04:45.244276	2025-07-26 10:04:45.244276	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
401	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:04:45.244276	2025-07-26 10:04:45.244276	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
402	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:07:26.280766	2025-07-26 10:07:26.280766	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
403	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:07:26.280766	2025-07-26 10:07:26.280766	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
404	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:07:26.280766	2025-07-26 10:07:26.280766	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
405	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:07:26.280766	2025-07-26 10:07:26.280766	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
406	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:07:26.280766	2025-07-26 10:07:26.280766	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
407	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:11:15.535758	2025-07-26 10:11:15.535758	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
408	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:11:15.535758	2025-07-26 10:11:15.535758	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
409	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:11:15.535758	2025-07-26 10:11:15.535758	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
410	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:11:15.535758	2025-07-26 10:11:15.535758	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
411	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:11:15.535758	2025-07-26 10:11:15.535758	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
412	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:19:20.877234	2025-07-26 10:19:20.877234	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
413	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:19:20.877234	2025-07-26 10:19:20.877234	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
414	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:19:20.877234	2025-07-26 10:19:20.877234	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
415	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:19:20.877234	2025-07-26 10:19:20.877234	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
416	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:19:20.877234	2025-07-26 10:19:20.877234	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
417	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:19:48.986037	2025-07-26 10:19:48.986037	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
418	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:19:48.986037	2025-07-26 10:19:48.986037	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
419	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:19:48.986037	2025-07-26 10:19:48.986037	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
420	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:19:48.986037	2025-07-26 10:19:48.986037	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
421	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:19:48.986037	2025-07-26 10:19:48.986037	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
422	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:28:33.390404	2025-07-26 10:28:33.390404	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
423	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:28:33.390404	2025-07-26 10:28:33.390404	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
424	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:28:33.390404	2025-07-26 10:28:33.390404	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
425	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:28:33.390404	2025-07-26 10:28:33.390404	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
426	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:28:33.390404	2025-07-26 10:28:33.390404	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
427	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:30:38.518645	2025-07-26 10:30:38.518645	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
428	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:30:38.518645	2025-07-26 10:30:38.518645	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
429	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:30:38.518645	2025-07-26 10:30:38.518645	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
430	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:30:38.518645	2025-07-26 10:30:38.518645	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
431	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:30:38.518645	2025-07-26 10:30:38.518645	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
432	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:31:19.008509	2025-07-26 10:31:19.008509	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
433	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:31:19.008509	2025-07-26 10:31:19.008509	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
434	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:31:19.008509	2025-07-26 10:31:19.008509	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
435	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:31:19.008509	2025-07-26 10:31:19.008509	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
436	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:31:19.008509	2025-07-26 10:31:19.008509	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
437	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:37:53.244345	2025-07-26 10:37:53.244345	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
438	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:37:53.244345	2025-07-26 10:37:53.244345	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
439	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:37:53.244345	2025-07-26 10:37:53.244345	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
440	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:37:53.244345	2025-07-26 10:37:53.244345	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
441	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:37:53.244345	2025-07-26 10:37:53.244345	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
442	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:38:52.716882	2025-07-26 10:38:52.716882	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
443	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:38:52.716882	2025-07-26 10:38:52.716882	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
444	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:38:52.716882	2025-07-26 10:38:52.716882	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
445	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:38:52.716882	2025-07-26 10:38:52.716882	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
446	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:38:52.716882	2025-07-26 10:38:52.716882	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
447	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:40:14.630035	2025-07-26 10:40:14.630035	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
448	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:40:14.630035	2025-07-26 10:40:14.630035	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
449	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:40:14.630035	2025-07-26 10:40:14.630035	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
450	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:40:14.630035	2025-07-26 10:40:14.630035	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
451	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:40:14.630035	2025-07-26 10:40:14.630035	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
452	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:40:30.514311	2025-07-26 10:40:30.514311	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
453	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:40:30.514311	2025-07-26 10:40:30.514311	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
454	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:40:30.514311	2025-07-26 10:40:30.514311	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
455	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:40:30.514311	2025-07-26 10:40:30.514311	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
456	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:40:30.514311	2025-07-26 10:40:30.514311	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
457	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:41:16.172818	2025-07-26 10:41:16.172818	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
458	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:41:16.172818	2025-07-26 10:41:16.172818	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
459	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:41:16.172818	2025-07-26 10:41:16.172818	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
460	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:41:16.172818	2025-07-26 10:41:16.172818	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
461	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:41:16.172818	2025-07-26 10:41:16.172818	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
462	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:48:12.01673	2025-07-26 10:48:12.01673	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
463	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:48:12.01673	2025-07-26 10:48:12.01673	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
464	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:48:12.01673	2025-07-26 10:48:12.01673	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
465	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:48:12.01673	2025-07-26 10:48:12.01673	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
466	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:48:12.01673	2025-07-26 10:48:12.01673	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
467	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:54:36.173477	2025-07-26 10:54:36.173477	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
468	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:54:36.173477	2025-07-26 10:54:36.173477	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
469	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:54:36.173477	2025-07-26 10:54:36.173477	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
470	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:54:36.173477	2025-07-26 10:54:36.173477	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
471	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:54:36.173477	2025-07-26 10:54:36.173477	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
472	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 10:59:35.294785	2025-07-26 10:59:35.294785	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
473	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 10:59:35.294785	2025-07-26 10:59:35.294785	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
474	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 10:59:35.294785	2025-07-26 10:59:35.294785	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
475	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 10:59:35.294785	2025-07-26 10:59:35.294785	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
476	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 10:59:35.294785	2025-07-26 10:59:35.294785	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
477	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 11:01:05.637978	2025-07-26 11:01:05.637978	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
478	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 11:01:05.637978	2025-07-26 11:01:05.637978	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
479	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 11:01:05.637978	2025-07-26 11:01:05.637978	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
480	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 11:01:05.637978	2025-07-26 11:01:05.637978	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
481	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 11:01:05.637978	2025-07-26 11:01:05.637978	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
482	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 11:01:44.563377	2025-07-26 11:01:44.563377	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
483	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 11:01:44.563377	2025-07-26 11:01:44.563377	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
484	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 11:01:44.563377	2025-07-26 11:01:44.563377	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
485	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 11:01:44.563377	2025-07-26 11:01:44.563377	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
486	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 11:01:44.563377	2025-07-26 11:01:44.563377	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
487	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 11:04:26.530523	2025-07-26 11:04:26.530523	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
488	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 11:04:26.530523	2025-07-26 11:04:26.530523	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
489	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 11:04:26.530523	2025-07-26 11:04:26.530523	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
490	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 11:04:26.530523	2025-07-26 11:04:26.530523	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
491	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 11:04:26.530523	2025-07-26 11:04:26.530523	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
492	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 16:27:28.185717	2025-07-26 16:27:28.185717	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
493	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 16:27:28.185717	2025-07-26 16:27:28.185717	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
494	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 16:27:28.185717	2025-07-26 16:27:28.185717	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
495	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 16:27:28.185717	2025-07-26 16:27:28.185717	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
496	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 16:27:28.185717	2025-07-26 16:27:28.185717	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
497	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 16:34:15.566655	2025-07-26 16:34:15.566655	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
498	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 16:34:15.566655	2025-07-26 16:34:15.566655	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
499	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 16:34:15.566655	2025-07-26 16:34:15.566655	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
500	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 16:34:15.566655	2025-07-26 16:34:15.566655	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
501	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 16:34:15.566655	2025-07-26 16:34:15.566655	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
502	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:03:15.020282	2025-07-26 17:03:15.020282	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
503	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:03:15.020282	2025-07-26 17:03:15.020282	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
504	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:03:15.020282	2025-07-26 17:03:15.020282	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
505	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:03:15.020282	2025-07-26 17:03:15.020282	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
506	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:03:15.020282	2025-07-26 17:03:15.020282	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
507	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:05:04.110441	2025-07-26 17:05:04.110441	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
508	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:05:04.110441	2025-07-26 17:05:04.110441	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
509	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:05:04.110441	2025-07-26 17:05:04.110441	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
510	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:05:04.110441	2025-07-26 17:05:04.110441	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
511	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:05:04.110441	2025-07-26 17:05:04.110441	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
512	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:06:29.673652	2025-07-26 17:06:29.673652	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
513	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:06:29.673652	2025-07-26 17:06:29.673652	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
514	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:06:29.673652	2025-07-26 17:06:29.673652	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
515	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:06:29.673652	2025-07-26 17:06:29.673652	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
516	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:06:29.673652	2025-07-26 17:06:29.673652	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
517	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:07:09.879622	2025-07-26 17:07:09.879622	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
518	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:07:09.879622	2025-07-26 17:07:09.879622	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
519	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:07:09.879622	2025-07-26 17:07:09.879622	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
520	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:07:09.879622	2025-07-26 17:07:09.879622	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
521	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:07:09.879622	2025-07-26 17:07:09.879622	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
522	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:08:37.05906	2025-07-26 17:08:37.05906	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
523	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:08:37.05906	2025-07-26 17:08:37.05906	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
524	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:08:37.05906	2025-07-26 17:08:37.05906	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
525	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:08:37.05906	2025-07-26 17:08:37.05906	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
526	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:08:37.05906	2025-07-26 17:08:37.05906	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
527	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:11:04.81888	2025-07-26 17:11:04.81888	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
528	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:11:04.81888	2025-07-26 17:11:04.81888	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
529	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:11:04.81888	2025-07-26 17:11:04.81888	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
530	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:11:04.81888	2025-07-26 17:11:04.81888	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
531	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:11:04.81888	2025-07-26 17:11:04.81888	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
532	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:12:30.778788	2025-07-26 17:12:30.778788	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
533	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:12:30.778788	2025-07-26 17:12:30.778788	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
534	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:12:30.778788	2025-07-26 17:12:30.778788	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
535	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:12:30.778788	2025-07-26 17:12:30.778788	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
536	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:12:30.778788	2025-07-26 17:12:30.778788	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
537	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:13:44.18439	2025-07-26 17:13:44.18439	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
538	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:13:44.18439	2025-07-26 17:13:44.18439	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
539	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:13:44.18439	2025-07-26 17:13:44.18439	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
540	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:13:44.18439	2025-07-26 17:13:44.18439	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
541	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:13:44.18439	2025-07-26 17:13:44.18439	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
542	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:15:22.183006	2025-07-26 17:15:22.183006	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
543	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:15:22.183006	2025-07-26 17:15:22.183006	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
544	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:15:22.183006	2025-07-26 17:15:22.183006	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
545	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:15:22.183006	2025-07-26 17:15:22.183006	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
546	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:15:22.183006	2025-07-26 17:15:22.183006	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
547	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:19:40.68028	2025-07-26 17:19:40.68028	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
548	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:19:40.68028	2025-07-26 17:19:40.68028	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
549	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:19:40.68028	2025-07-26 17:19:40.68028	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
550	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:19:40.68028	2025-07-26 17:19:40.68028	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
551	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:19:40.68028	2025-07-26 17:19:40.68028	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
552	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:22:14.204153	2025-07-26 17:22:14.204153	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
553	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:22:14.204153	2025-07-26 17:22:14.204153	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
554	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:22:14.204153	2025-07-26 17:22:14.204153	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
555	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:22:14.204153	2025-07-26 17:22:14.204153	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
556	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:22:14.204153	2025-07-26 17:22:14.204153	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
557	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:23:33.981824	2025-07-26 17:23:33.981824	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
558	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:23:33.981824	2025-07-26 17:23:33.981824	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
559	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:23:33.981824	2025-07-26 17:23:33.981824	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
560	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:23:33.981824	2025-07-26 17:23:33.981824	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
561	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:23:33.981824	2025-07-26 17:23:33.981824	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
562	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:24:33.297079	2025-07-26 17:24:33.297079	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
563	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:24:33.297079	2025-07-26 17:24:33.297079	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
564	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:24:33.297079	2025-07-26 17:24:33.297079	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
565	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:24:33.297079	2025-07-26 17:24:33.297079	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
566	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:24:33.297079	2025-07-26 17:24:33.297079	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
567	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:26:16.734827	2025-07-26 17:26:16.734827	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
568	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:26:16.734827	2025-07-26 17:26:16.734827	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
569	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:26:16.734827	2025-07-26 17:26:16.734827	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
570	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:26:16.734827	2025-07-26 17:26:16.734827	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
571	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:26:16.734827	2025-07-26 17:26:16.734827	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
572	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:27:53.843128	2025-07-26 17:27:53.843128	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
573	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:27:53.843128	2025-07-26 17:27:53.843128	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
574	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:27:53.843128	2025-07-26 17:27:53.843128	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
575	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:27:53.843128	2025-07-26 17:27:53.843128	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
576	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:27:53.843128	2025-07-26 17:27:53.843128	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
577	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:35:49.182	2025-07-26 17:35:49.182	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
578	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:35:49.182	2025-07-26 17:35:49.182	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
579	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:35:49.182	2025-07-26 17:35:49.182	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
580	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:35:49.182	2025-07-26 17:35:49.182	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
581	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:35:49.182	2025-07-26 17:35:49.182	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
582	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:36:10.756132	2025-07-26 17:36:10.756132	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
583	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:36:10.756132	2025-07-26 17:36:10.756132	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
584	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:36:10.756132	2025-07-26 17:36:10.756132	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
585	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:36:10.756132	2025-07-26 17:36:10.756132	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
586	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:36:10.756132	2025-07-26 17:36:10.756132	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
587	3	\N	income	booking-payment	1200.00	Direct booking payment - December stay	2024-12-15	pending	2025-07-26 17:36:46.169684	2025-07-26 17:36:46.169684	\N	\N	f	\N	\N	\N	\N	\N	guest_payment	\N	staff-1	DB-2024-001	\N
588	3	\N	expense	commission	180.00	Retail agent commission - December booking	2024-12-15	pending	2025-07-26 17:36:46.169684	2025-07-26 17:36:46.169684	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	staff-1	COMM-2024-001	\N
589	4	\N	expense	maintenance	250.00	Property maintenance - AC service	2024-12-20	pending	2025-07-26 17:36:46.169684	2025-07-26 17:36:46.169684	\N	\N	f	\N	\N	\N	\N	\N	owner_charge	\N	staff-2	MAINT-2024-002	\N
590	5	\N	income	add-on-service	100.00	Owner gift - Welcome basket upgrade	2024-12-18	pending	2025-07-26 17:36:46.169684	2025-07-26 17:36:46.169684	\N	\N	f	\N	\N	\N	\N	\N	complimentary	\N	staff-3	GIFT-2024-001	\N
591	6	\N	expense	commission	75.00	Marketing campaign - Google Ads	2024-12-22	pending	2025-07-26 17:36:46.169684	2025-07-26 17:36:46.169684	\N	\N	f	\N	\N	\N	\N	\N	company_expense	\N	agent-1	MKT-2024-003	\N
\.


--
-- Data for Name: financial_transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.financial_transactions (id, organization_id, transaction_type, amount, currency, from_party, to_party, reference_type, reference_id, booking_reference, source_platform, platform_booking_id, description, category, status, processed_by, processed_at, receipt_url, invoice_url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guest_activity_timeline; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_activity_timeline (id, organization_id, guest_session_id, booking_id, activity_type, title, description, status, requested_at, confirmed_at, completed_at, estimated_cost, actual_cost, charge_assignment, is_visible, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guest_addon_bookings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_addon_bookings (id, organization_id, service_id, property_id, guest_name, guest_email, guest_phone, booking_date, service_date, status, total_amount, currency, billing_route, complimentary_type, payment_status, payment_method, stripe_payment_intent_id, special_requests, internal_notes, assigned_task_id, created_at, updated_at, booked_by, confirmed_by, cancelled_by, cancellation_reason) FROM stdin;
1	default-org	1	1	Sarah Johnson	sarah.j@email.com	+61404123456	2025-07-02 13:42:09.449842	2025-01-15 14:00:00	confirmed	120.00	AUD	guest_billable	\N	paid	\N	\N	Prefer Swedish massage technique	\N	\N	2025-07-02 13:42:09.449842	2025-07-02 13:42:09.449842	\N	\N	\N	\N
2	default-org	2	2	Michael Chen	michael.chen@email.com	+61404789012	2025-07-02 13:42:09.449842	2025-01-10 09:00:00	confirmed	80.00	AUD	owner_billable	\N	pending	\N	\N	Flight arrives at 9:30 AM	\N	\N	2025-07-02 13:42:09.449842	2025-07-02 13:42:09.449842	\N	\N	\N	\N
3	default-org	3	1	Emma Wilson	emma.w@email.com	\N	2025-07-02 13:42:09.449842	2025-01-12 10:00:00	pending	75.00	AUD	company_expense	\N	pending	\N	\N	Dietary restrictions: gluten-free items only	\N	\N	2025-07-02 13:42:09.449842	2025-07-02 13:42:09.449842	\N	\N	\N	\N
4	default-org	5	3	David Taylor	david.taylor@email.com	+61404567890	2025-07-02 13:42:09.449842	2025-01-20 18:00:00	confirmed	200.00	AUD	complimentary	\N	completed	\N	\N	\N	\N	\N	2025-07-02 13:42:09.449842	2025-07-02 13:42:09.449842	\N	\N	\N	\N
\.


--
-- Data for Name: guest_addon_service_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_addon_service_requests (id, organization_id, guest_session_id, booking_id, service_id, service_name, service_type, requested_date, requested_time, duration, guest_count, unit_price, quantity, total_cost, charge_assignment, assignment_reason, special_requests, guest_notes, request_status, confirmed_by, confirmed_at, completed_at, completion_notes, guest_rating, guest_review, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guest_addon_services; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_addon_services (id, organization_id, service_name, description, category, pricing_type, base_price, currency, is_active, requires_time_slot, max_advance_booking_days, cancellation_policy_hours, auto_create_task, task_type, task_priority, created_at, updated_at, created_by) FROM stdin;
1	default-org	In-Room Massage	Professional therapeutic massage service in the comfort of your accommodation	wellness	fixed	120.00	AUD	t	t	30	24	t	service	medium	2025-07-02 13:41:58.763897	2025-07-02 13:41:58.763897	\N
2	default-org	Airport Transfer	Private vehicle transfer to/from airport with professional driver	transport	fixed	80.00	AUD	t	f	30	24	t	service	high	2025-07-02 13:41:58.763897	2025-07-02 13:41:58.763897	\N
3	default-org	Grocery Shopping	Pre-arrival grocery shopping and stocking service	catering	variable	50.00	AUD	t	f	30	24	t	service	low	2025-07-02 13:41:58.763897	2025-07-02 13:41:58.763897	\N
4	default-org	Deep Cleaning	Enhanced cleaning service for extended stays	cleaning	fixed	150.00	AUD	t	f	30	24	t	cleaning	medium	2025-07-02 13:41:58.763897	2025-07-02 13:41:58.763897	\N
5	default-org	Wine Tasting Experience	Curated local wine selection with tasting notes	catering	fixed	200.00	AUD	t	t	30	24	f	service	low	2025-07-02 13:41:58.763897	2025-07-02 13:41:58.763897	\N
6	default-org	House Cleaning	Professional cleaning service including bathroom, kitchen, living areas, and bedrooms	cleaning	fixed	120.00	AUD	t	t	7	24	t	cleaning	medium	2025-07-02 15:09:37.63967	2025-07-02 15:09:37.63967	demo-admin
7	default-org	Airport Transfer	Private transfer service to/from airport with meet and greet	transport	fixed	85.00	AUD	t	t	14	48	t	transport	high	2025-07-02 15:09:37.63967	2025-07-02 15:09:37.63967	demo-admin
8	default-org	In-House Massage	Relaxing 60-minute Swedish massage in the comfort of your accommodation	wellness	fixed	150.00	AUD	t	t	3	12	t	wellness	medium	2025-07-02 15:09:37.63967	2025-07-02 15:09:37.63967	demo-admin
9	default-org	Grocery Shopping	Pre-arrival grocery shopping service - stock your fridge before arrival	concierge	variable	25.00	AUD	t	f	5	24	t	concierge	low	2025-07-02 15:09:37.63967	2025-07-02 15:09:37.63967	demo-admin
10	default-org	Welcome Dinner	Prepared meal service featuring local cuisine delivered on arrival day	catering	fixed	75.00	AUD	t	f	2	6	t	catering	medium	2025-07-02 15:09:37.63967	2025-07-02 15:09:37.63967	demo-admin
\.


--
-- Data for Name: guest_ai_faq_knowledge; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_ai_faq_knowledge (id, organization_id, property_id, question_keyword, response_text, category, priority, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guest_chat_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_chat_messages (id, organization_id, guest_session_id, booking_id, message_type, sender_type, message_content, message_thread_id, ai_processed, detected_issue, issue_severity, requires_staff_response, sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: guest_feedback; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_feedback (id, organization_id, booking_id, property_id, guest_name, guest_email, feedback_type, feedback_channel, original_message, detected_keywords, sentiment_score, urgency_level, is_processed, requires_action, assigned_task_id, processed_by, processing_notes, received_at, processed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guest_id_scans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_id_scans (id, booking_id, guest_name, document_type, scan_url, ocr_data, created_at) FROM stdin;
19	9	John Smith	passport	https://storage.example.com/scans/passport_001.jpg	{"gender": "Male", "confidence": 0.92, "expiryDate": "2028-03-15", "dateOfBirth": "1985-03-15", "nationality": "American", "extractedText": "PASSPORT\\\\nUNITED STATES OF AMERICA\\\\nP1234567\\\\nSMITH\\\\nJOHN\\\\nM\\\\n15 MAR 1985\\\\n15 MAR 2028", "documentNumber": "P1234567", "verificationStatus": "verified"}	2025-07-26 09:52:47.344459
20	10	Sarah Wilson	passport	https://storage.example.com/scans/passport_002.jpg	{"gender": "Female", "confidence": 0.88, "expiryDate": "2029-07-22", "dateOfBirth": "1990-07-22", "nationality": "British", "extractedText": "PASSPORT\\\\nUNITED KINGDOM\\\\nP9876543\\\\nWILSON\\\\nSARAH\\\\nF\\\\n22 JUL 1990\\\\n22 JUL 2029", "documentNumber": "P9876543", "verificationStatus": "verified"}	2025-07-26 09:52:47.344459
21	11	Chen Wei	passport	https://storage.example.com/scans/passport_003.jpg	{"gender": "Male", "confidence": 0.85, "expiryDate": "2026-11-08", "dateOfBirth": "1988-11-08", "nationality": "Chinese", "extractedText": "护照\\\\nCHINA\\\\nG12345678\\\\nCHEN\\\\nWEI\\\\nM\\\\n08 NOV 1988\\\\n08 NOV 2026", "documentNumber": "G12345678", "verificationStatus": "verified"}	2025-07-26 09:52:47.344459
22	12	Hiroshi Tanaka	passport	https://storage.example.com/scans/passport_004.jpg	{"gender": "Male", "confidence": 0.90, "expiryDate": "2027-04-12", "dateOfBirth": "1992-04-12", "nationality": "Japanese", "extractedText": "パスポート\\\\nJAPAN\\\\nTK123456\\\\nTANAKA\\\\nHIROSHI\\\\nM\\\\n12 APR 1992\\\\n12 APR 2027", "documentNumber": "TK123456", "verificationStatus": "verified"}	2025-07-26 09:52:47.344459
23	13	Emma Johnson	id	https://storage.example.com/scans/id_001.jpg	{"errors": ["Expiry date approaching"], "gender": "Female", "confidence": 0.78, "expiryDate": "2025-06-18", "dateOfBirth": "1993-06-18", "nationality": "Australian", "extractedText": "DRIVERS LICENSE\\\\nAUSTRALIA\\\\nDL123456789\\\\nJOHNSON\\\\nEMMA\\\\nF\\\\n18 JUN 1993\\\\n18 JUN 2025", "documentNumber": "DL123456789", "verificationStatus": "pending"}	2025-07-26 09:52:47.344459
24	15	Somchai Jaidee	id	https://storage.example.com/scans/thai_id_001.jpg	{"gender": "Male", "confidence": 0.82, "dateOfBirth": "1985-12-03", "nationality": "Thai", "extractedText": "บัตรประจำตัวประชาชน\\\\nTHAILAND\\\\n1234567890123\\\\nสมชาย ใจดี\\\\nM\\\\n03 DEC 1985", "documentNumber": "1234567890123", "verificationStatus": "verified"}	2025-07-26 09:52:47.344459
25	14	Klaus Mueller	passport	https://storage.example.com/scans/passport_006.jpg	{"errors": ["Document expiring soon", "Some text unclear"], "gender": "Male", "confidence": 0.76, "expiryDate": "2025-02-14", "dateOfBirth": "1980-02-14", "nationality": "German", "extractedText": "REISEPASS\\\\nDEUTSCHLAND\\\\nC01234567\\\\nMUELLER\\\\nKLAUS\\\\nM\\\\n14 FEB 1980\\\\n14 FEB 2025", "documentNumber": "C01234567", "verificationStatus": "pending"}	2025-07-26 09:52:47.344459
26	16	Pierre Dubois	passport	https://storage.example.com/scans/passport_007.jpg	{"gender": "Male", "confidence": 0.89, "expiryDate": "2029-10-30", "dateOfBirth": "1991-10-30", "nationality": "French", "extractedText": "PASSEPORT\\\\nFRANCE\\\\nF5432109\\\\nDUBOIS\\\\nPIERRE\\\\nM\\\\n30 OCT 1991\\\\n30 OCT 2029", "documentNumber": "F5432109", "verificationStatus": "verified"}	2025-07-26 09:52:47.344459
27	9	Mary Smith	id	https://storage.example.com/scans/id_002.jpg	{"gender": "Female", "confidence": 0.91, "expiryDate": "2026-09-25", "dateOfBirth": "1987-09-25", "nationality": "American", "extractedText": "DRIVERS LICENSE\\\\nSTATE OF CALIFORNIA\\\\nDL987654321\\\\nSMITH\\\\nMARY\\\\nF\\\\n25 SEP 1987\\\\n25 SEP 2026", "documentNumber": "DL987654321", "verificationStatus": "verified"}	2025-07-26 09:52:47.344459
28	11	Chen Wei	passport	https://storage.example.com/scans/passport_failed.jpg	{"errors": ["Poor image quality", "Text not readable", "Document orientation incorrect"], "confidence": 0.45, "extractedText": "PASSPORT\\\\n[UNREADABLE TEXT]\\\\n[UNCLEAR]", "verificationStatus": "failed"}	2025-07-26 09:52:47.344459
\.


--
-- Data for Name: guest_maintenance_reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_maintenance_reports (id, organization_id, guest_session_id, booking_id, property_id, issue_type, issue_title, issue_description, location_in_property, severity_level, report_images, report_videos, report_status, assigned_to, assigned_at, estimated_resolution_time, actual_resolution_time, resolution_notes, resolution_images, reported_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guest_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_messages (id, organization_id, guest_id, guest_name, guest_email, booking_id, property_id, message_content, message_type, priority, status, ai_processed, ai_keywords, ai_sentiment, ai_confidence, ai_suggestions, staff_response, responded_by, responded_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guest_portal_access; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_portal_access (id, organization_id, property_id, guest_email, access_token, expires_at, is_active, booking_reference, created_at, updated_at, guest_name, check_in_date, check_out_date, created_by, last_accessed_at) FROM stdin;
\.


--
-- Data for Name: guest_portal_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_portal_sessions (id, organization_id, booking_id, guest_email, access_token, property_id, check_in_date, check_out_date, guest_name, guest_phone, is_active, expires_at, last_accessed, created_at) FROM stdin;
\.


--
-- Data for Name: guest_property_local_info; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_property_local_info (id, organization_id, property_id, location_type, location_name, description, location_address, distance_from_property, estimated_cost, recommendation_score, operating_hours, contact_info, booking_url, display_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: guest_service_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guest_service_requests (id, organization_id, guest_id, guest_name, booking_id, property_id, service_type, service_name, requested_date, requested_time, number_of_guests, special_requests, estimated_cost, currency, payment_method, status, confirmed_by, confirmed_at, completed_at, guest_rating, guest_feedback, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inventory (id, property_id, item_name, category, quantity, min_quantity, unit_cost, supplier, last_restocked, created_at, updated_at, usage_tracking) FROM stdin;
\.


--
-- Data for Name: invoice_line_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoice_line_items (id, invoice_id, description, quantity, unit_price, total_price, reference_id, reference_type) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoices (id, organization_id, invoice_number, sender_type, sender_id, sender_name, sender_address, receiver_type, receiver_id, receiver_name, receiver_address, invoice_type, description, subtotal, tax_rate, tax_amount, total_amount, currency, status, due_date, paid_date, reference_number, notes, attachments, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: legal_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.legal_templates (id, organization_id, country_code, doc_type, template_text, created_at, updated_at) FROM stdin;
1	default-org	THA	contract	Thailand Rental Contract Template - This contract outlines the terms and conditions for property rental in Thailand...	2025-07-26 09:18:30.564844	2025-07-26 09:18:30.564844
2	default-org	THA	deposit_rules	Thailand Security Deposit Rules - Security deposits must comply with Thai law and cannot exceed 2 months rent...	2025-07-26 09:18:30.564844	2025-07-26 09:18:30.564844
3	default-org	USA	contract	United States Rental Agreement - This lease agreement is governed by state and federal laws...	2025-07-26 09:18:30.564844	2025-07-26 09:18:30.564844
4	default-org	GBR	terms_conditions	UK Terms and Conditions - These terms comply with UK rental regulations...	2025-07-26 09:18:30.564844	2025-07-26 09:18:30.564844
5	default-org	THA	house_rules	Thailand House Rules Template - These rules apply to all guests staying at properties in Thailand...	2025-07-26 09:18:42.439675	2025-07-26 09:18:42.439675
\.


--
-- Data for Name: maintenance_approval_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.maintenance_approval_logs (id, organization_id, suggestion_id, action, action_by, action_reason, previous_status, new_status, approval_notes, created_at) FROM stdin;
\.


--
-- Data for Name: maintenance_budget_forecasts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.maintenance_budget_forecasts (id, property_id, forecast_year, expected_cost, ai_notes, created_at) FROM stdin;
1	1	2025	85000.00	AI Forecast for Villa Samui Breeze (2025):\nProperty Type: villa with 3 bedrooms\n🟡 Moderate maintenance forecast includes:\n• Regular HVAC servicing and minor repairs\n• Pool maintenance and chemical treatments\n• Garden upkeep and exterior cleaning\nNear-term priorities: AC servicing, pool pump inspection, painting touch-ups\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging, Multiple AC units requiring service\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
2	1	2026	92000.00	AI Forecast for Villa Samui Breeze (2026):\nProperty Type: villa with 3 bedrooms\n🟡 Moderate maintenance forecast includes:\n• Regular HVAC servicing and minor repairs\n• Pool maintenance and chemical treatments\n• Garden upkeep and exterior cleaning\nMedium-term planning: Appliance replacements, roof maintenance, electrical upgrades\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging, Multiple AC units requiring service, Electronic systems approaching replacement cycle\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
3	2	2025	68000.00	AI Forecast for Villa Ocean View (2025):\nProperty Type: villa with 2 bedrooms\n🟢 Conservative maintenance forecast covers:\n• Basic preventive maintenance\n• Emergency repair buffer\n• Regular cleaning and upkeep\nNear-term priorities: AC servicing, pool pump inspection, painting touch-ups\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
4	2	2026	74000.00	AI Forecast for Villa Ocean View (2026):\nProperty Type: villa with 2 bedrooms\n🟢 Conservative maintenance forecast covers:\n• Basic preventive maintenance\n• Emergency repair buffer\n• Regular cleaning and upkeep\nMedium-term planning: Appliance replacements, roof maintenance, electrical upgrades\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging, Electronic systems approaching replacement cycle\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
5	3	2025	125000.00	AI Forecast for Villa Aruna (Demo) (2025):\nProperty Type: villa with 4 bedrooms\n🟡 Moderate maintenance forecast includes:\n• Regular HVAC servicing and minor repairs\n• Pool maintenance and chemical treatments\n• Garden upkeep and exterior cleaning\nNear-term priorities: AC servicing, pool pump inspection, painting touch-ups\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging, Multiple AC units requiring service\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
6	3	2026	135000.00	AI Forecast for Villa Aruna (Demo) (2026):\nProperty Type: villa with 4 bedrooms\n🟡 Moderate maintenance forecast includes:\n• Regular HVAC servicing and minor repairs\n• Pool maintenance and chemical treatments\n• Garden upkeep and exterior cleaning\nMedium-term planning: Appliance replacements, roof maintenance, electrical upgrades\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging, Multiple AC units requiring service, Electronic systems approaching replacement cycle\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
7	3	2027	155000.00	AI Forecast for Villa Aruna (Demo) (2027):\nProperty Type: villa with 4 bedrooms\n🔴 High maintenance forecast due to:\n• Large property size requiring extensive upkeep\n• Villa properties typically need pool, garden, and exterior maintenance\n• Long-term forecast includes major system replacements\nMedium-term planning: Appliance replacements, roof maintenance, electrical upgrades\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging, Multiple AC units requiring service, Electronic systems approaching replacement cycle\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
8	4	2025	78000.00	AI Forecast for Sunset Villa Bondi (2025):\nProperty Type: villa with 3 bedrooms\n🟢 Conservative maintenance forecast covers:\n• Basic preventive maintenance\n• Emergency repair buffer\n• Regular cleaning and upkeep\nNear-term priorities: AC servicing, pool pump inspection, painting touch-ups\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging, Multiple AC units requiring service\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
9	4	2026	87000.00	AI Forecast for Sunset Villa Bondi (2026):\nProperty Type: villa with 3 bedrooms\n🟡 Moderate maintenance forecast includes:\n• Regular HVAC servicing and minor repairs\n• Pool maintenance and chemical treatments\n• Garden upkeep and exterior cleaning\nMedium-term planning: Appliance replacements, roof maintenance, electrical upgrades\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging, Multiple AC units requiring service, Electronic systems approaching replacement cycle\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
10	1	2027	108000.00	AI Forecast for Villa Samui Breeze (2027):\nProperty Type: villa with 3 bedrooms\n🟡 Moderate maintenance forecast includes:\n• Regular HVAC servicing and minor repairs\n• Pool maintenance and chemical treatments\n• Garden upkeep and exterior cleaning\nMedium-term planning: Appliance replacements, roof maintenance, electrical upgrades\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging, Multiple AC units requiring service, Electronic systems approaching replacement cycle\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
11	2	2027	85000.00	AI Forecast for Villa Ocean View (2027):\nProperty Type: villa with 2 bedrooms\n🟡 Moderate maintenance forecast includes:\n• Regular HVAC servicing and minor repairs\n• Pool maintenance and chemical treatments\n• Garden upkeep and exterior cleaning\nMedium-term planning: Appliance replacements, roof maintenance, electrical upgrades\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging, Electronic systems approaching replacement cycle\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
12	4	2027	98000.00	AI Forecast for Sunset Villa Bondi (2027):\nProperty Type: villa with 3 bedrooms\n🟡 Moderate maintenance forecast includes:\n• Regular HVAC servicing and minor repairs\n• Pool maintenance and chemical treatments\n• Garden upkeep and exterior cleaning\nMedium-term planning: Appliance replacements, roof maintenance, electrical upgrades\nForecast includes Thailand market factors:\n• Tropical climate impact on materials and systems\n• Local labor and material cost trends\n• Tourism industry maintenance standards\nRisk factors to monitor: Pool equipment aging, Multiple AC units requiring service, Electronic systems approaching replacement cycle\nCost optimization strategies:\n• Schedule major work during low season (May-September)\n• Bundle maintenance tasks to reduce service call fees\n• Consider preventive maintenance contracts for 10-15% savings	2025-07-26 09:58:14.02451
\.


--
-- Data for Name: maintenance_suggestion_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.maintenance_suggestion_settings (id, organization_id, owner_approval_required, auto_approve_under_amount, approval_timeout_days, require_multiple_quotes, multiple_quotes_threshold, require_photos, require_detailed_description, max_attachment_size, allowed_file_types, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: maintenance_suggestions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.maintenance_suggestions (id, organization_id, property_id, title, maintenance_type, description, estimated_cost, is_urgent, photos, status, approval_status, owner_comments, suggested_by, approved_by, payment_responsibility, external_contractor_required, preferred_contractor_id, completion_deadline, approval_deadline, task_created_id, finance_entry_id, timeline_entry_id, created_at, updated_at, urgency_level, currency, cost_breakdown, who_pays_cost, attachments, evidence_photos, supporting_documents, submitted_by_role, submission_reason, owner_response, owner_response_notes, owner_responded_at, external_contractor_info, task_created_at, finance_recorded_at, system_notes, visible_to_owner, notification_sent_at, reminder_count, submitted_by) FROM stdin;
\.


--
-- Data for Name: maintenance_timeline_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.maintenance_timeline_entries (id, organization_id, property_id, suggestion_id, entry_type, entry_title, entry_description, entry_icon, visible_to_owner, visible_to_staff, visible_to_guests, created_by, affects_users, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_packs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.marketing_packs (id, organization_id, property_id, generated_by, pdf_url, ai_summary, pack_type, target_audience, language, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: marketplace_service_analytics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.marketplace_service_analytics (id, organization_id, service_id, property_id, period_start, period_end, total_bookings, total_revenue, average_rating, most_requested_time, peak_season_months, customer_satisfaction_score, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: marketplace_services; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.marketplace_services (id, organization_id, vendor_id, category_id, name, description, short_description, photos, pricing_type, base_price, currency, price_notes, requires_approval, requires_pre_payment, cancellation_policy, duration, availability, booking_instructions, special_notes, tags, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: media_folders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.media_folders (id, organization_id, property_id, folder_name, folder_description, cloud_folder_link, cloud_provider, access_level, is_agent_approved, sort_order, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: media_usage_analytics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.media_usage_analytics (id, organization_id, property_id, media_file_id, view_count, download_count, share_count, weekly_views, monthly_views, popularity_score, last_accessed, trending_score, reset_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_preferences (id, organization_id, user_id, enable_in_app, enable_email, enable_sms, enable_whatsapp, enable_line, task_assignments, booking_updates, payout_actions, maintenance_approvals, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, organization_id, user_id, type, title, message, related_entity_type, related_entity_id, priority, is_read, read_at, action_url, action_label, created_by, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: offline_task_cache; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.offline_task_cache (id, organization_id, property_id, staff_id, task_data, synced, created_at, synced_at) FROM stdin;
1	default-org	17	demo-staff	{"type": "cleaning", "title": "Pool cleaning", "priority": "normal", "description": "Clean main pool area", "assigned_date": "2025-07-26"}	f	2025-07-26 08:22:55.141592	\N
2	default-org	18	demo-staff	{"type": "maintenance", "title": "AC filter replacement", "priority": "high", "description": "Replace AC filters in all bedrooms", "assigned_date": "2025-07-26"}	f	2025-07-26 08:22:55.141592	\N
\.


--
-- Data for Name: onboarding_step_details; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.onboarding_step_details (id, organization_id, onboarding_id, step_number, step_name, step_description, is_completed, completed_at, completed_by, step_data, validation_errors, attempt_count, last_attempt_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: organization_api_keys; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.organization_api_keys (id, organization_id, provider, key_name, encrypted_value, description, is_active, last_used, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.organizations (id, name, domain, subdomain, company_logo, settings, subscription_tier, max_users, max_properties, is_active, trial_ends_at, created_at, updated_at, custom_domain, branding_logo_url, theme_color) FROM stdin;
default-org	Default Organization	localhost:5000	default	\N	\N	basic	10	50	t	\N	2025-07-02 12:09:02.968595	2025-07-02 12:09:02.968595	\N	\N	#0066ff
demo-org	Demo Organization	demo.hostpilotpro.com	demo	\N	\N	pro	50	100	t	\N	2025-07-05 18:22:36.131477	2025-07-05 18:22:36.131477	\N	\N	#0066ff
\.


--
-- Data for Name: owner_activity_timeline; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_activity_timeline (id, organization_id, property_id, owner_id, activity_type, title, description, metadata, reference_id, reference_type, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: owner_balances; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_balances (id, organization_id, owner_id, current_balance, total_earnings, total_expenses, total_payouts_requested, total_payouts_paid, this_month_earnings, this_month_expenses, this_month_net, last_calculated, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: owner_charge_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_charge_requests (id, organization_id, owner_id, charged_by, amount, currency, reason, description, due_date, payment_method, payment_reference, payment_receipt_url, status, charged_at, paid_at, processed_by) FROM stdin;
\.


--
-- Data for Name: owner_documents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_documents (id, organization_id, process_id, owner_id, property_id, category, file_name, original_file_name, file_type, file_path, title, description, file_url, file_size, mime_type, has_expiration, expiration_date, expiration_alert_sent, status, uploaded_by, reviewed_by, reviewed_at, review_comments, is_public, visibility, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: owner_financial_summary; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_financial_summary (id, organization_id, owner_id, property_id, period_start, period_end, rental_income, addon_revenue, management_fees, utility_deductions, service_deductions, net_balance, breakdown, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: owner_invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_invoices (id, organization_id, owner_id, property_id, invoice_number, invoice_type, title, description, amount, currency, period_start, period_end, due_date, status, pdf_url, metadata, created_at, created_by, updated_at) FROM stdin;
\.


--
-- Data for Name: owner_onboarding_processes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_onboarding_processes (id, organization_id, owner_id, property_id, step1_owner_contact_info, step2_property_basics, step3_location_mapping, step4_photo_uploads, step5_property_description, step6_utility_info, step7_legal_documents, step8_security_access, step9_services_setup, total_steps, completed_steps, progress_percentage, current_step, onboarding_deadline, deadline_set_by, priority, estimated_days_remaining, is_overdue, admin_notes, owner_instructions, next_step_instructions, last_activity_at, last_updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: owner_payout_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_payout_requests (id, organization_id, owner_id, amount, currency, period_start, period_end, status, request_notes, admin_notes, payment_receipt_url, payment_method, payment_reference, requested_at, approved_at, approved_by, payment_uploaded_at, payment_uploaded_by, completed_at, completed_by) FROM stdin;
1	default-org	demo-owner	2500.00	AUD	2024-12-01	2024-12-31	completed	December earnings payout	\N	\N	\N	\N	2025-07-02 15:21:21.332163	\N	\N	\N	\N	\N	\N
2	default-org	demo-owner	3200.00	AUD	2025-01-01	2025-01-31	pending	January earnings - includes addon revenue	\N	\N	\N	\N	2025-07-02 15:21:21.332163	\N	\N	\N	\N	\N	\N
3	default-org	demo-owner	1800.00	AUD	2024-11-01	2024-11-30	approved	November earnings payout	\N	\N	\N	\N	2025-07-02 15:21:21.332163	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: owner_payouts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_payouts (id, organization_id, owner_id, property_id, requested_amount, currency, status, request_date, requested_by, request_notes, approved_by, approved_date, approval_notes, payment_method, payment_reference, payment_date, paid_by, receipt_url, receipt_uploaded_by, receipt_uploaded_date, confirmed_by, confirmed_date, period_start_date, period_end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: owner_preferences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_preferences (id, organization_id, owner_id, task_approval_required, maintenance_alerts, guest_addon_notifications, financial_notifications, weekly_reports, preferred_currency, notification_email, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: owner_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_settings (id, organization_id, owner_id, task_approval_required, maintenance_alerts, guest_addon_notifications, financial_notifications, weekly_reports, preferred_currency, notification_email, created_at, updated_at, tax_region, transparency_mode, custom_branding) FROM stdin;
1	default-org	demo-owner	t	t	t	t	t	AUD	owner@hostpilotpro.com	2025-07-02 15:21:28.905579	2025-07-02 15:21:28.905579	default	summary	\N
\.


--
-- Data for Name: owner_timeline_activity; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.owner_timeline_activity (id, organization_id, owner_id, property_id, activity_type, title, description, property_name, metadata, created_at) FROM stdin;
6	default-org	demo-owner	1	check_in	Guest Check-in	John Smith checked in for 3 nights	Beachfront Villa	\N	2025-07-02 15:20:58.51747
7	default-org	demo-owner	1	task_completed	Cleaning Completed	Property cleaned and inspected	Beachfront Villa	\N	2025-07-02 15:20:58.51747
8	default-org	demo-owner	2	guest_feedback	Positive Review	Guest left 5-star review mentioning excellent cleanliness	City Apartment	\N	2025-07-02 15:20:58.51747
9	default-org	demo-owner	1	addon_booking	Massage Service Booked	Guest booked in-room massage for $150	Beachfront Villa	\N	2025-07-02 15:20:58.51747
10	default-org	demo-owner	2	bill_uploaded	Utility Bill Uploaded	Electricity bill for March uploaded ($89.50)	City Apartment	\N	2025-07-02 15:20:58.51747
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.platform_settings (id, setting_key, setting_value, setting_type, category, description, is_secret, updated_by, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: pm_commission_balance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pm_commission_balance (id, organization_id, manager_id, total_earned, total_paid, current_balance, last_payout_date, created_at, updated_at) FROM stdin;
1	default-org	pm	2500.00	1500.00	1000.00	\N	2025-07-02 15:30:24.793979	2025-07-02 15:30:24.793979
\.


--
-- Data for Name: pm_notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pm_notifications (id, organization_id, manager_id, type, title, message, severity, action_required, is_read, related_type, related_id, created_at) FROM stdin;
1	default-org	pm	task_completed	Maintenance Task Completed	Pool cleaning has been completed at Ocean View Villa	info	f	f	\N	\N	2025-07-02 15:30:35.793715
2	default-org	pm	booking_update	New Booking Received	New 5-night booking for Mountain Lodge starting Dec 20th	info	f	f	\N	\N	2025-07-02 15:30:35.793715
3	default-org	pm	maintenance_alert	Urgent Maintenance Required	HVAC system failure reported at Downtown Apartment	urgent	t	f	\N	\N	2025-07-02 15:30:35.793715
4	default-org	pm	payout_approved	Commission Payout Approved	Your commission payout of $500 has been approved	info	f	f	\N	\N	2025-07-02 15:30:35.793715
\.


--
-- Data for Name: pm_payout_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pm_payout_requests (id, organization_id, manager_id, amount, currency, request_notes, admin_notes, status, receipt_url, requested_at, approved_at, approved_by, paid_at, created_at, updated_at, processed_by) FROM stdin;
1	default-org	pm	500.00	AUD	Monthly commission withdrawal	\N	approved	\N	2025-06-29 15:30:35.793715	\N	\N	\N	2025-07-02 15:30:35.793715	2025-07-02 15:30:35.793715	\N
2	default-org	pm	750.00	AUD	Quarterly performance bonus	\N	pending	\N	2025-07-01 15:30:35.793715	\N	\N	\N	2025-07-02 15:30:35.793715	2025-07-02 15:30:35.793715	\N
\.


--
-- Data for Name: pm_property_performance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pm_property_performance (id, organization_id, manager_id, property_id, period, revenue, expenses, net_income, commission_earned, occupancy_rate, booking_count, avg_rating, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pm_task_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pm_task_logs (id, organization_id, manager_id, property_id, task_title, department, staff_assigned, status, result, notes, evidence_photos, receipts, completed_at, created_at, updated_at) FROM stdin;
1	default-org	pm	1	Property inspection completed	inspection	staff	completed	Property in excellent condition, minor issues addressed	\N	\N	\N	2025-06-30 15:30:35.793715	2025-07-02 15:30:35.793715	2025-07-02 15:30:35.793715
2	default-org	pm	2	Property inspection completed	inspection	staff	completed	Property in excellent condition, minor issues addressed	\N	\N	\N	2025-06-30 15:30:35.793715	2025-07-02 15:30:35.793715	2025-07-02 15:30:35.793715
\.


--
-- Data for Name: portfolio_assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.portfolio_assignments (id, organization_id, manager_id, property_id, commission_rate, assigned_at, unassigned_at, is_active) FROM stdin;
1	default-org	pm	1	10.00	2025-07-02 15:30:24.793979	\N	t
2	default-org	pm	2	10.00	2025-07-02 15:30:24.793979	\N	t
\.


--
-- Data for Name: portfolio_health_scores; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.portfolio_health_scores (id, property_id, score, factors, calculated_at) FROM stdin;
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.properties (id, name, address, description, bedrooms, bathrooms, max_guests, price_per_night, status, amenities, images, hostaway_id, owner_id, created_at, updated_at, organization_id, external_id, currency, google_maps_link) FROM stdin;
3	Villa Aruna (Demo)	Bophut Hills, Koh Samui, Thailand	Stunning 3-bedroom villa with private pool and ocean views in exclusive Bophut Hills location. Perfect for families and groups seeking luxury accommodation in Koh Samui.	3	3	6	20000.00	active	{"Private Pool","Ocean View","Air Conditioning",WiFi,Kitchen,Parking,Garden}	\N	\N	demo-owner	2025-07-04 06:52:47.655594	2025-07-04 06:52:47.655594	default-org	\N	THB	\N
4	Sunset Villa Bondi	123 Ocean View Drive, Bondi Beach, NSW 2026	Stunning beachfront villa with panoramic ocean views. Perfect for families and groups.	4	3	8	450.00	active	\N	\N	\N	owner-1	2025-07-24 07:53:44.598176	2025-07-24 07:53:44.598176	default-org	1001	AUD	\N
5	City Penthouse Melbourne	456 Collins Street, Melbourne, VIC 3000	Luxury penthouse in the heart of Melbourne CBD with skyline views.	3	2	6	380.00	active	\N	\N	\N	owner-1	2025-07-24 07:53:44.598176	2025-07-24 07:53:44.598176	default-org	1002	AUD	\N
6	Harbour View Apartment	789 Circular Quay, Sydney, NSW 2000	Modern apartment overlooking Sydney Harbour Bridge and Opera House.	2	2	4	320.00	active	\N	\N	\N	owner-2	2025-07-24 07:53:44.598176	2025-07-24 07:53:44.598176	default-org	1003	AUD	\N
7	Byron Bay Beach House	321 Beachfront Road, Byron Bay, NSW 2481	Spacious beach house steps from the sand. Ideal for large groups and events.	5	4	10	520.00	active	\N	\N	\N	owner-2	2025-07-24 07:53:44.598176	2025-07-24 07:53:44.598176	default-org	1004	AUD	\N
8	Gold Coast High-Rise	654 Surfers Paradise Blvd, Gold Coast, QLD 4217	Modern high-rise apartment with beach access and resort facilities.	3	2	6	290.00	active	\N	\N	\N	owner-3	2025-07-24 07:53:44.598176	2025-07-24 07:53:44.598176	default-org	1005	AUD	\N
10	Villa Tropical Paradise	456 Hillside Drive, Koh Samui, Thailand	Stunning hillside villa with panoramic ocean views and infinity pool. Ideal for families and groups.	4	4	8	12000.00	active	{"Infinity Pool","Ocean View",WiFi,"Air Conditioning",Kitchen,Parking,Garden}	\N	\N	owner-1	2025-07-24 15:47:58.217125	2025-07-24 15:47:58.217125	default-org	1002	THB	\N
11	Villa Balinese Charm	789 Coconut Grove, Koh Samui, Thailand	Authentic Thai-style villa surrounded by tropical gardens. Perfect for romantic getaways.	2	2	4	6500.00	active	{"Traditional Design","Garden Pool",WiFi,"Air Conditioning","Outdoor Kitchen"}	\N	\N	owner-2	2025-07-24 15:47:58.287428	2025-07-24 15:47:58.287428	default-org	1003	THB	\N
12	Villa Gala Beachfront	321 Beachfront Road, Koh Samui, Thailand	Spectacular beachfront villa with direct beach access. Perfect for large groups and events.	5	5	10	18000.00	active	{Beachfront,"Large Pool",WiFi,"Air Conditioning","Full Kitchen","BBQ Area",Parking}	\N	\N	owner-2	2025-07-24 15:47:58.356972	2025-07-24 15:47:58.356972	default-org	1004	THB	\N
13	Villa Sunset Heights	654 Mountain View Road, Koh Samui, Thailand	Elevated villa with spectacular sunset views and modern amenities. Great for families.	3	3	6	9500.00	active	{"Sunset Views","Modern Pool",WiFi,"Air Conditioning",Kitchen,Parking}	\N	\N	owner-3	2025-07-24 15:47:58.424945	2025-07-24 15:47:58.424945	default-org	1005	THB	\N
14	Villa Samui Breeze	123 Beach Road, Koh Samui, Thailand	Luxurious 3-bedroom villa with private pool and garden on Koh Samui. Perfect for families seeking authentic Thai hospitality.	3	3	6	8000.00	active	{"Private Pool",Garden,WiFi,"Air Conditioning",Kitchen,"Beach Access"}	\N	\N	demo-owner	2025-07-24 15:53:42.335567	2025-07-24 15:53:42.335567	default-org	DEMO-VILLA-001	THB	\N
2	Villa Ocean View	456 Hillside Drive, Koh Samui, Thailand	Cozy 2-bedroom villa with stunning ocean views. Perfect for couples and small families.	2	2	4	6500.00	active	\N	\N	\N	demo-owner	2025-07-02 15:20:50.497492	2025-07-02 15:20:50.497492	default-org	\N	THB	\N
9	Villa Samui Breeze	123 Beach Road, Koh Samui, Thailand	Luxurious 3-bedroom villa with private pool and garden on Koh Samui. Perfect for couples and small families.	3	3	6	8000.00	active	{"Private Pool",Garden,WiFi,"Air Conditioning",Kitchen,"Beach Access"}	\N	\N	owner-1	2025-07-24 15:47:58.135041	2025-07-24 15:47:58.135041	default-org	1001	THB	\N
1	Villa Samui Breeze	123 Beach Road, Koh Samui, Thailand	Luxurious 3-bedroom villa with private pool and garden on Koh Samui. Perfect for couples and small families.	3	3	6	8000.00	active	{"Private Pool",Garden,WiFi,"Air Conditioning",Kitchen,"Beach Access"}	\N	\N	demo-owner	2025-07-02 15:20:50.497492	2025-07-02 15:20:50.497492	default-org	\N	THB	\N
15	Villa Ocean View	456 Hillside Drive, Koh Samui, Thailand	Cozy 2-bedroom villa with stunning ocean views. Perfect for couples and small families.	2	2	4	6500.00	active	{"Ocean View",WiFi,"Air Conditioning",Kitchen,Parking}	\N	\N	demo-owner	2025-07-24 15:53:42.43407	2025-07-24 15:53:42.43407	default-org	DEMO-VILLA-002	THB	\N
16	Villa Aruna (Demo)	Bophut Hills, Koh Samui, Thailand	Stunning 3-bedroom villa with private pool and ocean views in exclusive Bophut Hills location. Perfect for families and groups seeking luxury accommodation in Koh Samui.	3	3	6	20000.00	active	{"Private Pool","Ocean View","Air Conditioning",WiFi,Kitchen,Parking,Garden}	\N	\N	demo-owner	2025-07-24 15:53:42.508657	2025-07-24 15:53:42.508657	default-org	DEMO-VILLA-003	THB	\N
17	Villa Tropical Paradise	789 Coconut Grove, Koh Samui, Thailand	Spacious 4-bedroom villa surrounded by tropical gardens with infinity pool. Ideal for larger families and groups.	4	4	8	12000.00	active	{"Infinity Pool","Tropical Garden",WiFi,"Air Conditioning","Full Kitchen","BBQ Area",Parking}	\N	\N	demo-owner	2025-07-24 15:53:42.584037	2025-07-24 15:53:42.584037	default-org	DEMO-VILLA-004	THB	\N
\.


--
-- Data for Name: property_agents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_agents (id, organization_id, property_id, agent_id, agent_type, assigned_at, is_active, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: property_chat_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_chat_messages (id, organization_id, property_id, sender_id, recipient_id, role, message, translated_message, language_detected, created_at) FROM stdin;
1	default-org	1	admin	staff-001	admin	Please check the cleaning status for Villa Samui Breeze today	[TH] Please check the cleaning status for Villa Samui Breeze today (แปลเป็นภาษาไทยอัตโนมัติ)	en	2025-07-26 08:35:30.778767
2	default-org	1	staff-001	admin	staff	Cleaning completed. Everything looks good!	[TH] Cleaning completed. Everything looks good! (แปลเป็นภาษาไทยอัตโนมัติ)	en	2025-07-26 08:35:30.778767
3	default-org	17	staff-002	admin	staff	สระว่ายน้ำมีปัญหาเครื่องกรองน้ำ ต้องซ่อมแซม	[EN] สระว่ายน้ำมีปัญหาเครื่องกรองน้ำ ต้องซ่อมแซม (Auto-translated from Thai)	th	2025-07-26 08:35:30.778767
4	default-org	17	admin	staff-002	admin	Thank you for reporting. I will contact the pool maintenance team.	[TH] Thank you for reporting. I will contact the pool maintenance team. (แปลเป็นภาษาไทยอัตโนมัติ)	en	2025-07-26 08:35:30.778767
5	default-org	3	owner-001	admin	owner	When will the renovation work be completed?	[TH] When will the renovation work be completed? (แปลเป็นภาษาไทยอัตโนมัติ)	en	2025-07-26 08:35:30.778767
6	default-org	3	admin	owner-001	admin	The renovation will be finished by next Friday	[TH] The renovation will be finished by next Friday (แปลเป็นภาษาไทยอัตโนมัติ)	en	2025-07-26 08:35:30.778767
7	default-org	1	guest-001	staff-001	guest	房间的空调有问题	[EN] 房间的空调有问题 (Auto-translated from Chinese)	zh	2025-07-26 08:35:30.778767
8	default-org	1	staff-001	guest-001	staff	I will send maintenance to check the AC immediately	[TH] I will send maintenance to check the AC immediately (แปลเป็นภาษาไทยอัตโนมัติ)	en	2025-07-26 08:35:30.778767
\.


--
-- Data for Name: property_custom_expenses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_custom_expenses (id, organization_id, property_id, category_id, amount, billing_cycle, next_due_date, is_active, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: property_documents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_documents (id, organization_id, property_id, doc_type, file_url, expiry_date, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: property_insurance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_insurance (id, property_id, policy_number, insurer_name, coverage_details, expiry_date, uploaded_by, created_at) FROM stdin;
9	17	THAI-INS-VSB-2024-001	Thai Insurance Company	Comprehensive property coverage including structure, contents, and liability. Natural disaster protection for tropical storms and flooding. Coverage amount: ฿15,000,000	2025-03-15	admin@test.com	2025-07-26 10:10:19.795179
10	17	MUANG-THAI-VSB-2024-002	Muang Thai Insurance	Liability-only policy for guest accidents and property damage claims. Supplementary coverage. Coverage amount: ฿5,000,000	2025-01-15	admin@test.com	2025-07-26 10:10:19.795179
11	17	ALLIANZ-VAD-2024-456	Allianz Thailand	Full property and contents insurance with business interruption coverage for vacation rental operations. Coverage amount: ฿20,000,000	2024-12-30	admin@test.com	2025-07-26 10:10:19.795179
12	17	BANGKOK-INS-VTP-2025-123	Bangkok Insurance	Standard property insurance with tropical climate protection. Includes coverage for AC systems, pool maintenance equipment. Coverage amount: ฿18,000,000	2025-08-10	admin@test.com	2025-07-26 10:10:19.795179
13	17	THAI-LIFE-VOV-2024-333	Thai Life Insurance	Equipment and appliance coverage specifically for pool systems, air conditioning units, and kitchen appliances. Coverage amount: ฿3,500,000	2025-02-28	admin@test.com	2025-07-26 10:10:19.795179
14	17	EXPIRED-OLD-VTP-2023-999	Old Insurance Co.	Previous year policy that has expired. Comprehensive coverage that needs renewal. Coverage amount: ฿16,000,000	2024-11-30	admin@test.com	2025-07-26 10:10:19.795179
15	17	URGENT-VAD-2024-777	Express Insurance Thailand	Short-term policy covering transition period. Requires immediate renewal. Coverage amount: ฿8,000,000	2025-02-05	admin@test.com	2025-07-26 10:10:19.795179
16	17	AIG-CRITICAL-2024-888	AIG Thailand	Critical expiry alert - Premium villa insurance expiring in 3 days. Immediate renewal required. Coverage amount: ฿12,500,000	2025-01-29	admin@test.com	2025-07-26 10:10:19.795179
\.


--
-- Data for Name: property_investments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_investments (id, organization_id, property_id, investment_type, description, amount, investment_date, expected_roi, created_at) FROM stdin;
1	default-org	1	renovation	Full kitchen renovation with modern appliances	250000.00	2024-01-15	15.50	2025-07-26 08:29:48.041494
2	default-org	1	furniture	New furniture package for guest comfort	85000.00	2024-03-10	8.75	2025-07-26 08:29:48.041494
3	default-org	3	technology	Smart home automation system installation	45000.00	2024-06-01	12.25	2025-07-26 08:29:48.041494
4	default-org	17	pool	Swimming pool renovation and equipment upgrade	180000.00	2024-02-20	18.00	2025-07-26 08:29:48.041494
5	default-org	17	landscaping	Garden redesign and tropical plant installation	65000.00	2024-04-05	6.50	2025-07-26 08:29:48.041494
6	default-org	\N	equipment	Property management software and tools	120000.00	2024-05-15	25.00	2025-07-26 08:29:48.041494
\.


--
-- Data for Name: property_media_files; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_media_files (id, organization_id, property_id, file_name, media_type, description, cloud_link, cloud_provider, thumbnail_url, access_level, tags, is_agent_approved, is_unbranded, is_featured, uploaded_by, approved_by, approval_date, file_size_bytes, capture_location, captured_date, last_updated_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: property_media_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_media_settings (id, organization_id, property_id, auto_approval_enabled, agent_upload_enabled, watermark_enabled, watermark_template, quality_requirements, approval_workflow, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: property_payout_rules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_payout_rules (id, organization_id, property_id, airbnb_owner_percent, airbnb_management_percent, vrbo_owner_percent, vrbo_management_percent, booking_owner_percent, booking_management_percent, direct_owner_percent, direct_management_percent, stripe_fee_percent, stripe_fee_note, allow_booking_override, default_currency, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: property_referrals; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_referrals (id, organization_id, property_id, referral_agent_id, referral_date, commission_rate, is_active, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: property_revenue_targets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_revenue_targets (id, organization_id, property_id, target_year, target_quarter, target_amount, currency, current_revenue, description, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: property_reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_reviews (id, property_id, source, reviewer_name, rating, review_text, ai_summary, sentiment_score, created_at) FROM stdin;
1	14	Airbnb	Sarah Johnson	4.80	Amazing villa with stunning ocean views! The pool was pristine and the staff was incredibly helpful. Location is perfect for exploring Koh Samui. Highly recommend this place for families.	Mentions property views. Discusses pool facilities. Reviews staff service. Comments on location.	0.85	2025-07-26 09:28:10.398925
2	14	Booking.com	Mark Thompson	4.50	Great property overall. Clean rooms, comfortable beds, and excellent wifi. The only minor issue was some noise from the nearby construction, but nothing major.	Comments on accommodation. Reviews internet connectivity. Discusses noise levels.	0.42	2025-07-26 09:28:10.398925
3	2	Airbnb	Emma Chen	5.00	Absolutely perfect stay! The villa exceeded all expectations. Beautiful design, spotless clean, and the view from the bedroom is breathtaking. Will definitely book again.	Mentions cleanliness. Mentions property views. Comments on accommodation.	0.95	2025-07-26 09:28:10.398925
4	3	VRBO	David Miller	2.50	Disappointing experience. The property was not as clean as expected and the air conditioning in the main bedroom was broken. Staff was slow to respond to our concerns.	Mentions cleanliness. Reviews staff service.	-0.65	2025-07-26 09:28:10.398925
5	10	Booking.com	Lisa Anderson	4.20	Nice villa with good amenities. Pool area is lovely and well-maintained. Kitchen was fully equipped. Location is quiet and peaceful, perfect for relaxation.	Discusses pool facilities. Comments on location.	0.58	2025-07-26 09:28:10.398925
\.


--
-- Data for Name: property_status; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_status (id, organization_id, property_id, status, last_update, notes) FROM stdin;
5	default-org	1	occupied	2025-07-26 09:20:05.050443	Currently occupied by guests - checkout scheduled for tomorrow
6	default-org	2	cleaning-due	2025-07-26 09:20:05.050443	Deep cleaning required after recent checkout
7	default-org	3	vacant	2025-07-26 09:20:05.050443	Available for booking - ready for immediate occupancy
8	default-org	4	urgent-maintenance	2025-07-26 09:20:05.050443	Pool pump needs immediate repair - blocking bookings
\.


--
-- Data for Name: property_utility_accounts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_utility_accounts (id, organization_id, property_id, utility_type, provider, account_number, package_info, expected_bill_day, is_active, created_at, updated_at) FROM stdin;
1	demo-org-1	1	electricity	PEA (Provincial Electricity Authority)	EA13982	Residential Standard Rate	15	t	2025-07-03 06:38:22.641428	2025-07-03 06:38:22.641428
2	demo-org-1	1	water	Water Authority	WA15477	Standard Water Supply	20	t	2025-07-03 06:38:22.677796	2025-07-03 06:38:22.677796
3	demo-org-1	1	internet	AIS	INT14108	AIS Fiber 100/50 Mbps	5	t	2025-07-03 06:38:22.710148	2025-07-03 06:38:22.710148
4	demo-org-1	2	electricity	PEA (Provincial Electricity Authority)	EA28230	Residential Standard Rate	15	t	2025-07-03 06:38:22.742361	2025-07-03 06:38:22.742361
5	demo-org-1	2	water	Water Authority	WA25827	Standard Water Supply	20	t	2025-07-03 06:38:22.774962	2025-07-03 06:38:22.774962
6	demo-org-1	2	internet	AIS	INT20406	AIS Fiber 100/50 Mbps	5	t	2025-07-03 06:38:22.806197	2025-07-03 06:38:22.806197
\.


--
-- Data for Name: property_utility_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.property_utility_settings (id, organization_id, property_id, utility_type, provider_id, account_number, account_holder, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: recurring_service_charges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.recurring_service_charges (id, organization_id, property_id, service_name, service_category, provider_name, provider_contact, monthly_rate, currency, billing_day, charge_assignment, auto_deduct, requires_approval, service_frequency, service_day, service_time, is_active, start_date, end_date, last_charged_date, next_charge_date, notes, contract_url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: referral_earnings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.referral_earnings (id, organization_id, referral_agent_id, property_id, earnings_month, management_fee, commission_rate, commission_amount, occupancy_rate, average_review_score, total_bookings, is_confirmed, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: seasonal_forecasts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.seasonal_forecasts (id, organization_id, property_id, forecast_month, expected_occupancy, expected_rate, ai_notes, created_at) FROM stdin;
1	default-org	14	2025-01	92.50	12500.00	Peak season forecast with high demand expected. Christmas and New Year holidays drive increased bookings. Property features 3BR/2BA suitable for families. Market analysis suggests 92.5% occupancy achievable at ฿12,500 average daily rate.	2025-07-26 09:39:20.37283
2	default-org	15	2025-01	88.75	15800.00	Peak season forecast with high demand expected. Christmas and New Year holidays drive increased bookings. Property features 4BR/3BA suitable for families. Market analysis suggests 88.8% occupancy achievable at ฿15,800 average daily rate.	2025-07-26 09:39:20.37283
3	default-org	10	2025-02	90.25	11200.00	Peak season forecast with high demand expected. Valentine season and Chinese New Year drive increased bookings. Property features 2BR/2BA suitable for couples. Market analysis suggests 90.3% occupancy achievable at ฿11,200 average daily rate.	2025-07-26 09:39:20.37283
4	default-org	3	2025-02	95.00	18500.00	Peak season forecast with high demand expected. Premium location and amenities command top rates. Property features 5BR/4BA suitable for large groups. Market analysis suggests 95.0% occupancy achievable at ฿18,500 average daily rate.	2025-07-26 09:39:20.37283
5	default-org	14	2025-07	58.30	7800.00	Low season with reduced tourism. Consider promotional pricing and longer stay discounts. Focus on domestic market and business travelers. Property features 3BR/2BA suitable for families. Market analysis suggests 58.3% occupancy achievable at ฿7,800 average daily rate.	2025-07-26 09:39:20.37283
6	default-org	15	2025-08	62.50	9200.00	Low season with reduced tourism. Consider promotional pricing and longer stay discounts. Focus on domestic market and business travelers. Property features 4BR/3BA suitable for families. Market analysis suggests 62.5% occupancy achievable at ฿9,200 average daily rate.	2025-07-26 09:39:20.37283
7	default-org	10	2025-05	72.80	8500.00	Moderate season with steady demand. Competitive pricing recommended. Good opportunity for marketing campaigns and repeat guest incentives. Property features 2BR/2BA suitable for couples. Market analysis suggests 72.8% occupancy achievable at ฿8,500 average daily rate.	2025-07-26 09:39:20.37283
8	default-org	3	2025-11	78.60	14200.00	Moderate season with steady demand. Competitive pricing recommended. Good opportunity for marketing campaigns and repeat guest incentives. Property features 5BR/4BA suitable for large groups. Market analysis suggests 78.6% occupancy achievable at ฿14,200 average daily rate.	2025-07-26 09:39:20.37283
9	default-org	14	2025-12	89.40	13800.00	Peak season forecast with high demand expected. Christmas holidays approaching drive booking surge. Property features 3BR/2BA suitable for families. Market analysis suggests 89.4% occupancy achievable at ฿13,800 average daily rate.	2025-07-26 09:39:20.37283
10	default-org	15	2025-03	85.20	14600.00	Peak season forecast with high demand expected. Spring break and Easter holidays maintain strong demand. Property features 4BR/3BA suitable for families. Market analysis suggests 85.2% occupancy achievable at ฿14,600 average daily rate.	2025-07-26 09:39:20.37283
\.


--
-- Data for Name: security_deposits; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.security_deposits (id, booking_id, property_id, guest_id, amount, status, created_at, released_at) FROM stdin;
1	\N	14	guest-001	8000.00	held	2025-07-26 09:31:19.647844	\N
2	\N	2	guest-002	12000.00	released	2025-07-26 09:31:19.647844	\N
3	\N	10	guest-003	6000.00	partial-deducted	2025-07-26 09:31:19.647844	\N
4	\N	3	guest-004	15000.00	held	2025-07-26 09:31:19.647844	\N
5	\N	5	guest-005	10000.00	released	2025-07-26 09:31:19.647844	\N
\.


--
-- Data for Name: service_bookings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_bookings (id, organization_id, service_id, property_id, booking_number, guest_name, guest_email, guest_phone, guest_notes, requested_date, requested_time, estimated_duration, total_amount, currency, billing_assignment, status, payment_status, requested_by, requested_by_role, approved_by, approved_at, rejected_by, rejected_at, rejection_reason, confirmed_by, confirmed_at, started_at, completed_at, completion_notes, cancelled_at, cancellation_reason, internal_notes, vendor_notes, access_instructions, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_categories (id, organization_id, name, description, icon, is_active, sort_order, created_at, updated_at, color) FROM stdin;
29	default-org	Home Cleaning	Professional cleaning services for residential properties	home	t	0	2025-07-04 14:21:31.74077	2025-07-04 14:21:31.74077	#3B82F6
30	default-org	Garden & Landscaping	Garden maintenance and landscaping services	leaf	t	0	2025-07-04 14:21:31.74077	2025-07-04 14:21:31.74077	#10B981
31	default-org	Pool Maintenance	Swimming pool cleaning and maintenance	droplets	t	0	2025-07-04 14:21:31.74077	2025-07-04 14:21:31.74077	#06B6D4
32	default-org	Electrical Services	Electrical repairs and installations	zap	t	0	2025-07-04 14:21:31.74077	2025-07-04 14:21:31.74077	#F59E0B
33	default-org	Plumbing	Plumbing repairs and installations	wrench	t	0	2025-07-04 14:21:31.74077	2025-07-04 14:21:31.74077	#8B5CF6
34	default-org	AC & HVAC	Air conditioning and heating services	wind	t	0	2025-07-04 14:21:31.74077	2025-07-04 14:21:31.74077	#EF4444
35	default-org	Pest Control	Professional pest control services	bug	t	0	2025-07-04 14:21:31.74077	2025-07-04 14:21:31.74077	#F97316
36	default-org	Transportation	Transportation and taxi services	car	t	0	2025-07-04 14:21:31.74077	2025-07-04 14:21:31.74077	#6366F1
37	default-org	Home Cleaning	Professional cleaning services for residential properties	home	t	0	2025-07-04 14:21:41.74648	2025-07-04 14:21:41.74648	#3B82F6
38	default-org	Garden & Landscaping	Garden maintenance and landscaping services	leaf	t	0	2025-07-04 14:21:41.74648	2025-07-04 14:21:41.74648	#10B981
39	default-org	Pool Maintenance	Swimming pool cleaning and maintenance	droplets	t	0	2025-07-04 14:21:41.74648	2025-07-04 14:21:41.74648	#06B6D4
40	default-org	Electrical Services	Electrical repairs and installations	zap	t	0	2025-07-04 14:21:41.74648	2025-07-04 14:21:41.74648	#F59E0B
41	default-org	Plumbing	Plumbing repairs and installations	wrench	t	0	2025-07-04 14:21:41.74648	2025-07-04 14:21:41.74648	#8B5CF6
42	default-org	AC & HVAC	Air conditioning and heating services	wind	t	0	2025-07-04 14:21:41.74648	2025-07-04 14:21:41.74648	#EF4444
43	default-org	Pest Control	Professional pest control services	bug	t	0	2025-07-04 14:21:41.74648	2025-07-04 14:21:41.74648	#F97316
44	default-org	Transportation	Transportation and taxi services	car	t	0	2025-07-04 14:21:41.74648	2025-07-04 14:21:41.74648	#6366F1
45	default-org	Home Cleaning	Professional cleaning services for residential properties	home	t	0	2025-07-04 14:21:50.985393	2025-07-04 14:21:50.985393	#3B82F6
46	default-org	Garden & Landscaping	Garden maintenance and landscaping services	leaf	t	0	2025-07-04 14:21:50.985393	2025-07-04 14:21:50.985393	#10B981
47	default-org	Pool Maintenance	Swimming pool cleaning and maintenance	droplets	t	0	2025-07-04 14:21:50.985393	2025-07-04 14:21:50.985393	#06B6D4
48	default-org	Electrical Services	Electrical repairs and installations	zap	t	0	2025-07-04 14:21:50.985393	2025-07-04 14:21:50.985393	#F59E0B
49	default-org	Plumbing	Plumbing repairs and installations	wrench	t	0	2025-07-04 14:21:50.985393	2025-07-04 14:21:50.985393	#8B5CF6
50	default-org	AC & HVAC	Air conditioning and heating services	wind	t	0	2025-07-04 14:21:50.985393	2025-07-04 14:21:50.985393	#EF4444
51	default-org	Pest Control	Professional pest control services	bug	t	0	2025-07-04 14:21:50.985393	2025-07-04 14:21:50.985393	#F97316
52	default-org	Transportation	Transportation and taxi services	car	t	0	2025-07-04 14:21:50.985393	2025-07-04 14:21:50.985393	#6366F1
53	default-org	Home Cleaning	Professional cleaning services for residential properties	home	t	0	2025-07-04 14:22:01.808153	2025-07-04 14:22:01.808153	#3B82F6
54	default-org	Garden & Landscaping	Garden maintenance and landscaping services	leaf	t	0	2025-07-04 14:22:01.808153	2025-07-04 14:22:01.808153	#10B981
55	default-org	Pool Maintenance	Swimming pool cleaning and maintenance	droplets	t	0	2025-07-04 14:22:01.808153	2025-07-04 14:22:01.808153	#06B6D4
56	default-org	Electrical Services	Electrical repairs and installations	zap	t	0	2025-07-04 14:22:01.808153	2025-07-04 14:22:01.808153	#F59E0B
57	default-org	Plumbing	Plumbing repairs and installations	wrench	t	0	2025-07-04 14:22:01.808153	2025-07-04 14:22:01.808153	#8B5CF6
58	default-org	AC & HVAC	Air conditioning and heating services	wind	t	0	2025-07-04 14:22:01.808153	2025-07-04 14:22:01.808153	#EF4444
59	default-org	Pest Control	Professional pest control services	bug	t	0	2025-07-04 14:22:01.808153	2025-07-04 14:22:01.808153	#F97316
60	default-org	Transportation	Transportation and taxi services	car	t	0	2025-07-04 14:22:01.808153	2025-07-04 14:22:01.808153	#6366F1
61	default-org	Home Cleaning	Professional cleaning services for residential properties	home	t	0	2025-07-04 14:22:11.315997	2025-07-04 14:22:11.315997	#3B82F6
62	default-org	Garden & Landscaping	Garden maintenance and landscaping services	leaf	t	0	2025-07-04 14:22:11.315997	2025-07-04 14:22:11.315997	#10B981
63	default-org	Pool Maintenance	Swimming pool cleaning and maintenance	droplets	t	0	2025-07-04 14:22:11.315997	2025-07-04 14:22:11.315997	#06B6D4
64	default-org	Electrical Services	Electrical repairs and installations	zap	t	0	2025-07-04 14:22:11.315997	2025-07-04 14:22:11.315997	#F59E0B
65	default-org	Plumbing	Plumbing repairs and installations	wrench	t	0	2025-07-04 14:22:11.315997	2025-07-04 14:22:11.315997	#8B5CF6
66	default-org	AC & HVAC	Air conditioning and heating services	wind	t	0	2025-07-04 14:22:11.315997	2025-07-04 14:22:11.315997	#EF4444
67	default-org	Pest Control	Professional pest control services	bug	t	0	2025-07-04 14:22:11.315997	2025-07-04 14:22:11.315997	#F97316
68	default-org	Transportation	Transportation and taxi services	car	t	0	2025-07-04 14:22:11.315997	2025-07-04 14:22:11.315997	#6366F1
\.


--
-- Data for Name: service_reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_reviews (id, organization_id, service_id, booking_id, vendor_id, rating, title, review, reviewer_type, reviewer_name, is_anonymous, quality_rating, timeliness_rating, value_rating, communication_rating, is_approved, is_public, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_vendor_analytics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_vendor_analytics (id, organization_id, vendor_id, period_start, period_end, total_bookings, completed_bookings, cancelled_bookings, total_revenue, average_rating, response_time_hours, completion_rate, repeat_customer_rate, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_vendors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_vendors (id, organization_id, name, description, logo, vendor_type, contact_person, phone, email, address, website, business_license, tax_id, bank_details, rating, review_count, response_time_hours, commission_rate, is_active, is_verified, available_days, working_hours, payment_terms, delivery_time, service_area, specializations, certifications, tags, notes, created_by, created_at, updated_at, preferred_payment_method) FROM stdin;
6	default-org	Test Vendor	\N	\N	external	\N	\N	\N	\N	\N	\N	\N	\N	5.00	0	24	0.00	t	f	\N	\N	net_30	\N	\N	\N	\N	\N	\N	demo-admin	2025-07-04 14:22:17.540299	2025-07-04 14:22:17.540299	bank_transfer
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire, organization_id) FROM stdin;
Qj3JrdELQaP8kk7nhjTvPcS2lMcBbuak	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-01T11:52:28.501Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "demo-staff"}	2025-08-01 11:52:30	\N
oyNMu8ouTRCepMo33gqR6X768gQOhlhy	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-01T09:47:41.475Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "demo-admin"}	2025-08-01 09:47:44	\N
iqeybCMUJH5TwTH-yC3U2YZHdp2moYSD	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-01T09:47:49.639Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "demo-admin"}	2025-08-01 09:47:50	\N
zHkpMA-czOvm0LWxAValP0oWxnm8_pzK	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-31T15:52:15.583Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "demo-agent"}	2025-07-31 15:52:16	\N
82g5ntC1EHP9dfo6g0Qqkpb1ntnJK_qa	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-02T09:18:35.534Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "demo-admin"}	2025-08-02 10:10:32	\N
efdh_iYSNWPDvT9RnFzDqUNhz1kHuN6I	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-01T09:44:49.494Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "demo-admin"}	2025-08-01 09:44:51	\N
vrRv7LGM62MAj0BHGnXSJdIUsONIcUXm	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-01T09:45:29.769Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "demo-admin"}	2025-08-01 09:45:31	\N
j_RJLJNZTaJmefbz9xgWDdxZFY1zUV9B	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-28T07:45:02.852Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "demo-admin"}	2025-07-28 07:45:13	\N
HQNyr8e8IOPhT_AI6tmXWr9DJlY44oKC	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-01T11:57:26.656Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "demo-referral"}	2025-08-02 17:26:57	\N
7QQP51Ouw9LLLI43o_C3lc9sCfqx4hJA	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-01T09:46:19.344Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "demo-admin"}	2025-08-01 09:46:22	\N
rjPS62QyzrnyuDTkDnhLPnEkwm32Jvd6	{"cookie": {"path": "/", "secure": false, "expires": "2025-08-01T12:25:48.938Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "demo-admin"}	2025-08-02 17:39:30	\N
\.


--
-- Data for Name: shared_cost_splits; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shared_cost_splits (id, shared_cost_id, property_id, owner_id, split_amount) FROM stdin;
17	\N	1	demo-owner	5000.00
18	\N	3	demo-owner-2	6000.00
19	\N	17	demo-owner-3	4000.00
20	\N	1	demo-owner	1200.00
21	\N	3	demo-owner-2	1300.00
22	\N	17	demo-owner-3	1000.00
23	\N	1	demo-owner	4000.00
24	\N	3	demo-owner-2	4000.00
\.


--
-- Data for Name: shared_costs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shared_costs (id, organization_id, building_id, description, total_amount, cost_type, period_start, period_end, created_at) FROM stdin;
\.


--
-- Data for Name: staff_salaries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff_salaries (id, organization_id, user_id, monthly_salary, currency, bonus_structure, commission_rate, is_active, effective_from, effective_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff_skills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff_skills (id, staff_id, skill_name, certification_url, expiry_date, created_at) FROM stdin;
1	demo-staff	Pool Maintenance	https://example.com/cert/pool-maintenance.pdf	2025-12-31	2025-07-26 09:25:29.841859
2	demo-staff	HVAC Repair	https://example.com/cert/hvac-repair.pdf	2025-06-15	2025-07-26 09:25:29.841859
3	demo-staff	Electrical Work	\N	2024-12-01	2025-07-26 09:25:29.841859
4	demo-owner	Property Management	https://example.com/cert/property-mgmt.pdf	2026-03-20	2025-07-26 09:25:29.841859
5	demo-pm	First Aid Certified	https://example.com/cert/first-aid.pdf	2025-08-10	2025-07-26 09:25:29.841859
\.


--
-- Data for Name: staff_workload_stats; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff_workload_stats (id, staff_id, week_start, tasks_assigned, hours_logged, created_at) FROM stdin;
16	staff-1	2025-01-20	8	22.50	2025-07-26 10:06:27.638677
17	staff-2	2025-01-20	12	35.25	2025-07-26 10:06:27.638677
18	staff-3	2025-01-20	6	18.75	2025-07-26 10:06:27.638677
19	staff-4	2025-01-20	9	26.00	2025-07-26 10:06:27.638677
20	staff-1	2025-01-13	10	28.00	2025-07-26 10:06:27.638677
21	staff-2	2025-01-13	14	42.50	2025-07-26 10:06:27.638677
22	staff-3	2025-01-13	7	21.25	2025-07-26 10:06:27.638677
23	staff-4	2025-01-13	11	32.75	2025-07-26 10:06:27.638677
24	staff-1	2025-01-06	9	25.75	2025-07-26 10:06:27.638677
25	staff-2	2025-01-06	11	31.50	2025-07-26 10:06:27.638677
26	staff-3	2025-01-06	8	24.00	2025-07-26 10:06:27.638677
27	staff-4	2025-01-06	7	20.25	2025-07-26 10:06:27.638677
28	staff-1	2024-12-30	6	18.50	2025-07-26 10:06:27.638677
29	staff-2	2024-12-30	9	26.25	2025-07-26 10:06:27.638677
30	staff-3	2024-12-30	5	15.75	2025-07-26 10:06:27.638677
31	staff-4	2024-12-30	8	23.00	2025-07-26 10:06:27.638677
32	staff-1	2024-12-23	7	20.00	2025-07-26 10:06:27.638677
33	staff-2	2024-12-23	10	29.50	2025-07-26 10:06:27.638677
34	staff-3	2024-12-23	4	12.25	2025-07-26 10:06:27.638677
35	staff-4	2024-12-23	6	17.75	2025-07-26 10:06:27.638677
36	staff-1	2024-12-16	11	31.25	2025-07-26 10:06:27.638677
37	staff-2	2024-12-16	13	38.50	2025-07-26 10:06:27.638677
38	staff-3	2024-12-16	9	26.75	2025-07-26 10:06:27.638677
39	staff-4	2024-12-16	10	29.00	2025-07-26 10:06:27.638677
\.


--
-- Data for Name: supply_orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.supply_orders (id, vendor_id, property_id, item_name, quantity, cost_total, status, created_at) FROM stdin;
1	1	14	Premium Bath Towels (Set of 12)	5	3500.00	delivered	2025-07-26 09:34:05.575457
2	2	15	Egyptian Cotton Bed Sheets - King Size	8	6400.00	ordered	2025-07-26 09:34:05.575457
3	3	10	AC Filter Replacement Kit	12	2800.00	pending	2025-07-26 09:34:05.575457
4	4	3	Welcome Fruit Basket - Deluxe	15	4500.00	delivered	2025-07-26 09:34:05.575457
5	5	14	Pool Chemical Testing Kit	3	1800.00	ordered	2025-07-26 09:34:05.575457
6	1	15	Luxury Bathroom Amenities Set	20	8000.00	pending	2025-07-26 09:34:05.575457
7	2	10	Pool Towels - Quick Dry	25	5200.00	delivered	2025-07-26 09:34:05.575457
8	3	3	Garden Maintenance Tools	1	2200.00	ordered	2025-07-26 09:34:05.575457
\.


--
-- Data for Name: sustainability_metrics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sustainability_metrics (id, property_id, period_start, period_end, water_usage, electricity_usage, carbon_score, created_at) FROM stdin;
1	14	2024-12-01	2024-12-31	142.50	1150.25	3.25	2025-07-26 09:42:36.553477
2	2	2024-12-01	2024-12-31	168.30	1380.75	4.15	2025-07-26 09:42:36.553477
3	10	2024-12-01	2024-12-31	98.60	890.40	2.85	2025-07-26 09:42:36.553477
4	3	2024-12-01	2024-12-31	195.20	1650.85	5.40	2025-07-26 09:42:36.553477
5	14	2024-11-01	2024-11-30	125.80	980.60	2.95	2025-07-26 09:42:36.553477
6	2	2024-11-01	2024-11-30	155.45	1205.30	3.75	2025-07-26 09:42:36.553477
7	10	2024-11-01	2024-11-30	87.25	745.90	2.40	2025-07-26 09:42:36.553477
8	3	2024-11-01	2024-11-30	210.75	1590.25	5.85	2025-07-26 09:42:36.553477
9	14	2024-10-01	2024-10-31	158.90	1320.45	3.95	2025-07-26 09:42:36.553477
10	2	2024-10-01	2024-10-31	180.25	1450.80	4.65	2025-07-26 09:42:36.553477
11	10	2024-10-01	2024-10-31	105.40	825.75	2.75	2025-07-26 09:42:36.553477
12	3	2024-10-01	2024-10-31	225.60	1785.90	6.20	2025-07-26 09:42:36.553477
\.


--
-- Data for Name: task_ai_scan_results; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.task_ai_scan_results (id, task_id, photo_url, ai_findings, confidence_score, flagged, created_at) FROM stdin;
1	1	https://example.com/photos/pool-cleaning-1.jpg	{"areas_missed": [], "quality_rating": "excellent", "defects_detected": [], "cleanliness_score": 92.5}	0.92	f	2025-07-26 08:27:37.486587
2	1	https://example.com/photos/maintenance-ac-1.jpg	{"work_quality": "professional", "tools_visible": ["wrench", "screwdriver"], "safety_concerns": [], "completion_status": "completed"}	0.88	f	2025-07-26 08:27:37.486587
3	2	https://example.com/photos/garden-trim-1.jpg	{"plant_health": "good", "waste_removal": "incomplete", "trimming_quality": "uneven", "watering_completed": false}	0.74	t	2025-07-26 08:27:37.486587
\.


--
-- Data for Name: task_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.task_history (id, organization_id, task_id, property_id, action, previous_status, new_status, performed_by, notes, evidence_photos, issues_found, "timestamp") FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tasks (id, title, description, type, status, priority, property_id, assigned_to, created_by, due_date, completed_at, estimated_cost, actual_cost, created_at, updated_at, department, is_recurring, recurring_type, recurring_interval, next_due_date, parent_task_id, organization_id, completion_notes, evidence_photos, issues_found, skip_reason, reschedule_reason, rescheduled_date, auto_assigned, ai_confidence) FROM stdin;
409	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:26:49.544369	2025-07-26 09:26:49.544369	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
3	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	2	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 07:53:44.689652	2025-07-24 07:53:44.689652	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
410	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:26:49.544369	2025-07-26 09:26:49.544369	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
5	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	4	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 07:53:44.689652	2025-07-24 07:53:44.689652	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
6	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	5	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 07:53:44.689652	2025-07-24 07:53:44.689652	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
411	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:26:49.544369	2025-07-26 09:26:49.544369	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
412	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:26:49.544369	2025-07-26 09:26:49.544369	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
9	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	2	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 15:47:58.498639	2025-07-24 15:47:58.498639	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
413	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:26:49.544369	2025-07-26 09:26:49.544369	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
11	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	4	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 15:47:58.498639	2025-07-24 15:47:58.498639	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
12	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	5	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 15:47:58.498639	2025-07-24 15:47:58.498639	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
414	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:26:49.544369	2025-07-26 09:26:49.544369	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
548	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:40:30.436426	2025-07-26 10:40:30.436426	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
15	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	2	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 15:48:19.597519	2025-07-24 15:48:19.597519	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
549	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:40:30.436426	2025-07-26 10:40:30.436426	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
17	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	4	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 15:48:19.597519	2025-07-24 15:48:19.597519	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
18	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	5	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 15:48:19.597519	2025-07-24 15:48:19.597519	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
550	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:40:30.436426	2025-07-26 10:40:30.436426	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
551	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:40:30.436426	2025-07-26 10:40:30.436426	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
21	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	2	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 15:48:38.423275	2025-07-24 15:48:38.423275	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
552	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:40:30.436426	2025-07-26 10:40:30.436426	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
23	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	4	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 15:48:38.423275	2025-07-24 15:48:38.423275	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
24	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	5	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 15:48:38.423275	2025-07-24 15:48:38.423275	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
583	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 11:01:44.489362	2025-07-26 11:01:44.489362	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
584	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 11:01:44.489362	2025-07-26 11:01:44.489362	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
27	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	2	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 15:49:42.995176	2025-07-24 15:49:42.995176	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
585	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 11:01:44.489362	2025-07-26 11:01:44.489362	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
29	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	4	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 15:49:42.995176	2025-07-24 15:49:42.995176	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
30	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	5	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 15:49:42.995176	2025-07-24 15:49:42.995176	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
586	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 11:01:44.489362	2025-07-26 11:01:44.489362	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
587	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 11:01:44.489362	2025-07-26 11:01:44.489362	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
33	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	2	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 15:50:04.75853	2025-07-24 15:50:04.75853	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
588	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 11:01:44.489362	2025-07-26 11:01:44.489362	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
2	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	1	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 07:53:44.689652	2025-07-24 07:53:44.689652	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
35	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	4	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 15:50:04.75853	2025-07-24 15:50:04.75853	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
36	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	5	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 15:50:04.75853	2025-07-24 15:50:04.75853	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
415	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:29:09.090975	2025-07-26 09:29:09.090975	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
416	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:29:09.090975	2025-07-26 09:29:09.090975	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
39	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	2	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 15:53:43.055612	2025-07-24 15:53:43.055612	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
417	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:29:09.090975	2025-07-26 09:29:09.090975	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
41	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	4	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 15:53:43.055612	2025-07-24 15:53:43.055612	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
42	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	5	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 15:53:43.055612	2025-07-24 15:53:43.055612	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
418	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:29:09.090975	2025-07-26 09:29:09.090975	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
419	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:29:09.090975	2025-07-26 09:29:09.090975	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
45	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	2	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 15:54:07.016452	2025-07-24 15:54:07.016452	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
420	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:29:09.090975	2025-07-26 09:29:09.090975	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
47	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	4	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 15:54:07.016452	2025-07-24 15:54:07.016452	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
48	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	5	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 15:54:07.016452	2025-07-24 15:54:07.016452	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
427	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:32:26.743496	2025-07-26 09:32:26.743496	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
428	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:32:26.743496	2025-07-26 09:32:26.743496	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
51	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	2	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 16:02:46.000292	2025-07-24 16:02:46.000292	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
429	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:32:26.743496	2025-07-26 09:32:26.743496	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
53	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	4	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 16:02:46.000292	2025-07-24 16:02:46.000292	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
54	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	5	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 16:02:46.000292	2025-07-24 16:02:46.000292	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
430	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:32:26.743496	2025-07-26 09:32:26.743496	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
431	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:32:26.743496	2025-07-26 09:32:26.743496	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
57	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	2	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 16:06:37.424272	2025-07-24 16:06:37.424272	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
432	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:32:26.743496	2025-07-26 09:32:26.743496	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
59	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	4	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 16:06:37.424272	2025-07-24 16:06:37.424272	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
60	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	5	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 16:06:37.424272	2025-07-24 16:06:37.424272	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
445	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:40:26.774149	2025-07-26 09:40:26.774149	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
446	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:40:26.774149	2025-07-26 09:40:26.774149	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
63	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 16:07:28.687825	2025-07-24 16:07:28.687825	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
447	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:40:26.774149	2025-07-26 09:40:26.774149	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
65	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 16:07:28.687825	2025-07-24 16:07:28.687825	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
66	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 16:07:28.687825	2025-07-24 16:07:28.687825	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
448	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:40:26.774149	2025-07-26 09:40:26.774149	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
449	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:40:26.774149	2025-07-26 09:40:26.774149	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
69	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 17:51:06.874009	2025-07-24 17:51:06.874009	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
421	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:29:27.177133	2025-07-26 09:29:27.177133	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
71	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 17:51:06.874009	2025-07-24 17:51:06.874009	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
72	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 17:51:06.874009	2025-07-24 17:51:06.874009	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
422	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:29:27.177133	2025-07-26 09:29:27.177133	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
423	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:29:27.177133	2025-07-26 09:29:27.177133	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
75	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 17:52:29.141915	2025-07-24 17:52:29.141915	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
424	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:29:27.177133	2025-07-26 09:29:27.177133	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
77	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 17:52:29.141915	2025-07-24 17:52:29.141915	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
78	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 17:52:29.141915	2025-07-24 17:52:29.141915	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
425	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:29:27.177133	2025-07-26 09:29:27.177133	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
426	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:29:27.177133	2025-07-26 09:29:27.177133	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
81	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 17:57:11.386529	2025-07-24 17:57:11.386529	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
433	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:34:44.541848	2025-07-26 09:34:44.541848	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
83	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 17:57:11.386529	2025-07-24 17:57:11.386529	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
84	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 17:57:11.386529	2025-07-24 17:57:11.386529	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
434	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:34:44.541848	2025-07-26 09:34:44.541848	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
435	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:34:44.541848	2025-07-26 09:34:44.541848	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
87	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 18:18:51.259011	2025-07-24 18:18:51.259011	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
436	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:34:44.541848	2025-07-26 09:34:44.541848	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
89	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 18:18:51.259011	2025-07-24 18:18:51.259011	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
90	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 18:18:51.259011	2025-07-24 18:18:51.259011	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
437	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:34:44.541848	2025-07-26 09:34:44.541848	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
438	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:34:44.541848	2025-07-26 09:34:44.541848	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
93	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-24 18:22:30.391872	2025-07-24 18:22:30.391872	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
450	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:40:26.774149	2025-07-26 09:40:26.774149	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
95	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-24 18:22:30.391872	2025-07-24 18:22:30.391872	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
96	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-24 18:22:30.391872	2025-07-24 18:22:30.391872	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
451	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:43:42.946765	2025-07-26 09:43:42.946765	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
452	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:43:42.946765	2025-07-26 09:43:42.946765	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
99	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 03:47:34.939762	2025-07-25 03:47:34.939762	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
453	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:43:42.946765	2025-07-26 09:43:42.946765	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
101	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 03:47:34.939762	2025-07-25 03:47:34.939762	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
102	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 03:47:34.939762	2025-07-25 03:47:34.939762	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
439	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:37:36.30702	2025-07-26 09:37:36.30702	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
440	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:37:36.30702	2025-07-26 09:37:36.30702	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
105	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 04:12:49.720698	2025-07-25 04:12:49.720698	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
441	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:37:36.30702	2025-07-26 09:37:36.30702	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
107	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 04:12:49.720698	2025-07-25 04:12:49.720698	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
108	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 04:12:49.720698	2025-07-25 04:12:49.720698	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
442	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:37:36.30702	2025-07-26 09:37:36.30702	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
443	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:37:36.30702	2025-07-26 09:37:36.30702	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
111	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 04:22:57.486158	2025-07-25 04:22:57.486158	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
444	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:37:36.30702	2025-07-26 09:37:36.30702	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
113	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 04:22:57.486158	2025-07-25 04:22:57.486158	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
114	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 04:22:57.486158	2025-07-25 04:22:57.486158	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
454	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:43:42.946765	2025-07-26 09:43:42.946765	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
455	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:43:42.946765	2025-07-26 09:43:42.946765	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
117	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 04:39:29.038485	2025-07-25 04:39:29.038485	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
456	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:43:42.946765	2025-07-26 09:43:42.946765	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
119	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 04:39:29.038485	2025-07-25 04:39:29.038485	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
120	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 04:39:29.038485	2025-07-25 04:39:29.038485	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
457	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:47:03.907767	2025-07-26 09:47:03.907767	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
458	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:47:03.907767	2025-07-26 09:47:03.907767	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
123	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 04:42:30.11593	2025-07-25 04:42:30.11593	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
459	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:47:03.907767	2025-07-26 09:47:03.907767	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
125	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 04:42:30.11593	2025-07-25 04:42:30.11593	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
126	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 04:42:30.11593	2025-07-25 04:42:30.11593	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
460	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:47:03.907767	2025-07-26 09:47:03.907767	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
461	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:47:03.907767	2025-07-26 09:47:03.907767	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
129	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 05:30:34.221469	2025-07-25 05:30:34.221469	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
462	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:47:03.907767	2025-07-26 09:47:03.907767	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
131	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 05:30:34.221469	2025-07-25 05:30:34.221469	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
132	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 05:30:34.221469	2025-07-25 05:30:34.221469	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
463	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:52:17.822529	2025-07-26 09:52:17.822529	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
464	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:52:17.822529	2025-07-26 09:52:17.822529	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
135	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 05:31:56.671016	2025-07-25 05:31:56.671016	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
465	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:52:17.822529	2025-07-26 09:52:17.822529	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
137	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 05:31:56.671016	2025-07-25 05:31:56.671016	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
138	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 05:31:56.671016	2025-07-25 05:31:56.671016	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
466	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:52:17.822529	2025-07-26 09:52:17.822529	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
467	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:52:17.822529	2025-07-26 09:52:17.822529	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
141	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 05:33:30.735257	2025-07-25 05:33:30.735257	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
468	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:52:17.822529	2025-07-26 09:52:17.822529	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
143	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 05:33:30.735257	2025-07-25 05:33:30.735257	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
144	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 05:33:30.735257	2025-07-25 05:33:30.735257	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
553	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:41:16.095841	2025-07-26 10:41:16.095841	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
554	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:41:16.095841	2025-07-26 10:41:16.095841	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
147	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 05:35:37.290954	2025-07-25 05:35:37.290954	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
555	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:41:16.095841	2025-07-26 10:41:16.095841	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
149	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 05:35:37.290954	2025-07-25 05:35:37.290954	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
150	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 05:35:37.290954	2025-07-25 05:35:37.290954	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
556	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:41:16.095841	2025-07-26 10:41:16.095841	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
557	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:41:16.095841	2025-07-26 10:41:16.095841	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
153	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 05:55:12.911705	2025-07-25 05:55:12.911705	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
558	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:41:16.095841	2025-07-26 10:41:16.095841	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
155	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 05:55:12.911705	2025-07-25 05:55:12.911705	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
156	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 05:55:12.911705	2025-07-25 05:55:12.911705	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
592	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 11:04:26.416513	2025-07-26 11:04:26.416513	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
593	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 11:04:26.416513	2025-07-26 11:04:26.416513	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
159	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 05:55:46.147311	2025-07-25 05:55:46.147311	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
594	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 11:04:26.416513	2025-07-26 11:04:26.416513	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
161	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 05:55:46.147311	2025-07-25 05:55:46.147311	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
162	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 05:55:46.147311	2025-07-25 05:55:46.147311	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
595	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 16:27:28.077822	2025-07-26 16:27:28.077822	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
596	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 16:27:28.077822	2025-07-26 16:27:28.077822	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
165	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 05:59:08.535442	2025-07-25 05:59:08.535442	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
597	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 16:27:28.077822	2025-07-26 16:27:28.077822	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
167	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 05:59:08.535442	2025-07-25 05:59:08.535442	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
168	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 05:59:08.535442	2025-07-25 05:59:08.535442	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
598	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 16:27:28.077822	2025-07-26 16:27:28.077822	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
599	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 16:27:28.077822	2025-07-26 16:27:28.077822	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
171	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 06:08:22.154954	2025-07-25 06:08:22.154954	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
469	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:53:48.741779	2025-07-26 09:53:48.741779	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
173	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 06:08:22.154954	2025-07-25 06:08:22.154954	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
174	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 06:08:22.154954	2025-07-25 06:08:22.154954	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
470	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:53:48.741779	2025-07-26 09:53:48.741779	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
471	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:53:48.741779	2025-07-26 09:53:48.741779	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
177	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 08:57:07.629415	2025-07-25 08:57:07.629415	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
472	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:53:48.741779	2025-07-26 09:53:48.741779	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
179	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 08:57:07.629415	2025-07-25 08:57:07.629415	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
180	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 08:57:07.629415	2025-07-25 08:57:07.629415	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
473	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:53:48.741779	2025-07-26 09:53:48.741779	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
474	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:53:48.741779	2025-07-26 09:53:48.741779	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
183	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 09:07:59.401434	2025-07-25 09:07:59.401434	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
600	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 16:27:28.077822	2025-07-26 16:27:28.077822	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
185	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 09:07:59.401434	2025-07-25 09:07:59.401434	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
186	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 09:07:59.401434	2025-07-25 09:07:59.401434	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
601	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 16:34:15.464188	2025-07-26 16:34:15.464188	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
602	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 16:34:15.464188	2025-07-26 16:34:15.464188	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
189	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 09:09:33.652813	2025-07-25 09:09:33.652813	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
603	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 16:34:15.464188	2025-07-26 16:34:15.464188	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
191	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 09:09:33.652813	2025-07-25 09:09:33.652813	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
192	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 09:09:33.652813	2025-07-25 09:09:33.652813	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
604	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 16:34:15.464188	2025-07-26 16:34:15.464188	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
605	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 16:34:15.464188	2025-07-26 16:34:15.464188	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
195	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 09:12:07.33717	2025-07-25 09:12:07.33717	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
606	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 16:34:15.464188	2025-07-26 16:34:15.464188	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
197	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 09:12:07.33717	2025-07-25 09:12:07.33717	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
198	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 09:12:07.33717	2025-07-25 09:12:07.33717	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
607	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:03:14.923082	2025-07-26 17:03:14.923082	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
608	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:03:14.923082	2025-07-26 17:03:14.923082	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
201	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 09:21:20.417501	2025-07-25 09:21:20.417501	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
609	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:03:14.923082	2025-07-26 17:03:14.923082	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
203	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 09:21:20.417501	2025-07-25 09:21:20.417501	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
204	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 09:21:20.417501	2025-07-25 09:21:20.417501	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
475	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:59:17.619634	2025-07-26 09:59:17.619634	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
476	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:59:17.619634	2025-07-26 09:59:17.619634	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
207	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 09:23:30.391746	2025-07-25 09:23:30.391746	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
477	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:59:17.619634	2025-07-26 09:59:17.619634	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
209	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 09:23:30.391746	2025-07-25 09:23:30.391746	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
210	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 09:23:30.391746	2025-07-25 09:23:30.391746	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
478	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:59:17.619634	2025-07-26 09:59:17.619634	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
479	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:59:17.619634	2025-07-26 09:59:17.619634	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
213	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 09:36:27.348129	2025-07-25 09:36:27.348129	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
480	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:59:17.619634	2025-07-26 09:59:17.619634	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
215	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 09:36:27.348129	2025-07-25 09:36:27.348129	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
216	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 09:36:27.348129	2025-07-25 09:36:27.348129	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
481	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:04:45.144286	2025-07-26 10:04:45.144286	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
482	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:04:45.144286	2025-07-26 10:04:45.144286	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
219	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 09:39:53.676972	2025-07-25 09:39:53.676972	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
483	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:04:45.144286	2025-07-26 10:04:45.144286	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
221	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 09:39:53.676972	2025-07-25 09:39:53.676972	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
222	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 09:39:53.676972	2025-07-25 09:39:53.676972	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
484	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:04:45.144286	2025-07-26 10:04:45.144286	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
485	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:04:45.144286	2025-07-26 10:04:45.144286	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
225	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 09:43:47.456221	2025-07-25 09:43:47.456221	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
486	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:04:45.144286	2025-07-26 10:04:45.144286	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
227	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 09:43:47.456221	2025-07-25 09:43:47.456221	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
228	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 09:43:47.456221	2025-07-25 09:43:47.456221	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
493	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:11:15.446131	2025-07-26 10:11:15.446131	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
494	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:11:15.446131	2025-07-26 10:11:15.446131	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
231	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 09:46:13.678655	2025-07-25 09:46:13.678655	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
495	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:11:15.446131	2025-07-26 10:11:15.446131	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
233	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 09:46:13.678655	2025-07-25 09:46:13.678655	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
234	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 09:46:13.678655	2025-07-25 09:46:13.678655	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
496	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:11:15.446131	2025-07-26 10:11:15.446131	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
497	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:11:15.446131	2025-07-26 10:11:15.446131	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
237	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 11:52:37.056985	2025-07-25 11:52:37.056985	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
498	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:11:15.446131	2025-07-26 10:11:15.446131	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
239	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 11:52:37.056985	2025-07-25 11:52:37.056985	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
240	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 11:52:37.056985	2025-07-25 11:52:37.056985	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
487	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:07:26.182352	2025-07-26 10:07:26.182352	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
488	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:07:26.182352	2025-07-26 10:07:26.182352	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
243	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 11:54:01.434935	2025-07-25 11:54:01.434935	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
489	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:07:26.182352	2025-07-26 10:07:26.182352	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
245	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 11:54:01.434935	2025-07-25 11:54:01.434935	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
246	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 11:54:01.434935	2025-07-25 11:54:01.434935	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
490	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:07:26.182352	2025-07-26 10:07:26.182352	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
491	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:07:26.182352	2025-07-26 10:07:26.182352	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
249	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 12:18:47.26356	2025-07-25 12:18:47.26356	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
492	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:07:26.182352	2025-07-26 10:07:26.182352	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
251	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 12:18:47.26356	2025-07-25 12:18:47.26356	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
252	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 12:18:47.26356	2025-07-25 12:18:47.26356	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
499	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:19:20.779438	2025-07-26 10:19:20.779438	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
500	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:19:20.779438	2025-07-26 10:19:20.779438	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
255	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 12:22:24.968822	2025-07-25 12:22:24.968822	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
501	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:19:20.779438	2025-07-26 10:19:20.779438	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
257	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 12:22:24.968822	2025-07-25 12:22:24.968822	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
258	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 12:22:24.968822	2025-07-25 12:22:24.968822	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
502	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:19:20.779438	2025-07-26 10:19:20.779438	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
503	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:19:20.779438	2025-07-26 10:19:20.779438	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
261	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-25 12:25:08.46486	2025-07-25 12:25:08.46486	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
504	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:19:20.779438	2025-07-26 10:19:20.779438	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
263	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-25 12:25:08.46486	2025-07-25 12:25:08.46486	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
264	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-25 12:25:08.46486	2025-07-25 12:25:08.46486	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
511	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:28:33.295832	2025-07-26 10:28:33.295832	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
512	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:28:33.295832	2025-07-26 10:28:33.295832	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
267	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 07:42:41.136813	2025-07-26 07:42:41.136813	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
513	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:28:33.295832	2025-07-26 10:28:33.295832	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
269	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 07:42:41.136813	2025-07-26 07:42:41.136813	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
270	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 07:42:41.136813	2025-07-26 07:42:41.136813	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
514	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:28:33.295832	2025-07-26 10:28:33.295832	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
515	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:28:33.295832	2025-07-26 10:28:33.295832	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
273	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:07:27.119896	2025-07-26 08:07:27.119896	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
505	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:19:48.910298	2025-07-26 10:19:48.910298	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
275	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:07:27.119896	2025-07-26 08:07:27.119896	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
276	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:07:27.119896	2025-07-26 08:07:27.119896	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
506	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:19:48.910298	2025-07-26 10:19:48.910298	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
507	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:19:48.910298	2025-07-26 10:19:48.910298	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
279	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:09:22.095528	2025-07-26 08:09:22.095528	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
508	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:19:48.910298	2025-07-26 10:19:48.910298	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
281	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:09:22.095528	2025-07-26 08:09:22.095528	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
282	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:09:22.095528	2025-07-26 08:09:22.095528	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
509	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:19:48.910298	2025-07-26 10:19:48.910298	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
510	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:19:48.910298	2025-07-26 10:19:48.910298	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
285	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:14:59.550812	2025-07-26 08:14:59.550812	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
516	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:28:33.295832	2025-07-26 10:28:33.295832	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
287	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:14:59.550812	2025-07-26 08:14:59.550812	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
288	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:14:59.550812	2025-07-26 08:14:59.550812	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
517	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:30:38.424769	2025-07-26 10:30:38.424769	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
518	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:30:38.424769	2025-07-26 10:30:38.424769	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
291	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:19:56.940256	2025-07-26 08:19:56.940256	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
519	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:30:38.424769	2025-07-26 10:30:38.424769	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
293	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:19:56.940256	2025-07-26 08:19:56.940256	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
294	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:19:56.940256	2025-07-26 08:19:56.940256	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
520	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:30:38.424769	2025-07-26 10:30:38.424769	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
521	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:30:38.424769	2025-07-26 10:30:38.424769	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
297	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:23:02.132852	2025-07-26 08:23:02.132852	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
522	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:30:38.424769	2025-07-26 10:30:38.424769	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
299	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:23:02.132852	2025-07-26 08:23:02.132852	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
300	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:23:02.132852	2025-07-26 08:23:02.132852	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
529	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:37:53.144655	2025-07-26 10:37:53.144655	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
530	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:37:53.144655	2025-07-26 10:37:53.144655	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
303	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:25:44.921578	2025-07-26 08:25:44.921578	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
531	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:37:53.144655	2025-07-26 10:37:53.144655	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
305	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:25:44.921578	2025-07-26 08:25:44.921578	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
306	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:25:44.921578	2025-07-26 08:25:44.921578	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
523	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:31:18.928649	2025-07-26 10:31:18.928649	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
524	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:31:18.928649	2025-07-26 10:31:18.928649	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
309	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:27:57.831877	2025-07-26 08:27:57.831877	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
525	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:31:18.928649	2025-07-26 10:31:18.928649	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
311	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:27:57.831877	2025-07-26 08:27:57.831877	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
312	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:27:57.831877	2025-07-26 08:27:57.831877	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
526	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:31:18.928649	2025-07-26 10:31:18.928649	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
527	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:31:18.928649	2025-07-26 10:31:18.928649	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
315	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:30:22.207333	2025-07-26 08:30:22.207333	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
528	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:31:18.928649	2025-07-26 10:31:18.928649	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
317	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:30:22.207333	2025-07-26 08:30:22.207333	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
318	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:30:22.207333	2025-07-26 08:30:22.207333	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
532	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:37:53.144655	2025-07-26 10:37:53.144655	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
533	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:37:53.144655	2025-07-26 10:37:53.144655	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
321	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:33:24.06384	2025-07-26 08:33:24.06384	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
534	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:37:53.144655	2025-07-26 10:37:53.144655	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
323	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:33:24.06384	2025-07-26 08:33:24.06384	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
324	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:33:24.06384	2025-07-26 08:33:24.06384	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
559	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:48:11.91544	2025-07-26 10:48:11.91544	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
560	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:48:11.91544	2025-07-26 10:48:11.91544	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
327	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:36:16.53161	2025-07-26 08:36:16.53161	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
561	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:48:11.91544	2025-07-26 10:48:11.91544	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
329	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:36:16.53161	2025-07-26 08:36:16.53161	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
330	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:36:16.53161	2025-07-26 08:36:16.53161	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
562	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:48:11.91544	2025-07-26 10:48:11.91544	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
563	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:48:11.91544	2025-07-26 10:48:11.91544	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
333	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:39:23.35422	2025-07-26 08:39:23.35422	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
564	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:48:11.91544	2025-07-26 10:48:11.91544	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
335	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:39:23.35422	2025-07-26 08:39:23.35422	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
336	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:39:23.35422	2025-07-26 08:39:23.35422	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
565	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:54:36.067025	2025-07-26 10:54:36.067025	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
566	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:54:36.067025	2025-07-26 10:54:36.067025	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
339	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 08:43:47.615523	2025-07-26 08:43:47.615523	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
567	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:54:36.067025	2025-07-26 10:54:36.067025	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
341	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 08:43:47.615523	2025-07-26 08:43:47.615523	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
342	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 08:43:47.615523	2025-07-26 08:43:47.615523	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
535	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:38:52.627679	2025-07-26 10:38:52.627679	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
536	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:38:52.627679	2025-07-26 10:38:52.627679	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
345	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:00:07.590101	2025-07-26 09:00:07.590101	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
537	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:38:52.627679	2025-07-26 10:38:52.627679	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
347	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:00:07.590101	2025-07-26 09:00:07.590101	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
348	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:00:07.590101	2025-07-26 09:00:07.590101	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
538	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:38:52.627679	2025-07-26 10:38:52.627679	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
539	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:38:52.627679	2025-07-26 10:38:52.627679	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
351	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:00:59.086747	2025-07-26 09:00:59.086747	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
540	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:38:52.627679	2025-07-26 10:38:52.627679	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
353	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:00:59.086747	2025-07-26 09:00:59.086747	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
354	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:00:59.086747	2025-07-26 09:00:59.086747	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
568	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:54:36.067025	2025-07-26 10:54:36.067025	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
569	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:54:36.067025	2025-07-26 10:54:36.067025	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
357	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:03:51.153473	2025-07-26 09:03:51.153473	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
570	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:54:36.067025	2025-07-26 10:54:36.067025	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
359	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:03:51.153473	2025-07-26 09:03:51.153473	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
360	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:03:51.153473	2025-07-26 09:03:51.153473	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
571	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:59:35.191695	2025-07-26 10:59:35.191695	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
572	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:59:35.191695	2025-07-26 10:59:35.191695	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
363	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:07:51.154547	2025-07-26 09:07:51.154547	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
573	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:59:35.191695	2025-07-26 10:59:35.191695	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
365	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:07:51.154547	2025-07-26 09:07:51.154547	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
366	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:07:51.154547	2025-07-26 09:07:51.154547	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
574	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:59:35.191695	2025-07-26 10:59:35.191695	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
575	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:59:35.191695	2025-07-26 10:59:35.191695	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
369	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:11:09.323647	2025-07-26 09:11:09.323647	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
576	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:59:35.191695	2025-07-26 10:59:35.191695	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
371	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:11:09.323647	2025-07-26 09:11:09.323647	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
372	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:11:09.323647	2025-07-26 09:11:09.323647	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
589	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 11:04:26.416513	2025-07-26 11:04:26.416513	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
590	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 11:04:26.416513	2025-07-26 11:04:26.416513	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
375	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:15:12.468822	2025-07-26 09:15:12.468822	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
541	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:40:14.552077	2025-07-26 10:40:14.552077	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
377	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:15:12.468822	2025-07-26 09:15:12.468822	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
378	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:15:12.468822	2025-07-26 09:15:12.468822	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
542	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 10:40:14.552077	2025-07-26 10:40:14.552077	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
543	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 10:40:14.552077	2025-07-26 10:40:14.552077	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
381	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:17:28.200381	2025-07-26 09:17:28.200381	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
544	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 10:40:14.552077	2025-07-26 10:40:14.552077	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
383	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:17:28.200381	2025-07-26 09:17:28.200381	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
384	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:17:28.200381	2025-07-26 09:17:28.200381	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
545	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 10:40:14.552077	2025-07-26 10:40:14.552077	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
546	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 10:40:14.552077	2025-07-26 10:40:14.552077	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
387	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:18:50.543116	2025-07-26 09:18:50.543116	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
577	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 11:01:05.567815	2025-07-26 11:01:05.567815	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
389	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:18:50.543116	2025-07-26 09:18:50.543116	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
390	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:18:50.543116	2025-07-26 09:18:50.543116	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
578	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 11:01:05.567815	2025-07-26 11:01:05.567815	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
579	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 11:01:05.567815	2025-07-26 11:01:05.567815	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
393	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:22:20.756393	2025-07-26 09:22:20.756393	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
580	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 11:01:05.567815	2025-07-26 11:01:05.567815	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
395	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:22:20.756393	2025-07-26 09:22:20.756393	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
396	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:22:20.756393	2025-07-26 09:22:20.756393	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
1	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	1	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 07:53:44.689652	2025-07-24 07:53:44.689652	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.85
581	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 11:01:05.567815	2025-07-26 11:01:05.567815	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
582	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 11:01:05.567815	2025-07-26 11:01:05.567815	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
399	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:23:48.408912	2025-07-26 09:23:48.408912	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
591	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 11:04:26.416513	2025-07-26 11:04:26.416513	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
401	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:23:48.408912	2025-07-26 09:23:48.408912	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
402	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:23:48.408912	2025-07-26 09:23:48.408912	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
8	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	1	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 15:47:58.498639	2025-07-24 15:47:58.498639	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
14	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	1	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 15:48:19.597519	2025-07-24 15:48:19.597519	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
20	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	1	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 15:48:38.423275	2025-07-24 15:48:38.423275	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
26	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	1	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 15:49:42.995176	2025-07-24 15:49:42.995176	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
32	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	1	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 15:50:04.75853	2025-07-24 15:50:04.75853	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
38	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	1	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 15:53:43.055612	2025-07-24 15:53:43.055612	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
44	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	1	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 15:54:07.016452	2025-07-24 15:54:07.016452	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
50	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	1	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 16:02:46.000292	2025-07-24 16:02:46.000292	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
56	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	1	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 16:06:37.424272	2025-07-24 16:06:37.424272	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
62	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 16:07:28.687825	2025-07-24 16:07:28.687825	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
68	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 17:51:06.874009	2025-07-24 17:51:06.874009	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
74	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 17:52:29.141915	2025-07-24 17:52:29.141915	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
80	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 17:57:11.386529	2025-07-24 17:57:11.386529	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
86	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 18:18:51.259011	2025-07-24 18:18:51.259011	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
92	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-24 18:22:30.391872	2025-07-24 18:22:30.391872	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
98	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 03:47:34.939762	2025-07-25 03:47:34.939762	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
104	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 04:12:49.720698	2025-07-25 04:12:49.720698	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
110	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 04:22:57.486158	2025-07-25 04:22:57.486158	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
116	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 04:39:29.038485	2025-07-25 04:39:29.038485	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
122	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 04:42:30.11593	2025-07-25 04:42:30.11593	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
128	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 05:30:34.221469	2025-07-25 05:30:34.221469	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
134	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 05:31:56.671016	2025-07-25 05:31:56.671016	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
140	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 05:33:30.735257	2025-07-25 05:33:30.735257	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
146	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 05:35:37.290954	2025-07-25 05:35:37.290954	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
152	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 05:55:12.911705	2025-07-25 05:55:12.911705	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
158	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 05:55:46.147311	2025-07-25 05:55:46.147311	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
164	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 05:59:08.535442	2025-07-25 05:59:08.535442	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
170	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 06:08:22.154954	2025-07-25 06:08:22.154954	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
176	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 08:57:07.629415	2025-07-25 08:57:07.629415	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
182	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 09:07:59.401434	2025-07-25 09:07:59.401434	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
188	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 09:09:33.652813	2025-07-25 09:09:33.652813	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
194	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 09:12:07.33717	2025-07-25 09:12:07.33717	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
200	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 09:21:20.417501	2025-07-25 09:21:20.417501	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
206	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 09:23:30.391746	2025-07-25 09:23:30.391746	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
212	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 09:36:27.348129	2025-07-25 09:36:27.348129	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
218	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 09:39:53.676972	2025-07-25 09:39:53.676972	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
224	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 09:43:47.456221	2025-07-25 09:43:47.456221	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
230	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 09:46:13.678655	2025-07-25 09:46:13.678655	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
236	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 11:52:37.056985	2025-07-25 11:52:37.056985	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
242	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 11:54:01.434935	2025-07-25 11:54:01.434935	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
248	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 12:18:47.26356	2025-07-25 12:18:47.26356	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
254	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 12:22:24.968822	2025-07-25 12:22:24.968822	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
260	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-25 12:25:08.46486	2025-07-25 12:25:08.46486	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
266	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 07:42:41.136813	2025-07-26 07:42:41.136813	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
272	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:07:27.119896	2025-07-26 08:07:27.119896	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
278	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:09:22.095528	2025-07-26 08:09:22.095528	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
284	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:14:59.550812	2025-07-26 08:14:59.550812	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
290	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:19:56.940256	2025-07-26 08:19:56.940256	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
296	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:23:02.132852	2025-07-26 08:23:02.132852	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
302	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:25:44.921578	2025-07-26 08:25:44.921578	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
308	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:27:57.831877	2025-07-26 08:27:57.831877	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
314	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:30:22.207333	2025-07-26 08:30:22.207333	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
320	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:33:24.06384	2025-07-26 08:33:24.06384	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
326	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:36:16.53161	2025-07-26 08:36:16.53161	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
332	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:39:23.35422	2025-07-26 08:39:23.35422	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
338	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 08:43:47.615523	2025-07-26 08:43:47.615523	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
344	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:00:07.590101	2025-07-26 09:00:07.590101	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
350	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:00:59.086747	2025-07-26 09:00:59.086747	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
356	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:03:51.153473	2025-07-26 09:03:51.153473	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
362	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:07:51.154547	2025-07-26 09:07:51.154547	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
368	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:11:09.323647	2025-07-26 09:11:09.323647	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
374	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:15:12.468822	2025-07-26 09:15:12.468822	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
380	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:17:28.200381	2025-07-26 09:17:28.200381	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
386	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:18:50.543116	2025-07-26 09:18:50.543116	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
392	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:22:20.756393	2025-07-26 09:22:20.756393	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
398	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:23:48.408912	2025-07-26 09:23:48.408912	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.92
7	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	1	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 15:47:58.498639	2025-07-24 15:47:58.498639	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
13	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	1	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 15:48:19.597519	2025-07-24 15:48:19.597519	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
19	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	1	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 15:48:38.423275	2025-07-24 15:48:38.423275	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
25	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	1	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 15:49:42.995176	2025-07-24 15:49:42.995176	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
31	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	1	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 15:50:04.75853	2025-07-24 15:50:04.75853	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
37	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	1	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 15:53:43.055612	2025-07-24 15:53:43.055612	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
43	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	1	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 15:54:07.016452	2025-07-24 15:54:07.016452	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
49	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	1	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 16:02:46.000292	2025-07-24 16:02:46.000292	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
55	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	1	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 16:06:37.424272	2025-07-24 16:06:37.424272	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
61	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 16:07:28.687825	2025-07-24 16:07:28.687825	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
67	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 17:51:06.874009	2025-07-24 17:51:06.874009	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
73	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 17:52:29.141915	2025-07-24 17:52:29.141915	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
79	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 17:57:11.386529	2025-07-24 17:57:11.386529	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
85	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 18:18:51.259011	2025-07-24 18:18:51.259011	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
91	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-24 18:22:30.391872	2025-07-24 18:22:30.391872	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
97	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 03:47:34.939762	2025-07-25 03:47:34.939762	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
103	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 04:12:49.720698	2025-07-25 04:12:49.720698	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
109	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 04:22:57.486158	2025-07-25 04:22:57.486158	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
115	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 04:39:29.038485	2025-07-25 04:39:29.038485	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
121	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 04:42:30.11593	2025-07-25 04:42:30.11593	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
127	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 05:30:34.221469	2025-07-25 05:30:34.221469	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
133	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 05:31:56.671016	2025-07-25 05:31:56.671016	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
139	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 05:33:30.735257	2025-07-25 05:33:30.735257	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
145	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 05:35:37.290954	2025-07-25 05:35:37.290954	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
151	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 05:55:12.911705	2025-07-25 05:55:12.911705	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
157	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 05:55:46.147311	2025-07-25 05:55:46.147311	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
163	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 05:59:08.535442	2025-07-25 05:59:08.535442	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
169	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 06:08:22.154954	2025-07-25 06:08:22.154954	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
175	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 08:57:07.629415	2025-07-25 08:57:07.629415	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
181	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 09:07:59.401434	2025-07-25 09:07:59.401434	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
187	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 09:09:33.652813	2025-07-25 09:09:33.652813	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
193	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 09:12:07.33717	2025-07-25 09:12:07.33717	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
199	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 09:21:20.417501	2025-07-25 09:21:20.417501	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
205	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 09:23:30.391746	2025-07-25 09:23:30.391746	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
211	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 09:36:27.348129	2025-07-25 09:36:27.348129	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
217	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 09:39:53.676972	2025-07-25 09:39:53.676972	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
223	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 09:43:47.456221	2025-07-25 09:43:47.456221	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
229	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 09:46:13.678655	2025-07-25 09:46:13.678655	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
235	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 11:52:37.056985	2025-07-25 11:52:37.056985	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
241	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 11:54:01.434935	2025-07-25 11:54:01.434935	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
247	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 12:18:47.26356	2025-07-25 12:18:47.26356	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
253	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 12:22:24.968822	2025-07-25 12:22:24.968822	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
259	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-25 12:25:08.46486	2025-07-25 12:25:08.46486	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
265	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 07:42:41.136813	2025-07-26 07:42:41.136813	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
271	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:07:27.119896	2025-07-26 08:07:27.119896	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
277	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:09:22.095528	2025-07-26 08:09:22.095528	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
283	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:14:59.550812	2025-07-26 08:14:59.550812	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
289	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:19:56.940256	2025-07-26 08:19:56.940256	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
295	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:23:02.132852	2025-07-26 08:23:02.132852	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
301	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:25:44.921578	2025-07-26 08:25:44.921578	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
307	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:27:57.831877	2025-07-26 08:27:57.831877	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
313	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:30:22.207333	2025-07-26 08:30:22.207333	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
319	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:33:24.06384	2025-07-26 08:33:24.06384	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
325	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:36:16.53161	2025-07-26 08:36:16.53161	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
331	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:39:23.35422	2025-07-26 08:39:23.35422	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
337	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 08:43:47.615523	2025-07-26 08:43:47.615523	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
343	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:00:07.590101	2025-07-26 09:00:07.590101	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
349	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:00:59.086747	2025-07-26 09:00:59.086747	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
355	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:03:51.153473	2025-07-26 09:03:51.153473	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
361	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:07:51.154547	2025-07-26 09:07:51.154547	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
367	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:11:09.323647	2025-07-26 09:11:09.323647	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
373	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:15:12.468822	2025-07-26 09:15:12.468822	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
379	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:17:28.200381	2025-07-26 09:17:28.200381	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
385	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:18:50.543116	2025-07-26 09:18:50.543116	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
391	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:22:20.756393	2025-07-26 09:22:20.756393	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
397	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:23:48.408912	2025-07-26 09:23:48.408912	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	t	0.78
4	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	3	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 07:53:44.689652	2025-07-24 07:53:44.689652	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
10	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	3	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 15:47:58.498639	2025-07-24 15:47:58.498639	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
16	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	3	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 15:48:19.597519	2025-07-24 15:48:19.597519	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
22	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	3	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 15:48:38.423275	2025-07-24 15:48:38.423275	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
28	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	3	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 15:49:42.995176	2025-07-24 15:49:42.995176	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
34	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	3	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 15:50:04.75853	2025-07-24 15:50:04.75853	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
40	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	3	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 15:53:43.055612	2025-07-24 15:53:43.055612	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
46	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	3	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 15:54:07.016452	2025-07-24 15:54:07.016452	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
52	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	3	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 16:02:46.000292	2025-07-24 16:02:46.000292	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
58	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	3	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 16:06:37.424272	2025-07-24 16:06:37.424272	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
64	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 16:07:28.687825	2025-07-24 16:07:28.687825	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
70	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 17:51:06.874009	2025-07-24 17:51:06.874009	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
76	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 17:52:29.141915	2025-07-24 17:52:29.141915	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
82	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 17:57:11.386529	2025-07-24 17:57:11.386529	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
88	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 18:18:51.259011	2025-07-24 18:18:51.259011	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
94	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-24 18:22:30.391872	2025-07-24 18:22:30.391872	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
100	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 03:47:34.939762	2025-07-25 03:47:34.939762	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
106	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 04:12:49.720698	2025-07-25 04:12:49.720698	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
112	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 04:22:57.486158	2025-07-25 04:22:57.486158	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
118	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 04:39:29.038485	2025-07-25 04:39:29.038485	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
124	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 04:42:30.11593	2025-07-25 04:42:30.11593	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
130	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 05:30:34.221469	2025-07-25 05:30:34.221469	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
136	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 05:31:56.671016	2025-07-25 05:31:56.671016	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
142	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 05:33:30.735257	2025-07-25 05:33:30.735257	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
148	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 05:35:37.290954	2025-07-25 05:35:37.290954	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
154	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 05:55:12.911705	2025-07-25 05:55:12.911705	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
160	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 05:55:46.147311	2025-07-25 05:55:46.147311	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
166	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 05:59:08.535442	2025-07-25 05:59:08.535442	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
172	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 06:08:22.154954	2025-07-25 06:08:22.154954	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
178	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 08:57:07.629415	2025-07-25 08:57:07.629415	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
184	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 09:07:59.401434	2025-07-25 09:07:59.401434	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
190	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 09:09:33.652813	2025-07-25 09:09:33.652813	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
196	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 09:12:07.33717	2025-07-25 09:12:07.33717	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
202	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 09:21:20.417501	2025-07-25 09:21:20.417501	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
208	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 09:23:30.391746	2025-07-25 09:23:30.391746	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
214	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 09:36:27.348129	2025-07-25 09:36:27.348129	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
220	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 09:39:53.676972	2025-07-25 09:39:53.676972	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
226	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 09:43:47.456221	2025-07-25 09:43:47.456221	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
232	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 09:46:13.678655	2025-07-25 09:46:13.678655	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
238	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 11:52:37.056985	2025-07-25 11:52:37.056985	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
244	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 11:54:01.434935	2025-07-25 11:54:01.434935	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
250	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 12:18:47.26356	2025-07-25 12:18:47.26356	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
256	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 12:22:24.968822	2025-07-25 12:22:24.968822	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
262	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-25 12:25:08.46486	2025-07-25 12:25:08.46486	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
268	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 07:42:41.136813	2025-07-26 07:42:41.136813	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
274	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:07:27.119896	2025-07-26 08:07:27.119896	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
280	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:09:22.095528	2025-07-26 08:09:22.095528	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
286	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:14:59.550812	2025-07-26 08:14:59.550812	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
292	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:19:56.940256	2025-07-26 08:19:56.940256	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
298	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:23:02.132852	2025-07-26 08:23:02.132852	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
304	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:25:44.921578	2025-07-26 08:25:44.921578	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
310	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:27:57.831877	2025-07-26 08:27:57.831877	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
316	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:30:22.207333	2025-07-26 08:30:22.207333	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
322	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:33:24.06384	2025-07-26 08:33:24.06384	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
328	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:36:16.53161	2025-07-26 08:36:16.53161	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
334	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:39:23.35422	2025-07-26 08:39:23.35422	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
340	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 08:43:47.615523	2025-07-26 08:43:47.615523	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
346	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:00:07.590101	2025-07-26 09:00:07.590101	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
352	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:00:59.086747	2025-07-26 09:00:59.086747	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
358	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:03:51.153473	2025-07-26 09:03:51.153473	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
364	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:07:51.154547	2025-07-26 09:07:51.154547	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
370	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:11:09.323647	2025-07-26 09:11:09.323647	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
376	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:15:12.468822	2025-07-26 09:15:12.468822	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
382	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:17:28.200381	2025-07-26 09:17:28.200381	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
388	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:18:50.543116	2025-07-26 09:18:50.543116	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
394	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:22:20.756393	2025-07-26 09:22:20.756393	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
400	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:23:48.408912	2025-07-26 09:23:48.408912	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
403	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 09:24:18.343938	2025-07-26 09:24:18.343938	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
404	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 09:24:18.343938	2025-07-26 09:24:18.343938	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
405	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 09:24:18.343938	2025-07-26 09:24:18.343938	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
406	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 09:24:18.343938	2025-07-26 09:24:18.343938	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
407	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 09:24:18.343938	2025-07-26 09:24:18.343938	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
408	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 09:24:18.343938	2025-07-26 09:24:18.343938	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
547	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 10:40:30.436426	2025-07-26 10:40:30.436426	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
610	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:03:14.923082	2025-07-26 17:03:14.923082	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
611	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:03:14.923082	2025-07-26 17:03:14.923082	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
612	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:03:14.923082	2025-07-26 17:03:14.923082	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
613	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:05:04.03748	2025-07-26 17:05:04.03748	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
614	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:05:04.03748	2025-07-26 17:05:04.03748	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
615	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:05:04.03748	2025-07-26 17:05:04.03748	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
616	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:05:04.03748	2025-07-26 17:05:04.03748	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
617	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:05:04.03748	2025-07-26 17:05:04.03748	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
618	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:05:04.03748	2025-07-26 17:05:04.03748	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
619	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:06:29.602083	2025-07-26 17:06:29.602083	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
620	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:06:29.602083	2025-07-26 17:06:29.602083	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
621	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:06:29.602083	2025-07-26 17:06:29.602083	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
622	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:06:29.602083	2025-07-26 17:06:29.602083	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
623	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:06:29.602083	2025-07-26 17:06:29.602083	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
624	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:06:29.602083	2025-07-26 17:06:29.602083	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
625	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:07:09.807097	2025-07-26 17:07:09.807097	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
626	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:07:09.807097	2025-07-26 17:07:09.807097	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
627	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:07:09.807097	2025-07-26 17:07:09.807097	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
628	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:07:09.807097	2025-07-26 17:07:09.807097	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
629	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:07:09.807097	2025-07-26 17:07:09.807097	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
630	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:07:09.807097	2025-07-26 17:07:09.807097	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
631	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:08:36.984704	2025-07-26 17:08:36.984704	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
632	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:08:36.984704	2025-07-26 17:08:36.984704	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
633	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:08:36.984704	2025-07-26 17:08:36.984704	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
634	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:08:36.984704	2025-07-26 17:08:36.984704	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
635	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:08:36.984704	2025-07-26 17:08:36.984704	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
636	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:08:36.984704	2025-07-26 17:08:36.984704	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
637	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:11:04.725389	2025-07-26 17:11:04.725389	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
638	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:11:04.725389	2025-07-26 17:11:04.725389	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
639	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:11:04.725389	2025-07-26 17:11:04.725389	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
640	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:11:04.725389	2025-07-26 17:11:04.725389	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
641	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:11:04.725389	2025-07-26 17:11:04.725389	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
642	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:11:04.725389	2025-07-26 17:11:04.725389	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
643	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:12:30.702612	2025-07-26 17:12:30.702612	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
644	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:12:30.702612	2025-07-26 17:12:30.702612	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
645	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:12:30.702612	2025-07-26 17:12:30.702612	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
646	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:12:30.702612	2025-07-26 17:12:30.702612	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
647	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:12:30.702612	2025-07-26 17:12:30.702612	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
648	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:12:30.702612	2025-07-26 17:12:30.702612	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
649	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:13:44.10916	2025-07-26 17:13:44.10916	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
650	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:13:44.10916	2025-07-26 17:13:44.10916	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
651	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:13:44.10916	2025-07-26 17:13:44.10916	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
652	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:13:44.10916	2025-07-26 17:13:44.10916	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
653	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:13:44.10916	2025-07-26 17:13:44.10916	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
654	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:13:44.10916	2025-07-26 17:13:44.10916	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
655	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:15:22.078322	2025-07-26 17:15:22.078322	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
656	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:15:22.078322	2025-07-26 17:15:22.078322	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
657	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:15:22.078322	2025-07-26 17:15:22.078322	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
658	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:15:22.078322	2025-07-26 17:15:22.078322	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
659	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:15:22.078322	2025-07-26 17:15:22.078322	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
660	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:15:22.078322	2025-07-26 17:15:22.078322	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
661	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:19:40.583314	2025-07-26 17:19:40.583314	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
662	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:19:40.583314	2025-07-26 17:19:40.583314	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
663	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:19:40.583314	2025-07-26 17:19:40.583314	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
664	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:19:40.583314	2025-07-26 17:19:40.583314	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
665	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:19:40.583314	2025-07-26 17:19:40.583314	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
666	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:19:40.583314	2025-07-26 17:19:40.583314	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
667	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:22:14.131002	2025-07-26 17:22:14.131002	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
668	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:22:14.131002	2025-07-26 17:22:14.131002	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
669	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:22:14.131002	2025-07-26 17:22:14.131002	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
670	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:22:14.131002	2025-07-26 17:22:14.131002	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
671	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:22:14.131002	2025-07-26 17:22:14.131002	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
672	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:22:14.131002	2025-07-26 17:22:14.131002	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
673	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:23:33.901863	2025-07-26 17:23:33.901863	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
674	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:23:33.901863	2025-07-26 17:23:33.901863	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
675	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:23:33.901863	2025-07-26 17:23:33.901863	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
676	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:23:33.901863	2025-07-26 17:23:33.901863	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
677	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:23:33.901863	2025-07-26 17:23:33.901863	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
678	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:23:33.901863	2025-07-26 17:23:33.901863	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
679	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:24:33.227348	2025-07-26 17:24:33.227348	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
680	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:24:33.227348	2025-07-26 17:24:33.227348	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
681	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:24:33.227348	2025-07-26 17:24:33.227348	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
682	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:24:33.227348	2025-07-26 17:24:33.227348	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
683	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:24:33.227348	2025-07-26 17:24:33.227348	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
684	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:24:33.227348	2025-07-26 17:24:33.227348	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
685	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:26:16.663297	2025-07-26 17:26:16.663297	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
686	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:26:16.663297	2025-07-26 17:26:16.663297	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
687	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:26:16.663297	2025-07-26 17:26:16.663297	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
688	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:26:16.663297	2025-07-26 17:26:16.663297	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
689	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:26:16.663297	2025-07-26 17:26:16.663297	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
690	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:26:16.663297	2025-07-26 17:26:16.663297	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
691	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:27:53.765825	2025-07-26 17:27:53.765825	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
692	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:27:53.765825	2025-07-26 17:27:53.765825	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
693	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:27:53.765825	2025-07-26 17:27:53.765825	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
694	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:27:53.765825	2025-07-26 17:27:53.765825	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
695	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:27:53.765825	2025-07-26 17:27:53.765825	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
696	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:27:53.765825	2025-07-26 17:27:53.765825	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
697	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:35:49.083757	2025-07-26 17:35:49.083757	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
698	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:35:49.083757	2025-07-26 17:35:49.083757	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
699	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:35:49.083757	2025-07-26 17:35:49.083757	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
700	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:35:49.083757	2025-07-26 17:35:49.083757	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
701	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:35:49.083757	2025-07-26 17:35:49.083757	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
702	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:35:49.083757	2025-07-26 17:35:49.083757	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
703	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:36:10.685167	2025-07-26 17:36:10.685167	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
704	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:36:10.685167	2025-07-26 17:36:10.685167	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
705	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:36:10.685167	2025-07-26 17:36:10.685167	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
706	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:36:10.685167	2025-07-26 17:36:10.685167	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
707	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:36:10.685167	2025-07-26 17:36:10.685167	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
708	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:36:10.685167	2025-07-26 17:36:10.685167	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
709	Deep clean before guest arrival	Complete deep cleaning including windows, carpets, and bathrooms	cleaning	pending	high	3	\N	\N	2025-01-14 00:00:00	\N	\N	\N	2025-07-26 17:36:46.091854	2025-07-26 17:36:46.091854	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
710	Check pool equipment	Test pool pump, heater, and chemical levels	maintenance	in_progress	medium	3	\N	\N	2025-01-16 00:00:00	\N	\N	\N	2025-07-26 17:36:46.091854	2025-07-26 17:36:46.091854	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
711	Replace air conditioning filter	Install new HEPA filter in main AC unit	maintenance	pending	medium	4	\N	\N	2025-01-20 00:00:00	\N	\N	\N	2025-07-26 17:36:46.091854	2025-07-26 17:36:46.091854	maintenance	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
712	Stock welcome amenities	Restock coffee, tea, toiletries, and welcome basket	maintenance	completed	low	5	\N	\N	2025-01-10 00:00:00	\N	\N	\N	2025-07-26 17:36:46.091854	2025-07-26 17:36:46.091854	housekeeping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
713	Garden maintenance	Trim hedges, water plants, clean outdoor furniture	maintenance	pending	medium	6	\N	\N	2025-01-18 00:00:00	\N	\N	\N	2025-07-26 17:36:46.091854	2025-07-26 17:36:46.091854	landscaping	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
714	WiFi troubleshooting	Test internet connection and reset router if needed	maintenance	in_progress	high	7	\N	\N	2025-01-15 00:00:00	\N	\N	\N	2025-07-26 17:36:46.091854	2025-07-26 17:36:46.091854	technical	f	\N	1	\N	\N	default-org	\N	{}	{}	\N	\N	\N	f	\N
\.


--
-- Data for Name: tax_rules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tax_rules (id, region, vat_rate, gst_rate, wht_rate, created_at) FROM stdin;
1	thailand	7.00	\N	3.00	2025-07-26 08:13:22.798449
2	singapore	\N	8.00	5.00	2025-07-26 08:13:22.798449
3	usa	8.25	\N	10.00	2025-07-26 08:13:22.798449
4	uk	20.00	\N	20.00	2025-07-26 08:13:22.798449
5	australia	\N	10.00	10.00	2025-07-26 08:13:22.798449
6	default	10.00	\N	5.00	2025-07-26 08:13:22.798449
\.


--
-- Data for Name: upsell_recommendations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.upsell_recommendations (id, organization_id, guest_id, property_id, recommendation_type, message, status, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, role, created_at, updated_at, organization_id, is_active, last_login_at, password) FROM stdin;
staff-maintenance	test_maintenance@example.com	Fix	All	\N	staff	2025-07-02 16:22:49.384341	2025-07-26 17:36:44.966	default-org	t	\N	test123
demo-agent	retail@demo.com	Test Retail	Agent	\N	retail-agent	2025-07-02 18:05:28.542763	2025-07-26 17:36:45.004	default-org	t	\N	123456
demo-referral	referral@demo.com	Test Referral	Agent	\N	referral-agent	2025-07-02 12:13:51.329901	2025-07-26 17:36:45.041	default-org	t	\N	123456
demo-guest	guest@hostpilotpro.com	Guest	User	\N	guest	2025-07-02 12:13:51.362992	2025-07-26 17:36:45.079	default-org	t	\N	123456
agent1	agent1@example.com	Agent	One	\N	retail-agent	2025-07-02 15:39:12.346025	2025-07-26 17:36:45.117	default-org	t	\N	\N
owner-1	sarah.mitchell@email.com	Sarah	Mitchell	\N	owner	2025-07-24 07:53:44.543373	2025-07-24 07:53:44.543373	default-org	t	\N	\N
owner-2	james.brown@email.com	James	Brown	\N	owner	2025-07-24 07:53:44.543373	2025-07-24 07:53:44.543373	default-org	t	\N	\N
owner-3	maria.garcia@email.com	Maria	Garcia	\N	owner	2025-07-24 07:53:44.543373	2025-07-24 07:53:44.543373	default-org	t	\N	\N
staff-1	alex.johnson@demo.com	Alex	Johnson	\N	staff	2025-07-24 07:53:44.543373	2025-07-24 07:53:44.543373	default-org	t	\N	\N
staff-2	emma.wilson@demo.com	Emma	Wilson	\N	staff	2025-07-24 07:53:44.543373	2025-07-24 07:53:44.543373	default-org	t	\N	\N
admin-001	admin@demo.com	Admin	User	\N	admin	2025-07-05 18:23:42.134644	2025-07-05 18:23:42.134644	demo-org	t	\N	$2b$12$LQv3c1yqBWVHxkd0LQ1lqu.Y5qktJ8j1GrCJFhyH2mH8mO8L9Z8Fe
manager-001	manager@demo.com	Portfolio	Manager	\N	portfolio-manager	2025-07-05 18:23:42.134644	2025-07-05 18:23:42.134644	demo-org	t	\N	$2b$12$LQv3c1yqBWVHxkd0LQ1lqu.Y5qktJ8j1GrCJFhyH2mH8mO8L9Z8Fe
demo-retail	retail@hostpilotpro.com	Retail	Agent	\N	retail-agent	2025-07-02 12:13:51.296592	2025-07-02 18:03:28.739	default-org	t	\N	\N
owner-001	owner@demo.com	Property	Owner	\N	owner	2025-07-05 18:23:42.134644	2025-07-05 18:23:42.134644	demo-org	t	\N	$2b$12$LQv3c1yqBWVHxkd0LQ1lqu.Y5qktJ8j1GrCJFhyH2mH8mO8L9Z8Fe
staff-001	staff@demo.com	Staff	Member	\N	staff	2025-07-05 18:23:42.134644	2025-07-05 18:23:42.134644	demo-org	t	\N	$2b$12$LQv3c1yqBWVHxkd0LQ1lqu.Y5qktJ8j1GrCJFhyH2mH8mO8L9Z8Fe
guest-001	guest@demo.com	Guest	User	\N	guest	2025-07-05 18:23:42.134644	2025-07-05 18:23:42.134644	demo-org	t	\N	$2b$12$LQv3c1yqBWVHxkd0LQ1lqu.Y5qktJ8j1GrCJFhyH2mH8mO8L9Z8Fe
staff-3	michael.lee@demo.com	Michael	Lee	\N	staff	2025-07-24 07:53:44.543373	2025-07-24 07:53:44.543373	default-org	t	\N	\N
staff-4	lisa.chen@demo.com	Lisa	Chen	\N	staff	2025-07-24 07:53:44.543373	2025-07-24 07:53:44.543373	default-org	t	\N	\N
retail-001	retail@demo.com	Retail	Agent	\N	retail-agent	2025-07-05 18:23:42.134644	2025-07-05 18:23:42.134644	demo-org	t	\N	123456
referral-001	referral@demo.com	Referral	Agent	\N	referral-agent	2025-07-05 18:23:42.134644	2025-07-05 18:23:42.134644	demo-org	t	\N	123456
demo-admin	admin@test.com	Admin	User	\N	admin	2025-07-02 12:13:51.083591	2025-07-26 17:36:44.514	default-org	t	\N	admin123
demo-pm	manager@test.com	Portfolio	Manager	\N	portfolio-manager	2025-07-02 12:13:51.196241	2025-07-26 17:36:44.667	default-org	t	\N	manager123
demo-owner	owner@test.com	Property	Owner	\N	owner	2025-07-02 12:13:51.229492	2025-07-26 17:36:44.776	default-org	t	\N	owner123
demo-staff	staff@test.com	Staff	Member	\N	staff	2025-07-02 12:13:51.263076	2025-07-26 17:36:44.813	default-org	t	\N	staff123
staff-cleaning	test_cleaning@example.com	Maria	Santos	\N	staff	2025-07-02 16:22:49.254956	2025-07-26 17:36:44.852	default-org	t	\N	test123
staff-pool	test_pool@example.com	John	Pool	\N	staff	2025-07-02 16:22:49.320103	2025-07-26 17:36:44.889	default-org	t	\N	test123
staff-garden	test_garden@example.com	Green	Thumb	\N	staff	2025-07-02 16:22:49.353219	2025-07-26 17:36:44.927	default-org	t	\N	test123
agent-1	david.taylor@realestate.com	David	Taylor	\N	retail-agent	2025-07-24 07:53:44.543373	2025-07-24 07:53:44.543373	default-org	t	\N	\N
agent-2	sophie.anderson@referrals.com	Sophie	Anderson	\N	referral-agent	2025-07-24 07:53:44.543373	2025-07-24 07:53:44.543373	default-org	t	\N	\N
\.


--
-- Data for Name: utility_bill_reminders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.utility_bill_reminders (id, organization_id, utility_bill_id, reminder_type, sent_at, sent_to, reminder_message, is_read, created_at) FROM stdin;
1	demo-org-1	7	overdue	2025-07-03 06:38:23.350844	demo-admin	Utility bill for internet is overdue. Amount: ฿659	f	2025-07-03 06:38:23.350844
2	demo-org-1	12	overdue	2025-07-03 06:38:23.387451	demo-admin	Utility bill for water is overdue. Amount: ฿541	f	2025-07-03 06:38:23.387451
3	demo-org-1	15	overdue	2025-07-03 06:38:23.419571	demo-admin	Utility bill for internet is overdue. Amount: ฿713	f	2025-07-03 06:38:23.419571
4	demo-org-1	1	due_soon	2025-07-03 06:38:23.4515	demo-admin	electricity bill is due soon. Expected on 2025-07-15	t	2025-07-03 06:38:23.4515
5	demo-org-1	3	due_soon	2025-07-03 06:38:23.483461	demo-admin	water bill is due soon. Expected on 2025-07-20	t	2025-07-03 06:38:23.483461
\.


--
-- Data for Name: utility_bills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.utility_bills (id, property_id, type, provider, account_number, amount, due_date, bill_period_start, bill_period_end, status, receipt_url, reminder_sent, is_recurring, next_due_date, created_at, updated_at, organization_id, utility_account_id, currency, billing_month, receipt_filename, responsible_party, is_owner_billable, uploaded_by, uploaded_at, notes) FROM stdin;
1	1	electricity	PEA (Provincial Electricity Authority)	EA13982	928.00	2025-07-15	2025-06-01	2025-06-30	pending	\N	f	t	2025-08-15	2025-07-03 06:38:22.838762	2025-07-03 06:38:22.838762	demo-org-1	1	THB	2025-07	\N	company	t	\N	\N	electricity bill for 2025-07
2	1	electricity	PEA (Provincial Electricity Authority)	EA13982	989.00	2025-06-15	2025-05-01	2025-05-31	paid	\N	f	t	\N	2025-07-03 06:38:22.877637	2025-07-03 06:38:22.877637	demo-org-1	1	THB	2025-06	\N	owner	t	demo-admin	2025-06-16 08:35:03.518	electricity bill for 2025-06
3	1	water	Water Authority	WA15477	419.00	2025-07-20	2025-06-01	2025-06-30	pending	\N	f	t	2025-08-20	2025-07-03 06:38:22.910182	2025-07-03 06:38:22.910182	demo-org-1	2	THB	2025-07	\N	owner	t	\N	\N	water bill for 2025-07
4	1	water	Water Authority	WA15477	334.00	2025-06-20	2025-05-01	2025-05-31	paid	\N	f	t	\N	2025-07-03 06:38:22.942397	2025-07-03 06:38:22.942397	demo-org-1	2	THB	2025-06	\N	owner	t	demo-admin	2025-06-05 03:10:01.51	water bill for 2025-06
5	1	internet	AIS	INT14108	1010.00	2025-07-05	2025-06-01	2025-06-30	uploaded	\N	f	t	2025-08-05	2025-07-03 06:38:22.974951	2025-07-03 06:38:22.974951	demo-org-1	3	THB	2025-07	\N	owner	t	\N	\N	internet bill for 2025-07
6	1	internet	AIS	INT14108	967.00	2025-06-05	2025-05-01	2025-05-31	paid	\N	f	t	\N	2025-07-03 06:38:23.007101	2025-07-03 06:38:23.007101	demo-org-1	3	THB	2025-06	\N	owner	t	demo-admin	2025-06-15 13:48:17.416	internet bill for 2025-06
7	1	internet	AIS	INT14108	659.00	2025-06-23	2025-05-01	2025-05-31	overdue	\N	f	t	\N	2025-07-03 06:38:23.038303	2025-07-03 06:38:23.038303	demo-org-1	3	THB	2025-06	\N	owner	t	\N	\N	Overdue internet bill
8	2	electricity	PEA (Provincial Electricity Authority)	EA28230	1582.00	2025-07-15	2025-06-01	2025-06-30	uploaded	\N	f	t	2025-08-15	2025-07-03 06:38:23.070639	2025-07-03 06:38:23.070639	demo-org-1	4	THB	2025-07	\N	owner	t	\N	\N	electricity bill for 2025-07
9	2	electricity	PEA (Provincial Electricity Authority)	EA28230	2033.00	2025-06-15	2025-05-01	2025-05-31	paid	\N	f	t	\N	2025-07-03 06:38:23.103366	2025-07-03 06:38:23.103366	demo-org-1	4	THB	2025-06	\N	owner	t	demo-admin	2025-06-24 23:56:08.322	electricity bill for 2025-06
10	2	water	Water Authority	WA25827	536.00	2025-07-20	2025-06-01	2025-06-30	uploaded	\N	f	t	2025-08-20	2025-07-03 06:38:23.137397	2025-07-03 06:38:23.137397	demo-org-1	5	THB	2025-07	\N	owner	t	\N	\N	water bill for 2025-07
11	2	water	Water Authority	WA25827	415.00	2025-06-20	2025-05-01	2025-05-31	paid	\N	f	t	\N	2025-07-03 06:38:23.175397	2025-07-03 06:38:23.175397	demo-org-1	5	THB	2025-06	\N	company	t	demo-admin	2025-06-28 00:59:13.898	water bill for 2025-06
12	2	water	Water Authority	WA25827	541.00	2025-06-23	2025-05-01	2025-05-31	overdue	\N	f	t	\N	2025-07-03 06:38:23.207744	2025-07-03 06:38:23.207744	demo-org-1	5	THB	2025-06	\N	owner	t	\N	\N	Overdue water bill
13	2	internet	AIS	INT20406	666.00	2025-07-05	2025-06-01	2025-06-30	pending	\N	f	t	2025-08-05	2025-07-03 06:38:23.239315	2025-07-03 06:38:23.239315	demo-org-1	6	THB	2025-07	\N	owner	t	\N	\N	internet bill for 2025-07
14	2	internet	AIS	INT20406	648.00	2025-06-05	2025-05-01	2025-05-31	paid	\N	f	t	\N	2025-07-03 06:38:23.272037	2025-07-03 06:38:23.272037	demo-org-1	6	THB	2025-06	\N	owner	t	demo-admin	2025-06-12 12:27:08.519	internet bill for 2025-06
15	2	internet	AIS	INT20406	713.00	2025-06-23	2025-05-01	2025-05-31	overdue	\N	f	t	\N	2025-07-03 06:38:23.304547	2025-07-03 06:38:23.304547	demo-org-1	6	THB	2025-06	\N	owner	t	\N	\N	Overdue internet bill
\.


--
-- Data for Name: utility_providers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.utility_providers (id, organization_id, utility_type, provider_name, country, is_default, display_order, created_by, created_at, updated_at, region, is_active, contact_info, billing_cycle, notes) FROM stdin;
1	demo-org-1	internet	True Online	Thailand	t	1	demo-admin	2025-07-02 17:17:40.545536	2025-07-02 17:17:40.545536	\N	t	\N	monthly	\N
2	demo-org-1	internet	3BB	Thailand	f	2	demo-admin	2025-07-02 17:17:40.545536	2025-07-02 17:17:40.545536	\N	t	\N	monthly	\N
3	demo-org-1	internet	NT	Thailand	f	3	demo-admin	2025-07-02 17:17:40.545536	2025-07-02 17:17:40.545536	\N	t	\N	monthly	\N
4	demo-org-1	internet	CAT	Thailand	f	4	demo-admin	2025-07-02 17:17:40.545536	2025-07-02 17:17:40.545536	\N	t	\N	monthly	\N
5	demo-org-1	internet	TOT	Thailand	f	5	demo-admin	2025-07-02 17:17:40.545536	2025-07-02 17:17:40.545536	\N	t	\N	monthly	\N
6	demo-org-1	internet	AIS	Thailand	f	6	demo-admin	2025-07-02 17:17:40.545536	2025-07-02 17:17:40.545536	\N	t	\N	monthly	\N
7	demo-org-1	electricity	PEA	Thailand	t	1	demo-admin	2025-07-02 17:17:40.545536	2025-07-02 17:17:40.545536	\N	t	\N	monthly	\N
8	demo-org-1	water	Government	Thailand	t	1	demo-admin	2025-07-02 17:17:40.545536	2025-07-02 17:17:40.545536	\N	t	\N	monthly	\N
9	demo-org-1	water	Deepwell	Thailand	f	2	demo-admin	2025-07-02 17:17:40.545536	2025-07-02 17:17:40.545536	\N	t	\N	monthly	\N
10	default-org	internet	True Online	Thailand	t	1	system-seed	2025-07-02 18:00:23.741339	2025-07-02 18:00:23.741339	\N	t	\N	monthly	\N
11	default-org	internet	3BB	Thailand	f	2	system-seed	2025-07-02 18:00:23.780668	2025-07-02 18:00:23.780668	\N	t	\N	monthly	\N
12	default-org	internet	NT	Thailand	f	3	system-seed	2025-07-02 18:00:23.813141	2025-07-02 18:00:23.813141	\N	t	\N	monthly	\N
13	default-org	internet	CAT Telecom	Thailand	f	4	system-seed	2025-07-02 18:00:23.844972	2025-07-02 18:00:23.844972	\N	t	\N	monthly	\N
14	default-org	internet	TOT	Thailand	f	5	system-seed	2025-07-02 18:00:23.878428	2025-07-02 18:00:23.878428	\N	t	\N	monthly	\N
15	default-org	internet	AIS Fibre	Thailand	f	6	system-seed	2025-07-02 18:00:23.909965	2025-07-02 18:00:23.909965	\N	t	\N	monthly	\N
16	default-org	electricity	PEA (Provincial Electricity Authority)	Thailand	t	1	system-seed	2025-07-02 18:00:23.9422	2025-07-02 18:00:23.9422	\N	t	\N	monthly	\N
17	default-org	electricity	MEA (Metropolitan Electricity Authority)	Thailand	f	2	system-seed	2025-07-02 18:00:23.974637	2025-07-02 18:00:23.974637	\N	t	\N	monthly	\N
18	default-org	water	Deepwell	Thailand	t	1	system-seed	2025-07-02 18:00:24.007714	2025-07-02 18:00:24.007714	\N	t	\N	monthly	\N
19	default-org	water	Government Water	Thailand	f	2	system-seed	2025-07-02 18:00:24.039674	2025-07-02 18:00:24.039674	\N	t	\N	monthly	\N
20	default-org	water	Private Water Company	Thailand	f	3	system-seed	2025-07-02 18:00:24.071636	2025-07-02 18:00:24.071636	\N	t	\N	monthly	\N
21	default-org	gas	PTT LPG	Thailand	t	1	system-seed	2025-07-02 18:00:24.104041	2025-07-02 18:00:24.104041	\N	t	\N	monthly	\N
22	default-org	gas	Shell Gas	Thailand	f	2	system-seed	2025-07-02 18:00:24.136443	2025-07-02 18:00:24.136443	\N	t	\N	monthly	\N
23	default-org	gas	Unique Gas	Thailand	f	3	system-seed	2025-07-02 18:00:24.168594	2025-07-02 18:00:24.168594	\N	t	\N	monthly	\N
\.


--
-- Data for Name: vendor_service_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vendor_service_history (id, organization_id, vendor_id, service_id, property_id, completed_date, quality_score, timeliness_score, cost, notes, created_at) FROM stdin;
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vendors (id, organization_id, name, contact_info, api_url, created_at) FROM stdin;
1	default-org	Samui Supply Co.	Contact: Khun Somchai | Phone: +66 77 123-4567 | Email: orders@samuisupply.co.th | Address: 123/45 Chaweng Beach Road, Koh Samui 84320	https://api.samuisupply.co.th/orders	2025-07-26 09:34:05.085644
2	default-org	Tropical Linens Ltd.	Contact: Ms. Pranee | Phone: +66 77 234-5678 | Email: sales@tropicallinens.com | Address: 89/12 Nathon Port, Koh Samui 84140	https://api.tropicallinens.com/v2	2025-07-26 09:34:05.085644
3	default-org	Island Maintenance Supplies	Contact: Khun Anan | Phone: +66 77 345-6789 | Email: info@islandmaintenance.co.th | Address: 56/23 Lamai Beach Road, Koh Samui 84310	\N	2025-07-26 09:34:05.085644
4	default-org	Fresh Market Delivery	Contact: Ms. Malee | Phone: +66 77 456-7890 | Email: deliver@freshmarket.co.th | Address: 34/78 Fisherman Village, Koh Samui 84320	https://api.freshmarket.co.th/bulk	2025-07-26 09:34:05.085644
5	default-org	Pool & Spa Equipment Co.	Contact: Khun Niran | Phone: +66 77 567-8901 | Email: poolcare@psec.co.th | Address: 12/34 Industrial Zone, Koh Samui 84330	https://api.psec.co.th/equipment	2025-07-26 09:34:05.085644
\.


--
-- Data for Name: welcome_pack_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.welcome_pack_items (id, organization_id, name, category, unit_cost, currency, supplier, restock_threshold, current_stock, is_active, created_at, updated_at) FROM stdin;
1	demo-org	Water Bottle	beverages	2.50	AUD	Mountain Spring Water Co	20	50	t	2025-07-02 07:58:54.034334	2025-07-02 07:58:54.034334
2	demo-org	Soap Bar	toiletries	3.75	AUD	Luxury Bath Supplies	15	30	t	2025-07-02 07:58:54.034334	2025-07-02 07:58:54.034334
3	demo-org	Coffee Pods	beverages	1.25	AUD	Premium Coffee Co	25	100	t	2025-07-02 07:58:54.034334	2025-07-02 07:58:54.034334
4	demo-org	Shampoo	toiletries	4.50	AUD	Organic Care Products	10	25	t	2025-07-02 07:58:54.034334	2025-07-02 07:58:54.034334
5	demo-org	Welcome Note	amenities	0.50	AUD	Local Print Shop	50	150	t	2025-07-02 07:58:54.034334	2025-07-02 07:58:54.034334
6	demo-org	Chocolate	snacks	5.00	AUD	Artisan Confectionery	20	40	t	2025-07-02 07:58:54.034334	2025-07-02 07:58:54.034334
\.


--
-- Data for Name: welcome_pack_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.welcome_pack_templates (id, organization_id, property_id, item_id, default_quantity, is_complimentary, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: welcome_pack_usage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.welcome_pack_usage (id, organization_id, property_id, booking_id, item_id, quantity_used, unit_cost, total_cost, billing_option, processed_by, usage_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_bot_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.whatsapp_bot_logs (id, organization_id, user_id, command, response, created_at) FROM stdin;
1	default-org	+66891234567	/status	Your villa bookings: 2 active reservations. Villa Samui Breeze: Check-in today. Villa Ocean View: Check-in tomorrow.	2025-07-26 09:36:24.856939
2	default-org	+66892345678	/bookings	Current bookings for your properties:\\n• Villa Tropical Paradise: 3 nights (Jan 15-18)\\n• Villa Aruna: 5 nights (Jan 20-25)\\nTotal revenue this month: ฿45,000	2025-07-26 09:36:24.856939
3	default-org	+66893456789	/tasks	Today's tasks:\\n• Pool cleaning (Villa Samui) - Pending\\n• AC maintenance (Villa Ocean) - In Progress\\n• Guest checkout (Villa Tropical) - Completed	2025-07-26 09:36:24.856939
4	default-org	+66891234567	/revenue	Monthly revenue report:\\n• Total: ฿128,500\\n• Properties: 4 active\\n• Occupancy: 78%\\n• Top performer: Villa Aruna (฿35,000)	2025-07-26 09:36:24.856939
5	default-org	+66894567890	/help	Available commands:\\n/status - Property status\\n/bookings - View bookings\\n/tasks - Daily tasks\\n/revenue - Revenue summary\\n/maintenance - Maintenance alerts\\n/help - This help menu	2025-07-26 09:36:24.856939
6	default-org	+66892345678	/maintenance	Maintenance alerts:\\n• Villa Samui: Pool filter due (3 days)\\n• Villa Ocean: AC service overdue\\n• Villa Tropical: Garden maintenance scheduled tomorrow	2025-07-26 09:36:24.856939
7	default-org	+66895678901	/checkin	Guest check-in completed for Villa Aruna:\\n• Guest: John Smith\\n• Duration: 7 nights\\n• Deposit: ฿8,000 received\\n• Welcome kit: Delivered	2025-07-26 09:36:24.856939
8	default-org	+66891234567	/emergency	Emergency protocols activated. On-call staff notified:\\n• Property Manager: Khun Somchai\\n• Maintenance: Khun Niran\\n• Security: 24/7 hotline active	2025-07-26 09:36:24.856939
9	default-org	+66896789012	/weather	Koh Samui weather update:\\n• Today: Sunny, 32°C\\n• Tomorrow: Partly cloudy, 30°C\\n• Wind: Light breeze\\n• Pool conditions: Excellent	2025-07-26 09:36:24.856939
10	default-org	+66893456789	/checkout	Guest checkout processed for Villa Ocean View:\\n• Final bill: ฿25,600\\n• Electricity usage: 120 kWh (฿840)\\n• Deposit refund: ฿7,160\\n• Guest rating requested	2025-07-26 09:36:24.856939
\.


--
-- Name: addon_bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.addon_bookings_id_seq', 1, false);


--
-- Name: addon_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.addon_services_id_seq', 601, true);


--
-- Name: agent_bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.agent_bookings_id_seq', 1, false);


--
-- Name: agent_media_access_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.agent_media_access_id_seq', 1, false);


--
-- Name: agent_payouts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.agent_payouts_id_seq', 1, false);


--
-- Name: ai_configuration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ai_configuration_id_seq', 1, false);


--
-- Name: ai_generated_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ai_generated_tasks_id_seq', 1, false);


--
-- Name: ai_media_suggestions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ai_media_suggestions_id_seq', 1, false);


--
-- Name: ai_ops_anomalies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ai_ops_anomalies_id_seq', 6, true);


--
-- Name: ai_roi_predictions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ai_roi_predictions_id_seq', 16, true);


--
-- Name: ai_task_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ai_task_rules_id_seq', 118, true);


--
-- Name: ai_virtual_managers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ai_virtual_managers_id_seq', 1, false);


--
-- Name: booking_cost_breakdowns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.booking_cost_breakdowns_id_seq', 1, false);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bookings_id_seq', 16, true);


--
-- Name: commission_earnings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.commission_earnings_id_seq', 1, false);


--
-- Name: commission_invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.commission_invoice_items_id_seq', 1, false);


--
-- Name: commission_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.commission_invoices_id_seq', 1, false);


--
-- Name: commission_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.commission_log_id_seq', 7, true);


--
-- Name: currency_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.currency_rates_id_seq', 10, true);


--
-- Name: custom_expense_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.custom_expense_categories_id_seq', 5, true);


--
-- Name: damage_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.damage_reports_id_seq', 5, true);


--
-- Name: dynamic_pricing_recommendations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.dynamic_pricing_recommendations_id_seq', 12, true);


--
-- Name: feedback_processing_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.feedback_processing_log_id_seq', 1, false);


--
-- Name: finances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.finances_id_seq', 591, true);


--
-- Name: financial_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.financial_transactions_id_seq', 1, false);


--
-- Name: guest_activity_timeline_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_activity_timeline_id_seq', 1, false);


--
-- Name: guest_addon_bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_addon_bookings_id_seq', 4, true);


--
-- Name: guest_addon_service_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_addon_service_requests_id_seq', 1, false);


--
-- Name: guest_addon_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_addon_services_id_seq', 10, true);


--
-- Name: guest_ai_faq_knowledge_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_ai_faq_knowledge_id_seq', 1, false);


--
-- Name: guest_chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_chat_messages_id_seq', 1, false);


--
-- Name: guest_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_feedback_id_seq', 1, false);


--
-- Name: guest_id_scans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_id_scans_id_seq', 28, true);


--
-- Name: guest_maintenance_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_maintenance_reports_id_seq', 1, false);


--
-- Name: guest_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_messages_id_seq', 1, false);


--
-- Name: guest_portal_access_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_portal_access_id_seq', 1, false);


--
-- Name: guest_portal_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_portal_sessions_id_seq', 1, false);


--
-- Name: guest_property_local_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_property_local_info_id_seq', 1, false);


--
-- Name: guest_service_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guest_service_requests_id_seq', 1, false);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inventory_id_seq', 1, false);


--
-- Name: invoice_line_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.invoice_line_items_id_seq', 1, false);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: legal_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.legal_templates_id_seq', 5, true);


--
-- Name: maintenance_approval_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.maintenance_approval_logs_id_seq', 1, false);


--
-- Name: maintenance_budget_forecasts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.maintenance_budget_forecasts_id_seq', 12, true);


--
-- Name: maintenance_suggestion_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.maintenance_suggestion_settings_id_seq', 1, false);


--
-- Name: maintenance_suggestions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.maintenance_suggestions_id_seq', 1, false);


--
-- Name: maintenance_timeline_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.maintenance_timeline_entries_id_seq', 1, false);


--
-- Name: marketing_packs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.marketing_packs_id_seq', 1, false);


--
-- Name: marketplace_service_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.marketplace_service_analytics_id_seq', 1, false);


--
-- Name: marketplace_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.marketplace_services_id_seq', 1, false);


--
-- Name: media_folders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.media_folders_id_seq', 1, false);


--
-- Name: media_usage_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.media_usage_analytics_id_seq', 1, false);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notification_preferences_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: offline_task_cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.offline_task_cache_id_seq', 2, true);


--
-- Name: onboarding_step_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.onboarding_step_details_id_seq', 1, false);


--
-- Name: organization_api_keys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.organization_api_keys_id_seq', 1, false);


--
-- Name: owner_activity_timeline_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_activity_timeline_id_seq', 1, false);


--
-- Name: owner_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_balances_id_seq', 1, false);


--
-- Name: owner_charge_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_charge_requests_id_seq', 1, false);


--
-- Name: owner_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_documents_id_seq', 1, false);


--
-- Name: owner_financial_summary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_financial_summary_id_seq', 1, false);


--
-- Name: owner_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_invoices_id_seq', 1, false);


--
-- Name: owner_onboarding_processes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_onboarding_processes_id_seq', 1, false);


--
-- Name: owner_payout_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_payout_requests_id_seq', 3, true);


--
-- Name: owner_payouts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_payouts_id_seq', 1, false);


--
-- Name: owner_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_preferences_id_seq', 1, false);


--
-- Name: owner_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_settings_id_seq', 1, true);


--
-- Name: owner_timeline_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.owner_timeline_activity_id_seq', 10, true);


--
-- Name: platform_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.platform_settings_id_seq', 1, false);


--
-- Name: pm_commission_balance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pm_commission_balance_id_seq', 1, true);


--
-- Name: pm_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pm_notifications_id_seq', 4, true);


--
-- Name: pm_payout_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pm_payout_requests_id_seq', 2, true);


--
-- Name: pm_property_performance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pm_property_performance_id_seq', 1, false);


--
-- Name: pm_task_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pm_task_logs_id_seq', 2, true);


--
-- Name: portfolio_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.portfolio_assignments_id_seq', 2, true);


--
-- Name: portfolio_health_scores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.portfolio_health_scores_id_seq', 1, false);


--
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.properties_id_seq', 17, true);


--
-- Name: property_agents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_agents_id_seq', 1, false);


--
-- Name: property_chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_chat_messages_id_seq', 8, true);


--
-- Name: property_custom_expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_custom_expenses_id_seq', 1, false);


--
-- Name: property_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_documents_id_seq', 10, true);


--
-- Name: property_insurance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_insurance_id_seq', 16, true);


--
-- Name: property_investments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_investments_id_seq', 6, true);


--
-- Name: property_media_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_media_files_id_seq', 1, false);


--
-- Name: property_media_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_media_settings_id_seq', 1, false);


--
-- Name: property_payout_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_payout_rules_id_seq', 1, false);


--
-- Name: property_referrals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_referrals_id_seq', 1, false);


--
-- Name: property_revenue_targets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_revenue_targets_id_seq', 1, false);


--
-- Name: property_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_reviews_id_seq', 5, true);


--
-- Name: property_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_status_id_seq', 8, true);


--
-- Name: property_utility_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_utility_accounts_id_seq', 6, true);


--
-- Name: property_utility_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.property_utility_settings_id_seq', 1, false);


--
-- Name: recurring_service_charges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.recurring_service_charges_id_seq', 1, false);


--
-- Name: referral_earnings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.referral_earnings_id_seq', 1, false);


--
-- Name: seasonal_forecasts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.seasonal_forecasts_id_seq', 10, true);


--
-- Name: security_deposits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.security_deposits_id_seq', 5, true);


--
-- Name: service_bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_bookings_id_seq', 1, false);


--
-- Name: service_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_categories_id_seq', 68, true);


--
-- Name: service_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_reviews_id_seq', 1, false);


--
-- Name: service_vendor_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_vendor_analytics_id_seq', 1, false);


--
-- Name: service_vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_vendors_id_seq', 6, true);


--
-- Name: shared_cost_splits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shared_cost_splits_id_seq', 24, true);


--
-- Name: shared_costs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shared_costs_id_seq', 6, true);


--
-- Name: staff_salaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.staff_salaries_id_seq', 1, false);


--
-- Name: staff_skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.staff_skills_id_seq', 5, true);


--
-- Name: staff_workload_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.staff_workload_stats_id_seq', 39, true);


--
-- Name: supply_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.supply_orders_id_seq', 8, true);


--
-- Name: sustainability_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sustainability_metrics_id_seq', 12, true);


--
-- Name: task_ai_scan_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.task_ai_scan_results_id_seq', 3, true);


--
-- Name: task_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.task_history_id_seq', 1, false);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tasks_id_seq', 714, true);


--
-- Name: tax_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tax_rules_id_seq', 6, true);


--
-- Name: upsell_recommendations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.upsell_recommendations_id_seq', 1, false);


--
-- Name: utility_bill_reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.utility_bill_reminders_id_seq', 5, true);


--
-- Name: utility_bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.utility_bills_id_seq', 15, true);


--
-- Name: utility_providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.utility_providers_id_seq', 23, true);


--
-- Name: vendor_service_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vendor_service_history_id_seq', 1, false);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vendors_id_seq', 5, true);


--
-- Name: welcome_pack_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.welcome_pack_items_id_seq', 6, true);


--
-- Name: welcome_pack_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.welcome_pack_templates_id_seq', 1, false);


--
-- Name: welcome_pack_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.welcome_pack_usage_id_seq', 1, false);


--
-- Name: whatsapp_bot_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.whatsapp_bot_logs_id_seq', 10, true);


--
-- Name: addon_bookings addon_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addon_bookings
    ADD CONSTRAINT addon_bookings_pkey PRIMARY KEY (id);


--
-- Name: addon_services addon_services_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addon_services
    ADD CONSTRAINT addon_services_pkey PRIMARY KEY (id);


--
-- Name: agent_bookings agent_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_bookings
    ADD CONSTRAINT agent_bookings_pkey PRIMARY KEY (id);


--
-- Name: agent_media_access agent_media_access_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_media_access
    ADD CONSTRAINT agent_media_access_pkey PRIMARY KEY (id);


--
-- Name: agent_payouts agent_payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_payouts
    ADD CONSTRAINT agent_payouts_pkey PRIMARY KEY (id);


--
-- Name: ai_configuration ai_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_configuration
    ADD CONSTRAINT ai_configuration_pkey PRIMARY KEY (id);


--
-- Name: ai_generated_tasks ai_generated_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_generated_tasks
    ADD CONSTRAINT ai_generated_tasks_pkey PRIMARY KEY (id);


--
-- Name: ai_media_suggestions ai_media_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_media_suggestions
    ADD CONSTRAINT ai_media_suggestions_pkey PRIMARY KEY (id);


--
-- Name: ai_ops_anomalies ai_ops_anomalies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_ops_anomalies
    ADD CONSTRAINT ai_ops_anomalies_pkey PRIMARY KEY (id);


--
-- Name: ai_roi_predictions ai_roi_predictions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_roi_predictions
    ADD CONSTRAINT ai_roi_predictions_pkey PRIMARY KEY (id);


--
-- Name: ai_task_rules ai_task_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_task_rules
    ADD CONSTRAINT ai_task_rules_pkey PRIMARY KEY (id);


--
-- Name: ai_virtual_managers ai_virtual_managers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_virtual_managers
    ADD CONSTRAINT ai_virtual_managers_pkey PRIMARY KEY (id);


--
-- Name: booking_cost_breakdowns booking_cost_breakdowns_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.booking_cost_breakdowns
    ADD CONSTRAINT booking_cost_breakdowns_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_booking_reference_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booking_reference_key UNIQUE (booking_reference);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: commission_earnings commission_earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.commission_earnings
    ADD CONSTRAINT commission_earnings_pkey PRIMARY KEY (id);


--
-- Name: commission_invoice_items commission_invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.commission_invoice_items
    ADD CONSTRAINT commission_invoice_items_pkey PRIMARY KEY (id);


--
-- Name: commission_invoices commission_invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.commission_invoices
    ADD CONSTRAINT commission_invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: commission_invoices commission_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.commission_invoices
    ADD CONSTRAINT commission_invoices_pkey PRIMARY KEY (id);


--
-- Name: commission_log commission_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.commission_log
    ADD CONSTRAINT commission_log_pkey PRIMARY KEY (id);


--
-- Name: currency_rates currency_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.currency_rates
    ADD CONSTRAINT currency_rates_pkey PRIMARY KEY (id);


--
-- Name: custom_expense_categories custom_expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_expense_categories
    ADD CONSTRAINT custom_expense_categories_pkey PRIMARY KEY (id);


--
-- Name: damage_reports damage_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.damage_reports
    ADD CONSTRAINT damage_reports_pkey PRIMARY KEY (id);


--
-- Name: dynamic_pricing_recommendations dynamic_pricing_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dynamic_pricing_recommendations
    ADD CONSTRAINT dynamic_pricing_recommendations_pkey PRIMARY KEY (id);


--
-- Name: feedback_processing_log feedback_processing_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback_processing_log
    ADD CONSTRAINT feedback_processing_log_pkey PRIMARY KEY (id);


--
-- Name: finances finances_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT finances_pkey PRIMARY KEY (id);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_pkey PRIMARY KEY (id);


--
-- Name: guest_activity_timeline guest_activity_timeline_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_activity_timeline
    ADD CONSTRAINT guest_activity_timeline_pkey PRIMARY KEY (id);


--
-- Name: guest_addon_bookings guest_addon_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_addon_bookings
    ADD CONSTRAINT guest_addon_bookings_pkey PRIMARY KEY (id);


--
-- Name: guest_addon_service_requests guest_addon_service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_addon_service_requests
    ADD CONSTRAINT guest_addon_service_requests_pkey PRIMARY KEY (id);


--
-- Name: guest_addon_services guest_addon_services_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_addon_services
    ADD CONSTRAINT guest_addon_services_pkey PRIMARY KEY (id);


--
-- Name: guest_ai_faq_knowledge guest_ai_faq_knowledge_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_ai_faq_knowledge
    ADD CONSTRAINT guest_ai_faq_knowledge_pkey PRIMARY KEY (id);


--
-- Name: guest_chat_messages guest_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_chat_messages
    ADD CONSTRAINT guest_chat_messages_pkey PRIMARY KEY (id);


--
-- Name: guest_feedback guest_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_feedback
    ADD CONSTRAINT guest_feedback_pkey PRIMARY KEY (id);


--
-- Name: guest_id_scans guest_id_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_id_scans
    ADD CONSTRAINT guest_id_scans_pkey PRIMARY KEY (id);


--
-- Name: guest_maintenance_reports guest_maintenance_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_maintenance_reports
    ADD CONSTRAINT guest_maintenance_reports_pkey PRIMARY KEY (id);


--
-- Name: guest_messages guest_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_messages
    ADD CONSTRAINT guest_messages_pkey PRIMARY KEY (id);


--
-- Name: guest_portal_access guest_portal_access_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_portal_access
    ADD CONSTRAINT guest_portal_access_pkey PRIMARY KEY (id);


--
-- Name: guest_portal_sessions guest_portal_sessions_access_token_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_portal_sessions
    ADD CONSTRAINT guest_portal_sessions_access_token_key UNIQUE (access_token);


--
-- Name: guest_portal_sessions guest_portal_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_portal_sessions
    ADD CONSTRAINT guest_portal_sessions_pkey PRIMARY KEY (id);


--
-- Name: guest_property_local_info guest_property_local_info_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_property_local_info
    ADD CONSTRAINT guest_property_local_info_pkey PRIMARY KEY (id);


--
-- Name: guest_service_requests guest_service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_service_requests
    ADD CONSTRAINT guest_service_requests_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: invoice_line_items invoice_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: legal_templates legal_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.legal_templates
    ADD CONSTRAINT legal_templates_pkey PRIMARY KEY (id);


--
-- Name: maintenance_approval_logs maintenance_approval_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_approval_logs
    ADD CONSTRAINT maintenance_approval_logs_pkey PRIMARY KEY (id);


--
-- Name: maintenance_budget_forecasts maintenance_budget_forecasts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_budget_forecasts
    ADD CONSTRAINT maintenance_budget_forecasts_pkey PRIMARY KEY (id);


--
-- Name: maintenance_suggestion_settings maintenance_suggestion_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_suggestion_settings
    ADD CONSTRAINT maintenance_suggestion_settings_pkey PRIMARY KEY (id);


--
-- Name: maintenance_suggestions maintenance_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_suggestions
    ADD CONSTRAINT maintenance_suggestions_pkey PRIMARY KEY (id);


--
-- Name: maintenance_timeline_entries maintenance_timeline_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_timeline_entries
    ADD CONSTRAINT maintenance_timeline_entries_pkey PRIMARY KEY (id);


--
-- Name: marketing_packs marketing_packs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketing_packs
    ADD CONSTRAINT marketing_packs_pkey PRIMARY KEY (id);


--
-- Name: marketplace_service_analytics marketplace_service_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketplace_service_analytics
    ADD CONSTRAINT marketplace_service_analytics_pkey PRIMARY KEY (id);


--
-- Name: marketplace_services marketplace_services_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketplace_services
    ADD CONSTRAINT marketplace_services_pkey PRIMARY KEY (id);


--
-- Name: media_folders media_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_pkey PRIMARY KEY (id);


--
-- Name: media_usage_analytics media_usage_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.media_usage_analytics
    ADD CONSTRAINT media_usage_analytics_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: offline_task_cache offline_task_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.offline_task_cache
    ADD CONSTRAINT offline_task_cache_pkey PRIMARY KEY (id);


--
-- Name: onboarding_step_details onboarding_step_details_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.onboarding_step_details
    ADD CONSTRAINT onboarding_step_details_pkey PRIMARY KEY (id);


--
-- Name: organization_api_keys organization_api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organization_api_keys
    ADD CONSTRAINT organization_api_keys_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_domain_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_domain_unique UNIQUE (domain);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_subdomain_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_subdomain_unique UNIQUE (subdomain);


--
-- Name: owner_activity_timeline owner_activity_timeline_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_activity_timeline
    ADD CONSTRAINT owner_activity_timeline_pkey PRIMARY KEY (id);


--
-- Name: owner_balances owner_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_balances
    ADD CONSTRAINT owner_balances_pkey PRIMARY KEY (id);


--
-- Name: owner_charge_requests owner_charge_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_charge_requests
    ADD CONSTRAINT owner_charge_requests_pkey PRIMARY KEY (id);


--
-- Name: owner_documents owner_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_documents
    ADD CONSTRAINT owner_documents_pkey PRIMARY KEY (id);


--
-- Name: owner_financial_summary owner_financial_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_financial_summary
    ADD CONSTRAINT owner_financial_summary_pkey PRIMARY KEY (id);


--
-- Name: owner_invoices owner_invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_invoices
    ADD CONSTRAINT owner_invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: owner_invoices owner_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_invoices
    ADD CONSTRAINT owner_invoices_pkey PRIMARY KEY (id);


--
-- Name: owner_onboarding_processes owner_onboarding_processes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_onboarding_processes
    ADD CONSTRAINT owner_onboarding_processes_pkey PRIMARY KEY (id);


--
-- Name: owner_payout_requests owner_payout_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_payout_requests
    ADD CONSTRAINT owner_payout_requests_pkey PRIMARY KEY (id);


--
-- Name: owner_payouts owner_payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_payouts
    ADD CONSTRAINT owner_payouts_pkey PRIMARY KEY (id);


--
-- Name: owner_preferences owner_preferences_owner_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_preferences
    ADD CONSTRAINT owner_preferences_owner_id_key UNIQUE (owner_id);


--
-- Name: owner_preferences owner_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_preferences
    ADD CONSTRAINT owner_preferences_pkey PRIMARY KEY (id);


--
-- Name: owner_settings owner_settings_owner_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_settings
    ADD CONSTRAINT owner_settings_owner_id_key UNIQUE (owner_id);


--
-- Name: owner_settings owner_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_settings
    ADD CONSTRAINT owner_settings_pkey PRIMARY KEY (id);


--
-- Name: owner_timeline_activity owner_timeline_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_timeline_activity
    ADD CONSTRAINT owner_timeline_activity_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_setting_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_setting_key_unique UNIQUE (setting_key);


--
-- Name: pm_commission_balance pm_commission_balance_organization_id_manager_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_commission_balance
    ADD CONSTRAINT pm_commission_balance_organization_id_manager_id_key UNIQUE (organization_id, manager_id);


--
-- Name: pm_commission_balance pm_commission_balance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_commission_balance
    ADD CONSTRAINT pm_commission_balance_pkey PRIMARY KEY (id);


--
-- Name: pm_notifications pm_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_notifications
    ADD CONSTRAINT pm_notifications_pkey PRIMARY KEY (id);


--
-- Name: pm_payout_requests pm_payout_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_payout_requests
    ADD CONSTRAINT pm_payout_requests_pkey PRIMARY KEY (id);


--
-- Name: pm_property_performance pm_property_performance_organization_id_manager_id_property_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_property_performance
    ADD CONSTRAINT pm_property_performance_organization_id_manager_id_property_key UNIQUE (organization_id, manager_id, property_id, period);


--
-- Name: pm_property_performance pm_property_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_property_performance
    ADD CONSTRAINT pm_property_performance_pkey PRIMARY KEY (id);


--
-- Name: pm_task_logs pm_task_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_task_logs
    ADD CONSTRAINT pm_task_logs_pkey PRIMARY KEY (id);


--
-- Name: portfolio_assignments portfolio_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.portfolio_assignments
    ADD CONSTRAINT portfolio_assignments_pkey PRIMARY KEY (id);


--
-- Name: portfolio_health_scores portfolio_health_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.portfolio_health_scores
    ADD CONSTRAINT portfolio_health_scores_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: property_agents property_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_agents
    ADD CONSTRAINT property_agents_pkey PRIMARY KEY (id);


--
-- Name: property_chat_messages property_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_chat_messages
    ADD CONSTRAINT property_chat_messages_pkey PRIMARY KEY (id);


--
-- Name: property_custom_expenses property_custom_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_custom_expenses
    ADD CONSTRAINT property_custom_expenses_pkey PRIMARY KEY (id);


--
-- Name: property_documents property_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_documents
    ADD CONSTRAINT property_documents_pkey PRIMARY KEY (id);


--
-- Name: property_insurance property_insurance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_insurance
    ADD CONSTRAINT property_insurance_pkey PRIMARY KEY (id);


--
-- Name: property_investments property_investments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_investments
    ADD CONSTRAINT property_investments_pkey PRIMARY KEY (id);


--
-- Name: property_media_files property_media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_media_files
    ADD CONSTRAINT property_media_files_pkey PRIMARY KEY (id);


--
-- Name: property_media_settings property_media_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_media_settings
    ADD CONSTRAINT property_media_settings_pkey PRIMARY KEY (id);


--
-- Name: property_payout_rules property_payout_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_payout_rules
    ADD CONSTRAINT property_payout_rules_pkey PRIMARY KEY (id);


--
-- Name: property_referrals property_referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_referrals
    ADD CONSTRAINT property_referrals_pkey PRIMARY KEY (id);


--
-- Name: property_revenue_targets property_revenue_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_revenue_targets
    ADD CONSTRAINT property_revenue_targets_pkey PRIMARY KEY (id);


--
-- Name: property_reviews property_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_reviews
    ADD CONSTRAINT property_reviews_pkey PRIMARY KEY (id);


--
-- Name: property_status property_status_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_status
    ADD CONSTRAINT property_status_pkey PRIMARY KEY (id);


--
-- Name: property_utility_accounts property_utility_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_utility_accounts
    ADD CONSTRAINT property_utility_accounts_pkey PRIMARY KEY (id);


--
-- Name: property_utility_settings property_utility_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_utility_settings
    ADD CONSTRAINT property_utility_settings_pkey PRIMARY KEY (id);


--
-- Name: recurring_service_charges recurring_service_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recurring_service_charges
    ADD CONSTRAINT recurring_service_charges_pkey PRIMARY KEY (id);


--
-- Name: referral_earnings referral_earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referral_earnings
    ADD CONSTRAINT referral_earnings_pkey PRIMARY KEY (id);


--
-- Name: seasonal_forecasts seasonal_forecasts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.seasonal_forecasts
    ADD CONSTRAINT seasonal_forecasts_pkey PRIMARY KEY (id);


--
-- Name: security_deposits security_deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_deposits
    ADD CONSTRAINT security_deposits_pkey PRIMARY KEY (id);


--
-- Name: service_bookings service_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_bookings
    ADD CONSTRAINT service_bookings_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_reviews service_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_reviews
    ADD CONSTRAINT service_reviews_pkey PRIMARY KEY (id);


--
-- Name: service_vendor_analytics service_vendor_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_vendor_analytics
    ADD CONSTRAINT service_vendor_analytics_pkey PRIMARY KEY (id);


--
-- Name: service_vendors service_vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_vendors
    ADD CONSTRAINT service_vendors_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: shared_cost_splits shared_cost_splits_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shared_cost_splits
    ADD CONSTRAINT shared_cost_splits_pkey PRIMARY KEY (id);


--
-- Name: shared_costs shared_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shared_costs
    ADD CONSTRAINT shared_costs_pkey PRIMARY KEY (id);


--
-- Name: staff_salaries staff_salaries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_salaries
    ADD CONSTRAINT staff_salaries_pkey PRIMARY KEY (id);


--
-- Name: staff_skills staff_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_skills
    ADD CONSTRAINT staff_skills_pkey PRIMARY KEY (id);


--
-- Name: staff_workload_stats staff_workload_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_workload_stats
    ADD CONSTRAINT staff_workload_stats_pkey PRIMARY KEY (id);


--
-- Name: supply_orders supply_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.supply_orders
    ADD CONSTRAINT supply_orders_pkey PRIMARY KEY (id);


--
-- Name: sustainability_metrics sustainability_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sustainability_metrics
    ADD CONSTRAINT sustainability_metrics_pkey PRIMARY KEY (id);


--
-- Name: task_ai_scan_results task_ai_scan_results_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.task_ai_scan_results
    ADD CONSTRAINT task_ai_scan_results_pkey PRIMARY KEY (id);


--
-- Name: task_history task_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.task_history
    ADD CONSTRAINT task_history_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: tax_rules tax_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tax_rules
    ADD CONSTRAINT tax_rules_pkey PRIMARY KEY (id);


--
-- Name: upsell_recommendations upsell_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upsell_recommendations
    ADD CONSTRAINT upsell_recommendations_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: utility_bill_reminders utility_bill_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.utility_bill_reminders
    ADD CONSTRAINT utility_bill_reminders_pkey PRIMARY KEY (id);


--
-- Name: utility_bills utility_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.utility_bills
    ADD CONSTRAINT utility_bills_pkey PRIMARY KEY (id);


--
-- Name: utility_providers utility_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.utility_providers
    ADD CONSTRAINT utility_providers_pkey PRIMARY KEY (id);


--
-- Name: vendor_service_history vendor_service_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_service_history
    ADD CONSTRAINT vendor_service_history_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: welcome_pack_items welcome_pack_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.welcome_pack_items
    ADD CONSTRAINT welcome_pack_items_pkey PRIMARY KEY (id);


--
-- Name: welcome_pack_templates welcome_pack_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.welcome_pack_templates
    ADD CONSTRAINT welcome_pack_templates_pkey PRIMARY KEY (id);


--
-- Name: welcome_pack_usage welcome_pack_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.welcome_pack_usage
    ADD CONSTRAINT welcome_pack_usage_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_bot_logs whatsapp_bot_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.whatsapp_bot_logs
    ADD CONSTRAINT whatsapp_bot_logs_pkey PRIMARY KEY (id);


--
-- Name: IDX_api_key_org; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_api_key_org" ON public.organization_api_keys USING btree (organization_id);


--
-- Name: IDX_api_key_provider; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_api_key_provider" ON public.organization_api_keys USING btree (provider);


--
-- Name: IDX_property_external; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_property_external" ON public.properties USING btree (external_id);


--
-- Name: IDX_property_org; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_property_org" ON public.properties USING btree (organization_id);


--
-- Name: IDX_property_owner; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_property_owner" ON public.properties USING btree (owner_id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: IDX_session_org; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_org" ON public.sessions USING btree (organization_id);


--
-- Name: IDX_task_history_property; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_task_history_property" ON public.task_history USING btree (property_id);


--
-- Name: IDX_task_history_task; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_task_history_task" ON public.task_history USING btree (task_id);


--
-- Name: IDX_task_history_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_task_history_user" ON public.task_history USING btree (performed_by);


--
-- Name: IDX_user_email_org; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_user_email_org" ON public.users USING btree (email, organization_id);


--
-- Name: IDX_user_org; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_user_org" ON public.users USING btree (organization_id);


--
-- Name: idx_ai_roi_predictions_forecast_dates; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_ai_roi_predictions_forecast_dates ON public.ai_roi_predictions USING btree (forecast_start, forecast_end);


--
-- Name: idx_ai_roi_predictions_org_property; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_ai_roi_predictions_org_property ON public.ai_roi_predictions USING btree (organization_id, property_id);


--
-- Name: idx_commission_invoice_items_invoice; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_commission_invoice_items_invoice ON public.commission_invoice_items USING btree (invoice_id);


--
-- Name: idx_commission_invoice_items_org; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_commission_invoice_items_org ON public.commission_invoice_items USING btree (organization_id);


--
-- Name: idx_commission_invoices_agent; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_commission_invoices_agent ON public.commission_invoices USING btree (agent_id, agent_type);


--
-- Name: idx_commission_invoices_org; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_commission_invoices_org ON public.commission_invoices USING btree (organization_id);


--
-- Name: idx_commission_invoices_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_commission_invoices_status ON public.commission_invoices USING btree (status);


--
-- Name: idx_commission_log_agent; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_commission_log_agent ON public.commission_log USING btree (agent_id, agent_type);


--
-- Name: idx_commission_log_created; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_commission_log_created ON public.commission_log USING btree (created_at);


--
-- Name: idx_commission_log_org; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_commission_log_org ON public.commission_log USING btree (organization_id);


--
-- Name: idx_commission_log_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_commission_log_status ON public.commission_log USING btree (status);


--
-- Name: idx_owner_financial_summary_owner_period; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_owner_financial_summary_owner_period ON public.owner_financial_summary USING btree (organization_id, owner_id, period_start, period_end);


--
-- Name: idx_owner_payout_requests_owner_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_owner_payout_requests_owner_status ON public.owner_payout_requests USING btree (organization_id, owner_id, status);


--
-- Name: idx_owner_settings_owner; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_owner_settings_owner ON public.owner_settings USING btree (organization_id, owner_id);


--
-- Name: idx_owner_timeline_activity_owner_date; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_owner_timeline_activity_owner_date ON public.owner_timeline_activity USING btree (organization_id, owner_id, created_at DESC);


--
-- Name: idx_pm_commission_balance_org_manager; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pm_commission_balance_org_manager ON public.pm_commission_balance USING btree (organization_id, manager_id);


--
-- Name: idx_pm_notifications_org_manager; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pm_notifications_org_manager ON public.pm_notifications USING btree (organization_id, manager_id);


--
-- Name: idx_pm_payout_requests_org_manager; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pm_payout_requests_org_manager ON public.pm_payout_requests USING btree (organization_id, manager_id);


--
-- Name: idx_pm_property_performance_org_manager; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pm_property_performance_org_manager ON public.pm_property_performance USING btree (organization_id, manager_id);


--
-- Name: idx_pm_task_logs_org_manager; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pm_task_logs_org_manager ON public.pm_task_logs USING btree (organization_id, manager_id);


--
-- Name: idx_portfolio_assignments_org_manager; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_portfolio_assignments_org_manager ON public.portfolio_assignments USING btree (organization_id, manager_id);


--
-- Name: idx_portfolio_assignments_property; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_portfolio_assignments_property ON public.portfolio_assignments USING btree (property_id, is_active);


--
-- Name: addon_bookings addon_bookings_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addon_bookings
    ADD CONSTRAINT addon_bookings_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: addon_bookings addon_bookings_booked_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addon_bookings
    ADD CONSTRAINT addon_bookings_booked_by_users_id_fk FOREIGN KEY (booked_by) REFERENCES public.users(id);


--
-- Name: addon_bookings addon_bookings_booking_id_bookings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addon_bookings
    ADD CONSTRAINT addon_bookings_booking_id_bookings_id_fk FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: addon_bookings addon_bookings_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addon_bookings
    ADD CONSTRAINT addon_bookings_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: addon_bookings addon_bookings_service_id_addon_services_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addon_bookings
    ADD CONSTRAINT addon_bookings_service_id_addon_services_id_fk FOREIGN KEY (service_id) REFERENCES public.addon_services(id);


--
-- Name: agent_bookings agent_bookings_booking_id_bookings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_bookings
    ADD CONSTRAINT agent_bookings_booking_id_bookings_id_fk FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: agent_bookings agent_bookings_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_bookings
    ADD CONSTRAINT agent_bookings_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: agent_bookings agent_bookings_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_bookings
    ADD CONSTRAINT agent_bookings_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: agent_bookings agent_bookings_retail_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_bookings
    ADD CONSTRAINT agent_bookings_retail_agent_id_users_id_fk FOREIGN KEY (retail_agent_id) REFERENCES public.users(id);


--
-- Name: agent_payouts agent_payouts_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_payouts
    ADD CONSTRAINT agent_payouts_agent_id_users_id_fk FOREIGN KEY (agent_id) REFERENCES public.users(id);


--
-- Name: agent_payouts agent_payouts_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_payouts
    ADD CONSTRAINT agent_payouts_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: agent_payouts agent_payouts_processed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agent_payouts
    ADD CONSTRAINT agent_payouts_processed_by_users_id_fk FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: ai_configuration ai_configuration_last_updated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_configuration
    ADD CONSTRAINT ai_configuration_last_updated_by_users_id_fk FOREIGN KEY (last_updated_by) REFERENCES public.users(id);


--
-- Name: ai_configuration ai_configuration_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_configuration
    ADD CONSTRAINT ai_configuration_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: ai_generated_tasks ai_generated_tasks_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_generated_tasks
    ADD CONSTRAINT ai_generated_tasks_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.guest_messages(id);


--
-- Name: ai_roi_predictions ai_roi_predictions_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_roi_predictions
    ADD CONSTRAINT ai_roi_predictions_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: ai_task_rules ai_task_rules_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_task_rules
    ADD CONSTRAINT ai_task_rules_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: ai_task_rules ai_task_rules_default_assignee_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_task_rules
    ADD CONSTRAINT ai_task_rules_default_assignee_users_id_fk FOREIGN KEY (default_assignee) REFERENCES public.users(id);


--
-- Name: ai_task_rules ai_task_rules_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_task_rules
    ADD CONSTRAINT ai_task_rules_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: ai_virtual_managers ai_virtual_managers_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_virtual_managers
    ADD CONSTRAINT ai_virtual_managers_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: booking_cost_breakdowns booking_cost_breakdowns_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.booking_cost_breakdowns
    ADD CONSTRAINT booking_cost_breakdowns_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.service_bookings(id);


--
-- Name: booking_cost_breakdowns booking_cost_breakdowns_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.booking_cost_breakdowns
    ADD CONSTRAINT booking_cost_breakdowns_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: bookings bookings_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: bookings bookings_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: commission_invoice_items commission_invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.commission_invoice_items
    ADD CONSTRAINT commission_invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.commission_invoices(id) ON DELETE CASCADE;


--
-- Name: damage_reports damage_reports_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.damage_reports
    ADD CONSTRAINT damage_reports_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: damage_reports damage_reports_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.damage_reports
    ADD CONSTRAINT damage_reports_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: dynamic_pricing_recommendations dynamic_pricing_recommendations_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dynamic_pricing_recommendations
    ADD CONSTRAINT dynamic_pricing_recommendations_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: feedback_processing_log feedback_processing_log_created_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback_processing_log
    ADD CONSTRAINT feedback_processing_log_created_task_id_tasks_id_fk FOREIGN KEY (created_task_id) REFERENCES public.tasks(id);


--
-- Name: feedback_processing_log feedback_processing_log_feedback_id_guest_feedback_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback_processing_log
    ADD CONSTRAINT feedback_processing_log_feedback_id_guest_feedback_id_fk FOREIGN KEY (feedback_id) REFERENCES public.guest_feedback(id);


--
-- Name: feedback_processing_log feedback_processing_log_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback_processing_log
    ADD CONSTRAINT feedback_processing_log_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: feedback_processing_log feedback_processing_log_processed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback_processing_log
    ADD CONSTRAINT feedback_processing_log_processed_by_users_id_fk FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: feedback_processing_log feedback_processing_log_triggered_rule_id_ai_task_rules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback_processing_log
    ADD CONSTRAINT feedback_processing_log_triggered_rule_id_ai_task_rules_id_fk FOREIGN KEY (triggered_rule_id) REFERENCES public.ai_task_rules(id);


--
-- Name: finances finances_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT finances_agent_id_users_id_fk FOREIGN KEY (agent_id) REFERENCES public.users(id);


--
-- Name: finances finances_booking_id_bookings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT finances_booking_id_bookings_id_fk FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: finances finances_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT finances_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: finances finances_processed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT finances_processed_by_users_id_fk FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: finances finances_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.finances
    ADD CONSTRAINT finances_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: guest_addon_bookings guest_addon_bookings_cancelled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_addon_bookings
    ADD CONSTRAINT guest_addon_bookings_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.users(id);


--
-- Name: guest_id_scans guest_id_scans_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_id_scans
    ADD CONSTRAINT guest_id_scans_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: guest_portal_access guest_portal_access_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guest_portal_access
    ADD CONSTRAINT guest_portal_access_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: inventory inventory_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: invoice_line_items invoice_line_items_invoice_id_invoices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_invoice_id_invoices_id_fk FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: maintenance_budget_forecasts maintenance_budget_forecasts_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_budget_forecasts
    ADD CONSTRAINT maintenance_budget_forecasts_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: marketing_packs marketing_packs_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketing_packs
    ADD CONSTRAINT marketing_packs_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: marketplace_service_analytics marketplace_service_analytics_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketplace_service_analytics
    ADD CONSTRAINT marketplace_service_analytics_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: marketplace_service_analytics marketplace_service_analytics_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketplace_service_analytics
    ADD CONSTRAINT marketplace_service_analytics_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: marketplace_service_analytics marketplace_service_analytics_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketplace_service_analytics
    ADD CONSTRAINT marketplace_service_analytics_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.marketplace_services(id);


--
-- Name: marketplace_services marketplace_services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketplace_services
    ADD CONSTRAINT marketplace_services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id);


--
-- Name: marketplace_services marketplace_services_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketplace_services
    ADD CONSTRAINT marketplace_services_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: notification_preferences notification_preferences_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: onboarding_step_details onboarding_step_details_completed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.onboarding_step_details
    ADD CONSTRAINT onboarding_step_details_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.users(id);


--
-- Name: onboarding_step_details onboarding_step_details_onboarding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.onboarding_step_details
    ADD CONSTRAINT onboarding_step_details_onboarding_id_fkey FOREIGN KEY (onboarding_id) REFERENCES public.owner_onboarding_processes(id);


--
-- Name: onboarding_step_details onboarding_step_details_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.onboarding_step_details
    ADD CONSTRAINT onboarding_step_details_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: organization_api_keys organization_api_keys_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organization_api_keys
    ADD CONSTRAINT organization_api_keys_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: owner_activity_timeline owner_activity_timeline_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_activity_timeline
    ADD CONSTRAINT owner_activity_timeline_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: owner_activity_timeline owner_activity_timeline_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_activity_timeline
    ADD CONSTRAINT owner_activity_timeline_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: owner_activity_timeline owner_activity_timeline_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_activity_timeline
    ADD CONSTRAINT owner_activity_timeline_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: owner_activity_timeline owner_activity_timeline_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_activity_timeline
    ADD CONSTRAINT owner_activity_timeline_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: owner_balances owner_balances_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_balances
    ADD CONSTRAINT owner_balances_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: owner_charge_requests owner_charge_requests_charged_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_charge_requests
    ADD CONSTRAINT owner_charge_requests_charged_by_fkey FOREIGN KEY (charged_by) REFERENCES public.users(id);


--
-- Name: owner_charge_requests owner_charge_requests_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_charge_requests
    ADD CONSTRAINT owner_charge_requests_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: owner_documents owner_documents_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_documents
    ADD CONSTRAINT owner_documents_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: owner_documents owner_documents_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_documents
    ADD CONSTRAINT owner_documents_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: owner_documents owner_documents_process_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_documents
    ADD CONSTRAINT owner_documents_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.owner_onboarding_processes(id);


--
-- Name: owner_documents owner_documents_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_documents
    ADD CONSTRAINT owner_documents_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: owner_documents owner_documents_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_documents
    ADD CONSTRAINT owner_documents_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: owner_documents owner_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_documents
    ADD CONSTRAINT owner_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: owner_financial_summary owner_financial_summary_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_financial_summary
    ADD CONSTRAINT owner_financial_summary_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: owner_invoices owner_invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_invoices
    ADD CONSTRAINT owner_invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: owner_invoices owner_invoices_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_invoices
    ADD CONSTRAINT owner_invoices_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: owner_invoices owner_invoices_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_invoices
    ADD CONSTRAINT owner_invoices_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: owner_invoices owner_invoices_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_invoices
    ADD CONSTRAINT owner_invoices_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: owner_onboarding_processes owner_onboarding_processes_deadline_set_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_onboarding_processes
    ADD CONSTRAINT owner_onboarding_processes_deadline_set_by_fkey FOREIGN KEY (deadline_set_by) REFERENCES public.users(id);


--
-- Name: owner_onboarding_processes owner_onboarding_processes_last_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_onboarding_processes
    ADD CONSTRAINT owner_onboarding_processes_last_updated_by_fkey FOREIGN KEY (last_updated_by) REFERENCES public.users(id);


--
-- Name: owner_onboarding_processes owner_onboarding_processes_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_onboarding_processes
    ADD CONSTRAINT owner_onboarding_processes_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: owner_onboarding_processes owner_onboarding_processes_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_onboarding_processes
    ADD CONSTRAINT owner_onboarding_processes_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: owner_onboarding_processes owner_onboarding_processes_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_onboarding_processes
    ADD CONSTRAINT owner_onboarding_processes_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: owner_payout_requests owner_payout_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_payout_requests
    ADD CONSTRAINT owner_payout_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: owner_payout_requests owner_payout_requests_completed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_payout_requests
    ADD CONSTRAINT owner_payout_requests_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.users(id);


--
-- Name: owner_payout_requests owner_payout_requests_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_payout_requests
    ADD CONSTRAINT owner_payout_requests_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: owner_payout_requests owner_payout_requests_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_payout_requests
    ADD CONSTRAINT owner_payout_requests_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: owner_payout_requests owner_payout_requests_payment_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_payout_requests
    ADD CONSTRAINT owner_payout_requests_payment_uploaded_by_fkey FOREIGN KEY (payment_uploaded_by) REFERENCES public.users(id);


--
-- Name: owner_preferences owner_preferences_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_preferences
    ADD CONSTRAINT owner_preferences_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: owner_preferences owner_preferences_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_preferences
    ADD CONSTRAINT owner_preferences_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: owner_timeline_activity owner_timeline_activity_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.owner_timeline_activity
    ADD CONSTRAINT owner_timeline_activity_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: platform_settings platform_settings_updated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_updated_by_users_id_fk FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: portfolio_assignments portfolio_assignments_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.portfolio_assignments
    ADD CONSTRAINT portfolio_assignments_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: portfolio_health_scores portfolio_health_scores_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.portfolio_health_scores
    ADD CONSTRAINT portfolio_health_scores_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: properties properties_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: properties properties_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: property_agents property_agents_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_agents
    ADD CONSTRAINT property_agents_agent_id_users_id_fk FOREIGN KEY (agent_id) REFERENCES public.users(id);


--
-- Name: property_agents property_agents_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_agents
    ADD CONSTRAINT property_agents_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: property_agents property_agents_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_agents
    ADD CONSTRAINT property_agents_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: property_chat_messages property_chat_messages_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_chat_messages
    ADD CONSTRAINT property_chat_messages_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: property_custom_expenses property_custom_expenses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_custom_expenses
    ADD CONSTRAINT property_custom_expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.custom_expense_categories(id);


--
-- Name: property_documents property_documents_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_documents
    ADD CONSTRAINT property_documents_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: property_insurance property_insurance_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_insurance
    ADD CONSTRAINT property_insurance_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: property_investments property_investments_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_investments
    ADD CONSTRAINT property_investments_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: property_payout_rules property_payout_rules_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_payout_rules
    ADD CONSTRAINT property_payout_rules_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: property_referrals property_referrals_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_referrals
    ADD CONSTRAINT property_referrals_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: property_referrals property_referrals_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_referrals
    ADD CONSTRAINT property_referrals_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: property_referrals property_referrals_referral_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_referrals
    ADD CONSTRAINT property_referrals_referral_agent_id_users_id_fk FOREIGN KEY (referral_agent_id) REFERENCES public.users(id);


--
-- Name: property_reviews property_reviews_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_reviews
    ADD CONSTRAINT property_reviews_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: property_status property_status_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_status
    ADD CONSTRAINT property_status_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: property_utility_accounts property_utility_accounts_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_utility_accounts
    ADD CONSTRAINT property_utility_accounts_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: property_utility_settings property_utility_settings_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.property_utility_settings
    ADD CONSTRAINT property_utility_settings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.utility_providers(id);


--
-- Name: recurring_service_charges recurring_service_charges_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.recurring_service_charges
    ADD CONSTRAINT recurring_service_charges_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: referral_earnings referral_earnings_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referral_earnings
    ADD CONSTRAINT referral_earnings_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: referral_earnings referral_earnings_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referral_earnings
    ADD CONSTRAINT referral_earnings_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: referral_earnings referral_earnings_referral_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referral_earnings
    ADD CONSTRAINT referral_earnings_referral_agent_id_users_id_fk FOREIGN KEY (referral_agent_id) REFERENCES public.users(id);


--
-- Name: seasonal_forecasts seasonal_forecasts_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.seasonal_forecasts
    ADD CONSTRAINT seasonal_forecasts_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: security_deposits security_deposits_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_deposits
    ADD CONSTRAINT security_deposits_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: security_deposits security_deposits_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_deposits
    ADD CONSTRAINT security_deposits_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: service_bookings service_bookings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_bookings
    ADD CONSTRAINT service_bookings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: service_bookings service_bookings_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_bookings
    ADD CONSTRAINT service_bookings_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: service_bookings service_bookings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_bookings
    ADD CONSTRAINT service_bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.marketplace_services(id);


--
-- Name: service_categories service_categories_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: service_reviews service_reviews_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_reviews
    ADD CONSTRAINT service_reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.service_bookings(id);


--
-- Name: service_reviews service_reviews_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_reviews
    ADD CONSTRAINT service_reviews_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: service_reviews service_reviews_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_reviews
    ADD CONSTRAINT service_reviews_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.marketplace_services(id);


--
-- Name: service_reviews service_reviews_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_reviews
    ADD CONSTRAINT service_reviews_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.service_vendors(id);


--
-- Name: service_vendor_analytics service_vendor_analytics_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_vendor_analytics
    ADD CONSTRAINT service_vendor_analytics_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: service_vendor_analytics service_vendor_analytics_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_vendor_analytics
    ADD CONSTRAINT service_vendor_analytics_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.service_vendors(id);


--
-- Name: service_vendors service_vendors_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_vendors
    ADD CONSTRAINT service_vendors_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: sessions sessions_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: shared_cost_splits shared_cost_splits_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shared_cost_splits
    ADD CONSTRAINT shared_cost_splits_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: shared_cost_splits shared_cost_splits_shared_cost_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shared_cost_splits
    ADD CONSTRAINT shared_cost_splits_shared_cost_id_fkey FOREIGN KEY (shared_cost_id) REFERENCES public.shared_costs(id) ON DELETE CASCADE;


--
-- Name: staff_skills staff_skills_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_skills
    ADD CONSTRAINT staff_skills_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id);


--
-- Name: staff_workload_stats staff_workload_stats_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_workload_stats
    ADD CONSTRAINT staff_workload_stats_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id);


--
-- Name: supply_orders supply_orders_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.supply_orders
    ADD CONSTRAINT supply_orders_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: supply_orders supply_orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.supply_orders
    ADD CONSTRAINT supply_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: sustainability_metrics sustainability_metrics_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sustainability_metrics
    ADD CONSTRAINT sustainability_metrics_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: task_ai_scan_results task_ai_scan_results_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.task_ai_scan_results
    ADD CONSTRAINT task_ai_scan_results_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: task_history task_history_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.task_history
    ADD CONSTRAINT task_history_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: task_history task_history_performed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.task_history
    ADD CONSTRAINT task_history_performed_by_users_id_fk FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- Name: task_history task_history_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.task_history
    ADD CONSTRAINT task_history_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: task_history task_history_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.task_history
    ADD CONSTRAINT task_history_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: tasks tasks_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: tasks tasks_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: tasks tasks_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: tasks tasks_parent_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_parent_task_id_tasks_id_fk FOREIGN KEY (parent_task_id) REFERENCES public.tasks(id);


--
-- Name: tasks tasks_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: upsell_recommendations upsell_recommendations_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upsell_recommendations
    ADD CONSTRAINT upsell_recommendations_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: users users_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: utility_bill_reminders utility_bill_reminders_utility_bill_id_utility_bills_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.utility_bill_reminders
    ADD CONSTRAINT utility_bill_reminders_utility_bill_id_utility_bills_id_fk FOREIGN KEY (utility_bill_id) REFERENCES public.utility_bills(id) ON DELETE CASCADE;


--
-- Name: utility_bills utility_bills_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.utility_bills
    ADD CONSTRAINT utility_bills_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: utility_bills utility_bills_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.utility_bills
    ADD CONSTRAINT utility_bills_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: vendor_service_history vendor_service_history_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_service_history
    ADD CONSTRAINT vendor_service_history_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: vendor_service_history vendor_service_history_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_service_history
    ADD CONSTRAINT vendor_service_history_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: vendor_service_history vendor_service_history_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_service_history
    ADD CONSTRAINT vendor_service_history_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.marketplace_services(id);


--
-- Name: vendor_service_history vendor_service_history_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_service_history
    ADD CONSTRAINT vendor_service_history_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.service_vendors(id);


--
-- Name: welcome_pack_templates welcome_pack_templates_item_id_welcome_pack_items_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.welcome_pack_templates
    ADD CONSTRAINT welcome_pack_templates_item_id_welcome_pack_items_id_fk FOREIGN KEY (item_id) REFERENCES public.welcome_pack_items(id);


--
-- Name: welcome_pack_templates welcome_pack_templates_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.welcome_pack_templates
    ADD CONSTRAINT welcome_pack_templates_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: welcome_pack_usage welcome_pack_usage_booking_id_bookings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.welcome_pack_usage
    ADD CONSTRAINT welcome_pack_usage_booking_id_bookings_id_fk FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: welcome_pack_usage welcome_pack_usage_item_id_welcome_pack_items_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.welcome_pack_usage
    ADD CONSTRAINT welcome_pack_usage_item_id_welcome_pack_items_id_fk FOREIGN KEY (item_id) REFERENCES public.welcome_pack_items(id);


--
-- Name: welcome_pack_usage welcome_pack_usage_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.welcome_pack_usage
    ADD CONSTRAINT welcome_pack_usage_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

