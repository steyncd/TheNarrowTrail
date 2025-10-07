-- Migration 003: Add attendance_status and payment columns to hike_interest table
-- Description: Adds attendance tracking and payment fields to hike_interest for better interest management
-- Date: 2025-10-07
-- This migration is idempotent and can be run multiple times safely

-- Add attendance_status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'hike_interest' AND column_name = 'attendance_status'
    ) THEN
        ALTER TABLE hike_interest
        ADD COLUMN attendance_status VARCHAR(20) DEFAULT 'interested'
        CHECK (attendance_status IN ('interested', 'confirmed', 'cancelled', 'attended'));

        RAISE NOTICE 'Added attendance_status column to hike_interest table';
    ELSE
        RAISE NOTICE 'attendance_status column already exists in hike_interest table';
    END IF;
END $$;

-- Add payment_status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'hike_interest' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE hike_interest
        ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'partial', 'paid'));

        RAISE NOTICE 'Added payment_status column to hike_interest table';
    ELSE
        RAISE NOTICE 'payment_status column already exists in hike_interest table';
    END IF;
END $$;

-- Add amount_paid column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'hike_interest' AND column_name = 'amount_paid'
    ) THEN
        ALTER TABLE hike_interest
        ADD COLUMN amount_paid DECIMAL(10, 2) DEFAULT 0;

        RAISE NOTICE 'Added amount_paid column to hike_interest table';
    ELSE
        RAISE NOTICE 'amount_paid column already exists in hike_interest table';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'hike_interest' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE hike_interest
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

        RAISE NOTICE 'Added updated_at column to hike_interest table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in hike_interest table';
    END IF;
END $$;

-- Create index on attendance_status for performance
CREATE INDEX IF NOT EXISTS idx_hike_interest_attendance_status
ON hike_interest(attendance_status);

-- Create index on payment_status for performance
CREATE INDEX IF NOT EXISTS idx_hike_interest_payment_status
ON hike_interest(payment_status);
