-- Drop the existing function first
DROP FUNCTION IF EXISTS get_available_slots_for_date(INTEGER, DATE);

-- Recreate the function with correct return type
CREATE OR REPLACE FUNCTION get_available_slots_for_date(
    trainer_id_param INTEGER,
    target_date DATE
)
RETURNS TABLE (
    id INTEGER,
    date DATE,
    start_time TIME,
    end_time TIME,
    slot_duration INTEGER,
    batch_name TEXT,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tms.id,
        tms.date,
        tms.start_time,
        tms.end_time,
        tms.slot_duration,
        sgb.batch_name,
        CASE 
            WHEN sa.id IS NULL THEN true 
            ELSE false 
        END as is_available
    FROM trainer_master_slots tms
    JOIN slot_generation_batches sgb ON tms.batch_id = sgb.id
    LEFT JOIN slot_assignments sa ON tms.id = sa.slot_id AND sa.status = 'active'
    WHERE tms.trainer_id = trainer_id_param
      AND tms.date = target_date
      AND tms.is_active = true
    ORDER BY tms.start_time;
END;
$$ LANGUAGE plpgsql;
