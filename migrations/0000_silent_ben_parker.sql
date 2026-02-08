CREATE TABLE "admin_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"action" varchar(255),
	"path" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_backtests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"symbols" jsonb NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"initial_capital" numeric(20, 2) NOT NULL,
	"final_capital" numeric(20, 2),
	"total_return" numeric(10, 2),
	"cagr" numeric(10, 2),
	"sharpe_ratio" numeric(10, 4),
	"max_drawdown" numeric(10, 2),
	"win_rate" numeric(5, 2),
	"avg_win" numeric(10, 2),
	"avg_loss" numeric(10, 2),
	"total_trades" integer,
	"winning_trades" integer,
	"losing_trades" integer,
	"parameters" jsonb,
	"equity_curve" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"prediction_date" timestamp DEFAULT now(),
	"target_date" timestamp NOT NULL,
	"predicted_return" numeric(10, 4),
	"direction" text NOT NULL,
	"confidence" numeric(5, 2) NOT NULL,
	"profit_potential" numeric(10, 2),
	"risk_level" numeric(10, 2),
	"profit_risk_ratio" numeric(5, 2),
	"timeframe_days" integer NOT NULL,
	"meets_criteria" boolean DEFAULT false,
	"technical_score" numeric(5, 2),
	"fundamental_score" numeric(5, 2),
	"sentiment_score" numeric(5, 2),
	"features" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_scans" (
	"id" serial PRIMARY KEY NOT NULL,
	"scan_date" timestamp DEFAULT now(),
	"total_stocks_scanned" integer NOT NULL,
	"total_datapoints" integer,
	"filtered_count" integer,
	"top_signals_count" integer,
	"scan_duration_ms" integer,
	"criteria" jsonb,
	"results" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"signal_type" text NOT NULL,
	"entry_price" numeric(10, 2),
	"target_price" numeric(10, 2),
	"stop_loss" numeric(10, 2),
	"confidence" numeric(5, 2) NOT NULL,
	"composite_score" numeric(10, 4),
	"rsi" numeric(5, 2),
	"macd" numeric(10, 4),
	"macd_signal" numeric(10, 4),
	"macd_hist" numeric(10, 4),
	"ma20" numeric(10, 2),
	"ma50" numeric(10, 2),
	"bollinger_upper" numeric(10, 2),
	"bollinger_lower" numeric(10, 2),
	"atr" numeric(10, 4),
	"reasoning" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_stocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"exchange" text,
	"sector" text,
	"industry" text,
	"market_cap" bigint,
	"current_price" numeric(10, 2),
	"volume" bigint,
	"avg_volume" bigint,
	"last_updated" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	CONSTRAINT "ai_stocks_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "ai_trader_portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"description" text,
	"total_value" numeric(20, 2) DEFAULT '0',
	"cash_balance" numeric(20, 2) DEFAULT '0',
	"total_gain_loss" numeric(20, 2) DEFAULT '0',
	"total_gain_loss_percent" numeric(10, 4) DEFAULT '0',
	"risk_score" integer DEFAULT 50,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_trader_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer,
	"symbol" text NOT NULL,
	"asset_type" text NOT NULL,
	"shares" numeric(20, 8) NOT NULL,
	"avg_cost" numeric(20, 8) NOT NULL,
	"current_price" numeric(20, 8),
	"market_value" numeric(20, 2),
	"gain_loss" numeric(20, 2),
	"gain_loss_percent" numeric(10, 4),
	"vq_value" numeric(20, 8),
	"vq_percent" numeric(10, 4),
	"stop_loss_price" numeric(20, 8),
	"health_zone" text,
	"health_status" text,
	"last_analyzed" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_trader_watchlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"symbol" text NOT NULL,
	"asset_type" text NOT NULL,
	"notes" text,
	"alert_price" numeric(20, 8),
	"alert_type" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_watchlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"watchlist_id" integer NOT NULL,
	"symbol" text NOT NULL,
	"added_at" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "ai_watchlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alert_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"alert_id" integer,
	"user_id" integer,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"symbol" varchar(50) NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"triggered_value" numeric(20, 8),
	"target_value" numeric(20, 8),
	"notification_channel" varchar(20) NOT NULL,
	"is_read" boolean DEFAULT false,
	"is_sent" boolean DEFAULT false,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "asset_correlations" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol_a" text NOT NULL,
	"symbol_b" text NOT NULL,
	"correlation" numeric(5, 4) NOT NULL,
	"correlation_period_days" integer DEFAULT 30 NOT NULL,
	"last_calculated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "automated_trade_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"rule_id" integer,
	"connection_id" integer,
	"order_id" integer,
	"symbol" varchar(50) NOT NULL,
	"side" varchar(10) NOT NULL,
	"execution_type" varchar(20) NOT NULL,
	"triggered_conditions" jsonb,
	"quantity" numeric(20, 8) NOT NULL,
	"entry_price" numeric(20, 8),
	"exit_price" numeric(20, 8),
	"stop_loss" numeric(20, 8),
	"take_profit" numeric(20, 8),
	"pnl" numeric(20, 2),
	"pnl_percent" numeric(10, 4),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"executed_at" timestamp DEFAULT now(),
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "automated_trading_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"symbol" varchar(50) NOT NULL,
	"asset_type" varchar(20) NOT NULL,
	"connection_id" integer,
	"entry_conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"exit_conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"position_size_type" varchar(20) DEFAULT 'fixed' NOT NULL,
	"position_size" numeric(20, 8) NOT NULL,
	"max_position_value" numeric(20, 2),
	"stop_loss_type" varchar(20) DEFAULT 'percentage' NOT NULL,
	"stop_loss_value" numeric(10, 4) NOT NULL,
	"take_profit_type" varchar(20),
	"take_profit_value" numeric(10, 4),
	"trailing_stop_activation" numeric(10, 4),
	"trailing_stop_distance" numeric(10, 4),
	"max_daily_loss" numeric(20, 2),
	"max_daily_trades" integer,
	"trading_hours_start" varchar(10),
	"trading_hours_end" varchar(10),
	"trading_days" text[] DEFAULT '{"monday","tuesday","wednesday","thursday","friday"}',
	"timezone" varchar(50) DEFAULT 'America/New_York',
	"is_active" boolean DEFAULT false,
	"is_paper_trading" boolean DEFAULT true,
	"last_triggered_at" timestamp,
	"next_check_at" timestamp,
	"today_trade_count" integer DEFAULT 0,
	"today_pnl" numeric(20, 2) DEFAULT '0',
	"total_trades" integer DEFAULT 0,
	"winning_trades" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cms_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" varchar(500) NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_by" varchar(255),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cms_content_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"instructor" varchar(255) NOT NULL,
	"duration" varchar(50) NOT NULL,
	"level" varchar(20) NOT NULL,
	"category" varchar(100) NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"students" integer DEFAULT 0,
	"description" text NOT NULL,
	"lessons" integer DEFAULT 0,
	"completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crypto_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"category" varchar(100) NOT NULL,
	"stage" varchar(20) NOT NULL,
	"market_cap" bigint DEFAULT 0,
	"price_change" numeric(8, 2) DEFAULT '0',
	"use_case" text NOT NULL,
	"description" text NOT NULL,
	"fundamental_score" integer NOT NULL,
	"risk_level" varchar(10) NOT NULL,
	"launch_date" date NOT NULL,
	"exchanges" text[],
	"features" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" varchar(255) NOT NULL,
	"symbol" varchar(50) NOT NULL,
	"asset_type" varchar(20) DEFAULT 'stock' NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"condition" varchar(50) NOT NULL,
	"target_value" numeric(20, 8) NOT NULL,
	"secondary_value" numeric(20, 8),
	"indicator_period" integer,
	"notify_email" boolean DEFAULT true,
	"notify_push" boolean DEFAULT true,
	"notify_in_app" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"is_triggered" boolean DEFAULT false,
	"trigger_count" integer DEFAULT 0,
	"repeat_alert" boolean DEFAULT false,
	"cooldown_minutes" integer DEFAULT 60,
	"last_triggered_at" timestamp,
	"last_checked_at" timestamp,
	"last_value" numeric(20, 8),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "defi_protocols" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"chain" text NOT NULL,
	"category" text NOT NULL,
	"min_apr" numeric(5, 2) NOT NULL,
	"max_apr" numeric(5, 2) NOT NULL,
	"tvl" numeric(20, 2) NOT NULL,
	"risk_level" text NOT NULL,
	"description" text,
	"logo_url" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "enhanced_backtest_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"strategy_slug" varchar(100) NOT NULL,
	"timeframe" varchar(50) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"initial_capital" numeric(20, 8) NOT NULL,
	"final_capital" numeric(20, 8) NOT NULL,
	"total_return" numeric(10, 4) NOT NULL,
	"total_trades" integer NOT NULL,
	"winning_trades" integer NOT NULL,
	"losing_trades" integer NOT NULL,
	"win_rate" numeric(5, 2) NOT NULL,
	"max_drawdown" numeric(10, 4) NOT NULL,
	"sharpe_ratio" numeric(5, 3),
	"profit_factor" numeric(5, 3),
	"avg_win" numeric(10, 4),
	"avg_loss" numeric(10, 4),
	"max_win" numeric(10, 4),
	"max_loss" numeric(10, 4),
	"trade_details" jsonb,
	"performance_chart" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enhanced_saved_strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"strategy_slug" varchar(100) NOT NULL,
	"custom_name" varchar(255),
	"personal_notes" text,
	"custom_settings" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enhanced_training_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategy_id" integer,
	"module_number" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"content" jsonb,
	"video_url" varchar(500),
	"duration" varchar(50) NOT NULL,
	"duration_minutes" integer NOT NULL,
	"is_required" boolean DEFAULT true,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enhanced_training_strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"risk" varchar(20) NOT NULL,
	"roi_range" varchar(50),
	"tags" text[],
	"training_url" varchar(500),
	"pdf_url" varchar(500),
	"track_id" varchar(255),
	"first_module_slug" varchar(255),
	"is_active" boolean DEFAULT true,
	"group_id" varchar(100),
	"variant_key" varchar(50),
	"sort_order" integer DEFAULT 0,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "enhanced_training_strategies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enhanced_user_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"strategy_slug" varchar(100) NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"trigger_conditions" jsonb,
	"is_active" boolean DEFAULT true,
	"is_triggered" boolean DEFAULT false,
	"triggered_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enhanced_user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"module_id" integer,
	"strategy_slug" varchar(100) NOT NULL,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"time_spent_minutes" integer DEFAULT 0,
	"quiz_score" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exit_strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"strategy_id" integer,
	"exit_type" text NOT NULL,
	"target_price" numeric(20, 8),
	"percentage_to_sell" numeric(5, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forex_trading_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"duration" varchar(50) NOT NULL,
	"difficulty" varchar(20) NOT NULL,
	"description" text NOT NULL,
	"learning_objectives" text[],
	"detailed_content" text,
	"resources" text,
	"practical_exercises" text[],
	"assessment_questions" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "forex_trading_lessons_lesson_id_unique" UNIQUE("lesson_id")
);
--> statement-breakpoint
CREATE TABLE "futures_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"current_price" numeric(12, 4) NOT NULL,
	"day_open" numeric(12, 4),
	"day_high" numeric(12, 4),
	"day_low" numeric(12, 4),
	"prev_close" numeric(12, 4),
	"volume" bigint,
	"open_interest" bigint,
	"atr" numeric(10, 4),
	"rsi" numeric(5, 2),
	"macd_line" numeric(10, 4),
	"macd_signal" numeric(10, 4),
	"macd_histogram" numeric(10, 4),
	"ema9" numeric(12, 4),
	"ema20" numeric(12, 4),
	"ema50" numeric(12, 4),
	"trend" text,
	"volatility" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "futures_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"exchange" text NOT NULL,
	"contract_size" numeric(10, 2) NOT NULL,
	"tick_size" numeric(10, 4) NOT NULL,
	"tick_value" numeric(10, 2) NOT NULL,
	"margin_requirement" numeric(12, 2) NOT NULL,
	"trading_hours" text,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "futures_contracts_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "futures_signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" integer,
	"symbol" text NOT NULL,
	"signal_type" text NOT NULL,
	"entry_price" numeric(12, 4) NOT NULL,
	"stop_loss" numeric(12, 4),
	"target_price" numeric(12, 4),
	"risk_reward_ratio" numeric(5, 2),
	"confidence" numeric(5, 2),
	"reasoning" text,
	"indicators" jsonb,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gate_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"set_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"gates" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "gate_sets_set_id_unique" UNIQUE("set_id")
);
--> statement-breakpoint
CREATE TABLE "health_indicators" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"asset_type" text NOT NULL,
	"current_price" numeric(20, 8) NOT NULL,
	"high_water_mark" numeric(20, 8) NOT NULL,
	"drop_from_high" numeric(20, 8) NOT NULL,
	"drop_percent" numeric(10, 4) NOT NULL,
	"vq_multiple" numeric(10, 4) NOT NULL,
	"zone" text NOT NULL,
	"status" text NOT NULL,
	"recommendation" text NOT NULL,
	"description" text,
	"calculated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "launchpads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"avg_roi" varchar(20) NOT NULL,
	"projects" integer DEFAULT 0,
	"success_rate" integer NOT NULL,
	"tvl" varchar(50) NOT NULL,
	"network" varchar(100) NOT NULL,
	"requirements" text[],
	"description" text NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"time" varchar(20) NOT NULL,
	"duration" varchar(20) NOT NULL,
	"expert" varchar(255) NOT NULL,
	"topic" text NOT NULL,
	"attendees" integer DEFAULT 0,
	"recording" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_overview" (
	"id" serial PRIMARY KEY NOT NULL,
	"index_name" text NOT NULL,
	"current_value" numeric(10, 2) NOT NULL,
	"change_value" numeric(10, 2) NOT NULL,
	"change_percent" numeric(5, 2) NOT NULL,
	"volume" bigint,
	"high" numeric(10, 2),
	"low" numeric(10, 2),
	"market_status" text NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "multi_modal_fused_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"asset_type" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"price_data_id" integer,
	"sentiment_id" integer,
	"institutional_flow_id" integer,
	"current_price" numeric(20, 8) NOT NULL,
	"price_change_5m" numeric(10, 6),
	"price_change_15m" numeric(10, 6),
	"price_change_1h" numeric(10, 6),
	"volatility_score" numeric(5, 4),
	"momentum_score" numeric(5, 4),
	"trend_strength" numeric(5, 4),
	"combined_sentiment" numeric(5, 4),
	"institutional_pressure" numeric(5, 4),
	"overall_signal_score" numeric(5, 4),
	"signal_direction" text,
	"confidence_level" numeric(5, 4),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "multi_modal_institutional_flow" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"asset_type" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"dark_pool_volume" numeric(20, 2),
	"dark_pool_ratio" numeric(5, 4),
	"net_exchange_flow" numeric(20, 8),
	"exchange_inflow_volume" numeric(20, 8),
	"exchange_outflow_volume" numeric(20, 8),
	"large_transaction_count" integer,
	"whale_accumulation" numeric(20, 8),
	"institutional_buying" numeric(20, 2),
	"institutional_selling" numeric(20, 2),
	"net_institutional_flow" numeric(20, 2),
	"options_flow" numeric(20, 2),
	"call_put_ratio" numeric(5, 4),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "multi_modal_price_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"asset_type" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"open" numeric(20, 8) NOT NULL,
	"high" numeric(20, 8) NOT NULL,
	"low" numeric(20, 8) NOT NULL,
	"close" numeric(20, 8) NOT NULL,
	"volume" numeric(20, 2),
	"rsi_14" numeric(10, 4),
	"macd_line" numeric(20, 8),
	"macd_signal" numeric(20, 8),
	"macd_histogram" numeric(20, 8),
	"ema_9" numeric(20, 8),
	"ema_20" numeric(20, 8),
	"ema_50" numeric(20, 8),
	"sma_20" numeric(20, 8),
	"sma_50" numeric(20, 8),
	"atr_14" numeric(20, 8),
	"bollinger_upper" numeric(20, 8),
	"bollinger_middle" numeric(20, 8),
	"bollinger_lower" numeric(20, 8),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "multi_modal_sentiment" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"asset_type" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"sentiment_score" numeric(5, 4),
	"sentiment_velocity" numeric(5, 4),
	"news_count" integer,
	"positive_news_count" integer,
	"negative_news_count" integer,
	"neutral_news_count" integer,
	"social_volume" integer,
	"social_sentiment" numeric(5, 4),
	"fear_greed_index" integer,
	"source" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "oliver_velez_techniques" (
	"id" serial PRIMARY KEY NOT NULL,
	"technique_id" varchar(100) NOT NULL,
	"technique" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"difficulty" varchar(20) NOT NULL,
	"description" text NOT NULL,
	"time_frame" varchar(100) NOT NULL,
	"success_rate" varchar(20) NOT NULL,
	"detailed_steps" text,
	"risk_management" text,
	"examples" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "oliver_velez_techniques_technique_id_unique" UNIQUE("technique_id")
);
--> statement-breakpoint
CREATE TABLE "options_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"position_id" integer,
	"symbol" text NOT NULL,
	"alert_type" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"triggered_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "options_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"symbol" text NOT NULL,
	"company_name" text,
	"option_type" text NOT NULL,
	"current_price" numeric(10, 2) NOT NULL,
	"strike_price" numeric(10, 2) NOT NULL,
	"estimated_premium" numeric(10, 4),
	"implied_volatility" numeric(6, 2),
	"days_to_expiry" integer,
	"expiration_date" text,
	"annualized_return" numeric(8, 2),
	"max_profit" numeric(10, 2),
	"max_loss" numeric(10, 2),
	"breakeven" numeric(10, 2),
	"probability_of_profit" numeric(5, 2),
	"rsi" numeric(5, 2),
	"trend" text,
	"support" numeric(10, 2),
	"resistance" numeric(10, 2),
	"volume_ratio" numeric(6, 2),
	"composite_score" numeric(8, 4) NOT NULL,
	"income_score" numeric(8, 4),
	"safety_score" numeric(8, 4),
	"technical_score" numeric(8, 4),
	"reasoning" text,
	"is_top_pick" boolean DEFAULT false,
	"sector" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "options_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"option_type" text NOT NULL,
	"strike_price" numeric(10, 2) NOT NULL,
	"expiration_date" text NOT NULL,
	"contract_symbol" text,
	"entry_price" numeric(10, 4) NOT NULL,
	"entry_date" timestamp DEFAULT now(),
	"entry_delta" numeric(5, 4),
	"current_price" numeric(10, 4),
	"current_delta" numeric(5, 4),
	"stop_loss_price" numeric(10, 2),
	"profit_target" numeric(10, 4),
	"quantity" integer DEFAULT 1,
	"status" text DEFAULT 'open',
	"days_held" integer DEFAULT 0,
	"time_exit_date" timestamp,
	"current_pnl" numeric(10, 2),
	"current_pnl_percent" numeric(6, 2),
	"closed_at" timestamp,
	"close_price" numeric(10, 4),
	"close_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "options_scanner_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"scan_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_stocks_scanned" integer DEFAULT 0,
	"opportunities_found" integer DEFAULT 0,
	"top_pick_symbol" text,
	"scan_duration" integer,
	"scan_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "options_watchlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer,
	"symbol" text NOT NULL,
	"option_type" text NOT NULL,
	"strike_price" numeric(10, 2) NOT NULL,
	"expiration_date" text,
	"entry_price" numeric(10, 4),
	"notes" text,
	"status" text DEFAULT 'watching',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "passive_income_strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"platform" varchar(100) NOT NULL,
	"chain" varchar(50) NOT NULL,
	"risk_level" varchar(20) NOT NULL,
	"min_roi" numeric(5, 2) NOT NULL,
	"max_roi" numeric(5, 2) NOT NULL,
	"time_commitment" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"steps" text[],
	"tools_required" text[],
	"exit_plan" text,
	"risk_analysis" text,
	"resources" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "portfolio_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"asset_type" text NOT NULL,
	"side" text NOT NULL,
	"quantity" numeric(20, 8) NOT NULL,
	"entry_price" numeric(20, 8) NOT NULL,
	"current_price" numeric(20, 8),
	"strike_price" numeric(20, 8),
	"expiration_date" date,
	"option_type" text,
	"contract_size" integer DEFAULT 100,
	"stop_loss" numeric(20, 8),
	"take_profit" numeric(20, 8),
	"unrealized_pnl" numeric(20, 8),
	"unrealized_pnl_percent" numeric(10, 4),
	"ai_advice" text,
	"ai_reasoning" text,
	"ai_confidence" numeric(5, 2),
	"gates_passed" integer DEFAULT 0,
	"liquidity_sweep_detected" boolean DEFAULT false,
	"volatility_alert" boolean DEFAULT false,
	"last_sync_at" timestamp,
	"status" text DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"total_value" numeric(20, 8) NOT NULL,
	"daily_income" numeric(20, 8) NOT NULL,
	"avg_apr" numeric(5, 2) NOT NULL,
	"risk_level" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quant_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"asset_type" varchar(20) NOT NULL,
	"exchange" varchar(50),
	"sector" varchar(100),
	"is_active" boolean DEFAULT true,
	"last_price" numeric(20, 8),
	"last_updated" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "quant_assets_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "quant_indicators" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"calculated_at" timestamp DEFAULT now(),
	"timeframe" varchar(20) NOT NULL,
	"open" numeric(20, 8),
	"high" numeric(20, 8),
	"low" numeric(20, 8),
	"close" numeric(20, 8),
	"volume" numeric(20, 2),
	"rsi_14" numeric(8, 4),
	"macd_line" numeric(20, 8),
	"macd_signal" numeric(20, 8),
	"macd_histogram" numeric(20, 8),
	"stoch_k" numeric(8, 4),
	"stoch_d" numeric(8, 4),
	"ema_9" numeric(20, 8),
	"ema_20" numeric(20, 8),
	"ema_50" numeric(20, 8),
	"ema_200" numeric(20, 8),
	"sma_20" numeric(20, 8),
	"sma_50" numeric(20, 8),
	"atr_14" numeric(20, 8),
	"bollinger_upper" numeric(20, 8),
	"bollinger_middle" numeric(20, 8),
	"bollinger_lower" numeric(20, 8),
	"bollinger_width" numeric(10, 6),
	"volatility_percent" numeric(10, 4),
	"obv" numeric(20, 2),
	"vpt" numeric(20, 2),
	"volume_sma_20" numeric(20, 2),
	"volume_ratio" numeric(10, 4),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quant_predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"generated_at" timestamp DEFAULT now(),
	"prediction_type" varchar(50) NOT NULL,
	"horizon_minutes" integer NOT NULL,
	"current_price" numeric(20, 8),
	"predicted_price" numeric(20, 8),
	"predicted_change" numeric(10, 4),
	"lower_bound" numeric(20, 8),
	"upper_bound" numeric(20, 8),
	"predicted_direction" varchar(20),
	"direction_confidence" numeric(5, 2),
	"technical_factors" jsonb,
	"sentiment_factors" jsonb,
	"model_type" varchar(50),
	"confidence" numeric(5, 2),
	"ai_analysis" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quant_sentiment" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer,
	"calculated_at" timestamp DEFAULT now(),
	"fear_greed_index" integer,
	"fear_greed_label" varchar(50),
	"news_sentiment" numeric(5, 4),
	"social_sentiment" numeric(5, 4),
	"overall_sentiment" numeric(5, 4),
	"topic_scores" jsonb,
	"news_count" integer,
	"social_mentions" integer,
	"sentiment_sources" jsonb,
	"ai_analysis" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quant_signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"generated_at" timestamp DEFAULT now(),
	"signal_type" varchar(20) NOT NULL,
	"direction" varchar(20) NOT NULL,
	"strength" numeric(5, 2) NOT NULL,
	"confidence" numeric(5, 2) NOT NULL,
	"entry_price" numeric(20, 8),
	"target_price" numeric(20, 8),
	"stop_loss" numeric(20, 8),
	"risk_reward_ratio" numeric(6, 2),
	"technical_score" numeric(5, 2),
	"momentum_score" numeric(5, 2),
	"trend_score" numeric(5, 2),
	"volume_score" numeric(5, 2),
	"sentiment_score" numeric(5, 2),
	"timeframe" varchar(20) NOT NULL,
	"valid_until" timestamp,
	"reasoning" text,
	"key_factors" jsonb,
	"status" varchar(20) DEFAULT 'active',
	"triggered_at" timestamp,
	"outcome" varchar(20),
	"actual_return" numeric(10, 4),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rule_execution_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"rule_id" integer,
	"log_type" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"conditions_checked" jsonb,
	"market_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scanner_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"candidate_id" integer,
	"symbol" text NOT NULL,
	"alert_type" text NOT NULL,
	"entry_price" numeric(10, 2) NOT NULL,
	"stop_loss" numeric(10, 2) NOT NULL,
	"target_price" numeric(10, 2) NOT NULL,
	"risk_reward_ratio" numeric(5, 2) NOT NULL,
	"composite_score" numeric(10, 4) NOT NULL,
	"alert_message" text,
	"is_sent" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scanner_candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"symbol" text NOT NULL,
	"name" text,
	"current_price" numeric(10, 2) NOT NULL,
	"entry_price" numeric(10, 2) NOT NULL,
	"stop_loss" numeric(10, 2) NOT NULL,
	"target_price" numeric(10, 2) NOT NULL,
	"risk_amount" numeric(10, 4) NOT NULL,
	"reward_amount" numeric(10, 4) NOT NULL,
	"risk_reward_ratio" numeric(5, 2) NOT NULL,
	"composite_score" numeric(10, 4) NOT NULL,
	"trend_score" numeric(5, 2),
	"momentum_score" numeric(5, 2),
	"volume_score" numeric(5, 2),
	"volatility_score" numeric(5, 2),
	"rsi" numeric(5, 2),
	"atr" numeric(10, 4),
	"volume" bigint,
	"avg_volume" bigint,
	"pattern" text,
	"sector" text,
	"reasoning" text,
	"is_top_alert" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scanner_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"scan_date" timestamp DEFAULT now(),
	"status" text NOT NULL,
	"total_stocks_scanned" integer DEFAULT 0,
	"qualified_count" integer DEFAULT 0,
	"top_alert_symbol" text,
	"scan_duration_ms" integer,
	"batches_processed" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seven_gate_daily_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"user_id" integer,
	"starting_capital" numeric(20, 2),
	"ending_capital" numeric(20, 2),
	"daily_pnl" numeric(20, 2),
	"daily_pnl_percent" numeric(10, 4),
	"total_trades" integer DEFAULT 0,
	"winning_trades" integer DEFAULT 0,
	"losing_trades" integer DEFAULT 0,
	"win_rate" numeric(5, 2),
	"max_drawdown_percent" numeric(10, 4),
	"high_water_mark" numeric(20, 2),
	"peak_exposure" numeric(20, 2),
	"avg_position_size" numeric(20, 2),
	"london_pnl" numeric(20, 2),
	"ny_pnl" numeric(20, 2),
	"asia_pnl" numeric(20, 2),
	"daily_loss_limit_hit" boolean DEFAULT false,
	"max_positions_limit_hit" boolean DEFAULT false,
	"correlation_limit_hit" boolean DEFAULT false,
	"trading_halt_triggered" boolean DEFAULT false,
	"halt_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seven_gate_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"gate_number" integer NOT NULL,
	"gate_name" text NOT NULL,
	"score_threshold" integer,
	"total_signals" integer DEFAULT 0,
	"win_count" integer DEFAULT 0,
	"loss_count" integer DEFAULT 0,
	"break_even_count" integer DEFAULT 0,
	"avg_pnl_percent" numeric(10, 4),
	"win_rate" numeric(5, 2),
	"avg_win_percent" numeric(10, 4),
	"avg_loss_percent" numeric(10, 4),
	"profit_factor" numeric(10, 4),
	"expected_value" numeric(10, 4),
	"importance_score" numeric(10, 4),
	"performance_by_session" jsonb,
	"performance_by_regime" jsonb,
	"last_calculated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seven_gate_risk_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"max_daily_loss_percent" numeric(5, 2) DEFAULT '3' NOT NULL,
	"max_open_positions" integer DEFAULT 5 NOT NULL,
	"max_correlated_exposure_percent" numeric(5, 2) DEFAULT '50' NOT NULL,
	"max_position_size_percent" numeric(5, 2) DEFAULT '2' NOT NULL,
	"max_drawdown_percent" numeric(5, 2) DEFAULT '10' NOT NULL,
	"max_trades_per_session" integer DEFAULT 10,
	"min_time_between_trades_minutes" integer DEFAULT 5,
	"min_gate_score" integer DEFAULT 70 NOT NULL,
	"min_gates_passed" integer DEFAULT 5 NOT NULL,
	"initial_capital" numeric(20, 2),
	"current_capital" numeric(20, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seven_gate_signal_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"symbol" text NOT NULL,
	"direction" text NOT NULL,
	"entry_price" numeric(20, 8),
	"exit_price" numeric(20, 8),
	"stop_loss" numeric(20, 8),
	"take_profit" numeric(20, 8),
	"quantity" numeric(20, 8),
	"gate_scores" jsonb,
	"total_score" integer NOT NULL,
	"gates_passed" integer NOT NULL,
	"outcome" text,
	"pnl_amount" numeric(20, 8),
	"pnl_percent" numeric(10, 4),
	"holding_period_minutes" integer,
	"market_regime" text,
	"atr" numeric(20, 8),
	"atr_percent" numeric(10, 4),
	"volume_ratio" numeric(10, 4),
	"sweep_type" text,
	"sweep_level" text,
	"penetration_percent" numeric(10, 4),
	"opened_at" timestamp,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"company_name" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"price_change" numeric(5, 2) NOT NULL,
	"percent_change" numeric(5, 2) NOT NULL,
	"volume" bigint NOT NULL,
	"market_cap" numeric(20, 2),
	"sector" text,
	"alert_type" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_news" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"summary" text NOT NULL,
	"source" text NOT NULL,
	"url" text,
	"published_at" timestamp NOT NULL,
	"impact_level" text NOT NULL,
	"affected_symbols" text[],
	"category" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_state_indicators" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"asset_type" text NOT NULL,
	"current_price" numeric(20, 8) NOT NULL,
	"vq_value" numeric(20, 8),
	"vq_percent" numeric(10, 4),
	"volatility_level" text,
	"health_zone" text,
	"health_status" text,
	"recommendation" text,
	"signal_action" text,
	"signal_confidence" numeric(5, 2),
	"entry_price" numeric(20, 8),
	"stop_loss" numeric(20, 8),
	"take_profit" numeric(20, 8),
	"reasoning" text,
	"calculated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_trading_signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"signal_type" text NOT NULL,
	"entry_price" numeric(10, 2) NOT NULL,
	"target_price" numeric(10, 2),
	"stop_loss" numeric(10, 2),
	"confidence" integer NOT NULL,
	"timeframe" text NOT NULL,
	"reasoning" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"protocol_id" integer,
	"name" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"current_apr" numeric(5, 2) NOT NULL,
	"daily_earnings" numeric(20, 8) NOT NULL,
	"monthly_earnings" numeric(20, 8) NOT NULL,
	"status" text NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "strategies_catalog" (
	"id" integer PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(100),
	"risk" varchar(50),
	"roi_range" varchar(100),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"summary" text,
	"track_id" varchar(100),
	"first_module_slug" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "strategies_catalog_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "strategy_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategy_id" text NOT NULL,
	"module_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"video_url" text,
	"estimated_time_minutes" integer,
	"is_required" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "timeseries_accuracy" (
	"id" serial PRIMARY KEY NOT NULL,
	"prediction_id" integer NOT NULL,
	"evaluated_at" timestamp DEFAULT now(),
	"actual_value" numeric(20, 8) NOT NULL,
	"predicted_value" numeric(20, 8) NOT NULL,
	"error_percent" numeric(10, 4),
	"within_confidence_interval" boolean,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeseries_industry_enum" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "timeseries_industry_enum_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "timeseries_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer,
	"job_type" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"parameters" jsonb,
	"result" jsonb,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeseries_observations" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"observed_at" timestamp NOT NULL,
	"value" numeric(20, 8) NOT NULL,
	"open" numeric(20, 8),
	"high" numeric(20, 8),
	"low" numeric(20, 8),
	"close" numeric(20, 8),
	"volume" numeric(20, 2),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeseries_predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"model_type" varchar(50) NOT NULL,
	"prediction_date" timestamp DEFAULT now(),
	"horizon_days" integer NOT NULL,
	"predictions" jsonb NOT NULL,
	"confidence" numeric(5, 2),
	"mape" numeric(10, 4),
	"rmse" numeric(20, 8),
	"trend" varchar(20),
	"summary" text,
	"methodology" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeseries_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"industry" varchar(50) NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"symbol" varchar(50),
	"data_provider" varchar(100),
	"update_frequency" varchar(50),
	"metadata" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "timeseries_sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "trade_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"connection_id" integer,
	"platform" text NOT NULL,
	"symbol" text NOT NULL,
	"side" text NOT NULL,
	"order_type" text NOT NULL,
	"quantity" numeric(20, 8) NOT NULL,
	"price" numeric(20, 8),
	"stop_price" numeric(20, 8),
	"take_profit_price" numeric(20, 8),
	"status" text DEFAULT 'pending',
	"external_order_id" text,
	"filled_quantity" numeric(20, 8),
	"filled_price" numeric(20, 8),
	"commission" numeric(20, 8),
	"signal_source" text,
	"signal_strength" numeric(5, 2),
	"error_message" text,
	"submitted_at" timestamp,
	"filled_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trading_academy" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"strategy_id" text NOT NULL,
	"enrollment_date" timestamp DEFAULT now(),
	"completion_date" timestamp,
	"progress_percentage" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false,
	"certificate_issued" boolean DEFAULT false,
	"last_accessed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trading_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"connection_uuid" text NOT NULL,
	"platform" text NOT NULL,
	"nickname" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_paper_trading" boolean DEFAULT true,
	"last_connected_at" timestamp,
	"connection_status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "trading_connections_connection_uuid_unique" UNIQUE("connection_uuid")
);
--> statement-breakpoint
CREATE TABLE "trading_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"system_id" integer,
	"user_id" integer,
	"period" text NOT NULL,
	"total_trades" integer NOT NULL,
	"winning_trades" integer NOT NULL,
	"losing_trades" integer NOT NULL,
	"win_rate" numeric(5, 2) NOT NULL,
	"total_return" numeric(20, 8) NOT NULL,
	"total_return_percentage" numeric(5, 2) NOT NULL,
	"max_drawdown" numeric(5, 2),
	"sharpe_ratio" numeric(5, 3),
	"avg_trade_return" numeric(20, 8),
	"best_trade" numeric(20, 8),
	"worst_trade" numeric(20, 8),
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trading_plan_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"position_id" integer,
	"alert_type" text NOT NULL,
	"severity" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"triggered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trading_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"system_id" integer,
	"user_id" integer,
	"signal_id" integer,
	"symbol" text NOT NULL,
	"side" text NOT NULL,
	"entry_price" numeric(20, 8) NOT NULL,
	"exit_price" numeric(20, 8),
	"quantity" numeric(20, 8) NOT NULL,
	"current_value" numeric(20, 8) NOT NULL,
	"unrealized_pnl" numeric(20, 8),
	"realized_pnl" numeric(20, 8),
	"status" text NOT NULL,
	"stop_loss" numeric(20, 8),
	"take_profit" numeric(20, 8),
	"protocol" text,
	"opened_at" timestamp DEFAULT now(),
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "trading_signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"system_id" integer,
	"user_id" integer,
	"symbol" text NOT NULL,
	"action" text NOT NULL,
	"signal_type" text NOT NULL,
	"confidence" numeric(5, 2) NOT NULL,
	"target_price" numeric(20, 8),
	"current_price" numeric(20, 8) NOT NULL,
	"volume" numeric(20, 8),
	"reasoning" text,
	"is_executed" boolean DEFAULT false,
	"executed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trading_systems" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"execution_time" text NOT NULL,
	"risk_level" text NOT NULL,
	"capital_allocation" numeric(5, 2) NOT NULL,
	"min_position_size" numeric(20, 8) NOT NULL,
	"max_position_size" numeric(20, 8) NOT NULL,
	"stop_loss_percentage" numeric(5, 2),
	"take_profit_percentage" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"track_id" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"order" integer NOT NULL,
	"of" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"duration" varchar(50),
	"overview" text,
	"prerequisites" jsonb DEFAULT '[]'::jsonb,
	"steps" jsonb DEFAULT '[]'::jsonb,
	"notes_prompt" text,
	"resources" jsonb DEFAULT '{}'::jsonb,
	"additional_resources" jsonb DEFAULT '[]'::jsonb,
	"previous" jsonb,
	"next" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategy_id" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"difficulty" varchar(20) NOT NULL,
	"duration" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"key_points" text[],
	"success_rate" varchar(20),
	"is_unlocked" boolean DEFAULT true,
	"is_completed" boolean DEFAULT false,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "training_strategies_strategy_id_unique" UNIQUE("strategy_id")
);
--> statement-breakpoint
CREATE TABLE "training_tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"track_id" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "training_tracks_track_id_unique" UNIQUE("track_id")
);
--> statement-breakpoint
CREATE TABLE "user_course_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"course_id" integer,
	"progress" integer DEFAULT 0,
	"completed" boolean DEFAULT false,
	"enrolled_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_investments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"pool_id" integer,
	"amount" numeric(20, 8) NOT NULL,
	"invested_at" timestamp DEFAULT now(),
	"status" varchar(20) DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"user_id" integer,
	"skill_level" varchar(20) DEFAULT 'beginner' NOT NULL,
	"experienced_unlocked_at" timestamp,
	"modules_completed_for_unlock" integer DEFAULT 0,
	"hours_spent_for_unlock" numeric(10, 2) DEFAULT '0',
	"strategies_completed_for_unlock" integer DEFAULT 0,
	"has_seen_onboarding" boolean DEFAULT false,
	"dismissed_advanced_warnings" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_preferences_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"module_id" integer,
	"completed_at" timestamp,
	"time_spent_minutes" integer,
	"quiz_score" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "user_risk_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"experience_level" varchar(50) NOT NULL,
	"risk_tolerance" varchar(50) NOT NULL,
	"investment_horizon" varchar(50) NOT NULL,
	"capital_amount" varchar(50) NOT NULL,
	"time_commitment" varchar(50) NOT NULL,
	"primary_goal" varchar(100) NOT NULL,
	"preferred_markets" text[],
	"max_drawdown_tolerance" integer,
	"monthly_return_target" integer,
	"risk_score" integer,
	"ai_recommendations" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_risk_profiles_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"wallet_address" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vq_calculations" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"asset_type" text NOT NULL,
	"current_price" numeric(20, 8) NOT NULL,
	"vq_value" numeric(20, 8) NOT NULL,
	"vq_percent" numeric(10, 4) NOT NULL,
	"atr" numeric(20, 8) NOT NULL,
	"atr_percent" numeric(10, 4) NOT NULL,
	"volatility_level" text NOT NULL,
	"stop_loss_price" numeric(20, 8) NOT NULL,
	"trailing_stop_percent" numeric(10, 4) NOT NULL,
	"calculated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "yield_pools" (
	"id" serial PRIMARY KEY NOT NULL,
	"protocol" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"apy" numeric(8, 2) NOT NULL,
	"tvl" bigint NOT NULL,
	"risk_level" varchar(10) NOT NULL,
	"chain" varchar(50) NOT NULL,
	"tokens" text[],
	"category" varchar(100) NOT NULL,
	"lock_period" varchar(50) NOT NULL,
	"verified" boolean DEFAULT false,
	"safety_score" integer NOT NULL,
	"description" text NOT NULL,
	"features" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_backtests" ADD CONSTRAINT "ai_backtests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_trader_portfolios" ADD CONSTRAINT "ai_trader_portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_trader_positions" ADD CONSTRAINT "ai_trader_positions_portfolio_id_ai_trader_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."ai_trader_portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_trader_watchlist" ADD CONSTRAINT "ai_trader_watchlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_watchlist_items" ADD CONSTRAINT "ai_watchlist_items_watchlist_id_ai_watchlists_id_fk" FOREIGN KEY ("watchlist_id") REFERENCES "public"."ai_watchlists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_watchlists" ADD CONSTRAINT "ai_watchlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_notifications" ADD CONSTRAINT "alert_notifications_alert_id_custom_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."custom_alerts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_notifications" ADD CONSTRAINT "alert_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automated_trade_executions" ADD CONSTRAINT "automated_trade_executions_rule_id_automated_trading_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."automated_trading_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automated_trade_executions" ADD CONSTRAINT "automated_trade_executions_connection_id_trading_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."trading_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automated_trade_executions" ADD CONSTRAINT "automated_trade_executions_order_id_trade_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."trade_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automated_trading_rules" ADD CONSTRAINT "automated_trading_rules_connection_id_trading_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."trading_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_alerts" ADD CONSTRAINT "custom_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enhanced_training_modules" ADD CONSTRAINT "enhanced_training_modules_strategy_id_enhanced_training_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."enhanced_training_strategies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enhanced_user_progress" ADD CONSTRAINT "enhanced_user_progress_module_id_enhanced_training_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."enhanced_training_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exit_strategies" ADD CONSTRAINT "exit_strategies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exit_strategies" ADD CONSTRAINT "exit_strategies_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "futures_signals" ADD CONSTRAINT "futures_signals_contract_id_futures_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."futures_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "multi_modal_fused_features" ADD CONSTRAINT "multi_modal_fused_features_price_data_id_multi_modal_price_data_id_fk" FOREIGN KEY ("price_data_id") REFERENCES "public"."multi_modal_price_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "multi_modal_fused_features" ADD CONSTRAINT "multi_modal_fused_features_sentiment_id_multi_modal_sentiment_id_fk" FOREIGN KEY ("sentiment_id") REFERENCES "public"."multi_modal_sentiment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "multi_modal_fused_features" ADD CONSTRAINT "multi_modal_fused_features_institutional_flow_id_multi_modal_institutional_flow_id_fk" FOREIGN KEY ("institutional_flow_id") REFERENCES "public"."multi_modal_institutional_flow"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "options_alerts" ADD CONSTRAINT "options_alerts_position_id_options_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."options_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "options_opportunities" ADD CONSTRAINT "options_opportunities_job_id_options_scanner_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."options_scanner_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "options_watchlist" ADD CONSTRAINT "options_watchlist_opportunity_id_options_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."options_opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quant_indicators" ADD CONSTRAINT "quant_indicators_asset_id_quant_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."quant_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quant_predictions" ADD CONSTRAINT "quant_predictions_asset_id_quant_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."quant_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quant_sentiment" ADD CONSTRAINT "quant_sentiment_asset_id_quant_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."quant_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quant_signals" ADD CONSTRAINT "quant_signals_asset_id_quant_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."quant_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rule_execution_logs" ADD CONSTRAINT "rule_execution_logs_rule_id_automated_trading_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."automated_trading_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scanner_alerts" ADD CONSTRAINT "scanner_alerts_job_id_scanner_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."scanner_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scanner_alerts" ADD CONSTRAINT "scanner_alerts_candidate_id_scanner_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."scanner_candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scanner_candidates" ADD CONSTRAINT "scanner_candidates_job_id_scanner_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."scanner_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seven_gate_daily_metrics" ADD CONSTRAINT "seven_gate_daily_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seven_gate_risk_limits" ADD CONSTRAINT "seven_gate_risk_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_protocol_id_defi_protocols_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "public"."defi_protocols"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeseries_accuracy" ADD CONSTRAINT "timeseries_accuracy_prediction_id_timeseries_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."timeseries_predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeseries_jobs" ADD CONSTRAINT "timeseries_jobs_source_id_timeseries_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."timeseries_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeseries_observations" ADD CONSTRAINT "timeseries_observations_source_id_timeseries_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."timeseries_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeseries_predictions" ADD CONSTRAINT "timeseries_predictions_source_id_timeseries_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."timeseries_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_orders" ADD CONSTRAINT "trade_orders_connection_id_trading_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."trading_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_academy" ADD CONSTRAINT "trading_academy_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_performance" ADD CONSTRAINT "trading_performance_system_id_trading_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."trading_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_performance" ADD CONSTRAINT "trading_performance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_plan_alerts" ADD CONSTRAINT "trading_plan_alerts_position_id_portfolio_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."portfolio_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_positions" ADD CONSTRAINT "trading_positions_system_id_trading_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."trading_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_positions" ADD CONSTRAINT "trading_positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_positions" ADD CONSTRAINT "trading_positions_signal_id_trading_signals_id_fk" FOREIGN KEY ("signal_id") REFERENCES "public"."trading_signals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_signals" ADD CONSTRAINT "trading_signals_system_id_trading_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."trading_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_signals" ADD CONSTRAINT "trading_signals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_systems" ADD CONSTRAINT "trading_systems_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_enrollments" ADD CONSTRAINT "user_course_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_enrollments" ADD CONSTRAINT "user_course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_investments" ADD CONSTRAINT "user_investments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_investments" ADD CONSTRAINT "user_investments_pool_id_yield_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."yield_pools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_module_id_strategy_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."strategy_modules"("id") ON DELETE no action ON UPDATE no action;