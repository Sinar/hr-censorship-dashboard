START TRANSACTION;

CREATE TABLE summary_measurements (
    year                INTEGER NOT NULL,
    input               VARCHAR(300) NOT NULL,
    probe_cc            VARCHAR(5) NOT NULL,
    probe_asn           VARCHAR(255) NOT NULL,
    anomaly_count       INTEGER NOT NULL,
    confirmed_count     INTEGER NOT NULL,
    failure_count       INTEGER NOT NULL,
    measurement_count   INTEGER NOT NULL,
    PRIMARY KEY(year, input, probe_asn, probe_cc)
)
ENGINE = InnoDB;

CREATE INDEX summary_measurements_idx_year_country ON summary_measurements(year, probe_cc);
CREATE INDEX summary_measurements_idx_asn ON summary_measurements(probe_asn);

INSERT
INTO        summary_measurements (year, input, probe_cc, probe_asn, anomaly_count, confirmed_count, failure_count, measurement_count)
SELECT      YEAR(m.measurement_start_time) AS year,
            m.input,
            m.probe_cc,
            REPLACE(m.probe_asn, 'AS', '') AS probe_asn,
            COUNT(NULLIF(m.anomaly, 0)) AS anomaly_count,
            COUNT(NULLIF(m.confirmed, 0)) AS confirmed_count,
            COUNT(NULLIF(m.failure, 0)) AS failure_count,
            COUNT(m.input) AS measurement_count
FROM        measurements m
WHERE       YEAR(measurement_start_time) < 2020
GROUP BY    YEAR(m.measurement_start_time), m.probe_cc, REPLACE(m.probe_asn, 'AS', ''), s.url;


TRUNCATE    isp;

INSERT
INTO        isp(country_code, isp, asn)
SELECT      DISTINCT m.probe_cc,
            COALESCE(a.autonomous_system_organization, 'unknown'),
            REPLACE(m.probe_asn, 'AS', '')
FROM        summary_measurements m
LEFT JOIN   asn a
ON          REPLACE(a.autonomous_system_number, 'AS', '') = REPLACE(m.probe_asn, 'AS', '');

COMMIT;