START TRANSACTION;

create index measurements_idx_input on measurements(input);
create index measurements_idx_probe_cc on measurements(probe_cc);
create index measurements_idx_anomaly on measurements(anomaly);
create index measurements_idx_confirmed on measurements(confirmed);

create index sites_idx_category_code on sites(category_code);

COMMIT;