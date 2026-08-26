import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core";

// ─── Users & auth ────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    /** guest sessions have no userId; they can be claimed at signup */
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  preferredLanguage: text("preferred_language", { enum: ["en", "de", "fr", "it"] })
    .notNull()
    .default("en"),
  canton: text("canton"),
  municipality: text("municipality"),
  nationalityCategory: text("nationality_category", {
    enum: ["swiss", "eu_efta", "third_country"],
  }),
  residencePermit: text("residence_permit", { enum: ["none", "L", "B", "C", "other"] }),
  employmentStatus: text("employment_status", {
    enum: ["employed", "self_employed", "student", "unemployed", "retired", "other"],
  }),
  hasVehicle: boolean("has_vehicle"),
  hasChildren: boolean("has_children"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Jurisdictions & authorities ─────────────────────────────────────────────

export const jurisdictions = pgTable(
  "jurisdictions",
  {
    id: text("id").primaryKey(), // "CH", "CH-ZH", "CH-BS", "CH-BS-basel"
    level: text("level", { enum: ["federal", "cantonal", "municipal"] }).notNull(),
    name: text("name").notNull(),
    canton: text("canton"), // canton code, e.g. "ZH"
    municipality: text("municipality"),
    parentId: text("parent_id"),
  },
  (t) => [index("jurisdictions_parent_idx").on(t.parentId)],
);

export const authorities = pgTable(
  "authorities",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    level: text("level", {
      enum: ["federal", "cantonal", "municipal", "private_public_service"],
    }).notNull(),
    canton: text("canton"),
    municipality: text("municipality"),
    officialDomain: text("official_domain").notNull(),
    /** service tags, e.g. ["residence_registration", "vehicle_registration"] */
    supportedServices: jsonb("supported_services").$type<string[]>().notNull().default([]),
  },
  (t) => [index("authorities_level_idx").on(t.level, t.canton)],
);

// ─── Sources (source-first architecture) ─────────────────────────────────────

export const sources = pgTable(
  "sources",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    authorityId: text("authority_id").references(() => authorities.id),
    authorityName: text("authority_name").notNull(),
    authorityLevel: text("authority_level", {
      enum: ["federal", "cantonal", "municipal", "private_public_service"],
    }).notNull(),
    canton: text("canton"),
    municipality: text("municipality"),
    country: text("country").notNull().default("CH"),
    url: text("url").notNull(),
    sourceType: text("source_type", {
      enum: [
        "federal_government",
        "canton",
        "commune",
        "federal_law",
        "ordinance",
        "official_service_portal",
        "official_public_institution",
        "official_open_data",
      ],
    }).notNull(),
    language: text("language", { enum: ["en", "de", "fr", "it"] }).notNull().default("en"),
    /** life-event tags this source informs, e.g. ["move_between_cantons"] */
    eventTags: jsonb("event_tags").$type<string[]>().notNull().default([]),
    publishedAt: timestamp("published_at"),
    updatedAt: timestamp("updated_at"),
    fetchedAt: timestamp("fetched_at"),
    lastVerifiedAt: timestamp("last_verified_at"),
    validFrom: timestamp("valid_from"),
    validUntil: timestamp("valid_until"),
    checksum: text("checksum"),
    /** raw fetched content (sanitised) */
    content: text("content"),
    extractedText: text("extracted_text"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    /**
     * Honesty flag — critical. "verified" only after a human reviewed the
     * fetched content. Seed data ships as "seed_demo" and the UI labels it.
     */
    verification: text("verification", {
      enum: ["verified", "pending_review", "seed_demo", "stale", "disabled"],
    })
      .notNull()
      .default("pending_review"),
    /** how often the scheduled refetch re-checks this source for changes */
    refreshIntervalDays: integer("refresh_interval_days").notNull().default(30),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("sources_url_idx").on(t.url),
    index("sources_verification_idx").on(t.verification),
  ],
);

export const sourceChunks = pgTable(
  "source_chunks",
  {
    id: text("id").primaryKey(),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  },
  (t) => [index("source_chunks_source_idx").on(t.sourceId)],
);

