START TRANSACTION;

CREATE INDEX measurements_idx_measurement_start_time
ON measurements(measurement_start_time);

COMMIT;