export const sourceChangeEvents = pgTable(
  "source_change_events",
  {
    id: text("id").primaryKey(),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    detectedAt: timestamp("detected_at").notNull().defaultNow(),
    previousChecksum: text("previous_checksum"),
    newChecksum: text("new_checksum"),
    diffSummary: text("diff_summary"),
    aiChangeAssessment: text("ai_change_assessment"),
    status: text("status", { enum: ["pending_review", "accepted", "dismissed"] })
      .notNull()
      .default("pending_review"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
  },
  (t) => [index("source_changes_status_idx").on(t.status)],
);

// ─── Rules engine ────────────────────────────────────────────────────────────

export const rules = pgTable(
  "rules",
  {
    id: text("id").primaryKey(),
    eventType: text("event_type").notNull(),
    /** jurisdiction id: "CH" federal, "CH-BS" cantonal, ... */
    jurisdiction: text("jurisdiction").notNull().default("CH"),
    /** JSON condition tree evaluated by the deterministic engine */
    conditions: jsonb("conditions").$type<unknown>().notNull(),
    /** task templates emitted when conditions match */
    actions: jsonb("actions").$type<unknown>().notNull(),
    sourceIds: jsonb("source_ids").$type<string[]>().notNull().default([]),
    validFrom: timestamp("valid_from"),
    validUntil: timestamp("valid_until"),
    version: integer("version").notNull().default(1),
    active: boolean("active").notNull().default(true),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("rules_event_idx").on(t.eventType, t.active)],
);

// ─── Life events, tasks, conversations ───────────────────────────────────────

export const lifeEvents = pgTable(
  "life_events",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").references(() => sessions.id, { onDelete: "set null" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    originalQuery: text("original_query"),
    /** structured facts collected (entities + clarification answers) */
    facts: jsonb("facts").$type<Record<string, string>>().notNull().default({}),
    /** clarification questions still open */
    pendingFacts: jsonb("pending_facts").$type<string[]>().notNull().default([]),
    status: text("status", { enum: ["clarifying", "active", "completed", "archived"] })
      .notNull()
      .default("clarifying"),
    classificationConfidence: real("classification_confidence"),
    language: text("language", { enum: ["en", "de", "fr", "it"] }).notNull().default("en"),
    eventDate: timestamp("event_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("life_events_user_idx").on(t.userId),
    index("life_events_session_idx").on(t.sessionId),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => lifeEvents.id, { onDelete: "cascade" }),
    ruleId: text("rule_id"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull().default("general"),
    /** required | may_apply | recommended | information */
    priority: text("priority", {
      enum: ["required", "may_apply", "recommended", "information"],
    })
      .notNull()
      .default("information"),
    required: boolean("required").notNull().default(false),
    deadline: timestamp("deadline"),
    deadlineType: text("deadline_type", { enum: ["fixed", "relative", "unknown"] }),
    deadlineLabel: text("deadline_label"),
    authorityName: text("authority_name"),
    authorityLevel: text("authority_level", {
      enum: ["federal", "cantonal", "municipal", "private_public_service"],
    }),
    officialUrl: text("official_url"),
    sourceIds: jsonb("source_ids").$type<string[]>().notNull().default([]),
    documentsRequired: jsonb("documents_required").$type<string[]>().notNull().default([]),
    status: text("status", {
      enum: ["todo", "in_progress", "completed", "not_applicable"],
    })
      .notNull()
      .default("todo"),
    confidence: real("confidence").notNull().default(1),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("tasks_event_idx").on(t.eventId)],
);

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").references(() => lifeEvents.id, { onDelete: "cascade" }),
    sessionId: text("session_id"),
    userId: text("user_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("conversations_event_idx").on(t.eventId)],
);

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
    content: text("content").notNull(),
    /** structured payload (classification result, task refs, citations) */
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId)],
);

export const citations = pgTable(
  "citations",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id").references(() => tasks.id, { onDelete: "cascade" }),
    messageId: text("message_id").references(() => messages.id, { onDelete: "cascade" }),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    excerpt: text("excerpt"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("citations_task_idx").on(t.taskId)],
);

export const savedServices = pgTable("saved_services", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  authorityName: text("authority_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Reminders (architecture now, delivery later) ────────────────────────────

export const reminders = pgTable(
  "reminders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: text("task_id").references(() => tasks.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => lifeEvents.id, { onDelete: "cascade" }),
    remindAt: timestamp("remind_at").notNull(),
    channel: text("channel", { enum: ["email", "push", "none"] }).notNull().default("none"),
    message: text("message").notNull(),
    status: text("status", { enum: ["scheduled", "sent", "cancelled"] })
      .notNull()
      .default("scheduled"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("reminders_user_idx").on(t.userId, t.status)],
);

// ─── Uploaded documents ("what does this letter mean?") ─────────────────────

export const documents = pgTable(
  "documents",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").references(() => sessions.id, { onDelete: "set null" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    /** extracted text — stored so the user can revisit the analysis; deletable */
    extractedText: text("extracted_text"),
    /** structured analysis: authority match, dates, amounts, suggested event */
    analysis: jsonb("analysis").$type<Record<string, unknown>>().notNull().default({}),
    eventId: text("event_id").references(() => lifeEvents.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("documents_user_idx").on(t.userId), index("documents_session_idx").on(t.sessionId)],
);

// ─── Privacy-respecting analytics ────────────────────────────────────────────

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: text("id").primaryKey(),
    /** e.g. "search", "event_classified", "task_completed", "source_clicked",
     *  "clarification_asked", "unanswered_query" */
    name: text("name").notNull(),
    /** coarse, non-sensitive properties only (event type, canton, counts) */
    props: jsonb("props").$type<Record<string, string | number | boolean>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("analytics_name_idx").on(t.name, t.createdAt)],
);
